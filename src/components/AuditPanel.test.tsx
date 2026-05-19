import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AuditOpenProvider, AuditSourceGroup } from "@/components/AuditPanel";
import type { Datapunt } from "@/types/dataset";

function datapunt(overrides: Partial<Datapunt> = {}): Datapunt {
  return {
    id: "rsz_werknemer_basis",
    categorie: "rsz",
    subcategorie: "werknemer",
    type: "parameter",
    pc: "200",
    omschrijving: "RSZ werknemersbijdrage",
    waarde_bron: "13,07%",
    waarde_genormaliseerd: 0.1307,
    laatst_bevestigd_op: "2026-01-01",
    bron_organisatie: "RSZ",
    bron_titel: "Administratieve instructies",
    bron_url: "https://example.test/rsz",
    betrouwbaarheid: "Tier 1",
    status: "actief",
    ...overrides,
  };
}

describe("AuditSourceGroup", () => {
  it("toont standaard alleen een compacte bronnensamenvatting", () => {
    const html = renderToStaticMarkup(
      createElement(AuditSourceGroup, {
        datapunten: [
          datapunt(),
          datapunt({ id: "werkbonus_sociaal_luik_A_2026", betrouwbaarheid: "Tier 2" }),
        ],
      }),
    );

    expect(html).toContain("Bronnen");
    expect(html).toContain("2 datapunten");
    expect(html).toContain("1 Tier 1");
    expect(html).toContain("1 Tier 2");
    expect(html).not.toContain("RSZ werknemersbijdrage");
    expect(html).not.toContain("Administratieve instructies");
  });

  it("opent de bronlade wanneer alle bronnen globaal zichtbaar zijn", () => {
    const html = renderToStaticMarkup(
      createElement(AuditOpenProvider, {
        force: "all",
        children: createElement(AuditSourceGroup, { datapunten: [datapunt()] }),
      }),
    );

    expect(html).toContain("RSZ werknemersbijdrage");
    expect(html).toContain("Administratieve instructies");
    expect(html).toContain("https://example.test/rsz");
  });

  it("opent standaard wanneer een datapunt aandacht vraagt", () => {
    const html = renderToStaticMarkup(
      createElement(AuditSourceGroup, {
        datapunten: [
          datapunt({
            status: "conflict",
            conflict_opmerking: "Bronnen spreken elkaar tegen.",
          }),
        ],
      }),
    );

    expect(html).toContain("Bronnen spreken elkaar tegen.");
  });
});
