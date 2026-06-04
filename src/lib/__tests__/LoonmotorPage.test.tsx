import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULTS } from "@/lib/profiel";
import { createLeegBedrijf, createMedewerkerVoorBedrijf } from "@/lib/loonmotor";
import { LoonmotorPage } from "@/pages/LoonmotorPage";

describe("LoonmotorPage", () => {
  it("toont de lege dossiercockpit met KBO-ophaalactie", () => {
    const html = renderToStaticMarkup(createElement(LoonmotorPage, { initialDossiers: [] }));

    expect(html).toContain("Loonmotor");
    expect(html).toContain("Ondernemingsnummer");
    expect(html).toContain("Ophalen uit KBO");
    expect(html).toContain("Handmatig bedrijf aanmaken");
    expect(html).toContain("Lokale concepten");
  });

  it("toont een bedrijf met medewerkers en indicatieve payrollcijfers", () => {
    const bedrijf = {
      ...createLeegBedrijf("bedrijf-1"),
      naam: "Jaakie Payroll BV",
      ondernemingsnummer: "0452.085.227",
      rechtsvorm: "BV",
      adres: {
        straat: "Kerkstraat",
        huisnummer: "12",
        postcode: "2000",
        gemeente: "Antwerpen",
      },
    };
    const medewerker = createMedewerkerVoorBedrijf(bedrijf, "wn-1", {
      ...DEFAULTS,
      werknemerNaam: "Jan Peeters",
      werknemerReferentie: "JP",
      brutoloon: 3200,
      werkgeverNaam: bedrijf.naam,
      werkgeverOndernemingsnummer: bedrijf.ondernemingsnummer,
    });

    const html = renderToStaticMarkup(
      createElement(LoonmotorPage, {
        initialDossiers: [{ bedrijf, medewerkers: [medewerker] }],
      }),
    );

    expect(html).toContain("Jaakie Payroll BV");
    expect(html).toContain("0452.085.227");
    expect(html).toContain("Jan Peeters");
    expect(html).toContain("Indicatief netto");
    expect(html).toContain("Open in calculator");
  });

  it("toont acties om extra bedrijven toe te voegen en het geselecteerde bedrijf te verwijderen", () => {
    const bedrijf = {
      ...createLeegBedrijf("bedrijf-1"),
      naam: "Jaakie Payroll BV",
      ondernemingsnummer: "0452.085.227",
    };

    const html = renderToStaticMarkup(
      createElement(LoonmotorPage, {
        initialDossiers: [{ bedrijf, medewerkers: [] }],
      }),
    );

    expect(html).toContain("Bedrijf toevoegen");
    expect(html).toContain("Ophalen uit KBO");
    expect(html).toContain("Handmatig bedrijf aanmaken");
    expect(html).toContain("Bedrijf verwijderen");
    expect(html).toContain("verwijdert ook alle medewerkers");
  });
});
