# Datamodel & bronnen — PC 200 Loonmotor

**Versie:** 2026-05-11
**Schema:** `src/data/pc200_payroll_dataset.schema.json` (JSON Schema Draft-07)
**Dataset:** `src/data/pc200_payroll_dataset_2026.json`

---

## 1. Datapunt-record

Elke parameter in de dataset is een `Datapunt`-object met de volgende velden:

```typescript
interface Datapunt {
  id: string;                          // uniek, bv. "rsz_werknemer_basis"
  categorie: "lonen" | "rsz" | "fiscaliteit" | "premies_en_voordelen" | "arbeidsvoorwaarden";
  subcategorie: string;
  type: "barema" | "parameter" | "cao" | "koninklijk_besluit" | "bronverwijzing";
  pc: "200";
  omschrijving: string;

  // Waarde (kies de juiste vorm)
  waarde_bron?: string;                // letterlijk uit de bron (NIET voor berekening)
  waarde_genormaliseerd?: number;      // gestandaardiseerd voor berekening
  tabel_per_ervaring?: Array<{ ervaring_jaren: number; maandloon_eur: number }>;
  tabel_per_leeftijd?: Array<{ leeftijd_jaren: number; maandloon_eur: number }>;

  // Context
  eenheid: string;
  valuta: "EUR" | null;
  frequentie: "eenmalig" | "maandelijks" | "jaarlijks" | "per_prestatie" | "wekelijks" | "kwartaal" | null;
  berekeningsbasis?: string;
  toepassingsgebied: string[];
  voorwaarden: string[];
  uitsluitingen: string[];

  // Geldigheid
  geldig_vanaf?: string | null;        // "YYYY-MM-DD"
  geldig_tot?: string | null;
  laatst_bevestigd_op: string;

  // Bron
  bron_organisatie: string;
  bron_type: "overheid" | "sector" | "sociaal_secretariaat" | "vakbond" | "werkgeversorganisatie" | "expert_intermediair";
  bron_titel: string;
  bron_url: string;
  bron_publicatiedatum?: string | null;
  bron_vindplaats?: string;
  bron_fragment?: string;              // letterlijk citaat ≤ 200 karakters
  betrouwbaarheid: "Tier 1" | "Tier 2" | "Tier 3" | null;
  extractie_methode: "letterlijk" | "tabel_extractie" | "bronverwijzing" | "gestructureerde_overname" | null;

  // Triangulatie (verplicht voor Tier 3)
  triangulatie_bronnen?: Array<{
    bron: string;
    url?: string;
    tier: "Tier 1" | "Tier 2" | "Tier 3";
    overeenstemming?: "100%" | "verwijzing geverifieerd" | "gedeeltelijk";
  }>;

  // Normalisatie + status
  normalisatie_toegepast: boolean;
  normalisatie_opmerking?: string;
  status: "actief" | "mogelijk_verouderd" | "conflict" | "niet_gevonden" | "gemarkeerd_voor_review";
  conflict_opmerking?: string;
  opmerkingen?: string[];
}
```

---

## 2. Statussen

| Status | Betekenis | UI-gedrag | Lookup-gedrag |
|---|---|---|---|
| `actief` | Geverifieerd op peildatum | ✓ groen | Waarde gebruikt |
| `mogelijk_verouderd` | Vroeger geverifieerd, mogelijk niet meer actueel | ⚠️ geel | Throw `DatapuntNietBruikbaar` tenzij `toelatenMogelijkVerouderd: true` |
| `conflict` | Actief bronconflict tussen Tier-2-bronnen zonder Tier-1-uitsluitsel | ❌ rood | Throw `DatapuntNietBruikbaar` |
| `niet_gevonden` | Geen bron op peildatum | 🔘 grijs | Throw `DatapuntNietBruikbaar` |
| `gemarkeerd_voor_review` | Vereist menselijke review | ⚠️ blauw | Throw `DatapuntNietBruikbaar` |

---

## 3. Bronnenhiërarchie (3-tier)

| Tier | Organisaties | Alleenstaand bruikbaar? | Triangulatie verplicht? |
|---|---|---|---|
| **Tier 1** | RSZ, FOD Financiën, FOD WASO, sfonds200.be, Belgisch Staatsblad / Justel, NAR (cao) | ✅ Ja | n.v.t. |
| **Tier 2** | SSN, Securex, Partena, SD Worx, Acerta, Liantis, Attentia, CLB Group, Group S, Wolters Kluwer, Practicali, BDO, Tiberghien, KPMG, Deloitte, EY, PwC | ✅ Ja, mits geen Tier-1-tegenstrijdigheid | Bij conflict tussen 2 Tier-2 |
| **Tier 3** | Vakbonden (ACV, ACLVB, ABVV), Loonberekening.be, NettoCalc.be, Jobat, Wikipedia | ❌ Nooit alleenstaand | **Verplicht** ≥ 1 Tier-1 of ≥ 2 Tier-2-triangulatie |

**CI-implicatie:** Een Tier-3 datapunt zonder geldige `triangulatie_bronnen[]` mag in CI als **rood** worden gemarkeerd.

Voor detailregels per bouwsteen, zie `10_bronnen_guideline.md`.

---

## 4. Lookups (TypeScript)

### `src/lib/dataset.ts`

```typescript
import { dataset } from "@/data/...";
import type { Datapunt } from "@/types/dataset";

export function getDatapunt(id: string): Datapunt | null;
export function indexById(ds?: Dataset): Record<string, Datapunt>;
```

### `src/lib/periode.ts`

```typescript
export function safeGetValue(
  datapuntId: string,
  opts: {
    refDatum: string;                    // "YYYY-MM-DD"
    toelatenMogelijkVerouderd?: boolean;
  }
): { datapunt: Datapunt; waarde: number | null; waarschuwing: string | null };
```

**Garanties:**
- Throws `DatapuntOnbekend` als id niet bestaat
- Throws `DatapuntNietBruikbaar` voor status `niet_gevonden`, `conflict`, `gemarkeerd_voor_review`, of `mogelijk_verouderd` zonder expliciete toelating
- Throws `DatapuntNietGeldigOpDatum` als `refDatum` buiten `geldig_vanaf` / `geldig_tot` valt
- Voor `mogelijk_verouderd` met toelating: retourneert `waarschuwing` zodat UI een banner kan tonen

### `src/lib/baremas.ts`

```typescript
export function lookupBarema(
  schaal: "I" | "II",
  cat: "A" | "B" | "C" | "D",
  ervaringJaren: number
): { maandloonEUR: number; effectieveErvaring: number; geclampt: boolean; datapunt: Datapunt };

export function lookupStudentenbarema(
  cat: "A" | "B" | "C" | "D",
  leeftijdJaren: number
): { maandloonEUR: number; datapunt: Datapunt };

export function brutolocheck(
  schaal: "I" | "II",
  cat: "A" | "B" | "C" | "D",
  ervaringJaren: number,
  brutoloon: number
): { ok: boolean; sectoraalMinimum: number; verschil: number; datapuntId: string };
```

---

## 5. Fout-hiërarchie (`src/lib/errors.ts`)

```
PC200DatasetError
├── DatapuntOnbekend           — ID niet in dataset
├── DatapuntNietBruikbaar      — status blokkeert gebruik
├── DatapuntNietGeldigOpDatum  — buiten geldigheidsperiode
└── BaremaBuitenSchaalError    — lookup buiten gedefinieerde schaal
```

UI-componenten gebruiken `instanceof` om de juiste foutmelding te tonen.

---

## 6. Audit-trail invariant

> **Elke berekende waarde moet kunnen verwijzen naar minstens één `Datapunt` met `bron_url`.**

Calculation-functies retourneren altijd het bron-`Datapunt`-object zodat de UI-component `<AuditPanel>` het kan renderen met:
- Datapunt-id
- `status`-icoon
- `betrouwbaarheid`-tier
- `bron_organisatie` + `bron_url` (klikbaar)
- `bron_fragment` (uitklapbaar)
- Eventuele `triangulatie_bronnen`

**Verbod:** geen gefabriceerde datapunt-id's, geen runtime-arithmetic op `waarde_bron`, geen ad-hoc bedragen die niet in een Datapunt staan.

---

## 7. Categorieën in de dataset

| Categorie | Beschrijving | Voorbeelden |
|---|---|---|
| `lonen` | Sectorale baremas | Schaal I/II × Cat A/B/C/D, studentenbarema |
| `rsz` | RSZ-bijdragen | `rsz_werknemer_basis`, `rsz_werkgever_profit_basis`, `rsz_pc200_sociaal_fonds_200_*` |
| `fiscaliteit` | PB-schijven, belastingvrije som, forfait, werkbonus, BV-verminderingen | `pb_schijven_aj2027`, `belastingvrije_som_aj2027`, `werkbonus_*` |
| `premies_en_voordelen` | Sectorale CAO-premies en -voordelen | `pc200_eindejaarspremie`, `pc200_ecocheques_*`, `pc200_woonwerk_trein_*` |
| `arbeidsvoorwaarden` | Verlof, arbeidsduur, overuren | `pc200_arbeidsduur`, `pc200_klein_verlet_*` |

Voor een volledige inventaris van alle datapunten, zie `DATASET_REFERENCE.md`.

### 7b. Bekende OCR-correcties

In de bron-PDF's van de PC 200-baremas zijn twee scangevallen verkeerd ingelezen. De dataset bevat de gecorrigeerde waardes; controleer bij toekomstige bron-updates of de letterlijke `waarde_bron` matches met de gecorrigeerde `waarde_genormaliseerd`:

| Datapunt | OCR-bron (fout) | Gecorrigeerd (juist) |
|---|---|---|
| Schaal I, Cat D, jaar 2 | `"2.303,07"` | **€ 2.589,26** |
| Schaal II, Cat A, jaar 13 | `"2.4.46,31"` | **€ 2.446,31** |

Beide correcties zijn vastgelegd in golden tests TC-04 en TC-05.

---

## 8. Periode-filtering

```typescript
function isGeldigOp(dp: Datapunt, refDatum: string): boolean {
  if (dp.status !== "actief") return false;
  if (dp.geldig_vanaf && dp.geldig_vanaf > refDatum) return false;
  if (dp.geldig_tot && dp.geldig_tot < refDatum) return false;
  return true;
}
```

**Voorbeeld:** `pc200_fietsvergoeding_2026` heeft `geldig_vanaf: "2026-10-01"`. Voor `refDatum = "2026-09-15"` werpt `safeGetValue` een `DatapuntNietGeldigOpDatum`.

---

## 9. Onderhoud van de dataset

Volledig onderhoudsritme: zie `08_gaps_en_pending.md` §6 + `10_bronnen_guideline.md` §6.

| Cyclus | Wat |
|---|---|
| Maandelijks | BS-scan voor nieuwe KB's met fiscale of sociale impact |
| Per kwartaal | Tier-2-nieuwsalerts (Liantis / Securex / Partena / Acerta) |
| 2× per jaar (1/4 + 1/1) | GGMMI- en werkbonus-actualisatie |
| Jaarlijks januari | PB-schijven, belastingvrije som, kostenforfait, VAA-bedragen |
| Per PC 200-akkoord | Cao-tekst lezen en parameter-deltas verwerken |

---

## Bijlage — Mapping naar oude documenten

Deze SSOT vervangt:
- `ProjectFiles/pc200_payroll_dataset_2026_CORE.md` → §1, §2, §3, §6, §7
- `ProjectFiles/pc200_payroll_dataset_2026_DEVELOPER.md` → §4, §5, §8
- `ProjectFiles-CopilotCowork/sources_guideline.md` (deels) → §3 (overige delen in `10_bronnen_guideline.md`)
