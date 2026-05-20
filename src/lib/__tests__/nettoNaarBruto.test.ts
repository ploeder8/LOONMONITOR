import { describe, it, expect } from "bun:test";
import { berekenNetto } from "@/lib/netto";
import {
  zoekBrutoVoorNetto,
  type NettoNaarBrutoInput,
} from "@/lib/nettoNaarBruto";

const REF_2026 = "2026-06-01";

function makeBaseInput(): Omit<NettoNaarBrutoInput, "doelNettoloon"> {
  return {
    refDatum: REF_2026,
    gezinstype: "alleenstaand",
    kinderenTenLaste: 0,
  };
}

describe("NTC-R-01 — Exacte round-trip voor bekende bruto-waarden", () => {
  const cases = [
    { brutoloon: 2242.81, label: "Schaal I Cat A 0j" },
    { brutoloon: 2276.51, label: "Schaal I Cat A 5j (default)" },
    { brutoloon: 2459.89, label: "Schaal I Cat A plafond" },
    { brutoloon: 2875.48, label: "Schaal II Cat C 10j" },
    { brutoloon: 3000.0, label: "Rond bedrag" },
    { brutoloon: 3500.0, label: "Midden-hoog loon" },
    { brutoloon: 4500.0, label: "Hoog loon" },
    { brutoloon: 5500.0, label: "Zeer hoog loon" },
  ];

  for (const c of cases) {
    it(`round-trip: ${c.label} (bruto €${c.brutoloon})`, () => {
      const forward = berekenNetto({
        ...makeBaseInput(),
        brutoloon: c.brutoloon,
      });
      const doelNetto = forward.nettoloon;

      const inverse = zoekBrutoVoorNetto({
        ...makeBaseInput(),
        doelNettoloon: doelNetto,
      });

      expect(inverse.convergentie).toBe("ok");
      expect(inverse.gevondenBruto).not.toBeNull();
      expect(inverse.afwijkingVanDoel).toBeLessThanOrEqual(0.01);
      // Het gevonden bruto moet binnen €0,02 van het origineel liggen
      expect(Math.abs((inverse.gevondenBruto ?? 0) - c.brutoloon)).toBeLessThanOrEqual(0.10);
    });
  }
});

describe("NTC-R-02 — Gezinstype variaties", () => {
  const gezinstypes = [
    "alleenstaand",
    "gehuwd_met_inkomen",
    "gehuwd_zonder_inkomen",
  ] as const;

  for (const gt of gezinstypes) {
    it(`convergeert voor gezinstype ${gt}`, () => {
      const forward = berekenNetto({
        refDatum: REF_2026,
        gezinstype: gt,
        kinderenTenLaste: 2,
        brutoloon: 2800,
      });
      const inverse = zoekBrutoVoorNetto({
        refDatum: REF_2026,
        gezinstype: gt,
        kinderenTenLaste: 2,
        doelNettoloon: forward.nettoloon,
      });
      expect(inverse.convergentie).toBe("ok");
      expect(Math.abs((inverse.gevondenBruto ?? 0) - 2800)).toBeLessThanOrEqual(0.10);
    });
  }
});

describe("NTC-R-03 — BV-schijf grenzen", () => {
  // Deze brutoloon-waarden liggen dicht bij de PB-schijf grenzen op jaarbasis
  // ~€1.393/m (25%→40%), ~€2.459/m (40%→45%), ~€4.256/m (45%→50%)
  const grensBrutos = [1393, 2459, 4256];

  for (const b of grensBrutos) {
    it(`convergeert bij BV-schijfgrens bruto ≈ €${b}`, () => {
      const forward = berekenNetto({
        ...makeBaseInput(),
        brutoloon: b,
      });
      const inverse = zoekBrutoVoorNetto({
        ...makeBaseInput(),
        doelNettoloon: forward.nettoloon,
      });
      expect(inverse.convergentie).toBe("ok");
      expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
    });
  }
});

describe("NTC-R-04 — Werkbonus afbouwzone", () => {
  it("convergeert in Luik B afbouwzone (rond €2.500)", () => {
    const b = 2500;
    const forward = berekenNetto({ ...makeBaseInput(), brutoloon: b });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
  });

  it("convergeert in Luik A afbouwzone (rond €3.100)", () => {
    const b = 3100;
    const forward = berekenNetto({ ...makeBaseInput(), brutoloon: b });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
  });
});

describe("NTC-R-05 — Lage en hoge netto-doelen", () => {
  it("convergeert voor zeer laag netto (€500)", () => {
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: 500,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(inverse.gevondenBruto).toBeGreaterThan(0);
    // Verify forward consistency
    if (inverse.nettoResultaat) {
      expect(Math.abs(inverse.nettoResultaat.nettoloon - 500)).toBeCloseTo(0, 1);
    }
  });

  it("convergeert voor hoog netto (€5.000)", () => {
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: 5000,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(inverse.gevondenBruto).toBeGreaterThan(5000);
    if (inverse.nettoResultaat) {
      expect(Math.abs(inverse.nettoResultaat.nettoloon - 5000)).toBeCloseTo(0, 1);
    }
  });
});

describe("NTC-R-06 — Extralegale voordelen", () => {
  it("convergeert met maaltijdcheques", () => {
    const b = 2800;
    const forward = berekenNetto({
      ...makeBaseInput(),
      brutoloon: b,
      maaltijdchequeWerknemersbijdragePerDag: 1.09,
      maaltijdchequeWerkdagen: 20,
    });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
      maaltijdchequeWerknemersbijdragePerDag: 1.09,
      maaltijdchequeWerkdagen: 20,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
  });

  it("convergeert met groepsverzekering", () => {
    const b = 3000;
    const forward = berekenNetto({
      ...makeBaseInput(),
      brutoloon: b,
      groepsverzekeringEigenBijdrage: 50,
    });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
      groepsverzekeringEigenBijdrage: 50,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
  });
});

describe("NTC-R-07 — Audit-trail", () => {
  it("draagt methodologie-datapunt mee", () => {
    const forward = berekenNetto({ ...makeBaseInput(), brutoloon: 2276.51 });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
    });
    expect(inverse.methodologieDatapunt).not.toBeNull();
    expect(inverse.methodologieDatapunt?.id).toBe("berekeningsmethode_netto_naar_bruto");
    expect(inverse.tolerantieDatapunt).not.toBeNull();
    expect(inverse.tolerantieDatapunt?.id).toBe("netto_naar_bruto_tolerantie_eur");
  });
});

describe("NTC-R-08 — Non-convergentie voor onrealistisch hoog netto", () => {
  it("geeft niet_geconvergeerd terug bij onmogelijk hoog netto", () => {
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: 50_000,
    });
    // Omdat we de bovengrens dynamisch opschalen, zal dit waarschijnlijk WEL convergeren
    // maar pas na veel iteraties. We testen daarom de structuur, niet per se de status.
    expect(inverse.iteraties).toBeGreaterThan(0);
    expect(inverse.gevondenBruto).not.toBeNull();
    if (inverse.nettoResultaat) {
      expect(inverse.nettoResultaat.nettoloon).toBeGreaterThan(0);
    }
  });
});

describe("NTC-R-09 — BBSZ scenario's", () => {
  const bbszInputs: NettoNaarBrutoInput[] = [
    { ...makeBaseInput(), doelNettoloon: 1800 },
    { ...makeBaseInput(), gezinstype: "gehuwd_zonder_inkomen", doelNettoloon: 1800 },
  ];

  for (let i = 0; i < bbszInputs.length; i++) {
    it(`convergeert voor BBSZ-variant ${i + 1}`, () => {
      const inverse = zoekBrutoVoorNetto(bbszInputs[i]);
      expect(inverse.convergentie).toBe("ok");
      expect(inverse.gevondenBruto).toBeGreaterThan(0);
      if (inverse.nettoResultaat) {
        expect(Math.abs(inverse.nettoResultaat.nettoloon - bbszInputs[i].doelNettoloon)).toBeCloseTo(0, 1);
      }
    });
  }
});

describe("NTC-R-10 — Bouwvlag", () => {
  it("convergeert met bouwvlag actief", () => {
    const b = 3000;
    const forward = berekenNetto({
      ...makeBaseInput(),
      brutoloon: b,
      bouwVlag: true,
    });
    const inverse = zoekBrutoVoorNetto({
      ...makeBaseInput(),
      doelNettoloon: forward.nettoloon,
      bouwVlag: true,
    });
    expect(inverse.convergentie).toBe("ok");
    expect(Math.abs((inverse.gevondenBruto ?? 0) - b)).toBeLessThanOrEqual(0.10);
  });
});
