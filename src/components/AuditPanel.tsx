import { createContext, useContext, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import type { Datapunt } from "@/types/dataset";
import { StatusBadge, TierBadge } from "@/components/StatusBadge";
import { BronLink } from "@/components/BronLink";

// "all" / "none" overrules elk individueel paneel; null = elk paneel beheert zijn eigen state.
export type AuditForceState = "all" | "none" | null;

const AuditOpenContext = createContext<AuditForceState>(null);

export function AuditOpenProvider({
  force,
  children,
}: {
  force: AuditForceState;
  children: React.ReactNode;
}) {
  return <AuditOpenContext.Provider value={force}>{children}</AuditOpenContext.Provider>;
}

export function AuditSourceGroup({ datapunten }: { datapunten: Datapunt[] }) {
  const uniekeDatapunten = uniqueDatapunten(datapunten);
  const force = useContext(AuditOpenContext);
  const heeftAandachtNodig = uniekeDatapunten.some(heeftAuditAandachtNodig);
  const [localOpen, setLocalOpen] = useState(heeftAandachtNodig);
  const open = force === "all" ? true : force === "none" ? false : localOpen;

  if (uniekeDatapunten.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 4,
        borderRadius: "var(--radius-md)",
        border: open ? "1px solid var(--color-navy-100)" : "1px solid transparent",
        background: open ? "var(--color-navy-50)" : "transparent",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setLocalOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          border: "1px solid var(--color-navy-100)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          color: "var(--color-navy-500)",
          padding: "7px 10px",
          cursor: "pointer",
          boxShadow: open ? "none" : "0 2px 8px rgba(19, 31, 55, 0.035)",
          fontFamily: "var(--font-body)",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "var(--radius-pill)",
              background: heeftAandachtNodig ? "var(--color-primary-soft)" : "var(--color-mint-soft)",
              color: heeftAandachtNodig ? "var(--color-primary)" : "var(--color-success-dark)",
              flexShrink: 0,
            }}
          >
            {heeftAandachtNodig ? <BookOpen size={13} /> : <ShieldCheck size={13} />}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-navy-700)" }}>
            {bronSamenvatting(uniekeDatapunten)}
          </span>
          {heeftAandachtNodig && (
            <span
              style={{
                borderRadius: "var(--radius-pill)",
                background: "var(--color-primary-soft)",
                border: "1px solid var(--color-primary-border)",
                color: "var(--color-primary)",
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 7px",
              }}
            >
              aandacht nodig
            </span>
          )}
        </span>
        {open
          ? <ChevronUp size={15} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          : <ChevronDown size={15} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: "8px",
          }}
        >
          {uniekeDatapunten.map((dp) => (
            <AuditPanel key={dp.id} datapunt={dp} compact />
          ))}
        </div>
      )}
    </div>
  );
}

export function AuditPanel({ datapunt, compact = false }: { datapunt: Datapunt; compact?: boolean }) {
  const force = useContext(AuditOpenContext);
  const [localOpen, setLocalOpen] = useState(heeftAuditAandachtNodig(datapunt));
  const open = force === "all" ? true : force === "none" ? false : localOpen;

  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        background: compact ? "var(--color-surface)" : "var(--color-navy-50)",
        fontSize: 13,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setLocalOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: compact ? "7px 10px" : "8px 12px",
          textAlign: "left",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-soft)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-navy-500)",
              overflowWrap: "anywhere",
              minWidth: 0,
            }}
          >
            {datapunt.id}
          </span>
          <StatusBadge status={datapunt.status} />
          {datapunt.betrouwbaarheid && <TierBadge tier={datapunt.betrouwbaarheid} />}
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: compact ? "10px" : "12px",
            display: "flex",
            flexDirection: "column",
            gap: compact ? 10 : 12,
          }}
        >
          <AuditField label="Omschrijving">{datapunt.omschrijving}</AuditField>

          {datapunt.waarde_bron != null && (
            <AuditField label="Waarde (letterlijk uit bron)">
              <code
                style={{
                  background: "var(--color-primary-soft)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1px 5px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {datapunt.waarde_bron}
              </code>
            </AuditField>
          )}

          {datapunt.waarde_genormaliseerd != null && (
            <AuditField label="Waarde (genormaliseerd)">
              <code
                style={{
                  background: "var(--color-primary-soft)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1px 5px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {datapunt.waarde_genormaliseerd}
              </code>
            </AuditField>
          )}

          {(datapunt.geldig_vanaf || datapunt.geldig_tot) && (
            <AuditField label="Geldigheid">
              {datapunt.geldig_vanaf ?? "—"} → {datapunt.geldig_tot ?? "open"}
            </AuditField>
          )}

          <AuditField label="Primaire bron">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span>
                {datapunt.bron_organisatie ?? "—"}
                {datapunt.bron_titel ? ` — ${datapunt.bron_titel}` : ""}
              </span>
              <BronLink datapunt={datapunt} />
            </div>
          </AuditField>

          {datapunt.bron_fragment && (
            <AuditField label="Bron-citaat">
              <blockquote
                style={{
                  borderLeft: "2px solid var(--color-primary)",
                  paddingLeft: 10,
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "var(--color-navy-500)",
                  margin: 0,
                }}
              >
                {datapunt.bron_fragment}
              </blockquote>
            </AuditField>
          )}

          {datapunt.triangulatie_bronnen && datapunt.triangulatie_bronnen.length > 0 && (
            <AuditField label="Triangulatie-bronnen">
              <ul style={{ paddingLeft: 18, fontSize: 12, color: "var(--color-navy-500)", margin: 0 }}>
                {datapunt.triangulatie_bronnen.map((t, i) => (
                  <li key={i}>
                    {t.bron} ({t.tier}
                    {t.overeenstemming ? ` — ${t.overeenstemming}` : ""})
                    {t.url && (
                      <>
                        {" "}
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                        >
                          ↗
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </AuditField>
          )}

          {datapunt.opmerkingen && datapunt.opmerkingen.length > 0 && (
            <AuditField label="Opmerkingen">
              <ul style={{ paddingLeft: 18, fontSize: 12, color: "var(--color-navy-500)", margin: 0 }}>
                {datapunt.opmerkingen.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </AuditField>
          )}

          {datapunt.conflict_opmerking && (
            <AuditField label="Bronconflict">
              <span style={{ color: "var(--color-error)" }}>{datapunt.conflict_opmerking}</span>
            </AuditField>
          )}
        </div>
      )}
    </div>
  );
}

function uniqueDatapunten(datapunten: Datapunt[]): Datapunt[] {
  return [...new Map(datapunten.map((dp) => [dp.id, dp])).values()];
}

function heeftAuditAandachtNodig(datapunt: Datapunt): boolean {
  return datapunt.status !== "actief" || Boolean(datapunt.conflict_opmerking);
}

function bronSamenvatting(datapunten: Datapunt[]): string {
  const tiers = ["Tier 1", "Tier 2", "Tier 3"]
    .map((tier) => ({ tier, count: datapunten.filter((dp) => dp.betrouwbaarheid === tier).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.count} ${item.tier}`);

  return [
    "Bronnen",
    `${datapunten.length} ${datapunten.length === 1 ? "datapunt" : "datapunten"}`,
    ...tiers,
  ].join(" · ");
}

function AuditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-muted)",
          marginBottom: 2,
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text)" }}>{children}</div>
    </div>
  );
}
