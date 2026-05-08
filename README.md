# PC 200 Loonmonitor — POC

Single-page proof-of-concept voor brutoloon- en werkgeverskostberekeningen onder
**Paritair Comité 200** (Aanvullend Paritair Comité voor de Bedienden).

- **Stack:** TypeScript + React 19 + Vite 8 + Tailwind v4 + base-ui (shadcn-port)
- **Runtime:** browser-only — geen back-end, geen database, geen authenticatie
- **Data:** bundled JSON dataset (`src/data/pc200_payroll_dataset_2026.json`),
  schema-gevalideerd bij applicatiestart
- **Audit-first:** elke berekening is gekoppeld aan datapunt-id, status,
  betrouwbaarheids-tier (1/2/3) en primaire bron met fragment-citaat

## Berekent

- Sectorale baremas (Schaal I/II × Cat A/B/C/D × ervaringsjaren 0–26)
- Studentenbaremas (Cat A/B/C/D × leeftijd 14–20)
- Brutoloon-check tegen sectoraal minimum
- RSZ — werknemer (13,07 %) / werkgever (25 %) / Sociaal Fonds (0,23 %) /
  bouw-subset opt-in (1,80 %)
- Eindejaarspremie (pro-rata met minimum-anciënniteit 6 mnd)
- Ecocheques (voltijds € 250 / deeltijds-schaal 4-tier)
- Jaarlijkse premie 2026 (€ 330,84)
- Woon-werk trein (100 % CAO 19/9)
- Fietsvergoeding (CAO 164 — € 0,32/km vanaf 1/10/2026)
- Indexatie ondernemingsloon (× 1,0221 op 1/1/2026)

## Hard constraints

- **Geen runtime-aritmetiek op `waarde_bron`** — alleen
  `waarde_genormaliseerd` of `tabel_per_*` worden gebruikt voor berekeningen
- Geen gefabriceerde datapunt-id's, bedragen, percentages of bron-URL's
- Schema-validatie bij start: faalt de validatie, dan weigert de app op te
  starten met een duidelijke foutmelding (zie `src/main.tsx`)
- Strikte mappenstructuur: `src/data/` (read-only JSON), `src/lib/`
  (calc-logica, geen UI), `src/components/` (UI, geen calc), `src/pages/`
  (compositie), `src/lib/__tests__/` (golden tests)

## Gebruik

### Vereisten

- Node 18+ of Bun 1.3+
- pnpm (of npm/yarn) om dependencies te installeren

### Installeren & starten

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Tests

20 golden testcases (TC-01..TC-20) plus 2 schema-smoke tests.

```bash
bun test          # 34/34 groen
```

(Bun is gebruikt omdat `vitest` niet beschikbaar was in de sandbox; de
test-API is `bun:test` met dezelfde `describe/it/expect`-conventies.)

### Type-check

```bash
pnpm typecheck    # tsc -p tsconfig.app.json --noEmit
```

### Production build

```bash
pnpm build
pnpm preview
```

## Pagina's

- **`/`** — Profiel + Resultaten. Alle inputs links, 8 result-blokken
  rechts. Elk blok toont audit-paneel met datapunt-id, status, tier en bron.
- **`/testcases`** — Twaalf representatieve testcases live herrekend tegen
  de bundled dataset.
- **`/scope`** — Dataset-meta, §10 POC-beperkingen, niet-gevonden datapunten,
  bron-conflicten en algemene opmerkingen.

## Bekend manco (zie ook `/scope`)

1. Geen netto-berekening (bedrijfsvoorheffing / personenbelasting buiten scope)
2. Geen sectorale maaltijdcheques in PC 200
3. Geen sectorale thuiswerkvergoeding in PC 200
4. Centenindex niet toegepast (was niet gefinaliseerd op peildatum)
5. Fietsvergoeding vóór 1/10/2026: pad A — geen berekening, enkel banner
6. Bouw-subset is opt-in vinkje
7. Studentenmodus = enkel barema (geen RSZ/jaarpremie)
8. Eén dataset-versie per build (geen multi-jaar selector)
9. Browser-only — geen logging, geen DB, geen auth
10. Audit, geen advies — bij twijfel altijd primaire bron raadplegen

## Project-layout

```
pc200-loonmonitor/
├── index.html
├── src/
│   ├── main.tsx                    # schema-validation gate
│   ├── App.tsx                     # HashRouter + nav
│   ├── index.css                   # Tailwind v4 entrypoint
│   ├── data/
│   │   ├── pc200_payroll_dataset_2026.json
│   │   └── pc200_payroll_dataset.schema.json
│   ├── types/
│   │   └── dataset.ts              # hand-written TS types
│   ├── lib/
│   │   ├── schemaValidate.ts       # Draft-07 validator
│   │   ├── errors.ts               # exception hierarchy
│   │   ├── dataset.ts              # indexById, getDatapunt
│   │   ├── periode.ts              # date-range filtering
│   │   ├── money.ts                # round2, formatEUR
│   │   ├── baremas.ts              # bedienden + studenten
│   │   ├── rsz.ts
│   │   ├── eindejaarspremie.ts
│   │   ├── ecocheques.ts
│   │   ├── fietsvergoeding.ts
│   │   ├── woonwerkTrein.ts
│   │   ├── jaarpremie.ts
│   │   ├── indexatie.ts
│   │   └── __tests__/
│   │       ├── golden.test.ts      # TC-01..TC-20
│   │       └── schemaValidate.smoke.test.ts
│   ├── components/
│   │   ├── AuditPanel.tsx
│   │   ├── Banner.tsx
│   │   ├── BronLink.tsx
│   │   ├── Field.tsx
│   │   ├── ResultCard.tsx
│   │   └── StatusBadge.tsx
│   └── pages/
│       ├── HomePage.tsx
│       ├── TestcasesPage.tsx
│       └── ScopePage.tsx
├── package.json
├── tsconfig.json                   # baseUrl + paths voor bun
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Geen vervanging voor sociaal secretariaat

De monitor maakt geen juridisch oordeel. Alle resultaten zijn enkel een
audit-traceerbare berekening tegen de bundled dataset. Bij twijfel altijd
de primaire bron raadplegen via het audit-paneel.
