# AGENTS.md

Korte, altijd-aan instructies voor coding agents in Jaakie. Laad detailcontext alleen wanneer de taak dat vraagt; zie `docs/agent-reference.md`.

## Project

Jaakie is een browser-only SPA voor payroll-experts onder PC 200. De tool berekent bruto -> netto, netto -> bruto en werkgeverskost met audit-trail naar primaire bronnen.

- Brand in de UI: **Jaakie**. Gebruik "PC 200" alleen als payrollscope, niet als toolnaam.
- UI, domeindocumentatie en payrolltermen zijn Nederlands.
- Stack: TypeScript 5.6, React 19, Vite 8, Tailwind CSS v4, HashRouter.
- Package/runtime: `pnpm` voor dependencies, `bun:test` voor tests. Geen Vitest/Jest.
- Devserver: `pnpm dev` op `http://localhost:7000` met `strictPort: true`.
- Path alias: `@/` wijst naar `src/`.
- Dataset: `src/data/pc200_payroll_dataset_2026.json` bevat 75 datapunten.

## Commands

```bash
pnpm install
pnpm dev
pnpm exec vercel dev
bun test
bun test src/lib/__tests__/golden.test.ts
pnpm typecheck
pnpm build
pnpm preview
```

## Laaggrenzen

- `src/data/`: read-only JSON + schema. Geen berekeningen op `waarde_bron`.
- `src/lib/`: pure payrollfuncties. Geen React, UI-imports of browserstate.
- `src/components/`: presentational UI. Geen berekeningslogica.
- `src/pages/`: routecompositie, profielstate en lib-calls.
- `api/chat.ts`: aparte Vercel serverless runtime voor AI-chat.

Schend deze grenzen niet. Kies de kleinste wijziging die het echte probleem oplost.

## Payroll-Invarianten

- `src/main.tsx` valideert de dataset tegen `src/data/pc200_payroll_dataset.schema.json` voor React mount. Omzeil deze startup gate nooit.
- Berekeningen gebruiken datasetwaarden via `src/lib/dataset.ts` en `src/lib/periode.ts`.
- Gebruik `safeGetValue(datapuntId, { refDatum, toelatenMogelijkVerouderd? })` voor datum- en statusbewuste waarden.
- Voer nooit runtime-aritmetiek uit op `waarde_bron`; gebruik alleen `waarde_genormaliseerd` of `tabel_per_*`.
- Elke berekende waarde die afhankelijk is van een datasetparameter moet een echte bron-`Datapunt` meedragen. Fabricateer nooit datapunt-ID's, bedragen, percentages of bron-URL's.
- Fouten uit `src/lib/errors.ts` moeten door de UI als `Banner` kunnen landen; laat dataproblemen de app niet crashen.
- FOD Financien / Bijlage III is de primaire bron voor BV AJ 2027. Sociale-secretariaat-tools zijn hoogstens Tier-2 triangulatie.

## Lazy-Load Context

- Start gericht ontwikkelwerk met `LESSONS.md`.
- Voor inhoudelijke payrollwijzigingen: open `knowledgebase/README.md`, het relevante `knowledgebase/*.md` bestand en de gerichte tests.
- Voor netto/bv/werkbonus/bbsz: open `knowledgebase/04_calculator_netto.md`.
- Voor werkgeverskost: open `knowledgebase/05_calculator_werkgeverskost.md`.
- Voor dataset/schema: open `src/data/*`, `knowledgebase/03_datamodel.md` en `knowledgebase/DATASET_REFERENCE.md`.
- Voor UI/routes/inputs/outputs/chatgedrag: open `knowledgebase/12_toolfunctionaliteit.md` en de relevante componenten.
- Voor branding: wijzig eerst `src/branding/*`; gebruik `public/jaakie-designsysteem.md` alleen wanneer visuele tokens of stijlkeuzes nodig zijn.
- Voor extra detail over modules, panelen, profielvelden, tests en snelzoeken: open `docs/agent-reference.md`.

## SSOT En Documentatie

- De `knowledgebase/` folder is de SSOT voor regelkader, calculator-specs, datapunten, testcorpus, gaps, roadmap, bronnenhierarchie en AJ 2027-parameters.
- Werk de relevante knowledgebase-bestanden bij wanneer code, dataset, tests of gebruikersinformatie een inhoudelijke domeinwijziging of tegenspraak introduceren.
- Werk `knowledgebase/12_toolfunctionaliteit.md` bij wanneer UI, routes, inputs, outputs, berekeningsflow, chatbotgedrag of featurebeschikbaarheid wijzigen.
- Werk `MEMORY.md` alleen bij na echte repo-wijzigingen, met een korte logregel: datum, wat, waarom.
- Werk `LESSONS.md` alleen bij voor duurzame lessen, niet voor gewone changelog-items.

## AI-Chat En Security

- Payrollberekeningen blijven browser-only en doen geen backend calls.
- De frontend praat voor chat alleen met `/api/chat`.
- OpenAI-, Supabase- en andere secrets staan uitsluitend server-side. Gebruik nooit `VITE_*` voor secrets.
- Chat-antwoorden mogen alleen steunen op geindexeerde corpusbestanden uit `knowledgebase/` en `knowledgebase/onderzoek/`.
- Gebruik geen `eval` of dynamische code-uitvoering.

## Tokenzuinig Werken (verplicht)

- **Read-strategie**
  - Start met `rg -n` en lees daarna alleen gerichte snippets (`Get-Content -Skip/-First` of equivalent).
  - Vermijd full-file reads van grote bestanden (zoals uitgebreide tests of corpusbestanden), tenzij expliciet nodig voor de wijziging.
  - Hanteer **read-on-change**: herlees een bestand alleen na een eigen edit of wanneer een falende test direct naar dat bestand wijst.
- **Diff-strategie**
  - Gebruik standaard file-scoped diff (`git diff -- <file>`).
  - Gebruik brede diffs alleen in release-/reviewcontext of wanneer de gebruiker dat expliciet vraagt.
- **Zoek-strategie**
  - Begin smal: specifiek pad + concreet patroon + filters.
  - Verbreed pas bij geen hits of aantoonbare noodzaak.
- **Test-strategie**
  - Draai eerst 1 gerichte test op geraakt gedrag.
  - Breid daarna uit naar een compacte regressieset alleen als de eerste test slaagt of wanneer gedeelde contracten geraakt zijn.
  - Vermijd dubbele overlappende testruns zonder nieuwe informatie.
- **Web/browse-strategie**
  - Browse alleen voor tijdsgevoelige/externe feiten, expliciete bronverificatie of wanneer lokale context onvoldoende is.
  - Werk lokale codebugs eerst lokaal uit.
- **Tool-output discipline**
  - Vermijd commands die onnodig veel output dumpen.
  - Segmenteer inspectie in kleine, relevante outputblokken.

## Verificatie

- Werk standaard tokenzuinig: bij kleine gerichte wijzigingen eerst alleen de directe runtime/UI-code, 1 gerichte zoekronde, 1 gerichte test en hoogstens de verplichte korte SSOT/MEMORY-update. Breid pas uit naar grote docs, corpusbestanden, brede audits of volledige testsets wanneer tests falen, gedeelde contracten geraakt zijn of de gebruiker dat expliciet vraagt.
- Minimale checks zijn toegestaan zonder extra bevestiging: gerichte test, `bun test`, `bun run typecheck` of `bun run build` wanneer compiled code raakt.
- Bij alleen documentatiewijzigingen volstaan woord-/regelchecks en gerichte zoekchecks.
- Er is geen ESLint, Prettier of Biome. Houd bestaande stijl consistent.
- **Stopvoorwaarden voor escalatie naar breed werk**
  - Schaal pas op naar brede reads/diffs/tests als minimaal één van deze condities geldt: gerichte test faalt, wijziging raakt gedeelde contracten, of gebruiker vraagt expliciet om brede validatie/audit.
  - Noteer bij escalatie in de eindboodschap kort waarom opgeschaald werd.

## Standaard Eindrapportering

- Sluit taken af met een kort statusblok:
  - `Token discipline: reads X (gericht), tests Y (gericht/regressie), diffs Z (file-scoped), afwijking: ja/nee + reden`
- Houd dit blok feitelijk, compact en zonder uitgebreide logging.
