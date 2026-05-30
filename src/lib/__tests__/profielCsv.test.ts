import { describe, expect, it } from "bun:test";

import { DEFAULTS } from "@/lib/profiel";
import { bonusJaarbedragVoorProfiel } from "@/lib/profielBerekeningen";
import {
  bouwCsvExportRij,
  normaliseerCsvBestandsnaam,
  profielNaarCsv,
  profielUitCsv,
  profielenUitCsv,
  standaardCsvNaamPrefix,
} from "@/lib/profielCsv";

describe("profielCsv", () => {
  it("roundtript het default profiel met commentaar", () => {
    const commentaar = "Tester merkt op: trein; fiets en \"netto\" controleren\nTweede lijn";
    const csv = profielNaarCsv({ profiel: DEFAULTS, commentaar });
    const parsed = profielUitCsv(csv);

    expect(parsed.profiel).toEqual(DEFAULTS);
    expect(parsed.commentaar).toBe(commentaar);
  });

  it("negeert outputkolommen en onbekende kolommen bij import", () => {
    const csv = [
      "brutoloon;output_netto;output_werkgeverskost_maand;onbekend;commentaar",
      "3000;9999;8888;waarde;Import met oude output",
    ].join("\n");

    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.brutoloon).toBe(3000);
    expect(parsed.profiel).not.toHaveProperty("output_netto");
    expect(parsed.profiel).not.toHaveProperty("onbekend");
    expect(parsed.commentaar).toBe("Import met oude output");
  });

  it("parset booleans, numbers en strings naar profielwaarden", () => {
    const csv = [
      "bouwVlag;woonwerkTrein;ervaringJaren;tewerkstellingsbreuk;schaal;gezinstype",
      "true;false;12;0.8;II;gehuwd_zonder_inkomen",
    ].join("\n");

    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.bouwVlag).toBe(true);
    expect(parsed.profiel.woonwerkTrein).toBe(false);
    expect(parsed.profiel.ervaringJaren).toBe(12);
    expect(parsed.profiel.tewerkstellingsbreuk).toBe(0.8);
    expect(parsed.profiel.schaal).toBe("II");
    expect(parsed.profiel.gezinstype).toBe("gehuwd_zonder_inkomen");
  });

  it("behoudt pro-rata eindejaarspremievelden uit CSV import", () => {
    const csv = [
      "brutoloon;ancienniteitMaanden;prestatieMaanden;commentaar",
      "4000;4;6;oude pro-rata export",
    ].join("\n");

    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.brutoloon).toBe(4000);
    expect(parsed.profiel.ancienniteitMaanden).toBe(4);
    expect(parsed.profiel.prestatieMaanden).toBe(6);
  });

  it("behoudt eindejaarspremie uit bij oude CSV met nul prestaties", () => {
    const csv = [
      "brutoloon;ancienniteitMaanden;prestatieMaanden;commentaar",
      "4000;0;0;geen eindejaarspremie",
    ].join("\n");

    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.ancienniteitMaanden).toBe(0);
    expect(parsed.profiel.prestatieMaanden).toBe(0);
  });

  it("schrijft kernoutputkolommen in de exportrij", () => {
    const rij = bouwCsvExportRij({ profiel: DEFAULTS, commentaar: "baseline" });

    expect(rij.commentaar).toBe("baseline");
    expect(rij.output_bruto).toBe(DEFAULTS.brutoloon);
    expect(typeof rij.output_netto).toBe("number");
    expect(typeof rij.output_werkgeverskost_maand).toBe("number");
    expect(typeof rij.output_loonwig_pct).toBe("number");
    expect(typeof rij.output_netto_jaar).toBe("number");
    expect(typeof rij.output_werkgeverskost_jaar).toBe("number");
  });

  it("exporteert identificatievelden als kolommen", () => {
    const profiel = {
      ...DEFAULTS,
      werknemerNaam: "Jan Jansen",
      werknemerReferentie: "W12345",
      werkgeverNaam: "Acme BV",
      werkgeverOndernemingsnummer: "0123.456.789",
    };
    const csv = profielNaarCsv({ profiel, commentaar: "" });

    expect(csv).toContain("werknemerNaam");
    expect(csv).toContain("werknemerReferentie");
    expect(csv).toContain("werkgeverNaam");
    expect(csv).toContain("werkgeverOndernemingsnummer");
    expect(csv).toContain("Jan Jansen");
    expect(csv).toContain("W12345");
    expect(csv).toContain("Acme BV");
    expect(csv).toContain("0123.456.789");
  });

  it("importeert oude CSV zonder identificatievelden als lege strings", () => {
    // Een "oude" CSV bevat alleen de kolommen die vóór fase 2 bestonden
    const csv = [
      "brutoloon;statuut;commentaar",
      "3000;bediende;oude export",
    ].join("\n");

    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.brutoloon).toBe(3000);
    expect(parsed.profiel.statuut).toBe("bediende");
    expect(parsed.profiel.werknemerNaam).toBe("");
    expect(parsed.profiel.werknemerReferentie).toBe("");
    expect(parsed.profiel.werkgeverNaam).toBe("");
    expect(parsed.profiel.werkgeverOndernemingsnummer).toBe("");
  });

  it("roundtript identificatievelden via CSV", () => {
    const profiel = {
      ...DEFAULTS,
      werknemerNaam: "Piet Peeters",
      werkgeverNaam: "Betaalbaar BV",
    };
    const csv = profielNaarCsv({ profiel, commentaar: "" });
    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.werknemerNaam).toBe("Piet Peeters");
    expect(parsed.profiel.werknemerReferentie).toBe("");
    expect(parsed.profiel.werkgeverNaam).toBe("Betaalbaar BV");
    expect(parsed.profiel.werkgeverOndernemingsnummer).toBe("");
  });

  it("roundtript bonusvelden via CSV", () => {
    const profiel = {
      ...DEFAULTS,
      bonusBedrag: 100,
      bonusPeriode: "maand" as const,
    };
    const csv = profielNaarCsv({ profiel, commentaar: "" });
    const parsed = profielUitCsv(csv);

    expect(parsed.profiel.bonusBedrag).toBe(100);
    expect(parsed.profiel.bonusPeriode).toBe("maand");
    expect(bonusJaarbedragVoorProfiel(parsed.profiel)).toBe(1200);
  });

  it("rekent een jaarbonus en maandbonus naar hetzelfde jaarbedrag om", () => {
    expect(bonusJaarbedragVoorProfiel({ ...DEFAULTS, bonusBedrag: 1200, bonusPeriode: "jaar" })).toBe(1200);
    expect(bonusJaarbedragVoorProfiel({ ...DEFAULTS, bonusBedrag: 100, bonusPeriode: "maand" })).toBe(1200);
  });

  it("parset multi-row CSV naar meerdere profielen", () => {
    const csv = [
      "brutoloon;statuut;gezinstype;kinderenTenLaste;werknemerNaam",
      "3000;bediende;alleenstaand;0;Jan Jansen",
      "2500;bediende;gehuwd_met_inkomen;2;Piet Peeters",
      "4000;student;alleenstaand;0;Sofie Student",
    ].join("\n");

    const parsed = profielenUitCsv(csv);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].profiel.brutoloon).toBe(3000);
    expect(parsed[0].profiel.statuut).toBe("bediende");
    expect(parsed[0].profiel.werknemerNaam).toBe("Jan Jansen");
    expect(parsed[0].rijNummer).toBe(1);

    expect(parsed[1].profiel.brutoloon).toBe(2500);
    expect(parsed[1].profiel.gezinstype).toBe("gehuwd_met_inkomen");
    expect(parsed[1].profiel.kinderenTenLaste).toBe(2);

    expect(parsed[2].profiel.statuut).toBe("student");
    expect(parsed[2].profiel.brutoloon).toBe(4000);
  });

  it("geeft fout bij lege multi-row CSV", () => {
    expect(() => profielenUitCsv("brutoloon\n")).toThrow("geen datarijen");
  });

  it("normaliseert CSV-bestandsnamen", () => {
    expect(standaardCsvNaamPrefix(new Date(2026, 4, 20))).toBe("2026-05-20-");
    expect(normaliseerCsvBestandsnaam("2026-05-20-test", "2026-05-20")).toBe(
      "2026-05-20-test.csv",
    );
    expect(normaliseerCsvBestandsnaam("2026-05-20-test.csv", "2026-05-20")).toBe(
      "2026-05-20-test.csv",
    );
    expect(normaliseerCsvBestandsnaam("   ", "2026-05-20")).toBe(
      "2026-05-20-jaakie-export.csv",
    );
  });
});
