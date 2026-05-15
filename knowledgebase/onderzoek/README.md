# Loonmotor BE — Onderzoeksdossier (HTML)

**Wat is dit?** Een set van 15 zelfstandige HTML-pagina's met inline CSS die samen het onderzoeksdossier vormen voor de Belgische loonmotor-markt en de **Jaakie** PC 200 calculator.

**Relatie tot de kennisbank:** Dit dossier is een **presentatielaag**. De leading source voor alle cijfers, formules, testcases en datapunten blijft de markdown-kennisbank in de parent-map (`knowledgebase/*.md`). Bij een conflict tussen dit HTML-dossier en de markdown-SSOT geldt de markdown als leading.

**Hoe te bekijken:** Open `index.html` in een browser. Alle pagina's zijn self-contained (geen externe CSS/JS afhankelijkheden).

---

## Pagina-overzicht (15)

| # | Pagina | Inhoud |
|---|---|---|
| 01 | `index.html` | Landingspagina met leeswijzer, KPI's, scope-badges |
| 02 | `marktonderzoek.html` | Marktstructuur, top-4 ESS, HR-tech challengers, verdienmodellen |
| 03 | `concurrentiematrix.html` | 14-spelers matrix, SWOT, white spaces |
| 04 | `werking-loonmotor.html` | 22-stappen proces, looncomponenten, bruto-netto voorbeeld, edge cases |
| 05 | `wetgevend-kader.html` | 9-topic juridisch kader (RSZ, BV, arbeidsrecht, PC's, voordelen) |
| 06 | `requirements.html` | Functioneel, niet-functioneel, compliance + Jaakie-specifieke requirements |
| 07 | `datamodel.html` | PostgreSQL datamodel (productie-scope, niet Jaakie POC) |
| 08 | `technische-architectuur.html` | Kotlin/Spring Boot architectuur (productie-scope, niet Jaakie POC) |
| 09 | `juridische-checklist.html` | ESS-erkenning, GDPR, bewaartermijnen |
| 10 | `mvp-roadmap.html` | 6 fases van verkenning naar productie + ESS-erkenning |
| 11 | `risicoregister.html` | 30 risico's met I×W-scoring |
| 12 | `jaakie-specificatie.html` | Technische specificatie van de browser-only POC |
| 13 | `testcorpus.html` | 30 BNTC + 15 NTC testcases + validatieregels |
| 14 | `referentie-tools.html` | Tier-1/2/3 bronhiërarchie, Group S vergelijking, triangulatie |
| 15 | `bronnen.html` | 50+ officiële bronnen |

---

## Scope-badges

Doorheen het dossier worden twee badges gebruikt:
- <span style="background:#d1fae5;color:#065f46;padding:2px 6px;border-radius:3px;font-weight:600;font-size:11px;">IN JAAKIE</span> — geïmplementeerd in de browser-only POC
- <span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:3px;font-weight:600;font-size:11px;">NIET IN JAAKIE</span> — valt buiten de huidige POC-scope

---

## Geschiedenis

| Datum | Wijziging |
|---|---|
| 2026-05-15 | Kennisbank-merge voltooid (4 fasen). Bron A (markdown) = leading source voor cijfers. HTML-dossier aangevuld met Jaakie-specificatie, testcorpus, referentietools, scope-badges. |
