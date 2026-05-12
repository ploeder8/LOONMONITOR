// Werkgeverskost-module — totale loonkost werkgever voor PC 200 bediende.
// SSOT: knowledgebase/05_calculator_werkgeverskost.md

import { round2 } from "@/lib/money";
import { rszBijdragen, type RszResultaat } from "@/lib/rsz";
import { getDatapunt } from "@/lib/dataset";
import type { Datapunt } from "@/types/dataset";

export interface WerkgeverskostInput {
  brutoloon: number;
  refDatum: string;
  bouwVlag?: boolean;
  // Aanpasbaar (defaults uit dataset of fallback):
  arbeidsongevallenPct?: number;        // default 0.003 (bureaupersoneel)
  premieEjpPct?: number;                 // default 0.0833 (1/12)
  premieVakantiegeldPct?: number;        // default 0.0667 (92%/12)
  // Optionele extralegale voordelen:
  extraGroepsverzekering?: number;       // €/maand werkgever-deel
  extraMaaltijdcheques?: number;         // €/maand werkgever-deel
  extraHospitalisatie?: number;          // €/maand
  extraEcocheques?: number;              // €/maand
}

export interface WerkgeverskostResultaat {
  brutoloon: number;
  // Verplichte componenten
  rszWerkgever: number;                  // ~25% basis + loonmatiging
  sociaalFonds200: number;               // 0,23%
  bouwAanvullendPensioen: number | null; // 1,80% indien bouw-subset
  arbeidsongevallen: number;             // ~0,3%
  provisieEindejaarspremie: number;      // 8,33%
  provisieVakantiegeld: number;          // 6,67%
  // Optioneel
  extraVoordelen: number;                // som van extra werkgeverskosten
  // Totalen
  totaleLoonkostSmal: number;            // bruto + RSZ wg + SF200 + bouw + AO (geen provisies)
  totaleLoonkostBreed: number;           // smal + provisies + extra voordelen
  // Loonwig (vereist netto-input om te berekenen)
  loonwigPct?: number;
  // Audit
  datapunten: Datapunt[];
}

// Defaults — afgestemd op SSOT knowledgebase/05_calculator_werkgeverskost.md §2
const DEFAULT_AO_PCT = 0.003;
const DEFAULT_EJP_PCT = 0.0833;
const DEFAULT_VG_PCT = 0.0667;

export function werkgeverskost(input: WerkgeverskostInput): WerkgeverskostResultaat {
  const {
    brutoloon,
    refDatum,
    bouwVlag = false,
    arbeidsongevallenPct = DEFAULT_AO_PCT,
    premieEjpPct = DEFAULT_EJP_PCT,
    premieVakantiegeldPct = DEFAULT_VG_PCT,
    extraGroepsverzekering = 0,
    extraMaaltijdcheques = 0,
    extraHospitalisatie = 0,
    extraEcocheques = 0,
  } = input;

  const rszR: RszResultaat = rszBijdragen({ brutoloon, refDatum, bouwVlag });

  const ao = round2(brutoloon * arbeidsongevallenPct);
  const provEjp = round2(brutoloon * premieEjpPct);
  const provVg = round2(brutoloon * premieVakantiegeldPct);

  const extraVoordelen = round2(
    extraGroepsverzekering + extraMaaltijdcheques + extraHospitalisatie + extraEcocheques,
  );

  const smal = round2(brutoloon + rszR.totaalWerkgever + ao);
  const breed = round2(smal + provEjp + provVg + extraVoordelen);

  // Audit-datapunten
  const datapunten: Datapunt[] = [];
  for (const b of rszR.bronnen) datapunten.push(b.datapunt);
  const dpAo = getDatapunt("arbeidsongevallen_bedienden_2026");
  const dpEjpProv = getDatapunt("provisie_eindejaarspremie_2026");
  const dpVgProv = getDatapunt("provisie_dubbel_vakantiegeld_2026");
  if (dpAo) datapunten.push(dpAo);
  if (dpEjpProv) datapunten.push(dpEjpProv);
  if (dpVgProv) datapunten.push(dpVgProv);

  return {
    brutoloon,
    rszWerkgever: rszR.werkgeverBasisbijdrage,
    sociaalFonds200: rszR.sociaalFonds200,
    bouwAanvullendPensioen: rszR.bouwAanvullendPensioen,
    arbeidsongevallen: ao,
    provisieEindejaarspremie: provEjp,
    provisieVakantiegeld: provVg,
    extraVoordelen,
    totaleLoonkostSmal: smal,
    totaleLoonkostBreed: breed,
    datapunten,
  };
}

/** Bereken loonwig-percentage gegeven werkgeverskost en netto */
export function loonwig(totaleLoonkost: number, netto: number): number {
  if (totaleLoonkost <= 0) return 0;
  return round2(((totaleLoonkost - netto) / totaleLoonkost) * 100) / 100;
}
