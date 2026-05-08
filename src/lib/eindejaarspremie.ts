import { round2 } from "@/lib/money";
import { getDatapunt } from "@/lib/dataset";
import {
  DatapuntNietBruikbaar,
  DatapuntOnbekend,
} from "@/lib/errors";
import type { Datapunt } from "@/types/dataset";

export interface EindejaarsInput {
  brutoloon: number;
  ancienniteitMaanden: number;        // months in service on 31/12
  prestatieMaandenInRefertepériode: number;  // months actually worked (0..12)
}

export interface EindejaarsResultaat {
  voorwaardenVoldaan: boolean;
  proRataFactor: number;
  premie: number;
  datapunt: Datapunt;
  toelichting: string;
}

const MIN_ANCIENNITEIT_MAANDEN = 6;

export function eindejaarspremie(input: EindejaarsInput): EindejaarsResultaat {
  const dp = getDatapunt("pc200_eindejaarspremie");
  if (!dp) throw new DatapuntOnbekend("pc200_eindejaarspremie");
  if (dp.status === "niet_gevonden" || dp.status === "conflict") {
    throw new DatapuntNietBruikbaar("pc200_eindejaarspremie", `status ${dp.status}`);
  }

  const voorwaarden =
    input.ancienniteitMaanden >= MIN_ANCIENNITEIT_MAANDEN &&
    input.brutoloon > 0;

  if (!voorwaarden) {
    return {
      voorwaardenVoldaan: false,
      proRataFactor: 0,
      premie: 0,
      datapunt: dp,
      toelichting: `Anciënniteit ${input.ancienniteitMaanden} maanden < ${MIN_ANCIENNITEIT_MAANDEN} maanden — geen recht op eindejaarspremie.`,
    };
  }

  const factor =
    Math.max(0, Math.min(12, input.prestatieMaandenInRefertepériode)) / 12;
  const premie = round2(input.brutoloon * factor);

  return {
    voorwaardenVoldaan: true,
    proRataFactor: factor,
    premie,
    datapunt: dp,
    toelichting:
      `Volledige premie = 1 maandloon (€ ${input.brutoloon.toFixed(2)}). ` +
      `Pro-rata: ${input.prestatieMaandenInRefertepériode}/12 = ${factor.toFixed(4)}.`,
  };
}
