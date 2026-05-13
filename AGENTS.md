# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, Cursor, Aider, and any other AI coding assistant) when working in this repository. It follows the [AGENTS.md convention](https://agents.md) — a vendor-neutral standard for agent instructions.

## Single Source of Truth

**Voor alle inhoudelijke vragen** (regelkader, calculator-specs, datapunten, testcorpus, gaps & roadmap, bronnen-hiërarchie, AJ 2027-parameters, OCR-correcties): raadpleeg de **`knowledgebase/`** folder. Start bij `knowledgebase/README.md`.

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

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # dev server at http://localhost:5173 (strictPort)
bun test            # run all tests (uses bun:test, NOT vitest)
bun test --watch    # watch mode
bun test src/lib/__tests__/golden.test.ts   # run a single test file
pnpm typecheck      # tsc --noEmit (tsconfig.app.json)
pnpm build          # production build
pnpm preview        # preview production build
bun run typecheck   # equivalent typecheck command; currently green
bun run build       # equivalent build command; currently green
```

Path alias `@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json` for Bun compatibility).

## Architecture

Browser-only SPA — geen backend, geen auth, geen database. React 19 + Vite 8 + Tailwind v4, routed via `HashRouter`.

### Startup gate

`src/main.tsx` valideert de bundled JSON dataset tegen JSON Schema Draft-07 vóór mount. Bij failure: rood error-scherm, app start niet. **Niet omzeilen.**

### Strict layer separation

| Layer | Path | Rule |
|---|---|---|
| Data (read-only) | `src/data/` | Raw JSON + schema only. Geen berekening uit `waarde_bron`. |
| Calculation | `src/lib/` | Pure functions, no React, no UI imports. |
| UI components | `src/components/` | Display only, geen calc-logica. |
| Pages | `src/pages/` | Composition van components + lib calls. |
| Tests | `src/lib/__tests__/` | Golden tests + schema smoke tests. |

### Audit trail invariant

Elke berekende waarde MOET een bron-`Datapunt` meedragen. De `AuditPanel`-component rendert dit. **Nooit datapunt-ID's, bedragen of bron-URLs fabriceren.**

`AuditPanel` respecteert een globale forced state via `AuditOpenContext` (`force: "all" | "none" | null`). De `AuditOpenProvider` wordt in `ResultsPanel` rond alle bands gewikkeld; de "Toon alle bronnen"-knop in `ResultsSummaryStrip` schakelt tussen `"all"` en `null`. Individuele paneel-state blijft werken als `force === null`.

### Result-panel structuur (HomePage)

De rechter resultatenkolom volgt een vast schema:

1. **`ResultsSummaryStrip`** (sticky, top: 73px) — 4 kerncijfers (Bruto · Netto · Werkgeverskost · Loonwig) + quick-jump-anchors + audit-toggle. Studentenmodus toont alleen "Bruto (student)".
2. **`ResultBand` × 4** — `band-loonkost` (Netto + Werkgeverskost side-by-side op `xl:`), `band-loonbasis` (sectoraal minimum + bruto-check), `band-voordelen` (RSZ, eindejaars, eco, jaarpremie), `band-mobiliteit` (trein, fiets, indexatie).

`bouwResultaten()` retourneert `{ summary, bands }`. `computeSummary()` draait dezelfde calls als de Loonkost-band maar in een eigen try/catch zodat de strip onafhankelijk faalt van de detail-rendering. Beide calls naar `werkgeverskost()` — in `bouwResultaten` én in `computeSummary` — moeten identiek geparametriseerd zijn (inclusief extralegale voordelen en `extraEcocheques: ecoResult.bedrag / 12`), anders divergeren de summary-strip-cijfers van de detailpanelen.

Form-sidebar `FormSection` accepteert `defaultOpen` (default `false`); alleen "Netto berekening" staat default open.

Secties in de sidebar (bediende-modus):
- **Werkgeversbijdragen** — arbeidsongevallenPct (% ↔ decimal via × /100), patronale groepsverzekering, maaltijdcheques werkgeversaandeel, hospitalisatieverzekering. Uitsluitend getoond in bediende-modus.
- Eindejaarspremie, Ecocheques, Fietsvergoeding, Woon-werk trein, Indexatie, Netto berekening.

### Error hierarchy (`src/lib/errors.ts`)

```
PC200DatasetError
├── DatapuntOnbekend          — ID not in dataset
├── DatapuntNietBruikbaar     — status blocks use
├── DatapuntNietGeldigOpDatum — outside validity window
└── BaremaBuitenSchaalError   — lookup outside defined scale
```

### Calculation modules (`src/lib/`)

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
| `eindejaarspremie.ts`, `jaarpremie.ts`, `ecocheques.ts`, `woonwerkTrein.ts`, `fietsvergoeding.ts`, `indexatie.ts` | `knowledgebase/02_regelkader_2026.md §7-9` |

### Dataset access pattern

Calculations via `src/lib/dataset.ts` (`getDatapunt`, `indexById`) en `src/lib/periode.ts` (`safeGetValue`). `safeGetValue` enforced status- en period-guards. Voor parameters die in een lib hard-coded zijn (werkbonus, bbsz, bv, bvBijzonder, werkgeverskost): de lib roept `getDatapunt` direct aan voor de audit-trail, niet voor de waarde.

### BV status (Golf 2)

`src/lib/bv.ts` gebruikt nu een lokale `bijlage_iii_sleutelformule_2026` voor gewone bezoldiging. Het resultaat bevat `methode`, `schaal`, `validatieStatus` en `validatieOpmerking`. De implementatie blijft `pending_taxcalc` tot de 30 corpuscases extern tegen FOD Tax-Calc zijn gevalideerd; een eerste Tier-2 anker tegen Group S Salary Sim zit al in de tests.

### Profiel — velden

De `Profiel` interface (`src/pages/HomePage.tsx`) bevat alle user-inputs. Relevante werkgeverskost-velden:

| Veld | Type | Default | Beschrijving |
|---|---|---|---|
| `arbeidsongevallenPct` | `number` | `0.003` | AO-verzekering tarief (decimal). UI toont en accepteert %. |
| `extraGroepsverzekering` | `number` | `0` | Patronale groepsverzekering €/maand. |
| `extraMaaltijdcheques` | `number` | `0` | Werkgeversaandeel maaltijdcheques €/maand. |
| `extraHospitalisatie` | `number` | `0` | Hospitalisatieverzekering €/maand. |

`extraEcocheques` wordt **automatisch afgeleid** uit `ecocheques({ tewerkstellingsbreuk, refDatum }).bedrag / 12` — geen apart veld in `Profiel`.

### Tests

`bun:test` (zelfde API als Vitest). `REF_2026 = "2026-06-01"` is de standaard referentiedatum. De repo heeft momenteel `golden.test.ts`, `schemaValidate.smoke.test.ts` en `taxcalcValidation.test.ts`. Voor het volledige testcorpus en de validatiestrategie: zie `knowledgebase/07_testcorpus.md`.

## Workflow Preferences

- Keep changes as simple and small as possible. Prefer the least invasive fix that solves the actual problem.
- After making a focused change, briefly report what changed and ask the user to confirm before running extra or time-consuming verification steps.
- Minimal checks that directly guard against breakage are still allowed without confirmation, such as a targeted test, `bun test`, `bun run typecheck`, or `bun run build` when the change affects compiled code.
- Do not spend time on broad manual verification, repeated dev-server attempts, browser automation, or unrelated checks unless the user asks for it or confirms it first.

## Code Review Standards
After completing any implementation, review the code for:
- Functions longer than 30 lines (likely doing too much)
- Logic duplicated more than twice (extract to utility)
- Any `any` type usage in TypeScript (replace with real types)
- Components with more than 3 props that could be grouped into an object
- Missing error handling on async operations
Run /simplify before presenting code to the user. When /simplify is not available run a code auditor skill that checks code quality.
