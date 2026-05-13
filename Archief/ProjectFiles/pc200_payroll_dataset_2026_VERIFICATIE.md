# VERIFICATIE — PC 200 Payroll Dataset 2026

**Bestand:** `pc200_payroll_dataset_2026.json`
**Versie:** 2026-05-08
**Doelpubliek:** payroll-medewerkers, auditors, sectorale experts die de **inhoud** van het dataset willen toetsen — geen developer-kennis vereist.
**Taal van het dataset:** Nederlands (nl-BE)

> **Lees eerst** [`pc200_payroll_dataset_2026_CORE.md`](pc200_payroll_dataset_2026_CORE.md) voor het gedeelde referentiekader: datamodel, bronnenhiërarchie, statussen, normalisatie, baremastructuur en begrippenlijst. Dit document gaat ervan uit dat je de **velden** kent — het focust op **hoe** je ze gebruikt om een datapunt te toetsen.

---

## Inhoudstafel

1. [Doel van het dataset](#1-doel-van-het-dataset)
2. [Scope & afbakening](#2-scope--afbakening)
3. [Categorieën — wat staat waar?](#3-categorieën--wat-staat-waar)
4. [Verificatie-workflow](#4-verificatie-workflow)
5. [Verificatievoorbeelden](#5-verificatievoorbeelden)
6. [Verificatie-checklist (printbaar)](#6-verificatie-checklist-printbaar)
7. [Bronnencontrole — extra aandachtspunten](#7-bronnencontrole--extra-aandachtspunten)
8. [Bekende beperkingen & pending items](#8-bekende-beperkingen--pending-items)
9. [Wat doe je als je een fout vindt?](#9-wat-doe-je-als-je-een-fout-vindt)

---

## 1. Doel van het dataset

Dit JSON-dataset is een **juridisch verankerde, machineleesbare loonmotor** voor Paritair Comité 200 (Aanvullend Paritair Comité voor Bedienden — APCB), doeljaar 2026. Het bevat alle parameters die nodig zijn om voor een PC 200-bediende:

- het correcte minimumbarema te bepalen (functiecategorie × ervaring × schaal),
- RSZ-bijdragen te berekenen (werknemer + werkgever + sectorbijdrage Sociaal Fonds 200),
- bedrijfsvoorheffing en personenbelasting toe te passen,
- sectorale premies en voordelen correct uit te keren (eindejaarspremie, jaarlijkse premie, ecocheques, woon-werk, fietsvergoeding, …),
- arbeidsvoorwaarden te respecteren (klein verlet, rouwverlof, arbeidsduur).

Elk datapunt is **traceerbaar** tot een originele bron (URL + fragment + datum). Dit is geen samengevatte gids — het is een **audit trail in JSON-formaat**.

### Wat doet een payroll-verificateur?

Verifieert of een uitbetaalde loon, bijdrage of premie correspondeert met de sectorale regels — en kan elke waarde tot zijn primaire bron volgen.

---

## 2. Scope & afbakening

### Wel in scope

- **Paritair Comité 200** (Aanvullend Paritair Comité voor Bedienden — meer dan 500.000 werknemers)
- **Land:** België — gebruikte taal **Nederlands (nl-BE)**
- **Doeljaar:** 2026
- **Zes hoofdcategorieën:**
  1. `lonen` — sectorale baremamatrix (Schaal I, Schaal II, studenten × Cat A/B/C/D) + indexcoëfficiënt
  2. `indexatie` — jaarlijkse sectorindex en formule
  3. `rsz` — sociale zekerheidsbijdragen (werknemer, werkgever, sectorspecifieke componenten)
  4. `fiscaliteit` — bedrijfsvoorheffing, personenbelasting, fiscale voordelen
  5. `premies_en_voordelen` — eindejaarspremie, jaarlijkse premie, ecocheques, woon-werk, …
  6. `arbeidsvoorwaarden` — klein verlet, arbeidsduur, overuren

### Niet in scope (expliciet)

- **Andere paritaire comités** (PC 100, PC 124, …) — uitsluitend PC 200
- **Arbeiders** (PC 200 betreft uitsluitend bedienden — RSZ-berekeningsbasis 100 %, niet 108 %)
- **Individuele ondernemingscao's** of opting-out-regelingen
- **Volledige tekst** van bedrijfsvoorheffingsschalen (enkel verwijzing naar Bijlage III KB/WIB 92)
- **Personenbelastingschijven inkomstenjaar 2026 (AJ 2027)** — op peildatum nog niet officieel gepubliceerd

### Peildatum

`meta.laatste_update` = **2026-05-08**. Vanaf deze datum zijn waarden geverifieerd; latere wijzigingen (sectoraal, fiscaal, RSZ) moeten via het update-proces worden ingewerkt — zie het [DEVELOPER-document](pc200_payroll_dataset_2026_DEVELOPER.md), sectie *Onderhoud & update-workflow*.

---

## 3. Categorieën — wat staat waar?

### 3.1 `lonen[]` — 13 datapunten

| Subcategorie | Aantal | Inhoud |
|---|---|---|
| `barema_schaal_I` | 4 | Schaal I (eerste jaar in onderneming) × Cat A/B/C/D — elk met `tabel_per_ervaring` (0–26 jaar) |
| `barema_schaal_II` | 4 | Schaal II (vanaf 2e jaar in dezelfde onderneming) × Cat A/B/C/D — elk met `tabel_per_ervaring` (1–26 jaar) |
| `barema_studenten` | 4 | Cat A, B (16–20 jaar) en Cat C, D (18–20 jaar) — `tabel_per_leeftijd` |
| `indexcoefficient` | 1 | 1,0221 voor 1/1/2026 |

**Totaal aantal baremacellen:** 228 (4×27 voor Schaal I + 4×26 voor Schaal II + 2×5 + 2×3 voor studenten).

### 3.2 `indexatie[]` — 2 datapunten

- **`index_pc200_2026_percentage`**: 2,21 % op 1/1/2026
- **`index_pc200_formule`**: tekstuele formule (afgevlakte gezondheidsindex nov+dec t-1 / nov+dec t-2)

### 3.3 `rsz[]` — 6 datapunten

| ID | Wat |
|---|---|
| `rsz_werknemer_basis` | Persoonlijke RSZ-bijdrage 13,07 % |
| `rsz_werkgever_profit_basis` | Faciaal werkgevertarief 25 % (= 19,88 % basis + 5,12 % loonmatiging) |
| `rsz_basis_arbeiders_108` | 108 %-basis (NIET PC 200 — opgenomen ter disambiguatie) |
| `rsz_bijzondere_bijdragen_verwijzing` | Verwijzing naar RSZ-administratieve instructies (status `mogelijk_verouderd`) |
| `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` | **0,23 %** Sociaal Fonds 200 werkgeversbijdrage (1/1/2026 – 31/12/2027) |
| `rsz_pc200_bouw_aanvullend_pensioen_2026` | **1,80 %** solidariteitsluik aanvullend pensioen — uitsluitend bouw-subset PC 200 |

### 3.4 `fiscaliteit[]` — 6 datapunten

| ID | Wat |
|---|---|
| `bv_2026_kb_bijlage_iii` | Verwijzing naar KB 11/12/2025 (BV-regels Bijlage III) |
| `fiscaal_indexcoefficient_aj2026` | 2,2793 voor AJ 2026 (inkomsten 2025) |
| `pb_schijven_aj2026` | PB-schijven AJ 2026: 25/40/45/50 % |
| `pb_schijven_inkomstenjaar_2026` | Status `niet_gevonden` (AJ 2027 nog niet gepubliceerd) |
| `fiscaal_overuren_contingent_2026` | 130 uur algemeen contingent (mogelijk verhoogd naar 180 vanaf 1/4/2026) |
| `fiscaal_studentenarbeid_650u_2026` | 650 uren BV-vrij studentenarbeid |

### 3.5 `premies_en_voordelen[]` — 13 datapunten

Belangrijkste:
- **Eindejaarspremie** (1 maandloon) + onderliggende CAO 9/6/2016 (134421/CO/200) + wijzigingen 2026
- **Jaarlijkse premie 2026**: € 330,84
- **Ecocheques**: max € 250 (voltijds, volledige referentieperiode) + pro-rata schaal voor deeltijd
- **Woon-werk trein**: 100 % terugbetaling vanaf 1/1/2026
- **Loonplafond privévervoer**: € 36.688
- **Fietsvergoeding**: € 0,32/km vanaf 1/10/2026 (max € 12,80/dag)
- **Maaltijdcheques** & **thuiswerkvergoeding**: status `niet_gevonden` op sectoraal niveau
- **Aanvullende vergoeding 1/5e landingsbaan**: € 92,45/maand vanaf 1/6/2026

### 3.6 `arbeidsvoorwaarden[]` — 3 datapunten

- **Klein verlet / rouwverlof**: +2 dagen vanaf 1/1/2026
- **Arbeidsduur**: bronverwijzing (concreet aantal niet rechtstreeks geëxtraheerd)
- **Overuren-toeslagen**: status `niet_gevonden` (sectorale afwijking niet bevestigd)

### 3.7 `bronnen[]` — 17 master-bronvermeldingen

Alle bronnen die ergens in het dataset gebruikt worden, gecentraliseerd voor audit. Gebruik `bron_id` om vanuit een datapunt naar deze lijst te referencen.

---

## 4. Verificatie-workflow

Stappen om een datapunt zonder developer-tools te toetsen.

### Stap 1 — Open het JSON in een leesbare viewer

Tools die werken zonder extra installatie:
- **VS Code** (gratis) — opent JSON met syntax highlighting en folding
- **Firefox** of **Chrome** — sleep het bestand in een leeg tabblad
- **Notepad++** met JSON-plugin
- Online: jsonlint.com (geen gevoelige data uploaden)

### Stap 2 — Vind het datapunt dat je wilt verifiëren

Gebruik de zoekfunctie (Ctrl+F) op:
- de **omschrijving** (bv. "eindejaarspremie")
- of de **`id`** (bv. `pc200_eindejaarspremie`)
- of een **bedrag** (bv. "330.84")

### Stap 3 — Lees de waarde + bron

Voor elk datapunt:

1. **Wat is de waarde?** → kijk naar `waarde_bron` (zoals in de bron staat)
2. **Wanneer geldig?** → kijk naar `geldig_vanaf` en `geldig_tot`
3. **Wie zegt dit?** → `bron_organisatie` + `bron_url`
4. **Letterlijk citaat?** → `bron_fragment`

### Stap 4 — Klik door naar de bron

`bron_url` opent de oorspronkelijke pagina/PDF. Zoek daar het `bron_fragment`. Kijk of het er staat zoals geciteerd.

### Stap 5 — Controleer de triangulatie (bij Tier 2/3)

Als `betrouwbaarheid` = `Tier 2` of `Tier 3`, bekijk dan ook de bevestigingen in `triangulatie_bronnen`. Twee onafhankelijke bronnen die hetzelfde zeggen verhoogt het vertrouwen substantieel. Voor Tier 3 is **minstens één Tier 1/2 bevestiging verplicht** (zie [CORE §3](pc200_payroll_dataset_2026_CORE.md#3-bronnenhiërarchie-3-tier)).

### Stap 6 — Lees opmerkingen

Het veld `opmerkingen` bevat vaak **kritieke randvoorwaarden** (bv. "Bedragen omvatten reeds de sectorale indexering van +2,21 % per 1/1/2026" of "Tijdelijke verhoging naar 180 uur is aangekondigd om permanent te worden"). Sla deze nooit over.

### Stap 7 — Toets `status` en `voorwaarden`/`uitsluitingen`

- `status` = `actief`? Anders: niet zonder review gebruiken (zie [CORE §4](pc200_payroll_dataset_2026_CORE.md#4-statussen)).
- `voorwaarden` cumulatief van toepassing op de werknemer in kwestie?
- Valt de werknemer onder een `uitsluitingen`-categorie?

---

## 5. Verificatievoorbeelden

### Voorbeeld 1 — Eindejaarspremie

> Vraag: "Klopt de uitleg dat een PC 200-bediende met 6 maanden anciënniteit recht heeft op een pro-rata eindejaarspremie?"

1. Zoek `id`: `pc200_eindejaarspremie`
2. Lees `voorwaarden`: `["minimum 6 maanden anciënniteit ...", "pro rata bij onvolledige prestaties", ...]` ✅
3. Bron: ACVBIE-brochure, december 2025 — `bron_fragment` citaat
4. Triangulatie via interpretatienota sfonds200.be (Tier 1)
5. Conclusie: claim ondersteund door zowel Tier 3 vakbond als Tier 1 sociaal fonds.

### Voorbeeld 2 — Barema Schaal I, Cat A, 5 jaar ervaring

1. Zoek `id`: `lonen_pc200_schaalI_catA_01012026`
2. Lees `tabel_per_ervaring` — vind de regel `ervaring_jaren = 5`
3. Lees `maandloon_eur` (bv. **€ 2.276,51**)
4. Verifieer dat `geldig_vanaf` ≤ berekeningsdatum ≤ `geldig_tot` (of `geldig_tot` = null)
5. `betrouwbaarheid` is **Tier 2** (SSN) → triangulatie aanbevolen, niet verplicht; in praktijk wel aanwezig (ACV + ACLVB)
6. Lees `opmerkingen` — bevestiging dat barema's reeds de index van 1/1/2026 bevatten.

### Voorbeeld 3 — Sociaal Fonds 200 werkgeversbijdrage

1. Zoek `id`: `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026`
2. `waarde_bron`: `"0,23 %"` — `waarde_genormaliseerd`: `0.0023`
3. `geldig_vanaf` = 2026-01-01, `geldig_tot` = 2027-12-31
4. `bron_organisatie`: Sociaal Fonds APCB (Tier 1) — bevestigd
5. Eindbevestiging: percentage past binnen het sectorakkoord 2025-2026.

---

## 6. Verificatie-checklist (printbaar)

Gebruik deze lijst voor elk datapunt dat je formeel valideert.

- [ ] `status` = `actief`?
- [ ] `geldig_vanaf` en `geldig_tot` dekken de berekeningsdatum?
- [ ] `bron_url` openbaar en bereikbaar?
- [ ] `bron_fragment` letterlijk te vinden in de bron?
- [ ] Voor Tier 3: minstens één Tier 1/2 triangulatie aanwezig?
- [ ] `voorwaarden` cumulatief van toepassing op de werknemer?
- [ ] Geen `uitsluitingen` van toepassing?
- [ ] `opmerkingen` gelezen en begrepen?
- [ ] `waarde_bron` consistent met `waarde_genormaliseerd` (bv. 2,21 % ↔ 0,0221)?
- [ ] Bij wijziging t.o.v. vorige peildatum: triangulatie verplicht — aanwezig?

---

## 7. Bronnencontrole — extra aandachtspunten

### 7.1 Wanneer een bron niet meer bereikbaar is

Het web is volatiel. Wanneer `bron_url` een 404 of timeout geeft:

1. Controleer de **Internet Archive Wayback Machine** (`web.archive.org`) — paste de originele URL in.
2. Zoek op `bron_organisatie` + `bron_titel` om een nieuwe URL te vinden.
3. Documenteer de bevinding in `opmerkingen` van het datapunt en signaleer aan de dataset-onderhouder (zie [§9](#9-wat-doe-je-als-je-een-fout-vindt)).
4. Tot er een vervangende URL is: `status` = `mogelijk_verouderd`.

### 7.2 OCR-correcties — let extra op bij barema's

Twee cellen in de SSN-PDF zijn manueel gecorrigeerd via Tier 3 triangulatie. Zie [CORE §6.4](pc200_payroll_dataset_2026_CORE.md#64-bekende-ocr-correcties). Wanneer je een bedrag in een barema verifieert dat **niet** monotoon stijgt, is dat een rode vlag — meld het.

### 7.3 Indexering al inbegrepen?

Sectorale barema's voor PC 200 bevatten standaard **reeds de index per 1/1/2026** (+ 2,21 %). Vermenigvuldig dus niet nogmaals met de indexcoëfficiënt. Het veld `opmerkingen` van de barema-datapunten bevestigt dit expliciet.

### 7.4 `bron_fragment` letterlijk overgenomen

Het `bron_fragment` is de **audit-anker**. Het moet woord-voor-woord teruggevonden worden in de bron, op de plaats die `bron_vindplaats` aangeeft. Wijkt de tekst af? Dan is ofwel de bron sinds de extractie gewijzigd, ofwel is er een transcriptiefout — dat moet je rapporteren.

---

## 8. Bekende beperkingen & pending items

Deze items staan in `meta.niet_gevonden` of in datapunten met status `niet_gevonden` / `mogelijk_verouderd`:

| Onderwerp | Reden | Aanbeveling |
|---|---|---|
| Personenbelastingschijven inkomstenjaar 2026 (AJ 2027) | Niet officieel gepubliceerd op peildatum | Bevestig na publicatie FOD Financiën (verwacht eind 2026) |
| Volledige bedrijfsvoorheffingsschalen 2026 in tabelvorm | Enkel KB-tekst en sleutelformule beschikbaar — schalen niet in machineleesbaar formaat | Gebruik officiële BV-simulator FOD Financiën |
| Sectorale maaltijdcheques in PC 200 | Geen sectorcao gevonden — toekenning op ondernemingsniveau | Federaal max van 8 → 10 EUR vanaf 1/1/2026 onder voorbehoud van wetgevend initiatief |
| Sectorale thuiswerkvergoeding PC 200 | Niet sectoraal verplicht — RSZ kent generiek forfait ±154 EUR/maand | Verifieer ondernemingsbeleid |
| Centenindex-regelgeving 2026 | Niet tijdig gefinaliseerd — niet toegepast op 1/1/2026 | Volgen voor 2027 |
| Gemeentebelasting (aanvullende gemeentelijke) | Tier 3 vermeldt 7 % gemiddeld; geen Tier 1 bevestiging | Niet opgenomen — gebruik per-gemeente lookup |
| Sectorale arbeidsduur PC 200 (concreet aantal uren) | Securex TWA-document hoofdstuk arbeidsduur niet rechtstreeks geëxtraheerd | Typisch 38 u/week — verifieer via Securex TWA-document |
| Sectorale overuren-toeslagen PC 200 | Sectorale afwijking niet bevestigd | Wettelijk regime: 50 % / 100 % (Arbeidswet 16/03/1971) |
| Vakantiegeld voor bedienden (wettelijk regime) | Geen Tier 1 extractie uitgevoerd | Bevestigen via Gecoördineerde Wetten 28/06/1971 |
| Bouwsector aanvullend pensioen — exact toepassingsgebied | CAO 13/03/2025 nr. 192.922 niet integraal uitgelezen | Voor scope-bepaling: raadpleeg CAO bij FOD WASO |

> Wanneer je verificatie raakt aan een onderwerp uit deze tabel: stop en consulteer een tweede bron buiten het dataset. Het dataset zegt zelf dat het hier niet sluitend is.

---

## 9. Wat doe je als je een fout vindt?

Verifieer eerst dubbel — bekijk **bron + triangulatie + opmerkingen** opnieuw vóór je een bevinding rapporteert.

### Bij een vastgestelde fout

1. **Documenteer**:
   - `id` van het betrokken datapunt
   - Welke veld(en) afwijken (`waarde_bron`, `geldig_vanaf`, `bron_url`, …)
   - De afwijking + jouw bron (URL + citaat + datum)
2. **Categoriseer** het type:
   - **Bronfout** — primaire bron werd verkeerd geciteerd of verkeerd genormaliseerd
   - **Verouderde bron** — er is intussen een nieuwere publicatie
   - **OCR-fout** — bedrag of percentage is verkeerd overgenomen
   - **Conflict** — twee Tier 1/2 bronnen geven afwijkende waarden
3. **Meld aan de dataset-onderhouder** (zie verantwoordelijkheidsoverzicht in het [DEVELOPER-document](pc200_payroll_dataset_2026_DEVELOPER.md)). De onderhouder past het JSON aan, voert triangulatie uit en past `meta.laatste_update` aan.
4. **Tijdens de overgangsperiode**: gebruik het datapunt **niet** voor productieberekeningen — markeer het als verdacht in je eigen werkdocumenten.

### Bij een conflict tussen bronnen

Wanneer twee Tier 1/2 bronnen elkaar tegenspreken: het datapunt zou status `conflict` moeten krijgen met een `conflict_opmerking`. Als dat **niet** zo is in het JSON, is dat zelf een bevinding die je rapporteert.

---

*Laatste herziening van dit document: 2026-05-08 — synchroon met dataset `pc200_payroll_dataset_2026.json` en CORE-document v2026-05-08.*
