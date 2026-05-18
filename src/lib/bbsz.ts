import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

export type BbszScenario =
  | "individuele_aanslag"
  | "gemeenschappelijke_aanslag_partner_met_beroepsinkomsten"
  | "gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten";

export interface BbszInput {
  brutoloon: number;
  scenario: BbszScenario;
}

export interface BbszResultaat {
  scenario: BbszScenario;
  scenarioLabel: string;
  kwartaalbijdrage: number;
  maandelijksBedrag: number;
  datapunt: Datapunt;
}

// BBSZ 2026 – categorie C (bedienden), kwartaalschijven
// qLoon = 3 × maandelijks brutoloon; formules geven kwartaalbedrag
const MAX_KWARTAAL = 182.82;
const MAX_KWARTAAL_PARTNER_MET_INKOMEN = 154.92;

export const BBSZ_SCENARIO_LABELS: Record<BbszScenario, string> = {
  individuele_aanslag: "Individuele aanslag",
  gemeenschappelijke_aanslag_partner_met_beroepsinkomsten:
    "Gemeenschappelijke aanslag - partner met beroepsinkomsten",
  gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten:
    "Gemeenschappelijke aanslag - partner zonder beroepsinkomsten",
};

export function bbsz(input: BbszInput): BbszResultaat {
  const { brutoloon, scenario } = input;

  const dp = getDatapunt("bv_bbsz_schijven_2026");
  if (!dp) throw new Error("Datapunt bv_bbsz_schijven_2026 niet gevonden");

  const q = brutoloon * 3;
  const kw = berekenKwartaalbijdrage(brutoloon, q, scenario);

  return {
    scenario,
    scenarioLabel: BBSZ_SCENARIO_LABELS[scenario],
    kwartaalbijdrage: kw,
    maandelijksBedrag: round2(kw / 3),
    datapunt: dp,
  };
}

function berekenKwartaalbijdrage(
  brutoloon: number,
  kwartaalloon: number,
  scenario: BbszScenario,
): number {
  if (scenario === "gemeenschappelijke_aanslag_partner_met_beroepsinkomsten") {
    return bbszGemeenschappelijkPartnerMetInkomen(brutoloon, kwartaalloon);
  }
  if (scenario === "gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten") {
    return bbszGemeenschappelijkPartnerZonderInkomen(brutoloon, kwartaalloon);
  }
  return bbszIndividueleAanslag(brutoloon, kwartaalloon);
}

function bbszIndividueleAanslag(brutoloon: number, q: number): number {
  if (q < 5836.14) {
    return 0;
  } else if (q <= 6570.54) {
    return round2(0.0422 * (brutoloon - 1945.38));
  } else if (q <= 11211) {
    return round2(30.99 + 0.011 * (brutoloon - 2190.18));
  } else if (q <= 12300) {
    return round2(82.05 + 0.0338 * (brutoloon - 3737));
  } else if (q <= 18116.46) {
    return round2(118.83 + 0.011 * (brutoloon - 4100));
  } else {
    return MAX_KWARTAAL;
  }
}

function bbszGemeenschappelijkPartnerMetInkomen(brutoloon: number, q: number): number {
  if (q < 3285.29) return 0;
  if (q < 5836.14) return 15.45;
  if (q <= 6570.54) {
    return Math.max(15.45, round2(0.059 * (brutoloon - 1945.38)));
  }
  return Math.min(
    MAX_KWARTAAL_PARTNER_MET_INKOMEN,
    round2(43.32 + 0.011 * (brutoloon - 2190.18)),
  );
}

function bbszGemeenschappelijkPartnerZonderInkomen(brutoloon: number, q: number): number {
  if (q < 5836.14) return 0;
  if (q <= 6570.54) return round2(0.059 * (brutoloon - 1945.38));
  return Math.min(MAX_KWARTAAL, round2(43.32 + 0.011 * (brutoloon - 2190.18)));
}
