import { describe, expect, it } from "bun:test";
import { bouwIntegratieExportBatch, integratieExportBatchNaarCsv } from "@/lib/integratieExport";
import { bouwLoonrun } from "@/lib/loonrun";
import { DEFAULTS } from "@/lib/profiel";

describe("integratie exportbatch", () => {
  it("bouwt een exporteerbare batch met metadata en werknemerregels", () => {
    const run = bouwLoonrun([
      {
        id: "wn-1",
        naam: "Jan Peeters",
        insz: "90010112345",
        profiel: {
          ...DEFAULTS,
          werknemerNaam: "Jan Peeters",
          werkgeverNaam: "Jaakie Payroll BV",
          werkgeverOndernemingsnummer: "0452.085.227",
          brutoloon: 3200,
        },
      },
    ]);

    const batch = bouwIntegratieExportBatch(run);

    expect(batch.schemaVersie).toBe("jaakie-payroll-export-v1");
    expect(batch.status).toBe("exporteerbaar");
    expect(batch.periode).toContain("2026");
    expect(batch.werkgeverNaam).toBe("Jaakie Payroll BV");
    expect(batch.ondernemingsnummer).toBe("0452.085.227");
    expect(batch.audit.validatieCodes).toEqual(["info:lokale_opslag"]);
    expect(batch.regels).toHaveLength(1);
    expect(batch.regels[0]).toMatchObject({
      werknemerId: "wn-1",
      naam: "Jan Peeters",
      loonrunStatus: "te_controleren",
      fout: "",
    });
    const loonfiche = run.werknemers[0].loonfiche;
    expect(loonfiche).toBeDefined();
    if (!loonfiche) throw new Error("Test verwacht een berekende loonfiche.");
    expect(batch.regels[0].brutoCash).toBe(loonfiche.totalen.cashBrutoloon);
    expect(batch.regels[0].netto).toBe(loonfiche.totalen.nettoTeBetalen);
  });

  it("blokkeert exportbatch bij blokkerende loonrunvalidaties", () => {
    const run = bouwLoonrun([
      { id: "wn-1", naam: "Jan", profiel: { ...DEFAULTS, berekeningsMaand: "06" } },
      { id: "wn-2", naam: "Piet", profiel: { ...DEFAULTS, berekeningsMaand: "07" } },
    ]);

    const batch = bouwIntegratieExportBatch(run);

    expect(batch.status).toBe("geblokkeerd");
    expect(batch.audit.validatieCodes).toContain("blokkerend:gemengde_periode");
  });

  it("exporteert CSV v1 met batchmetadata, werknemerregels en totalen", () => {
    const run = bouwLoonrun([
      {
        id: "wn-1",
        naam: "Jan Peeters",
        insz: "90010112345",
        profiel: {
          ...DEFAULTS,
          werknemerNaam: "Jan Peeters",
          werkgeverNaam: "Jaakie Payroll BV",
          werkgeverOndernemingsnummer: "0452.085.227",
          brutoloon: 3200,
        },
      },
    ]);
    const batch = bouwIntegratieExportBatch(run);

    const csv = integratieExportBatchNaarCsv(batch);

    expect(csv.split("\n")[0]).toContain("schema_versie;batch_id;aangemaakt_op;periode;werkgever_naam;ondernemingsnummer;batch_status");
    expect(csv).toContain("jaakie-payroll-export-v1");
    expect(csv).toContain("Jan Peeters");
    expect(csv).toContain("TOTALEN");
  });
});
