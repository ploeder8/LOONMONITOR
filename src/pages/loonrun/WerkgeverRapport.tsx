import { FileText } from "lucide-react";
import { APP_BRAND } from "@/branding/brand";
import { formatEUR } from "@/lib/money";
import type { Loonrun } from "@/lib/loonrun";

interface WerkgeverRapportProps {
  loonrun: Loonrun;
}

export function WerkgeverRapport({ loonrun }: WerkgeverRapportProps) {
  const werkgeverNaam =
    loonrun.werknemers.find((w) => w.profiel.werkgeverNaam)?.profiel
      .werkgeverNaam ?? "";
  const generatieDatum = new Date().toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const berekend = loonrun.werknemers.filter((w) => w.loonfiche);

  return (
    <div
      className="werkgever-rapport-document"
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

      <div style={{ padding: "28px 32px 32px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
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
              Loonkostoverzicht
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
              {loonrun.periode}
            </div>
            {werkgeverNaam && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {werkgeverNaam}
              </div>
            )}
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {generatieDatum}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {berekend.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <SummaryCard
              label="Totaal bruto cash"
              bedrag={loonrun.totalen.cashBruto}
            />
            <SummaryCard
              label="Totaal RSZ-basis"
              bedrag={loonrun.totalen.brutoRszBasis}
            />
            <SummaryCard
              label="Totaal netto"
              bedrag={loonrun.totalen.netto}
            />
            <SummaryCard
              label="Werkgeverskost"
              bedrag={loonrun.totalen.werkgeverskost}
              accent
            />
            <SummaryCard
              label="Loonwig"
              bedrag={loonrun.totalen.loonwigPct}
              isPercentage
            />
          </div>
        )}

        {/* Tabel */}
        {berekend.length > 0 ? (
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
              <thead>
                <tr
                  style={{
                    background: "var(--color-navy-50)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <Th>Werknemer</Th>
                  <Th align="right">Bruto cash</Th>
                  <Th align="right">RSZ-basis</Th>
                  <Th align="right">Netto</Th>
                  <Th align="right">Werkgeverskost</Th>
                  <Th align="right">Loonwig</Th>
                </tr>
              </thead>
              <tbody>
                {loonrun.werknemers.map((w) => (
                  <tr
                    key={w.id}
                    className="werkgever-rapport-row"
                    style={{
                      borderBottom: "1px solid var(--color-navy-50)",
                    }}
                  >
                    <Td>
                      <div style={{ fontWeight: 600 }}>{w.naam}</div>
                      {w.status === "fout" && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#991b1b",
                            marginTop: 2,
                          }}
                        >
                          {w.fout}
                        </div>
                      )}
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
                        ? `${round2(
                            ((w.loonfiche.totalen.werkgeverskostMaand -
                              w.loonfiche.totalen.nettoTeBetalen) /
                              w.loonfiche.totalen.werkgeverskostMaand) *
                              100,
                          )}%`
                        : "—"}
                    </Td>
                  </tr>
                ))}
                {/* Totalenrij */}
                <tr
                  style={{
                    background: "var(--color-navy-50)",
                    borderTop: "2px solid var(--color-border)",
                    fontWeight: 700,
                  }}
                >
                  <Td>
                    <span style={{ fontWeight: 800 }}>TOTALEN</span>
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.cashBruto)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.brutoRszBasis)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.netto)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.werkgeverskost)}
                  </Td>
                  <Td align="right">
                    {loonrun.totalen.loonwigPct !== null
                      ? `${loonrun.totalen.loonwigPct}%`
                      : "—"}
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              color: "var(--color-text-muted)",
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Geen berekende werknemers
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Voeg werknemers toe via CSV-import om het overzicht op te bouwen.
            </div>
          </div>
        )}

        {/* Footer */}
        <div
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
          fontSize: 18,
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

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      style={{
        padding: "10px 12px",
        textAlign: align,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-display)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <td
      style={{
        padding: "10px 12px",
        textAlign: align,
        color: "var(--color-text)",
        fontFamily: align === "right" ? "var(--font-mono)" : undefined,
        fontVariantNumeric: align === "right" ? "tabular-nums" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
