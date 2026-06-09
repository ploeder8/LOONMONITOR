import { AuditSourceGroup } from "@/components/AuditPanel";
import type { JaarcomponentNetto, JaaroverzichtResultaat } from "@/lib/jaaroverzicht";
import { formatEUR, round2 } from "@/lib/money";
import { berekenMaaltijdchequeWaarde } from "@/lib/profielBerekeningen";
import { NettoRow, NettoSectionRow, NettoSpacerRow } from "@/pages/home/ResultRows";
export function NettoJaaroverzichtPanel({ jaaroverzicht, maaltijdchequeWerkgeversaandeelPerDag, maaltijdchequeWerknemersbijdragePerDag, maaltijdchequeWerkdagenPerMaand, }: {
    jaaroverzicht: JaaroverzichtResultaat;
    maaltijdchequeWerkgeversaandeelPerDag: number;
    maaltijdchequeWerknemersbijdragePerDag: number;
    maaltijdchequeWerkdagenPerMaand: number;
}) {
    const r = jaaroverzicht.netto;
    const maaltijdcheques = berekenMaaltijdchequeWaarde({
        werkgeversaandeelPerDag: maaltijdchequeWerkgeversaandeelPerDag,
        werknemersbijdragePerDag: maaltijdchequeWerknemersbijdragePerDag,
        werkdagen: maaltijdchequeWerkdagenPerMaand * 12,
    });
    const nettoJaarloonInclusiefMaaltijdcheques = round2(r.totaalNettoJaarloon + maaltijdcheques.totaleWaarde);
    const datapunten = [
        ...r.eindejaarspremie.datapunten,
        ...r.dubbelVakantiegeld.datapunten,
        ...r.jaarpremie.datapunten,
        ...(r.bonus.bruto > 0 ? r.bonus.datapunten : []),
    ].filter((dp, index, all) => all.findIndex((item) => item.id === dp.id) === index);
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
        Netto jaaroverzicht
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <JaarComponentRows titel="Eindejaarspremie" component={r.eindejaarspremie}/>
          <JaarComponentRows titel="Dubbel vakantiegeld" component={r.dubbelVakantiegeld}/>
          <JaarComponentRows titel="Sectorale jaarpremie PC 200" component={r.jaarpremie}/>
          {r.bonus.bruto > 0 && <JaarComponentRows titel="Bonus" component={r.bonus}/>}
          <NettoRow label="Ecocheques" bedrag={r.ecocheques} prefix="+" variant="bruto"/>
          <NettoSpacerRow/>
          <NettoRow label="Netto maandloon × 12" bedrag={r.maandloonNettoX12} prefix="" variant="subtotal"/>
          <NettoRow label="Netto jaarloon" bedrag={r.totaalNettoJaarloon} prefix="" variant="total"/>
          {maaltijdcheques.totaleWaarde > 0 && (<NettoRow label={`Netto jaarloon incl. maaltijdcheques (totale waarde ${formatEUR(maaltijdcheques.totaleWaardePerDag)} × ${maaltijdcheques.werkdagen} werkdagen)`} bedrag={nettoJaarloonInclusiefMaaltijdcheques} prefix="" variant="subtotal"/>)}
        </tbody>
      </table>
      <AuditSourceGroup datapunten={datapunten}/>
    </div>);
}
function JaarComponentRows({ titel, component, }: {
    titel: string;
    component: JaarcomponentNetto;
}) {
    return (<>
      <NettoSectionRow label={titel}/>
      <NettoRow label="Bruto" bedrag={component.bruto} prefix="+" variant="bruto"/>
      <NettoRow label="RSZ werknemer" bedrag={component.rsz}/>
      <NettoRow label="Belastbaar loon" bedrag={component.belastbaar} prefix="" variant="subtotal"/>
      <NettoRow label={`Bedrijfsvoorheffing (${(component.bvTarief * 100).toFixed(2)} %)`} bedrag={component.bv}/>
      <NettoRow label={`Netto ${titel.toLowerCase()}`} bedrag={component.netto} prefix="+" variant="netto"/>
      <NettoSpacerRow/>
    </>);
}
export function WerkgeverJaaroverzichtPanel({ jaaroverzicht }: {
    jaaroverzicht: JaaroverzichtResultaat;
}) {
    const r = jaaroverzicht.werkgever;
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
        Loonkost werkgever (per jaar)
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Loonkost werkgever per maand × 12" bedrag={r.maandbasisX12} prefix=""/>
          <NettoRow label="Eindejaarspremie + jaarpremie + ecocheques" bedrag={r.jaarpremiesEnEcocheques} prefix="+" dimmed/>
          <NettoRow label="RSZ op eindejaarspremie + jaarpremie" bedrag={r.rszOpEindejaarspremieEnJaarpremie} prefix="+" dimmed/>
          {r.bonusBruto > 0 && (<>
              <NettoRow label="Bonus" bedrag={r.bonusBruto} prefix="+" dimmed/>
              <NettoRow label="RSZ op bonus" bedrag={r.rszOpBonus} prefix="+" dimmed/>
            </>)}
          <NettoRow label="Dubbel vakantiegeld" bedrag={r.dubbelVakantiegeld} prefix="+" dimmed/>
          <NettoRow label={r.doelgroepvermindering > 0 ? "Loonkost werkgever per jaar excl. doelgroepvermindering" : "Loonkost werkgever per jaar"} bedrag={r.totaleLoonkostJaarExclusiefDoelgroepvermindering} prefix="" variant="total"/>
          {r.doelgroepvermindering > 0 && (<>
              <NettoRow label="Doelgroepvermindering eerste aanwervingen" bedrag={r.doelgroepvermindering} prefix="-" dimmed/>
              <NettoRow label="Loonkost werkgever per jaar incl. doelgroepvermindering" bedrag={r.totaleLoonkostJaarInclusiefDoelgroepvermindering} prefix="" variant="total"/>
              <tr>
                <td colSpan={2} style={{
            padding: "10px 0 0",
            fontSize: 12,
            color: "var(--color-text-muted)",
            lineHeight: 1.45,
        }}>
                  de doelgroepvermindering kan echter enkel toegepast worden indien de onderneming daadwerkelijk extra werkgelegenheid creeert , waarbij rekening gehouden wordt met bestaande/voorafgaande tewerkstellingen in andere vennootschappen waarmee de nieuwe onderneming verbonden is
                </td>
              </tr>
            </>)}
        </tbody>
      </table>
      <AuditSourceGroup datapunten={r.datapunten}/>
    </div>);
}
