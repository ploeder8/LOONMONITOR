import { formatEUR } from "@/lib/money";
import type { Loonrun } from "@/lib/loonrun";

type CsvWaarde = string | number | null;

const KOLOMMEN = [
  "id",
  "naam",
  "cash_bruto",
  "bruto_rsz_basis",
  "belastbaar_voor_bv",
  "netto",
  "werkgeverskost",
  "loonwig_pct",
  "status",
  "validaties",
  "fout",
] as const;

export function loonrunNaarCsv(loonrun: Loonrun): string {
  const header = KOLOMMEN.map(escapeCsvWaarde).join(";");

  const rijen = loonrun.werknemers.map((w) => {
    const loonwig = w.loonfiche
      ? w.loonfiche.totalen.werkgeverskostMaand > 0
        ? round2(
            ((w.loonfiche.totalen.werkgeverskostMaand - w.loonfiche.totalen.nettoTeBetalen) /
              w.loonfiche.totalen.werkgeverskostMaand) *
              100,
          )
        : null
      : null;

    const waarden: Record<(typeof KOLOMMEN)[number], CsvWaarde> = {
      id: w.id,
      naam: w.naam,
      cash_bruto: w.loonfiche ? w.loonfiche.totalen.cashBrutoloon : null,
      bruto_rsz_basis: w.loonfiche ? w.loonfiche.totalen.brutoRszBasis : null,
      belastbaar_voor_bv: w.loonfiche ? w.loonfiche.totalen.belastbaarVoorBV : null,
      netto: w.loonfiche ? w.loonfiche.totalen.nettoTeBetalen : null,
      werkgeverskost: w.loonfiche ? w.loonfiche.totalen.werkgeverskostMaand : null,
      loonwig_pct: loonwig,
      status: w.status,
      validaties: w.validaties.map((v) => `${v.niveau}:${v.code}`).join("|"),
      fout: w.fout ?? "",
    };

    return KOLOMMEN.map((k) => escapeCsvWaarde(waarden[k])).join(";");
  });

  // Totalenrij
  const totalenRij = [
    "TOTALEN",
    "",
    loonrun.totalen.cashBruto,
    loonrun.totalen.brutoRszBasis,
    loonrun.totalen.belastbaarVoorBV,
    loonrun.totalen.netto,
    loonrun.totalen.werkgeverskost,
    loonrun.totalen.loonwigPct,
    `${loonrun.totalen.aantalBerekend} berekend / ${loonrun.totalen.aantalFout} fout`,
    loonrun.validaties.map((v) => `${v.niveau}:${v.code}`).join("|"),
    "",
  ].map(escapeCsvWaarde).join(";");

  return [header, ...rijen, totalenRij].join("\n");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function escapeCsvWaarde(waarde: CsvWaarde): string {
  if (waarde === null || waarde === undefined) return "";
  const tekst = String(waarde);
  if (!/[;"\r\n]/.test(tekst)) return tekst;
  return `"${tekst.replaceAll('"', '""')}"`;
}
