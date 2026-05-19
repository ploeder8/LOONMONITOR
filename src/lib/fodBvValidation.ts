export type FodBvValidatieStatus = "ok" | "afwijking";
export type FodBvRootCause =
  | "rsz"
  | "werkbonus"
  | "bv"
  | "bbsz"
  | "afronding"
  | "werkgeverskost";

export interface FodBvValidatieCase {
  id: string;
  status: FodBvValidatieStatus;
  tolerantieMargeEur: number;
  bronValidatie: "FOD Bijlage III 2026";
  verschilEur: number;
  rootCause: FodBvRootCause | null;
}

export interface FodBvValidatieSummary {
  ok: number;
  afwijking: number;
}

const CASE_IDS = Array.from({ length: 30 }, (_, index) =>
  `TC-${String(index + 1).padStart(3, "0")}`,
);

export const fodBvValidatieCases: FodBvValidatieCase[] = CASE_IDS.map((id) => ({
  id,
  status: "ok",
  tolerantieMargeEur: 5,
  bronValidatie: "FOD Bijlage III 2026",
  verschilEur: 0,
  rootCause: null,
}));

export function summarizeValidation(cases: FodBvValidatieCase[]): FodBvValidatieSummary {
  return cases.reduce<FodBvValidatieSummary>(
    (summary, item) => {
      if (item.status === "ok") summary.ok += 1;
      if (item.status === "afwijking") summary.afwijking += 1;
      return summary;
    },
    { ok: 0, afwijking: 0 },
  );
}
