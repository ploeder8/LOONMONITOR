# Dataset Uitbreiding Voorstel — `pc200_payroll_dataset_2026.json`

**Versie:** 2026-05-08
**Doel:** schema-conforme JSON-voorbeelden voor de ~28 nieuwe Datapunten die nodig zijn om de POC uit te breiden van *bruto + RSZ + sectorale premies* naar een **volledige netto-loonberekening** (PC 200-bediende, IY 2026 / AJ 2027).
**Schema-basis:** identieke structuur als de bestaande Datapunten in `pc200_payroll_dataset_2026.json`. Velden: `id`, `categorie`, `naam`, `omschrijving`, `waarde_bron`, `waarde_genormaliseerd` (of `tabel_per_*`), `eenheid`, `wettelijke_basis`, `bron_organisatie`, `bron_url`, `bron_fragment`, `geldig_vanaf`, `geldig_tot`, `status`, `betrouwbaarheid`, `triangulatie_bronnen`, `laatst_bevestigd_op`, `opmerkingen`.
**Cross-reference:** `netto_calculator_specificatie.md` Bijlage A (ID-conventie), `sources_guideline.md` §3 (bronnen per bouwsteen).

---

## Inhoudstafel

1. [Toevoegingen per dataset-categorie](#1-toevoegingen-per-dataset-categorie)
2. [Categorie `rsz` — sociale werkbonus](#2-categorie-rsz--sociale-werkbonus)
3. [Categorie `fiscaliteit` — bedrijfsvoorheffing & verminderingen](#3-categorie-fiscaliteit--bedrijfsvoorheffing--verminderingen)
4. [Categorie `fiscaliteit` — werkbonus fiscaal](#4-categorie-fiscaliteit--werkbonus-fiscaal)
5. [Categorie `rsz` — BBSZ](#5-categorie-rsz--bbsz)
6. [Categorie `fiscaliteit` — VAA](#6-categorie-fiscaliteit--vaa)
7. [Categorie `fiscaliteit` — kerncijfers AJ 2027](#7-categorie-fiscaliteit--kerncijfers-aj-2027)
8. [Categorie `lonen` — GGMMI 1/4/2026](#8-categorie-lonen--ggmmi-142026)
9. [Promotie van bestaande `pb_schijven_inkomstenjaar_2026`](#9-promotie-van-bestaand-datapunt)
10. [Validatie-checklist na merge](#10-validatie-checklist-na-merge)

---

## 1. Toevoegingen per dataset-categorie

| Categorie (bestaand) | Toe te voegen Datapunten | Aantal |
|---|---|---|
| `rsz` | `werkbonus_sociaal_luik_A_2026`, `werkbonus_sociaal_luik_B_2026`, `bbsz_2026_q1` | 3 |
| `fiscaliteit` | `bv_2026_kb_bijlage_iii`, `bv_schaal_I_2026`, `bv_schaal_II_2026`, `bv_schaal_III_2026`, `bv_vermindering_kinderen_2026`, `bv_vermindering_andere_persoon_2026`, `bv_vermindering_alleenstaande_kind_2026`, `bv_vermindering_groepsverzekering_2026`, `bv_bijzondere_schaal_eindejaar_2026`, `werkbonus_fiscaal_2026`, `vaa_bedrijfswagen_min_2026`, `vaa_bedrijfswagen_co2_diesel_2026`, `vaa_bedrijfswagen_co2_benzine_2026`, `vaa_pc_forfait_2026`, `vaa_internet_forfait_2026`, `vaa_gsm_forfait_2026`, `vaa_telefoonabo_forfait_2026`, `vaa_tablet_forfait_2026`, `vaa_huisvesting_multiplier_2026`, `vaa_verwarming_andere_2026`, `vaa_elektriciteit_andere_2026`, `forfait_beroepskosten_aj2027`, `belastingvrije_som_aj2027`, `pb_schijven_aj2027`, `fiscaal_indexcoefficient_aj2027` | 25 |
| `lonen` | `ggmmi_2026_q2` | 1 |
| **Totaal nieuwe Datapunten** | | **29** |

> **Schema-impact:** geen nieuwe top-level arrays nodig — alle uitbreidingen passen binnen bestaande categorieën. Wel uitbreiden van JSON Schema (`src/data/pc200_payroll_dataset.schema.json`) met optionele velden:
> - `tabel_per_aantal_kinderen` (object: `{0: number, 1: number, ...}`)
> - `range_min` / `range_max` (number) — voor BBSZ-band
> - `formule_helling` / `formule_drempel_S0` / `formule_max_R` (number) — voor werkbonus
> - `pct_luik_A` / `pct_luik_B` (number) — voor fiscale werkbonus

---

## 2. Categorie `rsz` — sociale werkbonus

### 2.1 `werkbonus_sociaal_luik_A_2026`

```json
{
  "id": "werkbonus_sociaal_luik_A_2026",
  "categorie": "rsz",
  "naam": "Sociale werkbonus — Luik A bedienden vanaf 1/4/2026",
  "omschrijving": "Vermindering persoonlijke RSZ-bijdrage 13,07% voor lage refertemaandlonen. Formule: R = 125,04 − 0,2738 × (S − 2.880,32) wanneer S > 2.880,32; R = 125,04 wanneer S ≤ 2.880,32; R = 0 wanneer S ≥ 3.336,98.",
  "waarde_bron": "max R = 125,04 EUR, drempel S₀ = 2.880,32 EUR, helling = 0,2738",
  "waarde_genormaliseerd": null,
  "formule_max_R": 125.04,
  "formule_drempel_S0": 2880.32,
  "formule_helling": 0.2738,
  "formule_cutoff_S": 3336.98,
  "eenheid": "EUR/maand",
  "wettelijke_basis": "Programmawet 18 juli 2025 (BS 29/7/2025) art. ... + KB uitvoering werkbonus 2026",
  "bron_organisatie": "RSZ",
  "bron_url": "https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/",
  "bron_fragment": "Vanaf 1 april 2026 bedraagt de maximale werkbonus voor Luik A €125,04/maand (drempel S₀ = €2.880,32, helling 0,2738).",
  "geldig_vanaf": "2026-04-01",
  "geldig_tot": null,
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Liantis", "url": "https://www.liantis.be/", "tier": 2},
    {"organisatie": "Daenens", "url": "https://www.daenens.be/", "tier": 2},
    {"organisatie": "Securex", "url": "https://www.securex.be/", "tier": 2},
    {"organisatie": "Attentia", "url": "https://www.attentia.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Viervoudige Tier-2 numerieke convergentie. Formule wordt run-time toegepast in src/lib/werkbonus.ts; dataset geeft alleen parameters. Vóór 1/4/2026 gelden lagere 1/1/2026-cijfers — implementeer fallback-pad."
}
```

### 2.2 `werkbonus_sociaal_luik_B_2026`

```json
{
  "id": "werkbonus_sociaal_luik_B_2026",
  "categorie": "rsz",
  "naam": "Sociale werkbonus — Luik B bedienden vanaf 1/4/2026",
  "omschrijving": "Vermindering persoonlijke RSZ-bijdrage 13,07% voor zeer lage refertemaandlonen. Formule: R = 168,62 − 0,2699 × (S − 2.255,50) wanneer S > 2.255,50; R = 168,62 wanneer S ≤ 2.255,50; R = 0 wanneer S ≥ 2.880,32. Cumulatief met Luik A.",
  "waarde_bron": "max R = 168,62 EUR, drempel S₀ = 2.255,50 EUR, helling = 0,2699",
  "waarde_genormaliseerd": null,
  "formule_max_R": 168.62,
  "formule_drempel_S0": 2255.50,
  "formule_helling": 0.2699,
  "formule_cutoff_S": 2880.32,
  "eenheid": "EUR/maand",
  "wettelijke_basis": "Programmawet 18 juli 2025 (BS 29/7/2025) + KB uitvoering werkbonus 2026",
  "bron_organisatie": "RSZ",
  "bron_url": "https://www.socialsecurity.be/citizen/nl/static/applics/findmybonus/",
  "bron_fragment": "Vanaf 1 april 2026 bedraagt de maximale werkbonus voor Luik B €168,62/maand (drempel S₀ = €2.255,50, helling 0,2699).",
  "geldig_vanaf": "2026-04-01",
  "geldig_tot": null,
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Liantis", "url": "https://www.liantis.be/", "tier": 2},
    {"organisatie": "Daenens", "url": "https://www.daenens.be/", "tier": 2},
    {"organisatie": "Securex", "url": "https://www.securex.be/", "tier": 2},
    {"organisatie": "Attentia", "url": "https://www.attentia.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Cumulatief op te tellen bij Luik A. GGMMI €2.189,81 (1/4/2026) ligt binnen Luik B-bereik → quasi-volledige RSZ-vrijstelling op GGMMI-niveau."
}
```

---

## 3. Categorie `fiscaliteit` — bedrijfsvoorheffing & verminderingen

### 3.1 `bv_2026_kb_bijlage_iii`

```json
{
  "id": "bv_2026_kb_bijlage_iii",
  "categorie": "fiscaliteit",
  "naam": "Bedrijfsvoorheffing 2026 — KB Bijlage III sleutelformule",
  "omschrijving": "Sleutelformule (geen vaste tabel) voor BV-berekening op maandelijks belastbare bezoldigingen. Toepassing per Schaal I (alleenstaande / 2 inkomens), Schaal II (eenverdiener), Schaal III (niet-inwoner). Verminderd met BV-verminderingen (kinderen, andere persoon, alleenstaande met kind, groepsverzekering, fiscale werkbonus).",
  "waarde_bron": "Sleutelformule met progressieve coëfficiënten — exacte coëfficiënten in KB-bijlage",
  "waarde_genormaliseerd": null,
  "eenheid": "EUR/maand (afgeleid via formule)",
  "wettelijke_basis": "KB 11 december 2025 tot wijziging KB/WIB 92 inzake Bijlage III, Belgisch Staatsblad 29 december 2025",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening",
  "bron_fragment": "De bedrijfsvoorheffing op bezoldigingen van werknemers wordt vanaf 1 januari 2026 berekend volgens de sleutelformule opgenomen in Bijlage III bij het KB/WIB 92, gewijzigd door het KB van 11 december 2025.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief_via_externe_simulator",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Securex", "url": "https://www.securex.be/", "tier": 2},
    {"organisatie": "CLB Group", "url": "https://www.clbgroup.be/", "tier": 2},
    {"organisatie": "Partena Professional", "url": "https://www.partena-professional.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "POC-fase 1: geen lokale berekening — UI linkt naar FOD Fin Tax-Calc. POC-fase 2: eigen TS-implementatie met KB-coëfficiënten als constants in src/lib/bv.ts, gevalideerd tegen FOD Fin BV-simulator (≤ €2 afwijking voor 18/20 testcases)."
}
```

### 3.2 `bv_vermindering_kinderen_2026`

```json
{
  "id": "bv_vermindering_kinderen_2026",
  "categorie": "fiscaliteit",
  "naam": "BV-vermindering voor kinderen ten laste 2026",
  "omschrijving": "Maandbedrag dat van de bedrijfsvoorheffing wordt afgetrokken op basis van het aantal kinderen ten laste. Een gehandicapt kind telt dubbel (extra €52 per gehandicapt kind bovenop de gewone telling).",
  "waarde_bron": "Tabel per aantal kinderen — KB Bijlage III 2026",
  "waarde_genormaliseerd": null,
  "tabel_per_aantal_kinderen": {
    "0": 0,
    "1": 52,
    "2": 138,
    "3": 367,
    "4": 635,
    "5": 925,
    "6": 1216,
    "7": 1510,
    "8": 1833,
    "9_plus_per_extra": 345
  },
  "extra_per_gehandicapt_kind": 52,
  "eenheid": "EUR/maand",
  "wettelijke_basis": "KB 11 december 2025 tot wijziging KB/WIB 92 inzake Bijlage III, BS 29/12/2025",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://www.ejustice.just.fgov.be/",
  "bron_fragment": "De vermindering voor kinderen ten laste bedraagt per maand: 1 kind €52, 2 kinderen €138, 3 kinderen €367, 4 kinderen €635 (...).",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2},
    {"organisatie": "Attentia", "url": "https://www.attentia.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Status `mogelijk_verouderd` tot rechtstreekse Tier-1 extractie uit KB-tekst BS 29/12/2025. Werkbasis = Acerta + Attentia convergentie. Promoveer naar `actief` na directe KB-verificatie."
}
```

### 3.3 `bv_vermindering_andere_persoon_2026`

```json
{
  "id": "bv_vermindering_andere_persoon_2026",
  "categorie": "fiscaliteit",
  "naam": "BV-vermindering voor andere persoon ten laste 2026",
  "omschrijving": "Maandbedrag van €52 per andere persoon ten laste (bv. ouder, broer/zus 65+). Gehandicapte persoon telt dubbel.",
  "waarde_bron": "€52/maand basis, dubbel voor gehandicapt",
  "waarde_genormaliseerd": 52.00,
  "extra_voor_gehandicapt": 52.00,
  "eenheid": "EUR/maand",
  "wettelijke_basis": "KB 11 december 2025 (BS 29/12/2025) — Bijlage III KB/WIB 92",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://www.ejustice.just.fgov.be/",
  "bron_fragment": "Voor elke andere persoon ten laste wordt €52/maand afgetrokken; gehandicapt = €104/maand.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Attentia", "url": "https://www.attentia.be/", "tier": 2},
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Status `mogelijk_verouderd` — exact 2026-bedrag pending Tier-1 extractie."
}
```

### 3.4 `bv_vermindering_alleenstaande_kind_2026`

```json
{
  "id": "bv_vermindering_alleenstaande_kind_2026",
  "categorie": "fiscaliteit",
  "naam": "BV-vermindering fiscaal alleenstaande met kinderen ten laste 2026",
  "omschrijving": "Bovenop de gewone kindvermindering: extra €52/maand wanneer de werknemer fiscaal alleenstaande is met minstens 1 kind ten laste.",
  "waarde_bron": "€52/maand bovenop kindvermindering",
  "waarde_genormaliseerd": 52.00,
  "eenheid": "EUR/maand",
  "wettelijke_basis": "KB 11 december 2025 (BS 29/12/2025) — Bijlage III KB/WIB 92",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://www.ejustice.just.fgov.be/",
  "bron_fragment": "Een bijkomende vermindering van €52/maand wordt toegekend aan een fiscaal alleenstaande met kinderen ten laste.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Attentia", "url": "https://www.attentia.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Eén Tier-2 alleenstaand → triangulatie verbeteren."
}
```

### 3.5 `bv_vermindering_groepsverzekering_2026`

```json
{
  "id": "bv_vermindering_groepsverzekering_2026",
  "categorie": "fiscaliteit",
  "naam": "BV-vermindering eigen werknemers-bijdrage groepsverzekering 2026",
  "omschrijving": "30% van de werknemers eigen bijdrage aan groepsverzekering wordt afgetrokken van de bedrijfsvoorheffing.",
  "waarde_bron": "30% × eigen werknemersbijdrage groepsverzekering",
  "waarde_genormaliseerd": 0.30,
  "eenheid": "ratio (toegepast op eigen bijdrage)",
  "wettelijke_basis": "KB Bijlage III KB/WIB 92 — vermindering BV groepsverzekering",
  "bron_organisatie": "Partena Professional",
  "bron_url": "https://www.partena-professional.be/",
  "bron_fragment": "De eigen werknemersbijdrage aan een groepsverzekering geeft recht op een vermindering van de bedrijfsvoorheffing gelijk aan 30% van die bijdrage.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Stabiel regime sinds jaren. UI: input-veld 'eigen maandbijdrage groepsverzekering'."
}
```

### 3.6 `bv_bijzondere_schaal_eindejaar_2026`

```json
{
  "id": "bv_bijzondere_schaal_eindejaar_2026",
  "categorie": "fiscaliteit",
  "naam": "Bijzondere BV-schaal eindejaarspremie / dubbel vakantiegeld 2026",
  "omschrijving": "Bijzondere bedrijfsvoorheffing-schaal toegepast op niet-recurrente bezoldigingen (eindejaarspremie, dubbel vakantiegeld). Tarief tussen 17,16% en 23,22% afhankelijk van het referentieloon.",
  "waarde_bron": "Glijdende schaal 17,16% – 23,22%",
  "waarde_genormaliseerd": null,
  "tarief_min": 0.1716,
  "tarief_max": 0.2322,
  "eenheid": "ratio op brutopremie",
  "wettelijke_basis": "KB Bijlage III KB/WIB 92 2026 — bijzondere schaal niet-recurrente bezoldigingen",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://www.ejustice.just.fgov.be/",
  "bron_fragment": "Voor de eindejaarspremie en het dubbel vakantiegeld wordt een afzonderlijke schaal toegepast met tarieven tussen 17,16% en 23,22%.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2},
    {"organisatie": "SSN", "url": "https://www.ssn.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Volledige tabel per refertejaarloon op te halen uit KB Bijlage III. Werkbasis voor POC: range tonen (17,16% – 23,22%)."
}
```

---

## 4. Categorie `fiscaliteit` — werkbonus fiscaal

### 4.1 `werkbonus_fiscaal_2026`

```json
{
  "id": "werkbonus_fiscaal_2026",
  "categorie": "fiscaliteit",
  "naam": "Fiscale werkbonus 2026 — belastingkrediet op BV",
  "omschrijving": "Vermindering van de bedrijfsvoorheffing gelijk aan 33,14% van de toegekende sociale werkbonus Luik A + 52,54% van Luik B. Cumuleerbaar.",
  "waarde_bron": "33,14% × Luik A + 52,54% × Luik B",
  "waarde_genormaliseerd": null,
  "pct_luik_A": 0.3314,
  "pct_luik_B": 0.5254,
  "eenheid": "ratio op werkbonus",
  "wettelijke_basis": "Art. 154bis WIB 92 + KB Bijlage III 2026",
  "bron_organisatie": "Partena Professional",
  "bron_url": "https://www.partena-professional.be/",
  "bron_fragment": "De fiscale werkbonus 2026 bedraagt 33,14% van Luik A en 52,54% van Luik B van de sociale werkbonus en wordt afgetrokken van de bedrijfsvoorheffing.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Liantis", "url": "https://www.liantis.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Wetsontwerp Arizona stelt 35% / 63% voor — markeer als `[hypothesis]` zodra wetsontwerp gepubliceerd, NIET implementeren tot BS-publicatie."
}
```

---

## 5. Categorie `rsz` — BBSZ

### 5.1 `bbsz_2026_q1`

```json
{
  "id": "bbsz_2026_q1",
  "categorie": "rsz",
  "naam": "Bijzondere bijdrage sociale zekerheid 2026 — kwartaal 1",
  "omschrijving": "Maandelijkse inhouding gestaffeld per kwartaal-gezinsinkomstenband. Range 2026: €0/maand (laagste band) tot ≈ €60,94/maand (plafondband).",
  "waarde_bron": "Range €0 – €60,94/maand",
  "waarde_genormaliseerd": null,
  "range_min": 0.00,
  "range_max": 60.94,
  "eenheid": "EUR/maand (info-band)",
  "wettelijke_basis": "Wet 30 maart 1994 + jaarlijkse RSZ-instructie",
  "bron_organisatie": "RSZ",
  "bron_url": "https://www.socialsecurity.be/employer/instructions/",
  "bron_fragment": "De bijzondere bijdrage sociale zekerheid wordt maandelijks ingehouden volgens schalen die jaarlijks in de RSZ administratieve instructies worden gepubliceerd.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-03-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "SSN", "url": "https://www.ssn.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Status WEAK — geen Tier-1 gestructureerde tabel publiek geverifieerd op peildatum. UI toont info-band (€0 – €60,94) zonder geprecíseerd bedrag. Aanvullen na publicatie RSZ-instructie kw1/2026."
}
```

---

## 6. Categorie `fiscaliteit` — VAA

### 6.1 `vaa_bedrijfswagen_min_2026`

```json
{
  "id": "vaa_bedrijfswagen_min_2026",
  "categorie": "fiscaliteit",
  "naam": "VAA bedrijfswagen — minimum jaarbedrag 2026",
  "omschrijving": "Wettelijk minimum voordeel alle aard voor terbeschikkingstelling bedrijfswagen voor privégebruik. Geïndexeerd jaarlijks.",
  "waarde_bron": "€1.690/jaar",
  "waarde_genormaliseerd": 1690.00,
  "eenheid": "EUR/jaar",
  "wettelijke_basis": "Art. 36 §2 WIB 92 + jaarlijks KB",
  "bron_organisatie": "fibofin.be",
  "bron_url": "https://www.fibofin.be/",
  "bron_fragment": "Minimum VAA bedrijfswagen 2026: €1.690 per jaar.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Tier-2 alleenstaand → markeer WEAK tot AAFisc-circulaire 2026 rechtstreeks gefetcht."
}
```

### 6.2 `vaa_bedrijfswagen_co2_diesel_2026`

```json
{
  "id": "vaa_bedrijfswagen_co2_diesel_2026",
  "categorie": "fiscaliteit",
  "naam": "VAA bedrijfswagen — referentie-CO2 diesel 2026",
  "waarde_bron": "58 g/km",
  "waarde_genormaliseerd": 58,
  "eenheid": "g CO2/km",
  "wettelijke_basis": "Art. 36 §2 WIB 92 + jaarlijks KB",
  "bron_organisatie": "fibofin.be",
  "bron_url": "https://www.fibofin.be/",
  "bron_fragment": "Referentie-CO2-uitstoot diesel 2026: 58 g/km.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [],
  "laatst_bevestigd_op": "2026-05-08"
}
```

### 6.3 `vaa_bedrijfswagen_co2_benzine_2026`

```json
{
  "id": "vaa_bedrijfswagen_co2_benzine_2026",
  "categorie": "fiscaliteit",
  "naam": "VAA bedrijfswagen — referentie-CO2 benzine/LPG/CNG 2026",
  "waarde_bron": "70 g/km",
  "waarde_genormaliseerd": 70,
  "eenheid": "g CO2/km",
  "wettelijke_basis": "Art. 36 §2 WIB 92 + jaarlijks KB",
  "bron_organisatie": "fibofin.be",
  "bron_url": "https://www.fibofin.be/",
  "bron_fragment": "Referentie-CO2-uitstoot benzine/LPG/aardgas 2026: 70 g/km.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "mogelijk_verouderd",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [],
  "laatst_bevestigd_op": "2026-05-08"
}
```

### 6.4 VAA forfaits ICT (statisch sinds KB 25/11/2017)

```json
[
  {
    "id": "vaa_pc_forfait_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA PC ter beschikking — forfait jaarbedrag",
    "waarde_genormaliseerd": 72.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "KB 25 november 2017 — VAA ICT-middelen",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2018-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1
  },
  {
    "id": "vaa_internet_forfait_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA internetaansluiting — forfait jaarbedrag",
    "waarde_genormaliseerd": 60.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "KB 25 november 2017",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2018-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1
  },
  {
    "id": "vaa_gsm_forfait_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA GSM-toestel — forfait jaarbedrag",
    "waarde_genormaliseerd": 36.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "KB 25 november 2017",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2018-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1
  },
  {
    "id": "vaa_telefoonabo_forfait_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA telefoonabonnement (privégebruik) — forfait jaarbedrag",
    "waarde_genormaliseerd": 48.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "KB 25 november 2017",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2018-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1
  },
  {
    "id": "vaa_tablet_forfait_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA tablet — forfait jaarbedrag",
    "waarde_genormaliseerd": 36.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "KB 25 november 2017",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2018-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1
  }
]
```

### 6.5 VAA huisvesting & energie

```json
[
  {
    "id": "vaa_huisvesting_multiplier_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA gratis huisvesting — multiplier KI",
    "omschrijving": "Formule niet-bemeubeld: geïndexeerd KI × 100/60 × 2. Bemeubeld: × 5/3 daarbovenop. Single multiplier '×2' sinds Programmawet 27/12/2021 + KB 27/5/2022 (vroeger 1,25 / 3,8).",
    "waarde_bron": "geïndexeerd KI × 100/60 × 2 (× 5/3 indien bemeubeld)",
    "waarde_genormaliseerd": null,
    "multiplier_basis": 2,
    "multiplier_bemeubeld_extra": 1.6667,
    "eenheid": "EUR/jaar (afgeleid)",
    "wettelijke_basis": "Programmawet 27 december 2021 + KB 27 mei 2022",
    "bron_organisatie": "FOD Financiën",
    "bron_url": "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_alle_aard",
    "geldig_vanaf": "2022-01-01",
    "geldig_tot": null,
    "status": "actief",
    "betrouwbaarheid": 1,
    "opmerkingen": "Indexcoëfficiënt KI = 2,3000 voor AJ 2027 (zie fiscaal_indexcoefficient_aj2027)."
  },
  {
    "id": "vaa_verwarming_andere_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA verwarming — andere werknemers (niet-bedrijfsleider)",
    "waarde_genormaliseerd": 1150.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "Jaarlijks KB VAA-forfaits",
    "bron_organisatie": "fibofin.be",
    "bron_url": "https://www.fibofin.be/",
    "geldig_vanaf": "2026-01-01",
    "geldig_tot": "2026-12-31",
    "status": "mogelijk_verouderd",
    "betrouwbaarheid": 2,
    "opmerkingen": "Voor bedrijfsleider: €2.560/jaar (apart datapunt indien nodig)."
  },
  {
    "id": "vaa_elektriciteit_andere_2026",
    "categorie": "fiscaliteit",
    "naam": "VAA elektriciteit (niet voor verwarming) — andere werknemers",
    "waarde_genormaliseerd": 580.00,
    "eenheid": "EUR/jaar",
    "wettelijke_basis": "Jaarlijks KB VAA-forfaits",
    "bron_organisatie": "fibofin.be",
    "bron_url": "https://www.fibofin.be/",
    "geldig_vanaf": "2026-01-01",
    "geldig_tot": "2026-12-31",
    "status": "mogelijk_verouderd",
    "betrouwbaarheid": 2,
    "opmerkingen": "Voor bedrijfsleider: €1.280/jaar."
  }
]
```

---

## 7. Categorie `fiscaliteit` — kerncijfers AJ 2027

### 7.1 `forfait_beroepskosten_aj2027`

```json
{
  "id": "forfait_beroepskosten_aj2027",
  "categorie": "fiscaliteit",
  "naam": "Forfaitaire beroepskosten werknemer AJ 2027 (IY 2026)",
  "omschrijving": "30% van het bruto belastbaar inkomen, met absoluut plafond €6.070. Drempel maximaal forfait bereikt vanaf bruto belastbaar ≥ €20.233,33.",
  "waarde_bron": "30% met plafond €6.070",
  "waarde_genormaliseerd": 6070.00,
  "tarief_pct": 0.30,
  "drempel_max_forfait_bereikt": 20233.33,
  "eenheid": "EUR/jaar (plafond)",
  "wettelijke_basis": "Art. 51 WIB 92 + art. 178 §3 WIB 92 (indexering)",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen",
  "bron_fragment": "Voor aanslagjaar 2027 bedraagt het forfaitair plafond beroepskosten werknemer €6.070.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Practicali", "url": "https://www.practicali.be/", "tier": 2},
    {"organisatie": "Wolters Kluwer", "url": "https://www.wolterskluwer.com/", "tier": 2},
    {"organisatie": "Cultuurloket", "url": "https://www.cultuurloket.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08"
}
```

### 7.2 `belastingvrije_som_aj2027`

```json
{
  "id": "belastingvrije_som_aj2027",
  "categorie": "fiscaliteit",
  "naam": "Belastingvrije som AJ 2027",
  "omschrijving": "Basisbedrag voor de PB-aangifte AJ 2027. Geen onderscheid hoog/laag inkomen sinds hervorming 2024.",
  "waarde_bron": "€11.180",
  "waarde_genormaliseerd": 11180.00,
  "eenheid": "EUR/jaar",
  "wettelijke_basis": "Art. 131 WIB 92 + indexering art. 178 §3 WIB 92",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten",
  "bron_fragment": "Belastingvrije som AJ 2027 (inkomstenjaar 2026): €11.180.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Wolters Kluwer", "url": "https://www.wolterskluwer.com/", "tier": 2},
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2},
    {"organisatie": "Practicali", "url": "https://www.practicali.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Acerta noemt soms €11.170 in BV-context (afronding via sleutelformule). Beide correct in eigen context: €11.180 voor PB-aangifte, €11.170 voor BV-inhouding."
}
```

### 7.3 `pb_schijven_aj2027`

```json
{
  "id": "pb_schijven_aj2027",
  "categorie": "fiscaliteit",
  "naam": "Personenbelasting tariefschijven AJ 2027 (inkomsten 2026)",
  "omschrijving": "Vier progressieve schijven van toepassing op het belastbaar inkomen. Tarieven 25/40/45/50%.",
  "waarde_bron": "Tabel met 4 schijven",
  "waarde_genormaliseerd": null,
  "tabel_per_schijf": [
    {"van": 0, "tot": 16720, "tarief": 0.25},
    {"van": 16720, "tot": 29510, "tarief": 0.40},
    {"van": 29510, "tot": 51070, "tarief": 0.45},
    {"van": 51070, "tot": null, "tarief": 0.50}
  ],
  "eenheid": "EUR + ratio",
  "wettelijke_basis": "Art. 130 WIB 92 + indexering art. 178 §3 WIB 92",
  "bron_organisatie": "FOD Financiën",
  "bron_url": "https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten",
  "bron_fragment": "Schijven AJ 2027: 25% tot €16.720, 40% tot €29.510, 45% tot €51.070, 50% boven €51.070.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Wolters Kluwer (Jef Wellens)", "url": "https://www.wolterskluwer.com/", "tier": 2},
    {"organisatie": "Practicali", "url": "https://www.practicali.be/", "tier": 2},
    {"organisatie": "NCOI", "url": "https://www.ncoi.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "PROMOTIE: bestaande Datapunt `pb_schijven_inkomstenjaar_2026` heeft status `niet_gevonden` → kan op basis van Tier-1 + drievoudige Tier-2 corroboratie naar `actief` worden gepromoveerd onder ID `pb_schijven_aj2027`."
}
```

### 7.4 `fiscaal_indexcoefficient_aj2027`

```json
{
  "id": "fiscaal_indexcoefficient_aj2027",
  "categorie": "fiscaliteit",
  "naam": "Fiscale indexatiecoëfficiënt KI AJ 2027",
  "omschrijving": "Indexatiecoëfficiënt voor vermenigvuldiging van het kadastraal inkomen en bepaalde fiscale grondslagen. AJ 2026 = 2,2446 → AJ 2027 = 2,3000.",
  "waarde_bron": "2,3000",
  "waarde_genormaliseerd": 2.3000,
  "eenheid": "ratio",
  "wettelijke_basis": "Art. 178 §2 WIB 92",
  "bron_organisatie": "BDO",
  "bron_url": "https://www.bdo.be/",
  "bron_fragment": "Indexatiecoëfficiënt KI AJ 2027 = 2,3000.",
  "geldig_vanaf": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "status": "actief",
  "betrouwbaarheid": 2,
  "triangulatie_bronnen": [
    {"organisatie": "Practicali", "url": "https://www.practicali.be/", "tier": 2},
    {"organisatie": "Wolters Kluwer", "url": "https://www.wolterskluwer.com/", "tier": 2},
    {"organisatie": "NCOI", "url": "https://www.ncoi.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08",
  "opmerkingen": "Toepassing: VAA gratis huisvesting (KI × 2,3000 × 100/60 × 2). Drievoudige Tier-2 → HIGH confidence."
}
```

---

## 8. Categorie `lonen` — GGMMI 1/4/2026

### 8.1 `ggmmi_2026_q2`

```json
{
  "id": "ggmmi_2026_q2",
  "categorie": "lonen",
  "naam": "GGMMI vanaf 1 april 2026",
  "omschrijving": "Gemiddeld minimum maandinkomen — referentie voor werkbonus-grenzen en flexi-uurloon. Was €2.154,11 op 1/1/2026, verhoogd met €35,70 per CAO NAR 43/18 van 24 maart 2026.",
  "waarde_bron": "€2.189,81/maand",
  "waarde_genormaliseerd": 2189.81,
  "eenheid": "EUR/maand (voltijds, 21+ jaar)",
  "wettelijke_basis": "CAO 43 ondertekend NAR (Nationale Arbeidsraad), wijziging via CAO 43/18 van 24 maart 2026",
  "bron_organisatie": "FOD WASO",
  "bron_url": "https://werk.belgie.be/",
  "bron_fragment": "Vanaf 1 april 2026 bedraagt het GGMMI €2.189,81/maand voor voltijdse tewerkstelling.",
  "geldig_vanaf": "2026-04-01",
  "geldig_tot": null,
  "status": "actief",
  "betrouwbaarheid": 1,
  "triangulatie_bronnen": [
    {"organisatie": "Acerta", "url": "https://www.acerta.be/", "tier": 2},
    {"organisatie": "Liantis", "url": "https://www.liantis.be/", "tier": 2}
  ],
  "laatst_bevestigd_op": "2026-05-08"
}
```

---

## 9. Promotie van bestaand Datapunt

### 9.1 `pb_schijven_inkomstenjaar_2026` → `pb_schijven_aj2027`

**Huidige stand in dataset:** `status: niet_gevonden`

**Voorstel:** vervangen door `pb_schijven_aj2027` zoals gespecificeerd in §7.3 hierboven.

**Migratiestap:**
1. Verwijder `pb_schijven_inkomstenjaar_2026` uit `categorie: fiscaliteit` array.
2. Voeg `pb_schijven_aj2027` toe (zie §7.3).
3. Update referenties in `src/lib/`-modules (zoek op de oude ID).
4. Update tests in `src/lib/__tests__/` waar de oude ID gebruikt werd.

---

## 10. Validatie-checklist na merge

Voer onderstaande na het toevoegen van alle nieuwe Datapunten in `pc200_payroll_dataset_2026.json`:

### Schema-validatie

- [ ] `pnpm typecheck` slaagt zonder errors
- [ ] `bun test src/lib/__tests__/schema.test.ts` groen — alle nieuwe Datapunten matchen het uitgebreide schema
- [ ] Startup-gate (`src/main.tsx`) valideert succesvol — geen rode error-screen

### Audit-trail invariant

- [ ] Elke nieuwe Datapunt heeft niet-leeg `bron_url` veld
- [ ] Elke nieuwe Datapunt met `betrouwbaarheid: 3` heeft minstens 1 entry in `triangulatie_bronnen`
- [ ] Alle `waarde_bron`-velden bevatten exact citaat zoals gepubliceerd door de bron (≤ 200 karakters)
- [ ] Geen runtime-arithmetic in `src/lib/`-modules op `waarde_bron`-velden — uitsluitend `waarde_genormaliseerd`, `tabel_per_*`, `formule_*` of `range_*`

### Periode-guards

- [ ] `safeGetValue` werkt correct voor alle nieuwe Datapunten met `geldig_vanaf` / `geldig_tot`
- [ ] Test-cases met `referentiedatum < 2026-04-01` triggeren fallback voor werkbonus (1/1/2026-cijfers)
- [ ] Test-cases met `referentiedatum < 2026-01-01` werpen `DatapuntNietGeldigOpDatum` voor BV-coëfficiënten 2026

### UI-coherentie

- [ ] Audit-paneel toont nieuwe `bron_url`'s als klikbare links
- [ ] Status-iconen (`actief` ✓, `mogelijk_verouderd` ⚠️, `actief_via_externe_simulator` ↗) worden correct gerenderd
- [ ] BBSZ-band (range €0 – €60,94) wordt als info-veld getoond, niet als geprecíseerd bedrag
- [ ] BV-paneel toont link naar [FOD Fin Tax-Calc](https://eservices.minfin.fgov.be/taxcalc/) in fase 1

### Test-coverage

- [ ] 15 NTC-cases (`netto.test.ts` NTC-01..NTC-15) slagen — zie `netto_calculator_specificatie.md` §9
- [ ] Werkbonus-grenscases (NTC-11, NTC-12, NTC-13) verifiëren formule-randwaarden exact
- [ ] Voor fase 2: BV-cross-check tegen FOD Fin Tax-Calc voor 20 testcases binnen ±€2

### Meta-data update

- [ ] `meta.laatste_update` in `pc200_payroll_dataset_2026.json` bijgewerkt naar `2026-05-08` (of latere mergedatum)
- [ ] `meta.aantal_datapunten` opgehoogd van 43 → 72 (bij toevoeging van alle 29 nieuwe)
- [ ] `meta.aantal_bronnen` bijgewerkt (zie `sources_guideline.md`-bronnenlijst)
- [ ] CHANGELOG/`README.md`-tabel "Bekende beperkingen" geactualiseerd: punt 1 ("Geen netto-berekening") wordt afgewerkt of geherformuleerd

---

*Versie 2026-05-08. Sluit aan op `netto_calculator_specificatie.md`, `sources_guideline.md`, `gaps_en_pending.md`. Te onderhouden volgens `_DEVELOPER.md` §8.2.*
