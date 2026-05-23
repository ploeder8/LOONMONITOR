import { useMemo, useState, type ReactNode } from "react";
import { Briefcase, Wallet } from "lucide-react";

import { AuditOpenProvider, type AuditForceState } from "@/components/AuditPanel";
import { Banner } from "@/components/Banner";
import { ResultBand } from "@/components/ResultBand";
import { ResultCard } from "@/components/ResultCard";
import type { JumpAnchor } from "@/components/ResultsSummaryStrip";
import {
  BaremaBuitenSchaalError,
  DatapuntNietBruikbaar,
  DatapuntNietGeldigOpDatum,
  PC200DatasetError,
} from "@/lib/errors";
import { formatEUR } from "@/lib/money";
import {
  heeftMaaltijdcheques,
  refDatumVoorMaand,
  tewerkstellingsbreukNaarPercentage,
  type Profiel,
} from "@/lib/profiel";
import {
  berekenBediendeLoonbasisVoorProfiel,
  berekenJaaroverzichtVoorProfiel,
  berekenLoonwigVoorProfielResultaat,
  berekenMaaltijdchequeWerkgeverskostVoorProfiel,
  berekenMobiliteitVoorProfiel,
  berekenNettoVoorProfiel,
  berekenProfielKernOutputs,
  berekenStudentenBaremaVoorProfiel,
  berekenVaaWerkmiddelenVoorProfiel,
  berekenWerkgeverskostVoorProfiel,
} from "@/lib/profielBerekeningen";
import { NettoJaaroverzichtPanel, WerkgeverJaaroverzichtPanel } from "@/pages/home/JaaroverzichtPanelen";
import { NettoPanel } from "@/pages/home/NettoPanelen";
import { WerkgeverskostPanel } from "@/pages/home/WerkgeverskostPanel";
import type { BouwResultaten, ResultBandSpec, ResultSummary } from "@/pages/home/types";

export function ResultBandsPanel({
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
            const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
            const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
            const netto = berekenNettoVoorProfiel(p, refDatum);
            const wgk = berekenWerkgeverskostVoorProfiel(
              p,
              refDatum,
              vaaWerkmiddelen,
              mobiliteit,
            );
            const jaaroverzicht = berekenJaaroverzichtVoorProfiel(
              p,
              refDatum,
              netto,
              wgk,
              vaaWerkmiddelen,
              mobiliteit,
            );
            const wig = berekenLoonwigVoorProfielResultaat(wgk, netto);
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
                    maaltijdcheques: berekenMaaltijdchequeWerkgeverskostVoorProfiel(p),
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
  const loonbasisBlocks: ReactNode[] = [];
  if (p.statuut === "bediende") {
    loonbasisBlocks.push(
      safeRender(
        () => berekenBediendeLoonbasisVoorProfiel(p, refDatum),
        ({ barema: r, check: c }) => (
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
        () => berekenStudentenBaremaVoorProfiel(p, refDatum),
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

export function computeSummary(p: Profiel): ResultSummary {
  const outputs = berekenProfielKernOutputs(p);
  return {
    bruto: outputs.bruto,
    netto: outputs.netto,
    werkgeverskost: outputs.werkgeverskostMaand,
    loonwig: outputs.loonwigPct,
  };
}
