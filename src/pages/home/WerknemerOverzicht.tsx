import { CompactTable, DocumentHeader, DocumentSection, MetaCard, ProFormaDocument, } from "@/components/DocumentPrimitives";
import type { JaarcomponentNetto } from "@/lib/jaaroverzicht";
import { round2 } from "@/lib/money";
import { refDatumVoorMaand, type Profiel } from "@/lib/profiel";
import { generatieDatumLabel, profielPeriodeLabel, statuutLabel } from "@/lib/profielLabels";
import { berekenNettoVoorProfiel, berekenWerkgeverskostVoorProfiel, berekenJaaroverzichtVoorProfiel, berekenVaaWerkmiddelenVoorProfiel, berekenMobiliteitVoorProfiel, berekenLoonwigVoorProfielResultaat, } from "@/lib/profielBerekeningen";
import type { VaaForfaitsWerkmiddelenResultaat } from "@/lib/vaaForfaits";

interface WerknemerOverzichtProps {
    profiel: Profiel;
}

const doelgroepverminderingVoorwaardeTekst =
    "Voorwaarde doelgroepvermindering: De doelgroepvermindering kan enkel toegepast worden indien de onderneming daadwerkelijk extra werkgelegenheid creëert , waarbij rekening gehouden wordt met bestaande/voorafgaande tewerkstellingen in andere vennootschappen waarmee de nieuwe onderneming verbonden is.";

const disclaimerTekst =
    "Het doel van deze simulatie is om u een beeld te geven van de bedragen en kosten die verbonden zijn aan een bepaald loon, op een bepaald moment. Deze simulatie is een momentopname en de resultaten zijn afhankelijk van vele variabelen die aan evolutie onderhevig zijn. Wij kunnen in geen geval aansprakelijk gesteld worden voor mogelijke rechtstreekse- of onrechtstreekse schade, van eender welke omvang, door gelijk welk gebruik van deze simulatie.";

export function WerknemerOverzicht({ profiel }: WerknemerOverzichtProps) {
    const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
    const generatieDatum = generatieDatumLabel();
    const periode = profielPeriodeLabel(profiel);

    let netto = null;
    let wgk = null;
    let loonwigPct: number | null = null;
    let jaaroverzicht = null;
    let vaaWerkmiddelen: VaaForfaitsWerkmiddelenResultaat | null = null;

    if (profiel.statuut === "bediende") {
        try {
            const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum);
            vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);
            netto = berekenNettoVoorProfiel(profiel, refDatum);
            wgk = berekenWerkgeverskostVoorProfiel(profiel, refDatum, vaaWerkmiddelen, mobiliteit);
            loonwigPct = berekenLoonwigVoorProfielResultaat(wgk, netto);
            jaaroverzicht = berekenJaaroverzichtVoorProfiel(profiel, refDatum, netto, wgk, vaaWerkmiddelen, mobiliteit);
        }
        catch {
            // Bij berekeningsfouten tonen we het overzicht zonder resultaten.
        }
    }

    const isStudent = profiel.statuut === "student";
    const heeftDoelgroepvermindering =
        profiel.doelgroepverminderingEersteAanwervingen !== "geen" &&
        (jaaroverzicht?.werkgever.doelgroepvermindering ?? 0) > 0;

    const werkgeverAdres = [
        profiel.werkgeverStraat && profiel.werkgeverHuisnummer
            ? `${profiel.werkgeverStraat} ${profiel.werkgeverHuisnummer}`
            : profiel.werkgeverStraat || null,
        profiel.werkgeverPostcode && profiel.werkgeverGemeente
            ? `${profiel.werkgeverPostcode} ${profiel.werkgeverGemeente}`
            : profiel.werkgeverGemeente || null,
    ].filter(Boolean).join(", ");

    return (<ProFormaDocument className="werknemer-overzicht-document" contentClassName="wo-content">
      <DocumentHeader className="wo-header" title="Loonoverzicht" periode={periode} marginBottom={20} details={<>
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
                marginBottom: 20,
            }}>
            {profiel.werknemerNaam
                ? (<MetaCard label="Werknemer" value={profiel.werknemerNaam}/>)
                : (<MetaCard label="Werknemer" value="—"/>)}
            {profiel.werkgeverNaam
                ? (<MetaCard label="Werkgever" value={profiel.werkgeverNaam}/>)
                : profiel.werkgeverOndernemingsnummer
                    ? (<MetaCard label="Werkgever" value="—"/>)
                    : null}
            {profiel.werknemerReferentie && (<MetaCard label="Referentie" value={profiel.werknemerReferentie}/>)}
            {profiel.werkgeverOndernemingsnummer && (<MetaCard label="Ondernemingsnummer" value={profiel.werkgeverOndernemingsnummer}/>)}
            {profiel.werknemerRijksregister && (<MetaCard label="Rijksregisternummer" value={profiel.werknemerRijksregister}/>)}
            {werkgeverAdres && (<MetaCard label="Adres werkgever" value={werkgeverAdres}/>)}
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

      {netto && wgk && jaaroverzicht && (<>
            <div className="wo-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20,
                marginBottom: 24,
            }}>
              <DocumentSection title="Bruto Netto op maandbasis" className="wo-section">
                <CompactTable rows={maakNettoMaandRijen(profiel, netto, vaaWerkmiddelen)}/>
              </DocumentSection>
              <DocumentSection title="Loonkost op maandbasis" className="wo-section">
                <CompactTable rows={maakWerkgeverskostMaandRijen(wgk)}/>
              </DocumentSection>
            </div>

            <div className="wo-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 20,
                marginBottom: 24,
            }}>
              <DocumentSection title="Bruto Netto op jaarbasis" className="wo-section">
                <CompactTable rows={maakNettoJaarRijen(jaaroverzicht.netto)}/>
              </DocumentSection>
              <DocumentSection title="Loonkost op jaarbasis" className="wo-section">
                <CompactTable rows={maakWerkgeverskostJaarRijen(jaaroverzicht.werkgever)}/>
                {heeftDoelgroepvermindering && (<div className="wo-doelgroep" style={{
                        marginTop: 12,
                        padding: 10,
                        background: "var(--color-primary-soft)",
                        border: "1px solid var(--color-primary-border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 11,
                        color: "var(--color-text)",
                        lineHeight: 1.45,
                    }}>
                    {doelgroepverminderingVoorwaardeTekst}
                  </div>)}
              </DocumentSection>
            </div>
          </>)}

      {netto && wgk && loonwigPct !== null && (<div className="wo-loonwig" style={{
            marginBottom: 20,
            padding: "8px 12px",
            background: "var(--color-primary-soft)",
            border: "1px solid var(--color-primary-border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--color-text)",
        }}>
          <strong>Loonwig: {(loonwigPct * 100).toFixed(1)} %</strong>
          {" — percentage van de werkgeverskost dat niet uitbetaald wordt als netto loon."}
        </div>)}

      <div className="wo-footer wo-disclaimer" style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
            fontStyle: "italic",
        }}>
        {disclaimerTekst}
      </div>
    </ProFormaDocument>);
}

function maakNettoMaandRijen(profiel: Profiel, netto: Exclude<ReturnType<typeof berekenNettoVoorProfiel>, null>, vaaWerkmiddelen: VaaForfaitsWerkmiddelenResultaat | null) {
    const totaalTerugnameVaa = netto.vaaBedrijfswagenPerMaand + netto.vaaRszPlichtigPerMaand;
    const rows = [
        { label: "Brutoloon", bedrag: netto.brutoloon },
        ...(vaaWerkmiddelen?.lijnen ?? []).map((lijn) => ({ label: `VAA ${lijn.label}`, bedrag: lijn.bedrag })),
        { label: "Totaal bruto", bedrag: netto.brutoRszBasis, bold: true },
        { label: "RSZ werknemer", bedrag: -netto.rsz.werknemerBijdrage },
        ...(netto.werkbonus.totaal > 0
            ? [{ label: "Werkbonus", bedrag: netto.werkbonus.totaal }]
            : []),
        ...(netto.vaaBedrijfswagenPerMaand > 0
            ? [{ label: "VAA bedrijfswagen", bedrag: netto.vaaBedrijfswagenPerMaand }]
            : []),
        { label: "Belastbaar loon", bedrag: netto.belastbaarMaandloonVoorBV, bold: true },
        { label: "Bedrijfsvoorheffing", bedrag: -netto.bv.bvNaVerminderingen },
        ...(netto.bbsz.maandelijksBedrag > 0
            ? [{ label: "Bijzondere bijdrage RSZ", bedrag: -netto.bbsz.maandelijksBedrag }]
            : []),
        ...(netto.maaltijdchequeWerknemersbijdrage > 0
            ? [{ label: "Maaltijdcheques (werknemer)", bedrag: -netto.maaltijdchequeWerknemersbijdrage }]
            : []),
        ...(netto.hospitalisatieEigenBijdrage > 0
            ? [{ label: "Hospitalisatie (eigen bijdrage)", bedrag: -netto.hospitalisatieEigenBijdrage }]
            : []),
        ...(netto.onkostenvergoedingPerMaand > 0
            ? [{ label: "Onkostenvergoedingen", bedrag: netto.onkostenvergoedingPerMaand }]
            : []),
        ...(netto.woonwerkNettoVrijgesteldPerMaand > 0
            ? [{ label: "Woon-werkvergoeding (netto vrijgesteld)", bedrag: netto.woonwerkNettoVrijgesteldPerMaand }]
            : []),
        ...(totaalTerugnameVaa > 0
            ? [{ label: "Terugname VAA", bedrag: -totaalTerugnameVaa }]
            : []),
        { label: "Netto op maandbasis", bedrag: netto.nettoloon, bold: true, highlight: true },
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
    ];
    return rows;
}

function maakWerkgeverskostMaandRijen(wgk: Exclude<ReturnType<typeof berekenWerkgeverskostVoorProfiel>, null>) {
    return [
        { label: "Brutoloon", bedrag: wgk.brutoloon },
        { label: "RSZ werkgever", bedrag: wgk.rszWerkgever },
        { label: "Arbeidsongevallen", bedrag: wgk.arbeidsongevallen },
        { label: "Provisie eindejaarspremie", bedrag: wgk.provisieEindejaarspremie },
        { label: "Provisie vakantiegeld", bedrag: wgk.provisieVakantiegeld },
        ...(wgk.extraVoordelen > 0
            ? [{ label: "Extralegale voordelen", bedrag: wgk.extraVoordelen }]
            : []),
        ...(wgk.doelgroepverminderingWerkgeverPerMaand > 0
            ? [{ label: "Doelgroepvermindering eerste aanwervingen", bedrag: -wgk.doelgroepverminderingWerkgeverPerMaand }]
            : []),
        { label: "Totale loonkost op maandbasis", bedrag: wgk.totaleLoonkostBreed, bold: true, highlight: true },
        ...(wgk.doelgroepverminderingWerkgeverPerMaand > 0
            ? [{ label: "Totale loonkost incl. doelgroepvermindering", bedrag: wgk.totaleLoonkostBreedNaDoelgroepvermindering, bold: true }]
            : []),
    ];
}

function maakNettoJaarRijen(netto: Exclude<ReturnType<typeof berekenJaaroverzichtVoorProfiel>, null>["netto"]) {
    const rows: Array<{ label: string; bedrag: number; bold?: boolean; highlight?: boolean }> = [];
    voegJaarcomponentToe(rows, "Eindejaarspremie", netto.eindejaarspremie);
    voegJaarcomponentToe(rows, "Dubbel vakantiegeld", netto.dubbelVakantiegeld);
    voegJaarcomponentToe(rows, "Sectorale jaarpremie PC 200", netto.jaarpremie);
    if (netto.bonus.bruto > 0) {
        voegJaarcomponentToe(rows, "Bonus", netto.bonus);
    }
    if (netto.ecocheques > 0) {
        rows.push({ label: "Ecocheques", bedrag: netto.ecocheques });
    }
    rows.push({ label: "Netto op jaarbasis", bedrag: netto.totaalNettoJaarloon, bold: true, highlight: true });
    return rows;
}

function voegJaarcomponentToe(rows: Array<{ label: string; bedrag: number; bold?: boolean; highlight?: boolean }>, titel: string, component: JaarcomponentNetto) {
    rows.push({ label: `${titel} — bruto`, bedrag: component.bruto });
    rows.push({ label: `${titel} — RSZ`, bedrag: -component.rsz });
    rows.push({ label: `${titel} — belastbaar loon`, bedrag: component.belastbaar, bold: true });
    rows.push({ label: `${titel} — bedrijfsvoorheffing`, bedrag: -component.bv });
    rows.push({ label: `${titel} — netto`, bedrag: component.netto });
}

function maakWerkgeverskostJaarRijen(werkgever: Exclude<ReturnType<typeof berekenJaaroverzichtVoorProfiel>, null>["werkgever"]) {
    return [
        { label: "Totale loonkost op maandbasis × 12", bedrag: werkgever.maandbasisX12 },
        { label: "Eindejaarspremie + jaarlijkse premie + ecocheques", bedrag: werkgever.jaarpremiesEnEcocheques },
        { label: "RSZ op eindejaarspremie + sectorale premie", bedrag: werkgever.rszOpEindejaarspremieEnJaarpremie },
        ...(werkgever.bonusBruto > 0
            ? [
                { label: "Bonus", bedrag: werkgever.bonusBruto },
                { label: "RSZ op bonus", bedrag: werkgever.rszOpBonus },
            ]
            : []),
        { label: "Dubbel vakantiegeld", bedrag: werkgever.dubbelVakantiegeld },
        { label: "Totale loonkost op jaarbasis", bedrag: werkgever.totaleLoonkostJaarExclusiefDoelgroepvermindering, bold: true, highlight: true },
        ...(werkgever.doelgroepvermindering > 0
            ? [
                { label: "Doelgroepvermindering eerste aanwervingen", bedrag: -werkgever.doelgroepvermindering },
                { label: "Totale loonkost incl. doelgroepvermindering", bedrag: werkgever.totaleLoonkostJaarInclusiefDoelgroepvermindering, bold: true },
            ]
            : []),
    ];
}
