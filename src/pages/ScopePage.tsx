import dataset from "@/data/pc200_payroll_dataset_2026.json";
import type { Dataset } from "@/types/dataset";

const ds = dataset as unknown as Dataset;

const POC_LIMITATIONS: { titel: string; tekst: string }[] = [
  {
    titel: "1. Geen netto-berekening",
    tekst:
      "Bedrijfsvoorheffing en personenbelasting (gemeente, federaal) zitten niet in deze POC. De monitor stopt op brutoloon plus werkgeverskost; voor netto verwijzen we naar het sociaal secretariaat.",
  },
  {
    titel: "2. Geen maaltijdcheques",
    tekst:
      "PC 200 verplicht geen sectorale maaltijdcheques. Bedrijfseigen toekenning is buiten POC-scope.",
  },
  {
    titel: "3. Geen thuiswerkvergoeding",
    tekst:
      "Geen sectorale verplichting in PC 200. Bedrijfseigen toekenning is buiten POC-scope.",
  },
  {
    titel: "4. Centenindex niet toegepast",
    tekst:
      "De aangekondigde beperking van indexering boven € 4 000 was op peildatum nog niet reglementair gefinaliseerd. We passen de volledige sectorindex 1,0221 toe (zoals door sociale partners bevestigd voor 1/1/2026).",
  },
  {
    titel: "5. Fietsvergoeding vóór 1/10/2026",
    tekst:
      "Pad A — historische tarief € 0,27/km wordt niet berekend. Voor refDatum < 2026-10-01 toont de UI enkel een banner; voor refDatum ≥ 2026-10-01 rekenen we met het CAO 164-tarief van € 0,32/km.",
  },
  {
    titel: "6. Bouw-subset opt-in",
    tekst:
      "De extra werkgeversbijdrage van 1,80 % aanvullend pensioen voor de PC 200-bouwsubset is een vinkje op het profiel. Schakel uit als de werknemer niet onder die subset valt.",
  },
  {
    titel: "7. Studentenmodus = barema-only",
    tekst:
      "Voor studenten toont de monitor enkel het maandloon volgens leeftijd/categorie. RSZ-Solidariteitsbijdrage (2,71 % wkn / 5,42 % wgr) en jaarpremies/eindejaar zijn niet berekend in de POC.",
  },
  {
    titel: "8. Eén dataset-versie tegelijk",
    tekst:
      "Geen historie of multi-jaar selector. De dataset 2026 is bundled; bij wissel naar een ander jaar moet de bundel worden vervangen.",
  },
  {
    titel: "9. Browser-only, geen back-end",
    tekst:
      "Geen authenticatie, geen DB, geen logging. Alles draait client-side en de dataset wordt bij build-tijd ingebakken.",
  },
  {
    titel: "10. Audit, geen advies",
    tekst:
      "Elk getal komt met datapunt-id, status, betrouwbaarheids-tier en primaire bron. De monitor maakt geen juridisch oordeel — bij twijfel altijd de primaire bron raadplegen.",
  },
];

export function ScopePage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-xl font-semibold">Scope &amp; bekend manco</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Wat wel en wat niet in deze POC zit. Bij elke berekening staat ook
          per-datapunt een audit-paneel met status, betrouwbaarheid en bron.
        </p>
      </header>

      <section>
        <h3 className="mb-3 text-base font-semibold">Dataset-meta</h3>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <DefRow label="Dataset" value={ds.meta.dataset} />
            <DefRow label="Paritair Comité" value={`${ds.meta.pc} — ${ds.meta.pc_naam}`} />
            <DefRow label="Land / taal" value={`${ds.meta.land} / ${ds.meta.taal}`} />
            <DefRow label="Doeljaar" value={String(ds.meta.doeljaar)} />
            <DefRow label="Laatste update" value={ds.meta.laatste_update} />
            <DefRow label="Dekking" value={ds.meta.dekking} />
          </dl>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">POC-beperkingen (§10 brief)</h3>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {POC_LIMITATIONS.map((l) => (
            <li
              key={l.titel}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-zinc-900">{l.titel}</div>
              <div className="mt-1 text-xs text-zinc-600">{l.tekst}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Niet gevonden in dataset</h3>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
            {ds.meta.niet_gevonden.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Bron-conflicten</h3>
        {ds.meta.conflicten.length === 0 ? (
          <p className="text-sm text-zinc-500">Geen conflicten geregistreerd.</p>
        ) : (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
            <ul className="list-disc space-y-1 pl-5 text-sm text-rose-900">
              {ds.meta.conflicten.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold">Algemene opmerkingen</h3>
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-blue-900">
            {ds.meta.opmerkingen.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </>
  );
}
