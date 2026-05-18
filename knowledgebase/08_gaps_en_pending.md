# Gaps & pending — Loonmotor PC 200 — peildatum 9 mei 2026

**Doel:** een levend overzicht van wat de huidige rekenmodule **niet** dekt, welke wettelijke wijzigingen nog **pending** zijn, en welke datapunten aanvullende validatie vragen voordat de loonmotor naar productie kan.

> Dit document is bedoeld als checklist bij elke release-cyclus. Iedere regel heeft een **eigenaar**, een **trigger** waarop herzien moet worden, en een **impact** (hoog/midden/laag) op de netto-uitkomst.

---

## 1. Pending wettelijke wijzigingen 2026 die de netto-rekenmodule kunnen beïnvloeden

| # | Item | Status op 9/5/2026 | Impact | Triage |
|---|------|--------------------|--------|--------|
| P-01 | **Fiscale werkbonus — Arizona-verhoging** naar 35,00% (luik A) en 63,00% (luik B) | Aangekondigd in begrotingsakkoord, **niet** in Programmawet 18/7/2025 of Wet Diverse Bepalingen 18/12/2025 | Hoog (raakt elke werkbonus-trekker rechtstreeks) | Modelleer **beide scenario's** (33,14/52,54 en 35/63) — implementeer als feature-flag zodra wettekst in BS verschijnt. |
| P-02 | **Belastingvrije som hervorming** — basisbedrag €11.180 → €11.550 | Wetsontwerp PB-hervorming, niet gestemd | Hoog (raakt iedereen) | Houd huidige €11.180 als referentie; voeg `vrije_som_scenario_hervorming` toe als parameter. |
| P-03 | **Plafond forfaitaire beroepskosten** verhoging boven €6.070 (AJ 2027) | Wetsontwerp PB-hervorming | Midden (alleen lonen >€20.233) | Behoud €6.070; trigger update zodra wijziging geïndexeerd. |
| P-04 | **Niet-recurrente resultaatsgebonden voordelen (CAO 90)** plafond €3.701 — geen specifieke wijziging 2026 maar telt mee in totaalberekening | Stabiel | Laag | OK voor 2026, herevaluatie januari 2027. |
| P-05 | **Verhoogde vrijstelling overuren** (Arizona) — fiscaal en RSZ | Programmawet 18/7/2025 — gedeeltelijk in werking | Midden (bij overuren >180 uur/jaar) | Buiten scope POC; opnemen in productieversie. |
| P-06 | **PB-hervorming sleutelformule Bijlage III KB** — coëfficiënten 2026 | Definitief KB 11/12/2025 | Hoog (BV-rekenmotor) | **Deels opgelost 12/05/2026:** TypeScript gebruikt nu een lokale Bijlage III-sleutelformule met Group S-anker. FOD Tax-Calc-validatie blijft pending — zie §3 hieronder. |

---

## 2. Datapunten die handmatige verificatie nodig hebben

### 2.1 Hard-vloeren

| Datapunt | Huidige waarde | Geverifieerd? | Bron-URL | Actie |
|---|---|---|---|---|
| RSZ werknemer privé | 13,07% | ✅ Tier 1 RSZ | rsz.fgov.be | OK |
| RSZ werkgever profitsector | ~25% (incl. loonmatigingsbijdrage) | ✅ Tier 1 RSZ | rsz.fgov.be | OK — sector-specifieke afwijking voor PC 200 nogmaals checken (loonmatigingsbijdrage 5,12%) |
| GGMMI 1/4/2026 | €2.189,81 | ✅ Tier 2 Acerta + CAO 43/18 NAR | acerta.be | OK |
| Sociale werkbonus luik A — R | €125,04 | ✅ Tier 2 Partena | partena-professional.be | OK |
| Sociale werkbonus luik B — R | €168,62 | ✅ Tier 2 Partena | partena-professional.be | OK |
| Sociale werkbonus hellingen | 0,2738 / 0,2699 | ✅ Tier 2 Securex | lex4you.be | OK |
| Werkbonus cutoff loongrenzen | €2.880,32 / €3.336,98 | ⚠️ Tier 2-bevestiging | partena | **Triangulatie nodig** met SD Worx |
| Fiscale werkbonus % luik A/B | 33,14% / 52,54% | ⚠️ Pending Arizona | KB-publicatie | Beide scenario's modelleren (zie P-01) |
| BBSZ-banden 2026 | 4,22% / 1,1% / 3,38% / 1,10% / cap €60,94 + gemeenschappelijke aanslag-scenario's | ✅ Tier 1 RSZ 2026/1 | socialsecurity.be | OK — scenario's expliciet in runtime; Partena/Liantis alleen triangulatie |
| PB-schijven AJ 2027 | 16.720 / 29.510 / 51.070 | ✅ Tier 2 Practicali + Wolters Kluwer | practicali.be | OK |
| Belastingvrije som AJ 2027 | €11.180 | ✅ Tier 2 Practicali + Wet Diverse Bepalingen 18/12/2025 | BS 30/12/2025 | OK |
| Forfaitaire beroepskosten max | €6.070 (30%) | ✅ Tier 2 Practicali | practicali.be | OK |
| Toeslag belastingvrije som per kind | €2.030 / €5.230 / €11.720 / €18.970 | ⚠️ Tier 2 | Practicali | **Verificatie via FOD Fin nuttig** — exacte indexatie 2026 |
| Toeslag kind <3 jaar | niet actief in calculatorlogica | ⚠️ Pending officiële BV-validatie | FOD Fin / Bijlage III te herbevestigen | Bewust verwijderd uit runtime op 2026-05-15; later herintroduceren met officiële BV-validatie en tests |
| Extra alleenstaande ouder | €2.030 | ⚠️ Tier 2 | Practicali | idem |
| BV-vermindering kinderen — maandtabel | €56 / €154 / €414 / €715 / ... | ⚠️ Tier 2-snapshot | Bijlage III KB | **Verificatie tegen exacte tabel KB 11/12/2025** — huidige waarden zijn benadering |

### 2.2 PC 200-specifiek

| Datapunt | Huidige waarde | Bron | Actie |
|---|---|---|---|
| Indexering 2026 | 2,21% (vanaf 1/1/2026) | sfonds200.be | OK — bevestigd |
| Jaarlijkse premie 2026 | €330,84 | sfonds200.be | OK — bevestigd |
| Sociaal Fonds 200 werkgeversbijdrage | 0,23% | sfonds200.be / cao | **Te bevestigen tegen actuele cao** — kan kwartaal-specifiek zijn |
| Eindejaarspremie | 13e maand (formule herzien per akkoord 18/12/2025 + 15/1/2026) | cao PC 200 | **Cao-tekst rechtstreeks raadplegen** voor exacte formule (anciënniteit 5→3 jaar) |
| Dubbel vakantiegeld bedienden | 92% × maandloon incl. VAA; RSZ 13,07% op 85/92 | RSZ Administratieve instructies | Geïntegreerd in jaaroverzicht |
| Fietsvergoeding (verhoogd akkoord 15/1/2026) | nog te kwantificeren | cao PC 200 + fiscale max €0,37/km × 3.700 km | **Triangulatie nodig** zodra cao-tekst beschikbaar |
| Tussenkomst treinvervoer | aangepast in akkoord 15/1/2026 | cao PC 200 | idem |

---

## 3. Methodologische gaps in de rekenmodule

### 3.1 Bedrijfsvoorheffing — sleutelformule en validatie

**Huidige aanpak (Golf 2, 12/05/2026):**
- `src/lib/bv.ts` retourneert `methode = bijlage_iii_sleutelformule_2026`, `schaal` en `validatieStatus = pending_taxcalc`.
- De lokale formule is geankerd op de gedocumenteerde Group S Salary Sim-case voor PC 200 Schaal I Cat A 5j.
- Officiële FOD Tax-Calc XLSX-waarden zijn nog niet ingevoerd; de motor mag dus nog niet als FOD-gevalideerd worden beschouwd.

**Verschil met de officiële sleutelformule (Bijlage III KB 11/12/2025):**
- De BV gebruikt schaalcoëfficiënten **per loonschijf** (niet de progressieve PB-schijven verondersteld via × 12).
- Sinds 2023 gebruikt BV glijdende schalen; geen oude afronding op veelvouden van €15 toepassen.
- Aparte tarieven voor "wedde" vs "uitkering" vs "vakantiegeld" vs "eindejaarspremie".
- Verminderingen voor gezinslasten zijn **forfaitaire bedragen per maand**, niet via belastingvrije som geannualiseerd.

**Verwachte afwijking:** onbekend tot de 30 FOD Tax-Calc-runs zijn ingevoerd; iedere afwijking > €5 krijgt een root-cause (`rsz`, `werkbonus`, `bv`, `bbsz`, `afronding`).

**Aanbeveling:** voer de FOD Tax-Calc-validatie in via `knowledgebase/tools/validate_corpus.py` en hou deploy tegen zolang de acceptatiecriteria niet gehaald zijn.

### 3.2 BBSZ — gezinssituatie

**Opgelost 17/05/2026:** de rekenmodule heeft een expliciete `bbszScenario`-parameter voor individuele aanslag, gemeenschappelijke aanslag met partner met beroepsinkomsten, en gemeenschappelijke aanslag met partner zonder beroepsinkomsten. De UI toont BBSZ als voorschot; de definitieve afrekening blijft via de PB-aangifte AJ 2027 lopen.

### 3.3 VAA bedrijfswagen — formule niet geïmplementeerd

POC accepteert VAA als input maar berekent niet zelf. Productieversie moet:
- CO₂-formule: `cataloguswaarde × 6/7 × (5,5 + (CO₂ − ref_CO₂) × 0,1) / 100 × leeftijdscoëfficient`
- Minimum-VAA AJ 2027: €1.690/jaar
- Referentie-CO₂ AJ 2027: 70 g/km benzine/lpg/aardgas, 58 g/km diesel
- Leeftijdscoëfficiënt: 100% (0–12m), 94% (13–24m), ..., 70% (>60m)

### 3.4 Andere VAA niet gedekt

- VAA verwarming (€1.150 werknemer, AJ 2027)
- VAA elektriciteit (€580 werknemer, AJ 2027)
- VAA woning (cataloguswaarde × KI-formule)
- VAA gsm/laptop/internet (forfaitair)

### 3.5 Verminderingen niet gedekt

- **Verminderingen voor lage lonen** (Vlaanderen — fiscale werkbonus deelstaat)
- **Verminderingen pensioensparen / langetermijnsparen** (alleen relevant in jaaraangifte, niet in maandelijkse BV)
- **Mantelzorgvermindering**

### 3.6 Bijzondere stelsels niet gedekt

- Niet-recurrente resultaatsgebonden voordelen (CAO 90) — €3.701 vrijgesteld
- Mobiliteitsbudget (€3.233–€17.244)
- Bijzonder belastingstelsel ingekomen belastingplichtigen
- Auteursrechten (15% RV, plafond €77.220)

### 3.7 Afwijkingen voor specifieke groepen

- **Bedrijfsleiders** (kostenforfait 3%, max €3.030)
- **Grensarbeiders** (Frans-Belgisch en Nederlands-Belgisch dubbelbelastingverdrag)
- **Buitenlandse werknemers** (internationale tewerkstelling)
- **Loonbeslag** (huwelijks- en verzorgingsplicht)

Allemaal **buiten scope POC**, opnemen in roadmap voor productie.

---

## 3b. Opgeloste gaps (implementatiehistoriek)

| # | Gap | Opgelost | Hoe |
|---|-----|----------|-----|
| G-01 | Extralegale voordelen werkgever (groepsverzekering, maaltijdcheques, hospitalisatieverzekering, ecocheques) waren hardgecodeerd op €0 | ✅ 12 mei 2026 | `Profiel`-interface uitgebreid met `arbeidsongevallenPct`, `extraGroepsverzekering`, `maaltijdchequeWerkgeversaandeelPerDag`, `arbeidsdagenPerMaand`, `extraHospitalisatie`; `extraEcocheques` automatisch afgeleid. Maaltijdcheques = dagbedrag × werkdagen, met max €8,91/dag vanaf 01/01/2026. Nieuwe "Werkgeversbijdragen" accordion in de sidebar. Itemized rows in `WerkgeverskostPanel`. Zowel `bouwResultaten` als `computeSummary` fully wired. |
| G-02 | BV-module had geen expliciete sleutelformule-metadata of validatiestatus | ✅ 12 mei 2026 | `berekenBV()` rapporteert nu methode, schaal en `pending_taxcalc`; tests bevatten een Group S-anker en het 30-cases validatieregister staat in `src/lib/taxcalcValidation.ts`. |

---

## 4. Validatie-gaps

| Item | Status | Actie |
|---|---|---|
| 30 testcases gegenereerd | ✅ `TESTCASES.json` + `src/lib/taxcalcValidation.ts` | Statussen staan op `pending` tot Tax-Calc-output wordt ingevoerd |
| Validatie tegen FOD Fin Tax-Calc XLSX | ⚠️ Pending | **Volgende stap:** download Tax-Calc AJ 2027, runs voor 30 cases, importeer CSV via `validate_corpus.py` |
| Validatie tegen sociaal-secretariaat-output (Securex/Acerta/SD Worx loonberekeningstools) | ⚠️ Deels voorbereid | 5 triangulatie-ankers vastgelegd; Group S Schaal I Cat A 5j als eerste anker in test |
| Regressietest-suite (CI-integratie) | ⚠️ Lokaal aanwezig | `bun test` dekt BV-metadata, Group S-anker, schema-smoke en werkgeverskost-regressie; CI nog niet ingericht |
| Edge-case testing | Gedeeltelijk in 30 cases | Aanvullen: deeltijds, lange afwezigheid, eindejaarspremie maand, vakantiegeld maand |

---

## 5. Bron-divergenties die opvolging vragen

| Onderwerp | Divergentie | Aanbeveling |
|---|---|---|
| Fiscale werkbonus % | 33,14/52,54 (huidig) vs 35/63 (Arizona pending) | Beide scenario's, default = huidig |
| BBSZ-hervorming 2028 | Kamerstuk DOC 56 1243/001 en Liantis kondigen individualisering, 4% en cap €30,47 aan vanaf inkomsten 2028 / AJ 2029; wetgeving opvolgen tot definitieve publicatie | Niet in 2026-runtime opnemen; pas implementeren met inkomstenjaar/regeljaar-schakelaar |
| Eindejaarspremie PC 200 | "Lichte herziening" akkoord 15/1/2026 — exacte formule afhankelijk van anciënniteit (5→3 jaar) | **Cao-tekst rechtstreeks raadplegen** |

---

## 6. Roadmap voor pending-tracking

- **Maandelijks** (1ste week): scan **Belgisch Staatsblad** op nieuwe KB's en wetten met fiscale of socialezekerheidsimpact.
- **Per kwartaal**: heronderzoek **Liantis / Securex / Partena / Acerta nieuwsalerts** voor parameteractualisatie.
- **Twee keer per jaar** (1/4 en 1/1): GGMMI- en werkbonus-actualisatie automatisch verifiëren.
- **Jaarlijks januari**: PB-schijven, belastingvrije som, kostenforfait, VAA-bedragen.
- **Bij elk PC 200 sectorakkoord**: cao-tekst lezen + parameteraanpassingen.

---

## 7. Eigenaarschap en herzieningsritme

| Categorie | Eigenaar | Herzien |
|---|---|---|
| Fiscale parameters AJ 2027 | Loonmotor productowner | Jaarlijks januari |
| RSZ-parameters | Loonmotor productowner | Halfjaarlijks (1/1, 1/7) |
| Werkbonus | Loonmotor productowner | Telkens GGMMI-update (1/1, 1/4 minimaal) |
| PC 200-specifieke parameters | PC 200 cao-volger / sectorspecialist | Per cao-akkoord |
| Pending-tabel | Loonmotor productowner | Maandelijks |
