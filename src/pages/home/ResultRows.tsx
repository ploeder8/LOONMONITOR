import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatEUR } from "@/lib/money";
export function NettoRow({ label, bedrag, prefix = "-", variant = "normal", dimmed = false, onToggle, open, }: {
    label: ReactNode;
    bedrag: number;
    prefix?: string;
    variant?: "normal" | "subtotal" | "total";
    dimmed?: boolean;
    onToggle?: () => void;
    open?: boolean;
}) {
    const highlight = variant === "subtotal" || variant === "total";
    const total = variant === "total";
    const content = (<>
      {onToggle && (open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
      {label}
    </>);
    return (<tr style={{
            borderBottom: total ? "none" : "1px solid var(--color-navy-50)",
            borderTop: variant === "subtotal" ? "2px solid var(--color-border)" : total ? "2px solid var(--color-primary)" : undefined,
        }}>
      <td style={{
            padding: total ? "10px 8px 4px 0" : "7px 8px 7px 0",
            color: dimmed ? "var(--color-text-muted)" : highlight ? "var(--color-text)" : "var(--color-navy-500)",
            fontWeight: highlight ? 700 : 400,
            fontSize: highlight ? 15 : 13,
            fontFamily: highlight ? "var(--font-display)" : undefined,
        }}>
        {onToggle ? (<button onClick={onToggle} style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
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
            padding: total ? "10px 0 4px 8px" : "7px 0 7px 8px",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontWeight: highlight ? 700 : 500,
            color: highlight ? "var(--color-primary)" : dimmed ? "var(--color-text-muted)" : "var(--color-text)",
            fontSize: total ? 22 : highlight ? 15 : 13,
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
            padding: "14px 0 5px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
        }}>
        {label}
      </td>
    </tr>);
}
export function NettoDetailRow({ children }: {
    children: ReactNode;
}) {
    return (<tr>
      <td colSpan={2} style={{ padding: "0 0 8px 18px" }}>
        <div style={{
            borderLeft: "2px solid var(--color-primary-border)",
            padding: "8px 0 8px 10px",
            color: "var(--color-text-muted)",
            fontSize: 12,
            lineHeight: 1.45,
        }}>
          {children}
        </div>
      </td>
    </tr>);
}
