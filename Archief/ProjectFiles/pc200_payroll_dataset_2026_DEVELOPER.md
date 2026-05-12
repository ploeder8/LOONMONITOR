# DEVELOPER — PC 200 Payroll Dataset 2026

**Bestand:** `pc200_payroll_dataset_2026.json`
**Versie:** 2026-05-08
**Doelpubliek:** developers die dit dataset in een payroll-engine of monitoring-tool integreren, en de personen die het dataset onderhouden.
**Taal van het dataset:** Nederlands (nl-BE)

> **Lees eerst** [`pc200_payroll_dataset_2026_CORE.md`](pc200_payroll_dataset_2026_CORE.md) — daar staat de gedeelde kern (datamodel, statussen, normalisatie, baremastructuur, bronnenhiërarchie, begrippenlijst). Dit document focust op **hoe** je het dataset gebruikt en onderhoudt.
>
> Voor inhoudelijke verificatie: zie [`pc200_payroll_dataset_2026_VERIFICATIE.md`](pc200_payroll_dataset_2026_VERIFICATIE.md).
>
> Dit document groeit later uit tot de volledige **tool-documentatie** (lookup-API, payroll-engine, CI-pipeline, deployment).

---

## Inhoudstafel

1. [Quickstart — dataset inladen](#1-quickstart--dataset-inladen)
2. [Lookup-patronen](#2-lookup-patronen)
3. [Periode-filtering](#3-periode-filtering)
4. [Domeinspecifieke berekeningen](#4-domeinspecifieke-berekeningen)
5. [Defensieve toegangscontrole](#5-defensieve-toegangscontrole)
6. [JSON Schema-validatie](#6-json-schema-validatie)
7. [CI-test-scenario's](#7-ci-test-scenarios)
8. [Onderhoud & update-workflow](#8-onderhoud--update-workflow)
9. [Backwards-compatibility](#9-backwards-compatibility)
10. [Bekende beperkingen — implicaties voor implementatie](#10-bekende-beperkingen--implicaties-voor-implementatie)
11. [Roadmap — van dataset naar tool](#11-roadmap--van-dataset-naar-tool)

---

## 1. Quickstart — dataset inladen

```python
import json
from datetime import date

with open("pc200_payroll_dataset_2026.json", "r", encoding="utf-8") as f:
    dataset = json.load(f)

print(dataset["meta"]["laatste_update"])  # "2026-05-08"
```

### Top-level keys

`meta`, `lonen`, `indexatie`, `rsz`, `fiscaliteit`, `premies_en_voordelen`, `arbeidsvoorwaarden`, `bronnen`, `validatie`. Volledige beschrijving: [CORE §1](pc200_payroll_dataset_2026_CORE.md#1-top-level-structuur-van-het-json-bestand).

### Constante categorie-lijst

```python
DATAPUNT_CATEGORIEEN = (
    "lonen", "indexatie", "rsz",
    "fiscaliteit", "premies_en_voordelen", "arbeidsvoorwaarden",
)
```

---

## 2. Lookup-patronen

### 2.1 Datapunt opzoeken op `id`

```python
def get_datapunt(dataset, datapunt_id):
    for categorie in DATAPUNT_CATEGORIEEN:
        for dp in dataset.get(categorie, []):
            if dp.get("id") == datapunt_id:
                return dp
    return None
```

> Bouw bij voorkeur **één keer** een `dict[id → datapunt]` op bij het inladen. Lineaire scans schalen slecht wanneer het dataset groeit.

```python
def index_by_id(dataset):
    return {
        dp["id"]: dp
        for cat in DATAPUNT_CATEGORIEEN
        for dp in dataset.get(cat, [])
    }
```

### 2.2 Barema-lookup — Schaal × Categorie × Ervaring

```python
def lookup_barema(dataset, schaal: str, categorie: str, ervaring_jaren: int):
    """schaal: 'I' of 'II'; categorie: 'A','B','C','D'"""
    target_id = f"lonen_pc200_schaal{schaal}_cat{categorie}_01012026"
    dp = get_datapunt(dataset, target_id)
    if not dp:
        raise ValueError(f"Barema niet gevonden: {target_id}")

    tabel = dp["tabel_per_ervaring"]
    # Cap op hoogste ervaring (loonplafond)
    max_ervaring = max(rij["ervaring_jaren"] for rij in tabel)
    effectieve_ervaring = min(ervaring_jaren, max_ervaring)
    # Voor Schaal II start ervaring bij 1, niet 0
    min_ervaring = min(rij["ervaring_jaren"] for rij in tabel)
    if effectieve_ervaring < min_ervaring:
        raise ValueError(f"Ervaring {ervaring_jaren} valt buiten {schaal}")

    for rij in tabel:
        if rij["ervaring_jaren"] == effectieve_ervaring:
            return rij["maandloon_eur"]
    raise ValueError("Onverwachte tabel-state")

# Voorbeeld
loon = lookup_barema(dataset, "I", "A", 5)   # → 2276.51 EUR
```

Lookup-regels samengevat (volledige uitleg in [CORE §6](pc200_payroll_dataset_2026_CORE.md#6-speciale-structuren--barematabellen)):
- **Boven loonplafond**: clamp op de hoogste `ervaring_jaren` in de tabel.
- **Onder min-ervaring**: ofwel fout ofwel doorverwijzen naar Schaal I (Schaal II start bij `ervaring_jaren = 1`).

### 2.3 Studentenbarema — Lookup op leeftijd

```python
def lookup_studentenbarema(dataset, categorie: str, leeftijd_jaren: int):
    """categorie: 'A','B' (16-20j) of 'C','D' (18-20j)"""
    target_id = f"lonen_pc200_studenten_cat{categorie}_01012026"
    dp = get_datapunt(dataset, target_id)
    if not dp:
        raise ValueError(f"Studentenbarema niet gevonden: {target_id}")
    for rij in dp["tabel_per_leeftijd"]:
        if rij["leeftijd_jaren"] == leeftijd_jaren:
            return rij["maandloon_eur"]
    raise ValueError(
        f"Leeftijd {leeftijd_jaren} niet voorzien voor cat {categorie}"
    )
```

---

## 3. Periode-filtering

```python
def is_geldig_op(dp, ref_datum: date) -> bool:
    if dp.get("status") != "actief":
        return False
    vanaf = dp.get("geldig_vanaf")
    tot = dp.get("geldig_tot")
    if vanaf and date.fromisoformat(vanaf) > ref_datum:
        return False
    if tot and date.fromisoformat(tot) < ref_datum:
        return False
    return True
```

`geldig_tot = null` betekent "open einde / nog niet vervangen" (zie [CORE §2.4](pc200_payroll_dataset_2026_CORE.md#24-geldigheidsperiode)).

---

## 4. Domeinspecifieke berekeningen

### 4.1 RSZ-bijdragen voor een PC 200-bediende

```python
def rsz_bijdragen(dataset, brutoloon: float):
    werknemer = get_datapunt(dataset, "rsz_werknemer_basis")["waarde_genormaliseerd"]
    werkgever = get_datapunt(dataset, "rsz_werkgever_profit_basis")["waarde_genormaliseerd"]
    sociaal_fonds = get_datapunt(
        dataset, "rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026"
    )["waarde_genormaliseerd"]

    return {
        "werknemer_bijdrage": brutoloon * werknemer,         # 13,07 %
        "werkgever_bijdrage": brutoloon * werkgever,         # 25 %
        "sociaal_fonds_200":  brutoloon * sociaal_fonds,     # 0,23 %
    }
```

> **Let op:** voor de bouw-subset binnen PC 200 komt daar nog `rsz_pc200_bouw_aanvullend_pensioen_2026` (1,80 %) bij. Filter op `toepassingsgebied` voor je het toepast.

### 4.2 Indexering toepassen

```python
indexcoef = get_datapunt(
    dataset, "lonen_pc200_indexcoefficient_2026"
)["waarde_genormaliseerd"]
# = 1.0221

nieuw_loon = oud_loon * indexcoef
```

> Sectorale **barematabellen** in dit dataset bevatten reeds de index per 1/1/2026. Vermenigvuldig die niet nogmaals — gebruik de coëfficiënt enkel voor lonen die nog niet geïndexeerd zijn.

---

## 5. Defensieve toegangscontrole

Voorzie altijd een controle wanneer een datapunt buiten de verwachte staat valt:

```python
def safe_get_value(dataset, datapunt_id, ref_datum):
    dp = get_datapunt(dataset, datapunt_id)
    if dp is None:
        raise KeyError(f"Datapunt onbekend: {datapunt_id}")
    if dp.get("status") == "niet_gevonden":
        raise ValueError(f"{datapunt_id}: geen waarde beschikbaar in dataset")
    if dp.get("status") == "conflict":
        raise ValueError(
            f"{datapunt_id}: actief bronconflict — "
            f"{dp.get('conflict_opmerking')}"
        )
    if dp.get("status") == "mogelijk_verouderd":
        log.warning(f"{datapunt_id}: status mogelijk_verouderd — verifieer")
    if not is_geldig_op(dp, ref_datum):
        raise ValueError(f"{datapunt_id} niet geldig op {ref_datum}")
    return dp["waarde_genormaliseerd"]
```

Status-semantiek: zie [CORE §4](pc200_payroll_dataset_2026_CORE.md#4-statussen).

### Exception-hiërarchie (voorgestelde conventie)

```python
class PC200DatasetError(Exception): ...
class DatapuntOnbekend(PC200DatasetError, KeyError): ...
class DatapuntNietBruikbaar(PC200DatasetError, ValueError): ...   # niet_gevonden / conflict
class DatapuntNietGeldigOpDatum(PC200DatasetError, ValueError): ...
```

Zo kan de payroll-engine selectief catchen (bv. `mogelijk_verouderd` log + door, `conflict` halt).

---

## 6. JSON Schema-validatie

Maak in je codebase een JSON Schema dat dit dataset valideert. Op die manier vangt CI/CD elke breaking change in toekomstige updates op.

Minimaal vereist:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["meta", "lonen", "indexatie", "rsz", "fiscaliteit",
               "premies_en_voordelen", "arbeidsvoorwaarden",
               "bronnen", "validatie"],
  "properties": {
    "meta":  { "$ref": "#/definitions/meta" },
    "lonen": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } },
    "indexatie": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } },
    "rsz": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } },
    "fiscaliteit": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } },
    "premies_en_voordelen": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } },
    "arbeidsvoorwaarden": { "type": "array", "items": { "$ref": "#/definitions/datapunt" } }
  },
  "definitions": {
    "datapunt": {
      "type": "object",
      "required": ["id", "categorie", "subcategorie", "type", "pc",
                   "omschrijving", "status", "laatst_bevestigd_op"],
      "properties": {
        "id": { "type": "string" },
        "categorie": {
          "enum": ["lonen", "indexatie", "rsz", "fiscaliteit",
                   "premies_en_voordelen", "arbeidsvoorwaarden"]
        },
        "type": {
          "enum": ["barema", "parameter", "cao",
                   "koninklijk_besluit", "bronverwijzing"]
        },
        "status": {
          "enum": ["actief", "mogelijk_verouderd", "conflict",
                   "niet_gevonden", "gemarkeerd_voor_review"]
        },
        "betrouwbaarheid": { "enum": ["Tier 1", "Tier 2", "Tier 3", null] },
        "geldig_vanaf": { "type": ["string", "null"], "format": "date" },
        "geldig_tot":   { "type": ["string", "null"], "format": "date" },
        "waarde_genormaliseerd": { "type": ["number", "null"] }
      }
    }
  }
}
```

Het volledige veldenschema is gedocumenteerd in [CORE §2](pc200_payroll_dataset_2026_CORE.md#2-datapunt-schema--alle-velden). Houd het JSON Schema synchroon met die sectie — wijk je af, dan documenteer je dat in de PR.

### Validatie in Python

```python
import json
import jsonschema

with open("pc200_payroll_dataset_2026.json") as f:
    dataset = json.load(f)
with open("schema/pc200_payroll_dataset.schema.json") as f:
    schema = json.load(f)

jsonschema.validate(instance=dataset, schema=schema)  # raises on failure
```

---

## 7. CI-test-scenario's

Minimaal vereiste tests in de pipeline. Elke regel hieronder is een aparte testcase.

| Test | Waarom |
|---|---|
| JSON Schema-validatie slaagt | Structurele integriteit |
| Unique `id` over alle categorieën samen | Voorkomt dubbele identifiers — externe systemen referencen op `id` |
| Elk datapunt met `status: actief` heeft `bron_organisatie`, `bron_url`, `betrouwbaarheid` | Audit-vereiste |
| Elk Tier 3-datapunt met `status: actief` heeft minstens 1 `triangulatie_bronnen[].tier` ∈ {Tier 1, Tier 2} | 3-tier-regel ([CORE §3](pc200_payroll_dataset_2026_CORE.md#3-bronnenhiërarchie-3-tier)) |
| Elke `tabel_per_ervaring` is monotoon stijgend | OCR-sanity ([CORE §6.3](pc200_payroll_dataset_2026_CORE.md#63-monotone-progressie)) |
| Elk `geldig_tot` is ≥ `geldig_vanaf` (indien beide gezet) | Logische consistentie |
| `validatie.baremacellen_aantal` = som van `len(tabel_per_ervaring)` + `len(tabel_per_leeftijd)` | Integriteit |
| `waarde_genormaliseerd` is `null` als en slechts als de waarde tekstueel/tabel is | Normalisatie-contract ([CORE §5](pc200_payroll_dataset_2026_CORE.md#5-normalisatie--waarde_bron-vs-waarde_genormaliseerd)) |
| Geen URL in `bron_url` mag een 4xx-status geven (smoke test, niet blokkerend) | Bronpermalinks bewaken |
| `meta.laatste_update` ≥ `max(laatst_bevestigd_op)` over alle datapunten | Logische consistentie van peildatum |

### Voorbeeld — unique-id-test

```python
def test_unique_ids(dataset):
    seen = set()
    for cat in DATAPUNT_CATEGORIEEN:
        for dp in dataset[cat]:
            assert dp["id"] not in seen, f"Duplicate id: {dp['id']}"
            seen.add(dp["id"])
```

### Voorbeeld — monotonie-test

```python
def test_baremas_monotoon(dataset):
    for dp in dataset["lonen"]:
        tabel = dp.get("tabel_per_ervaring")
        if not tabel:
            continue
        lonen = [rij["maandloon_eur"] for rij in tabel]
        assert lonen == sorted(lonen), \
            f"Niet-monotoon barema in {dp['id']}: {lonen}"
```

---

## 8. Onderhoud & update-workflow

Het dataset is een **levend document**. Belgisch fiscaal en sectoraal recht wijzigt elk kwartaal.

### 8.1 Triggers voor een update

| Trigger | Te updaten |
|---|---|
| Nieuwe sectorindex (typisch 1 januari) | `lonen_pc200_indexcoefficient_*`, alle baremamatrices, `index_pc200_*` |
| Nieuw sectorakkoord PC 200 | `premies_en_voordelen[]`, `arbeidsvoorwaarden[]`, `meta.opmerkingen` |
| Programmawet of Wet Diverse Bepalingen in BS | Relevante categorie + `meta.opmerkingen` |
| Nieuw KB Bijlage III (jaarlijks eind december) | `bv_2026_kb_bijlage_iii` + opmerkingen |
| RSZ-instructies nieuw kwartaal | `rsz[]` |
| Publicatie geïndexeerde bedragen (FOD Fin) | `fiscaliteit[]` |
| Sectoraal CAO geregistreerd bij FOD WASO | Zoek/bevestig nieuwe datapunten |
| Bevinding van payroll-verificateur | Specifiek datapunt — zie [VERIFICATIE §9](pc200_payroll_dataset_2026_VERIFICATIE.md#9-wat-doe-je-als-je-een-fout-vindt) |

### 8.2 Update-stappen (verplichte volgorde)

1. **Identificeer** het datapunt op basis van `id` of `subcategorie`.
2. **Vóór wijziging:** noteer oude waarde in `opmerkingen` (bv. *"Verhoogd van € 0,27/km naar € 0,32/km vanaf 1/10/2026"*).
3. **Update** `waarde_bron`, `waarde_genormaliseerd`, `geldig_vanaf`, `bron_*` velden.
4. **Bevestig met triangulatie** (Tier 1/2 minstens — zie [CORE §3](pc200_payroll_dataset_2026_CORE.md#3-bronnenhiërarchie-3-tier)).
5. **Update** `laatst_bevestigd_op` naar de datum van verificatie.
6. **Update** `meta.laatste_update` voor het hele dataset.
7. **Run de validatie-checks** (zie [§7](#7-ci-test-scenarios)).
8. **Versie het bestand** in git met een commit message die de wijziging beschrijft.

### 8.3 Pending items volgen

Wanneer een aangekondigde maatregel nog niet definitief is (bv. centenindex, verhoging maaltijdcheques 8 → 10 EUR):
- Maak een datapunt aan met `status: "niet_gevonden"` of `"mogelijk_verouderd"`
- Vermeld de aankondigingsbron in `opmerkingen`
- Wacht op KB / wettekst in BS vóór `status: "actief"`

---

## 9. Backwards-compatibility

- **Verwijder nooit een datapunt** — gebruik in plaats daarvan `geldig_tot` om historiek te bewaren.
- **Behoud `id`-stabiliteit** — externe systemen referencen ernaar.
- **Voeg nieuwe velden** toe als optioneel — bestaande consumers mogen niet breken.
- **Wijzigingen in enums** (status, type, tier, …) zijn breaking changes — bump dataset-versie en documenteer in een changelog-sectie van `meta.opmerkingen`.
- **Schema-evolutie**: hou het JSON Schema in dezelfde repo en valideer in CI met **alle historische snapshots** die nog in gebruik zijn.

---

## 10. Bekende beperkingen — implicaties voor implementatie

| Beperking | Implementatieaanbeveling |
|---|---|
| Personenbelastingschijven inkomstenjaar 2026 (AJ 2027) niet beschikbaar | Engine moet PB-berekening voor inkomstenjaar 2026 als **deferred** behandelen of fallbacken op AJ 2026 met expliciete waarschuwing |
| Volledige BV-schalen niet machineleesbaar | Roep externe BV-simulator FOD Financiën aan, of implementeer sleutelformule + jaarlijkse update Bijlage III |
| Sectorale maaltijdcheques: `niet_gevonden` | Configureer maaltijdcheques per onderneming; toon waarschuwing als gebruiker een sectorale waarde verwacht |
| Sectorale thuiswerkvergoeding: `niet_gevonden` | Idem — implementeer als ondernemingsparameter |
| Sectorale arbeidsduur: bronverwijzing zonder concrete uren | Default 38 u/week, met override per onderneming |
| Sectorale overuren-toeslagen: `niet_gevonden` | Wettelijk regime hardcoden (50 % / 100 %) tot bevestiging |
| Bouw-subset PC 200 — exact toepassingsgebied | Behandel `rsz_pc200_bouw_aanvullend_pensioen_2026` enkel toepasselijk wanneer een expliciete `bouw`-vlag op de werknemer staat |

Volledige lijst en context: [VERIFICATIE §8](pc200_payroll_dataset_2026_VERIFICATIE.md#8-bekende-beperkingen--pending-items).

---

## 11. Roadmap — van dataset naar tool

Dit document is de basis waar de tool-documentatie organisch op verder bouwt. Verwachte secties wanneer de tool concreet wordt:

- **API-laag** — REST/GraphQL endpoints rond `get_datapunt`, `lookup_barema`, `rsz_bijdragen`, met versionering en caching.
- **Berekeningsengine** — composable berekeningen (brutoloon → nettoloon → werkgeverskost) op basis van datapunt-IDs i.p.v. hardcoded waarden.
- **Update-pipeline** — semi-geautomatiseerde verificatie: scrapers voor sfonds200.be, RSZ-instructies, FOD Fin; PR-gebaseerde review-flow.
- **Audit-frontend** — UI voor payroll-experts om datapunten te bekijken zonder JSON te openen (gestoeld op de [VERIFICATIE-workflow](pc200_payroll_dataset_2026_VERIFICATIE.md#4-verificatie-workflow)).
- **Multi-PC-uitbreiding** — generaliseren van het schema naar PC 124, PC 220, … met `pc` als selector.
- **Historische snapshots** — read-only branches per peildatum, zodat oude loonberekeningen reproduceerbaar blijven.
- **Conflictresolutie-tooling** — workflow voor `status: conflict` datapunten met side-by-side bronvergelijking.

Elke nieuwe sectie hier moet, wanneer ze het CORE-document raakt (datamodel, statussen, bronnen, glossary), die wijzigingen **eerst** in CORE doorvoeren — en dan hier ernaar linken.

---

*Laatste herziening van dit document: 2026-05-08 — synchroon met dataset `pc200_payroll_dataset_2026.json` en CORE-document v2026-05-08.*
