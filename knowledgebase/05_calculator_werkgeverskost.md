# Werkgeverskost-luik — specificatie — Loonmotor PC 200

**Doel:** specificeer de berekening van de **totale loonkost werkgever** voor een PC 200-bediende (privé profitsector), inkomstenjaar 2026. Dit luik vult de bestaande netto-rekenmodule aan en levert de cijfers voor het "loonwig"-overzicht.

**Peildatum:** 9 mei 2026.

---

## 1. Definitie loonkost werkgever

```
loonkost_maand = bruto_maandloon
               + RSZ_werkgever
               + sectoraal_sociaal_fonds (PC 200)
               + arbeidsongevallen_verzekering
               + maandelijkse_extra_voordelen_werkgever
               − structurele_vermindering (indien van toepassing)

loonkost_jaar = loonkost_maand × 12
              + eindejaarspremie
              + jaarlijkse_premie_pc200
              + ecocheques
              + RSZ_werkgever_25pct_op_eindejaarspremie_en_jaarpremie
              + dubbel_vakantiegeld
```

De loonmotor toont de maandelijkse loonkost en de jaarlijkse loonkost in aparte kaders. Eindejaarspremie, jaarpremie, ecocheques en dubbel vakantiegeld horen niet in het maandtotaal; ze worden expliciet in het jaaroverzicht getoond.

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

### 2.4 Eindejaarspremie in jaaroverzicht

**Bedrag:** brutomaandloon volgens de PC 200-formule, pro rata volgens anciënniteit/prestaties.

**Bron:** PC 200 cao 18/12/2025 — anciënniteit 5 jaar → **3 jaar** vanaf 2026. Lichte herziening 15/1/2026 akkoord.

**Werkgeverskost jaarbasis:** tel het brutobedrag op in het jaaroverzicht en bereken daarnaast 25% werkgevers-RSZ op de som van eindejaarspremie + jaarpremie.

### 2.5 Dubbel vakantiegeld in jaaroverzicht

**Bedrag:** **92% × maandloon incl. VAA**, betaalbaar in de vakantieperiode.

**Werkgeverskost jaarbasis:** tel het brutobedrag op als jaarlijkse component. Er wordt in deze loonmotor geen werkgevers-RSZ op dubbel vakantiegeld toegevoegd.

### 2.6 Extra voordelen werkgever (configureerbaar)

| Voordeel | Werkgeverskost-typisch | Bron / wettelijk kader | UI-status |
|----------|--------------------------|--------------------------|-----------|
| Groepsverzekering | 3–8% van brutoloon (werkgeverdeel) | WAP, ondernemingsspecifiek | ✅ Configureerbaar (€/m) |
| Maaltijdcheques | €8,91/dag vanaf 01/01/2026 (max werkgeverdeel €8,91) × werkdagen in maand | KB indexering 2026 | ✅ Configureerbaar (€/dag + werkdagen) |
| Hospitalisatieverzekering | €30–€90/m per persoon | sectorbreed | ✅ Configureerbaar (€/m) |
| ECO-cheques | tot €250/jaar | cao 98 nationale arbeidsraad | ✅ Automatisch afgeleid van tewerkstellingsbreuk (jaarcomponent) |
| Mobiliteitsvergoeding | tot €0,37/km × max 3.700 km/jaar | fiscaal vrijgesteld AJ 2027 | ⏳ Buiten scope |
| Bedrijfswagen | TCO autoleasing — verschilt sterk per model | apart luik | ⏳ Buiten scope |
| GSM/laptop/internet | €4–€20/m forfaitair | KB BV-tabellen | ⏳ Buiten scope |

Loonmotor accepteert groepsverzekering, maaltijdcheques en hospitalisatieverzekering als maandelijkse werkgeverskosten. Ecocheques worden automatisch afgeleid van de tewerkstellingsbreuk en alleen in het jaaroverzicht toegevoegd. Maaltijdcheques worden berekend als werkgeversaandeel per dag × werkdagen in de gekozen maand; werkdagen wordt vooringevuld op basis van weekdagen en blijft aanpasbaar. De AO-verzekeringtarief (default 0,30%) is eveneens aanpasbaar per werkgever via de "Werkgeversbijdragen"-sectie in het profiel-formulier.

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
DUBBEL_VAKANTIEGELD_PCT = 0.92

def werkgeverskost_maand(bruto, structurele_vermindering=0, extra_voordelen=0):
    rsz_wg          = bruto * RSZ_WERKGEVER_BASIS_PCT
    sf200           = bruto * SOCIAAL_FONDS_200_PCT
    ao_verz         = bruto * ARBEIDSONGEVALLEN_PCT

    totaal = (bruto
              + rsz_wg + sf200 + ao_verz
              + extra_voordelen
              - structurele_vermindering)

    return {
      "bruto_maand": bruto,
      "rsz_werkgever": rsz_wg,
      "sociaal_fonds_200": sf200,
      "arbeidsongevallen_verzekering": ao_verz,
      "extra_voordelen": extra_voordelen,
      "structurele_vermindering": structurele_vermindering,
      "totale_loonkost_maand": totaal,
      "loonwig_pct": (totaal - bruto) / totaal * 100,
    }

def werkgeverskost_jaar(loonkost_maand, eindejaarspremie, jaarpremie, ecocheques, maandloon_incl_vaa):
    dubbel_vakantiegeld = maandloon_incl_vaa * DUBBEL_VAKANTIEGELD_PCT
    rsz_jaarpremies = (eindejaarspremie + jaarpremie) * RSZ_WERKGEVER_BASIS_PCT
    return (loonkost_maand * 12
            + eindejaarspremie + jaarpremie + ecocheques
            + rsz_jaarpremies
            + dubbel_vakantiegeld)
```

---

## 4. Loonwig-percentage

```
loonwig_maand = (loonkost_maand − netto_maandloon) / loonkost_maand × 100
```

De summary-strip gebruikt de maandelijkse loonkost. Het jaaroverzicht toont daarnaast het volledige jaarbedrag met jaarlijkse componenten.

---

## 5. Visualisatie-aanbevelingen

### 5.1 Waterfall-chart

Van **bruto** naar **loonkost werkgever per jaar**, met balken voor:
1. Bruto loon (basis)
2. + RSZ werkgever
3. + Sociaal Fonds 200
4. + Arbeidsongevallen-verzekering
5. + Maandelijkse extra voordelen
6. = Loonkost maand × 12
7. + Eindejaarspremie + jaarpremie + ecocheques
8. + Werkgevers-RSZ op eindejaarspremie + jaarpremie
9. + Dubbel vakantiegeld
10. = Totale loonkost per jaar

### 5.2 Donut-chart "wie krijgt wat van de loonkost?"

| Segment | Bedrag | % |
|---------|--------|---|
| Werknemer (netto) | x | xx% |
| Werknemer (RSZ) | x | xx% |
| Werknemer (BV + BBSZ) | x | xx% |
| Werkgever (RSZ) | x | xx% |
| Sectorale bijdragen | x | xx% |
| Jaarcomponenten (premies, ecocheques, vakantiegeld) | x | xx% |

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
