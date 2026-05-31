import type { Datapunt } from "@/types/dataset";
import { allDatapunten } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import { BaremaBuitenSchaalError, DatapuntOnbekend } from "@/lib/errors";
import { round2 } from "@/lib/money";
export type Schaal = "I" | "II";
export type BaremaCat = "A" | "B" | "C" | "D";
export type StudentenCat = "A" | "B" | "C" | "D";
const DEFAULT_REF_DATUM = "2026-06-01";
export interface BaremaLookupResult {
    datapunt: Datapunt;
    effectieveErvaring: number;
    geclampt: boolean;
    maandloonEUR: number;
}
export function lookupBarema(schaal: Schaal, categorie: BaremaCat, ervaringJaren: number, refDatum: string = DEFAULT_REF_DATUM): BaremaLookupResult {
    const dp = selectBaremaDatapunt({
        idPattern: new RegExp(`^lonen_pc200_schaal${schaal}_cat${categorie}_\\d{8}$`),
        refDatum,
        omschrijving: `Schaal ${schaal} Cat ${categorie}`,
    });
    const targetId = dp.id;
    const tabel = dp.tabel_per_ervaring;
    if (!tabel || tabel.length === 0) {
        throw new BaremaBuitenSchaalError(`Datapunt ${targetId} heeft geen tabel_per_ervaring`, targetId);
    }
    const max = tabel.reduce((m, r) => (r.ervaring_jaren > m ? r.ervaring_jaren : m), -Infinity);
    const min = tabel.reduce((m, r) => (r.ervaring_jaren < m ? r.ervaring_jaren : m), Infinity);
    let eff = ervaringJaren;
    let clamped = false;
    if (eff > max) {
        eff = max;
        clamped = true;
    }
    if (eff < min) {
        throw new BaremaBuitenSchaalError(`Ervaring ${ervaringJaren} valt onder de ondergrens (${min}) van Schaal ${schaal} Cat ${categorie}`, targetId);
    }
    const rij = tabel.find((r) => r.ervaring_jaren === eff);
    if (!rij) {
        throw new BaremaBuitenSchaalError(`Ervaring ${eff} niet gevonden in tabel van ${targetId}`, targetId);
    }
    return {
        datapunt: dp,
        effectieveErvaring: eff,
        geclampt: clamped,
        maandloonEUR: rij.maandloon_eur,
    };
}
export interface StudentenLookupResult {
    datapunt: Datapunt;
    maandloonEUR: number;
}
export function lookupStudentenbarema(categorie: StudentenCat, leeftijdJaren: number, refDatum: string = DEFAULT_REF_DATUM): StudentenLookupResult {
    const dp = selectBaremaDatapunt({
        idPattern: new RegExp(`^lonen_pc200_studenten_cat${categorie}_\\d{8}$`),
        refDatum,
        omschrijving: `Studentenbarema Cat ${categorie}`,
    });
    const targetId = dp.id;
    const tabel = dp.tabel_per_leeftijd;
    if (!tabel || tabel.length === 0) {
        throw new BaremaBuitenSchaalError(`Datapunt ${targetId} heeft geen tabel_per_leeftijd`, targetId);
    }
    const rij = tabel.find((r) => r.leeftijd_jaren === leeftijdJaren);
    if (!rij) {
        const beschikbareLeeftijden = tabel.map((r) => r.leeftijd_jaren).join(", ");
        throw new BaremaBuitenSchaalError(`Leeftijd ${leeftijdJaren} niet voorzien voor studentenbarema Cat ${categorie}. Beschikbaar: ${beschikbareLeeftijden}.`, targetId);
    }
    return {
        datapunt: dp,
        maandloonEUR: rij.maandloon_eur,
    };
}
export interface BrutolocheckResult {
    ok: boolean;
    sectoraalMinimum: number;
    effectieveErvaring: number;
    opgegevenBruto: number;
    tewerkstellingsbreuk: number;
    voltijdsEquivalentBruto: number;
    proRataMinimum: number;
    vergelijkingsbasis: "voltijds" | "deeltijds_omgerekend";
    verschil: number;
    datapuntId: string;
    datapunt: Datapunt;
    geclampt: boolean;
}
export function brutolocheck(schaal: Schaal, categorie: BaremaCat, ervaringJaren: number, opgegevenBruto: number, refDatum: string = DEFAULT_REF_DATUM, tewerkstellingsbreuk: number = 1): BrutolocheckResult {
    const r = lookupBarema(schaal, categorie, ervaringJaren, refDatum);
    const minimum = r.maandloonEUR;
    const effectieveBreuk = normaliseerTewerkstellingsbreuk(tewerkstellingsbreuk);
    const voltijdsEquivalentBruto = round2(opgegevenBruto / effectieveBreuk);
    const proRataMinimum = round2(minimum * effectieveBreuk);
    return {
        ok: voltijdsEquivalentBruto >= minimum,
        sectoraalMinimum: minimum,
        effectieveErvaring: r.effectieveErvaring,
        opgegevenBruto,
        tewerkstellingsbreuk: effectieveBreuk,
        voltijdsEquivalentBruto,
        proRataMinimum,
        vergelijkingsbasis: effectieveBreuk === 1 ? "voltijds" : "deeltijds_omgerekend",
        verschil: round2(voltijdsEquivalentBruto - minimum),
        datapuntId: r.datapunt.id,
        datapunt: r.datapunt,
        geclampt: r.geclampt,
    };
}
function normaliseerTewerkstellingsbreuk(tewerkstellingsbreuk: number): number {
    if (!Number.isFinite(tewerkstellingsbreuk) || tewerkstellingsbreuk <= 0)
        return 1;
    return tewerkstellingsbreuk;
}
function selectBaremaDatapunt({ idPattern, refDatum, omschrijving, }: {
    idPattern: RegExp;
    refDatum: string;
    omschrijving: string;
}): Datapunt {
    const candidates = allDatapunten()
        .filter((dp) => dp.categorie === "lonen" && dp.type === "barema" && idPattern.test(dp.id))
        .sort((a, b) => datumVoorSort(b.geldig_vanaf).localeCompare(datumVoorSort(a.geldig_vanaf)));
    if (candidates.length === 0) {
        throw new DatapuntOnbekend(`${omschrijving} (${idPattern.source})`);
    }
    let firstError: unknown = null;
    for (const candidate of candidates) {
        try {
            return safeGetValue(candidate.id, { refDatum }).datapunt;
        }
        catch (error) {
            firstError ??= error;
        }
    }
    throw firstError;
}
function datumVoorSort(datum: string | null | undefined): string {
    return datum ?? "0000-00-00";
}
