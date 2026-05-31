import { DocumentFooter, DocumentHeader, ProFormaDocument, SummaryCard, TableFrame, Td, Th, } from "@/components/DocumentPrimitives";
import { formatEUR, round2 } from "@/lib/money";
import type { Loonrun } from "@/lib/loonrun";
import { generatieDatumLabel } from "@/lib/profielLabels";
interface WerkgeverRapportProps {
    loonrun: Loonrun;
}
export function WerkgeverRapport({ loonrun }: WerkgeverRapportProps) {
    const werkgeverNaam = loonrun.werknemers.find((w) => w.profiel.werkgeverNaam)?.profiel
        .werkgeverNaam ?? "";
    const generatieDatum = generatieDatumLabel();
    const berekend = loonrun.werknemers.filter((w) => w.loonfiche);
    return (<ProFormaDocument className="werkgever-rapport-document">
        <DocumentHeader title="Loonkostoverzicht" periode={loonrun.periode} details={<>
            {werkgeverNaam && (<div style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                }}>
                {werkgeverNaam}
              </div>)}
            <div style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
            }}>
              {generatieDatum}
            </div>
            </>}/>
        {berekend.length > 0 && (<div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 28,
            }}>
            <SummaryCard label="Totaal bruto cash" bedrag={loonrun.totalen.cashBruto}/>
            <SummaryCard label="Totaal RSZ-basis" bedrag={loonrun.totalen.brutoRszBasis}/>
            <SummaryCard label="Totaal netto" bedrag={loonrun.totalen.netto}/>
            <SummaryCard label="Werkgeverskost" bedrag={loonrun.totalen.werkgeverskost} accent/>
            <SummaryCard label="Loonwig" bedrag={loonrun.totalen.loonwigPct} isPercentage/>
          </div>)}

        {berekend.length > 0 ? (<TableFrame>
              <thead>
                <tr style={{
                background: "var(--color-navy-50)",
                borderBottom: "1px solid var(--color-border)",
            }}>
                  <Th>Werknemer</Th>
                  <Th align="right">Bruto cash</Th>
                  <Th align="right">RSZ-basis</Th>
                  <Th align="right">Netto</Th>
                  <Th align="right">Werkgeverskost</Th>
                  <Th align="right">Loonwig</Th>
                </tr>
              </thead>
              <tbody>
                {loonrun.werknemers.map((w) => (<tr key={w.id} className="werkgever-rapport-row" style={{
                    borderBottom: "1px solid var(--color-navy-50)",
                }}>
                    <Td>
                      <div style={{ fontWeight: 600 }}>{w.naam}</div>
                      {w.status === "fout" && (<div style={{
                        fontSize: 11,
                        color: "#991b1b",
                        marginTop: 2,
                    }}>
                          {w.fout}
                        </div>)}
                    </Td>
                    <Td align="right">
                      {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.cashBrutoloon)
                    : "—"}
                    </Td>
                    <Td align="right">
                      {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.brutoRszBasis)
                    : "—"}
                    </Td>
                    <Td align="right">
                      {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.nettoTeBetalen)
                    : "—"}
                    </Td>
                    <Td align="right">
                      {w.loonfiche
                    ? formatEUR(w.loonfiche.totalen.werkgeverskostMaand)
                    : "—"}
                    </Td>
                    <Td align="right">
                      {w.loonfiche && w.loonfiche.totalen.werkgeverskostMaand > 0
                    ? `${round2(((w.loonfiche.totalen.werkgeverskostMaand -
                        w.loonfiche.totalen.nettoTeBetalen) /
                        w.loonfiche.totalen.werkgeverskostMaand) *
                        100)}%`
                    : "—"}
                    </Td>
                  </tr>))}
                
                <tr style={{
                background: "var(--color-navy-50)",
                borderTop: "2px solid var(--color-border)",
                fontWeight: 700,
            }}>
                  <Td>
                    <span style={{ fontWeight: 800 }}>TOTALEN</span>
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.cashBruto)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.brutoRszBasis)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.netto)}
                  </Td>
                  <Td align="right">
                    {formatEUR(loonrun.totalen.werkgeverskost)}
                  </Td>
                  <Td align="right">
                    {loonrun.totalen.loonwigPct !== null
                ? `${loonrun.totalen.loonwigPct}%`
                : "—"}
                  </Td>
                </tr>
              </tbody>
          </TableFrame>) : (<div style={{
                textAlign: "center",
                padding: "40px 24px",
                color: "var(--color-text-muted)",
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
            }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Geen berekende werknemers
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Voeg werknemers toe via CSV-import om het overzicht op te bouwen.
            </div>
          </div>)}
        <DocumentFooter />
    </ProFormaDocument>);
}
