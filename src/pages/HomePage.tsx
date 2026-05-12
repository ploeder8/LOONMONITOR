import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Leaf,
  Bike,
  Train,
  TrendingUp,
  Calculator,
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
  fietsvergoeding,
  FIETSVERGOEDING_HISTORISCHE_BANNER,
} from "@/lib/fietsvergoeding";
import { woonwerkTrein } from "@/lib/woonwerkTrein";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { indexeerLoon } from "@/lib/indexatie";
import { berekenNetto } from "@/lib/netto";
import type { GezinsType, NettoResultaat } from "@/lib/netto";
import { werkgeverskost, loonwig, type WerkgeverskostResultaat } from "@/lib/werkgeverskost";
import {
  BaremaBuitenSchaalError,
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
  PC200DatasetError,
} from "@/lib/errors";
import { formatEUR } from "@/lib/money";

type Modus = "bediende" | "student";

interface Profiel {
  modus: Modus;
  schaal: Schaal;
  cat: BaremaCat;
  ervaringJaren: number;
  studentenCat: StudentenCat;
  studentLeeftijd: number;
  brutoloon: number;
  bouwVlag: boolean;
  refDatum: string;
  ancienniteitMaanden: number;
  prestatieMaanden: number;
  tewerkstellingsbreuk: number;
  kmPerDag: number;
  arbeidsdagenPerMaand: number;
  treinkaartPrijs: number;
  oudLoon: number;
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  kinderenOnder3: number;
  fiscaalAlleenstaandeMetKind: boolean;
  groepsverzekeringEigenBijdrage: number;
  // Werkgeversbijdragen (extralegale voordelen)
  arbeidsongevallenPct: number;
  extraGroepsverzekering: number;
  extraMaaltijdcheques: number;
  extraHospitalisatie: number;
}

const DEFAULTS: Profiel = {
  modus: "bediende",
  schaal: "I",
  cat: "A",
  ervaringJaren: 5,
  studentenCat: "A",
  studentLeeftijd: 17,
  brutoloon: 2276.51,
  bouwVlag: false,
  refDatum: "2026-06-01",
  ancienniteitMaanden: 12,
  prestatieMaanden: 12,
  tewerkstellingsbreuk: 1,
  kmPerDag: 8,
  arbeidsdagenPerMaand: 22,
  treinkaartPrijs: 92,
  oudLoon: 3500,
  gezinstype: "alleenstaand",
  kinderenTenLaste: 0,
  kinderenOnder3: 0,
  fiscaalAlleenstaandeMetKind: false,
  groepsverzekeringEigenBijdrage: 0,
  arbeidsongevallenPct: 0.003,
  extraGroepsverzekering: 0,
  extraMaaltijdcheques: 0,
  extraHospitalisatie: 0,
};

export function HomePage() {
  const [p, setP] = useState<Profiel>(DEFAULTS);

  function set<K extends keyof Profiel>(k: K, v: Profiel[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
      <ProfileForm profiel={p} set={set} />
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Banner kind="error" title="Onverwachte fout">
            <p>{(error as Error).message}</p>
            <button
              onClick={resetErrorBoundary}
              style={{
                marginTop: 8,
                borderRadius: 4,
                background: "#e8dfcf",
                border: "none",
                padding: "4px 12px",
                fontSize: 12,
                cursor: "pointer",
                color: "#3c3c3b",
              }}
            >
              Opnieuw proberen
            </button>
          </Banner>
        )}
        resetKeys={[JSON.stringify(p)]}
      >
        <ResultsPanel profiel={p} />
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
        border: "1px solid #e2ddd5",
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
          background: open ? "#f5f0e8" : "#faf8f4",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
          gap: 8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e8dfcf")}
        onMouseLeave={(e) => (e.currentTarget.style.background = open ? "#f5f0e8" : "#faf8f4")}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#5a5a59",
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.01em",
          }}
        >
          {icon && <span style={{ color: "#9a8b7a" }}>{icon}</span>}
          {label}
        </span>
        {open
          ? <ChevronUp size={14} style={{ color: "#9a8b7a" }} />
          : <ChevronDown size={14} style={{ color: "#9a8b7a" }} />
        }
      </button>
      {open && (
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "#ffffff",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── ProfileForm ─────────────────────────────────────────────────────────────

function ProfileForm({
  profiel,
  set,
}: {
  profiel: Profiel;
  set: <K extends keyof Profiel>(k: K, v: Profiel[K]) => void;
}) {
  return (
    <aside
      className="lg:sticky lg:self-start"
      style={{
        top: 73,
        maxHeight: "calc(100vh - 73px - 56px)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderRadius: 14,
        border: "1px solid #e2ddd5",
        background: "#ffffff",
        padding: "1.2rem 1.1rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          fontWeight: 600,
          color: "#3c3c3b",
          letterSpacing: "-0.01em",
          margin: 0,
        }}
      >
        Profiel
      </h2>

      <FormField label="Modus">
        <select
          className={selectClass}
          value={profiel.modus}
          onChange={(e) => set("modus", e.target.value as Modus)}
        >
          <option value="bediende">Bediende (Schaal I/II)</option>
          <option value="student">Student</option>
        </select>
      </FormField>

      <FormField label="Referentiedatum">
        <input
          className={inputClass}
          type="date"
          value={profiel.refDatum}
          onChange={(e) => set("refDatum", e.target.value)}
        />
      </FormField>

      {profiel.modus === "bediende" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
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
              color: "#5a5a59",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={profiel.bouwVlag}
              onChange={(e) => set("bouwVlag", e.target.checked)}
              style={{ accentColor: "#7b6a58", width: 15, height: 15 }}
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
              label="Maaltijdcheques — werkgeversaandeel (€/m)"
              helper="Max €6,91/dag × arbeidsdagen. Niet verplicht in PC 200."
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                value={profiel.extraMaaltijdcheques}
                onChange={(e) =>
                  set("extraMaaltijdcheques", parseFloat(e.target.value || "0"))
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
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Anciënniteit (mnd)">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={profiel.ancienniteitMaanden}
              onChange={(e) => set("ancienniteitMaanden", parseInt(e.target.value || "0", 10))}
            />
          </FormField>
          <FormField label="Prestatie-maanden">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={12}
              value={profiel.prestatieMaanden}
              onChange={(e) => set("prestatieMaanden", parseInt(e.target.value || "0", 10))}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Ecocheques" icon={<Leaf size={13} />}>
        <FormField label="Tewerkstellingsbreuk (0 – 1)">
          <input
            className={inputClass}
            type="number"
            step="0.1"
            min={0}
            max={1}
            value={profiel.tewerkstellingsbreuk}
            onChange={(e) => set("tewerkstellingsbreuk", parseFloat(e.target.value || "0"))}
          />
        </FormField>
      </FormSection>

      <FormSection label="Fietsvergoeding" icon={<Bike size={13} />}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Km per dag">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={profiel.kmPerDag}
              onChange={(e) => set("kmPerDag", parseFloat(e.target.value || "0"))}
            />
          </FormField>
          <FormField label="Arbeidsdagen / maand">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={31}
              value={profiel.arbeidsdagenPerMaand}
              onChange={(e) => set("arbeidsdagenPerMaand", parseInt(e.target.value || "0", 10))}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Woon-werk trein" icon={<Train size={13} />}>
        <FormField label="Treinkaart 2e klasse / maand (€)">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min={0}
            value={profiel.treinkaartPrijs}
            onChange={(e) => set("treinkaartPrijs", parseFloat(e.target.value || "0"))}
          />
        </FormField>
      </FormSection>

      <FormSection label="Indexatie" icon={<TrendingUp size={13} />}>
        <FormField label="Loon op 31/12/2025 (€)">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min={0}
            value={profiel.oudLoon}
            onChange={(e) => set("oudLoon", parseFloat(e.target.value || "0"))}
          />
        </FormField>
      </FormSection>

      {profiel.modus === "bediende" && (
        <FormSection label="Netto berekening" icon={<Calculator size={13} />} defaultOpen>
          <FormField label="Gezinstype (voor BV)">
            <select
              className={selectClass}
              value={profiel.gezinstype}
              onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
            >
              <option value="alleenstaand">Alleenstaand / eenoudergezin</option>
              <option value="gehuwd_met_inkomen">Gehuwd – partner met inkomen</option>
              <option value="gehuwd_zonder_inkomen">Gehuwd – partner zonder inkomen</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kinderen ten laste">
              <input
                className={inputClass}
                type="number"
                min={0}
                max={12}
                value={profiel.kinderenTenLaste}
                onChange={(e) => set("kinderenTenLaste", parseInt(e.target.value || "0", 10))}
              />
            </FormField>
            <FormField label="waarvan < 3 jaar">
              <input
                className={inputClass}
                type="number"
                min={0}
                max={profiel.kinderenTenLaste}
                value={profiel.kinderenOnder3}
                onChange={(e) => set("kinderenOnder3", Math.min(profiel.kinderenTenLaste, parseInt(e.target.value || "0", 10)))}
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
                color: "#5a5a59",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={profiel.fiscaalAlleenstaandeMetKind}
                onChange={(e) => set("fiscaalAlleenstaandeMetKind", e.target.checked)}
                style={{ accentColor: "#7b6a58", width: 15, height: 15 }}
              />
              Fiscaal alleenstaande ouder (+€52 BV-vermindering)
            </label>
          )}
          <FormField label="Groepsverz. eigen bijdrage (€/m)">
            <input
              className={inputClass}
              type="number"
              step="0.01"
              min={0}
              value={profiel.groepsverzekeringEigenBijdrage}
              onChange={(e) => set("groepsverzekeringEigenBijdrage", parseFloat(e.target.value || "0"))}
            />
          </FormField>
        </FormSection>
      )}
    </aside>
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
    profiel.modus === "bediende"
      ? [
          { label: "Bruto", bedrag: summary.bruto },
          { label: "Netto", bedrag: summary.netto, highlight: true },
          { label: "Werkgeverskost", bedrag: summary.werkgeverskost, highlight: true },
          { label: "Loonwig", bedrag: summary.loonwig, format: "PCT" },
        ]
      : [{ label: "Bruto (student)", bedrag: summary.bruto, highlight: true }];

  const anchors: JumpAnchor[] = bands.map((b) => ({ id: b.id, label: b.shortLabel }));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    <tr style={{ borderBottom: "1px solid #f5f0e8" }}>
      <td
        style={{
          padding: "7px 8px 7px 0",
          color: dimmed ? "#9a8b7a" : highlight ? "#3c3c3b" : "#5a5a59",
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
          color: highlight ? "#7b6a58" : dimmed ? "#9a8b7a" : "#3c3c3b",
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
        borderRadius: 14,
        border: "2px solid #cbbba0",
        background: "#ffffff",
        padding: "1rem 1.1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#3c3c3b",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.01em",
          marginBottom: 12,
        }}
      >
        Netto berekening (per maand)
      </div>

      {/* Approximatie disclaimer */}
      <div
        style={{
          background: "#f5f0e8",
          border: "1px solid #cbbba0",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
          color: "#7b6a58",
          marginBottom: 14,
          lineHeight: 1.5,
        }}
      >
        <strong>Benadering:</strong> BV berekend volgens AJ 2027 schijven (€11.180 belastingvrije som, max forfait €6.070) — algoritmische benadering, niet de exacte sleutelformule Bijlage III KB 11/12/2025. Verwacht ±€5–€15/maand afwijking t.o.v. FOD Tax-Calc. BBSZ = kwartaalbedrag ÷ 3. Gemeentebelasting niet inbegrepen. Eindafrekening via PB-aangifte AJ 2027.
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
          <NettoRow label="Bedrijfsvoorheffing (vóór gezinsverminderingen)" bedrag={r.bv.bvPerMaand} />
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
          <tr style={{ borderTop: "2px solid #cbbba0" }}>
            <td
              style={{
                padding: "10px 8px 4px 0",
                fontWeight: 700,
                color: "#3c3c3b",
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
                color: "#7b6a58",
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
          borderTop: "1px solid #e2ddd5",
          paddingTop: 10,
          fontSize: 12,
          color: "#9a8b7a",
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
            color: "#5a5a59",
          }}
        >
          {bvDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          BV-berekening detail
          <span style={{ fontWeight: 400, color: "#9a8b7a", fontSize: 11 }}>
            ({bvDetailOpen ? "verbergen" : "9 rijen"})
          </span>
        </button>
        {bvDetailOpen && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 8 }}>
            <tbody>
              {[
                ["Belastbaar jaarloon", formatEUR(r.bv.jaarbasis)],
                ["Forfait beroepskosten (30%, max € 6.070 AJ 2027)", `- ${formatEUR(r.bv.forfaitBeroepskosten)}`],
                ["Belastbaar netto-inkomen", formatEUR(r.bv.belastbaarNettoJaar)],
                ["Belastingvrije som (AJ 2027)", formatEUR(r.bv.belastingvrijeSom)],
                ["PB (bruto, schijven 25/40/45/50%)", formatEUR(r.bv.pbBruto)],
                ["BVS-vermindering (BVS × 25%)", `- ${formatEUR(r.bv.bvsVermindering)}`],
                ["PB (netto, jaarbasis)", formatEUR(r.bv.pbNetto)],
                ["BV / maand (vóór gezinsvermindering)", formatEUR(r.bv.bvPerMaand)],
                ["BV / maand (na gezinsvermindering)", formatEUR(r.bv.bvNaVerminderingen)],
              ].map(([lbl, val]) => (
                <tr key={lbl} style={{ borderBottom: "1px solid #f5f0e8" }}>
                  <td style={{ padding: "4px 6px 4px 0", color: "#9a8b7a" }}>{lbl}</td>
                  <td style={{ padding: "4px 0 4px 6px", textAlign: "right", fontFamily: "var(--font-mono)", color: "#5a5a59" }}>{val}</td>
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
  };
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "2px solid #cbbba0",
        background: "#ffffff",
        padding: "1rem 1.1rem",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#3c3c3b",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.01em",
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
          <tr style={{ borderTop: "1px solid #e2ddd5" }}>
            <td style={{ padding: "8px 8px 4px 0", fontWeight: 600, color: "#5a5a59", fontSize: 13 }}>
              Totale loonkost — smal
            </td>
            <td
              style={{
                padding: "8px 0 4px 8px",
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "#5a5a59",
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
          <tr style={{ borderTop: "2px solid #cbbba0" }}>
            <td
              style={{
                padding: "10px 8px 4px 0",
                fontWeight: 700,
                color: "#3c3c3b",
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
                color: "#7b6a58",
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
          background: "#f5f0e8",
          border: "1px solid #cbbba0",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 13,
          color: "#3c3c3b",
        }}
      >
        <strong>Loonwig: {(loonwigPct * 100).toFixed(1)} %</strong>
        <span style={{ color: "#9a8b7a", marginLeft: 8 }}>
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

// ─── bouwResultaten ───────────────────────────────────────────────────────────

function bouwResultaten(p: Profiel): BouwResultaten {
  const summary = computeSummary(p);
  const bands: ResultBandSpec[] = [];

  // Band 1 — Loonkost & netto (bediende only, FIRST per plan)
  if (p.modus === "bediende") {
    bands.push({
      id: "band-loonkost",
      title: "Loonkost & netto",
      shortLabel: "Loonkost",
      icon: <Wallet size={14} />,
      blocks: [
        safeRender(
          () => {
            const netto = berekenNetto({
              brutoloon: p.brutoloon,
              refDatum: p.refDatum,
              bouwVlag: p.bouwVlag,
              gezinstype: p.gezinstype,
              kinderenTenLaste: p.kinderenTenLaste,
              kinderenOnder3: p.kinderenOnder3,
              fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
              groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
            });
            const ecoResult = ecocheques({
              tewerkstellingsbreuk: p.tewerkstellingsbreuk,
              refDatum: p.refDatum,
            });
            const wgk = werkgeverskost({
              brutoloon: p.brutoloon,
              refDatum: p.refDatum,
              bouwVlag: p.bouwVlag,
              arbeidsongevallenPct: p.arbeidsongevallenPct,
              extraGroepsverzekering: p.extraGroepsverzekering,
              extraMaaltijdcheques: p.extraMaaltijdcheques,
              extraHospitalisatie: p.extraHospitalisatie,
              extraEcocheques: ecoResult.bedrag / 12,
            });
            const wig = loonwig(wgk.totaleLoonkostBreed, netto.nettoloon);
            return { netto, wgk, wig, ecoResult };
          },
          ({ netto, wgk, wig, ecoResult }) => (
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
                  maaltijdcheques: p.extraMaaltijdcheques,
                  hospitalisatie: p.extraHospitalisatie,
                  ecocheques: ecoResult.bedrag / 12,
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
  if (p.modus === "bediende") {
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
  if (p.modus === "bediende") {
    voordelenBlocks.push(
      safeRender(
        () => rszBijdragen({ brutoloon: p.brutoloon, refDatum: p.refDatum, bouwVlag: p.bouwVlag }),
        (r) => (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid #e2ddd5",
              background: "#ffffff",
              padding: "1rem 1.1rem",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#5a5a59",
                marginBottom: 10,
                fontFamily: "var(--font-body)",
              }}
            >
              RSZ-bijdragen (op € {p.brutoloon.toFixed(2)})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {r.bronnen.map((b) => (
                  <tr key={b.datapunt.id} style={{ borderBottom: "1px solid #f5f0e8" }}>
                    <td style={{ padding: "7px 8px 7px 0", color: "#5a5a59" }}>{b.label}</td>
                    <td
                      style={{
                        padding: "7px 0 7px 8px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        color: "#3c3c3b",
                      }}
                    >
                      {formatEUR(b.bedrag)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #e2ddd5" }}>
                  <td style={{ padding: "8px 8px 4px 0", fontWeight: 600, color: "#3c3c3b", fontSize: 13 }}>
                    Totaal werkgeversbijdrage
                  </td>
                  <td
                    style={{
                      padding: "8px 0 4px 8px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "#7b6a58",
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
          refDatum: p.refDatum,
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
      () => jaarlijksePremie2026(p.refDatum),
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

  // Band 4 — Mobiliteit & indexatie
  const mobilityBlocks: React.ReactNode[] = [];
  mobilityBlocks.push(
    safeRender(
      () =>
        woonwerkTrein({
          treinkaartPrijsPerMaand: p.treinkaartPrijs,
          refDatum: p.refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Woon-werk trein (${(r.fractie * 100).toFixed(0)} %)`}
          amountEUR={r.werkgeverstussenkomst}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );
  if (p.refDatum < "2026-10-01") {
    mobilityBlocks.push(
      <Banner kind="info" title="Fietsvergoeding — historisch tarief">
        {FIETSVERGOEDING_HISTORISCHE_BANNER}
      </Banner>,
    );
  }
  mobilityBlocks.push(
    safeRender(
      () =>
        fietsvergoeding({
          kmPerDag: p.kmPerDag,
          arbeidsdagen: p.arbeidsdagenPerMaand,
          refDatum: p.refDatum,
        }),
      (r) => (
        <ResultCard
          label={`Fietsvergoeding (€ ${r.tariefPerKm.toFixed(2)} / km × ${p.kmPerDag} km × ${p.arbeidsdagenPerMaand} dagen)`}
          amountEUR={r.vergoeding}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );
  mobilityBlocks.push(
    safeRender(
      () => indexeerLoon({ oudLoon: p.oudLoon, refDatum: p.refDatum }),
      (r) => (
        <ResultCard
          label={`Indexatie ondernemingsloon (× ${r.coefficient})`}
          amountEUR={r.nieuwLoon}
          helper={`Oud loon: ${formatEUR(r.oudLoon)} × ${r.coefficient}`}
          datapunten={[r.datapunt]}
        />
      ),
    ),
  );
  bands.push({
    id: "band-mobiliteit",
    title: "Mobiliteit & indexatie",
    shortLabel: "Mobiliteit",
    icon: <MapIcon size={14} />,
    blocks: mobilityBlocks,
  });

  return { summary, bands };
}

function computeSummary(p: Profiel): ResultSummary {
  if (p.modus !== "bediende") {
    return { bruto: p.brutoloon, netto: null, werkgeverskost: null, loonwig: null };
  }
  try {
    const netto = berekenNetto({
      brutoloon: p.brutoloon,
      refDatum: p.refDatum,
      bouwVlag: p.bouwVlag,
      gezinstype: p.gezinstype,
      kinderenTenLaste: p.kinderenTenLaste,
      kinderenOnder3: p.kinderenOnder3,
      fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
      groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
    });
    const ecoForSummary = ecocheques({
      tewerkstellingsbreuk: p.tewerkstellingsbreuk,
      refDatum: p.refDatum,
    });
    const wgk = werkgeverskost({
      brutoloon: p.brutoloon,
      refDatum: p.refDatum,
      bouwVlag: p.bouwVlag,
      arbeidsongevallenPct: p.arbeidsongevallenPct,
      extraGroepsverzekering: p.extraGroepsverzekering,
      extraMaaltijdcheques: p.extraMaaltijdcheques,
      extraHospitalisatie: p.extraHospitalisatie,
      extraEcocheques: ecoForSummary.bedrag / 12,
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
