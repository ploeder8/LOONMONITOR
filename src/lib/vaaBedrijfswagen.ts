import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
export type BrandstofBedrijfswagen = "diesel" | "benzine" | "elektriciteit";
export interface VaaBedrijfswagenInput {
    cataloguswaarde: number;
    datumEersteInschrijving: string;
    brandstof: BrandstofBedrijfswagen;
    co2?: number;
    refDatum: string;
}
export interface VaaBedrijfswagenResultaat {
    vaaJaar: number;
    vaaMaand: number;
    cataloguswaarde: number;
    refCO2: number;
    co2: number;
    co2Percentage: number;
    leeftijdMaanden: number;
    leeftijdsCoefficient: number;
    minimumToegepast: boolean;
    datapunten: Datapunt[];
}
const CO2_BASIS_PERCENTAGE = 5.5;
const CO2_STAP_PERCENTAGE = 0.1;
const CO2_PERCENTAGE_MIN = 4;
const CO2_PERCENTAGE_MAX = 18;
export function vaaBedrijfswagen(input: VaaBedrijfswagenInput): VaaBedrijfswagenResultaat {
    const minVaa = safeGetValue("vaa_bedrijfswagen_min_2026", { refDatum: input.refDatum });
    const ref = input.brandstof === "diesel"
        ? safeGetValue("vaa_bedrijfswagen_co2_diesel_2026", { refDatum: input.refDatum })
        : input.brandstof === "benzine"
            ? safeGetValue("vaa_bedrijfswagen_co2_benzine_2026", { refDatum: input.refDatum })
            : null;
    const refCO2 = ref?.waarde ?? 0;
    const co2 = input.brandstof === "elektriciteit" ? 0 : Math.max(input.co2 ?? 0, 0);
    const co2Percentage = input.brandstof === "elektriciteit"
        ? CO2_PERCENTAGE_MIN
        : round2(clamp(CO2_BASIS_PERCENTAGE + (co2 - refCO2) * CO2_STAP_PERCENTAGE, CO2_PERCENTAGE_MIN, CO2_PERCENTAGE_MAX));
    const leeftijdMaanden = maandenSindsEersteInschrijving(input.datumEersteInschrijving, input.refDatum);
    const leeftijdsCoefficient = gemiddeldeLeeftijdsCoefficientVoorJaarGewogen(input.datumEersteInschrijving, input.refDatum);
    const cataloguswaarde = Math.max(input.cataloguswaarde, 0);
    const berekendJaar = round2(cataloguswaarde * (co2Percentage / 100) * leeftijdsCoefficient * (6 / 7));
    const minimum = minVaa.waarde ?? 0;
    const vaaJaar = round2(Math.max(minimum, berekendJaar));
    return {
        vaaJaar,
        vaaMaand: round2(vaaJaar / 12),
        cataloguswaarde,
        refCO2,
        co2,
        co2Percentage,
        leeftijdMaanden,
        leeftijdsCoefficient,
        minimumToegepast: vaaJaar > berekendJaar,
        datapunten: ref ? [minVaa.datapunt, ref.datapunt] : [minVaa.datapunt],
    };
}
function maandenSindsEersteInschrijving(start: string, refDatum: string): number {
    const [startJaar, startMaand] = splitYearMonth(start);
    const [refJaar, refMaand] = splitYearMonth(refDatum);
    return Math.max(0, (refJaar - startJaar) * 12 + (refMaand - startMaand));
}
function leeftijdsCoefficientVoorMaanden(maanden: number): number {
    return round2(Math.max(0.7, 1 - Math.floor(maanden / 12) * 0.06));
}
function gemiddeldeLeeftijdsCoefficientVoorJaarGewogen(datumEersteInschrijving: string, refDatum: string): number {
    const [jaar] = splitYearMonth(refDatum);
    const dagenInJaar = isSchrikkeljaar(jaar) ? 366 : 365;
    let gewogenSom = 0;
    for (let maand = 1; maand <= 12; maand++) {
        const maandStr = maand.toString().padStart(2, "0");
        const maandenSinds = maandenSindsEersteInschrijving(datumEersteInschrijving, `${jaar}-${maandStr}-01`);
        const coefficient = leeftijdsCoefficientVoorMaanden(maandenSinds);
        gewogenSom += coefficient * dagenInMaand(jaar, maand);
    }
    return gewogenSom / dagenInJaar;
}
function isSchrikkeljaar(jaar: number): boolean {
    return (jaar % 4 === 0 && jaar % 100 !== 0) || jaar % 400 === 0;
}
function dagenInMaand(jaar: number, maand: number): number {
    return new Date(jaar, maand, 0).getDate();
}
function splitYearMonth(value: string): [
    number,
    number
] {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`Ongeldige ISO-datum: ${value}`);
    }
    const [jaar, maand] = value.split("-").map((deel) => parseInt(deel, 10));
    return [jaar, maand];
}
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
