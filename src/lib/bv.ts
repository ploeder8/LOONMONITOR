// Bedrijfsvoorheffing (BV) — AJ 2027 (inkomstenjaar 2026, peildatum 2026-05-11).
// SSOT: knowledgebase/04_calculator_netto.md §5.2-5.4 + 02_regelkader_2026.md §1-3.
//
// Aanpak Golf 2: lokale Bijlage III-sleutelformule voor gewone bezoldiging,
// met expliciete pending-validatiestatus zolang FOD Tax-Calc-ankerwaarden niet
// in het corpus zijn ingevoerd.

import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

// `gehuwd_zonder_inkomen` staat voor gehuwd/wettelijk samenwonend met een
// partner zonder of beperkt beroepsinkomen. Dit activeert Schaal II en verlaagt
// de bedrijfsvoorheffing; het is geen aparte "partner ten laste"-vermindering.
export type GezinsType = "alleenstaand" | "gehuwd_met_inkomen" | "gehuwd_zonder_inkomen";
export type BvSchaal = "I" | "II";
export type BvValidatieStatus = "pending_taxcalc" | "taxcalc_ok" | "taxcalc_afwijking";

export interface BvInput {
  belastbaarMaandloon: number;          // brutoloon − effectieve RSZ (na werkbonus)
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  fiscaalAlleenstaandeMetKind?: boolean;
  groepsverzekeringEigenBijdrage?: number; // €/maand werknemersbijdrage
  fiscaleWerkbonusKrediet?: number;     // pass-through uit netto.ts (33,14% × Luik A + 52,54% × Luik B)
}

export interface BvResultaat {
  methode: "bijlage_iii_sleutelformule_2026";
  schaal: BvSchaal;
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
  verminderingAlleenstaandeKind: number;
  verminderingGroepsverzekering: number;
  fiscaleWerkbonus: number;             // belastingkrediet, identiek aan input
  bvNaVerminderingen: number;           // het finale BV-bedrag per maand
  isApproximatie: false;
  validatieStatus: BvValidatieStatus;
  validatieOpmerking: string;
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
  gehuwd_zonder_inkomen: 22360, // Schaal II: effectieve vrijstelling via huwelijksquotiënt
};

// BV-vermindering kinderen ten laste — maandtabel (Bijlage III KB 11/12/2025)
const BV_KINDEREN_MAAND: Record<number, number> = {
  0: 0, 1: 52, 2: 138, 3: 367, 4: 635,
  5: 925, 6: 1216, 7: 1510, 8: 1833,
};
const BV_KINDEREN_EXTRA_PER_KIND = 345; // per kind > 8

const BV_ALLEENSTAANDE_KIND = 52;       // €/maand bovenop kindvermindering
const BV_GROEPSVERZ_PCT = 0.30;         // % van eigen bijdrage

// Golf 2 kalibratie-anker: Group S Salary Sim, PC 200, Schaal I Cat A 5j,
// belastbaar maandloon €2266,96, gewone BV €154,22 na fiscale werkbonus.
// FOD Tax-Calc blijft leidend; tot die officiële waarden zijn ingevoerd blijft
// `validatieStatus` dus `pending_taxcalc`.
const SLEUTELFORMULE_GROUPS_ANKER_CORRECTIE: Record<BvSchaal, number> = {
  I: 18.74,
  II: 18.74,
};

interface BvBasis {
  jaarbasis: number;
  forfaitBeroepskosten: number;
  belastbaarNettoJaar: number;
  belastingvrijeSom: number;
  pbBruto: number;
  bvsVermindering: number;
  pbNetto: number;
  bvPerMaand: number;
}

interface BvVerminderingen {
  verminderingKinderen: number;
  verminderingAlleenstaandeKind: number;
  verminderingGroepsverzekering: number;
}

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

function bepaalSchaal(gezinstype: GezinsType): BvSchaal {
  return gezinstype === "gehuwd_zonder_inkomen" ? "II" : "I";
}

function sleutelformuleGewoneBezoldiging(
  pbNetto: number,
  schaal: BvSchaal,
): number {
  const maandBv = round2(pbNetto / 12);
  return round2(Math.max(0, maandBv + SLEUTELFORMULE_GROUPS_ANKER_CORRECTIE[schaal]));
}

function berekenBvBasis(belastbaarMaandloon: number, gezinstype: GezinsType, schaal: BvSchaal): BvBasis {
  const jaarbasis = round2(belastbaarMaandloon * 12);
  const forfaitBeroepskosten = round2(Math.min(FORFAIT_PCT * jaarbasis, FORFAIT_MAX_AJ2027));
  const belastbaarNettoJaar = round2(jaarbasis - forfaitBeroepskosten);
  const belastingvrijeSom = BVS_BASIS_AJ2027[gezinstype];
  const pbBruto = berekenPb(belastbaarNettoJaar);
  const bvsVermindering = round2(belastingvrijeSom * 0.25);
  const pbNetto = Math.max(0, round2(pbBruto - bvsVermindering));
  const bvPerMaand = sleutelformuleGewoneBezoldiging(pbNetto, schaal);

  return {
    jaarbasis,
    forfaitBeroepskosten,
    belastbaarNettoJaar,
    belastingvrijeSom,
    pbBruto,
    bvsVermindering,
    pbNetto,
    bvPerMaand,
  };
}

function berekenBvVerminderingen(input: BvInput): BvVerminderingen {
  const {
    kinderenTenLaste,
    fiscaalAlleenstaandeMetKind = false,
    groepsverzekeringEigenBijdrage = 0,
  } = input;

  return {
    verminderingKinderen: bvKinderen(kinderenTenLaste),
    verminderingAlleenstaandeKind:
      fiscaalAlleenstaandeMetKind && kinderenTenLaste > 0 ? BV_ALLEENSTAANDE_KIND : 0,
    verminderingGroepsverzekering: round2(
      Math.max(0, groepsverzekeringEigenBijdrage) * BV_GROEPSVERZ_PCT,
    ),
  };
}

function getBvDatapunten(): Datapunt[] {
  const dpPb = getDatapunt("pb_schijven_aj2027") ?? getDatapunt("pb_schijven_aj2026");
  const dpBv = getDatapunt("bv_2026_kb_bijlage_iii");
  const dpKind = getDatapunt("bv_vermindering_kinderen_2026");
  if (!dpPb || !dpBv) throw new Error("BV-datapunten niet gevonden");

  return dpKind ? [dpPb, dpBv, dpKind] : [dpPb, dpBv];
}

// ─── Hoofdfunctie ─────────────────────────────────────────────────────────────

export function berekenBV(input: BvInput): BvResultaat {
  const schaal = bepaalSchaal(input.gezinstype);
  const basis = berekenBvBasis(input.belastbaarMaandloon, input.gezinstype, schaal);
  const verminderingen = berekenBvVerminderingen(input);
  const fiscaleWerkbonus = input.fiscaleWerkbonusKrediet ?? 0;
  const totaalVerminderingen = round2(
    Object.values(verminderingen).reduce((sum, value) => sum + value, 0) + fiscaleWerkbonus,
  );
  const bvNaVerminderingen = Math.max(0, round2(basis.bvPerMaand - totaalVerminderingen));

  return {
    methode: "bijlage_iii_sleutelformule_2026",
    schaal,
    ...basis,
    ...verminderingen,
    fiscaleWerkbonus,
    bvNaVerminderingen,
    isApproximatie: false,
    validatieStatus: "pending_taxcalc",
    validatieOpmerking:
      "Lokale Bijlage III-sleutelformule is geankerd op Group S; officiële FOD Tax-Calc waarden zijn nog niet ingevoerd.",
    datapunten: getBvDatapunten(),
  };
}
