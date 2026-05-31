import datasetJson from "@/data/pc200_payroll_dataset_2026.json";
import type { Dataset, Datapunt, Categorie, } from "@/types/dataset";
export const DATAPUNT_CATEGORIEEN: Categorie[] = [
    "lonen",
    "rsz",
    "fiscaliteit",
    "premies_en_voordelen",
    "arbeidsvoorwaarden",
];
export const dataset = datasetJson as unknown as Dataset;
let cachedIndex: Record<string, Datapunt> | null = null;
export function indexById(ds: Dataset = dataset): Record<string, Datapunt> {
    if (cachedIndex && ds === dataset)
        return cachedIndex;
    const idx: Record<string, Datapunt> = {};
    for (const cat of DATAPUNT_CATEGORIEEN) {
        for (const dp of ds[cat]) {
            idx[dp.id] = dp;
        }
    }
    if (ds === dataset)
        cachedIndex = idx;
    return idx;
}
export function getDatapunt(datapuntId: string, ds: Dataset = dataset): Datapunt | null {
    return indexById(ds)[datapuntId] ?? null;
}
export function allDatapunten(ds: Dataset = dataset): Datapunt[] {
    const out: Datapunt[] = [];
    for (const cat of DATAPUNT_CATEGORIEEN)
        out.push(...ds[cat]);
    return out;
}
