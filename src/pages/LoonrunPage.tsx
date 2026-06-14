import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Calculator, Download, Eye, FileText, Trash2, Upload, Users, X, } from "lucide-react";
import { Banner } from "@/components/Banner";
import { SummaryCard, TableFrame, Td, Th } from "@/components/DocumentPrimitives";
import { formatEUR, round2 } from "@/lib/money";
import { profielenUitCsv } from "@/lib/profielCsv";
import { bouwLoonrun, type LoonrunWerknemerInput } from "@/lib/loonrun";
import { bouwIntegratieExportBatch, integratieExportBatchNaarCsv, type IntegratieExportBatch } from "@/lib/integratieExport";
import { clearLoonrunInputs, readLoonrunInputs, writeLoonrunInputs } from "@/lib/loonrunStorage";
import { LoonficheDocument } from "@/pages/loonfiche/LoonficheDocument";
import { WerkgeverRapport } from "@/pages/loonrun/WerkgeverRapport";
import type { Loonfiche } from "@/lib/loonfiche";
interface LoonrunPageProps {
    initialInputs?: LoonrunWerknemerInput[];
}
export function LoonrunPage({ initialInputs }: LoonrunPageProps = {}) {
    const [inputs, setInputs] = useState<LoonrunWerknemerInput[]>(() => {
        if (initialInputs)
            return initialInputs;
        return readLoonrunInputs();
    });
    const [importStatus, setImportStatus] = useState<{
        kind: "success" | "error";
        tekst: string;
    } | null>(null);
    const [selectedLoonfiche, setSelectedLoonfiche] = useState<Loonfiche | null>(null);
    const [toonWerkgeverRapport, setToonWerkgeverRapport] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (initialInputs)
            return;
        writeLoonrunInputs(inputs);
    }, [inputs, initialInputs]);
    useEffect(() => {
        if (toonWerkgeverRapport) {
            document.body.classList.add("print-modal-open");
            return () => document.body.classList.remove("print-modal-open");
        }
    }, [toonWerkgeverRapport]);
    const loonrun = useMemo(() => bouwLoonrun(inputs), [inputs]);
    const exportBatch = useMemo(() => bouwIntegratieExportBatch(loonrun), [loonrun]);
    async function handleImport(file: File | null) {
        if (!file)
            return;
        try {
            const text = await file.text();
            const parsed = profielenUitCsv(text);
            const existingCount = inputs.length;
            const baseId = Date.now();
            const newInputs: LoonrunWerknemerInput[] = parsed.map((p, i) => ({
                id: `wn-${baseId}-${i}`,
                naam: p.profiel.werknemerNaam ||
                    p.profiel.werknemerReferentie ||
                    `Werknemer ${i + 1}`,
                profiel: p.profiel,
            }));
            setInputs((prev) => [...prev, ...newInputs]);
            setImportStatus({
                kind: "success",
                tekst: `${newInputs.length} werknemer${newInputs.length === 1 ? "" : "s"} toegevoegd. Totaal: ${existingCount + newInputs.length}.`,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Import mislukt.";
            setImportStatus({ kind: "error", tekst: message });
        }
        finally {
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
    }
    function handleExport() {
        if (exportBatch.status === "geblokkeerd") {
            setImportStatus({
                kind: "error",
                tekst: "Export geblokkeerd: los eerst de blokkerende loonrunvalidaties op.",
            });
            return;
        }
        const csv = integratieExportBatchNaarCsv(exportBatch);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `jaakie-payroll-export-v1-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
    function handleClear() {
        if (inputs.length > 0 &&
            !window.confirm("Alle werknemers uit de loonrun verwijderen?"))
            return;
        setInputs([]);
        clearLoonrunInputs();
        setImportStatus(null);
    }
    function handleMarkeerGecontroleerd() {
        if (loonrun.heeftBlokkeringen) {
            setImportStatus({
                kind: "error",
                tekst: "Controle geblokkeerd: los eerst de blokkerende loonrunvalidaties op.",
            });
            return;
        }
        setInputs((prev) => prev.map((input) => ({ ...input, status: "gecontroleerd" })));
        setImportStatus({ kind: "success", tekst: "Alle berekende werknemers zijn gemarkeerd als gecontroleerd." });
    }
    function handleVastzetten() {
        if (loonrun.heeftBlokkeringen) {
            setImportStatus({
                kind: "error",
                tekst: "Vastzetten geblokkeerd: los eerst de blokkerende loonrunvalidaties op.",
            });
            return;
        }
        setInputs((prev) => prev.map((input) => ({ ...input, status: "vastgezet" })));
        setImportStatus({ kind: "success", tekst: "Loonrun lokaal vastgezet. Wijzigingen aan de import starten een nieuwe controle." });
    }
    return (<div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}>
      
      <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={22} color="var(--color-primary)"/>
          <div>
            <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 800,
            color: "var(--color-text)",
            margin: 0,
            letterSpacing: 0,
        }}>
              Loonrun
            </h1>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {loonrun.werknemers.length === 0
            ? "Geen werknemers geladen"
            : `${loonrun.periode} · ${loonrun.totalen.aantalBerekend} te controleren` +
                (loonrun.totalen.aantalFout > 0
                    ? ` · ${loonrun.totalen.aantalFout} fout`
                    : "")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={(e) => void handleImport(e.target.files?.[0] ?? null)} style={{ display: "none" }}/>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={buttonStyle("secondary")}>
            <Upload size={14}/>
            {loonrun.werknemers.length > 0 ? "CSV toevoegen" : "Import CSV"}
          </button>
          {loonrun.werknemers.length > 0 && (<>
              <button type="button" onClick={() => setToonWerkgeverRapport(true)} style={buttonStyle("secondary")}>
                <FileText size={14}/>
                Rapport
              </button>
              <button type="button" onClick={handleMarkeerGecontroleerd} style={buttonStyle("secondary")}>
                Gecontroleerd
              </button>
              <button type="button" onClick={handleVastzetten} style={buttonStyle("secondary")}>
                Vastzetten
              </button>
              {exportBatch.status === "geblokkeerd" ? (<button type="button" disabled style={{ ...buttonStyle("secondary"), opacity: 0.55, cursor: "not-allowed" }}>
                  <Download size={14}/>
                  Download geblokkeerd
                </button>) : (<button type="button" onClick={handleExport} style={buttonStyle("primary")}>
                  <Download size={14}/>
                  Download payroll-export v1
                </button>)}
              <button type="button" onClick={handleClear} style={buttonStyle("danger")}>
                <Trash2 size={14}/>
                Wissen
              </button>
            </>)}
        </div>
      </div>

      
      {importStatus && (<div style={{ marginBottom: 16 }}>
          <Banner kind={importStatus.kind} title={importStatus.kind === "success" ? "Import gelukt" : "Import mislukt"}>
            {importStatus.tekst}
          </Banner>
        </div>)}

      {loonrun.werknemers.length > 0 && (<div style={{ marginBottom: 16 }}>
          <Banner kind={loonrun.heeftBlokkeringen ? "error" : "info"} title={loonrun.heeftBlokkeringen ? "Loonrunvalidaties blokkeren export" : "Lokale opslag actief"}>
            {loonrun.heeftBlokkeringen
                ? `${loonrun.validaties.filter((v) => v.niveau === "blokkerend").length} blokkerende validatie(s). Deze run kan niet worden geëxporteerd tot ze opgelost zijn.`
                : "Deze loonrun wordt lokaal in deze browser bewaard. Gebruik Wissen om de opgeslagen werknemers uit deze browser te verwijderen."}
          </Banner>
        </div>)}

      <ExportVoorbereiding batch={exportBatch}/>

      
      {loonrun.werknemers.length > 0 && (<div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 24,
            }}>
          <SummaryCard label="Bruto cash" bedrag={loonrun.totalen.cashBruto}/>
          <SummaryCard label="RSZ-basis" bedrag={loonrun.totalen.brutoRszBasis}/>
          <SummaryCard label="Netto" bedrag={loonrun.totalen.netto}/>
          <SummaryCard label="Werkgeverskost" bedrag={loonrun.totalen.werkgeverskost}/>
          <SummaryCard label="Loonwig" bedrag={loonrun.totalen.loonwigPct} isPercentage percentageSpace/>
          <SummaryCard label="Te controleren" bedrag={loonrun.totalen.aantalTeControleren} isCount/>
          <SummaryCard label="Vastgezet" bedrag={loonrun.totalen.aantalVastgezet} isCount/>
        </div>)}

      
      {loonrun.werknemers.length === 0 ? (<LegeState />) : (<TableFrame shadow>
            <thead>
              <tr style={{
                background: "var(--color-navy-50)",
                borderBottom: "1px solid var(--color-border)",
            }}>
                <Th>Naam</Th>
                <Th align="right">Bruto cash</Th>
                <Th align="right">RSZ-basis</Th>
                <Th align="right">Netto</Th>
                <Th align="right">Werkgeverskost</Th>
                <Th align="right">Loonwig</Th>
                <Th>Status</Th>
                <Th align="center">Actie</Th>
              </tr>
            </thead>
            <tbody>
              {loonrun.werknemers.map((w) => (<tr key={w.id} style={{
                    borderBottom: "1px solid var(--color-navy-50)",
                }}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{w.naam}</div>
                    {w.fout && (<div style={{
                        fontSize: 11,
                        color: "#991b1b",
                        marginTop: 2,
                    }}>
                        {w.fout}
                      </div>)}
                  </Td>
                  <Td align="right">
                    {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.cashBrutoloon)
                    : "—"}
                  </Td>
                  <Td align="right">
                    {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.brutoRszBasis)
                    : "—"}
                  </Td>
                  <Td align="right">
                    {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.nettoTeBetalen)
                    : "—"}
                  </Td>
                  <Td align="right">
                    {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.werkgeverskostMaand)
                    : "—"}
                  </Td>
                  <Td align="right">
                    {w.loonfiche && w.loonfiche.totalen.werkgeverskostMaand > 0
                    ? `${round2(((w.loonfiche.totalen.werkgeverskostMaand - w.loonfiche.totalen.nettoTeBetalen) / w.loonfiche.totalen.werkgeverskostMaand) * 100)} %`
                    : "—"}
                  </Td>
                  <Td>
                    <StatusBadge status={w.status}/>
                  </Td>
                  <Td align="center">
                    {w.loonfiche && (<button type="button" onClick={() => setSelectedLoonfiche(w.loonfiche!)} style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-primary-border)",
                        background: "var(--color-primary-soft)",
                        color: "var(--color-primary)",
                        cursor: "pointer",
                    }}>
                        <Eye size={12}/>
                        Loonfiche
                      </button>)}
                  </Td>
                </tr>))}
            </tbody>
        </TableFrame>)}

      
      {selectedLoonfiche && (<LoonficheModal loonfiche={selectedLoonfiche} onClose={() => setSelectedLoonfiche(null)}/>)}

      
      {toonWerkgeverRapport && createPortal(<div className="print-modal-overlay werkgever-rapport-modal-overlay" style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 200,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "40px 20px",
                overflowY: "auto",
            }} onClick={(e) => {
                if (e.target === e.currentTarget)
                    setToonWerkgeverRapport(false);
            }}>
          <div style={{ maxWidth: 900, width: "100%", position: "relative" }}>
            <button type="button" onClick={() => setToonWerkgeverRapport(false)} style={{
                position: "absolute",
                top: -16,
                right: -16,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md)",
                zIndex: 10,
            }}>
              <X size={16}/>
            </button>
            <WerkgeverRapport loonrun={loonrun}/>
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
                gap: 8,
            }}>
              <button type="button" onClick={() => window.print()} style={buttonStyle("primary")}>
                <FileText size={14}/>
                Print / Opslaan als PDF
              </button>
              <button type="button" onClick={() => setToonWerkgeverRapport(false)} style={buttonStyle("secondary")}>
                Sluiten
              </button>
            </div>
          </div>
        </div>, document.body)}
    </div>);
}
function ExportVoorbereiding({ batch }: { batch: IntegratieExportBatch }) {
    const blokkerendeCodes = batch.audit.validatieCodes.filter((code) => code.startsWith("blokkerend:"));
    const heeftRegels = batch.regels.length > 0;
    return (<section style={{
            marginBottom: 20,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            padding: 16,
        }}>
      <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
        }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
            Exportvoorbereiding
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", maxWidth: 680 }}>
            Voorbereiding voor sociaal secretariaat / boekhouding, geen officiële aangifte.
          </div>
        </div>
        <StatusBadge status={batch.status === "exporteerbaar" ? "Exporteerbaar" : "Geblokkeerd"}/>
      </div>
      <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginTop: 14,
        }}>
        <ExportMeta label="Schema" value={batch.schemaVersie}/>
        <ExportMeta label="Periode" value={batch.periode}/>
        <ExportMeta label="Werkgever" value={batch.werkgeverNaam || "Nog niet ingevuld"}/>
        <ExportMeta label="Ondernemingsnummer" value={batch.ondernemingsnummer || "Nog niet ingevuld"}/>
        <ExportMeta label="Refdatum" value={batch.audit.refDatum || "Nog niet beschikbaar"}/>
        <ExportMeta label="Dataset" value={batch.audit.dataset}/>
      </div>
      {blokkerendeCodes.length > 0 ? (<div style={{ marginTop: 12, fontSize: 12, color: "#991b1b", fontWeight: 700 }}>
          Download geblokkeerd: {blokkerendeCodes.join(", ")}
        </div>) : (<div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-muted)" }}>
          {heeftRegels
                ? "Deze batch is exporteerbaar als generieke Jaakie payroll-export v1."
                : "Importeer werknemers om een exportbatch op te bouwen."}
        </div>)}
    </section>);
}
function ExportMeta({ label, value }: { label: string; value: string }) {
    return (<div>
      <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", overflowWrap: "anywhere" }}>{value}</div>
    </div>);
}
function StatusBadge({ status }: {
    status: string;
}) {
    const colors: Record<string, {
        bg: string;
        text: string;
        border: string;
    }> = {
        berekend: {
            bg: "rgba(28,210,163,0.10)",
            text: "#047857",
            border: "rgba(28,210,163,0.35)",
        },
        te_controleren: {
            bg: "#fff7ed",
            text: "#9a3412",
            border: "#fed7aa",
        },
        gecontroleerd: {
            bg: "rgba(28,210,163,0.10)",
            text: "#047857",
            border: "rgba(28,210,163,0.35)",
        },
        vastgezet: {
            bg: "var(--color-primary-soft)",
            text: "var(--color-primary)",
            border: "var(--color-primary-border)",
        },
        Exporteerbaar: {
            bg: "rgba(28,210,163,0.10)",
            text: "#047857",
            border: "rgba(28,210,163,0.35)",
        },
        Geblokkeerd: {
            bg: "#fff1f2",
            text: "#991b1b",
            border: "#fca5a5",
        },
        fout: {
            bg: "#fff1f2",
            text: "#991b1b",
            border: "#fca5a5",
        },
        concept: {
            bg: "var(--color-navy-50)",
            text: "var(--color-navy-500)",
            border: "var(--color-border)",
        },
    };
    const c = colors[status] ?? colors.concept;
    return (<span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "var(--radius-md)",
            fontSize: 11,
            fontWeight: 700,
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
        }}>
      {status}
    </span>);
}
function LegeState() {
    return (<div style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--color-text-muted)",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
        }}>
      <Calculator size={32} style={{ marginBottom: 12, opacity: 0.4 }}/>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        Geen werknemers geladen
      </div>
      <div style={{ fontSize: 12 }}>
        Importeer één of meer CSV-bestanden (enkelingen of meerdere werknemers) om de loonrun op te bouwen.
      </div>
    </div>);
}
function LoonficheModal({ loonfiche, onClose, }: {
    loonfiche: Loonfiche;
    onClose: () => void;
}) {
    return (<div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 20px",
            overflowY: "auto",
        }} onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }}>
      <div style={{ maxWidth: 900, width: "100%", position: "relative" }}>
        <button type="button" onClick={onClose} style={{
            position: "absolute",
            top: -16,
            right: -16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
        }}>
          <X size={16}/>
        </button>
        <ErrorBoundary fallbackRender={({ error }) => (<Banner kind="error" title="Fout bij tonen loonfiche">
              {(error as Error).message}
            </Banner>)}>
          <LoonficheDocument loonfiche={loonfiche}/>
        </ErrorBoundary>
      </div>
    </div>);
}
function buttonStyle(variant: "primary" | "secondary" | "danger"): React.CSSProperties {
    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: "var(--color-primary)",
            color: "#fff",
            border: "1px solid var(--color-primary)",
        },
        secondary: {
            background: "var(--color-surface)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-primary-border)",
        },
        danger: {
            background: "#fff1f2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
        },
    };
    return {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        ...variants[variant],
    };
}
