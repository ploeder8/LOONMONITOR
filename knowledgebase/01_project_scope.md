# Project Scope — Jaakie

**Versie:** 2026-05-11
**Peildatum dataset:** 2026-05-08 (inkomstenjaar 2026 / aanslagjaar 2027)

---

## 1. Doel

**Jaakie** stelt payroll-experts in staat om voor één werknemer onder **Paritair Comité 200** (Aanvullend Paritair Comité voor de Bedienden, APCB) **bruto → netto** en **bruto → totale werkgeverskost** te berekenen, met **klikbare bronlinks per waarde** en een volledige audit-trail.

> Geen vervanging voor sociaal secretariaat — wel een audit-traceerbare berekening tegen een Tier-1/2-gevalideerde dataset.

---

## 2. Wel in scope

### Brutoloon-niveau
- Sectorale baremas Schaal I + II × Cat A/B/C/D × ervaring 0–26 jaar
- Studentenbaremas Cat A/B/C/D × leeftijd 14–20
- Brutoloon-check tegen sectoraal minimum

### RSZ
- Werknemer 13,07 %
- Werkgever ~25 % (basis + loonmatigingsbijdrage)
- Sociaal Fonds 200 (0,23 %)
- Bouw-subset (opt-in 1,80 %)

### Netto-laag (uitgebreid)
- **Sociale werkbonus** (RSZ-vermindering) — Luik A + B, vanaf 1/4/2026
- **Bedrijfsvoorheffing** (BV) — lokale Bijlage III-sleutelformule 2026 met FOD Financiën / Bijlage III als primaire bron
- **BV-verminderingen** via maandtabel: kinderen ten laste, fiscaal alleenstaande met kind, groepsverzekering
- **Tijdelijk niet actief:** kind <3 jaar is uit de calculatorlogica gehaald tot de BV-impact officieel gevalideerd is.
- **Fiscale werkbonus** (belastingkrediet 33,14 % × Luik A + 52,54 % × Luik B)
- **Bijzondere BV-schaal** voor variabel loon (eindejaarspremie, jaarpremie, dubbel vakantiegeld)
- BBSZ (info-band, geen exacte inhouding zolang RSZ-instructie 2026 niet als tabel publiek is)
- Netto-orchestration: bruto → RSZ → werkbonus → effectieve RSZ → BV → BBSZ-band → netto

### Werkgeverskost-laag
- Patronale RSZ (~25 %)
- Sociaal Fonds 200 (0,23 %)
- Arbeidsongevallenverzekering (~0,3 %, bureaupersoneel)
- Maandelijkse loonkost zonder jaarlijkse componenten
- Jaaroverzicht met eindejaarspremie, jaarpremie, ecocheques en dubbel vakantiegeld
- Structurele vermindering laagloon (helling 0,16)
- **Loonwig %** = (totale loonkost − netto) / totale loonkost

### Premies & voordelen (sectoraal PC 200)
- Eindejaarspremie (anciënniteit 3 jaar sinds 1/1/2026)
- Ecocheques (voltijds €250 / deeltijds 4-tier)
- Jaarlijkse premie 2026 (€330,84)
- Woon-werk trein (100 % CAO 19/9)
- Fietsvergoeding (CAO 164 — €0,32/km vanaf 1/10/2026)

### Audit & validatie
- Elke berekende waarde toont datapunt-id, status (`actief` / `mogelijk_verouderd` / `conflict` / `niet_gevonden`), tier (1/2/3), bron-URL, fragment-citaat
- Schema-validatie van dataset bij applicatiestart (gate in `src/main.tsx`)
- 25 bestaande golden testcases (TC-01..TC-25) + 15 NTC-cases voor netto-module (NTC-01..NTC-15)
- 30 brutonetto-testprofielen met FOD Bijlage III-validatievelden (`tools/validate_bijlage_iii_corpus.py`)

---

## 3. Niet in scope (bewust)

### Fiscale categorieën buiten klassieke PC 200-loon
- Volledige PB-aangifte AJ 2027 (alleen BV-niveau, niet eindafrekening)
- Bedrijfsleiders (kostenforfait 3 %, max €3.030)
- Grensarbeiders (dubbelbelastingverdragen)
- Buitenlandse werknemers / internationale tewerkstelling
- Bijzonder belastingstelsel ingekomen belastingplichtigen
- Auteursrechten (15 % RV)
- Flexi-job / sportbeoefenaar
- Loonbeslag

### Voordelen van alle aard (VAA) — uitgesteld naar volgende golven
- Bedrijfswagen (CO₂-formule)
- PC / GSM / internet / tablet (forfaits)
- Huisvesting (KI × multiplier)
- Verwarming / elektriciteit (forfaits)

### Bijzondere stelsels — uitgesteld
- Niet-recurrente resultaatsgebonden voordelen (CAO 90, €3.701 vrijgesteld)
- Mobiliteitsbudget (€3.233–€17.244)
- Pensioensparen / langetermijnsparen (alleen in jaaraangifte)
- Mantelzorgvermindering
- Overuren-toeslag bijzonder fiscaal regime

### Sectoraal niet-gevonden in PC 200
- Maaltijdcheques (geen sectorale CAO verplicht)
- Thuiswerkvergoeding (geen sectorale verplichting)
- Centenindex (regelgeving niet gefinaliseerd op peildatum)

### Andere
- Multi-jaar simulatie (één referentiedatum per berekening)
- Multi-PC-ondersteuning (alleen PC 200 in deze versie)
- Vakantiegeld berekening (alleen provisie aan werkgeverszijde)
- Gemeentebelasting (info-only parameter, default 7,3 %)

---

## 4. Definition of Done (per datapunt)

Een datapunt is **klaar voor productie** wanneer:
1. ✅ Gevuld `waarde_genormaliseerd` of `tabel_per_*` (geen runtime-arithmetic op `waarde_bron`)
2. ✅ `bron_url` klikbaar
3. ✅ `status` is `actief` (of `mogelijk_verouderd` met expliciete toelating)
4. ✅ `betrouwbaarheid` = Tier 1 OF Tier 2 zonder Tier-1-conflict OF Tier 3 met ≥1 Tier-1/2-triangulatie
5. ✅ `bron_fragment` letterlijk citaat ≤ 200 karakters
6. ✅ `geldig_vanaf` / `geldig_tot` gerespecteerd door periode-guard

---

## 5. Definition of Done (per release)

Een release is **deploybaar** wanneer:
1. ✅ Schema-validatie bij start lukt (rode startup-scherm bij failure)
2. ✅ `pnpm typecheck` / `bun run typecheck` slaagt
3. ✅ Alle 25 TC-cases + 15 NTC-cases groen
4. ✅ Geen `Datapunt` zonder `bron_url` of `status`
5. ✅ Voor BV-implementatie: representatieve cases volgen FOD Financiën / Bijlage III 2026; Tax-Calc is geen primaire payrollbron
6. ✅ Disclaimers tonen ("Netto is indicatief", "BV-eindafrekening via PB-aangifte AJ 2027")

---

## 6. Stakeholders

| Rol | Verantwoordelijkheid |
|---|---|
| Product owner | Roadmap + scope-beslissingen + maandelijkse BS-scan voor pending wetgeving |
| Payroll-expert | Verifieert dataset tegen actuele cao's en RSZ-instructies (zie `02_regelkader_2026.md`) |
| Developer | Implementatie + audit-trail + tests (zie `03_datamodel.md`, `04_calculator_netto.md`, `05_calculator_werkgeverskost.md`) |
| QA / validatie-eigenaar | FOD Bijlage III-corpusvalidatie (zie `07_testcorpus.md`) |

---

## Bijlage A — Mapping naar oude documenten

Deze SSOT vervangt:
- `ProjectFiles/pc200_payroll_poc_brief.md` → §1, §2, §3, §4, §5
- `ProjectFiles/pc200_payroll_dataset_2026_VERIFICATIE.md` (scope + beperkingen) → §3
- `ProjectFiles/claude_code_prompt.md` (developer-prompt) → verwijderd; technische instructies leven nu in `AGENTS.md` (project root)
- `ProjectFiles-CopilotCowork/README.md` → grotendeels in dit document + `README.md` van knowledgebase
