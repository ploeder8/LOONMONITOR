import type { ReactNode } from "react";

import type { Profiel } from "@/lib/profiel";

export type ProfielUpdate = Partial<Profiel> | ((prev: Profiel) => Profiel);

export interface ProfielSetter {
  <K extends keyof Profiel>(k: K, v: Profiel[K]): void;
  (update: ProfielUpdate): void;
}

export type CsvStatus = { kind: "success" | "error"; tekst: string } | null;

export interface ResultSummary {
  bruto: number;
  netto: number | null;
  werkgeverskost: number | null;
  loonwig: number | null;
}

export interface ResultBandSpec {
  id: string;
  title: string;
  shortLabel: string;
  icon: ReactNode;
  blocks: ReactNode[];
}

export interface BouwResultaten {
  summary: ResultSummary;
  bands: ResultBandSpec[];
}

export interface WerkgeverskostExtras {
  arbeidsongevallenPct: number;
  groepsverzekering: number;
  maaltijdcheques: number;
  hospitalisatie: number;
  ecocheques: number;
  woonwerk: number;
  onkostenvergoeding: number;
}
