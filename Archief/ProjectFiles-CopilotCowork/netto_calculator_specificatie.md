# Netto-Calculator Specificatie — PC 200 Loonmotor (uitbreiding)

**Versie:** 2026-05-08
**Doel:** concrete spec voor de developer om de bestaande POC uit te breiden van *bruto + RSZ + sectorale premies* naar een **volledige netto-loonberekening** voor een PC 200-bediende (inkomstenjaar 2026 / aanslagjaar 2027).
**Schema-conform:** sluit aan op `pc200_payroll_dataset_2026.json` en de drie referentiedocumenten `_CORE.md`, `_VERIFICATIE.md`, `_DEVELOPER.md`.
**Cross-reference:** zie `sources_guideline.md` voor bronnenkeuze per bouwsteen.

---

## Inhoudstafel

1. [Scope & afbakening](#1-scope--afbakening)
2. [Input — uitgebreid werknemerprofiel](#2-input--uitgebreid-werknemerprofiel)
3. [Output — netto-resultaatblok](#3-output--netto-resultaatblok)
4. [Berekeningsketen Bruto → Netto](#4-berekeningsketen-bruto--netto)
5. [Bouwsteen-formules per stap](#5-bouwsteen-formules-per-stap)
6. [Audit-eisen per stap](#6-audit-eisen-per-stap)
7. [UI-flow netto-paneel](#7-ui-flow-netto-paneel)
8. [Foutgedrag & edge cases](#8-foutgedrag--edge-cases)
9. [Gouden testcases (NTC-01..NTC-15)](#9-gouden-testcases-ntc-01ntc-15)
10. [Cross-check tegen FOD Fin Tax-Calc](#10-cross-check-tegen-fod-fin-tax-calc)

---

## 1. Scope & afbakening

### Wel in scope

| Onderdeel | Detail |
|---|---|
| **RSZ werknemer** | 13,07 % (al in POC) — uitbreiding: integratie sociale werkbonus |
| **Sociale werkbonus 1/4/2026** | Luik A + Luik B (bedienden) — vermindering RSZ wn |
| **Bedrijfsvoorheffing (BV)** | KB Bijlage III 2026 sleutelformule — Schaal I/II/III |
| **BV-verminderingen** | kinderen ten laste, andere personen, fiscaal alleenstaande, groepsverzekering |
| **Fiscale werkbonus** | belastingkrediet op BV (33,14 % Luik A / 52,54 % Luik B) |
| **BBSZ** | info-veld met bandbreedte (geen exacte inhouding tot Tier-1 bevestiging) |
| **VAA** | bedrijfswagen, PC, GSM, internet, huisvesting, verwarming, elektriciteit |
| **Aanvullende gemeentebelasting** | parameter (default 7,3 %) — info-only |
| **Eindejaarspremie / dubbel vakantiegeld** | bijzondere BV-schaal 17,16 %–23,22 % |

### Niet in scope (bewust)

- Volledige PB-aangifte AJ 2027 (alleen BV-niveau, niet eindafrekening)
- Flexi-job, sportbeoefenaar, auteursrechten (buiten klassieke PC 200-scope)
- Multi-jaar simulatie (één referentiedatum per berekening)
- Overuren-toeslag bijzonder regime (vermelden in scope-paneel)

---

## 2. Input — uitgebreid werknemerprofiel

Aanvullingen op het huidige POC-input-formulier:

| Veld | Type | Verplicht | Validatie | Default |
|---|---|---|---|---|
| `gezinscategorie` | enum: `alleenstaande`, `gehuwd_partner_inkomen`, `gehuwd_partner_zonder_inkomen` | ✓ | bepaalt BV-schaal I/II | `alleenstaande` |
| `niet_inwoner` | boolean | nee | true → BV-schaal III | false |
| `kinderen_ten_laste` | integer 0–12 | nee | — | 0 |
| `kinderen_gehandicapt` | integer 0–12 | nee | ≤ `kinderen_ten_laste` (telt dubbel) | 0 |
| `andere_personen_ten_laste` | integer 0–10 | nee | — | 0 |
| `fiscaal_alleenstaande_met_kinderen` | boolean | nee | enkel indien `gezinscategorie = alleenstaande` AND `kinderen_ten_laste > 0` | false |
| `groepsverzekering_eigen_bijdrage_eur` | decimaal ≥ 0 | nee | maandbijdrage werknemer | 0 |
| `gemeentebelasting_pct` | decimaal 0–10 | nee | informatief — buiten BV | 7.3 |
| `vaa_bedrijfswagen_eur_jaar` | decimaal ≥ 0 | nee | jaarbedrag (UI: aparte sub-form met cataloguswaarde + CO2 + brandstof + leeftijd) | 0 |
| `vaa_pc_internet_gsm_eur_jaar` | decimaal ≥ 0 | nee | som forfaits | 0 |
| `vaa_huisvesting_eur_jaar` | decimaal ≥ 0 | nee | KI × 2,3000 × 100/60 × 2 (bemeubeld × 5/3) | 0 |
| `vaa_verwarming_elek_eur_jaar` | decimaal ≥ 0 | nee | forfaits | 0 |

**Bestaande velden behouden:** `referentiedatum`, `schaal`, `categorie`, `ervaring_jaren`, `leeftijd_jaren`, `brutoloon_eur`, `bouw_vlag`, `tewerkstellingsbreuk`, `prestaties_refertepériode_maanden`.

---

## 3. Output — netto-resultaatblok

Onder de bestaande resultaatblokken komt een nieuw paneel **"Netto-berekening (indicatief)"**:

| Regel | Bron-Datapunt | Formule (vereenvoudigd) |
|---|---|---|
| Bruto belastbaar | (input) | `brutoloon_eur` |
| − RSZ werknemer | `rsz_werknemer_pct_2026` | `bruto × 0,1307` |
| + Sociale werkbonus (terugbetaling) | `werkbonus_sociaal_luik_A_2026`, `_luik_B_2026` | luik A + luik B-formule |
| = Loon belastbaar voor BV | (afgeleid) | bruto − RSZ_wn + werkbonus_sociaal |
| + VAA (omgeslagen ÷12) | meerdere `vaa_*_2026` | totaal VAA / 12 |
| − BV (vóór verminderingen) | `bv_2026_kb_bijlage_iii` (sleutelformule) | per Schaal I/II/III |
| − BV-vermindering kinderen | `bv_vermindering_kinderen_2026` | tabel-lookup |
| − BV-vermindering andere persoon | `bv_vermindering_andere_persoon_2026` | tabel-lookup |
| − BV-vermindering fiscaal alleenstaande | `bv_vermindering_alleenstaande_2026` | + €52 |
| − BV-vermindering groepsverzekering | `bv_vermindering_groepsverzekering_2026` | 30 % × eigen bijdrage |
| − Fiscale werkbonus (krediet) | `werkbonus_fiscaal_2026` | 33,14 % × Luik A + 52,54 % × Luik B |
| = Netto BV | (afgeleid) | BV - alle verminderingen (min 0) |
| − BBSZ (band, info-only) | `bbsz_2026_q1` (status WEAK) | range €0 – €60,94/maand |
| **= Netto maandloon (indicatief)** | (afgeleid) | bruto − RSZ_wn + werkbonus_sociaal − netto_BV − BBSZ_band_min |

Elke regel toont:
- waarde (€, 2 decimalen)
- klikbare bron-link (`bron_url`)
- status-icoon (`actief` ✓, `mogelijk_verouderd` ⚠️, `conflict` ❌, `niet_gevonden` 🔘)
- uitklapbaar audit-paneel met `bron_fragment`, `betrouwbaarheid`, `triangulatie_bronnen`

**Disclaimer-banner verplicht onder netto-paneel:**
> *"Netto is een indicatieve raming op maandbasis. BV-bedragen worden berekend volgens de KB Bijlage III 2026 sleutelformule. Voor de exacte BV-inhouding raadpleeg de [FOD Fin BV-simulator](https://eservices.minfin.fgov.be/taxcalc/). BBSZ wordt getoond als band omdat de RSZ-instructie 2026 op peildatum nog niet als gestructureerde tabel is gepubliceerd. Eindafrekening volgt via de personenbelasting-aangifte AJ 2027."*

---

## 4. Berekeningsketen Bruto → Netto

```
Stap 1: BRUTO maandloon (input)
        ↓
Stap 2: − RSZ werknemer (13,07 % × bruto)
        + Sociale werkbonus (Luik A + B, vermindering RSZ wn)
        ↓
Stap 3: = Belastbaar voor BV (bruto − netto_RSZ_wn)
        + maandelijks omgeslagen VAA (totaal_VAA / 12)
        ↓
Stap 4: − BEDRIJFSVOORHEFFING (sleutelformule KB Bijlage III)
          Schaal bepaling: I (alleenstaande / 2 inkomens), II (eenverdiener), III (niet-inwoner)
          ↓
Stap 5: − BV-verminderingen (kinderen ten laste, andere persoon,
                              alleenstaande+kinderen, groepsverzekering)
        − Fiscale werkbonus (belastingkrediet)
          = Netto BV (min 0, geen negatieve BV)
        ↓
Stap 6: − BBSZ (info-band — niet meegerekend in finaal cijfer; UI toont range)
        ↓
Stap 7: + vergoedingen woon-werk / fiets (vrijgesteld tot KB-plafond) — al in POC
        ↓
Stap 8: = NETTO maandloon (indicatief)
```

> **Bijzondere gevallen** (apart UI-paneel, zelfde dataset-pijplijn):
> - **Eindejaarspremie / dubbel vakantiegeld:** bijzondere BV-schaal (`bv_bijzondere_schaal_eindejaar_2026`) — 17,16 % tot 23,22 % afhankelijk van bedrag
> - **Dubbel vakantiegeld bedienden:** 92 % × maandloon × bijzondere BV-schaal

---

## 5. Bouwsteen-formules per stap

### 5.1 Sociale werkbonus (1/4/2026 bedienden)

```typescript
function werkbonusSociaal(S: number, refDatum: Date): { luik_A: number, luik_B: number, totaal: number } {
  // Luik A
  let luik_A = 0;
  if (S <= 2880.32) luik_A = 125.04;
  else if (S < 3336.98) luik_A = 125.04 - 0.2738 * (S - 2880.32);

  // Luik B
  let luik_B = 0;
  if (S <= 2255.50) luik_B = 168.62;
  else if (S < 2880.32) luik_B = 168.62 - 0.2699 * (S - 2255.50);

  return { luik_A: round2(luik_A), luik_B: round2(luik_B), totaal: round2(luik_A + luik_B) };
}
```

**Datapunten:** `werkbonus_sociaal_luik_A_2026`, `werkbonus_sociaal_luik_B_2026`.
**Periode-guard:** alleen geldig vanaf `2026-04-01`. Voor `refDatum < 2026-04-01` → fallback naar 1/1/2026-cijfers (lager) met banner.

### 5.2 Bedrijfsvoorheffing — sleutelformule KB Bijlage III 2026

> **POC-fase 1 (aanbevolen voor start):** UI-link naar [FOD Fin BV-simulator](https://eservices.minfin.fgov.be/taxcalc/) + audit-banner. Geen eigen implementatie. Datapunt `bv_2026_kb_bijlage_iii` met `status: actief_via_externe_simulator`.
>
> **POC-fase 2 (post-MVP):** eigen TS-implementatie met KB-coëfficiënten als constants in `src/lib/bv.ts`. **Verplicht** validatie tegen FOD-simulator voor minstens 20 testcases (NTC-01..NTC-20).

**Mocked formule-skelet (fase 2):**

```typescript
function bvBijlageIII2026(
  belastbaarMaand: number,
  schaal: 'I' | 'II' | 'III',
  ref: Date
): number {
  // 1. Annualiseer belastbaar maandloon
  const jaarbasis = belastbaarMaand * 12;

  // 2. Pas schaal-tarief toe (KB-coëfficiënten — TBD uit KB-extractie)
  const bvJaar = applySchaalTarief(jaarbasis, schaal);

  // 3. Maand-afronding
  const bvMaand = bvJaar / 12;

  // 4. Geen tussentijdse afronding — alleen eindwaarde
  return round2(Math.max(0, bvMaand));
}
```

**Datapunt:** `bv_2026_kb_bijlage_iii` (status `mogelijk_verouderd` tot KB rechtstreeks geëxtraheerd).

### 5.3 BV-verminderingen (tabel-lookup)

```typescript
function bvVerminderingKinderen(aantal: number, gehandicapt: number): number {
  const tabel: Record<number, number> = {
    0: 0, 1: 52, 2: 138, 3: 367, 4: 635,
    5: 925, 6: 1216, 7: 1510, 8: 1833,
  };
  let basis = aantal <= 8 ? tabel[aantal] : tabel[8] + (aantal - 8) * 345;
  basis += gehandicapt * 52; // gehandicapt kind telt dubbel
  return basis;
}
```

**Datapunt:** `bv_vermindering_kinderen_2026` met `tabel_per_aantal_kinderen`.

### 5.4 Fiscale werkbonus

```typescript
function werkbonusFiscaal(luik_A: number, luik_B: number): number {
  return round2(0.3314 * luik_A + 0.5254 * luik_B);
}
```

**Datapunt:** `werkbonus_fiscaal_2026` met `pct_luik_A: 0.3314`, `pct_luik_B: 0.5254`.

### 5.5 BBSZ (info-band)

```typescript
function bbszBand(brutoMaand: number, gezinscat: string, ref: Date): { min: number, max: number } {
  // Tier-2 SSN tabel — markeer WEAK tot Tier-1 RSZ-instructie 2026
  // Range 2026: €0 – €60,94/maand
  return { min: 0, max: 60.94 };
}
```

**Datapunt:** `bbsz_2026_q1` (status `mogelijk_verouderd`). UI toont range, geen geprecíseerd bedrag.

### 5.6 VAA (samenvattend)

```typescript
function vaaTotaalJaar(input: VaaInput): number {
  return (
    input.bedrijfswagen_jaar +    // formule sectie 5.7
    input.pc_internet_gsm_jaar +  // forfaits 72/60/36/48
    input.huisvesting_jaar +      // KI × 2,3000 × 100/60 × 2
    input.verwarming_elek_jaar    // forfaits 1150/580 of 2560/1280
  );
}
```

### 5.7 VAA bedrijfswagen

```typescript
function vaaBedrijfswagen(
  cataloguswaarde: number,
  co2: number,
  brandstof: 'diesel' | 'benzine' | 'lpg' | 'cng' | 'elektrisch',
  leeftijdMaanden: number
): number {
  const refCO2 = brandstof === 'diesel' ? 58 : (brandstof === 'elektrisch' ? 0 : 70);
  let coef = 5.5 + (co2 - refCO2) * 0.1;
  coef = Math.max(4, Math.min(18, coef));
  const leeftijdCoef = Math.max(0.7, 1 - Math.floor(leeftijdMaanden / 12) * 0.06);
  const vaaJaar = (cataloguswaarde * coef / 100) * leeftijdCoef * (6 / 7);
  return round2(Math.max(1690, vaaJaar)); // min VAA 2026 = €1.690
}
```

**Datapunten:** `vaa_bedrijfswagen_min_2026`, `vaa_bedrijfswagen_co2_diesel_2026` (= 58), `vaa_bedrijfswagen_co2_benzine_2026` (= 70).

---

## 6. Audit-eisen per stap

Voor élke berekende waarde geldt het bestaande audit-trail-invariant:

| Vereiste | Toepassing op netto-laag |
|---|---|
| Datapunt-id verplicht | Elke regel in §3-tabel verwijst naar minstens één Datapunt-id uit het dataset |
| `bron_url` klikbaar | Audit-paneel toont bron-link per Datapunt |
| `status`-icoon zichtbaar | `actief` / `mogelijk_verouderd` / `conflict` / `niet_gevonden` |
| `betrouwbaarheid` tier (1/2/3) | Tier-3 → triangulatie-pijl naar `triangulatie_bronnen[]` |
| `geldig_vanaf` / `geldig_tot` | `safeGetValue` filtert op `referentiedatum` |
| `bron_fragment` verplicht | Letterlijk citaat ≤ 200 karakters uit primaire bron |
| Geen runtime-arithmetic op `waarde_bron` | Alleen `waarde_genormaliseerd` of `tabel_per_*` voor berekening |

**Speciale gevallen:**

- **BV via FOD-simulator (fase 1):** Datapunt `bv_2026_kb_bijlage_iii` heeft `waarde_genormaliseerd: null` en `status: actief_via_externe_simulator`. UI toont disclaimer-knop "Bereken via FOD Fin Tax-Calc" → opent simulator in nieuw tabblad. Geen lokale BV-cijfer — UI toont alleen "extern berekend, zie simulator".
- **BBSZ (info-band):** Datapunt `bbsz_2026_q1` met `status: mogelijk_verouderd` en `range_min`/`range_max` velden. UI toont gele waarschuwing.

---

## 7. UI-flow netto-paneel

```
┌──────────────────────────────────────────────────────────────────┐
│ NETTO-BEREKENING (indicatief)                              ⓘ ⚠️  │
├──────────────────────────────────────────────────────────────────┤
│ Bruto belastbaar                                       € 3.500,00│
│ − RSZ werknemer 13,07 %                              − €   457,45│
│ + Sociale werkbonus (Luik A + B, 1/4/2026)           + €     0,00│  [audit ▾]
│ = Loon belastbaar voor BV                              € 3.042,55│
│ + VAA bedrijfswagen (€18.500/jaar ÷ 12)              + €  1.541,67│  [audit ▾]
│ + VAA PC + internet (€132/jaar ÷ 12)                 + €    11,00│  [audit ▾]
│ = Belastbaar BV                                        € 4.595,22│
├──────────────────────────────────────────────────────────────────┤
│ − BV vóór verminderingen (Schaal II, sleutelformule) − € 1.245,00│  [via FOD-Tax-Calc ↗]
│ − BV-vermindering 2 kinderen ten laste                 − € 138,00│  [audit ▾]
│ − Fiscale werkbonus (33,14 % × € 0)                    − €   0,00│  [audit ▾]
│ = Netto BV                                             − € 1.107,00│
├──────────────────────────────────────────────────────────────────┤
│ BBSZ (info-band)                                       € 0 – 61  │  ⚠️ niet meegerekend
├──────────────────────────────────────────────────────────────────┤
│ NETTO MAANDLOON (indicatief)                           € 1.935,55│
│ Aanvullende gemeentebelasting (7,3 % default)        — informatief│
└──────────────────────────────────────────────────────────────────┘
[ Open audit-rapport (PDF) ]    [ Cross-check via FOD Fin Tax-Calc ↗ ]
```

**Footer-banner verplicht:**
> *Dataset versie 2026-05-08 — laatste verificatie per Datapunt zichtbaar in audit-paneel. Netto is indicatief; BV-eindafrekening via personenbelasting AJ 2027.*

---

## 8. Foutgedrag & edge cases

| Situatie | Tool-gedrag |
|---|---|
| Datapunt `bv_2026_kb_bijlage_iii` heeft `status = niet_gevonden` of `waarde_genormaliseerd = null` (fase 1) | UI toont alleen "BV te berekenen via FOD Fin Tax-Calc ↗" met deeplink |
| `referentiedatum < 2026-04-01` | Werkbonus-formule gebruikt 1/1/2026-cijfers + gele banner "Werkbonus-grenzen wijzigen op 1/4/2026" |
| `gezinscategorie = gehuwd_partner_zonder_inkomen` AND `niet_inwoner = true` | Hard error: "Niet-inwoner kan geen Schaal II selecteren" |
| `kinderen_gehandicapt > kinderen_ten_laste` | Hard error met UI-validatie |
| `vaa_bedrijfswagen_eur_jaar < 1690` | Auto-correctie naar 1690 + info-icoon "Minimum VAA 2026 = €1.690" |
| Netto < 0 | UI toont "Netto onder 0 — controleer input + VAA-bedragen" rode banner |
| BBSZ datapunt `mogelijk_verouderd` | Gele icoon + "Officiële RSZ-instructie 2026 nog te bevestigen" |

---

## 9. Gouden testcases (NTC-01..NTC-15)

> Testbestand: `src/lib/__tests__/netto.test.ts`. Run via `bun test`.

| # | Profiel | Bruto | Verwacht netto (raming) | Cross-check |
|---|---|---|---|---|
| **NTC-01** | Schaal I, Cat A, 5 jr ervaring, alleenstaande, 0 kinderen, geen VAA | € 2.276,51 | ≈ € 1.890 | FOD Fin BV-simulator |
| **NTC-02** | Schaal I, Cat C, 10 jr, alleenstaande, 1 kind | € 2.800,00 | ≈ € 2.220 | idem |
| **NTC-03** | Schaal II, Cat B, 8 jr, eenverdiener, 2 kinderen | € 3.000,00 | ≈ € 2.460 | idem |
| **NTC-04** | Schaal I, Cat A, 0 jr, alleenstaande (= GGMMI-buurt) | € 2.189,81 | ≈ € 1.870 (hoge werkbonus) | RSZ Find My Bonus |
| **NTC-05** | Schaal I, Cat B, 5 jr, alleenstaande, +bedrijfswagen € 1.690 min-VAA | € 2.500,00 | ≈ € 1.880 | FOD Fin Tax-Calc |
| **NTC-06** | Schaal I, Cat D, 15 jr, eenverdiener, 3 kinderen | € 3.800,00 | ≈ € 3.060 | FOD Fin BV-simulator |
| **NTC-07** | Schaal II, Cat A, 3 jr, eenverdiener, 0 kinderen | € 2.450,00 | ≈ € 2.020 | idem |
| **NTC-08** | Niet-inwoner, Schaal III, Cat C, 10 jr | € 3.200,00 | ≈ € 2.480 | idem |
| **NTC-09** | Schaal I, Cat A, 5 jr, alleenstaande met 1 kind (fiscaal alleenstaande) | € 2.500,00 | ≈ € 2.080 (extra €52) | FOD Fin Tax-Calc |
| **NTC-10** | Schaal I, Cat C, 12 jr, alleenstaande, +groepsverzekering eigen bijdrage € 100/m | € 3.100,00 | ≈ € 2.510 | idem |
| **NTC-11** | Werkbonus-test: bruto €2.255,50 (Luik B grens) → max werkbonus | € 2.255,50 | werkbonus = €293,66 (A+B) | RSZ Find My Bonus |
| **NTC-12** | Werkbonus-test: bruto €3.336,98 (Luik A wegval) | € 3.336,98 | werkbonus = €0 | idem |
| **NTC-13** | Werkbonus-test: bruto €2.880,32 (Luik A grens, Luik B wegval) | € 2.880,32 | werkbonus_A = €125,04, _B = €0 | idem |
| **NTC-14** | Eindejaarspremie 1 maandloon — bijzondere BV-schaal | € 3.000 (premie) | ≈ € 2.310 (na 23 % BV) | Acerta tool |
| **NTC-15** | Dubbel vakantiegeld 92 % maandloon — bijzondere BV-schaal | € 2.760 (= 92 % × 3000) | ≈ € 2.110 | Acerta tool |

**Acceptatiecriteria:**
- Alle 15 NTC-cases groen in `bun test`
- BV-uitkomsten binnen ±€2 van FOD Fin Tax-Calc voor minstens 12/15 cases
- Indien afwijking > €2: documenteren in `pc200_payroll_dataset_2026_VERIFICATIE.md` met root-cause

---

## 10. Cross-check tegen FOD Fin Tax-Calc

> **Verplichte validatieprocedure** voor POC-fase 2 (eigen sleutelformule):

1. **Selecteer 20 representatieve test-profielen** (mix Schaal I/II/III, met/zonder kinderen, lage tot middenlonen, met/zonder VAA).
2. **Voer elk profiel manueel in** in [FOD Fin BV-simulator](https://eservices.minfin.fgov.be/taxcalc/) en noteer BV-uitkomst.
3. **Vergelijk** met de eigen `bvBijlageIII2026()`-uitkomst.
4. **Acceptatie:** afwijking ≤ €2/maand voor 18/20 cases. Resterende 2 cases: documenteren met root-cause.
5. **Ankerwaarden documenteren** in `src/lib/__tests__/netto.test.ts` als `expect(bv).toBeCloseTo(verwacht, 2)`.

**Onderhoud:** elke jaarlijkse BV-coëfficiënten-update (eind december) → opnieuw 20 cross-checks runnen. Faalt > 2 → release-blocker, geen deploy.

---

## Bijlage A: Datapunt-ID conventie

Nieuwe Datapunten volgen het bestaande pattern uit het dataset:

```
bv_2026_kb_bijlage_iii                     → BV sleutelformule
bv_schaal_I_2026                           → BV Schaal I
bv_schaal_II_2026                          → BV Schaal II
bv_schaal_III_2026                         → BV Schaal III
bv_vermindering_kinderen_2026              → tabel
bv_vermindering_andere_persoon_2026
bv_vermindering_alleenstaande_kind_2026
bv_vermindering_groepsverzekering_2026
bv_bijzondere_schaal_eindejaar_2026
werkbonus_sociaal_luik_A_2026              → R + S₀ + helling
werkbonus_sociaal_luik_B_2026
werkbonus_fiscaal_2026                     → 33,14 % / 52,54 %
bbsz_2026_q1                               → range, status WEAK
vaa_bedrijfswagen_min_2026                 → €1.690
vaa_bedrijfswagen_co2_diesel_2026          → 58 g/km
vaa_bedrijfswagen_co2_benzine_2026         → 70 g/km
vaa_pc_forfait_2026                        → €72
vaa_internet_forfait_2026                  → €60
vaa_gsm_forfait_2026                       → €36
vaa_telefoonabo_forfait_2026               → €48
vaa_tablet_forfait_2026                    → €36
vaa_huisvesting_multiplier_2026            → 100/60 × 2
vaa_verwarming_andere_2026                 → €1.150
vaa_elektriciteit_andere_2026              → €580
forfait_beroepskosten_aj2027               → 30 %, max €6.070
belastingvrije_som_aj2027                  → €11.180
pb_schijven_aj2027                         → tabel 25/40/45/50 %
fiscaal_indexcoefficient_aj2027            → 2,3000
ggmmi_2026_q2                              → €2.189,81
```

Gedetailleerde JSON-voorbeelden: zie `dataset_uitbreiding_voorstel.md`.

---

*Versie 2026-05-08. Sluit aan op `sources_guideline.md`, `dataset_uitbreiding_voorstel.md`, `gaps_en_pending.md`, `implementation_roadmap.md`. Te onderhouden volgens `_DEVELOPER.md` §8.2.*
