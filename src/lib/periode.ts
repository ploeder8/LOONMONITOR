import type { Datapunt } from "@/types/dataset";
import {
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
  DatapuntOnbekend,
} from "@/lib/errors";
import { getDatapunt } from "@/lib/dataset";

export function parseISODate(s: string): Date {
  // YYYY-MM-DD only; we never compare Date objects directly because
  // tz semantics are flaky. Compare strings lexicographically instead.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error(`Ongeldige ISO-datum: ${s}`);
  }
  return new Date(`${s}T00:00:00Z`);
}

export function isGeldigOp(dp: Datapunt, refDatum: string): boolean {
  if (dp.status !== "actief") return false;
  return isBinnenPeriode(dp, refDatum);
}

function isBinnenPeriode(dp: Datapunt, refDatum: string): boolean {
  if (dp.geldig_vanaf && dp.geldig_vanaf > refDatum) return false;
  if (dp.geldig_tot && dp.geldig_tot < refDatum) return false;
  return true;
}

export interface SafeGetOptions {
  refDatum: string;
  /** When true, "mogelijk_verouderd" returns the value with a warning instead of throwing. */
  toelatenMogelijkVerouderd?: boolean;
}

export interface SafeGetResult {
  datapunt: Datapunt;
  waarde: number | null;
  waarschuwing: string | null;
}

export function safeGetValue(
  datapuntId: string,
  opts: SafeGetOptions,
): SafeGetResult {
  const dp = getDatapunt(datapuntId);
  if (!dp) throw new DatapuntOnbekend(datapuntId);

  if (dp.status === "niet_gevonden") {
    throw new DatapuntNietBruikbaar(
      datapuntId,
      "datapunt is niet_gevonden — geen waarde beschikbaar",
    );
  }
  if (dp.status === "conflict") {
    throw new DatapuntNietBruikbaar(
      datapuntId,
      `actief bronconflict — ${dp.conflict_opmerking ?? "(geen opmerking)"}`,
    );
  }
  if (dp.status === "gemarkeerd_voor_review") {
    throw new DatapuntNietBruikbaar(
      datapuntId,
      "gemarkeerd_voor_review — niet bruikbaar zonder review",
    );
  }

  let waarschuwing: string | null = null;
  if (dp.status === "mogelijk_verouderd") {
    if (!opts.toelatenMogelijkVerouderd) {
      throw new DatapuntNietBruikbaar(
        datapuntId,
        "status mogelijk_verouderd — niet bruikbaar zonder expliciete toelating",
      );
    }
    waarschuwing = "status: mogelijk_verouderd — bevestig met de bron vóór gebruik";
  }

  // Period check applies independent of `actief`/`mogelijk_verouderd`.
  if (!isBinnenPeriode(dp, opts.refDatum)) {
    throw new DatapuntNietGeldigOpDatum(
      datapuntId,
      opts.refDatum,
      dp.geldig_vanaf,
      dp.geldig_tot,
    );
  }

  return {
    datapunt: dp,
    waarde: dp.waarde_genormaliseerd ?? null,
    waarschuwing,
  };
}
