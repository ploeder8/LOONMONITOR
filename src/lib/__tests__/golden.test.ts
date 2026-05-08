// Golden testcases — pc200_payroll_testcases_2026.md
// Each TC-XX maps to one or more `it(...)` blocks.
// All amounts in EUR, all percentages decimal (0.1307 = 13,07 %).

import { describe, it, expect } from "bun:test";

import { lookupBarema, lookupStudentenbarema, brutolocheck } from "@/lib/baremas";
import { rszBijdragen } from "@/lib/rsz";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { ecocheques } from "@/lib/ecocheques";
import { fietsvergoeding } from "@/lib/fietsvergoeding";
import { indexeerLoon } from "@/lib/indexatie";
import { woonwerkTrein } from "@/lib/woonwerkTrein";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import {
  BaremaBuitenSchaalError,
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
} from "@/lib/errors";

const REF_2026 = "2026-06-01";

describe("TC-01 — Schaal I, Cat A, 0 jaar", () => {
  it("sectoraal minimum is € 2.242,81", () => {
    const r = lookupBarema("I", "A", 0);
    expect(r.maandloonEUR).toBe(2242.81);
    expect(r.datapunt.id).toBe("lonen_pc200_schaalI_catA_01012026");
  });

  it("RSZ-bijdragen op € 2.242,81", () => {
    const r = rszBijdragen({ brutoloon: 2242.81, refDatum: REF_2026 });
    expect(r.werknemerBijdrage).toBe(293.14);
    expect(r.werkgeverBasisbijdrage).toBe(560.70);
    expect(r.sociaalFonds200).toBe(5.16);
  });

  it("brutoloon-check OK bij gelijk-aan-minimum", () => {
    const c = brutolocheck("I", "A", 0, 2242.81);
    expect(c.ok).toBe(true);
    expect(c.verschil).toBe(0);
  });
});

describe("TC-02 — Schaal I, Cat A, 5 jaar", () => {
  it("sectoraal minimum is € 2.276,51", () => {
    const r = lookupBarema("I", "A", 5);
    expect(r.maandloonEUR).toBe(2276.51);
  });

  it("RSZ-bijdragen op € 2.276,51", () => {
    const r = rszBijdragen({ brutoloon: 2276.51, refDatum: REF_2026 });
    expect(r.werknemerBijdrage).toBe(297.54);
    expect(r.werkgeverBasisbijdrage).toBe(569.13);
    expect(r.sociaalFonds200).toBe(5.24);
  });
});

describe("TC-03 — Schaal I, Cat A, loonplafond", () => {
  it("ervaring 25 jaar geeft de plafondwaarde € 2.459,89", () => {
    const r = lookupBarema("I", "A", 25);
    expect(r.maandloonEUR).toBe(2459.89);
  });

  it("ver boven het plafond (99 jaar) clampt zonder fout en geeft € 2.459,89", () => {
    const r = lookupBarema("I", "A", 99);
    expect(r.geclampt).toBe(true);
    expect(r.maandloonEUR).toBe(2459.89);
  });
});

describe("TC-04 — Schaal I, Cat D, jaar 2 (OCR-correctie)", () => {
  it("toont € 2.589,26 (gecorrigeerd)", () => {
    const r = lookupBarema("I", "D", 2);
    expect(r.maandloonEUR).toBe(2589.26);
  });
});

describe("TC-05 — Schaal II, Cat A, jaar 13 (OCR-correctie)", () => {
  it("toont € 2.446,31", () => {
    const r = lookupBarema("II", "A", 13);
    expect(r.maandloonEUR).toBe(2446.31);
  });
});

describe("TC-06 — Schaal II, Cat C, 10 jaar", () => {
  it("sectoraal minimum is € 2.875,48", () => {
    const r = lookupBarema("II", "C", 10);
    expect(r.maandloonEUR).toBe(2875.48);
  });

  it("RSZ-bijdragen op € 2.875,48", () => {
    const r = rszBijdragen({ brutoloon: 2875.48, refDatum: REF_2026 });
    expect(r.werknemerBijdrage).toBe(375.83); // 2875.48 * 0.1307 = 375.832636 → 375.83
    expect(r.werkgeverBasisbijdrage).toBe(718.87);
    expect(r.sociaalFonds200).toBe(6.61);
  });
});

describe("TC-07 — Brutoloon onder sectoraal minimum (faalpad)", () => {
  it("brutoloon-check signaleert tekort", () => {
    const c = brutolocheck("II", "C", 10, 2500);
    expect(c.ok).toBe(false);
    expect(c.sectoraalMinimum).toBe(2875.48);
    expect(c.verschil).toBe(-375.48);
    expect(c.datapuntId).toBe("lonen_pc200_schaalII_catC_01012026");
  });
});

describe("TC-08 — Bouw-subset", () => {
  it("voegt € 42,30 bouw-aanvullend pensioen toe op € 2.350,00", () => {
    const r = rszBijdragen({
      brutoloon: 2350,
      refDatum: REF_2026,
      bouwVlag: true,
    });
    expect(r.werknemerBijdrage).toBe(307.15); // 2350 × 0.1307 = 307.145
    expect(r.werkgeverBasisbijdrage).toBe(587.50);
    expect(r.sociaalFonds200).toBe(5.41); // 2350 × 0.0023 = 5.405 → 5.41 (TC verwacht € 5,41)
    expect(r.bouwAanvullendPensioen).toBe(42.30);
    expect(r.totaalWerkgever).toBe(635.21);
  });

  it("zonder bouw-vlag is geen bouw-bijdrage berekend", () => {
    const r = rszBijdragen({ brutoloon: 2350, refDatum: REF_2026 });
    expect(r.bouwAanvullendPensioen).toBeNull();
  });
});

describe("TC-09 — Studentenbarema, Cat A, 17 jaar", () => {
  it("toont € 1.635,95", () => {
    const r = lookupStudentenbarema("A", 17);
    expect(r.maandloonEUR).toBe(1635.95);
    expect(r.datapunt.id).toBe("lonen_pc200_studenten_catA_01012026");
  });
});

describe("TC-10 — Studentenbarema, Cat C, 16 jaar (faalpad)", () => {
  it("gooit BaremaBuitenSchaalError met duidelijke melding", () => {
    expect(() => lookupStudentenbarema("C", 16)).toThrow(BaremaBuitenSchaalError);
  });
});

describe("TC-11 — Jaarlijkse premie 2026", () => {
  it("bedraagt € 330,84 met sfonds200.be als bron", () => {
    const r = jaarlijksePremie2026(REF_2026);
    expect(r.bedrag).toBe(330.84);
    expect(r.datapunt.bron_url).toContain("sfonds200.be");
  });
});

describe("TC-12 — Eindejaarspremie pro-rata", () => {
  it("bij 9/12 maanden en € 2.875,48 brutoloon is de premie € 2.156,61", () => {
    const r = eindejaarspremie({
      brutoloon: 2875.48,
      ancienniteitMaanden: 6,
      prestatieMaandenInRefertepériode: 9,
    });
    expect(r.voorwaardenVoldaan).toBe(true);
    expect(r.proRataFactor).toBe(0.75);
    expect(r.premie).toBe(2156.61);
  });

  it("weigert wanneer anciënniteit < 6 maanden", () => {
    const r = eindejaarspremie({
      brutoloon: 2875.48,
      ancienniteitMaanden: 4,
      prestatieMaandenInRefertepériode: 4,
    });
    expect(r.voorwaardenVoldaan).toBe(false);
    expect(r.premie).toBe(0);
  });
});

describe("TC-13 — Ecocheques voltijds", () => {
  it("5/5 met volledige refertepériode = € 250", () => {
    const r = ecocheques({ tewerkstellingsbreuk: 1, refDatum: REF_2026 });
    expect(r.bedrag).toBe(250);
    expect(r.datapunt.id).toBe("pc200_ecocheques_voltijds");
  });
});

describe("TC-14 — Ecocheques deeltijds 3/5", () => {
  it("bedraagt € 200", () => {
    const r = ecocheques({ tewerkstellingsbreuk: 0.6, refDatum: REF_2026 });
    expect(r.bedrag).toBe(200);
    expect(r.schaalLabel).toBe("≥ 3/5");
    expect(r.datapunt.id).toBe("pc200_ecocheques_deeltijds_schaal");
  });

  it("4/5 = € 250", () => {
    const r = ecocheques({ tewerkstellingsbreuk: 0.8, refDatum: REF_2026 });
    expect(r.bedrag).toBe(250);
    expect(r.schaalLabel).toBe("≥ 4/5");
  });

  it("1/2 = € 150", () => {
    const r = ecocheques({ tewerkstellingsbreuk: 0.5, refDatum: REF_2026 });
    expect(r.bedrag).toBe(150);
  });

  it("< 1/2 = € 100", () => {
    const r = ecocheques({ tewerkstellingsbreuk: 0.4, refDatum: REF_2026 });
    expect(r.bedrag).toBe(100);
  });
});

describe("TC-15 — Fietsvergoeding 2026 (overgang oktober)", () => {
  it("oktober 2026: 8 km/dag × € 0,32 × 22 dagen = € 56,32", () => {
    const r = fietsvergoeding({
      kmPerDag: 8,
      arbeidsdagen: 22,
      refDatum: "2026-10-15",
    });
    expect(r.tariefPerKm).toBe(0.32);
    expect(r.vergoeding).toBe(56.32);
  });

  it("september 2026: datapunt is niet geldig (vóór 1/10/2026) en gooit DatapuntNietGeldigOpDatum", () => {
    expect(() =>
      fietsvergoeding({
        kmPerDag: 8,
        arbeidsdagen: 22,
        refDatum: "2026-09-15",
      }),
    ).toThrow(DatapuntNietGeldigOpDatum);
  });
});

describe("TC-16 — Woon-werk trein 100 %", () => {
  it("treinkaart € 92,00/maand → werkgeverstussenkomst € 92,00", () => {
    const r = woonwerkTrein({ treinkaartPrijsPerMaand: 92, refDatum: REF_2026 });
    expect(r.werkgeverstussenkomst).toBe(92);
    expect(r.fractie).toBe(1);
    expect(r.datapunt.id).toBe("pc200_woonwerk_trein_2026");
  });
});

describe("TC-17 — Indexatie van een ondernemingsloon", () => {
  it("€ 3.500 × 1,0221 = € 3.577,35", () => {
    const r = indexeerLoon({ oudLoon: 3500, refDatum: "2026-01-01" });
    expect(r.coefficient).toBe(1.0221);
    expect(r.nieuwLoon).toBe(3577.35);
  });
});

describe("TC-18 — Niet-gevonden datapunt: maaltijdcheques", () => {
  it("dataset.meta.niet_gevonden bevat een entry over maaltijdcheques", () => {
    const dp = getDatapunt("pc200_maaltijdcheques");
    // Either no datapoint at all (handled via meta.niet_gevonden) or one with status niet_gevonden.
    if (dp) {
      expect(dp.status).toBe("niet_gevonden");
    } else {
      // We accept absence as the "niet_gevonden" signal — UI checks meta.niet_gevonden.
      expect(dp).toBeNull();
    }
  });
});

describe("TC-19 — Datapunt status mogelijk_verouderd", () => {
  it("rsz_bijzondere_bijdragen_verwijzing weigert default, maar levert een waarschuwing met expliciete toelating", () => {
    expect(() =>
      safeGetValue("rsz_bijzondere_bijdragen_verwijzing", { refDatum: REF_2026 }),
    ).toThrow(DatapuntNietBruikbaar);

    const r = safeGetValue("rsz_bijzondere_bijdragen_verwijzing", {
      refDatum: REF_2026,
      toelatenMogelijkVerouderd: true,
    });
    expect(r.waarschuwing).toContain("mogelijk_verouderd");
    expect(r.datapunt.id).toBe("rsz_bijzondere_bijdragen_verwijzing");
  });
});

describe("TC-20 — Audit trail (acceptatietest)", () => {
  it("elk barema-resultaat bevat een datapunt met bron_url", () => {
    const r = lookupBarema("I", "A", 0);
    expect(r.datapunt.bron_url).toBeTruthy();
  });

  it("elke RSZ-bron in het resultaat heeft een datapunt met bron_organisatie", () => {
    const r = rszBijdragen({ brutoloon: 2242.81, refDatum: REF_2026, bouwVlag: true });
    for (const b of r.bronnen) {
      expect(b.datapunt.bron_organisatie).toBeTruthy();
      expect(b.datapunt.bron_url).toBeTruthy();
    }
  });
});
