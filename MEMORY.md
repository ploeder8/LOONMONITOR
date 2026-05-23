# MEMORY.md

Kort projectlogboek voor wijzigingen door coding agents.

## Richtlijnen

- Voeg bij elke inhoudelijke wijziging een nieuwe regel toe bovenaan onder `Log`.
- Houd entries zeer summier maar duidelijk: datum, wijziging, reden.
- Log alleen relevante aanpassingen aan code, data, tests, documentatie of agent-instructies.
- Vermeld waar nuttig de belangrijkste bestanden tussen backticks.

## Log

- 2026-05-23 — UI/UX Fase 1 geïmplementeerd: `DirectionToggle` + `HeroSummary` in rechterpaneel, oude `ResultsSummaryStrip` vervangen, jump anchors + audit-toggle behouden; bestanden: `src/components/DirectionToggle.tsx`, `src/components/HeroSummary.tsx`, `src/pages/HomePage.tsx`, `src/branding/brand.css`; 165/165 tests pass.
- 2026-05-23 — UI/UX Fase 2 geïmplementeerd: `InputCockpit` met 2×2 grid (`WieBenJeCard`, `ArbeidscontextCard`, `BrutoloonCard`, `WoonWerkCard`), twee `CockpitAccordion`s (Extra looncomponenten + Werkgeversbijdragen), `EindejaarspremieCard`; `<aside>` linkerpaneel verwijderd, single-column layout; bestanden: `src/components/CockpitCard.tsx`, `src/components/CockpitAccordion.tsx`, `src/pages/HomePage.tsx`, `src/branding/brand.css`, `src/index.css`; 165/165 tests pass.
- 2026-05-23 — `fase-2-migratie.md` geïntegreerd in `knowledgebase/11_ui_ux_migratieplan.md` als master-document; Fase 1 gemarkeerd als done, Fase 2 als pending.
- 2026-05-23 — Gewone BV-berekening vervangen door Bijlage III 2026-basisschaal (26,75/42,80/48,15/53,50), Schaal II-huwelijksquotiënt en woonwerkvrijstelling met forfaitcaps; reden: expertcase €2.300 bruto moest BV €163,57 en netto €2.122,35 geven.
- 2026-05-23 — `Effectieve RSZ` uit de zichtbare bruto-netto werknemerweergave verwijderd en subtotal hernoemd naar `Loon na RSZ en werkbonus`; reden: dubbele RSZ-vermelding was verwarrend wanneer geen werkbonus geldt.
- 2026-05-23 — Header-logo en tooltitel links vastgezet door de header-inhoud niet langer in een gecentreerde max-width container te plaatsen; reden: logo mag niet meeschuiven wanneer de calculator op brede schermen meer ruimte krijgt.
- 2026-05-23 — Calculatorroute krijgt een bredere desktop-shell (`1520px`) en de netto/loonkost-panelen gebruiken responsieve minimumkolommen; reden: resultaatkaders krijgen op brede schermen meer leesruimte zonder Scope/Testcases uit te rekken.
- 2026-05-23 — Calculatorcopy opgeschoond: technische BV-validatie, fiscale werkbonusformule, BBSZ-kwartaalformule, loonwigformule en smalle loonkostterminologie verplaatst naar gebruikersgerichte labels/tooltips; reden: hoofdflow leesbaarder zonder auditcontext te verliezen.
- 2026-05-23 — Gemeentebelasting-invoer uit het profiel verwijderd maar interne `gemeentebelastingPct` op 7,3% behouden; reden: voorlopig vast gewogen landelijk gemiddelde, later opnieuw configureerbaar.
- 2026-05-23 — Technische BV/BBSZ-disclaimer uit het netto-paneel verwijderd en vastgelegd met render-test; reden: broncontext blijft in code/kennisbank beschikbaar maar stoort de gebruiker niet in het resultaatpaneel.
- 2026-05-23 — Maaltijdcheques expliciet optioneel gemaakt met checkbox en voorgestelde werkgever-/werknemersbijdragen; reden: PC 200 verplicht maaltijdcheques niet en sommige profielen hebben ze niet.
- 2026-05-23 — Deeltijdse barema-check toegevoegd: `brutolocheck` rekent deeltijds bruto om naar voltijds equivalent en het profiel toont `Arbeidsregime`; reden: sectorale minimumcontrole moet voltijds barema correct toetsen bij deeltijdse input.
- 2026-05-20 — CSV import/export-paneel boven de bruto/netto-toggle geplaatst en pijltjesicoon uit de toggle verwijderd; reden: gewenste formulierhiërarchie en rustiger toggle-UI.
- 2026-05-20 — CSV import/export UI hersteld na latere `HomePage.tsx`-wijzigingen en CSV-defaults gelijkgetrokken met huidige profieldefaults (€3000, woon-werk uit); reden: import/export opnieuw beschikbaar zonder latere branchwijzigingen terug te draaien.
- 2026-05-20 — Dubbel-vakantiegeld-provisie gewijzigd van hardcoded 6,67% naar runtime-berekening `(bruto + VAA) × 92% / 12`; bestanden: `werkgeverskost.ts`, `jaaroverzicht.ts`, `HomePage.tsx`, dataset (`vakantiegeld_dubbel_pct_2026` toegevoegd, `provisie_dubbel_vakantiegeld_2026` gemarkeerd als deprecated), knowledgebase; reden: 6,67% was wiskundig inconsistent met 92%/12 = 7,67% en gebruiker vroeg expliciek geen hardcoded provisie.
- 2026-05-20 — CSV import/export voor één profiel toegevoegd met exportnaam, commentaar, inputkolommen en kernoutputkolommen; reden: testers kunnen input-snapshots delen en resultaten reproduceerbaar vergelijken.
- 2026-05-19 — Netto → Bruto calculatie toegevoegd: `src/lib/nettoNaarBruto.ts` (binary search), `BerekeningsRichtingToggle` component, 25 inverse golden tests, 2 virtuele dataset-datapunten voor methodologie/audit; reden: gebruikers willen weten welk bruto nodig is voor een gewenst netto.
- 2026-05-19 — Bronconflict gemeentebelasting opgelost: verwijderd uit dataset `conflicten`, opgenomen als UI-parameter `gemeentebelastingPct` (default 7,3%) in `HomePage.tsx` met info-regel in netto-resultaten; reden: geen Tier-1 lijst beschikbaar, dus bewust geen dataset-datapunt maar wel transparante parameter met disclaimer.
- 2026-05-19 — BV-validatie gemigreerd van Tax-Calc-pending naar FOD Bijlage III 2026-validatie met officiële corpusvelden; reden: Tax-Calc is PB-raming, niet primaire payrollbron.
- 2026-05-19 — Onderste resultaatbanden voor periodieke voordelen en mobiliteit verwijderd uit `HomePage.tsx`; reden: deze bedragen zitten al in maand- en jaarloonkost en werden dubbel getoond.
- 2026-05-19 — BV-validatieboodschap en kennisbank aangescherpt naar FOD Financiën / Bijlage III als primaire bron; reden: sociale-secretariaat-output mag alleen Tier-2 triangulatie zijn.
- 2026-05-19 — Sociaal Fonds 200 0,23% bevestigd voor 2026-2027 en AO-default 0,30% als indicatieve configureerbare aanname gedocumenteerd; reden: broncheck werkgeverskostparameters.
- 2026-05-19 — Netto jaaroverzicht toont nu ook jaarloon inclusief totale maaltijdchequewaarde op jaarbasis; reden: jaarimpact van maaltijdcheques zichtbaar maken.
- 2026-05-19 — Sectorale PC 200-jaarpremie rekent alleen werknemers-RSZ en geen BV; reden: Jaakie hield onterecht bijzondere BV in op de jaarpremie.
- 2026-05-19 — `AGENTS.md` verplicht nu knowledgebase-updates bij nieuwe chatkennis of vastgestelde tegenspraak; reden: SSOT actueel houden.
- 2026-05-19 — Bijzondere BV-refertebasis voor eindejaarspremie, jaarpremie en vakantiegeld vermindert normale bruto jaarbezoldiging nu met 13,07% werknemers-RSZ; reden: correcte exceptionele BV-schijf bepalen (bv. €2.658 → 40,38%).
- 2026-05-19 — Multimodaal woon-werkverkeer laat privéwagen + openbaar vervoer samen meetellen in netto en werkgeverskost; reden: auto naar station + trein moet als aparte trajectdelen kunnen.
- 2026-05-19 — Nettoloonpaneel toont nu ook nettoloon inclusief totale maaltijdchequewaarde en regressietest toegevoegd; reden: cash-netto en voordeelwaarde naast elkaar zichtbaar maken.
- 2026-05-19 — BBSZ-berekening in `src/lib/bbsz.ts` afgeleid uit `gezinstype`, maandformule gecorrigeerd en `knowledgebase/04_calculator_netto.md` bijgewerkt; reden: BBSZ-scenario niet dubbel laten invoeren en maandvoorschot correct tonen.
- 2026-05-19 — BBSZ-scenario veld uit `HomePage.tsx` verwijderd en maaltijdchequevelden verplaatst naar bijkomende looncomponenten; reden: eenvoudiger profiel-formulier en looncomponenten dichter bij netto-impact.
- 2026-05-19 — `MEMORY.md` aangemaakt en `AGENTS.md` laat toekomstige agents dit logboek bijhouden; reden: traceerbaar maken welke wijzigingen waarom gebeuren.
- 2026-05-19 — Privéwagenvergoeding in `src/lib/woonwerkVerkeer.ts` aangepast naar prorata via vaste deler 21,67 werkdagen en regressietests toegevoegd; reden: 3 km privévervoer moet correct meetellen in netto en werkgeverskost.
