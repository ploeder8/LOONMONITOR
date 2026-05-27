# UI/UX migratieplan — Jaakie

**Versie:** 2026-05-23
**Status:** Fase 1 t/m Fase 4 zijn geïmplementeerd in de huidige code. Dit document is vanaf nu het status- en vervolgstappenoverzicht, niet langer een open implementatiechecklist.

---

## 1. Huidige UI-architectuur

`src/pages/HomePage.tsx` is de route-entry voor de calculator en rendert de single-column cockpit via featurecomponenten onder `src/pages/home/`:

1. `CsvPaneel` voor één profielsnapshot.
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

De zware subcomponenten staan niet langer lokaal in `HomePage.tsx`. De belangrijkste featurebestanden zijn:

- `CsvPaneel.tsx` — import/export UI.
- `InputCockpit.tsx` — profielinvoer, arbeidscontext, brutoloon, extra componenten, werkgeversbijdragen en eindejaarspremie.
- `MobiliteitPaneel.tsx` — woon-werkverkeer en VAA bedrijfswagen.
- `NettoPanelen.tsx`, `WerkgeverskostPanel.tsx`, `JaaroverzichtPanelen.tsx` — resultatenweergave.
- `ResultatenPanel.tsx` — resultaatbanden, audit-toggle en UI-orchestratie rond `src/lib/profielBerekeningen.ts`.
- `FormControls.tsx`, `ResultRows.tsx`, `types.ts` — gedeelde UI-primitives en featuretypes.

De oude linker-sidebar is verwijderd. De calculator gebruikt geen split left/right layout meer.

---

## 2. Status per fase

| Fase | Status | Huidige toestand |
|---|---|---|
| Fase 1 — topflow | Done | `DirectionToggle` en `HeroSummary` staan boven de cockpit; oude summarystrip is niet meer de primaire topflow. |
| Fase 2 — inputcockpit | Done | Single-column layout, 2×2 cockpitgrid, woon-werk split, accordions en eindejaarspremiekaart zijn actief. |
| Fase 3 — componentextractie | Done | `HomePage.tsx` is teruggebracht tot route-compositie en state; featurecomponenten staan onder `src/pages/home/`. |
| Fase 4 — polish & QA | Done | Browser/UX QA uitgevoerd op desktop en mobiel; mobiele summary-overflow en ARIA-state-attributen zijn gecorrigeerd. |

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

### Fase 3 — gerealiseerd

Doel: `HomePage.tsx` kleiner en beter testbaar maken zonder rekenlogica te verplaatsen naar componenten.

Gerealiseerd:
- Profieltypes/defaults staan in `src/lib/profiel.ts`.
- Rekenorkestratie staat in `src/lib/profielBerekeningen.ts` en pure modules in `src/lib/`.
- Lokale UI-blokken uit `HomePage.tsx` zijn verplaatst naar `src/pages/home/`.
- `HomePage.tsx` bevat alleen route-compositie, profielstate, CSV-state, richting-switch en netto → bruto root-finding.

### Fase 4 — gerealiseerd

Doel: de huidige interface productie-vaster maken.

Gerealiseerd:
- Browser/UX QA-log toegevoegd in `knowledgebase/12_browser_ux_qa.md`.
- Desktoproutes `/`, `/testcases` en `/scope` gecontroleerd op overlap en leesbaarheid.
- Mobiele route `/` gecontroleerd op inputbreedtes, summary-cards, lange labels en chatlauncher.
- Mobiele summary-overflow gefixt door de home-layout niet meer kunstmatig te versmallen en de hero-summary op mobiel éénkoloms te maken.
- CSV export/import, audit-toggle, individuele auditpanelen, bruto → netto en netto → bruto interacties gevalideerd in browsercontext.
- Toggle-, accordion- en auditstate toegankelijker gemaakt met `aria-pressed` en `aria-expanded`.

---

## 6. Acceptatiebasis

Minimale technische checks bij UI-wijzigingen:

- `bun run typecheck`
- `bun test`
- `bun run build`

De huidige regressiesuite bevat naast de klassieke golden tests ook netto → bruto, CSV-profielen, FOD Bijlage III-validatiemetadata, schema-smoke, componenttests en `HomePage` renderstructuurtests.
