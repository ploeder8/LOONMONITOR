# MEMORY.md

Kort projectlogboek voor wijzigingen door coding agents.

## Richtlijnen

- Voeg bij elke inhoudelijke wijziging een nieuwe regel toe bovenaan onder `Log`.
- Houd entries zeer summier maar duidelijk: datum, wijziging, reden.
- Log alleen relevante aanpassingen aan code, data, tests, documentatie of agent-instructies.
- Vermeld waar nuttig de belangrijkste bestanden tussen backticks.

## Log

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
