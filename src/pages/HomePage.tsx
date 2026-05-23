import { useEffect, useMemo, useRef, useState, type CSSProperties, type InputHTMLAttributes } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Calculator,
  Bike,
  Train,
  Bus,
  Car,
  Wallet,
  Briefcase,
  Map as MapIcon,
  Building2,
  HelpCircle,
  Download,
  Upload,
  User,
  Euro,
  Receipt,
  Shield,
} from "lucide-react";

import { Banner } from "@/components/Banner";
import { ResultCard } from "@/components/ResultCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { AuditOpenProvider, AuditSourceGroup, type AuditForceState } from "@/components/AuditPanel";
import { ResultBand } from "@/components/ResultBand";
import {
  type JumpAnchor,
} from "@/components/ResultsSummaryStrip";
import type { BerekeningsRichting } from "@/components/BerekeningsRichtingToggle";
import { DirectionToggle } from "@/components/DirectionToggle";
import { HeroSummary } from "@/components/HeroSummary";
import { CockpitCard } from "@/components/CockpitCard";
import { CockpitAccordion } from "@/components/CockpitAccordion";
import { brutolocheck, lookupBarema, lookupStudentenbarema } from "@/lib/baremas";
import type { BaremaCat, Schaal, StudentenCat } from "@/lib/baremas";
import {
  berekenWoonwerkVerkeer,
  type WoonwerkVerkeerResultaat,
} from "@/lib/woonwerkVerkeer";
import {
  vaaBedrijfswagen,
  type BrandstofBedrijfswagen,
  type VaaBedrijfswagenResultaat,
} from "@/lib/vaaBedrijfswagen";
import {
  vaaForfaitsWerkmiddelen,
  type VaaForfaitsWerkmiddelenResultaat,
} from "@/lib/vaaForfaits";
import {
  berekenJaaroverzicht,
  type JaarcomponentNetto,
  type JaaroverzichtResultaat,
} from "@/lib/jaaroverzicht";
import { berekenNetto } from "@/lib/netto";
import type { GezinsType, NettoResultaat } from "@/lib/netto";
import { zoekBrutoVoorNetto } from "@/lib/nettoNaarBruto";
import {
  MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
  werkgeverskost,
  loonwig,
  type WerkgeverskostResultaat,
} from "@/lib/werkgeverskost";
import {
  BaremaBuitenSchaalError,
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
  PC200DatasetError,
} from "@/lib/errors";
import { formatEUR, round2 } from "@/lib/money";
import {
  normaliseerCsvBestandsnaam,
  profielNaarCsv,
  profielUitCsv,
  standaardCsvNaamPrefix,
} from "@/lib/profielCsv";
import { berekenWoonwerkVrijgesteld } from "@/lib/profielBerekeningen";

type Statuut = "bediende" | "student";
type BeroepskostMethode = "forfaitair" | "reeel";
type ProfielSetter = <K extends keyof Profiel>(k: K, v: Profiel[K]) => void;

function berekenMaaltijdchequeWaarde({
  werkgeversaandeelPerDag,
  werknemersbijdragePerDag,
  werkdagen,
}: {
  werkgeversaandeelPerDag: number;
  werknemersbijdragePerDag: number;
  werkdagen: number;
}) {
  const werkgeversaandeel = Math.min(
    werkgeversaandeelPerDag,
    MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
  );
  const totaleWaardePerDag = round2(werkgeversaandeel + werknemersbijdragePerDag);
  const totaleWaarde = round2(totaleWaardePerDag * Math.max(werkdagen, 0));

  return {
    totaleWaardePerDag,
    totaleWaarde,
    werkdagen: Math.max(werkdagen, 0),
  };
}

function HelpTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center justify-center ml-1 cursor-help align-middle"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <span
          className="text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          ?
        </span>
      </span>
      {visible && pos && (
        <span
          className="fixed -translate-x-1/2 mt-1 w-64 p-2 text-xs rounded shadow-lg"
          style={{
            top: pos.top,
            left: pos.left,
            backgroundColor: "#1f2937",
            color: "white",
            zIndex: 9999,
          }}
        >
          {text}
        </span>
      )}
    </>
  );
}

interface Profiel {
  berekeningsRichting: BerekeningsRichting;
  statuut: Statuut;
  schaal: Schaal;
  cat: BaremaCat;
  ervaringJaren: number;
  studentenCat: StudentenCat;
  studentLeeftijd: number;
  brutoloon: number;
  doelNettoloon: number;
  bouwVlag: boolean;
  berekeningsMaand: string;
  berekeningsJaar: string;
  ancienniteitMaanden: number;
  prestatieMaanden: number;
  tewerkstellingsbreuk: number;
  woonwerkFiets: boolean;
  woonwerkPrivewagen: boolean;
  woonwerkBusTramMetro: boolean;
  woonwerkTrein: boolean;
  woonwerkBedrijfswagen: boolean;
  kmPerDag: number;
  treinKm: number;
  busTramMetroKm: number;
  busTramMetroPrijs: number;
  privewagenKm: number;
  bedrijfswagenCataloguswaarde: number;
  bedrijfswagenDatumEersteInschrijving: string;
  bedrijfswagenBrandstof: BrandstofBedrijfswagen;
  bedrijfswagenCo2: number;
  arbeidsdagenPerMaand: number;
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  fiscaalAlleenstaandeMetKind: boolean;
  groepsverzekeringEigenBijdrage: number;
  vaaPcLaptopActief: boolean;
  vaaGsmSmartphoneActief: boolean;
  vaaInternetActief: boolean;
  vaaGsmAbonnementActief: boolean;
  woonwerkPrivewagenBeroepskostMethode: BeroepskostMethode;
  woonwerkBedrijfswagenBeroepskostMethode: BeroepskostMethode;
  // Werkgeversbijdragen (extralegale voordelen)
  arbeidsongevallenPct: number;
  extraGroepsverzekering: number;
  maaltijdchequesActief: boolean;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  extraHospitalisatie: number;
  hospitalisatieEigenBijdrage: number;
  onkostenvergoedingPerMaand: number;
  gemeentebelastingPct: number;
}

const DEFAULTS: Profiel = {
  berekeningsRichting: "bruto_naar_netto",
  statuut: "bediende",
  schaal: "I",
  cat: "A",
  ervaringJaren: 5,
  studentenCat: "A",
  studentLeeftijd: 17,
  brutoloon: 3000,
  doelNettoloon: 1800,
  bouwVlag: false,
  berekeningsMaand: "06",
  berekeningsJaar: "2026",
  ancienniteitMaanden: 12,
  prestatieMaanden: 12,
  tewerkstellingsbreuk: 1,
  woonwerkFiets: false,
  woonwerkPrivewagen: false,
  woonwerkBusTramMetro: false,
  woonwerkTrein: false,
  woonwerkBedrijfswagen: false,
  kmPerDag: 8,
  treinKm: 15,
  busTramMetroKm: 10,
  busTramMetroPrijs: 60,
  privewagenKm: 15,
  bedrijfswagenCataloguswaarde: 40000,
  bedrijfswagenDatumEersteInschrijving: "2026-01-01",
  bedrijfswagenBrandstof: "benzine",
  bedrijfswagenCo2: 100,
  arbeidsdagenPerMaand: aantalWeekdagenInMaand("2026", "06"),
  gezinstype: "alleenstaand",
  kinderenTenLaste: 0,
  fiscaalAlleenstaandeMetKind: false,
  groepsverzekeringEigenBijdrage: 0,
  vaaPcLaptopActief: false,
  vaaGsmSmartphoneActief: false,
  vaaInternetActief: false,
  vaaGsmAbonnementActief: false,
  woonwerkPrivewagenBeroepskostMethode: "forfaitair",
  woonwerkBedrijfswagenBeroepskostMethode: "forfaitair",
  arbeidsongevallenPct: 0.003,
  extraGroepsverzekering: 0,
  maaltijdchequesActief: false,
  maaltijdchequeWerkgeversaandeelPerDag: MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
  maaltijdchequeWerknemersbijdragePerDag: 1.09,
  extraHospitalisatie: 0,
  hospitalisatieEigenBijdrage: 0,
  onkostenvergoedingPerMaand: 0,
  gemeentebelastingPct: 7.3,
};

export function aantalWeekdagenInMaand(berekeningsJaar: string, berekeningsMaand: string): number {
  const jaar = parseInt(berekeningsJaar, 10);
  const maandIndex = parseInt(berekeningsMaand, 10) - 1;
  if (!Number.isFinite(jaar) || !Number.isFinite(maandIndex)) return 0;

  let dagen = 0;
  const datum = new Date(Date.UTC(jaar, maandIndex, 1));
  while (datum.getUTCMonth() === maandIndex) {
    const weekdag = datum.getUTCDay();
    if (weekdag !== 0 && weekdag !== 6) dagen += 1;
    datum.setUTCDate(datum.getUTCDate() + 1);
  }
  return dagen;
}

export function refDatumVoorMaand(
  berekeningsJaar: string | undefined,
  berekeningsMaand: string | undefined,
): string {
  if (berekeningsMaand && /^\d{4}-\d{2}$/.test(berekeningsMaand)) {
    return `${berekeningsMaand}-01`;
  }
  return `${berekeningsJaar ?? DEFAULTS.berekeningsJaar}-${berekeningsMaand ?? DEFAULTS.berekeningsMaand}-01`;
}

export function tewerkstellingsbreukNaarPercentage(tewerkstellingsbreuk: number): number {
  return tewerkstellingsbreuk * 100;
}

export function percentageNaarTewerkstellingsbreuk(percentage: number): number {
  return percentage / 100;
}

type NumeriekeInputModus = "float" | "int";

export function waardeUitNumeriekeInput(
  invoer: string,
  modus: NumeriekeInputModus,
): number | null {
  if (invoer.trim() === "") return null;
  const waarde = modus === "int" ? parseInt(invoer, 10) : parseFloat(invoer);
  return Number.isFinite(waarde) ? waarde : null;
}

interface NumeriekeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
  modus?: NumeriekeInputModus;
  legeWaarde?: number;
  formatValue?: (value: number) => string;
}

function NumeriekeInput({
  value,
  onValueChange,
  modus = "float",
  legeWaarde = 0,
  formatValue = String,
  onFocus,
  onBlur,
  ...props
}: NumeriekeInputProps) {
  const [draft, setDraft] = useState(() => formatValue(value));
  const [heeftFocus, setHeeftFocus] = useState(false);

  useEffect(() => {
    if (!heeftFocus) setDraft(formatValue(value));
  }, [formatValue, heeftFocus, value]);

  return (
    <input
      {...props}
      type="number"
      value={draft}
      onFocus={(e) => {
        setHeeftFocus(true);
        onFocus?.(e);
      }}
      onChange={(e) => {
        const volgendeDraft = e.target.value;
        setDraft(volgendeDraft);
        const volgendeWaarde = waardeUitNumeriekeInput(volgendeDraft, modus);
        if (volgendeWaarde !== null) onValueChange(volgendeWaarde);
      }}
      onBlur={(e) => {
        setHeeftFocus(false);
        if (draft.trim() === "") {
          onValueChange(legeWaarde);
          setDraft(formatValue(legeWaarde));
        }
        onBlur?.(e);
      }}
    />
  );
}

export function eindejaarspremieMaandenVoorCheckbox(eindejaarspremieAan: boolean): Pick<
  Profiel,
  "ancienniteitMaanden" | "prestatieMaanden"
> {
  const maanden = eindejaarspremieAan ? 12 : 0;
  return {
    ancienniteitMaanden: maanden,
    prestatieMaanden: maanden,
  };
}

function normaliseerProfiel(profiel: Profiel): Profiel {
  if (/^\d{4}-\d{2}$/.test(profiel.berekeningsMaand)) {
    const [berekeningsJaar, berekeningsMaand] = profiel.berekeningsMaand.split("-");
    return {
      ...profiel,
      berekeningsJaar: profiel.berekeningsJaar ?? berekeningsJaar,
      berekeningsMaand,
    };
  }
  if (!profiel.berekeningsJaar) {
    return { ...profiel, berekeningsJaar: DEFAULTS.berekeningsJaar };
  }
  return profiel;
}

function heeftMaaltijdcheques(profiel: Pick<Profiel, "maaltijdchequesActief">): boolean {
  return profiel.maaltijdchequesActief;
}

interface MobiliteitBerekening {
  woonwerk: WoonwerkVerkeerResultaat;
  vaaBedrijfswagen: VaaBedrijfswagenResultaat | null;
}

function berekenVaaWerkmiddelenVoorProfiel(
  p: Profiel,
  refDatum: string,
): VaaForfaitsWerkmiddelenResultaat {
  return vaaForfaitsWerkmiddelen({
    pcLaptopActief: p.vaaPcLaptopActief,
    gsmSmartphoneActief: p.vaaGsmSmartphoneActief,
    internetActief: p.vaaInternetActief,
    gsmAbonnementActief: p.vaaGsmAbonnementActief,
    refDatum,
  });
}

function berekenMobiliteitVoorProfiel(
  p: Profiel,
  refDatum: string,
  brutoloonOverride?: number,
): MobiliteitBerekening {
  const werkdagenInMaand = aantalWeekdagenInMaand(p.berekeningsJaar, p.berekeningsMaand);
  const woonwerk = berekenWoonwerkVerkeer({
    refDatum,
    brutoloon: brutoloonOverride ?? p.brutoloon,
    arbeidsdagenPerMaand: p.arbeidsdagenPerMaand,
    werkdagenInMaand,
    fiets: { actief: p.woonwerkFiets, kmPerDag: p.kmPerDag },
    trein: { actief: p.woonwerkTrein, kmEnkel: p.treinKm },
    busTramMetro: {
      actief: p.woonwerkBusTramMetro,
      kmEnkel: p.busTramMetroKm,
      prijsPerMaand: p.busTramMetroPrijs,
    },
    privewagen: { actief: p.woonwerkPrivewagen, kmEnkel: p.privewagenKm },
  });
  const vaa = p.woonwerkBedrijfswagen
    ? vaaBedrijfswagen({
        cataloguswaarde: p.bedrijfswagenCataloguswaarde,
        datumEersteInschrijving: p.bedrijfswagenDatumEersteInschrijving,
        brandstof: p.bedrijfswagenBrandstof,
        co2: p.bedrijfswagenCo2,
        refDatum,
      })
    : null;
  return { woonwerk, vaaBedrijfswagen: vaa };
}

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
    const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum);
    const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);
    const maaltijdchequesActief = heeftMaaltijdcheques(profiel);

    const inverse = zoekBrutoVoorNetto({
      doelNettoloon: profiel.doelNettoloon,
      refDatum,
      bouwVlag: profiel.bouwVlag,
      gezinstype: profiel.gezinstype,
      kinderenTenLaste: profiel.kinderenTenLaste,
      fiscaalAlleenstaandeMetKind: profiel.fiscaalAlleenstaandeMetKind,
      groepsverzekeringEigenBijdrage: profiel.groepsverzekeringEigenBijdrage,
      maaltijdchequeWerknemersbijdragePerDag: maaltijdchequesActief
        ? profiel.maaltijdchequeWerknemersbijdragePerDag
        : 0,
      maaltijdchequeWerkdagen: maaltijdchequesActief ? profiel.arbeidsdagenPerMaand : 0,
      hospitalisatieEigenBijdrage: profiel.hospitalisatieEigenBijdrage,
      onkostenvergoedingPerMaand: profiel.onkostenvergoedingPerMaand,
      woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(
        mobiliteit.woonwerk,
        profiel.woonwerkPrivewagenBeroepskostMethode,
      ),
      vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
      vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
    });

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
      <CsvImportExportPanel
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

// ─── Accordion helper ────────────────────────────────────────────────────────

function FormSection({
  label,
  icon,
  defaultOpen = false,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          background: open ? "var(--color-navy-50)" : "var(--color-background)",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
          gap: 8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-border)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "var(--color-navy-50)" : "var(--color-background)")}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-navy-500)",
            fontFamily: "var(--font-display)",
            letterSpacing: 0,
          }}
        >
          {icon && <span style={{ color: "var(--color-text-muted)" }}>{icon}</span>}
          {label}
        </span>
        {open
          ? <ChevronUp size={14} style={{ color: "var(--color-text-muted)" }} />
          : <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
        }
      </button>
      {open && (
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--color-surface)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const miniButtonStyle: CSSProperties = {
  border: "1px solid var(--color-primary-border)",
  borderRadius: "var(--radius-md)",
  background: "var(--color-primary-soft)",
  color: "var(--color-primary)",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 9px",
};

function maaltijdchequeToggleStyle(actief: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: `1px solid ${actief ? "var(--color-primary-border)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    background: actief ? "var(--color-primary-soft)" : "var(--color-navy-50)",
    color: actief ? "var(--color-primary)" : "var(--color-navy-500)",
    cursor: "pointer",
    fontSize: 13,
    padding: "9px 10px",
  };
}

function CheckboxLine({
  checked,
  label,
  icon,
  onChange,
}: {
  checked: boolean;
  label: string;
  icon: React.ReactNode;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 13,
        color: "var(--color-navy-500)",
        cursor: "pointer",
        background: checked ? "var(--color-primary-soft)" : "var(--color-surface)",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
      />
      <span style={{ display: "inline-flex", color: "var(--color-primary)" }}>{icon}</span>
      <span>{label}</span>
    </label>
  );
}

type BaremaInlineResult =
  | { kind: "checked"; check: ReturnType<typeof brutolocheck> }
  | { kind: "error"; message: string };

function BaremaInlineCheck({ profiel }: { profiel: Profiel }) {
  const result = berekenBaremaInlineCheck(profiel);

  if (result.kind === "error") {
    return (
      <Banner kind="warning" title="Barema-check niet beschikbaar">
        {result.message}
      </Banner>
    );
  }

  return <BaremaInlineCheckCard profiel={profiel} check={result.check} />;
}

function berekenBaremaInlineCheck(profiel: Profiel): BaremaInlineResult {
  const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);

  try {
    return {
      kind: "checked",
      check: brutolocheck(
        profiel.schaal,
        profiel.cat,
        profiel.ervaringJaren,
        profiel.brutoloon,
        refDatum,
        profiel.tewerkstellingsbreuk,
      ),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Barema kon niet worden gecontroleerd.";
    return { kind: "error", message };
  }
}

function BaremaInlineCheckCard({
  profiel,
  check,
}: {
  profiel: Profiel;
  check: ReturnType<typeof brutolocheck>;
}) {
  const isDeeltijds = check.vergelijkingsbasis === "deeltijds_omgerekend";

  return (
    <div style={baremaInlineStyle(check.ok)}>
      <BaremaInlineHeader
        profiel={profiel}
        minimum={check.sectoraalMinimum}
        effectieveErvaring={check.effectieveErvaring}
      />
      {check.ok ? (
        <span>
          {isDeeltijds
            ? "Voltijds equivalent voldoet aan het sectoraal minimum."
            : "Brutoloon voldoet aan het sectoraal minimum."}
        </span>
      ) : (
        <span style={{ fontWeight: 600 }}>
          {isDeeltijds ? "Voltijds equivalent" : "Brutoloon"} ligt{" "}
          {formatEUR(Math.abs(check.verschil))} onder het minimum.
        </span>
      )}
      {isDeeltijds && (
        <span>
          Werkelijk bruto {formatEUR(check.opgegevenBruto)} · voltijds equivalent{" "}
          {formatEUR(check.voltijdsEquivalentBruto)} · pro-rata minimum{" "}
          {formatEUR(check.proRataMinimum)}.
        </span>
      )}
      {check.geclampt && <BaremaClampNote ok={check.ok} />}
    </div>
  );
}

function BaremaInlineHeader({
  profiel,
  minimum,
  effectieveErvaring,
}: {
  profiel: Profiel;
  minimum: number;
  effectieveErvaring: number;
}) {
  const ervaringLabel = profiel.ervaringJaren === effectieveErvaring
    ? `${profiel.ervaringJaren} jaar`
    : `${profiel.ervaringJaren} jaar (barema ${effectieveErvaring} jaar)`;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontWeight: 600 }}>
        Minimum Schaal {profiel.schaal} · Cat {profiel.cat} · {ervaringLabel}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
        {formatEUR(minimum)}
      </span>
    </div>
  );
}

function BaremaClampNote({ ok }: { ok: boolean }) {
  return (
    <span style={{ color: ok ? "var(--color-text-muted)" : "#7f1d1d" }}>
      Loonplafond bereikt: de barematabel gebruikt de hoogste beschikbare ervaring.
    </span>
  );
}

function baremaInlineStyle(ok: boolean): CSSProperties {
  return {
    border: `1px solid ${ok ? "var(--color-border)" : "#fca5a5"}`,
    borderRadius: 8,
    background: ok ? "var(--color-navy-50)" : "#fff1f2",
    color: ok ? "var(--color-navy-500)" : "#991b1b",
    padding: "9px 10px",
    fontSize: 12,
    display: "grid",
    gap: 4,
  };
}

// ─── ProfileForm ─────────────────────────────────────────────────────────────

function CsvImportExportPanel({
  exportNaam,
  setExportNaam,
  commentaar,
  setCommentaar,
  status,
  fileInputRef,
  onImport,
  onExport,
}: {
  exportNaam: string;
  setExportNaam: (waarde: string) => void;
  commentaar: string;
  setCommentaar: (waarde: string) => void;
  status: { kind: "success" | "error"; tekst: string } | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImport: (file: File | null) => void;
  onExport: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 10,
        display: "grid",
        gap: 10,
        background: "var(--color-navy-50)",
      }}
    >
      <FormField label="Exportnaam">
        <input
          className={inputClass}
          value={exportNaam}
          onChange={(e) => setExportNaam(e.target.value)}
        />
      </FormField>
      <FormField label="Commentaar">
        <textarea
          className={inputClass}
          rows={3}
          value={commentaar}
          onChange={(e) => setCommentaar(e.target.value)}
          style={{ resize: "vertical", minHeight: 76 }}
        />
      </FormField>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => onImport(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={miniButtonStyle}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Upload size={13} />
            Importeer CSV
          </span>
        </button>
        <button type="button" onClick={onExport} style={miniButtonStyle}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Download size={13} />
            Exporteer CSV
          </span>
        </button>
      </div>
      {status && (
        <div
          style={{
            borderRadius: 8,
            padding: "7px 9px",
            fontSize: 12,
            color: status.kind === "success" ? "var(--color-success-dark)" : "#991b1b",
            background: status.kind === "success" ? "var(--color-mint-soft)" : "#fff1f2",
            border: `1px solid ${status.kind === "success" ? "rgba(28,210,163,0.35)" : "#fca5a5"}`,
          }}
        >
          {status.tekst}
        </div>
      )}
    </div>
  );
}



function WieBenJeCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Wie ben je?" icon={<User size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Statuut">
          <select
            className={selectClass}
            value={profiel.statuut}
            onChange={(e) => set("statuut", e.target.value as Statuut)}
          >
            <option value="bediende">Bediende</option>
            <option value="student">Student</option>
          </select>
        </FormField>

        {profiel.statuut === "bediende" ? (
          <>
            <FormField
              label={<>Gezinstype (voor BV) <HelpTooltip text="Een partner is fiscaal niet ten laste. Bij geen of beperkt beroepsinkomen past de BV-berekening Schaal II toe, wat de bedrijfsvoorheffing verlaagt en het geraamde nettoloon verhoogt." /></>}
            >
              <select
                className={selectClass}
                value={profiel.gezinstype}
                onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
              >
                <option value="alleenstaand">Alleenstaand / eenoudergezin</option>
                <option value="gehuwd_met_inkomen">Gehuwd/wettelijk samenwonend - partner met inkomen</option>
                <option value="gehuwd_zonder_inkomen">Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Kinderen ten laste">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  max={12}
                  value={profiel.kinderenTenLaste}
                  modus="int"
                  onValueChange={(waarde) => set("kinderenTenLaste", waarde)}
                />
              </FormField>
            </div>

            {profiel.gezinstype === "alleenstaand" && profiel.kinderenTenLaste > 0 && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-navy-500)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={profiel.fiscaalAlleenstaandeMetKind}
                  onChange={(e) => set("fiscaalAlleenstaandeMetKind", e.target.checked)}
                  style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                />
                Fiscaal alleenstaande ouder (+€52 BV-vermindering)
              </label>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.studentenCat}
                onChange={(e) => set("studentenCat", e.target.value as StudentenCat)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
            <FormField label="Leeftijd">
              <NumeriekeInput
                className={inputClass}
                min={14}
                max={30}
                value={profiel.studentLeeftijd}
                modus="int"
                onValueChange={(waarde) => set("studentLeeftijd", waarde)}
              />
            </FormField>
          </div>
        )}
      </div>
    </CockpitCard>
  );
}

function ArbeidscontextCard({
  profiel,
  set,
  setBerekeningsMaand,
  setBerekeningsJaar,
}: {
  profiel: Profiel;
  set: ProfielSetter;
  setBerekeningsMaand: (maand: string) => void;
  setBerekeningsJaar: (jaar: string) => void;
}) {
  return (
    <CockpitCard title="Arbeidscontext" icon={<Building2 size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {profiel.statuut === "bediende" && (
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Schaal">
              <select
                className={selectClass}
                value={profiel.schaal}
                onChange={(e) => set("schaal", e.target.value as Schaal)}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </select>
            </FormField>
            <FormField label="Categorie">
              <select
                className={selectClass}
                value={profiel.cat}
                onChange={(e) => set("cat", e.target.value as BaremaCat)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </FormField>
            <FormField label="Ervaring">
              <NumeriekeInput
                className={inputClass}
                min={0}
                max={60}
                value={profiel.ervaringJaren}
                modus="int"
                onValueChange={(waarde) => set("ervaringJaren", waarde)}
              />
            </FormField>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Maand">
            <select
              className={selectClass}
              value={profiel.berekeningsMaand}
              onChange={(e) => setBerekeningsMaand(e.target.value)}
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maart</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Augustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </FormField>
          <FormField label="Jaar">
            <select
              className={selectClass}
              value={profiel.berekeningsJaar}
              onChange={(e) => setBerekeningsJaar(e.target.value)}
            >
              <option value="2026">2026</option>
            </select>
          </FormField>
          <FormField
            label={<>Werkdagen <HelpTooltip text="Vooringevuld op basis van weekdagen in de gekozen maand. Aanpasbaar voor feestdagen, verlof of afwijkende prestaties." /></>}
          >
            <NumeriekeInput
              className={inputClass}
              min={0}
              max={31}
              value={profiel.arbeidsdagenPerMaand}
              modus="int"
              onValueChange={(waarde) => set("arbeidsdagenPerMaand", waarde)}
            />
          </FormField>
        </div>

        {profiel.statuut === "bediende" && (
          <FormField label="Tewerkstelling (%)">
            <NumeriekeInput
              className={inputClass}
              step="1"
              min={1}
              max={100}
              value={tewerkstellingsbreukNaarPercentage(profiel.tewerkstellingsbreuk)}
              onValueChange={(waarde) =>
                set("tewerkstellingsbreuk", percentageNaarTewerkstellingsbreuk(waarde))
              }
            />
          </FormField>
        )}
      </div>
    </CockpitCard>
  );
}

function BrutoloonCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Brutoloon" icon={<Euro size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {profiel.statuut === "bediende" && profiel.berekeningsRichting === "bruto_naar_netto" ? (
          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>
        ) : profiel.statuut === "bediende" ? (
          <>
            <FormField label="Gewenst nettoloon (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.doelNettoloon}
                onValueChange={(waarde) => set("doelNettoloon", waarde)}
              />
            </FormField>
            <FormField label="Berekend bruto (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.brutoloon}
                disabled
                onValueChange={() => {}}
              />
            </FormField>
          </>
        ) : (
          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>
        )}

        {profiel.statuut === "bediende" && <BaremaInlineCheck profiel={profiel} />}

        <FormField
          label={<>Onkostenvergoedingen (€/m) <HelpTooltip text="Vrijgestelde netto-vergoeding: verhoogt nettoloon en werkgeverskost, zonder RSZ/BV-basis te wijzigen." /></>}
        >
          <NumeriekeInput
            className={inputClass}
            step="0.01"
            min={0}
            value={profiel.onkostenvergoedingPerMaand}
            onValueChange={(waarde) => set("onkostenvergoedingPerMaand", waarde)}
          />
        </FormField>

        {profiel.statuut === "bediende" && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--color-navy-500)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={profiel.bouwVlag}
              onChange={(e) => set("bouwVlag", e.target.checked)}
              style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
            />
            Bouw-subset (+1,80% pensioen)
          </label>
        )}
      </div>
    </CockpitCard>
  );
}

function WoonWerkCard({
  profiel,
  set,
  setAlleWoonwerk,
}: {
  profiel: Profiel;
  set: ProfielSetter;
  setAlleWoonwerk: (actief: boolean) => void;
}) {
  const toggleFiets = (v: boolean) => {
    set("woonwerkFiets", v);
    if (v) set("woonwerkPrivewagen", false);
  };
  const togglePrivewagen = (v: boolean) => {
    set("woonwerkPrivewagen", v);
    if (v) set("woonwerkFiets", false);
  };

  return (
    <CockpitCard title="Woon-werk verkeer" icon={<Bike size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* ── Werkgeverstussenkomst (vergoeding) ── */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-navy-500)", letterSpacing: 0.3, textTransform: "uppercase" }}>
          Werkgeverstussenkomst
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: -6 }}>
          Vrijgesteld van RSZ en bedrijfsvoorheffing binnen bepaalde grenzen. Telt mee in het nettoloon.
        </p>

        {/* Fiets */}
        <VervoersmiddelRij
          label="Fiets"
          icon={<Bike size={15} />}
          actief={profiel.woonwerkFiets}
          onChange={toggleFiets}
        >
          {profiel.woonwerkFiets && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.kmPerDag}
                onValueChange={(waarde) => set("kmPerDag", waarde)}
                style={{ width: 70, textAlign: "right" }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (totaal)</span>
            </div>
          )}
        </VervoersmiddelRij>

        {/* Privéwagen */}
        <VervoersmiddelRij
          label="Privéwagen"
          icon={<Car size={15} />}
          actief={profiel.woonwerkPrivewagen}
          onChange={togglePrivewagen}
        >
          {profiel.woonwerkPrivewagen && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.privewagenKm}
                  onValueChange={(waarde) => set("privewagenKm", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
              </div>
            </>
          )}
        </VervoersmiddelRij>
        {profiel.woonwerkPrivewagen && (
          <div className="flex items-center gap-3" style={{ paddingLeft: 32, marginTop: -4 }}>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Beroepskost</span>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="privewagen-beroepskost"
                value="forfaitair"
                checked={profiel.woonwerkPrivewagenBeroepskostMethode === "forfaitair"}
                onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "forfaitair")}
              />
              Forfaitair
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name="privewagen-beroepskost"
                value="reeel"
                checked={profiel.woonwerkPrivewagenBeroepskostMethode === "reeel"}
                onChange={() => set("woonwerkPrivewagenBeroepskostMethode", "reeel")}
              />
              Reëel
            </label>
            <HelpTooltip text="Forfaitair: de woon-werkvergoeding is vrijgesteld tot €500/jaar (automatisch verrekend). Reëel: geen automatische vrijstelling op het loon — werkelijke kosten worden manueel op de fiscale fiche opgenomen." />
          </div>
        )}

        {/* Bus / tram / metro */}
        <VervoersmiddelRij
          label="Bus / tram / metro"
          icon={<Bus size={15} />}
          actief={profiel.woonwerkBusTramMetro}
          onChange={(v) => set("woonwerkBusTramMetro", v)}
        >
          {profiel.woonwerkBusTramMetro && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.busTramMetroKm}
                  onValueChange={(waarde) => set("busTramMetroKm", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  value={profiel.busTramMetroPrijs}
                  onValueChange={(waarde) => set("busTramMetroPrijs", waarde)}
                  style={{ width: 70, textAlign: "right" }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>€/m</span>
              </div>
            </>
          )}
        </VervoersmiddelRij>

        {/* Trein */}
        <VervoersmiddelRij
          label="Trein"
          icon={<Train size={15} />}
          actief={profiel.woonwerkTrein}
          onChange={(v) => set("woonwerkTrein", v)}
        >
          {profiel.woonwerkTrein && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.treinKm}
                onValueChange={(waarde) => set("treinKm", waarde)}
                style={{ width: 70, textAlign: "right" }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag (enkele rit)</span>
            </div>
          )}
        </VervoersmiddelRij>

        <p style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 500, marginTop: -4 }}>
          ℹ️ Trein, bus/tram/metro en privéwagen mogen samen als aparte trajectdelen.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button type="button" onClick={() => setAlleWoonwerk(true)} style={miniButtonStyle}>
            Selecteer alle vergoedingen
          </button>
          <button type="button" onClick={() => setAlleWoonwerk(false)} style={miniButtonStyle}>
            Alles wissen
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--color-border)", margin: "6px 0" }} />

        {/* ── Voordeel Alle Aard ── */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-navy-500)", letterSpacing: 0.3, textTransform: "uppercase" }}>
          Voordeel Alle Aard
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: -6 }}>
          Verhoogt de fiscale basis (BV) maar levert geen extra nettoloon op.
        </p>

        {/* Bedrijfswagen */}
        <VervoersmiddelRij
          label="Bedrijfswagen"
          icon={<Car size={15} />}
          actief={profiel.woonwerkBedrijfswagen}
          onChange={(v) => set("woonwerkBedrijfswagen", v)}
        />
        {profiel.woonwerkBedrijfswagen && (
          <div style={{ paddingLeft: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Cataloguswaarde (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                min={0}
                value={profiel.bedrijfswagenCataloguswaarde}
                onValueChange={(waarde) => set("bedrijfswagenCataloguswaarde", waarde)}
              />
            </FormField>
            <FormField label="Eerste inschrijving">
              <input
                className={inputClass}
                type="date"
                value={profiel.bedrijfswagenDatumEersteInschrijving}
                onChange={(e) => set("bedrijfswagenDatumEersteInschrijving", e.target.value)}
              />
            </FormField>
            <FormField label="Brandstof">
              <select
                className={selectClass}
                value={profiel.bedrijfswagenBrandstof}
                onChange={(e) =>
                  set("bedrijfswagenBrandstof", e.target.value as BrandstofBedrijfswagen)
                }
              >
                <option value="diesel">Diesel</option>
                <option value="benzine">Benzine</option>
                <option value="elektriciteit">Elektriciteit</option>
              </select>
            </FormField>
            {profiel.bedrijfswagenBrandstof !== "elektriciteit" && (
              <FormField label="CO₂-waarde">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.bedrijfswagenCo2}
                  onValueChange={(waarde) => set("bedrijfswagenCo2", waarde)}
                />
              </FormField>
            )}
            <div className="flex items-center gap-3" style={{ gridColumn: "1 / -1", paddingLeft: 4 }}>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Berekeningsmethode</span>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="bw-beroepskost"
                  value="forfaitair"
                  checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair"}
                  onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "forfaitair")}
                />
                Forfaitair
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="bw-beroepskost"
                  value="reeel"
                  checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "reeel"}
                  onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "reeel")}
                />
                Reëel
              </label>
              <HelpTooltip text="Forfaitair: de VAA bedrijfswagen wordt opgenomen in de belastbare basis volgens de CO₂-formule. Reëel: de VAA blijft van toepassing; werkelijke beroepskosten worden manueel op de fiscale fiche opgenomen." />
            </div>
          </div>
        )}
      </div>
    </CockpitCard>
  );
}

function VervoersmiddelRij({
  label,
  icon,
  actief,
  onChange,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  actief: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${actief ? "var(--cockpit-toggle-active-border)" : "var(--cockpit-toggle-inactive-border)"}`,
          background: actief ? "var(--cockpit-toggle-active-bg)" : "var(--cockpit-toggle-inactive-bg)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={actief}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
          />
          <span style={{ color: actief ? "var(--color-primary)" : "var(--color-text-muted)", display: "flex" }}>
            {icon}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: actief ? "var(--color-primary)" : "var(--color-navy-500)",
            }}
          >
            {label}
          </span>
        </div>
        {children}
      </label>
    </div>
  );
}

function ExtraLooncomponentenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Shield size={14} /> Verzekeringen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField label="Groepsverz. eigen bijdr. (€/m)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              min={0}
              value={profiel.groepsverzekeringEigenBijdrage}
              onValueChange={(waarde) => set("groepsverzekeringEigenBijdrage", waarde)}
            />
          </FormField>
          <FormField label="Hospitalisatie eigen bijdr. (€/m)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              min={0}
              value={profiel.hospitalisatieEigenBijdrage}
              onValueChange={(waarde) => set("hospitalisatieEigenBijdrage", waarde)}
            />
          </FormField>
        </div>
      </div>

      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Receipt size={14} /> Maaltijdcheques
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--color-navy-500)",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <input
              type="checkbox"
              checked={profiel.maaltijdchequesActief}
              onChange={(e) => set("maaltijdchequesActief", e.target.checked)}
              style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
            />
            <span style={{ fontWeight: 600 }}>Maaltijdcheques toepassen</span>
          </label>
          {profiel.maaltijdchequesActief && (
            <>
              <FormField
                label={<>WG-aandeel (€/dag) <HelpTooltip text={`Max €${MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026.toFixed(2).replace(".", ",")}/dag × ${profiel.arbeidsdagenPerMaand} werkdagen.`} /></>}
              >
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  max={MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026}
                  value={profiel.maaltijdchequeWerkgeversaandeelPerDag}
                  onValueChange={(waarde) => set("maaltijdchequeWerkgeversaandeelPerDag", waarde)}
                />
              </FormField>
              <FormField
                label={<>WN-bijdrage (€/dag) <HelpTooltip text={`Min €1,09/dag × ${profiel.arbeidsdagenPerMaand} werkdagen.`} /></>}
              >
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  value={profiel.maaltijdchequeWerknemersbijdragePerDag}
                  onValueChange={(waarde) => set("maaltijdchequeWerknemersbijdragePerDag", waarde)}
                />
              </FormField>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--cockpit-subsection-bg)",
          borderRadius: "var(--cockpit-subsection-radius)",
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          <Car size={14} /> VAA werkmiddelen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              label: "Laptop / pc",
              checked: profiel.vaaPcLaptopActief,
              onChange: (v: boolean) => set("vaaPcLaptopActief", v),
            },
            {
              label: "GSM",
              checked: profiel.vaaGsmSmartphoneActief,
              onChange: (v: boolean) => set("vaaGsmSmartphoneActief", v),
            },
            {
              label: "Internet",
              checked: profiel.vaaInternetActief,
              onChange: (v: boolean) => set("vaaInternetActief", v),
            },
            {
              label: "GSM-abonnement",
              checked: profiel.vaaGsmAbonnementActief,
              onChange: (v: boolean) => set("vaaGsmAbonnementActief", v),
            },
          ].map((item) => (
            <label
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-navy-500)",
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function WerkgeversbijdragenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
      <FormField
        label={<>Arbeidsongevallen (%) <HelpTooltip text="Burelen: ~0,3%. Controleer uw polis." /></>}
      >
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          max={10}
          value={profiel.arbeidsongevallenPct * 100}
          formatValue={(waarde) => waarde.toFixed(2)}
          onValueChange={(waarde) => set("arbeidsongevallenPct", waarde / 100)}
        />
      </FormField>
      <FormField label="Patronale groepsverzekering (€/m)">
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          value={profiel.extraGroepsverzekering}
          onValueChange={(waarde) => set("extraGroepsverzekering", waarde)}
        />
      </FormField>
      <FormField label="Hospitalisatieverzekering (€/m)">
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          value={profiel.extraHospitalisatie}
          onValueChange={(waarde) => set("extraHospitalisatie", waarde)}
        />
      </FormField>
    </div>
  );
}

function EindejaarspremieCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  const eindejaarspremieAan = profiel.prestatieMaanden > 0;
  return (
    <CockpitCard title="Eindejaarspremie" icon={<Calendar size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--color-navy-500)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={eindejaarspremieAan}
            onChange={(e) => {
              const maanden = eindejaarspremieMaandenVoorCheckbox(e.target.checked);
              set("ancienniteitMaanden", maanden.ancienniteitMaanden);
              set("prestatieMaanden", maanden.prestatieMaanden);
            }}
            style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
          />
          Eindejaarspremie toepassen
        </label>
        {eindejaarspremieAan && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Anciënniteit (maanden)">
              <NumeriekeInput
                className={inputClass}
                min={0}
                max={12}
                value={profiel.ancienniteitMaanden}
                modus="int"
                onValueChange={(waarde) => set("ancienniteitMaanden", waarde)}
              />
            </FormField>
            <FormField label="Prestatie (maanden)">
              <NumeriekeInput
                className={inputClass}
                min={0}
                max={12}
                value={profiel.prestatieMaanden}
                modus="int"
                onValueChange={(waarde) => set("prestatieMaanden", waarde)}
              />
            </FormField>
          </div>
        )}
      </div>
    </CockpitCard>
  );
}


// ─── InputCockpit ────────────────────────────────────────────────────────────

function InputCockpit({
  profiel,
  set,
  csvPanel,
}: {
  profiel: Profiel;
  set: ProfielSetter;
  csvPanel?: React.ReactNode;
}) {
  function setBerekeningsMaand(maand: string) {
    set("berekeningsMaand", maand);
    set("arbeidsdagenPerMaand", aantalWeekdagenInMaand(profiel.berekeningsJaar, maand));
  }

  function setBerekeningsJaar(jaar: string) {
    set("berekeningsJaar", jaar);
    set("arbeidsdagenPerMaand", aantalWeekdagenInMaand(jaar, profiel.berekeningsMaand));
  }

  function setAlleWoonwerk(actief: boolean) {
    if (actief) {
      // Fiets wint bij conflict met privéwagen (meest gunstig voor werknemer)
      set("woonwerkFiets", true);
      set("woonwerkPrivewagen", false);
      set("woonwerkBusTramMetro", true);
      set("woonwerkTrein", true);
      // Bedrijfswagen (VAA) niet aanraken — is een aparte categorie
    } else {
      set("woonwerkFiets", false);
      set("woonwerkPrivewagen", false);
      set("woonwerkBusTramMetro", false);
      set("woonwerkTrein", false);
      set("woonwerkBedrijfswagen", false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
      {csvPanel}

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--cockpit-grid-gap)" }}>
        <WieBenJeCard profiel={profiel} set={set} />
        <ArbeidscontextCard
          profiel={profiel}
          set={set}
          setBerekeningsMaand={setBerekeningsMaand}
          setBerekeningsJaar={setBerekeningsJaar}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--cockpit-grid-gap)" }}>
        <BrutoloonCard profiel={profiel} set={set} />
        <WoonWerkCard profiel={profiel} set={set} setAlleWoonwerk={setAlleWoonwerk} />
      </div>

      <CockpitAccordion
        title="Extra looncomponenten"
        subtitle="Verzekeringen, maaltijdcheques, VAA"
        icon={<Receipt size={16} />}
      >
        <ExtraLooncomponentenContent profiel={profiel} set={set} />
      </CockpitAccordion>

      <CockpitAccordion
        title="Werkgeversbijdragen"
        subtitle="Arbeidsongevallen, groepsverzekering, hospitalisatie"
        icon={<Shield size={16} />}
      >
        <WerkgeversbijdragenContent profiel={profiel} set={set} />
      </CockpitAccordion>

      <EindejaarspremieCard profiel={profiel} set={set} />
    </div>
  );
}

// ─── ResultBandsPanel ─────────────────────────────────────────────────────────

interface ResultSummary {
  bruto: number;
  netto: number | null;
  werkgeverskost: number | null;
  loonwig: number | null;
}

interface ResultBandSpec {
  id: string;
  title: string;
  shortLabel: string;
  icon: React.ReactNode;
  blocks: React.ReactNode[];
}

interface BouwResultaten {
  summary: ResultSummary;
  bands: ResultBandSpec[];
}

function ResultBandsPanel({
  profiel,
}: {
  profiel: Profiel;
}) {
  const [auditForce, setAuditForce] = useState<AuditForceState>(null);
  const { bands } = useMemo(() => bouwResultaten(profiel), [profiel]);

  const anchors: JumpAnchor[] = bands.map((b) => ({ id: b.id, label: b.shortLabel }));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      {/* Compacte toolbar: spring-anchors + audit-toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          padding: "8px 10px",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", fontSize: 12, color: "var(--color-navy-500)" }}>
          <span style={{ color: "var(--color-text-muted)", marginRight: 4 }}>Springen:</span>
          {anchors.map((a, i) => (
            <span key={a.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <a
                href={`#${a.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(a.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: "var(--radius-sm)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {a.label}
              </a>
              {i < anchors.length - 1 && <span style={{ color: "var(--color-navy-300)" }}>·</span>}
            </span>
          ))}
        </div>
        <button
          onClick={() => setAuditForce(auditForce === "all" ? null : "all")}
          style={{
            border: "1px solid var(--color-primary-border)",
            background: auditForce === "all" ? "var(--color-primary)" : "var(--color-surface)",
            color: auditForce === "all" ? "#ffffff" : "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            letterSpacing: 0,
            transition: "background 0.15s",
          }}
        >
          {auditForce === "all" ? "Verberg alle bronnen" : "Toon alle bronnen"}
        </button>
      </div>

      <AuditOpenProvider force={auditForce}>
        {bands.map((b) => (
          <ResultBand key={b.id} id={b.id} title={b.title} icon={b.icon}>
            {b.blocks.map((block, i) => (
              <div key={i}>{block}</div>
            ))}
          </ResultBand>
        ))}
      </AuditOpenProvider>
    </section>
  );
}

// ─── safeRender ──────────────────────────────────────────────────────────────

function safeRender<T>(fn: () => T, render: (r: T) => React.ReactNode): React.ReactNode {
  try {
    return render(fn());
  } catch (e) {
    if (e instanceof DatapuntNietGeldigOpDatum) {
      return (
        <Banner kind="warning" title="Datapunt niet geldig op deze datum">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof DatapuntNietBruikbaar) {
      return (
        <Banner kind="warning" title="Datapunt niet bruikbaar">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof BaremaBuitenSchaalError) {
      return (
        <Banner kind="error" title="Barema-fout">
          <p>{e.message}</p>
        </Banner>
      );
    }
    if (e instanceof PC200DatasetError) {
      return (
        <Banner kind="error" title="Dataset-fout">
          <p>{e.message}</p>
        </Banner>
      );
    }
    return (
      <Banner kind="error" title="Onverwachte fout">
        <p>{(e as Error).message}</p>
      </Banner>
    );
  }
}

// ─── NettoPanel ──────────────────────────────────────────────────────────────

function NettoRow({
  label,
  bedrag,
  prefix = "-",
  variant = "normal",
  dimmed = false,
  onToggle,
  open,
}: {
  label: React.ReactNode;
  bedrag: number;
  prefix?: string;
  variant?: "normal" | "subtotal" | "total";
  dimmed?: boolean;
  onToggle?: () => void;
  open?: boolean;
}) {
  const highlight = variant === "subtotal" || variant === "total";
  const total = variant === "total";
  const content = (
    <>
      {onToggle && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      {label}
    </>
  );

  return (
    <tr
      style={{
        borderBottom: total ? "none" : "1px solid var(--color-navy-50)",
        borderTop: variant === "subtotal" ? "2px solid var(--color-border)" : total ? "2px solid var(--color-primary)" : undefined,
      }}
    >
      <td
        style={{
          padding: total ? "10px 8px 4px 0" : "7px 8px 7px 0",
          color: dimmed ? "var(--color-text-muted)" : highlight ? "var(--color-text)" : "var(--color-navy-500)",
          fontWeight: highlight ? 700 : 400,
          fontSize: highlight ? 15 : 13,
          fontFamily: highlight ? "var(--font-display)" : undefined,
        }}
      >
        {onToggle ? (
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "inherit",
              font: "inherit",
              fontWeight: "inherit",
              textAlign: "left",
            }}
          >
            {content}
          </button>
        ) : (
          content
        )}
      </td>
      <td
        style={{
          padding: total ? "10px 0 4px 8px" : "7px 0 7px 8px",
          textAlign: "right",
          fontFamily: "var(--font-mono)",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "var(--color-primary)" : dimmed ? "var(--color-text-muted)" : "var(--color-text)",
          fontSize: total ? 22 : highlight ? 15 : 13,
        }}
      >
        {prefix !== "" ? `${prefix} ${formatEUR(bedrag)}` : formatEUR(bedrag)}
      </td>
    </tr>
  );
}

function NettoSectionRow({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={2}
        style={{
          padding: "14px 0 5px",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

function NettoDetailRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={2} style={{ padding: "0 0 8px 18px" }}>
        <div
          style={{
            borderLeft: "2px solid var(--color-primary-border)",
            padding: "8px 0 8px 10px",
            color: "var(--color-text-muted)",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {children}
        </div>
      </td>
    </tr>
  );
}

function NettoPanel({
  resultaat: r,
  vaaWerkmiddelen,
  maaltijdchequeWerkgeversaandeelPerDag,
  gemeentebelastingPct,
}: {
  resultaat: NettoResultaat;
  vaaWerkmiddelen?: VaaForfaitsWerkmiddelenResultaat;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  gemeentebelastingPct: number;
}) {
  const [bvDetailOpen, setBvDetailOpen] = useState(false);
  const [vaaDetailOpen, setVaaDetailOpen] = useState(false);
  const totaalTerugnameVaa = r.vaaBedrijfswagenPerMaand + r.vaaRszPlichtigPerMaand;
  const gebruiktSchaalII = r.bv.schaal === "II";
  const maaltijdcheques = berekenMaaltijdchequeWaarde({
    werkgeversaandeelPerDag: maaltijdchequeWerkgeversaandeelPerDag,
    werknemersbijdragePerDag: r.maaltijdchequeWerknemersbijdragePerDag,
    werkdagen: r.maaltijdchequeWerkdagen,
  });
  const nettoloonInclusiefMaaltijdcheques = round2(r.nettoloon + maaltijdcheques.totaleWaarde);

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "2px solid var(--color-primary)",
        background: "var(--color-surface)",
        padding: "1rem 1.1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          letterSpacing: 0,
          marginBottom: 12,
        }}
      >
        Netto berekening (per maand)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Brutoloon" bedrag={r.brutoloon} prefix="" />
          {vaaWerkmiddelen?.lijnen.map((lijn) => (
            <NettoRow key={lijn.datapunt.id} label={`VAA ${lijn.label}`} bedrag={lijn.bedrag} prefix="+" dimmed />
          ))}
          <NettoRow label="Totaal bruto" bedrag={r.brutoRszBasis} prefix="" variant="subtotal" />
          <NettoRow label={`RSZ werknemer (13,07 %)`} bedrag={r.rsz.werknemerBijdrage} />
          {r.werkbonus.totaal > 0 && (
            <NettoRow
              label={`Werkbonus (RSZ-vermindering)`}
              bedrag={r.werkbonus.totaal}
              prefix="+"
              dimmed
            />
          )}
          <NettoRow
            label="Loon na RSZ en werkbonus"
            bedrag={r.belastbaarMaandloon}
            prefix=""
            variant="subtotal"
          />
          <NettoRow
            label="VAA bedrijfswagen"
            bedrag={r.vaaBedrijfswagenPerMaand}
            prefix="+"
            dimmed
          />
          <NettoRow
            label="Belastbaar loon"
            bedrag={r.belastbaarMaandloonVoorBV}
            prefix=""
            variant="subtotal"
          />
          <NettoRow
            label={`Bedrijfsvoorheffing (${r.bv.schaal}, vóór gezinsverminderingen)`}
            bedrag={r.bv.bvPerMaand}
            onToggle={() => setBvDetailOpen(!bvDetailOpen)}
            open={bvDetailOpen}
          />
          {gebruiktSchaalII && (
            <NettoDetailRow>
              Lagere bedrijfsvoorheffing door partner zonder of beperkt beroepsinkomen:
              Schaal II verhoogt de effectieve vrijstelling en verlaagt zo de maandelijkse BV.
            </NettoDetailRow>
          )}
          {bvDetailOpen && (
            <NettoDetailRow>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {[
                    ["Methode", "Berekening volgens wettelijke BV-formule"],
                    ["Schaal", r.bv.schaal],
                    ...(gebruiktSchaalII
                      ? [["Impact Schaal II", "Lagere bedrijfsvoorheffing door partner zonder of beperkt beroepsinkomen"]]
                      : []),
                    ["Belastbaar jaarloon", formatEUR(r.bv.jaarbasis)],
                    ["Forfait beroepskosten (30%, max € 6.070 AJ 2027)", `- ${formatEUR(r.bv.forfaitBeroepskosten)}`],
                    ["Belastbaar netto-inkomen", formatEUR(r.bv.belastbaarNettoJaar)],
                    ["Belastingvrije som BV", formatEUR(r.bv.belastingvrijeSomBv)],
                    ...(r.bv.huwelijksquotient > 0
                      ? [["Huwelijksquotiënt", formatEUR(r.bv.huwelijksquotient)]]
                      : []),
                    ["Basisbelasting BV", formatEUR(r.bv.basisbelastingBruto)],
                    ["Vermindering belastingvrije som", `- ${formatEUR(r.bv.verminderingBelastingvrijeSom)}`],
                    ["Basisbelasting na vermindering", formatEUR(r.bv.basisbelastingNaVerminderingen)],
                    ["BV / maand sleutelformule (vóór gezinsvermindering)", formatEUR(r.bv.bvPerMaand)],
                    ["BV / maand (na gezinsvermindering)", formatEUR(r.bv.bvNaVerminderingen)],
                  ].map(([lbl, val]) => (
                    <tr key={lbl} style={{ borderBottom: "1px solid var(--color-navy-50)" }}>
                      <td style={{ padding: "4px 6px 4px 0", color: "var(--color-text-muted)" }}>{lbl}</td>
                      <td style={{ padding: "4px 0 4px 6px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </NettoDetailRow>
          )}
          {r.bv.verminderingKinderen > 0 && (
            <NettoRow
              label={`BV-vermindering kinderen ten laste`}
              bedrag={r.bv.verminderingKinderen}
              prefix="+"
              dimmed
            />
          )}
          {r.bv.verminderingAlleenstaandeKind > 0 && (
            <NettoRow
              label={`BV-vermindering fiscaal alleenstaande`}
              bedrag={r.bv.verminderingAlleenstaandeKind}
              prefix="+"
              dimmed
            />
          )}
          {r.bv.verminderingGroepsverzekering > 0 && (
            <NettoRow
              label={`BV-vermindering groepsverzekering (30%)`}
              bedrag={r.bv.verminderingGroepsverzekering}
              prefix="+"
              dimmed
            />
          )}
          {r.fiscaleWerkbonus > 0 && (
            <NettoRow
              label={
                <>
                  Fiscale werkbonus{" "}
                  <HelpTooltip text="Berekening volgens de fiscale werkbonusformule: 33,14% × luik A + 52,54% × luik B." />
                </>
              }
              bedrag={r.fiscaleWerkbonus}
              prefix="+"
              dimmed
            />
          )}
          <NettoRow label="BV (na verminderingen)" bedrag={r.bv.bvNaVerminderingen} />
          <NettoSectionRow label="Onkostenvergoedingen en inhoudingen" />
          <NettoRow
            label={
              <>
                Bijzondere bijdrage sociale zekerheid{" "}
                <HelpTooltip text={`BBSZ-scenario: ${r.bbsz.scenarioLabel}. De maandinhouding is gebaseerd op het kwartaalbedrag ${formatEUR(r.bbsz.kwartaalbijdrage)} gedeeld door 3.`} />
              </>
            }
            bedrag={r.bbsz.maandelijksBedrag}
          />
          {r.maaltijdchequeWerknemersbijdrage > 0 && (
            <NettoRow
              label={`Maaltijdcheques werknemersbijdrage (${formatEUR(r.maaltijdchequeWerknemersbijdragePerDag)} × ${r.maaltijdchequeWerkdagen} dagen)`}
              bedrag={r.maaltijdchequeWerknemersbijdrage}
            />
          )}
          {r.woonwerkVrijgesteldPerMaand > 0 && (
            <NettoRow
              label="Woon-werkvergoeding"
              bedrag={r.woonwerkVrijgesteldPerMaand}
              prefix="+"
              dimmed
            />
          )}
          {r.hospitalisatieEigenBijdrage > 0 && (
            <NettoRow
              label="Eigen bijdrage hospitalisatieverzekering"
              bedrag={r.hospitalisatieEigenBijdrage}
            />
          )}
          {r.onkostenvergoedingPerMaand > 0 && (
            <NettoRow
              label="Onkostenvergoedingen"
              bedrag={r.onkostenvergoedingPerMaand}
              prefix="+"
              dimmed
            />
          )}
          <NettoRow
            label="Terugname VAA"
            bedrag={totaalTerugnameVaa}
            onToggle={() => setVaaDetailOpen(!vaaDetailOpen)}
            open={vaaDetailOpen}
          />
          {vaaDetailOpen && (
            <NettoDetailRow>
              <div style={{ display: "grid", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>VAA bedrijfswagen toegevoegd aan BV-basis</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                    + {formatEUR(r.vaaBedrijfswagenPerMaand)}
                  </span>
                </div>
                {vaaWerkmiddelen?.lijnen.map((lijn) => (
                  <div key={lijn.datapunt.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span>VAA {lijn.label} toegevoegd aan bruto RSZ/BV-basis</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                      + {formatEUR(lijn.bedrag)}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>Terugname voordelen alle aard</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                    - {formatEUR(totaalTerugnameVaa)}
                  </span>
                </div>
                <div>
                  Voordelen alle aard verhogen de RSZ- en/of BV-basis, maar worden niet cash uitbetaald.
                </div>
              </div>
            </NettoDetailRow>
          )}
          <NettoRow label="Nettoloon" bedrag={r.nettoloon} prefix="" variant="total" />
          {maaltijdcheques.totaleWaarde > 0 && (
            <NettoRow
              label={`Nettoloon incl. maaltijdcheques (totale waarde ${formatEUR(maaltijdcheques.totaleWaardePerDag)} × ${maaltijdcheques.werkdagen} dagen)`}
              bedrag={nettoloonInclusiefMaaltijdcheques}
              prefix=""
              variant="subtotal"
            />
          )}
          <tr>
            <td
              colSpan={2}
              style={{
                padding: "8px 0",
                fontSize: 12,
                color: "var(--color-text-muted)",
                borderTop: "1px dashed var(--color-border)",
              }}
          >
              Aanvullende gemeentebelasting: geschat{" "}
              {formatEUR(round2((r.nettoloon * 12 * gemeentebelastingPct) / 100))}/jaar{" "}
              <HelpTooltip text={`Indicatieve jaarimpact bij ${gemeentebelastingPct.toFixed(1).replace(".", ",")}% aanvullende gemeentebelasting. Dit bedrag is niet inbegrepen in het maandloon en wordt via de jaarlijkse PB-afrekening verwerkt.`} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Audit bronnen */}
      <AuditSourceGroup
        datapunten={[
          r.werkbonus.datapunt,
          r.bbsz.datapunt,
          ...r.bv.datapunten,
          ...(vaaWerkmiddelen?.datapunten ?? []),
        ]}
      />
    </div>
  );
}

// ─── WerkgeverskostPanel ─────────────────────────────────────────────────────

function WerkgeverskostPanel({
  resultaat: r,
  loonwigPct,
  netto,
  extras,
}: {
  resultaat: WerkgeverskostResultaat;
  loonwigPct: number;
  netto: number;
  extras: {
    arbeidsongevallenPct: number;
    groepsverzekering: number;
    maaltijdcheques: number;
    hospitalisatie: number;
    ecocheques: number;
    woonwerk: number;
    onkostenvergoeding: number;
  };
}) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "2px solid var(--color-primary)",
        background: "var(--color-surface)",
        padding: "1rem 1.1rem",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          letterSpacing: 0,
          marginBottom: 12,
        }}
      >
        Loonkost werkgever (per maand)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Brutoloon" bedrag={r.brutoloon} prefix="" />
          <NettoRow label="RSZ werkgever (~25%)" bedrag={r.rszWerkgever} prefix="+" />
          <NettoRow label="Sociaal Fonds 200 (0,23%)" bedrag={r.sociaalFonds200} prefix="+" />
          {r.bouwAanvullendPensioen !== null && r.bouwAanvullendPensioen > 0 && (
            <NettoRow label="Bouw — aanvullend pensioen (1,80%)" bedrag={r.bouwAanvullendPensioen} prefix="+" />
          )}
          <NettoRow label={`Arbeidsongevallen (${(extras.arbeidsongevallenPct * 100).toFixed(2)} %)`} bedrag={r.arbeidsongevallen} prefix="+" />
          <tr style={{ borderTop: "1px solid var(--color-border)" }}>
            <td style={{ padding: "8px 8px 4px 0", fontWeight: 600, color: "var(--color-navy-500)", fontSize: 13 }}>
              Loonkost zonder voordelen{" "}
              <HelpTooltip text="Loonkost vóór extra voordelen en vergoedingen zoals groepsverzekering, maaltijdcheques, hospitalisatie, woon-werkvergoeding en onkostenvergoedingen." />
            </td>
            <td
              style={{
                padding: "8px 0 4px 8px",
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--color-navy-500)",
                fontSize: 13,
              }}
            >
              {formatEUR(r.totaleLoonkostSmal)}
            </td>
          </tr>
          {extras.groepsverzekering > 0 && (
            <NettoRow label="Patronale groepsverzekering" bedrag={extras.groepsverzekering} prefix="+" dimmed />
          )}
          {extras.maaltijdcheques > 0 && (
            <NettoRow label="Maaltijdcheques (werkgeversaandeel)" bedrag={extras.maaltijdcheques} prefix="+" dimmed />
          )}
          {extras.hospitalisatie > 0 && (
            <NettoRow label="Hospitalisatieverzekering" bedrag={extras.hospitalisatie} prefix="+" dimmed />
          )}
          {extras.woonwerk > 0 && (
            <NettoRow label="Woon-werkvergoeding" bedrag={extras.woonwerk} prefix="+" dimmed />
          )}
          {extras.onkostenvergoeding > 0 && (
            <NettoRow label="Onkostenvergoedingen" bedrag={extras.onkostenvergoeding} prefix="+" dimmed />
          )}
          <tr style={{ borderTop: "2px solid var(--color-primary)" }}>
            <td
              style={{
                padding: "10px 8px 4px 0",
                fontWeight: 700,
                color: "var(--color-text)",
                fontFamily: "var(--font-display)",
                fontSize: 15,
              }}
            >
              Loonkost werkgever per maand
            </td>
            <td
              style={{
                padding: "10px 0 4px 8px",
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "var(--color-primary)",
                fontSize: 22,
              }}
            >
              {formatEUR(r.totaleLoonkostBreed)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Loonwig */}
      <div
        style={{
          marginTop: 14,
          background: "var(--color-primary-soft)",
          border: "1px solid var(--color-primary-border)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13,
          color: "var(--color-text)",
        }}
      >
        <strong>Loonwig: {(loonwigPct * 100).toFixed(1)} %</strong>{" "}
        <HelpTooltip text={`Formule: (totale loonkost ${formatEUR(r.totaleLoonkostBreed)} min netto ${formatEUR(netto)}) gedeeld door totale loonkost.`} />
      </div>

      {/* Audit-bronnen */}
      <AuditSourceGroup datapunten={r.datapunten} />
    </div>
  );
}

function NettoJaaroverzichtPanel({
  jaaroverzicht,
  maaltijdchequeWerkgeversaandeelPerDag,
  maaltijdchequeWerknemersbijdragePerDag,
  maaltijdchequeWerkdagenPerMaand,
}: {
  jaaroverzicht: JaaroverzichtResultaat;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  maaltijdchequeWerkdagenPerMaand: number;
}) {
  const r = jaaroverzicht.netto;
  const maaltijdcheques = berekenMaaltijdchequeWaarde({
    werkgeversaandeelPerDag: maaltijdchequeWerkgeversaandeelPerDag,
    werknemersbijdragePerDag: maaltijdchequeWerknemersbijdragePerDag,
    werkdagen: maaltijdchequeWerkdagenPerMaand * 12,
  });
  const nettoJaarloonInclusiefMaaltijdcheques = round2(
    r.totaalNettoJaarloon + maaltijdcheques.totaleWaarde,
  );
  const datapunten = [
    ...r.eindejaarspremie.datapunten,
    ...r.dubbelVakantiegeld.datapunten,
    ...r.jaarpremie.datapunten,
  ].filter((dp, index, all) => all.findIndex((item) => item.id === dp.id) === index);

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "2px solid var(--color-primary)",
        background: "var(--color-surface)",
        padding: "1rem 1.1rem",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          letterSpacing: 0,
          marginBottom: 12,
        }}
      >
        Netto jaaroverzicht
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Netto maandloon × 12" bedrag={r.maandloonNettoX12} prefix="" variant="subtotal" />
          <JaarComponentRows titel="Eindejaarspremie" component={r.eindejaarspremie} />
          <JaarComponentRows titel="Dubbel vakantiegeld" component={r.dubbelVakantiegeld} />
          <JaarComponentRows titel="Sectorale jaarpremie PC 200" component={r.jaarpremie} />
          <NettoRow label="Ecocheques" bedrag={r.ecocheques} prefix="+" dimmed />
          <NettoRow label="Netto jaarloon" bedrag={r.totaalNettoJaarloon} prefix="" variant="total" />
          {maaltijdcheques.totaleWaarde > 0 && (
            <NettoRow
              label={`Netto jaarloon incl. maaltijdcheques (totale waarde ${formatEUR(maaltijdcheques.totaleWaardePerDag)} × ${maaltijdcheques.werkdagen} werkdagen)`}
              bedrag={nettoJaarloonInclusiefMaaltijdcheques}
              prefix=""
              variant="subtotal"
            />
          )}
        </tbody>
      </table>
      <AuditSourceGroup datapunten={datapunten} />
    </div>
  );
}

function JaarComponentRows({
  titel,
  component,
}: {
  titel: string;
  component: JaarcomponentNetto;
}) {
  return (
    <>
      <NettoSectionRow label={titel} />
      <NettoRow label="Bruto" bedrag={component.bruto} prefix="+" dimmed />
      <NettoRow label="RSZ werknemer" bedrag={component.rsz} />
      <NettoRow label="Belastbaar loon" bedrag={component.belastbaar} prefix="" variant="subtotal" />
      <NettoRow
        label={`Bedrijfsvoorheffing (${(component.bvTarief * 100).toFixed(2)} %)`}
        bedrag={component.bv}
      />
      <NettoRow label={`Netto ${titel.toLowerCase()}`} bedrag={component.netto} prefix="+" dimmed />
    </>
  );
}

function WerkgeverJaaroverzichtPanel({ jaaroverzicht }: { jaaroverzicht: JaaroverzichtResultaat }) {
  const r = jaaroverzicht.werkgever;

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        border: "2px solid var(--color-primary)",
        background: "var(--color-surface)",
        padding: "1rem 1.1rem",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          letterSpacing: 0,
          marginBottom: 12,
        }}
      >
        Loonkost werkgever (per jaar)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Loonkost werkgever per maand × 12" bedrag={r.maandbasisX12} prefix="" />
          <NettoRow
            label="Eindejaarspremie + jaarpremie + ecocheques"
            bedrag={r.jaarpremiesEnEcocheques}
            prefix="+"
            dimmed
          />
          <NettoRow
            label="RSZ op eindejaarspremie + jaarpremie"
            bedrag={r.rszOpEindejaarspremieEnJaarpremie}
            prefix="+"
            dimmed
          />
          <NettoRow label="Dubbel vakantiegeld" bedrag={r.dubbelVakantiegeld} prefix="+" dimmed />
          <NettoRow label="Loonkost werkgever per jaar" bedrag={r.totaleLoonkostJaar} prefix="" variant="total" />
        </tbody>
      </table>
      <AuditSourceGroup datapunten={r.datapunten} />
    </div>
  );
}

// ─── Centrale forward-berekening ─────────────────────────────────────────────

function berekenNettoVoorProfiel(
  p: Profiel,
  refDatum: string,
  brutoloonOverride?: number,
): NettoResultaat {
  const brutoloon = brutoloonOverride ?? p.brutoloon;
  const maaltijdchequesActief = heeftMaaltijdcheques(p);
  const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum, brutoloon);
  const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);

  return berekenNetto({
    brutoloon,
    refDatum,
    bouwVlag: p.bouwVlag,
    gezinstype: p.gezinstype,
    kinderenTenLaste: p.kinderenTenLaste,
    fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
    groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
    maaltijdchequeWerknemersbijdragePerDag: maaltijdchequesActief
      ? p.maaltijdchequeWerknemersbijdragePerDag
      : 0,
    maaltijdchequeWerkdagen: maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0,
    hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
    onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
    woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(
      mobiliteit.woonwerk,
      p.woonwerkPrivewagenBeroepskostMethode,
    ),
    vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
    vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
  });
}

// ─── bouwResultaten ───────────────────────────────────────────────────────────

function bouwResultaten(p: Profiel): BouwResultaten {
  const refDatum = refDatumVoorMaand(p.berekeningsJaar, p.berekeningsMaand);
  const summary = computeSummary(p);
  const bands: ResultBandSpec[] = [];

  // Band 1 — Loonkost & netto (bediende only, FIRST per plan)
  if (p.statuut === "bediende") {
    bands.push({
      id: "band-loonkost",
      title: "Loonkost & netto",
      shortLabel: "Loonkost",
      icon: <Wallet size={14} />,
      blocks: [
        safeRender(
          () => {
            const maaltijdchequesActief = heeftMaaltijdcheques(p);
            const maaltijdchequeWerkgeversaandeelPerDag = maaltijdchequesActief
              ? p.maaltijdchequeWerkgeversaandeelPerDag
              : 0;
            const maaltijdchequeWerknemersbijdragePerDag = maaltijdchequesActief
              ? p.maaltijdchequeWerknemersbijdragePerDag
              : 0;
            const maaltijdchequeWerkdagen = maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0;
            const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
            const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
            const netto = berekenNettoVoorProfiel(p, refDatum);
            const vaaPerMaand =
              vaaWerkmiddelen.totaalPerMaand +
              (mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0);
            const wgk = werkgeverskost({
              brutoloon: p.brutoloon,
              refDatum,
              bouwVlag: p.bouwVlag,
              arbeidsongevallenPct: p.arbeidsongevallenPct,
              premieEjpPct: 0,
              extraGroepsverzekering: p.extraGroepsverzekering,
              maaltijdchequeWerkgeversaandeelPerDag,
              maaltijdchequeWerkdagen,
              extraHospitalisatie: p.extraHospitalisatie,
              extraEcocheques: 0,
              vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
              vaaPerMaand,
              onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
              woonwerkVergoedingPerMaand: mobiliteit.woonwerk.totaalVergoeding,
            });
            const wig = loonwig(wgk.totaleLoonkostBreed, netto.nettoloon);
            const jaaroverzicht = berekenJaaroverzicht({
              brutoloon: p.brutoloon,
              nettoloonPerMaand: netto.nettoloon,
              loonkostWerkgeverPerMaand: wgk.totaleLoonkostBreed,
              refDatum,
              gezinstype: p.gezinstype,
              kinderenTenLaste: p.kinderenTenLaste,
              ancienniteitMaanden: p.ancienniteitMaanden,
              prestatieMaandenInRefertepériode: p.prestatieMaanden,
              tewerkstellingsbreuk: p.tewerkstellingsbreuk,
              vaaPerMaand,
            });
            return { netto, wgk, wig, mobiliteit, vaaWerkmiddelen, jaaroverzicht };
          },
          ({ netto, wgk, wig, mobiliteit, vaaWerkmiddelen, jaaroverzicht }) => (
            <div style={{ display: "grid", gap: 12 }}>
              <div
                className="grid grid-cols-1"
                style={{
                  gap: 12,
                  alignItems: "flex-start",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                }}
              >
                <NettoPanel
                  resultaat={netto}
                  vaaWerkmiddelen={vaaWerkmiddelen}
                  maaltijdchequeWerkgeversaandeelPerDag={
                    heeftMaaltijdcheques(p) ? p.maaltijdchequeWerkgeversaandeelPerDag : 0
                  }
                  gemeentebelastingPct={p.gemeentebelastingPct}
                />
                <WerkgeverskostPanel
                  resultaat={wgk}
                  loonwigPct={wig}
                  netto={netto.nettoloon}
                  extras={{
                    arbeidsongevallenPct: p.arbeidsongevallenPct,
                    groepsverzekering: p.extraGroepsverzekering,
                    maaltijdcheques: heeftMaaltijdcheques(p)
                      ? Math.round(
                          Math.min(
                            p.maaltijdchequeWerkgeversaandeelPerDag,
                            MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
                          ) * p.arbeidsdagenPerMaand * 100,
                        ) / 100
                      : 0,
                    hospitalisatie: p.extraHospitalisatie,
                    ecocheques: 0,
                    woonwerk: mobiliteit.woonwerk.totaalVergoeding,
                    onkostenvergoeding: p.onkostenvergoedingPerMaand,
                  }}
                />
              </div>
              <NettoJaaroverzichtPanel
                jaaroverzicht={jaaroverzicht}
                maaltijdchequeWerkgeversaandeelPerDag={
                  heeftMaaltijdcheques(p) ? p.maaltijdchequeWerkgeversaandeelPerDag : 0
                }
                maaltijdchequeWerknemersbijdragePerDag={
                  heeftMaaltijdcheques(p) ? p.maaltijdchequeWerknemersbijdragePerDag : 0
                }
                maaltijdchequeWerkdagenPerMaand={
                  heeftMaaltijdcheques(p) ? p.arbeidsdagenPerMaand : 0
                }
              />
              <WerkgeverJaaroverzichtPanel jaaroverzicht={jaaroverzicht} />
            </div>
          ),
        ),
      ],
    });
  }

  // Band 2 — Loonbasis (sectoraal min + bruto-check)
  const loonbasisBlocks: React.ReactNode[] = [];
  if (p.statuut === "bediende") {
    loonbasisBlocks.push(
      safeRender(
        () => {
          const r = lookupBarema(p.schaal, p.cat, p.ervaringJaren, refDatum);
          const c = brutolocheck(
            p.schaal,
            p.cat,
            p.ervaringJaren,
            p.brutoloon,
            refDatum,
            p.tewerkstellingsbreuk,
          );
          return { r, c };
        },
        ({ r, c }) => (
          <>
            <ResultCard
              label={`Sectoraal minimum — Schaal ${p.schaal}, Cat ${p.cat}, ${r.effectieveErvaring} jaar`}
              amountEUR={r.maandloonEUR}
              helper={
                [
                  c.vergelijkingsbasis === "deeltijds_omgerekend"
                    ? `Deeltijds ${tewerkstellingsbreukNaarPercentage(c.tewerkstellingsbreuk).toFixed(0)}%: pro-rata minimum ${formatEUR(c.proRataMinimum)}, voltijds equivalent ${formatEUR(c.voltijdsEquivalentBruto)}`
                    : undefined,
                  r.geclampt
                    ? `Loonplafond bereikt — ervaring ${p.ervaringJaren} > ${r.effectieveErvaring}`
                    : undefined,
                ].filter(Boolean).join(" · ") || undefined
              }
              datapunten={[r.datapunt]}
              highlight
            />
            {c.ok ? (
              <Banner kind="success" title="Brutoloon-check OK">
                {c.vergelijkingsbasis === "deeltijds_omgerekend"
                  ? `Voltijds equivalent ${formatEUR(c.voltijdsEquivalentBruto)} ≥ sectoraal minimum (verschil ${formatEUR(c.verschil)}).`
                  : `Opgegeven brutoloon ≥ sectoraal minimum (verschil ${formatEUR(c.verschil)}).`}
              </Banner>
            ) : (
              <Banner kind="error" title="Brutoloon onder sectoraal minimum">
                Verschil op voltijdse basis: {formatEUR(c.verschil)}. Pas het loon aan of
                controleer schaal/cat/ervaring.
              </Banner>
            )}
          </>
        ),
      ),
    );
  } else {
    loonbasisBlocks.push(
      safeRender(
        () => lookupStudentenbarema(p.studentenCat, p.studentLeeftijd, refDatum),
        (r) => (
          <ResultCard
            label={`Studentenbarema — Cat ${p.studentenCat}, ${p.studentLeeftijd} jaar`}
            amountEUR={r.maandloonEUR}
            datapunten={[r.datapunt]}
            highlight
          />
        ),
      ),
    );
  }
  bands.push({
    id: "band-loonbasis",
    title: "Loonbasis",
    shortLabel: "Loonbasis",
    icon: <Briefcase size={14} />,
    blocks: loonbasisBlocks,
  });

  return { summary, bands };
}

function computeSummary(p: Profiel): ResultSummary {
  const refDatum = refDatumVoorMaand(p.berekeningsJaar, p.berekeningsMaand);
  if (p.statuut !== "bediende") {
    return { bruto: p.brutoloon, netto: null, werkgeverskost: null, loonwig: null };
  }
  try {
    const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
    const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
    const netto = berekenNettoVoorProfiel(p, refDatum);
    const maaltijdchequesActief = heeftMaaltijdcheques(p);
    const vaaPerMaand =
      vaaWerkmiddelen.totaalPerMaand +
      (mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0);
    const wgk = werkgeverskost({
      brutoloon: p.brutoloon,
      refDatum,
      bouwVlag: p.bouwVlag,
      arbeidsongevallenPct: p.arbeidsongevallenPct,
      premieEjpPct: 0,
      extraGroepsverzekering: p.extraGroepsverzekering,
      maaltijdchequeWerkgeversaandeelPerDag: maaltijdchequesActief
        ? p.maaltijdchequeWerkgeversaandeelPerDag
        : 0,
      maaltijdchequeWerkdagen: maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0,
      extraHospitalisatie: p.extraHospitalisatie,
      extraEcocheques: 0,
      vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
      vaaPerMaand,
      onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
      woonwerkVergoedingPerMaand: mobiliteit.woonwerk.totaalVergoeding,
    });
    const wig = loonwig(wgk.totaleLoonkostBreed, netto.nettoloon);
    return {
      bruto: p.brutoloon,
      netto: netto.nettoloon,
      werkgeverskost: wgk.totaleLoonkostBreed,
      loonwig: wig,
    };
  } catch {
    return { bruto: p.brutoloon, netto: null, werkgeverskost: null, loonwig: null };
  }
}
