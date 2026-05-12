# CORE — PC 200 Payroll Dataset 2026

**Bestand:** `pc200_payroll_dataset_2026.json`
**Versie:** 2026-05-08
**Doel van dit document:** gedeeld referentiekader voor het VERIFICATIE-document (payroll-experts) én het DEVELOPER-document (integratie & tool). Wijzigingen aan datamodel, bronnenhiërarchie, statussen of begrippen worden **uitsluitend hier** doorgevoerd; de andere documenten linken ernaar.

**Bijhorende documenten:**
- [`pc200_payroll_dataset_2026_VERIFICATIE.md`](pc200_payroll_dataset_2026_VERIFICATIE.md) — verificatieworkflow voor payroll-medewerkers
- [`pc200_payroll_dataset_2026_DEVELOPER.md`](pc200_payroll_dataset_2026_DEVELOPER.md) — integratie, schema-validatie, onderhoud

---

## Inhoud

1. [Top-level structuur van het JSON-bestand](#1-top-level-structuur-van-het-json-bestand)
2. [Datapunt-schema — alle velden](#2-datapunt-schema--alle-velden)
3. [Bronnenhiërarchie (3-tier)](#3-bronnenhiërarchie-3-tier)
4. [Statussen](#4-statussen)
5. [Normalisatie — `waarde_bron` vs `waarde_genormaliseerd`](#5-normalisatie--waarde_bron-vs-waarde_genormaliseerd)
6. [Speciale structuren — barematabellen](#6-speciale-structuren--barematabellen)
7. [Begrippenlijst](#7-begrippenlijst)

---

## 1. Top-level structuur van het JSON-bestand

```
{
  "meta": { ... },                    // metadata, scope, opmerkingen
  "lonen": [ ... ],                   // 13 datapunten (12 barema + 1 indexcoëfficiënt)
  "indexatie": [ ... ],               // 2 datapunten (percentage + formule)
  "rsz": [ ... ],                     // 6 datapunten
  "fiscaliteit": [ ... ],             // 6 datapunten
  "premies_en_voordelen": [ ... ],    // 13 datapunten
  "arbeidsvoorwaarden": [ ... ],      // 3 datapunten
  "bronnen": [ ... ],                 // 17 bronvermeldingen (cross-referenced)
  "validatie": { ... }                // self-validation flags
}
```

### `meta`-blok

| Veld | Type | Doel |
|---|---|---|
| `dataset` | string | Naam van het dataset |
| `pc` | string | "200" — paritair comité nummer |
| `pc_naam` | string | Volledige naam ("Aanvullend Paritair Comité voor Bedienden (APCB)") |
| `land`, `taal` | string | "BE", "nl-BE" |
| `laatste_update` | ISO date | Peildatum (2026-05-08) |
| `doeljaar` | integer | 2026 |
| `dekking` | array | Categorieën die in scope zijn |
| `niet_gevonden` | array | Datapunten die expliciet **niet** zijn opgenomen + reden |
| `conflicten` | array | Bronconflicten die nog niet zijn opgelost |
| `opmerkingen` | array | Globale annotaties (sectorakkoord-status, centenindex, …) |

### `validatie`-blok

Self-asserts welke kwaliteitschecks zijn uitgevoerd op het hele dataset:

```json
"validatie": {
  "json_schema_gevolgd": true,
  "alle_datapunten_met_bron": true,
  "alle_datapunten_met_status": true,
  "conflicten_gemarkeerd": true,
  "ontbrekende_informatie_gemarkeerd": true,
  "baremamatrix_volledig_geintegreerd": true,
  "baremacellen_aantal": 228,
  "triangulatie_uitgevoerd": true,
  "monotone_loonprogressie_gecheckt": true,
  "sectorpensioen_onderzocht": true,
  "sociaal_fonds_200_bijdrage_geintegreerd": true
}
```

Wanneer een check `false` zou zijn, moet de oorzaak in `meta.opmerkingen` of `meta.conflicten` worden gedocumenteerd.

---

## 2. Datapunt-schema — alle velden

Elk element in `lonen`, `rsz`, `fiscaliteit`, `premies_en_voordelen`, `arbeidsvoorwaarden` volgt dezelfde structuur.

### 2.1 Identificatie & classificatie

| Veld | Type | Beschrijving | Voorbeeld |
|---|---|---|---|
| `id` | string, uniek | Stabiele primaire sleutel — gebruik voor referenties tussen systemen | `"lonen_pc200_schaalI_catA_01012026"` |
| `categorie` | enum | `lonen` \| `indexatie` \| `rsz` \| `fiscaliteit` \| `premies_en_voordelen` \| `arbeidsvoorwaarden` | `"lonen"` |
| `subcategorie` | string | Fijnere indeling binnen de categorie | `"barema_schaal_I"` |
| `type` | enum | `barema` \| `parameter` \| `cao` \| `koninklijk_besluit` \| `bronverwijzing` | `"barema"` |
| `pc` | string | Altijd `"200"` in dit dataset | `"200"` |
| `omschrijving` | string | Mens-leesbare beschrijving van het datapunt | "Sectorale minimum maandlonen PC 200 – Schaal I, Cat A …" |

### 2.2 Waarde-velden (de kern)

| Veld | Type | Beschrijving |
|---|---|---|
| `waarde_bron` | string | **Letterlijke** waarde zoals ze in de bron staat — mét EUR-symbool, komma's, percentages — ongewijzigd. Voor audit. |
| `waarde_genormaliseerd` | number \| null | **Machineleesbare** waarde voor berekeningen. Bv. `0.0221` voor 2,21 %, `1.0221` voor coëfficiënt 1,0221. `null` wanneer normalisatie niet mogelijk is (tekstueel datapunt of tabel). |
| `tabel_per_ervaring` | array<obj> | Optioneel — uitsluitend voor barema-datapunten. Zie [§6](#6-speciale-structuren--barematabellen). |
| `tabel_per_leeftijd` | array<obj> | Optioneel — uitsluitend voor studentenbarema's. Zie [§6](#6-speciale-structuren--barematabellen). |
| `eenheid` | string | `EUR/maand`, `percentage`, `EUR`, `uren`, `dagen`, `indexpunt`, `tekst`, … |
| `valuta` | string \| null | `"EUR"` of `null` |
| `frequentie` | enum | `eenmalig` \| `maandelijks` \| `jaarlijks` \| `per_prestatie` \| `wekelijks` \| `null` |
| `berekeningsbasis` | string | Beschrijft op welke grondslag de waarde wordt toegepast (bv. "brutoloon 100 % (bedienden)") |

### 2.3 Toepassingsregels

| Veld | Type | Beschrijving |
|---|---|---|
| `toepassingsgebied` | array<string> | Wie/wat valt onder dit datapunt (bv. `["bedienden PC 200", "schaal I", "categorie A"]`) |
| `voorwaarden` | array<string> | Cumulatieve voorwaarden voor toepasselijkheid |
| `uitsluitingen` | array<string> | Wie/wat valt expliciet **niet** onder dit datapunt |

### 2.4 Geldigheidsperiode

| Veld | Type | Beschrijving |
|---|---|---|
| `geldig_vanaf` | ISO date \| null | Eerste dag waarop de waarde van toepassing is |
| `geldig_tot` | ISO date \| null | Laatste dag — `null` betekent "open einde / nog niet vervangen" |
| `laatst_bevestigd_op` | ISO date | Datum van laatste verificatie van dit specifieke datapunt |

### 2.5 Bronvelden

| Veld | Type | Beschrijving |
|---|---|---|
| `bron_organisatie` | string | Naam van de uitgever (bv. "FOD Financiën", "Sociaal Fonds APCB") |
| `bron_type` | enum | `overheid` \| `sector` \| `sociaal_secretariaat` \| `vakbond` \| `werkgeversorganisatie` \| `expert_intermediair` |
| `bron_titel` | string | Titel van het document/de pagina |
| `bron_url` | URL | Permalink (zoveel mogelijk) |
| `bron_publicatiedatum` | ISO date \| null | Wanneer de bron publiceerde |
| `bron_vindplaats` | string | Sectie/paragraaf binnen de bron (bv. "Sectie 'Eindejaarspremie'") |
| `bron_fragment` | string | **Letterlijk citaat** uit de bron — dit is het audit-anker |
| `betrouwbaarheid` | enum | `Tier 1` \| `Tier 2` \| `Tier 3` |
| `extractie_methode` | string | `letterlijk` \| `tabel_extractie` \| `bronverwijzing` \| `gestructureerde_overname` \| `samenvattend_met_bronverwijzing` |
| `triangulatie_bronnen` | array<obj> | Aanvullende bevestigingen — elk object heeft `bron`, `url`, `tier`, `overeenstemming` |

### 2.6 Status & opmerkingen

| Veld | Type | Beschrijving |
|---|---|---|
| `normalisatie_toegepast` | boolean | `true` als `waarde_genormaliseerd` afwijkt van `waarde_bron` |
| `normalisatie_opmerking` | string \| null | Toelichting (bv. "Komma vervangen door punt") |
| `status` | enum | Zie [§4](#4-statussen) |
| `conflict_opmerking` | string \| null | Beschrijving van een actief bronconflict |
| `opmerkingen` | array<string> | Vrije annotaties (achtergrond, toelichting, edge cases) |

---

## 3. Bronnenhiërarchie (3-tier)

Elk datapunt krijgt een betrouwbaarheidstier op basis van de primaire bron.

| Tier | Wie | Voorbeelden | Mag alleenstaand? |
|---|---|---|---|
| **Tier 1** | Officiële, normatieve bronnen | RSZ, FOD Financiën, FOD WASO, Belgisch Staatsblad, Sociaal Fonds APCB (sfonds200.be) | ✅ Ja |
| **Tier 2** | Erkende sociale secretariaten en werkgeversorganisaties | SSN, Securex, Partena Professional, Acerta, Liantis, CLB Group, SD Worx, Agoria, VBO/FEB | ✅ Ja |
| **Tier 3** | Vakbonden en commerciële intermediairs | ACV-CSC BIE, ACLVB, Bobex, Corsa Consultancy | ❌ **Nooit alleenstaand** — vereist altijd triangulatie met Tier 1 of Tier 2 |

### Kernregel

> **Een datapunt mag enkel `status = "actief"` krijgen wanneer ten minste één Tier 1 of Tier 2 bron de waarde bevestigt. Tier 3 dient uitsluitend ter triangulatie of inhoudelijke uitleg.**

In het JSON staat de primaire bron in `bron_organisatie`, `bron_url`, `bron_fragment`. Aanvullende bevestigingen staan in het array `triangulatie_bronnen`.

### Triangulatie — wanneer verplicht?

| Situatie | Verplichte triangulatie |
|---|---|
| Primaire bron is Tier 1 | ❌ Niet verplicht (officiële bron volstaat) |
| Primaire bron is Tier 2 | ⚠️ Aanbevolen — niet verplicht |
| Primaire bron is Tier 3 | ✅ **Verplicht** — minstens één Tier 1 of Tier 2 confirmatie |
| Bedrag/percentage wijzigt vergeleken met vorige peildatum | ✅ **Verplicht** — om vergissingen uit te sluiten |

### `overeenstemming` — semantiek

| Waarde | Betekenis |
|---|---|
| `"100%"` | Exact dezelfde waarde gevonden |
| `"verwijzing geverifieerd"` | Bron bevestigt het bestaan/de regel maar niet noodzakelijk de exacte waarde |
| `"gedeeltelijk"` | Afwijking, beschreven in `opmerkingen` |

---

## 4. Statussen

Het veld `status` is **kritisch** — het stuurt of een datapunt mag worden gebruikt in productieberekeningen.

| Status | Bruikbaar voor berekeningen? | Betekenis |
|---|---|---|
| `actief` | ✅ **Ja** | Geldig en geverifieerd op peildatum |
| `mogelijk_verouderd` | ⚠️ Met expliciete waarschuwing | Bron bestaat, waarde is niet bevestigd recenter dan een tijdsdrempel |
| `conflict` | ❌ Nee — eerst conflict resolven | Twee Tier 1/2 bronnen geven afwijkende waarden |
| `niet_gevonden` | ❌ Nee | Het onderwerp is bekend maar geen geschikte bron werd gevonden |
| `gemarkeerd_voor_review` | ❌ Niet zonder review | Reden in `opmerkingen` |

### Hoe om te gaan met `niet_gevonden`?

Een datapunt met status `niet_gevonden` heeft **geen waarde** maar bevat wel `omschrijving` en `opmerkingen` waarom het niet werd opgenomen. De payroll-engine moet voor zulke datapunten ofwel een **fallback** voorzien (federaal regime, ondernemingscao), ofwel de gebruiker waarschuwen.

---

## 5. Normalisatie — `waarde_bron` vs `waarde_genormaliseerd`

### Waarom twee waardevelden?

| Veld | Use case |
|---|---|
| `waarde_bron` | **Audit & verificatie** — wat zegt de bron letterlijk? Bv. `"2,21 %"`, `"€ 330,84"`, `"100 % van prijs treinkaart 2e klasse"` |
| `waarde_genormaliseerd` | **Berekening** — machineleesbaar getal: `0.0221`, `330.84`, `1.0` |

### Normalisatieregels

| Type bron-waarde | Normalisatie |
|---|---|
| Percentage `"2,21 %"` | → `0.0221` (decimaal getal) |
| Percentage als coëfficiënt `"1,0221"` | → `1.0221` |
| Geldbedrag `"€ 2.242,81"` | → `2242.81` (komma → punt, EUR-symbool weg, duizendscheidingstekens weg) |
| Aantal uren/dagen `"650 uren"` | → `650` (integer) |
| Vrije tekst | → `null` |
| Tabel | → `null` (data zit in `tabel_per_*`) |

> Bouw **nooit** zelf een parser op `waarde_bron` — gebruik `waarde_genormaliseerd` voor alle rekenkundige logica. Wanneer `waarde_genormaliseerd` `null` is en je hebt een getal nodig, betekent dit dat de structuur niet eenvoudig genormaliseerd kan worden — verwijs naar `tabel_per_ervaring`/`tabel_per_leeftijd` of behandel als string.

---

## 6. Speciale structuren — barematabellen

Barema's worden niet als 228 aparte datapunten weggeschreven, maar **gecomprimeerd** in 12 datapunten met een sub-array. Dit is een bewuste designkeuze.

### 6.1 `tabel_per_ervaring`

Voor Schaal I en Schaal II:

```json
"tabel_per_ervaring": [
  { "ervaring_jaren": 0,  "maandloon_eur": 2242.81 },
  { "ervaring_jaren": 1,  "maandloon_eur": 2249.57 },
  …
  { "ervaring_jaren": 26, "maandloon_eur": 2459.89 }
]
```

**Lookup-regel:** zoek de regel waar `ervaring_jaren` gelijk is aan, of de hoogste lagere is dan, het aantal jaren ervaring van de werknemer. Vanaf het loonplafond blijft de waarde constant.

### 6.2 `tabel_per_leeftijd`

Voor studentenbarema's:

```json
"tabel_per_leeftijd": [
  { "leeftijd_jaren": 16, "maandloon_eur": 1447.01 },
  { "leeftijd_jaren": 17, "maandloon_eur": 1635.95 },
  …
]
```

**Lookup-regel:** exacte match op leeftijd. Cat C/D bestaan niet voor 16–17-jarigen.

### 6.3 Monotone progressie

Een interne validator heeft gecontroleerd dat **alle** barema's monotoon stijgend zijn (een bediende verdient nooit minder bij meer ervaring binnen dezelfde categorie). Dit is een eenvoudige sanity check die OCR-fouten in PDF-extractie heeft geneutraliseerd.

### 6.4 Bekende OCR-correcties

Twee cellen in de SSN-PDF bevatten OCR-ruis die werd gecorrigeerd via Tier 3 triangulatie (ACV + ACLVB):

| Cel | Foutieve OCR | Gecorrigeerd |
|---|---|---|
| Schaal I, Cat D, jaar 2 | "2.303,07" (zou monotonie breken) | **€ 2.589,26** |
| Schaal II, Cat A, jaar 13 | "2.4.46,31" (extra punt) | **€ 2.446,31** |

---

## 7. Begrippenlijst

| Term | Betekenis |
|---|---|
| **APCB** | Aanvullend Paritair Comité voor Bedienden — officiële naam van PC 200 |
| **Barema** | Tabel met minimumlonen per ervaring (of leeftijd) en categorie |
| **Bijlage III KB/WIB 92** | Koninklijk Besluit met de bedrijfsvoorheffingsschalen, jaarlijks aangepast |
| **BS** | Belgisch Staatsblad — officiële publicatie van wetten en KB's |
| **BV** | Bedrijfsvoorheffing — voorheffing op loon door werkgever afgehouden |
| **BBSZ** | Bijzondere Bijdrage Sociale Zekerheid |
| **CAO** | Collectieve Arbeidsovereenkomst |
| **Centenindex** | Voorgestelde beperking van indexering boven € 4.000 brutoloon (niet toegepast 1/1/2026) |
| **DmfA** | Aangifte sociale zekerheid via RSZ |
| **FBZ** | Fonds voor Bestaanszekerheid (= Sociaal Fonds) |
| **FOD WASO** | Federale Overheidsdienst Werkgelegenheid, Arbeid en Sociaal Overleg |
| **GMMI** | Gewaarborgd Gemiddeld Minimum Inkomen |
| **KB/WIB 92** | Koninklijk Besluit tot uitvoering van het Wetboek van Inkomstenbelastingen 1992 |
| **NAR** | Nationale Arbeidsraad |
| **PC 200 / CP 200** | Paritair Comité 200 (NL) / Commission Paritaire 200 (FR) |
| **RSZ / ONSS** | Rijksdienst voor Sociale Zekerheid (NL) / Office National de Sécurité Sociale (FR) |
| **Schaal I** | Barema voor het eerste jaar in de onderneming |
| **Schaal II** | Barema vanaf het tweede jaar in dezelfde onderneming |
| **Sectorakkoord** | Onderhandelingsresultaat tussen vakbonden en werkgevers binnen een PC, omgezet in CAO |
| **SFonds 200 / sfonds200.be** | Sociaal Fonds APCB — sectorfonds voor PC 200 |
| **Sleutelformule** | Wiskundige formule om bedrijfsvoorheffing te berekenen (FOD Financiën) |
| **SSN** | Sociaal secretariaat dat o.a. PC 200-barema's publiceert |
| **Taxshift** | Hervorming 2016-2020 die werkgeversbijdragen verlaagde (35 % → 25 %) |
| **TWA** | Tewerkstellingsakkoord |
| **VAA** | Voordeel Alle Aard (forfaitair belastbaar voordeel) |
| **VAPZ** | Vrij Aanvullend Pensioen voor Zelfstandigen |
| **VVPR-bis** | Verlaagde roerende voorheffing op dividenden van KMO's |

---

*Laatste herziening van dit document: 2026-05-08 — synchroon met dataset `pc200_payroll_dataset_2026.json`.*
