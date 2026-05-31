import { CompactTable, DocumentFooter, DocumentHeader, DocumentSection, MetaCard, ProFormaDocument, SummaryCard, YearRow, captionStyle, } from "@/components/DocumentPrimitives";
import { round2 } from "@/lib/money";
import { refDatumVoorMaand, type Profiel } from "@/lib/profiel";
import { generatieDatumLabel, profielPeriodeLabel, statuutLabel } from "@/lib/profielLabels";
import { berekenNettoVoorProfiel, berekenWerkgeverskostVoorProfiel, berekenJaaroverzichtVoorProfiel, berekenVaaWerkmiddelenVoorProfiel, berekenMobiliteitVoorProfiel, berekenLoonwigVoorProfielResultaat, } from "@/lib/profielBerekeningen";
interface WerknemerOverzichtProps {
    profiel: Profiel;
}
export function WerknemerOverzicht({ profiel }: WerknemerOverzichtProps) {
    const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
    const generatieDatum = generatieDatumLabel();
    const periode = profielPeriodeLabel(profiel);
    let netto = null;
    let wgk = null;
    let loonwigPct: number | null = null;
    let jaaroverzicht = null;
    if (profiel.statuut === "bediende") {
        try {
            const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum);
            const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);
            netto = berekenNettoVoorProfiel(profiel, refDatum);
            wgk = berekenWerkgeverskostVoorProfiel(profiel, refDatum, vaaWerkmiddelen, mobiliteit);
            loonwigPct = berekenLoonwigVoorProfielResultaat(wgk, netto);
            jaaroverzicht = berekenJaaroverzichtVoorProfiel(profiel, refDatum, netto, wgk, vaaWerkmiddelen, mobiliteit);
        }
        catch {
        }
    }
    const isStudent = profiel.statuut === "student";
    return (<ProFormaDocument className="werknemer-overzicht-document" contentClassName="wo-content">
      <DocumentHeader className="wo-header" title="Loonoverzicht" periode={periode} marginBottom={24} details={<>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {statuutLabel(profiel)}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {generatieDatum}
            </div>
          </>}/>
        {(profiel.werknemerNaam || profiel.werkgeverNaam) && (<div className="wo-metadata" style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginBottom: 24,
            }}>
            {profiel.werknemerNaam && (<MetaCard label="Werknemer" value={profiel.werknemerNaam}/>)}
            {profiel.werknemerReferentie && (<MetaCard label="Referentie" value={profiel.werknemerReferentie}/>)}
            {profiel.werkgeverNaam && (<MetaCard label="Werkgever" value={profiel.werkgeverNaam}/>)}
            {profiel.werkgeverOndernemingsnummer && (<MetaCard label="Ondernemingsnummer" value={profiel.werkgeverOndernemingsnummer}/>)}
          </div>)}

        {netto && wgk && (<div className="wo-summary wo-summary-grid" style={{
                display: "grid",
                gap: 12,
                marginBottom: 28,
            }}>
            <SummaryCard label="Bruto" bedrag={netto.brutoRszBasis}/>
            <SummaryCard label="Netto (maand)" bedrag={netto.nettoloon}/>
            <SummaryCard label="Werkgeverskost" bedrag={wgk.totaleLoonkostBreed} accent/>
            <SummaryCard label="Loonwig" bedrag={loonwigPct} isPercentage/>
            <SummaryCard label="Netto (jaar)" bedrag={jaaroverzicht?.netto.totaalNettoJaarloon ?? null}/>
            <SummaryCard label="WGK (jaar)" bedrag={jaaroverzicht?.werkgever.totaleLoonkostJaar ?? null}/>
          </div>)}

        {isStudent && (<div style={{
                textAlign: "center",
                padding: "32px 24px",
                color: "var(--color-text-muted)",
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                marginBottom: 28,
            }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Studentenmodus</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Voor studenten worden geen RSZ, bedrijfsvoorheffing of werkgeverskost berekend.
            </div>
          </div>)}

        {netto && (<DocumentSection title="Netto loon (maand)" className="wo-section">
            <CompactTable rows={[
                { label: "Brutoloon", bedrag: netto.brutoloon },
                { label: "RSZ werknemer", bedrag: -netto.rsz.werknemerBijdrage },
                ...(netto.werkbonus.totaal > 0
                    ? [{ label: "Werkbonus", bedrag: netto.werkbonus.totaal }]
                    : []),
                { label: "Belastbaar loon", bedrag: netto.belastbaarMaandloon, bold: true },
                { label: "Bedrijfsvoorheffing", bedrag: -netto.bv.bvNaVerminderingen },
                ...(netto.bbsz.maandelijksBedrag > 0
                    ? [{ label: "BBSZ", bedrag: -netto.bbsz.maandelijksBedrag }]
                    : []),
                ...(netto.maaltijdchequeWerknemersbijdrage > 0
                    ? [{ label: "Maaltijdcheques (werknemer)", bedrag: -netto.maaltijdchequeWerknemersbijdrage }]
                    : []),
                ...(netto.hospitalisatieEigenBijdrage > 0
                    ? [{ label: "Hospitalisatie (eigen bijdrage)", bedrag: -netto.hospitalisatieEigenBijdrage }]
                    : []),
                { label: "Netto te betalen (cash)", bedrag: netto.nettoloon, bold: true, highlight: true },
                ...(profiel.maaltijdchequesActief && profiel.arbeidsdagenPerMaand > 0
                    ? [
                        {
                            label: "Maaltijdcheques (waarde)",
                            bedrag: round2((profiel.maaltijdchequeWerkgeversaandeelPerDag +
                                profiel.maaltijdchequeWerknemersbijdragePerDag) *
                                profiel.arbeidsdagenPerMaand),
                        },
                    ]
                    : []),
            ]}/>
          </DocumentSection>)}
        {wgk && (<DocumentSection title="Werkgeverskost (maand)" className="wo-section">
            <CompactTable rows={[
                { label: "Brutoloon", bedrag: wgk.brutoloon },
                { label: "RSZ werkgever", bedrag: wgk.rszWerkgever },
                { label: "Arbeidsongevallen", bedrag: wgk.arbeidsongevallen },
                { label: "Provisie eindejaarspremie", bedrag: wgk.provisieEindejaarspremie },
                { label: "Provisie vakantiegeld", bedrag: wgk.provisieVakantiegeld },
                ...(wgk.extraVoordelen > 0
                    ? [{ label: "Extralegale voordelen", bedrag: wgk.extraVoordelen }]
                    : []),
                { label: "Totale werkgeverskost", bedrag: wgk.totaleLoonkostBreed, bold: true, highlight: true },
            ]}/>
          </DocumentSection>)}
        {jaaroverzicht && (<DocumentSection title="Jaaroverzicht" className="wo-section">
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
            }}>
              <div>
                <div style={{
                ...captionStyle,
                marginBottom: 8,
            }}>
                  Werknemer (netto)
                </div>
                <YearRow label="Maandloon × 12" bedrag={jaaroverzicht.netto.maandloonNettoX12}/>
                <YearRow label="Eindejaarspremie" bedrag={jaaroverzicht.netto.eindejaarspremie.netto}/>
                <YearRow label="Dubbel vakantiegeld" bedrag={jaaroverzicht.netto.dubbelVakantiegeld.netto}/>
                <YearRow label="Jaarpremie PC 200" bedrag={jaaroverzicht.netto.jaarpremie.netto}/>
                {jaaroverzicht.netto.bonus.bruto > 0 && (<YearRow label="Bonus" bedrag={jaaroverzicht.netto.bonus.netto}/>)}
                <YearRow label="Ecocheques" bedrag={jaaroverzicht.netto.ecocheques}/>
                <YearRow label="Totaal netto jaar" bedrag={jaaroverzicht.netto.totaalNettoJaarloon} bold/>
              </div>
              <div>
                <div style={{
                ...captionStyle,
                marginBottom: 8,
            }}>
                  Werkgever
                </div>
                <YearRow label="Maandbasis × 12" bedrag={jaaroverzicht.werkgever.maandbasisX12}/>
                <YearRow label="Jaarpremies + ecocheques" bedrag={jaaroverzicht.werkgever.jaarpremiesEnEcocheques}/>
                <YearRow label="RSZ op premies" bedrag={jaaroverzicht.werkgever.rszOpEindejaarspremieEnJaarpremie}/>
                {jaaroverzicht.werkgever.bonusBruto > 0 && (<>
                    <YearRow label="Bonus" bedrag={jaaroverzicht.werkgever.bonusBruto}/>
                    <YearRow label="RSZ op bonus" bedrag={jaaroverzicht.werkgever.rszOpBonus}/>
                  </>)}
                <YearRow label="Dubbel vakantiegeld" bedrag={jaaroverzicht.werkgever.dubbelVakantiegeld}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid transparent' }}>
                  <span style={{ fontSize: 13 }}>&nbsp;</span>
                  <span style={{ fontSize: 13 }}>&nbsp;</span>
                </div>
                <YearRow label="Totaal loonkost jaar" bedrag={jaaroverzicht.werkgever.totaleLoonkostJaar} bold/>
              </div>
            </div>
          </DocumentSection>)}
        <div className="wo-footer">
          <DocumentFooter />
        </div>
    </ProFormaDocument>);
}
