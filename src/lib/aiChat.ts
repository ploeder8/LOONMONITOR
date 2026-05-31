export type AiChatRole = "user" | "assistant";
export type AiChatMessage = {
    role: AiChatRole;
    content: string;
};
export type OpenAiInputMessage = {
    role: AiChatRole;
    content: string;
};
export type AiChatConfig = {
    enabled: boolean;
    dailyLimit: number;
    maxMessageChars: number;
    maxHistoryMessages: number;
    model: string;
    maxOutputTokens: number;
};
type EnvLike = Record<string, string | undefined>;
export type AiChatValidationOptions = {
    maxMessageChars: number;
    maxHistoryMessages: number;
};
export type AiChatValidationResult = {
    ok: true;
    message: string;
    history: AiChatMessage[];
} | {
    ok: false;
    status: number;
    code: string;
    message: string;
};
export function getAiChatConfig(env: EnvLike): AiChatConfig {
    return {
        enabled: normalizeEnvValue(env.AI_CHAT_ENABLED) === "true",
        dailyLimit: parsePositiveInteger(env.AI_CHAT_DAILY_LIMIT, 10),
        maxMessageChars: parsePositiveInteger(env.AI_CHAT_MAX_MESSAGE_CHARS, 1000),
        maxHistoryMessages: parsePositiveInteger(env.AI_CHAT_MAX_HISTORY_MESSAGES, 6),
        model: normalizeEnvValue(env.AI_CHAT_MODEL) ?? "gpt-5.4-mini",
        maxOutputTokens: parsePositiveInteger(env.AI_CHAT_MAX_OUTPUT_TOKENS, 900),
    };
}
export function validateAiChatRequest(body: unknown, options: AiChatValidationOptions): AiChatValidationResult {
    if (!isRecord(body)) {
        return validationError(400, "invalid_body", "De aanvraag is ongeldig.");
    }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
        return validationError(400, "empty_message", "Stel een vraag om de chatbot te gebruiken.");
    }
    if (message.length > options.maxMessageChars) {
        return validationError(413, "message_too_long", "Je vraag is te lang. Verkort je vraag en probeer opnieuw.");
    }
    const history = Array.isArray(body.history) ? body.history : [];
    const veiligeHistory = history
        .filter(isAiChatMessage)
        .map((item) => ({ role: item.role, content: item.content.trim() }))
        .filter((item) => item.content.length > 0)
        .slice(-options.maxHistoryMessages);
    return {
        ok: true,
        message,
        history: veiligeHistory,
    };
}
export function buildAiChatInstructions(): string {
    return [
        "Je bent de Jaakie kennisbank-chatbot.",
        "Antwoord uitsluitend in het Nederlands en uitsluitend op basis van de geindexeerde bestanden uit knowledgebase/ en knowledgebase/onderzoek/.",
        "Leg de werking van de tool, PC 200-context, dataset, testcases en onderzoeksdossier helder uit.",
        "Als de bronnen het antwoord niet onderbouwen, antwoord exact met: Ik vind dit niet terug in de kennisbank.",
        "Treed niet op als algemene HR-, fiscale of juridische adviseur buiten het corpus.",
        "Sluit elk inhoudelijk antwoord af met een korte regel 'Bronnen:' en noem de relevante bronbestanden of citaties wanneer die beschikbaar zijn.",
    ].join("\n");
}
export function buildOpenAiInput(message: string, history: AiChatMessage[]): OpenAiInputMessage[] {
    return [
        ...history.map((item) => ({ role: item.role, content: item.content })),
        { role: "user", content: message },
    ];
}
export function extractOpenAiAnswer(response: unknown): string {
    if (isRecord(response) && typeof response.output_text === "string") {
        return response.output_text.trim();
    }
    if (!isRecord(response) || !Array.isArray(response.output)) {
        return "";
    }
    return response.output
        .flatMap((outputItem) => (isRecord(outputItem) && Array.isArray(outputItem.content) ? outputItem.content : []))
        .map((contentItem) => (isRecord(contentItem) && typeof contentItem.text === "string" ? contentItem.text.trim() : ""))
        .filter(Boolean)
        .join("\n");
}
function parsePositiveInteger(value: string | undefined, fallback: number): number {
    const normalized = normalizeEnvValue(value);
    if (!normalized)
        return fallback;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function normalizeEnvValue(value: string | undefined): string | undefined {
    if (!value)
        return undefined;
    return value.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
function isAiChatMessage(value: unknown): value is AiChatMessage {
    return (isRecord(value) &&
        (value.role === "user" || value.role === "assistant") &&
        typeof value.content === "string");
}
function validationError(status: number, code: string, message: string): AiChatValidationResult {
    return {
        ok: false,
        status,
        code,
        message,
    };
}
