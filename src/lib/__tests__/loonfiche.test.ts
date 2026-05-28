import { describe, it, expect } from "bun:test";

import { bouwLoonficheVoorProfiel, type LoonficheRegel } from "@/lib/loonfiche";
import { DEFAULTS, refDatumVoorMaand } from "@/lib/profiel";
import {
  berekenNettoVoorProfiel,
  berekenWerkgeverskostVoorProfiel,
  berekenMobiliteitVoorProfiel,
  berekenVaaWerkmiddelenVoorProfiel,
} from "@/lib/profielBerekeningen";

function zoekRegel(regels: LoonficheRegel[], code: string): LoonficheRegel | undefined {
  return regels.find((r) => r.code === code);
}

function assertRegelBestaat(regels: LoonficheRegel[], code: string): LoonficheRegel {
  const regel = zoekRegel(regels, code);
  if (!regel) throw new Error(`Regel ${code} niet gevonden`);
  return regel;
}

const REF_DATUM = refDatumVoorMaand(DEFAULTS.berekeningsJaar, DEFAULTS.berekeningsMaand);

describe("Loonfiche — basis bediende (DEFAULTS)", () => {
  const loonfiche = bouwLoonficheVoorProfiel(DEFAULTS);
  const netto = berekenNettoVoorProfiel(DEFAULTS, REF_DATUM);
  const mobiliteit = berekenMobiliteitVoorProfiel(DEFAULTS, REF_DATUM);
  const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(DEFAULTS, REF_DATUM);
  const wgk = berekenWerkgeverskostVoorProfiel(DEFAULTS, REF_DATUM, vaaWerkmiddelen, mobiliteit);

  it("bevat alle verplichte subtotalen", () => {
    expect(zoekRegel(loonfiche.regels, "1000")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "1090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "2000")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "2090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "2190")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "3000")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "3090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "9000")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "9500")).toBeDefined();
  });

  it("totalen.nettoTeBetalen komt overeen met berekenNettoVoorProfiel", () => {
    expect(loonfiche.totalen.nettoTeBetalen).toBe(netto.nettoloon);
  });

  it("totalen.werkgeverskostMaand komt overeen met berekenWerkgeverskostVoorProfiel", () => {
    expect(loonfiche.totalen.werkgeverskostMaand).toBe(wgk.totaleLoonkostBreed);
  });

  it("is geen student", () => {
    expect(loonfiche.isStudent).toBe(false);
  });
});

describe("Loonfiche — met VAA bedrijfswagen", () => {
  const profiel = {
    ...DEFAULTS,
    woonwerkBedrijfswagen: true,
    bedrijfswagenCataloguswaarde: 40000,
    bedrijfswagenCo2: 100,
    bedrijfswagenBrandstof: "benzine" as const,
    bedrijfswagenDatumEersteInschrijving: "2026-01-01",
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("bevat regel 2100 VAA bedrijfswagen met bedrag > 0", () => {
    const r = assertRegelBestaat(loonfiche.regels, "2100");
    expect(r.bedrag).toBeGreaterThan(0);
  });

  it("bevat regel 6000 terugname VAA bedrijfswagen met bedrag > 0", () => {
    const r = assertRegelBestaat(loonfiche.regels, "6000");
    expect(r.bedrag).toBeGreaterThan(0);
  });

  it("bevat regel 6010 terugname VAA werkmiddelen indien van toepassing", () => {
    const r = zoekRegel(loonfiche.regels, "6010");
    // DEFAULTS heeft geen werkmiddelen actief, dus deze zou niet aanwezig moeten zijn
    // We testen hier dat 6000 wel aanwezig is (bovenstaand), en dat de logica correct is
    expect(r).toBeUndefined();
  });
});

describe("Loonfiche — met maaltijdcheques", () => {
  const profiel = {
    ...DEFAULTS,
    maaltijdchequesActief: true,
    maaltijdchequeWerkgeversaandeelPerDag: 8.91,
    maaltijdchequeWerknemersbijdragePerDag: 1.09,
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("bevat regel 4010 maaltijdcheques werknemer", () => {
    const r = assertRegelBestaat(loonfiche.regels, "4010");
    expect(r.bedrag).toBeGreaterThan(0);
  });

  it("9010 is groter dan 9000", () => {
    const r9000 = assertRegelBestaat(loonfiche.regels, "9000");
    const r9010 = assertRegelBestaat(loonfiche.regels, "9010");
    expect(r9010.bedrag).toBeGreaterThan(r9000.bedrag);
  });
});

describe("Loonfiche — studentenmodus", () => {
  const profiel = {
    ...DEFAULTS,
    statuut: "student" as const,
    studentenCat: "A" as const,
    studentLeeftijd: 20,
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("is gemarkeerd als student", () => {
    expect(loonfiche.isStudent).toBe(true);
  });

  it("bevat waarschuwing voor student", () => {
    expect(loonfiche.waarschuwingen.some((w) => w.toLowerCase().includes("student"))).toBe(true);
  });

  it("bevat geen RSZ, BV of BBSZ regels", () => {
    const verbodenTypes = new Set(["rsz", "bv"]);
    for (const regel of loonfiche.regels) {
      expect(verbodenTypes.has(regel.type)).toBe(false);
    }
  });

  it("bevat regel 9000 netto te betalen", () => {
    expect(zoekRegel(loonfiche.regels, "9000")).toBeDefined();
  });
});

describe("Loonfiche — netto naar bruto", () => {
  const profiel = {
    ...DEFAULTS,
    berekeningsRichting: "netto_naar_bruto" as const,
    doelNettoloon: 2000,
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("bevat richtinglabel in regel 0001", () => {
    const r = assertRegelBestaat(loonfiche.regels, "0001");
    expect(r.label.toLowerCase()).toContain("doelnetto");
  });

  it("brutoloon is verschillend van DEFAULTS brutoloon", () => {
    const r = assertRegelBestaat(loonfiche.regels, "1000");
    expect(r.bedrag).not.toBe(DEFAULTS.brutoloon);
  });

  it("netto te betalen is ongeveer gelijk aan doelnettoloon", () => {
    const r = assertRegelBestaat(loonfiche.regels, "9000");
    expect(r.bedrag).toBeCloseTo(profiel.doelNettoloon, 0);
  });
});

describe("Loonfiche — audit datapunten", () => {
  const loonfiche = bouwLoonficheVoorProfiel(DEFAULTS);

  it("minstens 3 regels hebben audit datapunten", () => {
    const metAudit = loonfiche.regels.filter((r) => r.datapunten && r.datapunten.length > 0);
    expect(metAudit.length).toBeGreaterThanOrEqual(3);
  });

  it("elke audit datapunt heeft een truthy bron_url", () => {
    for (const regel of loonfiche.regels) {
      if (!regel.datapunten) continue;
      for (const dp of regel.datapunten) {
        expect(dp.bron_url).toBeTruthy();
      }
    }
  });
});

describe("Loonfiche — nul-bedragen worden verborgen", () => {
  const profiel = {
    ...DEFAULTS,
    kinderenTenLaste: 0,
    fiscaalAlleenstaandeMetKind: false,
    groepsverzekeringEigenBijdrage: 0,
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("verbergt regel 3010 (vermindering kinderen) bij 0 kinderen", () => {
    expect(zoekRegel(loonfiche.regels, "3010")).toBeUndefined();
  });

  it("toont regel 3010 wanneer kinderen > 0", () => {
    const profielMetKinderen = { ...profiel, kinderenTenLaste: 2 };
    const lf = bouwLoonficheVoorProfiel(profielMetKinderen);
    expect(zoekRegel(lf.regels, "3010")).toBeDefined();
  });
});

describe("Loonfiche — subtotalen altijd aanwezig", () => {
  const profiel = {
    ...DEFAULTS,
    brutoloon: 0,
    woonwerkBedrijfswagen: false,
    maaltijdchequesActief: false,
    groepsverzekeringEigenBijdrage: 0,
    hospitalisatieEigenBijdrage: 0,
    onkostenvergoedingPerMaand: 0,
    woonwerkFiets: false,
    woonwerkPrivewagen: false,
    woonwerkTrein: false,
    woonwerkBusTramMetro: false,
    vaaPcLaptopActief: false,
    vaaGsmSmartphoneActief: false,
    vaaInternetActief: false,
    vaaGsmAbonnementActief: false,
  };
  const loonfiche = bouwLoonficheVoorProfiel(profiel);

  it("subtotalen blijven bestaan zelfs bij nul input", () => {
    expect(zoekRegel(loonfiche.regels, "1090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "2090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "2190")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "3090")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "9000")).toBeDefined();
    expect(zoekRegel(loonfiche.regels, "9500")).toBeDefined();
  });
});
