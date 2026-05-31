# LESSONS.md

Korte, herbruikbare lessen uit het bouwen van Jaakie.

## Richtlijnen

- Raadpleeg dit bestand aan het begin van gericht ontwikkelwerk, bugfixes en configuratiewijzigingen.
- Voeg alleen lessen toe die later opnieuw relevant zijn; gewone changelog-items horen in `MEMORY.md`.
- Schrijf concreet: probleem -> oorzaak -> les/oplossing.
- Houd elke les kort en actiegericht.
- Werk dit bestand bij wanneer een bug, misvatting, configuratievalkuil of domeinregel tot een duurzame les leidt.

## Lessen

- 2026-05-31 — Houd kleine wijzigingsverzoeken tokenzuinig: beperk scope tot directe runtime/UI, gerichte tests en verplichte korte docs; pas brede corpus-/knowledgebase-/testupdates toe na expliciete vraag of concrete testdruk.
- 2026-05-31 — Gebruik geen browserbrede `localStorage` voor calculatorprofielen wanneer gebruikers meerdere scenario's naast elkaar willen openen. Gebruik venstergebonden `sessionStorage` zonder `storage`-event sync, zodat refresh binnen hetzelfde venster blijft werken maar andere vensters onafhankelijk blijven.
- 2026-05-31 — Gekoppelde profielvelden zoals berekeningsmaand + werkdagen moeten in één atomische state-update worden gezet. Losse opeenvolgende React-updates kunnen tijdelijk oude resultaten tonen; schrijf persistente storage vanuit een effect op de finale state, niet binnen de updater.
- 2026-05-30 — In payrolldata-reviewworkbooks kunnen expertreacties in de detailtabs staan terwijl de mastertab leeg blijft. Controleer bij verwerking altijd alle tabs en niet alleen `04 Alle issues`.
- 2026-05-27 — Vite gebruikt `strictPort: true`; bij poortwijzigingen moeten `vite.config.ts`, `README.md` en `AGENTS.md` samen worden bijgewerkt. Anders starten gebruikers of agents met een oud localhost-adres.
- 2026-05-27 — `MEMORY.md` is voor wijzigingshistoriek; duurzame werkwijze- of buglessen horen apart in `LESSONS.md`, zodat toekomstige agents sneller de relevante oplossing vinden zonder door een lange changelog te zoeken.
