import type { Datapunt } from "@/types/dataset";
import { getDatapunt } from "@/lib/dataset";
import { BaremaBuitenSchaalError, DatapuntOnbekend } from "@/lib/errors";

export type Schaal = "I" | "II";
export type BaremaCat = "A" | "B" | "C" | "D";
export type StudentenCat = "A" | "B" | "C" | "D";

export interface BaremaLookupResult {
  datapunt: Datapunt;
  effectieveErvaring: number;
  geclampt: boolean;
  maandloonEUR: number;
}

export function lookupBarema(
  schaal: Schaal,
  categorie: BaremaCat,
  ervaringJaren: number,
): BaremaLookupResult {
  const targetId = `lonen_pc200_schaal${schaal}_cat${categorie}_01012026`;
  const dp = getDatapunt(targetId);
  if (!dp) throw new DatapuntOnbekend(targetId);
  const tabel = dp.tabel_per_ervaring;
  if (!tabel || tabel.length === 0) {
    throw new BaremaBuitenSchaalError(
      `Datapunt ${targetId} heeft geen tabel_per_ervaring`,
      targetId,
    );
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
    throw new BaremaBuitenSchaalError(
      `Ervaring ${ervaringJaren} valt onder de ondergrens (${min}) van Schaal ${schaal} Cat ${categorie}`,
      targetId,
    );
  }
  const rij = tabel.find((r) => r.ervaring_jaren === eff);
  if (!rij) {
    throw new BaremaBuitenSchaalError(
      `Ervaring ${eff} niet gevonden in tabel van ${targetId}`,
      targetId,
    );
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

export function lookupStudentenbarema(
  categorie: StudentenCat,
  leeftijdJaren: number,
): StudentenLookupResult {
  const targetId = `lonen_pc200_studenten_cat${categorie}_01012026`;
  const dp = getDatapunt(targetId);
  if (!dp) throw new DatapuntOnbekend(targetId);
  const tabel = dp.tabel_per_leeftijd;
  if (!tabel || tabel.length === 0) {
    throw new BaremaBuitenSchaalError(
      `Datapunt ${targetId} heeft geen tabel_per_leeftijd`,
      targetId,
    );
  }
  const rij = tabel.find((r) => r.leeftijd_jaren === leeftijdJaren);
  if (!rij) {
    const beschikbareLeeftijden = tabel.map((r) => r.leeftijd_jaren).join(", ");
    throw new BaremaBuitenSchaalError(
      `Leeftijd ${leeftijdJaren} niet voorzien voor studentenbarema Cat ${categorie}. Beschikbaar: ${beschikbareLeeftijden}.`,
      targetId,
    );
  }
  return {
    datapunt: dp,
    maandloonEUR: rij.maandloon_eur,
  };
}

export interface BrutolocheckResult {
  ok: boolean;
  sectoraalMinimum: number;
  opgegevenBruto: number;
  verschil: number;
  datapuntId: string;
  geclampt: boolean;
}

export function brutolocheck(
  schaal: Schaal,
  categorie: BaremaCat,
  ervaringJaren: number,
  opgegevenBruto: number,
): BrutolocheckResult {
  const r = lookupBarema(schaal, categorie, ervaringJaren);
  const minimum = r.maandloonEUR;
  return {
    ok: opgegevenBruto >= minimum,
    sectoraalMinimum: minimum,
    opgegevenBruto,
    verschil: Math.round((opgegevenBruto - minimum) * 100) / 100,
    datapuntId: r.datapunt.id,
    geclampt: r.geclampt,
  };
}
