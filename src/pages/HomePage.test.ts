import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { fietsvergoeding } from "@/lib/fietsvergoeding";
import { DatapuntNietGeldigOpDatum } from "@/lib/errors";
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
        refDatum: refDatumVoorMaand("2026", "10"),
      }).tariefPerKm,
    ).toBe(0.32);

    expect(() =>
      fietsvergoeding({
        kmPerDag: 8,
        arbeidsdagen: 22,
        refDatum: refDatumVoorMaand("2026", "09"),
      }),
    ).toThrow(DatapuntNietGeldigOpDatum);
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
    expect(html.indexOf("Gezinstype (voor BV)")).toBeLessThan(html.indexOf("Statuut"));
    expect(html.indexOf("Kinderen ten laste")).toBeLessThan(html.indexOf("Statuut"));
  });

  it("plaatst de eigen bijdrage groepsverzekering onder bijkomende looncomponenten", () => {
    const html = renderToStaticMarkup(createElement(HomePage));

    expect(html.indexOf("Bijkomende looncomponenten")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf("Groepsverz. eigen bijdrage (€/m)")).toBeGreaterThan(
      html.indexOf("Bijkomende looncomponenten"),
    );
  });
});
