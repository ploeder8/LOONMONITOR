import { DEFAULTS, normaliseerProfiel, type Profiel } from "@/lib/profiel";
import { berekenProfielKernOutputs } from "@/lib/profielBerekeningen";

type CsvWaarde = string | number | boolean | null;

const INPUT_KOLOMMEN = Object.keys(DEFAULTS) as Array<keyof Profiel>;
const OUTPUT_KOLOMMEN = [
  "output_bruto",
  "output_netto",
  "output_werkgeverskost_maand",
  "output_loonwig_pct",
  "output_netto_jaar",
  "output_werkgeverskost_jaar",
] as const;
const METADATA_KOLOMMEN = ["commentaar"] as const;
const ALLE_KOLOMMEN = [...INPUT_KOLOMMEN, ...METADATA_KOLOMMEN, ...OUTPUT_KOLOMMEN];

export function bouwCsvExportRij({
  profiel,
  commentaar,
}: {
  profiel: Profiel;
  commentaar: string;
}): Record<string, CsvWaarde> {
  const outputs = berekenProfielKernOutputs(profiel);
  const rij: Record<string, CsvWaarde> = {};

  for (const kolom of INPUT_KOLOMMEN) rij[kolom] = profiel[kolom];
  rij.commentaar = commentaar;
  rij.output_bruto = outputs.bruto;
  rij.output_netto = outputs.netto;
  rij.output_werkgeverskost_maand = outputs.werkgeverskostMaand;
  rij.output_loonwig_pct = outputs.loonwigPct === null ? null : outputs.loonwigPct * 100;
  rij.output_netto_jaar = outputs.nettoJaar;
  rij.output_werkgeverskost_jaar = outputs.werkgeverskostJaar;

  return rij;
}

export function profielNaarCsv({
  profiel,
  commentaar,
}: {
  profiel: Profiel;
  commentaar: string;
}): string {
  const rij = bouwCsvExportRij({ profiel, commentaar });
  return [
    ALLE_KOLOMMEN.map(escapeCsvWaarde).join(";"),
    ALLE_KOLOMMEN.map((kolom) => escapeCsvWaarde(rij[kolom] ?? "")).join(";"),
  ].join("\n");
}

export function profielUitCsv(csv: string): { profiel: Profiel; commentaar: string } {
  const rijen = parseCsv(csv);
  if (rijen.length < 2) throw new Error("CSV bevat geen datarij.");

  const headers = rijen[0].map((header) => header.trim());
  const waarden = rijen[1];
  const profiel: Profiel = { ...DEFAULTS };
  let commentaar = "";

  headers.forEach((header, index) => {
    const waarde = waarden[index] ?? "";
    if (header === "commentaar") {
      commentaar = waarde;
      return;
    }
    if (!isInputKolom(header) || waarde === "") return;
    profiel[header] = parseProfielWaarde(header, waarde) as never;
  });

  return { profiel: normaliseerProfiel(profiel), commentaar };
}

export function normaliseerCsvBestandsnaam(naam: string, vandaag: string): string {
  const trimmed = naam.trim();
  if (trimmed === "") return `${vandaag}-jaakie-export.csv`;
  return trimmed.toLowerCase().endsWith(".csv") ? trimmed : `${trimmed}.csv`;
}

export function standaardCsvNaamPrefix(vandaag = new Date()): string {
  return `${lokaleDatumString(vandaag)}-`;
}

function isInputKolom(kolom: string): kolom is keyof Profiel {
  return Object.prototype.hasOwnProperty.call(DEFAULTS, kolom);
}

function parseProfielWaarde<K extends keyof Profiel>(kolom: K, waarde: string): Profiel[K] {
  const voorbeeld = DEFAULTS[kolom];
  if (typeof voorbeeld === "boolean") return parseBoolean(waarde) as Profiel[K];
  if (typeof voorbeeld === "number") return parseNumber(waarde) as Profiel[K];
  return waarde as Profiel[K];
}

function parseBoolean(waarde: string): boolean {
  const genormaliseerd = waarde.trim().toLowerCase();
  return genormaliseerd === "true" || genormaliseerd === "1" || genormaliseerd === "ja";
}

function parseNumber(waarde: string): number {
  const normalised = waarde.trim().replace(",", ".");
  const parsed = Number(normalised);
  return Number.isFinite(parsed) ? parsed : 0;
}

function lokaleDatumString(datum: Date): string {
  const jaar = datum.getFullYear();
  const maand = String(datum.getMonth() + 1).padStart(2, "0");
  const dag = String(datum.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

function escapeCsvWaarde(waarde: CsvWaarde): string {
  if (waarde === null) return "";
  const tekst = String(waarde);
  if (!/[;"\r\n]/.test(tekst)) return tekst;
  return `"${tekst.replaceAll('"', '""')}"`;
}

function parseCsv(csv: string): string[][] {
  const rijen: string[][] = [];
  let rij: string[] = [];
  let veld = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        veld += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ";" && !inQuotes) {
      rij.push(veld);
      veld = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      rij.push(veld);
      rijen.push(rij);
      rij = [];
      veld = "";
      continue;
    }

    veld += char;
  }

  rij.push(veld);
  rijen.push(rij);
  return rijen.filter((item) => item.some((veldWaarde) => veldWaarde.trim() !== ""));
}
