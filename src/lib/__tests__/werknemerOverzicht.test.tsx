import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { WerknemerOverzicht } from "@/pages/home/WerknemerOverzicht";
import { DEFAULTS } from "@/lib/profiel";
import { formatEUR } from "@/lib/money";
import { berekenProfielKernOutputs } from "@/lib/profielBerekeningen";

describe("WerknemerOverzicht rendering", () => {
  it("toont de titel en periode", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Loonoverzicht");
    expect(html).toContain("juni 2026");
  });

  it("toont werknemer- en werkgever-metadata", () => {
    const profiel = {
      ...DEFAULTS,
      werknemerNaam: "Jan Jansen",
      werknemerReferentie: "W12345",
      werkgeverNaam: "Acme BV",
      werkgeverOndernemingsnummer: "0123.456.789",
    };
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel} />);
    expect(html).toContain("Jan Jansen");
    expect(html).toContain("W12345");
    expect(html).toContain("Acme BV");
    expect(html).toContain("0123.456.789");
  });

  it("toont de kerngetallen in summary cards", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Bruto");
    expect(html).toContain("Netto (maand)");
    expect(html).toContain("Werkgeverskost");
    expect(html).toContain("Loonwig");
    expect(html).toContain("Netto (jaar)");
    expect(html).toContain("WGK (jaar)");

    const outputs = berekenProfielKernOutputs(DEFAULTS);
    expect(html).toContain(formatEUR(outputs.bruto));
    if (outputs.netto !== null) {
      expect(html).toContain(formatEUR(outputs.netto));
    }
    if (outputs.werkgeverskostMaand !== null) {
      expect(html).toContain(formatEUR(outputs.werkgeverskostMaand));
    }
  });

  it("toont de netto componenten tabel", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Netto loon (maand)");
    expect(html).toContain("Brutoloon");
    expect(html).toContain("RSZ werknemer");
    expect(html).toContain("Belastbaar loon");
    expect(html).toContain("Bedrijfsvoorheffing");
    expect(html).toContain("Netto te betalen (cash)");
  });

  it("toont de werkgeverskost tabel", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Werkgeverskost (maand)");
    expect(html).toContain("RSZ werkgever");
    expect(html).toContain("Sociaal Fonds 200");
    expect(html).toContain("Totale werkgeverskost");
  });

  it("toont het jaaroverzicht", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Jaaroverzicht");
    expect(html).toContain("Werknemer (netto)");
    expect(html).toContain("Werkgever");
    expect(html).toContain("Totaal netto jaar");
    expect(html).toContain("Totaal loonkost jaar");
  });

  it("toont de pro-forma disclaimer", () => {
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS} />);
    expect(html).toContain("Pro-forma overzicht");
    expect(html).toContain("niet bedoeld als officiële loonafrekening");
  });

  it("toont studentenmodus voor studenten", () => {
    const profiel = { ...DEFAULTS, statuut: "student" as const };
    const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel} />);
    expect(html).toContain("Studentenmodus");
    expect(html).toContain("Voor studenten worden geen RSZ");
  });
});
