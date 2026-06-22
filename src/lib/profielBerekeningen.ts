import { brutolocheck, lookupBarema, lookupStudentenbarema, type BaremaLookupResult, type BrutolocheckResult, type StudentenLookupResult, } from "@/lib/baremas";
import { berekenWoonwerkVerkeer, type WoonwerkVerkeerResultaat, } from "@/lib/woonwerkVerkeer";
import { vaaBedrijfswagen, type VaaBedrijfswagenResultaat, } from "@/lib/vaaBedrijfswagen";
import { vaaForfaitsWerkmiddelen, type VaaForfaitsWerkmiddelenResultaat, } from "@/lib/vaaForfaits";
import { berekenJaaroverzicht, type JaaroverzichtResultaat, } from "@/lib/jaaroverzicht";
import { berekenOnkostenvergoeding, type OnkostenvergoedingResultaat } from "@/lib/onkostenvergoeding";
import { berekenNetto, type NettoInput, type NettoResultaat } from "@/lib/netto";
import { zoekBrutoVoorNetto, type NettoNaarBrutoResultaat, } from "@/lib/nettoNaarBruto";
import { MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026, werkgeverskost, loonwig, type WerkgeverskostResultaat, } from "@/lib/werkgeverskost";
import { round2 } from "@/lib/money";
import { aantalWeekdagenInMaand, heeftMaaltijdcheques, refDatumVoorMaand, type BeroepskostMethode, type Profiel, } from "@/lib/profiel";
export type BaremaInlineResult = {
    kind: "checked";
    check: BrutolocheckResult;
} | {
    kind: "error";
    message: string;
};
export interface MobiliteitBerekening {
    woonwerk: WoonwerkVerkeerResultaat;
    vaaBedrijfswagen: VaaBedrijfswagenResultaat | null;
}
export interface MaaltijdchequeWaarde {
    totaleWaardePerDag: number;
    totaleWaarde: number;
    werkdagen: number;
}
export interface ProfielKernOutputs {
    bruto: number;
    netto: number | null;
    werkgeverskostMaand: number | null;
    loonwigPct: number | null;
    nettoJaar: number | null;
    werkgeverskostJaar: number | null;
}
export function berekenOnkostenvergoedingVoorProfiel(p: Profiel, refDatum: string): OnkostenvergoedingResultaat {
    return berekenOnkostenvergoeding({
        categorieen: p.onkostenCategorieen,
        arbeidsdagenPerMaand: p.arbeidsdagenPerMaand,
        refDatum,
    });
}
export function berekenMaaltijdchequeWaarde({ werkgeversaandeelPerDag, werknemersbijdragePerDag, werkdagen, }: {
    werkgeversaandeelPerDag: number;
    werknemersbijdragePerDag: number;
    werkdagen: number;
}): MaaltijdchequeWaarde {
    const werkgeversaandeel = Math.min(werkgeversaandeelPerDag, MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026);
    const totaleWaardePerDag = round2(werkgeversaandeel + werknemersbijdragePerDag);
    const totaleWaarde = round2(totaleWaardePerDag * Math.max(werkdagen, 0));
    return {
        totaleWaardePerDag,
        totaleWaarde,
        werkdagen: Math.max(werkdagen, 0),
    };
}
export function berekenMaaltijdchequeWerkgeverskostVoorProfiel(p: Profiel): number {
    if (!heeftMaaltijdcheques(p))
        return 0;
    return round2(Math.min(p.maaltijdchequeWerkgeversaandeelPerDag, MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026) * p.arbeidsdagenPerMaand);
}
export function bonusJaarbedragVoorProfiel(p: Profiel): number {
    const bedrag = Math.max(0, p.bonusBedrag);
    return round2(p.bonusPeriode === "maand" ? bedrag * 12 : bedrag);
}
export function berekenBaremaInlineCheck(profiel: Profiel): BaremaInlineResult {
    const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
    try {
        return {
            kind: "checked",
            check: brutolocheck(profiel.schaal, profiel.cat, profiel.ervaringJaren, profiel.brutoloon, refDatum, profiel.tewerkstellingsbreuk),
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Barema kon niet worden gecontroleerd.";
        return { kind: "error", message };
    }
}
export function berekenBediendeLoonbasisVoorProfiel(p: Profiel, refDatum: string): {
    barema: BaremaLookupResult;
    check: BrutolocheckResult;
} {
    return {
        barema: lookupBarema(p.schaal, p.cat, p.ervaringJaren, refDatum),
        check: brutolocheck(p.schaal, p.cat, p.ervaringJaren, p.brutoloon, refDatum, p.tewerkstellingsbreuk),
    };
}
export function berekenStudentenBaremaVoorProfiel(p: Profiel, refDatum: string): StudentenLookupResult {
    return lookupStudentenbarema(p.studentenCat, p.studentLeeftijd, refDatum);
}
export function berekenVaaWerkmiddelenVoorProfiel(p: Profiel, refDatum: string): VaaForfaitsWerkmiddelenResultaat {
    return vaaForfaitsWerkmiddelen({
        pcLaptopActief: p.vaaPcLaptopActief,
        gsmSmartphoneActief: p.vaaGsmSmartphoneActief,
        internetActief: p.vaaInternetActief,
        gsmAbonnementActief: p.vaaGsmAbonnementActief,
        refDatum,
    });
}
export function berekenWoonwerkVrijgesteld(woonwerk: WoonwerkVerkeerResultaat, privewagenMethode: BeroepskostMethode): number {
    const openbaarVervoer = round2((woonwerk.componenten.trein?.vergoeding ?? 0) +
        (woonwerk.componenten.busTramMetro?.vergoeding ?? 0));
    const fiets = Math.min(woonwerk.componenten.fiets?.vergoeding ?? 0, round2(3700 / 12));
    const privewagen = privewagenMethode === "forfaitair"
        ? Math.min(woonwerk.componenten.privewagen?.vergoeding ?? 0, round2(500 / 12))
        : 0;
    return round2(Math.max(0, openbaarVervoer + fiets + privewagen));
}
export function berekenWoonwerkNettoVrijgesteld(woonwerk: WoonwerkVerkeerResultaat): number {
    return round2(
        (woonwerk.componenten.trein?.vergoeding ?? 0) +
        (woonwerk.componenten.busTramMetro?.vergoeding ?? 0) +
        (woonwerk.componenten.fiets?.vergoeding ?? 0),
    );
}
export function berekenWoonwerkBelastbaarVoorBV(woonwerk: WoonwerkVerkeerResultaat): number {
    return round2(woonwerk.componenten.privewagen?.vergoeding ?? 0);
}
export function berekenWoonwerkBvVrijstellingVoorProfiel(p: Profiel, woonwerk: WoonwerkVerkeerResultaat): number {
    if (p.woonwerkBedrijfswagen && p.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair") {
        return round2(500 / 12);
    }
    if (p.woonwerkPrivewagen && p.woonwerkPrivewagenBeroepskostMethode === "forfaitair") {
        return Math.min(woonwerk.componenten.privewagen?.vergoeding ?? 0, round2(500 / 12));
    }
    return 0;
}
export function berekenMobiliteitVoorProfiel(p: Profiel, refDatum: string, brutoloonOverride?: number): MobiliteitBerekening {
    const werkdagenInMaand = aantalWeekdagenInMaand(p.berekeningsJaar, p.berekeningsMaand);
    const woonwerk = berekenWoonwerkVerkeer({
        refDatum,
        brutoloon: brutoloonOverride ?? p.brutoloon,
        arbeidsdagenPerMaand: p.arbeidsdagenPerMaand,
        werkdagenInMaand,
        fiets: { actief: p.woonwerkFiets, kmPerDag: p.kmPerDag },
        trein: { actief: p.woonwerkTrein, kmEnkel: p.treinKm },
        busTramMetro: {
            actief: p.woonwerkBusTramMetro,
            kmEnkel: p.busTramMetroKm,
            prijsPerMaand: p.busTramMetroPrijs,
        },
        privewagen: { actief: p.woonwerkPrivewagen, kmEnkel: p.privewagenKm },
    });
    const vaa = p.woonwerkBedrijfswagen
        ? vaaBedrijfswagen({
            cataloguswaarde: p.bedrijfswagenCataloguswaarde,
            datumEersteInschrijving: p.bedrijfswagenDatumEersteInschrijving,
            brandstof: p.bedrijfswagenBrandstof,
            co2: p.bedrijfswagenCo2,
            refDatum,
        })
        : null;
    return { woonwerk, vaaBedrijfswagen: vaa };
}
export function berekenNettoVoorProfiel(p: Profiel, refDatum: string, brutoloonOverride?: number): NettoResultaat {
    const brutoloon = brutoloonOverride ?? p.brutoloon;
    return berekenNetto(bouwNettoInputVoorProfiel(p, refDatum, brutoloon));
}
export function zoekBrutoVoorProfielDoelNetto(p: Profiel, refDatum: string): NettoNaarBrutoResultaat {
    const { brutoloon: _brutoloon, ...nettoInput } = bouwNettoInputVoorProfiel(p, refDatum, p.brutoloon);
    return zoekBrutoVoorNetto({
        ...nettoInput,
        doelNettoloon: p.doelNettoloon,
    });
}
function bouwNettoInputVoorProfiel(p: Profiel, refDatum: string, brutoloon: number): NettoInput {
    const maaltijdchequesActief = heeftMaaltijdcheques(p);
    const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum, brutoloon);
    const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
    return {
        brutoloon,
        refDatum,
        tewerkstellingsbreuk: p.tewerkstellingsbreuk,
        bouwVlag: p.bouwVlag,
        gezinstype: p.gezinstype,
        kinderenTenLaste: p.kinderenTenLaste,
        fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
        groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
        maaltijdchequeWerknemersbijdragePerDag: maaltijdchequesActief
            ? p.maaltijdchequeWerknemersbijdragePerDag
            : 0,
        maaltijdchequeWerkdagen: maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0,
        hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
        onkostenvergoedingPerMaand: berekenOnkostenvergoedingVoorProfiel(p, refDatum).totaal,
        woonwerkVergoedingPerMaand: berekenWoonwerkBelastbaarVoorBV(mobiliteit.woonwerk),
        woonwerkNettoVrijgesteldPerMaand: berekenWoonwerkNettoVrijgesteld(mobiliteit.woonwerk),
        woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(mobiliteit.woonwerk, p.woonwerkPrivewagenBeroepskostMethode),
        bvVrijstellingWoonWerkPerMaand: berekenWoonwerkBvVrijstellingVoorProfiel(p, mobiliteit.woonwerk),
        vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
        vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
    };
}
export function berekenWerkgeverskostVoorProfiel(p: Profiel, refDatum: string, vaaWerkmiddelen?: VaaForfaitsWerkmiddelenResultaat, mobiliteit?: MobiliteitBerekening, brutoloonOverride?: number): WerkgeverskostResultaat {
    const resolvedVaaWerkmiddelen = vaaWerkmiddelen ?? berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
    const brutoloon = brutoloonOverride ?? p.brutoloon;
    const resolvedMobiliteit = mobiliteit ?? berekenMobiliteitVoorProfiel(p, refDatum, brutoloon);
    const vaaPerMaand = resolvedVaaWerkmiddelen.totaalPerMaand +
        (resolvedMobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0);
    return werkgeverskost({
        brutoloon,
        refDatum,
        bouwVlag: p.bouwVlag,
        arbeidsongevallenPct: p.arbeidsongevallenPct,
        premieEjpPct: 0,
        extraGroepsverzekering: p.extraGroepsverzekering,
        maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequesActief
            ? p.maaltijdchequeWerkgeversaandeelPerDag
            : 0,
        maaltijdchequeWerkdagen: p.maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0,
        extraHospitalisatie: p.extraHospitalisatie,
        extraEcocheques: 0,
        vaaRszPlichtigPerMaand: resolvedVaaWerkmiddelen.totaalPerMaand,
        vaaPerMaand,
        onkostenvergoedingPerMaand: berekenOnkostenvergoedingVoorProfiel(p, refDatum).totaal,
        woonwerkVergoedingPerMaand: resolvedMobiliteit.woonwerk.totaalVergoeding,
        doelgroepverminderingEersteAanwervingen: p.doelgroepverminderingEersteAanwervingen,
    });
}
export function berekenLoonwigVoorProfielResultaat(wgk: WerkgeverskostResultaat, netto: NettoResultaat): number {
    return loonwig(wgk.totaleLoonkostBreed, netto.nettoloon);
}
export function berekenJaaroverzichtVoorProfiel(p: Profiel, refDatum: string, netto: NettoResultaat, wgk: WerkgeverskostResultaat, vaaWerkmiddelen: VaaForfaitsWerkmiddelenResultaat, mobiliteit: MobiliteitBerekening): JaaroverzichtResultaat {
    const eindejaarsMaanden = { ancienniteitMaanden: 12, prestatieMaanden: 12 };
    return berekenJaaroverzicht({
        brutoloon: p.brutoloon,
        nettoloonPerMaand: netto.nettoloon,
        loonkostWerkgeverPerMaand: wgk.totaleLoonkostBreed,
        refDatum,
        gezinstype: p.gezinstype,
        kinderenTenLaste: p.kinderenTenLaste,
        ancienniteitMaanden: eindejaarsMaanden.ancienniteitMaanden,
        prestatieMaandenInRefertepériode: eindejaarsMaanden.prestatieMaanden,
        tewerkstellingsbreuk: p.tewerkstellingsbreuk,
        bonusJaarbedrag: bonusJaarbedragVoorProfiel(p),
        vaaPerMaand: vaaWerkmiddelen.totaalPerMaand +
            (mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0),
        doelgroepverminderingWerkgeverJaar: wgk.doelgroepverminderingWerkgeverPerJaar,
        doelgroepverminderingDatapunten: wgk.datapunten.filter((dp) => dp.id.startsWith("doelgroepvermindering_")),
    });
}
export function berekenProfielKernOutputs(p: Profiel): ProfielKernOutputs {
    if (p.statuut !== "bediende") {
        return {
            bruto: p.brutoloon,
            netto: null,
            werkgeverskostMaand: null,
            loonwigPct: null,
            nettoJaar: null,
            werkgeverskostJaar: null,
        };
    }
    try {
        const refDatum = refDatumVoorMaand(p.berekeningsJaar, p.berekeningsMaand);
        const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
        const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
        const netto = berekenNettoVoorProfiel(p, refDatum);
        const wgk = berekenWerkgeverskostVoorProfiel(p, refDatum, vaaWerkmiddelen, mobiliteit);
        const jaaroverzicht = berekenJaaroverzichtVoorProfiel(p, refDatum, netto, wgk, vaaWerkmiddelen, mobiliteit);
        return {
            bruto: p.brutoloon,
            netto: netto.nettoloon,
            werkgeverskostMaand: wgk.totaleLoonkostBreed,
            loonwigPct: berekenLoonwigVoorProfielResultaat(wgk, netto),
            nettoJaar: jaaroverzicht.netto.totaalNettoJaarloon,
            werkgeverskostJaar: jaaroverzicht.werkgever.totaleLoonkostJaar,
        };
    }
    catch {
        return {
            bruto: p.brutoloon,
            netto: null,
            werkgeverskostMaand: null,
            loonwigPct: null,
            nettoJaar: null,
            werkgeverskostJaar: null,
        };
    }
}
