import { safeGetValue } from "@/lib/periode";
import { round2 } from "@/lib/money";
import { berekenBvBijzonder, type BvBijzonderResultaat } from "@/lib/bvBijzonder";
import type { Datapunt } from "@/types/dataset";
import type { GezinsType } from "@/lib/bv";

export interface JaarpremieInput {
  refDatum: string;
  // Optional: indien meegegeven, wordt de bijzondere BV ook berekend
  brutomaandloon?: number;
  gezinstype?: GezinsType;
  kinderenTenLaste?: number;
}

export interface JaarpremieResultaat {
  bedrag: number;
  datapunt: Datapunt;
  bvBijzonder?: BvBijzonderResultaat;
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

  if (input.brutomaandloon && input.gezinstype && bedrag > 0) {
    const bv = berekenBvBijzonder({
      refertejaarloon: round2(input.brutomaandloon * 12),
      exceptioneelBruto: bedrag,
      gezinstype: input.gezinstype,
      kinderenTenLaste: input.kinderenTenLaste ?? 0,
    });
    base.bvBijzonder = bv;
    base.nettoBedrag = bv.nettoBedrag;
  }

  return base;
}
