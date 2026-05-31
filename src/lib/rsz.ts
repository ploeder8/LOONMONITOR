import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
export interface RszInput {
    brutoloon: number;
    refDatum: string;
    bouwVlag?: boolean;
}
export interface RszResultaat {
    brutoloon: number;
    werknemerBijdrage: number;
    werkgeverBasisbijdrage: number;
    bouwAanvullendPensioen: number | null;
    totaalWerkgever: number;
    bronnen: Array<{
        label: string;
        datapunt: Datapunt;
        bedrag: number;
    }>;
    waarschuwingen: string[];
}
export function rszBijdragen(input: RszInput): RszResultaat {
    const { brutoloon, refDatum } = input;
    const werknemer = safeGetValue("rsz_werknemer_basis", { refDatum });
    const werkgever = safeGetValue("rsz_werkgever_profit_basis", { refDatum });
    const wn = brutoloon * (werknemer.waarde ?? 0);
    const wg = brutoloon * (werkgever.waarde ?? 0);
    const wnR = round2(wn);
    const wgR = round2(wg);
    const totWg = wgR;
    const bronnen: RszResultaat["bronnen"] = [
        { label: "RSZ werknemer", datapunt: werknemer.datapunt, bedrag: wnR },
        { label: "RSZ werkgever (basis profit)", datapunt: werkgever.datapunt, bedrag: wgR },
    ];
    const waarschuwingen = [werknemer, werkgever]
        .map((r) => r.waarschuwing)
        .filter((w): w is string => Boolean(w));
    return {
        brutoloon,
        werknemerBijdrage: wnR,
        werkgeverBasisbijdrage: wgR,
        bouwAanvullendPensioen: null,
        totaalWerkgever: totWg,
        bronnen,
        waarschuwingen,
    };
}
