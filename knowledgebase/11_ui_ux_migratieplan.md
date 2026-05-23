# UI/UX migratieplan — Jaakie

**Versie:** 2026-05-23
**Status:** Fase 1 en Fase 2 zijn geïmplementeerd in de huidige code. Dit document is vanaf nu het status- en vervolgstappenoverzicht, niet langer een open implementatiechecklist.

---

## 1. Huidige UI-architectuur

`src/pages/HomePage.tsx` rendert de calculator als single-column cockpit:

1. CSV import/export-paneel voor één profielsnapshot.
2. `DirectionToggle` voor bruto → netto en netto → bruto.
3. `HeroSummary` met Bruto, Netto, Werkgeverskost en Loonwig.
4. `InputCockpit` met 2×2 `CockpitCard`-grid:
   - Wie ben je?
   - Arbeidscontext
   - Brutoloon
   - Woon-werk verkeer
5. Ingeklapte `CockpitAccordion`s voor extra looncomponenten en werkgeversbijdragen.
6. `EindejaarspremieCard`.
7. `ResultBandsPanel` met netto, werkgeverskost, jaaroverzicht, barema-check en audit.

De oude linker-sidebar is verwijderd. De calculator gebruikt geen split left/right layout meer.

---

## 2. Status per fase

| Fase | Status | Huidige toestand |
|---|---|---|
| Fase 1 — topflow | Done | `DirectionToggle` en `HeroSummary` staan boven de cockpit; oude summarystrip is niet meer de primaire topflow. |
| Fase 2 — inputcockpit | Done | Single-column layout, 2×2 cockpitgrid, woon-werk split, accordions en eindejaarspremiekaart zijn actief. |
| Fase 3 — componentextractie | Pending | `HomePage.tsx` bevat nog veel lokale subcomponenten en kan verder opgesplitst worden rond profiel, berekeningen en panels. |
| Fase 4 — polish & QA | Pending | Responsieve visuele QA, keyboard-flow, focusstates en eventuele contrastdetails moeten nog doelgericht worden geverifieerd. |

---

## 3. Fase 1 — gerealiseerd

- `src/components/DirectionToggle.tsx` toegevoegd.
- `src/components/HeroSummary.tsx` toegevoegd.
- Richtingstate `bruto_naar_netto` / `netto_naar_bruto` zichtbaar bovenaan de flow.
- Netto → bruto gebruikt `src/lib/nettoNaarBruto.ts`.
- Kerncijfers blijven auditbaar via de resultatenpanelen.

---

## 4. Fase 2 — gerealiseerd

- `src/components/CockpitCard.tsx` en `src/components/CockpitAccordion.tsx` toegevoegd.
- `InputCockpit` in `HomePage.tsx` groepeert de invoer in vier hoofdkaarten.
- Woon-werkverkeer is opgesplitst in werkgeversvergoedingen en VAA bedrijfswagen.
- Maaltijdcheques zijn optioneel en staan standaard uit.
- Extra looncomponenten en werkgeversbijdragen staan in accordions.
- De oude `<aside>`-structuur is verwijderd.

---

## 5. Verdere developmentstappen

### Fase 3 — componentextractie

Doel: `HomePage.tsx` kleiner en beter testbaar maken zonder rekenlogica te verplaatsen naar componenten.

Aanpak:
- Verplaats profieltypes/defaults verder naar `src/lib/profiel.ts` waar dat nog niet gebeurd is.
- Houd rekenorkestratie in `src/lib/profielBerekeningen.ts` en pure modules in `src/lib/`.
- Extraheer lokale UI-blokken uit `HomePage.tsx` naar `src/components/` wanneer ze geen calculatorlogica bevatten.
- Laat `HomePage.tsx` vooral compositie, state en routingcontext bevatten.

### Fase 4 — polish & QA

Doel: de huidige interface productie-vaster maken.

Checklist:
- Desktop, tablet en mobiel handmatig nakijken op tekstoverlap en inputbreedtes.
- Keyboardnavigatie en focusstates van toggle, accordions en formuliervelden nalopen.
- Auditpanelen controleren op lange bron-URL's en fragmentteksten.
- Browser-smoke uitvoeren op `/`, `/testcases` en `/scope` wanneer de gebruiker brede UI-verificatie vraagt.

---

## 6. Acceptatiebasis

Minimale technische checks bij UI-wijzigingen:

- `bun run typecheck`
- `bun test`
- `bun run build`

De huidige regressiesuite bevat naast de klassieke golden tests ook netto → bruto, CSV-profielen, FOD Bijlage III-validatiemetadata, schema-smoke, componenttests en `HomePage` renderstructuurtests.
