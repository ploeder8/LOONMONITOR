import { safeGetValue } from "@/lib/periode";
import { round2 } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";
import type { GezinsType } from "@/lib/bv";

const RSZ_WERKNEMER_PCT = 0.1307;

export interface JaarpremieInput {
  refDatum: string;
  // Compatibiliteit met oudere callers: de sectorale PC200-jaarpremie krijgt geen BV.
  brutomaandloon?: number;
  gezinstype?: GezinsType;
  kinderenTenLaste?: number;
}

export interface JaarpremieResultaat {
  bedrag: number;
  datapunt: Datapunt;
  bvBijzonder?: never;
  nettoBedrag?: number;
}

export function jaarlijksePremie2026(refDatumOrInput: string | JaarpremieInput): JaarpremieResultaat {
  const input: JaarpremieInput =
    typeof refDatumOrInput === "string" ? { refDatum: refDatumOrInput } : refDatumOrInput;

  const r = safeGetValue("pc200_jaarlijkse_premie_2026", { refDatum: input.refDatum });
  const bedrag = r.waarde ?? 0;

  const base: JaarpremieResultaat = {
    bedrag,
    datapunt: r.datapunt,
  };

  if (bedrag > 0) {
    const rsz = round2(bedrag * RSZ_WERKNEMER_PCT);
    base.nettoBedrag = round2(bedrag - rsz);
  }

  return base;
}
