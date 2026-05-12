// Bedrijfsvoorheffing (BV) — AJ 2027 (inkomstenjaar 2026, peildatum 2026-05-11).
// SSOT: knowledgebase/04_calculator_netto.md §5.2-5.4 + 02_regelkader_2026.md §1-3.
//
// Aanpak: algoritmische benadering via PB-schijven AJ 2027 met BV-vermindering
// kinderen ten laste als maandtabel (i.p.v. via belastingvrije som). De exacte
// sleutelformule uit KB Bijlage III 11/12/2025 wordt pas geïntegreerd in golf 2
// (FOD Tax-Calc-validatie vereist).

import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

export type GezinsType = "alleenstaand" | "gehuwd_met_inkomen" | "gehuwd_zonder_inkomen";

export interface BvInput {
  belastbaarMaandloon: number;          // brutoloon − effectieve RSZ (na werkbonus)
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  kinderenOnder3?: number;              // count kinderen <3 jaar (geen kinderopvang-aftrek)
  fiscaalAlleenstaandeMetKind?: boolean;
  groepsverzekeringEigenBijdrage?: number; // €/maand werknemersbijdrage
  fiscaleWerkbonusKrediet?: number;     // pass-through uit netto.ts (33,14% × Luik A + 52,54% × Luik B)
}

export interface BvResultaat {
  jaarbasis: number;
  forfaitBeroepskosten: number;
  belastbaarNettoJaar: number;
  belastingvrijeSom: number;
  pbBruto: number;
  bvsVermindering: number;
  pbNetto: number;
  bvPerMaand: number;                   // BV vóór gezinsverminderingen
  // Gezinsverminderingen (per maand)
  verminderingKinderen: number;
  verminderingKindOnder3: number;
  verminderingAlleenstaandeKind: number;
  verminderingGroepsverzekering: number;
  fiscaleWerkbonus: number;             // belastingkrediet, identiek aan input
  bvNaVerminderingen: number;           // het finale BV-bedrag per maand
  isApproximatie: true;
  datapunten: Datapunt[];
}

// ─── AJ 2027 parameters (geverifieerd: Wet 18/12/2025 BS 30/12/2025 + FOD Fin) ───

const SCHIJVEN_AJ2027 = [
  { grens: 16720,    tarief: 0.25 },
  { grens: 29510,    tarief: 0.40 },
  { grens: 51070,    tarief: 0.45 },
  { grens: Infinity, tarief: 0.50 },
] as const;

const FORFAIT_PCT = 0.30;
const FORFAIT_MAX_AJ2027 = 6070;

const BVS_BASIS_AJ2027: Record<GezinsType, number> = {
  alleenstaand:          11180,
  gehuwd_met_inkomen:    11180,
  gehuwd_zonder_inkomen: 22360, // 2 × 11180
};

// BV-vermindering kinderen ten laste — maandtabel (Bijlage III KB 11/12/2025)
const BV_KINDEREN_MAAND: Record<number, number> = {
  0: 0, 1: 52, 2: 138, 3: 367, 4: 635,
  5: 925, 6: 1216, 7: 1510, 8: 1833,
};
const BV_KINDEREN_EXTRA_PER_KIND = 345; // per kind > 8

const BV_KIND_ONDER_3 = 76;             // €/maand per kind <3 jaar
const BV_ALLEENSTAANDE_KIND = 52;       // €/maand bovenop kindvermindering
const BV_GROEPSVERZ_PCT = 0.30;         // % van eigen bijdrage

// ─── Hulpfuncties ─────────────────────────────────────────────────────────────

function berekenPb(inkomen: number): number {
  let pb = 0;
  let prev = 0;
  for (const { grens, tarief } of SCHIJVEN_AJ2027) {
    if (inkomen <= prev) break;
    pb += (Math.min(inkomen, grens) - prev) * tarief;
    prev = grens;
  }
  return round2(pb);
}

export function bvKinderen(n: number): number {
  if (n <= 0) return 0;
  if (n <= 8) return BV_KINDEREN_MAAND[n];
  return BV_KINDEREN_MAAND[8] + (n - 8) * BV_KINDEREN_EXTRA_PER_KIND;
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────────

export function berekenBV(input: BvInput): BvResultaat {
  const {
    belastbaarMaandloon,
    gezinstype,
    kinderenTenLaste,
    kinderenOnder3 = 0,
    fiscaalAlleenstaandeMetKind = false,
    groepsverzekeringEigenBijdrage = 0,
    fiscaleWerkbonusKrediet = 0,
  } = input;

  const dpPb = getDatapunt("pb_schijven_aj2027") ?? getDatapunt("pb_schijven_aj2026");
  const dpBv = getDatapunt("bv_2026_kb_bijlage_iii");
  const dpKind = getDatapunt("bv_vermindering_kinderen_2026");
  if (!dpPb || !dpBv) throw new Error("BV-datapunten niet gevonden");

  const jaarbasis = round2(belastbaarMaandloon * 12);
  const forfait = round2(Math.min(FORFAIT_PCT * jaarbasis, FORFAIT_MAX_AJ2027));
  const belastbaarNettoJaar = round2(jaarbasis - forfait);

  const belastingvrijeSom = BVS_BASIS_AJ2027[gezinstype];
  const pbBruto = berekenPb(belastbaarNettoJaar);
  const bvsVermindering = round2(belastingvrijeSom * 0.25);
  const pbNetto = Math.max(0, round2(pbBruto - bvsVermindering));
  const bvPerMaand = round2(pbNetto / 12);

  const verminderingKinderen = bvKinderen(kinderenTenLaste);
  const verminderingKindOnder3 = round2(kinderenOnder3 * BV_KIND_ONDER_3);
  const verminderingAlleenstaandeKind =
    fiscaalAlleenstaandeMetKind && kinderenTenLaste > 0 ? BV_ALLEENSTAANDE_KIND : 0;
  const verminderingGroepsverzekering = round2(
    Math.max(0, groepsverzekeringEigenBijdrage) * BV_GROEPSVERZ_PCT,
  );

  const totaalVerminderingen = round2(
    verminderingKinderen +
      verminderingKindOnder3 +
      verminderingAlleenstaandeKind +
      verminderingGroepsverzekering +
      fiscaleWerkbonusKrediet,
  );

  const bvNaVerminderingen = Math.max(0, round2(bvPerMaand - totaalVerminderingen));

  const datapunten: Datapunt[] = [dpPb, dpBv];
  if (dpKind) datapunten.push(dpKind);

  return {
    jaarbasis,
    forfaitBeroepskosten: forfait,
    belastbaarNettoJaar,
    belastingvrijeSom,
    pbBruto,
    bvsVermindering,
    pbNetto,
    bvPerMaand,
    verminderingKinderen,
    verminderingKindOnder3,
    verminderingAlleenstaandeKind,
    verminderingGroepsverzekering,
    fiscaleWerkbonus: fiscaleWerkbonusKrediet,
    bvNaVerminderingen,
    isApproximatie: true,
    datapunten,
  };
}
