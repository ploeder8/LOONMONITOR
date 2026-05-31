import { AuditSourceGroup } from "@/components/AuditPanel";
import { formatEUR } from "@/lib/money";
import type { WerkgeverskostResultaat } from "@/lib/werkgeverskost";
import { HelpTooltip } from "@/pages/home/FormControls";
import { NettoRow } from "@/pages/home/ResultRows";
import type { WerkgeverskostExtras } from "@/pages/home/types";
export function WerkgeverskostPanel({ resultaat: r, loonwigPct, netto, extras, }: {
    resultaat: WerkgeverskostResultaat;
    loonwigPct: number;
    netto: number;
    extras: WerkgeverskostExtras;
}) {
    return (<div style={{
            borderRadius: "var(--radius-lg)",
            border: "2px solid var(--color-primary)",
            background: "var(--color-surface)",
            padding: "1rem 1.1rem",
        }}>
      <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
            letterSpacing: 0,
            marginBottom: 12,
        }}>
        Loonkost werkgever (per maand)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Brutoloon" bedrag={r.brutoloon} prefix=""/>
          <NettoRow label="RSZ werkgever (~25%)" bedrag={r.rszWerkgever} prefix="+"/>
          <NettoRow label={`Arbeidsongevallen (${(extras.arbeidsongevallenPct * 100).toFixed(2)} %)`} bedrag={r.arbeidsongevallen} prefix="+"/>
          <tr style={{ borderTop: "1px solid var(--color-border)" }}>
            <td style={{ padding: "8px 8px 4px 0", fontWeight: 600, color: "var(--color-navy-500)", fontSize: 13 }}>
              Loonkost zonder voordelen{" "}
              <HelpTooltip text="Loonkost vóór extra voordelen en vergoedingen zoals groepsverzekering, maaltijdcheques, hospitalisatie, woon-werkvergoeding en onkostenvergoedingen."/>
            </td>
            <td style={{
            padding: "8px 0 4px 8px",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: "var(--color-navy-500)",
            fontSize: 13,
        }}>
              {formatEUR(r.totaleLoonkostSmal)}
            </td>
          </tr>
          {extras.groepsverzekering > 0 && (<NettoRow label="Patronale groepsverzekering" bedrag={extras.groepsverzekering} prefix="+" dimmed/>)}
          {extras.maaltijdcheques > 0 && (<NettoRow label="Maaltijdcheques (werkgeversaandeel)" bedrag={extras.maaltijdcheques} prefix="+" dimmed/>)}
          {extras.hospitalisatie > 0 && (<NettoRow label="Hospitalisatieverzekering" bedrag={extras.hospitalisatie} prefix="+" dimmed/>)}
          {extras.woonwerk > 0 && (<NettoRow label="Woon-werkvergoeding" bedrag={extras.woonwerk} prefix="+" dimmed/>)}
          {extras.onkostenvergoeding > 0 && (<NettoRow label="Onkostenvergoedingen" bedrag={extras.onkostenvergoeding} prefix="+" dimmed/>)}
          <tr style={{ borderTop: "2px solid var(--color-primary)" }}>
            <td style={{
            padding: "10px 8px 4px 0",
            fontWeight: 700,
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
            fontSize: 15,
        }}>
              Loonkost werkgever per maand
            </td>
            <td style={{
            padding: "10px 0 4px 8px",
            textAlign: "right",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "var(--color-primary)",
            fontSize: 22,
        }}>
              {formatEUR(r.totaleLoonkostBreed)}
            </td>
          </tr>
        </tbody>
      </table>

      
      <div style={{
            marginTop: 14,
            background: "var(--color-primary-soft)",
            border: "1px solid var(--color-primary-border)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            color: "var(--color-text)",
        }}>
        <strong>Loonwig: {(loonwigPct * 100).toFixed(1)} %</strong>{" "}
        <HelpTooltip text={`Formule: (totale loonkost ${formatEUR(r.totaleLoonkostBreed)} min netto ${formatEUR(netto)}) gedeeld door totale loonkost.`}/>
      </div>

      
      <AuditSourceGroup datapunten={r.datapunten}/>
    </div>);
}
