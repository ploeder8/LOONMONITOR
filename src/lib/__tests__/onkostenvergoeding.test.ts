import { describe, it, expect } from "bun:test";
import { berekenOnkostenvergoeding } from "@/lib/onkostenvergoeding";
import { DEFAULTS, maakOnkostenCategorieenDefault } from "@/lib/profiel";

function categorieen(patches: Partial<Record<import("@/lib/profiel").OnkostenCategorieKey, { actief?: boolean; overrideBedrag?: number | null; aantalDagen?: number; aantalKm?: number }>>) {
    const base = maakOnkostenCategorieenDefault(22);
    for (const [key, patch] of Object.entries(patches)) {
        base[key as import("@/lib/profiel").OnkostenCategorieKey] = {
            ...base[key as import("@/lib/profiel").OnkostenCategorieKey],
            ...patch,
        };
    }
    return base;
}

describe("berekenOnkostenvergoeding", () => {
    it("geeft 0 wanneer geen categorie actief is", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: DEFAULTS.onkostenCategorieen,
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(0);
        expect(resultaat.lijnen).toHaveLength(0);
    });

    it("somt maandelijkse auto-onkosten op", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                parking: { actief: true },
                carwash: { actief: true },
                garage: { actief: true },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(80);
        expect(resultaat.lijnen.map((l) => l.maandBedrag)).toEqual([15, 15, 50]);
    });

    it("berekent maaltijd- en baanvergoeding per dag", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                maaltijd: { actief: true, aantalDagen: 20 },
                baan: { actief: true, aantalDagen: 20 },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(380);
        expect(resultaat.lijnen.find((l) => l.key === "maaltijd")?.maandBedrag).toBe(180);
        expect(resultaat.lijnen.find((l) => l.key === "baan")?.maandBedrag).toBe(200);
    });

    it("berekent internet- en thuiswerkvergoeding", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                internet: { actief: true },
                thuiswerk: { actief: true },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(180.99);
    });

    it("gebruikt voorlopig kilometerforfait voor juni 2026 en toont waarschuwing", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                kilometer: { actief: true, aantalKm: 100 },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(45.71);
        expect(resultaat.waarschuwingen.length).toBeGreaterThan(0);
    });

    it("gebruikt retroactief april-2026 tarief voor april", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                kilometer: { actief: true, aantalKm: 100 },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-04-01",
        });
        expect(resultaat.totaal).toBe(45.71);
        expect(resultaat.waarschuwingen).toHaveLength(0);
    });

    it("laat het forfait overschrijven", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                parking: { actief: true, overrideBedrag: 20 },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBe(20);
        expect(resultaat.lijnen[0].overrideBedrag).toBe(20);
    });

    it("somt meerdere categorieën correct", () => {
        const resultaat = berekenOnkostenvergoeding({
            categorieen: categorieen({
                parking: { actief: true },
                maaltijd: { actief: true, aantalDagen: 22 },
                kilometer: { actief: true, aantalKm: 50 },
            }),
            arbeidsdagenPerMaand: 22,
            refDatum: "2026-06-01",
        });
        expect(resultaat.totaal).toBeCloseTo(235.86, 2);
    });
});
