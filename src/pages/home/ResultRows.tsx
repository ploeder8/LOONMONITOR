import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatEUR } from "@/lib/money";
export function NettoRow({ label, bedrag, prefix = "-", variant = "normal", dimmed = false, onToggle, open, }: {
    label: ReactNode;
    bedrag: number;
    prefix?: string;
    variant?: "normal" | "subtotal" | "total" | "bruto" | "netto";
    dimmed?: boolean;
    onToggle?: () => void;
    open?: boolean;
}) {
    const total = variant === "total";
    const subtotal = variant === "subtotal";
    const bruto = variant === "bruto";
    const netto = variant === "netto";
    const content = (<>
      {onToggle && (open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
      {label}
    </>);
    return (<tr style={{
            borderBottom: total ? "none" : "1px solid var(--color-navy-50)",
            borderTop: subtotal ? "1px solid var(--color-border)" : total ? "2px solid var(--color-primary)" : undefined,
        }}>
      <td style={{
            padding: total ? "5px 5px 2px 0" : "3px 5px 3px 0",
            color: dimmed ? "var(--color-text-muted)" : bruto || subtotal || total ? "var(--color-text)" : "var(--color-navy-500)",
            fontWeight: bruto || subtotal || total ? 700 : 400,
            fontSize: bruto || total ? 13 : 12,
            fontFamily: bruto || subtotal || total ? "var(--font-display)" : undefined,
        }}>
        {onToggle ? (<button onClick={onToggle} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "inherit",
                font: "inherit",
                fontWeight: "inherit",
                textAlign: "left",
            }}>
            {content}
          </button>) : (content)}
      </td>
      <td style={{
            padding: total ? "5px 0 2px 5px" : "3px 0 3px 5px",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontWeight: bruto || subtotal || total ? 700 : 500,
            color: total || netto ? "var(--color-primary)" : dimmed ? "var(--color-text-muted)" : "var(--color-text)",
            fontSize: total ? 18 : bruto ? 13 : 12,
        }}>
        {prefix !== "" ? `${prefix} ${formatEUR(bedrag)}` : formatEUR(bedrag)}
      </td>
    </tr>);
}
export function NettoSectionRow({ label }: {
    label: string;
}) {
    return (<tr>
      <td colSpan={2} style={{
            padding: "6px 0 2px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
        }}>
        {label}
      </td>
    </tr>);
}
export function NettoSpacerRow() {
    return (<tr>
      <td colSpan={2} style={{ padding: "2px 0" }}/>
    </tr>);
}
export function NettoDetailRow({ children }: {
    children: ReactNode;
}) {
    return (<tr>
      <td colSpan={2} style={{ padding: "0 0 4px 12px" }}>
        <div style={{
            borderLeft: "2px solid var(--color-primary-border)",
            padding: "5px 0 5px 7px",
            color: "var(--color-text-muted)",
            fontSize: 11,
            lineHeight: 1.35,
        }}>
          {children}
        </div>
      </td>
    </tr>);
}
