# Bronronde 2026-05-24

Doel: stap 5 van `update_plan_23_05_2026.md` voert een juridische bronronde uit op de payrollclaims die de Jaakie-calculator voor inkomstenjaar 2026 / AJ 2027 gebruikt. De beslisregel blijft: Tier 1 wint bij conflict; Tier 2 trianguleert; Tier 3 bepaalt geen primaire waarde.

## Samenvatting

- Geen rekenformules of golden-testverwachtingen wijzigen in deze sprint.
- Wel gewijzigd: bronmetadata voor PB/AJ 2027, sociale werkbonus, Sociaal Fonds 200, VAA bedrijfswagen en landingsbaan, omdat live Tier-1-bronnen beschikbaar zijn.
- Arizona blijft onzeker: er is een officieel Kamerstuk, maar geen definitieve Belgisch Staatsblad-publicatie die de runtime-default wijzigt.
- Arbeidsongevallen blijft een configureerbare indicatieve default, geen harde sectorparameter.

## Domeinstatus

| Domein | Datapunt(en) | Huidige waarde | Live bron | URL | Raadpleegdatum | Tier | Status | Impact |
|---|---|---|---|---|---|---|---|---|
| Arizona-scenario's | `werkbonus_fiscaal_2026`, roadmap BBSZ/BVS | Runtime blijft 33,14% / 52,54%; scenario 35% / 63% niet actief | Kamer DOC 56 1243/001, wetsontwerp hervorming personenbelasting | https://www.dekamer.be/FLWB/PDF/56/1243/56K1243001.pdf | 2026-05-24 | Tier 1 parlementair, maar niet definitief | onzeker | Geen code- of datasetwaarde gewijzigd; scenario blijft feature-flag/hypothese tot BS/Justel-publicatie. |
| Sociale werkbonus | `werkbonus_sociaal_luik_A_2026`, `werkbonus_sociaal_luik_B_2026` | Luik A R=125,04; S0=2.880,32; helling 0,2738. Luik B R=168,62; S0=2.255,50; helling 0,2699 | RSZ Administratieve instructies 2026/1, tussentijdse instructie 01/04/2026 | https://www.socialsecurity.be/employer/instructions/dmfa/nl/latest/intermediates | 2026-05-24 | Tier 1 | bevestigd | Bronmetadata geüpdatet van Tier-2-triangulatie naar primaire RSZ-bron; rekenwaarden ongewijzigd. |
| Fiscale werkbonus | `werkbonus_fiscaal_2026` | 33,14% x Luik A + 52,54% x Luik B | FOD Financiën BV 2026, Bijlage III/sleutelformule; Kamerstuk voor toekomstscenario | https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening | 2026-05-24 | Tier 1 | bevestigd | Runtime-default blijft huidig regime; Arizona-verhoging blijft onzeker. |
| PB-schijven AJ 2027 | `pb_schijven_aj2027`, legacy `pb_schijven_inkomstenjaar_2026` | 25% tot 16.720; 40% tot 29.510; 45% tot 51.070; 50% daarboven | FOD Financiën belastingtarieven | https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/belastingtarieven | 2026-05-24 | Tier 1 | gewijzigd | Actieve waarde bevestigd; legacy `niet_gevonden`-placeholder gemarkeerd voor review en verwijst naar `pb_schijven_aj2027`. |
| Belastingvrije som AJ 2027 | `belastingvrije_som_aj2027` | 11.180 EUR | FOD Financiën belastingtarieven | https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/belastingtarieven | 2026-05-24 | Tier 1 | bevestigd | Bronmetadata naar FOD live bron; scenario 11.550 EUR blijft onzeker. |
| Forfaitaire beroepskosten AJ 2027 | `forfait_beroepskosten_aj2027` | 30%, max 6.070 EUR | FOD Financiën beroepsinkomen | https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen | 2026-05-24 | Tier 1 | bevestigd | Bronmetadata naar FOD live bron; geen rekenwijziging. |
| BV Bijlage III AJ 2027 | `bv_2026_kb_bijlage_iii`, FOD-corpus | Bijlage III 2026-sleutelformule | FOD Financiën berekening bedrijfsvoorheffing 2026 | https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening | 2026-05-24 | Tier 1 | bevestigd | Geen codewijziging; bestaande corpusstatus `fod_bijlage_iii_ok` blijft gelden. |
| PC 200-cao's | barema's, eindejaarspremie, ecocheques, jaarpremie, woon-werk, fiets, landingsbaan | 2026 index 2,21%; jaarpremie 330,84 EUR; trein 100%; fiets 0,27 tot 30/09 en 0,32 vanaf 01/10; landingsbaan 92,45 EUR | Sociaal Fonds 200 homepage, loonschalen, vervoerskosten, tijdskrediet, cao-brochure | https://www.sfonds200.be/nl/ | 2026-05-24 | Tier 1 sector | bevestigd | Landingsbaan-bronmetadata gewijzigd van Tier 3 naar Tier 1; docs gecorrigeerd van 90,45 naar 92,45. |
| Sociaal Fonds 200 | `rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026` | 0,23% tot 31/12/2027 | Sociaal Fonds 200, pagina Sociaal fonds | https://www.sfonds200.be/nl/sociaal-fonds/ | 2026-05-24 | Tier 1 sector | gewijzigd | Bronmetadata gewijzigd van Tier 2 naar Tier 1; waarde ongewijzigd. |
| AO-default | `arbeidsongevallen_bedienden_2026` | 0,30% configureerbare default | Fedris bevestigt verzekeringsplicht; publiek sectoraal tarief niet gevonden | https://www.fedris.be/nl/themas/definitie-en-verzekering-ao/terminologie | 2026-05-24 | Tier 1 voor regime, geen tariefbron | onzeker | Waarde blijft indicatieve UI-default en geen harde PC 200-parameter. |
| VAA bedrijfswagen | `vaa_bedrijfswagen_min_2026`, `vaa_bedrijfswagen_co2_diesel_2026`, `vaa_bedrijfswagen_co2_benzine_2026` | Minimum 1.690 EUR/jaar; ref-CO2 70 benzine/LPG/aardgas, 58 diesel | FOD Financiën bedrijfswagens | https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/bedrijfswagens | 2026-05-24 | Tier 1 | bevestigd | Bronmetadata naar live FOD-pagina; rekenwaarden ongewijzigd. |
| VAA werkmiddelen | `vaa_pc_laptop_forfait_2026`, `vaa_gsm_smartphone_forfait_2026`, `vaa_internet_forfait_2026`, `vaa_gsmabonnement_forfait_2026` | PC/laptop 72, tablet/gsm 36, internet 60, abonnement 48 EUR/jaar | FOD Financiën voordelen alle aard; RSZ voordelen in natura | https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/voordelen-van-alle-aard | 2026-05-24 | Tier 1 | bevestigd | Bestaande RSZ-bron blijft bruikbaar; FOD live bron bevestigt fiscale forfaits. |

## Beslissingen

- Datasetwaarden wijzigen alleen waar de live bron een echte waardewijziging toont. In deze sprint bleef de berekening gelijk.
- Datasetmetadata is wel bijgewerkt waar een eerder Tier-2/Tier-3-anker door een live Tier-1-bron vervangen kon worden.
- `pb_schijven_inkomstenjaar_2026` blijft bestaan voor datasetstabiliteit, maar is geen `niet_gevonden`-claim meer en wijst naar het actieve `pb_schijven_aj2027`.
- Open onzekerheden blijven expliciet in `knowledgebase/08_gaps_en_pending.md`: Arizona, AO-default als polisafhankelijke aanname, en toekomstige niet-2026-regimes.
