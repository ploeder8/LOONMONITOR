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
let cachedAll: Datapunt[] | null = null;
let cachedBaremasByKey: Record<string, Datapunt[]> | null = null;
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
    if (cachedAll && ds === dataset)
        return cachedAll;
    const out: Datapunt[] = [];
    for (const cat of DATAPUNT_CATEGORIEEN)
        out.push(...ds[cat]);
    if (ds === dataset)
        cachedAll = out;
    return out;
}
const BAREMA_KEY_PATTERN = /^lonen_pc200_(schaal[IV]+|studenten)_cat([A-D])_\d{8}$/;
function baremaKeyFromId(id: string): string | null {
    const match = BAREMA_KEY_PATTERN.exec(id);
    if (!match)
        return null;
    return `${match[1]}_cat${match[2]}`;
}
export function baremasByKey(ds: Dataset = dataset): Record<string, Datapunt[]> {
    if (cachedBaremasByKey && ds === dataset)
        return cachedBaremasByKey;
    const idx: Record<string, Datapunt[]> = {};
    for (const dp of ds.lonen) {
        if (dp.type !== "barema")
            continue;
        const key = baremaKeyFromId(dp.id);
        if (!key)
            continue;
        (idx[key] ??= []).push(dp);
    }
    for (const key of Object.keys(idx)) {
        idx[key].sort((a, b) => datumVoorSort(b.geldig_vanaf).localeCompare(datumVoorSort(a.geldig_vanaf)));
    }
    if (ds === dataset)
        cachedBaremasByKey = idx;
    return idx;
}
function datumVoorSort(datum: string | null | undefined): string {
    return datum ?? "0000-00-00";
}
