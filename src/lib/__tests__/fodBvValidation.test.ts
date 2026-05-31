import { describe, expect, it } from "bun:test";
import testcases from "../../../knowledgebase/TESTCASES.json";
import { fodBvValidatieCases, summarizeValidation, } from "@/lib/fodBvValidation";
type CorpusCase = {
    id: string;
    status_validatie: string;
    bron_validatie: string;
    verschil_eur: number | null;
    root_cause: string | null;
    officiele_bv_voor_verminderingen: number | null;
    officiele_bv_netto: number | null;
    officieel_netto_maand: number | null;
};
describe("FOD Bijlage III — validatiemetadata", () => {
    it("legt de 30 bruto-netto cases vast als FOD Bijlage III-gevalideerd", () => {
        const summary = summarizeValidation(fodBvValidatieCases);
        expect(fodBvValidatieCases).toHaveLength(30);
        expect(summary.ok).toBe(30);
        expect(summary.afwijking).toBe(0);
    });
    it("heeft officiële FOD Bijlage III-velden voor elke corpuscase", () => {
        const cases = testcases as CorpusCase[];
        expect(cases).toHaveLength(30);
        for (const item of cases) {
            expect(item.bron_validatie).toBe("FOD Bijlage III 2026");
            expect(item.status_validatie).toBe("ok");
            expect(item.root_cause).toBeNull();
            expect(item.verschil_eur).toBe(0);
            expect(typeof item.officiele_bv_voor_verminderingen).toBe("number");
            expect(typeof item.officiele_bv_netto).toBe("number");
            expect(typeof item.officieel_netto_maand).toBe("number");
        }
    });
});
