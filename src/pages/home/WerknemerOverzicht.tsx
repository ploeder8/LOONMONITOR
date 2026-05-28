import { FileText } from "lucide-react";
import { APP_BRAND } from "@/branding/brand";
import { formatEUR } from "@/lib/money";
import { refDatumVoorMaand, type Profiel } from "@/lib/profiel";
import {
  berekenNettoVoorProfiel,
  berekenWerkgeverskostVoorProfiel,
  berekenJaaroverzichtVoorProfiel,
  berekenVaaWerkmiddelenVoorProfiel,
  berekenMobiliteitVoorProfiel,
  berekenLoonwigVoorProfielResultaat,
} from "@/lib/profielBerekeningen";

interface WerknemerOverzichtProps {
  profiel: Profiel;
}

export function WerknemerOverzicht({ profiel }: WerknemerOverzichtProps) {
  const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
  const generatieDatum = new Date().toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maandNamen = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  const maandIdx = parseInt(profiel.berekeningsMaand, 10) - 1;
  const periode = `${maandNamen[maandIdx] ?? profiel.berekeningsMaand} ${profiel.berekeningsJaar}`;

  let netto = null;
  let wgk = null;
  let loonwigPct: number | null = null;
  let jaaroverzicht = null;

  if (profiel.statuut === "bediende") {
    try {
      const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum);
      const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);
      netto = berekenNettoVoorProfiel(profiel, refDatum);
      wgk = berekenWerkgeverskostVoorProfiel(profiel, refDatum, vaaWerkmiddelen, mobiliteit);
      loonwigPct = berekenLoonwigVoorProfielResultaat(wgk, netto);
      jaaroverzicht = berekenJaaroverzichtVoorProfiel(
        profiel,
        refDatum,
        netto,
        wgk,
        vaaWerkmiddelen,
        mobiliteit,
      );
    } catch {
      // errors handled below
    }
  }

  const isStudent = profiel.statuut === "student";

  return (
    <div
      className="werknemer-overzicht-document"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {/* Pro-forma banner */}
      <div
        className="wo-banner"
        style={{
          background: "var(--color-primary-soft)",
          borderBottom: "1px solid var(--color-primary-border)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        <FileText size={16} />
        Pro-forma overzicht — geen officiële loonafrekening
      </div>

      <div className="wo-content" style={{ padding: "28px 32px 32px" }}>
        {/* Header */}
        <div
          className="wo-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--color-text)",
                letterSpacing: 0,
                marginBottom: 4,
              }}
            >
              Loonoverzicht
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {APP_BRAND.name} — {APP_BRAND.productLabel}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {periode}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {isStudent ? "Student" : "Bediende"}
              {profiel.tewerkstellingsbreuk < 1
                ? ` · ${Math.round(profiel.tewerkstellingsbreuk * 100)}%`
                : ""}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {generatieDatum}
            </div>
          </div>
        </div>

        {/* Metadata grid */}
        {(profiel.werknemerNaam || profiel.werkgeverNaam) && (
          <div
            className="wo-metadata"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {profiel.werknemerNaam && (
              <MetaCard label="Werknemer" value={profiel.werknemerNaam} />
            )}
            {profiel.werknemerReferentie && (
              <MetaCard label="Referentie" value={profiel.werknemerReferentie} />
            )}
            {profiel.werkgeverNaam && (
              <MetaCard label="Werkgever" value={profiel.werkgeverNaam} />
            )}
            {profiel.werkgeverOndernemingsnummer && (
              <MetaCard label="Ondernemingsnummer" value={profiel.werkgeverOndernemingsnummer} />
            )}
          </div>
        )}

        {/* Executive Summary */}
        {netto && wgk && (
          <div
            className="wo-summary wo-summary-grid"
            style={{
              display: "grid",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <SummaryCard label="Bruto" bedrag={netto.brutoRszBasis} />
            <SummaryCard label="Netto (maand)" bedrag={netto.nettoloon} />
            <SummaryCard label="Werkgeverskost" bedrag={wgk.totaleLoonkostBreed} accent />
            <SummaryCard label="Loonwig" bedrag={loonwigPct} isPercentage />
            <SummaryCard label="Netto (jaar)" bedrag={jaaroverzicht?.netto.totaalNettoJaarloon ?? null} />
            <SummaryCard label="WGK (jaar)" bedrag={jaaroverzicht?.werkgever.totaleLoonkostJaar ?? null} />
          </div>
        )}

        {isStudent && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 24px",
              color: "var(--color-text-muted)",
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>Studentenmodus</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Voor studenten worden geen RSZ, bedrijfsvoorheffing of werkgeverskost berekend.
            </div>
          </div>
        )}

        {/* Netto componenten tabel */}
        {netto && (
          <Section title="Netto loon (maand)" className="wo-section">
            <CompactTable
              rows={[
                { label: "Brutoloon", bedrag: netto.brutoloon },
                { label: "RSZ werknemer", bedrag: -netto.rsz.werknemerBijdrage },
                ...(netto.werkbonus.totaal > 0
                  ? [{ label: "Werkbonus", bedrag: netto.werkbonus.totaal }]
                  : []),
                { label: "Belastbaar loon", bedrag: netto.belastbaarMaandloon, bold: true },
                { label: "Bedrijfsvoorheffing", bedrag: -netto.bv.bvNaVerminderingen },
                ...(netto.bbsz.maandelijksBedrag > 0
                  ? [{ label: "BBSZ", bedrag: -netto.bbsz.maandelijksBedrag }]
                  : []),
                ...(netto.maaltijdchequeWerknemersbijdrage > 0
                  ? [{ label: "Maaltijdcheques (werknemer)", bedrag: -netto.maaltijdchequeWerknemersbijdrage }]
                  : []),
                ...(netto.hospitalisatieEigenBijdrage > 0
                  ? [{ label: "Hospitalisatie (eigen bijdrage)", bedrag: -netto.hospitalisatieEigenBijdrage }]
                  : []),
                { label: "Netto te betalen (cash)", bedrag: netto.nettoloon, bold: true, highlight: true },
                ...(profiel.maaltijdchequesActief && profiel.arbeidsdagenPerMaand > 0
                  ? [
                      {
                        label: "Maaltijdcheques (waarde)",
                        bedrag: round2(
                          (profiel.maaltijdchequeWerkgeversaandeelPerDag +
                            profiel.maaltijdchequeWerknemersbijdragePerDag) *
                            profiel.arbeidsdagenPerMaand,
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </Section>
        )}

        {/* Werkgeverskost tabel */}
        {wgk && (
          <Section title="Werkgeverskost (maand)" className="wo-section">
            <CompactTable
              rows={[
                { label: "Brutoloon", bedrag: wgk.brutoloon },
                { label: "RSZ werkgever", bedrag: wgk.rszWerkgever },
                { label: "Sociaal Fonds 200", bedrag: wgk.sociaalFonds200 },
                ...(wgk.bouwAanvullendPensioen ? [{ label: "Bouw-aanvullend pensioen", bedrag: wgk.bouwAanvullendPensioen }] : []),
                { label: "Arbeidsongevallen", bedrag: wgk.arbeidsongevallen },
                { label: "Provisie eindejaarspremie", bedrag: wgk.provisieEindejaarspremie },
                { label: "Provisie vakantiegeld", bedrag: wgk.provisieVakantiegeld },
                ...(wgk.extraVoordelen > 0
                  ? [{ label: "Extralegale voordelen", bedrag: wgk.extraVoordelen }]
                  : []),
                { label: "Totale werkgeverskost", bedrag: wgk.totaleLoonkostBreed, bold: true, highlight: true },
              ]}
            />
          </Section>
        )}

        {/* Jaaroverzicht */}
        {jaaroverzicht && (
          <Section title="Jaaroverzicht" className="wo-section">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Werknemer (netto)
                </div>
                <YearRow label="Maandloon × 12" bedrag={jaaroverzicht.netto.maandloonNettoX12} />
                <YearRow label="Eindejaarspremie" bedrag={jaaroverzicht.netto.eindejaarspremie.netto} />
                <YearRow label="Dubbel vakantiegeld" bedrag={jaaroverzicht.netto.dubbelVakantiegeld.netto} />
                <YearRow label="Jaarpremie PC 200" bedrag={jaaroverzicht.netto.jaarpremie.netto} />
                <YearRow label="Ecocheques" bedrag={jaaroverzicht.netto.ecocheques} />
                <YearRow label="Totaal netto jaar" bedrag={jaaroverzicht.netto.totaalNettoJaarloon} bold />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Werkgever
                </div>
                <YearRow label="Maandbasis × 12" bedrag={jaaroverzicht.werkgever.maandbasisX12} />
                <YearRow label="Jaarpremies + ecocheques" bedrag={jaaroverzicht.werkgever.jaarpremiesEnEcocheques} />
                <YearRow label="RSZ op premies" bedrag={jaaroverzicht.werkgever.rszOpEindejaarspremieEnJaarpremie} />
                <YearRow label="Dubbel vakantiegeld" bedrag={jaaroverzicht.werkgever.dubbelVakantiegeld} />
                {/* Spacer om totalen uit te lijnen met linker kolom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid transparent' }}>
                  <span style={{ fontSize: 13 }}>&nbsp;</span>
                  <span style={{ fontSize: 13 }}>&nbsp;</span>
                </div>
                <YearRow label="Totaal loonkost jaar" bedrag={jaaroverzicht.werkgever.totaleLoonkostJaar} bold />
              </div>
            </div>
          </Section>
        )}

        {/* Footer */}
        <div
          className="wo-footer"
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}
        >
          <div>
            Dit overzicht is opgesteld als pro-forma simulatie via {APP_BRAND.name} en is niet bedoeld als officiële loonafrekening.
          </div>
          <div style={{ marginTop: 4 }}>
            Loonwig = het percentage van de werkgeverskost dat niet uitbetaald wordt als netto loon (belastingen, RSZ, sociale bijdragen, extralegale voordelen).
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--color-navy-50)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 2,
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  bedrag,
  isPercentage,
  accent,
}: {
  label: string;
  bedrag: number | null;
  isPercentage?: boolean;
  accent?: boolean;
}) {
  const value =
    bedrag === null
      ? "—"
      : isPercentage
        ? `${bedrag.toFixed(2)}%`
        : formatEUR(bedrag);

  return (
    <div
      style={{
        background: accent ? "var(--color-primary-soft)" : "var(--color-surface)",
        border: accent
          ? "1px solid var(--color-primary-border)"
          : "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          fontWeight: 700,
          color: accent ? "var(--color-primary)" : "var(--color-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: 10,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function CompactTable({
  rows,
}: {
  rows: Array<{
    label: string;
    bedrag: number;
    bold?: boolean;
    highlight?: boolean;
  }>;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
          fontFamily: "var(--font-body)",
        }}
      >
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--color-navy-50)" : undefined,
                background: row.highlight ? "var(--color-navy-50)" : undefined,
              }}
            >
              <td
                style={{
                  padding: "8px 12px",
                  color: "var(--color-text)",
                  fontWeight: row.bold ? 700 : 400,
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: row.bold ? 700 : 400,
                  color: row.highlight ? "var(--color-primary)" : "var(--color-text)",
                }}
              >
                {formatEUR(row.bedrag)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function YearRow({
  label,
  bedrag,
  bold,
}: {
  label: string;
  bedrag: number;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid var(--color-navy-50)",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "var(--color-text)",
          fontWeight: bold ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          fontWeight: bold ? 700 : 400,
          color: "var(--color-text)",
        }}
      >
        {formatEUR(bedrag)}
      </span>
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
