# Golden Testcases — PC 200 Payroll Tool 2026

**Bestand:** `pc200_payroll_testcases_2026.md`
**Versie:** 2026-05-08
**Doel:** een set herhaalbare, brononderbouwde testcases voor de PC 200-loonmotor POC. Elke testcase verwijst naar het datapunt-`id` in `pc200_payroll_dataset_2026.json` plus een externe Tier 1/2-bron.

> Wanneer een berekend bedrag in de tool afwijkt van de **verwachte uitkomst** in een testcase, is dat een blocker — zoek de oorzaak in (a) lookup, (b) normalisatie, (c) afronding, of (d) een ondertussen gewijzigde bron.

---

## Conventies

- **Brutoloon-check** = "is het opgegeven brutoloon ≥ het sectoraal minimum voor (schaal × cat × ervaring)?"
- **RSZ werknemer** = brutoloon × 13,07 % (afronding op € 0,01).
- **RSZ werkgever (profit)** = brutoloon × 25,00 % (faciaal tarief; reeds inclusief 5,12 % loonmatiging — geen kortingen voor doelgroepen of structurele lastenverlaging in deze POC).
- **Sociaal Fonds 200** = brutoloon × 0,23 % (werkgeversbijdrage, periode 1/1/2026 – 31/12/2027).
- **Bouw-aanvullend pensioen** = brutoloon × 1,80 % — **enkel** wanneer `bouw_vlag = true`.
- **Bedragen** worden afgerond op 2 decimalen (banker's rounding niet vereist; standaard `round(x, 2)` volstaat).

---

## TC-01 — Schaal I, Cat A, 0 jaar (instapper)

| Input | Waarde |
|---|---|
| Schaal | I |
| Categorie | A |
| Ervaring (jaren) | 0 |
| Brutoloon (opgegeven) | € 2.242,81 |
| Bouw-vlag | nee |

**Verwachte uitkomst**

| Item | Waarde | Bron-`id` |
|---|---|---|
| Sectoraal minimum | € 2.242,81 | `lonen_pc200_schaalI_catA_01012026` |
| Brutoloon-check | OK (gelijk aan minimum) | — |
| RSZ werknemer | € 293,14 | `rsz_werknemer_basis` |
| RSZ werkgever | € 560,70 | `rsz_werkgever_profit_basis` |
| Sociaal Fonds 200 | € 5,16 | `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` |

**Externe Tier 1/2-bevestiging:** SSN-baremaPDF *Barema PC 200 — januari 2026*, Schaal I Cat A jaar 0 = € 2.242,81. RSZ-tarieven: portaal `socialsecurity.be` (overzicht werkgeversbijdragen 2026).

---

## TC-02 — Schaal I, Cat A, 5 jaar

| Input | Waarde |
|---|---|
| Schaal | I |
| Categorie | A |
| Ervaring | 5 jaar |
| Brutoloon | € 2.276,51 |
| Bouw-vlag | nee |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Sectoraal minimum | € 2.276,51 | `lonen_pc200_schaalI_catA_01012026` |
| Brutoloon-check | OK | — |
| RSZ werknemer | € 297,54 | `rsz_werknemer_basis` |
| RSZ werkgever | € 569,13 | `rsz_werkgever_profit_basis` |
| Sociaal Fonds 200 | € 5,24 | `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` |

---

## TC-03 — Schaal I, Cat A, 18+ jaar (loonplafond)

| Input | Waarde |
|---|---|
| Schaal | I |
| Categorie | A |
| Ervaring | 25 jaar (boven plafond) |
| Brutoloon | € 2.459,89 |
| Bouw-vlag | nee |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Sectoraal minimum | € 2.459,89 (clamp op jaar 18) | `lonen_pc200_schaalI_catA_01012026` |
| Brutoloon-check | OK | — |
| Toelichting | Vanaf 18 jaar wordt het barema constant — UI moet dit visueel tonen. | — |

> **Test-anker:** zorg dat de tool bij `ervaring > 18` géén KeyError gooit en de plafondwaarde teruggeeft.

---

## TC-04 — Schaal I, Cat D, jaar 2 (OCR-correctie)

| Input | Waarde |
|---|---|
| Schaal | I |
| Categorie | D |
| Ervaring | 2 jaar |
| Brutoloon | € 2.589,26 |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Sectoraal minimum | € 2.589,26 (gecorrigeerde waarde — oorspronkelijke OCR was "€ 2.303,07") |

> **Doel van deze testcase:** verifieert dat de OCR-correctie uit `CORE §6.4` correct is overgenomen.

---

## TC-05 — Schaal II, Cat A, jaar 13 (OCR-correctie)

| Input | Waarde |
|---|---|
| Schaal | II |
| Categorie | A |
| Ervaring | 13 jaar |
| Brutoloon | € 2.446,31 |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Sectoraal minimum | € 2.446,31 (oorspronkelijke OCR "2.4.46,31") |

---

## TC-06 — Schaal II, Cat C, 10 jaar (midden-anciënniteit)

| Input | Waarde |
|---|---|
| Schaal | II |
| Categorie | C |
| Ervaring | 10 jaar |
| Brutoloon | € 2.875,48 |
| Bouw-vlag | nee |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Sectoraal minimum | € 2.875,48 | `lonen_pc200_schaalII_catC_01012026` |
| RSZ werknemer | € 375,82 | `rsz_werknemer_basis` |
| RSZ werkgever | € 718,87 | `rsz_werkgever_profit_basis` |
| Sociaal Fonds 200 | € 6,61 | `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` |

---

## TC-07 — Brutoloon onder sectoraal minimum (faalpad)

| Input | Waarde |
|---|---|
| Schaal | II |
| Categorie | C |
| Ervaring | 10 jaar |
| Brutoloon (opgegeven) | € 2.500,00 |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Sectoraal minimum | € 2.875,48 |
| Brutoloon-check | **FAAL** — opgegeven brutoloon ligt € 375,48 onder sectoraal minimum |
| Tool-gedrag | Tonen waarschuwing met klikbare link naar `bron_url` van het barema |

---

## TC-08 — Bouw-subset (extra werkgeversbijdrage)

| Input | Waarde |
|---|---|
| Schaal | I |
| Categorie | B |
| Ervaring | 5 jaar |
| Brutoloon | € 2.350,00 |
| Bouw-vlag | **ja** |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| RSZ werknemer | € 307,15 | `rsz_werknemer_basis` |
| RSZ werkgever (basis) | € 587,50 | `rsz_werkgever_profit_basis` |
| Sociaal Fonds 200 | € 5,41 | `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` |
| Bouw — aanvullend pensioen | € 42,30 | `rsz_pc200_bouw_aanvullend_pensioen_2026` |
| **Totale werkgeversbijdrage** | **€ 635,21** | — |

---

## TC-09 — Studentenbarema, Cat A, 17 jaar

| Input | Waarde |
|---|---|
| Schaal | studenten |
| Categorie | A |
| Leeftijd | 17 jaar |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Sectoraal minimum | € 1.635,95 | `lonen_pc200_studenten_catA_01012026` |

---

## TC-10 — Studentenbarema, Cat C, 16 jaar (faalpad)

| Input | Waarde |
|---|---|
| Schaal | studenten |
| Categorie | C |
| Leeftijd | 16 jaar |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Sectoraal minimum | **n.v.t.** — Cat C/D bestaat niet voor 16-jarigen |
| Tool-gedrag | Duidelijke foutmelding: *"Cat C en D zijn enkel van toepassing vanaf 18 jaar"* met verwijzing naar SSN-PDF |

---

## TC-11 — Jaarlijkse premie 2026

| Input | Waarde |
|---|---|
| Werknemer | bediende PC 200, voltijds, volledige refertepériode |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Jaarlijkse premie | € 330,84 | `pc200_jaarlijkse_premie_2026` |
| Bron-URL | https://www.sfonds200.be/nl/ | — |

**Externe Tier 1-bevestiging:** sfonds200.be — sectorale onderhandelingen 2025-2026 — bedrag jaarlijkse premie geïndexeerd voor 2026.

---

## TC-12 — Eindejaarspremie pro-rata

| Input | Waarde |
|---|---|
| Brutoloon | € 2.875,48 |
| Anciënniteit op 31/12/2026 | 6 maanden (verworven recht) |
| Prestaties refertepériode | 9/12 maanden (juni-december) |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Voorwaarden voldaan | Ja (≥ 6 mnd) | `pc200_eindejaarspremie` veld `voorwaarden` |
| Pro-rata factor | 9/12 = 0,75 | — |
| Eindejaarspremie | € 2.156,61 (= 2.875,48 × 0,75) | — |

> **Open punt voor POC:** definieer in de UI hoe de gebruiker prestaties opgeeft (volledige maanden vs. werkdagen). De CAO laat beide methodes toe.

---

## TC-13 — Ecocheques voltijds, volledig

| Input | Waarde |
|---|---|
| Tewerkstellingsbreuk | 5/5 |
| Refertepériode | volledig |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Ecocheques | € 250 | `pc200_ecocheques_voltijds` |

---

## TC-14 — Ecocheques deeltijds 3/5

| Input | Waarde |
|---|---|
| Tewerkstellingsbreuk | 3/5 |
| Refertepériode | volledig |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Ecocheques | € 200 | `pc200_ecocheques_deeltijds_schaal` |

---

## TC-15 — Fietsvergoeding 2026 (overgang oktober)

| Input | Waarde |
|---|---|
| Aantal km/dag | 8 km |
| Aantal arbeidsdagen sept 2026 | 22 |
| Aantal arbeidsdagen okt 2026 | 22 |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Vergoeding september (€ 0,27/km) | € 47,52 (8 × 0,27 × 22) | n.v.t. — historisch tarief vóór 1/10/2026 (zie `opmerkingen` op `pc200_fietsvergoeding_2026`) |
| Vergoeding oktober (€ 0,32/km) | € 56,32 (8 × 0,32 × 22) | `pc200_fietsvergoeding_2026` |

> **POC-implicatie:** de tool moet de `geldig_vanaf`-datum (1/10/2026) respecteren bij periode-filtering. Voor referentiedatums vóór 1/10/2026 is dit datapunt niet actief.

---

## TC-16 — Woon-werk trein 100 %

| Input | Waarde |
|---|---|
| Prijs treinkaart 2e klasse / maand | € 92,00 |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Werkgeverstussenkomst | € 92,00 (100 %) | `pc200_woonwerk_trein_2026` |

> **Bronafwijking gedocumenteerd:** sfonds200 zegt 1/1/2026, ACV-document zegt 1/2/2026. Voor de POC: 1/1/2026 aanhouden (Tier 1-bron primeert), maar de UI toont de toelichting uit `opmerkingen`.

---

## TC-17 — Indexatie van een ondernemingsloon (boven sectoraal minimum)

| Input | Waarde |
|---|---|
| Loon op 31/12/2025 | € 3.500,00 |
| Datum indexatie | 1/1/2026 |

**Verwachte uitkomst**

| Item | Waarde | Bron |
|---|---|---|
| Indexcoëfficiënt | 1,0221 | `lonen_pc200_indexcoefficient_2026` |
| Geïndexeerd loon | € 3.577,35 | — |

> **Niet vermenigvuldigen** met sectoraal barema — die zitten al ge-indexeerd in `tabel_per_ervaring`.

---

## TC-18 — Niet-gevonden datapunt: maaltijdcheques

| Input | Waarde |
|---|---|
| Vraag | "Wat is de sectorale maaltijdcheque-waarde voor PC 200?" |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Sectoraal antwoord | **`niet_gevonden`** — geen sectorcao |
| Tool-gedrag | Duidelijke melding: *"PC 200 heeft geen sectorale verplichting; maaltijdcheques worden via ondernemingscao toegekend (federaal max € 8 → € 10/dag, onder voorbehoud)."* met link naar `meta.niet_gevonden` |

---

## TC-19 — Datapunt status `mogelijk_verouderd`

| Input | Waarde |
|---|---|
| Vraag | RSZ-bijzondere bijdragen toepassen |

**Verwachte uitkomst**

| Item | Waarde |
|---|---|
| Datapunt | `rsz_bijzondere_bijdragen_verwijzing` (status `mogelijk_verouderd`) |
| Tool-gedrag | Niet blokkeren, maar duidelijk waarschuwen + link naar RSZ administratieve instructies |

---

## TC-20 — Audit trail bij elke uitkomst

**Doel:** generiek acceptatietest, géén numerieke output.

**Eis:**
- Voor elke uitkomst toont de UI een klikbare bron-link.
- De link opent in een nieuw tabblad.
- Voor Tier 3-datapunten zijn ook de `triangulatie_bronnen` zichtbaar (uitklapbaar paneel).
- Bij `status ≠ actief` is de uitkomst gemarkeerd (kleur + icoon) met de status-tekst en `opmerkingen`.

---

## Externe bronnen die deze testset onderbouwen

| Bron | Tier | Gebruik |
|---|---|---|
| SSN-baremaPDF (`ssn.be/sites/default/files/barema_200_01-2026_nl.pdf`) | Tier 2 | Alle baremawaarden TC-01 t/m TC-10 |
| sfonds200.be | Tier 1 | Indexcoëfficiënt, jaarlijkse premie, woon-werk trein, Sociaal Fonds 200-bijdrage |
| socialsecurity.be (RSZ-portaal) | Tier 1 | RSZ-tarieven werknemer + werkgever |
| ACLVB — Aanvullend PC bedienden | Tier 3 | Triangulatie barema's + ecocheques |
| ACV-CSC BIE — sectoraal sectoraal akkoord 2025-2026 | Tier 3 | Triangulatie eindejaarspremie + woon-werk + fiets + landingsbaan |
| Securex / Partena Professional | Tier 2 | Triangulatie indexcoëfficiënt + jaarlijkse premie |
| Corsa Consultancy — bouw-subset | Tier 3 | Triangulatie bouw-aanvullend pensioen |

---

## Hoe gebruik je deze testset in CI?

1. Bewaar dit document **naast** het JSON-dataset en het JSON Schema.
2. Implementeer een Python-testbestand (`tests/test_golden_cases.py`) waar elke TC-XX een aparte testfunctie wordt.
3. Bij elke **dataset-update** (zie DEVELOPER §8): run de hele testset opnieuw. Een rode test zonder begeleidende dataset-changelog = blokkerende fout.
4. Bij **elke nieuwe POC-feature** (bv. eindejaarspremie pro-rata met dagen i.p.v. maanden): voeg minstens één TC toe.

---

*Laatste herziening: 2026-05-08 — afgestemd op dataset `pc200_payroll_dataset_2026.json` en CORE-document v2026-05-08.*
