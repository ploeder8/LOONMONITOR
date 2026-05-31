# Netto-Calculator Specificatie — PC 200 Loonmotor (uitbreiding)

**Versie:** 2026-05-17
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
10. [Cross-check tegen FOD Bijlage III](#10-cross-check-tegen-fod-bijlage-iii)

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
| **BBSZ** | exacte 2026-inhouding volgens RSZ-scenario; voorschot op PB-eindafrekening |
| **VAA** | bedrijfswagen en forfaitaire werkmiddelen (PC/laptop, GSM, internet, abonnement) actief; huisvesting, verwarming en elektriciteit buiten scope |
| **Aanvullende gemeentebelasting** | vaste interne parameter 7,3 % (gewogen landelijk gemiddelde) — info-only |
| **Eindejaarspremie / dubbel vakantiegeld** | bijzondere BV-schaal met aparte kolommen voor vakantiegeld en andere exceptionele vergoedingen |

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
| `gezinscategorie` | enum: `alleenstaande`, `gehuwd_partner_inkomen`, `gehuwd_partner_zonder_inkomen` | ✓ | bepaalt BV-schaal I/II; UI-label: partner zonder of beperkt beroepsinkomen. Dit verlaagt de bedrijfsvoorheffing via Schaal II/huwelijksquotiënt en is geen "partner ten laste" | `alleenstaande` |
| `niet_inwoner` | boolean | nee | true → BV-schaal III | false |
| `kinderen_ten_laste` | integer 0–12 | nee | — | 0 |
| `kinderen_gehandicapt` | integer 0–12 | nee | ≤ `kinderen_ten_laste` (telt dubbel) | 0 |
| `andere_personen_ten_laste` | integer 0–10 | nee | — | 0 |
| `fiscaal_alleenstaande_met_kinderen` | boolean | nee | enkel indien `gezinscategorie = alleenstaande` AND `kinderen_ten_laste > 0` | false |
| `bbsz_scenario` | enum: `individuele_aanslag`, `gemeenschappelijke_aanslag_partner_met_beroepsinkomsten`, `gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten` | ✓ | bepaalt de BBSZ-kwartaalschijf; los van BV-schaal gekozen omdat BBSZ een eigen RSZ-regime heeft | `individuele_aanslag` |
| `groepsverzekering_eigen_bijdrage_eur` | decimaal ≥ 0 | nee | maandbijdrage werknemer | 0 |
| `gemeentebelasting_pct` | decimaal 0–10 | nee | interne info-only parameter, niet zichtbaar als gebruikersinvoer — buiten BV | 7.3 |
| `vaa_bedrijfswagen_eur_jaar` | decimaal ≥ 0 | nee | jaarbedrag (UI: aparte sub-form met cataloguswaarde + CO2 + brandstof + leeftijd) | 0 |
| `vaa_pc_internet_gsm_eur_jaar` | decimaal ≥ 0 | nee | som forfaits | 0 |
| `vaa_huisvesting_eur_jaar` | decimaal ≥ 0 | nee | KI × 2,3000 × 100/60 × 2 (bemeubeld × 5/3) | 0 |
| `vaa_verwarming_elek_eur_jaar` | decimaal ≥ 0 | nee | forfaits | 0 |

**Bestaande velden behouden:** `referentiedatum`, `schaal`, `categorie`, `ervaring_jaren`, `leeftijd_jaren`, `brutoloon_eur`, `bouw_vlag` (legacy, geen runtime-effect meer sinds 30/05/2026), `tewerkstellingsbreuk`, `prestaties_refertepériode_maanden`.

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
| − BBSZ | `bv_bbsz_schijven_2026` | scenarioformule kwartaalinhouding ÷ 3 |
| **= Netto maandloon (indicatief)** | (afgeleid) | bruto − RSZ_wn + werkbonus_sociaal − netto_BV − BBSZ + nettovergoedingen − inhoudingen |

Elke regel toont:
- waarde (€, 2 decimalen)
- klikbare bron-link (`bron_url`)
- status-icoon (`actief` ✓, `mogelijk_verouderd` ⚠️, `conflict` ❌, `niet_gevonden` 🔘)
- uitklapbaar audit-paneel met `bron_fragment`, `betrouwbaarheid`, `triangulatie_bronnen`

**Disclaimer-banner verplicht onder netto-paneel:**
> *"Netto is een indicatieve raming op maandbasis. BV-bedragen worden berekend volgens de KB Bijlage III 2026 sleutelformule. BBSZ wordt maandelijks ingehouden als voorschot op basis van het gekozen RSZ-scenario; de definitieve afrekening volgt via de personenbelasting-aangifte AJ 2027."*

---

## 4. Berekeningsketen Bruto → Netto

```
Stap 1: BRUTO maandloon (input)
        ↓
Stap 2: − RSZ werknemer (13,07 % × bruto)
        + Sociale werkbonus (Luik A + B, vermindering RSZ wn)
        ↓
Stap 3: = Loon na RSZ en werkbonus (bruto − netto_RSZ_wn)
        + woon-werkvergoeding (belastbare werkgeverstussenkomst)
        = Belastbaar voor BV
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
Stap 6: − BBSZ (scenario-inhouding; kwartaalbedrag ÷ 3)
        ↓
Stap 7: Voor BV wordt enkel het niet-vrijgestelde woon-werkdeel belast:
        BV-grondslag = belastbaar loon − vrijstelling woon-werk (forfaitaire beroepskosten)
        ↓
Stap 8: = NETTO maandloon (indicatief)
```

> **Bijzondere gevallen** (apart UI-paneel, zelfde dataset-pijplijn):
> - **Eindejaarspremie / dubbel vakantiegeld:** bijzondere BV-schaal (`bv_bijzondere_schaal_eindejaar_2026`) op belastbaar exceptioneel bedrag na RSZ.
> - **Sectorale jaarpremie PC 200:** werknemers-RSZ, daarna bijzondere BV via dezelfde kolom als eindejaarspremie (`andere_exceptionele_vergoeding`).
> - **Dubbel vakantiegeld bedienden:** 92 % × brutomaandloon; RSZ = 13,07 % op 85/92 van het dubbel vakantiegeld; BV via de kolom vakantiegeld.

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

> **Huidige status (23/05/2026):** eigen TS-implementatie in `src/lib/bv.ts` gebruikt FOD Financiën / Bijlage III 2026 als primaire payrollbron. Tax-Calc is alleen een latere PB-ramingscheck, niet de bron voor maandelijkse BV. De gewone maand-BV gebruikt de Bijlage III-basisschaal 26,75% / 42,80% / 48,15% / 53,50%, niet de gewone PB-schijven 25% / 40% / 45% / 50%.

**Formule-skelet:**

```typescript
function bvBijlageIII2026(
  belastbaarMaand: number,
  schaal: 'I' | 'II' | 'III',
  ref: Date
): number {
  // 1. Annualiseer belastbaar maandloon
  const jaarbasis = belastbaarMaand * 12;

  // 2. Trek forfaitaire beroepskosten af: 30%, max €6.070
  const nettoJaar = jaarbasis - Math.min(jaarbasis * 0.30, 6070);

  // 3. Pas Bijlage III-basisschaal toe:
  // tot €16.710: 26,75%;
  // €16.710,01-€29.500: €4.469,93 + 42,80% boven €16.710;
  // €29.500,01-€51.050: €9.944,05 + 48,15% boven €29.500;
  // boven €51.050: €20.320,38 + 53,50% boven €51.050.
  const basisbelasting = applyBijlageIIIBasisschaal(nettoJaar);

  // 4. Verminder met belastingvrije-som-equivalent:
  // Schaal I: €2.987,98; Schaal II: huwelijksquotiënt + €5.975,96.
  const naVrijeSom = applySchaalIofII(basisbelasting, nettoJaar, schaal);

  // 5. Deel door 12 en pas maandelijkse bijkomende verminderingen toe.
  return round2(Math.max(0, naVrijeSom / 12));
}
```

**Datapunt:** `bv_2026_kb_bijlage_iii` (Tier 1, FOD Financiën / Bijlage III 2026).

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

### 5.4b Bijzondere BV-schaal voor variabel loon (eindejaarspremie, premies, vakantiegeld)

> **Kritiek:** voor **variabel loon** (eindejaarspremie, jaarlijkse premie, dubbel vakantiegeld, ad-hoc bonussen) geldt **niet de normale BV-schijven** maar een **bijzondere BV-schaal** waarbij het tarief afhangt van het **refertejaarloon** (= jaarbedrag van de normale bruto bezoldigingen verminderd met werknemers-RSZ).

**Algoritme:**
1. `refertejaarloon = (brutomaandloon × 12) − werknemers-RSZ 13,07%` (normaal terugkerend loon, zonder premies)
2. Trek op het exceptionele bedrag ook eerst toepasselijke werknemers-RSZ af om het belastbare bedrag te bepalen.
3. Lookup tarief in tabel "bijzondere BV-schaal" (AJ 2027), met aparte kolom voor vakantiegeld versus andere exceptionele vergoedingen.
4. Pas de specifieke Bijlage III-kindregels voor exceptionele vergoedingen toe op basis van het normale brutojaarloon (`brutomaandloon × 12`): eerst eventuele vrijstelling van een deel van de exceptionele vergoeding, daarna eventuele procentuele vermindering op de BV.
5. `bvBijzonder = belastbaarExceptioneelNaVrijstelling × tarief − exceptioneleKindvermindering`

**Belangrijk:** de maandelijkse BV-kindvermindering uit de gewone loonberekening wordt **niet** rechtstreeks afgetrokken van eindejaarspremie of dubbel vakantiegeld. Voor exceptionele vergoedingen gelden aparte grenzen en percentages uit Bijlage III. Bij een normaal brutojaarloon van €48.000 en 3 kinderen is er geen vrijstelling of vermindering, dus de BV is gewoon `belastbaar exceptioneel loon × tarief`.

**Tabel bijzondere BV-schaal 2026 (referte-jaarloon → tarief op exceptioneel inkomen):**

| Refertejaarloon (€) | Vakantiegeld | Andere vergoedingen en toelagen |
|---|---:|---:|
| ≤ 10.675 | 0% | 0% |
| 10.675,01 – 13.660 | 19,17% | 23,22% |
| 13.660,01 – 17.375 | 21,20% | 25,23% |
| 17.375,01 – 20.840 | 26,25% | 30,28% |
| 20.840,01 – 23.580 | 31,30% | 35,33% |
| 23.580,01 – 26.340 | 34,33% | 38,36% |
| 26.340,01 – 31.830 | 36,34% | 40,38% |
| 31.830,01 – 34.640 | 39,37% | 43,41% |
| 34.640,01 – 45.860 | 42,39% | 46,44% |
| 45.860,01 – 59.900 | 47,44% | 51,48% |
| > 59.900 | 53,50% | 53,50% |

```typescript
function bvBijzonder(
  refertejaarloon: number,
  normaalBrutoJaarloon: number,
  belastbaarExceptioneel: number,
  soort: 'vakantiegeld' | 'andere_exceptionele_vergoeding',
  gezinstype: GezinsType,
  kinderenTenLaste: number,
): { tarief: number; bvBruto: number; vermindering: number; bvNetto: number } {
  const tarief = lookupBijzondereSchaal(refertejaarloon, soort);
  const vrijgesteld = kindVrijstellingExceptioneel(normaalBrutoJaarloon, belastbaarExceptioneel, kinderenTenLaste);
  const bvBruto = round2((belastbaarExceptioneel - vrijgesteld) * tarief);
  const vermindering = kindVerminderingExceptioneel(normaalBrutoJaarloon, bvBruto, kinderenTenLaste);
  const bvNetto = Math.max(0, round2(bvBruto - vermindering));
  return { tarief, bvBruto, vermindering, bvNetto };
}
```

**Toepassing:**
- `eindejaarspremie.ts` → in de Jaakie-gebruikersflow wordt een volledig gewerkt jaar verondersteld: bruto premie = 1 brutomaandloon; trek 13,07% RSZ af, daarna bijzondere BV met soort `andere_exceptionele_vergoeding`. De pure functie behoudt pro-rata parameters voor juridische/testdekking, maar die zijn geen UI-invoer meer.
- `jaarpremie.ts` → sectorale PC 200-jaarpremie: trek 13,07% RSZ af; daarna bijzondere BV met soort `andere_exceptionele_vergoeding`.
- Dubbel vakantiegeld → bruto = `92% × brutomaandloon`, RSZ = `13,07% × (85/92 × dubbel vakantiegeld)`, daarna bijzondere BV met soort `vakantiegeld`.
- Ad-hoc bonus → profielinput als maand- of jaarbedrag; Jaakie rekent altijd om naar een eenmalige jaarbonus. Op die jaarbonus wordt eerst 13,07% werknemers-RSZ ingehouden, daarna bijzondere BV met soort `andere_exceptionele_vergoeding`. De bonus wijzigt het gewone maandnetto, de gewone maand-BV, werkbonus, BBSZ en netto→bruto niet.

**Datapunt:** `bv_bijzondere_schaal_eindejaar_2026` met `tabel_refertejaarloon_naar_tarief`.

**Belangrijk:** voor de **normale maandelijkse BV** (op het reguliere maandloon) gebruikt de tool de **schijven-aanpak van §5.2** (AJ 2027). De **bijzondere BV** wordt **enkel** toegepast op variabel/exceptioneel inkomen.

### 5.5 BBSZ (scenario-inhouding)

```typescript
type BbszScenario =
  | "individuele_aanslag"
  | "gemeenschappelijke_aanslag_partner_met_beroepsinkomsten"
  | "gemeenschappelijke_aanslag_partner_zonder_beroepsinkomsten";

function bbsz(brutoMaand: number, scenario: BbszScenario): { kwartaal: number, maand: number } {
  // Tier-1 RSZ Administratieve instructies 2026/1.
  // qLoon = 3 × brutoMaand.
  // Kwartaalbedrag = vaste_kwartaalsom + percentage × (maandloon − drempel).
  // Maandbedrag (voorschot) = vaste_kwartaalsom/3 + percentage × (maandloon − drempel).
  // Let op: het percentage op maandloon blijft ongewijzigd; alleen het vaste deel wordt door 3 gedeeld.
  return { kwartaal: 0, maand: 0 };
}
```

**Datapunt:** `bv_bbsz_schijven_2026` (status `actief`, Tier 1). UI toont het afgeleide scenario en vermeldt dat BBSZ een voorschot is; de definitieve afrekening gebeurt via de PB-aangifte AJ 2027.

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
  // Elektrische wagens en plug-in hybrides krijgen een vast CO₂-percentage van 4%
  // (FOD Financiën — het minimumpercentage wordt toegepast omdat er geen
  // referentie-uitstootformule van toepassing is).
  let coef: number;
  if (brandstof === 'elektrisch') {
    coef = 4;
  } else {
    const refCO2 = brandstof === 'diesel' ? 58 : 70;
    coef = 5.5 + (co2 - refCO2) * 0.1;
    coef = Math.max(4, Math.min(18, coef));
  }
  // Jaarkader: ouderdomscoëfficiënt wordt op jaarbasis daggewogen bepaald
  // voor het volledige refertejaar, daarna gedeeld door 12 voor maandbasis.
  const leeftijdCoefJaar = gewogenLeeftijdsCoefVoorJaar(leeftijdMaanden);
  const vaaJaar = (cataloguswaarde * coef / 100) * leeftijdCoefJaar * (6 / 7);
  return round2(Math.max(1690, vaaJaar)); // min VAA 2026 = €1.690
}
```

**Implementatienoot (runtime):** voor de payroll-maandoutput gebruikt Jaakie het jaar-VAA en deelt dit door 12. De leeftijdscoëfficiënt wordt in dat jaar daggewogen over de maandschijven bepaald, zodat overgangen binnen hetzelfde jaar (bv. dieselwagen die van 88% naar 82% schuift) correct in het jaarbedrag landen.

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

- **BV via FOD Bijlage III:** Datapunt `bv_2026_kb_bijlage_iii` is de primaire bron voor de lokale BV-berekening. De technische toelichting dat Tax-Calc enkel een latere PB-ramingscheck is, blijft beschikbaar in code/auditcontext en wordt niet als vaste tekst in het netto-paneel getoond.
- **BBSZ:** Datapunt `bv_bbsz_schijven_2026`; scenario verplicht in runtime. UI toont gekozen scenario en voorschot-disclaimer.

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
│ − BV vóór verminderingen (Schaal II, sleutelformule) − € 1.245,00│  [FOD Bijlage III]
│ − BV-vermindering 2 kinderen ten laste                 − € 138,00│  [audit ▾]
│ − Fiscale werkbonus (33,14 % × € 0)                    − €   0,00│  [audit ▾]
│ = Netto BV                                             − € 1.107,00│
├──────────────────────────────────────────────────────────────────┤
│ − BBSZ (gekozen scenario, kwartaal ÷ 3)              − €    0–61│  [audit ▾]
├──────────────────────────────────────────────────────────────────┤
│ NETTO MAANDLOON (indicatief)                           € 1.935,55│
│ Aanvullende gemeentebelasting (7,3 % default)        — informatief│
└──────────────────────────────────────────────────────────────────┘
[ Open audit-rapport (PDF) ]    [ FOD Bijlage III-bron ↗ ]
```

**Footer-banner verplicht:**
> *Dataset versie 2026-05-24 — laatste verificatie per Datapunt zichtbaar in audit-paneel. Netto is indicatief; BV-eindafrekening via personenbelasting AJ 2027.*

---

## 8. Foutgedrag & edge cases

| Situatie | Tool-gedrag |
|---|---|
| Datapunt `bv_2026_kb_bijlage_iii` heeft `status = niet_gevonden` | UI toont foutbanner; BV mag niet zonder FOD Bijlage III-bron worden berekend |
| `referentiedatum < 2026-04-01` | Werkbonus-formule gebruikt 1/1/2026-cijfers + gele banner "Werkbonus-grenzen wijzigen op 1/4/2026" |
| `gezinscategorie = gehuwd_partner_zonder_inkomen` AND `niet_inwoner = true` | Hard error: "Niet-inwoner kan geen Schaal II selecteren" |
| `kinderen_gehandicapt > kinderen_ten_laste` | Hard error met UI-validatie |
| `vaa_bedrijfswagen_eur_jaar < 1690` | Auto-correctie naar 1690 + info-icoon "Minimum VAA 2026 = €1.690" |
| Netto < 0 | UI toont "Netto onder 0 — controleer input + VAA-bedragen" rode banner |
| BBSZ-scenario | Geen aparte gebruikerskeuze; Jaakie leidt het scenario af uit `gezinstype` en toont de inhouding in het nettoresultaat |

---

## 9. Gouden testcases (NTC-01..NTC-15)

> Testbestand: `src/lib/__tests__/netto.test.ts`. Run via `bun test`.

| # | Profiel | Bruto | Verwacht netto (raming) | Cross-check |
|---|---|---|---|---|
| **NTC-01** | Schaal I, Cat A, 5 jr ervaring, alleenstaande, 0 kinderen, geen VAA | € 2.276,51 | ≈ € 1.890 | FOD Fin BV-simulator |
| **NTC-02** | Schaal I, Cat C, 10 jr, alleenstaande, 1 kind | € 2.800,00 | ≈ € 2.220 | idem |
| **NTC-03** | Schaal II, Cat B, 8 jr, eenverdiener, 2 kinderen | € 3.000,00 | ≈ € 2.460 | idem |
| **NTC-04** | Schaal I, Cat A, 0 jr, alleenstaande (= GGMMI-buurt) | € 2.189,81 | ≈ € 1.870 (hoge werkbonus) | RSZ Find My Bonus |
| **NTC-05** | Schaal I, Cat B, 5 jr, alleenstaande, +bedrijfswagen € 1.690 min-VAA | € 2.500,00 | ≈ € 1.880 | FOD Bijlage III |
| **NTC-06** | Schaal I, Cat D, 15 jr, eenverdiener, 3 kinderen | € 3.800,00 | ≈ € 3.060 | FOD Fin BV-simulator |
| **NTC-07** | Schaal II, Cat A, 3 jr, eenverdiener, 0 kinderen | € 2.450,00 | ≈ € 2.020 | idem |
| **NTC-08** | Niet-inwoner, Schaal III, Cat C, 10 jr | € 3.200,00 | ≈ € 2.480 | idem |
| **NTC-09** | Schaal I, Cat A, 5 jr, alleenstaande met 1 kind (fiscaal alleenstaande) | € 2.500,00 | ≈ € 2.080 (extra €52) | FOD Bijlage III |
| **NTC-10** | Schaal I, Cat C, 12 jr, alleenstaande, +groepsverzekering eigen bijdrage € 100/m | € 3.100,00 | ≈ € 2.510 | idem |
| **NTC-11** | Werkbonus-test: bruto €2.255,50 (Luik B grens) → max werkbonus | € 2.255,50 | werkbonus = €293,66 (A+B) | RSZ Find My Bonus |
| **NTC-12** | Werkbonus-test: bruto €3.336,98 (Luik A wegval) | € 3.336,98 | werkbonus = €0 | idem |
| **NTC-13** | Werkbonus-test: bruto €2.880,32 (Luik A grens, Luik B wegval) | € 2.880,32 | werkbonus_A = €125,04, _B = €0 | idem |
| **NTC-14** | Eindejaarspremie 1 maandloon — bijzondere BV-schaal | € 3.000 (premie) | ≈ € 2.310 (na 23 % BV) | Acerta tool |
| **NTC-15** | Dubbel vakantiegeld 92 % maandloon — RSZ 85/92 + bijzondere BV-schaal | € 2.760 (= 92 % × 3000) | ≈ € 1.398 | Acerta tool |

**Acceptatiecriteria:**
- Alle 15 NTC-cases groen in `bun test`
- BV-uitkomsten volgen FOD Financiën / Bijlage III 2026 voor de representatieve cases
- Indien afwijking > €2: documenteren in `pc200_payroll_dataset_2026_VERIFICATIE.md` met root-cause

---

## 10. Cross-check tegen FOD Bijlage III

> **Verplichte validatieprocedure** voor de eigen sleutelformule:

1. **Selecteer representatieve test-profielen** (mix Schaal I/II, met/zonder kinderen, lage tot middenlonen, met/zonder VAA).
2. **Leid elk profiel af** uit FOD Financiën / Bijlage III 2026 en noteer BV-uitkomst.
3. **Vergelijk** met de eigen `bvBijlageIII2026()`-uitkomst.
4. **Acceptatie:** afwijking ≤ €5/maand voor alle 30 corpuscases. Afwijkingen: documenteren met root-cause.
5. **Ankerwaarden documenteren** in `src/lib/__tests__/netto.test.ts` als `expect(bv).toBeCloseTo(verwacht, 2)`.

**Onderhoud:** elke jaarlijkse BV-coëfficiënten-update (eind december) → corpus opnieuw valideren via `knowledgebase/tools/validate_bijlage_iii_corpus.py`. Elke `afwijking` is release-blocker tot root-cause bekend is.

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
bv_bbsz_schijven_2026                      → scenario-inhouding, status actief Tier 1
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

## 11. Omgekeerde berekening — Netto → Bruto

### 11.1 Doel en werking

Sinds 2026-05-19 ondersteunt Jaakie ook een **omgekeerde berekening**: de gebruiker voert een gewenst nettoloon in, en het systeem zoekt het bruto dat daar toe leidt. Dit gebeurt via een **numerieke inverse (binary search)** op de bestaande forward-functie `berekenNetto()`, zodat 100 % van de bestaande regelgeving, audit-trail en FOD Bijlage III-validatie automatisch wordt geërfd.

### 11.2 Wiskundige basis

De forward-functie `f(bruto) = netto` is **continu en strikt monotoon stijgend** voor alle realistische profielen:

- Effectieve RSZ stijgt altijd als bruto stijgt (werkbonus-afbouw compenseert nooit volledig).
- BV stijgt monotoon door progressieve PB-schijven.
- BBSZ is niet-dalend.
- De marginale netto-toename is altijd positief (minstens ~€0,16 per €1 bruto-verhoging).

Daarom convergeert binary search gegarandeerd naar een unieke oplossing.

### 11.3 Algoritme

```
lowerBound = doelNetto (centen)
upperBound = doelNetto × 2,5 (centen) — dynamisch opschaalbaar
tolerantie = 1 cent (0,01 EUR)
maxIteraties = 80
```

De zoekruimte wordt in **hele centen** beheerd om floating-point-stagnatie te voorkomen. Bij elke iteratie wordt de volledige forward-keten (mobiliteit + VAA + `berekenNetto`) doorlopen.

### 11.4 Implementatie

| Module | Functie |
|---|---|
| `src/lib/nettoNaarBruto.ts` | `zoekBrutoVoorNetto(input)` — pure functie, geen React |
| `src/lib/__tests__/nettoNaarBruto.test.ts` | 25 inverse golden tests (round-trip, gezinstypes, BV-grenzen, werkbonus-cliffs, audit-trail) |
| `src/data/pc200_payroll_dataset_2026.json` | 2 virtuele datapunten: `berekeningsmethode_netto_naar_bruto` en `netto_naar_bruto_tolerantie_eur` |

### 11.5 UI-gedrag

- **Toggle** bovenaan het formulier: "Bruto → Netto" / "Netto → Bruto".
- Bij omschakelen naar netto→bruto: het laatst berekende netto wordt overgenomen als default `doelNettoloon`.
- In netto→bruto modus:
  - **Gewenst nettoloon** = bewerkbaar invoerveld.
  - **Berekend bruto** = read-only, geüpdatet door `useEffect` root-finder.
  - Alle overige profielvelden (gezinstype, kinderen, mobiliteit, werkgeversbijdragen) blijven identiek.
- De resultatenpanels tonen de **volledige forward-keten** op basis van het gevonden bruto.
- De barema-check vergelijkt voltijds met voltijds: PC 200-barema's zijn voltijdse maandlonen. Bij deeltijdse tewerkstelling blijft het ingegeven bruto het werkelijke deeltijdse maandloon voor netto/RSZ/BV/werkgeverskost, maar de minimumcontrole rekent dit loon om naar een voltijds equivalent (`bruto / tewerkstellingsbreuk`) en toont daarnaast het pro-rata minimum.

### 11.6 Scope-beperkingen (Fase 1)

- Netto → bruto is **alleen voor bedienden** (fase 2 breidt uit naar studenten).
- Bij onrealistisch hoge doel-netto's (fysiek onmogelijk gegeven het profiel) toont het systeem een foutbanner.
- De mobiliteit wordt berekend op basis van het huidige bruto; bij grote verschuivingen kan een tweede convergentiestap nodig zijn (de gebruiker ziet direct het nieuwe bruto en de bijbehorende resultaten).

### 11.7 Audit-trail

De inverse berekening draagt een eigen datapunt mee:
- `berekeningsmethode_netto_naar_bruto` — methodologie: binary search
- `netto_naar_bruto_tolerantie_eur` — 0,005 EUR (interne parameter)

Alle onderliggende datapunten (RSZ, werkbonus, BV, BBSZ) blijven onveranderd; de inverse is louter een **wrapper** zonder eigen regelgeving.

---

*Versie 2026-05-19. Sluit aan op `sources_guideline.md`, `dataset_uitbreiding_voorstel.md`, `gaps_en_pending.md`, `implementation_roadmap.md`. Te onderhouden volgens `_DEVELOPER.md` §8.2.*
