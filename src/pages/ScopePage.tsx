import dataset from "@/data/pc200_payroll_dataset_2026.json";
import type { Dataset, MetaConflictObject, MetaNietGevondenObject, } from "@/types/dataset";
const ds = dataset as unknown as Dataset;
const nietGevonden = ds.meta.niet_gevonden ?? [];
const conflicten = ds.meta.conflicten ?? [];
const opmerkingen = ds.meta.opmerkingen ?? [];
const POC_LIMITATIONS: {
    titel: string;
    tekst: string;
}[] = [
    {
        titel: "1. Netto validatie",
        tekst: "De calculator gebruikt RSZ, werkbonus, BV, fiscale werkbonus en BBSZ. De 30 corpuscases dragen FOD Bijlage III 2026-validatievelden met status ok; Tax-Calc blijft enkel een latere PB-ramingscheck.",
    },
    {
        titel: "2. Maaltijdcheques optioneel",
        tekst: "PC 200 verplicht geen sectorale maaltijdcheques. Bedrijfseigen maaltijdcheques zijn wel optioneel modelleerbaar in het profiel en staan standaard uit.",
    },
    {
        titel: "3. Geen thuiswerkvergoeding",
        tekst: "Geen sectorale verplichting in PC 200. Bedrijfseigen toekenning is buiten POC-scope.",
    },
    {
        titel: "4. Fietsvergoeding vóór 1/10/2026",
        tekst: "Voor maanden vóór oktober 2026 rekent de tool met het sectorale tarief van € 0,27/km en maximum € 10,80 per dag. Vanaf oktober 2026 geldt € 0,32/km met maximum € 12,80 per dag.",
    },
    {
        titel: "5. Geen aparte bouwpensioenbijdrage",
        tekst: "Jaakie rekent geen aparte 1,80 % bouw-subsetbijdrage meer bovenop de globale werkgevers-RSZ. De werkgevers-RSZ blijft een raming op basis van het algemene profitsectorpercentage.",
    },
    {
        titel: "6. Studentenstatuut = barema-only",
        tekst: "Voor studenten toont de monitor enkel het maandloon volgens leeftijd/categorie. RSZ-Solidariteitsbijdrage (2,71 % wkn / 5,42 % wgr) en jaarpremies/eindejaar zijn niet berekend in de POC.",
    },
    {
        titel: "7. VAA-dekking is beperkt",
        tekst: "Bedrijfswagen en forfaitaire werkmiddelen (PC/laptop, GSM, internet, abonnement) zijn actief. VAA woning, verwarming, elektriciteit en tablet zijn niet gemodelleerd.",
    },
    {
        titel: "8. Eén dataset-versie tegelijk",
        tekst: "Geen historie of multi-jaar selector. De dataset 2026 is bundled; bij wissel naar een ander jaar moet de bundel worden vervangen.",
    },
    {
        titel: "9. Payroll browser-only, chat serverless",
        tekst: "De payrollberekeningen draaien client-side en de dataset wordt bij build-tijd ingebakken. De optionele AI-chat is een aparte Vercel serverless laag met Supabase-rate-limiting en minimale eventlogging.",
    },
    {
        titel: "10. Audit, geen advies",
        tekst: "Elk getal komt met datapunt-id, status, betrouwbaarheids-tier en primaire bron. De monitor maakt geen juridisch oordeel — bij twijfel altijd de primaire bron raadplegen.",
    },
];
const panelStyle: React.CSSProperties = {
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    padding: "1rem",
    boxShadow: "var(--shadow-sm)",
};
export function ScopePage() {
    return (<div className="flex flex-col gap-8">
      <header>
        <h2 className="text-xl font-semibold">Scope &amp; bekend manco</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Wat wel en wat niet in deze POC zit. Bij elke berekening staat ook
          per-datapunt een audit-paneel met status, betrouwbaarheid en bron.
        </p>
      </header>

      <section>
        <h3 className="mb-3 text-base font-semibold">Dataset-meta</h3>
        <div style={panelStyle}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <DefRow label="Dataset" value={ds.meta.dataset}/>
            <DefRow label="Paritair Comité" value={`${ds.meta.pc} — ${ds.meta.pc_naam}`}/>
            <DefRow label="Land / taal" value={`${ds.meta.land} / ${ds.meta.taal}`}/>
            <DefRow label="Doeljaar" value={String(ds.meta.doeljaar)}/>
            <DefRow label="Datapunten" value={String(ds.meta.datapunten_aantal)}/>
            <DefRow label="Laatste update" value={ds.meta.laatste_update}/>
            <DefRow label="Dekking" value={ds.meta.dekking.join(", ")}/>
          </dl>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">POC-beperkingen</h3>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {POC_LIMITATIONS.map((l) => (<li key={l.titel} style={panelStyle}>
              <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{l.titel}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{l.tekst}</div>
            </li>))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Niet gevonden in dataset</h3>
        <div style={{ ...panelStyle, background: "var(--color-warning-soft)", border: "1px solid rgba(245,158,11,0.35)" }}>
          <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: "#92400e" }}>
            {nietGevonden.map((n, i) => (<li key={i}>{formatNietGevonden(n)}</li>))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Bron-conflicten</h3>
        {conflicten.length === 0 ? (<p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Geen conflicten geregistreerd.</p>) : (<div style={{ ...panelStyle, background: "var(--color-error-soft)", border: "1px solid rgba(225,29,72,0.28)" }}>
            <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: "#991b1b" }}>
              {conflicten.map((c, i) => (<li key={i}>{formatConflict(c)}</li>))}
            </ul>
          </div>)}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Algemene opmerkingen</h3>
        <div style={{ ...panelStyle, background: "var(--color-info-soft)", border: "1px solid rgba(37,99,235,0.25)" }}>
          <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: "var(--color-navy-700)" }}>
            {opmerkingen.map((o, i) => (<li key={i}>{o}</li>))}
          </ul>
        </div>
      </section>
    </div>);
}
function DefRow({ label, value }: {
    label: string;
    value: string;
}) {
    return (<>
      <dt style={{ color: "var(--color-text-muted)" }}>{label}</dt>
      <dd className="font-medium" style={{ color: "var(--color-text)" }}>{value}</dd>
    </>);
}
function formatNietGevonden(value: string | MetaNietGevondenObject): string {
    if (typeof value === "string")
        return value;
    return [value.onderwerp, value.reden, value.aanbeveling]
        .filter(Boolean)
        .join(" — ");
}
function formatConflict(value: string | MetaConflictObject): string {
    if (typeof value === "string")
        return value;
    const bronLabel = value.bronnen?.length ? `Brannen: ${value.bronnen.join(", ")}` : null;
    return [value.onderwerp, value.beschrijving, bronLabel].filter(Boolean).join(" — ");
}
