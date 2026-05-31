import { buildAiChatInstructions, buildOpenAiInput, extractOpenAiAnswer, getAiChatConfig, validateAiChatRequest, } from "../src/lib/aiChat";
import type { AiChatConfig, AiChatMessage } from "../src/lib/aiChat";
export const config = {
    runtime: "edge",
};
type UsageResult = {
    allowed: boolean;
    usageCount: number;
};
type ChatEvent = {
    ipHash: string;
    status: string;
    model?: string;
    tokensIn?: number;
    tokensOut?: number;
    errorCode?: string;
};
export default async function handler(request: Request): Promise<Response> {
    if (request.method !== "POST") {
        return json({ error: "method_not_allowed", message: "Gebruik POST om de chatbot aan te spreken." }, 405);
    }
    const chatConfig = getAiChatConfig(process.env);
    if (!chatConfig.enabled) {
        return json({ error: "chat_disabled", message: "De AI-chat is tijdelijk uitgeschakeld." }, 503);
    }
    const envCheck = requireServerEnv();
    if (envCheck.ok === false) {
        return json({ error: envCheck.code, message: "De AI-chat is nog niet volledig geconfigureerd." }, 503);
    }
    const ipHash = await hashIp(getClientIp(request));
    const parsedBody = await readJsonBody(request);
    const validRequest = validateAiChatRequest(parsedBody, {
        maxMessageChars: chatConfig.maxMessageChars,
        maxHistoryMessages: chatConfig.maxHistoryMessages,
    });
    if (validRequest.ok === false) {
        await logChatEvent({ ipHash, status: "blocked", errorCode: validRequest.code });
        return json({ error: validRequest.code, message: validRequest.message }, validRequest.status);
    }
    let usage: UsageResult;
    try {
        usage = await incrementUsage(ipHash, chatConfig.dailyLimit);
    }
    catch (error) {
        const code = error instanceof Error ? error.message : "supabase_usage_error";
        await logChatEvent({ ipHash, status: "error", errorCode: code });
        return json({ error: "rate_limit_unavailable", message: "De AI-chat is tijdelijk niet beschikbaar." }, 503);
    }
    if (!usage.allowed) {
        await logChatEvent({ ipHash, status: "rate_limited", errorCode: "daily_limit" });
        return json({
            error: "daily_limit",
            message: "De daglimiet voor de publieke chat is bereikt. Probeer later opnieuw.",
            limit: chatConfig.dailyLimit,
        }, 429, { "Retry-After": "86400" });
    }
    try {
        const response = await callOpenAi(validRequest.message, validRequest.history, chatConfig);
        const answer = extractOpenAiAnswer(response) || "Ik vind dit niet terug in de kennisbank.";
        const tokenUsage = extractTokenUsage(response);
        await logChatEvent({
            ipHash,
            status: "ok",
            model: chatConfig.model,
            tokensIn: tokenUsage.tokensIn,
            tokensOut: tokenUsage.tokensOut,
        });
        return json({
            answer,
            model: chatConfig.model,
            usage: {
                count: usage.usageCount,
                limit: chatConfig.dailyLimit,
            },
        });
    }
    catch (error) {
        const code = error instanceof Error ? error.message : "openai_error";
        await logChatEvent({ ipHash, status: "error", model: chatConfig.model, errorCode: code });
        return json({ error: "chat_error", message: "De AI-chat kon deze vraag niet verwerken." }, 502);
    }
}
async function callOpenAi(message: string, history: AiChatMessage[], chatConfig: AiChatConfig): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: chatConfig.model,
                instructions: buildAiChatInstructions(),
                input: buildOpenAiInput(message, history),
                max_output_tokens: chatConfig.maxOutputTokens,
                tools: [
                    {
                        type: "file_search",
                        vector_store_ids: [process.env.OPENAI_VECTOR_STORE_ID],
                    },
                ],
            }),
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`openai_${response.status}`);
        }
        return response.json();
    }
    finally {
        clearTimeout(timeout);
    }
}
async function incrementUsage(ipHash: string, dailyLimit: number): Promise<UsageResult> {
    const response = await supabaseFetch("/rest/v1/rpc/increment_ai_chat_usage", {
        method: "POST",
        body: JSON.stringify({
            p_ip_hash: ipHash,
            p_usage_date: new Date().toISOString().slice(0, 10),
            p_limit: dailyLimit,
        }),
    });
    if (!response.ok) {
        throw new Error(`supabase_usage_${response.status}`);
    }
    const payload = await response.json();
    const row = Array.isArray(payload) ? payload[0] : payload;
    return {
        allowed: Boolean(row?.allowed),
        usageCount: typeof row?.usage_count === "number" ? row.usage_count : dailyLimit + 1,
    };
}
async function logChatEvent(event: ChatEvent): Promise<void> {
    try {
        await supabaseFetch("/rest/v1/ai_chat_events", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
                ip_hash: event.ipHash,
                status: event.status,
                model: event.model ?? null,
                tokens_in: event.tokensIn ?? null,
                tokens_out: event.tokensOut ?? null,
                error_code: event.errorCode ?? null,
            }),
        });
    }
    catch {
    }
}
function supabaseFetch(path: string, init: RequestInit): Promise<Response> {
    const url = `${process.env.SUPABASE_URL}${path}`;
    const headers = new Headers(init.headers);
    headers.set("apikey", process.env.SUPABASE_SECRET_KEY ?? "");
    headers.set("Authorization", `Bearer ${process.env.SUPABASE_SECRET_KEY}`);
    headers.set("Content-Type", "application/json");
    return fetch(url, {
        ...init,
        headers,
    });
}
async function readJsonBody(request: Request): Promise<unknown> {
    try {
        return await request.json();
    }
    catch {
        return null;
    }
}
function requireServerEnv(): {
    ok: true;
} | {
    ok: false;
    code: string;
} {
    const required = ["OPENAI_API_KEY", "OPENAI_VECTOR_STORE_ID", "SUPABASE_URL", "SUPABASE_SECRET_KEY"];
    const missing = required.find((key) => !process.env[key]);
    return missing ? { ok: false, code: `missing_${missing.toLowerCase()}` } : { ok: true };
}
function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded)
        return forwarded.split(",")[0]?.trim() || "unknown";
    return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
}
async function hashIp(ip: string): Promise<string> {
    const salt = process.env.AI_CHAT_IP_HASH_SALT ?? process.env.SUPABASE_SECRET_KEY ?? "jaakie";
    const data = new TextEncoder().encode(`${salt}:${ip}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function extractTokenUsage(response: unknown): {
    tokensIn?: number;
    tokensOut?: number;
} {
    if (!isRecord(response) || !isRecord(response.usage)) {
        return {};
    }
    return {
        tokensIn: readNumber(response.usage.input_tokens),
        tokensOut: readNumber(response.usage.output_tokens),
    };
}
function readNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
function json(body: unknown, status = 200, headers?: HeadersInit): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
    });
}
