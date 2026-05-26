# Implementation roadmap — Loonmotor PC 200

**Doel:** historisch gefaseerd plan om van de oorspronkelijke POC naar een productieklare loonmotor voor PC 200 bedienden te groeien. Let op: de actuele Jaakie-werking staat in `knowledgebase/12_toolfunctionaliteit.md`; payrollberekeningen zijn browser-only, maar de optionele AI-chat gebruikt intussen een Vercel serverless laag.

**Peildatum:** 9 mei 2026 — inkomstenjaar 2026 / aanslagjaar 2027.

---

## Architectuurprincipes (vastgelegd)

1. **Schema-gevalideerde dataset.** Iedere parameter is een `Datapunt` met `id`, `bron_url`, `status`, `betrouwbaarheid`, `peildatum`, `geldig_van`, `geldig_tot`, `waarde_bron`, `waarde_canoniek`, en `audit_trail`. Geen runtime-arithmetic op `waarde_bron` — enkel canoniek.
2. **3-tier bronnenhiërarchie.** Tier 1 (overheid) > Tier 2 (sociale secretariaten) > Tier 3 (vakbonden, vakbladen). Iedere conclusie is traceerbaar.
3. **Browser-only payroll.** Dataset als statische JSON, calculator als pure functies (TypeScript). De later toegevoegde AI-chat is een aparte serverless laag en vervangt de calculator niet.
4. **Productie = service.** Backend voor parameterbeheer, audit-trail-versionering, multi-PC-uitbreidbaarheid.
5. **Testdriven.** Iedere wijziging passeert het testcorpus van 30 cases met tolerantie ±€5/maand.

---

## Golf 1 — afronding kennisbank (DEZE LEVERING)

| # | Deliverable | Status |
|---|-------------|--------|
| 1.1 | `01_research_payroll_regelkader_2026.md` | ✅ |
| 1.2 | `02_research_netto_calculator_ingredienten.md` | ✅ |
| 1.3 | `bronnen_pc200_loonmotor_2026.zip` (volledige bronnenarchief) | ✅ |
| 1.4 | `dataset_uitbreiding_voorstel.md` | ✅ |
| 1.5 | `netto_calculator_specificatie.md` | ✅ |
| 1.6 | `sources_guideline.md` | ✅ |
| 1.7 | **`03_testcorpus_brutonetto.json` + `.md`** (30 cases) | ✅ |
| 1.8 | **`04_gaps_en_pending.md`** | ✅ |
| 1.9 | **`05_implementation_roadmap.md`** (dit document) | ✅ |
| 1.10 | **`06_werkgeverskost_specificatie.md`** | ✅ |
| 1.11 | **`07_werkgeverskost_datapunten.md`** | ✅ |

**Eindstand Golf 1:** alle kennisproducten klaar voor handover aan ontwikkelaarsteam. Validatie tegen FOD Financiën / Bijlage III voor de 30 cases is in Golf 2 ingevoerd.

---

## Golf 2 — Validatie & calibratie (4 weken)

**Doel:** zekerheid dat de rekenmodule binnen ±€5/maand op alle 30 testcases overeenkomt met de FOD Bijlage III-afleiding.

### 2.1 FOD Bijlage III-validatie

- Gebruik FOD Financiën **Regels 1 januari 2026** en **Sleutelformule vanaf 1 januari 2026** als primaire bron.
- Loop de 30 testcases via `validate_bijlage_iii_corpus.py` (zie helper-script in repo).
- Voor elke afwijking > €5: identificeer welke component (RSZ, BV, werkbonus, BBSZ).
- Pas `calc_brutonetto_2026.py` aan; her-genereer corpus.
- Iteratief tot ≤ €5 marge.

### 2.2 Sleutelformule Bijlage III KB integreren

De geannualiseerde benadering vervangen door de exacte sleutelformule uit Bijlage III KB 11/12/2025:
- Glijdende schalen toepassen; geen oude afronding op veelvouden van €15.
- Aparte tarieven voor wedde / uitkering / vakantiegeld / eindejaarspremie.
- Forfaitaire BV-vermindering per gezinslast.

**Status 12/05/2026, afgerond 19/05/2026:** TypeScript gebruikt een lokale `bijlage_iii_sleutelformule_2026` met `fod_bijlage_iii_ok` status en FOD Financiën / Bijlage III als primaire bron. Sociale-secretariaat-tools blijven beperkt tot Tier-2 triangulatie.

### 2.3 Triangulatie sociale-secretariaat-output

- Pak 5 testcases en vergelijk met de loonberekeningssimulator van Securex, Acerta en SD Worx (online tools).
- Documenteer afwijkingen — sociaal secretariaten gebruiken vaak afgeronde benaderingen.

### 2.4 Output

- `golf2_validatieverslag.md`
- Aangepaste `calc_brutonetto_2026.py` of TypeScript-equivalent
- Bijgewerkt testcorpus met `status_validatie` per case (`pending` / `ok` / `kleine_afwijking` / `grote_afwijking`)

---

## Golf 3 — POC-uitbreiding browser-only payroll (3 weken)

**Doel:** de huidige POC verrijken met de gevalideerde rekenmodule en de werkgeverskost-luik.

### 3.1 Calculator-engine porteren

- TypeScript-port van `calc_brutonetto_2026.py` als pure functions in `src/lib/calc/`.
- Type-veilige interfaces voor `LoonInput` en `LoonResultaat`.
- Bun:test-cases voor elk van de 30 corpus-cases (regressie-suite).

### 3.2 Werkgeverskost-luik UI

- Nieuwe view "werkgeverskost" naast bestaande "netto-zicht".
- Output als waterfall-chart (bruto → +RSZ wg → +SF200 → +AO → +provisies → totale loonkost).
- Loonwig-percentage prominent weergeven.

### 3.3 Audit-trail-uitbreiding

- Iedere `Datapunt` opent een drawer met `bron_url`, `peildatum`, `betrouwbaarheid`, `audit_trail`.
- "Waarom is mijn netto X?" → klikpad naar elke ingrediënt.

### 3.4 Pending-flag-systeem in UI

- Items met `status = pending` (bv. fiscale werkbonus 35/63) krijgen een visuele badge.
- Toggle om "huidig regime" vs "scenario hervorming" te tonen.

### 3.5 Output

- Werkbare POC v2 met 30 corpus-validatie geïntegreerd in CI.
- Documentatie-update.

---

## Golf 4 — Backend & multi-PC (8 weken)

**Doel:** schaalbare productieversie die meerdere paritaire comités aankan.

### 4.1 Backend-stack

- Bestand-gebaseerde dataset → API met versionering.
- PostgreSQL of SQLite voor dataset + audit-trail.
- Authenticatie + tenancy (per cliëntdossier).

### 4.2 Multi-PC-architectuur

- Generische `cao_overrides`-laag boven federale parameters.
- Eerste extra PC: PC 124 (bouw) of PC 209 (metaal-bedienden) — afhankelijk van cliëntvraag.

### 4.3 Voorbereide datasets

- Per PC een `cao_metadata.json` met indexering, premies, sociale fondsen, sectorafwijkingen.
- Voor PC 200: bestaande dataset hergebruiken.

### 4.4 Output

- Productieklare backend.
- Two-PC-POC live (PC 200 + één extra).

---

## Golf 5 — Uitbreiding scope (lopend)

Items uit `04_gaps_en_pending.md` §3 stelselmatig opnemen:
- VAA bedrijfswagen-formule (CO₂-gebaseerd) — opgelost in runtime
- VAA werkmiddelen (PC/laptop, GSM, internet, abonnement) — opgelost in runtime
- VAA verwarming / elektriciteit / woning
- CAO 90 bonus (€3.701 vrijgesteld)
- Mobiliteitsbudget
- Bedrijfsleidersregime
- Overuren-fiscaal
- Auteursrechten

Per item: dataset-uitbreiding + calculator-pad + testcase + UI-toggle.

---

## Golf 6 — Continuous compliance (lopend)

### 6.1 Triggers

- **BS-monitoring:** wekelijkse scan van Belgisch Staatsblad op fiscale + socialezekerheidsteksten.
- **Sectoraal:** PC 200 cao-akkoorden via sfonds200.be RSS / mailalert.
- **Tier 2 nieuwsalerts:** Liantis, Securex, Partena, Acerta — per kwartaal scannen.
- **Jaarlijkse parameters-update:** januari (indexering, schalen, plafonds), april (GGMMI), oktober (Septemberverklaring impact).

### 6.2 Werkmethode

1. Trigger detecteert wijziging.
2. Issue aangemaakt met categorie (fiscaal / sociaal / sectoraal) en impact-inschatting.
3. Datapunt-update voorgesteld → review door productowner.
4. Testcorpus opnieuw runnen → afwijking gemeld als > tolerantie.
5. Release met versienotitie + bron-vermelding.

### 6.3 Audit-trail invariant

Elke historische berekening moet **reproduceerbaar** blijven met de dataset zoals die was op de berekeningsdatum. Versionering van `Datapunt`-records (geen overschrijving, enkel `geldig_tot` + nieuwe versie).

---

## Risico-register

| # | Risico | Waarschijnlijkheid | Impact | Mitigatie |
|---|--------|---------------------|--------|-----------|
| R-01 | PB-hervormingswet wordt definitief gestemd vóór productiestart → schalen/vrije som veranderen | Hoog | Hoog | Pending-flag-systeem; beide scenario's modelleren |
| R-02 | Fiscale werkbonus 35/63 in werking | Midden | Midden | Feature-flag, snelle activering |
| R-03 | FOD Bijlage III-validatie levert structurele afwijking > €5/m op meerdere cases | Midden | Hoog | Root-cause analyse in BV/RSZ/werkbonus/BBSZ en corpus hergenereren |
| R-04 | Cao PC 200 onverwachte parameterwijziging (bv. eindejaarspremie-formule) | Laag | Midden | Sectoraal alert; sectorspecialist als tweede review |
| R-05 | Browser-only beperkt schaalbaarheid bij grote organisaties | Hoog | Laag (Golf 1-3) → Hoog (Golf 4) | Backend-migratie in Golf 4 |
| R-06 | Bron-divergenties (BBSZ, werkbonus-cutoffs) blijven onopgelost | Laag | Laag | Triangulatie in Golf 2.3 |

---

## Definitie van "klaar voor productie"

Een release wordt pas naar productie gepubliceerd als:

1. ✅ Alle 30 testcases binnen ±€5/m van FOD Bijlage III-corpusvalidatie.
2. ✅ Alle Datapunten hebben `betrouwbaarheid ≥ 0.8` of zijn expliciet als `pending` gemarkeerd in de UI.
3. ✅ Geen Tier 3-bron als enige onderbouwing voor een Datapunt met `impact = hoog`.
4. ✅ Audit-trail werkt voor elke berekening (drawer toont bron-URL).
5. ✅ Pending-flags zichtbaar in UI met toggle naar scenario.
6. ✅ Werkgeverskost-luik gevalideerd tegen sociaal secretariaat-output (5 cases).
7. ✅ CI-pipeline runt regressietest op elke PR.
