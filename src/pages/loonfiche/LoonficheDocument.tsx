import { FileText, AlertTriangle } from "lucide-react";
import { APP_BRAND } from "@/branding/brand";
import { Banner } from "@/components/Banner";
import { AuditSourceGroup } from "@/components/AuditPanel";
import type { Loonfiche, LoonficheRegel } from "@/lib/loonfiche";
import { formatEUR } from "@/lib/money";
import { LoonficheTabel } from "./LoonficheTabel";

interface LoonficheDocumentProps {
  loonfiche: Loonfiche;
  toonBronnen?: boolean;
}

export function LoonficheDocument({ loonfiche, toonBronnen = true }: LoonficheDocumentProps) {
  const auditRegels = loonfiche.regels.filter((r) => r.datapunten && r.datapunten.length > 0);
  const p = loonfiche.profielSnapshot;

  return (
    <div
      className="loonfiche-document"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
      }}
    >
      {/* Pro-forma banner */}
      <div
        style={{
          background: "var(--color-primary-soft)",
          borderBottom: "1px solid var(--color-primary-border)",
          padding: "10px 20px",
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
        Pro-forma loonfiche — geen officiële loonbrief
      </div>

      <div style={{ padding: "24px 28px 28px" }}>
        {/* Document header */}
        <div
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
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
                letterSpacing: 0,
                marginBottom: 4,
              }}
            >
              {APP_BRAND.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {APP_BRAND.productLabel}
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
              {loonfiche.periode}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {loonfiche.isStudent ? "Student" : "Bediende"} · {loonfiche.profielSnapshot.berekeningsRichting === "netto_naar_bruto" ? "Netto → Bruto" : "Bruto → Netto"}
            </div>
          </div>
        </div>

        {/* Werknemer / Werkgever / Prestatie blokken */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <InfoBlock
            title="Werknemer"
            velden={[
              { label: "Naam", waarde: p.werknemerNaam },
              { label: "Referentie", waarde: p.werknemerReferentie },
            ]}
          />
          <InfoBlock
            title="Werkgever"
            velden={[
              { label: "Naam", waarde: p.werkgeverNaam },
              { label: "Ondernemingsnummer", waarde: p.werkgeverOndernemingsnummer },
            ]}
          />
          <InfoBlock
            title="Prestatie"
            velden={[
              { label: "Periode", waarde: loonfiche.periode },
              { label: "Statuut", waarde: loonfiche.isStudent ? "Student" : "Bediende" },
              { label: "Tewerkstellingsbreuk", waarde: `${Math.round(p.tewerkstellingsbreuk * 100)} %` },
              { label: "Arbeidsdagen", waarde: `${p.arbeidsdagenPerMaand}` },
            ]}
          />
        </div>

        {/* Waarschuwingen */}
        {loonfiche.waarschuwingen.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {loonfiche.waarschuwingen.map((w, i) => (
              <Banner key={i} kind="warning" title={i === 0 ? "Waarschuwing" : undefined}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} />
                  {w}
                </div>
              </Banner>
            ))}
          </div>
        )}

        {/* Tabel */}
        <LoonficheTabel regels={loonfiche.regels} />

        {/* Totalenblok */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "2px solid var(--color-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 2 }}>
              Netto te betalen
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatEUR(loonfiche.totalen.nettoTeBetalen)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 2 }}>
              Werkgeverskost per maand
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatEUR(loonfiche.totalen.werkgeverskostMaand)}
            </div>
          </div>
        </div>

        {/* Audit sectie */}
        {toonBronnen && auditRegels.length > 0 && (
          <div className="loonfiche-audit" style={{ marginTop: 28 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 10,
              }}
            >
              Bronvermelding
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {auditRegels.map((regel) => (
                <AuditRegelBlock key={regel.code} regel={regel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  velden,
}: {
  title: string;
  velden: Array<{ label: string; waarde: string }>;
}) {
  return (
    <div
      style={{
        background: "var(--color-navy-50)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {velden.map((v) => (
          <div key={v.label}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 1 }}>
              {v.label}
            </div>
            <div
              style={{
                fontSize: 14,
                color: v.waarde ? "var(--color-text)" : "var(--color-navy-300)",
                fontWeight: v.waarde ? 500 : 400,
              }}
            >
              {v.waarde || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditRegelBlock({ regel }: { regel: LoonficheRegel }) {
  if (!regel.datapunten || regel.datapunten.length === 0) return null;
  return (
    <div
      style={{
        borderLeft: "2px solid var(--color-primary-border)",
        paddingLeft: 10,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-navy-500)", marginBottom: 4 }}>
        {regel.code} — {regel.label}
      </div>
      <AuditSourceGroup datapunten={regel.datapunten} />
    </div>
  );
}
