// Bijzondere BV-schaal voor variabel loon (eindejaarspremie, jaarpremie,
// dubbel vakantiegeld, ad-hoc bonussen). SSOT: knowledgebase/04_calculator_netto.md §5.4b.
//
// Tarief wordt opgezocht op basis van het REFERTEJAARLOON (= 12 × normaal
// brutomaandloon), niet op basis van het exceptionele bedrag zelf.

import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";
import { bvKinderen } from "@/lib/bv";
import type { GezinsType } from "@/lib/bv";

export interface BvBijzonderInput {
  refertejaarloon: number;          // 12 × normaal brutomaandloon
  exceptioneelBruto: number;         // het te belasten variabele inkomen
  gezinstype: GezinsType;
  kinderenTenLaste: number;
}

export interface BvBijzonderResultaat {
  refertejaarloon: number;
  tarief: number;                    // bv. 0.2625
  bvBruto: number;
  vermindering: number;              // jaarbasis kinderen-vermindering toegepast op premie
  bvNetto: number;
  nettoBedrag: number;               // exceptioneelBruto − bvNetto
  datapunt: Datapunt;
}

// ─── Tabel bijzondere BV-schaal 2026 (refertejaarloon → tarief) ──────────────
// Conform Bijlage III KB 11/12/2025 (sectie eindejaarspremie / exceptionele
// vergoedingen). Geannualiseerde benadering tot exacte sleutelformule.

interface SchaalRij {
  jaarloonTot: number;
  tarief: number;
}

const SCHAAL_2026: SchaalRij[] = [
  { jaarloonTot: 11165,    tarief: 0.0000 },
  { jaarloonTot: 14080,    tarief: 0.1917 },
  { jaarloonTot: 18025,    tarief: 0.2120 },
  { jaarloonTot: 22870,    tarief: 0.2625 },
  { jaarloonTot: 27620,    tarief: 0.3130 },
  { jaarloonTot: 36180,    tarief: 0.3433 },
  { jaarloonTot: 47075,    tarief: 0.3635 },
  { jaarloonTot: 61260,    tarief: 0.3938 },
  { jaarloonTot: 119290,   tarief: 0.4241 },
  { jaarloonTot: Infinity, tarief: 0.4748 },
];

function lookupTarief(refertejaarloon: number): number {
  for (const rij of SCHAAL_2026) {
    if (refertejaarloon <= rij.jaarloonTot) return rij.tarief;
  }
  return SCHAAL_2026[SCHAAL_2026.length - 1].tarief;
}

export function berekenBvBijzonder(input: BvBijzonderInput): BvBijzonderResultaat {
  const { refertejaarloon, exceptioneelBruto, kinderenTenLaste } = input;

  const dp = getDatapunt("bv_bijzondere_schaal_eindejaar_2026") ?? getDatapunt("bv_2026_kb_bijlage_iii");
  if (!dp) throw new Error("Datapunt bv_bijzondere_schaal_eindejaar_2026 niet gevonden");

  const tarief = lookupTarief(refertejaarloon);
  const bvBruto = round2(exceptioneelBruto * tarief);

  const vermindering = bvKinderen(kinderenTenLaste);

  const bvNetto = Math.max(0, round2(bvBruto - vermindering));
  const nettoBedrag = round2(exceptioneelBruto - bvNetto);

  return {
    refertejaarloon,
    tarief,
    bvBruto,
    vermindering,
    bvNetto,
    nettoBedrag,
    datapunt: dp,
  };
}
