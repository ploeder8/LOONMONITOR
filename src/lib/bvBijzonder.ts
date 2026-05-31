import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";
import type { GezinsType } from "@/lib/bv";
export interface BvBijzonderInput {
    refertejaarloon: number;
    normaalBrutoJaarloon: number;
    exceptioneelBruto: number;
    gezinstype: GezinsType;
    kinderenTenLaste: number;
    soort?: "vakantiegeld" | "andere_exceptionele_vergoeding";
}
export interface BvBijzonderResultaat {
    refertejaarloon: number;
    tarief: number;
    bvBruto: number;
    vermindering: number;
    bvNetto: number;
    nettoBedrag: number;
    datapunt: Datapunt;
}
interface SchaalRij {
    jaarloonTot: number;
    vakantiegeld: number;
    andereExceptioneleVergoeding: number;
}
const SCHAAL_2026: SchaalRij[] = [
    { jaarloonTot: 10675, vakantiegeld: 0.0000, andereExceptioneleVergoeding: 0.0000 },
    { jaarloonTot: 13660, vakantiegeld: 0.1917, andereExceptioneleVergoeding: 0.2322 },
    { jaarloonTot: 17375, vakantiegeld: 0.2120, andereExceptioneleVergoeding: 0.2523 },
    { jaarloonTot: 20840, vakantiegeld: 0.2625, andereExceptioneleVergoeding: 0.3028 },
    { jaarloonTot: 23580, vakantiegeld: 0.3130, andereExceptioneleVergoeding: 0.3533 },
    { jaarloonTot: 26340, vakantiegeld: 0.3433, andereExceptioneleVergoeding: 0.3836 },
    { jaarloonTot: 31830, vakantiegeld: 0.3634, andereExceptioneleVergoeding: 0.4038 },
    { jaarloonTot: 34640, vakantiegeld: 0.3937, andereExceptioneleVergoeding: 0.4341 },
    { jaarloonTot: 45860, vakantiegeld: 0.4239, andereExceptioneleVergoeding: 0.4644 },
    { jaarloonTot: 59900, vakantiegeld: 0.4744, andereExceptioneleVergoeding: 0.5148 },
    { jaarloonTot: Infinity, vakantiegeld: 0.5350, andereExceptioneleVergoeding: 0.5350 },
];
const RSZ_WERKNEMER_PCT = 0.1307;
const KINDVRIJSTELLING_GRENS: Record<number, number> = {
    1: 18858,
    2: 22470,
    3: 28960,
    4: 36200,
    5: 43440,
    6: 50680,
    7: 57920,
    8: 65160,
    9: 72400,
    10: 79640,
    11: 86880,
    12: 94120,
};
const KINDVERMINDERING_EXCEPTIONEEL: Record<number, {
    pct: number;
    grens: number;
}> = {
    1: { pct: 0.075, grens: 28940 },
    2: { pct: 0.20, grens: 28940 },
    3: { pct: 0.35, grens: 31835 },
    4: { pct: 0.55, grens: 37625 },
    5: { pct: 0.75, grens: 40520 },
};
export function berekenNormaalBrutoJaarloonBijzonder(brutomaandloon: number): number {
    return round2(brutomaandloon * 12);
}
export function berekenRefertejaarloonBijzonder(brutomaandloon: number): number {
    const normaalBrutoJaarloon = berekenNormaalBrutoJaarloonBijzonder(brutomaandloon);
    return round2(normaalBrutoJaarloon - normaalBrutoJaarloon * RSZ_WERKNEMER_PCT);
}
function lookupTarief(refertejaarloon: number, soort: NonNullable<BvBijzonderInput["soort"]>): number {
    for (const rij of SCHAAL_2026) {
        if (refertejaarloon <= rij.jaarloonTot) {
            return soort === "vakantiegeld"
                ? rij.vakantiegeld
                : rij.andereExceptioneleVergoeding;
        }
    }
    const laatsteRij = SCHAAL_2026[SCHAAL_2026.length - 1];
    return soort === "vakantiegeld"
        ? laatsteRij.vakantiegeld
        : laatsteRij.andereExceptioneleVergoeding;
}
export function berekenBvBijzonder(input: BvBijzonderInput): BvBijzonderResultaat {
    const { refertejaarloon, normaalBrutoJaarloon, exceptioneelBruto, kinderenTenLaste, soort = "vakantiegeld", } = input;
    const dp = getDatapunt("bv_bijzondere_schaal_eindejaar_2026") ?? getDatapunt("bv_2026_kb_bijlage_iii");
    if (!dp)
        throw new Error("Datapunt bv_bijzondere_schaal_eindejaar_2026 niet gevonden");
    const tarief = lookupTarief(refertejaarloon, soort);
    const belastbaarNaKindvrijstelling = round2(exceptioneelBruto -
        berekenKindvrijstellingExceptioneel(normaalBrutoJaarloon, exceptioneelBruto, kinderenTenLaste));
    const bvBruto = round2(belastbaarNaKindvrijstelling * tarief);
    const vermindering = berekenKindverminderingExceptioneel(normaalBrutoJaarloon, bvBruto, kinderenTenLaste);
    const bvNetto = Math.max(0, round2(bvBruto - vermindering));
    const nettoBedrag = round2(exceptioneelBruto - bvNetto);
    return {
        refertejaarloon,
        tarief,
        bvBruto,
        vermindering,
        bvNetto,
        nettoBedrag,
        datapunt: dp,
    };
}
function berekenKindvrijstellingExceptioneel(normaalBrutoJaarloon: number, exceptioneelBruto: number, kinderenTenLaste: number): number {
    const grens = KINDVRIJSTELLING_GRENS[kinderenTenLaste];
    if (!grens || normaalBrutoJaarloon > grens)
        return 0;
    return round2(Math.min(exceptioneelBruto, Math.max(grens - normaalBrutoJaarloon, 0)));
}
function berekenKindverminderingExceptioneel(normaalBrutoJaarloon: number, bvBruto: number, kinderenTenLaste: number): number {
    const regel = KINDVERMINDERING_EXCEPTIONEEL[kinderenTenLaste];
    if (!regel || normaalBrutoJaarloon > regel.grens)
        return 0;
    return round2(bvBruto * regel.pct);
}
