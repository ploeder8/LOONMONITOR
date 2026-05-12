# Loonmotor PC 200 — kennisbank & oplevering

**Wat is dit?** Alle materiaal voor een Belgische bruto-netto-rekentool voor bedienden onder Paritair Comité 200 (Aanvullend Paritair Comité voor de Bedienden) — inkomstenjaar **2026** / aanslagjaar **2027**.

**Peildatum:** 9 mei 2026.

---

## Wegwijzer — wat is wat?

### Onderzoeksrapporten (achtergrond)

| Bestand | Waarvoor dient het? |
|---|---|
| `01_research_payroll_regelkader_2026.md` | Volledig overzicht van het wettelijk + sectoraal regelkader 2026 (RSZ, fiscaal, PC 200 cao's). |
| `02_research_netto_calculator_ingredienten.md` | Ingrediëntenlijst voor de netto-rekentool: welke parameters, welke formules, welke bronnen. |

### Specificaties (wat moet de tool kunnen?)

| Bestand | Waarvoor dient het? |
|---|---|
| `netto_calculator_specificatie.md` | Functionele specificatie van de bruto-naar-netto-rekenmodule. |
| `06_werkgeverskost_specificatie.md` | Specificatie van het werkgeverskost-luik (totale loonkost incl. RSZ wg, sociaal fonds, provisies). |
| `dataset_uitbreiding_voorstel.md` | Voorstel voor uitbreiding van de dataset (Datapunten met audit-trail). |
| `07_werkgeverskost_datapunten.md` | Concrete `Datapunt`-records voor het werkgeverskost-luik, klaar om in de dataset te zetten. |

### Validatie (klopt de berekening?)

| Bestand | Waarvoor dient het? |
|---|---|
| `03_testcorpus_brutonetto.md` | 30 typische werknemersprofielen met verwachte netto-uitkomst — leesbaar. |
| `03_testcorpus_brutonetto.json` | Zelfde 30 cases — machine-leesbaar voor automatische tests. |
| `calc_brutonetto_2026.py` | Python rekenmodule met alle formules. Genereert de cijfers in het corpus. |
| `genereer_corpus.py` | Script dat de 30 cases definieert en de corpus-bestanden produceert. |
| `validate_corpus.py` | Helper om de berekende netto's te vergelijken met de officiële FOD Fin Tax-Calc-simulator. |

### Planning & risico's

| Bestand | Waarvoor dient het? |
|---|---|
| `04_gaps_en_pending.md` | Wat de huidige rekenmodule **niet** dekt + pending wettelijke wijzigingen + bron-divergenties. |
| `05_implementation_roadmap.md` | Gefaseerd plan van POC → productie (Golf 1 t/m 6). |

### Bronnen

| Bestand | Waarvoor dient het? |
|---|---|
| `sources_guideline.md` | Hoe omgaan met bronnen — 3-tier hiërarchie, betrouwbaarheidsregels. |
| `bronnen_pc200_loonmotor_2026.zip` | Volledig bronnenarchief: 57 weblinks (`.url`) + 8 offline snapshots (`.md`). |

---

## Snel aan de slag — leesvolgorde

1. **Begin hier** → dit `README.md`
2. **Wat is het regelkader?** → `01_research_payroll_regelkader_2026.md`
3. **Hoe werkt de berekening?** → `netto_calculator_specificatie.md` + `06_werkgeverskost_specificatie.md`
4. **Voorbeelden zien** → `03_testcorpus_brutonetto.md`
5. **Wat ontbreekt nog?** → `04_gaps_en_pending.md`
6. **Hoe gaan we verder?** → `05_implementation_roadmap.md`

---

## Belangrijke kanttekening

De netto-bedragen in het testcorpus zijn een **referentie-benadering** met de gepubliceerde formules — niet de officiële Tax-Calc-output van FOD Financiën. Verwacht ±€5–€15 afwijking per maand. Voor productie-validatie: draai `validate_corpus.py` met Tax-Calc-resultaten als input.

Een aantal parameters is **pending** (afhankelijk van nog te stemmen wetgeving onder regering-De Wever) — zie `04_gaps_en_pending.md` §1.
