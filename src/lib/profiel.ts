import type { BaremaCat, Schaal, StudentenCat } from "@/lib/baremas";
import type { BrandstofBedrijfswagen } from "@/lib/vaaBedrijfswagen";
import type { GezinsType } from "@/lib/netto";
import { MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026 } from "@/lib/werkgeverskost";

export type { BaremaCat, Schaal, StudentenCat } from "@/lib/baremas";
export type { BrandstofBedrijfswagen } from "@/lib/vaaBedrijfswagen";
export type { GezinsType } from "@/lib/netto";

export type Statuut = "bediende" | "student";
export type BeroepskostMethode = "forfaitair" | "reeel";
export type BerekeningsRichting = "bruto_naar_netto" | "netto_naar_bruto";

export interface Profiel {
  berekeningsRichting: BerekeningsRichting;
  statuut: Statuut;
  schaal: Schaal;
  cat: BaremaCat;
  ervaringJaren: number;
  studentenCat: StudentenCat;
  studentLeeftijd: number;
  brutoloon: number;
  doelNettoloon: number;
  bouwVlag: boolean;
  berekeningsMaand: string;
  berekeningsJaar: string;
  ancienniteitMaanden: number;
  prestatieMaanden: number;
  tewerkstellingsbreuk: number;
  woonwerkFiets: boolean;
  woonwerkPrivewagen: boolean;
  woonwerkBusTramMetro: boolean;
  woonwerkTrein: boolean;
  woonwerkBedrijfswagen: boolean;
  kmPerDag: number;
  treinKm: number;
  busTramMetroKm: number;
  busTramMetroPrijs: number;
  privewagenKm: number;
  bedrijfswagenCataloguswaarde: number;
  bedrijfswagenDatumEersteInschrijving: string;
  bedrijfswagenBrandstof: BrandstofBedrijfswagen;
  bedrijfswagenCo2: number;
  arbeidsdagenPerMaand: number;
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  fiscaalAlleenstaandeMetKind: boolean;
  groepsverzekeringEigenBijdrage: number;
  vaaPcLaptopActief: boolean;
  vaaGsmSmartphoneActief: boolean;
  vaaInternetActief: boolean;
  vaaGsmAbonnementActief: boolean;
  woonwerkPrivewagenBeroepskostMethode: BeroepskostMethode;
  woonwerkBedrijfswagenBeroepskostMethode: BeroepskostMethode;
  arbeidsongevallenPct: number;
  extraGroepsverzekering: number;
  maaltijdchequesActief: boolean;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  extraHospitalisatie: number;
  hospitalisatieEigenBijdrage: number;
  onkostenvergoedingPerMaand: number;
  gemeentebelastingPct: number;
  werknemerNaam: string;
  werknemerReferentie: string;
  werkgeverNaam: string;
  werkgeverOndernemingsnummer: string;
}

export const DEFAULTS: Profiel = {
  berekeningsRichting: "bruto_naar_netto",
  statuut: "bediende",
  schaal: "I",
  cat: "A",
  ervaringJaren: 5,
  studentenCat: "A",
  studentLeeftijd: 17,
  brutoloon: 3000,
  doelNettoloon: 1800,
  bouwVlag: false,
  berekeningsMaand: "06",
  berekeningsJaar: "2026",
  ancienniteitMaanden: 12,
  prestatieMaanden: 12,
  tewerkstellingsbreuk: 1,
  woonwerkFiets: false,
  woonwerkPrivewagen: false,
  woonwerkBusTramMetro: false,
  woonwerkTrein: false,
  woonwerkBedrijfswagen: false,
  kmPerDag: 8,
  treinKm: 15,
  busTramMetroKm: 10,
  busTramMetroPrijs: 60,
  privewagenKm: 15,
  bedrijfswagenCataloguswaarde: 40000,
  bedrijfswagenDatumEersteInschrijving: "2026-01-01",
  bedrijfswagenBrandstof: "benzine",
  bedrijfswagenCo2: 100,
  arbeidsdagenPerMaand: aantalWeekdagenInMaand("2026", "06"),
  gezinstype: "alleenstaand",
  kinderenTenLaste: 0,
  fiscaalAlleenstaandeMetKind: false,
  groepsverzekeringEigenBijdrage: 0,
  vaaPcLaptopActief: false,
  vaaGsmSmartphoneActief: false,
  vaaInternetActief: false,
  vaaGsmAbonnementActief: false,
  woonwerkPrivewagenBeroepskostMethode: "forfaitair",
  woonwerkBedrijfswagenBeroepskostMethode: "forfaitair",
  arbeidsongevallenPct: 0.003,
  extraGroepsverzekering: 0,
  maaltijdchequesActief: false,
  maaltijdchequeWerkgeversaandeelPerDag: MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
  maaltijdchequeWerknemersbijdragePerDag: 1.09,
  extraHospitalisatie: 0,
  hospitalisatieEigenBijdrage: 0,
  onkostenvergoedingPerMaand: 0,
  gemeentebelastingPct: 7.3,
  werknemerNaam: "",
  werknemerReferentie: "",
  werkgeverNaam: "",
  werkgeverOndernemingsnummer: "",
};

export function aantalWeekdagenInMaand(berekeningsJaar: string, berekeningsMaand: string): number {
  const jaar = parseInt(berekeningsJaar, 10);
  const maandIndex = parseInt(berekeningsMaand, 10) - 1;
  if (!Number.isFinite(jaar) || !Number.isFinite(maandIndex)) return 0;

  let dagen = 0;
  const datum = new Date(Date.UTC(jaar, maandIndex, 1));
  while (datum.getUTCMonth() === maandIndex) {
    const weekdag = datum.getUTCDay();
    if (weekdag !== 0 && weekdag !== 6) dagen += 1;
    datum.setUTCDate(datum.getUTCDate() + 1);
  }
  return dagen;
}

export function refDatumVoorMaand(
  berekeningsJaar: string | undefined,
  berekeningsMaand: string | undefined,
): string {
  if (berekeningsMaand && /^\d{4}-\d{2}$/.test(berekeningsMaand)) {
    return `${berekeningsMaand}-01`;
  }
  return `${berekeningsJaar ?? DEFAULTS.berekeningsJaar}-${berekeningsMaand ?? DEFAULTS.berekeningsMaand}-01`;
}

export function normaliseerProfiel(profiel: Profiel): Profiel {
  const genormaliseerd = normaliseerEindejaarspremieProfiel(profiel);
  if (/^\d{4}-\d{2}$/.test(genormaliseerd.berekeningsMaand)) {
    const [berekeningsJaar, berekeningsMaand] = genormaliseerd.berekeningsMaand.split("-");
    return {
      ...genormaliseerd,
      berekeningsJaar: genormaliseerd.berekeningsJaar ?? berekeningsJaar,
      berekeningsMaand,
    };
  }
  if (!genormaliseerd.berekeningsJaar) {
    return { ...genormaliseerd, berekeningsJaar: DEFAULTS.berekeningsJaar };
  }
  return genormaliseerd;
}

export function heeftMaaltijdcheques(
  profiel: Pick<Profiel, "maaltijdchequesActief">,
): boolean {
  return profiel.maaltijdchequesActief;
}

export function eindejaarspremieMaandenVoorCheckbox(
  eindejaarspremieAan: boolean,
): Pick<Profiel, "ancienniteitMaanden" | "prestatieMaanden"> {
  const maanden = eindejaarspremieAan ? 12 : 0;
  return {
    ancienniteitMaanden: maanden,
    prestatieMaanden: maanden,
  };
}

export function eindejaarspremieIsActief(
  profiel: Pick<Profiel, "prestatieMaanden">,
): boolean {
  return profiel.prestatieMaanden > 0;
}

function normaliseerEindejaarspremieProfiel(profiel: Profiel): Profiel {
  const maanden = eindejaarspremieMaandenVoorCheckbox(eindejaarspremieIsActief(profiel));
  return {
    ...profiel,
    ...maanden,
  };
}

export function tewerkstellingsbreukNaarPercentage(tewerkstellingsbreuk: number): number {
  return tewerkstellingsbreuk * 100;
}

export function percentageNaarTewerkstellingsbreuk(percentage: number): number {
  return percentage / 100;
}
