import type { Datapunt } from "@/types/dataset";
import { AuditPanel } from "@/components/AuditPanel";
import { formatEUR } from "@/lib/money";

export interface ResultCardProps {
  label: string;
  value?: string;
  amountEUR?: number;
  helper?: React.ReactNode;
  datapunten?: Datapunt[];
  highlight?: boolean;
}

export function ResultCard(props: ResultCardProps) {
  const valueDisplay =
    props.value ??
    (props.amountEUR !== undefined ? formatEUR(props.amountEUR) : "—");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderRadius: 14,
        border: props.highlight ? "1px solid #cbbba0" : "1px solid #e2ddd5",
        background: "#ffffff",
        padding: "1rem 1.1rem",
        boxShadow: props.highlight ? "0 0 0 3px rgba(203,187,160,0.25)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontFamily: "var(--font-body)",
            color: "#5a5a59",
            fontWeight: 500,
          }}
        >
          {props.label}
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "#3c3c3b",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {valueDisplay}
        </div>
      </div>
      {props.helper && (
        <div style={{ fontSize: 12, color: "#9a8b7a", fontFamily: "var(--font-body)" }}>
          {props.helper}
        </div>
      )}
      {props.datapunten && props.datapunten.length > 0 && (
        <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
          {props.datapunten.map((dp) => (
            <AuditPanel key={dp.id} datapunt={dp} />
          ))}
        </div>
      )}
    </div>
  );
}
