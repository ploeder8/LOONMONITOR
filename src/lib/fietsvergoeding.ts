import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
const FIETSVERGOEDING_OKTOBER_2026 = "2026-10-01";
const FIETSVERGOEDING_PRE_OKTOBER_ID = "pc200_fietsvergoeding_2026_pre_oktober";
const FIETSVERGOEDING_VANAF_OKTOBER_ID = "pc200_fietsvergoeding_2026";
export interface FietsvergoedingInput {
    kmPerDag: number;
    arbeidsdagen: number;
    refDatum: string;
}
export interface FietsvergoedingResultaat {
    vergoeding: number;
    tariefPerKm: number;
    datapunt: Datapunt;
    waarschuwingen: string[];
}
export function fietsvergoeding(input: FietsvergoedingInput): FietsvergoedingResultaat {
    const { kmPerDag, arbeidsdagen, refDatum } = input;
    const r = safeGetFietsvergoeding(refDatum);
    const tarief = r.waarde ?? 0;
    const dagmaximum = r.datapunt.maximum_dagbedrag_genormaliseerd ?? Number.POSITIVE_INFINITY;
    const dagbedrag = Math.min(Math.max(kmPerDag, 0) * tarief, dagmaximum);
    return {
        vergoeding: round2(dagbedrag * Math.max(arbeidsdagen, 0)),
        tariefPerKm: tarief,
        datapunt: r.datapunt,
        waarschuwingen: r.waarschuwing ? [r.waarschuwing] : [],
    };
}
export function safeGetFietsvergoeding(refDatum: string) {
    const datapuntId = refDatum < FIETSVERGOEDING_OKTOBER_2026
        ? FIETSVERGOEDING_PRE_OKTOBER_ID
        : FIETSVERGOEDING_VANAF_OKTOBER_ID;
    return safeGetValue(datapuntId, { refDatum });
}
export const FIETSVERGOEDING_HISTORISCHE_BANNER = "Tot 30/09/2026 geldt het sectorale tarief van € 0,27/km, met een maximum van € 10,80 per dag.";
