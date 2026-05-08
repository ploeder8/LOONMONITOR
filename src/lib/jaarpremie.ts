import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";

export interface JaarpremieResultaat {
  bedrag: number;
  datapunt: Datapunt;
}

export function jaarlijksePremie2026(refDatum: string): JaarpremieResultaat {
  const r = safeGetValue("pc200_jaarlijkse_premie_2026", { refDatum });
  return {
    bedrag: r.waarde ?? 0,
    datapunt: r.datapunt,
  };
}
