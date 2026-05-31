import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import { DatapuntNietBruikbaar, DatapuntOnbekend, } from "@/lib/errors";
import type { Datapunt } from "@/types/dataset";
import { berekenBvBijzonder, berekenNormaalBrutoJaarloonBijzonder, berekenRefertejaarloonBijzonder, type BvBijzonderResultaat, } from "@/lib/bvBijzonder";
import type { GezinsType } from "@/lib/bv";
const RSZ_WERKNEMER_PCT = 0.1307;
export interface EindejaarsInput {
    brutoloon: number;
    ancienniteitMaanden: number;
    prestatieMaandenInRefertepériode: number;
    gezinstype?: GezinsType;
    kinderenTenLaste?: number;
}
export interface EindejaarsResultaat {
    voorwaardenVoldaan: boolean;
    proRataFactor: number;
    premie: number;
    datapunt: Datapunt;
    toelichting: string;
    bvBijzonder?: BvBijzonderResultaat;
    nettoPremie?: number;
}
const MIN_ANCIENNITEIT_MAANDEN = 6;
export function eindejaarspremie(input: EindejaarsInput): EindejaarsResultaat {
    const dp = getDatapunt("pc200_eindejaarspremie");
    if (!dp)
        throw new DatapuntOnbekend("pc200_eindejaarspremie");
    if (dp.status === "niet_gevonden" || dp.status === "conflict") {
        throw new DatapuntNietBruikbaar("pc200_eindejaarspremie", `status ${dp.status}`);
    }
    const voorwaarden = input.ancienniteitMaanden >= MIN_ANCIENNITEIT_MAANDEN &&
        input.brutoloon > 0;
    if (!voorwaarden) {
        return {
            voorwaardenVoldaan: false,
            proRataFactor: 0,
            premie: 0,
            datapunt: dp,
            toelichting: `Anciënniteit ${input.ancienniteitMaanden} maanden < ${MIN_ANCIENNITEIT_MAANDEN} maanden — geen recht op eindejaarspremie.`,
        };
    }
    const factor = Math.max(0, Math.min(12, input.prestatieMaandenInRefertepériode)) / 12;
    const premie = round2(input.brutoloon * factor);
    const base: EindejaarsResultaat = {
        voorwaardenVoldaan: true,
        proRataFactor: factor,
        premie,
        datapunt: dp,
        toelichting: `Volledige premie = 1 maandloon (€ ${input.brutoloon.toFixed(2)}). ` +
            `Pro-rata: ${input.prestatieMaandenInRefertepériode}/12 = ${factor.toFixed(4)}.`,
    };
    if (input.gezinstype && premie > 0) {
        const rsz = round2(premie * RSZ_WERKNEMER_PCT);
        const belastbaar = round2(premie - rsz);
        const bv = berekenBvBijzonder({
            refertejaarloon: berekenRefertejaarloonBijzonder(input.brutoloon),
            normaalBrutoJaarloon: berekenNormaalBrutoJaarloonBijzonder(input.brutoloon),
            exceptioneelBruto: belastbaar,
            gezinstype: input.gezinstype,
            kinderenTenLaste: input.kinderenTenLaste ?? 0,
            soort: "andere_exceptionele_vergoeding",
        });
        base.bvBijzonder = bv;
        base.nettoPremie = bv.nettoBedrag;
    }
    return base;
}
