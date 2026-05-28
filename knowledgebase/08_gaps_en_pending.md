# Gaps & pending — Jaakie PC 200 — peildatum 24 mei 2026

**Doel:** een levend overzicht van wat de huidige rekenmodule **niet** dekt, welke wettelijke wijzigingen nog **pending** zijn, en welke datapunten aanvullende validatie vragen voordat de loonmotor naar productie kan.

> Dit document is bedoeld als checklist bij elke release-cyclus. Iedere regel heeft een **eigenaar**, een **trigger** waarop herzien moet worden, en een **impact** (hoog/midden/laag) op de netto-uitkomst.

---

## 1. Pending wettelijke wijzigingen 2026 die de netto-rekenmodule kunnen beïnvloeden

| # | Item | Status op 24/05/2026 | Impact | Triage |
|---|------|--------------------|--------|--------|
| P-01 | **Fiscale werkbonus — Arizona-verhoging** naar 35,00% (luik A) en 63,00% (luik B) | Kamer DOC 56 1243/001 is een officieel wetsontwerp; geen definitieve BS/Justel-publicatie gevonden op 24/05/2026 | Hoog (raakt elke werkbonus-trekker rechtstreeks) | Modelleer **beide scenario's** (33,14/52,54 en 35/63) — implementeer als feature-flag zodra definitieve wettekst in BS/Justel verschijnt. |
| P-02 | **Belastingvrije som hervorming** — huidig AJ 2027-bedrag €11.180, hervormingsscenario later | FOD Financiën bevestigt €11.180 voor inkomstenjaar 2026/AJ 2027; hervorming blijft wetsontwerp | Hoog (raakt iedereen) | Houd huidige €11.180 als runtime-referentie; geen scenario activeren zonder definitieve publicatie. |
| P-03 | **Plafond forfaitaire beroepskosten** verhoging boven €6.070 (AJ 2027) | FOD Financiën bevestigt huidig maximum €6.070 voor inkomstenjaar 2026/AJ 2027 | Midden (alleen lonen >€20.233) | Behoud €6.070; trigger update zodra FOD/BS een latere wijziging publiceert. |
| P-04 | **Niet-recurrente resultaatsgebonden voordelen (CAO 90)** plafond €3.701 — geen specifieke wijziging 2026 maar telt mee in totaalberekening | Stabiel | Laag | OK voor 2026, herevaluatie januari 2027. |
| P-05 | **Verhoogde vrijstelling overuren** (Arizona) — fiscaal en RSZ | Programmawet 18/7/2025 — gedeeltelijk in werking | Midden (bij overuren >180 uur/jaar) | Buiten scope POC; opnemen in productieversie. |
| P-06 | **PB-hervorming sleutelformule Bijlage III KB** — coëfficiënten 2026 | Definitief KB 11/12/2025 | Hoog (BV-rekenmotor) | **Opgelost 19/05/2026 voor corpusvalidatie:** TypeScript gebruikt een lokale Bijlage III-sleutelformule met FOD Financiën / Bijlage III als primaire bron; de 30 cases dragen FOD Bijlage III-validatievelden. Tax-Calc blijft alleen PB-ramingscheck. |

---

## 2. Datapunten die handmatige verificatie nodig hebben

### 2.1 Hard-vloeren

| Datapunt | Huidige waarde | Geverifieerd? | Bron-URL | Actie |
|---|---|---|---|---|
| RSZ werknemer privé | 13,07% | ✅ Tier 1 RSZ | rsz.fgov.be | OK |
| RSZ werkgever profitsector | ~25% (incl. loonmatigingsbijdrage) | ✅ Tier 1 RSZ | rsz.fgov.be | OK — sector-specifieke afwijking voor PC 200 nogmaals checken (loonmatigingsbijdrage 5,12%) |
| GGMMI 1/4/2026 | €2.189,81 | ✅ Tier 2 Acerta + CAO 43/18 NAR | acerta.be | OK |
| Sociale werkbonus luik A — R | €125,04 | ✅ Tier 1 RSZ | socialsecurity.be | OK — bronronde 24/05/2026 |
| Sociale werkbonus luik B — R | €168,62 | ✅ Tier 1 RSZ | socialsecurity.be | OK — bronronde 24/05/2026 |
| Sociale werkbonus hellingen | 0,2738 / 0,2699 | ✅ Tier 1 RSZ + Tier 2 Securex | socialsecurity.be / securex.be | OK |
| Werkbonus cutoff loongrenzen | €2.880,32 / €3.336,98 | ✅ Tier 1 RSZ | socialsecurity.be | OK |
| Fiscale werkbonus % luik A/B | 33,14% / 52,54% | ✅ Tier 1 FOD Fin voor huidige runtime; ⚠️ DOC 56 1243/001 voor Arizona | FOD Fin / De Kamer | Beide scenario's documenteren; default blijft huidig regime (zie P-01) |
| BBSZ-banden 2026 | 4,22% / 1,1% / 3,38% / 1,10% / cap €60,94 + gemeenschappelijke aanslag-scenario's | ✅ Tier 1 RSZ 2026/1 | socialsecurity.be | OK — scenario's expliciet in runtime; Partena/Liantis alleen triangulatie |
| PB-schijven AJ 2027 | 16.720 / 29.510 / 51.070 | ✅ Tier 1 FOD Fin | fin.belgium.be | OK — bronronde 24/05/2026 |
| Belastingvrije som AJ 2027 | €11.180 | ✅ Tier 1 FOD Fin | fin.belgium.be | OK — bronronde 24/05/2026 |
| Forfaitaire beroepskosten max | €6.070 (30%) | ✅ Tier 1 FOD Fin | fin.belgium.be | OK — bronronde 24/05/2026 |
| Toeslag belastingvrije som per kind | €2.030 / €5.230 / €11.720 / €18.970 | ⚠️ Tier 2 | Practicali | **Verificatie via FOD Fin nuttig** — exacte indexatie 2026 |
| Toeslag kind <3 jaar | niet actief in calculatorlogica | ⚠️ Pending officiële BV-validatie | FOD Fin / Bijlage III te herbevestigen | Bewust verwijderd uit runtime op 2026-05-15; later herintroduceren met officiële BV-validatie en tests |
| Extra alleenstaande ouder | €2.030 | ⚠️ Tier 2 | Practicali | idem |
| BV-vermindering kinderen — maandtabel | €56 / €154 / €414 / €715 / ... | ⚠️ Tier 2-snapshot | Bijlage III KB | **Verificatie tegen exacte tabel KB 11/12/2025** — huidige waarden zijn benadering |

### 2.2 PC 200-specifiek

| Datapunt | Huidige waarde | Bron | Actie |
|---|---|---|---|
| Indexering 2026 | 2,21% (vanaf 1/1/2026) | sfonds200.be | OK — bevestigd |
| Jaarlijkse premie 2026 | €330,84 | sfonds200.be | OK — bevestigd |
| Arbeidsongevallenverzekering kantoorbedienden | default 0,30% | Fedris bevestigt verzekeringsplicht; geen publiek sectoraal tarief | **Onzeker als tarief** — 0,30% blijft lage configureerbare default, geen harde sectorparameter |
| Eindejaarspremie | 13e maand (formule herzien per akkoord 15/1/2026) | sfonds200.be + cao PC 200 | OK voor scope; exacte uitvoeringsnuances blijven auditpunt bij volgende cao-tekstupdate |
| Dubbel vakantiegeld bedienden | 92% × maandloon incl. VAA; RSZ 13,07% op 85/92 | RSZ Administratieve instructies | Geïntegreerd in jaaroverzicht |
| Fietsvergoeding (akkoord 15/1/2026) | €0,27/km tot 30/09/2026; €0,32/km vanaf 01/10/2026 | sfonds200.be | OK — bronronde 24/05/2026 |
| Tussenkomst treinvervoer | 100% prijs treinkaart 2e klasse vanaf eerste kilometer | sfonds200.be | OK — bronronde 24/05/2026 |
| Landingsbaan-supplement | €92,45/maand vanaf 01/06/2026 | sfonds200.be | OK — bronmetadata opgewaardeerd naar Tier 1 |

---

## 3. Methodologische gaps in de rekenmodule

### 3.1 Bedrijfsvoorheffing — sleutelformule en validatie

**Huidige aanpak (Golf 2, bijgewerkt 23/05/2026):**
- `src/lib/bv.ts` retourneert `methode = bijlage_iii_sleutelformule_2026`, `schaal` en `validatieStatus = fod_bijlage_iii_ok`.
- De lokale formule verwijst primair naar FOD Financiën / Bijlage III 2026 en gebruikt de wettelijke basisschaal 26,75% / 42,80% / 48,15% / 53,50%.
- Schaal I trekt €2.987,98 af als belastingvrije-som-equivalent; Schaal II gebruikt huwelijksquotiënt `min(30%, €13.790)` en trekt €5.975,96 af.
- Regressiecase uit experttool: bruto €2.300, belastbare BV-basis €2.281,04, fiscale werkbonus €123,72 → BV €163,57 en netto €2.122,35.
- `knowledgebase/TESTCASES.json` bevat per case `officiele_bv_voor_verminderingen`, `officiele_bv_netto`, `officieel_netto_maand` en `bron_validatie = "FOD Bijlage III 2026"`.
- Group S en andere sociale-secretariaat-tools blijven bruikbaar als Tier-2 triangulatie, maar mogen geen primaire bron of officieel anker zijn.

**Wettelijke aandachtspunten bij toekomstige wijzigingen:**
- De BV gebruikt schaalcoëfficiënten **per loonschijf** (niet de progressieve PB-schijven verondersteld via × 12).
- Sinds 2023 gebruikt BV glijdende schalen; geen oude afronding op veelvouden van €15 toepassen.
- Aparte tarieven voor "wedde" vs "uitkering" vs "vakantiegeld" vs "eindejaarspremie".
- Verminderingen voor gezinslasten komen uit Bijlage III-jaarbedragen en worden als maandbedragen getoond.

**Verwachte afwijking:** de 30 corpuscases staan op `ok`; iedere toekomstige afwijking > €5 krijgt een root-cause (`rsz`, `werkbonus`, `bv`, `bbsz`, `afronding`).

**Aanbeveling:** valideer corpuswijzigingen via `knowledgebase/tools/validate_bijlage_iii_corpus.py` en hou deploy tegen bij `status_validatie = afwijking`.

### 3.2 BBSZ — gezinssituatie

**Opgelost 17/05/2026:** de rekenmodule heeft een expliciete `bbszScenario`-parameter voor individuele aanslag, gemeenschappelijke aanslag met partner met beroepsinkomsten, en gemeenschappelijke aanslag met partner zonder beroepsinkomsten. De UI toont BBSZ als voorschot; de definitieve afrekening blijft via de PB-aangifte AJ 2027 lopen.

### 3.3 VAA — huidige dekking en resterende gaps

**Opgelost 23/05/2026:** de POC berekent VAA bedrijfswagen via `src/lib/vaaBedrijfswagen.ts`:
- CO₂-formule: `cataloguswaarde × 6/7 × CO₂-percentage × leeftijdscoëfficiënt`
- Minimum-VAA AJ 2027: €1.690/jaar
- Referentie-CO₂ AJ 2027: 70 g/km benzine/lpg/aardgas, 58 g/km diesel
- Leeftijdscoëfficiënt: 100% (0–12m), 94% (13–24m), ..., 70% (>60m)

Daarnaast berekent `src/lib/vaaForfaits.ts` de forfaitaire VAA voor PC/laptop, GSM, internet en GSM-abonnement.

**Bronronde 24/05/2026:** FOD Financiën bevestigt live het minimum-VAA bedrijfswagen (€1.690/jaar), referentie-CO₂ (70/58) en de forfaits voor werkmiddelen (72/36/60/48 EUR per jaar). De runtimewaarden blijven ongewijzigd.

**Nog niet gedekt:**
- VAA verwarming (€1.150 werknemer, AJ 2027)
- VAA elektriciteit (€580 werknemer, AJ 2027)
- VAA woning / huisvesting
- Tablet als apart forfaitair scenario

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
| G-01 | Extralegale voordelen werkgever (groepsverzekering, maaltijdcheques, hospitalisatieverzekering, ecocheques) waren hardgecodeerd op €0 | ✅ 12 mei 2026 | `Profiel`-interface uitgebreid met `arbeidsongevallenPct`, `extraGroepsverzekering`, `maaltijdchequeWerkgeversaandeelPerDag`, `arbeidsdagenPerMaand`, `extraHospitalisatie`; `extraEcocheques` automatisch afgeleid. Maaltijdcheques = dagbedrag × werkdagen, met max €8,91/dag vanaf 01/01/2026. De huidige UI groepeert dit in cockpit/accordionsecties. Itemized rows in `WerkgeverskostPanel`. Zowel `bouwResultaten` als `computeSummary` fully wired. |
| G-02 | BV-module had geen expliciete sleutelformule-metadata of validatiestatus | ✅ 12 mei 2026, afgerond 19 mei 2026 | `berekenBV()` rapporteert nu methode, schaal en `fod_bijlage_iii_ok`; primaire broncommunicatie verwijst naar FOD Financiën / Bijlage III. Het 30-cases validatieregister staat in `src/lib/fodBvValidation.ts`. |
| G-03 | Netto → Bruto calculatie ontbrak | ✅ 19 mei 2026 | Numerieke inverse via binary search in `src/lib/nettoNaarBruto.ts`. UI-toggle bovenaan formulier. 25 inverse golden tests in `src/lib/__tests__/nettoNaarBruto.test.ts`. Alleen bedienden in fase 1; studenten in fase 2. |
| G-04 | VAA bedrijfswagen en forfaitaire werkmiddelen ontbraken | ✅ 23 mei 2026 | `src/lib/vaaBedrijfswagen.ts` en `src/lib/vaaForfaits.ts` zijn actief in netto, werkgeverskost en jaaroverzicht; resterende VAA-gaps staan in §3.3. |
| G-05 | Fase-2 UI-migratie stond alleen als plan beschreven | ✅ 23 mei 2026 | `HomePage.tsx` gebruikt single-column layout met CSV-paneel, `DirectionToggle`, `HeroSummary`, `InputCockpit`, 2×2 `CockpitCard`-grid, `CockpitAccordion`s en `ResultBandsPanel`. |
| G-06 | Loonfiche/loonrun light had semantische risico's rond netto→bruto werkgeverskost, studenten-maaltijdcheques en bruto-labels | ✅ 29 mei 2026 | Netto→bruto gebruikt één effectief bruto doorheen loonfiche en werkgeverskost; studenten-maaltijdcheques trekken alleen werknemersbijdrage af; loonrun splitst bruto cash, RSZ-basis en belastbaar voor BV; gemengde run-context geeft blokkerende validatie. |

---

## 4. Validatie-gaps

| Item | Status | Actie |
|---|---|---|
| 30 testcases gegenereerd | ✅ `TESTCASES.json` + `src/lib/fodBvValidation.ts` | Statussen staan op `ok` met FOD Bijlage III-validatievelden |
| Validatie tegen FOD Bijlage III 2026 | ✅ Ingevoerd | Herhaal via `validate_bijlage_iii_corpus.py` bij corpuswijzigingen |
| Validatie tegen sociaal-secretariaat-output (Securex/Acerta/SD Worx loonberekeningstools) | ⚠️ Deels voorbereid | 5 triangulatie-ankers vastgelegd; Group S Schaal I Cat A 5j als eerste anker in test |
| Regressietest-suite (CI-integratie) | ⚠️ Lokaal aanwezig | `bun test` dekt BV-metadata, Tier-2 triangulatie, schema-smoke en werkgeverskost-regressie; CI nog niet ingericht |
| Edge-case testing | Gedeeltelijk in 30 cases | Aanvullen: deeltijds, lange afwezigheid, eindejaarspremie maand, vakantiegeld maand |

---

## 5. Bron-divergenties die opvolging vragen

| Onderwerp | Divergentie | Aanbeveling |
|---|---|---|
| Fiscale werkbonus % | 33,14/52,54 (huidig) vs 35/63 (Arizona pending via DOC 56 1243/001) | Beide scenario's, default = huidig; geen runtimewijziging zonder BS/Justel |
| BBSZ-hervorming 2028 | Kamerstuk DOC 56 1243/001 en Liantis kondigen individualisering, 4% en cap €30,47 aan vanaf inkomsten 2028 / AJ 2029; wetgeving opvolgen tot definitieve publicatie | Niet in 2026-runtime opnemen; pas implementeren met inkomstenjaar/regeljaar-schakelaar |
| AO-default | 0,30% configureerbaar, maar geen publiek sectoraal tarief | UI-label als aanname behouden; nooit als PC 200-cao-waarde presenteren |

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
