import { useMemo, useState, type CSSProperties } from "react";
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
  Gift,
  Map as MapIcon,
  Building2,
} from "lucide-react";

import { Banner } from "@/components/Banner";
import { ResultCard } from "@/components/ResultCard";
import { FormField, inputClass, selectClass } from "@/components/Field";
import { AuditPanel, AuditOpenProvider, type AuditForceState } from "@/components/AuditPanel";
import { ResultBand } from "@/components/ResultBand";
import {
  ResultsSummaryStrip,
  type JumpAnchor,
  type SummaryCell,
} from "@/components/ResultsSummaryStrip";
import { brutolocheck, lookupBarema, lookupStudentenbarema } from "@/lib/baremas";
import type { BaremaCat, Schaal, StudentenCat } from "@/lib/baremas";
import { rszBijdragen } from "@/lib/rsz";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { ecocheques } from "@/lib/ecocheques";
import {
  berekenWoonwerkVerkeer,
  type WoonwerkVerkeerResultaat,
} from "@/lib/woonwerkVerkeer";
import {
  vaaBedrijfswagen,
  type BrandstofBedrijfswagen,
  type VaaBedrijfswagenResultaat,
} from "@/lib/vaaBedrijfswagen";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
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
import { formatEUR } from "@/lib/money";

type Statuut = "bediende" | "student";
type ProfielSetter = <K extends keyof Profiel>(k: K, v: Profiel[K]) => void;

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
  kinderenOnder3: number;
  fiscaalAlleenstaandeMetKind: boolean;
  groepsverzekeringEigenBijdrage: number;
  // Werkgeversbijdragen (extralegale voordelen)
  arbeidsongevallenPct: number;
  extraGroepsverzekering: number;
  maaltijdchequeWerkgeversaandeelPerDag: number;
  maaltijdchequeWerknemersbijdragePerDag: number;
  extraHospitalisatie: number;
  hospitalisatieEigenBijdrage: number;
  onkostenvergoedingPerMaand: number;
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
  kinderenOnder3: 0,
  fiscaalAlleenstaandeMetKind: false,
  groepsverzekeringEigenBijdrage: 0,
  arbeidsongevallenPct: 0.003,
  extraGroepsverzekering: 0,
  maaltijdchequeWerkgeversaandeelPerDag: MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026,
  maaltijdchequeWerknemersbijdragePerDag: 1.09,
  extraHospitalisatie: 0,
  hospitalisatieEigenBijdrage: 0,
  onkostenvergoedingPerMaand: 0,
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
        label="Werkdagen in maand"
        helper="Vooringevuld op basis van weekdagen in de gekozen maand. Aanpasbaar voor feestdagen, verlof of afwijkende prestaties."
      >
        <input
          className={inputClass}
          type="number"
          min={0}
          max={31}
          value={profiel.arbeidsdagenPerMaand}
          onChange={(e) => set("arbeidsdagenPerMaand", parseInt(e.target.value || "0", 10))}
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
            <input
              className={inputClass}
              type="number"
              min={0}
              max={60}
              value={profiel.ervaringJaren}
              onChange={(e) => set("ervaringJaren", parseInt(e.target.value || "0", 10))}
            />
          </FormField>

          <FormField label="Brutoloon (€)">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              value={profiel.brutoloon}
              onChange={(e) => set("brutoloon", parseFloat(e.target.value || "0"))}
            />
          </FormField>

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

          <FormSection label="Werkgeversbijdragen" icon={<Building2 size={13} />}>
            <FormField
              label="Arbeidsongevallen-tarief (%)"
              helper="Burelen: ~0,3 %. Controleer uw polis."
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={(profiel.arbeidsongevallenPct * 100).toFixed(2)}
                onChange={(e) =>
                  set("arbeidsongevallenPct", parseFloat(e.target.value || "0") / 100)
                }
              />
            </FormField>
            <FormField label="Patronale groepsverzekering (€/m)">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.extraGroepsverzekering}
                onChange={(e) =>
                  set("extraGroepsverzekering", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
            <FormField
              label="Maaltijdcheques — werkgeversaandeel (€/dag)"
              helper={`Max €${MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026.toFixed(2).replace(".", ",")}/dag × ${profiel.arbeidsdagenPerMaand} werkdagen. Niet verplicht in PC 200.`}
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                max={MAALTIJDCHEQUE_MAX_WG_PER_DAG_2026}
                value={profiel.maaltijdchequeWerkgeversaandeelPerDag}
                onChange={(e) =>
                  set("maaltijdchequeWerkgeversaandeelPerDag", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
            <FormField
              label="Maaltijdcheques — werknemersbijdrage (€/dag)"
              helper={`Min €1,09/dag × ${profiel.arbeidsdagenPerMaand} werkdagen. Mag hoger liggen volgens de werkgeverregeling.`}
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.maaltijdchequeWerknemersbijdragePerDag}
                onChange={(e) =>
                  set("maaltijdchequeWerknemersbijdragePerDag", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
            <FormField label="Hospitalisatieverzekering (€/m)">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.extraHospitalisatie}
                onChange={(e) =>
                  set("extraHospitalisatie", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
          </FormSection>

          <FormSection label="Bijkomende looncomponenten" icon={<Wallet size={13} />} defaultOpen>
            <FormField label="Groepsverz. eigen bijdrage (€/m)">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.groepsverzekeringEigenBijdrage}
                onChange={(e) =>
                  set("groepsverzekeringEigenBijdrage", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
            <FormField
              label="Eigen bijdrage hospitalisatieverzekering (€/m)"
              helper="Werknemersbijdrage die rechtstreeks van het cash-nettoloon wordt afgehouden."
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.hospitalisatieEigenBijdrage}
                onChange={(e) =>
                  set("hospitalisatieEigenBijdrage", parseFloat(e.target.value || "0"))
                }
              />
            </FormField>
            <FormField
              label="Onkostenvergoedingen (€/m)"
              helper="Vrijgestelde netto-vergoeding: verhoogt nettoloon en werkgeverskost, zonder RSZ/BV-basis te wijzigen."
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.onkostenvergoedingPerMaand}
                onChange={(e) =>
                  set("onkostenvergoedingPerMaand", parseFloat(e.target.value || "0"))
                }
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
            <input
              className={inputClass}
              type="number"
              min={14}
              max={30}
              value={profiel.studentLeeftijd}
              onChange={(e) => set("studentLeeftijd", parseInt(e.target.value || "0", 10))}
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
          <input
            className={inputClass}
            type="number"
            step="1"
            min={0}
            max={100}
            value={tewerkstellingsbreukNaarPercentage(profiel.tewerkstellingsbreuk)}
            onChange={(e) =>
              set(
                "tewerkstellingsbreuk",
                percentageNaarTewerkstellingsbreuk(parseFloat(e.target.value || "0")),
              )
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
              <input
                className={inputClass}
                type="number"
                min={0}
                value={profiel.kmPerDag}
                onChange={(e) => set("kmPerDag", parseFloat(e.target.value || "0"))}
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
            <FormField label="Privéwagen afstand km">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={profiel.privewagenKm}
                onChange={(e) => set("privewagenKm", parseFloat(e.target.value || "0"))}
              />
            </FormField>
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
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={profiel.busTramMetroKm}
                  onChange={(e) => set("busTramMetroKm", parseFloat(e.target.value || "0"))}
                />
              </FormField>
              <FormField label="OV prijs / maand (€)">
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min={0}
                  value={profiel.busTramMetroPrijs}
                  onChange={(e) => set("busTramMetroPrijs", parseFloat(e.target.value || "0"))}
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
              <input
                className={inputClass}
                type="number"
                min={0}
                value={profiel.treinKm}
                onChange={(e) => set("treinKm", parseFloat(e.target.value || "0"))}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Cataloguswaarde (€)">
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min={0}
                  value={profiel.bedrijfswagenCataloguswaarde}
                  onChange={(e) => set("bedrijfswagenCataloguswaarde", parseFloat(e.target.value || "0"))}
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
                  <input
                    className={inputClass}
                    type="number"
                    min={0}
                    value={profiel.bedrijfswagenCo2}
                    onChange={(e) => set("bedrijfswagenCo2", parseFloat(e.target.value || "0"))}
                  />
                </FormField>
              )}
            </div>
          )}
        </div>
      </FormSection>

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
    </>
  );
}

function GezinstypeField({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <FormField label="Gezinstype (voor BV)">
      <select
        className={selectClass}
        value={profiel.gezinstype}
        onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
      >
        <option value="alleenstaand">Alleenstaand / eenoudergezin</option>
        <option value="gehuwd_met_inkomen">Gehuwd - partner met inkomen</option>
        <option value="gehuwd_zonder_inkomen">Gehuwd - partner zonder inkomen</option>
      </select>
    </FormField>
  );
}

function KinderenVoorheffingFields({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  function setKinderenTenLaste(aantal: number) {
    set("kinderenTenLaste", aantal);
    set("kinderenOnder3", Math.min(profiel.kinderenOnder3, aantal));
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField label="Kinderen ten laste">
        <input
          className={inputClass}
          type="number"
          min={0}
          max={12}
          value={profiel.kinderenTenLaste}
          onChange={(e) => setKinderenTenLaste(parseInt(e.target.value || "0", 10))}
        />
      </FormField>
      <KinderenOnderDrieField profiel={profiel} set={set} />
    </div>
  );
}

function KinderenOnderDrieField({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <FormField
      label="Kinderen < 3 jaar"
      helper="Extra BV-vermindering: €76/m per kind, als er geen kinderopvangaftrek wordt toegepast."
    >
      <input
        className={inputClass}
        type="number"
        min={0}
        max={profiel.kinderenTenLaste}
        value={profiel.kinderenOnder3}
        onChange={(e) =>
          set("kinderenOnder3", Math.min(profiel.kinderenTenLaste, parseInt(e.target.value || "0", 10)))
        }
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
          { label: "Werkgeverskost", bedrag: summary.werkgeverskost, highlight: true },
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
  highlight = false,
  dimmed = false,
}: {
  label: string;
  bedrag: number;
  prefix?: string;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-navy-50)" }}>
      <td
        style={{
          padding: "7px 8px 7px 0",
          color: dimmed ? "var(--color-text-muted)" : highlight ? "var(--color-text)" : "var(--color-navy-500)",
          fontWeight: highlight ? 700 : 400,
          fontSize: highlight ? 15 : 13,
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "7px 0 7px 8px",
          textAlign: "right",
          fontFamily: "var(--font-mono)",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "var(--color-primary)" : dimmed ? "var(--color-text-muted)" : "var(--color-text)",
          fontSize: highlight ? 15 : 13,
        }}
      >
        {prefix !== "" ? `${prefix} ${formatEUR(bedrag)}` : formatEUR(bedrag)}
      </td>
    </tr>
  );
}

function NettoPanel({ resultaat: r }: { resultaat: NettoResultaat }) {
  const [bvDetailOpen, setBvDetailOpen] = useState(false);

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
        <strong>Validatie pending:</strong> BV wordt lokaal berekend met de Bijlage III-sleutelformule 2026 en is geankerd op Group S. Officiële FOD Tax-Calc waarden zijn nog niet ingevoerd; validatiestatus blijft daarom pending. BBSZ = kwartaalbedrag ÷ 3. Gemeentebelasting niet inbegrepen. Eindafrekening via PB-aangifte AJ 2027.
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Brutoloon" bedrag={r.brutoloon} prefix="" />
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
          {r.vaaBedrijfswagenPerMaand > 0 && (
            <NettoRow
              label="VAA bedrijfswagen (alleen BV-basis)"
              bedrag={r.vaaBedrijfswagenPerMaand}
              prefix="+"
              dimmed
            />
          )}
          <NettoRow label={`Bedrijfsvoorheffing (${r.bv.schaal}, vóór gezinsverminderingen)`} bedrag={r.bv.bvPerMaand} />
          {r.bv.verminderingKinderen > 0 && (
            <NettoRow
              label={`BV-vermindering kinderen ten laste`}
              bedrag={r.bv.verminderingKinderen}
              prefix="+"
              dimmed
            />
          )}
          {r.bv.verminderingKindOnder3 > 0 && (
            <NettoRow
              label={`BV-vermindering kind(eren) < 3 jaar`}
              bedrag={r.bv.verminderingKindOnder3}
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
          <NettoRow
            label={`BBSZ (kwartaal ${formatEUR(r.bbsz.kwartaalbijdrage)} ÷ 3)`}
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
              Nettoloon
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
              {formatEUR(r.nettoloon)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* BV detail — inklapbaar */}
      <div
        style={{
          marginTop: 14,
          borderTop: "1px solid var(--color-border)",
          paddingTop: 10,
          fontSize: 12,
          color: "var(--color-text-muted)",
        }}
      >
        <button
          onClick={() => setBvDetailOpen(!bvDetailOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-navy-500)",
          }}
        >
          {bvDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          BV-berekening detail
          <span style={{ fontWeight: 400, color: "var(--color-text-muted)", fontSize: 11 }}>
            ({bvDetailOpen ? "verbergen" : "9 rijen"})
          </span>
        </button>
        {bvDetailOpen && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 8 }}>
            <tbody>
              {[
                ["Methode", r.bv.methode],
                ["Schaal", r.bv.schaal],
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
        )}
      </div>

      {/* Audit bronnen */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <AuditPanel datapunt={r.werkbonus.datapunt} />
        <AuditPanel datapunt={r.bbsz.datapunt} />
        {r.bv.datapunten.map((dp) => (
          <AuditPanel key={dp.id} datapunt={dp} />
        ))}
      </div>
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
        Werkgeverskost (totale loonkost)
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
          <NettoRow label="Provisie eindejaarspremie (8,33%)" bedrag={r.provisieEindejaarspremie} prefix="+" dimmed />
          <NettoRow label="Provisie dubbel vakantiegeld (6,67%)" bedrag={r.provisieVakantiegeld} prefix="+" dimmed />
          {extras.groepsverzekering > 0 && (
            <NettoRow label="Patronale groepsverzekering" bedrag={extras.groepsverzekering} prefix="+" dimmed />
          )}
          {extras.maaltijdcheques > 0 && (
            <NettoRow label="Maaltijdcheques (werkgeversaandeel)" bedrag={extras.maaltijdcheques} prefix="+" dimmed />
          )}
          {extras.hospitalisatie > 0 && (
            <NettoRow label="Hospitalisatieverzekering" bedrag={extras.hospitalisatie} prefix="+" dimmed />
          )}
          {extras.ecocheques > 0 && (
            <NettoRow label={`Ecocheques (jaarlijks ÷ 12)`} bedrag={extras.ecocheques} prefix="+" dimmed />
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
              Totale loonkost — breed (CTC)
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
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {r.datapunten.map((dp) => (
          <AuditPanel key={dp.id} datapunt={dp} />
        ))}
      </div>
    </div>
  );
}

function WoonwerkVerkeerCard({ mobiliteit }: { mobiliteit: MobiliteitBerekening }) {
  const componenten = Object.values(mobiliteit.woonwerk.componenten).filter(
    (component): component is NonNullable<typeof component> => Boolean(component),
  );
  const datapunten = [
    ...mobiliteit.woonwerk.datapunten,
    ...(mobiliteit.vaaBedrijfswagen?.datapunten ?? []),
  ].filter((dp, index, all) => all.findIndex((item) => item.id === dp.id) === index);

  return (
    <ResultCard
      label="Woon-werk verkeer"
      amountEUR={mobiliteit.woonwerk.totaalVergoeding}
      datapunten={datapunten}
      helper={
        <div style={{ display: "grid", gap: 6 }}>
          {componenten.length === 0 && <span>Geen woon-werkvergoeding geselecteerd.</span>}
          {componenten.map((component) => (
            <div
              key={component.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                color: "var(--color-navy-500)",
              }}
            >
              <span>{component.label}</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{formatEUR(component.vergoeding)}</span>
            </div>
          ))}
          {mobiliteit.vaaBedrijfswagen && (
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                marginTop: 4,
                paddingTop: 6,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                color: "var(--color-navy-500)",
              }}
            >
              <span>VAA bedrijfswagen / maand</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {formatEUR(mobiliteit.vaaBedrijfswagen.vaaMaand)}
              </span>
            </div>
          )}
          {mobiliteit.woonwerk.waarschuwingen.map((waarschuwing) => (
            <span key={waarschuwing} style={{ color: "var(--color-warning)" }}>
              {waarschuwing}
            </span>
          ))}
        </div>
      }
    />
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
            const netto = berekenNetto({
              brutoloon: p.brutoloon,
              refDatum,
              bouwVlag: p.bouwVlag,
              gezinstype: p.gezinstype,
              kinderenTenLaste: p.kinderenTenLaste,
              kinderenOnder3: p.kinderenOnder3,
              fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
              groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
              maaltijdchequeWerknemersbijdragePerDag: heeftMaaltijdcheques
                ? p.maaltijdchequeWerknemersbijdragePerDag
                : 0,
              maaltijdchequeWerkdagen: heeftMaaltijdcheques ? p.arbeidsdagenPerMaand : 0,
              hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
              onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
              woonwerkVrijgesteldPerMaand: mobiliteit.woonwerk.totaalVergoeding,
              vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
            });
            const ecoResult = ecocheques({
              tewerkstellingsbreuk: p.tewerkstellingsbreuk,
              refDatum,
            });
            const wgk = werkgeverskost({
              brutoloon: p.brutoloon,
              refDatum,
              bouwVlag: p.bouwVlag,
              arbeidsongevallenPct: p.arbeidsongevallenPct,
              extraGroepsverzekering: p.extraGroepsverzekering,
              maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequeWerkgeversaandeelPerDag,
              maaltijdchequeWerkdagen: p.arbeidsdagenPerMaand,
              extraHospitalisatie: p.extraHospitalisatie,
              extraEcocheques: ecoResult.bedrag / 12,
              onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
              woonwerkVergoedingPerMaand: mobiliteit.woonwerk.totaalVergoeding,
            });
            const wig = loonwig(wgk.totaleLoonkostBreed, netto.nettoloon);
            return { netto, wgk, wig, ecoResult, mobiliteit };
          },
          ({ netto, wgk, wig, ecoResult, mobiliteit }) => (
            <div
              className="grid grid-cols-1 xl:grid-cols-2"
              style={{ gap: 12, alignItems: "flex-start" }}
            >
              <NettoPanel resultaat={netto} />
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
                  ecocheques: ecoResult.bedrag / 12,
                  woonwerk: mobiliteit.woonwerk.totaalVergoeding,
                  onkostenvergoeding: p.onkostenvergoedingPerMaand,
                }}
              />
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
          const r = lookupBarema(p.schaal, p.cat, p.ervaringJaren);
          const c = brutolocheck(p.schaal, p.cat, p.ervaringJaren, p.brutoloon);
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
        () => lookupStudentenbarema(p.studentenCat, p.studentLeeftijd),
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

  // Band 3 — Periodieke voordelen
  const voordelenBlocks: React.ReactNode[] = [];
  if (p.statuut === "bediende") {
    voordelenBlocks.push(
      safeRender(
        () => rszBijdragen({ brutoloon: p.brutoloon, refDatum, bouwVlag: p.bouwVlag }),
        (r) => (
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              padding: "1rem 1.1rem",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-navy-500)",
                marginBottom: 10,
                fontFamily: "var(--font-body)",
              }}
            >
              RSZ-bijdragen (op € {p.brutoloon.toFixed(2)})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {r.bronnen.map((b) => (
                  <tr key={b.datapunt.id} style={{ borderBottom: "1px solid var(--color-navy-50)" }}>
                    <td style={{ padding: "7px 8px 7px 0", color: "var(--color-navy-500)" }}>{b.label}</td>
                    <td
                      style={{
                        padding: "7px 0 7px 8px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      {formatEUR(b.bedrag)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--color-border)" }}>
                  <td style={{ padding: "8px 8px 4px 0", fontWeight: 600, color: "var(--color-text)", fontSize: 13 }}>
                    Totaal werkgeversbijdrage
                  </td>
                  <td
                    style={{
                      padding: "8px 0 4px 8px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      fontSize: 15,
                    }}
                  >
                    {formatEUR(r.totaalWerkgever)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {r.bronnen.map((b) => (
                <AuditPanel key={b.datapunt.id} datapunt={b.datapunt} />
              ))}
            </div>
          </div>
        ),
      ),
    );
    voordelenBlocks.push(
      safeRender(
        () =>
          eindejaarspremie({
            brutoloon: p.brutoloon,
            ancienniteitMaanden: p.ancienniteitMaanden,
            prestatieMaandenInRefertepériode: p.prestatieMaanden,
          }),
        (r) => (
          <ResultCard
            label="Eindejaarspremie (pro-rata)"
            amountEUR={r.premie}
            helper={r.toelichting}
            datapunten={[r.datapunt]}
          />
        ),
      ),
    );
  }
  voordelenBlocks.push(
    safeRender(
      () =>
        ecocheques({
          tewerkstellingsbreuk: p.tewerkstellingsbreuk,
          refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Ecocheques (${r.schaalLabel})`}
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );
  voordelenBlocks.push(
    safeRender(
      () => jaarlijksePremie2026(refDatum),
      (r) => (
        <ResultCard
          label="Jaarlijkse premie 2026"
          amountEUR={r.bedrag}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );
  bands.push({
    id: "band-voordelen",
    title: "Periodieke voordelen",
    shortLabel: "Voordelen",
    icon: <Gift size={14} />,
    blocks: voordelenBlocks,
  });

  // Band 4 — Mobiliteit
  const mobilityBlocks: React.ReactNode[] = [];
  mobilityBlocks.push(
    safeRender(
      () => berekenMobiliteitVoorProfiel(p, refDatum),
      (mobiliteit) => <WoonwerkVerkeerCard mobiliteit={mobiliteit} />,
    ),
  );
  bands.push({
    id: "band-mobiliteit",
    title: "Mobiliteit",
    shortLabel: "Mobiliteit",
    icon: <MapIcon size={14} />,
    blocks: mobilityBlocks,
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
    const netto = berekenNetto({
      brutoloon: p.brutoloon,
      refDatum,
      bouwVlag: p.bouwVlag,
      gezinstype: p.gezinstype,
      kinderenTenLaste: p.kinderenTenLaste,
      kinderenOnder3: p.kinderenOnder3,
      fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
      groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
      maaltijdchequeWerknemersbijdragePerDag: heeftMaaltijdcheques
        ? p.maaltijdchequeWerknemersbijdragePerDag
        : 0,
      maaltijdchequeWerkdagen: heeftMaaltijdcheques ? p.arbeidsdagenPerMaand : 0,
      hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
      onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
      woonwerkVrijgesteldPerMaand: mobiliteit.woonwerk.totaalVergoeding,
      vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
    });
    const ecoForSummary = ecocheques({
      tewerkstellingsbreuk: p.tewerkstellingsbreuk,
      refDatum,
    });
    const wgk = werkgeverskost({
      brutoloon: p.brutoloon,
      refDatum,
      bouwVlag: p.bouwVlag,
      arbeidsongevallenPct: p.arbeidsongevallenPct,
      extraGroepsverzekering: p.extraGroepsverzekering,
      maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequeWerkgeversaandeelPerDag,
      maaltijdchequeWerkdagen: p.arbeidsdagenPerMaand,
      extraHospitalisatie: p.extraHospitalisatie,
      extraEcocheques: ecoForSummary.bedrag / 12,
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
