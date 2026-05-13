import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

export interface BbszInput {
  brutoloon: number;
}

export interface BbszResultaat {
  kwartaalbijdrage: number;
  maandelijksBedrag: number;
  datapunt: Datapunt;
}

// BBSZ 2026 – categorie C (bedienden), kwartaalschijven
// qLoon = 3 × maandelijks brutoloon; formules geven kwartaalbedrag
const MAX_KWARTAAL = 182.82;

export function bbsz(input: BbszInput): BbszResultaat {
  const { brutoloon } = input;

  const dp = getDatapunt("bv_bbsz_schijven_2026");
  if (!dp) throw new Error("Datapunt bv_bbsz_schijven_2026 niet gevonden");

  const q = brutoloon * 3;

  let kw: number;
  if (q < 5836.14) {
    kw = 0;
  } else if (q <= 6570.54) {
    kw = round2(0.0422 * (brutoloon - 1945.38));
  } else if (q <= 11211) {
    kw = round2(30.99 + 0.011 * (brutoloon - 2190.18));
  } else if (q <= 12300) {
    kw = round2(82.05 + 0.0338 * (brutoloon - 3737));
  } else if (q <= 18116.46) {
    kw = round2(118.83 + 0.011 * (brutoloon - 4100));
  } else {
    kw = MAX_KWARTAAL;
  }

  return {
    kwartaalbijdrage: kw,
    maandelijksBedrag: round2(kw / 3),
    datapunt: dp,
  };
}
