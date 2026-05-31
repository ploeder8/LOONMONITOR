import type { Datapunt } from "@/types/dataset";
import { AuditSourceGroup } from "@/components/AuditPanel";
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
    const valueDisplay = props.value ??
        (props.amountEUR !== undefined ? formatEUR(props.amountEUR) : "—");
    return (<div style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            borderRadius: "var(--radius-lg)",
            border: props.highlight ? "1px solid var(--color-primary-border)" : "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "1rem 1.1rem",
            boxShadow: props.highlight ? "var(--shadow-focus)" : "var(--shadow-sm)",
        }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{
            fontSize: 13,
            fontFamily: "var(--font-body)",
            color: "var(--color-navy-500)",
            fontWeight: 500,
        }}>
          {props.label}
        </div>
        <div style={{
            fontSize: 20,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
        }}>
          {valueDisplay}
        </div>
      </div>
      {props.helper && (<div style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          {props.helper}
        </div>)}
      {props.datapunten && props.datapunten.length > 0 && (<AuditSourceGroup datapunten={props.datapunten}/>)}
    </div>);
}
