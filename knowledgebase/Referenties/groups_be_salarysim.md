# Referentie: Group S Salary Sim

**Versie:** 2026-05-12 (geverifieerd via browser — Playwright, geavanceerde modus, PC 200)
**Status:** Geverifieerd ✅

---

## 1. Tool-overzicht

| Eigenschap | Waarde |
|---|---|
| Naam | Group S Salary Sim |
| Uitgever | Group S (sociaal secretariaat) |
| Bronnenhiërarchie | **Tier 2** (sociaal secretariaat, geen primaire wetgevende bron) |
| Primaire URL | https://online.groups.be/salarysim/?lg=nl |
| Alternatieve URL | https://services.groups.be/SalarySim/ibrunet.aspx?lg=NL |
| Talen | Nederlands (NL) / Frans (FR) / Engels (EN) |
| Doelgroep | Werkgevers én werknemers |
| Beschikbaarheid | Publiek, gratis, geen login vereist |
| Scope | **Alle Belgische paritaire comités (±200 PC's)** |
| Bijgewerkt | Regelmatig (Group S volgt wetgevingsupdates) |

**Verschil met onze tool:** Group S dekt alle PC's; onze PC 200 Loonmotor is uitsluitend voor Paritair Comité 200 (Aanvullend Paritair Comité voor de Bedienden, APCB). Dit maakt Group S breder maar minder gespecialiseerd voor PC 200-experten.

---

## 2. Berekeningsrichtingen

De tool ondersteunt twee richtingen via een toggle-schakelaar "Berekenen uit" in stap 2 (vereenvoudigd) of stap 3 (geavanceerd):

| Richting | Omschrijving | Beschikbaarheid | Ons equivalent |
|---|---|---|---|
| **Bruto → Netto** | Gegeven een brutoloon, bereken het nettoloon en de totale werkgeverskost | Beide modi | ✅ Aanwezig |
| **Netto → Bruto** | Gegeven een gewenst nettoloon, bereken het benodigde brutoloon | **Alleen vereenvoudigde modus** | ❌ Nog niet geïmplementeerd |

### Netto→Bruto — technische werking (geverifieerd)

- **Activering**: toggle "Berekenen uit" switchen van Bruto naar Netto (in vereenvoudigde modus stap 2)
- **In geavanceerde modus**: toggle heeft CSS-klasse `disable` — Netto→Bruto is daar **niet beschikbaar**
- **Veldlabel verandert**: "Bruto maandelijks bedrag" → "Netto maandelijks bedrag (verplicht veld)"
- **Melding**: *"Let op: de berekening van netto naar bruto is langzamer"*
- **Rekenmethode**: iteratief (convergentie naar doelwaarde, niet exacte omgekeerde formule)
- **Nauwkeurigheid**: benaderend — target €2.000 netto geeft bruto €2.088,00 en netto €2.000,94
- **Output**: identieke structuur aan Bruto→Netto; het bruto-bedrag is nu de berekende waarde

De Netto→Bruto-richting is bijzonder handig bij salarisonderhandelingen: een medewerker vraagt om €2.500 netto, de werkgever kan direct zien welk brutoloon hiervoor nodig is.

---

## 3. Interface-modi

| Modus | Beschrijving | Stappen | Activering |
|---|---|---|---|
| **Vereenvoudigde berekening** | Basisvelden: loonbedrag, contracttype, groepsverzekering | 3 stappen (Signaletiek → Contracttype → Resultaat) | Standaard actief |
| **Geavanceerde berekening** | Alle extra looncomponenten, PC-selector, werkregime, RSZ-details | 4 stappen (Signaletiek → Contracttype → Looncomponenten → Resultaat) | Klik "Geavanceerde berekening" tab |

**Belangrijk verschil**: de vereenvoudigde modus heeft **geen Paritair Comité-selector** — de PC wordt niet gevraagd en heeft geen invloed op de berekening. De PC-selector is exclusief beschikbaar in de geavanceerde modus (stap 2).

---

## 4. Vereenvoudigde modus — invoervelden (geverifieerd)

### Stap 1: Signaletiekgegevens

| Veld | Type | Opties | Ons equivalent |
|---|---|---|---|
| Periode | Dropdown | Mei / April / Maart / … (kalendermaanden) | — |
| Burgerlijke staat | Dropdown | Ongehuwd / Gehuwd / Weduw(e)(naar) / Wettelijk gescheiden / Feitelijk gescheiden / Wettelijk samenwonend | ✅ Gezinstype |
| Vestigingseenheid | Dropdown | Vlaanderen / Brussel Hoofdstedelijk Gewest / Wallonie / Duitse Gemeenschap | ℹ️ Niet apart; gemeentebelasting impliciet |
| Geboortedatum | Datumkiezer (verplicht) | dd/mm/yyyy | ❌ (wij gebruiken gezinstype, niet geboortedatum) |
| Gehandicapte persoon | Checkbox | Ja / Nee | ❌ |
| Personen ten laste | Checkbox-toggle | Ja / Nee | ✅ Kinderen ten laste |

### Stap 2: Contracttype

| Veld | Type | Opties | Ons equivalent |
|---|---|---|---|
| Berekenen uit | Toggle (Bruto ↔ Netto) | Bruto / Netto | ✅ Alleen Bruto→Netto |
| Bruto / Netto maandelijks bedrag | Getal (verplicht) | — | ✅ Brutoloon |
| Contracttype | Dropdown | Arbeider / Bediende / Bedrijfsleider | ✅ (wij: Bediende voor PC 200) |
| Groepsverzekering | Getal (€/maand) | Werknemersbijdrage | ✅ BV-vermindering 30% |

**Geen PC-selector in vereenvoudigde modus** — de berekening is generiek, zonder sectorale parameters.

---

## 5. Geavanceerde modus — extra invoervelden (geverifieerd)

De geavanceerde modus voegt een extra stap toe en breidt stap 1 en 2 uit.

### Stap 1: Signaletiekgegevens (extra velden t.o.v. vereenvoudigd)

| Veld | Type | Opties | Ons equivalent |
|---|---|---|---|
| Naam | Tekstveld | Vrij (voor identificatie simulatie) | ❌ |
| Type aanwerving | Dropdown | Geen / Vermindering 1e aanwerving / 2e / 3e / 4e / 5e / 6e aanwerving | ❌ (RSZ-vermindering eerste aanwervingen) |

### Stap 2: Contracttype (geavanceerd — volledige veldlijst)

| Veld | Type | Opties | Ons equivalent |
|---|---|---|---|
| Contracttype | Dropdown (18 opties) | Arbeider (RSZ-cat.15) / Bediende (RSZ-cat.495) / Bedrijfsleider / Student (840/841) / Leerling arbeider (35) / Leerling bediende (439) / Artiest (46) / Huispersoneel (45) / Arbeider gesubsid. (24) / Bediende gesubsid. (484) / Arbeider −19j (27) / Bediende −19j (487) / Bezoldigd sporter (494) / Statutair (675) / … | ✅ Bediende (RSZ-cat.495) |
| Onderworpen RSZ | Checkbox (Ja/Nee) | Standaard Ja | ✅ |
| Paritair comité | Dropdown (±200 PC's, doorzoekbaar) | o.a. **200.00.00 – Aanvullend PC bedienden** | ✅ Gefixeerd PC 200 |
| RSZ-kengetal | Dropdown | 000 / 002 / 010 / 011 / 012 / 013 / … (~50 kengetallen) | ❌ Technisch veld |
| Omvang werkgever | Dropdown | Minder dan 5 / 5–9 / 10–19 / 20–49 / 50–99 / 100–199 / 200–499 / 500–999 / ≥1000 werknemers | ❌ (invloed op structurele vermindering) |
| Onderworpen bedrijfsvoorheffing | Dropdown | Niet onderworpen / Onderworpen / Niet verblijfhouder in België | ✅ Standaard Onderworpen |
| Werkregime | Radio (Deeltijds / Voltijds) | — | ❌ Nog niet geïmplementeerd |

### Stap 3: Looncomponenten (exclusief geavanceerd)

**Basisvelden:**

| Veld | Type | Ons equivalent |
|---|---|---|
| Berekenen uit | Toggle (Bruto / Netto) — **Netto uitgeschakeld** in geavanceerde modus | ✅ Alleen Bruto |
| Bruto maandelijks bedrag (verplicht) | Getal | ✅ |
| Belastbaar bedrag gewone BV (H/S stat) | Getal | ❌ Technisch veld voor afwijkende BV-basis |

**Sectie: Diverse voordelen** (accordion, standaard ingeklapt)

| Veld | Type | Ons equivalent |
|---|---|---|
| Voordelen in natura | Getal (€/maand) | ❌ |
| Voordelen in natura wagen | Getal (€/maand) | ❌ (VAA bedrijfswagen) |
| Met voordeel woon-werk | Checkbox | ❌ |
| Groepsverzekering werknemersbijdrage netto | Getal (€/maand) | ✅ BV-vermindering 30% |
| Andere netto (negatief) | Getal | ❌ |
| Andere netto (positief) | Getal | ❌ |

**Sectie: Andere** (accordion)

| Veld | Type | Ons equivalent |
|---|---|---|
| Groepsverzekering patronale bijdrage | Getal (€/maand) | ❌ Info-only |
| Commissieloon | Getal (€/maand) | ❌ |
| Eindejaarspremie | Getal (€) | ✅ Bijzondere BV bij ons |
| Niet-periodieke bezoldiging zelfstandige bedrijfsleider | Getal | ❌ |
| Maandelijks bedrag auteursrechten | Getal | ❌ |

**Sectie: Vakantiegeld** (accordion — 3 subsecties)

| Subsectie | Velden |
|---|---|
| Lopend jaar | Dubbel vakantiegeld / Aanvullend vakantiegeld (saldo 4de week) |
| Vorig jaar | Enkel vakantiegeld / Dubbel vakantiegeld / Aanvullend vakantiegeld |
| Voorafbetaald vakantiegeld | Enkel / Dubbel / Aanvullend vakantiegeld |

**Sectie: Vervoer** (accordion)

| Veld | Type | Ons equivalent |
|---|---|---|
| Sociaal abonnement — openbaar vervoer | Getal (€/maand) | ✅ CAO 19/9 trein (anders ingevoerd: wij via km) |
| Sociaal abonnement — privé vervoer | Getal (€/maand) | ❌ |

**Opmerking**: de geavanceerde modus heeft **geen** velden voor maaltijdcheques, ecocheques, fietsvergoeding, thuiswerkvergoeding, of functieclassificatie/anciënniteit. Die zijn ofwel verrekend via "voordelen in natura" of vallen buiten de scope van de berekening.

---

## 6. Uitvoer — overzicht (geverifieerd via testberekening)

**Testcase**: PC 200, Bediende (RSZ-cat.495), Voltijds, Ongehuwd, Vlaanderen, geboortedatum 01/01/1980, geen personen ten laste, €2.276,51 bruto, werkgever 50–99 werknemers.

### 6.1 Werknemer-perspectief

| Sectie | Output | Testwaarde | Ons equivalent |
|---|---|---|---|
| **B – Bruto** | Basis bruto bezoldiging | €2.276,51 | ✅ |
| | Commissieloon | €0,00 | ❌ |
| | Voordelen in natura | €0,00 | ❌ |
| | Voordelen in natura wagen | €0,00 | ❌ |
| | Belast. bed. gewone BV (H/S stat) | €0,00 | ❌ |
| | Maandelijks bedrag auteursrechten | €0,00 | ❌ |
| | **Totaal B** | **€2.276,51** | |
| **C – Inhoudingen (RSZ)** | Pers. bijdrage gewone bezoldiging | €297,54 (13,07%) | ✅ |
| | Pers. bijdr. uitzond. vergoed. | €0,00 | ❌ |
| | Pers. bijdrage verbrekingsvergoeding | €0,00 | ❌ |
| | Pers. brutobijdrage BV (17,15%) | €0,00 | ❌ |
| | RSZ-bijdrage op auteursrechten | €0,00 | ❌ |
| | Werkbonus (luik A) | **−€125,04** | ✅ |
| | Werkbonus (luik B) | **−€162,95** | ✅ |
| | Sportbonus | €0,00 | ❌ |
| | Bijz. bijdrage soc. sec | €0,00 | ✅ (wij: kwartaalschijven) |
| | Solidariteitsbijdrage dubbel vak. geld | €0,00 | ❌ |
| | **Totaal C (netto RSZ)** | **€9,55** | |
| **D – Belastbaar (B−C)** | | €2.266,96 | ✅ |
| **E – Fiscale voorheffing** | Gewone bezoldiging | €154,22 | ✅ |
| | Exceptionele vergoeding | €0,00 | ❌ |
| | Vakantiegeld | €0,00 | ❌ |
| | Verbrekingsvergoeding | €0,00 | ❌ |
| | Andere | €0,00 | ❌ |
| | Roerende voorheffing auteursrechten | €0,00 | ❌ |
| | **Totaal E** | **€154,22** | |
| **F – Netto (D−E)** | | **€2.112,74** | ✅ |
| **G – Diversen [+]** | Sociaal abonnement openbaar vervoer | €0,00 | ✅ |
| | Sociaal abonnement privé vervoer | €0,00 | ❌ |
| | Diversen positieve netto | €0,00 | ❌ |
| | **Totaal G** | **€0,00** | |
| **H – Diversen [−]** | Spec. bijdrage soc. zekerheid (BBSZ) | €11,28 | ✅ |
| | Voordelen in natura | €0,00 | ❌ |
| | Voordelen in natura wagen | €0,00 | ❌ |
| | Groepsverzekering | €0,00 | ✅ |
| | Diversen netto [−] | €0,00 | ❌ |
| | **Totaal H** | **€11,28** | |
| **A – Te ontvangen werknemer (F+G−H)** | | **€2.101,46** | ✅ |

### 6.2 Werkgever-perspectief

| Sectie | Output | Testwaarde | Ons equivalent |
|---|---|---|---|
| **1 – Ingehouden op het loon** | Pers. RSZ bijdragen (netto) | €9,55 | ✅ |
| | Spec. bijdrage soc. zekerheid | €11,28 | ✅ |
| | Fiscale voorheffing | €154,22 | ✅ |
| | **Totaal 1** | **€175,05** | |
| **2 – Patronale bijdragen** | Patronale bijdrage soc. zekerheid | €621,73 | ✅ |
| | Patronale bijdrage verzekeringen | €0,00 | ❌ |
| | Patronale bijdrage Soc. Fonds & PDOK | €0,00 | ✅ (SF 200) |
| | Structurele vermindering | **−€329,90** | ✅ |
| | **Totaal 2 (netto patronale)** | **€291,83** | |
| **3 – Te ontvangen netto (A)** | | €2.101,46 | ✅ |
| **I – Te betalen werkgever (1+2+3)** | | **€2.568,34** | ✅ |
| **Te betalen via sociaal secretariaat (1+2)** | RSZ + BV-afdracht | **€466,88** | ❌ (niet apart getoond bij ons) |

### 6.3 Vergelijking met onze tool

Bij dezelfde invoer (bruto €2.276,51, ongehuwd, geen kinderen, voltijds, Vlaanderen):

| Waarde | Groups.be | Onze tool (verwacht) | Opmerking |
|---|---|---|---|
| Netto RSZ | €9,55 | ≈ €9,55 | Werkbonus A+B volledig verrekend |
| BV gewone bezoldiging | €154,22 | ≈ vergelijkbaar | Verschil mogelijk door gemeentebelasting (Groups.be: 0% tenzij ingegeven) |
| BBSZ | €11,28 | ≈ vergelijkbaar | |
| **Nettoloon (A)** | **€2.101,46** | **vergelijkbaar** | Verschil ≤ €5 verwacht (gemeentebelasting-effect) |
| Structurele vermindering | −€329,90 | ≈ vergelijkbaar | Afh. van omvang werkgever |
| Totale werkgeverskost (I) | €2.568,34 | vergelijkbaar | |

### 6.4 Visuele weergave

- Twee-kolom-layout: werknemer (links) en werkgever (rechts)
- Opvouwbare gedetailleerde breakdown per sectie (B, C, D, E, F, G, H / 1, 2, 3)
- Exporteer-knop (PDF/print)
- **Geen waterval-grafiek** — puur tekstuele tabellen
- **Geen scenario-vergelijking** naast elkaar

---

## 7. UI/UX-beschrijving (geverifieerd)

### Structuur

- **Tab-selector bovenaan**: "Vereenvoudigde berekening" | "Geavanceerde berekening"
- **Stap-navigator**: genummerde stappen (1–3 of 1–4), klikbaar om terug te navigeren
- **Formulier per stap**: eenvoudig en opgeruimd, geen "scrolpagina" maar stap-voor-stap
- **Accordions**: in stap 3 (geavanceerd) zijn Diverse voordelen, Andere, Vakantiegeld en Vervoer standaard ingeklapt
- **Resultaat-stap**: geen aparte pagina, gewoon stap 3 of 4

### Navigatie

- Toggle Bruto/Netto in het formulier (niet bovenaan als aparte tab)
- Taalwisseling: dropdown rechtsboven (Nederlands / Frans / Engels)
- Geen login of registratie
- Exporteer-knop (icoon) op resultaat-stap

### Voordelen t.o.v. onze huidige UX

| Aspect | Groups.be SalarySim | Onze PC 200 Loonmotor (huidig) |
|---|---|---|
| Invoer-progressiviteit | Stap-voor-stap wizard (3–4 stappen) | Accordion per berekenings-categorie (gelijkwaardig) |
| Berekeningsrichting | Bi-directioneel (vereenvoudigd); alleen Bruto→Netto (geavanceerd) | Alleen bruto→netto |
| Sector-keuze | Vrij dropdown alle PC's (geavanceerd) | Gefixeerd op PC 200 |
| Voordelen-pakket visualisatie | Subtotalen per sectie zichtbaar | Aparte panelen per categorie |
| Scenario-vergelijking | Niet aanwezig | Niet aanwezig |
| Audit-trail | Niet aanwezig (black box) | **Uniek voordeel: klikbare bronlinks** |
| Tier-1/2 validatie | Niet aanwezig | **Uniek voordeel: volledige traceerbaarheid** |

---

## 8. Vergelijkingstabel: Groups.be SalarySim vs. PC 200 Loonmotor

| Feature | Groups.be | PC 200 Loonmotor | Noot |
|---|---|---|---|
| **Scope PC's** | Alle ±200 | PC 200 only | Wij: bewust beperkt + gespecialiseerd |
| **Bruto→Netto** | ✅ | ✅ | |
| **Netto→Bruto** | ✅ (vereenvoudigd) / ❌ (geavanceerd) | ❌ | Roadmap item |
| **Deeltijds regime** | ✅ (geavanceerd) | ❌ | Ontbrekend in onze tool |
| **Gemeentebelasting instelbaar** | ❌ expliciet (via vestigingseenheid impliciet) | ℹ️ info | Groups.be vraagt het niet apart |
| **Maaltijdcheques** | ❌ geen apart veld | ❌ | Geen sectorale CAO PC 200 |
| **Ecocheques** | ❌ geen apart veld | ✅ | PC 200: €250 voltijds |
| **Eindejaarspremie** | ✅ (invoerveld) | ✅ | Incl. bijzondere BV bij ons |
| **Jaarlijkse premie PC 200** | ❌ geen apart veld | ✅ | €330,84 |
| **Bedrijfswagen VAA** | ✅ "Voordelen in natura wagen" | ❌ | Golf 3 bij ons |
| **Hospitalisatieverzekering** | ❌ geen apart veld | ❌ | Uitgesteld |
| **Groepsverzekering BV-vermindering** | ✅ | ✅ | 30% eigen bijdrage |
| **PC-privé / GSM / internet VAA** | ❌ geen apart veld | ❌ | Uitgesteld |
| **Thuiswerkvergoeding** | ❌ geen apart veld | ❌ | Geen PC 200-verplichting |
| **Mobiliteitsbudget** | ❌ geen apart veld | ❌ | Uitgesteld |
| **Woon-werk openbaar vervoer** | ✅ "Sociaal abonnement OV" | ✅ | CAO 19/9 |
| **Woon-werk privé vervoer** | ✅ "Sociaal abonnement privé" | ❌ | |
| **Fietsvergoeding** | ❌ geen apart veld | ✅ | CAO 164, €0,32/km |
| **Werkbonus sociaal** | ✅ (luik A + luik B apart getoond) | ✅ | AJ 2027 parameters |
| **Werkbonus fiscaal** | ✅ (verrekend in BV) | ✅ | 33,14% × A + 52,54% × B |
| **Bijzondere BV variabel loon** | ✅ (eindejaarspremie invoerveld) | ✅ | Eindejaar, DVG; sectorale PC 200-jaarpremie enkel RSZ |
| **Barema-lookup sectoraal** | ❌ (bruto zelf ingeven) | ✅ PC 200 Schaal I/II × Cat A–D | Groot verschil |
| **Functieclassificatie / anciënniteit** | ❌ niet beschikbaar | ✅ PC 200 Cat A–D, 0–40j | |
| **Audit-trail per waarde** | ❌ black box | ✅ **Uniek onderscheidend voordeel** | Klikbare bronlinks + tier |
| **Tier-1/2 bronnenhiërarchie** | ❌ | ✅ **Uniek** | Traceerbaarheid voor experten |
| **Structurele vermindering laagloon** | ✅ | ✅ | |
| **BBSZ** | ✅ (in sectie H, aparte aftrek) | ✅ (info-band) | |
| **Omvang werkgever (invloed struct. verm.)** | ✅ (invoerveld) | ❌ | Wij gebruiken vaste parameters |
| **Scenario-vergelijking** | ❌ | ❌ | Potentiële toevoeging |
| **Export (PDF/print)** | ✅ | ❌ | |

---

## 9. Aanbevolen verbeteringen voor onze tool

Op basis van deze vergelijking, gefilterd op relevantie voor PC 200-payrollexperten:

### Hoge prioriteit

| Feature | Reden |
|---|---|
| **Netto→Bruto berekening** | Meest gevraagde feature bij salarisonderhandelingen — "Hoeveel bruto voor €2.500 netto?" |
| **Deeltijds regime** | Essentieel voor correcte RSZ + BV-berekening; veel PC 200-werknemers werken deeltijds |

### Medium prioriteit

| Feature | Reden |
|---|---|
| **Scenario-vergelijking (A vs B)** | Loonoptimalisatie: vergelijk huidig vs. alternatief pakket naast elkaar |
| **Export (PDF/print)** | Praktisch voor klantgesprekken |
| **Omvang werkgever voor structurele vermindering** | Invloed op totale loonkost kan tot €100+/maand variëren |

### Lage prioriteit (golf 3)

| Feature | Reden |
|---|---|
| **Bedrijfswagen CO₂-formule** | Complex (cataloguswaarde × leeftijdsfactor × CO₂-coëfficiënt), aparte datapunten |
| **Mobiliteitsbudget** | Beperkte penetratie in PC 200; complex regelkader |
| **Woon-werk privé vervoer** | Weinig gebruikt in PC 200-context |

**Opmerking gemeentebelasting**: Groups.be vraagt de gemeentebelasting **niet apart** — het gebruikt enkel de vestigingseenheid (gewest) maar niet het gemeente-% zelf. Dit is een onverwacht zwak punt van Groups.be. Ons gebruik van een info-default (7,3%) is in lijn met de markt.

---

## 10. Bronnen

| Type | Bron |
|---|---|
| Tool (live) | https://online.groups.be/salarysim/?lg=nl |
| Alternatieve URL | https://services.groups.be/SalarySim/ibrunet.aspx?lg=NL |
| Group S (Tier 2) | https://www.groups.be |

---

*Dit document maakt deel uit van de PC 200 Loonmotor kennisbank. Zie ook `knowledgebase/08_gaps_en_pending.md` voor de implementatieroadmap van features geïnspireerd door deze vergelijking.*
