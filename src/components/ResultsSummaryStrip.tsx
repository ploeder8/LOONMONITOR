import { formatEUR } from "@/lib/money";
export interface SummaryCell {
    label: string;
    bedrag: number | null;
    format?: "EUR" | "PCT";
    highlight?: boolean;
}
export interface JumpAnchor {
    id: string;
    label: string;
}
export function ResultsSummaryStrip({ cells, anchors, auditForce, onToggleAudit, }: {
    cells: SummaryCell[];
    anchors: JumpAnchor[];
    auditForce: "all" | "none" | null;
    onToggleAudit: () => void;
}) {
    return (<div style={{
            position: "sticky",
            top: 73,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "10px 12px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(6px)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-md)",
        }}>
      <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))`,
            gap: 8,
        }}>
        {cells.map((c) => (<SummaryCard key={c.label} cell={c}/>))}
      </div>
      <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            borderTop: "1px dashed var(--color-navy-100)",
            paddingTop: 8,
            fontSize: 12,
            color: "var(--color-navy-500)",
            fontFamily: "var(--font-body)",
            flexWrap: "wrap",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <span style={{ color: "var(--color-text-muted)", marginRight: 4 }}>Springen:</span>
          {anchors.map((a, i) => (<span key={a.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <a href={`#${a.id}`} onClick={(e) => smoothScrollTo(e, a.id)} style={{
                color: "var(--color-primary)",
                textDecoration: "none",
                fontWeight: 600,
                padding: "1px 4px",
                borderRadius: "var(--radius-sm)",
            }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-soft)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {a.label}
              </a>
              {i < anchors.length - 1 && <span style={{ color: "var(--color-navy-300)" }}>·</span>}
            </span>))}
        </div>
        <button onClick={onToggleAudit} style={{
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
        }}>
          {auditForce === "all" ? "Verberg alle bronnen" : "Toon alle bronnen"}
        </button>
      </div>
    </div>);
}
function smoothScrollTo(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el)
        el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function SummaryCard({ cell }: {
    cell: SummaryCell;
}) {
    const valueText = cell.bedrag === null
        ? "—"
        : cell.format === "PCT"
            ? `${(cell.bedrag * 100).toFixed(1)} %`
            : formatEUR(cell.bedrag);
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            background: cell.highlight ? "var(--color-primary-soft)" : "var(--color-navy-50)",
            border: cell.highlight ? "1px solid var(--color-primary-border)" : "1px solid var(--color-navy-100)",
            minWidth: 0,
        }}>
      <span style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
        }}>
        {cell.label}
      </span>
      <span style={{
            fontSize: cell.highlight ? 17 : 15,
            fontFamily: "var(--font-mono)",
            fontWeight: cell.highlight ? 700 : 600,
            color: cell.highlight ? "var(--color-primary)" : "var(--color-text)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        }}>
        {valueText}
      </span>
    </div>);
}
