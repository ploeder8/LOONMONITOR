import { safeGetValue } from "@/lib/periode";
import { round2 } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";
import type { GezinsType } from "@/lib/bv";
import { berekenBvBijzonder, berekenNormaalBrutoJaarloonBijzonder, berekenRefertejaarloonBijzonder, type BvBijzonderResultaat, } from "@/lib/bvBijzonder";
const RSZ_WERKNEMER_PCT = 0.1307;
export interface JaarpremieInput {
    refDatum: string;
    brutomaandloon?: number;
    gezinstype?: GezinsType;
    kinderenTenLaste?: number;
}
export interface JaarpremieResultaat {
    bedrag: number;
    datapunt: Datapunt;
    bvBijzonder?: BvBijzonderResultaat;
    nettoBedrag?: number;
}
export function jaarlijksePremie2026(refDatumOrInput: string | JaarpremieInput): JaarpremieResultaat {
    const input: JaarpremieInput = typeof refDatumOrInput === "string" ? { refDatum: refDatumOrInput } : refDatumOrInput;
    const r = safeGetValue("pc200_jaarlijkse_premie_2026", { refDatum: input.refDatum });
    const bedrag = r.waarde ?? 0;
    const base: JaarpremieResultaat = {
        bedrag,
        datapunt: r.datapunt,
    };
    if (bedrag > 0) {
        const rsz = round2(bedrag * RSZ_WERKNEMER_PCT);
        const belastbaar = round2(bedrag - rsz);
        if (input.brutomaandloon && input.gezinstype) {
            const bvBijzonder = berekenBvBijzonder({
                refertejaarloon: berekenRefertejaarloonBijzonder(input.brutomaandloon),
                normaalBrutoJaarloon: berekenNormaalBrutoJaarloonBijzonder(input.brutomaandloon),
                exceptioneelBruto: belastbaar,
                gezinstype: input.gezinstype,
                kinderenTenLaste: input.kinderenTenLaste ?? 0,
                soort: "andere_exceptionele_vergoeding",
            });
            base.bvBijzonder = bvBijzonder;
            base.nettoBedrag = bvBijzonder.nettoBedrag;
        }
        else {
            base.nettoBedrag = belastbaar;
        }
    }
    return base;
}
