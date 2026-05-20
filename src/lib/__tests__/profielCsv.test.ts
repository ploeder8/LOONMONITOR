import { describe, expect, it } from "bun:test";

import { DEFAULTS } from "@/lib/profiel";
import {
  bouwCsvExportRij,
  normaliseerCsvBestandsnaam,
  profielNaarCsv,
  profielUitCsv,
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
