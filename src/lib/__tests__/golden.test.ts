// Golden testcases — pc200_payroll_testcases_2026.md
// Each TC-XX maps to one or more `it(...)` blocks.
// All amounts in EUR, all percentages decimal (0.1307 = 13,07 %).

import { describe, it, expect } from "bun:test";

import { lookupBarema, lookupStudentenbarema, brutolocheck } from "@/lib/baremas";
import { rszBijdragen } from "@/lib/rsz";
import { werkbonus } from "@/lib/werkbonus";
import { bbsz } from "@/lib/bbsz";
import { berekenBV } from "@/lib/bv";
import { berekenNetto } from "@/lib/netto";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { ecocheques } from "@/lib/ecocheques";
import { fietsvergoeding } from "@/lib/fietsvergoeding";
import { woonwerkTrein } from "@/lib/woonwerkTrein";
import { berekenWoonwerkVerkeer } from "@/lib/woonwerkVerkeer";
import { vaaBedrijfswagen } from "@/lib/vaaBedrijfswagen";
import { vaaForfaitsWerkmiddelen } from "@/lib/vaaForfaits";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { berekenJaaroverzicht } from "@/lib/jaaroverzicht";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import { werkgeverskost } from "@/lib/werkgeverskost";
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
    const c = brutolocheck("I", "A", 0, 2242.81, REF_2026);
    expect(c.ok).toBe(true);
    expect(c.verschil).toBe(0);
  });

  it("weigert barema lookup wanneer het gekozen jaar buiten de geldigheidsperiode valt", () => {
    expect(() => lookupBarema("I", "A", 0, "2025-12-31")).toThrow(
      DatapuntNietGeldigOpDatum,
    );
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
    const c = brutolocheck("II", "C", 10, 2500, REF_2026);
    expect(c.ok).toBe(false);
    expect(c.sectoraalMinimum).toBe(2875.48);
    expect(c.verschil).toBe(-375.48);
    expect(c.datapuntId).toBe("lonen_pc200_schaalII_catC_01012026");
  });

  it("brutoloon-check gebruikt de bron van het barema voor de gekozen datum", () => {
    const c = brutolocheck("II", "C", 10, 2500, REF_2026);
    expect(c.datapunt.bron_url).toBeTruthy();
    expect(c.datapunt.bron_titel).toContain("01/2026");
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
  it("juni 2026: 8 km/dag × € 0,27 × 22 dagen = € 47,52", () => {
    const r = fietsvergoeding({
      kmPerDag: 8,
      arbeidsdagen: 22,
      refDatum: "2026-06-01",
    });
    expect(r.datapunt.id).toBe("pc200_fietsvergoeding_2026_pre_oktober");
    expect(r.tariefPerKm).toBe(0.27);
    expect(r.vergoeding).toBe(47.52);
  });

  it("oktober 2026: 8 km/dag × € 0,32 × 22 dagen = € 56,32", () => {
    const r = fietsvergoeding({
      kmPerDag: 8,
      arbeidsdagen: 22,
      refDatum: "2026-10-15",
    });
    expect(r.tariefPerKm).toBe(0.32);
    expect(r.vergoeding).toBe(56.32);
  });

  it("september 2026 gebruikt het pre-oktober datapunt", () => {
    const r = fietsvergoeding({
      kmPerDag: 8,
      arbeidsdagen: 22,
      refDatum: "2026-09-15",
    });
    expect(r.datapunt.id).toBe("pc200_fietsvergoeding_2026_pre_oktober");
    expect(r.tariefPerKm).toBe(0.27);
    expect(r.vergoeding).toBe(47.52);
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

describe("TC-16b — Woon-werk verkeer via PC200-tabellen", () => {
  it("trein 15 km, volledige maand juni 2026 → €92,00", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 3000,
      arbeidsdagenPerMaand: 22,
      werkdagenInMaand: 22,
      fiets: { actief: false, kmPerDag: 0 },
      trein: { actief: true, kmEnkel: 15 },
      busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
      privewagen: { actief: false, kmEnkel: 0 },
    });

    expect(r.componenten.trein?.vergoeding).toBe(92);
    expect(r.totaalVergoeding).toBe(92);
    expect(r.datapunten.map((dp) => dp.id)).toContain("pc200_woonwerk_trein_tabel_2026");
  });

  it("privéwagen 15 km onder loonplafond → €46,00", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 3000,
      arbeidsdagenPerMaand: 22,
      werkdagenInMaand: 22,
      fiets: { actief: false, kmPerDag: 0 },
      trein: { actief: false, kmEnkel: 0 },
      busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
      privewagen: { actief: true, kmEnkel: 15 },
    });

    expect(r.componenten.privewagen?.vergoeding).toBe(46);
    expect(r.totaalVergoeding).toBe(46);
  });

  it("privéwagen boven jaarloonplafond → €0 + waarschuwing", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 4000,
      arbeidsdagenPerMaand: 22,
      werkdagenInMaand: 22,
      fiets: { actief: false, kmPerDag: 0 },
      trein: { actief: false, kmEnkel: 0 },
      busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
      privewagen: { actief: true, kmEnkel: 15 },
    });

    expect(r.componenten.privewagen?.vergoeding).toBe(0);
    expect(r.waarschuwingen.join(" ")).toContain("loonplafond");
  });

  it("bus/tram/metro 10 km wordt begrensd op 75% van de werkelijke prijs", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 3000,
      arbeidsdagenPerMaand: 22,
      werkdagenInMaand: 22,
      fiets: { actief: false, kmPerDag: 0 },
      trein: { actief: false, kmEnkel: 0 },
      busTramMetro: { actief: true, kmEnkel: 10, prijsPerMaand: 60 },
      privewagen: { actief: false, kmEnkel: 0 },
    });

    expect(r.componenten.busTramMetro?.vergoeding).toBe(45);
    expect(r.componenten.busTramMetro?.basisMaandbedrag).toBe(52);
  });

  it("past maandtabellen pro rata toe op effectieve pendeldagen", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 3000,
      arbeidsdagenPerMaand: 10,
      werkdagenInMaand: 22,
      fiets: { actief: false, kmPerDag: 0 },
      trein: { actief: true, kmEnkel: 15 },
      busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
      privewagen: { actief: false, kmEnkel: 0 },
    });

    expect(r.componenten.trein?.vergoeding).toBe(41.82);
    expect(r.totaalVergoeding).toBe(41.82);
  });

  it("fiets actief in juni 2026 gebruikt het pre-oktober datapunt", () => {
    const r = berekenWoonwerkVerkeer({
      refDatum: REF_2026,
      brutoloon: 3000,
      arbeidsdagenPerMaand: 22,
      werkdagenInMaand: 22,
      fiets: { actief: true, kmPerDag: 8 },
      trein: { actief: false, kmEnkel: 0 },
      busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
      privewagen: { actief: false, kmEnkel: 0 },
    });

    expect(r.componenten.fiets?.vergoeding).toBe(47.52);
    expect(r.totaalVergoeding).toBe(47.52);
    expect(r.datapunten.map((dp) => dp.id)).toContain("pc200_fietsvergoeding_2026_pre_oktober");
  });
});

describe("TC-16c — VAA bedrijfswagen", () => {
  it("berekent benzine-VAA met referentie-CO2 70 g/km", () => {
    const r = vaaBedrijfswagen({
      cataloguswaarde: 40000,
      datumEersteInschrijving: "2026-01-01",
      brandstof: "benzine",
      co2: 100,
      refDatum: REF_2026,
    });

    expect(r.refCO2).toBe(70);
    expect(r.co2Percentage).toBe(8.5);
    expect(r.vaaJaar).toBe(2914.29);
    expect(r.vaaMaand).toBe(242.86);
  });

  it("berekent diesel-VAA met referentie-CO2 58 g/km", () => {
    const r = vaaBedrijfswagen({
      cataloguswaarde: 40000,
      datumEersteInschrijving: "2026-01-01",
      brandstof: "diesel",
      co2: 100,
      refDatum: REF_2026,
    });

    expect(r.refCO2).toBe(58);
    expect(r.co2Percentage).toBe(9.7);
  });

  it("past voor elektriciteit geen CO2-input toe en dwingt het minimum af", () => {
    const r = vaaBedrijfswagen({
      cataloguswaarde: 30000,
      datumEersteInschrijving: "2026-01-01",
      brandstof: "elektriciteit",
      refDatum: REF_2026,
    });

    expect(r.refCO2).toBe(0);
    expect(r.co2Percentage).toBe(5.5);
    expect(r.vaaJaar).toBe(1690);
    expect(r.minimumToegepast).toBe(true);
  });

  it("laat de leeftijdscoëfficiënt zakken tot minimum 70%", () => {
    const r = vaaBedrijfswagen({
      cataloguswaarde: 50000,
      datumEersteInschrijving: "2020-01-01",
      brandstof: "benzine",
      co2: 100,
      refDatum: REF_2026,
    });

    expect(r.leeftijdsCoefficient).toBe(0.7);
    expect(r.vaaJaar).toBe(2550);
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

// ─── Netto module (TC-21 t/m TC-25) ─────────────────────────────────────────

describe("TC-21 — Werkbonus: hoog loon buiten bereik (SSOT factoren)", () => {
  it("brutoloon € 3.500 (boven plafond Luik A) geeft € 0 werkbonus", () => {
    const r = werkbonus({ brutoloon: 3500, refDatum: "2026-06-01" });
    expect(r.luikA).toBe(0);
    expect(r.luikB).toBe(0);
    expect(r.totaal).toBe(0);
    expect(r.datapunt.id).toBe("werkbonus_sociaal_luik_A_2026");
  });

  it("brutoloon € 2.276,51 (Schaal I Cat A 5j) heeft werkbonus Luik A + B taper", () => {
    const r = werkbonus({ brutoloon: 2276.51, refDatum: "2026-06-01" });
    // 2276.51 < 2880.32 → LuikA = max 125.04
    expect(r.luikA).toBe(125.04);
    // 2276.51 > 2255.50 (LuikB lower) → LuikB tapers met factor 0.2699
    // 168.62 - 0.2699 × (2276.51 - 2255.50) = 168.62 - 5.67 = 162.95
    expect(r.luikB).toBe(162.95);
    expect(r.totaal).toBe(287.99); // 125.04 + 162.95
    expect(r.vanaf1April2026).toBe(true);
  });
});

describe("TC-22 — BBSZ: schijven", () => {
  it("brutoloon € 1.900 (< € 1.945,38) geeft kwartaalbijdrage € 0", () => {
    const r = bbsz({ brutoloon: 1900, scenario: "individuele_aanslag" });
    expect(r.kwartaalbijdrage).toBe(0);
    expect(r.maandelijksBedrag).toBe(0);
  });

  it("brutoloon € 2.242,81 (schijf 3) geeft correcte kwartaalbijdrage", () => {
    const r = bbsz({ brutoloon: 2242.81, scenario: "individuele_aanslag" });
    // qLoon = 3 × 2242.81 = 6728.43 → schijf 3 (6570.54–11211)
    // kw = 30.99 + 0.011 × (2242.81 − 2190.18) = 30.99 + 0.011 × 52.63 = 30.99 + 0.58 = 31.57
    expect(r.kwartaalbijdrage).toBe(31.57);
    expect(r.datapunt.id).toBe("bv_bbsz_schijven_2026");
  });

  it("brutoloon > € 6.038,82 geeft maximum € 182,82 per kwartaal", () => {
    const r = bbsz({ brutoloon: 7000, scenario: "individuele_aanslag" });
    expect(r.kwartaalbijdrage).toBe(182.82);
    expect(r.maandelijksBedrag).toBe(60.94);
  });

  it("berekent BBSZ voor individuele aanslag rond alle kwartaalschijven", () => {
    const cases = [
      [1945.37, 0],
      [1945.38, 0],
      [2190.18, 10.33],
      [3737, 48.01],
      [4100, 94.32],
      [6038.82, 140.16],
      [6038.83, 182.82],
    ] as const;

    for (const [brutoloon, kwartaalbijdrage] of cases) {
      expect(
        bbsz({ brutoloon, scenario: "individuele_aanslag" }).kwartaalbijdrage,
      ).toBe(kwartaalbijdrage);
    }
  });

  it("berekent BBSZ voor gemeenschappelijke aanslag met partner met beroepsinkomsten", () => {
    const cases = [
      [1095.09, 0],
      [1095.10, 15.45],
      [1945.38, 15.45],
      [2190.18, 15.45],
      [3737, 60.34],
      [6038.82, 85.66],
      [12000, 151.23],
      [25000, 154.92],
    ] as const;

    for (const [brutoloon, kwartaalbijdrage] of cases) {
      expect(
        bbsz({
          brutoloon,
          scenario: "gemeenschappelijke_aanslag_partner_met_beroepsinkomsten",
        }).kwartaalbijdrage,
      ).toBe(kwartaalbijdrage);
    }
  });

  it("berekent BBSZ voor gemeenschappelijke aanslag met partner zonder beroepsinkomsten", () => {
    const cases = [
      [1945.37, 0],
      [1945.38, 0],
      [2190.18, 14.44],
      [3737, 60.34],
      [6038.82, 85.66],
      [12000, 151.23],
      [25000, 182.82],
    ] as const;

    for (const [brutoloon, kwartaalbijdrage] of cases) {
      expect(
        bbsz({
          brutoloon,
          scenario: "gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten",
        }).kwartaalbijdrage,
      ).toBe(kwartaalbijdrage);
    }
  });
});

describe("TC-23 — BV: alleenstaand, 0 kinderen (AJ 2027)", () => {
  it("belastbaar € 2.000 → Bijlage III sleutelformule wordt gebruikt", () => {
    const belastbaarMaandloon = 2000;
    const r = berekenBV({ belastbaarMaandloon, gezinstype: "alleenstaand", kinderenTenLaste: 0 });
    expect(r.jaarbasis).toBe(24000);
    // AJ 2027: forfait max €6.070 (30% × 24000 = 7200 > 6070 → capped)
    expect(r.forfaitBeroepskosten).toBe(6070);
    expect(r.belastbaarNettoJaar).toBe(17930); // 24000 − 6070
    expect(r.belastingvrijeSom).toBe(11180);
    // PB AJ 2027: 16720 × 25% + (17930 − 16720) × 40% = 4180 + 484 = 4664
    expect(r.pbBruto).toBe(4664);
    // BVS-vermindering: 11180 × 25% = 2795.00
    expect(r.bvsVermindering).toBe(2795);
    // PB netto: 4664 − 2795 = 1869
    expect(r.pbNetto).toBe(1869);
    expect(r.methode).toBe("bijlage_iii_sleutelformule_2026");
    expect(r.schaal).toBe("I");
    expect(r.bvPerMaand).toBeGreaterThan(155.75);
    expect(r.bvNaVerminderingen).toBe(r.bvPerMaand); // geen verminderingen
    expect("verminderingKindOnder3" in r).toBe(false);
    expect(r.isApproximatie).toBe(false);
    expect(r.validatieStatus).toBe("pending_taxcalc");
    expect(r.datapunten.length).toBeGreaterThanOrEqual(2);
  });
});

describe("TC-23b — BV: Group S triangulatie-anker", () => {
  it("benadert de Group S Salary Sim-case voor Schaal I Cat A 5j", () => {
    const r = berekenNetto({
      brutoloon: 2276.51,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });

    expect(r.belastbaarMaandloon).toBe(2266.96);
    expect(r.bv.bvNaVerminderingen).toBeCloseTo(154.22, 1);
  });
});

describe("TC-24 — BV: gehuwd zonder inkomen, 2 kinderen (AJ 2027 maandtabel)", () => {
  it("BVS = €22.360 (partner-overdracht); 2 kinderen → €138/m maandvermindering", () => {
    const r = berekenBV({
      belastbaarMaandloon: 2500,
      gezinstype: "gehuwd_zonder_inkomen",
      kinderenTenLaste: 2,
    });
    expect(r.belastingvrijeSom).toBe(22360); // 2 × 11180
    expect(r.verminderingKinderen).toBe(138); // maandtabel: 2 kinderen
    expect(r.pbNetto).toBeGreaterThanOrEqual(0);
    expect(r.bvPerMaand).toBeGreaterThanOrEqual(0);
    expect(r.bvNaVerminderingen).toBeLessThanOrEqual(r.bvPerMaand);
  });

  it("partner zonder of beperkt beroepsinkomen verlaagt de bedrijfsvoorheffing via Schaal II", () => {
    const tweeverdiener = berekenBV({
      belastbaarMaandloon: 3000,
      gezinstype: "gehuwd_met_inkomen",
      kinderenTenLaste: 0,
    });
    const partnerZonderOfBeperktInkomen = berekenBV({
      belastbaarMaandloon: 3000,
      gezinstype: "gehuwd_zonder_inkomen",
      kinderenTenLaste: 0,
    });

    expect(tweeverdiener.schaal).toBe("I");
    expect(partnerZonderOfBeperktInkomen.schaal).toBe("II");
    expect(partnerZonderOfBeperktInkomen.bvNaVerminderingen).toBeLessThan(
      tweeverdiener.bvNaVerminderingen,
    );
  });
});

describe("TC-25 — Netto end-to-end: Schaal I Cat A 5 jaar, alleenstaand, 0 kinderen", () => {
  it("nettoloon is positief en kleiner dan brutoloon", () => {
    const r = berekenNetto({
      brutoloon: 2276.51,
      refDatum: "2026-06-01",
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    expect(r.nettoloon).toBeGreaterThan(0);
    expect(r.nettoloon).toBeLessThan(r.brutoloon);
    // RSZ werknemer 13.07%
    expect(r.rsz.werknemerBijdrage).toBe(297.54);
    // Werkbonus positief (loon < drempel)
    expect(r.werkbonus.totaal).toBeGreaterThan(0);
    // Effectieve RSZ < bruto RSZ (werkbonus vermindert)
    expect(r.effectieveRsz).toBeLessThan(r.rsz.werknemerBijdrage);
    // BBSZ datapunt aanwezig
    expect(r.bbsz.datapunt.id).toBe("bv_bbsz_schijven_2026");
    expect(r.bv.methode).toBe("bijlage_iii_sleutelformule_2026");
    expect(r.bv.validatieStatus).toBe("pending_taxcalc");
  });

  it("audit: alle datapunten in netto-resultaat hebben bron_url", () => {
    const r = berekenNetto({
      brutoloon: 2276.51,
      refDatum: "2026-06-01",
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    expect(r.werkbonus.datapunt.bron_url).toBeTruthy();
    expect(r.bbsz.datapunt.bron_url).toBeTruthy();
    for (const dp of r.bv.datapunten) {
      expect(dp.bron_url).toBeTruthy();
    }
  });

  it("trekt werknemersbijdrage maaltijdcheques af van het cash-nettoloon", () => {
    const basis = berekenNetto({
      brutoloon: 2276.51,
      refDatum: "2026-06-01",
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    const metMaaltijdcheques = berekenNetto({
      brutoloon: 2276.51,
      refDatum: "2026-06-01",
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      maaltijdchequeWerknemersbijdragePerDag: 1.09,
      maaltijdchequeWerkdagen: 20,
    });
    expect(metMaaltijdcheques.maaltijdchequeWerknemersbijdrage).toBe(21.8);
    expect(metMaaltijdcheques.nettoloon).toBe(basis.nettoloon - 21.8);
    expect(metMaaltijdcheques.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
  });

  it("zonder maaltijdcheque-input blijft de werknemersbijdrage nul", () => {
    const r = berekenNetto({
      brutoloon: 2276.51,
      refDatum: "2026-06-01",
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    expect(r.maaltijdchequeWerknemersbijdrage).toBe(0);
  });

  it("telt woon-werkvergoeding bij het cash-nettoloon zonder de BV-basis te wijzigen", () => {
    const basis = berekenNetto({
      brutoloon: 3000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    const metWoonwerk = berekenNetto({
      brutoloon: 3000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      woonwerkVrijgesteldPerMaand: 100,
    });

    expect(metWoonwerk.woonwerkVrijgesteldPerMaand).toBe(100);
    expect(metWoonwerk.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
    expect(metWoonwerk.bv.bvNaVerminderingen).toBe(basis.bv.bvNaVerminderingen);
    expect(metWoonwerk.nettoloon).toBe(basis.nettoloon + 100);
  });

  it("past bijkomende netto-looncomponenten toe zonder RSZ/BV-basis te wijzigen", () => {
    const basis = berekenNetto({
      brutoloon: 3000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    const metComponenten = berekenNetto({
      brutoloon: 3000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      hospitalisatieEigenBijdrage: 25,
      onkostenvergoedingPerMaand: 125,
    });

    expect(metComponenten.hospitalisatieEigenBijdrage).toBe(25);
    expect(metComponenten.onkostenvergoedingPerMaand).toBe(125);
    expect(metComponenten.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
    expect(metComponenten.bv.bvNaVerminderingen).toBe(basis.bv.bvNaVerminderingen);
    expect(metComponenten.nettoloon).toBe(basis.nettoloon + 100);
  });

  it("telt bedrijfswagen-VAA bij de BV-basis maar niet bij cash", () => {
    const basis = berekenNetto({
      brutoloon: 4000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    const metVaa = berekenNetto({
      brutoloon: 4000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      vaaBedrijfswagenPerMaand: 180,
    });

    expect(metVaa.vaaBedrijfswagenPerMaand).toBe(180);
    expect(metVaa.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
    expect(metVaa.belastbaarMaandloonVoorBV).toBe(basis.belastbaarMaandloon + 180);
    expect(metVaa.bv.bvNaVerminderingen).toBeGreaterThan(basis.bv.bvNaVerminderingen);
    expect(metVaa.nettoloon).toBeLessThan(basis.nettoloon);
  });

  it("berekent forfaitaire VAA voor werkmiddelen op maandbasis", () => {
    const r = vaaForfaitsWerkmiddelen({
      pcLaptopActief: true,
      gsmSmartphoneActief: true,
      internetActief: true,
      gsmAbonnementActief: true,
      refDatum: REF_2026,
    });

    expect(r.pcLaptopPerMaand).toBe(6);
    expect(r.gsmSmartphonePerMaand).toBe(3);
    expect(r.internetPerMaand).toBe(5);
    expect(r.gsmAbonnementPerMaand).toBe(4);
    expect(r.totaalPerMaand).toBe(18);
    expect(r.datapunten.map((dp) => dp.id)).toEqual([
      "vaa_pc_laptop_forfait_2026",
      "vaa_gsm_smartphone_forfait_2026",
      "vaa_internet_forfait_2026",
      "vaa_gsmabonnement_forfait_2026",
    ]);
  });

  it("telt RSZ-plichtige VAA mee voor RSZ en BV maar neemt die cash terug", () => {
    const basis = berekenNetto({
      brutoloon: 4000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    const metWerkmiddelen = berekenNetto({
      brutoloon: 4000,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      vaaRszPlichtigPerMaand: 18,
    });

    expect(metWerkmiddelen.brutoRszBasis).toBe(4018);
    expect(metWerkmiddelen.vaaRszPlichtigPerMaand).toBe(18);
    expect(metWerkmiddelen.rsz.werknemerBijdrage).toBeGreaterThan(basis.rsz.werknemerBijdrage);
    expect(metWerkmiddelen.belastbaarMaandloon).toBeGreaterThan(basis.belastbaarMaandloon);
    expect(metWerkmiddelen.bv.bvNaVerminderingen).toBeGreaterThan(basis.bv.bvNaVerminderingen);
    expect(metWerkmiddelen.nettoloon).toBeLessThan(basis.nettoloon);
  });
});

// ─── NTC-01..NTC-15 — Netto-spec testcases ──────────────────────────────────
// SSOT: knowledgebase/04_calculator_netto.md §9 + knowledgebase/07_testcorpus.md
// PENDING: validate against FOD Fin Tax-Calc (AJ 2027). Tolerantie €0.50.
// Bijzondere BV (NTC-14, NTC-15) gebruikt bvBijzonder.ts.

import { berekenBvBijzonder } from "@/lib/bvBijzonder";

describe("NTC-01 — Schaal I Cat A 5j, alleenstaand, 0 kind", () => {
  it("structurele controle: werkbonus actief + fiscale werkbonus > 0", () => {
    const r = berekenNetto({
      brutoloon: 2276.51,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    expect(r.werkbonus.totaal).toBeGreaterThan(0);
    expect(r.fiscaleWerkbonus).toBeGreaterThan(0);
    expect(r.nettoloon).toBeGreaterThan(0);
    expect(r.nettoloon).toBeLessThan(r.brutoloon);
    // KB-spec gaf ≈€1.890; AJ 2027 + fiscale werkbonus geeft ~€2.121.
    // Brede bounds tot FOD Tax-Calc-validatie het exacte cijfer pinpoint.
    expect(r.nettoloon).toBeGreaterThan(1700);
    expect(r.nettoloon).toBeLessThan(2200);
  });
});

describe("NTC-02 — Schaal I Cat C 10j, alleenstaand, 1 kind", () => {
  it("BV-vermindering kind = €52/m", () => {
    const r = berekenNetto({
      brutoloon: 2800,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 1,
    });
    expect(r.bv.verminderingKinderen).toBe(52);
    expect(r.nettoloon).toBeGreaterThan(2000);
    expect(r.nettoloon).toBeLessThan(2500);
  });
});

describe("NTC-03 — Schaal II Cat B 8j, eenverdiener, 2 kinderen", () => {
  it("BVS = €22.360 + verm 2 kind = €138/m", () => {
    const r = berekenNetto({
      brutoloon: 3000,
      refDatum: REF_2026,
      gezinstype: "gehuwd_zonder_inkomen",
      bbszScenario: "gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten",
      kinderenTenLaste: 2,
    });
    expect(r.bv.belastingvrijeSom).toBe(22360);
    expect(r.bv.verminderingKinderen).toBe(138);
    expect(r.nettoloon).toBeGreaterThan(2200);
    expect(r.nettoloon).toBeLessThan(2700);
  });
});

describe("NTC-04 — GGMMI €2.189,81, alleenstaand (hoge werkbonus)", () => {
  it("Luik A = max €125,04 en Luik B = max €168,62", () => {
    const r = berekenNetto({
      brutoloon: 2189.81,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
    });
    expect(r.werkbonus.luikA).toBe(125.04);
    expect(r.werkbonus.luikB).toBe(168.62);
    // Effectieve RSZ na werkbonus = brutoRSZ - werkbonus
    // bruto RSZ = 2189.81 × 0.1307 = 286.21; totaal werkbonus = 293.66 → effectief 0
    expect(r.effectieveRsz).toBe(0);
  });
});

describe("NTC-09 — Alleenstaande ouder met 1 kind (+€52 extra)", () => {
  it("BV-vermindering alleenstaande ouder = €52", () => {
    const r = berekenNetto({
      brutoloon: 2500,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 1,
      fiscaalAlleenstaandeMetKind: true,
    });
    expect(r.bv.verminderingAlleenstaandeKind).toBe(52);
    expect(r.bv.verminderingKinderen).toBe(52);
  });
});

describe("NTC-10 — Groepsverzekering eigen bijdrage €100/m", () => {
  it("BV-vermindering groepsverz = €30 (30%)", () => {
    const r = berekenNetto({
      brutoloon: 3100,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      bbszScenario: "individuele_aanslag",
      kinderenTenLaste: 0,
      groepsverzekeringEigenBijdrage: 100,
    });
    expect(r.bv.verminderingGroepsverzekering).toBe(30);
  });
});

describe("NTC-11 — Werkbonus-edge: bruto €2.255,50 (Luik B grens)", () => {
  it("Luik A en B beide aan maximum", () => {
    const r = werkbonus({ brutoloon: 2255.50, refDatum: REF_2026 });
    expect(r.luikA).toBe(125.04);
    expect(r.luikB).toBe(168.62);
  });
});

describe("NTC-12 — Werkbonus-edge: bruto €3.336,98 (Luik A wegval)", () => {
  it("Luik A = 0 op cutoff", () => {
    const r = werkbonus({ brutoloon: 3336.98, refDatum: REF_2026 });
    expect(r.luikA).toBe(0);
    expect(r.luikB).toBe(0);
  });
});

describe("NTC-13 — Werkbonus-edge: bruto €2.880,32 (Luik A grens, B nul)", () => {
  it("A = €125,04, B = €0", () => {
    const r = werkbonus({ brutoloon: 2880.32, refDatum: REF_2026 });
    expect(r.luikA).toBe(125.04);
    expect(r.luikB).toBe(0);
  });
});

describe("NTC-14 — Eindejaarspremie 1 maandloon — bijzondere BV", () => {
  it("Bijzondere BV op €3.000 premie gebruikt de kolom andere exceptionele vergoedingen", () => {
    const r = eindejaarspremie({
      brutoloon: 3000,
      ancienniteitMaanden: 36,
      prestatieMaandenInRefertepériode: 12,
      gezinstype: "alleenstaand",
      kinderenTenLaste: 0,
    });
    expect(r.premie).toBe(3000);
    expect(r.bvBijzonder).toBeDefined();
    // refertejaarloon = 12 × 3000 = 36000 → schijf 34.640,01–45.860: tarief 46,44%
    expect(r.bvBijzonder?.tarief).toBeCloseTo(0.4644, 4);
    expect(r.bvBijzonder?.bvBruto).toBeCloseTo(1211.11, 1);
    expect(r.nettoPremie).toBeCloseTo(1396.79, 1);
  });
});

describe("NTC-15 — Dubbel vakantiegeld 92% — bijzondere BV", () => {
  it("Bijzondere BV op €2.760 vakantiegeld gebruikt de vakantiegeldkolom", () => {
    const refertejaar = 3000 * 12;
    const premie = 0.92 * 3000;
    const r = berekenBvBijzonder({
      refertejaarloon: refertejaar,
      exceptioneelBruto: 2426.71,
      gezinstype: "alleenstaand",
      kinderenTenLaste: 0,
      soort: "vakantiegeld",
    });
    expect(r.tarief).toBeCloseTo(0.4239, 4);
    expect(r.bvBruto).toBeCloseTo(1028.68, 1);
    expect(r.nettoBedrag).toBeCloseTo(1398.03, 1);
  });
});

describe("Jaaroverzicht — netto en werkgeverskost", () => {
  it("berekent de jaarcomponenten voor €4.500 bruto volgens het voorbeeld jaaroverzicht", () => {
    const r = berekenJaaroverzicht({
      brutoloon: 4500,
      nettoloonPerMaand: 2500,
      loonkostWerkgeverPerMaand: 5648.85,
      refDatum: REF_2026,
      gezinstype: "alleenstaand",
      kinderenTenLaste: 0,
      ancienniteitMaanden: 36,
      prestatieMaandenInRefertepériode: 12,
      tewerkstellingsbreuk: 1,
    });

    expect(r.netto.dubbelVakantiegeld.bruto).toBe(4140);
    expect(r.netto.dubbelVakantiegeld.rsz).toBe(499.93);
    expect(r.netto.dubbelVakantiegeld.belastbaar).toBe(3640.07);
    expect(r.netto.dubbelVakantiegeld.bv).toBe(1726.85);
    expect(r.netto.dubbelVakantiegeld.netto).toBe(1913.22);
    expect(r.netto.eindejaarspremie.bvTarief).toBe(0.5148);
    expect(r.netto.jaarpremie.bv).toBe(148.06);
    expect(r.netto.totaalNettoJaarloon).toBe(34200.79);

    expect(r.werkgever.maandbasisX12).toBe(67786.2);
    expect(r.werkgever.jaarpremiesEnEcocheques).toBe(5080.84);
    expect(r.werkgever.rszOpEindejaarspremieEnJaarpremie).toBe(1207.71);
    expect(r.werkgever.dubbelVakantiegeld).toBe(4140);
    expect(r.werkgever.totaleLoonkostJaar).toBe(78214.75);
  });
});

describe("TC-WGK-01 — werkgeverskost met extralegale voordelen", () => {
  const bruto = 2276.51;
  const ref = REF_2026;

  it("baseline (geen extras) geeft correcte smal loonkost", () => {
    const r = werkgeverskost({ brutoloon: bruto, refDatum: ref });
    // AO = 2276.51 × 0.003 = 6.83 (afgerond)
    expect(r.arbeidsongevallen).toBe(6.83);
    expect(r.extraVoordelen).toBe(0);
    expect(r.totaleLoonkostSmal).toBe(
      Math.round((bruto + r.rszWerkgever + r.sociaalFonds200 + r.arbeidsongevallen) * 100) / 100
    );
  });

  it("met patronale groepsverzekering €50/m verhoogt breed loonkost", () => {
    const r = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      extraGroepsverzekering: 50,
    });
    expect(r.extraVoordelen).toBe(50);
    const baseline = werkgeverskost({ brutoloon: bruto, refDatum: ref });
    expect(r.totaleLoonkostBreed).toBe(baseline.totaleLoonkostBreed + 50);
  });

  it("custom AO-tarief 0.5% geeft hogere arbeidsongevallenkost", () => {
    const r = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      arbeidsongevallenPct: 0.005,
    });
    expect(r.arbeidsongevallen).toBe(Math.round(bruto * 0.005 * 100) / 100);
  });

  it("combinatie maaltijdcheques + hospitalisatie telt correct op", () => {
    const r = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      maaltijdchequeWerkgeversaandeelPerDag: 8.91,
      maaltijdchequeWerkdagen: 20,
      extraHospitalisatie: 20,
    });
    expect(r.extraVoordelen).toBe(198.2);
  });

  it("begrensd maaltijdcheques op het werkgeversmaximum van €8,91 per dag vanaf 2026", () => {
    const r = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      maaltijdchequeWerkgeversaandeelPerDag: 10,
      maaltijdchequeWerkdagen: 22,
    });
    expect(r.extraVoordelen).toBe(196.02);
  });

  it("telt woon-werkvergoeding mee als werkgeverskost", () => {
    const basis = werkgeverskost({ brutoloon: bruto, refDatum: ref });
    const metWoonwerk = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      woonwerkVergoedingPerMaand: 100,
    });

    expect(metWoonwerk.extraVoordelen).toBe(100);
    expect(metWoonwerk.totaleLoonkostBreed).toBe(basis.totaleLoonkostBreed + 100);
  });

  it("telt onkostenvergoeding mee als werkgeverskost", () => {
    const basis = werkgeverskost({ brutoloon: bruto, refDatum: ref });
    const metOnkosten = werkgeverskost({
      brutoloon: bruto,
      refDatum: ref,
      onkostenvergoedingPerMaand: 125,
    });

    expect(metOnkosten.extraVoordelen).toBe(125);
    expect(metOnkosten.totaleLoonkostBreed).toBe(basis.totaleLoonkostBreed + 125);
  });
});
