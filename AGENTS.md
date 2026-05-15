# AGENTS.md

Dit bestand geeft richtlijnen aan coding agents (Claude Code, Kimi Code, Codex, Cursor, Aider, en elke andere AI-coding assistant) die in deze repository werken. Het volgt de [AGENTS.md-conventie](https://agents.md) — een vendor-neutrale standaard voor agent-instructies.

---

## Projectoverzicht

**Jaakie** is een browser-only Single Page Application (SPA) die payroll-experts helpt om lonen en werkgeverskosten te verifiëren onder **Paritair Comité 200** (PC 200, het Aanvullend Paritair Comité voor de Bedienden). De tool berekent bruto → netto loon én totale loonkost voor werkgevers, met volledige audit-trail naar primaire bronnen.

- **Actieve brand:** Jaakie (geen "VH", "PC 200" of "Van Havermaet" als toolnaam in de UI).
- **Scope:** Sectorale baremas, RSZ, sociale werkbonus, bedrijfsvoorheffing (BV, AJ 2027), bijzondere BV-schaal, BBSZ, werkgeverskost, premies (eindejaarspremie, ecocheques, jaarpremie) en mobiliteitsvoordelen (trein, fiets).
- **Technologie:** TypeScript 5.6, React 19, Vite 8, Tailwind CSS v4, HashRouter.
- **Runtime:** Uitsluitend browser — geen backend, geen database, geen authenticatie.
- **Taal:** Nederlandse interface en broncode; alle domein-documentatie staat in het Nederlands.

---

## Technologie-stack & architectuur

| Laag | Technologie | Opmerking |
|---|---|---|
| Build tool | Vite 8 (`vite.config.ts`) | Dev-server op poort 5173 (`strictPort: true`) |
| Bundler | Vite (ESM) | `type: "module"` in `package.json` |
| Framework | React 19 + `react-dom` | JSX-transform: `react-jsx` |
| Router | `react-router-dom` 7.8.2 | `HashRouter` — geen server-side routing nodig |
| Styling | Tailwind CSS v4 + `@tailwindcss/vite` | Geen apart PostCSS-config; `@theme`-tokens in `brand.css` |
| Component primitives | `@base-ui/react` 1.4 | Voor accordion, tabs, dialogs |
| Iconen | `lucide-react` | |
| Datums | `date-fns` | |
| Test runner | `bun:test` (API-compatibel met Vitest) | **Niet** Vitest of Jest |
| Schema-validatie | Hand-rolled JSON Schema Draft-07 validator (`src/lib/schemaValidate.ts`) | Geen `ajv` of externe validator |

### Belangrijke configuratiebestanden

| Bestand | Doel |
|---|---|
| `package.json` | Dependencies, scripts (ESM) |
| `vite.config.ts` | Plugins (`react()`, `tailwindcss()`), alias `@` → `./src`, poort 5173 |
| `tsconfig.json` | Project-references naar `tsconfig.app.json`, path alias `@/*` |
| `tsconfig.app.json` | Target `ES2022`, `strict: true`, types `bun`, include `src` |
| `index.html` | Entrypoint, taal `nl-BE`, font Inter (Google Fonts) |

### Path alias

`@/` wijst naar `src/` — geconfigureerd in zowel `vite.config.ts` als `tsconfig.json` (nodig voor Bun-compatibiliteit).

---

## Build-, test- en ontwikkelcommando's

```bash
# Installatie
pnpm install

# Development server
pnpm dev            # http://localhost:5173 (strictPort)

# Tests
bun test                          # alle tests
bun test --watch                  # watch mode
bun test src/lib/__tests__/golden.test.ts   # één bestand

# Type-checking & build
pnpm typecheck      # tsc --noEmit (tsconfig.app.json)
bun run typecheck   # equivalent
pnpm build          # productie-build → dist/
bun run build       # equivalent
pnpm preview        # preview productie-build
```

> **Let op:** het project gebruikt **pnpm** voor dependency-management en **bun** als runtime voor tests. Beide lockfiles (`pnpm-lock.yaml` en `bun.lock`) zijn aanwezig.

---

## Code-organisatie & mappenstructuur

```
src/
├── main.tsx              # Startup gate: schema-validatie dataset vóór mount
├── App.tsx               # HashRouter + shell layout (header, nav, footer)
├── index.css             # Global CSS + Tailwind + brand-token import
├── branding/
│   ├── brand.ts          # APP_BRAND: naam, logo, titels, footer-copy
│   └── brand.css         # Design tokens: kleuren, fonts, radii, shadows
├── data/
│   ├── pc200_payroll_dataset_2026.json       # ~60–63 datapunten
│   └── pc200_payroll_dataset.schema.json     # JSON Schema Draft-07
├── types/
│   ├── dataset.ts        # TypeScript interfaces: Datapunt, BronMaster, Meta, Dataset
│   └── assets.d.ts       # Asset type declarations
├── lib/                  # Pure functies — géén React, géén UI-imports
│   ├── __tests__/
│   │   ├── golden.test.ts              # ~900 regels TC/NTC golden tests
│   │   ├── schemaValidate.smoke.test.ts
│   │   ├── taxcalcValidation.test.ts
│   │   └── HomePage.test.ts            # UI-structuur tests (render zonder browser)
│   ├── errors.ts         # PC200DatasetError hierarchy
│   ├── dataset.ts        # getDatapunt, indexById
│   ├── periode.ts        # safeGetValue + datum/status guards
│   ├── money.ts          # round2, formatEUR
│   ├── schemaValidate.ts # Hand-rolled JSON Schema Draft-07 validator
│   ├── baremas.ts        # Barema-lookup (schaal/cat/ervaring) + studentenbaremas
│   ├── rsz.ts            # RSZ werkgever/werknemer + Sociaal Fonds 200
│   ├── werkbonus.ts      # Sociale werkbonus Luik A + B
│   ├── bbsz.ts           # Bijkomende Bijdrage Sociale Zekerheid
│   ├── bv.ts             # Bedrijfsvoorheffing gewone bezoldiging (AJ 2027)
│   ├── bvBijzonder.ts    # Bijzondere BV-schaal voor variabel loon
│   ├── netto.ts          # Orchestratie: bruto → netto
│   ├── werkgeverskost.ts # Totale loonkost + loonwig
│   ├── eindejaarspremie.ts
│   ├── jaarpremie.ts
│   ├── ecocheques.ts
│   ├── fietsvergoeding.ts
│   ├── woonwerkTrein.ts
│   ├── woonwerkVerkeer.ts
│   └── vaaBedrijfswagen.ts
├── components/           # Presentational UI — géén berekeningslogica
│   ├── AuditPanel.tsx
│   ├── AuditOpenContext.tsx   # force: "all" | "none" | null
│   ├── Banner.tsx
│   ├── BronLink.tsx
│   ├── Field.tsx
│   ├── ResultBand.tsx
│   ├── ResultCard.tsx
│   ├── ResultsSummaryStrip.tsx
│   └── StatusBadge.tsx
└── pages/                # Compositie van components + lib-calls
    ├── HomePage.tsx      # ~2100 regels; hart van de app (form + resultaten)
    ├── TestcasesPage.tsx
    └── ScopePage.tsx
```

---

## Strikte laag-scheiding

| Laag | Pad | Regel |
|---|---|---|
| Data (read-only) | `src/data/` | Raw JSON + schema. Geen berekeningen op `waarde_bron`. |
| Berekeningen | `src/lib/` | Pure functies, geen React, geen UI-imports. |
| UI-components | `src/components/` | Display only, geen calc-logica. |
| Pagina's | `src/pages/` | Compositie van components + lib-calls. |
| Tests | `src/lib/__tests__/` | Golden tests + schema smoke tests. |

**Schend nooit deze grenzen.** Berekeningslogica hoort thuis in `src/lib/`; componenten renderen alleen wat ze krijgen.

---

## Single Source of Truth (SSOT)

Voor **alle inhoudelijke vragen** (regelkader, calculator-specs, datapunten, testcorpus, gaps & roadmap, bronnenhiërarchie, AJ 2027-parameters): raadpleeg de **`knowledgebase/`** folder. Start bij `knowledgebase/README.md`.

| Vraag | Bron |
|---|---|
| Wat doet de tool? Wat valt buiten scope? | `knowledgebase/01_project_scope.md` |
| Welk wettelijk kader / welke AJ 2027-parameters? | `knowledgebase/02_regelkader_2026.md` |
| Hoe is de dataset gestructureerd? | `knowledgebase/03_datamodel.md` + `DATASET_REFERENCE.md` |
| Hoe werkt de netto-berekening (RSZ, BV, werkbonus, bijzondere BV)? | `knowledgebase/04_calculator_netto.md` |
| Hoe werkt de werkgeverskost-berekening? | `knowledgebase/05_calculator_werkgeverskost.md` |
| Welke testcases zijn er? | `knowledgebase/07_testcorpus.md` + `src/lib/__tests__/golden.test.ts` |
| Wat is pending / wat ontbreekt nog? | `knowledgebase/08_gaps_en_pending.md` |
| Hoe ziet een vergelijkende referentietool eruit? Welke features missen we? | `knowledgebase/Referenties/groups_be_salarysim.md` |

---

## Startup gate

`src/main.tsx` valideert de gebundelde JSON-dataset (`pc200_payroll_dataset_2026.json`) tegen het JSON Schema Draft-07 (`pc200_payroll_dataset.schema.json`) **vóór** de React-root mount.

- Bij succes: app start normaal.
- Bij falen: rood error-scherm met schema-fouten (max 50), app start **niet**.

**Nooit omzeilen.** Deze gate waarborgt dat elke `Datapunt`-record de vereiste velden heeft voordat berekeningen erop vertrouwen.

---

## Dataset-toegangspatroon

Berekeningen gebruiken uitsluitend:

- `src/lib/dataset.ts` — `getDatapunt(id)`, `indexById()`
- `src/lib/periode.ts` — `safeGetValue(datapuntId, { refDatum, toelatenMogelijkVerouderd? })`

`safeGetValue` enforced:
- Status guards (`actief`, `mogelijk_verouderd`, `conflict`, `niet_gevonden`, `gemarkeerd_voor_review`)
- Datumgeldigheid (`geldig_vanaf` / `geldig_tot`)
- Retourneert `{ datapunt, waarde, waarschuwing }`

Voor hard-gecodeerde parameters (werkbonus, bbsz, bv, bvBijzonder, werkgeverskost): de lib roept `getDatapunt` direct aan **voor de audit-trail**, niet voor de numerieke waarde.

**Kritieke regel:** voer **nooit** runtime-aritmetiek uit op `waarde_bron`. Gebruik alleen `waarde_genormaliseerd` of `tabel_per_*`.

---

## Audit trail invariant

Elke berekende waarde die afhankelijk is van een dataset-parameter **MOET** een bron-`Datapunt` meedragen. De `AuditPanel`-component rendert dit. **Nooit datapunt-ID's, bedragen, percentages of bron-URL's fabriceren.**

`AuditPanel` respecteert een globale forced state via `AuditOpenContext` (`force: "all" | "none" | null`). De `AuditOpenProvider` wordt in `ResultsPanel` rond alle bands gewikkeld; de "Toon alle bronnen"-knop in `ResultsSummaryStrip` schakelt tussen `"all"` en `null`. Individuele paneel-state blijft werken als `force === null`.

---

## Error hierarchy (`src/lib/errors.ts`)

```
PC200DatasetError
├── DatapuntOnbekend          — ID niet in dataset
├── DatapuntNietBruikbaar     — status blokkeert gebruik
├── DatapuntNietGeldigOpDatum — buiten geldigheidsvenster
└── BaremaBuitenSchaalError   — lookup buiten gedefinieerde schaal
```

Deze fouten worden in `HomePage.tsx` door `safeRender()` opgevangen en getoond als `Banner`-componenten, zodat de UI niet crasht bij data-problemen.

---

## Berekeningsmodules (`src/lib/`)

Elke module verwijst naar zijn specificatie in `knowledgebase/`:

| Module | SSOT-referentie |
|---|---|
| `baremas.ts` | `knowledgebase/02_regelkader_2026.md §8` |
| `rsz.ts` | `knowledgebase/04_calculator_netto.md §5` |
| `werkbonus.ts` | `knowledgebase/04_calculator_netto.md §5.1` |
| `bbsz.ts` | `knowledgebase/04_calculator_netto.md §5.5` |
| `bv.ts` | `knowledgebase/04_calculator_netto.md §5.2-5.4` |
| `bvBijzonder.ts` | `knowledgebase/04_calculator_netto.md §5.4b` |
| `netto.ts` | `knowledgebase/04_calculator_netto.md §4` |
| `werkgeverskost.ts` | `knowledgebase/05_calculator_werkgeverskost.md` |
| `eindejaarspremie.ts`, `jaarpremie.ts`, `ecocheques.ts`, `woonwerkTrein.ts`, `fietsvergoeding.ts` | `knowledgebase/02_regelkader_2026.md §7-9` |

### BV-status (Golf 2)

`src/lib/bv.ts` gebruikt een lokale `bijlage_iii_sleutelformule_2026` voor gewone bezoldiging. Het resultaat bevat `methode`, `schaal`, `validatieStatus` en `validatieOpmerking`. De implementatie blijft `pending_taxcalc` tot de 30 corpuscases extern tegen FOD Tax-Calc zijn gevalideerd; een eerste Tier-2 anker tegen Group S Salary Sim zit al in de tests.

---

## Resultaten-panel structuur (`HomePage`)

De rechter resultatenkolom volgt een vast schema:

1. **`ResultsSummaryStrip`** (sticky, `top: 73px`) — 4 kerncijfers (Bruto · Netto · Werkgeverskost · Loonwig) + quick-jump-anchors + audit-toggle. Studentenmodus toont alleen "Bruto (student)".
2. **`ResultBand` × 4** — `band-loonkost` (Netto + Werkgeverskost side-by-side op `xl:`), `band-loonbasis` (sectoraal minimum + bruto-check), `band-voordelen` (RSZ, eindejaars, eco, jaarpremie), `band-mobiliteit` (trein, fiets, VAA).

`bouwResultaten()` retourneert `{ summary, bands }`. `computeSummary()` draait dezelfde calls als de Loonkost-band maar in een eigen `try/catch` zodat de strip onafhankelijk faalt van de detail-rendering. Beide calls naar `werkgeverskost()` — in `bouwResultaten` én in `computeSummary` — moeten **identiek geparametriseerd** zijn (inclusief extralegale voordelen en `extraEcocheques: ecoResult.bedrag / 12`), anders divergeren de summary-strip-cijfers van de detailpanelen.

---

## Profiel — velden

De `Profiel` interface (`src/pages/HomePage.tsx`) bevat alle user-inputs. Relevante werkgeverskost-velden:

| Veld | Type | Default | Beschrijving |
|---|---|---|---|
| `arbeidsongevallenPct` | `number` | `0.003` | AO-verzekering tarief (decimaal). UI toont en accepteert %. |
| `extraGroepsverzekering` | `number` | `0` | Patronale groepsverzekering €/maand. |
| `maaltijdchequeWerkgeversaandeelPerDag` | `number` | `8.91` | Werkgeversaandeel maaltijdcheques €/dag; maandkost = dit bedrag × `arbeidsdagenPerMaand`, begrensd op €8,91/dag vanaf 01/01/2026. |
| `extraHospitalisatie` | `number` | `0` | Hospitalisatieverzekering €/maand. |

`extraEcocheques` wordt **automatisch afgeleid** uit `ecocheques({ tewerkstellingsbreuk, refDatum }).bedrag / 12` — geen apart veld in `Profiel`.

---

## Teststrategie

De test-suite draait op `bun:test` (zelfde API als Vitest). Standaard referentiedatum: `REF_2026 = "2026-06-01"`.

| Testbestand | Strategie | Dekking |
|---|---|---|
| `golden.test.ts` | ~900 regels exacte EUR-golden tests per `TC-XX` / `NTC-XX` | Baremas, RSZ, werkbonus, BBSZ, BV, netto end-to-end, eindejaarspremie, ecocheques, fietsvergoeding, woonwerk trein/verkeer, VAA, jaarpremie, werkgeverskost, audit-URL's, bijzondere BV |
| `schemaValidate.smoke.test.ts` | Dataset valideert tegen schema; broken dataset wordt afgewezen | Data-integriteit |
| `taxcalcValidation.test.ts` | Metadata-test: 30 FOD Tax-Calc cases moeten `status: "pending"` hebben; ≥5 triangulatie-ankers geregistreerd | Validatie-proces tracking |
| `HomePage.test.ts` | Statische render-tests (`react-dom/server`): veld-volgorde, accordion-nesting, maandgrensregels | UI-structuur regressie |

### Testfilosofie
- **Golden tests:** exacte verwachte waarden, zero tolerance op bedragen (tenzij `toBeCloseTo` met €0,50 tolerantie voor BV).
- **Audit-tests:** elk resultaat moet een `datapunt` dragen met een truthy `bron_url`.
- **Edge-cases:** grenswaarden werkbonus-luiken, BBSZ-schijven, BV-verminderingen, fiets-tariefswitch (oktober 2026), pro-rata woonwerk.
- **Tier-2 triangulatie:** Group S Salary Sim-ankers zijn gecodeerd (bijv. TC-23b: Schaal I Cat A 5j → `bvNaVerminderingen` dicht bij €154,22).

### Acceptatieregels
- Laag 1: `expect(...).toBe(...)` — exacte EUR, nul tolerantie.
- Laag 2: `toBeCloseTo(..., 0)` (~€0,50 tolerantie). BV-uitkomsten moeten binnen **±€2** van FOD Fin Tax-Calc liggen voor **≥12/15** cases.
- Laag 3: ±€5/maand tolerantie vs. Tax-Calc; >€15 = "grote_afwijking" die root-cause analyse vereist.

---

## Branding

De interne toolnaam en actieve brand is **Jaakie**. Houd branding centraal:

- `src/branding/brand.ts` bevat toolnaam, productlabel, logo-pad, alt-tekst, footer-copy en document title.
- `src/branding/brand.css` bevat kleuren, fonts, radii, shadows en compatibele CSS variables.
- `public/jaakie-designsysteem.md` is de leidende design guideline.
- `public/jaakie-demo-pagina-updated.html` is de visuele referentie voor samenhang en toepassing.

Wijzig toekomstige branding eerst in `src/branding/*` en pas componenten alleen aan wanneer ze nieuwe semantische tokens nodig hebben. Introduceer geen oude VH-assets, VH-kleuren of VH-fonts opnieuw. `PC 200` blijft alleen een inhoudelijke payrollscope, niet de toolnaam of brand.

---

## Code-stijl & conventies

- **Taal:** Nederlands voor alle domein-termen, UI-teksten en comments. Technische termen (functienamen, variabelen) mogen Engels zijn waar gangbaar in de JS/TS-community.
- **Functions:** maximaal ~30 regels. Te lang = splitsen of refactoren.
- **Duplicatie:** logica die meer dan tweemaal voorkomt = extraheren naar utility.
- **Types:** geen `any` gebruiken — altijd concrete TypeScript-types.
- **Props:** componenten met >3 props die logisch samenhangen = groeperen in een object.
- **Async:** altijd error handling op async operaties.
- **Formatteren:** er is **geen ESLint, Prettier of Biome** geconfigureerd. Houd de bestaande stijl consistent.

---

## Workflow-richtlijnen

- Houd wijzigingen zo simpel en klein mogelijk. Kies de minst invasieve fix die het werkelijke probleem oplost.
- Rapporteer na een gefocuste wijziging kort wat er is veranderd en vraag de gebruiker om bevestiging voordat je extra of tijdrovende verificatiestappen uitvoert.
- Minimale checks die rechtstreeks breuk beschermen zijn toegestaan zonder bevestiging: een gerichte test, `bun test`, `bun run typecheck`, of `bun run build` wanneer de wijziging compiled code raakt.
- Besteed geen tijd aan brede handmatige verificatie, herhaalde dev-server pogingen, browser-automatisering of ongerelateerde checks tenzij de gebruiker dit expliciet vraagt of bevestigt.

---

## Deployment

- **Build-output:** `dist/` (gegenereerd door `vite build`).
- **Preview:** `pnpm preview` serveert de productie-build lokaal.
- **CI/CD:** er is **geen** geconfigureerde CI/CD-pipeline (geen `.github/workflows/`, geen `.gitlab-ci.yml`).
- **Hosting:** de app is een statische SPA die overal gehost kan worden waar statische bestanden worden geserveerd.
- **Runtime-vereisten:** moderne browser met ES2022-ondersteuning.

---

## Security & privacy

- **Geen backend calls:** de app doet geen netwerkverzoeken voor berekeningen; alle data zit in de bundle.
- **Geen auth / geen sessies:** er is geen inlog, geen cookies, geen localStorage-gebruik voor gevoelige data.
- **Dataset:** de JSON-dataset bevat uitsluitend publiek beschikbare regelgeving en tarieven — geen persoonsgegevens.
- **Schema-validatie:** de startup gate voorkomt dat een corrupte dataset stilzwijgend verkeerde resultaten produceert.
- **Nooit `eval` of dynamische code-uitvoering** gebruiken; berekeningen zijn pure arithmetic.

---

## Gaps & pending work (samenvatting)

Voor het volledige overzicht: zie `knowledgebase/08_gaps_en_pending.md`.

| Item | Status | Impact |
|---|---|---|
| FOD Tax-Calc BV-validatie | `pending_taxcalc` | 30 cases moeten extern worden gevalideerd |
| BBSZ exacte tabel | `mogelijk_verouderd` | Info-band €0–€60,94 tot RSZ-instructie 2026 bevestigd |
| Arizona hervormingen | Wetsontwerp | Alleen feature-flag: fiscale werkbonus 35%/63%, belastingvrije som €11.550 |
| VAA auto-berekening | Niet geïmplementeerd | Bedrijfswagen CO₂-formule, woonst, verwarming |
| Netto → Bruto | Ontbreekt | Roadmap-prioriteit |

---

## Snelzoeken voor agents

| Ik wil… | Waar moet ik zijn? |
|---|---|
| Een nieuw datapunt toevoegen | `src/data/pc200_payroll_dataset_2026.json` + schema + `knowledgebase/DATASET_REFERENCE.md` |
| Een berekening aanpassen | `src/lib/<module>.ts` + bijbehorende `knowledgebase/*.md` |
| De UI van een resultaat wijzigen | `src/components/ResultCard.tsx`, `AuditPanel.tsx`, `ResultBand.tsx` |
| Formuliervelden toevoegen/verwijderen | `src/pages/HomePage.tsx` (zoek naar `Profiel` interface en `FormSection`) |
| Testcases toevoegen | `src/lib/__tests__/golden.test.ts` + `knowledgebase/07_testcorpus.md` |
| Branding wijzigen | `src/branding/brand.ts` en/of `src/branding/brand.css` |
| Een nieuwe pagina toevoegen | `src/pages/<Naam>Page.tsx` + route in `src/App.tsx` |

