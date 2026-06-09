# Werkgeverskost-luik — specificatie — Loonmotor PC 200

**Doel:** specificeer de berekening van de **totale loonkost werkgever** voor een PC 200-bediende (privé profitsector), inkomstenjaar 2026. Dit luik vult de bestaande netto-rekenmodule aan en levert de cijfers voor het "loonwig"-overzicht.

**Peildatum:** 24 mei 2026.

---

## 1. Definitie loonkost werkgever

```
loonkost_maand = bruto_maandloon
               + RSZ_werkgever
               + arbeidsongevallen_verzekering
               + maandelijkse_extra_voordelen_werkgever
               − structurele_vermindering (indien van toepassing)

loonkost_jaar = loonkost_maand × 12
              + eindejaarspremie
              + jaarlijkse_premie_pc200
              + ecocheques
              + RSZ_werkgever_25pct_op_eindejaarspremie_en_jaarpremie
              + bonus
              + RSZ_werkgever_25pct_op_bonus
              + dubbel_vakantiegeld
```

De loonmotor toont de maandelijkse loonkost en de jaarlijkse loonkost in aparte kaders. Eindejaarspremie, jaarpremie, ecocheques, bonus en dubbel vakantiegeld horen niet in het maandtotaal; ze worden expliciet in het jaaroverzicht getoond.

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

**Bouw-subset aanvullend pensioen:** sinds payroll-expertreview 2026-05-30 rekent Jaakie geen aparte 1,80%-bijdrage meer bovenop de globale werkgevers-RSZ. De vroegere bron was onvoldoende betrouwbaar voor runtimegebruik en de globale 25%-raming blijft het praktische werkgevers-RSZ-anker.

### 2.2 Sociaal Fonds 200

**Runtime-status Jaakie:** niet actief als aparte component.

Sinds 2026-05-31 telt Jaakie de werkgeversbijdrage Sociaal Fonds 200 niet meer apart op in `rszBijdragen()` of `werkgeverskost()`. De werkgeverskost rekent met de globale patronale RSZ, arbeidsongevallenverzekering en expliciet gekozen voordelen. Sfonds200.be blijft wel bron voor andere sectorale PC 200-regels zoals jaarpremie, vervoerskosten en landingsbaan.

### 2.3 Arbeidsongevallen-verzekering

**Tarief bedienden bureau:** default **0,30%** van bruto loon in Jaakie, maar dit is een **indicatieve aanname**, geen wettelijk of PC 200-sectoraal percentage.

**Bron:** Fedris bevestigt de wettelijke verzekeringsplicht voor privésectorwerkgevers. Liantis en Securex bevestigen dat de premievoet door de verzekeraar wordt bepaald op basis van activiteit, functie/personeelscategorie, loonmassa en risico. Een publieke marktbron vermeldt ongeveer **0,50% voor kantoorpersoneel**; er is geen publieke bron gevonden die **0,30%** als algemene PC 200-norm bevestigt.

Voor PC 200-bedienden in een typisch bureauomgeving is 0,30% verdedigbaar als lage default voor een laag-risico profiel, maar de UI moet dit configureerbaar houden en mag het niet als harde sectorparameter presenteren. Voor een conservatievere werkgeverskostinschatting is **0,50%** verdedigbaar.

### 2.4 Eindejaarspremie in jaaroverzicht

**Bedrag in Jaakie:** 1 × brutomaandloon, alsof het profiel een volledig gewerkt jaar heeft.

**Bron en juridische context:** PC 200 cao 18/12/2025 — anciënniteit 5 jaar → **3 jaar** vanaf 2026. Juridisch bestaan pro-rata regels volgens anciënniteit/prestaties, maar Jaakie toont die complexiteit niet langer als gebruikersinstelling. Oude CSV-imports met pro-rata kolommen worden bij actieve eindejaarspremie naar 12/12 genormaliseerd.

**Werkgeverskost jaarbasis:** tel het brutobedrag op in het jaaroverzicht en bereken daarnaast 25% werkgevers-RSZ op de som van eindejaarspremie + jaarpremie.

### 2.5 Dubbel vakantiegeld in jaaroverzicht

**Bedrag:** **92% × brutomaandloon**, betaalbaar in de vakantieperiode.

**Werkgeverskost jaarbasis:** tel het brutobedrag op als jaarlijkse component. Er wordt in deze loonmotor geen werkgevers-RSZ op dubbel vakantiegeld toegevoegd.

### 2.6 Extra voordelen werkgever (configureerbaar)

| Voordeel | Werkgeverskost-typisch | Bron / wettelijk kader | UI-status |
|----------|--------------------------|--------------------------|-----------|
| Groepsverzekering | 3–8% van brutoloon (werkgeverdeel) | WAP, ondernemingsspecifiek | ✅ Configureerbaar (€/m) |
| Maaltijdcheques | €8,91/dag vanaf 01/01/2026 (max werkgeverdeel €8,91) × werkdagen in maand | KB indexering 2026 | ✅ Configureerbaar (€/dag + werkdagen) |
| Hospitalisatieverzekering | €30–€90/m per persoon | sectorbreed | ✅ Configureerbaar (€/m) |
| ECO-cheques | tot €250/jaar | cao 98 nationale arbeidsraad | ✅ Automatisch afgeleid van tewerkstellingsbreuk (jaarcomponent) |
| Mobiliteitsvergoeding | tot €0,37/km × max 3.700 km/jaar | fiscaal vrijgesteld AJ 2027 | ⏳ Buiten scope |
| Bedrijfswagen | TCO autoleasing — verschilt sterk per model | apart VAA-luik | ✅ VAA-formule actief; leasing/TCO buiten scope |
| GSM/laptop/internet | €4–€20/m forfaitair | KB BV-tabellen | ✅ Forfaitaire VAA werkmiddelen actief |

Loonmotor accepteert groepsverzekering, maaltijdcheques en hospitalisatieverzekering als maandelijkse werkgeverskosten. Ecocheques worden automatisch afgeleid van de tewerkstellingsbreuk en alleen in het jaaroverzicht toegevoegd. Maaltijdcheques zijn een expliciete profieloptie omdat PC 200 geen sectorale verplichting kent; wanneer aangevinkt worden ze berekend als werkgeversaandeel per dag × werkdagen in de gekozen maand. Werkdagen wordt vooringevuld op basis van weekdagen en blijft aanpasbaar. De AO-verzekeringtarief (default 0,30%) is eveneens aanpasbaar per werkgever via de "Werkgeversbijdragen"-sectie in het profiel-formulier.

### 2.6b Bonus in jaaroverzicht

Een bonus kan in Jaakie als maandbedrag of jaarbedrag worden ingevoerd. De calculator zet dit altijd om naar één jaarbonus (`maandbedrag × 12` of jaarbedrag ongewijzigd). De bonus verhoogt de maandelijkse loonkost niet, maar wel de jaarloonkost met het brutobedrag plus 25% patronale RSZ op bonus. Aan werknemerszijde wordt de bonus als andere exceptionele vergoeding behandeld: 13,07% werknemers-RSZ en daarna bijzondere BV volgens Bijlage III.

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
| ✅ **Doelgroepvermindering eerste aanwervingen (federaal)** | **WEL — onafhankelijk van PC** | Verplicht meenemen indien cliënt het aanduidt. Regime wijzigt **vanaf 1/7/2026** via Programmawet 30 mei 2026, art. 103 e.v.: eerste werknemer max. €2.000/kwartaal onbeperkt; tweede t.e.m. vijfde werknemer max. €1.000/kwartaal gedurende 12 kwartalen binnen 20 kwartalen. Bron: [Belgisch Staatsblad — Programmawet 30 mei 2026](https://www.ejustice.just.fgov.be/eli/wet/2026/05/30/2026003986/staatsblad). |
| ⚙️ Doelgroepvermindering oudere werknemers (Vlaanderen) | configureerbaar | Afhankelijk van leeftijd en loongrens werknemer |
| ⚙️ Doelgroepvermindering kunstenaars | configureerbaar | Vanaf 1/4/2026 enkel BRU + WAL |

**Implementatie loonmotor:** de UI biedt in **Werkgeversbijdragen** een selectie **"Doelgroepvermindering eerste aanwervingen"** met keuzes geen, eerste werknemer en tweede tot vijfde werknemer. Jaakie toont de werkgeverskost exclusief doelgroepvermindering en daaronder de werkgeverskost inclusief vermindering. Voor de eerste werknemer is de jaarimpact €8.000 (= 4 × €2.000); voor werknemers twee tot vijf is de jaarimpact €4.000 (= 4 × €1.000) zolang de gebruiker dit binnen het toepassingsvenster aanduidt.

**Klantopmerking:** "de doelgroepvermindering kan echter enkel toegepast worden indien de onderneming daadwerkelijk extra werkgelegenheid creeert , waarbij rekening gehouden wordt met bestaande/voorafgaande tewerkstellingen in andere vennootschappen waarmee de nieuwe onderneming verbonden is"

---

## 3. Berekeningsformule (canonical)

```python
RSZ_WERKGEVER_BASIS_PCT = 0.25
ARBEIDSONGEVALLEN_PCT   = 0.003
DUBBEL_VAKANTIEGELD_PCT = 0.92

def werkgeverskost_maand(bruto, structurele_vermindering=0, extra_voordelen=0):
    rsz_wg          = bruto * RSZ_WERKGEVER_BASIS_PCT
    ao_verz         = bruto * ARBEIDSONGEVALLEN_PCT

    totaal = (bruto
              + rsz_wg + ao_verz
              + extra_voordelen
              - structurele_vermindering)

    return {
      "bruto_maand": bruto,
      "rsz_werkgever": rsz_wg,
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
3. + Arbeidsongevallen-verzekering
4. + Maandelijkse extra voordelen
5. = Loonkost maand × 12
6. + Eindejaarspremie + jaarpremie + ecocheques
7. + Werkgevers-RSZ op eindejaarspremie + jaarpremie
8. + Dubbel vakantiegeld
9. = Totale loonkost per jaar

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
| WG-04 | Sociaal Fonds 200 — aparte 0,23%-component | Niet actief in Jaakie-runtime sinds 2026-05-31 | Niet opnieuw toevoegen zonder expliciete productbeslissing |
| WG-05 | Werkgeverstussenkomst woon-werkverkeer (tarief 1/1/2026) | Sociaal Fonds 200 vervoerskostenpagina bevestigd op 2026-05-24 | Opnieuw checken bij volgende sectorupdate |

---

## 8. Bronnen

| Onderwerp | Bron-URL | Tier |
|-----------|----------|------|
| RSZ werkgever 25% | rsz.fgov.be/nl/werkgevers/bijdragen | 1 |
| Loonmatigingsbijdrage | rsz.fgov.be (instructies werkgevers) | 1 |
| Arbeidsongevallen-verzekering | Fedris verzekeringsplicht + Liantis/Securex kostprijsinformatie | 1 voor verplichting, geen tier voor indicatief tarief |
| Eindejaarspremie PC 200 (cao 18/12/2025 + 15/1/2026) | sfonds200.be/cao | 1 |
| Dubbel vakantiegeld bedienden (92%) | rva.fgov.be | 1 |
| Structurele vermindering (helling 0,1600 vanaf 1/4/2026) | KB 2/7/2025, BS 15/7/2025 | 1 |
| GGMMI €2.189,81 (1/4/2026) | acerta.be (snapshot 06) + CAO 43/18 NAR | 2 |
