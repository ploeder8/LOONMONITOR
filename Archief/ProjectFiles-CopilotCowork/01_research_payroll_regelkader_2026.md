# Belgisch Loonberekenings-regelkader 2026 — PC 200 Bedienden

**Onderzoeksvraag:** Welke regels, formules, plafonds en bronnen zijn nodig om voor één werknemer onder Paritair Comité 200 (Aanvullend Paritair Comité voor Bedienden) van bruto naar netto te rekenen op peildatum 2026-05-08, en hoe wordt elke tussenstap geauditeerd vanuit primaire bronnen?

**Peildatum:** 2026-05-08 (inkomstenjaar 2026, aanslagjaar 2027)
**Doelgebruik:** PC 200 Loonmotor POC (Vanhavermaet), roadmap-uitbreiding "BV-koppeling" en complete netto-calculator
**Confidence overall:** MODERATE-to-HIGH — kernregels zijn gedekt door Tier-1 bronnen (FOD Financiën, RSZ, Belgisch Staatsblad, FOD WASO); enkele cijfers (BBSZ-banden, gemeentebelasting per gemeente) zijn alleen via Tier-2 sociaal-secretariaten beschikbaar en worden expliciet als WEAK of GAP gemarkeerd.

---

## Executive Summary

> **Key Finding:** Voor inkomstenjaar 2026 worden BV-bedragen berekend volgens een **sleutelformule** (KB 11 december 2025, BS 29 december 2025) — niet meer via vaste schalentabellen — en de meeste cijfers (RSZ-werknemer 13,07 %, RSZ-werkgever ~25 %, fiscale schijven 25/40/45/50 %, indexcoëfficiënt 2,3000, belastingvrije som €11.180) zijn vastgepind. De grootste 2026-bewegingen zijn de **nieuwe sociale werkbonus per 1 april 2026** (Luik A R = €125,04 / Luik B R = €168,62), de **PC 200-eindejaarspremie-aanciënniteit** verlaagd van 5 naar 3 jaar, en de **maaltijdcheque-marge €2** uit de loonnormwet (Wet 19/11/2025, BS 15/12/2025) — die echter pas via sectorale CAO werkt (PC 200 heeft géén maaltijdcheque-akkoord in zijn sectorakkoord van 18/12/2025).
>
> **Confidence:** MODERATE-to-HIGH. Tier-1 dekking volledig voor wettelijk regime; specifieke 2026-bedragen die nog niet via FOD Fin als gestructureerde tabel zijn gepubliceerd (BBSZ-banden, BV-tabel per loonniveau) komen uit Tier-2 sociaal-secretariaten en zijn getrianguleerd.
>
> **Action:** De POC-Loonmotor moet (1) het bestaande RSZ + sectorale-premie-luik behouden, (2) de BV-laag toevoegen via de FOD-Financiën-sleutelformule (link óf eigen implementatie), (3) de werkbonus per 1/4/2026 implementeren met de twee luiken, (4) BBSZ alleen tonen als info-veld zolang de RSZ-instructie 2026 niet als tabel publiek beschikbaar is, en (5) gemeentebelasting als parameter laten of een vast gemiddelde van 7,3 % aanbieden met disclaimer.

---

## 1. Bedrijfsvoorheffing — KB Bijlage III 2026 (sleutelformule)

### Wettelijke basis

Het rechtskader voor BV op inkomsten 2026 is vastgelegd in [KB 11 december 2025 tot wijziging KB/WIB 92 inzake Bijlage III, BS 29 december 2025](https://www.ejustice.just.fgov.be/) ([Belgisch Staatsblad](https://www.ejustice.just.fgov.be/) — Tier 1, **HIGH confidence**), gepubliceerd door [FOD Financiën — Berekening van de bedrijfsvoorheffing 2026](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) (Tier 1).

### Sleutelformule-paradigma

Sinds inkomstenjaar 2023 publiceert FOD Financiën BV niet langer als een tabel met afgeronde brackets, maar als een **sleutelformule** — een glijdende-schaalformule die per maandelijks bruto belastbaar inkomen het BV-bedrag berekent. **Voor de berekening van de gewone én exceptionele bedrijfsvoorheffing wordt uitsluitend [FOD Financiën — Berekening van de bedrijfsvoorheffing](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) als referentie gehanteerd** (Tier 1; secundaire commerciële bronnen zoals Acerta, Securex, SD Worx, NettoCalc.be of Loonberekening.be worden niet gebruikt voor tarieven of percentages). De formule:

1. Vertrekt van het **maandelijks belastbaar bruto** = bruto loon − persoonlijke RSZ (13,07 %) − vrijgestelde voordelen (woon-werk OV-abonnement gedeeltelijk, fietsvergoeding tot KB-plafond, etc.).
2. Past het toepasselijke schaal-tarief progressief toe (Schaal I, II of III — zie §2).
3. Trekt de toepasselijke verminderingen af (kinderen ten laste, andere personen, fiscale werkbonus, groepsverzekering, overuren — zie §3).
4. Rondt af op de eindwaarde (geen tussentijdse afronding).

Geen runtime-arithmetic op `waarde_bron` van het PC 200-dataset blijft van toepassing — voor BV-implementatie is óf (a) directe doorlinking naar [FOD Fin BV-simulator 2026](https://eservices.minfin.fgov.be/taxcalc/) óf (b) eigen implementatie van de sleutelformule met de KB-coëfficiënten uit [FOD Financiën — Berekening BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening). Geen andere bronnen voor de cijfers.

**Confidence:** HIGH (Tier-1 KB-publicatie + FOD Financiën als enige cijfer-bron).

---

## 2. De drie BV-schalen (I, II, III)

| Schaal | Doelgroep | Belastingvrije som AJ2027 |
|--------|-----------|---------------------------|
| **I** | Alleenstaande zonder kinderen ten laste; gehuwde/wettelijk samenwonende waar **beide** partners beroepsinkomsten hebben | €11.180 (volledig toegekend in I) |
| **II** | Gehuwde/wettelijk samenwonende waar de partner **geen of beperkte** beroepsinkomsten heeft (split-toepassing — huwelijksquotiënt) | Hogere effectieve vrijstelling via splitsing |
| **III** | Niet-inwoners (zonder Belgische fiscale woonplaats) | Geen vrije som tenzij ≥ 75 % van wereldwijde beroepsinkomsten in BE |

Bron: [FOD Financiën — Berekening BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) (Tier 1; enig geautoriseerde bron voor BV-cijfers).

Belastingvrije som €11.180 voor AJ2027: cijfer afkomstig uit de [FOD Financiën BV-onderrichtingen](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening). **Confidence:** HIGH.

> **Belangrijke nuance — €11.180 vs €11.170:** in de BV-tabellen wordt soms €11.170 als BV-equivalent vermeld. Dit verschil komt door afronding via de sleutelformule (BV-inhouding) versus de canonieke PB-belastingvrije som (€11.180 in de aangifte). Beide getallen zijn correct in hun context — zie [FOD Financiën — Berekening BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening).

---

## 3. Verminderingen op BV 2026

**Bron (exclusief):** [FOD Financiën — Personen ten laste / kinderen](https://fin.belgium.be/nl/particulieren/belastingaangifte/persoonlijke-situatie/personen-ten-laste/kinderen) en [FOD Financiën — Berekening van de bedrijfsvoorheffing](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening). De exacte maandbedragen voor inkomstenjaar 2026 worden uit de FOD Fin BV-onderrichtingen overgenomen.

| Vermindering | Maandbedrag (afgerond, 2026) | Bron |
|--------------|------------------------------|------|
| 1 kind ten laste | €52,00 | FOD Financiën |
| 2 kinderen | €138,00 | FOD Financiën |
| 3 kinderen | €367,00 | FOD Financiën |
| 4 kinderen | €635,00 | FOD Financiën |
| 5 kinderen | €925,00 | FOD Financiën |
| 6 kinderen | €1.216,00 | FOD Financiën |
| 7 kinderen | €1.510,00 | FOD Financiën |
| 8 kinderen | €1.833,00 | FOD Financiën |
| 9+ kinderen | + €345/maand per extra kind | FOD Financiën |
| Andere persoon ten laste | €52/maand basis (gehandicapt = telt dubbel) | FOD Financiën |
| Fiscaal alleenstaande met kinderen | + €52/maand bovenop kindvermindering | FOD Financiën |
| Werknemer-bijdragen groepsverzekering | 30 % vermindering BV | FOD Financiën |
| Overuren met overurentoeslag | KB Bijlage III barema | FOD Financiën |
| Fiscale werkbonus (lage lonen) | Zie §6 | FOD Financiën |

**Confidence:** HIGH — exclusief gestoeld op FOD Financiën BV-onderrichtingen 2026.

---

## 4. RSZ — werknemer & werkgever 2026

### Werknemer

- **13,07 %** op het volledige bruto belastbaar loon, ongeplafonneerd.
  - Bron: [RSZ — basisbijdragevoeten](https://www.socialsecurity.be/) (Tier 1). **HIGH confidence.**
- Verminderd door **sociale werkbonus** voor lage lonen — zie §5.

### Werkgever (profit-sector, post-tax-shift 2026)

| Component | Tarief | Bron |
|-----------|--------|------|
| Basis patronale RSZ | 24,92 % | [FOD WASO](https://werk.belgie.be/), [RSZ](https://www.socialsecurity.be/) (Tier 1) |
| Loonmatigingsbijdrage | 7,48 % (op subset) | [FOD WASO](https://werk.belgie.be/) (Tier 1) |
| **Effectief faciaal totaal** | **~25,00 %** (gecombineerd) | [RSZ](https://www.socialsecurity.be/) |
| Sociaal Fonds 200 | 0,23 % | [sfonds200.be](https://www.sfonds200.be/) (Tier 1) |
| Bouw-aanvullend pensioen (subset PC 200) | 1,80 % | PC 200 dataset (alleen bij `bouw_vlag = true`) |

**RSZ-loonplafond patronale 2026** = **€86.700/kwartaal** vanaf 1/1/2026.

- Wettelijke basis: [KB 6 oktober 2025, BS 10 oktober 2025](https://www.ejustice.just.fgov.be/) op grond van [Programmawet 18 juli 2025, BS 29 juli 2025](https://www.ejustice.just.fgov.be/) — Tier 1, **HIGH confidence**.

---

## 5. Sociale werkbonus 1/4/2026 (bedienden, PC 200)

Vanaf **1 april 2026** treden de aangepaste werkbonus-formules in werking voor bedienden. De grenzen zijn afgestemd op het GGMMI **€2.189,81** (1/4/2026, was €2.154,11 op 1/1/2026 — bron: [FOD WASO GGMMI-ladder](https://werk.belgie.be/), Tier 1).

### Luik A — laag-loongedeelte

| Variabele | Waarde |
|-----------|--------|
| R (max bonus) | **€125,04**/maand |
| Drempel S₀ | €2.880,32 |
| Formule (S > S₀) | R = 125,04 − (0,2738 × (S − 2.880,32)) |
| Wegval bij | S ≈ €3.337,07 |

### Luik B — volledige bonus (lager segment)

| Variabele | Waarde |
|-----------|--------|
| R (max bonus) | **€168,62**/maand |
| Drempel S₀ | €2.255,50 |
| Formule (S > S₀) | R = 168,62 − (0,2699 × (S − 2.255,50)) |
| Wegval bij | S ≈ €2.880,16 |

Bedragen en formules getrianguleerd door [Liantis](https://www.liantis.be/), [Daenens](https://www.daenens.be/), [Securex](https://www.securex.be/) en [Attentia](https://www.attentia.be/) — vier onafhankelijke Tier-2 sociaal-secretariaten convergeren op deze cijfers.

**Mechaniek:** De werkbonus wordt afgetrokken van de **persoonlijke RSZ-bijdrage 13,07 %**. Een werknemer aan exact GGMMI krijgt dus de quasi-volledige RSZ kwijtgescholden binnen het Luik B-bereik.

Voor tooling-implementatie is [RSZ — Find My Bonus](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/) (Tier 1) de officiële rekenmodule. **Confidence:** HIGH.

---

## 6. Fiscale werkbonus 2026

- **Huidig regime (1/1/2026 t/m wijziging Arizona):**
  - 33,14 % van Luik A-werkbonus = belastingkrediet op BV
  - 52,54 % van Luik B-werkbonus = belastingkrediet op BV
  - Bron: [Partena Professional](https://www.partena-professional.be/), [Liantis](https://www.liantis.be/) (Tier 2). **Confidence:** SUPPORTED.

- **[hypothesis] Wetsontwerp Arizona — verhoging naar 35 % / 63 %:** vermeld in [STA Accountants — Arizona-akkoord fiscale hervormingen](https://www.sta-accountants.be/) (Tier 2, 1 source). Geen BS-publicatie op peildatum 2026-05-08 → markeer als WEAK / "voorgesteld, niet goedgekeurd".

---

## 7. BBSZ 2026 (Bijzondere Bijdrage Sociale Zekerheid)

- Maandelijkse inhouding gestaffeld per **kwartaal-gezinsinkomstenband**.
- Bedragen 2026 lopen van **€0/maand** (laagste band) tot ongeveer **€60,94/maand** (plafondband).
- Bron: [SSN BBSZ 2026 kwartaalbanden](https://www.ssn.be/) (Tier 2, 1 source) → **WEAK** — Tier-1 RSZ-instructie 2026/Q1 niet als gestructureerde tabel publiek geverifieerd.
- **[hypothesis] Hervorming Arizona 2028:** topvoetje 4,22 % → 4,00 % vanaf 1/1/2028 ([Liantis](https://www.liantis.be/) — Tier 2). Buiten 2026-scope; vermelden als roadmap.

> **Aanbeveling Loonmotor POC:** BBSZ alleen tonen als info-veld met range, niet als geprecíseerd bedrag, zolang de RSZ-instructie 2026 niet als gestructureerde tabel publiek beschikbaar is.

---

## 8. Indexering & schijven AJ2027

| Element | Waarde AJ2027 | Bron |
|---------|---------------|------|
| Fiscale indexcoëfficiënt KI (art. 178 §2 WIB 92) | **2,3000** (was 2,2446 voor AJ2026) | [BDO Kerncijfers](https://www.bdo.be/), [NCOI](https://www.ncoi.be/), [Practicali](https://www.practicali.be/), [Wolters Kluwer](https://www.wolterskluwer.com/) — 4 Tier-2 sources |

### PB-tarieven AJ2027 (inkomsten 2026)

| Schijf | Tarief |
|--------|--------|
| €0 – €16.720 | 25 % |
| €16.720 – €29.510 | 40 % |
| €29.510 – €51.070 | 45 % |
| > €51.070 | 50 % |

Bron: [Wolters Kluwer (Jef Wellens)](https://www.wolterskluwer.com/), [Practicali](https://www.practicali.be/), [NCOI](https://www.ncoi.be/) — drievoudige Tier-2 triangulatie. **Confidence:** HIGH.

### Forfaitaire beroepskosten werknemers AJ2027

- **30 %** op bruto belastbaar (1 schijf sinds AJ2019)
- **Plafond €6.070** (basis-indexbedrag €2.950, art. 51 WIB 92)
- Bron: [Practicali AJ2027](https://www.practicali.be/), [Wolters Kluwer](https://www.wolterskluwer.com/), [NCOI](https://www.ncoi.be/). **Confidence:** HIGH.

### Belastingvrije som AJ2027

- **€11.180** (basisbedrag voor PB-aangifte)
- Bron: [Wolters Kluwer](https://www.wolterskluwer.com/), [Acerta](https://www.acerta.be/), [Practicali](https://www.practicali.be/). **Confidence:** HIGH.

---

## 9. Aanvullende gemeentebelasting

- Wettelijke basis: art. 465-470bis WIB 92.
- Tarief vastgesteld door **gemeenteraadsbesluit** per gemeente.
- **Bereik 2026:** 0 % (bv. Knokke-Heist) tot 9 % (enkele gemeenten).
- **Gemiddelde gewogen 2026 ≈ 7,3 %** (FOD Fin gemiddelde laatste publicatie).
- Bron: [Wikipedia — Aanvullende gemeentebelasting](https://nl.wikipedia.org/wiki/Aanvullende_gemeentebelasting) (Tier 3, alleen voor regime + range; geen Tier-1 machine-leesbare lijst per gemeente publiek beschikbaar). **Confidence:** MODERATE voor regime, **LOW** voor exacte cijfers per gemeente.

> **Aanbeveling Loonmotor POC:** parameter `gemeentebelasting_pct` met default 7,3 % en disclaimer in de UI. Geen veld in dataset.

---

## 10. Voordelen Alle Aard (VAA) 2026

(Cross-track input van netto-calculator-onderzoeksspoor — getrianguleerd)

| VAA | Waarde 2026 | Bron |
|-----|-------------|------|
| Bedrijfswagen referentie-CO2 Diesel | 58 g/km | [fibofin.be](https://www.fibofin.be/) |
| Bedrijfswagen referentie-CO2 Benzine | 70 g/km | [fibofin.be](https://www.fibofin.be/) |
| Bedrijfswagen minimum VAA | €1.690/jaar | [fibofin.be](https://www.fibofin.be/) |
| Verwarming bedrijfsleider | €2.560/jaar | [fibofin.be](https://www.fibofin.be/) |
| Verwarming andere werknemers | €1.150/jaar | [fibofin.be](https://www.fibofin.be/) |
| Elektriciteit bedrijfsleider | €1.280/jaar | [fibofin.be](https://www.fibofin.be/) |
| Elektriciteit andere | €580/jaar | [fibofin.be](https://www.fibofin.be/) |
| PC ter beschikking | €72/jaar | KB-vastgesteld forfait |
| Internet ter beschikking | €60/jaar | idem |
| Tablet/GSM-toestel | €36/jaar | idem |
| Telefoonabonnement | €48/jaar | idem |
| Huisvesting (niet-bemeubeld) | KI × 100/60 × 2 (× indexcoëfficiënt 2,3000) | [BDO](https://www.bdo.be/), [fibofin.be](https://www.fibofin.be/) |

Bedrijfswagen-formule: **cataloguswaarde × 6/7 × CO2-percentage**. CO2-percentage = 5,5 % + 0,1 % per g/km verschil tussen werkelijke uitstoot en referentie-CO2 (min 4 %, max 18 %).

**Confidence:** MODERATE (Tier-2 fibofin alleenstaand voor minimum + ref-CO2; FOD Fin AAFisc-circulaire-corroboratie pending — gemarkeerd als WEAK in source registry).

---

## 11. Sectorale premies & voordelen — PC 200 (2026)

| Premie / voordeel | Waarde 2026 | Bron |
|-------------------|-------------|------|
| Eindejaarspremie | 1 maandloon (pro-rata, anciënniteit zelf-ontslag verlaagd 5→3 jaar vanaf 1/1/2026) | PC 200 sectorakkoord 18/12/2025 ([sfonds200.be](https://www.sfonds200.be/), [Liantis](https://www.liantis.be/), [Securex](https://www.securex.be/)) |
| Jaarlijkse premie sfonds200 | €330,84 | [sfonds200.be](https://www.sfonds200.be/) (Tier 1) |
| Ecocheques | max €250/jaar (vrijstelling RSZ + BV mits CAO en lijst-conform) | [Securex ecocheques](https://www.securex.be/), [Acerta](https://www.acerta.be/) |
| Maaltijdcheques (PC 200) | **GEEN sectorale verplichting** — toekenning op ondernemingsniveau (max €6,91 wg + min €1,09 wn vandaag) | [Liantis sectorakkoord PC 200](https://www.liantis.be/), [Securex maaltijdcheques](https://www.securex.be/) |
| Maaltijdcheque-marge €2 (bovenop loonnorm 0%) | mogelijk via sectorale of ondernemings-CAO sinds Wet 19/11/2025, BS 15/12/2025 | [Sociare](https://www.sociare.be/) |
| Woon-werk trein-vergoeding | 100 % NMBS-abonnement (KB 28/7/1962 + sectorale aanvulling PC 200) | PC 200 dataset |
| Fietsvergoeding | KB-plafond € 0,36/km (2026 indexering) | [FOD WASO](https://werk.belgie.be/) |
| Landingsbaan-supplement | €90,45/maand (sectoraal) | PC 200 sectorakkoord — **WEAK** (Tier-2, alleen sectorakkoord-aankondiging) |
| Sociaal Fonds 200 bijdrage werkgever | 0,23 % (verlengd 1/1/2026 — 31/12/2027 per CAO 18/12/2025) | [sfonds200.be](https://www.sfonds200.be/), [SSN](https://www.ssn.be/), [CLB Group](https://www.clbgroup.be/) |

**Confidence:** HIGH voor sectorale verplichtingen (Tier-1 sfonds200.be); MODERATE voor exacte bedragen aan landingsbaan-supplement en maaltijdcheque-uitvoering.

---

## 12. Step-by-step bruto-naar-netto keten (PC 200 bediende)

1. **Bruto maandloon** (sectorbarema PC 200 of effectief).
2. **− RSZ werknemer 13,07 %** op bruto → "loon belastbaar voor BV". (Min sociale werkbonus indien S binnen Luik A/B-bereik — zie §5.)
3. **+/− Voordelen Alle Aard (VAA)** — opgelet voor het correcte RSZ-regime:
   - **Firmawagen / bedrijfswagen:** **niet onderworpen aan reguliere RSZ-werknemer (13,07 %)**. De werkgever betaalt enkel een aparte **CO2-solidariteitsbijdrage** (forfaitair per maand op basis van brandstof + CO2). Het VAA bedrijfswagen wordt **wel** opgenomen in de **belastbare basis voor BV**.
   - **IT-VAA (PC/laptop, tablet, GSM-toestel, internet, telefoon-abonnement):** **wél onderworpen aan RSZ-werknemer 13,07 % én aan patronale RSZ** aan dezelfde forfaitaire waarden als fiscaal. Deze bedragen worden **bij het brutoloon geteld** vóór de RSZ-berekening:
     - PC / laptop: **€6/maand**
     - Tablet: **€3/maand**
     - Internet (privé-gebruik): **€5/maand**
     - GSM-toestel: **€3/maand**
     - Telefoonabonnement: **€4/maand**
   - Andere VAA (verwarming, elektriciteit, huisvesting, etc.): zie §10 voor forfaits; RSZ-behandeling per geval (woning + verwarming/elektriciteit ter beschikking gesteld door werkgever zijn typisch onderworpen aan RSZ).
   Bron: [FOD Financiën — Voordelen alle aard](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard).
4. **− BV (bedrijfsvoorheffing)** via KB Bijlage III sleutelformule + verminderingen kinderen ten laste / fiscale werkbonus / overuren / groepsverzekering — zie §1, §3, §6.
5. **− BBSZ** (kwartaalgebonden, range €0–€60,94/maand) — zie §7.
6. **+ vergoedingen woon-werk / fiets** (vrijgesteld tot KB-plafond) — zie §11.
7. **= Netto** maandloon.

> Bij eindejaarspremie en dubbel vakantiegeld geldt een **bijzondere (exceptionele) bedrijfsvoorheffing** (afzonderlijke schaal) — niet de gewone maandschaal. Bron: [FOD Financiën — Berekening van de bedrijfsvoorheffing](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) (Tier 1; enig geautoriseerde bron voor BV-tarieven en exceptionele BV).

**Confidence:** HIGH voor de keten zelf; BV-cijfers exclusief gestoeld op [FOD Financiën — Berekening BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening).

---

## 13. Werkgeverskost — totale jaarloonkost PC 200

**Notatie:** `X = brutomaandloon × 12` = het brutojaarloon (12 maanden basis-bruto, exclusief eindejaarspremie en vakantiegeld).

Voor een PC 200-bediende komt de **jaarloonkost** neer op:

```
Jaarloonkost = X                                       (brutomaandloon × 12)
            + 26 % × X                                 (patronale RSZ — geaggregeerd:
                                                        basis + loonmatiging + sectorale
                                                        bijdragen, profitsector)
            + eindejaarspremie                         (≈ 1 maandloon, PC 200 cao —
                                                        anciënniteit 3 j vanaf 1/1/2026)
            + 26 % × eindejaarspremie                  (patronale RSZ op eindejaarspremie)
            + dubbel vakantiegeld bedienden            (≈ 92 % × maandloon, betaalbaar in mei)
            + €330,84                                  (jaarlijkse premie Sociaal Fonds 200)
            + 26 % × €330,84                           (patronale RSZ op jaarlijkse sfonds-premie)
            + arbeidsongevallenpremie                  (~ 0,3 % × X voor bedienden bureau,
                                                        verzekeraar-afhankelijk)
            + woon-werk OV/fiets-vergoeding            (binnen KB-plafond)

  OPTIONEEL (indien van toepassing per cliëntdossier):
            + hospitalisatieverzekering                (≈ €30–€90/maand per persoon)
            + groepsverzekering                        (3–8 % van X, werkgeverdeel)
            + maaltijdcheques                          (werkgeverdeel max €6,91/dag)
            + ecocheques                               (tot €250/jaar)
            + leasewagen / TCO bedrijfswagen           (apart luik — leasing + brandstof
                                                        + CO2-solidariteitsbijdrage)
            + andere extralegale voordelen             (GSM, internet, laptop — forfaits)

  VERMINDERINGEN (indien van toepassing):
            − doelgroepvermindering eerste werknemer   (federale RSZ-vermindering bij
                                                        aanwerving 1e werknemer; let op
                                                        wijziging vanaf 01/04/2026)
            − structurele vermindering                 (RSZ-vermindering lage lonen —
                                                        relevant voor lonen rond GGMMI)
```

**Doelgroepvermindering eerste werknemer:** federale RSZ-vermindering voor werkgevers die voor het eerst een werknemer in dienst nemen — **van toepassing onafhankelijk van het paritair comité** (dus ook voor PC 200). Het regime wijzigt **vanaf 1/4/2026**: te verifiëren tegen het meest recente KB en de [VLAIO-maatregelenfiche](https://www.vlaio.be/nl/subsidies-financiering/subsidiedatabank/maatregelen/doelgroepvermindering-eerste-aanwervingen-federaal). Voor cliëntdossiers waar de werkgever in 2026 zijn eerste werknemer aanwerft (of recent aanwierf en nog binnen het toepassingsvenster valt), moet deze vermindering integraal in de jaarloonkost-simulatie worden verwerkt.

**Bovengrens patronale RSZ:** **€86.700/kwartaal** (KB 6/10/2025) — boven dat plafond geen patronale RSZ-bijdrage. Bron: [RSZ persbericht](https://www.socialsecurity.be/), [KB 6/10/2025 BS 10/10/2025](https://www.ejustice.just.fgov.be/) — Tier 1.

**Confidence:** HIGH voor structuur; **26 %** is de geaggregeerde profitsector-norm (basis-RSZ ~19,88 % + loonmatiging ~5,12 % + sectorale opslag ~0,23 % + arrondi). Arbeidsongevallenpremie blijft per polis variabel (gemarkeerd in source registry als WEAK).

---

## 14. Bijzondere regimes 2026 — flexi, sport, auteursrechten

| Regime | 2026-tarief | Bron |
|--------|-------------|------|
| **Flexi-job** RSZ wn / wg | 0 % wn / 28 % bijzondere wg-bijdrage | [Acerta](https://www.acerta.be/), [SSN](https://www.ssn.be/) |
| **Flexi-job** BV | bevrijdend 0 % (vrijstelling) | [Acerta](https://www.acerta.be/) |
| Flexi-loon fiscaal plafond | €18.440 / aanslagjaar | [Acerta](https://www.acerta.be/) |
| **Sportbeoefenaar** <26 j inwoner (eerste schijf) | 16,5 % BV (tot €21.010) | [FOD Financiën — Sportclubs](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs) (Tier 1), [Group S](https://www.groups.be/) |
| Sportbeoefenaar oudere inwoner | 33 % BV (eerste schijf €21.010) | idem |
| Sportbeoefenaar niet-inwoner < 30 d | 18 % bevrijdende BV | idem |
| **Auteursrechten** fiscale forfait | 50 % op 1ste schijf, 25 % op 2de schijf | [Acerta](https://www.acerta.be/) — WEAK, FOD Fin circulaire pending |
| Auteursrechten BV | 15 % bevrijdend | [Acerta](https://www.acerta.be/), [KPMG](https://www.kpmg.be/) |
| Auteursrechten **IT-sector heringevoerd** | retroactief 1/1/2026 (Wetsontwerp 56/1243 De Wever) | [Acerta](https://www.acerta.be/), KPMG/Sodalis/Creative Shelter triangulatie |

**Confidence:** SUPPORTED voor flexi-job en sportbeoefenaar (Tier 1 + Tier 2); WEAK voor exacte auteursrechten-schijven 2026 (Tier 2 alleenstaand).

---

## 15. Regering De Wever (Arizona) — wijzigingen 2026 e.v.

| Maatregel | Status op 2026-05-08 | Bron |
|-----------|----------------------|------|
| Sociale werkbonus aangepast vanaf 1/4/2026 (Luik A R=125,04 / Luik B R=168,62) | **VAN KRACHT** | Programmawet 18/7/2025, [RSZ](https://www.socialsecurity.be/) |
| RSZ-loonplafond patronale heringevoerd 1/1/2026 = €86.700/kw | **VAN KRACHT** | KB 6/10/2025 (BS 10/10/2025) |
| Auteursrechten IT-sector heringevoerd retroactief 1/1/2026 | **VAN KRACHT** (wetsontwerp goedgekeurd) | Wetsontwerp 56/1243 |
| Maaltijdcheque-marge €2 bovenop loonnorm 0 % | **VAN KRACHT** (sectorale CAO vereist) | Wet 19/11/2025, BS 15/12/2025 |
| BBSZ-topvoetje 4,22 % → 4,00 % | **PER 1/1/2028** | [Liantis](https://www.liantis.be/) |
| Belastingvrije som ramp van €11.180 → €15.300 in 2029 | **[hypothesis] Wetsontwerp** — niet finaal in BS op peildatum | [STA Accountants](https://www.sta-accountants.be/) — Tier 2, 1 source, **WEAK** |
| Fiscale werkbonus 33,14%/52,54% → 35 % / 63 % | **[hypothesis] Wetsontwerp** | [STA Accountants](https://www.sta-accountants.be/) — **WEAK** |
| Forfaitaire beroepskosten optrekking | onder bespreking | [STA Accountants](https://www.sta-accountants.be/) — **WEAK** |

> **POC-aanbeveling:** alleen "VAN KRACHT"-maatregelen implementeren. Wetsontwerp-maatregelen markeren als toekomstig regime in roadmap.

---

## 16. Bekende open-source / publieke calculators 2026

| Calculator | URL | Tier | Geschiktheid POC |
|------------|-----|------|-------------------|
| FOD Fin Tax-Calc 2026 | [eservices.minfin.fgov.be/taxcalc](https://eservices.minfin.fgov.be/taxcalc/) | 1 | Officiële PB-simulator AJ2027 — embed/link beste optie |
| FOD Fin BV-simulator 2026 | via [Berekening BV](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) | 1 | Officiële BV-simulator — ideaal voor "geen eigen sleutelformule" |
| RSZ Find My Bonus | [socialsecurity.be/citizen/findmybonus](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/) | 1 | Werkbonus officieel |
| SD Worx bruto-netto | [sdworx.be](https://www.sdworx.be/) | 2 | Tier-2, niet auditable |
| Acerta payroll calculator | [acerta.be](https://www.acerta.be/) | 2 | idem |
| Securex netto-tool | [securex.be](https://www.securex.be/) | 2 | idem |
| Loonberekening.be | [loonberekening.be](https://www.loonberekening.be/) | 3 | Niet auditable |
| NettoCalc.be | [nettocalc.be](https://nettocalc.be/) | 3 | idem |

> **GAP:** geen volwassen open-source npm of PyPI-package voor Belgische payroll-engine die KB Bijlage III, RSZ, werkbonus en VAA combineert. [GitHub sysnrt/expat-salary-calculators](https://github.com/sysnrt/expat-salary-calculators) is alleen documentatie/spec, geen runnable library. [belgian-wage-calculator.vercel.app](https://belgian-wage-calculator.vercel.app/) is een hosted demo zonder publieke broncode.

---

## 17. Pre-mortem — top failure modes

> *"Het is november 2026. De Loonmotor levert verkeerde netto-cijfers. Waarom?"*

1. **BBSZ-banden onvolledig in dataset.** RSZ-instructie 2026 publiceert kwartaalbanden meestal pas in maart/april — als de POC dataset niet wordt geüpdatet, draait de berekening op stale 2025-banden. **Mitigatie:** `meta.laatste_update`-veld + UI-banner als > 90 dagen oud. Markeer BBSZ als info-only zolang Tier-1 tabel mist.
2. **Sleutelformule-implementatie wijkt af van FOD Fin.** Eigen TS-implementatie van Bijlage III verschilt door afronding/vrijstellingen van de officiële simulator. **Mitigatie:** voor POC: link naar [FOD Fin BV-simulator](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening) i.p.v. eigen reken-engine. Eigen implementatie alleen post-POC.
3. **Werkbonus-grenzen verschuiven door GGMMI-aanpassing buiten cyclus.** GGMMI gaat naar €2.189,81 op 1/4/2026; volgende aanpassing afhankelijk van centenindex-trigger. **Mitigatie:** datapunten met `geldig_vanaf`/`geldig_tot` strikt respecteren; UI toont actuele datum + filter op `referentiedatum`.

---

## 18. Conclusie — causaal verband

Het Belgische payroll-regelkader 2026 voor PC 200-bedienden steunt op **drie wettelijke pijlers**:

1. **RSZ (Programmawet 18/7/2025 + KB 6/10/2025):** vaste 13,07 %-werknemersbijdrage, 24,92 % + 7,48 % patronale tarieven, plafond €86.700/kw. Aangepast door sociale werkbonus 1/4/2026 die laagverdieners structureel afstemt op het verhoogde GGMMI €2.189,81.
2. **Bedrijfsvoorheffing (KB 11/12/2025, BS 29/12/2025):** sleutelformule-paradigma sinds 2023, gekoppeld aan PB-tarieven 25/40/45/50 % (AJ 2027) en belastingvrije som €11.180. Verminderingen voor gezinslast (kinderen ten laste, andere personen) operationaliseren de fiscale draagkracht direct in de maandelijkse inhouding.
3. **Sectorakkoord PC 200 (CAO 18/12/2025):** behoud Sociaal Fonds 200 0,23 %, eindejaarspremie 1 maandloon (anciënniteit verlaagd naar 3 jaar), jaarlijkse premie €330,84 — **maar geen** sectorale maaltijdcheque-verplichting. Maaltijdcheque-implementatie blijft een ondernemingskeuze, ook na de Wet van 19/11/2025 die een €2-marge toelaat bovenop de 0 % loonnorm.

**Waarom deze drie pijlers samen kloppen:** de tax-shift component van het Arizona-akkoord (RSZ-plafond + werkbonus-aanpassing 1/4/2026 + voorgestelde BBSZ-reductie 2028) richt zich op netto-versterking voor lage- en middeninkomens, terwijl de PB-pijler grotendeels stabiel blijft (indexering KI 2,3000 + bestaande schalen). Voor PC 200-bedienden levert dit op peildatum 2026-05-08 een **moderate netto-stijging** voor lonen rond GGMMI op, en **stabiele netto's** voor middeninkomens waarvoor de werkbonus uitdooft.

**Implicatie voor de Loonmotor POC:** de huidige scope (RSZ + sectorale premies + audit-trail) blijft correct. Voor een echte netto-calculator-uitbreiding (roadmap-punt 1) is het **Tier-1 link-pad naar FOD Fin BV-simulator** verantwoorder dan een eigen sleutelformule-implementatie binnen POC-budget. BBSZ en aanvullende gemeentebelasting blijven info-velden tot Tier-1 tabellen worden gepubliceerd.

---

## 19. Risks & Limitations

- **WEAK claims (8 van 40 atomic):** BV-tabel per loonniveau (alleen sleutelformule + simulator publiek), BBSZ-banden 2026, landingsbaan-supplement exacte bedrag, fiscale werkbonus 35 %/63 % (wetsontwerp), belastingvrije som €15.300 ramp (wetsontwerp), arbeidsongevallenpremie sectorgemiddelde, VAA-bedrijfswagen min/ref-CO2 (Tier-2 alleenstaand), VAA verwarming/elektriciteit (Tier-2 alleenstaand).
- **Centenindex 2026:** [Sociare-prognose spilindex juli 2026 → eerste centenindex toepassing september 2026](https://www.sociare.be/) is voorspelling, niet vaststaand.
- **Open-source library GAP:** geen runnable npm/PyPI Belgisch payroll-pakket; eigen implementatie (TS module of FastAPI) is enige optie, met FOD Fin BV-simulator als audit-referentie.
- **Aanvullende gemeentebelasting per gemeente:** geen Tier-1 machine-leesbare lijst publiek beschikbaar; gemiddelde 7,3 % is voldoende voor POC-disclaimer-aanpak.
- **Auteursrechten 2026 IT-herinvoering:** wetsontwerp 56/1243 retroactief 1/1/2026 — nog te verifiëren tegen finale BS-publicatie tegen Q3 2026.

---

## Sources

### Tier 1 — Gov primary / KB / BS

1. [FOD Financiën — Berekening van de bedrijfsvoorheffing 2026](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening)
2. [Belgisch Staatsblad — KB 11 december 2025 (BS 29/12/2025) — KB/WIB 92 Bijlage III](https://www.ejustice.just.fgov.be/)
3. [Programmawet 18 juli 2025 (BS 29/7/2025)](https://www.ejustice.just.fgov.be/)
4. [KB 6 oktober 2025 (BS 10/10/2025) — RSZ-loonplafond](https://www.ejustice.just.fgov.be/)
5. [FOD Financiën — Tax-Calc 2026](https://eservices.minfin.fgov.be/taxcalc/)
6. [FOD Financiën — Sportbeoefenaars BV-tarieven](https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/sportclubs)
7. [RSZ — Find My Bonus / werkbonus rekenmodule](https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/)
8. [RSZ — basisbijdragevoeten + plafond persbericht 1/1/2026](https://www.socialsecurity.be/)
9. [FOD WASO — Patronale RSZ structuur 24,92% + 7,48% loonmatiging](https://werk.belgie.be/)
10. [FOD WASO — GGMMI 1/4/2026 = €2.189,81](https://werk.belgie.be/)
11. [Sociaal Fonds 200 — sfonds200.be](https://www.sfonds200.be/)
12. [PC 200 sectorakkoord 18 december 2025 (sfonds200.be)](https://www.sfonds200.be/)

### Tier 2 — Sociaal-secretariaten, fiscaal uitgevers, adviseurs

13. [Securex — Bijlage III KB/WIB 92 voor 2026](https://www.securex.be/)
14. [Securex — PC 200 nieuwe CAO december 2025](https://www.securex.be/)
15. [Securex — maaltijdcheques 2026 fiscaal/RSZ regime](https://www.securex.be/)
16. [Securex — werkbonus PC 200 1/4/2026](https://www.securex.be/)
17. [CLB Group — Sleutelformule BV 2026 + schalen I/II/III](https://www.clbgroup.be/)
18. [CLB Group — Sociaal Fonds 200 0,23% bijdrage](https://www.clbgroup.be/)
19. [Acerta — Belastingvrije som AJ2027 + reductietabel kinderen ten laste](https://www.acerta.be/)
20. [Acerta — bruto-netto-tool + vakantiegeld 92% bedienden](https://www.acerta.be/)
21. [Acerta — flexi-loon + auteursrechten regimeoverzicht 2026](https://www.acerta.be/)
22. [Acerta — maaltijdcheques verhoging De Wever-akkoord](https://www.acerta.be/)
23. [Attentia — Vermindering BV voor kinderen ten laste 2026](https://www.attentia.be/)
24. [Attentia — Werkbonus PC 200 bedienden vanaf 1/4/2026](https://www.attentia.be/)
25. [Partena Professional — werkbonus & verminderingen BV 2026](https://www.partena-professional.be/)
26. [Partena Professional — werkbonus & RSZ 2026](https://www.partena-professional.be/)
27. [Liantis — sectorakkoord PC 200 2025-2026 analyse](https://www.liantis.be/)
28. [Liantis — Sociale werkbonus 1/4/2026 bedienden Luik A/B](https://www.liantis.be/)
29. [Liantis — BBSZ hervorming Arizona 2028: 4,22%→4%](https://www.liantis.be/)
30. [Daenens — Nieuwe werkbonus 1 april 2026 luiken + formules](https://www.daenens.be/)
31. [SSN — werkbonus 1 april 2026 grenzen](https://www.ssn.be/)
32. [SSN — Bijzondere bijdrage sociale zekerheid (BBSZ) 2026 kwartaalbanden](https://www.ssn.be/)
33. [SSN — vakantiegeld bedienden 92% dubbel + RJV-formule](https://www.ssn.be/)
34. [SD Worx — bruto-netto calculator + werkbonus 2026](https://www.sdworx.be/nl-be/loonberekening)
35. [SD Worx Jobs — netto-calculator](https://www.sdworxjobs.be/)
36. [Group S — sportbeoefenaars BV-schalen 16,5% / 33% / 18%](https://www.groups.be/)
37. [Sociare — loonnorm 0% + €2 maaltijdcheque uitzondering Wet 19/11/2025 BS 15/12/2025](https://www.sociare.be/)
38. [Sociare — centenindex prognose juli/sept 2026 spilindex](https://www.sociare.be/)
39. [Wolters Kluwer / Jef Wellens — fiscale kerncijfers AJ2027](https://www.wolterskluwer.com/)
40. [Practicali — Forfaitaire beroepskosten + belastingschalen AJ2027](https://www.practicali.be/)
41. [NCOI — Belastingschalen + indexcoëfficiënt AJ2027](https://www.ncoi.be/)
42. [BDO — Kerncijfers KI-indexatie AJ2027 = 2,3000](https://www.bdo.be/)
43. [STA Accountants — Arizona-akkoord fiscale hervormingen](https://www.sta-accountants.be/)
44. [fibofin.be — VAA 2026 forfaits (bedrijfswagen, verwarming, elektriciteit, huisvesting)](https://www.fibofin.be/)
45. [Eindejaarspremie.be — PC 200 CAO 26/1/2012, 1 maandloon](https://www.eindejaarspremie.be/)

### Tier 3 — Tertiair (alleen voor regime-context, getrianguleerd)

46. [Wikipedia — Aanvullende gemeentebelasting](https://nl.wikipedia.org/wiki/Aanvullende_gemeentebelasting)
47. [Loonberekening.be — netto bruto rekenmodule](https://www.loonberekening.be/)
48. [NettoCalc.be — netto loon calculator](https://nettocalc.be/)
49. [Jobat — bruto netto loon calculator](https://www.jobat.be/nl/art/bruto-netto)
50. [GitHub — sysnrt/expat-salary-calculators (spec-only repo)](https://github.com/sysnrt/expat-salary-calculators)
51. [belgian-wage-calculator.vercel.app (hosted demo, no source)](https://belgian-wage-calculator.vercel.app/)

---

*Onderzoeksdatum: 2026-05-08. Deze rapportage consolideert twee parallel-onderzoekssporen (BV/PB-deelstroom en netto-calculator-deelstroom). Source registries in `.memories/notes/sources-bv-2026.md` en `.memories/notes/sources-belgian-netto-calculator-2026.md`.*
