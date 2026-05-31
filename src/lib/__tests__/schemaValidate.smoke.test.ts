import { describe, it, expect } from "bun:test";
import { validateDataset } from "@/lib/schemaValidate";
import dataset from "@/data/pc200_payroll_dataset_2026.json";
import schema from "@/data/pc200_payroll_dataset.schema.json";
describe("schemaValidate — smoke", () => {
    it("the bundled dataset validates against the bundled schema", () => {
        const r = validateDataset(dataset, schema);
        if (!r.valid) {
            console.log(r.errors.slice(0, 10));
        }
        expect(r.valid).toBe(true);
    });
    it("rejects an obviously broken dataset", () => {
        const r = validateDataset({ meta: {} }, schema);
        expect(r.valid).toBe(false);
        expect(r.errors.length).toBeGreaterThan(0);
    });
});
