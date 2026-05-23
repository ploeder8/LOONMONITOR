# Kennisbank — PC 200 Loonmotor (SSOT)

**Wat is dit?** De **Single Source of Truth** voor de PC 200 Loonmotor: één coherente, expert-geverifieerde kennisbank die het wettelijk regelkader, de calculator-specificaties, het testcorpus, het bronnenarchief en de roadmap consolideert.

**Peildatum:** 9 mei 2026 — **inkomstenjaar 2026 / aanslagjaar 2027**
**Geldt voor:** Belgische bedienden onder Paritair Comité 200 (Aanvullend Paritair Comité voor Bedienden)
**Status van AJ 2027 parameters:** ✅ geverifieerd via Wet diverse bepalingen 18/12/2025 (BS 30/12/2025) + FOD Financiën

---

## Wegwijzer

### Begin hier
| # | Bestand | Voor wie |
|---|---|---|
| 0 | dit `README.md` | iedereen |
| 1 | `01_project_scope.md` | Product owner, payroll-expert |
| 2 | `02_regelkader_2026.md` | Payroll-expert, fiscaal analist |

### Hoe werkt de berekening?
| # | Bestand | Voor wie |
|---|---|---|
| 3 | `03_datamodel.md` | Developer, dataset-onderhouder |
| 4 | `04_calculator_netto.md` | Developer (netto-module) |
| 4b | `04b_netto_ingredienten.md` | Developer (achtergrond: ingrediëntenlijst) |
| 5 | `05_calculator_werkgeverskost.md` | Developer (werkgeverskost-module) |

### Dataset & validatie
| # | Bestand | Voor wie |
|---|---|---|
| 6 | `06_dataset_uitbreiding.md` | Dataset-onderhouder (voorstel nieuwe records) |
| 6b | `06b_werkgeverskost_datapunten.md` | Dataset-onderhouder (werkgeverskost records) |
| 7 | `07_testcorpus.md` | QA, validatie-eigenaar |
| — | `TESTCASES.json` | Machine-leesbaar testcorpus (30 cases) |
| — | `DATASET_REFERENCE.md` | Inventaris alle datapunten in `src/data/pc200_payroll_dataset_2026.json` |

### Planning & onderhoud
| # | Bestand | Voor wie |
|---|---|---|
| 8 | `08_gaps_en_pending.md` | Product owner (release-checklist) |
| 9 | `09_implementation_roadmap.md` | Product owner (golf 1–6) |
| 10 | `10_bronnen_guideline.md` | Iedereen (3-tier bronnenhiërarchie) |
| 11 | `11_ui_ux_migratieplan.md` | Developer / UX (fasegewijze UI-migratie) |

### Mappen
- **`bronnen/`** — Volledig bronnenarchief: 57 URLs + 8 PDF-snapshots, gerangschikt per Tier (1/2/3) + categorie
- **`tools/`** — Python referentie-implementatie: `calc_brutonetto_2026.py`, `genereer_corpus.py`, `validate_bijlage_iii_corpus.py`
- **`Referenties/`** — Vergelijkende analyses van externe looncalculatoren (UX, invoervelden, featureset)
- **`onderzoek/`** — HTML-onderzoeksdossier (15 pagina's): marktonderzoek, concurrentiematrix, wetgevend kader, Jaakie-specificatie, testcorpus, referentietools. Dit dossier is **secundair** ten opzichte van de markdown-kennisbank: alle cijfers, formules en test-golden-masters leven in de `.md`-bestanden hierboven.

---

## Leesvolgorde voor een nieuwe lezer

1. **Wat doet de tool en wat niet?** → `01_project_scope.md`
2. **Welk wettelijk kader?** → `02_regelkader_2026.md`
3. **Hoe werkt de netto-berekening?** → `04_calculator_netto.md` (+ `04b` voor diepere achtergrond)
4. **Hoe werkt de werkgeverskost-berekening?** → `05_calculator_werkgeverskost.md`
5. **Welke testcases zijn er?** → `07_testcorpus.md`
6. **Wat ontbreekt nog?** → `08_gaps_en_pending.md`
7. **Hoe gaan we verder?** → `09_implementation_roadmap.md`
8. **UI/UX migratieplan** → `11_ui_ux_migratieplan.md`

---

## Belangrijke kanttekeningen

### AJ 2027 is correct gekozen (niet AJ 2026)
Bij een loon dat in mei 2026 wordt uitbetaald, gelden de **AJ 2027-parameters** voor de BV-inhouding, want dat is het aanslagjaar waarin inkomstenjaar 2026 wordt aangegeven. AJ 2026-parameters (€10.910 BVS, €5.840 forfait, oude schijven) gelden enkel voor inkomsten 2025.

### Sleutelformule vs FOD-validatie
De TypeScript-module gebruikt sinds 12/05/2026 een lokale Bijlage III-sleutelformule voor BV en sinds 19/05/2026 expliciete FOD Financiën / Bijlage III-bronprioriteit. De 30 corpuscases dragen nu FOD Bijlage III-validatievelden (`bron_validatie: "FOD Bijlage III 2026"`). Tax-Calc blijft alleen een latere PB-ramingscheck. Voor corpusvalidatie: voer `tools/validate_bijlage_iii_corpus.py` uit. Sociale-secretariaat-tools zijn alleen secundaire triangulatie.

### Pending wetgeving (regering-De Wever)
Sommige parameters zijn **wetsontwerp**, nog niet in BS:
- Fiscale werkbonus 33,14 %/52,54 % → 35 %/63 % (Arizona)
- Belastingvrije som €11.180 → €11.550
- Forfaitaire beroepskosten > €6.070

Implementeer als **feature-flags**, default = huidige waarden. Zie `08_gaps_en_pending.md` §1.

---

## Verband met code

| Kennisbank-document | Code-implementatie |
|---|---|
| `04_calculator_netto.md` §5.1 (werkbonus) | `src/lib/werkbonus.ts` |
| `04_calculator_netto.md` §5.2-5.4 (BV + verminderingen + fiscale werkbonus) | `src/lib/bv.ts` |
| `04_calculator_netto.md` §3 "Bijzondere BV" | `src/lib/bvBijzonder.ts` |
| `04_calculator_netto.md` §5.5 (BBSZ band) | `src/lib/bbsz.ts` |
| `04_calculator_netto.md` ketening | `src/lib/netto.ts` |
| `05_calculator_werkgeverskost.md` | `src/lib/werkgeverskost.ts` |
| `07_testcorpus.md` NTC-01..NTC-15 | `src/lib/__tests__/golden.test.ts` |
| `06_dataset_uitbreiding.md` + `06b_werkgeverskost_datapunten.md` | `src/data/pc200_payroll_dataset_2026.json` |

---

## Geschiedenis

| Datum | Wijziging |
|---|---|
| 2026-05-11 | Initiële SSOT-creatie. Consolidatie van `ProjectFiles/` (oude POC-kennisbank) + `ProjectFiles-CopilotCowork/` (expert-geverifieerde uitbreiding). |
| 2026-05-12 | `Referenties/groups_be_salarysim.md` toegevoegd: geverifieerde UI/invoer/output-documentatie van Group S Salary Sim, incl. vergelijkingstabel en feature-prioriteitenlijst. |

---

*Onderhouden volgens `10_bronnen_guideline.md` §6 (onderhoudscyclus) en `08_gaps_en_pending.md` §7 (eigenaarschap).*
