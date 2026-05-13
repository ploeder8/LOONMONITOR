import { createContext, useContext, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

export function AuditPanel({ datapunt }: { datapunt: Datapunt }) {
  const force = useContext(AuditOpenContext);
  const [localOpen, setLocalOpen] = useState(false);
  const open = force === "all" ? true : force === "none" ? false : localOpen;

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #e2ddd5",
        background: "#f5f0e8",
        fontSize: 13,
      }}
    >
      <button
        onClick={() => setLocalOpen(!open)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 12px",
          textAlign: "left",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e8dfcf")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#5a5a59",
            }}
          >
            {datapunt.id}
          </span>
          <StatusBadge status={datapunt.status} />
          {datapunt.betrouwbaarheid && <TierBadge tier={datapunt.betrouwbaarheid} />}
        </div>
        {open
          ? <ChevronUp size={14} style={{ color: "#9a8b7a", flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: "#9a8b7a", flexShrink: 0 }} />
        }
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid #e2ddd5",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <AuditField label="Omschrijving">{datapunt.omschrijving}</AuditField>

          {datapunt.waarde_bron != null && (
            <AuditField label="Waarde (letterlijk uit bron)">
              <code
                style={{
                  background: "#e8dfcf",
                  borderRadius: 4,
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
                  background: "#e8dfcf",
                  borderRadius: 4,
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
                  borderLeft: "2px solid #cbbba0",
                  paddingLeft: 10,
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "#5a5a59",
                  margin: 0,
                }}
              >
                {datapunt.bron_fragment}
              </blockquote>
            </AuditField>
          )}

          {datapunt.triangulatie_bronnen && datapunt.triangulatie_bronnen.length > 0 && (
            <AuditField label="Triangulatie-bronnen">
              <ul style={{ paddingLeft: 18, fontSize: 12, color: "#5a5a59", margin: 0 }}>
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
                          style={{ color: "#7b6a58", textDecoration: "underline" }}
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
              <ul style={{ paddingLeft: 18, fontSize: 12, color: "#5a5a59", margin: 0 }}>
                {datapunt.opmerkingen.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </AuditField>
          )}

          {datapunt.conflict_opmerking && (
            <AuditField label="Bronconflict">
              <span style={{ color: "#b91c1c" }}>{datapunt.conflict_opmerking}</span>
            </AuditField>
          )}
        </div>
      )}
    </div>
  );
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
          color: "#9a8b7a",
          marginBottom: 2,
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#3c3c3b" }}>{children}</div>
    </div>
  );
}
