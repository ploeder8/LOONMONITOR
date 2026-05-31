# Codebase Map

Compacte contextkaart voor Jaakie. Gebruik dit bestand als startcontext in plaats van volledige codebestanden.

## Boom

```text
api/chat.ts                 server-only AI-chat endpoint
scripts/index-ai-corpus.ts  indexeert knowledgebase corpus
src/main.tsx                dataset schema-gate voor React mount
src/App.tsx                 HashRouter shell/routes
src/branding/*             Jaakie brand tokens/copy
src/data/*                  PC200 dataset + Draft-07 schema
src/types/*                 dataset/assets types
src/lib/*                   pure payroll/domain functies
src/components/*            generieke presentational UI
src/pages/*                 routes en featurecompositie
```

## Publieke Domeinmodules

```text
profiel.ts              Profiel, DEFAULTS, refDatumVoorMaand, normalisatie
profielBerekeningen.ts  profiel -> barema/netto/werkgeverskost/jaaroverzicht
baremas.ts              lookupBarema, lookupStudentenbarema, brutolocheck
netto.ts                berekenNetto
nettoNaarBruto.ts       zoekBrutoVoorNetto
werkgeverskost.ts       werkgeverskost, loonwig
loonfiche.ts            bouwLoonficheVoorProfiel
loonrun.ts              bouwLoonrun
profielCsv.ts           profiel CSV import/export
schemaValidate.ts       validateDataset
periode.ts              safeGetValue
dataset.ts              getDatapunt, allDatapunten
money.ts                round2, formatEUR
```

## UI Startpunten

```text
HomePage.tsx                         calculatorroute
pages/home/InputCockpit.tsx          profielinvoer
pages/home/ResultatenPanel.tsx       resultatenbands
pages/home/WerknemerOverzicht.tsx    printbaar werknemer-overzicht
pages/LoonfichePage.tsx              loonfiche-route
pages/LoonrunPage.tsx                multiwerknemer loonrun
pages/loonrun/WerkgeverRapport.tsx   printbaar werkgeverrapport
pages/profiel/*                      gedeelde profiel-editor/snapshot
components/DocumentPrimitives.tsx    gedeelde print/document UI
```

## Harde Invarianten

- Payrollberekeningen blijven browser-only en gebruiken geen backend.
- `src/main.tsx` valideert de dataset voor mount.
- Berekeningen lezen datasetwaarden via `safeGetValue` of audit-only `getDatapunt`.
- Reken nooit op `waarde_bron`; gebruik `waarde_genormaliseerd` of tabellen.
- Resultaten die datasetparameters gebruiken dragen echte `Datapunt`-bronnen.
- AI-chat loopt alleen via `/api/chat`; secrets nooit in `VITE_*`.

## Waar Voor Wat

```text
Berekening aanpassen       src/lib/<module>.ts + relevante knowledgebase
Nieuw datapunt             src/data/* + schema + DATASET_REFERENCE
Calculatorveld aanpassen   profiel.ts + InputCockpit/MobiliteitPaneel
Resultaatkaart aanpassen   ResultatenPanel + ResultCard/ResultBand
Loonfiche wijzigen         loonfiche.ts + LoonficheDocument/Tabel
Loonrun wijzigen           loonrun.ts + LoonrunPage + loonrunExport
AI-chat wijzigen           api/chat.ts + aiChat.ts + knowledgebase/12_toolfunctionaliteit.md
Branding wijzigen          src/branding/*
```

## Checks

```bash
bun test
bun test src/lib/__tests__/golden.test.ts
bun test src/lib/__tests__/loonfiche.test.ts
bun test src/lib/__tests__/loonrun.test.ts
bun run typecheck
bun run build
```
