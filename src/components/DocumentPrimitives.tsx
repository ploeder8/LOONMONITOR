import type { CSSProperties, ReactNode } from "react";
import { FileText } from "lucide-react";
import { APP_BRAND } from "@/branding/brand";
import { formatEUR } from "@/lib/money";
type Align = "left" | "right" | "center";
export function ProFormaDocument({ className, contentClassName, children, }: {
    className?: string;
    contentClassName?: string;
    children: ReactNode;
}) {
    return (<div className={className} style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            maxWidth: 800,
            margin: "0 auto",
        }}>
      <ProFormaBanner />
      <div className={contentClassName} style={{ padding: "28px 32px 32px" }}>
        {children}
      </div>
    </div>);
}
export function ProFormaBanner({ className }: {
    className?: string;
}) {
    return (<div className={className} style={{
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
        }}>
      <FileText size={16}/>
      Pro-forma overzicht — geen officiële loonafrekening
    </div>);
}
export function DocumentHeader({ title, periode, details, className, marginBottom = 28, }: {
    title: string;
    periode: string;
    details?: ReactNode;
    className?: string;
    marginBottom?: number;
}) {
    return (<div className={className} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom,
            flexWrap: "wrap",
            gap: 16,
        }}>
      <div>
        <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
            color: "var(--color-text)",
            letterSpacing: 0,
            marginBottom: 4,
        }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {APP_BRAND.name} — {APP_BRAND.productLabel}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text)",
        }}>
          {periode}
        </div>
        {details}
      </div>
    </div>);
}
export function SummaryCard({ label, bedrag, isPercentage, percentageSpace, isCount, accent, }: {
    label: string;
    bedrag: number | null;
    isPercentage?: boolean;
    percentageSpace?: boolean;
    isCount?: boolean;
    accent?: boolean;
}) {
    const value = bedrag === null
        ? "—"
        : isCount
            ? String(bedrag)
            : isPercentage
                ? `${bedrag.toFixed(2)}${percentageSpace ? " %" : "%"}`
                : formatEUR(bedrag);
    return (<div style={{
            background: accent ? "var(--color-primary-soft)" : "var(--color-surface)",
            border: accent ? "1px solid var(--color-primary-border)" : "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 16px",
            boxShadow: "var(--shadow-sm)",
        }}>
      <div style={captionStyle}>{label}</div>
      <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            fontWeight: 700,
            color: accent ? "var(--color-primary)" : "var(--color-text)",
            fontVariantNumeric: "tabular-nums",
        }}>
        {value}
      </div>
    </div>);
}
export function MetaCard({ label, value }: {
    label: string;
    value: string;
}) {
    return (<div style={{
            background: "var(--color-navy-50)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
        }}>
      <div style={{ ...captionStyle, fontSize: 10, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
    </div>);
}
export function DocumentSection({ title, children, className, }: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (<div className={className} style={{ marginBottom: 24 }}>
      <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 10,
            letterSpacing: "0.02em",
        }}>
        {title}
      </div>
      {children}
    </div>);
}
export interface CompactRow {
    label: string;
    bedrag: number;
    bold?: boolean;
    highlight?: boolean;
}
export function CompactTable({ rows }: {
    rows: CompactRow[];
}) {
    return (<TableFrame>
      <tbody>
        {rows.map((row, i) => (<tr key={i} style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--color-navy-50)" : undefined,
                background: row.highlight ? "var(--color-navy-50)" : undefined,
            }}>
            <Td style={{ fontWeight: row.bold ? 700 : 400 }}>{row.label}</Td>
            <Td align="right" style={{ fontWeight: row.bold ? 700 : 400, color: row.highlight ? "var(--color-primary)" : "var(--color-text)" }}>
              {formatEUR(row.bedrag)}
            </Td>
          </tr>))}
      </tbody>
    </TableFrame>);
}
export function TableFrame({ children, shadow = false, }: {
    children: ReactNode;
    shadow?: boolean;
}) {
    return (<div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: shadow ? "var(--shadow-sm)" : undefined,
        }}>
      <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            fontFamily: "var(--font-body)",
        }}>
        {children}
      </table>
    </div>);
}
export function Th({ children, align = "left", }: {
    children: ReactNode;
    align?: Align;
}) {
    return <th style={{ ...cellHeaderStyle, textAlign: align }}>{children}</th>;
}
export function Td({ children, align = "left", style, }: {
    children: ReactNode;
    align?: Align;
    style?: CSSProperties;
}) {
    return (<td style={{
            padding: "10px 12px",
            textAlign: align,
            color: "var(--color-text)",
            fontFamily: align === "right" ? "var(--font-mono)" : undefined,
            fontVariantNumeric: align === "right" ? "tabular-nums" : undefined,
            ...style,
        }}>
      {children}
    </td>);
}
export function YearRow({ label, bedrag, bold, }: {
    label: string;
    bedrag: number;
    bold?: boolean;
}) {
    return (<div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            borderBottom: "1px solid var(--color-navy-50)",
        }}>
      <span style={{ fontSize: 13, color: "var(--color-text)", fontWeight: bold ? 700 : 400 }}>
        {label}
      </span>
      <span style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            fontWeight: bold ? 700 : 400,
            color: "var(--color-text)",
        }}>
        {formatEUR(bedrag)}
      </span>
    </div>);
}
export function DocumentFooter() {
    return (<div style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: "1px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
        }}>
      <div>
        Dit overzicht is opgesteld als pro-forma simulatie via {APP_BRAND.name} en is niet bedoeld als officiële loonafrekening.
      </div>
      <div style={{ marginTop: 4 }}>
        Loonwig = het percentage van de werkgeverskost dat niet uitbetaald wordt als netto loon (belastingen, RSZ, sociale bijdragen, extralegale voordelen).
      </div>
    </div>);
}
export const captionStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    marginBottom: 4,
    fontFamily: "var(--font-display)",
};
const cellHeaderStyle: CSSProperties = {
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-display)",
};
