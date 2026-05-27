import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { headerContentLayout, mainMaxWidthForPath } from "@/App";
import { fietsvergoeding } from "@/lib/fietsvergoeding";
import {
  aantalWeekdagenInMaand,
  eindejaarspremieMaandenVoorCheckbox,
  percentageNaarTewerkstellingsbreuk,
  refDatumVoorMaand,
  tewerkstellingsbreukNaarPercentage,
} from "@/lib/profiel";
import {
  HomePage,
  waardeUitNumeriekeInput,
} from "@/pages/HomePage";
import { ScopePage } from "@/pages/ScopePage";
import { TestcasesPage } from "@/pages/TestcasesPage";

describe("App shell breedte", () => {
  it("geeft alleen de calculatorroute extra desktopbreedte", () => {
    expect(mainMaxWidthForPath("/")).toBe(1520);
    expect(mainMaxWidthForPath("/scope")).toBe(1180);
    expect(mainMaxWidthForPath("/testcases")).toBe(1180);
  });

  it("houdt logo en tooltitel links uitgelijnd in de header", () => {
    expect(headerContentLayout.maxWidth).toBe("none");
    expect(headerContentLayout.margin).toBe("0");
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

  it("normaliseert legacy maand-state van vóór de aparte jaarselect", () => {
    expect(refDatumVoorMaand(undefined, "2026-04")).toBe("2026-04-01");
    expect(refDatumVoorMaand(undefined, "04")).toBe("2026-04-01");
  });

  it("activeert maandgebonden regels vanaf de eerste dag van de gekozen maand", () => {
    expect(
      fietsvergoeding({
        kmPerDag: 8,
        arbeidsdagen: 22,
        refDatum: refDatumVoorMaand("2026", "09"),
      }).tariefPerKm,
    ).toBe(0.27);

    expect(
      fietsvergoeding({
        kmPerDag: 8,
        arbeidsdagen: 22,
        refDatum: refDatumVoorMaand("2026", "10"),
      }).tariefPerKm,
    ).toBe(0.32);
  });
});

describe("Eindejaarspremie checkbox", () => {
  it("rekent Ja als 12 maanden en Nee als 0 maanden", () => {
    expect(eindejaarspremieMaandenVoorCheckbox(true)).toEqual({
      ancienniteitMaanden: 12,
      prestatieMaanden: 12,
    });
    expect(eindejaarspremieMaandenVoorCheckbox(false)).toEqual({
      ancienniteitMaanden: 0,
      prestatieMaanden: 0,
    });
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
    const html = renderToStaticMarkup(createElement(HomePage));
    const css = readFileSync("src/index.css", "utf8");

    expect(html).toContain("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
    expect(html).toContain("text-2xl sm:text-3xl");
    expect(css).toContain("max-width: 100% !important;");
    expect(css).not.toContain("max-width: calc(100vw - 84px)");
  });

  it("markeert toggle- en accordionstate voor assistieve technologie", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-expanded="false"');
  });

  it("toont de BV-gezinsvelden in Wie ben je? card", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Gezinstype (voor BV)")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Kinderen ten laste")).toBeGreaterThanOrEqual(0);
    expect(html).not.toContain("Kinderen < 3 jaar");
    expect(html).not.toContain("Extra BV-vermindering");
    expect(html.indexOf("Statuut")).toBeLessThan(html.indexOf("Gezinstype (voor BV)"));
  });

  it("benoemt partner zonder of beperkt beroepsinkomen als lagere BV, niet als ten laste", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen");
  });

  it("toont geen BBSZ-scenario meer (afgeleid van gezinstype)", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).not.toContain("BBSZ-scenario");
  });

  it("toont geen invoerveld meer voor gemeentebelasting", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).not.toContain("Gemeentebelasting (%)");
  });

  it("toont extra looncomponenten accordion", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Extra looncomponenten")).toBeGreaterThanOrEqual(0);
  });

  it("toont geen pro-rata velden voor de eindejaarspremie", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Eindejaarspremie");
    expect(html).toContain("Eindejaarspremie toepassen");
    expect(html).not.toContain("Anciënniteit (maanden)");
    expect(html).not.toContain("Prestatie (maanden)");
  });

  it("toont maaltijdcheques accordion header", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Extra looncomponenten");
    expect(html).toContain("maaltijdcheques");
  });

  it("plaatst werkgeversbijdragen als laatste invulsectie", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Woon-werk verkeer")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Werkgeversbijdragen")).toBeGreaterThan(html.indexOf("Woon-werk verkeer"));
  });

  it("plaatst tewerkstelling in de arbeidscontext card", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Arbeidscontext")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Ervaring")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Tewerkstelling (%)")).toBeGreaterThanOrEqual(0);
  });
});

describe("Netto-overzicht", () => {
  it("toont de loonfiche-labels in de verwachte volgorde", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

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
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).not.toContain("VAA bedrijfswagen");
    expect(html).not.toContain("Terugname VAA");
  });

  it("toont aparte maand- en jaaroverzichtskaders voor netto en werkgeverskost", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Netto berekening (per maand)");
    expect(html).toContain("Netto jaaroverzicht");
    expect(html).toContain("Loonkost werkgever (per maand)");
    expect(html).toContain("Loonkost werkgever (per jaar)");
    expect(html).toContain("WERKGEVERSKOST");
  });

  it("toont geen technische BV-validatiedisclaimer in het netto-paneel", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).not.toContain("Tax-Calc is alleen een latere PB-raming");
    expect(html).not.toContain("FOD Bijlage III:");
  });

  it("houdt technische berekeningsdetails uit de zichtbare calculatorcopy", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).not.toContain("fod_bijlage_iii_ok");
    expect(html).not.toContain("bijlage_iii_sleutelformule_2026");
    expect(html).not.toContain("33,14% × A + 52,54% × B");
    expect(html).not.toContain("÷ 3");
    expect(html).not.toContain("Totale loonkost — smal");
    expect(html).not.toContain("Effectieve RSZ");
  });

  it("behoudt de kernlabels in gebruikersgerichte taal", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("RSZ werknemer");
    expect(html).toContain("Loon na RSZ en werkbonus");
    expect(html).toContain("Bedrijfsvoorheffing");
    expect(html).toContain("Bijzondere bijdrage sociale zekerheid");
    expect(html).toContain("Aanvullende gemeentebelasting");
    expect(html).toContain("Loonwig");
    expect(html).toContain("Loonkost zonder voordelen");
  });

  it("toont de VAA-werkmiddelen in de extra looncomponenten accordion", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Extra looncomponenten");
  });

  it("toont standaard geen nettoloon inclusief maaltijdcheques", () => {
    const html = renderToStaticMarkup(createElement(HomePage));
    const tekst = html.replace(/\u00a0/g, " ");

    expect(tekst).not.toContain("Nettoloon incl. maaltijdcheques");
  });

  it("toont standaard geen netto jaarloon inclusief maaltijdcheques", () => {
    const html = renderToStaticMarkup(createElement(HomePage));
    const tekst = html.replace(/\u00a0/g, " ");

    expect(tekst).not.toContain("Netto jaarloon incl. maaltijdcheques");
  });
});
