import { round2 } from "@/lib/money";
import { rszBijdragen, type RszResultaat } from "@/lib/rsz";
import { werkbonus, type WerkbonusResultaat } from "@/lib/werkbonus";
import { bbsz, type BbszResultaat } from "@/lib/bbsz";
import { berekenBV, type BvResultaat, type GezinsType } from "@/lib/bv";
export type { GezinsType };
const FISCALE_WERKBONUS_PCT_LUIK_A = 0.3314;
const FISCALE_WERKBONUS_PCT_LUIK_B = 0.5254;
export interface NettoInput {
    brutoloon: number;
    refDatum: string;
    tewerkstellingsbreuk?: number;
    bouwVlag?: boolean;
    gezinstype: GezinsType;
    kinderenTenLaste: number;
    fiscaalAlleenstaandeMetKind?: boolean;
    groepsverzekeringEigenBijdrage?: number;
    maaltijdchequeWerknemersbijdragePerDag?: number;
    maaltijdchequeWerkdagen?: number;
    woonwerkVergoedingPerMaand?: number;
    woonwerkNettoVrijgesteldPerMaand?: number;
    woonwerkVrijgesteldPerMaand?: number;
    bvVrijstellingWoonWerkPerMaand?: number;
    hospitalisatieEigenBijdrage?: number;
    onkostenvergoedingPerMaand?: number;
    vaaRszPlichtigPerMaand?: number;
    vaaBedrijfswagenPerMaand?: number;
}
export interface NettoResultaat {
    brutoloon: number;
    brutoRszBasis: number;
    rsz: RszResultaat;
    werkbonus: WerkbonusResultaat;
    fiscaleWerkbonus: number;
    effectieveRsz: number;
    belastbaarMaandloon: number;
    belastbaarMaandloonVoorBV: number;
    woonwerkVergoedingPerMaand: number;
    woonwerkNettoVrijgesteldPerMaand: number;
    woonwerkVrijgesteldPerMaand: number;
    bvVrijstellingWoonWerkPerMaand: number;
    vaaRszPlichtigPerMaand: number;
    vaaBedrijfswagenPerMaand: number;
    bbsz: BbszResultaat;
    bv: BvResultaat;
    maaltijdchequeWerknemersbijdragePerDag: number;
    maaltijdchequeWerkdagen: number;
    maaltijdchequeWerknemersbijdrage: number;
    hospitalisatieEigenBijdrage: number;
    onkostenvergoedingPerMaand: number;
    nettoloon: number;
}
export function berekenNetto(input: NettoInput): NettoResultaat {
    const { brutoloon, refDatum, tewerkstellingsbreuk = 1, bouwVlag = false, gezinstype, kinderenTenLaste, fiscaalAlleenstaandeMetKind = false, groepsverzekeringEigenBijdrage = 0, maaltijdchequeWerknemersbijdragePerDag = 0, maaltijdchequeWerkdagen = 0, woonwerkVergoedingPerMaand = 0, woonwerkNettoVrijgesteldPerMaand = 0, woonwerkVrijgesteldPerMaand = 0, bvVrijstellingWoonWerkPerMaand = 0, hospitalisatieEigenBijdrage = 0, onkostenvergoedingPerMaand = 0, vaaRszPlichtigPerMaand = 0, vaaBedrijfswagenPerMaand = 0, } = input;
    const vaaRszPlichtig = round2(Math.max(vaaRszPlichtigPerMaand, 0));
    const brutoRszBasis = round2(brutoloon + vaaRszPlichtig);
    const rszR = rszBijdragen({ brutoloon: brutoRszBasis, refDatum, bouwVlag });
    const geldigeBreuk = Number.isFinite(tewerkstellingsbreuk) && tewerkstellingsbreuk > 0
        ? tewerkstellingsbreuk
        : 1;
    const werkbonusVergelijkingsLoon = round2(brutoRszBasis / geldigeBreuk);
    const werkbonusR = werkbonus({
        brutoloon: werkbonusVergelijkingsLoon,
        refDatum,
        tewerkstellingsbreuk: geldigeBreuk,
    });
    const bbszR = bbsz({ brutoloon: brutoRszBasis, gezinstype });
    const effectieveRsz = round2(Math.max(0, rszR.werknemerBijdrage - werkbonusR.totaal));
    const woonwerkVergoeding = round2(Math.max(woonwerkVergoedingPerMaand, 0));
    const woonwerkNettoVrijgesteld = round2(Math.max(woonwerkNettoVrijgesteldPerMaand, 0));
    const belastbaarMaandloon = round2(brutoRszBasis - effectieveRsz);
    const belastbaarMaandloonVoorBV = round2(belastbaarMaandloon + woonwerkVergoeding + Math.max(vaaBedrijfswagenPerMaand, 0));
    const bvVrijstellingWoonWerk = round2(Math.max(bvVrijstellingWoonWerkPerMaand, 0));
    const fiscaleWerkbonus = round2(FISCALE_WERKBONUS_PCT_LUIK_A * werkbonusR.luikA +
        FISCALE_WERKBONUS_PCT_LUIK_B * werkbonusR.luikB);
    const bvR = berekenBV({
        belastbaarMaandloon: belastbaarMaandloonVoorBV,
        grondslagVrijstellingPerMaand: bvVrijstellingWoonWerk,
        gezinstype,
        kinderenTenLaste,
        fiscaalAlleenstaandeMetKind,
        groepsverzekeringEigenBijdrage,
        fiscaleWerkbonusKrediet: fiscaleWerkbonus,
    });
    const maaltijdchequeWerknemersbijdrage = round2(Math.max(maaltijdchequeWerknemersbijdragePerDag, 0) *
        Math.max(maaltijdchequeWerkdagen, 0));
    const maaltijdchequeBijdragePerDag = round2(Math.max(maaltijdchequeWerknemersbijdragePerDag, 0));
    const maaltijdchequeDagen = Math.max(maaltijdchequeWerkdagen, 0);
    const hospitalisatieEigenBijdrageBedrag = round2(Math.max(hospitalisatieEigenBijdrage, 0));
    const onkostenvergoedingBedrag = round2(Math.max(onkostenvergoedingPerMaand, 0));
    const nettoloon = round2(belastbaarMaandloonVoorBV -
        bvR.bvNaVerminderingen -
        bbszR.maandelijksBedrag -
        maaltijdchequeWerknemersbijdrage +
        woonwerkNettoVrijgesteld +
        -hospitalisatieEigenBijdrageBedrag +
        onkostenvergoedingBedrag -
        round2(Math.max(vaaBedrijfswagenPerMaand, 0)) -
        vaaRszPlichtig);
    return {
        brutoloon,
        brutoRszBasis,
        rsz: rszR,
        werkbonus: werkbonusR,
        fiscaleWerkbonus,
        effectieveRsz,
        belastbaarMaandloon,
        belastbaarMaandloonVoorBV,
        woonwerkVergoedingPerMaand: woonwerkVergoeding,
        woonwerkNettoVrijgesteldPerMaand: woonwerkNettoVrijgesteld,
        woonwerkVrijgesteldPerMaand: round2(Math.max(woonwerkVrijgesteldPerMaand, 0)),
        bvVrijstellingWoonWerkPerMaand: bvVrijstellingWoonWerk,
        vaaRszPlichtigPerMaand: vaaRszPlichtig,
        vaaBedrijfswagenPerMaand: round2(Math.max(vaaBedrijfswagenPerMaand, 0)),
        bbsz: bbszR,
        bv: bvR,
        maaltijdchequeWerknemersbijdragePerDag: maaltijdchequeBijdragePerDag,
        maaltijdchequeWerkdagen: maaltijdchequeDagen,
        maaltijdchequeWerknemersbijdrage,
        hospitalisatieEigenBijdrage: hospitalisatieEigenBijdrageBedrag,
        onkostenvergoedingPerMaand: onkostenvergoedingBedrag,
        nettoloon,
    };
}
