import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";

export interface FietsvergoedingInput {
  kmPerDag: number;
  arbeidsdagen: number;
  refDatum: string; // a date in the relevant month
}

export interface FietsvergoedingResultaat {
  vergoeding: number;
  tariefPerKm: number;
  datapunt: Datapunt;
  waarschuwingen: string[];
}

/**
 * Computes the fietsvergoeding for a given month. For ref dates before
 * 2026-10-01 this throws DatapuntNietGeldigOpDatum (per POC §10 / TC-15:
 * the historic € 0,27/km tariff is only documented in `opmerkingen` and
 * is NOT used for arithmetic — we expose it as a banner instead).
 */
export function fietsvergoeding(input: FietsvergoedingInput): FietsvergoedingResultaat {
  const { kmPerDag, arbeidsdagen, refDatum } = input;
  const r = safeGetValue("pc200_fietsvergoeding_2026", { refDatum });
  const tarief = r.waarde ?? 0;
  const ruwe = kmPerDag * tarief * arbeidsdagen;
  return {
    vergoeding: round2(ruwe),
    tariefPerKm: tarief,
    datapunt: r.datapunt,
    waarschuwingen: r.waarschuwing ? [r.waarschuwing] : [],
  };
}

export const FIETSVERGOEDING_HISTORISCHE_BANNER =
  "Tot 30/09/2026 geldt het historische tarief van € 0,27/km. " +
  "Deze waarde wordt niet door de tool berekend — zie de opmerkingen op het datapunt.";
