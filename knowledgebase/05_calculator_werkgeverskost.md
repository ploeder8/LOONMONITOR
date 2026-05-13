# Werkgeverskost-luik — specificatie — Loonmotor PC 200

**Doel:** specificeer de berekening van de **totale loonkost werkgever** voor een PC 200-bediende (privé profitsector), inkomstenjaar 2026. Dit luik vult de bestaande netto-rekenmodule aan en levert de cijfers voor het "loonwig"-overzicht.

**Peildatum:** 9 mei 2026.

---

## 1. Definitie totale loonkost werkgever

```
totale_loonkost = bruto_maandloon
                + RSZ_werkgever
                + sectoraal_sociaal_fonds (PC 200)
                + arbeidsongevallen_verzekering
                + provisie_eindejaarspremie
                + provisie_dubbel_vakantiegeld
                + extra_voordelen_werkgever (groepsverz, MC, ECO, hosp, maaltijdcheques)
                − structurele_vermindering (indien van toepassing)
```

Twee interpretaties:
- **Smal** ("hard" loonkost): bruto + RSZ wg + sectorale bijdragen. Geen provisies, geen extralegale voordelen.
- **Breed** (volledig "Cost-to-Company"): inclusief provisies eindejaarspremie + dubbel vakantiegeld + alle extralegale voordelen.

De loonmotor toont **beide** views.

---

## 2. Componenten — gedetailleerd

### 2.1 Werkgevers-RSZ (basisbijdragen)

**Tarief profitsector:** ~25% van bruto loon.

Samenstelling (RSZ-instructies werkgevers, peildatum 2026):
- Basis-RSZ werkgever: **19,88%**
- Loonmatigingsbijdrage: **5,12%** (op brutoloon én op werkgevers-RSZ-bijdrage)
- **Totaal: ~25,00%**

> **Let op:** de exacte combinatie hangt af van de loonomvang en bedrijfsgrootte. De **structurele vermindering** verlaagt deze kost voor lagere lonen.

**Sectoraal correctief PC 200:** geen aparte werkgevers-RSZ-toeslag voor PC 200 (geldt het profitsector-standaardtarief).

### 2.2 Sociaal Fonds 200

**Tarief:** **0,23%** van bruto loon (werkgeversbijdrage).

**Bron:** sfonds200.be ("verloning"-rubriek, inkomstenjaar 2026).

Doel: financiering eindejaarspremie + collectieve voorzieningen + opleidingen.

### 2.3 Arbeidsongevallen-verzekering

**Tarief bedienden bureau:** ~0,30% van bruto loon (sector-afhankelijk en verzekeraar-afhankelijk).

**Bron:** Federale Pensioendienst — wettelijk verplicht voor alle werkgevers.

Voor PC 200-bedienden in een typisch bureauomgeving is dit aan de lage kant (versus arbeiders in PC 124 bouw waar tot 4–6% mogelijk is).

### 2.4 Provisie eindejaarspremie

**Tarief:** **8,33%** van brutoloon = (13e maand) / 12.

**Bron:** PC 200 cao 18/12/2025 — anciënniteit 5 jaar → **3 jaar** vanaf 2026. Lichte herziening 15/1/2026 akkoord.

> **Belangrijk:** de provisie is een **boekhoudkundige inschatting**. De werkelijke uitkering gebeurt in december en kan afwijken bij in/uitstroom of langdurige afwezigheid.

### 2.5 Provisie dubbel vakantiegeld

**Tarief:** **6,67%** van brutoloon = (92% × bruto) / 12 (benadering bedienden).

**Detail:** dubbel vakantiegeld bedienden = 92% × maandloon, betaalbaar in mei. Provisioneel verspreid over 12 maanden.

### 2.6 Extra voordelen werkgever (configureerbaar)

| Voordeel | Werkgeverskost-typisch | Bron / wettelijk kader | UI-status |
|----------|--------------------------|--------------------------|-----------|
| Groepsverzekering | 3–8% van brutoloon (werkgeverdeel) | WAP, ondernemingsspecifiek | ✅ Configureerbaar (€/m) |
| Maaltijdcheques | €8,91/dag vanaf 01/01/2026 (max werkgeverdeel €8,91) × werkdagen in maand | KB indexering 2026 | ✅ Configureerbaar (€/dag + werkdagen) |
| Hospitalisatieverzekering | €30–€90/m per persoon | sectorbreed | ✅ Configureerbaar (€/m) |
| ECO-cheques | tot €250/jaar | cao 98 nationale arbeidsraad | ✅ Automatisch afgeleid van tewerkstellingsbreuk (÷ 12/maand) |
| Mobiliteitsvergoeding | tot €0,37/km × max 3.700 km/jaar | fiscaal vrijgesteld AJ 2027 | ⏳ Buiten scope |
| Bedrijfswagen | TCO autoleasing — verschilt sterk per model | apart luik | ⏳ Buiten scope |
| GSM/laptop/internet | €4–€20/m forfaitair | KB BV-tabellen | ⏳ Buiten scope |

Loonmotor accepteert groepsverzekering, maaltijdcheques, hospitalisatieverzekering en ecocheques als configureerbare UI-inputs. Maaltijdcheques worden berekend als werkgeversaandeel per dag × werkdagen in de gekozen maand; werkdagen wordt vooringevuld op basis van weekdagen en blijft aanpasbaar. De AO-verzekeringtarief (default 0,30%) is eveneens aanpasbaar per werkgever via de "Werkgeversbijdragen"-sectie in het profiel-formulier.

### 2.7 Structurele vermindering werkgever

**Doel:** verlaging RSZ wg voor lagere lonen.

**Hellingscoëfficiënt vanaf 1/4/2026:** **0,1600** (was 0,1500 — KB 2/7/2025, BS 15/7/2025).

**Berekening (vereenvoudigd):**
```
structurele_vermindering = max(0, helling × (loongrens − kwartaalloon))
```
Met loongrens-categorieën specifiek per loonsegment (lage-lonen-component, hoge-lonen-component voor onderzoek, …).

**Voor PC 200-bedienden:** typisch alleen relevant voor lonen rond GGMMI (€2.189,81/m) of net daarboven. Voor modale en hogere bedienden bedraagt de vermindering nul.

### 2.8 Doelgroep- en sectorverminderingen

**Belangrijk:** de **doelgroepvermindering eerste aanwervingen** is een **federale RSZ-vermindering** die **van toepassing is onafhankelijk van het paritair comité** — dus ook voor PC 200-bedienden. Wanneer de cliënt aangeeft dat het gaat om een **eerste werknemer** (of een aanwerving binnen het toepassingsvenster), **moet** de vermindering in de jaarloonkost-simulatie worden verwerkt.

| Vermindering | Toepasbaarheid | Opmerking |
|---|---|---|
| ✅ **Doelgroepvermindering eerste aanwervingen (federaal)** | **WEL — onafhankelijk van PC** | Verplicht meenemen indien cliënt het aanduidt. Regime wijzigt **vanaf 1/4/2026** — verifieer tegen meest recente KB. Bron: [VLAIO — doelgroepvermindering eerste aanwervingen federaal](https://www.vlaio.be/nl/subsidies-financiering/subsidiedatabank/maatregelen/doelgroepvermindering-eerste-aanwervingen-federaal). |
| ⚙️ Doelgroepvermindering oudere werknemers (Vlaanderen) | configureerbaar | Afhankelijk van leeftijd en loongrens werknemer |
| ⚙️ Doelgroepvermindering kunstenaars | configureerbaar | Vanaf 1/4/2026 enkel BRU + WAL |

**Implementatie loonmotor:** de UI biedt een checkbox **"eerste aanwerving"** (met sub-veld kwartaal van indiensttreding) en past de patronale RSZ automatisch aan op basis van de federale tabel.

---

## 3. Berekeningsformule (canonical)

```python
RSZ_WERKGEVER_BASIS_PCT = 0.25
SOCIAAL_FONDS_200_PCT   = 0.0023
ARBEIDSONGEVALLEN_PCT   = 0.003
PROVISIE_EINDEJAAR_PCT  = 0.0833    # 13e maand / 12
PROVISIE_VAKANTIE_PCT   = 0.0667    # 92% × bruto / 12

def werkgeverskost_maand(bruto, structurele_vermindering=0, extra_voordelen=0):
    rsz_wg          = bruto * RSZ_WERKGEVER_BASIS_PCT
    sf200           = bruto * SOCIAAL_FONDS_200_PCT
    ao_verz         = bruto * ARBEIDSONGEVALLEN_PCT
    prov_ejp        = bruto * PROVISIE_EINDEJAAR_PCT
    prov_vg         = bruto * PROVISIE_VAKANTIE_PCT

    totaal = (bruto
              + rsz_wg + sf200 + ao_verz
              + prov_ejp + prov_vg
              + extra_voordelen
              - structurele_vermindering)

    return {
      "bruto_maand": bruto,
      "rsz_werkgever": rsz_wg,
      "sociaal_fonds_200": sf200,
      "arbeidsongevallen_verzekering": ao_verz,
      "provisie_eindejaarspremie": prov_ejp,
      "provisie_dubbel_vakantiegeld": prov_vg,
      "extra_voordelen": extra_voordelen,
      "structurele_vermindering": structurele_vermindering,
      "totale_loonkost_maand": totaal,
      "loonwig_pct": (totaal - bruto) / totaal * 100,
    }
```

---

## 4. Loonwig-percentage

```
loonwig = (totale_loonkost − netto_werknemer) / totale_loonkost × 100
```

Voor een typische PC 200-bediende met €3.500 bruto, alleenstaand, 0 kinderen:
- Bruto: €3.500
- Totale loonkost (smal): ~€4.730
- Totale loonkost (breed): ~€4.840 (incl. provisies)
- Netto werknemer: ~€2.300
- **Loonwig (smal): 51,4%**
- **Loonwig (breed): 52,5%**

Loonmotor toont beide percentages met uitsplitsing per component.

---

## 5. Visualisatie-aanbevelingen

### 5.1 Waterfall-chart

Van **bruto** naar **totale loonkost**, met balken voor:
1. Bruto loon (basis)
2. + RSZ werkgever
3. + Sociaal Fonds 200
4. + Arbeidsongevallen-verzekering
5. + Provisie eindejaarspremie
6. + Provisie vakantiegeld
7. + Extra voordelen (configureerbaar)
8. − Structurele vermindering (indien toegepast)
9. = Totale loonkost (eindbalk)

### 5.2 Donut-chart "wie krijgt wat van de loonkost?"

| Segment | Bedrag | % |
|---------|--------|---|
| Werknemer (netto) | x | xx% |
| Werknemer (RSZ) | x | xx% |
| Werknemer (BV + BBSZ) | x | xx% |
| Werkgever (RSZ) | x | xx% |
| Sectorale bijdragen | x | xx% |
| Provisies (toekomstige uitkering) | x | xx% |

### 5.3 Vergelijkingstabel "twee scenario's"

Bv. twee bruto-loonniveaus naast elkaar voor cliëntgesprek.

---

## 6. Validatie-aanpak

1. **Cross-check tegen sociaal secretariaat-loonbrief.** Vraag bij Securex/Acerta een typische PC 200-loonbrief op (bruto €3.500, alleenstaand). Vergelijk regel per regel.
2. **Sectorbenchmark.** Vergelijk loonwig met **OECD-benchmarks** (België = ~52% voor alleenstaande zonder kinderen — bron OECD Taxing Wages 2024-rapport).
3. **Audit-trail.** Iedere component toont bron-URL en peildatum.

---

## 7. Pending-items werkgeverskost

| # | Item | Status | Actie |
|---|------|--------|-------|
| WG-01 | RSZ wg basis 19,88% — exacte 2026 cijfers | Nog te bevestigen via RSZ-instructies | Q3 2026 |
| WG-02 | Loonmatigingsbijdrage 5,12% — definitief 2026? | Beoordelen tegen Programmawet 18/7/2025 | Q3 2026 |
| WG-03 | Structurele vermindering helling 0,1600 — werkbare formule | KB 2/7/2025 BS 15/7/2025 | Implementeren |
| WG-04 | Sociaal Fonds 200 — kwartaal-specifieke bijdrage? | Cao-tekst raadplegen | Q3 2026 |
| WG-05 | Werkgeverstussenkomst woon-werkverkeer (tarief 1/1/2026) | Cao 18/12/2025 + 15/1/2026 | Cao-tekst raadplegen |

---

## 8. Bronnen

| Onderwerp | Bron-URL | Tier |
|-----------|----------|------|
| RSZ werkgever 25% | rsz.fgov.be/nl/werkgevers/bijdragen | 1 |
| Loonmatigingsbijdrage | rsz.fgov.be (instructies werkgevers) | 1 |
| Sociaal Fonds 200 (0,23%) | sfonds200.be/nl/verloning | 1 |
| Arbeidsongevallen-verzekering | fpd.fgov.be / Fedris | 1 |
| Eindejaarspremie PC 200 (cao 18/12/2025 + 15/1/2026) | sfonds200.be/cao | 1 |
| Dubbel vakantiegeld bedienden (92%) | rva.fgov.be | 1 |
| Structurele vermindering (helling 0,1600 vanaf 1/4/2026) | KB 2/7/2025, BS 15/7/2025 | 1 |
| GGMMI €2.189,81 (1/4/2026) | acerta.be (snapshot 06) + CAO 43/18 NAR | 2 |
