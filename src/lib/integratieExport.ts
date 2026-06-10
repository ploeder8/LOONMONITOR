import { round2 } from "@/lib/money";
import type { Loonrun, LoonrunStatus } from "@/lib/loonrun";
import { refDatumVoorMaand } from "@/lib/profiel";

export type IntegratieExportStatus = "geblokkeerd" | "exporteerbaar";

export interface IntegratieExportRegel {
  werknemerId: string;
  naam: string;
  brutoCash: number | null;
  brutoRszBasis: number | null;
  belastbaarVoorBV: number | null;
  netto: number | null;
  werkgeverskost: number | null;
  loonwigPct: number | null;
  loonrunStatus: LoonrunStatus;
  validaties: string[];
  fout: string;
}

export interface IntegratieExportBatch {
  schemaVersie: "jaakie-payroll-export-v1";
  batchId: string;
  aangemaaktOp: string;
  periode: string;
  werkgeverNaam: string;
  ondernemingsnummer: string;
  status: IntegratieExportStatus;
  audit: {
    dataset: "pc200_payroll_dataset_2026.json";
    refDatum: string;
    validatieCodes: string[];
    bronStatus: "bundled_dataset";
  };
  totalen: Loonrun["totalen"];
  regels: IntegratieExportRegel[];
}

type CsvWaarde = string | number | null;
type IntegratieExportCsvRegel = Omit<IntegratieExportRegel, "loonrunStatus"> & { loonrunStatus: string };

const SCHEMA_VERSIE = "jaakie-payroll-export-v1" as const;

const KOLOMMEN = [
  "schema_versie",
  "batch_id",
  "aangemaakt_op",
  "periode",
  "werkgever_naam",
  "ondernemingsnummer",
  "batch_status",
  "ref_datum",
  "dataset",
  "bron_status",
  "werknemer_id",
  "naam",
  "cash_bruto",
  "bruto_rsz_basis",
  "belastbaar_voor_bv",
  "netto",
  "werkgeverskost",
  "loonwig_pct",
  "loonrun_status",
  "validaties",
  "fout",
] as const;

export function bouwIntegratieExportBatch(loonrun: Loonrun): IntegratieExportBatch {
  const aangemaaktOp = new Date().toISOString();
  const eersteProfiel = loonrun.werknemers[0]?.profiel;
  const refDatum = eersteProfiel
    ? refDatumVoorMaand(eersteProfiel.berekeningsJaar, eersteProfiel.berekeningsMaand)
    : "";
  const validatieCodes = loonrun.validaties.map(validatieCode);

  return {
    schemaVersie: SCHEMA_VERSIE,
    batchId: `batch-${aangemaaktOp}`,
    aangemaaktOp,
    periode: loonrun.periode,
    werkgeverNaam: eersteProfiel?.werkgeverNaam ?? "",
    ondernemingsnummer: eersteProfiel?.werkgeverOndernemingsnummer ?? "",
    status: loonrun.heeftBlokkeringen ? "geblokkeerd" : "exporteerbaar",
    audit: {
      dataset: "pc200_payroll_dataset_2026.json",
      refDatum,
      validatieCodes,
      bronStatus: "bundled_dataset",
    },
    totalen: loonrun.totalen,
    regels: loonrun.werknemers.map((werknemer) => {
      const totalen = werknemer.loonfiche?.totalen;
      const werkgeverskost = totalen?.werkgeverskostMaand ?? null;
      const netto = totalen?.nettoTeBetalen ?? null;
      return {
        werknemerId: werknemer.id,
        naam: werknemer.naam,
        brutoCash: totalen?.cashBrutoloon ?? null,
        brutoRszBasis: totalen?.brutoRszBasis ?? null,
        belastbaarVoorBV: totalen?.belastbaarVoorBV ?? null,
        netto,
        werkgeverskost,
        loonwigPct:
          werkgeverskost !== null && netto !== null && werkgeverskost > 0
            ? round2(((werkgeverskost - netto) / werkgeverskost) * 100)
            : null,
        loonrunStatus: werknemer.status,
        validaties: werknemer.validaties.map(validatieCode),
        fout: werknemer.fout ?? "",
      };
    }),
  };
}

export function integratieExportBatchNaarCsv(batch: IntegratieExportBatch): string {
  const header = KOLOMMEN.map(escapeCsvWaarde).join(";");
  const rijen = batch.regels.map((regel) => waardenNaarCsv(batch, regel));
  const totalenRij = waardenNaarCsv(batch, {
    werknemerId: "TOTALEN",
    naam: "",
    brutoCash: batch.totalen.cashBruto,
    brutoRszBasis: batch.totalen.brutoRszBasis,
    belastbaarVoorBV: batch.totalen.belastbaarVoorBV,
    netto: batch.totalen.netto,
    werkgeverskost: batch.totalen.werkgeverskost,
    loonwigPct: batch.totalen.loonwigPct,
    loonrunStatus: `${batch.totalen.aantalBerekend} berekend / ${batch.totalen.aantalFout} fout`,
    validaties: batch.audit.validatieCodes,
    fout: "",
  });
  return [header, ...rijen, totalenRij].join("\n");
}

function waardenNaarCsv(batch: IntegratieExportBatch, regel: IntegratieExportCsvRegel): string {
  const waarden: Record<(typeof KOLOMMEN)[number], CsvWaarde> = {
    schema_versie: batch.schemaVersie,
    batch_id: batch.batchId,
    aangemaakt_op: batch.aangemaaktOp,
    periode: batch.periode,
    werkgever_naam: batch.werkgeverNaam,
    ondernemingsnummer: batch.ondernemingsnummer,
    batch_status: batch.status,
    ref_datum: batch.audit.refDatum,
    dataset: batch.audit.dataset,
    bron_status: batch.audit.bronStatus,
    werknemer_id: regel.werknemerId,
    naam: regel.naam,
    cash_bruto: regel.brutoCash,
    bruto_rsz_basis: regel.brutoRszBasis,
    belastbaar_voor_bv: regel.belastbaarVoorBV,
    netto: regel.netto,
    werkgeverskost: regel.werkgeverskost,
    loonwig_pct: regel.loonwigPct,
    loonrun_status: regel.loonrunStatus,
    validaties: regel.validaties.join("|"),
    fout: regel.fout,
  };
  return KOLOMMEN.map((kolom) => escapeCsvWaarde(waarden[kolom])).join(";");
}

function validatieCode(validatie: { niveau: string; code: string }): string {
  return `${validatie.niveau}:${validatie.code}`;
}

function escapeCsvWaarde(waarde: CsvWaarde): string {
  if (waarde === null || waarde === undefined) return "";
  const tekst = String(waarde);
  if (!/[;"\r\n]/.test(tekst)) return tekst;
  return `"${tekst.replaceAll('"', '""')}"`;
}
