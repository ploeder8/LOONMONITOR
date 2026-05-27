# Update Plan 23/05/2026 — Stappen 4 t/m 8

Doel: de Jaakie-browsertool verder brengen van de huidige werkende calculator naar een betrouwbaarder releaseproces en een expliciete productrichting. Voer elke stap als aparte sprint uit, met eigen verificatie en commit.

## Werkwijze

- [ ] Werk de stappen strikt op volgorde af: 4, 5, 6, 7, 8.
- [ ] Start elke stap vanaf een schone `main` of een aparte featurebranch.
- [ ] Houd code, dataset en kennisbank in dezelfde wijziging synchroon wanneer een stap inhoudelijke kennis wijzigt.
- [ ] Voeg na elke inhoudelijke wijziging een korte regel toe aan `MEMORY.md`.
- [ ] Commit elke afgeronde stap apart met een concreet commitbericht.

## Stap 4 — Data-release gate uitbreiden

### Doel

Voorkomen dat een release vertrekt met actieve datasetrecords zonder bruikbare bronmetadata, ontbrekende Tier-3-triangulatie of divergerende dataset-aantallen in documentatie.

### Concrete acties

- [x] Voeg `src/lib/__tests__/datasetReleaseGate.test.ts` toe.
- [x] Test dat elk actief datapunt minstens `id`, `status`, `bron_url`, `bron_organisatie`, `betrouwbaarheid.tier`, `geldig_vanaf` en een auditbaar bronfragment heeft.
- [x] Test dat elk Tier-3 datapunt geldige triangulatie heeft volgens `knowledgebase/03_datamodel.md`.
- [x] Test dat dataset-aantallen in dataset-meta, `README.md`, `AGENTS.md`, `knowledgebase/DATASET_REFERENCE.md` en `ScopePage` niet divergeren.
- [x] Voeg helperfuncties alleen toe in `src/lib/` wanneer de test anders duplicatie of onleesbaarheid veroorzaakt.
- [x] Werk `knowledgebase/08_gaps_en_pending.md` bij wanneer de gate bestaande datasetgaten zichtbaar maakt.
- [x] Voeg een korte logregel toe aan `MEMORY.md`.

### Te wijzigen bestanden

- `src/lib/__tests__/datasetReleaseGate.test.ts`
- `src/data/pc200_payroll_dataset.schema.json`
- `src/data/pc200_payroll_dataset_2026.json` indien de nieuwe gate ontbrekende metadata vindt
- `src/types/dataset.ts`
- `src/pages/ScopePage.tsx` indien het getoonde dataset-aantal gecorrigeerd moet worden
- `README.md`
- `AGENTS.md`
- `knowledgebase/DATASET_REFERENCE.md`
- `knowledgebase/08_gaps_en_pending.md`
- `MEMORY.md`

### Acceptatiecriteria

- [x] Elk actief datapunt heeft bron- en statusmetadata.
- [x] Tier-3 zonder triangulatie faalt hard in de test-suite.
- [x] Dataset-aantallen in code/docs zijn consistent.
- [x] De nieuwe gate draait mee met `bun test`.

### Verificatiecommando's

```bash
bun test src/lib/__tests__/datasetReleaseGate.test.ts
bun test
bun run typecheck
git diff --check
```

### Commitmoment

- [x] Commit na groene verificatie met: `test: add dataset release gate`

## Stap 5 — Juridische bronronde doen

### Doel

De juridische en payrollparameters opnieuw extern verifiëren voordat verdere producthardening of CI ze als releasewaarheid afdwingt.

### Concrete acties

- [x] Verifieer Arizona-scenario's via Belgisch Staatsblad/Justel, FOD Financiën en relevante parlementaire of officiële publicaties.
- [x] Verifieer fiscale werkbonuspercentages en grenzen voor inkomstenjaar 2026/AJ 2027.
- [x] Verifieer PB-schijven, belastingvrije som, forfaitaire beroepskosten en BV-parameters AJ 2027.
- [x] Verifieer PC 200-cao's voor barema's, eindejaarspremie, ecocheques, jaarpremie en woon-werk.
- [x] Verifieer Sociaal Fonds 200-bijdrage en toepassingsperiode.
- [x] Verifieer AO-default als configureerbare aanname, niet als harde sectorparameter.
- [x] Verifieer VAA-bronnen voor bedrijfswagen en forfaitaire werkmiddelen.
- [x] Noteer per bron: URL, raadpleegdatum, tier, status `bevestigd` / `gewijzigd` / `onzeker`, en impact op code/dataset/docs.
- [x] Werk dataset, kennisbank en tests alleen bij wanneer de bronronde een echt verschil oplevert.
- [x] Voeg een korte logregel toe aan `MEMORY.md`.

### Te wijzigen bestanden

- `knowledgebase/02_regelkader_2026.md`
- `knowledgebase/08_gaps_en_pending.md`
- `knowledgebase/bronnen/` snapshots of bronnotities
- `src/data/pc200_payroll_dataset_2026.json` indien parameters wijzigen
- `src/lib/__tests__/golden.test.ts` indien berekende waarden wijzigen
- `src/lib/__tests__/fodBvValidation.test.ts` indien FOD-validatiestatus wijzigt
- `README.md`
- `AGENTS.md`
- `MEMORY.md`

### Acceptatiecriteria

- [x] Elk genoemd juridisch domein heeft een recente bronstatus.
- [x] Onzekere claims blijven expliciet als onzeker/gap gemarkeerd.
- [x] Primaire bronnen krijgen voorrang op sociale-secretariaatbronnen.
- [x] Geen codewaarde wijzigt zonder corresponderende dataset/doc/test-update.

### Verificatiecommando's

```bash
bun test
bun run typecheck
git diff --check
```

### Commitmoment

- [x] Commit na bronronde en groene verificatie met: `docs: refresh legal source review`

## Stap 6 — CI toevoegen

### Doel

Elke PR en push naar `main` automatisch blokkeren wanneer typecheck, tests, build, dataset-release gate of FOD-corpusmetadata falen.

### Concrete acties

- [ ] Maak `.github/workflows/ci.yml`.
- [ ] Laat CI draaien op `pull_request` en `push` naar `main`.
- [ ] Installeer dependencies via de bestaande package manager setup zonder lockfiles te wijzigen.
- [ ] Draai `bun run typecheck`.
- [ ] Draai `bun test`.
- [ ] Draai `bun run build`.
- [ ] Zorg dat de dataset-release gate uit stap 4 en FOD-corpuscheck in de test-suite zitten.
- [ ] Voeg optioneel een script `verify` toe aan `package.json` wanneer dit duplicatie vermindert.
- [ ] Documenteer CI in `README.md` en `AGENTS.md`.
- [ ] Voeg een korte logregel toe aan `MEMORY.md`.

### Te wijzigen bestanden

- `.github/workflows/ci.yml`
- `package.json` alleen indien een `verify` script wordt toegevoegd
- `README.md`
- `AGENTS.md`
- `MEMORY.md`

### Acceptatiecriteria

- [ ] CI draait op PR's.
- [ ] CI draait op pushes naar `main`.
- [ ] CI gebruikt dezelfde kerncommando's als lokaal.
- [ ] Een falende dataset-release gate zou CI rood maken.

### Verificatiecommando's

```bash
bun run typecheck
bun test
bun run build
git diff --check
```

### Commitmoment

- [ ] Commit na lokale verificatie met: `ci: add pull request verification`

## Stap 7 — Browser/UX QA doen

### Doel

De huidige calculatorflow gericht valideren in echte browsercontext op responsive gedrag, interacties, auditbaarheid en toegankelijkheid.

### Concrete acties

- [x] Maak `knowledgebase/12_browser_ux_qa.md` als QA-log en checklist.
- [x] Test desktopweergave van `/`, `/scope` en `/testcases`.
- [x] Test mobiele weergave van `/`, inclusief inputcockpit, resultaatpanelen en lange labels.
- [x] Test audit-toggle: alle bronnen openen/sluiten en individuele panelen blijven bruikbaar.
- [x] Test CSV export/import roundtrip met een aangepast profiel.
- [x] Test bruto -> netto en netto -> bruto interacties, inclusief wijziging van gezinstype en maaltijdcheques.
- [x] Test fout- en waarschuwingstoestanden waar ze zonder datasetwijziging reproduceerbaar zijn.
- [x] Controleer keyboard-flow, focusstates, labels, contrast en tekstoverlap.
- [x] Voeg regressietests toe voor gevonden bugs; doe geen visuele redesign buiten concrete bevindingen.
- [x] Voeg een korte logregel toe aan `MEMORY.md`.

### Te wijzigen bestanden

- `knowledgebase/12_browser_ux_qa.md`
- `src/pages/home/*` alleen voor concrete UX-bugfixes
- `src/pages/HomePage.test.ts` of `src/lib/__tests__/HomePage.test.tsx` alleen voor regressies
- `knowledgebase/11_ui_ux_migratieplan.md`
- `MEMORY.md`

### Acceptatiecriteria

- [x] QA-log bevat datum, viewport, scenario, resultaat en eventuele opvolgactie.
- [x] Geen incoherente overlap op desktop of mobiel in de geteste flows.
- [x] CSV roundtrip blijft bruikbaar.
- [x] Netto -> bruto blijft interactief en verklaarbaar.
- [x] Auditbronnen blijven bereikbaar.

### Verificatiecommando's

```bash
bun test src/pages/HomePage.test.ts src/lib/__tests__/HomePage.test.tsx
bun test
bun run build
git diff --check
```

### Commitmoment

- [x] Commit na QA en eventuele fixes met: `test: document browser ux qa`

## Stap 8 — Productrichting kiezen

### Doel

Een expliciete productbeslissing vastleggen: browser-only hardenen als volgende lijn, of de stap naar een volwaardige backend-tool voorbereiden met duidelijke criteria.

### Concrete acties

- [ ] Maak `knowledgebase/13_productrichting.md`.
- [ ] Beschrijf optie A: browser-only verder hardenen.
- [ ] Beschrijf optie B: volwaardige tool met backend, dataset-versionering, multi-jaar, multi-PC, gebruikersbeheer en reproduceerbare historische berekeningen.
- [ ] Kies default voor de eerstvolgende fase: browser-only verder hardenen.
- [ ] Definieer harde triggercriteria om later naar backend te gaan.
- [ ] Werk `knowledgebase/01_project_scope.md` bij met de gekozen productlijn.
- [ ] Werk `knowledgebase/08_gaps_en_pending.md` bij met de roadmapbeslissing.
- [ ] Werk onderzoekspagina's bij indien ze nog een andere productrichting suggereren.
- [ ] Voeg een korte logregel toe aan `MEMORY.md`.

### Te wijzigen bestanden

- `knowledgebase/13_productrichting.md`
- `knowledgebase/01_project_scope.md`
- `knowledgebase/08_gaps_en_pending.md`
- `knowledgebase/onderzoek/*.html` indien roadmapcopy moet worden gelijkgetrokken
- `public/onderzoek/*.html` indien publieke onderzoekskopie moet worden gelijkgetrokken
- `README.md`
- `MEMORY.md`

### Acceptatiecriteria

- [ ] De gekozen eerstvolgende productlijn staat expliciet gedocumenteerd.
- [ ] Backendambities zijn niet verdwenen, maar staan achter concrete triggercriteria.
- [ ] Scope, gaps en publieke onderzoekspagina's spreken elkaar niet tegen.
- [ ] Er is geen nieuwe backendcode toegevoegd in deze stap.

### Verificatiecommando's

```bash
rg -n "browser-only|backend|multi-PC|multi-jaar|dataset-versionering|productrichting" README.md knowledgebase public/onderzoek
git diff --check
```

### Commitmoment

- [ ] Commit na scope- en roadmapupdate met: `docs: choose product direction`

- [ ] Verwijder dit plan bestand nadat bovenstaande stappen zijn uitgevoerd.
