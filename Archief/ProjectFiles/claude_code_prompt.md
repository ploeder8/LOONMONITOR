# Prompt voor Claude Code — PC 200 Loonmotor POC

> Plak deze tekst in Claude Code nadat u de zeven bestanden uit `/output` in de werkomgeving heeft gezet (typisch in `docs/` van de nieuwe projectmap).

---

## Opdracht

Bouw een proof-of-concept van een **PC 200 loonmotor** als single-page web-app in **TypeScript + React + Vite**, met **shadcn/ui + Tailwind**. Geen backend, geen database, geen authenticatie — de hele tool draait in de browser en leest het bijgeleverde JSON-dataset rechtstreeks uit de bundle.

## Bronmateriaal

In de map `docs/` vind je zeven bestanden. Lees ze **in deze volgorde** vóór je code schrijft:

1. `pc200_payroll_poc_brief.md` — projectkader, scope, functionele en niet-functionele eisen, UI-flow, Definition of Done. **Dit is het hoofddocument; alles wat je bouwt moet hieraan voldoen.**
2. `pc200_payroll_dataset_2026_CORE.md` — datamodel, statussen, bronnenhiërarchie, normalisatie, baremastructuur, glossary. Lees dit grondig — alle veldsemantiek staat hier.
3. `pc200_payroll_dataset_2026_DEVELOPER.md` — Python-voorbeelden van lookup-patronen, periode-filtering, RSZ-berekening, defensieve toegangscontrole. Vertaal de patronen naar idiomatische TypeScript.
4. `pc200_payroll_dataset_2026_VERIFICATIE.md` — verificatieworkflow van payroll-experts. Gebruik dit om te begrijpen welke informatie het audit-paneel in de UI moet tonen.
5. `pc200_payroll_testcases_2026.md` — 20 gouden testcases (TC-01 t/m TC-20). Implementeer deze **eerst** als unit tests in `vitest`, vóór je UI-code schrijft.
6. `pc200_payroll_dataset.schema.json` — JSON Schema (Draft-07) voor het dataset. Gebruik `json-schema-to-typescript` om hieruit TypeScript-types te genereren. Valideer het dataset bij start van de app met `ajv`.
7. `pc200_payroll_dataset_2026.json` — het dataset zelf (128 KB, 43 datapunten + 17 bronnen + 228 baremacellen). Plaats dit in `src/data/` en importeer het als JSON-module.

## Werkwijze (test-driven)

1. **Setup**: `pnpm create vite` met React + TypeScript template, voeg Tailwind + shadcn/ui toe, configureer `vitest` en `ajv`.
2. **Types**: genereer TypeScript-types uit `pc200_payroll_dataset.schema.json`. Voeg een runtime-validatie toe die het dataset bij app-start valideert; faalt de validatie, weiger dan te starten met klare foutmelding.
3. **Berekeningslaag** in `src/lib/`: implementeer de pure functies `getDatapunt`, `indexById`, `lookupBarema`, `lookupStudentenbarema`, `isGeldigOp`, `safeGetValue`, `rszBijdragen` — vertaal van DEVELOPER §2-5. Deze module **mag de DOM niet aanraken**.
4. **Tests eerst**: zet alle 20 gouden testcases om naar `vitest`-tests in `src/lib/__tests__/golden.test.ts`. Eén `describe` per TC, met `expect(...)` op de exacte verwachte uitkomsten uit `pc200_payroll_testcases_2026.md`. Run ze. Alle 20 moeten groen zijn vóór je verder gaat.
5. **UI** in `src/components/`: bouw het inputformulier en het resultaatpaneel zoals geschetst in de POC-brief §7. Elk resultaatblok toont waarde + eenheid + status-icoon + klikbare bron-link, met een uitklapbaar audit-paneel (`bron_fragment`, `betrouwbaarheid`, `triangulatie_bronnen`, `opmerkingen`). Gebruik shadcn/ui-componenten voor consistentie.
6. **Foutgedrag**: implementeer alle scenario's uit POC-brief §4.3 (status `niet_gevonden`, `mogelijk_verouderd`, `conflict`, brutoloon onder minimum, ongeldige periode).
7. **Beperkingen-paneel**: toon de tabel uit POC-brief §10 in een "Scope & beperkingen"-pagina, met info-iconen op de relevante velden in de hoofd-UI die naar deze pagina linken.
8. **Footer**: toon `meta.laatste_update` en het aantal datapunten als versie-indicatie.
9. **README**: schrijf een korte `README.md` met `pnpm install` + `pnpm dev` om de app te starten, en `pnpm test` voor de testset.

## Acceptance — Definition of Done

De POC is klaar wanneer:

- [ ] Alle 20 gouden testcases groen lopen in `pnpm test`.
- [ ] `pnpm dev` start de UI binnen 30 seconden, en schema-validatie van het dataset slaagt bij start.
- [ ] Een gebruiker kan de input uit drie willekeurige testcases invoeren en de exacte verwachte output zien — inclusief klikbare bron-links die in een nieuw tabblad openen.
- [ ] Het audit-paneel werkt voor élk getoond datapunt.
- [ ] Periode-filtering werkt correct (TC-15 als ankerpunt — fietsvergoeding-overgang 1/10/2026).
- [ ] De Scope-pagina toont alle beperkingen uit POC-brief §10.
- [ ] De code is opgesplitst in: `src/data/` (dataset), `src/lib/` (pure berekeningen), `src/components/` (UI), `src/lib/__tests__/` (tests). Geen UI-imports in `lib/`, geen lib-redeneer-logica in `components/`.

## Beperkingen waar je je aan moet houden

- **Geen runtime-arithmetic op `waarde_bron`.** Gebruik uitsluitend `waarde_genormaliseerd` of `tabel_per_*`. Dit is een keiharde eis uit CORE §5.
- **Geen datapunten verwijderen of hernoemen.** Het dataset is read-only voor de tool.
- **Geen authenticatie, geen opslag, geen multi-user.** De tool is stateless.
- **Geen multi-PC.** Alleen PC 200.
- **Geen externe API-calls.** Alle data zit in het JSON-dataset; de UI mag enkel `bron_url`-links openen in een nieuw tabblad.

## Onzekerheid

Als iets in de bestanden ambigu is, **stop en stel een vraag** in plaats van te raden. Vermeld concreet welke regel in welk bestand de ambiguïteit veroorzaakt. Verzin nooit datapunt-IDs, bedragen, percentages of bron-URLs — alles staat al in `pc200_payroll_dataset_2026.json`.

## Eerste stap

Begin met:

1. Lees de zeven bestanden in de hierboven aangegeven volgorde.
2. Geef me een **korte plan-bevestiging** (max 10 bullets) waarin je de stack, de mappenstructuur en de testaanpak samenvat — zodat ik kan bijsturen vóór er code geschreven wordt.
3. Wacht op mijn akkoord, en ga dan in TDD-modus aan de slag (tests eerst, dan implementatie, dan UI).

Succes.
