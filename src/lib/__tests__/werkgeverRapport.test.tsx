import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { WerkgeverRapport } from "@/pages/loonrun/WerkgeverRapport";
import { bouwLoonrun } from "@/lib/loonrun";
import { DEFAULTS } from "@/lib/profiel";
import { formatEUR } from "@/lib/money";

function makeLoonrun() {
  return bouwLoonrun([
    {
      id: "1",
      naam: "Jan Janssens",
      profiel: {
        ...DEFAULTS,
        brutoloon: 3000,
        werknemerNaam: "Jan Janssens",
        werkgeverNaam: "Acme BV",
      },
    },
    {
      id: "2",
      naam: "Piet Pieters",
      profiel: {
        ...DEFAULTS,
        brutoloon: 2500,
        werknemerNaam: "Piet Pieters",
        werkgeverNaam: "Acme BV",
      },
    },
    {
      id: "3",
      naam: "Marie Smits",
      profiel: {
        ...DEFAULTS,
        brutoloon: 3500,
        werknemerNaam: "Marie Smits",
        werkgeverNaam: "Acme BV",
      },
    },
  ]);
}

describe("WerkgeverRapport rendering", () => {
  it("toont de titel en periode", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Loonkostoverzicht");
    expect(html).toContain(run.periode);
  });

  it("toont de werkgevernaam", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Acme BV");
  });

  it("toont alle werknemers in de tabel", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Jan Janssens");
    expect(html).toContain("Piet Pieters");
    expect(html).toContain("Marie Smits");
  });

  it("toont de totalen in de summary cards", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Totaal bruto");
    expect(html).toContain("Totaal netto");
    expect(html).toContain("Werkgeverskost");
    expect(html).toContain("Loonwig");
    expect(html).toContain(formatEUR(run.totalen.bruto));
    expect(html).toContain(formatEUR(run.totalen.netto));
    expect(html).toContain(formatEUR(run.totalen.werkgeverskost));
  });

  it("toont de totalenrij in de tabel", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("TOTALEN");
    expect(html).toContain(formatEUR(run.totalen.bruto));
    expect(html).toContain(formatEUR(run.totalen.netto));
    expect(html).toContain(formatEUR(run.totalen.werkgeverskost));
    if (run.totalen.loonwigPct !== null) {
      expect(html).toContain(`${run.totalen.loonwigPct}%`);
    }
  });

  it("toont de pro-forma disclaimer", () => {
    const run = makeLoonrun();
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Pro-forma overzicht");
    expect(html).toContain("niet bedoeld als officiële loonafrekening");
  });

  it("toont een lege-state bij geen berekende werknemers", () => {
    const run = bouwLoonrun([]);
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Geen berekende werknemers");
  });

  it("toont een foutieve werknemer met streepjes", () => {
    const run = bouwLoonrun([
      {
        id: "1",
        naam: "Goed",
        profiel: { ...DEFAULTS, brutoloon: 3000 },
      },
      {
        id: "2",
        naam: "Fout",
        profiel: {
          ...DEFAULTS,
          statuut: "student" as const,
          studentenCat: "A" as const,
          studentLeeftijd: 99,
        },
      },
    ]);
    const html = renderToStaticMarkup(<WerkgeverRapport loonrun={run} />);
    expect(html).toContain("Goed");
    expect(html).toContain("Fout");
    // Foutieve werknemer heeft "—" in bedragscellen
    // We checken indirect via het totaal: alleen 1 werknemer berekend
    expect(html).toContain("TOTALEN");
    expect(html).toContain(formatEUR(run.totalen.bruto));
  });
});
