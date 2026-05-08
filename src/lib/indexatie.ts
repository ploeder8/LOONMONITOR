import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";

export interface IndexInput {
  oudLoon: number;
  refDatum: string; // typically "2026-01-01"
}

export interface IndexResultaat {
  oudLoon: number;
  coefficient: number;
  nieuwLoon: number;
  datapunt: Datapunt;
}

export function indexeerLoon(input: IndexInput): IndexResultaat {
  const r = safeGetValue("lonen_pc200_indexcoefficient_2026", {
    refDatum: input.refDatum,
  });
  const coef = r.waarde ?? 1;
  const nieuw = round2(input.oudLoon * coef);
  return {
    oudLoon: input.oudLoon,
    coefficient: coef,
    nieuwLoon: nieuw,
    datapunt: r.datapunt,
  };
}
