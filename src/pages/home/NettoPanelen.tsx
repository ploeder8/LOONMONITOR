import { useState } from "react";
import { AuditSourceGroup } from "@/components/AuditPanel";
import { formatEUR, round2 } from "@/lib/money";
import type { NettoResultaat } from "@/lib/netto";
import { berekenMaaltijdchequeWaarde } from "@/lib/profielBerekeningen";
import type { VaaForfaitsWerkmiddelenResultaat } from "@/lib/vaaForfaits";
import { HelpTooltip } from "@/pages/home/FormControls";
import { NettoDetailRow, NettoRow, NettoSectionRow } from "@/pages/home/ResultRows";
export function NettoPanel({ resultaat: r, vaaWerkmiddelen, maaltijdchequeWerkgeversaandeelPerDag, gemeentebelastingPct, }: {
    resultaat: NettoResultaat;
    vaaWerkmiddelen?: VaaForfaitsWerkmiddelenResultaat;
    maaltijdchequeWerkgeversaandeelPerDag: number;
    gemeentebelastingPct: number;
}) {
    const [bvDetailOpen, setBvDetailOpen] = useState(false);
    const [vaaDetailOpen, setVaaDetailOpen] = useState(false);
    const totaalTerugnameVaa = r.vaaBedrijfswagenPerMaand + r.vaaRszPlichtigPerMaand;
    const toontVaaBedrijfswagen = r.vaaBedrijfswagenPerMaand > 0;
    const toontTerugnameVaa = totaalTerugnameVaa > 0;
    const gebruiktSchaalII = r.bv.schaal === "II";
    const maaltijdcheques = berekenMaaltijdchequeWaarde({
        werkgeversaandeelPerDag: maaltijdchequeWerkgeversaandeelPerDag,
        werknemersbijdragePerDag: r.maaltijdchequeWerknemersbijdragePerDag,
        werkdagen: r.maaltijdchequeWerkdagen,
    });
    const nettoloonInclusiefMaaltijdcheques = round2(r.nettoloon + maaltijdcheques.totaleWaarde);
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
        Netto berekening (per maand)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <NettoRow label="Brutoloon" bedrag={r.brutoloon} prefix=""/>
          {vaaWerkmiddelen?.lijnen.map((lijn) => (<NettoRow key={lijn.datapunt.id} label={`VAA ${lijn.label}`} bedrag={lijn.bedrag} prefix="+" dimmed/>))}
          <NettoRow label="Totaal bruto" bedrag={r.brutoRszBasis} prefix="" variant="subtotal"/>
          <NettoRow label={`RSZ werknemer (13,07 %)`} bedrag={r.rsz.werknemerBijdrage}/>
          {r.werkbonus.totaal > 0 && (<NettoRow label={`Werkbonus (RSZ-vermindering)`} bedrag={r.werkbonus.totaal} prefix="+" dimmed/>)}
          <NettoRow label="Loon na RSZ en werkbonus" bedrag={r.belastbaarMaandloon} prefix="" variant="subtotal"/>
          {toontVaaBedrijfswagen && (<NettoRow label="VAA bedrijfswagen" bedrag={r.vaaBedrijfswagenPerMaand} prefix="+" dimmed/>)}
          <NettoRow label="Belastbaar loon" bedrag={r.belastbaarMaandloonVoorBV} prefix="" variant="subtotal"/>
          <NettoRow label={`Bedrijfsvoorheffing (${r.bv.schaal}, vóór gezinsverminderingen)`} bedrag={r.bv.bvPerMaand} onToggle={() => setBvDetailOpen(!bvDetailOpen)} open={bvDetailOpen}/>
          {gebruiktSchaalII && (<NettoDetailRow>
              Lagere bedrijfsvoorheffing door partner zonder of beperkt beroepsinkomen:
              Schaal II verhoogt de effectieve vrijstelling en verlaagt zo de maandelijkse BV.
            </NettoDetailRow>)}
          {bvDetailOpen && (<NettoDetailRow>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {[
                ["Methode", "Berekening volgens wettelijke BV-formule"],
                ["Schaal", r.bv.schaal],
                ...(gebruiktSchaalII
                    ? [["Impact Schaal II", "Lagere bedrijfsvoorheffing door partner zonder of beperkt beroepsinkomen"]]
                    : []),
                ["Belastbaar jaarloon", formatEUR(r.bv.jaarbasis)],
                ["Forfait beroepskosten (30%, max € 6.070 AJ 2027)", `- ${formatEUR(r.bv.forfaitBeroepskosten)}`],
                ["Belastbaar netto-inkomen", formatEUR(r.bv.belastbaarNettoJaar)],
                ["Belastingvrije som BV", formatEUR(r.bv.belastingvrijeSomBv)],
                ...(r.bv.huwelijksquotient > 0
                    ? [["Huwelijksquotiënt", formatEUR(r.bv.huwelijksquotient)]]
                    : []),
                ["Basisbelasting BV", formatEUR(r.bv.basisbelastingBruto)],
                ["Vermindering belastingvrije som", `- ${formatEUR(r.bv.verminderingBelastingvrijeSom)}`],
                ["Basisbelasting na vermindering", formatEUR(r.bv.basisbelastingNaVerminderingen)],
                ["BV / maand sleutelformule (vóór gezinsvermindering)", formatEUR(r.bv.bvPerMaand)],
                ["BV / maand (na gezinsvermindering)", formatEUR(r.bv.bvNaVerminderingen)],
            ].map(([lbl, val]) => (<tr key={lbl} style={{ borderBottom: "1px solid var(--color-navy-50)" }}>
                      <td style={{ padding: "4px 6px 4px 0", color: "var(--color-text-muted)" }}>{lbl}</td>
                      <td style={{ padding: "4px 0 4px 6px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>{val}</td>
                    </tr>))}
                </tbody>
              </table>
            </NettoDetailRow>)}
          {r.bv.verminderingKinderen > 0 && (<NettoRow label={`BV-vermindering kinderen ten laste`} bedrag={r.bv.verminderingKinderen} prefix="+" dimmed/>)}
          {r.bv.verminderingAlleenstaandeKind > 0 && (<NettoRow label={`BV-vermindering fiscaal alleenstaande`} bedrag={r.bv.verminderingAlleenstaandeKind} prefix="+" dimmed/>)}
          {r.bv.verminderingGroepsverzekering > 0 && (<NettoRow label={`BV-vermindering groepsverzekering (30%)`} bedrag={r.bv.verminderingGroepsverzekering} prefix="+" dimmed/>)}
          {r.fiscaleWerkbonus > 0 && (<NettoRow label={<>
                  Fiscale werkbonus{" "}
                  <HelpTooltip text="Berekening volgens de fiscale werkbonusformule: 33,14% × luik A + 52,54% × luik B."/>
                </>} bedrag={r.fiscaleWerkbonus} prefix="+" dimmed/>)}
          <NettoRow label="BV (na verminderingen)" bedrag={r.bv.bvNaVerminderingen}/>
          <NettoSectionRow label="Onkostenvergoedingen en inhoudingen"/>
          <NettoRow label={<>
                Bijzondere bijdrage sociale zekerheid{" "}
                <HelpTooltip text={`BBSZ-scenario: ${r.bbsz.scenarioLabel}. De maandinhouding is gebaseerd op het kwartaalbedrag ${formatEUR(r.bbsz.kwartaalbijdrage)} gedeeld door 3.`}/>
              </>} bedrag={r.bbsz.maandelijksBedrag}/>
          {r.maaltijdchequeWerknemersbijdrage > 0 && (<NettoRow label={`Maaltijdcheques werknemersbijdrage (${formatEUR(r.maaltijdchequeWerknemersbijdragePerDag)} × ${r.maaltijdchequeWerkdagen} dagen)`} bedrag={r.maaltijdchequeWerknemersbijdrage}/>)}
          {r.woonwerkVrijgesteldPerMaand > 0 && (<NettoRow label="Woon-werkvergoeding" bedrag={r.woonwerkVrijgesteldPerMaand} prefix="+" dimmed/>)}
          {r.hospitalisatieEigenBijdrage > 0 && (<NettoRow label="Eigen bijdrage hospitalisatieverzekering" bedrag={r.hospitalisatieEigenBijdrage}/>)}
          {r.onkostenvergoedingPerMaand > 0 && (<NettoRow label="Onkostenvergoedingen" bedrag={r.onkostenvergoedingPerMaand} prefix="+" dimmed/>)}
          {toontTerugnameVaa && (<NettoRow label="Terugname VAA" bedrag={totaalTerugnameVaa} onToggle={() => setVaaDetailOpen(!vaaDetailOpen)} open={vaaDetailOpen}/>)}
          {toontTerugnameVaa && vaaDetailOpen && (<NettoDetailRow>
              <div style={{ display: "grid", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>VAA bedrijfswagen toegevoegd aan BV-basis</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                    + {formatEUR(r.vaaBedrijfswagenPerMaand)}
                  </span>
                </div>
                {vaaWerkmiddelen?.lijnen.map((lijn) => (<div key={lijn.datapunt.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span>VAA {lijn.label} toegevoegd aan bruto RSZ/BV-basis</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                      + {formatEUR(lijn.bedrag)}
                    </span>
                  </div>))}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>Terugname voordelen alle aard</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-navy-500)" }}>
                    - {formatEUR(totaalTerugnameVaa)}
                  </span>
                </div>
                <div>
                  Voordelen alle aard verhogen de RSZ- en/of BV-basis, maar worden niet cash uitbetaald.
                </div>
              </div>
            </NettoDetailRow>)}
          <NettoRow label="Nettoloon" bedrag={r.nettoloon} prefix="" variant="total"/>
          {maaltijdcheques.totaleWaarde > 0 && (<NettoRow label={`Nettoloon incl. maaltijdcheques (totale waarde ${formatEUR(maaltijdcheques.totaleWaardePerDag)} × ${maaltijdcheques.werkdagen} dagen)`} bedrag={nettoloonInclusiefMaaltijdcheques} prefix="" variant="subtotal"/>)}
          <tr>
            <td colSpan={2} style={{
            padding: "8px 0",
            fontSize: 12,
            color: "var(--color-text-muted)",
            borderTop: "1px dashed var(--color-border)",
        }}>
              Aanvullende gemeentebelasting: geschat{" "}
              {formatEUR(round2((r.nettoloon * 12 * gemeentebelastingPct) / 100))}/jaar{" "}
              <HelpTooltip text={`Indicatieve jaarimpact bij ${gemeentebelastingPct.toFixed(1).replace(".", ",")}% aanvullende gemeentebelasting. Dit bedrag is niet inbegrepen in het maandloon en wordt via de jaarlijkse PB-afrekening verwerkt.`}/>
            </td>
          </tr>
        </tbody>
      </table>

      
      <AuditSourceGroup datapunten={[
            r.werkbonus.datapunt,
            r.bbsz.datapunt,
            ...r.bv.datapunten,
            ...(vaaWerkmiddelen?.datapunten ?? []),
        ]}/>
    </div>);
}
