import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
export interface VaaForfaitsWerkmiddelenInput {
    pcLaptopActief?: boolean;
    gsmSmartphoneActief?: boolean;
    internetActief?: boolean;
    gsmAbonnementActief?: boolean;
    refDatum: string;
}
export interface VaaForfaitsWerkmiddelenResultaat {
    pcLaptopPerMaand: number;
    gsmSmartphonePerMaand: number;
    internetPerMaand: number;
    gsmAbonnementPerMaand: number;
    totaalPerMaand: number;
    lijnen: Array<{
        label: string;
        bedrag: number;
        datapunt: Datapunt;
    }>;
    datapunten: Datapunt[];
}
export function vaaForfaitsWerkmiddelen(input: VaaForfaitsWerkmiddelenInput): VaaForfaitsWerkmiddelenResultaat {
    const pc = forfait("vaa_pc_laptop_forfait_2026", input.refDatum);
    const gsm = forfait("vaa_gsm_smartphone_forfait_2026", input.refDatum);
    const internet = forfait("vaa_internet_forfait_2026", input.refDatum);
    const telefoon = forfait("vaa_gsmabonnement_forfait_2026", input.refDatum);
    const pcLaptopPerMaand = maandbedrag(pc.waarde, input.pcLaptopActief ? 1 : 0);
    const gsmSmartphonePerMaand = maandbedrag(gsm.waarde, input.gsmSmartphoneActief ? 1 : 0);
    const internetPerMaand = maandbedrag(internet.waarde, input.internetActief ? 1 : 0);
    const gsmAbonnementPerMaand = maandbedrag(telefoon.waarde, input.gsmAbonnementActief ? 1 : 0);
    const lijnen = [
        { label: "Laptop / pc", bedrag: pcLaptopPerMaand, datapunt: pc.datapunt },
        { label: "GSM", bedrag: gsmSmartphonePerMaand, datapunt: gsm.datapunt },
        { label: "Internet", bedrag: internetPerMaand, datapunt: internet.datapunt },
        { label: "GSM-abonnement", bedrag: gsmAbonnementPerMaand, datapunt: telefoon.datapunt },
    ].filter((lijn) => lijn.bedrag > 0);
    return {
        pcLaptopPerMaand,
        gsmSmartphonePerMaand,
        internetPerMaand,
        gsmAbonnementPerMaand,
        totaalPerMaand: round2(pcLaptopPerMaand +
            gsmSmartphonePerMaand +
            internetPerMaand +
            gsmAbonnementPerMaand),
        lijnen,
        datapunten: [pc.datapunt, gsm.datapunt, internet.datapunt, telefoon.datapunt],
    };
}
function forfait(datapuntId: string, refDatum: string): {
    waarde: number;
    datapunt: Datapunt;
} {
    const r = safeGetValue(datapuntId, { refDatum });
    return { waarde: Number(r.waarde), datapunt: r.datapunt };
}
function maandbedrag(jaarbedrag: number, aantal: number): number {
    return round2((jaarbedrag / 12) * Math.max(0, Math.floor(aantal)));
}
