import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Download, FileText, Printer, X } from "lucide-react";
import { Banner } from "@/components/Banner";
import { useSharedProfiel } from "@/lib/useSharedProfiel";
import { normaliseerProfiel, refDatumVoorMaand, type BerekeningsRichting, type Profiel, } from "@/lib/profiel";
import { normaliseerCsvBestandsnaam, profielNaarCsv, profielUitCsv, standaardCsvNaamPrefix, } from "@/lib/profielCsv";
import { berekenNettoVoorProfiel, zoekBrutoVoorProfielDoelNetto, } from "@/lib/profielBerekeningen";
import { CsvPaneel } from "@/pages/home/CsvPaneel";
import { WerknemerOverzicht } from "@/pages/home/WerknemerOverzicht";
import { computeSummary, ResultBandsPanel } from "@/pages/home/ResultatenPanel";
import type { ProfielSetter, ProfielUpdate } from "@/pages/home/types";
import { ProfielEditor, type ProfielEditorLayout } from "@/pages/profiel/ProfielEditor";
export { waardeUitNumeriekeInput } from "@/pages/home/FormControls";
export function HomePage({ layout }: { layout?: ProfielEditorLayout } = {}) {
    const [p, setP] = useSharedProfiel();
    const [exportNaam, setExportNaam] = useState(() => standaardCsvNaamPrefix());
    const [commentaar, setCommentaar] = useState("");
    const [csvStatus, setCsvStatus] = useState<{
        kind: "success" | "error";
        tekst: string;
    } | null>(null);
    const [toonCsvPaneel, setToonCsvPaneel] = useState(false);
    const [toonOverzicht, setToonOverzicht] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profiel = useMemo(() => normaliseerProfiel(p), [p]);
    useEffect(() => {
        if (toonOverzicht) {
            document.body.classList.add("print-modal-open");
            return () => document.body.classList.remove("print-modal-open");
        }
    }, [toonOverzicht]);
    const set = useCallback(((kOfUpdate: keyof Profiel | ProfielUpdate, v?: Profiel[keyof Profiel]) => {
        setP((prev) => {
            const basis = normaliseerProfiel(prev);
            if (typeof kOfUpdate === "function")
                return kOfUpdate(basis);
            if (typeof kOfUpdate === "object")
                return { ...basis, ...kOfUpdate };
            return { ...basis, [kOfUpdate]: v };
        });
    }) as ProfielSetter, [setP]);
    function exporteerCsv() {
        const csv = profielNaarCsv({ profiel, commentaar });
        const vandaag = standaardCsvNaamPrefix().slice(0, -1);
        const bestandsnaam = normaliseerCsvBestandsnaam(exportNaam, vandaag);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = bestandsnaam;
        link.click();
        URL.revokeObjectURL(url);
        setCsvStatus({ kind: "success", tekst: `CSV geëxporteerd als ${bestandsnaam}.` });
    }
    async function importeerCsvBestand(file: File | null) {
        if (!file)
            return;
        try {
            const parsed = profielUitCsv(await file.text());
            setP(normaliseerProfiel(parsed.profiel));
            setCommentaar(parsed.commentaar);
            setCsvStatus({ kind: "success", tekst: "CSV geïmporteerd. Outputkolommen zijn genegeerd." });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "CSV kon niet worden gelezen.";
            setCsvStatus({ kind: "error", tekst: message });
        }
        finally {
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
    }
    function setBerekeningsRichting(richting: BerekeningsRichting) {
        if (richting === profiel.berekeningsRichting)
            return;
        if (richting === "netto_naar_bruto") {
            const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
            const netto = berekenNettoVoorProfiel(profiel, refDatum);
            setP((prev) => ({
                ...normaliseerProfiel(prev),
                berekeningsRichting: richting,
                doelNettoloon: netto.nettoloon,
            }));
        }
        else {
            setP((prev) => ({ ...normaliseerProfiel(prev), berekeningsRichting: richting }));
        }
    }
    useEffect(() => {
        if (profiel.berekeningsRichting !== "netto_naar_bruto")
            return;
        if (profiel.statuut !== "bediende")
            return;
        const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
        const inverse = zoekBrutoVoorProfielDoelNetto(profiel, refDatum);
        if (inverse.gevondenBruto !== null &&
            Math.abs(inverse.gevondenBruto - profiel.brutoloon) > 0.01) {
            setP((prev) => ({
                ...normaliseerProfiel(prev),
                brutoloon: inverse.gevondenBruto!,
            }));
        }
    }, [
        profiel.berekeningsRichting,
        profiel.doelNettoloon,
        profiel.statuut,
        profiel.berekeningsJaar,
        profiel.berekeningsMaand,
        profiel.gezinstype,
        profiel.kinderenTenLaste,
        profiel.fiscaalAlleenstaandeMetKind,
        profiel.groepsverzekeringEigenBijdrage,
        profiel.maaltijdchequesActief,
        profiel.maaltijdchequeWerkgeversaandeelPerDag,
        profiel.maaltijdchequeWerknemersbijdragePerDag,
        profiel.arbeidsdagenPerMaand,
        profiel.hospitalisatieEigenBijdrage,
        profiel.onkostenvergoedingPerMaand,
        profiel.woonwerkPrivewagenBeroepskostMethode,
        profiel.woonwerkFiets,
        profiel.woonwerkPrivewagen,
        profiel.woonwerkTrein,
        profiel.woonwerkBusTramMetro,
        profiel.woonwerkBedrijfswagen,
        profiel.kmPerDag,
        profiel.treinKm,
        profiel.busTramMetroKm,
        profiel.busTramMetroPrijs,
        profiel.privewagenKm,
        profiel.bouwVlag,
        profiel.bedrijfswagenCataloguswaarde,
        profiel.bedrijfswagenDatumEersteInschrijving,
        profiel.bedrijfswagenBrandstof,
        profiel.bedrijfswagenCo2,
        profiel.vaaPcLaptopActief,
        profiel.vaaGsmSmartphoneActief,
        profiel.vaaInternetActief,
        profiel.vaaGsmAbonnementActief,
    ]);
    const summary = useMemo(() => computeSummary(profiel), [profiel]);
    return (<div className="home-layout" style={{ maxWidth: 1280, margin: "-22px auto 0", padding: "0 1rem 1.5rem" }}>
      <div className="calculator-page-actions">
        <div className="calculator-dev-actions" style={{ marginLeft: 0 }}>
          <button type="button" onClick={() => setToonCsvPaneel(true)} className="calculator-dev-action-button">
            <Download size={14}/>
            CSV import/export
          </button>
          <button type="button" onClick={() => setToonOverzicht(true)} className="calculator-dev-action-button">
            <FileText size={14}/>
            Print overzicht
          </button>
        </div>
      </div>

      <ProfielEditor profiel={profiel} set={set} onChangeRichting={setBerekeningsRichting} layout={layout}/>

      <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (<Banner kind="error" title="Onverwachte fout">
            <p>{(error as Error).message}</p>
            <button onClick={resetErrorBoundary} style={{
                marginTop: 8,
                borderRadius: 4,
                background: "var(--color-primary-border)",
                border: "none",
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                color: "var(--color-text)",
            }}>
              Opnieuw proberen
            </button>
          </Banner>)} resetKeys={[profiel]}>
        <ResultBandsPanel profiel={profiel} summary={summary}/>
      </ErrorBoundary>

      {toonCsvPaneel && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="csv-modal-title" style={{
                position: "fixed",
                inset: 0,
                background: "rgba(19,31,55,0.38)",
                zIndex: 190,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "72px 20px 24px",
                overflowY: "auto",
            }} onClick={(e) => {
                if (e.target === e.currentTarget)
                    setToonCsvPaneel(false);
            }}>
          <div style={{
                width: "min(680px, 100%)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-lg)",
                padding: 18,
            }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
            }}>
              <div>
                <h2 id="csv-modal-title" style={{
                    margin: 0,
                    color: "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 0,
                }}>
                  CSV import/export
                </h2>
                <p style={{
                    margin: "3px 0 0",
                    color: "var(--color-text-muted)",
                    fontSize: 12,
                    fontFamily: "var(--font-body)",
                }}>
                  Development-tool voor profielbestanden.
                </p>
              </div>
              <button type="button" onClick={() => setToonCsvPaneel(false)} aria-label="CSV import/export sluiten" style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <X size={16}/>
              </button>
            </div>
            <CsvPaneel exportNaam={exportNaam} setExportNaam={setExportNaam} commentaar={commentaar} setCommentaar={setCommentaar} status={csvStatus} fileInputRef={fileInputRef} onImport={(file) => void importeerCsvBestand(file)} onExport={exporteerCsv}/>
          </div>
        </div>, document.body)}

      
      {toonOverzicht && createPortal(<div className="print-modal-overlay werknemer-overzicht-modal-overlay" style={{
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
                    setToonOverzicht(false);
            }}>
          <div style={{ maxWidth: 900, width: "100%", position: "relative" }}>
            <button type="button" onClick={() => setToonOverzicht(false)} style={{
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
            <WerknemerOverzicht profiel={profiel}/>
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16,
                gap: 8,
            }}>
              <button type="button" onClick={() => window.print()} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-primary)",
                background: "var(--color-primary)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
            }}>
                <Printer size={14}/>
                Print / Opslaan als PDF
              </button>
              <button type="button" onClick={() => setToonOverzicht(false)} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-primary-border)",
                background: "var(--color-surface)",
                color: "var(--color-primary)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
            }}>
                Sluiten
              </button>
            </div>
          </div>
        </div>, document.body)}
    </div>);
}
