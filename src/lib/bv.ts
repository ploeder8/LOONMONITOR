// Bedrijfsvoorheffing (BV) — AJ 2027 (inkomstenjaar 2026, peildatum 2026-05-11).
// SSOT: knowledgebase/04_calculator_netto.md §5.2-5.4 + 02_regelkader_2026.md §1-3.
//
// Aanpak Golf 2: lokale Bijlage III-sleutelformule voor gewone bezoldiging,
// met FOD Financiën / Bijlage III 2026 als primaire bron.

import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

// `gehuwd_zonder_inkomen` staat voor gehuwd/wettelijk samenwonend met een
// partner zonder of beperkt beroepsinkomen. Dit activeert Schaal II en verlaagt
// de bedrijfsvoorheffing; het is geen aparte "partner ten laste"-vermindering.
export type GezinsType = "alleenstaand" | "gehuwd_met_inkomen" | "gehuwd_zonder_inkomen";
export type BvSchaal = "I" | "II";
export type BvValidatieStatus = "fod_bijlage_iii_ok" | "fod_bijlage_iii_afwijking";

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
  belastingvrijeSomBv: number;
  basisbelastingBruto: number;
  verminderingBelastingvrijeSom: number;
  basisbelastingNaVerminderingen: number;
  huwelijksquotient: number;
  // Backwards-compatible aliases; inhoudelijk zijn dit BV-basisbedragen, geen PB-aangifte.
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

// ─── Bijlage III 2026 parameters (KB 11/12/2025, BS 29/12/2025) ───

const BV_BASISSCHAAL_2026 = [
  { grens: 16710,    vast: 0,        boven: 0,     tarief: 0.2675 },
  { grens: 29500,    vast: 4469.93,  boven: 16710, tarief: 0.4280 },
  { grens: 51050,    vast: 9944.05,  boven: 29500, tarief: 0.4815 },
  { grens: Infinity, vast: 20320.38, boven: 51050, tarief: 0.5350 },
] as const;

const FORFAIT_PCT = 0.30;
const FORFAIT_MAX_AJ2027 = 6070;
const BV_BELASTINGVRIJE_SOM_BASIS = 11170;
const BV_VERMINDERING_BVS_SCHAAL_I = 2987.98;
const BV_VERMINDERING_BVS_SCHAAL_II = 5975.96;
const HUWELIJKSQUOTIENT_PCT = 0.30;
const HUWELIJKSQUOTIENT_MAX = 13790;

// BV-vermindering kinderen ten laste — jaarbedragen (Bijlage III KB 11/12/2025)
const BV_KINDEREN_JAAR: Record<number, number> = {
  0: 0, 1: 624, 2: 1656, 3: 4404, 4: 7620,
  5: 11100, 6: 14592, 7: 18120, 8: 21996,
};
const BV_KINDEREN_EXTRA_PER_KIND_JAAR = 3864; // per kind > 8

const BV_ALLEENSTAANDE_KIND_JAAR = 624; // bovenop kindvermindering
const BV_GROEPSVERZ_PCT = 0.30;         // % van eigen bijdrage

interface BvBasis {
  jaarbasis: number;
  forfaitBeroepskosten: number;
  belastbaarNettoJaar: number;
  belastingvrijeSomBv: number;
  basisbelastingBruto: number;
  verminderingBelastingvrijeSom: number;
  basisbelastingNaVerminderingen: number;
  huwelijksquotient: number;
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

function berekenBasisbelastingVolgensSchaal(inkomen: number): number {
  const grondslag = Math.max(inkomen, 0);
  const rij = BV_BASISSCHAAL_2026.find((schijf) => grondslag <= schijf.grens);
  if (!rij) return 0;
  return round2(rij.vast + Math.max(grondslag - rij.boven, 0) * rij.tarief);
}

function bvKinderenJaar(n: number): number {
  if (n <= 0) return 0;
  if (n <= 8) return BV_KINDEREN_JAAR[n];
  return BV_KINDEREN_JAAR[8] + (n - 8) * BV_KINDEREN_EXTRA_PER_KIND_JAAR;
}

export function bvKinderen(n: number): number {
  return round2(bvKinderenJaar(n) / 12);
}

function bepaalSchaal(gezinstype: GezinsType): BvSchaal {
  return gezinstype === "gehuwd_zonder_inkomen" ? "II" : "I";
}

function sleutelformuleGewoneBezoldiging(
  basisbelastingNaVerminderingen: number,
  _schaal: BvSchaal,
): number {
  return round2(Math.max(0, basisbelastingNaVerminderingen / 12));
}

function berekenBasisbelasting(
  belastbaarNettoJaar: number,
  schaal: BvSchaal,
): Pick<
  BvBasis,
  "belastingvrijeSomBv" | "basisbelastingBruto" | "verminderingBelastingvrijeSom" |
    "basisbelastingNaVerminderingen" | "huwelijksquotient"
> {
  if (schaal === "II") {
    const huwelijksquotient = round2(
      Math.min(belastbaarNettoJaar * HUWELIJKSQUOTIENT_PCT, HUWELIJKSQUOTIENT_MAX),
    );
    const resterendInkomen = round2(belastbaarNettoJaar - huwelijksquotient);
    const basisbelastingBruto = round2(
      berekenBasisbelastingVolgensSchaal(huwelijksquotient) +
        berekenBasisbelastingVolgensSchaal(resterendInkomen),
    );
    const basisbelastingNaVerminderingen = Math.max(
      0,
      round2(basisbelastingBruto - BV_VERMINDERING_BVS_SCHAAL_II),
    );

    return {
      belastingvrijeSomBv: BV_BELASTINGVRIJE_SOM_BASIS * 2,
      basisbelastingBruto,
      verminderingBelastingvrijeSom: BV_VERMINDERING_BVS_SCHAAL_II,
      basisbelastingNaVerminderingen,
      huwelijksquotient,
    };
  }

  const basisbelastingBruto = berekenBasisbelastingVolgensSchaal(belastbaarNettoJaar);
  const basisbelastingNaVerminderingen = Math.max(
    0,
    round2(basisbelastingBruto - BV_VERMINDERING_BVS_SCHAAL_I),
  );

  return {
    belastingvrijeSomBv: BV_BELASTINGVRIJE_SOM_BASIS,
    basisbelastingBruto,
    verminderingBelastingvrijeSom: BV_VERMINDERING_BVS_SCHAAL_I,
    basisbelastingNaVerminderingen,
    huwelijksquotient: 0,
  };
}

function berekenBvBasis(belastbaarMaandloon: number, gezinstype: GezinsType, schaal: BvSchaal): BvBasis {
  const jaarbasis = round2(belastbaarMaandloon * 12);
  const forfaitBeroepskosten = round2(Math.min(FORFAIT_PCT * jaarbasis, FORFAIT_MAX_AJ2027));
  const belastbaarNettoJaar = round2(jaarbasis - forfaitBeroepskosten);
  const basis = berekenBasisbelasting(belastbaarNettoJaar, schaal);
  const bvPerMaand = sleutelformuleGewoneBezoldiging(
    basis.basisbelastingNaVerminderingen,
    schaal,
  );

  return {
    jaarbasis,
    forfaitBeroepskosten,
    belastbaarNettoJaar,
    ...basis,
    belastingvrijeSom: basis.belastingvrijeSomBv,
    pbBruto: basis.basisbelastingBruto,
    bvsVermindering: basis.verminderingBelastingvrijeSom,
    pbNetto: basis.basisbelastingNaVerminderingen,
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
    verminderingKinderen: round2(bvKinderenJaar(kinderenTenLaste) / 12),
    verminderingAlleenstaandeKind:
      fiscaalAlleenstaandeMetKind && kinderenTenLaste > 0
        ? round2(BV_ALLEENSTAANDE_KIND_JAAR / 12)
        : 0,
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
    validatieStatus: "fod_bijlage_iii_ok",
    validatieOpmerking:
      "BV berekend volgens FOD Financiën / Bijlage III 2026; Tax-Calc is geen primaire payrollbron.",
    datapunten: getBvDatapunten(),
  };
}
