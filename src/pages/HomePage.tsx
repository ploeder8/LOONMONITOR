import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ErrorBoundary } from "react-error-boundary";
import { FileText, Printer, X } from "lucide-react";
import { Banner } from "@/components/Banner";
import { DirectionToggle } from "@/components/DirectionToggle";
import { HeroSummary } from "@/components/HeroSummary";
import { useSharedProfiel } from "@/lib/useSharedProfiel";
import { normaliseerProfiel, refDatumVoorMaand, type BerekeningsRichting, type Profiel, } from "@/lib/profiel";
import { normaliseerCsvBestandsnaam, profielNaarCsv, profielUitCsv, standaardCsvNaamPrefix, } from "@/lib/profielCsv";
import { berekenNettoVoorProfiel, zoekBrutoVoorProfielDoelNetto, } from "@/lib/profielBerekeningen";
import { CsvPaneel } from "@/pages/home/CsvPaneel";
import { WerknemerOverzicht } from "@/pages/home/WerknemerOverzicht";
import { computeSummary, ResultBandsPanel } from "@/pages/home/ResultatenPanel";
import type { ProfielSetter, ProfielUpdate } from "@/pages/home/types";
import { ProfielEditor } from "@/pages/profiel/ProfielEditor";
export { waardeUitNumeriekeInput } from "@/pages/home/FormControls";
export function HomePage() {
    const [p, setP] = useSharedProfiel();
    const [exportNaam, setExportNaam] = useState(() => standaardCsvNaamPrefix());
    const [commentaar, setCommentaar] = useState("");
    const [csvStatus, setCsvStatus] = useState<{
        kind: "success" | "error";
        tekst: string;
    } | null>(null);
    const [toonOverzicht, setToonOverzicht] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profiel = normaliseerProfiel(p);
    useEffect(() => {
        if (toonOverzicht) {
            document.body.classList.add("print-modal-open");
            return () => document.body.classList.remove("print-modal-open");
        }
    }, [toonOverzicht]);
    const set = ((kOfUpdate: keyof Profiel | ProfielUpdate, v?: Profiel[keyof Profiel]) => {
        setP((prev) => {
            const basis = normaliseerProfiel(prev);
            if (typeof kOfUpdate === "function")
                return kOfUpdate(basis);
            if (typeof kOfUpdate === "object")
                return { ...basis, ...kOfUpdate };
            return { ...basis, [kOfUpdate]: v };
        });
    }) as ProfielSetter;
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
    return (<div className="home-layout" style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <CsvPaneel exportNaam={exportNaam} setExportNaam={setExportNaam} commentaar={commentaar} setCommentaar={setCommentaar} status={csvStatus} fileInputRef={fileInputRef} onImport={(file) => void importeerCsvBestand(file)} onExport={exporteerCsv}/>

      <DirectionToggle value={profiel.berekeningsRichting} onChange={setBerekeningsRichting}/>

      <HeroSummary brutoloon={summary.bruto} nettoloon={summary.netto} werkgeverskost={summary.werkgeverskost} loonwig={summary.loonwig}/>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button type="button" onClick={() => setToonOverzicht(true)} style={{
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
          <FileText size={14}/>
          Print overzicht
        </button>
      </div>

      <ProfielEditor profiel={profiel} set={set}/>

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
          </Banner>)} resetKeys={[JSON.stringify(profiel)]}>
        <ResultBandsPanel profiel={profiel}/>
      </ErrorBoundary>

      
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
