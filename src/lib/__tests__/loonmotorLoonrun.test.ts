import { describe, expect, it } from "bun:test";
import { DEFAULTS } from "@/lib/profiel";
import { createLeegBedrijf, createMedewerkerVoorBedrijf, type LoonmotorDossier } from "@/lib/loonmotor";
import {
  bepaalLoonmotorReadiness,
  loonmotorMedewerkerNaarLoonrunInput,
  loonmotorMedewerkersNaarLoonrunInputs,
} from "@/lib/loonmotorLoonrun";

describe("Loonmotor naar Loonrun", () => {
  it("mapt een loonmotormedewerker naar loonruninput met bronvelden", () => {
    const bedrijf = {
      ...createLeegBedrijf("bedrijf-1"),
      naam: "Jaakie Payroll BV",
      ondernemingsnummer: "0452.085.227",
    };
    const medewerker = {
      ...createMedewerkerVoorBedrijf(bedrijf, "wn-1", {
        ...DEFAULTS,
        werknemerNaam: "Jan Peeters",
        werknemerReferentie: "JP",
        brutoloon: 3200,
      }),
      insz: "85.07.30-123.45",
      status: "te_controleren" as const,
    };

    const input = loonmotorMedewerkerNaarLoonrunInput(medewerker);

    expect(input).toMatchObject({
      id: "wn-1",
      naam: "Jan Peeters",
      status: "te_controleren",
      insz: "85.07.30-123.45",
      bronBedrijfId: "bedrijf-1",
      bronMedewerkerId: "wn-1",
    });
    expect(input.profiel.werkgeverNaam).toBe("Jaakie Payroll BV");
  });

  it("valt voor naam terug op profielnaam, referentie en daarna vaste tekst", () => {
    const bedrijf = createLeegBedrijf("bedrijf-1");
    const metProfielnaam = createMedewerkerVoorBedrijf(bedrijf, "wn-1", { ...DEFAULTS, werknemerNaam: "Profielnaam" });
    const metReferentie = { ...createMedewerkerVoorBedrijf(bedrijf, "wn-2", { ...DEFAULTS, werknemerNaam: "", werknemerReferentie: "REF" }), naam: "" };
    const zonderNaam = { ...createMedewerkerVoorBedrijf(bedrijf, "wn-3", { ...DEFAULTS, werknemerNaam: "", werknemerReferentie: "" }), naam: "", referentie: "" };

    expect(loonmotorMedewerkersNaarLoonrunInputs([metProfielnaam, metReferentie, zonderNaam]).map((input) => input.naam)).toEqual([
      "Profielnaam",
      "REF",
      "Naam ontbreekt",
    ]);
  });

  it("bepaalt readiness voor lege, onvolledige en volledige dossiers", () => {
    const leegBedrijf = createLeegBedrijf("bedrijf-leeg");
    const onvolledigBedrijf = createLeegBedrijf("bedrijf-onvolledig");
    const volledigBedrijf = {
      ...createLeegBedrijf("bedrijf-volledig"),
      naam: "Jaakie Payroll BV",
      ondernemingsnummer: "0452.085.227",
    };
    const onvolledigeMedewerker = createMedewerkerVoorBedrijf(onvolledigBedrijf, "wn-1", {
      ...DEFAULTS,
      werknemerNaam: "",
      werknemerReferentie: "",
      werkgeverNaam: "",
      werkgeverOndernemingsnummer: "",
    });
    const volledigeMedewerker = createMedewerkerVoorBedrijf(volledigBedrijf, "wn-2", {
      ...DEFAULTS,
      werknemerNaam: "Jan Peeters",
      werkgeverNaam: volledigBedrijf.naam,
      werkgeverOndernemingsnummer: volledigBedrijf.ondernemingsnummer,
    });
    const leeg: LoonmotorDossier = { bedrijf: leegBedrijf, medewerkers: [] };
    const onvolledig: LoonmotorDossier = { bedrijf: onvolledigBedrijf, medewerkers: [onvolledigeMedewerker] };
    const volledig: LoonmotorDossier = { bedrijf: volledigBedrijf, medewerkers: [volledigeMedewerker] };

    expect(bepaalLoonmotorReadiness(leeg)).toBe("geen_medewerkers");
    expect(bepaalLoonmotorReadiness(onvolledig)).toBe("aandacht_nodig");
    expect(bepaalLoonmotorReadiness(volledig)).toBe("klaar_voor_loonrun");
  });
});
