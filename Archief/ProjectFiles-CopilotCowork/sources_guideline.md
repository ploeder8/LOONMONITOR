# Sources Guideline — PC 200 Loonmotor (uitbreiding netto-calculator)

**Versie:** 2026-05-08
**Doel:** centrale gids voor alle bronnen die nodig zijn om de POC uit te breiden van *bruto + RSZ + sectorale premies* naar een **volledige netto-loonberekening** voor een PC 200-bediende (inkomstenjaar 2026 / aanslagjaar 2027).
**Doelgebruik:** zowel de payroll-expert (verificatie) als de developer (implementatie). Sluit aan op de bestaande dataset (`pc200_payroll_dataset_2026.json`) en de drie referentiedocumenten `_CORE.md`, `_VERIFICATIE.md`, `_DEVELOPER.md`.

---

## Inhoudstafel

1. [Hoe deze gids te gebruiken](#1-hoe-deze-gids-te-gebruiken)
2. [3-tier bronnenhiërarchie (regel)](#2-3-tier-bronnenhiërarchie-regel)
3. [Bronnen per netto-bouwsteen](#3-bronnen-per-netto-bouwsteen)
   - 3.1 Bedrijfsvoorheffing (KB Bijlage III 2026)
   - 3.2 Verminderingen op bedrijfsvoorheffing
   - 3.3 RSZ-werknemer & sociale werkbonus 1/4/2026
   - 3.4 Fiscale werkbonus
   - 3.5 Bijzondere bijdrage sociale zekerheid (BBSZ)
   - 3.6 Voordelen van alle aard (VAA)
   - 3.7 Forfaitaire beroepskosten / belastingvrije som / PB-schijven
   - 3.8 Aanvullende gemeentebelasting
   - 3.9 Bijzondere regimes (eindejaarspremie, dubbel vakantiegeld, overuren, flexi, auteursrechten)
   - 3.10 PC 200-sectorale premies & voordelen
4. [Bestaande publieke calculators (referentie / cross-check)](#4-bestaande-publieke-calculators-referentie--cross-check)
5. [Triangulatieregel per netto-bouwsteen](#5-triangulatieregel-per-netto-bouwsteen)
6. [Onderhoudscyclus (wanneer welke bron herchecken)](#6-onderhoudscyclus-wanneer-welke-bron-herchecken)
7. [Gemarkeerde gaps & pending bronnen](#7-gemarkeerde-gaps--pending-bronnen)
8. [Geleverde activa in deze sessie](#8-geleverde-activa-in-deze-sessie)

---

## 1. Hoe deze gids te gebruiken

| Vraag | Sectie |
|---|---|
| "Wat is het exacte BV-tarief voor X?" | §3.1 + §3.2 |
| "Welke werkbonus geldt vanaf 1/4/2026?" | §3.3 |
| "Mag ik voor een datapunt op één Tier-2 bron bouwen?" | §2 + §5 |
| "Wanneer moet ik dataset herzien?" | §6 |
| "Welke datapunten zijn nog niet op Tier-1 geverifieerd?" | §7 |
| "Hoe vergelijk ik mijn output met een officiële simulator?" | §4 |

> **Regel uit de POC:** elke berekende waarde in de UI moet via het audit-paneel naar een primaire (of getrianguleerde) bron leiden. Deze gids is de selectiehulp om te bepalen *welke* bron volstaat per datapunt.

---

## 2. 3-tier bronnenhiërarchie (regel)

> Identiek aan [`pc200_payroll_dataset_2026_CORE.md` §3](../07_LOONMOTOR/ProjectFiles/) — hier herhaald in compacte vorm zodat deze gids zelf-staand is.

| Tier | Wie | Wanneer alleenstaand bruikbaar | Wanneer triangulatie verplicht |
|---|---|---|---|
| **Tier 1** | RSZ, FOD Financiën, FOD WASO, sfonds200.be, Belgisch Staatsblad/Justel, NAR (CAO) | ✅ Alleenstaand | n.v.t. |
| **Tier 2** | SSN, Securex, Partena, SD Worx, Acerta, Liantis, Attentia, CLB Group, Group S, Wolters Kluwer, Practicali, BDO, Tiberghien, KPMG, Deloitte, EY, PwC | ✅ Alleenstaand mits geen Tier-1-tegenstrijdigheid | bij conflict tussen 2 Tier-2 |
| **Tier 3** | Vakbonden (ACV, ACLVB, ABVV), Loonberekening.be, NettoCalc.be, Jobat, Wikipedia | ❌ Nooit alleenstaand | **Verplicht** ≥ 1 Tier-1 of ≥ 2 Tier-2 triangulatie |

**Implicatie voor de dataset:** een Tier-3 datapunt zonder geldige `triangulatie_bronnen[]` mag in CI als **rood** worden gemarkeerd (zie testscenario in `_DEVELOPER.md` §7).

---

## 3. Bronnen per netto-bouwsteen

### 3.1 Bedrijfsvoorheffing — KB Bijlage III 2026

**Wettelijke ankerbron (Tier 1):**
- [KB 11 december 2025 — wijziging KB/WIB 92 inzake Bijlage III](https://www.ejustice.just.fgov.be/) — gepubliceerd in **BS 29/12/2025**. (Zoek in eJustice op datum + trefwoord "Bijlage III".)
- [FOD Financiën — Berekening van de bedrijfsvoorheffing 2026](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) — landingspagina met sleutelformule + downloadbare KB-tekst.
- [FOD Financiën — Tax-Calc 2026](https://eservices.minfin.fgov.be/taxcalc/) — officiële BV-simulator (referentie voor cross-check eigen implementatie).

**Operationele toelichting (Tier 2):**
- [Securex — Bijlage III KB/WIB 92 voor 2026](https://www.securex.be/) — uitleg sleutelformule + cijfermatige illustraties.
- [CLB Group — Sleutelformule BV 2026 + schalen I/II/III](https://www.clbgroup.be/) — gestructureerde uitleg per schaal.
- [Partena Professional — verminderingen BV 2026](https://www.partena-professional.be/).

**Implementatieadvies:**
- **POC-fase 1:** UI-link naar FOD Fin BV-simulator + duidelijke audit-banner *"Bedrijfsvoorheffing wordt berekend via FOD Financiën — Tax-Calc"*.
- **POC-fase 2 / post-POC:** eigen TS-implementatie van de sleutelformule met de KB-coëfficiënten als constants in `src/lib/bv.ts`. **Verplicht** validatie tegen de FOD-simulator voor minstens 20 cijfermatige testcases (zie spec).

**Confidence:** HIGH (Tier-1 KB + 4+ Tier-2 corroboratie).

---

### 3.2 Verminderingen op bedrijfsvoorheffing 2026

**Bron (exclusief):** [FOD Financiën — Personen ten laste / kinderen](https://fin.belgium.be/nl/particulieren/belastingaangifte/persoonlijke-situatie/personen-ten-laste/kinderen). Voor alle BV-verminderingen (kinderen ten laste, andere personen, alleenstaande ouder, groepsverzekering, overuren) wordt uitsluitend FOD Financiën als bron gehanteerd. **Geen secundaire bronnen** (Acerta, Securex, SD Worx, Attentia, Partena, NettoCalc, Loonberekening.be) voor tarieven of bedragen.

| Vermindering | Maandbedrag (afgerond) | Tier | Bron |
|---|---|---|---|
| 1 kind ten laste | €52 | 1 | FOD Financiën |
| 2 kinderen | €138 | 1 | FOD Financiën |
| 3 kinderen | €367 | 1 | FOD Financiën |
| 4 kinderen | €635 | 1 | FOD Financiën |
| 5 kinderen | €925 | 1 | FOD Financiën |
| 6 kinderen | €1.216 | 1 | FOD Financiën |
| 7 kinderen | €1.510 | 1 | FOD Financiën |
| 8 kinderen | €1.833 | 1 | FOD Financiën |
| 9+ kinderen | + €345/maand per extra | 1 | FOD Financiën |
| Andere persoon ten laste | €52 (gehandicapt = dubbel) | 1 | FOD Financiën |
| Alleenstaande met kinderen | + €52 bovenop kindvermindering | 1 | FOD Financiën |
| Eigen werknemers-bijdrage groepsverzekering | 30 % vermindering BV | 1 | FOD Financiën |
| Overuren met overurentoeslag | KB Bijlage III bijzonder regime | 1 | KB 11/12/2025 + FOD Financiën |

**Verificatieprocedure:** alle bedragen jaarlijks valideren tegen de [FOD Financiën BV-onderrichtingen](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) en [Personen ten laste / kinderen](https://fin.belgium.be/nl/particulieren/belastingaangifte/persoonlijke-situatie/personen-ten-laste/kinderen).

**Confidence:** HIGH — FOD Financiën is Tier-1 ankerbron.

---

### 3.3 RSZ-werknemer & sociale werkbonus 1/4/2026 (bedienden)

**Tier-1 ankerbronnen:**
- [RSZ — basisbijdragevoeten](https://www.socialsecurity.be/site_nl/employer/infos/employers_nsso/which-contributions.htm) — 13,07 % werknemer, ongeplafonneerd.
- [RSZ — Find My Bonus](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/) — officiële werkbonus-rekenmodule.
- [Programmawet 18 juli 2025 (BS 29/7/2025)](https://www.ejustice.just.fgov.be/) — basis sociale werkbonus-aanpassing.
- [KB 6 oktober 2025 (BS 10/10/2025)](https://www.ejustice.just.fgov.be/) — RSZ-loonplafond €86.700/kwartaal vanaf 1/1/2026.
- [FOD WASO — GGMMI 1/4/2026 = €2.189,81](https://werk.belgie.be/) — basis voor werkbonus-grenzen.

**Operationele tabellen sociale werkbonus bedienden vanaf 1/4/2026 (Tier-2 viervoudige triangulatie — Liantis, Daenens, Securex, Attentia):**

| Luik | Max R | Drempel S₀ | Formule |
|---|---|---|---|
| **A** | €125,04 | €2.880,32 | R = 125,04 − 0,2738 × (S − 2.880,32) |
| **B** | €168,62 | €2.255,50 | R = 168,62 − 0,2699 × (S − 2.255,50) |

**Confidence:** HIGH — Tier-1 wettelijke basis + viervoudige Tier-2 numerieke triangulatie.

---

### 3.4 Fiscale werkbonus (vermindering BV)

**Huidig regime 2026:**
- 33,14 % van Luik A-werkbonus = belastingkrediet op BV
- 52,54 % van Luik B-werkbonus = belastingkrediet op BV

**Bronnen (Tier 2):** [Partena Professional](https://www.partena-professional.be/), [Liantis](https://www.liantis.be/).

**Pending wijziging onder Arizona:** verhoging naar 35 % / 63 % (wetsontwerp, **NIET** in BS op peildatum) — markeer als `[hypothesis]` / `mogelijk_verouderd`.

**Confidence:** SUPPORTED (huidig regime) / WEAK (toekomstig regime).

---

### 3.5 Bijzondere bijdrage sociale zekerheid (BBSZ) 2026

**Tier-1 ankerbron:**
- [RSZ — administratieve instructies werkgevers, kwartaal 1/2026](https://www.socialsecurity.be/employer/instructions/) — bevat tabel BBSZ-banden zodra gepubliceerd.

**Tier-2 fallback:**
- [SSN BBSZ 2026 kwartaalbanden](https://www.ssn.be/) — alleenstaand, niet getrianguleerd → **WEAK**.

**Range 2026:** €0/maand (laagste band) tot ≈ €60,94/maand (plafondband). Per gezinscategorie (alleenstaande / 2 inkomens / 1 inkomen).

**Aanbeveling POC:** in deze fase BBSZ tonen als **info-veld met bandbreedte**, niet als precieze inhouding, tot RSZ-instructie 2026 als gestructureerde tabel beschikbaar is.

**Confidence:** MODERATE (regime) / WEAK (exacte bedragen).

---

### 3.6 Voordelen van alle aard (VAA) 2026

**Tier-1 ankerbron:**
- [FOD Financiën — Voordelen alle aard](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard) — landingspagina + jaarlijkse AAFisc-circulaire.

**Tier-2 cijferbronnen:**
- [fibofin.be — VAA 2026 forfaits](https://www.fibofin.be/) — bedrijfswagen, verwarming, elektriciteit, huisvesting.
- [BDO — Kerncijfers AJ 2027](https://www.bdo.be/) — KI-indexcoëfficiënt 2,3000.

**Kerncijfers 2026:**

| VAA | Waarde 2026 | Wettelijke basis |
|---|---|---|
| Bedrijfswagen min VAA | **€1.690/jaar** | art. 36 §2 WIB 92 |
| Bedrijfswagen ref-CO2 diesel | 58 g/km | jaarlijks KB |
| Bedrijfswagen ref-CO2 benzine/LPG/CNG | 70 g/km | jaarlijks KB |
| Bedrijfswagen-formule | cataloguswaarde × 6/7 × CO2-% × leeftijdscoëf | art. 36 §2 |
| PC ter beschikking | €72/jaar | KB 25/11/2017 |
| Internet | €60/jaar | KB 25/11/2017 |
| GSM-toestel | €36/jaar | KB 25/11/2017 |
| Tablet | €36/jaar | KB 25/11/2017 |
| Telefoonabonnement | €48/jaar | KB 25/11/2017 |
| Verwarming bedrijfsleider | €2.560/jaar | jaarlijks KB |
| Verwarming andere werknemers | €1.150/jaar | idem |
| Elektriciteit bedrijfsleider | €1.280/jaar | idem |
| Elektriciteit andere | €580/jaar | idem |
| Huisvesting niet-bemeubeld | KI × 100/60 × 2 | Programmawet 27/12/2021 + KB 27/5/2022 |
| Huisvesting bemeubeld | KI × 100/60 × 2 × 5/3 | idem |

**Confidence:** MODERATE — Tier-2 fibofin alleenstaand voor minimum-VAA en ref-CO2 → markeer als WEAK in dataset tot AAFisc-circulaire 2026 rechtstreeks gefetcht.

---

### 3.7 Forfaitaire beroepskosten / belastingvrije som / PB-schijven (AJ 2027)

**Tier-1 ankerbron:**
- [FOD Financiën — Beroepsinkomen, forfaitaire kosten](https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen) — €6.070 plafond AJ 2027 expliciet vermeld.

**Tier-2 corroboratie (drievoudig):**
- [Wolters Kluwer / Jef Wellens — Fiscale kerncijfers AJ 2027](https://www.wolterskluwer.com/)
- [Practicali — Geïndexeerde bedragen AJ 2027](https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027)
- [NCOI — Belastingschalen + indexcoëfficiënt AJ 2027](https://www.ncoi.be/)

**Kerncijfers AJ 2027 (inkomsten 2026):**

| Element | Waarde |
|---|---|
| Forfaitaire beroepskosten werknemer | 30 % met plafond **€6.070** |
| Belastingvrije som | **€11.180** |
| PB-schijf 25 % | €0 – €16.720 |
| PB-schijf 40 % | €16.720 – €29.510 |
| PB-schijf 45 % | €29.510 – €51.070 |
| PB-schijf 50 % | > €51.070 |
| Indexcoëfficiënt KI (art. 178 §2 WIB 92) | **2,3000** |

**Status in huidige dataset:** `pb_schijven_inkomstenjaar_2026` heeft `status: niet_gevonden` — kan op basis van bovenstaande Tier-1 + 3× Tier-2 corroboratie naar **`actief`** worden gepromoveerd.

**Confidence:** HIGH.

---

### 3.8 Aanvullende gemeentebelasting

**Wettelijke basis:** art. 465–470bis WIB 92.

**Bronnen:**
- **Geen Tier-1 machine-leesbare lijst per gemeente publiek beschikbaar.** Gemeentelijke tarieven worden door de gemeenteraad vastgesteld; de FOD Financiën publiceert geaggregeerde gemiddelden.
- [Wikipedia — Aanvullende gemeentebelasting](https://nl.wikipedia.org/wiki/Aanvullende_gemeentebelasting) — Tier 3, alleen voor regime + range.

**Range 2026:** 0 % (Knokke-Heist, De Panne) tot ≈ 9 % (sommige Waalse gemeenten). Gewogen gemiddelde ≈ **7,3 %**.

**Aanbeveling POC:** UI-parameter `gemeentebelasting_pct` met default 7,3 % en disclaimer. **Geen veld in dataset** zolang geen Tier-1 lijst.

---

### 3.9 Bijzondere regimes 2026

| Regime | Tier-1 bron | Tier-2 bron |
|---|---|---|
| **Eindejaarspremie / dubbel vakantiegeld BV** (bijzondere schaal 17,16 %–23,22 %) | [KB 11/12/2025 Bijlage III](https://www.ejustice.just.fgov.be/) | [Acerta](https://www.acerta.be/), [SSN](https://www.ssn.be/) |
| **Overuren — vermindering BV (130u/180u contingent)** | [KB Bijlage III](https://www.ejustice.just.fgov.be/) | [Partena Professional](https://www.partena-professional.be/) |
| **Flexi-job 2026** (RSZ wn 0 %, wg 28 %, BV 0 %, plafond €18.440/jaar) | [Wet flexi-jobs](https://www.ejustice.just.fgov.be/) | [Acerta](https://www.acerta.be/), [SSN](https://www.ssn.be/) |
| **Sportbeoefenaar BV** (16,5 % / 33 % / 18 %) | [FOD Fin Sportclubs](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs) | [Group S](https://www.groups.be/) |
| **Auteursrechten** (BV 15 % bevrijdend, plafond €75.360 in 2025; IT-sector heringevoerd 1/1/2026) | Wetsontwerp 56/1243 | [Acerta](https://www.acerta.be/), KPMG, Sodalis, Creative Shelter |

**Scope-aanbeveling POC:** flexi en sport zijn buiten PC 200-bediende-scope; eindejaarspremie/dubbel vakantiegeld bijzonder BV-regime **wel** opnemen voor maandelijkse netto-verfijning.

---

### 3.10 PC 200-sectorale premies & voordelen (cross-reference bestaande dataset)

| Premie / voordeel | Waarde 2026 | Tier-1 ankerbron |
|---|---|---|
| Eindejaarspremie | 1 maandloon (anciënniteitvoorwaarde 5→**3 jaar** vanaf 1/1/2026) | [PC 200 sectorakkoord 18/12/2025 — sfonds200.be](https://www.sfonds200.be/) |
| Jaarlijkse premie | **€330,84** | [sfonds200.be](https://www.sfonds200.be/) |
| Sociaal Fonds 200 (werkgever) | **0,23 %** (verlengd 1/1/2026 → 31/12/2027) | [sfonds200.be](https://www.sfonds200.be/) — getrianguleerd door Partena, Liantis, CLB Group |
| Ecocheques | max **€250/jaar** (vrijstelling RSZ + BV mits CAO-conform) | [FOD WASO](https://werk.belgie.be/) |
| Maaltijdcheques sectoraal | **GEEN sectorale verplichting in PC 200** | [Sociare](https://www.sociare.be/), [Liantis](https://www.liantis.be/) |
| Maaltijdcheque-marge €2 (loonnorm-uitzondering) | mogelijk via sectorale of ondernemings-CAO | [Wet 19/11/2025 (BS 15/12/2025)](https://www.ejustice.just.fgov.be/) |
| Woon-werk trein | 100 % NMBS-abonnement | [KB 28/7/1962 + sectorale aanvulling](https://werk.belgie.be/) |
| Fietsvergoeding | KB-plafond €0,36/km (2026) — sectoraal €0,32/km vanaf 1/10/2026 | [FOD WASO](https://werk.belgie.be/) |
| Landingsbaan-supplement | €92,45/maand sectoraal vanaf 1/6/2026 (PC 200 dataset) | sectorakkoord — **WEAK** zonder Tier-1 |
| Rouwverlof uitbreiding | nieuwe regeling vanaf 1/1/2026 | sectorakkoord 15/01/2026 |

**Status in huidige dataset:** alle bovenstaande premies zijn al opgenomen — uitbreiding nodig voor **eindejaarspremie-anciënniteit 5→3 jaar** (sectorakkoord 18/12/2025, niet meer 15/01/2026 als peildatum).

---

## 4. Bestaande publieke calculators (referentie / cross-check)

**Verplichte cross-check-tools (Tier 1):**

| Tool | URL | Gebruik |
|---|---|---|
| FOD Fin Tax-Calc 2026 | https://eservices.minfin.fgov.be/taxcalc/ | PB AJ 2027 simulator — referentie voor netto |
| FOD Fin BV-simulator 2026 | https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening | Officiële BV-rekenmodule |
| RSZ Find My Bonus | https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/ | Werkbonus-cross-check |

**Tier-2 calculators (nuttig voor regressie-tests, niet auditable):**
- SD Worx bruto-netto: https://www.sdworx.be/
- Acerta bruto-netto: https://www.acerta.be/
- Securex netto-tool: https://www.securex.be/

**Tier-3 (alleen indicatief):**
- Loonberekening.be, NettoCalc.be, Jobat — niet bruikbaar als enige bron.

> **Negative finding:** geen volwassen open-source npm/PyPI-pakket voor Belgische payroll-engine. [GitHub `sysnrt/expat-salary-calculators`](https://github.com/sysnrt/expat-salary-calculators) bevat enkel specs, geen runnable code. → eigen implementatie (TS module) is enige optie, met FOD Fin BV-simulator als audit-referentie.

---

## 5. Triangulatieregel per netto-bouwsteen

> Toepassing van de hiërarchie uit §2 op de concrete bouwstenen. Schrap niets van deze tabel zonder peer-review — dit is de basis van de CI-test `every Tier 3 datapunt has triangulatie_bronnen` (zie `_DEVELOPER.md` §7).

| Bouwsteen | Voldoet alleenstaande Tier-1? | Voldoet alleenstaande Tier-2? | Triangulatie verplicht? |
|---|---|---|---|
| BV-sleutelformule | ✅ KB BS 29/12/2025 | n.v.t. | nee |
| BV-verminderingen kinderen | ⚠️ alleen via KB-tekst (extractie pending) | mits ≥ 2 Tier-2 convergentie | ja, tot KB-extractie |
| RSZ-werknemer 13,07 % | ✅ socialsecurity.be | n.v.t. | nee |
| Sociale werkbonus 2026 | ✅ Programmawet + KB | n.v.t. | nee |
| Fiscale werkbonus 33,14 % / 52,54 % | ⚠️ KB-tekst | ja, ≥ 2 Tier-2 | ja, voorlopig |
| BBSZ-banden 2026 | ⚠️ RSZ-instructie kw1/2026 nog te fetchen | nee (alleen SSN) | **ja** — info-veld tot bevestigd |
| VAA-bedrijfswagen min/CO2 | ⚠️ AAFisc-circulaire 2026 nog te fetchen | nee (alleen fibofin) | **ja** |
| VAA PC/internet/GSM | ✅ KB 25/11/2017 (statisch) | n.v.t. | nee |
| Forfaitaire beroepskosten €6.070 | ✅ FOD Fin landingspagina | n.v.t. | nee |
| Belastingvrije som €11.180 | ⚠️ via Wolters Kluwer + Practicali + Acerta | ja, drievoudig Tier-2 | nee (drievoudig volstaat) |
| PB-schijven AJ 2027 | ⚠️ FOD Fin-publicatie geïndexeerde bedragen pending | ja, drievoudig Tier-2 | nee (drievoudig volstaat) |
| Indexcoëfficiënt KI 2,3000 | ⚠️ FOD Fin-publicatie pending | ja, viervoudig Tier-2 | nee |
| Gemeentebelasting per gemeente | ❌ geen Tier-1 lijst | ❌ geen volledige Tier-2 lijst | **gemiddelde 7,3 % als parameter** |
| PC 200 eindejaarspremie 1 mnd | ✅ sectorakkoord 18/12/2025 (sfonds200) | n.v.t. | nee |
| PC 200 sectorakkoord-anciënniteit 3 jaar | ✅ sectorakkoord 18/12/2025 | getrianguleerd door Securex, Liantis | nee |

---

## 6. Onderhoudscyclus (wanneer welke bron herchecken)

| Trigger | Wat verifiëren | Welke datapunten | Bron |
|---|---|---|---|
| **Eind december (KB Bijlage III)** | nieuwe BV-coëfficiënten | `bv_*`, alle BV-verminderingen | BS + FOD Fin |
| **Begin januari (geïndexeerde bedragen FOD Fin)** | belastingvrije som, kostenforfait, KI-indexcoëfficiënt, PB-schijven | `pb_schijven_inkomstenjaar_*`, `forfait_beroepskosten_*`, `belastingvrije_som_*`, `fiscaal_indexcoefficient_*` | FOD Fin geïndexeerde bedragen |
| **Begin elk RSZ-kwartaal (1/1, 1/4, 1/7, 1/10)** | RSZ-tarieven, werkbonus, BBSZ-banden, GGMMI-trigger | `rsz_*`, `werkbonus_*`, `bbsz_*` | RSZ administratieve instructies |
| **Spilindex-overschrijding (centenindex)** | sectorale indexering + werkbonus-grenzen herijking | `lonen_pc200_*`, `werkbonus_*` | sfonds200, FOD WASO |
| **Sectorakkoord PC 200 (typisch jan/dec tweejaarlijks)** | premies, voordelen, anciënniteitvoorwaarden | `pc200_*` | sfonds200, ACV-CSC, ACLVB |
| **Programmawet / Wet Diverse Bepalingen (BS)** | structureel: tarief-, plafond- of regime-wijzigingen | brede impact | BS + Tier-2 alerts |
| **Vlaamse Septemberverklaring + federaal begrotingsakkoord (najaar)** | aangekondigde wijzigingen → pending-tabel | nieuwe `[hypothesis]`-datapunten | nieuwsbronnen Tier 2 |
| **AAFisc-circulaire VAA (typisch maart-april)** | bedrijfswagen, huisvesting, verwarming, elektriciteit forfaits | `vaa_*` | FOD Fin VAA-pagina |

**Procedurele regel:** elke update volgt het 8-stappenproces uit `_DEVELOPER.md` §8.2 (oude waarde in `opmerkingen`, nieuwe waarde in `waarde_*`, triangulatie bevestigen, `laatst_bevestigd_op` updaten, `meta.laatste_update` bijwerken, validatie-checks runnen, versioneren in git).

---

## 7. Gemarkeerde gaps & pending bronnen

> Volledige uitwerking met implementatie-impact: zie `gaps_en_pending.md` (apart geleverd document).

**Top gaps op peildatum 2026-05-08:**

1. **BBSZ-tabel kw1/2026** — RSZ-instructie nog niet gestructureerd publiek geverifieerd. Tier-2 SSN alleenstaand → markeer `bbsz_2026_q1` als `mogelijk_verouderd` met kruisverwijzing naar [RSZ administratieve instructies werkgevers](https://www.socialsecurity.be/employer/instructions/).
2. **AAFisc-circulaire VAA 2026** — bedrijfswagen min-VAA (€1.690) en ref-CO2 (58/70 g/km) alleen via fibofin Tier-2. Markeer `vaa_bedrijfswagen_*_2026` als `mogelijk_verouderd`.
3. **Eigen sleutelformule-implementatie** — divergentierisico met FOD Fin Tax-Calc. Mitigatie: in POC-fase 1 alleen UI-link naar FOD Fin-simulator; eigen implementatie pas in fase 2 met 20+ regressietests.
4. **Aanvullende gemeentebelasting per gemeente** — geen Tier-1 machine-leesbare lijst. Aanbevolen aanpak: parameter met default 7,3 % + UI-disclaimer. **Niet** als datapunt in de JSON opnemen.
5. **`pb_schijven_inkomstenjaar_2026`** — huidige status `niet_gevonden`. Op basis van Tier-1 (FOD Fin geïndexeerde bedragen) + drievoudige Tier-2 (Wolters Kluwer, Practicali, NCOI) kan dit naar **`actief`** worden gepromoveerd.
6. **Wetsontwerp Arizona (belastingvrije som €11.180 → €15.300; fiscale werkbonus 35/63 %)** — **NIET** in BS op peildatum. Markeer als `[hypothesis]` / niet implementeren.
7. **Centenindex 2026** — Sociare-prognose: spilindex juli 2026 → eerste centenindex-toepassing september 2026. Voorspelling, niet vaststaand. Volgen via [Sociare](https://www.sociare.be/) en [FOD Economie indexcijfers](https://statbel.fgov.be/).
8. **Auteursrechten IT-sector heringevoerd 1/1/2026** — Wetsontwerp 56/1243; finale BS-publicatie te verifiëren tegen Q3 2026.

---

## 8. Geleverde activa in deze sessie

Alles in `output/`:

| Bestand | Doel |
|---|---|
| `sources_guideline.md` | **Dit document** — centrale bronnengids, triangulatieregels, onderhoudscyclus |
| `01_research_payroll_regelkader_2026.md` | Volledig onderzoeksrapport BV + RSZ + werkbonus + PC 200 sectorakkoord (433 regels, 51 bronnen) |
| `02_research_netto_calculator_ingredienten.md` | Volledig onderzoeksrapport forfaitaire kosten + VAA + maaltijd-/ecocheques + simulators (632 regels, 40 bronnen) |
| `netto_calculator_specificatie.md` | Concrete spec voor de developer — input/output, formules, audit-eisen, testcases |
| `dataset_uitbreiding_voorstel.md` | Voorstel nieuwe datapunten in `pc200_payroll_dataset_2026.json` (schema-conform) |
| `gaps_en_pending.md` | Open vragen, ontbrekende bronnen, implementatie-impact |
| `implementation_roadmap.md` | Gefaseerde aanpak (POC-fase 1 link / POC-fase 2 eigen formule / post-POC) |

---

*Versie 2026-05-08. Bouwt voort op `pc200_payroll_dataset_2026.json`, `_CORE.md`, `_VERIFICATIE.md`, `_DEVELOPER.md` van diezelfde versie. Te onderhouden volgens cyclus §6.*
