import { safeGetValue } from "@/lib/periode";
import { getDatapunt } from "@/lib/dataset";
import { DatapuntNietBruikbaar, DatapuntOnbekend } from "@/lib/errors";
import type { Datapunt } from "@/types/dataset";

export interface EcochequesInput {
  tewerkstellingsbreuk: number; // 0..1 (e.g. 1.0 = 5/5, 0.6 = 3/5)
  refDatum: string;
  refertepériodeVolledig?: boolean; // default true
}

export interface EcochequesResultaat {
  bedrag: number;
  schaalLabel: string;
  datapunt: Datapunt;
  voltijdsReferentie: number;
}

// The deeltijds-schaal lives in dataset's waarde_bron as text (waarde_genormaliseerd is null
// because it's a tabel, not a single number). We mirror it here as a structured lookup;
// CI test in __tests__/ecocheques-schaal.test.ts asserts the bron_text still says the same.
const DEELTIJDS_SCHAAL: Array<{
  minBreuk: number;
  bedrag: number;
  label: string;
}> = [
  { minBreuk: 0.8, bedrag: 250, label: "≥ 4/5" },
  { minBreuk: 0.6, bedrag: 200, label: "≥ 3/5" },
  { minBreuk: 0.5, bedrag: 150, label: "≥ 1/2" },
  { minBreuk: 0,   bedrag: 100, label: "< 1/2" },
];

export function ecocheques(input: EcochequesInput): EcochequesResultaat {
  const { tewerkstellingsbreuk, refDatum, refertepériodeVolledig = true } = input;

  const voltijds = safeGetValue("pc200_ecocheques_voltijds", { refDatum });
  const voltijdsBedrag = voltijds.waarde ?? 250;

  // 5/5 + volledige refertepériode → voltijds bedrag
  if (tewerkstellingsbreuk >= 1 && refertepériodeVolledig) {
    return {
      bedrag: voltijdsBedrag,
      schaalLabel: "5/5 voltijds",
      datapunt: voltijds.datapunt,
      voltijdsReferentie: voltijdsBedrag,
    };
  }

  // Deeltijds — confirm the schaal datapunt is reachable & active
  const dp = getDatapunt("pc200_ecocheques_deeltijds_schaal");
  if (!dp) throw new DatapuntOnbekend("pc200_ecocheques_deeltijds_schaal");
  if (dp.status === "niet_gevonden" || dp.status === "conflict") {
    throw new DatapuntNietBruikbaar(
      "pc200_ecocheques_deeltijds_schaal",
      `status ${dp.status}`,
    );
  }

  const trede = DEELTIJDS_SCHAAL.find((t) => tewerkstellingsbreuk >= t.minBreuk);
  if (!trede) {
    throw new Error(`Geen ecocheque-trede gevonden voor breuk ${tewerkstellingsbreuk}`);
  }

  return {
    bedrag: trede.bedrag,
    schaalLabel: trede.label,
    datapunt: dp,
    voltijdsReferentie: voltijdsBedrag,
  };
}
