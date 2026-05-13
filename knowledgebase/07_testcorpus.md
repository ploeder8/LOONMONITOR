# Testcorpus — PC 200 Loonmotor

**Versie:** 2026-05-11
**Drie testlagen** (van groen naar pending validatie):

| Laag | Naam | Aantal | Bestand | Status |
|---|---|---|---|---|
| 1 | **TC-01..TC-25** — bestaande golden tests | 25 | `src/lib/__tests__/golden.test.ts` | ✅ Allemaal groen |
| 2 | **NTC-01..NTC-15** — netto-spec testcases | 15 | `src/lib/__tests__/golden.test.ts` | ⚠️ Pending FOD Tax-Calc validatie |
| 3 | **BNTC-001..BNTC-030** — 30 bruto-netto profielen (deze pagina + `TESTCASES.json`) | 30 | `tools/calc_brutonetto_2026.py` (Python-referentie) | ⚠️ Pending FOD Tax-Calc validatie |

> De drie lagen vullen elkaar aan: laag 1 valideert de barema / RSZ / sectorpremie logica, laag 2 valideert de netto-orchestratie inclusief bijzondere BV, laag 3 valideert de berekening over een brede salarisrange voor FOD-cross-check.

---

## Laag 1 — TC-01..TC-25 (geïmplementeerd in `golden.test.ts`)

Deze cases zijn gekoppeld aan specifieke datapunt-id's en exacte EUR-bedragen. Precisie matters — `expect(...).toBe(...)` (geen tolerantie). Ze dekken:

- **TC-01..TC-08:** Schaal I/II baremas + RSZ + OCR-correcties + bouw-vlag
- **TC-09..TC-10:** Studentenbaremas + faalpaden
- **TC-11..TC-17:** Premies + ecocheques + woon-werk + indexatie
- **TC-18..TC-20:** Niet-gevonden datapunten + mogelijk_verouderd + audit-trail
- **TC-21..TC-25:** Netto-module (werkbonus, BBSZ, BV, netto end-to-end)

Voor de actuele exacte waardes: zie `src/lib/__tests__/golden.test.ts`.

---

## Laag 2 — NTC-01..NTC-15 (geïmplementeerd, FOD-validatie pending)

Uit `04_calculator_netto.md §9`. Tolerantie: `expect(...).toBeCloseTo(..., 0)` (precisie ~€0,50). Markeer in code met commentaar `// PENDING: validate against FOD Fin Tax-Calc`.

| # | Profiel | Bruto | Verwacht netto |
|---|---|---|---|
| NTC-01 | Schaal I Cat A 5j, alleenstaand, 0 kind, geen VAA | €2.276,51 | ≈ €1.890 |
| NTC-02 | Schaal I Cat C 10j, alleenstaand, 1 kind | €2.800,00 | ≈ €2.220 |
| NTC-03 | Schaal II Cat B 8j, eenverdiener, 2 kind | €3.000,00 | ≈ €2.460 |
| NTC-04 | GGMMI €2.189,81, alleenstaand (hoge werkbonus) | €2.189,81 | ≈ €1.870 |
| NTC-05 | Schaal I Cat B 5j, alleenstaand, +VAA min €1.690 | €2.500,00 | ≈ €1.880 |
| NTC-06 | Schaal I Cat D 15j, eenverdiener, 3 kind | €3.800,00 | ≈ €3.060 |
| NTC-07 | Schaal II Cat A 3j, eenverdiener, 0 kind | €2.450,00 | ≈ €2.020 |
| NTC-08 | Niet-inwoner, Schaal III, Cat C, 10j | €3.200,00 | ≈ €2.480 |
| NTC-09 | Schaal I Cat A 5j, alleenstaande ouder met 1 kind | €2.500,00 | ≈ €2.080 (+€52 extra) |
| NTC-10 | Schaal I Cat C 12j, alleenstaand, +groepsverz €100/m | €3.100,00 | ≈ €2.510 |
| NTC-11 | Werkbonus-edge: bruto €2.255,50 (Luik B grens) | €2.255,50 | werkbonus = max A+B |
| NTC-12 | Werkbonus-edge: bruto €3.336,98 (Luik A wegval) | €3.336,98 | werkbonus = €0 |
| NTC-13 | Werkbonus-edge: bruto €2.880,32 (Luik A grens, B nul) | €2.880,32 | A = €125,04, B = 0 |
| NTC-14 | **Eindejaarspremie 1 maandloon — bijzondere BV** | €3.000 (premie) | ≈ €2.310 (na ~23 % BV) |
| NTC-15 | **Dubbel vakantiegeld 92 % maandloon — bijzondere BV** | €2.760 (= 92 % × 3000) | ≈ €2.110 |

**Acceptatiecriteria:**
- Alle 15 NTC-cases groen in `bun test`
- BV-uitkomsten binnen ±€2 van FOD Fin Tax-Calc voor minstens 12/15 cases
- Afwijking > €2: documenteren met root-cause in `08_gaps_en_pending.md`

---

## Laag 3 — BNTC-001..BNTC-030 (Python referentie)

Het volledige 30-cases bruto-netto corpus, **gegenereerd door `tools/calc_brutonetto_2026.py`** en gesynchroniseerd met `TESTCASES.json`.

Originele kop van het corpus:

---

# Testcorpus bruto-netto — PC 200 bedienden — inkomstenjaar 2026 (BNTC)

**Doel:** kalibratie en regressietesten voor de netto-rekenmodule van de loonmotor.

**Peildatum formules:** 9 mei 2026 (sociale werkbonus geïndexeerd vanaf 1/4/2026, schalen AJ 2027).

**Validatie-workflow:**
1. Voer iedere case in op de **FOD Financiën Tax-Calc-simulator (XLSX, AJ 2027)** → noteer het officiële netto.
2. Vergelijk met `berekend.netto_maand` — ontbrekende Tax-Calc data = `pending`, afwijking ≤ €5/maand = `ok`, ≤ €15/maand = `kleine_afwijking`, > €15/maand = `grote_afwijking`.
3. Bij `grote_afwijking`: identificeer de afwijkende component (RSZ / BV / werkbonus / BBSZ) en pas `calc_brutonetto_2026.py` aan; her-genereer corpus.

**BELANGRIJK:** de `berekend_netto`-kolom is een referentie-benadering met de gepubliceerde formules — niet de officiële Tax-Calc-output. De TypeScript-rekenmodule gebruikt sinds Golf 2 een lokale Bijlage III-sleutelformule met Group S-anker; officiële FOD Tax-Calc waarden ontbreken nog. De status blijft daarom `pending` tot de XLSX-validatie is ingevoerd.

## Samenvattende tabel

| ID | Profiel | Bruto/m | RSZ-wn | Soc. werkbonus | Fisc. werkbonus | BV netto | BBSZ | **Netto/m** |
|----|---------|--------:|-------:|---------------:|----------------:|---------:|-----:|------------:|
| TC-001 | Starter PC 200 op GGMMI vanaf 1/4/2026 (€2.189,81), alleenst | 2189.81 | 0.00 | 293.66 | 130.03 | 101.64 | 10.31 | **2077.86** |
| TC-002 | Junior bediende €2.300, alleenstaand, werkbonus volledig | 2300.00 | 18.96 | 281.65 | 123.72 | 144.45 | 11.54 | **2125.05** |
| TC-003 | Bediende €2.500, alleenstaand — werkbonus A volledig, B in a | 2500.00 | 99.08 | 227.67 | 95.36 | 220.76 | 13.74 | **2166.42** |
| TC-004 | Bediende €2.800, alleenstaand — werkbonus A volledig, B nul | 2800.00 | 219.26 | 146.70 | 52.82 | 335.23 | 17.04 | **2228.47** |
| TC-005 | Bediende €3.000, alleenstaand — werkbonus A in afbouw, B nul | 3000.00 | 299.83 | 92.27 | 30.58 | 405.24 | 19.24 | **2275.69** |
| TC-006 | Bediende €3.336,98 (cutoff luik A), werkbonus net 0 | 3336.98 | 436.13 | 0.01 | 0.00 | 516.09 | 22.94 | **2361.82** |
| TC-007 | Modale bediende €3.500, alleenstaand, 0 kinderen | 3500.00 | 457.45 | 0.00 | 0.00 | 576.65 | 24.74 | **2441.16** |
| TC-008 | Bediende €4.000, alleenstaand | 4000.00 | 522.80 | 0.00 | 0.00 | 772.24 | 36.24 | **2668.72** |
| TC-009 | Bediende €4.500, alleenstaand | 4500.00 | 588.15 | 0.00 | 0.00 | 967.83 | 44.01 | **2900.01** |
| TC-010 | Bediende €5.000, alleenstaand | 5000.00 | 653.50 | 0.00 | 0.00 | 1163.42 | 49.51 | **3133.57** |
| TC-011 | Bediende €5.500, alleenstaand | 5500.00 | 718.85 | 0.00 | 0.00 | 1359.99 | 55.01 | **3366.15** |
| TC-012 | Bediende €2.500, gehuwd, 1 kind ten laste | 2500.00 | 99.08 | 227.67 | 95.36 | 116.38 | 13.74 | **2270.80** |
| TC-013 | Bediende €3.000, gehuwd, 2 kinderen | 3000.00 | 299.83 | 92.27 | 30.58 | 122.86 | 19.24 | **2558.07** |
| TC-014 | Bediende €3.500, gehuwd, 2 kinderen waarvan 1 jonger dan 3 | 3500.00 | 457.45 | 0.00 | 0.00 | 271.52 | 24.74 | **2746.29** |
| TC-015 | Bediende €4.000, gehuwd, 3 kinderen | 4000.00 | 522.80 | 0.00 | 0.00 | 16.11 | 36.24 | **3424.85** |
| TC-016 | Bediende €4.500, gehuwd, 4 kinderen | 4500.00 | 588.15 | 0.00 | 0.00 | 0.00 | 44.01 | **3867.84** |
| TC-017 | Bediende €3.500, alleenstaande ouder met 2 kinderen | 3500.00 | 457.45 | 0.00 | 0.00 | 229.19 | 24.74 | **2788.62** |
| TC-018 | Senior bediende €6.000, alleenstaand | 6000.00 | 784.20 | 0.00 | 0.00 | 1577.32 | 60.51 | **3577.97** |
| TC-019 | Senior bediende €6.500, gehuwd | 6500.00 | 849.55 | 0.00 | 0.00 | 1794.64 | 60.94 | **3794.87** |
| TC-020 | Kaderlid €7.000, alleenstaand | 7000.00 | 914.90 | 0.00 | 0.00 | 2011.97 | 60.94 | **4012.19** |
| TC-021 | Kaderlid €7.500, alleenstaand, 0 kinderen | 7500.00 | 980.25 | 0.00 | 0.00 | 2229.29 | 60.94 | **4229.52** |
| TC-022 | Kaderlid €8.500, gehuwd, 2 kinderen | 8500.00 | 1110.95 | 0.00 | 0.00 | 2381.57 | 60.94 | **4946.54** |
| TC-023 | Bediende €4.000 + bedrijfswagen VAA €180/m, alleenstaand | 4000.00 | 522.80 | 0.00 | 0.00 | 853.24 | 36.24 | **2587.72** |
| TC-024 | Bediende €5.000 + minimum-VAA bedrijfswagen €1.690/12 = €140 | 5000.00 | 653.50 | 0.00 | 0.00 | 1122.42 | 49.51 | **3174.57** |
| TC-025 | Kaderlid €7.000 + bedrijfswagen VAA €350/m + andere VAA €50/ | 7000.00 | 914.90 | 0.00 | 0.00 | 2211.97 | 60.94 | **3812.19** |
| TC-026 | Bediende €3.500 + groepsverzekering werknemersbijdrage €40/m | 3500.00 | 457.45 | 0.00 | 0.00 | 594.65 | 24.74 | **2423.16** |
| TC-027 | Bediende €10.000, alleenstaand — top-tarief | 10000.00 | 1307.00 | 0.00 | 0.00 | 3315.92 | 60.94 | **5316.14** |
| TC-028 | Bediende €15.000, alleenstaand — extreem hoog (sanity check) | 15000.00 | 1960.50 | 0.00 | 0.00 | 5489.17 | 60.94 | **7489.39** |
| TC-029 | Bediende €2.189,81 (GGMMI), alleenstaande ouder met 1 kind < | 2189.81 | 0.00 | 293.66 | 130.03 | 0.00 | 10.31 | **2179.50** |
| TC-030 | Bediende €4.500, gehuwd, 5 kinderen waarvan 1 <3 | 4500.00 | 588.15 | 0.00 | 0.00 | 0.00 | 44.01 | **3867.84** |

## Detail per case

### TC-001 — Starter PC 200 op GGMMI vanaf 1/4/2026 (€2.189,81), alleenstaand, 0 kinderen

**Focus:** GGMMI hardvloer, werkbonus volledige luiken A+B, fiscale werkbonus 33,14%/52,54%

**Input:**
```json
{
  "bruto_maand": 2189.81
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2189.81 |
| RSZ-werknemer (basis 13,07%) | €286.21 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €168.62 |
| Sociale werkbonus totaal | €293.66 |
| RSZ na werkbonus | €0.00 |
| Belastbaar maandloon (incl. VAA) | €2189.81 |
| BV vóór gezinsverminderingen | €231.67 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €130.03 |
| BV netto | €101.64 |
| BBSZ | €10.31 |
| **Netto maand (referentie)** | **€2077.86** |
| Netto check op jaarbasis (× 12) | €24934.32 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2189.81 |
| RSZ-werkgever (~25%) | €547.45 |
| Sociaal Fonds 200 (0,23%) | €5.04 |
| Arbeidsongevallen-verzekering (~0,3%) | €6.57 |
| Provisie eindejaarspremie (~8,33%) | €182.41 |
| Provisie dubbel vakantiegeld (~6,67%) | €146.06 |
| **Totale loonkost werkgever** | **€3077.34** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- RSZ-vermindering geplafonneerd op 0

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-002 — Junior bediende €2.300, alleenstaand, werkbonus volledig

**Focus:** werkbonus B in afbouw, A volledig

**Input:**
```json
{
  "bruto_maand": 2300.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2300.00 |
| RSZ-werknemer (basis 13,07%) | €300.61 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €156.61 |
| Sociale werkbonus totaal | €281.65 |
| RSZ na werkbonus | €18.96 |
| Belastbaar maandloon (incl. VAA) | €2281.04 |
| BV vóór gezinsverminderingen | €268.17 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €123.72 |
| BV netto | €144.45 |
| BBSZ | €11.54 |
| **Netto maand (referentie)** | **€2125.05** |
| Netto check op jaarbasis (× 12) | €25500.60 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2300.00 |
| RSZ-werkgever (~25%) | €575.00 |
| Sociaal Fonds 200 (0,23%) | €5.29 |
| Arbeidsongevallen-verzekering (~0,3%) | €6.90 |
| Provisie eindejaarspremie (~8,33%) | €191.59 |
| Provisie dubbel vakantiegeld (~6,67%) | €153.41 |
| **Totale loonkost werkgever** | **€3232.19** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-003 — Bediende €2.500, alleenstaand — werkbonus A volledig, B in afbouw

**Focus:** werkbonus afbouwzone B

**Input:**
```json
{
  "bruto_maand": 2500.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2500.00 |
| RSZ-werknemer (basis 13,07%) | €326.75 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €102.63 |
| Sociale werkbonus totaal | €227.67 |
| RSZ na werkbonus | €99.08 |
| Belastbaar maandloon (incl. VAA) | €2400.92 |
| BV vóór gezinsverminderingen | €316.12 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €95.36 |
| BV netto | €220.76 |
| BBSZ | €13.74 |
| **Netto maand (referentie)** | **€2166.42** |
| Netto check op jaarbasis (× 12) | €25997.04 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2500.00 |
| RSZ-werkgever (~25%) | €625.00 |
| Sociaal Fonds 200 (0,23%) | €5.75 |
| Arbeidsongevallen-verzekering (~0,3%) | €7.50 |
| Provisie eindejaarspremie (~8,33%) | €208.25 |
| Provisie dubbel vakantiegeld (~6,67%) | €166.75 |
| **Totale loonkost werkgever** | **€3513.25** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-004 — Bediende €2.800, alleenstaand — werkbonus A volledig, B nul

**Focus:** werkbonus B = 0, A nog volledig

**Input:**
```json
{
  "bruto_maand": 2800.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2800.00 |
| RSZ-werknemer (basis 13,07%) | €365.96 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €21.66 |
| Sociale werkbonus totaal | €146.70 |
| RSZ na werkbonus | €219.26 |
| Belastbaar maandloon (incl. VAA) | €2580.74 |
| BV vóór gezinsverminderingen | €388.05 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €52.82 |
| BV netto | €335.23 |
| BBSZ | €17.04 |
| **Netto maand (referentie)** | **€2228.47** |
| Netto check op jaarbasis (× 12) | €26741.64 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2800.00 |
| RSZ-werkgever (~25%) | €700.00 |
| Sociaal Fonds 200 (0,23%) | €6.44 |
| Arbeidsongevallen-verzekering (~0,3%) | €8.40 |
| Provisie eindejaarspremie (~8,33%) | €233.24 |
| Provisie dubbel vakantiegeld (~6,67%) | €186.76 |
| **Totale loonkost werkgever** | **€3934.84** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-005 — Bediende €3.000, alleenstaand — werkbonus A in afbouw, B nul

**Focus:** werkbonus A afbouwzone

**Input:**
```json
{
  "bruto_maand": 3000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3000.00 |
| RSZ-werknemer (basis 13,07%) | €392.10 |
| Sociale werkbonus luik A | €92.27 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €92.27 |
| RSZ na werkbonus | €299.83 |
| Belastbaar maandloon (incl. VAA) | €2700.17 |
| BV vóór gezinsverminderingen | €435.82 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €30.58 |
| BV netto | €405.24 |
| BBSZ | €19.24 |
| **Netto maand (referentie)** | **€2275.69** |
| Netto check op jaarbasis (× 12) | €27308.28 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3000.00 |
| RSZ-werkgever (~25%) | €750.00 |
| Sociaal Fonds 200 (0,23%) | €6.90 |
| Arbeidsongevallen-verzekering (~0,3%) | €9.00 |
| Provisie eindejaarspremie (~8,33%) | €249.90 |
| Provisie dubbel vakantiegeld (~6,67%) | €200.10 |
| **Totale loonkost werkgever** | **€4215.90** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-006 — Bediende €3.336,98 (cutoff luik A), werkbonus net 0

**Focus:** randwaarde werkbonus cutoff

**Input:**
```json
{
  "bruto_maand": 3336.98
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3336.98 |
| RSZ-werknemer (basis 13,07%) | €436.14 |
| Sociale werkbonus luik A | €0.01 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.01 |
| RSZ na werkbonus | €436.13 |
| Belastbaar maandloon (incl. VAA) | €2900.85 |
| BV vóór gezinsverminderingen | €516.09 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €516.09 |
| BBSZ | €22.94 |
| **Netto maand (referentie)** | **€2361.82** |
| Netto check op jaarbasis (× 12) | €28341.84 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3336.98 |
| RSZ-werkgever (~25%) | €834.25 |
| Sociaal Fonds 200 (0,23%) | €7.68 |
| Arbeidsongevallen-verzekering (~0,3%) | €10.01 |
| Provisie eindejaarspremie (~8,33%) | €277.97 |
| Provisie dubbel vakantiegeld (~6,67%) | €222.58 |
| **Totale loonkost werkgever** | **€4689.47** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-007 — Modale bediende €3.500, alleenstaand, 0 kinderen

**Focus:** werkbonus = 0, BBSZ-band 2

**Input:**
```json
{
  "bruto_maand": 3500.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3500.00 |
| RSZ-werknemer (basis 13,07%) | €457.45 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €457.45 |
| Belastbaar maandloon (incl. VAA) | €3042.55 |
| BV vóór gezinsverminderingen | €576.65 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €576.65 |
| BBSZ | €24.74 |
| **Netto maand (referentie)** | **€2441.16** |
| Netto check op jaarbasis (× 12) | €29293.92 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3500.00 |
| RSZ-werkgever (~25%) | €875.00 |
| Sociaal Fonds 200 (0,23%) | €8.05 |
| Arbeidsongevallen-verzekering (~0,3%) | €10.50 |
| Provisie eindejaarspremie (~8,33%) | €291.55 |
| Provisie dubbel vakantiegeld (~6,67%) | €233.45 |
| **Totale loonkost werkgever** | **€4918.55** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-008 — Bediende €4.000, alleenstaand

**Focus:** BBSZ-band 3 (3,38%-helling)

**Input:**
```json
{
  "bruto_maand": 4000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4000.00 |
| RSZ-werknemer (basis 13,07%) | €522.80 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €522.80 |
| Belastbaar maandloon (incl. VAA) | €3477.20 |
| BV vóór gezinsverminderingen | €772.24 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €772.24 |
| BBSZ | €36.24 |
| **Netto maand (referentie)** | **€2668.72** |
| Netto check op jaarbasis (× 12) | €32024.64 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4000.00 |
| RSZ-werkgever (~25%) | €1000.00 |
| Sociaal Fonds 200 (0,23%) | €9.20 |
| Arbeidsongevallen-verzekering (~0,3%) | €12.00 |
| Provisie eindejaarspremie (~8,33%) | €333.20 |
| Provisie dubbel vakantiegeld (~6,67%) | €266.80 |
| **Totale loonkost werkgever** | **€5621.20** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-009 — Bediende €4.500, alleenstaand

**Focus:** BBSZ-band 4

**Input:**
```json
{
  "bruto_maand": 4500.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4500.00 |
| RSZ-werknemer (basis 13,07%) | €588.15 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €588.15 |
| Belastbaar maandloon (incl. VAA) | €3911.85 |
| BV vóór gezinsverminderingen | €967.83 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €967.83 |
| BBSZ | €44.01 |
| **Netto maand (referentie)** | **€2900.01** |
| Netto check op jaarbasis (× 12) | €34800.12 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4500.00 |
| RSZ-werkgever (~25%) | €1125.00 |
| Sociaal Fonds 200 (0,23%) | €10.35 |
| Arbeidsongevallen-verzekering (~0,3%) | €13.50 |
| Provisie eindejaarspremie (~8,33%) | €374.85 |
| Provisie dubbel vakantiegeld (~6,67%) | €300.15 |
| **Totale loonkost werkgever** | **€6323.85** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-010 — Bediende €5.000, alleenstaand

**Focus:** belastbaar in 45%-schijf

**Input:**
```json
{
  "bruto_maand": 5000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €5000.00 |
| RSZ-werknemer (basis 13,07%) | €653.50 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €653.50 |
| Belastbaar maandloon (incl. VAA) | €4346.50 |
| BV vóór gezinsverminderingen | €1163.42 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €1163.42 |
| BBSZ | €49.51 |
| **Netto maand (referentie)** | **€3133.57** |
| Netto check op jaarbasis (× 12) | €37602.84 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €5000.00 |
| RSZ-werkgever (~25%) | €1250.00 |
| Sociaal Fonds 200 (0,23%) | €11.50 |
| Arbeidsongevallen-verzekering (~0,3%) | €15.00 |
| Provisie eindejaarspremie (~8,33%) | €416.50 |
| Provisie dubbel vakantiegeld (~6,67%) | €333.50 |
| **Totale loonkost werkgever** | **€7026.50** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-011 — Bediende €5.500, alleenstaand

**Focus:** volledig in 45%-schijf

**Input:**
```json
{
  "bruto_maand": 5500.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €5500.00 |
| RSZ-werknemer (basis 13,07%) | €718.85 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €718.85 |
| Belastbaar maandloon (incl. VAA) | €4781.15 |
| BV vóór gezinsverminderingen | €1359.99 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €1359.99 |
| BBSZ | €55.01 |
| **Netto maand (referentie)** | **€3366.15** |
| Netto check op jaarbasis (× 12) | €40393.80 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €5500.00 |
| RSZ-werkgever (~25%) | €1375.00 |
| Sociaal Fonds 200 (0,23%) | €12.65 |
| Arbeidsongevallen-verzekering (~0,3%) | €16.50 |
| Provisie eindejaarspremie (~8,33%) | €458.15 |
| Provisie dubbel vakantiegeld (~6,67%) | €366.85 |
| **Totale loonkost werkgever** | **€7729.15** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-012 — Bediende €2.500, gehuwd, 1 kind ten laste

**Focus:** BV-vermindering 1 kind, toeslag belastingvrije som

**Input:**
```json
{
  "bruto_maand": 2500.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 1
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2500.00 |
| RSZ-werknemer (basis 13,07%) | €326.75 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €102.63 |
| Sociale werkbonus totaal | €227.67 |
| RSZ na werkbonus | €99.08 |
| Belastbaar maandloon (incl. VAA) | €2400.92 |
| BV vóór gezinsverminderingen | €267.74 |
| BV-vermindering kinderen | €56.00 |
| Fiscale werkbonus | €95.36 |
| BV netto | €116.38 |
| BBSZ | €13.74 |
| **Netto maand (referentie)** | **€2270.80** |
| Netto check op jaarbasis (× 12) | €27249.60 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2500.00 |
| RSZ-werkgever (~25%) | €625.00 |
| Sociaal Fonds 200 (0,23%) | €5.75 |
| Arbeidsongevallen-verzekering (~0,3%) | €7.50 |
| Provisie eindejaarspremie (~8,33%) | €208.25 |
| Provisie dubbel vakantiegeld (~6,67%) | €166.75 |
| **Totale loonkost werkgever** | **€3513.25** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-013 — Bediende €3.000, gehuwd, 2 kinderen

**Focus:** BV-vermindering 2 kinderen €154/m

**Input:**
```json
{
  "bruto_maand": 3000.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 2
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3000.00 |
| RSZ-werknemer (basis 13,07%) | €392.10 |
| Sociale werkbonus luik A | €92.27 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €92.27 |
| RSZ na werkbonus | €299.83 |
| Belastbaar maandloon (incl. VAA) | €2700.17 |
| BV vóór gezinsverminderingen | €307.44 |
| BV-vermindering kinderen | €154.00 |
| Fiscale werkbonus | €30.58 |
| BV netto | €122.86 |
| BBSZ | €19.24 |
| **Netto maand (referentie)** | **€2558.07** |
| Netto check op jaarbasis (× 12) | €30696.84 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3000.00 |
| RSZ-werkgever (~25%) | €750.00 |
| Sociaal Fonds 200 (0,23%) | €6.90 |
| Arbeidsongevallen-verzekering (~0,3%) | €9.00 |
| Provisie eindejaarspremie (~8,33%) | €249.90 |
| Provisie dubbel vakantiegeld (~6,67%) | €200.10 |
| **Totale loonkost werkgever** | **€4215.90** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-014 — Bediende €3.500, gehuwd, 2 kinderen waarvan 1 jonger dan 3

**Focus:** extra €760 voor kind <3 jaar

**Input:**
```json
{
  "bruto_maand": 3500.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 2,
  "kinderen_jonger_dan_3": 1
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3500.00 |
| RSZ-werknemer (basis 13,07%) | €457.45 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €457.45 |
| Belastbaar maandloon (incl. VAA) | €3042.55 |
| BV vóór gezinsverminderingen | €425.52 |
| BV-vermindering kinderen | €154.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €271.52 |
| BBSZ | €24.74 |
| **Netto maand (referentie)** | **€2746.29** |
| Netto check op jaarbasis (× 12) | €32955.48 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3500.00 |
| RSZ-werkgever (~25%) | €875.00 |
| Sociaal Fonds 200 (0,23%) | €8.05 |
| Arbeidsongevallen-verzekering (~0,3%) | €10.50 |
| Provisie eindejaarspremie (~8,33%) | €291.55 |
| Provisie dubbel vakantiegeld (~6,67%) | €233.45 |
| **Totale loonkost werkgever** | **€4918.55** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-015 — Bediende €4.000, gehuwd, 3 kinderen

**Focus:** belastingvrije som €11.720 toeslag, BV-vermindering €414/m

**Input:**
```json
{
  "bruto_maand": 4000.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 3
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4000.00 |
| RSZ-werknemer (basis 13,07%) | €522.80 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €522.80 |
| Belastbaar maandloon (incl. VAA) | €3477.20 |
| BV vóór gezinsverminderingen | €430.11 |
| BV-vermindering kinderen | €414.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €16.11 |
| BBSZ | €36.24 |
| **Netto maand (referentie)** | **€3424.85** |
| Netto check op jaarbasis (× 12) | €41098.20 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4000.00 |
| RSZ-werkgever (~25%) | €1000.00 |
| Sociaal Fonds 200 (0,23%) | €9.20 |
| Arbeidsongevallen-verzekering (~0,3%) | €12.00 |
| Provisie eindejaarspremie (~8,33%) | €333.20 |
| Provisie dubbel vakantiegeld (~6,67%) | €266.80 |
| **Totale loonkost werkgever** | **€5621.20** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-016 — Bediende €4.500, gehuwd, 4 kinderen

**Focus:** toeslag €18.970, BV-vermindering €715/m

**Input:**
```json
{
  "bruto_maand": 4500.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 4
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4500.00 |
| RSZ-werknemer (basis 13,07%) | €588.15 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €588.15 |
| Belastbaar maandloon (incl. VAA) | €3911.85 |
| BV vóór gezinsverminderingen | €374.50 |
| BV-vermindering kinderen | €715.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €0.00 |
| BBSZ | €44.01 |
| **Netto maand (referentie)** | **€3867.84** |
| Netto check op jaarbasis (× 12) | €46414.08 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4500.00 |
| RSZ-werkgever (~25%) | €1125.00 |
| Sociaal Fonds 200 (0,23%) | €10.35 |
| Arbeidsongevallen-verzekering (~0,3%) | €13.50 |
| Provisie eindejaarspremie (~8,33%) | €374.85 |
| Provisie dubbel vakantiegeld (~6,67%) | €300.15 |
| **Totale loonkost werkgever** | **€6323.85** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-017 — Bediende €3.500, alleenstaande ouder met 2 kinderen

**Focus:** extra basisbedrag alleenstaande ouder

**Input:**
```json
{
  "bruto_maand": 3500.0,
  "kinderen_ten_laste": 2,
  "alleenstaand_met_kinderen": true
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3500.00 |
| RSZ-werknemer (basis 13,07%) | €457.45 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €457.45 |
| Belastbaar maandloon (incl. VAA) | €3042.55 |
| BV vóór gezinsverminderingen | €383.19 |
| BV-vermindering kinderen | €154.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €229.19 |
| BBSZ | €24.74 |
| **Netto maand (referentie)** | **€2788.62** |
| Netto check op jaarbasis (× 12) | €33463.44 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3500.00 |
| RSZ-werkgever (~25%) | €875.00 |
| Sociaal Fonds 200 (0,23%) | €8.05 |
| Arbeidsongevallen-verzekering (~0,3%) | €10.50 |
| Provisie eindejaarspremie (~8,33%) | €291.55 |
| Provisie dubbel vakantiegeld (~6,67%) | €233.45 |
| **Totale loonkost werkgever** | **€4918.55** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-018 — Senior bediende €6.000, alleenstaand

**Focus:** BBSZ-band 4, raakt 50%-schijf op jaarbasis

**Input:**
```json
{
  "bruto_maand": 6000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €6000.00 |
| RSZ-werknemer (basis 13,07%) | €784.20 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €784.20 |
| Belastbaar maandloon (incl. VAA) | €5215.80 |
| BV vóór gezinsverminderingen | €1577.32 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €1577.32 |
| BBSZ | €60.51 |
| **Netto maand (referentie)** | **€3577.97** |
| Netto check op jaarbasis (× 12) | €42935.64 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €6000.00 |
| RSZ-werkgever (~25%) | €1500.00 |
| Sociaal Fonds 200 (0,23%) | €13.80 |
| Arbeidsongevallen-verzekering (~0,3%) | €18.00 |
| Provisie eindejaarspremie (~8,33%) | €499.80 |
| Provisie dubbel vakantiegeld (~6,67%) | €400.20 |
| **Totale loonkost werkgever** | **€8431.80** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-019 — Senior bediende €6.500, gehuwd

**Focus:** 50%-schijf actief

**Input:**
```json
{
  "bruto_maand": 6500.0,
  "burgerlijke_staat": "gehuwd_dubbel"
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €6500.00 |
| RSZ-werknemer (basis 13,07%) | €849.55 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €849.55 |
| Belastbaar maandloon (incl. VAA) | €5650.45 |
| BV vóór gezinsverminderingen | €1794.64 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €1794.64 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€3794.87** |
| Netto check op jaarbasis (× 12) | €45538.44 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €6500.00 |
| RSZ-werkgever (~25%) | €1625.00 |
| Sociaal Fonds 200 (0,23%) | €14.95 |
| Arbeidsongevallen-verzekering (~0,3%) | €19.50 |
| Provisie eindejaarspremie (~8,33%) | €541.45 |
| Provisie dubbel vakantiegeld (~6,67%) | €433.55 |
| **Totale loonkost werkgever** | **€9134.45** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-020 — Kaderlid €7.000, alleenstaand

**Focus:** BBSZ cap-zone naderend

**Input:**
```json
{
  "bruto_maand": 7000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €7000.00 |
| RSZ-werknemer (basis 13,07%) | €914.90 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €914.90 |
| Belastbaar maandloon (incl. VAA) | €6085.10 |
| BV vóór gezinsverminderingen | €2011.97 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €2011.97 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€4012.19** |
| Netto check op jaarbasis (× 12) | €48146.28 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €7000.00 |
| RSZ-werkgever (~25%) | €1750.00 |
| Sociaal Fonds 200 (0,23%) | €16.10 |
| Arbeidsongevallen-verzekering (~0,3%) | €21.00 |
| Provisie eindejaarspremie (~8,33%) | €583.10 |
| Provisie dubbel vakantiegeld (~6,67%) | €466.90 |
| **Totale loonkost werkgever** | **€9837.10** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-021 — Kaderlid €7.500, alleenstaand, 0 kinderen

**Focus:** 50%-schijf grootste deel marginaal, kostenforfait gecapt

**Input:**
```json
{
  "bruto_maand": 7500.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €7500.00 |
| RSZ-werknemer (basis 13,07%) | €980.25 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €980.25 |
| Belastbaar maandloon (incl. VAA) | €6519.75 |
| BV vóór gezinsverminderingen | €2229.29 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €2229.29 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€4229.52** |
| Netto check op jaarbasis (× 12) | €50754.24 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €7500.00 |
| RSZ-werkgever (~25%) | €1875.00 |
| Sociaal Fonds 200 (0,23%) | €17.25 |
| Arbeidsongevallen-verzekering (~0,3%) | €22.50 |
| Provisie eindejaarspremie (~8,33%) | €624.75 |
| Provisie dubbel vakantiegeld (~6,67%) | €500.25 |
| **Totale loonkost werkgever** | **€10539.75** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-022 — Kaderlid €8.500, gehuwd, 2 kinderen

**Focus:** BBSZ cap €60,94, kostenforfait max €6.070

**Input:**
```json
{
  "bruto_maand": 8500.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 2
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €8500.00 |
| RSZ-werknemer (basis 13,07%) | €1110.95 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €1110.95 |
| Belastbaar maandloon (incl. VAA) | €7389.05 |
| BV vóór gezinsverminderingen | €2535.57 |
| BV-vermindering kinderen | €154.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €2381.57 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€4946.54** |
| Netto check op jaarbasis (× 12) | €59358.48 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €8500.00 |
| RSZ-werkgever (~25%) | €2125.00 |
| Sociaal Fonds 200 (0,23%) | €19.55 |
| Arbeidsongevallen-verzekering (~0,3%) | €25.50 |
| Provisie eindejaarspremie (~8,33%) | €708.05 |
| Provisie dubbel vakantiegeld (~6,67%) | €566.95 |
| **Totale loonkost werkgever** | **€11945.05** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-023 — Bediende €4.000 + bedrijfswagen VAA €180/m, alleenstaand

**Focus:** VAA in belastbaar maar niet in cash

**Input:**
```json
{
  "bruto_maand": 4000.0,
  "vaa_bedrijfswagen": 180.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4000.00 |
| RSZ-werknemer (basis 13,07%) | €522.80 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €522.80 |
| Belastbaar maandloon (incl. VAA) | €3657.20 |
| BV vóór gezinsverminderingen | €853.24 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €853.24 |
| BBSZ | €36.24 |
| **Netto maand (referentie)** | **€2587.72** |
| Netto check op jaarbasis (× 12) | €31052.64 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4000.00 |
| RSZ-werkgever (~25%) | €1000.00 |
| Sociaal Fonds 200 (0,23%) | €9.20 |
| Arbeidsongevallen-verzekering (~0,3%) | €12.00 |
| Provisie eindejaarspremie (~8,33%) | €333.20 |
| Provisie dubbel vakantiegeld (~6,67%) | €266.80 |
| **Totale loonkost werkgever** | **€5621.20** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-024 — Bediende €5.000 + minimum-VAA bedrijfswagen €1.690/12 = €140,83/m, gehuwd, 1 kind

**Focus:** minimum-VAA AJ 2027 €1.690

**Input:**
```json
{
  "bruto_maand": 5000.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 1,
  "vaa_bedrijfswagen": 140.83
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €5000.00 |
| RSZ-werknemer (basis 13,07%) | €653.50 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €653.50 |
| Belastbaar maandloon (incl. VAA) | €4487.33 |
| BV vóór gezinsverminderingen | €1178.42 |
| BV-vermindering kinderen | €56.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €1122.42 |
| BBSZ | €49.51 |
| **Netto maand (referentie)** | **€3174.57** |
| Netto check op jaarbasis (× 12) | €38094.84 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €5000.00 |
| RSZ-werkgever (~25%) | €1250.00 |
| Sociaal Fonds 200 (0,23%) | €11.50 |
| Arbeidsongevallen-verzekering (~0,3%) | €15.00 |
| Provisie eindejaarspremie (~8,33%) | €416.50 |
| Provisie dubbel vakantiegeld (~6,67%) | €333.50 |
| **Totale loonkost werkgever** | **€7026.50** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-025 — Kaderlid €7.000 + bedrijfswagen VAA €350/m + andere VAA €50/m

**Focus:** meervoudige VAA-optelling

**Input:**
```json
{
  "bruto_maand": 7000.0,
  "vaa_bedrijfswagen": 350.0,
  "vaa_andere": 50.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €7000.00 |
| RSZ-werknemer (basis 13,07%) | €914.90 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €914.90 |
| Belastbaar maandloon (incl. VAA) | €6485.10 |
| BV vóór gezinsverminderingen | €2211.97 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €2211.97 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€3812.19** |
| Netto check op jaarbasis (× 12) | €45746.28 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €7000.00 |
| RSZ-werkgever (~25%) | €1750.00 |
| Sociaal Fonds 200 (0,23%) | €16.10 |
| Arbeidsongevallen-verzekering (~0,3%) | €21.00 |
| Provisie eindejaarspremie (~8,33%) | €583.10 |
| Provisie dubbel vakantiegeld (~6,67%) | €466.90 |
| **Totale loonkost werkgever** | **€9837.10** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-026 — Bediende €3.500 + groepsverzekering werknemersbijdrage €40/m (extra belastbaar)

**Focus:** extra belastbaar veld

**Input:**
```json
{
  "bruto_maand": 3500.0,
  "extra_belastbare_componenten": 40.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €3500.00 |
| RSZ-werknemer (basis 13,07%) | €457.45 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €457.45 |
| Belastbaar maandloon (incl. VAA) | €3082.55 |
| BV vóór gezinsverminderingen | €594.65 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €594.65 |
| BBSZ | €24.74 |
| **Netto maand (referentie)** | **€2423.16** |
| Netto check op jaarbasis (× 12) | €29077.92 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €3500.00 |
| RSZ-werkgever (~25%) | €875.00 |
| Sociaal Fonds 200 (0,23%) | €8.05 |
| Arbeidsongevallen-verzekering (~0,3%) | €10.50 |
| Provisie eindejaarspremie (~8,33%) | €291.55 |
| Provisie dubbel vakantiegeld (~6,67%) | €233.45 |
| **Totale loonkost werkgever** | **€4918.55** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-027 — Bediende €10.000, alleenstaand — top-tarief

**Focus:** 50%-schijf overheersend, BBSZ cap

**Input:**
```json
{
  "bruto_maand": 10000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €10000.00 |
| RSZ-werknemer (basis 13,07%) | €1307.00 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €1307.00 |
| Belastbaar maandloon (incl. VAA) | €8693.00 |
| BV vóór gezinsverminderingen | €3315.92 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €3315.92 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€5316.14** |
| Netto check op jaarbasis (× 12) | €63793.68 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €10000.00 |
| RSZ-werkgever (~25%) | €2500.00 |
| Sociaal Fonds 200 (0,23%) | €23.00 |
| Arbeidsongevallen-verzekering (~0,3%) | €30.00 |
| Provisie eindejaarspremie (~8,33%) | €833.00 |
| Provisie dubbel vakantiegeld (~6,67%) | €667.00 |
| **Totale loonkost werkgever** | **€14053.00** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-028 — Bediende €15.000, alleenstaand — extreem hoog (sanity check)

**Focus:** volledig 50%-schijf, kostenforfait gecapt

**Input:**
```json
{
  "bruto_maand": 15000.0
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €15000.00 |
| RSZ-werknemer (basis 13,07%) | €1960.50 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €1960.50 |
| Belastbaar maandloon (incl. VAA) | €13039.50 |
| BV vóór gezinsverminderingen | €5489.17 |
| BV-vermindering kinderen | €0.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €5489.17 |
| BBSZ | €60.94 |
| **Netto maand (referentie)** | **€7489.39** |
| Netto check op jaarbasis (× 12) | €89872.68 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €15000.00 |
| RSZ-werkgever (~25%) | €3750.00 |
| Sociaal Fonds 200 (0,23%) | €34.50 |
| Arbeidsongevallen-verzekering (~0,3%) | €45.00 |
| Provisie eindejaarspremie (~8,33%) | €1249.50 |
| Provisie dubbel vakantiegeld (~6,67%) | €1000.50 |
| **Totale loonkost werkgever** | **€21079.50** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-029 — Bediende €2.189,81 (GGMMI), alleenstaande ouder met 1 kind <3

**Focus:** combinatie GGMMI + kind <3 + alleenstaande ouder

**Input:**
```json
{
  "bruto_maand": 2189.81,
  "kinderen_ten_laste": 1,
  "kinderen_jonger_dan_3": 1,
  "alleenstaand_met_kinderen": true
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €2189.81 |
| RSZ-werknemer (basis 13,07%) | €286.21 |
| Sociale werkbonus luik A | €125.04 |
| Sociale werkbonus luik B | €168.62 |
| Sociale werkbonus totaal | €293.66 |
| RSZ na werkbonus | €0.00 |
| Belastbaar maandloon (incl. VAA) | €2189.81 |
| BV vóór gezinsverminderingen | €113.55 |
| BV-vermindering kinderen | €56.00 |
| Fiscale werkbonus | €130.03 |
| BV netto | €0.00 |
| BBSZ | €10.31 |
| **Netto maand (referentie)** | **€2179.50** |
| Netto check op jaarbasis (× 12) | €26154.00 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €2189.81 |
| RSZ-werkgever (~25%) | €547.45 |
| Sociaal Fonds 200 (0,23%) | €5.04 |
| Arbeidsongevallen-verzekering (~0,3%) | €6.57 |
| Provisie eindejaarspremie (~8,33%) | €182.41 |
| Provisie dubbel vakantiegeld (~6,67%) | €146.06 |
| **Totale loonkost werkgever** | **€3077.34** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- RSZ-vermindering geplafonneerd op 0

**Status validatie:** `pending` (tolerantie ±€5.00)

---

### TC-030 — Bediende €4.500, gehuwd, 5 kinderen waarvan 1 <3

**Focus:** > 4 kinderen extra-toeslag formule

**Input:**
```json
{
  "bruto_maand": 4500.0,
  "burgerlijke_staat": "gehuwd_dubbel",
  "kinderen_ten_laste": 5,
  "kinderen_jonger_dan_3": 1
}
```

**Berekening (referentie-benadering):**

| Component | Waarde |
|---|---:|
| Bruto maand | €4500.00 |
| RSZ-werknemer (basis 13,07%) | €588.15 |
| Sociale werkbonus luik A | €0.00 |
| Sociale werkbonus luik B | €0.00 |
| Sociale werkbonus totaal | €0.00 |
| RSZ na werkbonus | €588.15 |
| Belastbaar maandloon (incl. VAA) | €3911.85 |
| BV vóór gezinsverminderingen | €74.50 |
| BV-vermindering kinderen | €1019.00 |
| Fiscale werkbonus | €0.00 |
| BV netto | €0.00 |
| BBSZ | €44.01 |
| **Netto maand (referentie)** | **€3867.84** |
| Netto check op jaarbasis (× 12) | €46414.08 |

**Werkgeverskost (zonder GV/MC/eco/hosp):**

| Component | Waarde |
|---|---:|
| Bruto loon | €4500.00 |
| RSZ-werkgever (~25%) | €1125.00 |
| Sociaal Fonds 200 (0,23%) | €10.35 |
| Arbeidsongevallen-verzekering (~0,3%) | €13.50 |
| Provisie eindejaarspremie (~8,33%) | €374.85 |
| Provisie dubbel vakantiegeld (~6,67%) | €300.15 |
| **Totale loonkost werkgever** | **€6323.85** |
| Loonwig (totaal − bruto) / totaal | 28.8% |

**Notities:**
- BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — definitieve afrekening in PB-aangifte AJ 2027.

**Status validatie:** `pending` (tolerantie ±€5.00)

---

## Bronnen

- **Sociale werkbonus 1/4/2026** — Partena Professional (snapshot 03), Securex Lex4you (snapshot 04)
- **Belastingschalen AJ 2027 + belastingvrije som €11.180 + kostenforfait €6.070** — Practicali (snapshot 05), Wolters Kluwer Jef Wellens, Wet Diverse Bepalingen 18/12/2025 (BS 30/12/2025)
- **GGMMI €2.189,81 vanaf 1/4/2026** — Acerta (snapshot 06), CAO 43/18 NAR 24/3/2026
- **BBSZ-banden** — Liantis (snapshot 07), gevalideerd tegen Groups
- **PC 200 indexering 2,21% + jaarlijkse premie €330,84 + Sociaal Fonds 200 0,23%** — sfonds200.be (snapshot 08)
- **RSZ werknemer 13,07% + werkgever ~25%** — RSZ instructies werkgevers
- **VAA bedrijfswagen min. €1.690 / ref-CO₂ 58/70 g/km AJ 2027** — Practicali

Volledige bronnenarchief: `bronnen_pc200_loonmotor_2026.zip`.
