import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Banner } from "@/components/Banner";
import { DirectionToggle } from "@/components/DirectionToggle";
import { HeroSummary } from "@/components/HeroSummary";
import {
  DEFAULTS,
  normaliseerProfiel,
  refDatumVoorMaand,
  type BerekeningsRichting,
  type Profiel,
} from "@/lib/profiel";
import {
  normaliseerCsvBestandsnaam,
  profielNaarCsv,
  profielUitCsv,
  standaardCsvNaamPrefix,
} from "@/lib/profielCsv";
import {
  berekenNettoVoorProfiel,
  zoekBrutoVoorProfielDoelNetto,
} from "@/lib/profielBerekeningen";
import { CsvPaneel } from "@/pages/home/CsvPaneel";
import { InputCockpit } from "@/pages/home/InputCockpit";
import { computeSummary, ResultBandsPanel } from "@/pages/home/ResultatenPanel";

export { waardeUitNumeriekeInput } from "@/pages/home/FormControls";

export function HomePage() {
  const [p, setP] = useState<Profiel>(DEFAULTS);
  const [exportNaam, setExportNaam] = useState(() => standaardCsvNaamPrefix());
  const [commentaar, setCommentaar] = useState("");
  const [csvStatus, setCsvStatus] = useState<{ kind: "success" | "error"; tekst: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profiel = normaliseerProfiel(p);

  function set<K extends keyof Profiel>(k: K, v: Profiel[K]) {
    setP((prev) => ({ ...normaliseerProfiel(prev), [k]: v }));
  }

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
    if (!file) return;
    try {
      const parsed = profielUitCsv(await file.text());
      setP(normaliseerProfiel(parsed.profiel));
      setCommentaar(parsed.commentaar);
      setCsvStatus({ kind: "success", tekst: "CSV geïmporteerd. Outputkolommen zijn genegeerd." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "CSV kon niet worden gelezen.";
      setCsvStatus({ kind: "error", tekst: message });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setBerekeningsRichting(richting: BerekeningsRichting) {
    if (richting === profiel.berekeningsRichting) return;
    if (richting === "netto_naar_bruto") {
      const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
      const netto = berekenNettoVoorProfiel(profiel, refDatum);
      setP((prev) => ({
        ...normaliseerProfiel(prev),
        berekeningsRichting: richting,
        doelNettoloon: netto.nettoloon,
      }));
    } else {
      setP((prev) => ({ ...normaliseerProfiel(prev), berekeningsRichting: richting }));
    }
  }

  // Root-finding voor netto → bruto modus
  useEffect(() => {
    if (profiel.berekeningsRichting !== "netto_naar_bruto") return;
    if (profiel.statuut !== "bediende") return;

    const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
    const inverse = zoekBrutoVoorProfielDoelNetto(profiel, refDatum);

    if (
      inverse.gevondenBruto !== null &&
      Math.abs(inverse.gevondenBruto - profiel.brutoloon) > 0.01
    ) {
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

  return (
    <div
      className="home-layout"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}
    >
      <CsvPaneel
        exportNaam={exportNaam}
        setExportNaam={setExportNaam}
        commentaar={commentaar}
        setCommentaar={setCommentaar}
        status={csvStatus}
        fileInputRef={fileInputRef}
        onImport={(file) => void importeerCsvBestand(file)}
        onExport={exporteerCsv}
      />

      <DirectionToggle
        value={profiel.berekeningsRichting}
        onChange={setBerekeningsRichting}
      />

      <HeroSummary
        brutoloon={summary.bruto}
        nettoloon={summary.netto}
        werkgeverskost={summary.werkgeverskost}
        loonwig={summary.loonwig}
      />

      <InputCockpit profiel={profiel} set={set} />

      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Banner kind="error" title="Onverwachte fout">
            <p>{(error as Error).message}</p>
            <button
              onClick={resetErrorBoundary}
              style={{
                marginTop: 8,
                borderRadius: 4,
                background: "var(--color-primary-border)",
                border: "none",
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                color: "var(--color-text)",
              }}
            >
              Opnieuw proberen
            </button>
          </Banner>
        )}
        resetKeys={[JSON.stringify(profiel)]}
      >
        <ResultBandsPanel profiel={profiel} />
      </ErrorBoundary>
    </div>
  );
}
