# Plan — Samenvoeging van kennisbanken (Jaakie markdown ↔ Loonmotor BE HTML)

**Auteur:** Kimi Code CLI  
**Datum:** 2026-05-15  
**Versie:** 1.0 (voorlegging ter goedkeuring)

---

## 1. Situatieschets

We hebben twee onafhankelijk opgestelde kennisbronnen over hetzelfde domein (Belgische payroll / loonmotor voor PC 200):

| Kenmerk | Bron A — `knowledgebase/*.md` | Bron B — `knowledgebase/Loonmotor_copilot_marktonderzoek_PLUS/*.html` |
|---|---|---|
| **Doel** | Specificatie, testcorpus & SSOT voor de **Jaakie** browser-POC | Onderzoeksdossier voor de bouw van een **volwaardige Belgische payroll engine** |
| **Formaat** | 16+ Markdown-bestanden (lineair, versiebaar) | 12 gekoppelde HTML-pagina's (navigatiebaar, visueel) |
| **Technologie-focus** | TypeScript / React / Vite — browser-only | Kotlin / Spring Boot / PostgreSQL — full backend |
| **Scope** | PC 200 only; bruto→netto + werkgeverskost | Alle PC's (theoretisch); 22-stappen E2E inclusief aangiften |
| **Peildatum cijfers** | 2026-05-08 (up-to-date met 1/4/2026 werkbonus) | 2026-01-01 (deels verouderd) |
| **Audit-trail** | 3-tier bronnenhiërarchie + triangulatieregels | Bronnenlijst zonder tier-classificatie |
| **Testcorpus** | 30 BNTC + 15 NTC + 24 TC golden tests | Geen — alleen één illustratief bruto-netto-voorbeeld |
| **Concurrentie** | Group S Salary Sim diepgaande vergelijking | 13-spelers matrix + SWOT + white spaces |

**De vraag:** beide bronnen samenvoegen in de HTML-structuur van Bron B, zodat developers, agents en users één leidend, navigeerbaar dossier hebben.

---

## 2. Grondige differentieel-analyse

### 2.1 Unieke inhoud die alleen in Bron A zit (mag NIET verloren gaan)

| Document | Unieke waarde |
|---|---|
| `02_regelkader_2026.md` | Exacte sleutelformule BV 2026, werkbonus-formules (Luik A/B), BBSZ-banden, fiscale werkbonus %, VAA-forfaits, PB-schijven, forfaitaire beroepskosten, indexcoëfficiënt 2,3000 |
| `04_calculator_netto.md` | Volledige netto-calculator specificatie met TypeScript-formules, input/output tabellen, UI-flow, foutgedrag, 15 NTC-testcases |
| `05_calculator_werkgeverskost.md` | Exacte werkgeverskost-formule (19,88% + 5,12% + 0,23%), structurele vermindering (helling 0,1600), doelgroepvermindering, loonwig-berekening |
| `07_testcorpus.md` | 30 BNTC-cases met component-gewijze uitwerking (RSZ, werkbonus, BV, BBSZ, netto, werkgeverskost) en validatiestatus |
| `08_gaps_en_pending.md` | Levende checklist van pending wijzigingen (Arizona 35%/63%), datapunten die verificatie nodig hebben, opgeloste gaps met datum |
| `10_bronnen_guideline.md` | Triangulatieregels per bouwsteen, onderhoudscyclus (maandelijks BS-scan, kwartaal Tier-2 alerts), 3-tier hiërarchie |
| `Referenties/groups_be_salarysim.md` | Veld-voor-veld mapping van Group S Salary Sim, inclusief geavanceerde modus, netto→bruto analyse, UI/UX vergelijking |
| `bronnen/calculators/` + `tier2_secretariaten/` | 36 URL-bestanden naar online referentietools |
| `tools/` | `validate_corpus.py`, `calc_brutonetto_2026.py` (Python-referentie) |

### 2.2 Unieke inhoud die alleen in Bron B zit (verrijkt het dossier)

| HTML-pagina | Unieke waarde |
|---|---|
| `marktonderzoek.html` | Marktconcentratie-cijfers (~95k / ~81k / ~76k / ~65k werkgevers), M&A-track (Aditro, Pointlogic, Centric), verdienmodellen (€5–€25 per strook), doelgroep-segmentatie |
| `concurrentiematrix.html` | 13×8 feature-matrix, SWOT ESS vs challengers, 4 white spaces (API-first / family-office / sector-vertical / compliance-as-a-service), build-vs-partner tabel |
| `werking-loonmotor.html` | 22-stappen E2E-proces, 18 integraties (Dimona, DmfA, Belcotax, Finprof, e-Box, Sigedis, KSZ, SEPA, Limosa, Studentatwork, FedRis, RVA…), 13 edge cases, loonbrief-vermeldingen (art. 15 Wet 12/4/1965) |
| `requirements.html` | F1–F5 functioneel, NF1–NF5 niet-functioneel, C.01–C.10 compliance |
| `datamodel.html` | PostgreSQL DDL, bitemporeel patroon (`valid_period` + `system_period`), RLS, partitionering, SHA-256 ketenhash |
| `technische-architectuur.html` | Kotlin/Spring Boot Modulith, decision tables JSONB, CQRS read-models, API-specificatie (OpenAPI 3.1), build-vs-buy per component |
| `juridische-checklist.html` | 12-punts GDPR-checklist, 15 loonbrief-vermeldingen, bewaartermijnen (5j/7j/levenlang), 8 ESS-erkenningseisen, 10 contract-clausules, EU 2023/970 verplichtingen |
| `mvp-roadmap.html` | 6 fases (0–5) met Go/No-Go gates, resource curve (3 → 27 FTE), Q-by-Q view (Q1 start → Q8 productie → Q21+ ESS) |
| `risicoregister.html` | 30 risico's met I×W-scoring (1–25), heatmap, top-10 met mitigatie |

### 2.3 Tegenspraken & verouderingen (mét voorstel voor leidende bron)

| Onderwerp | Bron A (Jaakie — **leidend**) | Bron B (HTML — **te corrigeren**) | Actie |
|---|---|---|---|
| **Werkbonus bedragen** | Luik A €125,04 / Luik B €168,62 vanaf 1/4/2026 | Luik A €120,59 / Luik B €162,62 (peildatum 1/2/2025) | **Corrigeren** in `wetgevend-kader.html` + `werking-loonmotor.html` |
| **BV-berekening** | Sleutelformule KB 11/12/2025 (glijdende schaal, geen vaste percentages) | Vaste tarieven 26,75% / 42,80% / 48,15% / 53,50% genoemd | **Corrigeren** — vermelden dat vóór 2023 tabellen golden, sindsdien sleutelformule |
| **GGMMI** | €2.189,81 (1/4/2026) | Niet expliciet genoemd | **Toevoegen** als kpi in `index.html` |
| **Belastingvrije som** | €11.180 (AJ 2027) | Niet genoemd | **Toevoegen** in `wetgevend-kader.html` |
| **RSZ-werkgever opbouw** | 19,88% basis + 7,48% loonmatiging = effectief ~25% | "~25%" zonder uitsplitsing | **Aanvullen** in `werking-loonmotor.html` |
| **Maaltijdcheque max** | €8,91 wg + €1,09 wn (totaal €10,00) | €10,00 als kpi — correct maar onvolledig | **Aanvullen** met werknemer/werkgever split |
| **Telewerkforfait** | Niet in scope Jaakie | €160,99/maand als kpi | **Behouden** in HTML — markeer als "Niet in Jaakie scope" |
| **Fietsvergoeding** | €0,32/km (PC 200 vanaf 1/10/2026) / €0,36/km KB-plafond | €0,37/km plafond €3.700/jaar | **Corrigeren** — verschil tussen KB-plafond en PC 200-CAO |
| **Eindejaarspremie anciënniteit** | Verlaagd van 5→3 jaar vanaf 1/1/2026 | Niet vermeld | **Toevoegen** |
| **Structurele vermindering** | Helling 0,1600 vanaf 1/4/2026 | Niet vermeld | **Toevoegen** |
| **Fiscale werkbonus** | 33,14% × Luik A + 52,54% × Luik B | Niet vermeld | **Toevoegen** |
| **Doelgroepvermindering** | Federale vermindering eerste aanwerving, wijzigt 1/4/2026 | Niet vermeld | **Toevoegen** |
| **Loonwig** | ~51% (smal) / ~52,5% (breed) voor €3.500 | ~51% in voorbeeld | **Consolideren** met exacte formule |

### 2.4 Scope-afbakeningsverschillen (geen tegenspraak, maar expliciet maken)

| Onderwerp | Bron A (Jaakie) | Bron B (Loonmotor BE) |
|---|---|---|
| **Brandnaam** | Jaakie | Loonmotor BE |
| **PC-dekking** | PC 200 only (bewust) | Alle ~164 PC's (theoretisch) |
| **Backend** | Geen — statische JSON in browser | Kotlin/Spring Boot + PostgreSQL |
| **ESS-erkenning** | Niet nodig (geen aangiften namens wg) | Fase 5 optie (24+ maanden) |
| **Dimona/DmfA/Belcotax/Finprof** | Niet geïmplementeerd | Wel in scope als integratiepunt |
| **Netto→Bruto** | Niet geïmplementeerd (wel geanalyseerd) | Niet expliciet genoemd |
| **Scenario-vergelijking** | Niet geïmplementeerd | Niet genoemd |
| **Export PDF/print** | Niet geïmplementeerd | Niet genoemd |

---

## 3. Samenvoegstrategie

### 3.1 Leidend principe

> **De HTML-structuur van Bron B is de "schaal"; de inhoud van Bron A is de "vulling".**
> 
> Elke HTML-pagina in Bron B wordt geaudit op: (1) feitelijke juistheid, (2) volledigheid ten opzichte van Bron A, (3) consistentie met de geïmplementeerde Jaakie-codebase.

### 3.2 Gestructureerde aanpak per pagina

Voor elke van de 12 HTML-pagina's voeren we een **vier-stappen audit** uit:

1. **Fact-check** — Vergelijk alle cijfers, percentages, datums en formules met Bron A. Markeer afwijkingen.
2. **Gap-fill** — Voeg unieke inhoud uit Bron A toe die op die pagina thuishoort (testcases, exacte formules, bron-URL's).
3. **Scope-label** — Voeg expliciete badges toe die aangeven of een onderdeel "In Jaakie scope", "Buiten Jaakie scope" of "Roadmap" is.
4. **Cross-link** — Verbind gerelateerde HTML-pagina's onderling (bijv. van `werking-loonmotor.html` naar `wetgevend-kader.html` bij BV-verminderingen).

### 3.3 Nieuwe pagina's die toegevoegd moeten worden

De volgende Bron-A-inhoud heeft **geen natuurlijke thuis** in de huidige 12-pagina-structuur. Voorstel: uitbreiden naar 15 pagina's:

| Nieuwe pagina | Bron-A inhoud | Reden |
|---|---|---|
| `jaakie-specificatie.html` | `01_project_scope.md` + `04_calculator_netto.md` + `05_calculator_werkgeverskost.md` | De actuele tool-specificatie ontbreekt volledig in Bron B |
| `testcorpus.html` | `07_testcorpus.md` (30 BNTC + 15 NTC + 24 TC) | Validatie is essentieel voor vertrouwen; golden tests zijn uniek |
| `referentie-tools.html` | `Referenties/groups_be_salarysim.md` + `10_bronnen_guideline.md` §4 | Diepgaande tool-vergelijkingen en calculator-links |
| `dataset-reference.html` | `03_datamodel.md` + `DATASET_REFERENCE.md` | Het JSON-datamodel van Jaakie verschilt fundamenteel van het PostgreSQL-model in `datamodel.html` |
| `gaps-pending.html` | `08_gaps_en_pending.md` + `09_implementation_roadmap.md` | Levend overzicht van wat nog niet klaar is |

*Alternatief (minimaal):* voeg de inhoud toe als extra secties binnen bestaande pagina's, maar dit maakt de pagina's zeer lang.

### 3.4 Branding & taalgebruik

- **In de HTML-pagina's:** Gebruik "**Jaakie**" als naam van de bestaande, werkende browser-tool.
- **In de HTML-pagina's:** Gebruik "**Loonmotor BE**" als overkoepelend onderzoeksdossier / ambitie.
- **Badge-systeem uit Bron B behouden:** `Feit`, `Aanname`, `Hypothese`, `Onzekerheid`, `Open vraag`, `MVP`, `Later`, `Enterprise`.
- **Extra badges toevoegen:** `In Jaakie`, `Niet in Jaakie`, `Roadmap Jaakie`.

---

## 4. Concrete uitvoeringsfase (voorstel)

### Fase 1 — Audit & Corrigeren (1 dag)
Doel: elimineer tegenspraken en verouderingen.

- [ ] `index.html`: update KPI's (GGMMI €2.189,81, werkbonus 1/4/2026, belastingvrije som €11.180)
- [ ] `werking-loonmotor.html`: corrigeer werkbonus-bedragen naar 1/4/2026-waarden
- [ ] `werking-loonmotor.html`: vervang vaste BV-tarieven door sleutelformule-verwijzing
- [ ] `wetgevend-kader.html`: voeg exacte 2026-bedragen toe uit `02_regelkader_2026.md`
- [ ] `wetgevend-kader.html`: voeg fiscale werkbonus (33,14%/52,54%) en structurele vermindering toe

### Fase 2 — Aanvullen (1–2 dagen)
Doel: vul unieke Bron-A-inhoud in op de juiste plekken.

- [ ] `marktonderzoek.html` → voeg Group S vergelijking toe als "Referentie: Tier-2 calculator"
- [ ] `concurrentiematrix.html` → voeg "Jaakie" toe als 14e speler (niche: PC 200 + audit-trail)
- [ ] `werking-loonmotor.html` → voeg exacte bruto-netto-voorbeelden toe uit testcorpus (TC-001 t/m TC-005)
- [ ] `requirements.html` → voeg Jaakie-specifieke requirements toe (schema-validatie gate, bun test, `safeGetValue`)

### Fase 3 — Nieuwe pagina's (2 dagen)
Doel: creëer natuurlijke thuisplaatsen voor inhoud die nu 'zweeft'.

- [ ] Creëer `jaakie-specificatie.html` (scope, netto-spec, werkgeverskost-spec, formulieren, audit-trail)
- [ ] Creëer `testcorpus.html` (3 testlagen, 30 BNTC-cases, validatie-workflow, FOD Tax-Calc procedure)
- [ ] Creëer `referentie-tools.html` (Group S diepgaand, calculator-links tier 1/2/3)
- [ ] Update `index.html` leeswijzer met nieuwe pagina's
- [ ] Update alle topnav-menu's (12 → 15 links)

### Fase 4 — Cross-linking & Polish (0,5 dag)
Doel: maak het dossier doorzoekbaar en consistent.

- [ ] Voeg "Zie ook" links toe onder elke sectie
- [ ] Voeg consistente scope-badges toe (`In Jaakie` / `Niet in Jaakie`)
- [ ] Controleer dat alle bron-URL's in `bronnen.html` de 50+ Tier-1/2/3 URL's uit Bron A bevatten
- [ ] Genereer een **vergelijkingstabel** (zie §5) als aparte HTML-pagina of sectie

---

## 5. Deliverable: vergelijkingstabel als overzicht

Als **basis voor de samenvoeging** stel ik voor om eerst een **samenvattende vergelijkingstabel** te publiceren binnen het HTML-dossier. Dit geeft developers en agents direct zicht op:

- Welke cijfers uit Bron B vervangen moeten worden door Bron A
- Welke inhoud uniek is aan elke bron
- Welke scope-afbakening geldt

Voorstel: voeg een nieuwe sectie toe aan `index.html` (of een aparte `mapping.html`) met een **tabel van 30+ regels** die de verschillen per onderwerp uitlijnt.

---

## 6. Risico's bij samenvoeging

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| HTML-pagina's worden te lang (>300KB) | Medium | Leesbaarheid daalt | Splits in extra pagina's (zie §3.3) of gebruik accordions |
| Verouderde cijfers uit Bron B "overleven" in de merge | Hoog | Foutieve beslissingen | Strikte fact-check fase (§4.1) — elk getal gegenereerd door Bron A |
| Brandverwarring (Jaakie vs Loonmotor BE) | Medium | Gebruikers weten niet wat al werkt | Expliciete scope-badges op elk onderdeel |
| Dubbele waarheid (Bron A vs Bron B formules) | Medium | Tegenspraak in dossier | Bron A is leidend voor alle numerieke waarden |
| Markdown-bestanden worden "verlaten" na merge | Laag | Historische context verloren | Bewaar Bron A als `knowledgebase/archive/`; update niet meer |

---

## 7. Goedkeuring gevraagd

Dit plan vereist uw goedkeuring op twee keuzes:

1. **Uitbreiding naar 15 HTML-pagina's** (met 3 nieuwe pagina's voor Jaakie-spec, testcorpus en referentie-tools), of liever **minimaal** (alles in bestaande 12 pagina's proppen)?
2. **Leidende bron voor cijfers:** Akkoord dat Bron A (Jaakie markdown) leidend is voor alle bedragen, percentages en formules, en Bron B (HTML) gecorrigeerd wordt waar het afwijkt?

Na uw goedkeuring voer ik fase 1 uit (audit + corrigeren) en rapporteer per pagina wat gewijzigd is.
