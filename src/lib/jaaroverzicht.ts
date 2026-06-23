import { berekenBvBijzonder, berekenNormaalBrutoJaarloonBijzonder, berekenRefertejaarloonBijzonder, } from "@/lib/bvBijzonder";
import type { GezinsType } from "@/lib/bv";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import { ecocheques } from "@/lib/ecocheques";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { round2 } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";
const RSZ_WERKNEMER_PCT = 0.1307;
const RSZ_WERKGEVER_JAARPREMIES_PCT = 0.25;
const DUBBEL_VAKANTIEGELD_RSZ_BASIS_FRACTIE = 85 / 92;
export interface JaaroverzichtInput {
    brutoloon: number;
    nettoloonPerMaand: number;
    loonkostWerkgeverPerMaand: number;
    refDatum: string;
    gezinstype: GezinsType;
    kinderenTenLaste: number;
    ancienniteitMaanden: number;
    prestatieMaandenInRefertepériode: number;
    tewerkstellingsbreuk: number;
    bonusJaarbedrag?: number;
    vaaPerMaand?: number;
    doelgroepverminderingWerkgeverJaar?: number;
    doelgroepverminderingDatapunten?: Datapunt[];
}
export interface JaarcomponentNetto {
    bruto: number;
    rsz: number;
    belastbaar: number;
    bv: number;
    bvTarief: number;
    netto: number;
    datapunten: Datapunt[];
}
export interface NettoJaaroverzicht {
    maandloonNettoX12: number;
    eindejaarspremie: JaarcomponentNetto;
    dubbelVakantiegeld: JaarcomponentNetto;
    jaarpremie: JaarcomponentNetto;
    bonus: JaarcomponentNetto;
    variabelEnkelVakantiegeldOpBonus: JaarcomponentNetto;
    variabelDubbelVakantiegeldOpBonus: JaarcomponentNetto;
    ecocheques: number;
    totaalNettoJaarloon: number;
}
export interface WerkgeverJaaroverzicht {
    maandbasisX12: number;
    jaarpremiesEnEcocheques: number;
    rszOpEindejaarspremieEnJaarpremie: number;
    bonusBruto: number;
    rszOpBonus: number;
    variabelEnkelVakantiegeldOpBonusBruto: number;
    variabelEnkelVakantiegeldOpBonusRsz: number;
    variabelDubbelVakantiegeldOpBonusBruto: number;
    variabelDubbelVakantiegeldOpBonusRsz: number;
    dubbelVakantiegeld: number;
    doelgroepvermindering: number;
    totaleLoonkostJaarExclusiefDoelgroepvermindering: number;
    totaleLoonkostJaarInclusiefDoelgroepvermindering: number;
    totaleLoonkostJaar: number;
    datapunten: Datapunt[];
}
export interface JaaroverzichtResultaat {
    netto: NettoJaaroverzicht;
    werkgever: WerkgeverJaaroverzicht;
}
export function berekenJaaroverzicht(input: JaaroverzichtInput): JaaroverzichtResultaat {
    const normaalBrutoJaarloon = berekenNormaalBrutoJaarloonBijzonder(input.brutoloon);
    const refertejaarloon = berekenRefertejaarloonBijzonder(input.brutoloon);
    const eindejaar = eindejaarspremie({
        brutoloon: input.brutoloon,
        ancienniteitMaanden: input.ancienniteitMaanden,
        prestatieMaandenInRefertepériode: input.prestatieMaandenInRefertepériode,
    });
    const jaarpremie = jaarlijksePremie2026({
        refDatum: input.refDatum,
        brutomaandloon: input.brutoloon,
        gezinstype: input.gezinstype,
        kinderenTenLaste: input.kinderenTenLaste,
    });
    const eco = ecocheques({
        tewerkstellingsbreuk: input.tewerkstellingsbreuk,
        refDatum: input.refDatum,
    });
    const eindejaarNetto = berekenAndereExceptioneleComponent(eindejaar.premie, normaalBrutoJaarloon, refertejaarloon, input.gezinstype, input.kinderenTenLaste, eindejaar.datapunt);
    const dubbelVakantiegeld = berekenDubbelVakantiegeldComponent(input, normaalBrutoJaarloon, refertejaarloon);
    const jaarpremieNetto = berekenAndereExceptioneleComponent(jaarpremie.bedrag, normaalBrutoJaarloon, refertejaarloon, input.gezinstype, input.kinderenTenLaste, jaarpremie.datapunt);
    const bonusJaarbedrag = round2(Math.max(input.bonusJaarbedrag ?? 0, 0));
    const bonusNetto = berekenAndereExceptioneleComponent(bonusJaarbedrag, normaalBrutoJaarloon, refertejaarloon, input.gezinstype, input.kinderenTenLaste);
    const variabelEnkelVakantiegeldOpBonus = berekenVariabelVakantiegeldOpBonusComponent({
        bonusJaarbedrag,
        refDatum: input.refDatum,
        normaalBrutoJaarloon,
        refertejaarloon,
        gezinstype: input.gezinstype,
        kinderenTenLaste: input.kinderenTenLaste,
        pctDatapuntId: "vakantiegeld_variabel_enkel_bonus_pct_2026",
    });
    const variabelDubbelVakantiegeldOpBonus = berekenVariabelVakantiegeldOpBonusComponent({
        bonusJaarbedrag,
        refDatum: input.refDatum,
        normaalBrutoJaarloon,
        refertejaarloon,
        gezinstype: input.gezinstype,
        kinderenTenLaste: input.kinderenTenLaste,
        pctDatapuntId: "vakantiegeld_variabel_dubbel_bonus_pct_2026",
    });
    const maandloonNettoX12 = round2(input.nettoloonPerMaand * 12);
    const totaalNettoJaarloon = round2(maandloonNettoX12 +
        eindejaarNetto.netto +
        dubbelVakantiegeld.netto +
        jaarpremieNetto.netto +
        bonusNetto.netto +
        variabelEnkelVakantiegeldOpBonus.netto +
        variabelDubbelVakantiegeldOpBonus.netto +
        eco.bedrag);
    const maandbasisX12 = round2(input.loonkostWerkgeverPerMaand * 12);
    const jaarpremiesEnEcocheques = round2(eindejaar.premie + jaarpremie.bedrag + eco.bedrag);
    const rszOpEindejaarspremieEnJaarpremie = round2((eindejaar.premie + jaarpremie.bedrag) * RSZ_WERKGEVER_JAARPREMIES_PCT);
    const rszOpBonus = round2(bonusJaarbedrag * RSZ_WERKGEVER_JAARPREMIES_PCT);
    const variabelEnkelVakantiegeldOpBonusRsz = round2(variabelEnkelVakantiegeldOpBonus.bruto * RSZ_WERKGEVER_JAARPREMIES_PCT);
    const variabelDubbelVakantiegeldOpBonusRsz = round2(variabelDubbelVakantiegeldOpBonus.bruto * RSZ_WERKGEVER_JAARPREMIES_PCT);
    const totaleLoonkostJaar = round2(maandbasisX12 +
        jaarpremiesEnEcocheques +
        rszOpEindejaarspremieEnJaarpremie +
        bonusJaarbedrag +
        rszOpBonus +
        variabelEnkelVakantiegeldOpBonus.bruto +
        variabelEnkelVakantiegeldOpBonusRsz +
        variabelDubbelVakantiegeldOpBonus.bruto +
        variabelDubbelVakantiegeldOpBonusRsz +
        dubbelVakantiegeld.bruto);
    const doelgroepvermindering = round2(Math.max(0, input.doelgroepverminderingWerkgeverJaar ?? 0));
    const totaleLoonkostJaarInclusiefDoelgroepvermindering = round2(Math.max(0, totaleLoonkostJaar - doelgroepvermindering));
    return {
        netto: {
            maandloonNettoX12,
            eindejaarspremie: eindejaarNetto,
            dubbelVakantiegeld,
            jaarpremie: jaarpremieNetto,
            bonus: bonusNetto,
            variabelEnkelVakantiegeldOpBonus,
            variabelDubbelVakantiegeldOpBonus,
            ecocheques: eco.bedrag,
            totaalNettoJaarloon,
        },
        werkgever: {
            maandbasisX12,
            jaarpremiesEnEcocheques,
            rszOpEindejaarspremieEnJaarpremie,
            bonusBruto: bonusJaarbedrag,
            rszOpBonus,
            variabelEnkelVakantiegeldOpBonusBruto: variabelEnkelVakantiegeldOpBonus.bruto,
            variabelEnkelVakantiegeldOpBonusRsz,
            variabelDubbelVakantiegeldOpBonusBruto: variabelDubbelVakantiegeldOpBonus.bruto,
            variabelDubbelVakantiegeldOpBonusRsz,
            dubbelVakantiegeld: dubbelVakantiegeld.bruto,
            doelgroepvermindering,
            totaleLoonkostJaarExclusiefDoelgroepvermindering: totaleLoonkostJaar,
            totaleLoonkostJaarInclusiefDoelgroepvermindering,
            totaleLoonkostJaar,
            datapunten: uniekeDatapunten([
                eindejaar.datapunt,
                jaarpremie.datapunt,
                eco.datapunt,
                ...(bonusJaarbedrag > 0 ? bonusNetto.datapunten : []),
                ...(bonusJaarbedrag > 0 ? variabelEnkelVakantiegeldOpBonus.datapunten : []),
                ...(bonusJaarbedrag > 0 ? variabelDubbelVakantiegeldOpBonus.datapunten : []),
                ...dubbelVakantiegeld.datapunten,
                ...(doelgroepvermindering > 0 ? input.doelgroepverminderingDatapunten ?? [] : []),
            ]),
        },
    };
}
function berekenVariabelVakantiegeldOpBonusComponent(input: {
    bonusJaarbedrag: number;
    refDatum: string;
    normaalBrutoJaarloon: number;
    refertejaarloon: number;
    gezinstype: GezinsType;
    kinderenTenLaste: number;
    pctDatapuntId: "vakantiegeld_variabel_enkel_bonus_pct_2026" | "vakantiegeld_variabel_dubbel_bonus_pct_2026";
}): JaarcomponentNetto {
    const pctRes = safeGetValue(input.pctDatapuntId, { refDatum: input.refDatum });
    const bruto = round2(input.bonusJaarbedrag * (pctRes.waarde ?? 0));
    const component = berekenAndereExceptioneleComponent(bruto, input.normaalBrutoJaarloon, input.refertejaarloon, input.gezinstype, input.kinderenTenLaste);
    return {
        ...component,
        datapunten: uniekeDatapunten([pctRes.datapunt, ...component.datapunten]),
    };
}
function berekenAndereExceptioneleComponent(bruto: number, normaalBrutoJaarloon: number, refertejaarloon: number, gezinstype: GezinsType, kinderenTenLaste: number, datapunt?: Datapunt): JaarcomponentNetto {
    const rsz = round2(bruto * RSZ_WERKNEMER_PCT);
    const belastbaar = round2(bruto - rsz);
    const bv = berekenBvBijzonder({
        refertejaarloon,
        normaalBrutoJaarloon,
        exceptioneelBruto: belastbaar,
        gezinstype,
        kinderenTenLaste,
        soort: "andere_exceptionele_vergoeding",
    });
    return {
        bruto,
        rsz,
        belastbaar,
        bv: bv.bvNetto,
        bvTarief: bv.tarief,
        netto: bv.nettoBedrag,
        datapunten: uniekeDatapunten([datapunt, bv.datapunt]),
    };
}
function berekenDubbelVakantiegeldComponent(input: JaaroverzichtInput, normaalBrutoJaarloon: number, refertejaarloon: number): JaarcomponentNetto {
    const vgPctRes = safeGetValue("vakantiegeld_dubbel_pct_2026", { refDatum: input.refDatum });
    const vgPct = vgPctRes.waarde ?? 0.92;
    const bruto = round2(input.brutoloon * vgPct);
    const rszBasis = round2(bruto * DUBBEL_VAKANTIEGELD_RSZ_BASIS_FRACTIE);
    const rsz = round2(rszBasis * RSZ_WERKNEMER_PCT);
    const belastbaar = round2(bruto - rsz);
    const bv = berekenBvBijzonder({
        refertejaarloon,
        normaalBrutoJaarloon,
        exceptioneelBruto: belastbaar,
        gezinstype: input.gezinstype,
        kinderenTenLaste: input.kinderenTenLaste,
        soort: "vakantiegeld",
    });
    const vakantiegeldDatapunt = getDatapunt("pc200_vakantiegeld_bedienden");
    return {
        bruto,
        rsz,
        belastbaar,
        bv: bv.bvNetto,
        bvTarief: bv.tarief,
        netto: bv.nettoBedrag,
        datapunten: uniekeDatapunten([vakantiegeldDatapunt, bv.datapunt, vgPctRes.datapunt]),
    };
}
function uniekeDatapunten(datapunten: Array<Datapunt | null | undefined>): Datapunt[] {
    const seen = new Map<string, Datapunt>();
    for (const dp of datapunten) {
        if (!dp)
            continue;
        if (!seen.has(dp.id)) {
            seen.set(dp.id, dp);
        }
    }
    return Array.from(seen.values());
}
