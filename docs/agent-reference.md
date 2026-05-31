# Agent Reference

Detailcontext voor agents. Dit bestand is lazy-loaded: open het alleen wanneer `AGENTS.md` of de taak naar deze details verwijst.

## Configuratie

| Bestand | Doel |
|---|---|
| `package.json` | Dependencies en scripts, ESM via `type: "module"` |
| `vite.config.ts` | React, Tailwind, alias `@`, poort 7000 met `strictPort` |
| `tsconfig.json` | Project-references en path alias voor Bun-compatibiliteit |
| `tsconfig.app.json` | `ES2022`, `strict: true`, types `bun`, include `src` |
| `index.html` | Entrypoint, `nl-BE`, Inter font |

## Mapstructuur

```text
src/
├── main.tsx
├── App.tsx
├── index.css
├── branding/
│   ├── brand.ts
│   └── brand.css
├── data/
│   ├── pc200_payroll_dataset_2026.json
│   └── pc200_payroll_dataset.schema.json
├── types/
│   ├── dataset.ts
│   └── assets.d.ts
├── lib/
│   ├── __tests__/
│   ├── errors.ts
│   ├── dataset.ts
│   ├── periode.ts
│   ├── money.ts
│   ├── schemaValidate.ts
│   ├── baremas.ts
│   ├── rsz.ts
│   ├── werkbonus.ts
│   ├── bbsz.ts
│   ├── bv.ts
│   ├── bvBijzonder.ts
│   ├── netto.ts
│   ├── werkgeverskost.ts
│   ├── eindejaarspremie.ts
│   ├── jaarpremie.ts
│   ├── ecocheques.ts
│   ├── fietsvergoeding.ts
│   ├── woonwerkTrein.ts
│   ├── woonwerkVerkeer.ts
│   └── vaaBedrijfswagen.ts
├── components/
│   ├── AuditPanel.tsx
│   ├── AuditOpenContext.tsx
│   ├── Banner.tsx
│   ├── BronLink.tsx
│   ├── Field.tsx
│   ├── ResultBand.tsx
│   ├── ResultCard.tsx
│   ├── ResultsSummaryStrip.tsx
│   └── StatusBadge.tsx
└── pages/
    ├── HomePage.tsx
    ├── home/
    ├── TestcasesPage.tsx
    └── ScopePage.tsx
```

## SSOT Wegwijzer

| Vraag | Bron |
|---|---|
| Toolscope en buiten scope | `knowledgebase/01_project_scope.md` |
| Wettelijk kader en AJ 2027-parameters | `knowledgebase/02_regelkader_2026.md` |
| Datasetstructuur | `knowledgebase/03_datamodel.md` + `knowledgebase/DATASET_REFERENCE.md` |
| Netto, RSZ, BV, werkbonus, BBSZ | `knowledgebase/04_calculator_netto.md` |
| Werkgeverskost | `knowledgebase/05_calculator_werkgeverskost.md` |
| Toolwerking en chatbot | `knowledgebase/12_toolfunctionaliteit.md` |
| Testcases | `knowledgebase/07_testcorpus.md` + `src/lib/__tests__/golden.test.ts` |
| Gaps en pending | `knowledgebase/08_gaps_en_pending.md` |
| Referentietool | `knowledgebase/Referenties/groups_be_salarysim.md` |

## Berekeningsmodules

| Module | Specificatie |
|---|---|
| `baremas.ts` | `knowledgebase/02_regelkader_2026.md` sectie barema's |
| `rsz.ts` | `knowledgebase/04_calculator_netto.md` RSZ |
| `werkbonus.ts` | `knowledgebase/04_calculator_netto.md` sociale werkbonus |
| `bbsz.ts` | `knowledgebase/04_calculator_netto.md` BBSZ |
| `bv.ts` | `knowledgebase/04_calculator_netto.md` bedrijfsvoorheffing |
| `bvBijzonder.ts` | `knowledgebase/04_calculator_netto.md` bijzondere BV |
| `netto.ts` | `knowledgebase/04_calculator_netto.md` bruto-netto flow |
| `werkgeverskost.ts` | `knowledgebase/05_calculator_werkgeverskost.md` |
| `eindejaarspremie.ts`, `jaarpremie.ts`, `ecocheques.ts`, `woonwerkTrein.ts`, `fietsvergoeding.ts` | `knowledgebase/02_regelkader_2026.md` premies en mobiliteit |

## Dataset En Errors

`safeGetValue` bewaakt status (`actief`, `mogelijk_verouderd`, `conflict`, `niet_gevonden`, `gemarkeerd_voor_review`) en geldigheid (`geldig_vanaf`, `geldig_tot`). Voor hard-gecodeerde parameters mogen modules `getDatapunt` gebruiken voor audit-trail, niet voor runtime-rekenwaarden.

Error hierarchy:

```text
PC200DatasetError
├── DatapuntOnbekend
├── DatapuntNietBruikbaar
├── DatapuntNietGeldigOpDatum
└── BaremaBuitenSchaalError
```

## Resultatenpaneel

De rechter resultatenkolom volgt deze structuur:

1. `ResultsSummaryStrip`, sticky op `top: 73px`, met Bruto, Netto, Werkgeverskost, Loonwig, quick jumps en audit-toggle. Studentenmodus toont alleen `Bruto (student)`.
2. `ResultBand` voor `band-loonkost`, `band-loonbasis`, `band-voordelen` en `band-mobiliteit`.

`bouwResultaten()` retourneert `{ summary, bands }`. `computeSummary()` moet dezelfde parameters gebruiken als de loonkostband, inclusief extralegale voordelen en `extraEcocheques: ecoResult.bedrag / 12`, anders divergeren summary en detailpanelen.

`AuditPanel` gebruikt `AuditOpenContext` met `force: "all" | "none" | null`. `AuditOpenProvider` staat rond alle bands in `ResultsPanel`.

## Profielvelden Voor Werkgeverskost

| Veld | Type | Default | Betekenis |
|---|---|---|---|
| `arbeidsongevallenPct` | `number` | `0.003` | AO-verzekering als decimaal; UI toont procent |
| `extraGroepsverzekering` | `number` | `0` | Patronale groepsverzekering per maand |
| `maaltijdchequeWerkgeversaandeelPerDag` | `number` | `8.91` | Werkgeversaandeel per dag, begrensd op 8,91 euro vanaf 2026-01-01 |
| `extraHospitalisatie` | `number` | `0` | Hospitalisatieverzekering per maand |

`extraEcocheques` is geen profielveld; leid dit af via `ecocheques({ tewerkstellingsbreuk, refDatum }).bedrag / 12`.

## Teststrategie

De test-suite gebruikt `bun:test`. Standaard referentiedatum is `REF_2026 = "2026-06-01"`.

| Testbestand | Doel |
|---|---|
| `golden.test.ts` | Exacte EUR-golden tests voor TC/NTC-cases, audit-URL's en bijzondere BV |
| `schemaValidate.smoke.test.ts` | Dataset valideert tegen schema en broken dataset faalt |
| `fodBvValidation.test.ts` | FOD Bijlage III-validatievelden en `status_validatie: "ok"` |
| `HomePage.test.ts` | Statische render-tests voor UI-structuur |

Acceptatie:

- Laag 1: exacte bedragen met `toBe`.
- Laag 2: `toBeCloseTo(..., 0)` voor BV waar circa 0,50 euro tolerantie nodig is.
- Laag 3: maximaal +/- 5 euro per maand tegenover het FOD Bijlage III-corpus; grotere afwijkingen vragen root-cause analyse.
- Audit-resultaten moeten een `datapunt` met truthy `bron_url` hebben.
- Sociale-secretariaat-output is alleen Tier-2 triangulatie en mag geen officiële bronwaarde bepalen.

## Branding

De actieve brand is Jaakie. Centrale files:

- `src/branding/brand.ts`: naam, logo, titels, footer-copy en document title.
- `src/branding/brand.css`: kleuren, fonts, radii, shadows en compatibele CSS variables.
- `public/jaakie-designsysteem.md`: design guideline.
- `public/jaakie-demo-pagina-updated.html`: visuele referentie.

Introduceer geen oude VH-assets, VH-kleuren of VH-fonts opnieuw.

## Codeconventies

- Nederlands voor domeintermen, UI-teksten en comments.
- Technische JS/TS-termen mogen Engels blijven.
- Functions blijven bij voorkeur rond maximaal 30 regels.
- Dupliceert logica meer dan tweemaal, extraheer een utility.
- Gebruik geen `any`; kies concrete TypeScript-types.
- Groepeer logisch samenhangende props bij componenten met meer dan drie props.
- Async code krijgt error handling.

## Gaps En Pending

Zie `knowledgebase/08_gaps_en_pending.md` voor het volledige overzicht. Korte status:

| Item | Status |
|---|---|
| FOD Bijlage III BV-validatie | `fod_bijlage_iii_ok` |
| BBSZ 2026-voorschot | Actief |
| Arizona hervormingen | Wetsontwerp/hypothese; geen runtimewijziging zonder definitieve publicatie |
| VAA auto-berekening | Deels actief |
| Netto -> Bruto | Actief voor bedienden; studentenmodus fase 2 |

## Snelzoeken

| Taak | Startpunt |
|---|---|
| Nieuw datapunt | `src/data/pc200_payroll_dataset_2026.json`, schema, `knowledgebase/DATASET_REFERENCE.md` |
| Berekening aanpassen | `src/lib/<module>.ts` + relevante `knowledgebase/*.md` |
| Resultaat-UI wijzigen | `src/components/ResultCard.tsx`, `AuditPanel.tsx`, `ResultBand.tsx` |
| Formuliervelden wijzigen | `src/lib/profiel.ts`, `src/pages/home/InputCockpit.tsx`, `src/pages/home/MobiliteitPaneel.tsx` |
| Testcase toevoegen | `src/lib/__tests__/golden.test.ts`, `knowledgebase/07_testcorpus.md` |
| Branding wijzigen | `src/branding/brand.ts`, `src/branding/brand.css` |
| Pagina toevoegen | `src/pages/<Naam>Page.tsx` + route in `src/App.tsx` |
