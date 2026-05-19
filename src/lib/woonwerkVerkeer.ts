// Woon-werk verkeer PC 200 — sectorale tussenkomsten 2026.
// SSOT: knowledgebase/02_regelkader_2026.md §11 + sfonds200 vervoerskosten.

import { safeGetFietsvergoeding } from "@/lib/fietsvergoeding";
import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";

type WoonwerkComponentKey = "fiets" | "trein" | "busTramMetro" | "privewagen";

export interface WoonwerkComponentInput {
  actief: boolean;
  kmEnkel?: number;
  kmPerDag?: number;
  prijsPerMaand?: number;
}

export interface WoonwerkVerkeerInput {
  refDatum: string;
  brutoloon: number;
  arbeidsdagenPerMaand: number;
  werkdagenInMaand: number;
  fiets: WoonwerkComponentInput;
  trein: WoonwerkComponentInput;
  busTramMetro: WoonwerkComponentInput;
  privewagen: WoonwerkComponentInput;
}

export interface WoonwerkComponentResultaat {
  label: string;
  vergoeding: number;
  basisMaandbedrag: number;
  km: number;
  datapunt: Datapunt;
  toelichting: string;
}

export interface WoonwerkVerkeerResultaat {
  totaalVergoeding: number;
  componenten: Partial<Record<WoonwerkComponentKey, WoonwerkComponentResultaat>>;
  datapunten: Datapunt[];
  waarschuwingen: string[];
}

interface KmRij {
  min: number;
  max: number;
  maand: number;
}

const GEMIDDELDE_WERKDAGEN_PER_MAAND = 21.67;

const TREIN_TABEL_2026: KmRij[] = [
  r(1, 1, 39), r(2, 2, 43.5), r(3, 3, 47.5), r(4, 4, 52), r(5, 5, 56),
  r(6, 6, 60), r(7, 7, 63), r(8, 8, 67), r(9, 9, 70), r(10, 10, 74),
  r(11, 11, 78), r(12, 12, 81), r(13, 13, 85), r(14, 14, 88), r(15, 15, 92),
  r(16, 16, 95), r(17, 17, 99), r(18, 18, 103), r(19, 19, 106), r(20, 20, 110),
  r(21, 21, 113), r(22, 22, 117), r(23, 23, 120), r(24, 24, 124), r(25, 25, 128),
  r(26, 26, 131), r(27, 27, 135), r(28, 28, 138), r(29, 29, 142), r(30, 30, 146),
  r(31, 33, 151), r(34, 36, 160), r(37, 39, 169), r(40, 42, 178), r(43, 45, 187),
  r(46, 48, 195), r(49, 51, 204), r(52, 54, 210), r(55, 57, 217), r(58, 60, 223),
  r(61, 65, 231), r(66, 70, 242), r(71, 75, 252), r(76, 80, 263), r(81, 85, 273),
  r(86, 90, 283), r(91, 95, 294), r(96, 100, 304), r(101, 105, 315), r(106, 110, 325),
  r(111, 115, 336), r(116, 120, 346), r(121, 125, 356), r(126, 130, 367),
  r(131, 135, 377), r(136, 140, 388), r(141, 145, 398), r(146, 150, 409),
];

const BUS_TRAM_METRO_TABEL_2026: KmRij[] = [
  r(1, 3, 34), r(4, 4, 37), r(5, 5, 40), r(6, 6, 42), r(7, 7, 45),
  r(8, 8, 47), r(9, 9, 49), r(10, 10, 52), r(11, 11, 54), r(12, 12, 57),
  r(13, 13, 59), r(14, 14, 62), r(15, 15, 64), r(16, 16, 67), r(17, 17, 69),
  r(18, 18, 72), r(19, 19, 74), r(20, 20, 78), r(21, 21, 81), r(22, 22, 83),
  r(23, 23, 86), r(24, 24, 88), r(25, 25, 91), r(26, 26, 93), r(27, 27, 95),
  r(28, 28, 98), r(29, 29, 100), r(30, 30, 103), r(31, 33, 107), r(34, 36, 112),
  r(37, 39, 119), r(40, 42, 125), r(43, 45, 131), r(46, 48, 139), r(49, 51, 145),
  r(52, 54, 149), r(55, 57, 153), r(58, 60, 157), r(61, 65, 163), r(66, 70, 170),
  r(71, 75, 177), r(76, 80, 186), r(81, 85, 193), r(86, 90, 200), r(91, 95, 208),
  r(96, 100, 215), r(101, 105, 221), r(106, 110, 228), r(111, 115, 237),
  r(116, 200, 245),
];

export function berekenWoonwerkVerkeer(input: WoonwerkVerkeerInput): WoonwerkVerkeerResultaat {
  const componenten: WoonwerkVerkeerResultaat["componenten"] = {};
  const waarschuwingen: string[] = [];

  const priveMagMeetellen = input.privewagen.actief && !input.fiets.actief;

  if (input.privewagen.actief && !priveMagMeetellen) {
    waarschuwingen.push("Privéwagenvergoeding is niet combineerbaar met fiets en telt niet mee.");
  }

  if (input.fiets.actief) {
    componenten.fiets = berekenFiets(input);
  }
  if (input.trein.actief) {
    componenten.trein = berekenTabelComponent(
      "Trein",
      "pc200_woonwerk_trein_tabel_2026",
      input.trein.kmEnkel ?? 0,
      TREIN_TABEL_2026,
      input,
    );
  }
  if (input.busTramMetro.actief) {
    componenten.busTramMetro = berekenBusTramMetro(input);
  }
  if (priveMagMeetellen) {
    componenten.privewagen = berekenPrivewagen(input, waarschuwingen);
  } else if (input.privewagen.actief) {
    const dp = datapunt("pc200_woonwerk_privevervoer_tabel_2026", input.refDatum);
    componenten.privewagen = {
      label: "Privéwagen",
      vergoeding: 0,
      basisMaandbedrag: 0,
      km: Math.max(input.privewagen.kmEnkel ?? 0, 0),
      datapunt: dp,
      toelichting: "Niet combineerbaar met fietsvergoeding.",
    };
  }

  const extraDatapunten = input.privewagen.actief
    ? [safeGetValue("pc200_woonwerk_loonplafond_prive_2026", { refDatum: input.refDatum }).datapunt]
    : [];
  const alleDatapunten = uniqueDatapunten([
    ...Object.values(componenten).map((c) => c.datapunt),
    ...extraDatapunten,
  ]);
  return {
    totaalVergoeding: round2(Object.values(componenten).reduce((som, c) => som + c.vergoeding, 0)),
    componenten,
    datapunten: alleDatapunten,
    waarschuwingen,
  };
}

function berekenFiets(input: WoonwerkVerkeerInput): WoonwerkComponentResultaat {
  const rsz = safeGetFietsvergoeding(input.refDatum);
  const kmPerDag = Math.max(input.fiets.kmPerDag ?? 0, 0);
  const dagmaximum = rsz.datapunt.maximum_dagbedrag_genormaliseerd ?? Number.POSITIVE_INFINITY;
  const dagbedrag = Math.min(kmPerDag * (rsz.waarde ?? 0), dagmaximum);
  const vergoeding = round2(dagbedrag * Math.max(input.arbeidsdagenPerMaand, 0));
  return {
    label: "Fiets",
    vergoeding,
    basisMaandbedrag: vergoeding,
    km: kmPerDag,
    datapunt: rsz.datapunt,
    toelichting: `€ ${round2(rsz.waarde ?? 0).toFixed(2)} / km, begrensd op € ${dagmaximum.toFixed(2)} per dag.`,
  };
}

function berekenBusTramMetro(input: WoonwerkVerkeerInput): WoonwerkComponentResultaat {
  const dp = datapunt("pc200_woonwerk_bus_tram_metro_tabel_2026", input.refDatum);
  const km = Math.max(input.busTramMetro.kmEnkel ?? 0, 0);
  const tabelbedrag = lookupMaandbedrag(BUS_TRAM_METRO_TABEL_2026, km);
  const prijsPlafond = round2(Math.max(input.busTramMetro.prijsPerMaand ?? 0, 0) * 0.75);
  const basis = Math.min(tabelbedrag, prijsPlafond);
  return {
    label: "Bus/tram/metro",
    vergoeding: proRata(basis, input),
    basisMaandbedrag: tabelbedrag,
    km,
    datapunt: dp,
    toelichting: `Forfait ${formatTabelbedrag(tabelbedrag)} begrensd op 75% van de betaalde prijs.`,
  };
}

function berekenPrivewagen(
  input: WoonwerkVerkeerInput,
  waarschuwingen: string[],
): WoonwerkComponentResultaat {
  const loonplafond = safeGetValue("pc200_woonwerk_loonplafond_prive_2026", {
    refDatum: input.refDatum,
  });
  const dp = datapunt("pc200_woonwerk_privevervoer_tabel_2026", input.refDatum);
  const km = Math.max(input.privewagen.kmEnkel ?? 0, 0);
  if (input.brutoloon * 12 > (loonplafond.waarde ?? 0)) {
    waarschuwingen.push("Privéwagenvergoeding niet toegepast: brutoloon ligt boven het PC200-loonplafond.");
    return {
      label: "Privéwagen",
      vergoeding: 0,
      basisMaandbedrag: 0,
      km,
      datapunt: dp,
      toelichting: "Geen recht boven het PC200-loonplafond.",
    };
  }
  if (km < 3) {
    waarschuwingen.push("Privéwagenvergoeding niet toegepast: minimale afstand is 3 km.");
    return {
      label: "Privéwagen",
      vergoeding: 0,
      basisMaandbedrag: 0,
      km,
      datapunt: dp,
      toelichting: "Geen recht onder 3 km.",
    };
  }
  const basis = round2(lookupMaandbedrag(TREIN_TABEL_2026, km) / 2);
  return {
    label: "Privéwagen",
    vergoeding: proRataGemiddeldeWerkdagen(basis, input),
    basisMaandbedrag: basis,
    km,
    datapunt: dp,
    toelichting: "50% van de maandtreinkaart 2e klasse, pro rata via 21,67 werkdagen.",
  };
}

function berekenTabelComponent(
  label: string,
  datapuntId: string,
  kmInput: number,
  tabel: KmRij[],
  input: WoonwerkVerkeerInput,
): WoonwerkComponentResultaat {
  const km = Math.max(kmInput, 0);
  const basis = lookupMaandbedrag(tabel, km);
  return {
    label,
    vergoeding: proRata(basis, input),
    basisMaandbedrag: basis,
    km,
    datapunt: datapunt(datapuntId, input.refDatum),
    toelichting: "Maandtabelbedrag pro rata op effectieve pendeldagen.",
  };
}

function lookupMaandbedrag(tabel: KmRij[], km: number): number {
  const afgerond = Math.ceil(Math.max(km, 0));
  const rij = tabel.find((item) => afgerond >= item.min && afgerond <= item.max);
  return rij?.maand ?? 0;
}

function proRata(maandbedrag: number, input: WoonwerkVerkeerInput): number {
  if (input.werkdagenInMaand <= 0) return 0;
  return round2(maandbedrag * Math.max(input.arbeidsdagenPerMaand, 0) / input.werkdagenInMaand);
}

function proRataGemiddeldeWerkdagen(maandbedrag: number, input: WoonwerkVerkeerInput): number {
  return round2(maandbedrag * Math.max(input.arbeidsdagenPerMaand, 0) / GEMIDDELDE_WERKDAGEN_PER_MAAND);
}

function datapunt(id: string, refDatum: string): Datapunt {
  return safeGetValue(id, { refDatum }).datapunt;
}

function uniqueDatapunten(datapunten: Datapunt[]): Datapunt[] {
  return [...new Map(datapunten.map((dp) => [dp.id, dp])).values()];
}

function r(min: number, max: number, maand: number): KmRij {
  return { min, max, maand };
}

function formatTabelbedrag(bedrag: number): string {
  return `€ ${bedrag.toFixed(2)}`;
}
