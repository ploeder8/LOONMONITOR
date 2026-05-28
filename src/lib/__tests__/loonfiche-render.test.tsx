import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LoonficheDocument } from "@/pages/loonfiche/LoonficheDocument";
import { bouwLoonficheVoorProfiel } from "@/lib/loonfiche";
import { DEFAULTS } from "@/lib/profiel";

const loonfiche = bouwLoonficheVoorProfiel(DEFAULTS);

describe("LoonficheDocument rendering", () => {
  it("rendert het pro-forma label", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} />,
    );
    expect(html).toContain("Pro-forma loonfiche");
    expect(html).toContain("geen officiële loonbrief");
  });

  it("toont 'Netto te betalen' in het totalenblok", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} />,
    );
    expect(html).toContain("Netto te betalen");
  });

  it("toont de periode", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} />,
    );
    expect(html).toContain("juni 2026");
  });

  it("toont werknemer-/werkgever-/prestatieblokken", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} />,
    );
    expect(html).toContain("Werknemer");
    expect(html).toContain("Werkgever");
    expect(html).toContain("Prestatie");
  });

  it("toont werknemer- en werkgeverwaarden wanneer ingevuld", () => {
    const profiel = {
      ...DEFAULTS,
      werknemerNaam: "Jan Jansen",
      werknemerReferentie: "W12345",
      werkgeverNaam: "Acme BV",
      werkgeverOndernemingsnummer: "0123.456.789",
    };
    const lf = bouwLoonficheVoorProfiel(profiel);
    const html = renderToStaticMarkup(<LoonficheDocument loonfiche={lf} />);
    expect(html).toContain("Jan Jansen");
    expect(html).toContain("W12345");
    expect(html).toContain("Acme BV");
    expect(html).toContain("0123.456.789");
  });

  it("toont em-dash voor lege identificatievelden", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} />,
    );
    expect(html).toContain("—");
  });

  it("toont audit-sectie wanneer toonBronnen=true", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} toonBronnen={true} />,
    );
    expect(html).toContain("Bronvermelding");
  });

  it("verbergt audit-sectie wanneer toonBronnen=false", () => {
    const html = renderToStaticMarkup(
      <LoonficheDocument loonfiche={loonfiche} toonBronnen={false} />,
    );
    expect(html).not.toContain("Bronvermelding");
  });
});
