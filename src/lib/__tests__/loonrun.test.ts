import { describe, it, expect } from "bun:test";

import { bouwLoonrun } from "@/lib/loonrun";
import { DEFAULTS } from "@/lib/profiel";

describe("Loonrun — domeinlaag", () => {
  it("berekent 3 geldige werknemers correct", () => {
    const inputs = [
      { id: "1", naam: "Jan", profiel: { ...DEFAULTS, brutoloon: 3000 } },
      { id: "2", naam: "Piet", profiel: { ...DEFAULTS, brutoloon: 2500 } },
      { id: "3", naam: "Marie", profiel: { ...DEFAULTS, brutoloon: 3500 } },
    ];

    const run = bouwLoonrun(inputs);

    expect(run.totalen.aantalBerekend).toBe(3);
    expect(run.totalen.aantalFout).toBe(0);
    expect(run.werknemers.length).toBe(3);

    // Alle hebben status berekend
    for (const w of run.werknemers) {
      expect(w.status).toBe("berekend");
      expect(w.loonfiche).toBeDefined();
    }

    // Totalen zijn som van individuen
    const brutoSom = run.werknemers.reduce(
      (sum, w) => sum + (w.loonfiche?.totalen.brutoRszBasis ?? 0),
      0,
    );
    expect(run.totalen.bruto).toBe(brutoSom);
  });

  it("totalen zijn som van individuele loonfiches", () => {
    const inputs = [
      { id: "1", naam: "A", profiel: { ...DEFAULTS, brutoloon: 3000 } },
      { id: "2", naam: "B", profiel: { ...DEFAULTS, brutoloon: 2500 } },
    ];

    const run = bouwLoonrun(inputs);
    const nettoSom = run.werknemers.reduce(
      (sum, w) => sum + (w.loonfiche?.totalen.nettoTeBetalen ?? 0),
      0,
    );
    const wgkSom = run.werknemers.reduce(
      (sum, w) => sum + (w.loonfiche?.totalen.werkgeverskostMaand ?? 0),
      0,
    );

    expect(run.totalen.netto).toBe(nettoSom);
    expect(run.totalen.werkgeverskost).toBe(wgkSom);
  });

  it("isoleert fouten per werknemer zonder anderen te blokkeren", () => {
    // Een student met ongeldige leeftijd veroorzaakt een BaremaBuitenSchaalError
    const inputs = [
      { id: "1", naam: "Goed", profiel: { ...DEFAULTS, brutoloon: 3000 } },
      {
        id: "2",
        naam: "Fout",
        profiel: {
          ...DEFAULTS,
          statuut: "student" as const,
          studentenCat: "A" as const,
          studentLeeftijd: 99,
        },
      },
      { id: "3", naam: "Ook goed", profiel: { ...DEFAULTS, brutoloon: 2500 } },
    ];

    const run = bouwLoonrun(inputs);

    // Niet alle werknemers zijn berekend
    expect(run.totalen.aantalBerekend).toBeLessThan(3);
    expect(run.totalen.aantalFout).toBeGreaterThanOrEqual(1);

    // Werknemer 1 en 3 zijn niet beïnvloed
    expect(run.werknemers[0].status).toBe("berekend");
    expect(run.werknemers[2].status).toBe("berekend");

    // Foutieve werknemer heeft foutstatus
    expect(run.werknemers[1].status).toBe("fout");
    expect(run.werknemers[1].fout).toBeTruthy();
  });

  it("berekent loonwig uit totalen", () => {
    const inputs = [
      { id: "1", naam: "A", profiel: { ...DEFAULTS, brutoloon: 3000 } },
    ];

    const run = bouwLoonrun(inputs);
    const wgk = run.totalen.werkgeverskost;
    const netto = run.totalen.netto;

    if (wgk > 0 && run.totalen.loonwigPct !== null) {
      const expectedLoonwig = Math.round(((wgk - netto) / wgk) * 100 * 100) / 100;
      expect(run.totalen.loonwigPct).toBe(expectedLoonwig);
    }
  });

  it("toont periode van eerste werknemer", () => {
    const inputs = [
      { id: "1", naam: "Jan", profiel: { ...DEFAULTS, berekeningsMaand: "03" } },
    ];

    const run = bouwLoonrun(inputs);
    expect(run.periode).toContain("maart");
    expect(run.periode).toContain("2026");
  });

  it("geeft lege run bij lege inputs", () => {
    const run = bouwLoonrun([]);
    expect(run.werknemers).toHaveLength(0);
    expect(run.totalen.bruto).toBe(0);
    expect(run.totalen.netto).toBe(0);
    expect(run.totalen.werkgeverskost).toBe(0);
    expect(run.totalen.aantalBerekend).toBe(0);
    expect(run.totalen.aantalFout).toBe(0);
  });
});
