import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";
import type { OnkostenCategorieKey, OnkostenCategorie } from "@/lib/profiel";

export interface OnkostenvergoedingInput {
    categorieen: Record<OnkostenCategorieKey, OnkostenCategorie>;
    arbeidsdagenPerMaand: number;
    refDatum: string;
}

export interface OnkostenvergoedingLijn {
    key: OnkostenCategorieKey;
    label: string;
    maandBedrag: number;
    forfaitBedrag: number;
    overrideBedrag: number | null;
    aantalDagen: number;
    aantalKm: number;
    frequentie: "per_maand" | "per_dag" | "per_km";
    datapunt: Datapunt;
    waarschuwing?: string;
}

export interface OnkostenvergoedingResultaat {
    totaal: number;
    lijnen: OnkostenvergoedingLijn[];
    waarschuwingen: string[];
}

const CATEGORIE_LABELS: Record<OnkostenCategorieKey, string> = {
    parking: "Parkingvergoeding",
    carwash: "Carwashvergoeding",
    garage: "Garagevergoeding",
    maaltijd: "Maaltijdvergoeding",
    baan: "Baanvergoeding",
    internet: "Internetvergoeding",
    thuiswerk: "Thuiswerkvergoeding",
    kilometer: "Kilometervergoeding",
};

const CATEGORIE_DATAPUNT_IDS: Record<OnkostenCategorieKey, string> = {
    parking: "rsz_parking_vergoeding_2026",
    carwash: "rsz_carwash_vergoeding_2026",
    garage: "rsz_garage_vergoeding_2026",
    maaltijd: "rsz_maaltijd_vergoeding_2026",
    baan: "rsz_baan_vergoeding_2026",
    internet: "rsz_internet_vergoeding_2026",
    thuiswerk: "rsz_thuiswerk_vergoeding_2026",
    kilometer: "rsz_kilometervergoeding_2026",
};

export function getOnkostenDatapuntId(key: OnkostenCategorieKey, refDatum: string): string {
    if (key === "kilometer") {
        const datum = refDatum.slice(0, 10);
        if (datum >= "2026-04-01" && datum <= "2026-04-30") {
            return "rsz_kilometervergoeding_2026_april";
        }
        return "rsz_kilometervergoeding_2026_mei_juni_voorlopig";
    }
    return CATEGORIE_DATAPUNT_IDS[key];
}

export function berekenOnkostenvergoeding(input: OnkostenvergoedingInput): OnkostenvergoedingResultaat {
    const { categorieen, arbeidsdagenPerMaand, refDatum } = input;
    const lijnen: OnkostenvergoedingLijn[] = [];
    const waarschuwingen: string[] = [];

    for (const key of Object.keys(categorieen) as OnkostenCategorieKey[]) {
        const cat = categorieen[key];
        if (!cat.actief)
            continue;

        const datapuntId = getOnkostenDatapuntId(key, refDatum);
        const lookup = safeGetValue(datapuntId, { refDatum, toelatenMogelijkVerouderd: true });
        if (!lookup.datapunt) {
            waarschuwingen.push(`Onbekend datapunt voor ${CATEGORIE_LABELS[key]} (${datapuntId}).`);
            continue;
        }
        if (lookup.waarschuwing) {
            waarschuwingen.push(lookup.waarschuwing);
        }

        const datasetWaarde = lookup.waarde ?? 0;
        const forfaitBedrag = datasetWaarde > 0 ? datasetWaarde : cat.forfaitBedrag;
        const toegepastBedrag = cat.overrideBedrag ?? forfaitBedrag;
        const frequentie = (lookup.datapunt.frequentie as "per_maand" | "per_dag" | "per_km") ?? "per_maand";

        let maandBedrag = 0;
        if (frequentie === "per_maand") {
            maandBedrag = toegepastBedrag;
        }
        else if (frequentie === "per_dag") {
            maandBedrag = toegepastBedrag * Math.max(cat.aantalDagen, 0);
        }
        else if (frequentie === "per_km") {
            maandBedrag = toegepastBedrag * Math.max(cat.aantalKm, 0);
        }

        maandBedrag = round2(Math.max(maandBedrag, 0));

        lijnen.push({
            key,
            label: CATEGORIE_LABELS[key],
            maandBedrag,
            forfaitBedrag,
            overrideBedrag: cat.overrideBedrag,
            aantalDagen: cat.aantalDagen,
            aantalKm: cat.aantalKm,
            frequentie,
            datapunt: lookup.datapunt,
            waarschuwing: lookup.waarschuwing ?? undefined,
        });
    }

    const totaal = round2(lijnen.reduce((sum, lijn) => sum + lijn.maandBedrag, 0));
    return { totaal, lijnen, waarschuwingen };
}
