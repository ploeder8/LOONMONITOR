import { DEFAULTS, normaliseerProfiel, type Profiel } from "@/lib/profiel";

export const LOONMOTOR_STORAGE_KEY = "jaakie:loonmotor:dossiers:v1";

export interface LoonmotorAdres {
  straat: string;
  huisnummer: string;
  postcode: string;
  gemeente: string;
}

export interface LoonmotorBedrijfsDefaults {
  arbeidsongevallenPct: number;
  maaltijdchequesActief: boolean;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  groepsverzekeringWerkgeverPerMaand: number;
  hospitalisatieWerkgeverPerMaand: number;
  eersteAanwerving: boolean;
}

export interface LoonmotorBedrijf {
  id: string;
  ondernemingsnummer: string;
  naam: string;
  rechtsvorm: string;
  boekjaareinde: string;
  adres: LoonmotorAdres;
  contactpersoon: string;
  email: string;
  telefoon: string;
  pcScope: "200";
  defaults: LoonmotorBedrijfsDefaults;
  conceptStatus: "lokaal_concept" | "backend_pending";
  bron: "handmatig" | "kbo";
  notities: string;
  bijgewerktOp: string;
}

export interface LoonmotorMedewerker {
  id: string;
  bedrijfId: string;
  naam: string;
  referentie: string;
  insz: string;
  geboortedatum: string;
  startdatum: string;
  einddatum: string;
  statuut: Profiel["statuut"];
  functie: string;
  schaal: Profiel["schaal"];
  cat: Profiel["cat"];
  ervaringJaren: number;
  profiel: Profiel;
  status: "concept" | "te_controleren";
}

export interface LoonmotorDossier {
  bedrijf: LoonmotorBedrijf;
  medewerkers: LoonmotorMedewerker[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface LoonmotorDossierMutationResult {
  dossiers: LoonmotorDossier[];
  selectedId: string;
}

export function createLeegBedrijf(id = createLocalId("bedrijf")): LoonmotorBedrijf {
  return {
    id,
    ondernemingsnummer: "",
    naam: "",
    rechtsvorm: "",
    boekjaareinde: "",
    adres: {
      straat: "",
      huisnummer: "",
      postcode: "",
      gemeente: "",
    },
    contactpersoon: "",
    email: "",
    telefoon: "",
    pcScope: "200",
    defaults: {
      arbeidsongevallenPct: DEFAULTS.arbeidsongevallenPct,
      maaltijdchequesActief: DEFAULTS.maaltijdchequesActief,
      maaltijdchequeWerkgeversaandeelPerDag: DEFAULTS.maaltijdchequeWerkgeversaandeelPerDag,
      maaltijdchequeWerknemersbijdragePerDag: DEFAULTS.maaltijdchequeWerknemersbijdragePerDag,
      groepsverzekeringWerkgeverPerMaand: DEFAULTS.extraGroepsverzekering,
      hospitalisatieWerkgeverPerMaand: DEFAULTS.extraHospitalisatie,
      eersteAanwerving: false,
    },
    conceptStatus: "lokaal_concept",
    bron: "handmatig",
    notities: "",
    bijgewerktOp: new Date().toISOString(),
  };
}

export function createMedewerkerVoorBedrijf(
  bedrijf: LoonmotorBedrijf,
  id = createLocalId("wn"),
  profiel: Profiel = DEFAULTS,
): LoonmotorMedewerker {
  const nextProfiel = normaliseerProfiel({
    ...profiel,
    werkgeverNaam: bedrijf.naam,
    werkgeverOndernemingsnummer: bedrijf.ondernemingsnummer,
    arbeidsongevallenPct: bedrijf.defaults.arbeidsongevallenPct,
    maaltijdchequesActief: bedrijf.defaults.maaltijdchequesActief,
    maaltijdchequeWerkgeversaandeelPerDag: bedrijf.defaults.maaltijdchequeWerkgeversaandeelPerDag,
    maaltijdchequeWerknemersbijdragePerDag: bedrijf.defaults.maaltijdchequeWerknemersbijdragePerDag,
    extraGroepsverzekering: bedrijf.defaults.groepsverzekeringWerkgeverPerMaand,
    extraHospitalisatie: bedrijf.defaults.hospitalisatieWerkgeverPerMaand,
  });
  return {
    id,
    bedrijfId: bedrijf.id,
    naam: nextProfiel.werknemerNaam,
    referentie: nextProfiel.werknemerReferentie,
    insz: "",
    geboortedatum: "",
    startdatum: `${nextProfiel.berekeningsJaar}-01-01`,
    einddatum: "",
    statuut: nextProfiel.statuut,
    functie: "",
    schaal: nextProfiel.schaal,
    cat: nextProfiel.cat,
    ervaringJaren: nextProfiel.ervaringJaren,
    profiel: nextProfiel,
    status: "concept",
  };
}

export function readLoonmotorDossiers(storage: StorageLike | undefined = browserStorage()): LoonmotorDossier[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LOONMOTOR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LoonmotorDossier[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLoonmotorDossiers(
  storage: StorageLike | undefined = browserStorage(),
  dossiers: LoonmotorDossier[],
): void {
  if (!storage) return;
  storage.setItem(LOONMOTOR_STORAGE_KEY, JSON.stringify(dossiers));
}

export function prependLoonmotorDossier(
  dossiers: LoonmotorDossier[],
  bedrijf: LoonmotorBedrijf,
): LoonmotorDossierMutationResult {
  return {
    dossiers: [{ bedrijf, medewerkers: [] }, ...dossiers],
    selectedId: bedrijf.id,
  };
}

export function removeLoonmotorDossier(
  dossiers: LoonmotorDossier[],
  bedrijfId: string,
): LoonmotorDossierMutationResult {
  const index = dossiers.findIndex((dossier) => dossier.bedrijf.id === bedrijfId);
  if (index < 0) {
    return {
      dossiers,
      selectedId: dossiers[0]?.bedrijf.id ?? "",
    };
  }
  const next = dossiers.filter((dossier) => dossier.bedrijf.id !== bedrijfId);
  return {
    dossiers: next,
    selectedId: next[index]?.bedrijf.id ?? next[index - 1]?.bedrijf.id ?? next[0]?.bedrijf.id ?? "",
  };
}

export function maskInsz(insz: string): string {
  const compact = insz.replace(/\D/g, "");
  if (!compact) return "";
  const visible = compact.slice(-3);
  return `${"*".repeat(Math.max(0, compact.length - 2))}${visible.slice(0, 1)}.${visible.slice(1)}`;
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function browserStorage(): StorageLike | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage;
}
