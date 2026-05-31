import { round2 } from "@/lib/money";
import { rszBijdragen, type RszResultaat } from "@/lib/rsz";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
export interface WerkgeverskostInput {
    brutoloon: number;
    refDatum: string;
    bouwVlag?: boolean;
    arbeidsongevallenPct?: number;
    premieEjpPct?: number;
    vaaPerMaand?: number;
    extraGroepsverzekering?: number;
    extraMaaltijdcheques?: number;
    maaltijdchequeWerkgeversaandeelPerDag?: number;
    maaltijdchequeWerkdagen?: number;
    extraHospitalisatie?: number;
    extraEcocheques?: number;
    vaaRszPlichtigPerMaand?: number;
    woonwerkVergoedingPerMaand?: number;
    onkostenvergoedingPerMaand?: number;
}
export interface WerkgeverskostResultaat {
    brutoloon: number;
    rszWerkgever: number;
    bouwAanvullendPensioen: number | null;
    arbeidsongevallen: number;
    provisieEindejaarspremie: number;
    provisieVakantiegeld: number;
    extraVoordelen: number;
    woonwerkVergoedingPerMaand: number;
    totaleLoonkostSmal: number;
    totaleLoonkostBreed: number;
    loonwigPct?: number;
    datapunten: Datapunt[];
}
const DEFAULT_AO_PCT = 0.003;
const DEFAULT_EJP_PCT = 0.0833;
export const MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026 = 8.91;
const MAALTIJDCHEQUE_MAX_WG_PER_DAG_PRE_2026 = 6.91;
export function werkgeverskost(input: WerkgeverskostInput): WerkgeverskostResultaat {
    const { brutoloon, refDatum, bouwVlag = false, arbeidsongevallenPct = DEFAULT_AO_PCT, premieEjpPct = DEFAULT_EJP_PCT, vaaPerMaand: _vaaPerMaand = 0, extraGroepsverzekering = 0, extraMaaltijdcheques = 0, maaltijdchequeWerkgeversaandeelPerDag, maaltijdchequeWerkdagen = 0, extraHospitalisatie = 0, extraEcocheques = 0, vaaRszPlichtigPerMaand = 0, woonwerkVergoedingPerMaand = 0, onkostenvergoedingPerMaand = 0, } = input;
    const rszBasis = round2(brutoloon + Math.max(vaaRszPlichtigPerMaand, 0));
    const rszR: RszResultaat = rszBijdragen({ brutoloon: rszBasis, refDatum, bouwVlag });
    const vgPctRes = safeGetValue("vakantiegeld_dubbel_pct_2026", { refDatum });
    const vgPct = vgPctRes.waarde ?? 0.92;
    const ao = round2(brutoloon * arbeidsongevallenPct);
    const provEjp = round2(brutoloon * premieEjpPct);
    const provVg = round2(brutoloon * vgPct / 12);
    const maaltijdcheques = maaltijdchequeWerkgeversaandeelPerDag === undefined
        ? extraMaaltijdcheques
        : round2(Math.min(Math.max(maaltijdchequeWerkgeversaandeelPerDag, 0), maxMaaltijdchequeWerkgeversaandeel(refDatum)) * Math.max(maaltijdchequeWerkdagen, 0));
    const extraVoordelen = round2(extraGroepsverzekering +
        maaltijdcheques +
        extraHospitalisatie +
        extraEcocheques +
        Math.max(woonwerkVergoedingPerMaand, 0) +
        Math.max(onkostenvergoedingPerMaand, 0));
    const smal = round2(brutoloon + rszR.totaalWerkgever + ao);
    const breed = round2(smal + provEjp + provVg + extraVoordelen);
    const datapunten: Datapunt[] = [];
    for (const b of rszR.bronnen)
        datapunten.push(b.datapunt);
    const dpAo = getDatapunt("arbeidsongevallen_bedienden_2026");
    const dpEjpProv = getDatapunt("provisie_eindejaarspremie_2026");
    if (dpAo)
        datapunten.push(dpAo);
    if (dpEjpProv)
        datapunten.push(dpEjpProv);
    datapunten.push(vgPctRes.datapunt);
    return {
        brutoloon,
        rszWerkgever: rszR.werkgeverBasisbijdrage,
        bouwAanvullendPensioen: rszR.bouwAanvullendPensioen,
        arbeidsongevallen: ao,
        provisieEindejaarspremie: provEjp,
        provisieVakantiegeld: provVg,
        extraVoordelen,
        woonwerkVergoedingPerMaand: round2(Math.max(woonwerkVergoedingPerMaand, 0)),
        totaleLoonkostSmal: smal,
        totaleLoonkostBreed: breed,
        datapunten,
    };
}
export function loonwig(totaleLoonkost: number, netto: number): number {
    if (totaleLoonkost <= 0)
        return 0;
    return round2(((totaleLoonkost - netto) / totaleLoonkost) * 100) / 100;
}
function maxMaaltijdchequeWerkgeversaandeel(refDatum: string): number {
    return refDatum >= "2026-01-01"
        ? MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026
        : MAALTIJDCHEQUE_MAX_WG_PER_DAG_PRE_2026;
}
