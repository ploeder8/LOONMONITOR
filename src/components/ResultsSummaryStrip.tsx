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

export function ResultsSummaryStrip({
  cells,
  anchors,
  auditForce,
  onToggleAudit,
}: {
  cells: SummaryCell[];
  anchors: JumpAnchor[];
  auditForce: "all" | "none" | null;
  onToggleAudit: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 73,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(6px)",
        border: "1px solid #e2ddd5",
        boxShadow: "0 4px 14px rgba(60,60,59,0.06)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))`,
          gap: 8,
        }}
      >
        {cells.map((c) => (
          <SummaryCard key={c.label} cell={c} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          borderTop: "1px dashed #e8dfcf",
          paddingTop: 8,
          fontSize: 12,
          color: "#5a5a59",
          fontFamily: "var(--font-body)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <span style={{ color: "#9a8b7a", marginRight: 4 }}>Springen:</span>
          {anchors.map((a, i) => (
            <span key={a.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <a
                href={`#${a.id}`}
                onClick={(e) => smoothScrollTo(e, a.id)}
                style={{
                  color: "#7b6a58",
                  textDecoration: "none",
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {a.label}
              </a>
              {i < anchors.length - 1 && <span style={{ color: "#cbbba0" }}>·</span>}
            </span>
          ))}
        </div>
        <button
          onClick={onToggleAudit}
          style={{
            border: "1px solid #cbbba0",
            background: auditForce === "all" ? "#cbbba0" : "#ffffff",
            color: auditForce === "all" ? "#3c3c3b" : "#7b6a58",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.01em",
            transition: "background 0.15s",
          }}
        >
          {auditForce === "all" ? "Verberg alle bronnen" : "Toon alle bronnen"}
        </button>
      </div>
    </div>
  );
}

function smoothScrollTo(e: React.MouseEvent, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SummaryCard({ cell }: { cell: SummaryCell }) {
  const valueText =
    cell.bedrag === null
      ? "—"
      : cell.format === "PCT"
        ? `${(cell.bedrag * 100).toFixed(1)} %`
        : formatEUR(cell.bedrag);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "6px 10px",
        borderRadius: 8,
        background: cell.highlight ? "#f5f0e8" : "#faf8f4",
        border: cell.highlight ? "1px solid #cbbba0" : "1px solid #e8dfcf",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#9a8b7a",
          fontFamily: "var(--font-body)",
        }}
      >
        {cell.label}
      </span>
      <span
        style={{
          fontSize: cell.highlight ? 17 : 15,
          fontFamily: "var(--font-mono)",
          fontWeight: cell.highlight ? 700 : 600,
          color: cell.highlight ? "#7b6a58" : "#3c3c3b",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {valueText}
      </span>
    </div>
  );
}
