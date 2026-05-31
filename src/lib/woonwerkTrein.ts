import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
export interface WoonwerkInput {
    treinkaartPrijsPerMaand: number;
    refDatum: string;
}
export interface WoonwerkResultaat {
    werkgeverstussenkomst: number;
    fractie: number;
    datapunt: Datapunt;
}
export function woonwerkTrein(input: WoonwerkInput): WoonwerkResultaat {
    const r = safeGetValue("pc200_woonwerk_trein_2026", { refDatum: input.refDatum });
    const fractie = r.waarde ?? 1;
    return {
        werkgeverstussenkomst: round2(input.treinkaartPrijsPerMaand * fractie),
        fractie,
        datapunt: r.datapunt,
    };
}
