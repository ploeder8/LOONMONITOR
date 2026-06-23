import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SharedProfielProvider } from "@/lib/useSharedProfiel";
import {
    activeSectionForPath,
    headerContentLayout,
    mainMaxWidthForPath,
    MobileBottomNav,
    PRIMARY_NAV_ITEMS,
    PrimaryRail,
    SIMULATOR2_SUBNAV_ITEMS,
    SIMULATOR_SUBNAV_ITEMS,
    Simulator2Subnav,
    SimulatorSubnav,
} from "@/App";
import { fietsvergoeding } from "@/lib/fietsvergoeding";
import { aantalWeekdagenInMaand, DEFAULTS, percentageNaarTewerkstellingsbreuk, refDatumVoorMaand, tewerkstellingsbreukNaarPercentage, } from "@/lib/profiel";
import { berekenNettoVoorProfiel } from "@/lib/profielBerekeningen";
import { profielMetBerekeningsMaand } from "@/pages/home/InputCockpit";
import { HomePage, waardeUitNumeriekeInput, } from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";

function renderWithProfiel(element: ReactElement): string {
    return renderToStaticMarkup(createElement(SharedProfielProvider, null, element));
}
describe("App shell breedte", () => {
    it("geeft simulator- en loonmotorroutes extra desktopbreedte", () => {
        expect(mainMaxWidthForPath("/")).toBe(1520);
        expect(mainMaxWidthForPath("/loonmotor")).toBe(1520);
        expect(mainMaxWidthForPath("/simulator2")).toBe(1520);
        expect(mainMaxWidthForPath("/simulator2/loonfiche")).toBe(1520);
        expect(mainMaxWidthForPath("/scope")).toBe(1180);
        expect(mainMaxWidthForPath("/testcases")).toBe(1180);
    });
    it("houdt logo en tooltitel links uitgelijnd in de header", () => {
        expect(headerContentLayout.maxWidth).toBe("none");
        expect(headerContentLayout.margin).toBe("0");
    });
    it("beperkt globale navigatie tot primaire werkruimtes", () => {
        expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).toEqual([
            "Loonmotor",
            "Simulator",
            "Simulator 2",
            "Ontwikkeling",
        ]);
        expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).not.toContain("Calculator");
        expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).not.toContain("Loonfiche");
        expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).not.toContain("Loonrun");
        expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).not.toContain("Scope & bekend manco");
    });
    it("houdt calculator, loonfiche en loonrun als lokale simulator-subnav", () => {
        expect(SIMULATOR_SUBNAV_ITEMS.map((item) => item.label)).toEqual([
            "Calculator",
            "Loonfiche",
            "Loonrun",
        ]);
        expect(SIMULATOR2_SUBNAV_ITEMS.map((item) => item.label)).toEqual([
            "Calculator",
            "Loonfiche",
            "Loonrun",
        ]);
    });
    it("bepaalt actieve hoofdsectie op routegroep", () => {
        expect(activeSectionForPath("/loonmotor")).toBe("loonmotor");
        expect(activeSectionForPath("/")).toBe("simulator");
        expect(activeSectionForPath("/loonfiche")).toBe("simulator");
        expect(activeSectionForPath("/loonrun")).toBe("simulator");
        expect(activeSectionForPath("/simulator2")).toBe("simulator2");
        expect(activeSectionForPath("/simulator2/loonfiche")).toBe("simulator2");
        expect(activeSectionForPath("/simulator2/loonrun")).toBe("simulator2");
        expect(activeSectionForPath("/scope")).toBe("ontwikkeling");
        expect(activeSectionForPath("/testcases")).toBe("ontwikkeling");
    });
    it("rendert linkerrail, simulator-subnav en mobiele bottomnav als gescheiden navigatie", () => {
        const railHtml = renderWithProfiel(createElement(PrimaryRail, { pathname: "/loonmotor" }));
        const simulatorHtml = renderToStaticMarkup(createElement(SimulatorSubnav, { pathname: "/loonfiche", placement: "header" }));
        const simulator2Html = renderToStaticMarkup(createElement(Simulator2Subnav, { pathname: "/simulator2", placement: "header" }));
        const mobileHtml = renderToStaticMarkup(createElement(MobileBottomNav, { pathname: "/scope" }));
        expect(railHtml).toContain("Loonmotor");
        expect(railHtml).toContain('aria-current="page"');
        expect(railHtml).not.toContain("Loonfiche");
        expect(simulatorHtml).toContain("app-header-subnav");
        expect(simulatorHtml).toContain("Calculator");
        expect(simulatorHtml).toContain("Loonfiche");
        expect(simulatorHtml).toContain("Loonrun");
        expect(simulator2Html).toContain("app-header-subnav");
        expect(simulator2Html).toContain("Simulator 2");
        expect(simulator2Html).toContain("Calculator");
        expect(simulator2Html).toContain("Loonfiche");
        expect(simulator2Html).toContain("Loonrun");
        expect(mobileHtml).toContain("Meer");
    });
    it("toont kerncijfers in de linkerrail op simulatorroutes, niet op andere routes", () => {
        const simulatorRail = renderWithProfiel(createElement(PrimaryRail, { pathname: "/" }));
        const simulator2Rail = renderWithProfiel(createElement(PrimaryRail, { pathname: "/simulator2" }));
        const loonmotorRail = renderWithProfiel(createElement(PrimaryRail, { pathname: "/loonmotor" }));
        const ontwikkelingRail = renderWithProfiel(createElement(PrimaryRail, { pathname: "/testcases" }));
        expect(simulatorRail).toContain("rail-hero-summary");
        expect(simulatorRail).toContain("BRUTO");
        expect(simulatorRail).toContain("NETTO");
        expect(simulatorRail).toContain("WERKGEVERSKOST");
        expect(simulatorRail).toContain("LOONWIG");
        expect(simulator2Rail).toContain("rail-hero-summary");
        expect(simulator2Rail).toContain("BRUTO");
        expect(loonmotorRail).not.toContain("rail-hero-summary");
        expect(ontwikkelingRail).not.toContain("rail-hero-summary");
    });
});
describe("Publieke documentatiepagina's", () => {
    it("beschrijft de actuele runtime-architectuur op de scopepagina", () => {
        const html = renderToStaticMarkup(createElement(ScopePage));
        expect(html).toContain("Payroll browser-only, chat serverless");
        expect(html).toContain("Vercel serverless laag");
        expect(html).not.toContain("Browser-only, geen back-end");
        expect(html).not.toContain("Geen authenticatie, geen DB, geen logging");
    });
    it("toont de pro-rata eindejaarspremiecase als technische regressietest", () => {
        const html = renderToStaticMarkup(createElement(TestcasesPage));
        expect(html).toContain("Eindejaarspremie — pure pro-rata functie");
        expect(html).toContain("De Jaakie-gebruikersflow toont eindejaarspremie als volledig gewerkt jaar");
        expect(html).not.toContain("Eindejaarspremie pro-rata (6 mnd)");
    });
});
describe("Maand van berekening", () => {
    it("zet een berekeningsmaand om naar de eerste dag van die maand", () => {
        expect(refDatumVoorMaand("2026", "06")).toBe("2026-06-01");
    });
    it("berekent het aantal weekdagen in de gekozen maand als voorgestelde werkdagen", () => {
        expect(aantalWeekdagenInMaand("2026", "02")).toBe(20);
        expect(aantalWeekdagenInMaand("2026", "06")).toBe(22);
        expect(aantalWeekdagenInMaand("2026", "08")).toBe(21);
    });
    it("zet maand en werkdagen atomisch bij een maandwijziging", () => {
        const profiel = {
            ...DEFAULTS,
            berekeningsMaand: "06",
            arbeidsdagenPerMaand: 17,
        };
        expect(profielMetBerekeningsMaand(profiel, "02")).toMatchObject({
            berekeningsMaand: "02",
            arbeidsdagenPerMaand: 20,
        });
    });
    it("normaliseert legacy maand-state van vóór de aparte jaarselect", () => {
        expect(refDatumVoorMaand(undefined, "2026-04")).toBe("2026-04-01");
        expect(refDatumVoorMaand(undefined, "04")).toBe("2026-04-01");
    });
    it("activeert maandgebonden regels vanaf de eerste dag van de gekozen maand", () => {
        expect(fietsvergoeding({
            kmPerDag: 8,
            arbeidsdagen: 22,
            refDatum: refDatumVoorMaand("2026", "09"),
        }).tariefPerKm).toBe(0.27);
        expect(fietsvergoeding({
            kmPerDag: 8,
            arbeidsdagen: 22,
            refDatum: refDatumVoorMaand("2026", "10"),
        }).tariefPerKm).toBe(0.32);
    });
});
describe("Ecocheques percentage-invoer", () => {
    it("toont de interne tewerkstellingsbreuk als percentage", () => {
        expect(tewerkstellingsbreukNaarPercentage(0.6)).toBe(60);
    });
    it("slaat een percentage-invoer intern op als tewerkstellingsbreuk", () => {
        expect(percentageNaarTewerkstellingsbreuk(75)).toBe(0.75);
    });
});
describe("Numerieke invoer", () => {
    it("laat een leeg veld tijdelijk leeg in plaats van meteen 0 te forceren", () => {
        expect(waardeUitNumeriekeInput("", "float")).toBeNull();
        expect(waardeUitNumeriekeInput("", "int")).toBeNull();
    });
    it("parseert geldige numerieke invoer naar een getal", () => {
        expect(waardeUitNumeriekeInput("123.45", "float")).toBe(123.45);
        expect(waardeUitNumeriekeInput("12", "int")).toBe(12);
    });
});
describe("Profiel formulier", () => {
    it("houdt de mobiele layout binnen de viewport zonder hero-overflow", () => {
        const html = renderWithProfiel(createElement(HomePage));
        const css = readFileSync("src/index.css", "utf8");
        expect(html).not.toContain("hero-summary");
        expect(css).toContain(".hero-summary {");
        expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
        expect(css).toContain(".hero-summary-value {");
        expect(css).toContain("font-size: 19px;");
        expect(css).toContain("max-width: 100% !important;");
        expect(css).not.toContain("max-width: calc(100vw - 84px)");
    });
    it("markeert toggle- en accordionstate voor assistieve technologie", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain('aria-pressed="true"');
        expect(html).toContain('aria-pressed="false"');
        expect(html).toContain('aria-expanded="false"');
    });
    it("toont de BV-gezinsvelden in Persoonsgegevens", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html.indexOf("Persoonsgegevens")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Naam werknemer")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Rijksregisternummer")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Gezinstype (voor BV)")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Kinderen ten laste")).toBeGreaterThanOrEqual(0);
        expect(html).not.toContain("Kinderen < 3 jaar");
        expect(html).not.toContain("Extra BV-vermindering");
        expect(html.indexOf("Statuut")).toBeLessThan(html.indexOf("Gezinstype (voor BV)"));
    });
    it("benoemt partner zonder of beperkt beroepsinkomen als lagere BV, niet als ten laste", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen");
    });
    it("toont geen BBSZ-scenario meer (afgeleid van gezinstype)", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("BBSZ-scenario");
    });
    it("toont geen bouw-subset opt-in meer", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("Bouw-subset");
        expect(html).not.toContain("+1,80% pensioen");
    });
    it("toont geen invoerveld meer voor gemeentebelasting", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("Gemeentebelasting (%)");
    });
    it("toont extra looncomponenten accordion", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html.indexOf("Extra looncomponenten")).toBeGreaterThanOrEqual(0);
    });
    it("toont maaltijdcheques subsection in extra looncomponenten", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Extra looncomponenten");
        expect(html).toContain("Maaltijdcheques");
    });
    it("toont bonusinvoer met maand- en jaaroptie", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Bonus");
        expect(html).toContain("Per maand");
        expect(html).toContain("Per jaar");
    });
    it("plaatst werkgever en werkgeversbijdragen bovenaan de invoer", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html.indexOf("Werkgever")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Werkgeversbijdragen")).toBeGreaterThan(html.indexOf("Werkgever"));
        expect(html.indexOf("Persoonsgegevens")).toBeGreaterThan(html.indexOf("Werkgeversbijdragen"));
    });
    it("plaatst bedrijfswagen in het woon-werkrijtje zonder aparte VAA-onderverdeling", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html.indexOf("Bedrijfswagen")).toBeGreaterThan(html.indexOf("Trein"));
        expect(html.indexOf("Selecteer alle vergoedingen")).toBeLessThan(html.indexOf("Bedrijfswagen"));
        expect(html).not.toContain("Voordeel Alle Aard");
    });
    it("plaatst tewerkstelling in de arbeidscontext subsection", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html.indexOf("Contractgegevens")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Arbeidscontext")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Ervaring")).toBeGreaterThanOrEqual(0);
        expect(html.indexOf("Tewerkstelling (%)")).toBeGreaterThanOrEqual(0);
    });
});
describe("Netto-overzicht", () => {
    it("toont de loonfiche-labels in de verwachte volgorde", () => {
        const html = renderWithProfiel(createElement(HomePage));
        const labels = [
            "Totaal bruto",
            "Belastbaar loon",
            "Bedrijfsvoorheffing",
            "Onkostenvergoedingen en inhoudingen",
            "Nettoloon",
        ];
        const positions = labels.map((label) => html.indexOf(label));
        for (const position of positions) {
            expect(position).toBeGreaterThanOrEqual(0);
        }
        expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });
    it("verbergt nulregels voor VAA bedrijfswagen en terugname VAA", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("VAA bedrijfswagen");
        expect(html).not.toContain("Terugname VAA");
    });
    it("toont aparte maand- en jaaroverzichtskaders voor netto en werkgeverskost", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Netto berekening (per maand)");
        expect(html).toContain("Netto jaaroverzicht");
        expect(html).toContain("Loonkost werkgever (per maand)");
        expect(html).toContain("Loonkost werkgever (per jaar)");
        expect(html).not.toContain("WERKGEVERSKOST");
    });
    it("toont geen technische BV-validatiedisclaimer in het netto-paneel", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("Tax-Calc is alleen een latere PB-raming");
        expect(html).not.toContain("FOD Bijlage III:");
    });
    it("houdt technische berekeningsdetails uit de zichtbare calculatorcopy", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).not.toContain("fod_bijlage_iii_ok");
        expect(html).not.toContain("bijlage_iii_sleutelformule_2026");
        expect(html).not.toContain("33,14% × A + 52,54% × B");
        expect(html).not.toContain("÷ 3");
        expect(html).not.toContain("Totale loonkost — smal");
        expect(html).not.toContain("Effectieve RSZ");
    });
    it("behoudt de kernlabels in gebruikersgerichte taal", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("RSZ werknemer");
        expect(html).toContain("Loon na RSZ en werkbonus");
        expect(html).toContain("Bedrijfsvoorheffing");
        expect(html).toContain("Bijzondere bijdrage sociale zekerheid");
        expect(html).toContain("Aanvullende gemeentebelasting");
        expect(html).toContain("Loonwig");
        expect(html).toContain("Loonkost zonder voordelen");
    });
    it("toont de VAA-werkmiddelen in de extra looncomponenten accordion", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Extra looncomponenten");
    });
    it("toont de onkostenvergoedingen-accordion", () => {
        const html = renderWithProfiel(createElement(HomePage));
        expect(html).toContain("Onkostenvergoedingen");
        expect(html).toContain("Forfaitaire kostenvergoedingen vrijgesteld van RSZ");
    });
    it("toont standaard geen nettoloon inclusief maaltijdcheques", () => {
        const html = renderWithProfiel(createElement(HomePage));
        const tekst = html.replace(/\u00a0/g, " ");
        expect(tekst).not.toContain("Nettoloon incl. maaltijdcheques");
    });
    it("toont standaard geen netto jaarloon inclusief maaltijdcheques", () => {
        const html = renderWithProfiel(createElement(HomePage));
        const tekst = html.replace(/\u00a0/g, " ");
        expect(tekst).not.toContain("Netto jaarloon incl. maaltijdcheques");
    });
});
describe("VAA bedrijfswagen", () => {
    it("herberekent de netto-output direct wanneer de bedrijfswagenwaarden wijzigen", () => {
        const basisProfiel = {
            ...DEFAULTS,
            woonwerkBedrijfswagen: true,
            bedrijfswagenCataloguswaarde: 40000,
            bedrijfswagenCo2: 100,
            bedrijfswagenBrandstof: "benzine" as const,
            bedrijfswagenDatumEersteInschrijving: "2026-01-01",
        };
        const aangepastProfiel = {
            ...basisProfiel,
            bedrijfswagenCataloguswaarde: 70000,
            bedrijfswagenCo2: 150,
        };
        const refDatum = refDatumVoorMaand(basisProfiel.berekeningsJaar, basisProfiel.berekeningsMaand);
        const basis = berekenNettoVoorProfiel(basisProfiel, refDatum);
        const aangepast = berekenNettoVoorProfiel(aangepastProfiel, refDatum);
        expect(aangepast.vaaBedrijfswagenPerMaand).toBeGreaterThan(basis.vaaBedrijfswagenPerMaand);
    });
});
