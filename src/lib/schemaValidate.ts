export interface ValidationError {
    path: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
type Schema = Record<string, unknown> & {
    $ref?: string;
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
function jsonType(v: unknown): string {
    if (v === null)
        return "null";
    if (Array.isArray(v))
        return "array";
    if (Number.isInteger(v as number))
        return "integer";
    return typeof v;
}
function typeMatches(value: unknown, expected: string | string[]): boolean {
    const t = jsonType(value);
    const list = Array.isArray(expected) ? expected : [expected];
    for (const e of list) {
        if (e === "number" && (t === "number" || t === "integer"))
            return true;
        if (e === t)
            return true;
    }
    return false;
}
function resolveRef(root: Schema, ref: string): Schema | null {
    if (!ref.startsWith("#/"))
        return null;
    const parts = ref.slice(2).split("/");
    let cur: unknown = root;
    for (const p of parts) {
        if (!isPlainObject(cur))
            return null;
        cur = cur[p];
    }
    return isPlainObject(cur) ? (cur as Schema) : null;
}
function tryValidUri(s: string): boolean {
    try {
        new URL(s);
        return true;
    }
    catch {
        return /^[^\s]+$/.test(s);
    }
}
function tryValidDate(s: string): boolean {
    if (!DATE_RE.test(s))
        return false;
    const d = new Date(s);
    return !Number.isNaN(d.getTime());
}
function validateNode(value: unknown, schema: Schema, root: Schema, path: string, errors: ValidationError[]): void {
    if (!schema || typeof schema !== "object")
        return;
    if (typeof schema.$ref === "string") {
        const target = resolveRef(root, schema.$ref);
        if (target)
            validateNode(value, target, root, path, errors);
        return;
    }
    if (schema.type !== undefined) {
        if (!typeMatches(value, schema.type as string | string[])) {
            errors.push({
                path,
                message: `expected type ${JSON.stringify(schema.type)}, got ${jsonType(value)}`,
            });
            return;
        }
    }
    if ("const" in schema) {
        if (JSON.stringify(value) !== JSON.stringify((schema as Record<string, unknown>).const)) {
            errors.push({
                path,
                message: `expected const ${JSON.stringify((schema as Record<string, unknown>).const)}, got ${JSON.stringify(value)}`,
            });
        }
    }
    if (Array.isArray((schema as Record<string, unknown>).enum)) {
        const allowed = (schema as {
            enum: unknown[];
        }).enum;
        if (!allowed.some((a) => JSON.stringify(a) === JSON.stringify(value))) {
            errors.push({
                path,
                message: `value not in enum (allowed: ${allowed.map((x) => JSON.stringify(x)).join(", ")})`,
            });
        }
    }
    if (typeof value === "string") {
        if (typeof schema.minLength === "number" && value.length < schema.minLength) {
            errors.push({ path, message: `string shorter than minLength ${schema.minLength}` });
        }
        if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
            errors.push({ path, message: `string longer than maxLength ${schema.maxLength}` });
        }
        if (typeof schema.pattern === "string") {
            if (!new RegExp(schema.pattern).test(value)) {
                errors.push({ path, message: `string does not match pattern /${schema.pattern}/` });
            }
        }
        if (typeof schema.format === "string") {
            if (schema.format === "date" && !tryValidDate(value)) {
                errors.push({ path, message: `not a valid date (YYYY-MM-DD)` });
            }
            else if (schema.format === "uri" && !tryValidUri(value)) {
                errors.push({ path, message: `not a valid URI` });
            }
        }
    }
    if (typeof value === "number") {
        if (typeof schema.minimum === "number" && value < schema.minimum) {
            errors.push({ path, message: `number < minimum ${schema.minimum}` });
        }
        if (typeof schema.maximum === "number" && value > schema.maximum) {
            errors.push({ path, message: `number > maximum ${schema.maximum}` });
        }
        if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) {
            errors.push({ path, message: `number <= exclusiveMinimum ${schema.exclusiveMinimum}` });
        }
    }
    if (Array.isArray(value) && schema.items) {
        const itemsSchema = schema.items as Schema;
        value.forEach((v, i) => validateNode(v, itemsSchema, root, `${path}[${i}]`, errors));
    }
    if (isPlainObject(value)) {
        const props = (schema.properties as Record<string, Schema>) || {};
        const required = (schema.required as string[]) || [];
        for (const r of required) {
            if (!(r in value)) {
                errors.push({ path, message: `missing required property "${r}"` });
            }
        }
        const additional = schema.additionalProperties;
        for (const key of Object.keys(value)) {
            const subSchema = props[key];
            if (subSchema) {
                validateNode((value as Record<string, unknown>)[key], subSchema, root, path ? `${path}.${key}` : key, errors);
            }
            else if (additional === false) {
                errors.push({ path, message: `additional property "${key}" not allowed` });
            }
            else if (isPlainObject(additional)) {
                validateNode((value as Record<string, unknown>)[key], additional as Schema, root, path ? `${path}.${key}` : key, errors);
            }
        }
    }
    if (Array.isArray((schema as Record<string, unknown>).allOf)) {
        for (const sub of (schema as {
            allOf: Schema[];
        }).allOf) {
            validateNode(value, sub, root, path, errors);
        }
    }
    if (Array.isArray((schema as Record<string, unknown>).anyOf)) {
        const subs = (schema as {
            anyOf: Schema[];
        }).anyOf;
        let anyValid = false;
        const sub_errors: ValidationError[][] = [];
        for (const sub of subs) {
            const local: ValidationError[] = [];
            validateNode(value, sub, root, path, local);
            sub_errors.push(local);
            if (local.length === 0) {
                anyValid = true;
                break;
            }
        }
        if (!anyValid) {
            errors.push({
                path,
                message: `none of anyOf branches matched (${sub_errors.length} branches tried)`,
            });
        }
    }
    if (Array.isArray((schema as Record<string, unknown>).oneOf)) {
        const subs = (schema as {
            oneOf: Schema[];
        }).oneOf;
        let validCount = 0;
        for (const sub of subs) {
            const local: ValidationError[] = [];
            validateNode(value, sub, root, path, local);
            if (local.length === 0)
                validCount++;
        }
        if (validCount !== 1) {
            errors.push({ path, message: `oneOf matched ${validCount} branches (expected exactly 1)` });
        }
    }
    if (isPlainObject((schema as Record<string, unknown>).not)) {
        const local: ValidationError[] = [];
        validateNode(value, (schema as {
            not: Schema;
        }).not, root, path, local);
        if (local.length === 0) {
            errors.push({ path, message: `value matches "not" schema (must not match)` });
        }
    }
    if (isPlainObject((schema as Record<string, unknown>).if)) {
        const cond = (schema as {
            if: Schema;
            then?: Schema;
            else?: Schema;
        }).if;
        const condErrors: ValidationError[] = [];
        validateNode(value, cond, root, path, condErrors);
        if (condErrors.length === 0 && (schema as {
            then?: Schema;
        }).then) {
            validateNode(value, (schema as {
                then: Schema;
            }).then, root, path, errors);
        }
        else if (condErrors.length > 0 && (schema as {
            else?: Schema;
        }).else) {
            validateNode(value, (schema as {
                else: Schema;
            }).else, root, path, errors);
        }
    }
}
export function validateDataset(data: unknown, schema: unknown): ValidationResult {
    if (!isPlainObject(schema)) {
        return {
            valid: false,
            errors: [{ path: "(schema)", message: "schema is not an object" }],
        };
    }
    const errors: ValidationError[] = [];
    validateNode(data, schema as Schema, schema as Schema, "", errors);
    return { valid: errors.length === 0, errors };
}
