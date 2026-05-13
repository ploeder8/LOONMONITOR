# Project Brief — PC 200 Loonmotor POC

**Bestand:** `pc200_payroll_poc_brief.md`
**Versie:** 2026-05-08
**Opdrachtgever:** Jaak Roggen — Manager Family Office, Vanhavermaet
**Beslisser POC:** Jaak Roggen
**Doelgebruiker:** payroll-experts (intern Vanhavermaet en/of cliëntwerkgevers)
**Taal van de tool & het dataset:** Nederlands (nl-BE)

> Dit document beschrijft de POC. Voor het juridisch-inhoudelijke kader: zie de drie meegeleverde markdown-bestanden (`_CORE`, `_VERIFICATIE`, `_DEVELOPER`). Voor de gegevens zelf: `pc200_payroll_dataset_2026.json` (gevalideerd tegen `pc200_payroll_dataset.schema.json`).

---

## Inhoudstafel

1. [Doel](#1-doel)
2. [Scope POC](#2-scope-poc)
3. [Gebruikersverhaal](#3-gebruikersverhaal)
4. [Functionele eisen](#4-functionele-eisen)
5. [Niet-functionele eisen](#5-niet-functionele-eisen)
6. [Architectuur — voorstel](#6-architectuur--voorstel)
7. [UI-flow](#7-ui-flow)
8. [Acceptance — gouden testcases](#8-acceptance--gouden-testcases)
9. [Definition of Done POC](#9-definition-of-done-poc)
10. [Bekende beperkingen — bewust uitgesloten](#10-bekende-beperkingen--bewust-uitgesloten)
11. [Geleverde activa](#11-geleverde-activa)
12. [Roadmap na POC](#12-roadmap-na-poc)

---

## 1. Doel

Een **werkbare proof-of-concept** bouwen waarmee een payroll-expert binnen Vanhavermaet:

- voor een gegeven werknemerprofiel binnen PC 200 het sectoraal minimum kan verifiëren,
- de RSZ-bijdragen (werknemer + werkgever, incl. Sociaal Fonds 200 en bouw-subset indien van toepassing) berekend krijgt,
- de toepasselijke sectorale premies en voordelen ziet,
- bij elke berekende waarde een **klikbare bron-link** krijgt naar het oorspronkelijke document.

De POC moet **intern testbaar** zijn door een payroll-expert zonder developer-tussenkomst — dus een UI met logische flow, geen CLI of Postman-collectie.

---

## 2. Scope POC

### Wel in scope

| Onderdeel | Detail |
|---|---|
| **Brutoloon-check** | Vergelijking met sectoraal minimum o.b.v. (schaal × cat × ervaring) of (cat × leeftijd) voor studenten |
| **RSZ — werknemer** | 13,07 % op brutoloon |
| **RSZ — werkgever (profit)** | 25,00 % faciaal tarief |
| **Sociaal Fonds 200** | 0,23 % werkgeversbijdrage |
| **Bouw-aanvullend pensioen** | 1,80 % werkgeversbijdrage — enkel met `bouw_vlag = true` |
| **Sectorale premies** | Eindejaarspremie (1 maandloon, pro-rata), jaarlijkse premie € 330,84, ecocheques, woon-werk trein, fietsvergoeding, landingsbaan |
| **Audit-trail UI** | Per uitkomst: bron-organisatie, klikbare URL, citaat (`bron_fragment`), `geldig_vanaf`/`geldig_tot`, status |
| **Periode-filtering** | Berekening op een opgegeven referentiedatum — datapunten worden gefilterd op `geldig_vanaf`/`geldig_tot` |

### Niet in scope (POC)

- Bedrijfsvoorheffing schalen (KB Bijlage III) — verwijzing naar BV-simulator FOD Fin volstaat
- Personenbelasting AJ 2027 (nog niet gepubliceerd)
- Maaltijdcheques en thuiswerkvergoeding (status `niet_gevonden` — geen sectorale verplichting)
- Multi-PC (alleen PC 200)
- Authenticatie / multi-tenancy / opslaan van werknemerdossiers
- Integratie met externe payroll-systemen (Acerta, SD Worx, Partena, …)

---

## 3. Gebruikersverhaal

> *"Als payroll-expert wil ik voor één werknemer binnen PC 200 een werknemerprofiel ingeven (schaal, categorie, ervaring of leeftijd, brutoloon, optioneel bouw-vlag), en het systeem geeft me onmiddellijk een overzicht van het sectoraal minimum, de RSZ-bijdragen en de toepasselijke sectorale premies — met bij elke waarde een klikbare verwijzing naar de bron, zodat ik tegenover een cliënt kan staven waar elk getal vandaan komt."*

---

## 4. Functionele eisen

### 4.1 Input — werknemerprofiel

| Veld | Type | Verplicht | Validatie |
|---|---|---|---|
| `referentiedatum` | datum | ✓ | default: vandaag |
| `schaal` | enum: `I`, `II`, `studenten` | ✓ | — |
| `categorie` | enum: `A`, `B`, `C`, `D` | ✓ | C/D enkel bij leeftijd ≥ 18 |
| `ervaring_jaren` | integer 0–60 | bij Schaal I/II | Schaal II vereist ≥ 1 |
| `leeftijd_jaren` | integer 16–20 | bij Schaal `studenten` | — |
| `brutoloon_eur` | decimaal ≥ 0 | ✓ | — |
| `bouw_vlag` | boolean | nee | default: false |
| `tewerkstellingsbreuk` | breuk | nee | bv. 5/5, 4/5, 3/5, 1/2 (default: 5/5) |
| `prestaties_refertepériode_maanden` | integer 0–12 | bij eindejaarspremie | — |

### 4.2 Output — berekeningsresultaat

Voor elke regel: **waarde** + **eenheid** + **`status`-icoon** + **klikbare bron-link** + uitklapbaar paneel met `bron_fragment`, `betrouwbaarheid`, `triangulatie_bronnen`.

Verplichte secties:

1. **Sectoraal minimum** + brutoloon-check (OK / FAAL met delta)
2. **RSZ werknemer** (13,07 %)
3. **RSZ werkgever totaal** (25 % + Sociaal Fonds 200 + eventueel bouw)
4. **Sectorale premies** (eindejaars, jaarlijkse, ecocheques)
5. **Vergoedingen** (woon-werk trein, fiets indien opgegeven)
6. **Indexcoëfficiënt** (informatief — voor lonen boven barema)

### 4.3 Foutgedrag

| Situatie | Tool-gedrag |
|---|---|
| `status = niet_gevonden` op een verwacht datapunt | Banner: *"Sectoraal niet bevestigd — fallback federaal regime / ondernemingscao"* |
| `status = mogelijk_verouderd` | Gele waarschuwing + link naar bron |
| `status = conflict` | Rode waarschuwing + `conflict_opmerking` |
| Datapunt niet geldig op `referentiedatum` | Niet tonen, of tonen als historiek (uitgegrijsd) |
| Brutoloon < sectoraal minimum | Rood: *"€ X onder sectoraal minimum"* |

---

## 5. Niet-functionele eisen

| Categorie | Eis |
|---|---|
| **Reproduceerbaarheid** | Zelfde input + zelfde dataset-versie ⇒ zelfde output (tot op de cent) |
| **Auditabiliteit** | Elke waarde verwijst naar een datapunt-`id`. Het JSON-dataset is single source of truth. |
| **Geen runtime-arithmetic op `waarde_bron`** | Berekeningen gebeuren uitsluitend op `waarde_genormaliseerd` of `tabel_per_*` |
| **Schema-validatie bij start** | Tool laadt het dataset niet als `pc200_payroll_dataset.schema.json` faalt |
| **Performance** | < 500 ms per berekening op een laptop (single-user POC) |
| **Browser-only** | Werkt in Edge/Chrome/Firefox actuele versie; geen installatie nodig |
| **Privacy** | Geen werknemerdata wordt opgeslagen; berekening is stateless |

---

## 6. Architectuur — voorstel

> *Voorstel — de developer mag alternatieven voorstellen mits dezelfde DoD.*

### 6.1 Stack

| Laag | Voorstel | Waarom |
|---|---|---|
| **Frontend** | React + TypeScript + Vite | Snelle setup, type-veiligheid op datapunt-IDs |
| **Bibliotheek** | Tailwind + shadcn/ui | Comfortabele UI met minimale CSS-overhead |
| **Validatie** | `ajv` (in browser) of `pydantic`/`jsonschema` (Python-backend) | Laad-time schema-validatie van het dataset |
| **Berekeningslaag** | Pure TypeScript-module **of** Python FastAPI-backend | Functies zoals `lookup_barema`, `rsz_bijdragen` (zie DEVELOPER §2-4) |
| **Tests** | Vitest (frontend) of pytest (backend) | Eén testfunctie per gouden testcase (zie §8) |
| **Hosting** | Static (frontend-only) of klein FastAPI-bestand op intern adres | POC heeft geen productie-hosting nodig |

### 6.2 Dataset-loading

- Het JSON-dataset wordt **bij build-time** in de bundle gestopt (versie-stabiel) **of** **bij start-time** ingeladen via een `/data/pc200_payroll_dataset_2026.json` endpoint.
- Bij start: schema-validatie. Faalt? → tool weigert te starten met klare foutmelding.
- Bouw bij start een **`Map<string, Datapunt>`** voor O(1) lookup (zie DEVELOPER §2.1).

### 6.3 Versionering

- Het dataset-bestand draagt zijn versie in `meta.laatste_update`. UI toont die in de footer.
- Dataset-updates zijn aparte releases — **geen** auto-fetch in de POC.

---

## 7. UI-flow

```
[ Inputformulier ]                  [ Resultaat ]
───────────────────                 ───────────────────
Referentiedatum     [2026-05-08]
Schaal              [I  v]
Categorie           [A  v]
Ervaring (jaren)    [5     ]
Brutoloon (€)       [2.276,51]
Bouw-vlag           [ ]
Tewerkstellings-
  breuk             [5/5  v]
                                    ┌────────────────────────────────┐
                  [ BEREKEN ] ───── │ ✓ Sectoraal minimum            │
                                    │   € 2.276,51                   │
                                    │   Bron: SSN-PDF jan 2026 ↗     │
                                    │   geldig 1/1/2026 – open       │
                                    │ ▸ Tier 2 + 2 triangulaties    │
                                    ├────────────────────────────────┤
                                    │ RSZ werknemer (13,07 %)        │
                                    │   € 297,54                     │
                                    │   Bron: socialsecurity.be ↗    │
                                    ├────────────────────────────────┤
                                    │ RSZ werkgever totaal           │
                                    │   € 574,37 (25 % + 0,23 %)     │
                                    ├────────────────────────────────┤
                                    │ Jaarlijkse premie 2026         │
                                    │   € 330,84                     │
                                    │   Bron: sfonds200.be ↗         │
                                    └────────────────────────────────┘
```

**Interactie-eisen:**

- Pijl-knop op elk resultaatblok klapt het audit-paneel open: `bron_fragment`, `betrouwbaarheid`, `triangulatie_bronnen`, `opmerkingen`.
- Footer: *"Dataset versie 2026-05-08 — laatste verificatie per datapunt zichtbaar in audit-paneel"*.
- Print-knop genereert PDF van het resultaat (bonus, niet kritisch voor POC).

---

## 8. Acceptance — gouden testcases

De gouden testcases staan in `pc200_payroll_testcases_2026.md` (TC-01 t/m TC-20). De POC is **acceptabel** wanneer:

- Alle 20 testcases groen lopen in de geautomatiseerde testset.
- De 5 visuele testcases (TC-04, TC-05, TC-07, TC-10, TC-18) tonen ook in de UI het correcte gedrag.
- Een payroll-expert kan zonder hulp drie willekeurige testcases reproduceren in de UI binnen 2 minuten elk.

---

## 9. Definition of Done POC

- [ ] Functionele eisen §4 geïmplementeerd
- [ ] Niet-functionele eisen §5 voldaan (incl. schema-validatie bij start)
- [ ] Alle 20 gouden testcases groen
- [ ] Audit-paneel werkend voor élk getoond datapunt
- [ ] Periode-filtering correct (TC-15 als ankerpunt)
- [ ] Bekende beperkingen §10 zichtbaar in UI (info-icoon naast scope)
- [ ] README in repo + lokale `npm run dev` (of equivalent) start de UI binnen 30 sec
- [ ] Korte opleidingsvideo of demo (5–10 min) voor payroll-experts

---

## 10. Bekende beperkingen — bewust uitgesloten

> *Deze beperkingen worden niet in de POC opgelost. Ze worden in de UI **wel** zichtbaar gemaakt — een info-icoon naast het betrokken onderdeel toont een korte uitleg en linkt naar de relevante sectie van `pc200_payroll_dataset_2026_VERIFICATIE.md` §8.*

| Onderwerp | Reden uitsluiting | UI-gedrag |
|---|---|---|
| Personenbelasting inkomstenjaar 2026 (AJ 2027) | Niet officieel gepubliceerd op peildatum | UI-banner in fiscaal-deel: *"PB-schijven AJ 2027 niet beschikbaar — zie BV-simulator FOD Fin"* |
| Volledige BV-schalen | Enkel KB-tekst + sleutelformule beschikbaar in machineleesbaar formaat | Link naar BV-simulator FOD Financiën |
| Sectorale maaltijdcheques | Geen sectorcao — toekenning op ondernemingsniveau | Sectie-banner: *"Sectoraal niet vastgelegd — verifieer ondernemingscao"* |
| Sectorale thuiswerkvergoeding | Idem | Idem |
| Centenindex 2026 | Niet tijdig gefinaliseerd | Info-icoon op indexcoëfficiënt-veld |
| Gemeentebelasting (aanvullende) | Geen Tier 1-bron met tarief per gemeente | Geen veld in UI; vermelding in scope-paneel |
| Sectorale arbeidsduur (concreet aantal uren) | Niet rechtstreeks geëxtraheerd | Veld `arbeidsduur` toont default 38u/week + bronlink Securex TWA |
| Sectorale overuren-toeslagen | Sectorale afwijking niet bevestigd | UI gebruikt wettelijk regime 50/100 % met expliciete vermelding |
| Vakantiegeld bedienden | Geen Tier 1-extractie | Verwijzing naar Gecoördineerde Wetten 28/06/1971 |
| Bouw-subset — exacte scope | CAO 13/03/2025 nr. 192.922 niet integraal uitgelezen | `bouw_vlag` is gebruiker-keuze; UI waarschuwt: *"Pas enkel toe als werknemer onder CAO bouwsubsector valt"* |

> **Belangrijk:** wanneer één van deze beperkingen tijdens de POC een blokker blijkt voor een echte cliëntcase, wordt dat afzonderlijk geprioriteerd — niet als POC-uitbreiding. De POC blijft strak gescoped.

---

## 11. Geleverde activa

Alles in `/output` van de werkomgeving:

| Bestand | Doel | Doelpubliek |
|---|---|---|
| `pc200_payroll_dataset_2026.json` | Het dataset zelf — 43 datapunten + 17 bronnen + 228 baremacellen | Tool, audit |
| `pc200_payroll_dataset.schema.json` | JSON Schema (Draft-07) — type-validatie | Developer, CI |
| `pc200_payroll_dataset_2026_CORE.md` | Gedeeld referentiekader (datamodel, statussen, bronnen, glossary) | Allebei |
| `pc200_payroll_dataset_2026_VERIFICATIE.md` | Verificatieworkflow zonder developer-kennis | Payroll-expert |
| `pc200_payroll_dataset_2026_DEVELOPER.md` | Integratie, lookups, defensieve checks, CI-tests, onderhoud | Developer |
| `pc200_payroll_testcases_2026.md` | 20 gouden testcases met externe Tier 1/2-bronnen | Developer + payroll-expert |
| `pc200_payroll_poc_brief.md` | **Dit document** — projectkader voor de POC-developer | Developer + opdrachtgever |

---

## 12. Roadmap na POC

Strak buiten POC-scope, maar nuttig om alvast te kennen:

1. **Bedrijfsvoorheffing-koppeling** — eigen sleutelformule of API-call naar FOD-simulator
2. **Eindejaarspremie-engine** — alle bijzondere CAO-situaties (tijdelijke werkloosheid, ziekte, ouderschapsverlof, …)
3. **Multi-PC** — generaliseren naar PC 124, PC 220, … via `pc`-selector op datapunten
4. **Historische snapshots** — read-only datasets per peildatum voor reproduceerbare oude berekeningen
5. **Update-pipeline** — semi-geautomatiseerde scrapers + PR-flow voor `meta.laatste_update`-updates
6. **Audit-frontend** — UI om dataset zelf te onderhouden zonder JSON open te moeten doen
7. **Cliëntdossier-laag** — opslaan van werknemerprofielen, batch-berekeningen, jaarvergelijkingen

---

*Laatste herziening: 2026-05-08 — afgestemd op alle dataset-, schema- en documentbestanden van diezelfde versie.*
