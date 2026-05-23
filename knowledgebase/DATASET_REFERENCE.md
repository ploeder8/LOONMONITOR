# Dataset Reference — pc200_payroll_dataset_2026.json

**Bron:** `src/data/pc200_payroll_dataset_2026.json`
**Peildatum:** 2026-05-08
**Doeljaar:** 2026
**Totaal:** 71 datapunten
**Bronnen:** 15 bronrecords

---

## `lonen` (12 datapunten)

| ID | Status | Tier | Omschrijving |
|---|---|---|---|
| `lonen_pc200_schaalI_catA_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal I (eerste jaar in de onderneming), Categorie A, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalI_catB_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal I (eerste jaar in de onderneming), Categorie B, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalI_catC_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal I (eerste jaar in de onderneming), Categorie C, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalI_catD_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal I (eerste jaar in de onderneming), Categorie D, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalII_catA_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal II (vanaf 2e jaar in dezelfde onderneming), Categorie A, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalII_catB_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal II (vanaf 2e jaar in dezelfde onderneming), Categorie B, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalII_catC_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal II (vanaf 2e jaar in dezelfde onderneming), Categorie C, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_schaalII_catD_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Schaal II (vanaf 2e jaar in dezelfde onderneming), Categorie D, voltijds (38u/week) – volledige tabel per ervaringsjaar |
| `lonen_pc200_studenten_catA_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Studentenschaal, Categorie A, per leeftijd |
| `lonen_pc200_studenten_catB_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Studentenschaal, Categorie B, per leeftijd |
| `lonen_pc200_studenten_catC_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Studentenschaal, Categorie C, per leeftijd |
| `lonen_pc200_studenten_catD_01012026` | actief | Tier 2 | Sectorale minimum maandlonen PC 200 – Studentenschaal, Categorie D, per leeftijd |

## `rsz` (11 datapunten)

| ID | Status | Tier | Omschrijving |
|---|---|---|---|
| `rsz_werknemer_basis` | actief | Tier 1 | Persoonlijke RSZ-bijdrage werknemer (privésector, bedienden) |
| `rsz_werkgever_profit_basis` | actief | Tier 1 | Faciaal tarief werkgeversbijdrage RSZ – privé profitsector (na taxshift sinds 1/1/2018) |
| `rsz_basis_arbeiders_108` | actief | Tier 1 | Berekeningsbasis RSZ-bijdragen voor arbeiders (108% brutoloon) – ter contrast met bedienden (100%) |
| `rsz_bijzondere_bijdragen_verwijzing` | mogelijk_verouderd | Tier 1 | Bijzondere RSZ-bijdragen (extralegale pensioenen, FSO, CO2-solidariteitsbijdrage bedrijfswagens, dubbel vakantiegeld, solidariteitsbijdrage winstdeelname, bijzondere bijdrage sociale zekerheid) |
| `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` | actief | Tier 2 | Werkgeversbijdrage Sociaal Fonds 200 (FBZ APCB) – sectorale bijdrage op brutolonen PC 200, verlengd voor 2026-2027 |
| `rsz_pc200_bouw_aanvullend_pensioen_2026` | actief | Tier 3 | Sectoraal aanvullend pensioen voor bouwsector-subset binnen PC 200 (solidariteitsluik) – verhoging van 1,10% naar 1,80% vanaf 1/1/2026 |
| `arbeidsongevallen_bedienden_2026` | actief | Tier 3 | Arbeidsongevallenverzekering — indicatieve werkgeverskost bedienden bureaupersoneel, configureerbaar per werkgever |
| `provisie_eindejaarspremie_2026` | actief | Tier 1 | Provisie eindejaarspremie (13e maand): 8,33% (= 1/12) van brutoloon op werkgeverskost |
| `provisie_dubbel_vakantiegeld_2026` | gemarkeerd_voor_review | Tier 1 | [DEPRECATED] Provisie dubbel vakantiegeld bedienden — vervangen door runtime-berekening obv 92%-percentage |
| `vakantiegeld_dubbel_pct_2026` | actief | Tier 1 | Percentage dubbel vakantiegeld bedienden ten opzichte van brutomaandloon inclusief VAA |
| `structurele_vermindering_laagloon_2026` | mogelijk_verouderd | Tier 1 | Structurele vermindering RSZ-werkgever voor lage lonen — hellingscoëfficiënt 0,1600 vanaf 1/4/2026 (KB 2/7/2025 BS 15/7/2025) |

## `fiscaliteit` (28 datapunten)

| ID | Status | Tier | Omschrijving |
|---|---|---|---|
| `bv_2026_kb_bijlage_iii` | actief | Tier 1 | Toepassingsregels bedrijfsvoorheffing op inkomsten betaald of toegekend vanaf 1/1/2026 (Bijlage III bij KB/WIB 92) |
| `fiscaal_indexcoefficient_aj2026` | actief | Tier 1 | Indexeringscoëfficiënt artikel 178 §2 WIB 92 voor aanslagjaar 2026 (inkomsten 2025) |
| `pb_schijven_aj2026` | actief | Tier 2 | Tarieven personenbelasting AJ 2026 (inkomsten 2025) – progressieve schijven federaal |
| `pb_schijven_inkomstenjaar_2026` | niet_gevonden | ? | Tarieven personenbelasting inkomstenjaar 2026 (AJ 2027) |
| `fiscaal_overuren_contingent_2026` | mogelijk_verouderd | Tier 2 | Algemeen contingent fiscaalvriendelijke overuren 2026 (BV-vermindering werknemer + vrijstelling doorstorting werkgever) |
| `fiscaal_studentenarbeid_650u_2026` | actief | Tier 2 | Geen bedrijfsvoorheffing op eerste 650 uren studentenarbeid per kalenderjaar |
| `bv_werkbonus_bedienden_2026` | actief | Tier 2 | Sociale werkbonus (RSZ-vermindering) voor bedienden – drie perioden 2026. Luik A (lage lonen) + Luik B (zeer lage lonen). Jaarplafond € 3.466,44. |
| `bv_bbsz_schijven_2026` | actief | Tier 1 | Bijzondere Bijdrage Sociale Zekerheid (BBSZ) 2026 – kwartaalschijven voor individuele aanslag en gemeenschappelijke aanslag. Maximum individuele aanslag €182,82/kwartaal (= €60,94/maand). |
| `pb_schijven_aj2027` | actief | Tier 2 | PB-schijven AJ 2027 (inkomstenjaar 2026): 25% tot €16.720; 40% tot €29.510; 45% tot €51.070; 50% boven €51.070 |
| `belastingvrije_som_aj2027` | actief | Tier 2 | Belastingvrije som basis AJ 2027 = €11.180 (alleenstaand / gehuwd met inkomen); €22.360 voor gehuwd zonder inkomen (partner-overdracht) |
| `forfait_beroepskosten_aj2027` | actief | Tier 1 | Forfait beroepskosten werknemer AJ 2027: 30% met max €6.070 |
| `werkbonus_sociaal_luik_A_2026` | actief | Tier 2 | Sociale werkbonus Luik A (vanaf 1/4/2026): R=€125,04 max bij loon ≤ S₀=€2.880,32; tapering met helling 0,2738 tot cutoff €3.336,98 |
| `werkbonus_sociaal_luik_B_2026` | actief | Tier 2 | Sociale werkbonus Luik B (vanaf 1/4/2026): R=€168,62 max bij loon ≤ S₀=€2.255,50; tapering met helling 0,2699 tot cutoff €2.880,32 |
| `werkbonus_fiscaal_2026` | actief | Tier 1 | Fiscale werkbonus 2026: belastingkrediet op BV = 33,14% × Luik A + 52,54% × Luik B |
| `bv_vermindering_kinderen_2026` | actief | Tier 1 | BV-vermindering kinderen ten laste — maandtabel (Bijlage III KB 11/12/2025) |
| `bv_vermindering_kind_onder_3_2026` | mogelijk_verouderd | Tier 1 | Niet-actieve referentie: fiscaal voordeel voor kind jonger dan 3 jaar, momenteel niet geïmplementeerd in de calculatorlogica |
| `bv_vermindering_alleenstaande_kind_2026` | actief | Tier 1 | BV-vermindering fiscaal alleenstaande met kinderen: €52/maand bovenop kindervermindering |
| `bv_vermindering_groepsverzekering_2026` | actief | Tier 1 | BV-vermindering groepsverzekering: 30% van eigen werknemersbijdrage |
| `bv_bijzondere_schaal_eindejaar_2026` | actief | Tier 1 | Bijzondere BV-schaal 2026 voor variabel loon: aparte tarieven voor vakantiegeld en andere exceptionele vergoedingen (eindejaarspremie, bonus) volgens refertejaarloon |
| `vaa_bedrijfswagen_min_2026` | actief | Tier 1 | VAA bedrijfswagen — minimum jaarbedrag 2026 |
| `vaa_bedrijfswagen_co2_diesel_2026` | actief | Tier 1 | VAA bedrijfswagen — referentie-CO2 diesel 2026 |
| `vaa_bedrijfswagen_co2_benzine_2026` | actief | Tier 1 | VAA bedrijfswagen — referentie-CO2 benzine 2026 |
| `vaa_pc_laptop_forfait_2026` | actief | Tier 1 | VAA pc, laptop en randapparatuur — forfait jaarbedrag |
| `vaa_gsm_smartphone_forfait_2026` | actief | Tier 1 | VAA mobiele telefoon, smartphone of tablet — forfait jaarbedrag |
| `vaa_internet_forfait_2026` | actief | Tier 1 | VAA internetaansluiting — forfait jaarbedrag |
| `vaa_gsmabonnement_forfait_2026` | actief | Tier 1 | VAA vast of mobiel GSM-abonnement — forfait jaarbedrag |
| `berekeningsmethode_netto_naar_bruto` | actief | Tier 1 | Methodologie voor de omgekeerde berekening (netto → bruto) — numerieke inverse via binary search |
| `netto_naar_bruto_tolerantie_eur` | actief | Tier 1 | Tolerantie voor de numerieke inverse (netto → bruto) — halve cent |

## `premies_en_voordelen` (17 datapunten)

| ID | Status | Tier | Omschrijving |
|---|---|---|---|
| `pc200_eindejaarspremie` | actief | Tier 3 | Sectorale eindejaarspremie PC 200 – gelijk aan een volledig brutomaandloon |
| `pc200_eindejaarspremie_cao_bron` | actief | Tier 1 | Onderliggende CAO eindejaarspremie PC 200 |
| `pc200_eindejaarspremie_2026_wijzigingen` | actief | Tier 3 | Wijzigingen eindejaarspremie PC 200 vanaf 1/1/2026 (sectorakkoord 15/01/2026) |
| `pc200_jaarlijkse_premie_2026` | actief | Tier 1 | Sectorale jaarlijkse premie PC 200 voor 2026 (oorspronkelijk 250 EUR uit sectorakkoord 2015-2016, jaarlijks geïndexeerd) |
| `pc200_ecocheques_voltijds` | actief | Tier 3 | Sectorale ecocheques PC 200 – voltijdse werknemer met volledige referentieperiode |
| `pc200_ecocheques_deeltijds_schaal` | actief | Tier 3 | Pro-rata bedragen ecocheques PC 200 op basis van wekelijkse arbeidsduur |
| `pc200_woonwerk_trein_2026` | actief | Tier 3 | Sectorale tussenkomst woon-werkverkeer per trein PC 200 vanaf 1/1/2026 |
| `pc200_woonwerk_trein_tabel_2026` | actief | Tier 1 | PC 200 tabel werkgeverstussenkomst treinvervoer — standaardabonnement vanaf 1/2/2026 |
| `pc200_woonwerk_bus_tram_metro_tabel_2026` | actief | Tier 1 | PC 200 forfaitaire tabel ander gemeenschappelijk openbaar vervoer — bus, tram, metro |
| `pc200_woonwerk_privevervoer_tabel_2026` | actief | Tier 1 | PC 200 tabel werkgeverstussenkomst privévervoer vanaf 1/2/2026 |
| `pc200_woonwerk_loonplafond_prive_2026` | actief | Tier 3 | Loonplafond voor recht op vergoeding woon-werk privévervoer PC 200 vanaf 1/1/2026 |
| `pc200_fietsvergoeding_2026_pre_oktober` | actief | Tier 1 | Sectorale fietsvergoeding PC 200 tot en met 30/09/2026 |
| `pc200_fietsvergoeding_2026` | actief | Tier 1 | Sectorale fietsvergoeding PC 200 vanaf 1/10/2026 |
| `pc200_maaltijdcheques_sectoraal` | niet_gevonden | ? | Sectorale verplichting maaltijdcheques in PC 200 |
| `pc200_thuiswerkvergoeding_sectoraal` | niet_gevonden | ? | Sectorale thuiswerkvergoeding in PC 200 |
| `pc200_landingsbaan_sectorvergoeding_2026` | actief | Tier 3 | Bijkomende sectorale vergoeding bij 1/5e landingsbaan PC 200 vanaf 1/6/2026 |
| `pc200_vakantiegeld_bedienden` | actief | Tier 1 | Vakantiegeld voor bedienden PC 200 (enkel + dubbel vakantiegeld) – wettelijk regime en RSZ-basis dubbel vakantiegeld |

## `arbeidsvoorwaarden` (3 datapunten)

| ID | Status | Tier | Omschrijving |
|---|---|---|---|
| `pc200_klein_verlet_rouwverlof_2026` | actief | Tier 3 | Uitbreiding rouwverlof PC 200 vanaf 1/1/2026 (sectorakkoord 15/01/2026) |
| `pc200_arbeidsduur` | niet_gevonden | Tier 2 | Sectorale arbeidsduur PC 200 |
| `pc200_overuren_toeslagen` | niet_gevonden | ? | Sectorale toeslagen overuren PC 200 |

---

**Totaal: 71 datapunten** (over 5 categorieën)

**Bronnen: 15 bronrecords**

## meta.niet_gevonden

- Officiële personenbelastingschijven inkomstenjaar 2026 (AJ 2027) – nog niet gepubliceerd op peildatum
- Volledige bedrijfsvoorheffingsschalen 2026 in machineleesbare tabelvorm (enkel KB-tekst en sleutelformule beschikbaar)
- Sectorale verplichting maaltijdcheques in PC 200 (geen sectorale cao gevonden die maaltijdcheques verplicht maakt)
- Sectorale verplichting thuiswerkvergoeding PC 200
- Volledige tekst centenindex-regelgeving 2026 (regelgeving niet tijdig gefinaliseerd)

## meta.opmerkingen

- Sectorakkoord PC 200 voor 2025-2026 afgesloten op 15 januari 2026 door sociale partners; bevestigd door sfonds200.be
- Bedrijfsvoorheffingsregels 2026 gepubliceerd via KB 11/12/2025 in BS 29/12/2025 (Bijlage III)
- Volledige sectorale baremamatrix PC 200 (Schaal I, Schaal II, studenten × Cat A/B/C/D) opgenomen vanaf 2026-05-08; primaire bron SSN (Tier 2), getrianguleerd met ACV en ACLVB (Tier 3) — alle 228 cellen onderling bevestigd
- Sectorpensioen-onderzoek (2026-05-08): bevestigd dat er geen algemeen sectoraal aanvullend pensioen bestaat voor het volledige PC 200 — enkel voor de bouw-subset (1,80% solidariteitsluik vanaf 1/1/2026 via CAO 13/03/2025 nr. 192.922)
- Sociaal Fonds 200 werkgeversbijdrage (0,23%) verlengd voor 1/1/2026–31/12/2027; bevestigd door 3 onafhankelijke Tier 2 bronnen (Partena Professional, Liantis, CLB Group)
- Aanvullende gemeentebelasting: geen Tier-1 machine-leesbare lijst per gemeente beschikbaar; behandeld als UI-parameter (default 7,3%) met disclaimer — niet opgenomen als dataset-datapunt
