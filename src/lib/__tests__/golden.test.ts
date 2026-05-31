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
import { berekenWoonwerkVrijgesteld } from "@/lib/profielBerekeningen";
import { vaaBedrijfswagen } from "@/lib/vaaBedrijfswagen";
import { vaaForfaitsWerkmiddelen } from "@/lib/vaaForfaits";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { berekenJaaroverzicht } from "@/lib/jaaroverzicht";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import { werkgeverskost } from "@/lib/werkgeverskost";
import { BaremaBuitenSchaalError, DatapuntNietGeldigOpDatum, } from "@/lib/errors";
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
        expect("sociaalFonds200" in r).toBe(false);
    });
    it("brutoloon-check OK bij gelijk-aan-minimum", () => {
        const c = brutolocheck("I", "A", 0, 2242.81, REF_2026);
        expect(c.ok).toBe(true);
        expect(c.verschil).toBe(0);
    });
    it("weigert barema lookup wanneer het gekozen jaar buiten de geldigheidsperiode valt", () => {
        expect(() => lookupBarema("I", "A", 0, "2025-12-31")).toThrow(DatapuntNietGeldigOpDatum);
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
        expect("sociaalFonds200" in r).toBe(false);
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
        expect(r.werknemerBijdrage).toBe(375.83);
        expect(r.werkgeverBasisbijdrage).toBe(718.87);
        expect("sociaalFonds200" in r).toBe(false);
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
    it("brutoloon-check rekent deeltijds bruto om naar voltijds equivalent", () => {
        const c = brutolocheck("II", "C", 10, 2300.38, REF_2026, 0.8);
        expect(c.ok).toBe(true);
        expect(c.vergelijkingsbasis).toBe("deeltijds_omgerekend");
        expect(c.sectoraalMinimum).toBe(2875.48);
        expect(c.proRataMinimum).toBe(2300.38);
        expect(c.voltijdsEquivalentBruto).toBe(2875.48);
        expect(c.verschil).toBe(0);
    });
    it("brutoloon-check meldt deeltijds tekort op voltijdse vergelijkingsbasis", () => {
        const c = brutolocheck("II", "C", 10, 2200, REF_2026, 0.8);
        expect(c.ok).toBe(false);
        expect(c.vergelijkingsbasis).toBe("deeltijds_omgerekend");
        expect(c.proRataMinimum).toBe(2300.38);
        expect(c.voltijdsEquivalentBruto).toBe(2750);
        expect(c.verschil).toBe(-125.48);
    });
});
describe("TC-08 — Bouw-subset", () => {
    it("rekent geen aparte bouw-pensioenbijdrage meer bovenop de werkgevers-RSZ", () => {
        const r = rszBijdragen({
            brutoloon: 2350,
            refDatum: REF_2026,
            bouwVlag: true,
        });
        expect(r.werknemerBijdrage).toBe(307.15);
        expect(r.werkgeverBasisbijdrage).toBe(587.50);
        expect("sociaalFonds200" in r).toBe(false);
        expect(r.bouwAanvullendPensioen).toBeNull();
        expect(r.totaalWerkgever).toBe(587.50);
        expect(r.bronnen.map((b) => b.label)).not.toContain("Sociaal Fonds 200");
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
    it("rekent op de sectorale jaarpremie werknemers-RSZ en exceptionele bedrijfsvoorheffing", () => {
        const r = jaarlijksePremie2026({
            refDatum: REF_2026,
            brutomaandloon: 5800,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.bvBijzonder?.tarief).toBe(0.535);
        expect(r.bvBijzonder?.bvNetto).toBe(153.87);
        expect(r.nettoBedrag).toBe(133.73);
    });
});
describe("TC-12 — Eindejaarspremie pure pro-rata functie", () => {
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
    it("privéwagen 15 km onder loonplafond → maandbedrag pro rata via 21,67 werkdagen", () => {
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
        expect(r.componenten.privewagen?.basisMaandbedrag).toBe(46);
        expect(r.componenten.privewagen?.vergoeding).toBe(46.7);
        expect(r.totaalVergoeding).toBe(46.7);
    });
    it("privéwagen 3 km gebruikt €23,75 maandbedrag pro rata via 21,67 werkdagen", () => {
        const r = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 10,
            werkdagenInMaand: 22,
            fiets: { actief: false, kmPerDag: 0 },
            trein: { actief: false, kmEnkel: 0 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 3 },
        });
        expect(r.componenten.privewagen?.basisMaandbedrag).toBe(23.75);
        expect(r.componenten.privewagen?.vergoeding).toBe(10.96);
        expect(r.totaalVergoeding).toBe(10.96);
    });
    it("privéwagen 3 km en trein 15 km tellen samen als aparte trajectdelen", () => {
        const r = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 10,
            werkdagenInMaand: 22,
            fiets: { actief: false, kmPerDag: 0 },
            trein: { actief: true, kmEnkel: 15 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 3 },
        });
        expect(r.componenten.trein?.vergoeding).toBe(41.82);
        expect(r.componenten.privewagen?.vergoeding).toBe(10.96);
        expect(r.totaalVergoeding).toBe(52.78);
        expect(r.waarschuwingen).toEqual([]);
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
    it("fiets en privéwagen blijven niet combineerbaar", () => {
        const r = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 10,
            werkdagenInMaand: 22,
            fiets: { actief: true, kmPerDag: 8 },
            trein: { actief: false, kmEnkel: 0 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 3 },
        });
        expect(r.componenten.fiets?.vergoeding).toBe(21.6);
        expect(r.componenten.privewagen?.vergoeding).toBe(0);
        expect(r.totaalVergoeding).toBe(21.6);
        expect(r.waarschuwingen.join(" ")).toContain("niet combineerbaar met fiets");
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
    it("past voor elektriciteit vast CO₂-percentage 4% toe (FOD-minimum)", () => {
        const r = vaaBedrijfswagen({
            cataloguswaarde: 30000,
            datumEersteInschrijving: "2026-01-01",
            brandstof: "elektriciteit",
            refDatum: REF_2026,
        });
        expect(r.co2Percentage).toBe(4);
        expect(r.vaaJaar).toBe(1690);
        expect(r.minimumToegepast).toBe(true);
    });
    it("berekent elektrisch-VAA zonder minimum voor hoge cataloguswaarde", () => {
        const r = vaaBedrijfswagen({
            cataloguswaarde: 100000,
            datumEersteInschrijving: "2026-01-01",
            brandstof: "elektriciteit",
            refDatum: REF_2026,
        });
        expect(r.co2Percentage).toBe(4);
        expect(r.leeftijdsCoefficient).toBe(1);
        expect(r.vaaJaar).toBe(3428.57);
        expect(r.minimumToegepast).toBe(false);
    });
    it("berekent elektrisch-VAA met leeftijdscorrectie en minimum (issue 2026-05-30)", () => {
        const r = vaaBedrijfswagen({
            cataloguswaarde: 54450,
            datumEersteInschrijving: "2023-09-28",
            brandstof: "elektriciteit",
            refDatum: REF_2026,
        });
        expect(r.co2Percentage).toBe(4);
        expect(r.leeftijdMaanden).toBe(33);
        expect(r.leeftijdsCoefficient).toBeCloseTo(0.86, 2);
        expect(r.vaaJaar).toBe(1690);
        expect(r.minimumToegepast).toBe(true);
    });
    it("dieselcase DEPA Nicolas geeft VAA maand €284,03 (issue 2026-05-31)", () => {
        const r = vaaBedrijfswagen({
            cataloguswaarde: 39694.99,
            datumEersteInschrijving: "2023-04-19",
            brandstof: "diesel",
            co2: 123,
            refDatum: REF_2026,
        });
        expect(r.vaaJaar).toBeCloseTo(3408.41, 1);
        expect(r.vaaMaand).toBe(284.03);
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
        if (dp) {
            expect(dp.status).toBe("niet_gevonden");
        }
        else {
            expect(dp).toBeNull();
        }
    });
});
describe("TC-19 — Datapunt status mogelijk_verouderd", () => {
    it("rsz_bijzondere_bijdragen_verwijzing gebruikt de officiële RSZ-BBSZ-pagina zonder verouderd-blokkering", () => {
        const r = safeGetValue("rsz_bijzondere_bijdragen_verwijzing", { refDatum: REF_2026 });
        expect(r.waarschuwing).toBeNull();
        expect(r.datapunt.id).toBe("rsz_bijzondere_bijdragen_verwijzing");
        expect(r.datapunt.bron_url).toContain("specialsocialsecuritycontribution");
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
        expect(r.luikA).toBe(125.04);
        expect(r.luikB).toBe(162.95);
        expect(r.totaal).toBe(287.99);
        expect(r.vanaf1April2026).toBe(true);
    });
});
describe("TC-22 — BBSZ: schijven", () => {
    it("brutoloon € 1.900 (< € 1.945,38) geeft kwartaalbijdrage € 0", () => {
        const r = bbsz({ brutoloon: 1900, gezinstype: "alleenstaand" });
        expect(r.kwartaalbijdrage).toBe(0);
        expect(r.maandelijksBedrag).toBe(0);
    });
    it("brutoloon € 2.242,81 (schijf 3) geeft correcte kwartaalbijdrage", () => {
        const r = bbsz({ brutoloon: 2242.81, gezinstype: "alleenstaand" });
        expect(r.kwartaalbijdrage).toBe(31.57);
        expect(r.datapunt.id).toBe("bv_bbsz_schijven_2026");
    });
    it("brutoloon > € 6.038,82 geeft maximum € 182,82 per kwartaal", () => {
        const r = bbsz({ brutoloon: 7000, gezinstype: "alleenstaand" });
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
            expect(bbsz({ brutoloon, gezinstype: "alleenstaand" }).kwartaalbijdrage).toBe(kwartaalbijdrage);
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
            expect(bbsz({
                brutoloon,
                gezinstype: "gehuwd_met_inkomen",
            }).kwartaalbijdrage).toBe(kwartaalbijdrage);
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
            expect(bbsz({
                brutoloon,
                gezinstype: "gehuwd_zonder_inkomen",
            }).kwartaalbijdrage).toBe(kwartaalbijdrage);
        }
    });
    it("maandbedrag volgt maandformule (niet kwartaal/3) — gebruikersmelding €2.658 partner zonder inkomen", () => {
        const r = bbsz({ brutoloon: 2658, gezinstype: "gehuwd_zonder_inkomen" });
        expect(r.kwartaalbijdrage).toBe(48.47);
        expect(r.maandelijksBedrag).toBe(19.59);
    });
    it("maandbedrag individuele aanslag schijf 3 — 10,33 + 1,10% (niet 30,99/3 + 1,10%/3)", () => {
        const r = bbsz({ brutoloon: 2242.81, gezinstype: "alleenstaand" });
        expect(r.kwartaalbijdrage).toBe(31.57);
        expect(r.maandelijksBedrag).toBe(10.91);
    });
    it("maandbedrag partner met inkomen — maximum 51,64/maand", () => {
        const r = bbsz({ brutoloon: 25000, gezinstype: "gehuwd_met_inkomen" });
        expect(r.kwartaalbijdrage).toBe(154.92);
        expect(r.maandelijksBedrag).toBe(51.64);
    });
});
describe("TC-23 — BV: alleenstaand, 0 kinderen (AJ 2027)", () => {
    it("belastbaar € 2.000 → Bijlage III sleutelformule wordt gebruikt", () => {
        const belastbaarMaandloon = 2000;
        const r = berekenBV({ belastbaarMaandloon, gezinstype: "alleenstaand", kinderenTenLaste: 0 });
        expect(r.jaarbasis).toBe(24000);
        expect(r.forfaitBeroepskosten).toBe(6070);
        expect(r.belastbaarNettoJaar).toBe(17930);
        expect(r.belastingvrijeSomBv).toBe(11170);
        expect(r.basisbelastingBruto).toBe(4992.09);
        expect(r.verminderingBelastingvrijeSom).toBe(2987.98);
        expect(r.basisbelastingNaVerminderingen).toBe(2004.11);
        expect(r.methode).toBe("bijlage_iii_sleutelformule_2026");
        expect(r.schaal).toBe("I");
        expect(r.bvPerMaand).toBe(167.01);
        expect(r.bvNaVerminderingen).toBe(r.bvPerMaand);
        expect("verminderingKindOnder3" in r).toBe(false);
        expect(r.isApproximatie).toBe(false);
        expect(r.validatieStatus).toBe("fod_bijlage_iii_ok");
        expect(r.validatieOpmerking).toContain("FOD Financiën");
        expect(r.validatieOpmerking).toContain("Bijlage III 2026");
        expect(r.validatieOpmerking).not.toContain("pending");
        expect(r.validatieOpmerking).not.toContain("Group S");
        expect(r.datapunten.length).toBeGreaterThanOrEqual(2);
    });
    it("expertcase mei 2026: brutoloon € 2.300 geeft BV € 163,57 en netto € 2.122,35", () => {
        const r = berekenNetto({
            brutoloon: 2300,
            refDatum: "2026-05-01",
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            woonwerkVrijgesteldPerMaand: 16.42,
        });
        expect(r.belastbaarMaandloonVoorBV).toBe(2281.04);
        expect(r.werkbonus.totaal).toBe(281.65);
        expect(r.fiscaleWerkbonus).toBe(123.72);
        expect(r.bv.belastbaarNettoJaar).toBe(21302.48);
        expect(r.bv.basisbelastingBruto).toBe(6435.51);
        expect(r.bv.verminderingBelastingvrijeSom).toBe(2987.98);
        expect(r.bv.bvPerMaand).toBe(287.29);
        expect(r.bv.bvNaVerminderingen).toBe(163.57);
        expect(r.bbsz.maandelijksBedrag).toBe(11.54);
        expect(r.nettoloon).toBe(2122.35);
    });
});
describe("TC-23b — BV: Tier-2 triangulatie", () => {
    it("houdt sociale-secretariaatoutput buiten de officiële validatiestatus", () => {
        const r = berekenNetto({
            brutoloon: 2276.51,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.belastbaarMaandloon).toBe(2266.96);
        expect(r.bv.validatieStatus).toBe("fod_bijlage_iii_ok");
        expect(r.bv.validatieOpmerking).not.toContain("Group S");
    });
});
describe("TC-24 — BV: gehuwd zonder inkomen, 2 kinderen (AJ 2027 maandtabel)", () => {
    it("past Schaal II toe met huwelijksquotiënt en 2 kinderen → €138/m maandvermindering", () => {
        const r = berekenBV({
            belastbaarMaandloon: 2500,
            gezinstype: "gehuwd_zonder_inkomen",
            kinderenTenLaste: 2,
        });
        expect(r.belastingvrijeSomBv).toBe(22340);
        expect(r.huwelijksquotient).toBe(7179);
        expect(r.verminderingBelastingvrijeSom).toBe(5975.96);
        expect(r.verminderingKinderen).toBe(138);
        expect(r.basisbelastingNaVerminderingen).toBeGreaterThanOrEqual(0);
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
        expect(partnerZonderOfBeperktInkomen.bvNaVerminderingen).toBeLessThan(tweeverdiener.bvNaVerminderingen);
    });
});
describe("TC-25 — Netto end-to-end: Schaal I Cat A 5 jaar, alleenstaand, 0 kinderen", () => {
    it("nettoloon is positief en kleiner dan brutoloon", () => {
        const r = berekenNetto({
            brutoloon: 2276.51,
            refDatum: "2026-06-01",
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.nettoloon).toBeGreaterThan(0);
        expect(r.nettoloon).toBeLessThan(r.brutoloon);
        expect(r.rsz.werknemerBijdrage).toBe(297.54);
        expect(r.werkbonus.totaal).toBeGreaterThan(0);
        expect(r.effectieveRsz).toBeLessThan(r.rsz.werknemerBijdrage);
        expect(r.bbsz.datapunt.id).toBe("bv_bbsz_schijven_2026");
        expect(r.bv.methode).toBe("bijlage_iii_sleutelformule_2026");
        expect(r.bv.validatieStatus).toBe("fod_bijlage_iii_ok");
    });
    it("audit: alle datapunten in netto-resultaat hebben bron_url", () => {
        const r = berekenNetto({
            brutoloon: 2276.51,
            refDatum: "2026-06-01",
            gezinstype: "alleenstaand",
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
            kinderenTenLaste: 0,
        });
        const metMaaltijdcheques = berekenNetto({
            brutoloon: 2276.51,
            refDatum: "2026-06-01",
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            maaltijdchequeWerknemersbijdragePerDag: 1.09,
            maaltijdchequeWerkdagen: 20,
        });
        expect(metMaaltijdcheques.maaltijdchequeWerknemersbijdrage).toBe(21.8);
        expect(metMaaltijdcheques.nettoloon).toBeCloseTo(basis.nettoloon - 21.8, 2);
        expect(metMaaltijdcheques.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
    });
    it("zonder maaltijdcheque-input blijft de werknemersbijdrage nul", () => {
        const r = berekenNetto({
            brutoloon: 2276.51,
            refDatum: "2026-06-01",
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.maaltijdchequeWerknemersbijdrage).toBe(0);
    });
    it("telt woon-werkvergoeding bij belastbaar loon en past BV-vrijstelling apart toe", () => {
        const basis = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        const metWoonwerk = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            woonwerkVergoedingPerMaand: 100,
            bvVrijstellingWoonWerkPerMaand: 41.67,
        });
        expect(metWoonwerk.woonwerkVergoedingPerMaand).toBe(100);
        expect(metWoonwerk.belastbaarMaandloon).toBe(basis.belastbaarMaandloon);
        expect(metWoonwerk.belastbaarMaandloonVoorBV).toBe(basis.belastbaarMaandloonVoorBV + 100);
        expect(metWoonwerk.bv.bvNaVerminderingen).toBeLessThanOrEqual(basis.bv.bvNaVerminderingen + 100);
        expect(metWoonwerk.nettoloon).toBeGreaterThan(basis.nettoloon);
    });
    it("telt privéwagenvergoeding 3 km mee in belastbaar loon", () => {
        const woonwerk = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 10,
            werkdagenInMaand: 22,
            fiets: { actief: false, kmPerDag: 0 },
            trein: { actief: false, kmEnkel: 0 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 3 },
        });
        const basis = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        const metPrivewagen = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            woonwerkVergoedingPerMaand: woonwerk.totaalVergoeding,
            bvVrijstellingWoonWerkPerMaand: woonwerk.totaalVergoeding,
        });
        expect(woonwerk.totaalVergoeding).toBe(10.96);
        expect(metPrivewagen.woonwerkVergoedingPerMaand).toBe(10.96);
        expect(metPrivewagen.nettoloon).toBe(basis.nettoloon + 10.96);
    });
    it("beperkt de vrijgestelde privéwagenvergoeding bij forfaitaire beroepskosten tot €41,67 per maand", () => {
        const woonwerk = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 22,
            werkdagenInMaand: 22,
            fiets: { actief: false, kmPerDag: 0 },
            trein: { actief: false, kmEnkel: 0 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 15 },
        });
        expect(woonwerk.componenten.privewagen?.vergoeding).toBe(46.7);
        expect(berekenWoonwerkVrijgesteld(woonwerk, "forfaitair")).toBe(41.67);
        expect(berekenWoonwerkVrijgesteld(woonwerk, "reeel")).toBe(0);
    });
    it("expertcase Pieter C.: gebruikt €41,67 vrijstelling alleen achterliggend voor BV", () => {
        const r = berekenNetto({
            brutoloon: 5800,
            refDatum: "2026-10-01",
            gezinstype: "gehuwd_met_inkomen",
            kinderenTenLaste: 1,
            bvVrijstellingWoonWerkPerMaand: 41.67,
            vaaBedrijfswagenPerMaand: 140.83,
            onkostenvergoedingPerMaand: 270,
        });
        expect(r.belastbaarMaandloonVoorBV).toBe(5182.77);
        expect(r.bv.jaarbasis).toBe(61693.2);
        expect(r.bv.bvPerMaand).toBe(1648.26);
        expect(r.bv.verminderingKinderen).toBe(52);
        expect(r.bv.bvNaVerminderingen).toBe(1596.26);
    });
    it("telt privéwagen 3 km en trein samen mee met forfaitaire BV-vrijstelling op privédeel", () => {
        const woonwerk = berekenWoonwerkVerkeer({
            refDatum: REF_2026,
            brutoloon: 3000,
            arbeidsdagenPerMaand: 10,
            werkdagenInMaand: 22,
            fiets: { actief: false, kmPerDag: 0 },
            trein: { actief: true, kmEnkel: 15 },
            busTramMetro: { actief: false, kmEnkel: 0, prijsPerMaand: 0 },
            privewagen: { actief: true, kmEnkel: 3 },
        });
        const basis = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        const metMultimodaalWoonwerk = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            woonwerkVergoedingPerMaand: woonwerk.totaalVergoeding,
            bvVrijstellingWoonWerkPerMaand: 10.96,
        });
        expect(woonwerk.totaalVergoeding).toBe(52.78);
        expect(metMultimodaalWoonwerk.woonwerkVergoedingPerMaand).toBe(52.78);
        expect(metMultimodaalWoonwerk.nettoloon).toBeGreaterThan(basis.nettoloon);
        expect(metMultimodaalWoonwerk.nettoloon).toBeLessThan(basis.nettoloon + 52.78);
    });
    it("past bijkomende netto-looncomponenten toe zonder RSZ/BV-basis te wijzigen", () => {
        const basis = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        const metComponenten = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
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
            kinderenTenLaste: 0,
        });
        const metVaa = berekenNetto({
            brutoloon: 4000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
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
            kinderenTenLaste: 0,
        });
        const metWerkmiddelen = berekenNetto({
            brutoloon: 4000,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
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
import { berekenBvBijzonder } from "@/lib/bvBijzonder";
describe("NTC-01 — Schaal I Cat A 5j, alleenstaand, 0 kind", () => {
    it("structurele controle: werkbonus actief + fiscale werkbonus > 0", () => {
        const r = berekenNetto({
            brutoloon: 2276.51,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.werkbonus.totaal).toBeGreaterThan(0);
        expect(r.fiscaleWerkbonus).toBeGreaterThan(0);
        expect(r.nettoloon).toBeGreaterThan(0);
        expect(r.nettoloon).toBeLessThan(r.brutoloon);
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
            kinderenTenLaste: 1,
        });
        expect(r.bv.verminderingKinderen).toBe(52);
        expect(r.nettoloon).toBeGreaterThan(2000);
        expect(r.nettoloon).toBeLessThan(2500);
    });
});
describe("NTC-03 — Schaal II Cat B 8j, eenverdiener, 2 kinderen", () => {
    it("BV-belastingvrije som = €22.340 + verm 2 kind = €138/m", () => {
        const r = berekenNetto({
            brutoloon: 3000,
            refDatum: REF_2026,
            gezinstype: "gehuwd_zonder_inkomen",
            kinderenTenLaste: 2,
        });
        expect(r.bv.belastingvrijeSomBv).toBe(22340);
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
            kinderenTenLaste: 0,
        });
        expect(r.werkbonus.luikA).toBe(125.04);
        expect(r.werkbonus.luikB).toBe(168.62);
        expect(r.effectieveRsz).toBe(0);
    });
    it("deeltijds rekent werkbonus op voltijdsequivalent", () => {
        const r = berekenNetto({
            brutoloon: 1800,
            tewerkstellingsbreuk: 0.5,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.werkbonus.totaal).toBe(0);
    });
});
describe("NTC-09 — Alleenstaande ouder met 1 kind (+€52 extra)", () => {
    it("BV-vermindering alleenstaande ouder = €52", () => {
        const r = berekenNetto({
            brutoloon: 2500,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
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
    it("bepaalt het tarief op het normale brutojaarloon na werknemers-RSZ", () => {
        const r = eindejaarspremie({
            brutoloon: 2658,
            ancienniteitMaanden: 36,
            prestatieMaandenInRefertepériode: 12,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
        });
        expect(r.bvBijzonder?.refertejaarloon).toBe(27727.19);
        expect(r.bvBijzonder?.tarief).toBe(0.4038);
    });
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
        expect(r.bvBijzonder?.tarief).toBeCloseTo(0.4038, 4);
        expect(r.bvBijzonder?.bvBruto).toBeCloseTo(1053.07, 1);
        expect(r.nettoPremie).toBeCloseTo(1554.83, 1);
    });
});
describe("NTC-15 — Dubbel vakantiegeld 92% — bijzondere BV", () => {
    it("Bijzondere BV op €2.760 vakantiegeld gebruikt de vakantiegeldkolom", () => {
        const r = berekenBvBijzonder({
            refertejaarloon: 31294.8,
            normaalBrutoJaarloon: 36000,
            exceptioneelBruto: 2426.71,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            soort: "vakantiegeld",
        });
        expect(r.tarief).toBeCloseTo(0.3634, 4);
        expect(r.bvBruto).toBeCloseTo(881.87, 1);
        expect(r.nettoBedrag).toBeCloseTo(1544.84, 1);
    });
    it("past geen kindvermindering toe boven de exceptionele BV-grens voor 3 kinderen", () => {
        const r = berekenBvBijzonder({
            refertejaarloon: 41726.4,
            normaalBrutoJaarloon: 48000,
            exceptioneelBruto: 3477.2,
            gezinstype: "gehuwd_met_inkomen",
            kinderenTenLaste: 3,
            soort: "andere_exceptionele_vergoeding",
        });
        expect(r.tarief).toBe(0.4644);
        expect(r.bvBruto).toBe(1614.81);
        expect(r.vermindering).toBe(0);
        expect(r.bvNetto).toBe(1614.81);
    });
    it("past kindvrijstelling en procentuele vermindering toe onder de exceptionele BV-grenzen", () => {
        const r = berekenBvBijzonder({
            refertejaarloon: 24340,
            normaalBrutoJaarloon: 28000,
            exceptioneelBruto: 3477.2,
            gezinstype: "gehuwd_met_inkomen",
            kinderenTenLaste: 3,
            soort: "andere_exceptionele_vergoeding",
        });
        expect(r.tarief).toBe(0.3836);
        expect(r.bvBruto).toBe(965.6);
        expect(r.vermindering).toBe(337.96);
        expect(r.bvNetto).toBe(627.64);
    });
});
describe("Jaaroverzicht — netto en werkgeverskost", () => {
    it("rekent een jaarbonus als exceptionele vergoeding met RSZ en bijzondere BV", () => {
        const basis = berekenJaaroverzicht({
            brutoloon: 3000,
            nettoloonPerMaand: 2000,
            loonkostWerkgeverPerMaand: 3900,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            ancienniteitMaanden: 0,
            prestatieMaandenInRefertepériode: 0,
            tewerkstellingsbreuk: 1,
        });
        const metBonus = berekenJaaroverzicht({
            brutoloon: 3000,
            nettoloonPerMaand: 2000,
            loonkostWerkgeverPerMaand: 3900,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            ancienniteitMaanden: 0,
            prestatieMaandenInRefertepériode: 0,
            tewerkstellingsbreuk: 1,
            bonusJaarbedrag: 1200,
        });
        expect(metBonus.netto.bonus.bruto).toBe(1200);
        expect(metBonus.netto.bonus.rsz).toBe(156.84);
        expect(metBonus.netto.bonus.belastbaar).toBe(1043.16);
        expect(metBonus.netto.bonus.bvTarief).toBe(0.4038);
        expect(metBonus.netto.bonus.bv).toBe(421.23);
        expect(metBonus.netto.bonus.netto).toBe(621.93);
        expect(metBonus.werkgever.bonusBruto).toBe(1200);
        expect(metBonus.werkgever.rszOpBonus).toBe(300);
        expect(metBonus.werkgever.totaleLoonkostJaar - basis.werkgever.totaleLoonkostJaar).toBe(1500);
    });
    it("laat bonus nul de bestaande jaaroverzichttotalen ongemoeid", () => {
        const basis = berekenJaaroverzicht({
            brutoloon: 3000,
            nettoloonPerMaand: 2000,
            loonkostWerkgeverPerMaand: 3900,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            ancienniteitMaanden: 0,
            prestatieMaandenInRefertepériode: 0,
            tewerkstellingsbreuk: 1,
        });
        const nulBonus = berekenJaaroverzicht({
            brutoloon: 3000,
            nettoloonPerMaand: 2000,
            loonkostWerkgeverPerMaand: 3900,
            refDatum: REF_2026,
            gezinstype: "alleenstaand",
            kinderenTenLaste: 0,
            ancienniteitMaanden: 0,
            prestatieMaandenInRefertepériode: 0,
            tewerkstellingsbreuk: 1,
            bonusJaarbedrag: 0,
        });
        expect(nulBonus.netto.bonus.bruto).toBe(0);
        expect(nulBonus.werkgever.bonusBruto).toBe(0);
        expect(nulBonus.werkgever.rszOpBonus).toBe(0);
        expect(nulBonus.netto.totaalNettoJaarloon).toBe(basis.netto.totaalNettoJaarloon);
        expect(nulBonus.werkgever.totaleLoonkostJaar).toBe(basis.werkgever.totaleLoonkostJaar);
    });
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
        expect(r.netto.jaarpremie.rsz).toBe(43.24);
        expect(r.netto.jaarpremie.bv).toBe(148.06);
        expect(r.netto.jaarpremie.bvTarief).toBe(0.5148);
        expect(r.netto.jaarpremie.netto).toBe(139.54);
        expect(r.netto.totaalNettoJaarloon).toBe(34200.79);
        expect(r.werkgever.maandbasisX12).toBe(67786.2);
        expect(r.werkgever.jaarpremiesEnEcocheques).toBe(5080.84);
        expect(r.werkgever.rszOpEindejaarspremieEnJaarpremie).toBe(1207.71);
        expect(r.werkgever.dubbelVakantiegeld).toBe(4140);
        expect(r.werkgever.totaleLoonkostJaar).toBe(78214.75);
    });
    it("expertcase Pieter C.: dubbel vakantiegeld is 92% van het brutomaandloon zonder VAA", () => {
        const r = berekenJaaroverzicht({
            brutoloon: 5800,
            nettoloonPerMaand: 3641.75,
            loonkostWerkgeverPerMaand: 8006.2,
            refDatum: "2026-10-01",
            gezinstype: "gehuwd_met_inkomen",
            kinderenTenLaste: 1,
            ancienniteitMaanden: 12,
            prestatieMaandenInRefertepériode: 12,
            tewerkstellingsbreuk: 1,
            vaaPerMaand: 140.83,
        });
        expect(r.netto.dubbelVakantiegeld.bruto).toBe(5336);
    });
    it("berekent exceptionele BV voor het ECL-profiel zonder maandelijkse kindvermindering", () => {
        const r = berekenJaaroverzicht({
            brutoloon: 4000,
            nettoloonPerMaand: 3022.39,
            loonkostWerkgeverPerMaand: 5327.87,
            refDatum: "2026-05-01",
            gezinstype: "gehuwd_met_inkomen",
            kinderenTenLaste: 3,
            ancienniteitMaanden: 12,
            prestatieMaandenInRefertepériode: 12,
            tewerkstellingsbreuk: 1,
        });
        expect(r.netto.eindejaarspremie.bruto).toBe(4000);
        expect(r.netto.eindejaarspremie.rsz).toBe(522.8);
        expect(r.netto.eindejaarspremie.belastbaar).toBe(3477.2);
        expect(r.netto.eindejaarspremie.bvTarief).toBe(0.4644);
        expect(r.netto.eindejaarspremie.bv).toBe(1614.81);
        expect(r.netto.dubbelVakantiegeld.bruto).toBe(3680);
        expect(r.netto.dubbelVakantiegeld.rsz).toBe(444.38);
        expect(r.netto.dubbelVakantiegeld.belastbaar).toBe(3235.62);
        expect(r.netto.dubbelVakantiegeld.bvTarief).toBe(0.4239);
        expect(r.netto.dubbelVakantiegeld.bv).toBe(1371.58);
        expect(r.netto.jaarpremie.bv).toBe(133.56);
    });
});
describe("TC-WGK-01 — werkgeverskost met extralegale voordelen", () => {
    const bruto = 2276.51;
    const ref = REF_2026;
    it("baseline (geen extras) geeft correcte smal loonkost", () => {
        const r = werkgeverskost({ brutoloon: bruto, refDatum: ref });
        expect(r.arbeidsongevallen).toBe(6.83);
        expect(r.extraVoordelen).toBe(0);
        expect(r.totaleLoonkostSmal).toBe(Math.round((bruto + r.rszWerkgever + r.arbeidsongevallen) * 100) / 100);
    });
    it("berekent de vakantiegeldprovisie op 92% van brutoloon zonder VAA", () => {
        const r = werkgeverskost({
            brutoloon: 5800,
            refDatum: "2026-10-01",
            vaaPerMaand: 140.83,
        });
        expect(r.provisieVakantiegeld).toBe(444.67);
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
