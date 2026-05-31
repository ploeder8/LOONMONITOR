import { Fragment } from "react";
import type { LoonficheRegel, LoonficheRegelType } from "@/lib/loonfiche";
import { formatEUR } from "@/lib/money";
const TYPE_HEADERS: Record<LoonficheRegelType, string> = {
    bruto: "Bruto",
    rsz: "Sociale bijdragen",
    belastbaar: "Belastbaar loon",
    bv: "Bedrijfsvoorheffing",
    inhouding: "Inhoudingen",
    netto: "Netto",
    werkgever: "Werkgever",
    informatief: "",
    subtotaal: "",
};
function tekenPrefix(teken: string): string {
    switch (teken) {
        case "plus": return "+";
        case "min": return "−";
        default: return "";
    }
}
export function LoonficheTabel({ regels }: {
    regels: LoonficheRegel[];
}) {
    let vorigeHeader = "";
    return (<table className="loonfiche-tabel" style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-body)",
            fontSize: 14,
        }}>
      <tbody>
        {regels.map((regel) => {
            const header = regel.type === "subtotaal" ? "" : TYPE_HEADERS[regel.type];
            const showHeader = Boolean(header && header !== vorigeHeader);
            if (header)
                vorigeHeader = header;
            return (<Fragment key={regel.code}>
              {showHeader && (<tr key={`${regel.code}-header`}>
                  <td colSpan={3} style={{
                        padding: "16px 0 6px",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-display)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid var(--color-border)",
                    }}>
                    {header}
                  </td>
                </tr>)}
              <LoonficheRow regel={regel}/>
            </Fragment>);
        })}
      </tbody>
    </table>);
}
function LoonficheRow({ regel }: {
    regel: LoonficheRegel;
}) {
    const isSubtotaal = regel.type === "subtotaal";
    const isTotaal = regel.code === "9000";
    const prefix = tekenPrefix(regel.teken);
    return (<tr style={{
            borderBottom: isTotaal ? "none" : "1px solid var(--color-navy-50)",
            borderTop: isSubtotaal ? "2px solid var(--color-border)" : undefined,
        }}>
      <td style={{
            width: 56,
            padding: isTotaal ? "12px 8px 6px 0" : "8px 8px 8px 0",
            color: "var(--color-text-muted)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            verticalAlign: "top",
        }}>
        {regel.code}
      </td>
      <td style={{
            padding: isTotaal ? "12px 8px 6px 0" : "8px 8px 8px 0",
            color: isSubtotaal || isTotaal ? "var(--color-text)" : "var(--color-navy-500)",
            fontWeight: isSubtotaal || isTotaal ? 700 : 400,
            fontSize: isTotaal ? 16 : isSubtotaal ? 14 : 14,
            fontFamily: isSubtotaal || isTotaal ? "var(--font-display)" : undefined,
            verticalAlign: "top",
        }}>
        {regel.label}
        {regel.detail && (<span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 8, fontWeight: 400 }}>
            ({regel.detail})
          </span>)}
      </td>
      <td style={{
            padding: isTotaal ? "12px 0 6px 8px" : "8px 0 8px 8px",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontWeight: isSubtotaal || isTotaal ? 700 : 500,
            color: isTotaal ? "var(--color-primary)" : isSubtotaal ? "var(--color-text)" : "var(--color-text)",
            fontSize: isTotaal ? 20 : isSubtotaal ? 15 : 14,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            verticalAlign: "top",
        }}>
        {prefix ? `${prefix} ${formatEUR(regel.bedrag)}` : formatEUR(regel.bedrag)}
      </td>
    </tr>);
}
