export type ValidatieStatus = "pending" | "ok" | "kleine_afwijking" | "grote_afwijking";
export type ValidatieRootCause =
  | "pending_taxcalc"
  | "rsz"
  | "werkbonus"
  | "bv"
  | "bbsz"
  | "afronding"
  | "werkgeverskost";

export interface BrutoNettoValidatieCase {
  id: string;
  status: ValidatieStatus;
  tolerantieMargeEur: number;
  taxcalcNettoMaand: number | null;
  verschilEur: number | null;
  rootCause: ValidatieRootCause;
}

export interface TriangulatieAnchor {
  id: string;
  bron: "Group S Salary Sim" | "Securex" | "Acerta" | "SD Worx";
  focus: "werkbonus" | "bbsz" | "bv" | "werkgeverskost";
  status: ValidatieStatus;
  notitie: string;
}

export interface ValidatieSummary {
  pending: number;
  ok: number;
  afwijkingKlein: number;
  afwijkingGroot: number;
}

const CASE_IDS = Array.from({ length: 30 }, (_, index) =>
  `TC-${String(index + 1).padStart(3, "0")}`,
);

export const brutoNettoValidatieCases: BrutoNettoValidatieCase[] = CASE_IDS.map((id) => ({
  id,
  status: "pending",
  tolerantieMargeEur: 5,
  taxcalcNettoMaand: null,
  verschilEur: null,
  rootCause: "pending_taxcalc",
}));

export const triangulatieAnchors: TriangulatieAnchor[] = [
  {
    id: "TRI-GROUPS-001",
    bron: "Group S Salary Sim",
    focus: "bv",
    status: "pending",
    notitie: "PC 200 Schaal I Cat A 5j: ordinary BV en nettoloon als Tier-2 anker.",
  },
  {
    id: "TRI-GROUPS-002",
    bron: "Group S Salary Sim",
    focus: "werkbonus",
    status: "pending",
    notitie: "Werkbonus luik A/B zichtbaar gesplitst in Group S-output.",
  },
  {
    id: "TRI-GROUPS-003",
    bron: "Group S Salary Sim",
    focus: "bbsz",
    status: "pending",
    notitie: "BBSZ aftrek apart zichtbaar in resultaatsectie H.",
  },
  {
    id: "TRI-GROUPS-004",
    bron: "Group S Salary Sim",
    focus: "werkgeverskost",
    status: "pending",
    notitie: "Patronale bijdragen en structurele vermindering apart zichtbaar.",
  },
  {
    id: "TRI-SECUREX-001",
    bron: "Securex",
    focus: "werkbonus",
    status: "pending",
    notitie: "Tweede Tier-2-check voor werkbonusgrenzen en hellingen.",
  },
];

export function summarizeValidation(cases: BrutoNettoValidatieCase[]): ValidatieSummary {
  return cases.reduce<ValidatieSummary>(
    (summary, item) => {
      if (item.status === "pending") summary.pending += 1;
      if (item.status === "ok") summary.ok += 1;
      if (item.status === "kleine_afwijking") summary.afwijkingKlein += 1;
      if (item.status === "grote_afwijking") summary.afwijkingGroot += 1;
      return summary;
    },
    { pending: 0, ok: 0, afwijkingKlein: 0, afwijkingGroot: 0 },
  );
}
