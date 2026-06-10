import type { LoonrunWerknemerInput } from "@/lib/loonrun";
import type { LoonmotorDossier, LoonmotorMedewerker } from "@/lib/loonmotor";
import { normaliseerProfiel } from "@/lib/profiel";

export type LoonmotorReadiness = "klaar_voor_loonrun" | "aandacht_nodig" | "geen_medewerkers";

export function loonmotorMedewerkerNaarLoonrunInput(medewerker: LoonmotorMedewerker): LoonrunWerknemerInput {
  const profiel = normaliseerProfiel(medewerker.profiel);
  return {
    id: medewerker.id,
    naam: medewerker.naam || profiel.werknemerNaam || medewerker.referentie || profiel.werknemerReferentie || "Naam ontbreekt",
    profiel,
    status: medewerker.status === "te_controleren" ? "te_controleren" : "concept",
    insz: medewerker.insz,
    bronBedrijfId: medewerker.bedrijfId,
    bronMedewerkerId: medewerker.id,
  };
}

export function loonmotorMedewerkersNaarLoonrunInputs(medewerkers: LoonmotorMedewerker[]): LoonrunWerknemerInput[] {
  return medewerkers.map(loonmotorMedewerkerNaarLoonrunInput);
}

export function bepaalLoonmotorReadiness(dossier: LoonmotorDossier): LoonmotorReadiness {
  if (dossier.medewerkers.length === 0) return "geen_medewerkers";
  if (!dossier.bedrijf.naam.trim() || !dossier.bedrijf.ondernemingsnummer.trim()) return "aandacht_nodig";
  const heeftMedewerkerZonderNaam = dossier.medewerkers.some((medewerker) => {
    const profiel = medewerker.profiel;
    return !medewerker.naam.trim() && !profiel.werknemerNaam.trim() && !medewerker.referentie.trim() && !profiel.werknemerReferentie.trim();
  });
  return heeftMedewerkerZonderNaam ? "aandacht_nodig" : "klaar_voor_loonrun";
}
