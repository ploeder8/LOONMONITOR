import { describe, expect, test } from "bun:test";
import { buildAiChatInstructions, buildOpenAiInput, extractOpenAiAnswer, getAiChatConfig, validateAiChatRequest, } from "@/lib/aiChat";
describe("aiChat config", () => {
    test("leest publieke MVP-limieten uit server environment", () => {
        const config = getAiChatConfig({
            AI_CHAT_ENABLED: "true",
            AI_CHAT_DAILY_LIMIT: "12",
            AI_CHAT_MAX_MESSAGE_CHARS: "750",
            AI_CHAT_MODEL: "gpt-5.4-mini",
        });
        expect(config.enabled).toBe(true);
        expect(config.dailyLimit).toBe(12);
        expect(config.maxMessageChars).toBe(750);
        expect(config.model).toBe("gpt-5.4-mini");
    });
    test("gebruikt veilige defaults wanneer optionele limieten ontbreken", () => {
        const config = getAiChatConfig({ AI_CHAT_ENABLED: "false" });
        expect(config.enabled).toBe(false);
        expect(config.dailyLimit).toBe(10);
        expect(config.maxMessageChars).toBe(1000);
        expect(config.maxHistoryMessages).toBe(6);
    });
    test("accepteert Vercel env pull waarden met quotes", () => {
        const config = getAiChatConfig({
            AI_CHAT_ENABLED: '"true"',
            AI_CHAT_DAILY_LIMIT: '"10"',
            AI_CHAT_MAX_MESSAGE_CHARS: '"1500"',
        });
        expect(config.enabled).toBe(true);
        expect(config.dailyLimit).toBe(10);
        expect(config.maxMessageChars).toBe(1500);
    });
});
describe("validateAiChatRequest", () => {
    test("accepteert een korte gebruikersvraag en beperkt history tot de laatste berichten", () => {
        const result = validateAiChatRequest({
            message: "Hoe werkt de werkgeverskostberekening?",
            history: [
                { role: "user", content: "eerste" },
                { role: "assistant", content: "antwoord" },
                { role: "user", content: "tweede" },
            ],
        }, { maxMessageChars: 1000, maxHistoryMessages: 2 });
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.message).toBe("Hoe werkt de werkgeverskostberekening?");
            expect(result.history).toEqual([
                { role: "assistant", content: "antwoord" },
                { role: "user", content: "tweede" },
            ]);
        }
    });
    test("weigert te lange vragen voor kostcontrole", () => {
        const result = validateAiChatRequest({ message: "x".repeat(101), history: [] }, { maxMessageChars: 100, maxHistoryMessages: 6 });
        expect(result).toEqual({
            ok: false,
            status: 413,
            code: "message_too_long",
            message: "Je vraag is te lang. Verkort je vraag en probeer opnieuw.",
        });
    });
});
describe("OpenAI payload helpers", () => {
    test("bouwt corpus-instructies die antwoorden buiten de kennisbank blokkeren", () => {
        const instructions = buildAiChatInstructions();
        expect(instructions).toContain("uitsluitend");
        expect(instructions).toContain("knowledgebase");
        expect(instructions).toContain("Ik vind dit niet terug in de kennisbank");
        expect(instructions).toContain("Bronnen:");
    });
    test("zet history en huidige vraag om naar Responses API input", () => {
        const input = buildOpenAiInput("Wat doet de Scope-pagina?", [
            { role: "user", content: "Waarvoor dient Jaakie?" },
            { role: "assistant", content: "Jaakie is een PC 200 loonmotor." },
        ]);
        expect(input).toEqual([
            { role: "user", content: "Waarvoor dient Jaakie?" },
            { role: "assistant", content: "Jaakie is een PC 200 loonmotor." },
            { role: "user", content: "Wat doet de Scope-pagina?" },
        ]);
    });
    test("leest output_text uit OpenAI Responses API antwoord", () => {
        expect(extractOpenAiAnswer({ output_text: "Antwoord uit corpus." })).toBe("Antwoord uit corpus.");
    });
    test("leest tekst uit Responses API output content wanneer output_text ontbreekt", () => {
        const answer = extractOpenAiAnswer({
            output: [
                {
                    content: [
                        { type: "output_text", text: "Eerste zin." },
                        { type: "output_text", text: "Tweede zin." },
                    ],
                },
            ],
        });
        expect(answer).toBe("Eerste zin.\nTweede zin.");
    });
});
