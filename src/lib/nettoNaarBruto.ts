import { getDatapunt } from "@/lib/dataset";
import { berekenNetto, type NettoInput, type NettoResultaat } from "@/lib/netto";
import { round2 } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";

export interface NettoNaarBrutoInput extends Omit<NettoInput, "brutoloon"> {
  doelNettoloon: number;
}

export interface NettoNaarBrutoResultaat {
  gevondenBruto: number | null;
  iteraties: number;
  tolerantie: number;
  nettoResultaat: NettoResultaat | null;
  convergentie: "ok" | "niet_geconvergeerd";
  afwijkingVanDoel: number;
  methodologieDatapunt: Datapunt | null;
  tolerantieDatapunt: Datapunt | null;
}

const DEFAULT_TOLERANTIE = 0.01;
const MAX_ITERATIES = 80;

function forwardNetto(
  brutoloon: number,
  input: NettoNaarBrutoInput,
): NettoResultaat {
  const forwardInput: NettoInput = {
    ...input,
    brutoloon,
  };
  return berekenNetto(forwardInput);
}

/**
 * Converteer een eurobedrag naar een geheel aantal centen.
 * We gebruiken Math.round om consistente afronding te garanderen.
 */
function eurNaarCent(eur: number): number {
  return Math.round(eur * 100);
}

export function zoekBrutoVoorNetto(
  input: NettoNaarBrutoInput,
): NettoNaarBrutoResultaat {
  const methodologieDatapunt = getDatapunt("berekeningsmethode_netto_naar_bruto");
  const tolerantieDatapunt = getDatapunt("netto_naar_bruto_tolerantie_eur");
  const tolerantie =
    (tolerantieDatapunt?.waarde_genormaliseerd as number | undefined) ??
    DEFAULT_TOLERANTIE;

  const doelNettoloon = round2(input.doelNettoloon);
  const doelCent = eurNaarCent(doelNettoloon);
  const tolCent = eurNaarCent(tolerantie);

  // Ondergrens in centen: theoretisch minimum (geen afhoudingen)
  let ondergrensCent = Math.max(0, doelCent);
  // Bovengrens in centen: conservatieve schatting
  let bovengrensCent = eurNaarCent(Math.max(doelNettoloon * 2.5, doelNettoloon + 2000));

  // Verhoog bovengrens dynamisch tot het doel-netto haalbaar is
  let veiligheidsteller = 0;
  while (
    eurNaarCent(forwardNetto(bovengrensCent / 100, input).nettoloon) < doelCent &&
    veiligheidsteller < 20
  ) {
    bovengrensCent = bovengrensCent * 2;
    veiligheidsteller++;
  }

  let iteraties = 0;
  let besteBrutoCent: number | null = null;
  let besteNettoResultaat: NettoResultaat | null = null;
  let besteAfwijkingCent = Infinity;

  while (iteraties < MAX_ITERATIES) {
    const midCent = Math.floor((ondergrensCent + bovengrensCent) / 2);
    const midEur = midCent / 100;
    const result = forwardNetto(midEur, input);
    const nettoCent = eurNaarCent(result.nettoloon);
    const afwijkingCent = Math.abs(nettoCent - doelCent);

    if (afwijkingCent < besteAfwijkingCent) {
      besteAfwijkingCent = afwijkingCent;
      besteBrutoCent = midCent;
      besteNettoResultaat = result;
    }

    if (afwijkingCent <= tolCent) {
      return {
        gevondenBruto: midEur,
        iteraties: iteraties + 1,
        tolerantie,
        nettoResultaat: result,
        convergentie: "ok",
        afwijkingVanDoel: round2(afwijkingCent / 100),
        methodologieDatapunt,
        tolerantieDatapunt,
      };
    }

    if (nettoCent < doelCent) {
      ondergrensCent = midCent;
    } else {
      bovengrensCent = midCent;
    }

    // Als de zoekruimte opgebruikt is (verschil ≤ 1 cent), stop dan
    if (bovengrensCent - ondergrensCent <= 1) {
      break;
    }

    iteraties++;
  }

  // Geen convergentie binnen tolerantie — retourneer het beste wat we hebben
  return {
    gevondenBruto: besteBrutoCent !== null ? besteBrutoCent / 100 : null,
    iteraties,
    tolerantie,
    nettoResultaat: besteNettoResultaat,
    convergentie: "niet_geconvergeerd",
    afwijkingVanDoel: round2(besteAfwijkingCent / 100),
    methodologieDatapunt,
    tolerantieDatapunt,
  };
}
