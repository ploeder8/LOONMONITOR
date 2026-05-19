// Bijzondere BV-schaal voor variabel loon (eindejaarspremie, jaarpremie,
// dubbel vakantiegeld, ad-hoc bonussen). SSOT: knowledgebase/04_calculator_netto.md §5.4b.
//
// Tarief wordt opgezocht op basis van het REFERTEJAARLOON (= 12 × normale
// bruto bezoldiging min werknemers-RSZ), niet op basis van het exceptionele bedrag zelf.

import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";
import { bvKinderen } from "@/lib/bv";
import type { GezinsType } from "@/lib/bv";

export interface BvBijzonderInput {
  refertejaarloon: number;          // 12 × normale bruto bezoldiging min werknemers-RSZ
  exceptioneelBruto: number;         // het te belasten variabele inkomen
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  soort?: "vakantiegeld" | "andere_exceptionele_vergoeding";
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
  vakantiegeld: number;
  andereExceptioneleVergoeding: number;
}

const SCHAAL_2026: SchaalRij[] = [
  { jaarloonTot: 10675,    vakantiegeld: 0.0000, andereExceptioneleVergoeding: 0.0000 },
  { jaarloonTot: 13660,    vakantiegeld: 0.1917, andereExceptioneleVergoeding: 0.2322 },
  { jaarloonTot: 17375,    vakantiegeld: 0.2120, andereExceptioneleVergoeding: 0.2523 },
  { jaarloonTot: 20840,    vakantiegeld: 0.2625, andereExceptioneleVergoeding: 0.3028 },
  { jaarloonTot: 23580,    vakantiegeld: 0.3130, andereExceptioneleVergoeding: 0.3533 },
  { jaarloonTot: 26340,    vakantiegeld: 0.3433, andereExceptioneleVergoeding: 0.3836 },
  { jaarloonTot: 31830,    vakantiegeld: 0.3634, andereExceptioneleVergoeding: 0.4038 },
  { jaarloonTot: 34640,    vakantiegeld: 0.3937, andereExceptioneleVergoeding: 0.4341 },
  { jaarloonTot: 45860,    vakantiegeld: 0.4239, andereExceptioneleVergoeding: 0.4644 },
  { jaarloonTot: 59900,    vakantiegeld: 0.4744, andereExceptioneleVergoeding: 0.5148 },
  { jaarloonTot: Infinity, vakantiegeld: 0.5350, andereExceptioneleVergoeding: 0.5350 },
];

const RSZ_WERKNEMER_PCT = 0.1307;

export function berekenRefertejaarloonBijzonder(brutomaandloon: number): number {
  const normaalBrutoJaarloon = round2(brutomaandloon * 12);
  return round2(normaalBrutoJaarloon - normaalBrutoJaarloon * RSZ_WERKNEMER_PCT);
}

function lookupTarief(
  refertejaarloon: number,
  soort: NonNullable<BvBijzonderInput["soort"]>,
): number {
  for (const rij of SCHAAL_2026) {
    if (refertejaarloon <= rij.jaarloonTot) {
      return soort === "vakantiegeld"
        ? rij.vakantiegeld
        : rij.andereExceptioneleVergoeding;
    }
  }
  const laatsteRij = SCHAAL_2026[SCHAAL_2026.length - 1];
  return soort === "vakantiegeld"
    ? laatsteRij.vakantiegeld
    : laatsteRij.andereExceptioneleVergoeding;
}

export function berekenBvBijzonder(input: BvBijzonderInput): BvBijzonderResultaat {
  const {
    refertejaarloon,
    exceptioneelBruto,
    kinderenTenLaste,
    soort = "vakantiegeld",
  } = input;

  const dp = getDatapunt("bv_bijzondere_schaal_eindejaar_2026") ?? getDatapunt("bv_2026_kb_bijlage_iii");
  if (!dp) throw new Error("Datapunt bv_bijzondere_schaal_eindejaar_2026 niet gevonden");

  const tarief = lookupTarief(refertejaarloon, soort);
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
