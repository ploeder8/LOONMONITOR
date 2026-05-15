import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { fietsvergoeding } from "@/lib/fietsvergoeding";
import {
  aantalWeekdagenInMaand,
  eindejaarspremieMaandenVoorCheckbox,
  percentageNaarTewerkstellingsbreuk,
  refDatumVoorMaand,
  tewerkstellingsbreukNaarPercentage,
  HomePage,
} from "@/pages/HomePage";

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

describe("Profiel formulier", () => {
  it("toont de BV-gezinsvelden boven Statuut", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Gezinstype (voor BV)")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Kinderen ten laste")).toBeGreaterThanOrEqual(0);
    expect(html).not.toContain("Kinderen < 3 jaar");
    expect(html).not.toContain("Extra BV-vermindering");
    expect(html.indexOf("Gezinstype (voor BV)")).toBeLessThan(html.indexOf("Statuut"));
    expect(html.indexOf("Kinderen ten laste")).toBeLessThan(html.indexOf("Statuut"));
  });

  it("benoemt partner zonder of beperkt beroepsinkomen als lagere BV, niet als ten laste", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen");
    expect(html).toContain("Een partner is fiscaal niet ten laste.");
    expect(html).toContain("wat de bedrijfsvoorheffing verlaagt en het geraamde nettoloon verhoogt");
  });

  it("plaatst de eigen bijdrage groepsverzekering onder bijkomende looncomponenten", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Bijkomende looncomponenten")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Groepsverz. eigen bijdrage (€/m)")).toBeGreaterThan(
      html.indexOf("Bijkomende looncomponenten"),
    );
  });

  it("plaatst werkgeversbijdragen als laatste invulsectie", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Woon-werk verkeer")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Werkgeversbijdragen")).toBeGreaterThan(html.indexOf("Woon-werk verkeer"));
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
      "Terugname VAA",
      "Nettoloon",
    ];
    const positions = labels.map((label) => html.indexOf(label));

    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0);
    }

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("toont de VAA-werkmiddelen als bijkomende looncomponenten", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html).toContain("VAA werkmiddelen");
    expect(html).toContain("Laptop / pc");
    expect(html).toContain("GSM / smartphone");
    expect(html).toContain("Internet");
    expect(html).toContain("Telefoonabonnement");
  });
});
