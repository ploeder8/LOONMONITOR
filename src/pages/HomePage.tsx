import { useEffect, useMemo, useRef, useState, type CSSProperties, type InputHTMLAttributes } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Calculator,
  Leaf,
  Bike,
  Train,
  Bus,
  Car,
  Wallet,
  Briefcase,
  Map as MapIcon,
  Building2,
  HelpCircle,
} from "lucide-react";

import { Banner } from "@/components/Banner";
import { ResultCard } from "@/components/ResultCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { AuditOpenProvider, AuditSourceGroup, type AuditForceState } from "@/components/AuditPanel";
import { ResultBand } from "@/components/ResultBand";
import {
  ResultsSummaryStrip,
  type JumpAnchor,
  type SummaryCell,
} from "@/components/ResultsSummaryStrip";
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
  statuut: Statuut;
  schaal: Schaal;
  cat: BaremaCat;
  ervaringJaren: number;
  studentenCat: StudentenCat;
  studentLeeftijd: number;
  brutoloon: number;
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
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  extraHospitalisatie: number;
  hospitalisatieEigenBijdrage: number;
  onkostenvergoedingPerMaand: number;
  gemeentebelastingPct: number;
}

const DEFAULTS: Profiel = {
  statuut: "bediende",
  schaal: "I",
  cat: "A",
  ervaringJaren: 5,
  studentenCat: "A",
  studentLeeftijd: 17,
  brutoloon: 2276.51,
  bouwVlag: false,
  berekeningsMaand: "06",
  berekeningsJaar: "2026",
  ancienniteitMaanden: 12,
  prestatieMaanden: 12,
  tewerkstellingsbreuk: 1,
  woonwerkFiets: false,
  woonwerkPrivewagen: false,
  woonwerkBusTramMetro: false,
  woonwerkTrein: true,
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

function berekenWoonwerkVrijgesteld(
  woonwerk: WoonwerkVerkeerResultaat,
  privewagenMethode: BeroepskostMethode,
): number {
  let vrijgesteld = woonwerk.totaalVergoeding;
  if (privewagenMethode === "reeel" && woonwerk.componenten.privewagen) {
    vrijgesteld -= woonwerk.componenten.privewagen.vergoeding;
  }
  return round2(Math.max(0, vrijgesteld));
}

function berekenMobiliteitVoorProfiel(p: Profiel, refDatum: string): MobiliteitBerekening {
  const werkdagenInMaand = aantalWeekdagenInMaand(p.berekeningsJaar, p.berekeningsMaand);
  const woonwerk = berekenWoonwerkVerkeer({
    refDatum,
    brutoloon: p.brutoloon,
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
  const profiel = normaliseerProfiel(p);

  function set<K extends keyof Profiel>(k: K, v: Profiel[K]) {
    setP((prev) => ({ ...normaliseerProfiel(prev), [k]: v }));
  }

  return (
    <div className="home-layout">
      <ProfileForm profiel={profiel} set={set} />
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
        <ResultsPanel profiel={profiel} />
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
  return (
    <div style={baremaInlineStyle(check.ok)}>
      <BaremaInlineHeader
        profiel={profiel}
        minimum={check.sectoraalMinimum}
        effectieveErvaring={check.effectieveErvaring}
      />
      {check.ok ? (
        <span>Brutoloon voldoet aan het sectoraal minimum.</span>
      ) : (
        <span style={{ fontWeight: 600 }}>
          Brutoloon ligt {formatEUR(Math.abs(check.verschil))} onder het minimum.
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

function ProfileForm({
  profiel,
  set,
}: {
  profiel: Profiel;
  set: ProfielSetter;
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
    set("woonwerkFiets", actief);
    set("woonwerkPrivewagen", actief);
    set("woonwerkBusTramMetro", actief);
    set("woonwerkTrein", actief);
    set("woonwerkBedrijfswagen", actief);
  }

  return (
    <aside
      className="min-w-0 lg:sticky lg:self-start"
      style={{
        top: 73,
        width: "100%",
        boxSizing: "border-box",
        maxHeight: "calc(100vh - 73px - 56px)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderRadius: 14,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "1.2rem 1.1rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--color-text)",
          letterSpacing: 0,
          margin: 0,
        }}
      >
        Profiel
      </h2>

      {profiel.statuut === "bediende" && (
        <TaxProfileFields profiel={profiel} set={set} />
      )}

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      <FormField
        label={<>Werkdagen in maand <HelpTooltip text="Vooringevuld op basis van weekdagen in de gekozen maand. Aanpasbaar voor feestdagen, verlof of afwijkende prestaties." /></>}
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

      {profiel.statuut === "bediende" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>

          <FormField label="Ervaring (jaren)">
            <NumeriekeInput
              className={inputClass}
              min={0}
              max={60}
              value={profiel.ervaringJaren}
              modus="int"
              onValueChange={(waarde) => set("ervaringJaren", waarde)}
            />
          </FormField>

          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>

          <BaremaInlineCheck profiel={profiel} />

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
            Bouw-subset (extra 1,80 % aanvullend pensioen)
          </label>

          <FormSection label="Bijkomende looncomponenten" icon={<Wallet size={13} />} defaultOpen>
            <FormField label="Groepsverz. eigen bijdrage (€/m)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                min={0}
                value={profiel.groepsverzekeringEigenBijdrage}
                onValueChange={(waarde) => set("groepsverzekeringEigenBijdrage", waarde)}
              />
            </FormField>
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
                VAA werkmiddelen
                <HelpTooltip text="Forfaitaire jaarbedragen vastgelegd per KB: PC/laptop €72/jaar (€6/maand), internet €60/jaar (€5/maand), GSM €36/jaar (€3/maand), GSM-abonnement €48/jaar (€4/maand). Deze bedragen worden bij het brutoloon geteld voor RSZ én BV." />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    checked={profiel.vaaPcLaptopActief}
                    onChange={(e) => set("vaaPcLaptopActief", e.target.checked)}
                    style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                  />
                  Laptop / pc
                </label>
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
                    checked={profiel.vaaGsmSmartphoneActief}
                    onChange={(e) => set("vaaGsmSmartphoneActief", e.target.checked)}
                    style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                  />
                  GSM
                </label>
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
                    checked={profiel.vaaInternetActief}
                    onChange={(e) => set("vaaInternetActief", e.target.checked)}
                    style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                  />
                  Internet
                </label>
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
                    checked={profiel.vaaGsmAbonnementActief}
                    onChange={(e) => set("vaaGsmAbonnementActief", e.target.checked)}
                    style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
                  />
                  GSM-abonnement
                </label>
              </div>

            </div>
            <FormField
              label={<>Eigen bijdrage hospitalisatieverzekering (€/m) <HelpTooltip text="Werknemersbijdrage die rechtstreeks van het cash-nettoloon wordt afgehouden." /></>}
            >
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                min={0}
                value={profiel.hospitalisatieEigenBijdrage}
                onValueChange={(waarde) => set("hospitalisatieEigenBijdrage", waarde)}
              />
            </FormField>
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
            <FormField
              label={<>Maaltijdcheques — werkgeversaandeel (€/dag) <HelpTooltip text={`Max €${MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026.toFixed(2).replace(".", ",")}/dag × ${profiel.arbeidsdagenPerMaand} werkdagen. Niet verplicht in PC 200.`} /></>}
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
              label={<>Maaltijdcheques — werknemersbijdrage (€/dag) <HelpTooltip text={`Min €1,09/dag × ${profiel.arbeidsdagenPerMaand} werkdagen. Mag hoger liggen volgens de werkgeverregeling.`} /></>}
            >
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                min={0}
                value={profiel.maaltijdchequeWerknemersbijdragePerDag}
                onValueChange={(waarde) => set("maaltijdchequeWerknemersbijdragePerDag", waarde)}
              />
            </FormField>
          </FormSection>
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

      {/* ─── Accordion secties ─── */}
      <FormSection label="Eindejaarspremie" icon={<Calendar size={13} />}>
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
            checked={profiel.prestatieMaanden > 0}
            onChange={(e) => {
              const maanden = eindejaarspremieMaandenVoorCheckbox(e.target.checked);
              set("ancienniteitMaanden", maanden.ancienniteitMaanden);
              set("prestatieMaanden", maanden.prestatieMaanden);
            }}
            style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
          />
          Eindejaarspremie
        </label>
      </FormSection>

      <FormSection label="Ecocheques" icon={<Leaf size={13} />}>
        <FormField label="Tewerkstelling (%)">
          <NumeriekeInput
            className={inputClass}
            step="1"
            min={0}
            max={100}
            value={tewerkstellingsbreukNaarPercentage(profiel.tewerkstellingsbreuk)}
            onValueChange={(waarde) =>
              set("tewerkstellingsbreuk", percentageNaarTewerkstellingsbreuk(waarde))
            }
          />
        </FormField>
      </FormSection>

      <FormSection label="Woon-werk verkeer" icon={<MapIcon size={13} />}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setAlleWoonwerk(true)}
            style={miniButtonStyle}
          >
            Alles selecteren
          </button>
          <button
            type="button"
            onClick={() => setAlleWoonwerk(false)}
            style={miniButtonStyle}
          >
            Alles wissen
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <CheckboxLine
            checked={profiel.woonwerkFiets}
            label="Fiets"
            icon={<Bike size={14} />}
            onChange={(checked) => set("woonwerkFiets", checked)}
          />
          {profiel.woonwerkFiets && (
            <FormField label="Fiets km per dag">
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.kmPerDag}
                onValueChange={(waarde) => set("kmPerDag", waarde)}
              />
            </FormField>
          )}

          <CheckboxLine
            checked={profiel.woonwerkPrivewagen}
            label="Privéwagen"
            icon={<Car size={14} />}
            onChange={(checked) => set("woonwerkPrivewagen", checked)}
          />
          {profiel.woonwerkPrivewagen && (
            <>
              <FormField label="Privéwagen afstand km">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.privewagenKm}
                  onValueChange={(waarde) => set("privewagenKm", waarde)}
                />
              </FormField>
              <div className="flex items-center gap-3" style={{ paddingLeft: 4 }}>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Berekeningsmethode
                </span>
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
            </>
          )}

          <CheckboxLine
            checked={profiel.woonwerkBusTramMetro}
            label="Bus / tram / metro"
            icon={<Bus size={14} />}
            onChange={(checked) => set("woonwerkBusTramMetro", checked)}
          />
          {profiel.woonwerkBusTramMetro && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="OV afstand km">
                <NumeriekeInput
                  className={inputClass}
                  min={0}
                  value={profiel.busTramMetroKm}
                  onValueChange={(waarde) => set("busTramMetroKm", waarde)}
                />
              </FormField>
              <FormField label="OV prijs / maand (€)">
                <NumeriekeInput
                  className={inputClass}
                  step="0.01"
                  min={0}
                  value={profiel.busTramMetroPrijs}
                  onValueChange={(waarde) => set("busTramMetroPrijs", waarde)}
                />
              </FormField>
            </div>
          )}

          <CheckboxLine
            checked={profiel.woonwerkTrein}
            label="Trein"
            icon={<Train size={14} />}
            onChange={(checked) => set("woonwerkTrein", checked)}
          />
          {profiel.woonwerkTrein && (
            <FormField label="Trein afstand km">
              <NumeriekeInput
                className={inputClass}
                min={0}
                value={profiel.treinKm}
                onValueChange={(waarde) => set("treinKm", waarde)}
              />
            </FormField>
          )}

          <CheckboxLine
            checked={profiel.woonwerkBedrijfswagen}
            label="Bedrijfswagen"
            icon={<Car size={14} />}
            onChange={(checked) => set("woonwerkBedrijfswagen", checked)}
          />
          {profiel.woonwerkBedrijfswagen && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  <FormField label="CO2-waarde">
                    <NumeriekeInput
                      className={inputClass}
                      min={0}
                      value={profiel.bedrijfswagenCo2}
                      onValueChange={(waarde) => set("bedrijfswagenCo2", waarde)}
                    />
                  </FormField>
                )}
              </div>
              <div className="flex items-center gap-3" style={{ paddingLeft: 4 }}>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Berekeningsmethode
                </span>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="bedrijfswagen-beroepskost"
                    value="forfaitair"
                    checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair"}
                    onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "forfaitair")}
                  />
                  Forfaitair
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="bedrijfswagen-beroepskost"
                    value="reeel"
                    checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "reeel"}
                    onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "reeel")}
                  />
                  Reëel
                </label>
                <HelpTooltip text="Forfaitair: de VAA bedrijfswagen wordt opgenomen in de belastbare basis volgens de CO₂-formule. Reëel: de VAA blijft van toepassing; werkelijke beroepskosten worden manueel op de fiscale fiche opgenomen." />
              </div>
            </>
          )}
        </div>
      </FormSection>

      {profiel.statuut !== "student" && (
        <FormSection label="Werkgeversbijdragen" icon={<Building2 size={13} />}>
          <FormField
            label={<>Arbeidsongevallen-tarief (%) <HelpTooltip text="Burelen: ~0,3 %. Controleer uw polis." /></>}
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
        </FormSection>
      )}

    </aside>
  );
}

function TaxProfileFields({
  profiel,
  set,
}: {
  profiel: Profiel;
  set: ProfielSetter;
}) {
  return (
    <>
      <GezinstypeField profiel={profiel} set={set} />
      <KinderenVoorheffingFields profiel={profiel} set={set} />
      {profiel.gezinstype === "alleenstaand" && profiel.kinderenTenLaste > 0 && (
        <AlleenstaandeOuderField profiel={profiel} set={set} />
      )}
      <GemeentebelastingField profiel={profiel} set={set} />
    </>
  );
}

function GemeentebelastingField({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <FormField
      label={<>Gemeentebelasting (%) <HelpTooltip text="Aanvullende gemeentelijke belasting. Tarief varieert per gemeente (0% tot ~9%). Default 7,3% is het gewogen landelijk gemiddelde. Wordt niet afgetrokken van het maandelijks nettoloon; het is een jaarlijkse PB-aanvulling." /></>}
    >
      <NumeriekeInput
        className={inputClass}
        step="0.1"
        min={0}
        max={20}
        value={profiel.gemeentebelastingPct}
        onValueChange={(waarde) => set("gemeentebelastingPct", waarde)}
      />
    </FormField>
  );
}

function GezinstypeField({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
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
        <option value="gehuwd_zonder_inkomen">
          Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen
        </option>
      </select>
    </FormField>
  );
}

function KinderenVoorheffingFields({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
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
  );
}

function AlleenstaandeOuderField({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
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
  );
}

// ─── ResultsPanel ─────────────────────────────────────────────────────────────

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

function ResultsPanel({ profiel }: { profiel: Profiel }) {
  const [auditForce, setAuditForce] = useState<AuditForceState>(null);
  const { summary, bands } = useMemo(() => bouwResultaten(profiel), [profiel]);

  const cells: SummaryCell[] =
    profiel.statuut === "bediende"
      ? [
          { label: "Bruto", bedrag: summary.bruto },
          { label: "Netto", bedrag: summary.netto, highlight: true },
          { label: "Loonkost werkgever / maand", bedrag: summary.werkgeverskost, highlight: true },
          { label: "Loonwig", bedrag: summary.loonwig, format: "PCT" },
        ]
      : [{ label: "Bruto (student)", bedrag: summary.bruto, highlight: true }];

  const anchors: JumpAnchor[] = bands.map((b) => ({ id: b.id, label: b.shortLabel }));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <ResultsSummaryStrip
        cells={cells}
        anchors={anchors}
        auditForce={auditForce}
        onToggleAudit={() => setAuditForce(auditForce === "all" ? null : "all")}
      />
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
  label: string;
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

      {/* BV validatie disclaimer */}
      <div
        style={{
          background: "var(--color-primary-soft)",
          border: "1px solid var(--color-primary-border)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
          color: "var(--color-primary)",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        <strong>FOD Bijlage III:</strong> BV wordt berekend volgens FOD Financiën / Bijlage III 2026 als primaire payrollbron. Tax-Calc is alleen een latere PB-raming, geen bron voor maandelijkse payroll-BV. BBSZ = kwartaalbedrag ÷ 3. Gemeentebelasting wordt apart getoond maar is niet in het maandloon inbegrepen (jaarlijkse PB-aanvulling). Eindafrekening via PB-aangifte AJ 2027.
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
            label={`Effectieve RSZ${r.werkbonus.totaal > 0 ? " (na werkbonus)" : ""}`}
            bedrag={r.effectieveRsz}
          />
          <NettoRow
            label="Loon na effectieve RSZ"
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
                    ["Methode", r.bv.methode],
                    ["Schaal", r.bv.schaal],
                    ...(gebruiktSchaalII
                      ? [["Impact Schaal II", "Lagere bedrijfsvoorheffing door partner zonder of beperkt beroepsinkomen"]]
                      : []),
                    ["Validatie", r.bv.validatieStatus],
                    ["Belastbaar jaarloon", formatEUR(r.bv.jaarbasis)],
                    ["Forfait beroepskosten (30%, max € 6.070 AJ 2027)", `- ${formatEUR(r.bv.forfaitBeroepskosten)}`],
                    ["Belastbaar netto-inkomen", formatEUR(r.bv.belastbaarNettoJaar)],
                    ["Belastingvrije som (AJ 2027)", formatEUR(r.bv.belastingvrijeSom)],
                    ["PB (bruto, schijven 25/40/45/50%)", formatEUR(r.bv.pbBruto)],
                    ["BVS-vermindering (BVS × 25%)", `- ${formatEUR(r.bv.bvsVermindering)}`],
                    ["PB (netto, jaarbasis)", formatEUR(r.bv.pbNetto)],
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
              label={`Fiscale werkbonus (33,14% × A + 52,54% × B)`}
              bedrag={r.fiscaleWerkbonus}
              prefix="+"
              dimmed
            />
          )}
          <NettoRow label="BV (na verminderingen)" bedrag={r.bv.bvNaVerminderingen} />
          <NettoSectionRow label="Onkostenvergoedingen en inhoudingen" />
          <NettoRow
            label={`BBSZ ${r.bbsz.scenarioLabel} (kwartaal ${formatEUR(r.bbsz.kwartaalbijdrage)} ÷ 3)`}
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
              Aanvullende gemeentebelasting: {gemeentebelastingPct.toFixed(1).replace(".", ",")}% —
              geschat {formatEUR(round2((r.nettoloon * 12 * gemeentebelastingPct) / 100))}/jaar (niet inbegrepen in maandloon; jaarlijkse PB-aanvulling)
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
              Totale loonkost — smal
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
        <strong>Loonwig: {(loonwigPct * 100).toFixed(1)} %</strong>
        <span style={{ color: "var(--color-text-muted)", marginLeft: 8 }}>
          = (totale loonkost {formatEUR(r.totaleLoonkostBreed)} − netto {formatEUR(netto)}) / totale loonkost
        </span>
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
            const heeftMaaltijdcheques = p.maaltijdchequeWerkgeversaandeelPerDag > 0;
            const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
            const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
            const netto = berekenNetto({
              brutoloon: p.brutoloon,
              refDatum,
              bouwVlag: p.bouwVlag,
              gezinstype: p.gezinstype,
              kinderenTenLaste: p.kinderenTenLaste,
              fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
              groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
              maaltijdchequeWerknemersbijdragePerDag: heeftMaaltijdcheques
                ? p.maaltijdchequeWerknemersbijdragePerDag
                : 0,
              maaltijdchequeWerkdagen: heeftMaaltijdcheques ? p.arbeidsdagenPerMaand : 0,
              hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
              onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
              woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(
                mobiliteit.woonwerk,
                p.woonwerkPrivewagenBeroepskostMethode,
              ),
              vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
              vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
            });
            const wgk = werkgeverskost({
              brutoloon: p.brutoloon,
              refDatum,
              bouwVlag: p.bouwVlag,
              arbeidsongevallenPct: p.arbeidsongevallenPct,
              premieEjpPct: 0,
              premieVakantiegeldPct: 0,
              extraGroepsverzekering: p.extraGroepsverzekering,
              maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequeWerkgeversaandeelPerDag,
              maaltijdchequeWerkdagen: p.arbeidsdagenPerMaand,
              extraHospitalisatie: p.extraHospitalisatie,
              extraEcocheques: 0,
              vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
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
              vaaPerMaand:
                vaaWerkmiddelen.totaalPerMaand +
                (mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0),
            });
            return { netto, wgk, wig, mobiliteit, vaaWerkmiddelen, jaaroverzicht };
          },
          ({ netto, wgk, wig, mobiliteit, vaaWerkmiddelen, jaaroverzicht }) => (
            <div style={{ display: "grid", gap: 12 }}>
              <div
                className="grid grid-cols-1 xl:grid-cols-2"
                style={{ gap: 12, alignItems: "flex-start" }}
              >
                <NettoPanel
                  resultaat={netto}
                  vaaWerkmiddelen={vaaWerkmiddelen}
                  maaltijdchequeWerkgeversaandeelPerDag={p.maaltijdchequeWerkgeversaandeelPerDag}
                  gemeentebelastingPct={p.gemeentebelastingPct}
                />
                <WerkgeverskostPanel
                  resultaat={wgk}
                  loonwigPct={wig}
                  netto={netto.nettoloon}
                  extras={{
                    arbeidsongevallenPct: p.arbeidsongevallenPct,
                    groepsverzekering: p.extraGroepsverzekering,
                    maaltijdcheques: Math.round(
                      Math.min(
                        p.maaltijdchequeWerkgeversaandeelPerDag,
                        MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
                      ) * p.arbeidsdagenPerMaand * 100,
                    ) / 100,
                    hospitalisatie: p.extraHospitalisatie,
                    ecocheques: 0,
                    woonwerk: mobiliteit.woonwerk.totaalVergoeding,
                    onkostenvergoeding: p.onkostenvergoedingPerMaand,
                  }}
                />
              </div>
              <NettoJaaroverzichtPanel
                jaaroverzicht={jaaroverzicht}
                maaltijdchequeWerkgeversaandeelPerDag={p.maaltijdchequeWerkgeversaandeelPerDag}
                maaltijdchequeWerknemersbijdragePerDag={p.maaltijdchequeWerknemersbijdragePerDag}
                maaltijdchequeWerkdagenPerMaand={p.arbeidsdagenPerMaand}
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
          const c = brutolocheck(p.schaal, p.cat, p.ervaringJaren, p.brutoloon, refDatum);
          return { r, c };
        },
        ({ r, c }) => (
          <>
            <ResultCard
              label={`Sectoraal minimum — Schaal ${p.schaal}, Cat ${p.cat}, ${r.effectieveErvaring} jaar`}
              amountEUR={r.maandloonEUR}
              helper={
                r.geclampt
                  ? `Loonplafond bereikt — ervaring ${p.ervaringJaren} > ${r.effectieveErvaring}`
                  : undefined
              }
              datapunten={[r.datapunt]}
              highlight
            />
            {c.ok ? (
              <Banner kind="success" title="Brutoloon-check OK">
                Opgegeven brutoloon ≥ sectoraal minimum (verschil {formatEUR(c.verschil)}).
              </Banner>
            ) : (
              <Banner kind="error" title="Brutoloon onder sectoraal minimum">
                Verschil: {formatEUR(c.verschil)}. Pas het loon aan of controleer schaal/cat/ervaring.
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
    const heeftMaaltijdcheques = p.maaltijdchequeWerkgeversaandeelPerDag > 0;
    const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
    const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
    const netto = berekenNetto({
      brutoloon: p.brutoloon,
      refDatum,
      bouwVlag: p.bouwVlag,
      gezinstype: p.gezinstype,
      kinderenTenLaste: p.kinderenTenLaste,
      fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
      groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
      maaltijdchequeWerknemersbijdragePerDag: heeftMaaltijdcheques
        ? p.maaltijdchequeWerknemersbijdragePerDag
        : 0,
      maaltijdchequeWerkdagen: heeftMaaltijdcheques ? p.arbeidsdagenPerMaand : 0,
      hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
      onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
      woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(
        mobiliteit.woonwerk,
        p.woonwerkPrivewagenBeroepskostMethode,
      ),
      vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
      vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
    });
    const wgk = werkgeverskost({
      brutoloon: p.brutoloon,
      refDatum,
      bouwVlag: p.bouwVlag,
      arbeidsongevallenPct: p.arbeidsongevallenPct,
      premieEjpPct: 0,
      premieVakantiegeldPct: 0,
      extraGroepsverzekering: p.extraGroepsverzekering,
      maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequeWerkgeversaandeelPerDag,
      maaltijdchequeWerkdagen: p.arbeidsdagenPerMaand,
      extraHospitalisatie: p.extraHospitalisatie,
      extraEcocheques: 0,
      vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
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
