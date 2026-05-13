import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

export interface WerkbonusInput {
  brutoloon: number;
  refDatum: string;
}

export interface WerkbonusResultaat {
  luikA: number;
  luikB: number;
  totaal: number;
  jaarCapBedrag: number;
  vanaf1April2026: boolean;
  datapunt: Datapunt;
}

interface LuikParams {
  max: number;
  lower: number;
  upper: number;
  factor: number;
}

// Geverifieerde parameters per 1/4/2026 (SSOT: knowledgebase/04_calculator_netto.md §5.1)
const LUIK_A: LuikParams = { max: 125.04, lower: 2880.32, upper: 3336.98, factor: 0.2738 };
const LUIK_B: LuikParams = { max: 168.62, lower: 2255.50, upper: 2880.32, factor: 0.2699 };

const JAARPLAFOND = 3466.44;
const APRIL_2026 = "2026-04-01";

function luikBonus(loon: number, p: LuikParams): number {
  if (loon <= p.lower) return p.max;
  if (loon >= p.upper) return 0;
  return round2(p.max - p.factor * (loon - p.lower));
}

export function werkbonus(input: WerkbonusInput): WerkbonusResultaat {
  const { brutoloon, refDatum } = input;

  const dp = getDatapunt("werkbonus_sociaal_luik_A_2026") ?? getDatapunt("bv_werkbonus_bedienden_2026");
  if (!dp) throw new Error("Datapunt werkbonus_sociaal_luik_A_2026 niet gevonden");

  const a = luikBonus(brutoloon, LUIK_A);
  const b = luikBonus(brutoloon, LUIK_B);
  const totaal = round2(a + b);

  return {
    luikA: a,
    luikB: b,
    totaal,
    jaarCapBedrag: JAARPLAFOND,
    vanaf1April2026: refDatum >= APRIL_2026,
    datapunt: dp,
  };
}
