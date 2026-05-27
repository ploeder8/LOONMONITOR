# Browser/UX QA — 2026-05-27

Doel: gerichte browser-QA voor de huidige Jaakie-calculatorflow op responsive gedrag, auditbaarheid, CSV roundtrip, netto → bruto interacties, lange labels en basis-toegankelijkheid.

## Omgeving

- Datum: 2026-05-27.
- App: Vite 8 dev-server op tijdelijke poort `5174`.
- Reden tijdelijke poort: poort `5173` was tijdens de QA-sessie bezet door een andere lokale app en is niet als Jaakie-bewijs gebruikt.
- Browser: Microsoft Edge headless via lokale debugpoort. De in-app browser runtime was niet bruikbaar door een Windows sandbox initialisatiefout; daarom is de browserfallback gebruikt.
- Geteste routes: `/#/`, `/#/scope`, `/#/testcases`.

## Visuele routes

| Viewport | Route | Resultaat | Opvolgactie |
|---|---|---|---|
| Desktop 1440×1400 | `/#/` | OK: header, CSV-paneel, richting-toggle, summary en cockpit blijven coherent. | Geen. |
| Desktop 1440×1400 | `/#/scope` | OK: dataset-meta, POC-beperkingen en waarschuwingen passen zonder overlap. | Geen. |
| Desktop 1440×1400 | `/#/testcases` | OK: testcasekaarten, audit-samenvattingen en bedragen blijven leesbaar. | Geen. |
| Mobiel 390×1400 | `/#/` | Bevinding: summary-cards en contentkolom oogden te smal en werden visueel tegen de rechterrand gedrukt. | Gefixt in `src/index.css` en `src/components/HeroSummary.tsx`. |

## Responsive fix

- `src/index.css`: mobiele `.home-layout` gebruikt nu `max-width: 100%` in plaats van `calc(100vw - 84px)`.
- `src/components/HeroSummary.tsx`: summary-cards schakelen op mobiel naar één kolom en gebruiken `text-2xl` op smalle schermen.
- DOM-meting na fix bij 390px: `scrollWidth = 390`, `clientWidth = 390`, geen overflow-elementen buiten de viewport.

## Interactieve scenario's

| Scenario | Resultaat | Bewijs |
|---|---|---|
| CSV export | OK | Export met aangepast profiel leverde `qa_browser_ux.csv`; CSV bevatte `brutoloon`. |
| CSV import roundtrip | OK | Na wijziging naar bruto `3210` zette import het profiel terug naar bruto `4321`; status `CSV geïmporteerd` zichtbaar. |
| Audit-toggle | OK | `Toon alle bronnen` werd `Verberg alle bronnen`; 32 bronpanelen stonden open. |
| Individueel auditpaneel | OK | Na globale reset kon een individueel bronpaneel opnieuw openen met `aria-expanded="true"`. |
| Fout/waarschuwing | OK | Bruto `1000` toont `Brutoloon onder sectoraal minimum`. |
| Netto → bruto | OK | Doelnetto `2200` gaf berekend bruto `2794.97`. |
| Netto → bruto + gezinstype | OK | Wijziging naar partner zonder/beperkt beroepsinkomen herrekende bruto naar `2214.7`. |
| Netto → bruto + maaltijdcheques | OK | Maaltijdchequevelden verschenen en bruto herrekende naar `2238.97`. |

## Toegankelijkheid en lange labels

- `DirectionToggle` gebruikt nu `aria-pressed` en expliciete `type="button"`.
- `CockpitAccordion`, `AuditPanel` en de globale audit-toggle dragen expliciete state-attributen (`aria-expanded` of `aria-pressed`).
- Keyboard-focusbare elementen blijven aanwezig en bereikbaar; de gemeten home-flow bevatte 61 zichtbare focusbare controls.
- Lange labels zoals `Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen`, audit-URL's en bronfragmenten blijven wrapbaar zonder horizontale overflow.

## Regressietests

Toegevoegd aan `src/pages/HomePage.test.ts`:

- mobiele layout blijft binnen viewportregels en hero-summary gebruikt mobiele éénkolomsclasses;
- toggle- en accordionstate zijn in server-rendered markup zichtbaar via ARIA-attributen.
