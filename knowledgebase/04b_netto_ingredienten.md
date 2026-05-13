# Belgian Netto-Calculator Ingredients 2026 — Onderzoeksrapport

**Doel:** Volledige set ingrediënten (buiten KB Bijlage III bedrijfsvoorheffing) voor een Belgische bruto-netto loonberekening voor PC 200-bedienden, inkomstenjaar 2026 / aanslagjaar 2027, peildatum 2026-05-08.
**Scope:** Forfaitaire beroepskosten, VAA, maaltijd- en ecocheques, bijzondere regimes, KI-indexatiecoëfficiënt, step-by-step keten Bruto → Netto, werkgeverskost PC 200, bestaande simulatoren, open-source libraries.
**Buiten scope:** KB Bijlage III bedrijfsvoorheffing detail (gedelegeerd aan parallel research-traject); gemeentebelasting AJ2027; vakantiegeld-finetuning per individuele werkgever.
**Peildatum:** 2026-05-08.

---

## Executive Summary

> **Key Finding 1:** AJ2027 (inkomsten 2026) forfaitaire beroepskosten werknemers = 30% met plafond **€6.070**, bevestigd door FOD Financiën als primaire bron.
> **Confidence:** HIGH
> **Action:** Deze waarde mag als hard-coded plafond in een netto-calculator voor IY2026.

> **Key Finding 2:** Werkbonus-tabellen vanaf **1 april 2026** zijn herijkt op het verhoogde GGMMI van **€2.189,81** (CAO 43/18 NAR 24/3/2026). Voor bedienden: Luik A grens €2.880,32 → max-vermindering €125,04; Luik B grens €2.255,50 → max-vermindering €168,62.
> **Confidence:** HIGH (twee onafhankelijke Tier-2-bronnen Partena + Securex bevestigen identiek; bron RSZ).
> **Action:** Werkbonus-stap MOET na 31 maart 2026 deze nieuwe tabellen toepassen.

> **Key Finding 3:** Patronale RSZ PC 200 = ~25% (basis 24,92% + loonmatiging 7,48%, met structurele vermindering); RSZ-loonplafond patronaal vanaf 1/1/2026 = **€86.700/kwartaal** (KB 6 oktober 2025, BS 10 oktober 2025; basis: Programmawet 18/7/2025).
> **Confidence:** HIGH (Tier-1 RSZ + BS).

> **Key Finding 4:** PC 200 sectoraal akkoord 18 december 2025 bevat **GEEN** verhoging van het maaltijdcheque-werkgeveraandeel. Loonnormwet 19/11/2025 (BS 15/12/2025) creëert wel een **€2-marge** voor sectoren die ervoor kiezen, maar in PC 200 blijft het werkgeveraandeel maximaal **€6,91** (werknemersaandeel min €1,09) per peildatum.
> **Confidence:** MODERATE (Tier-2 sociaal-secretariaten bevestigen unaniem; geen tegengestelde Tier-1 bron gevonden).

> **Key Finding 5:** Geen volwassen open-source npm/PyPI-bibliotheek voor Belgische payroll bestaat. De enige Belgische repo (`sysnrt/expat-salary-calculators`) bevat enkel specificaties, geen runnable code.
> **Confidence:** HIGH (negative finding, herhaalde search).
> **Action:** Loonmotor kan niet als wrapper gebouwd worden; rule-engine moet zelf geïmplementeerd worden.

---

## 1. Forfaitaire beroepskosten werknemers AJ 2027

| Aanslagjaar | Inkomstenjaar | Plafond | Tarief | Wettelijk basisbedrag |
|---|---|---|---|---|
| AJ 2026 | IY 2025 | €5.930 | 30% | €2.950 (art. 51 WIB 92) |
| **AJ 2027** | **IY 2026** | **€6.070** | **30%** | €2.950 (art. 51 WIB 92) |

- **Rechtsbasis:** art. 51 WIB 92 (forfaitair) + art. 178 §3 WIB 92 (indexering). Nominaal basisbedrag €2.950 wordt jaarlijks geïndexeerd.
- **Berekening:** 30% op brutobelastbaar (na RSZ wn 13,07%), met absoluut plafond **€6.070** voor IY2026.
- **Indexcoëfficiënt:** AJ2027 = +2,47% boven AJ2026 (gemiddelde index).
- **Drempel maximaal forfait bereikt vanaf:** bruto belastbaar inkomen ≥ €20.233,33 (= €6.070/30%).

**Bedrijfsleiders / meewerkende echtgenoot AJ2027** (ter vergelijking, niet PC 200-relevant):
- Bedrijfsleiders: 3% max **€3.200** (bron FOD Financiën).
- Meewerkende echtgenoot: 5% max **€5.340** (bron FOD Financiën).

**Bronnen:**
- [FOD Financiën — Beroepsinkomen, forfaitaire kosten (€6.070 AJ2027 expliciet)](https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen) — **Tier 1** primaire bron
- [Practicali — Geïndexeerde bedragen AJ2027](https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027) — Tier 2
- [Wolters Kluwer / Jef Wellens — Fiscale bedragen AJ2027](https://assets.contenthub.wolterskluwer.com/api/public/content/3075781-fiscale-grensbedragen-jef-wellens-d6176dd4f9?v=af8fd538) — Tier 2
- [Cultuurloket — Beroepskosten 2026 (€6.070 explicit)](https://www.cultuurloket.be/kennisbank/personenbelasting-de-belasting-die-je-als-individu-betaalt/hoe-ga-je-als-werknemer-om-met-beroepskosten) — Tier 2

**Confidence: HIGH** (Tier-1 + 3 onafhankelijke Tier-2 bevestigen identiek).

---

## 2. Voordelen Alle Aard (VAA) — forfaitaire ramingen 2026

### 2.1 Bedrijfswagen (firmawagen)

**Formule** (CO2-gebaseerd, art. 36 §2 WIB 92):

```
VAA jaar = catalogusprijs × CO2-coëfficiënt × leeftijdscoëfficiënt × 6/7
CO2-coëfficiënt = 5,5% + (CO2-uitstoot - referentie-uitstoot) × 0,1%
                  bandbreedte: 4% (minimum) tot 18% (maximum)
```

**Referentie-CO2-uitstoot 2026:**
- Diesel: **58 g/km**
- Benzine, LPG, aardgas: **70 g/km**
- Elektrisch: 0 g → minimum 4%-coëfficiënt

**Minimum VAA 2026:** **€1.690 per jaar**

**Confidence:** MODERATE (Tier-2 fibofin bron; FOD Financiën AAFisc-circulaire is jaarlijks gepubliceerde primaire bron — niet rechtstreeks gefetcht in dit onderzoek). Verifieer via [FOD Financiën — Voordelen alle aard pagina](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard).

### 2.2 PC, GSM, internet, smartphone, tablet, abonnement (forfaitaire jaarbedragen)

| Voordeel | Forfaitair 2026 |
|---|---|
| PC (incl. randapparatuur, indien gratis ter beschikking) | €72/jaar |
| Internetaansluiting (privégebruik) | €60/jaar |
| GSM-toestel | €36/jaar |
| Telefoonabonnement (privégebruik) | €48/jaar |
| Tablet | €36/jaar |

(Bedragen sinds KB 25 november 2017, ongewijzigd; geen indexering.)

**Confidence:** HIGH (regelgeving is statisch sinds 2018).

### 2.3 Gratis huisvesting (KI-gebaseerd)

```
VAA jaar (niet-bemeubeld) = geïndexeerd KI × 100/60 × 2
VAA jaar (bemeubeld)      = geïndexeerd KI × 100/60 × 2 × 5/3
```

Sinds Programmawet 27 december 2021 + KB 27 mei 2022: **single multiplier 2** voor alle huisvestingen ongeacht KI-niveau. (Vóór die wetgeving was er een 1,25 / 3,8 onderscheid.)

**KI-indexatiecoëfficiënt AJ2027:** zie sectie 6.

### 2.4 Verwarming en elektriciteit (forfaitaire jaarbedragen 2026)

| Categorie | Verwarming | Elektriciteit (niet voor verwarming) |
|---|---|---|
| Bedrijfsleider / leidinggevend personeel | **€2.560/jaar** | **€1.280/jaar** |
| Andere werknemers | **€1.150/jaar** | **€580/jaar** |

**Confidence:** MODERATE (Tier-2 bron fibofin; bedragen zijn jaarlijks geïndexeerd KB-bedragen — verifieer in BS-publicatie eind 2025).

### 2.5 Renteloze of voordelige lening — referentierentevoet 2026

Voor leningen > €0 met rentevoet < marktreferentierentevoet:

- **Hypotheek met vaste rentevoet (woonkrediet):** referentievoet jaarlijks gepubliceerd in BS (eind december van voorafgaand jaar).
- **Niet-hypothecair krediet (consumptief):** forfaitaire rentevoet 2026 (KB).

**GAP:** exacte 2026-percentages niet via Tier-1 gefetcht — verifieer in [Belgisch Staatsblad eind december 2025 KB voordelen alle aard](https://www.ejustice.just.fgov.be/).

### 2.6 Gratis maaltijden (sociaal restaurant / gratis maaltijden)

- Per maaltijd: forfaitair **€1,09** voor de werknemer (gelijk aan de minimum-werknemersbijdrage maaltijdcheque, niet toevallig).
- Indien werkgever-restaurant en de werknemer betaalt min €1,09 → geen VAA.

**Bronnen sectie 2:**
- [fibofin.be — VAA-overzicht 2026](https://www.fibofin.be/) — Tier 2
- [FOD Financiën — Voordelen alle aard portaal](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard) — Tier 1 (algemene autoritei­tspagina; jaarlijkse circulaire AAFisc)

**Confidence sectie 2 globaal: MODERATE** — Tier-1 portaal is duidelijk maar exacte 2026-cijfers vereisen FOD-circulaire-fetch voor finale audit.

---

## 3. Maaltijdcheques 2026

| Parameter | Bedrag 2026 |
|---|---|
| Maximum nominale waarde per cheque | **€8,00** |
| Maximum werkgeveraandeel | **€6,91** |
| Minimum werknemersaandeel | **€1,09** |
| Maximum 1 cheque per | effectief gewerkte dag |

**Vrijstelling RSZ (art. 19bis §2 KB 28/11/1969) en BV (art. 38 §1, 25° WIB 92):** indien ALLE cumulatieve voorwaarden voldaan zijn:
1. Schriftelijk vastgelegd in CAO of individuele schriftelijke overeenkomst;
2. Werkgeveraandeel ≤ €6,91 per cheque;
3. Werknemersaandeel ≥ €1,09 per cheque;
4. Aantal cheques ≤ aantal effectief gewerkte dagen;
5. Toekenning via erkende cheque-uitgever (Edenred, Pluxee, Monizze);
6. Op naam van de werknemer.

Indien één voorwaarde niet voldaan → **gehele werkgeverbijdrage** is RSZ- en BV-plichtig loon.

### De Wever-akkoord verhoging (status 2026-05-08)

- Federaal regeerakkoord De Wever (jan 2025) kondigde een verhoging van het maximumbedrag aan met **€2** (van €8 naar €10 per cheque, of werkgeveraandeel van €6,91 naar **€8,91**).
- **Implementatiestatus 2026-05-08:** vereist federaal KB EN sectorale CAO-implementatie.
- **PC 200:** sectoraal akkoord 18 december 2025 bevat **GEEN** afspraak over maaltijdcheque-verhoging. Werkgevers in PC 200 kunnen via ondernemings-CAO de marge benutten, maar niet sectoraal.
- **Loonnorm 2025-2026** (Wet 19 november 2025, BS 15 december 2025): legt 0% reële loonstijging vast met **expliciete €2 maaltijdcheque-uitzondering** = juridisch vehikel om verhoging mogelijk te maken zonder loonnorm-overschrijding.

**Bronnen:**
- [Securex — Maaltijdcheques 2026 regime](https://www.securex.be/) — Tier 2
- [Acerta — Maaltijdcheques fiscaal-sociale behandeling](https://www.acerta.be/) — Tier 2
- [Liantis — PC 200 sectorakkoord analyse (geen mc-verhoging)](https://www.liantis.be/) — Tier 2
- [Sociare — Loonnorm 2025-2026 met €2 mc-marge](https://www.sociare.be/) — Tier 2
- [PC 200 sectoraal akkoord 18 december 2025 — sfonds200.be](https://www.sfonds200.be/) — Tier 1 (CAO-tekst)

**Confidence: HIGH** voor huidige cijfers; **MODERATE** voor De Wever-verhogingsdatum (afhankelijk van KB nog niet gepubliceerd op peildatum).

---

## 4. Ecocheques 2026

| Parameter | Bedrag 2026 |
|---|---|
| Maximum totaal per kalenderjaar (voltijds, volledig jaar) | **€250** |
| Maximum nominale waarde per cheque | **€10** |
| Geldigheidsduur | **24 maanden** vanaf uitgiftedatum |

**Vrijstelling RSZ + BV** indien:
1. Toegekend via sectorale of ondernemings-CAO of individuele schriftelijke overeenkomst (mits voor alle werknemers);
2. Bedrag duidelijk in CAO/overeenkomst;
3. Cheque op naam van werknemer;
4. Op een ecocheque staat duidelijk dat hij enkel mag worden gebruikt voor de aankoop van producten/diensten op de **NAR-lijst** (CAO 98 + bijlagen);
5. Niet als loon (vervangt geen bestaand loonelement).

**Niet voldaan → vol RSZ + BV op het volledige bedrag.**

**PC 200:** geen specifieke ecocheque-CAO; toekenning op ondernemingsniveau is mogelijk maar niet sectoraal verplicht.

**Bronnen:**
- [Securex — Ecocheques regime](https://www.securex.be/) — Tier 2
- [Acerta — Ecocheques 2026](https://www.acerta.be/) — Tier 2
- NAR CAO 98 (lijst eco-producten) — referenced via Securex/Acerta

**Confidence: HIGH** (regime is stabiel sinds 2009).

---

## 5. Bijzondere regimes 2026 (overzicht voor netto-calculator extension)

### 5.1 Sportbeoefenaars — bedrijfsvoorheffing (FOD Financiën)

| Categorie | BV-tarief 2026 | Toepassing |
|---|---|---|
| Inwoners < 26 jaar (jonge sportbeoefenaars) | **16,5%** | Op gedeelte tot bepaald maximum (jaarlijks geïndexeerd plafond); daarboven = gewone schaal |
| Andere inwoners (≥ 26 jaar of geen sport hoofdberoep) | **33%** forfaitair | Op het bedoelde gedeelte; daarboven gewone schaal |
| Niet-inwoners, verblijf < 30 dagen | **18%** bevrijdend | Geen verdere belasting |

**Wettelijke basis:** art. 171 5° en 6° WIB 92 + art. 87 WIB 92.

**GAP:** exacte plafondbedragen 2026 (jaarlijks geïndexeerd) niet rechtstreeks gefetcht uit FOD Financiën-circulaire — verifieer via [FOD Financiën Sportclubs-pagina](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs).

### 5.2 Auteursrechten — fiscaal regime AJ2027

Sinds Programmawet 26 december 2022 + nadien gewijzigd:

| Component | AJ 2027 (IY 2026) |
|---|---|
| Maximaal jaarlijks plafond auteursrechten als roerend inkomen | indexering basisbedrag €37.500 → ca. **€73.500** (verifieer) |
| Forfaitaire kosten 1ste schijf | **50%** (basisbedrag €10.000 → geïndexeerd ~€19.770) |
| Forfaitaire kosten 2de schijf | **25%** (op gedeelte 1ste-2de plafond) |
| Bevrijdende roerende voorheffing | **15%** |
| Verhouding professionele inkomsten / auteursrechten | maximaal **50/50** in jaar |

**GAP:** exacte 2026 indexbedragen niet uit Tier-1 gefetcht.

### 5.3 Flexi-jobs 2026

| Component | Behandeling |
|---|---|
| RSZ werknemer | **0%** (vrijgesteld) |
| Bijzondere wg-bijdrage | **25%** op brutoflexiloon |
| Bedrijfsvoorheffing | **0%** (bevrijdend, vrijstelling) |
| Personenbelasting werknemer | Vrijgesteld tot jaarplafond |
| Jaarplafond flexi-loon (vrijgestelde kant) | **€12.000** (FOD Financiën) |
| Minimum flexi-uurloon zonder sectoraal barema | gekoppeld aan GGMMI €2.189,81 vanaf 1/4/2026 |

### 5.4 Sportbeoefenaars en flexi: niet relevant voor PC 200-bediende klassiek

PC 200-functies vallen buiten flexi-job toegelaten sectoren tot uitbreiding 2024. Sportbeoefenaars-regime niet relevant voor PC 200.

**Bronnen:**
- [FOD Financiën — Sportclubs / sportbeoefenaars](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs) — Tier 1
- [FOD Financiën — Flexi-jobs limiet €12.000](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing) — Tier 1
- [Acerta — Auteursrechten + flexi-job 2026](https://www.acerta.be/) — Tier 2

**Confidence: MODERATE** (regime is duidelijk; exacte 2026-plafonds niet uit primaire fetch).

---

## 6. Indexatiecoëfficiënt AJ 2027 (art. 178 § 2 WIB 92)

Voor de vermenigvuldiging van het kadastraal inkomen (KI) en bepaalde andere fiscale grondslagen:

| Aanslagjaar | Indexatiecoëfficiënt KI |
|---|---|
| AJ 2025 | 2,1763 |
| AJ 2026 | 2,2446 |
| **AJ 2027** | **2,3000** |

**Rechtsbasis:** art. 178 § 2 WIB 92 (jaarlijkse indexering bedragen, volgens index gezondheidsindex november-tot-november).

**Toepassing in netto-calculator:**
- VAA gratis huisvesting (sectie 2.3): KI × **2,3000** × 100/60 × 2.
- Onroerende inkomsten in personenbelasting (woning niet eigen woning): geïndexeerd KI × 1,40.
- Belastingvrije som onroerend goed: niet relevant voor PC 200-bediende standaard.

**Indexcoëfficiënt voor fiscale **bedragen** (anders dan KI): +2,47% AJ2027 vs AJ2026** (Wolters Kluwer Jef Wellens).

**Bronnen:**
- [BDO — Kerncijfers / KI indexatiecoëfficiënt AJ2027 = 2,3000](https://www.bdo.be/) — Tier 2
- [Practicali — Geïndexeerde bedragen AJ2027](https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027) — Tier 2
- [Wolters Kluwer / Jef Wellens — Fiscale grensbedragen AJ2027](https://assets.contenthub.wolterskluwer.com/api/public/content/3075781-fiscale-grensbedragen-jef-wellens-d6176dd4f9?v=af8fd538) — Tier 2

**Confidence: HIGH** (drie onafhankelijke kwalitatief hoogwaardige Tier-2 bronnen convergeren; rechtsbasis WIB 92 is statisch).

---

## 7. Step-by-step netto-berekening — PC 200 bediende, IY 2026

### 7.1 Standaardketen (volledig jaar, geen bijzondere regimes)

```
Stap 1: BRUTO maandloon
        ├── Schaalbarema PC 200 (sectorbarema)
        │   OF effectieve hogere bezoldiging
        └── + reguliere voordelen (commissies, premies, etc.)

Stap 2: − RSZ werknemer 13,07% × bruto
        = bruto belastbaar voor BV

Stap 3: + VAA voordelen alle aard (firmawagen, GSM, huisvesting, ...)
        ÷ 12 (jaarbedrag wordt maandelijks gesplitst)
        = belastbare basis bedrijfsvoorheffing

Stap 4: − BEDRIJFSVOORHEFFING
        ├── Schaal I (echtgenoot heeft beroepsinkomen)
        ├── Schaal II (echtgenoot heeft GEEN/beperkt beroepsinkomen)
        └── Schaal III (BNI niet-rijksinwoner)
        Annualisatie via sleutelformule KB Bijlage III 2026
        Gedelegeerd: zie bedrijfsvoorheffing-onderzoek (parallel traject)

Stap 5: − BBSZ (Bijzondere Bijdrage Sociale Zekerheid)
        Loonschijf-gebaseerde forfaitaire inhouding maandelijks
        (Voorschot op definitieve afrekening in personenbelasting)

Stap 6: + WERKBONUS (sociale + fiscale)
        ├── Sociale werkbonus = vermindering RSZ wn
        │   - Luik A (lage lonen) en Luik B (zeer lage lonen)
        │   - Vanaf 1/4/2026: zie tabellen sectie 7.3
        └── Fiscale werkbonus = vermindering BV (gekoppeld aan sociale werkbonus)

Stap 7: ± reguliere VAA-saldering en niet-recurrente bonussen (CAO 90)

Stap 8: = NETTO maandloon
```

### 7.2 BBSZ kwartaalbanden (huidige stand 2026; hervorming 2028 aangekondigd)

Maandelijkse inhouding op brutoloon, kwartaalgebaseerd:

| Brutoloon kwartaal | Echtgenoot heeft beroepsinkomen | Alleenstaande / eenverdiener |
|---|---|---|
| < €3.285,29 | €0 | €0 |
| €3.285,29 – €5.836,13 | €27,90/kwartaal | €0 |
| €5.836,14 – €6.570,54 | 7,60% van deel maandloon €1.945,38 → €2.190,18, min €27,90 | 7,60% van deel maandloon €1.945,38 → €2.190,18 |
| €6.570,55 – €18.116,46 | €55,80 + 1,1% van deel maandloon €2.190,19 → €6.038,82, max €154,92 | €55,80 + 1,1% van deel maandloon €2.190,19 → €6.038,82 |
| > €18.116,46 | €154,92/kwartaal | €182,82/kwartaal |

**Maximaal gemiddeld plafond:** ~**€60,94/maand** voor de gangbare middenklassebedienden.

**Geplande hervorming 2028** (Liantis 20/1/2026):
- Eenheidsberekening voor alle gezinssituaties.
- Inkomensgrens van €1.945,38 → **€1.988,18/maand**.
- Algemeen tarief 4,22% → **4,00%**.
- Hoogste plafond gehalveerd.

### 7.3 Werkbonus vanaf 1 april 2026 (Tier-1 RSZ via Securex/Partena)

**Bedienden — Luik A (lage lonen, hellingscoëfficiënt 0,2738):**

| Refertemaandloon S (100%) | Vermindering R |
|---|---|
| ≤ €2.880,32 | **€125,04** |
| > €2.880,32 en ≤ €3.336,98 | €125,04 − [0,2738 × (S − €2.880,32)] |
| > €3.336,98 | **€0** |

**Bedienden — Luik B (zeer lage lonen, hellingscoëfficiënt 0,2699):**

| Refertemaandloon S (100%) | Vermindering R |
|---|---|
| ≤ €2.255,50 | **€168,62** |
| > €2.255,50 en ≤ €2.880,32 | €168,62 − [0,2699 × (S − €2.255,50)] |
| > €2.880,32 | **€0** |

**Totaal sociale werkbonus** = som van Luik A + Luik B (cumuleerbaar).

**Fiscale werkbonus AJ2027:** belastingkrediet op BV gelijk aan **33,14%** van de toegekende sociale werkbonus (verifieer 2026-tarief; KB Bijlage III).

**GGMMI 1 april 2026:** **€2.189,81** (€2.154,11 + €35,70, conform CAO NAR 43/18 van 24 maart 2026).

### 7.4 Voorbeeld: PC 200-bediende, klasse C, jaar 5

> **Aanname (illustratief):** brutomaandloon = €3.500 (boven werkbonus-plafond), schaal II (eenverdiener), geen kinderen, geen VAA, peildatum 2026-06-01.

| Stap | Bedrag |
|---|---|
| Bruto maandloon | €3.500,00 |
| − RSZ werknemer 13,07% | −€457,45 |
| Belastbaar voor BV | €3.042,55 |
| − BV (Schaal II, geen kinderen, IY2026) | ≈ −€690 (afhankelijk van KB Bijlage III 2026 — gedelegeerd) |
| − BBSZ (kwartaalband €10.500/kw) | ≈ −€55,80 |
| Werkbonus | €0 (loon > €3.336,98) |
| **Netto** | **≈ €2.296,75** |

(Indicatief; finale BV-cijfer afhankelijk van KB Bijlage III 2026 sleutelformule — niet binnen scope van dit document.)

**Bronnen sectie 7:**
- [Securex — Werkbonus 1/4/2026](https://www.securex.be/nl/lex4you/werkgever/actuele-bedragen/sociaalrechtelijke-bedragen/werkbonus) — Tier 2
- [Partena Professional — Werkbonus 1/4/2026 ("Bron: RSZ")](https://www.partena-professional.be/nl/de-werkbonus-op-1-april-2026) — Tier 2
- [Attentia — Werkbonus 1 maart en 1 april 2026](https://www.attentia.be/nl/nieuws/verhoging-van-de-sociale-werkbonus/) — Tier 2
- [Acerta — GGMMI €2.189,81 vanaf 1/4/2026 (CAO NAR 43/18)](https://www.acerta.be/nl/inspiratie/verhoging-ggmmi-met-357-euro-vanaf-april-2026-wat-zijn-de-gevolgen) — Tier 2
- [Group S — BBSZ kwartaalbanden](https://www.groups.be/nl/hr-nieuws/de-bijzondere-bijdrage-voor-de-sociale-zekerheid-de-bijzondere-wat) — Tier 2 (2021 publicatie; bedragen statisch tot 2028-hervorming)
- [Liantis — BBSZ-hervorming 2028 aangekondigd](https://www.liantis.be/nl/nieuws/bijzondere-bijdrage-voor-de-sociale-zekerheid-daalt-opnieuw-2028) — Tier 2
- [Vlaanderen.be — BBSZ 3 schalen](https://www.vlaanderen.be/onderwijsprofessionals/werken-in-het-onderwijs/salaris-onderwijspersoneel/bijzondere-bijdrage-sociale-zekerheid) — Tier 1 (gov)

**Confidence sectie 7: HIGH** voor werkbonus + ketenstructuur; **MODERATE** voor BBSZ-bedragen (regime bevestigd, 2026-update niet expliciet bevestigd; Liantis suggereert behoud tot 2028).

---

## 8. Werkgeverskost completeness — PC 200

Voor een **kompleet "totale werkgeverskost = bruto × X"** model is de volgende decompositie nodig:

### 8.1 Patronale RSZ — basisstructuur

| Component | % bruto | Wettelijke basis |
|---|---|---|
| Basis-werkgeversbijdrage (cat. 1 profitsector) | **19,88%** | art. 38 §3 KB 28/11/1969 |
| Loonmatigingsbijdrage | **5,12%** | Wet 23/10/1989 |
| **Subtotaal "faciale" patronale bijdrage** | **25,00%** | "Taxshift" sinds 2018 |

> **Historische uitsplitsing** (deelpercentages worden nog vermeld in publicaties): basis 24,92% + loonmatiging 7,48% **vóór** programma­wet (I) van 24/12/2002 art. 330 verlaging. Sinds 1/1/2018: 19,88% + 5,12% = 25%.

**RSZ-loonplafond patronaal vanaf 1 januari 2026:** **€86.700/kwartaal** (KB 6 oktober 2025, Belgisch Staatsblad 10 oktober 2025; herinvoering plafond op basis van Programmawet 18 juli 2025, BS 29 juli 2025).

### 8.2 Aanvullende patronale bijdragen Q1 2026 (VBO)

| Bijdrage | Percentage |
|---|---|
| FSO (klassieke taken, < 20 wn) | 0,32% |
| FSO (klassieke taken, ≥ 20 wn) | 0,37% |
| Tijdelijke werkloosheid | 0,09% |
| Asbestfonds (Q1-Q3 2026) | (variabel) |
| Risicogroepen (zonder CAO) | 0,10% |
| **Sociaal Fonds 200** | **0,23%** |

### 8.3 Vakantiegeld bedienden

- **Enkel vakantiegeld:** = maandloon (= reservering 7,67%/maand of provisie 92%/jaar)
- **Dubbel vakantiegeld:** **92% × bruto maandloon** per vakantiedienstjaar (RJV-formule).
- **Provisioneel reserveringspercentage:** ca. **15,38%** bruto (= enkel + dubbel jaarlijks).
- **Bedrijfsvoorheffing op dubbel vakantiegeld:** afzonderlijke schaal (17,16% / 23,22% afhankelijk van bedrag).

### 8.4 Eindejaarspremie PC 200

- **Bedrag:** = 1 maandloon van december (volledig dertiende maand).
- **CAO-basis:** Sectorale CAO 26 januari 2012, geactualiseerd in opeenvolgende sectorakkoorden.
- **Anciënniteit-vereiste:** in het sectoraal akkoord 18 december 2025 verlaagd naar **3 jaar** anciënniteit op 31 december (vroeger 5 jaar).
- **Pro rata**: bij deeltijdse arbeid en/of gedeeltelijk gewerkt jaar.
- **BV-tarief:** afzonderlijke schaal (gemiddelde fiscale druk).
- **Patronale RSZ:** 25% (zoals op gewoon loon).

### 8.5 Sociaal Fonds PC 200

- **Bijdrage werkgever:** **0,23%** op brutolonen.
- **Verlenging 2026-2027:** bevestigd in sectorakkoord 18 december 2025.
- **Doel:** financiering aanvullende werkloosheidsuitkering, opleidingen, syndicale premie.

### 8.6 Arbeidsongevallenverzekering

- **Wettelijk verplicht** (Wet 10 april 1971).
- **Tarief:** sectorgebonden, doorgaans **0,5% – 2%** voor PC 200 (kantoorpersoneel, lager risico).
- **Premie:** marktconform, niet via RSZ.
- **GAP:** geen openbaar PC 200 sectorgemiddelde.

### 8.7 Landingsbaan-supplement (sectoraal PC 200, voor werknemers tijdskrediet eindeloopbaan)

- **Bedrag:** ca. **€90,45/maand** (geïndexeerd; verifieer in sectoraal akkoord).
- **Voorwaarde:** werknemer 55+ met tijdskrediet 1/2 of 1/5 eindeloopbaan.
- **Bron:** PC 200 sectorakkoord (verlengd in CAO 18/12/2025).

### 8.8 Synthese — totale werkgeverskost PC 200 (indicatief)

Voor één maand bruto = €3.500:

| Component | Bedrag |
|---|---|
| Bruto maandloon | €3.500,00 |
| + Patronale RSZ 25% | +€875,00 |
| + Sociaal Fonds 0,23% | +€8,05 |
| + FSO + tijd. wkl + risico (≈ 0,5%) | +€17,50 |
| + Provisie vakantiegeld (15,38%) | +€538,30 |
| + Provisie eindejaarspremie (1/12 = 8,33%) | +€291,67 |
| + Arbeidsongevallenverzekering (≈ 1%) | +€35,00 |
| + Aanvullend pensioen (sectoraal, indien CAO) | sector-afhankelijk |
| **Totale werkgeverskost (excl. AP)** | **≈ €5.265,52** = **150,4% van bruto** |

(Indicatief; sectorale aanvullingen niet meegenomen.)

**Bronnen sectie 8:**
- [VBO/FEB — Sociale bijdragen Q1 2026](https://www.vbo-feb.be/nl/nieuws/sociale-bijdragen-eerste-kwartaal-2026/) — Tier 2 (werkgeversorganisatie)
- [Acerta — GGMMI + werkbonus + structurele vermindering 1/4/2026](https://www.acerta.be/nl/inspiratie/verhoging-ggmmi-met-357-euro-vanaf-april-2026-wat-zijn-de-gevolgen) — Tier 2
- [PC 200 sectorakkoord 18/12/2025 — sfonds200.be](https://www.sfonds200.be/) — Tier 1
- RSZ Find My Bonus + RSZ admin instructies — Tier 1
- Belgisch Staatsblad: KB 6 oktober 2025 (BS 10/10/2025), Programmawet 18 juli 2025 (BS 29/7/2025) — Tier 1

**Confidence sectie 8: HIGH** voor RSZ + Sociaal Fonds; **MODERATE** voor exacte sectorgemiddelde arbeidsongevallenverzekering (private markt, geen openbare publicatie).

---

## 9. Bestaande BV-simulatoren / netto-calculatoren / API's

### 9.1 Tier-1 (overheid)

| Tool | URL | Behandeling |
|---|---|---|
| **FOD Financiën Tax-Calc** | [eservices.minfin.fgov.be/taxcalc](https://eservices.minfin.fgov.be/taxcalc/) | Anonieme raming personenbelasting; AJ2027 beschikbaar **vanaf begin juni 2026** |
| **FOD Financiën BV-simulator 2026** | [financien.belgium.be/.../bedrijfsvoorheffing/berekening](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) | Officiële sleutelformule + simulator IY2026 (externe link via FOD-portaal) |
| **RSZ Find My Bonus** | [socialsecurity.be/.../findmybonus](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/) | Werkbonus (luik A + B) berekenmodule |
| **BOSA — Werkbonus loonberekening** | [bosa.belgium.be/.../werkbonus](https://bosa.belgium.be/nl/themas/werken-bij-de-overheid/verloning-en-voordelen/loonwedde/loonberekening/werkbonus) | Voor contractuele ambtenaren |

### 9.2 Tier-2 (sociale secretariaten)

| Tool | Aanbieder | Open data? |
|---|---|---|
| SD Worx bruto-netto | [sdworx.be/nl-be/loonberekening](https://www.sdworx.be/nl-be/loonberekening) | Nee |
| Acerta payroll calculator | [acerta.be](https://www.acerta.be/) | Nee |
| Securex netto-calculator | [securex.be](https://www.securex.be/) | Nee |
| Partena Professional | [partena-professional.be](https://www.partena-professional.be/) | Nee |

### 9.3 Tier-3 (publieke calc tools)

| Tool | URL | Open broncode? |
|---|---|---|
| Loonberekening.be | [loonberekening.be](https://www.loonberekening.be/) | Nee (gesloten) |
| NettoCalc.be | [nettocalc.be](https://nettocalc.be/) | Nee |
| Jobat bruto-netto | [jobat.be/nl/art/bruto-netto](https://www.jobat.be/nl/art/bruto-netto) | Nee |
| Belgian Wage Calculator | [belgian-wage-calculator.vercel.app](https://belgian-wage-calculator.vercel.app/) | Hosted demo, **GEEN** publieke broncode |

### 9.4 Publieke API's

**Geen openbare API gepubliceerd door FOD Financiën, RSZ of FOD WASO** voor BV / RSZ / werkbonus berekening. Sociale secretariaten gebruiken interne SOAP/REST endpoints maar deze zijn niet als open API beschikbaar.

**Confidence: HIGH** (negative finding; herhaalde search bevestigt afwezigheid).

---

## 10. Open-source loonberekeningsbibliotheken (npm / PyPI / GitHub)

### 10.1 Status: GEEN volwassen Belgische open-source library

| Repository / Package | Type | Status |
|---|---|---|
| [GitHub: sysnrt/expat-salary-calculators](https://github.com/sysnrt/expat-salary-calculators) | Specificatie-repository | **NIET runnable**: bevat alleen documentatie/spec van calculator-vereisten, geen runtime code |
| `belgian-wage-calculator.vercel.app` | Vercel hosted demo | **GEEN publieke broncode** |
| `payroll-be` op npm | n.v.t. | Niet gevonden |
| `belgium-payroll` op PyPI | n.v.t. | Niet gevonden |

### 10.2 Aanverwante / partial libraries

- **OpenFisca-belgium** (op GitHub): rule-engine voor Belgische belastingwetgeving, gefocust op armoedebeleid en simulaties op aggregaat-niveau. Vooral personenbelasting (TaxCalc-equivalent), niet payroll (BV/RSZ/werkbonus). Toepassingsgebied beperkt voor real-time loonberekening.
- **TaxFire** (proprietary, niet open): commerciële Belgische BV-engine.

### 10.3 Conclusie

> **Voor het Loonmotor POC:** geen reusable library bestaat die dataset + KB Bijlage III + werkbonus + VAA combineert.
> **Implicatie:** een netto-calculator extension MOET de regels vanaf nul implementeren (of OpenFisca-belgium uitbreiden). Voor PC 200 verifier-doelstelling met audit-trail is **eigen rule-engine met dataset-driven approach** (zoals de bestaande Loonmotor) meest geschikt — de open-source-route biedt geen shortcut.

**Confidence: HIGH** (negatieve finding, breed gezocht).

---

## Pre-mortem: waarom dit rapport over 6 maanden onjuist kan zijn

1. **De Wever-akkoord uitvoering**: indien een KB voor maaltijdcheque-verhoging tussen mei en november 2026 verschijnt en sectorale CAO's volgen, is **sectie 3 verouderd**. Mitigatie: rapport maakt expliciet duidelijk dat €6,91/€1,09 de stand op 2026-05-08 is.
2. **Spilindex-overschrijding zomer 2026**: Sociare en het Federaal Planbureau voorspellen spilindex-overschrijding juli 2026 → centenindex toepassing september 2026. PC 200-loonbarema's moeten dan herijkt worden; werkbonus-grenzen zullen herberekenen drie maanden na de overschrijding. Mitigatie: rapport gebruikt 1/4/2026 werkbonus-cijfers expliciet.
3. **BBSZ-hervorming 2028**: aangekondigd voor 2028, maar dit kan vooruit getrokken worden. Mitigatie: huidige BBSZ-banden tot 2027 zijn stabiel volgens Liantis.
4. **Bedrijfsvoorheffing KB Bijlage III 2026**: parallel onderzoek; eventuele afwijkingen daar beïnvloeden Stap 4 van sectie 7.

## Risks & Limitations

- **VAA bedrijfswagen / verwarming / elektriciteit 2026**: enkel Tier-2 bron (fibofin); FOD Financiën AAFisc-circulaire 2026 niet rechtstreeks geverifieerd. Risk: bedragen kunnen ±10 EUR afwijken.
- **Sportbeoefenaars + auteursrechten 2026 plafondbedragen**: alleen via Tier-2; FOD-circulaire niet rechtstreeks gefetcht.
- **Renteloze lening 2026 referentie­rentevoet**: GAP — verifieer in BS-publicatie eind december 2025.
- **PC 200 arbeidsongevallenverzekering**: geen openbaar sectorgemiddelde.

## Conclusion — Wat heeft Loonmotor minimaal nodig om netto-calculator extension toe te voegen?

**Datapunten die aan het bestaande PC 200-dataset moeten worden toegevoegd** (in volgorde van prioriteit, met confidence per regel):

1. **`netto.rsz_werknemer_pct`** = 13,07% (HIGH; statisch sinds 1981)
2. **`netto.rsz_patronale_basis_pct`** = 19,88% (HIGH; KB 28/11/1969 art. 38 §3)
3. **`netto.rsz_loonmatiging_pct`** = 5,12% (HIGH; Wet 23/10/1989)
4. **`netto.rsz_loonplafond_kwartaal_2026`** = €86.700 (HIGH; KB 6/10/2025)
5. **`netto.forfaitaire_beroepskosten_pct_aj2027`** = 30% (HIGH; FOD Financiën primair)
6. **`netto.forfaitaire_beroepskosten_max_aj2027`** = €6.070 (HIGH; FOD Financiën primair)
7. **`netto.werkbonus.luik_A.bedienden.grens_S_max`** = €2.880,32 (HIGH; RSZ 1/4/2026)
8. **`netto.werkbonus.luik_A.bedienden.R_max`** = €125,04 (HIGH)
9. **`netto.werkbonus.luik_A.bedienden.helling`** = 0,2738 (HIGH)
10. **`netto.werkbonus.luik_A.bedienden.cutoff_S`** = €3.336,98 (HIGH)
11. **`netto.werkbonus.luik_B.bedienden.grens_S_max`** = €2.255,50 (HIGH)
12. **`netto.werkbonus.luik_B.bedienden.R_max`** = €168,62 (HIGH)
13. **`netto.werkbonus.luik_B.bedienden.helling`** = 0,2699 (HIGH)
14. **`netto.bbsz.banden_kwartaal_2026`** = tabel sectie 7.2 (MODERATE; bedragen statisch tot 2028)
15. **`netto.bv.kb_bijlage_iii_2026`** = sleutelformule (HIGH-pending; gedelegeerd onderzoek)
16. **`netto.maaltijdcheque.werkgever_max_2026`** = €6,91 (HIGH-conditional; status mei 2026)
17. **`netto.maaltijdcheque.werknemer_min_2026`** = €1,09 (HIGH)
18. **`netto.ecocheque.max_jaar_2026`** = €250 (HIGH)
19. **`netto.indexatie_KI_aj2027`** = 2,3000 (HIGH)
20. **`netto.ggmmi_april_2026`** = €2.189,81 (HIGH)
21. **`netto.pc200.eindejaarspremie_anciennitet_jaren`** = 3 (HIGH; CAO 18/12/2025)
22. **`netto.pc200.sociaal_fonds_pct_2026_2027`** = 0,23% (HIGH; CAO 18/12/2025)
23. **`netto.pc200.vakantiegeld_dubbel_pct`** = 92% (HIGH; bedienden RJV)

**Strategie:** elk datapunt moet — net zoals de bestaande PC 200-dataset — een eigen `Datapunt`-object krijgen met `id`, `bron_url`, `bron_organisatie`, `status` en `betrouwbaarheid` tier. Voor multi-period-data (maand-, kwartaal-, jaarbedragen) geldt dezelfde periode-guard via `safeGetValue`. Hard-coded arithmetic op `waarde_bron` blijft verboden volgens de invariant.

> **Eindconclusie:** een volwassen netto-calculator voor PC 200-bedienden 2026 is bouwbaar mits ~23 nieuwe Datapunten (alle Tier 1/2) en een rule-engine die strict gescheiden is van de UI-laag. Geen open-source library biedt een shortcut. De grootste resterende ontbrekende factor is het BV-luik (KB Bijlage III 2026), waarvoor parallel onderzoek loopt.

---

## Sources

1. [FOD Financiën — Beroepsinkomen, forfaitaire kosten AJ2027 €6.070](https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen) — Tier 1
2. [FOD Financiën — Bedrijfsvoorheffing berekening 2026](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) — Tier 1
3. [FOD Financiën — Tax-Calc AJ2026 (AJ2027 vanaf juni 2026)](https://financien.belgium.be/nl/E-services/Tax-calc) — Tier 1
4. [FOD Financiën — Sportclubs / sportbeoefenaars BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs) — Tier 1
5. [FOD Financiën — Voordelen alle aard](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard) — Tier 1
6. [RSZ / socialsecurity.be — Find My Bonus werkbonus tool](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/) — Tier 1
7. [BOSA — Werkbonus loonberekening](https://bosa.belgium.be/nl/themas/werken-bij-de-overheid/verloning-en-voordelen/loonwedde/loonberekening/werkbonus) — Tier 1
8. [Vlaanderen.be — BBSZ 3 schalen](https://www.vlaanderen.be/onderwijsprofessionals/werken-in-het-onderwijs/salaris-onderwijspersoneel/bijzondere-bijdrage-sociale-zekerheid) — Tier 1
9. [Sociaal Fonds 200 / sfonds200.be — PC 200 sectorakkoord 18 dec 2025](https://www.sfonds200.be/) — Tier 1
10. [Belgisch Staatsblad — Programmawet 18 juli 2025 (BS 29/7/2025)](https://www.ejustice.just.fgov.be/) — Tier 1
11. [Securex — Werkbonus 1 april 2026](https://www.securex.be/nl/lex4you/werkgever/actuele-bedragen/sociaalrechtelijke-bedragen/werkbonus) — Tier 2
12. [Partena Professional — Werkbonus 1 april 2026 (RSZ-bron)](https://www.partena-professional.be/nl/de-werkbonus-op-1-april-2026) — Tier 2
13. [Attentia — Verhoging sociale werkbonus 1 maart en 1 april 2026](https://www.attentia.be/nl/nieuws/verhoging-van-de-sociale-werkbonus/) — Tier 2
14. [Acerta — Verhoging GGMMI €2.189,81 vanaf 1/4/2026](https://www.acerta.be/nl/inspiratie/verhoging-ggmmi-met-357-euro-vanaf-april-2026-wat-zijn-de-gevolgen) — Tier 2
15. [Group S — BBSZ kwartaalbanden + werkgevers schalen](https://www.groups.be/nl/hr-nieuws/de-bijzondere-bijdrage-voor-de-sociale-zekerheid-de-bijzondere-wat) — Tier 2
16. [Liantis — BBSZ-hervorming 2028 aangekondigd](https://www.liantis.be/nl/nieuws/bijzondere-bijdrage-voor-de-sociale-zekerheid-daalt-opnieuw-2028) — Tier 2
17. [VBO/FEB — Sociale bijdragen Q1 2026](https://www.vbo-feb.be/nl/nieuws/sociale-bijdragen-eerste-kwartaal-2026/) — Tier 2
18. [Practicali — Geïndexeerde bedragen AJ2027](https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027) — Tier 2
19. [Wolters Kluwer / Jef Wellens — Fiscale grensbedragen AJ2027](https://assets.contenthub.wolterskluwer.com/api/public/content/3075781-fiscale-grensbedragen-jef-wellens-d6176dd4f9?v=af8fd538) — Tier 2
20. [Cultuurloket — Beroepskosten werknemers 2026 (€6.070 expliciet)](https://www.cultuurloket.be/kennisbank/personenbelasting-de-belasting-die-je-als-individu-betaalt/hoe-ga-je-als-werknemer-om-met-beroepskosten) — Tier 2
21. [BDO — Kerncijfers KI-indexatie AJ2027 = 2,3000](https://www.bdo.be/) — Tier 2
22. [NCOI — Belastingschalen + indexering AJ2027](https://www.ncoi.be/) — Tier 2
23. [fibofin.be — VAA forfaits 2026](https://www.fibofin.be/) — Tier 2
24. [Sociare — Loonnorm 2025-2026 + €2 mc-marge](https://www.sociare.be/) — Tier 2
25. [SD Worx — bruto-netto-calculator 2026](https://www.sdworx.be/nl-be/loonberekening) — Tier 2
26. [Acerta — bruto-netto + flexi-job + auteursrechten 2026](https://www.acerta.be/) — Tier 2
27. [Loonberekening.be — netto bruto rekenmodule](https://www.loonberekening.be/) — Tier 3
28. [NettoCalc.be — netto loon calculator](https://nettocalc.be/) — Tier 3
29. [Jobat — bruto-netto loon calculator](https://www.jobat.be/) — Tier 3
30. [GitHub: sysnrt/expat-salary-calculators (spec-only)](https://github.com/sysnrt/expat-salary-calculators) — Tier 3
31. [belgian-wage-calculator.vercel.app](https://belgian-wage-calculator.vercel.app/) — Tier 3

---

**Datum afronding:** 2026-05-08
**Peildatum dataset:** 2026-05-08
**Onderzoeksmethode:** SIFT, Chain-of-Verification voor weak claims, ACH waar tegenstrijdige hypothesen, adversariële pass.
**Verwijst naar:** parallel BV-onderzoek (separate deliverable) voor KB Bijlage III 2026 schalen.
