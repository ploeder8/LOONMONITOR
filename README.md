# Jaakie

Tool voor payroll-experts om lonen en kosten te verifiëren onder **Paritair Comité 200**
(Aanvullend Paritair Comité voor de Bedienden).

- **Ontwikkeld voor en beheerd door:** Jaak Roggen
- **Stack:** TypeScript + React 19 + Vite 8 + Tailwind v4
- **Runtime:** browser-only — geen back-end, geen database, geen authenticatie
- **Data:** bundled JSON dataset (`src/data/pc200_payroll_dataset_2026.json`),
  schema-gevalideerd bij applicatiestart — **71 datapunten, 15 bronrecords, peildatum 2026-05-08**
- **Audit-first:** elke berekening is gekoppeld aan datapunt-id, status,
  betrouwbaarheidstier (1/2/3) en primaire bron met fragment-citaat
- **Kennisbank (SSOT):** zie `knowledgebase/` voor regelkader, calculator-specs, testcorpus, gaps & roadmap

## Berekent

**Brutoloon**
- Sectorale baremas (Schaal I/II × Cat A/B/C/D × ervaringsjaren 0–26)
- Studentenbaremas (Cat A/B/C/D × leeftijd 14–20)
- Brutoloon-check tegen sectoraal minimum

**RSZ**
- Werknemer (13,07 %) / werkgever (~25 %) / Sociaal Fonds 200 (0,23 %)
- Bouw-subset opt-in: aanvullend pensioen (1,80 %)

**Nettoloon (volledige berekening, AJ 2027¹)**
- Sociale werkbonus (RSZ-vermindering) — Luik A + B, vanaf 1/4/2026
- **Fiscale werkbonus** (belastingkrediet op BV: 33,14 % × Luik A + 52,54 % × Luik B)
- Bijzondere Bijdrage Sociale Zekerheid (BBSZ) — 2026-voorschotformules per gezinstype/scenario
- Bedrijfsvoorheffing (BV) — AJ 2027 Bijlage III-sleutelformule + BV-vermindering kinderen ten laste, fiscaal alleenstaande met kind en groepsverzekering
- **Bijzondere BV-schaal** voor variabel loon (eindejaarspremie, jaarpremie, dubbel vakantiegeld, bonus) — tarief op basis van refertejaarloon
- Nettoloon = brutoloon − effectieve RSZ − BV (na gezinsvermindering) − BBSZ
- Netto → bruto via numerieke inverse voor bediendenprofielen

**Werkgeverskost (totale loonkost)**
- RSZ werkgever (~25 %)
- Sociaal Fonds 200 (0,23 %)
- Bouw-aanvullend pensioen (1,80 %, opt-in)
- Arbeidsongevallenverzekering (~0,3 %, bureaupersoneel)
- Maandelijkse loonkost inclusief optionele groepsverzekering, hospitalisatie en maaltijdcheques
- Jaaroverzicht met eindejaarspremie, jaarpremie, ecocheques en dubbel vakantiegeld
- Provisie dubbel vakantiegeld in maandbeeld: `(bruto + VAA) × 92 % / 12`
- **Loonwig %** = (totale loonkost − netto) / totale loonkost

**Premies & voordelen**
- Eindejaarspremie (pro-rata, anciënniteit 3 jaar sinds 1/1/2026)
- Ecocheques (voltijds €250 / deeltijds 4-tier)
- Jaarlijkse premie 2026 (€330,84)
- Woon-werkverkeer: trein, bus/tram/metro, privéwagen en fiets
- Fietsvergoeding (€0,32/km — CAO 164, vanaf 1/10/2026)
- VAA bedrijfswagen en forfaitaire werkmiddelen (PC/laptop, GSM, internet, abonnement)

¹ *AJ 2027 = inkomstenjaar 2026 (huidig kalenderjaar). Parameters: belastingvrije som €11.180, forfait max €6.070, schijven €16.720/€29.510/€51.070. Geverifieerd via Wet diverse bepalingen 18/12/2025 (BS 30/12/2025) + FOD Financiën. BV gebruikt lokaal de Bijlage III-sleutelformule met FOD Financiën / Bijlage III 2026 als primaire payrollbron; Tax-Calc is enkel een latere PB-raming.*

## Gebruik

### Vereisten
- Node 18+ of Bun 1.3+
- pnpm om dependencies te installeren

### Installeren & starten
```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Tests
```bash
bun test          # logical TC/NTC cases + schema smoke tests
```

### Type-check & build
```bash
bun run typecheck
bun run build
pnpm preview
```

## Git-conventies

- Broncode, documentatie, JSON-data en configbestanden gebruiken `LF` line endings.
- Windows Internet Shortcut-bestanden (`*.url`) blijven bewust op `CRLF`.
- De repository legt dit af via `.gitattributes` en `.editorconfig`, zodat line endings niet afhangen van lokale Git- of editorinstellingen.

## Pagina's

- **`/`** — Profiel + Resultaten.
  - **Bovenaan:** CSV import/export, richting-toggle (bruto → netto / netto → bruto) en `HeroSummary` met vier kerncijfers.
  - **Inputcockpit:** single-column pagina met 2×2 `CockpitCard`-grid voor identiteit, arbeidscontext, brutoloon en woon-werkverkeer. Extra looncomponenten, werkgeversbijdragen en eindejaarspremie staan in ingeklapte secties.
  - **Resultaten:** `ResultBandsPanel` met netto, werkgeverskost, jaaroverzicht, barema-check en audit-panelen. Studentenmodus toont alleen de relevante barema-uitkomst.
  - Elke waarde heeft een audit-paneel met datapunt-id, status, tier en primaire bron.
- **`/testcases`** — Representatieve testcases live herrekend tegen de bundled dataset.
- **`/scope`** — Dataset-meta, beperkingen, niet-gevonden datapunten, bronconflicten en opmerkingen.

## Hard constraints

- **Geen runtime-aritmetiek op `waarde_bron`** — alleen `waarde_genormaliseerd` of `tabel_per_*`
- Geen gefabriceerde datapunt-id's, bedragen, percentages of bron-URL's
- Schema-validatie bij start: faalt de validatie → app start niet (zie `src/main.tsx`)
- Strikte mappenstructuur: `src/data/` (read-only JSON), `src/lib/` (calc, geen UI), `src/components/` (UI, geen calc), `src/pages/` (compositie)

## Branding

Jaakie is de actieve toolnaam en brand. Brand-copy, logo-referenties en centrale UI-labels staan in
`src/branding/brand.ts`; kleuren, fonts, radii en shadows staan in `src/branding/brand.css`.
Gebruik `public/jaakie-designsysteem.md` als guideline en `public/jaakie-demo-pagina-updated.html`
als visuele referentie.

## Project-layout

```
jaakie/
├── index.html
├── knowledgebase/                  # Single Source of Truth — start hier voor inhoudelijke vragen
│   ├── README.md                   # Index + leesvolgorde
│   ├── 01_project_scope.md
│   ├── 02_regelkader_2026.md
│   ├── 03_datamodel.md
│   ├── 04_calculator_netto.md      # incl. bijzondere BV
│   ├── 05_calculator_werkgeverskost.md
│   ├── 06_dataset_uitbreiding.md
│   ├── 07_testcorpus.md
│   ├── 08_gaps_en_pending.md
│   ├── 09_implementation_roadmap.md
│   ├── 10_bronnen_guideline.md
│   ├── DATASET_REFERENCE.md
│   ├── TESTCASES.json
│   ├── bronnen/                    # PDF-snapshots + URL-archief (Tier 1/2/3)
│   └── tools/                      # Python referentie-implementatie
├── src/
│   ├── main.tsx                    # schema-validation gate
│   ├── App.tsx                     # HashRouter + nav + Jaakie shell
│   ├── index.css                   # global CSS + brand-token import
│   ├── branding/
│   │   ├── brand.ts                # centrale toolnaam, logo, copy en title
│   │   └── brand.css               # centrale Jaakie design tokens
│   ├── data/
│   │   ├── pc200_payroll_dataset_2026.json   # 71 datapunten
│   │   └── pc200_payroll_dataset.schema.json
│   ├── types/dataset.ts
│   ├── lib/
│   │   ├── errors.ts               # exception hierarchy
│   │   ├── dataset.ts              # indexById, getDatapunt
│   │   ├── periode.ts              # safeGetValue + date guards
│   │   ├── money.ts                # round2, formatEUR
│   │   ├── baremas.ts
│   │   ├── rsz.ts
│   │   ├── werkbonus.ts            # sociale werkbonus (factor A 0.2738, B 0.2699)
│   │   ├── bbsz.ts
│   │   ├── bv.ts                   # normale BV (AJ 2027)
│   │   ├── bvBijzonder.ts          # bijzondere BV-schaal voor variabel loon
│   │   ├── netto.ts                # orchestration incl. fiscale werkbonus
│   │   ├── werkgeverskost.ts       # totale loonkost + loonwig
│   │   ├── eindejaarspremie.ts     # incl. optionele bijzondere BV
│   │   ├── ecocheques.ts
│   │   ├── fietsvergoeding.ts
│   │   ├── woonwerkTrein.ts
│   │   ├── jaarpremie.ts           # incl. optionele bijzondere BV
│   │   └── __tests__/
│   │       ├── golden.test.ts      # TC/NTC golden tests + payroll-edgecases
│   │       ├── nettoNaarBruto.test.ts
│   │       ├── profielCsv.test.ts
│   │       ├── fodBvValidation.test.ts
│   │       └── schemaValidate.smoke.test.ts
│   ├── components/                 # AuditPanel (+ AuditOpenProvider/Context), Banner, BronLink,
│   │                               #   Field, ResultBand, ResultCard, ResultsSummaryStrip, StatusBadge
│   └── pages/                      # HomePage, TestcasesPage, ScopePage
├── public/
│   ├── Jaakie Logo.png
│   ├── jaakie-designsysteem.md
│   └── jaakie-demo-pagina-updated.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

## Meer informatie

- **Calculator-specs (formules + tarieven):** `knowledgebase/04_calculator_netto.md` + `knowledgebase/05_calculator_werkgeverskost.md`
- **Datapunten-inventaris:** `knowledgebase/DATASET_REFERENCE.md`
- **Pending wetgeving (regering-De Wever):** `knowledgebase/08_gaps_en_pending.md` §1
- **Roadmap (Golf 1–6):** `knowledgebase/09_implementation_roadmap.md`
- **Bronnenhiërarchie:** `knowledgebase/10_bronnen_guideline.md`

## Geen vervanging voor sociaal secretariaat

De monitor maakt geen juridisch oordeel. Alle resultaten zijn enkel een audit-traceerbare berekening tegen de bundled dataset. Bij twijfel altijd de primaire bron raadplegen via het audit-paneel, en voor exacte BV-cijfers de [FOD Fin Tax-Calc-simulator](https://eservices.minfin.fgov.be/taxcalc/).
