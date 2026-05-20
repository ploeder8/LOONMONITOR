# Werkgeverskost-datapunten — schema-uitbreiding loonmotor

**Doel:** definieer de `Datapunt`-records die aan de bestaande loonmotor-dataset moeten toegevoegd worden om het werkgeverskost-luik te ondersteunen. Iedere regel volgt de schema-conventies van het bestaande `dataset_uitbreiding_voorstel.md`.

**Peildatum:** 9 mei 2026.

---

## Schema-recap

```typescript
type Datapunt = {
  id: string;                       // bv. "rsz_werkgever_basis_2026"
  categorie: string;                // bv. "werkgevers_rsz"
  label: { nl: string; fr: string };
  beschrijving: { nl: string; fr: string };
  eenheid: "pct" | "eur" | "eur_per_jaar" | "eur_per_maand" | "eur_per_dag" | "eur_per_km";
  waarde_bron: number;              // bron-waarde, leesbaar zoals in primaire bron
  waarde_canoniek: number;          // genormaliseerde waarde voor calculator
  geldig_van: string;               // ISO-datum
  geldig_tot: string | null;
  bron_url: string;
  bron_titel: string;
  bron_tier: 1 | 2 | 3;
  status: "actief" | "pending" | "afgeschaft";
  betrouwbaarheid: number;          // 0.0 – 1.0
  audit_trail: AuditEntry[];
};

type AuditEntry = {
  datum: string;
  actie: "aangemaakt" | "geüpdatet" | "geverifieerd" | "gemarkeerd_pending";
  bron: string;
  notitie?: string;
};
```

---

## 1. Datapunten — werkgevers-RSZ

### 1.1 `rsz_werkgever_basis_2026`

```json
{
  "id": "rsz_werkgever_basis_2026",
  "categorie": "werkgevers_rsz",
  "label": {
    "nl": "Werkgeversbijdrage RSZ — basistarief profitsector",
    "fr": "Cotisation patronale ONSS — taux de base secteur privé"
  },
  "beschrijving": {
    "nl": "Werkgeversbijdrage sociale zekerheid voor bedienden in de profitsector, inclusief loonmatigingsbijdrage van 5,12%.",
    "fr": "Cotisation patronale sécurité sociale pour employés du secteur privé, y compris la cotisation de modération salariale de 5,12%."
  },
  "eenheid": "pct",
  "waarde_bron": 25.00,
  "waarde_canoniek": 0.25,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.rsz.fgov.be/nl/werkgevers/bijdragen",
  "bron_titel": "RSZ — bijdragen werkgevers privé sector",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.95,
  "audit_trail": [
    {
      "datum": "2026-05-09",
      "actie": "aangemaakt",
      "bron": "RSZ-instructies werkgevers — versie Q1 2026",
      "notitie": "25% = 19,88% basis-RSZ + 5,12% loonmatigingsbijdrage"
    }
  ]
}
```

### 1.2 `rsz_werkgever_basis_kale_2026`

```json
{
  "id": "rsz_werkgever_basis_kale_2026",
  "categorie": "werkgevers_rsz",
  "label": { "nl": "Werkgevers-RSZ — basisbijdrage zonder loonmatiging", "fr": "Cotisation patronale ONSS de base hors modération salariale" },
  "beschrijving": { "nl": "Werkgeversbijdrage sociale zekerheid zonder de loonmatigingsbijdrage.", "fr": "Cotisation patronale ONSS hors cotisation de modération salariale." },
  "eenheid": "pct",
  "waarde_bron": 19.88,
  "waarde_canoniek": 0.1988,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.rsz.fgov.be/nl/werkgevers/bijdragen",
  "bron_titel": "RSZ — bijdragen werkgevers",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.90,
  "audit_trail": [{ "datum": "2026-05-09", "actie": "aangemaakt", "bron": "RSZ-instructies Q1 2026" }]
}
```

### 1.3 `loonmatigingsbijdrage_2026`

```json
{
  "id": "loonmatigingsbijdrage_2026",
  "categorie": "werkgevers_rsz",
  "label": { "nl": "Loonmatigingsbijdrage", "fr": "Cotisation de modération salariale" },
  "beschrijving": { "nl": "Bijkomende werkgeversbijdrage berekend op brutoloon én op de basis-RSZ-werkgeversbijdrage.", "fr": "Cotisation patronale supplémentaire calculée sur la rémunération brute et sur la cotisation patronale ONSS de base." },
  "eenheid": "pct",
  "waarde_bron": 5.12,
  "waarde_canoniek": 0.0512,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.rsz.fgov.be/nl/werkgevers/bijdragen",
  "bron_titel": "RSZ — loonmatigingsbijdrage",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.90,
  "audit_trail": [{ "datum": "2026-05-09", "actie": "aangemaakt", "bron": "RSZ" }]
}
```

---

## 2. Sectorale werkgeversbijdrage PC 200

### 2.1 `sociaal_fonds_200_werkgever_2026`

```json
{
  "id": "sociaal_fonds_200_werkgever_2026",
  "categorie": "sectorale_bijdrage",
  "label": { "nl": "Werkgeversbijdrage Sociaal Fonds 200", "fr": "Cotisation patronale Fonds social CP 200" },
  "beschrijving": { "nl": "Bijdrage werkgever aan het Sociaal Fonds van het Aanvullend Paritair Comité 200, financiering eindejaarspremie en collectieve voorzieningen.", "fr": "Cotisation patronale au Fonds social de la Commission paritaire auxiliaire 200, finançant la prime de fin d'année et les dispositifs collectifs." },
  "eenheid": "pct",
  "waarde_bron": 0.23,
  "waarde_canoniek": 0.0023,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.sfonds200.be/nl/",
  "bron_titel": "Sociaal Fonds 200 — verloning 2026",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.85,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "sfonds200.be — snapshot 9/5/2026", "notitie": "Tarief te triangulieren met cao-tekst voor exacte kwartaal-bijdrage." }
  ]
}
```

---

## 3. Arbeidsongevallen-verzekering

### 3.1 `arbeidsongevallen_bedienden_bureau_2026`

```json
{
  "id": "arbeidsongevallen_bedienden_bureau_2026",
  "categorie": "verplichte_verzekering",
  "label": { "nl": "Arbeidsongevallen-verzekering — bedienden bureau", "fr": "Assurance accidents du travail — employés bureau" },
  "beschrijving": { "nl": "Premie arbeidsongevallen-verzekering voor bedienden in een typische bureauomgeving (PC 200). Tarief is verzekeraar- en risico-afhankelijk; 0,3% is een sectorbenadering.", "fr": "Prime assurance accidents du travail pour employés en environnement de bureau (CP 200). Le taux varie par assureur et risque; 0,3% est une approximation sectorielle." },
  "eenheid": "pct",
  "waarde_bron": 0.30,
  "waarde_canoniek": 0.003,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.fedris.be/",
  "bron_titel": "Fedris — arbeidsongevallen werkgevers",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.65,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "Fedris + verzekeraar-benchmarks", "notitie": "Cliënt-specifiek tarief kan afwijken; standaardwaarde voor monitor-output." }
  ]
}
```

---

## 4. Provisies

### 4.1 `provisie_eindejaarspremie_pct_2026`

```json
{
  "id": "provisie_eindejaarspremie_pct_2026",
  "categorie": "loonprovisie",
  "label": { "nl": "Provisie eindejaarspremie (13e maand)", "fr": "Provision prime de fin d'année (13e mois)" },
  "beschrijving": { "nl": "Maandelijkse provisie voor de uitbetaling van de 13e maand in december — 1/12e van het brutomaandloon.", "fr": "Provision mensuelle pour le versement du 13e mois en décembre — 1/12e du salaire brut mensuel." },
  "eenheid": "pct",
  "waarde_bron": 8.33,
  "waarde_canoniek": 0.0833,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.sfonds200.be/nl/",
  "bron_titel": "Sociaal Fonds 200 — eindejaarspremie cao 18/12/2025 + 15/1/2026",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.85,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "Cao PC 200 18/12/2025 + lichte herziening 15/1/2026", "notitie": "Anciënniteit 5→3 jaar vanaf 2026; volledige formule afhankelijk van anciënniteit en gewerkte dagen." }
  ]
}
```

### 4.2 `provisie_dubbel_vakantiegeld_pct_2026` — DEPRECATED

> **Status:** vervangen door runtime-berekening obv `vakantiegeld_dubbel_pct_2026`.
> De waarde 6,67% was wiskundig inconsistent met 92%/12 = 7,67%.

```json
{
  "id": "provisie_dubbel_vakantiegeld_pct_2026",
  "categorie": "loonprovisie",
  "label": { "nl": "[DEPRECATED] Provisie dubbel vakantiegeld bedienden", "fr": "[DEPRECATED] Provision double pécule de vacances employés" },
  "beschrijving": { "nl": "Vervangen door runtime-berekening: (bruto + VAA) × 92% / 12.", "fr": "Remplacé par calcul runtime: (brut + AV) × 92% / 12." },
  "eenheid": "pct",
  "waarde_bron": 6.67,
  "waarde_canoniek": 0.0667,
  "geldig_van": "2026-01-01",
  "geldig_tot": "2026-12-31",
  "bron_url": "https://www.rva.be/",
  "bron_titel": "RVA — vakantiegeld bedienden",
  "bron_tier": 1,
  "status": "vervangen",
  "betrouwbaarheid": 0.80,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "RVA — vakantiewetgeving bedienden" },
    { "datum": "2026-05-20", "actie": "vervangen", "notitie": "Inconsistente waarde; provisie wordt nu runtime berekend obv 92%-percentage." }
  ]
}
```

### 4.3 `vakantiegeld_dubbel_pct_2026` (nieuw)

```json
{
  "id": "vakantiegeld_dubbel_pct_2026",
  "categorie": "premies_en_voordelen",
  "subcategorie": "vakantiegeld",
  "label": { "nl": "Percentage dubbel vakantiegeld bedienden", "fr": "Pourcentage double pécule de vacances employés" },
  "beschrijving": { "nl": "Percentage dubbel vakantiegeld ten opzichte van brutomaandloon incl. VAA. Gebruikt voor zowel jaarlijkse berekening als maandelijkse provisie (= 92% / 12).", "fr": "Pourcentage du double pécule de vacances par rapport au salaire brut mensuel incl. AV. Utilisé pour le calcul annuel et la provision mensuelle (= 92% / 12)." },
  "eenheid": "fractie",
  "waarde_bron": 0.92,
  "waarde_canoniek": 0.92,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/salary/particularcases/holidaypay.html",
  "bron_titel": "RSZ — vakantiegeld bedienden",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 1.0,
  "audit_trail": [
    { "datum": "2026-05-20", "actie": "aangemaakt", "bron": "RSZ administratieve instructies + RVA wetgeving" }
  ]
}
```

---

## 5. Structurele vermindering werkgever

### 5.1 `structurele_vermindering_helling_2026_april`

```json
{
  "id": "structurele_vermindering_helling_2026_april",
  "categorie": "rsz_vermindering_werkgever",
  "label": { "nl": "Structurele vermindering — hellingscoëfficiënt vanaf 1/4/2026", "fr": "Réduction structurelle — coefficient d'inclinaison à partir du 1/4/2026" },
  "beschrijving": { "nl": "Hellingscoëfficiënt voor de berekening van de structurele vermindering werkgevers-RSZ vanaf 1 april 2026, na verhoging GGMMI. Formule: vermindering = max(0, helling × (loongrens − kwartaalloon)).", "fr": "Coefficient d'inclinaison pour le calcul de la réduction structurelle ONSS patronale à partir du 1er avril 2026." },
  "eenheid": "pct",
  "waarde_bron": 0.1600,
  "waarde_canoniek": 0.1600,
  "geldig_van": "2026-04-01",
  "geldig_tot": null,
  "bron_url": "https://www.ejustice.just.fgov.be/",
  "bron_titel": "KB 2 juli 2025 (BS 15 juli 2025) — wijziging KB 16 mei 2003 structurele vermindering",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.85,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "KB 2/7/2025, BS 15/7/2025", "notitie": "Was 0,1500 vóór GGMMI-verhoging." }
  ]
}
```

---

## 6. Extra voordelen — configureerbare bedragen

### 6.1 `maaltijdcheque_max_werkgeverdeel_2026`

```json
{
  "id": "maaltijdcheque_max_werkgeverdeel_2026",
  "categorie": "extralegaal_voordeel",
  "label": { "nl": "Maaltijdcheque — maximum werkgeverdeel", "fr": "Chèque-repas — part patronale maximum" },
  "beschrijving": { "nl": "Maximaal werkgeverdeel per maaltijdcheque dat fiscaal en sociaal vrijgesteld is.", "fr": "Part patronale maximum par chèque-repas exonérée fiscalement et socialement." },
  "eenheid": "eur_per_dag",
  "waarde_bron": 6.91,
  "waarde_canoniek": 6.91,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://financien.belgium.be/",
  "bron_titel": "FOD Financiën — fiscale vrijstelling maaltijdcheques",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.85,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "KB indexering maaltijdcheques 2026" }
  ]
}
```

### 6.2 `eco_cheque_max_2026`

```json
{
  "id": "eco_cheque_max_2026",
  "categorie": "extralegaal_voordeel",
  "label": { "nl": "ECO-cheques — maximum per jaar", "fr": "Chèques éco — montant maximum annuel" },
  "beschrijving": { "nl": "Maximaal bedrag aan ECO-cheques per werknemer per jaar dat fiscaal en sociaal vrijgesteld is.", "fr": "Montant maximum annuel de chèques éco par travailleur exonéré fiscalement et socialement." },
  "eenheid": "eur_per_jaar",
  "waarde_bron": 250.00,
  "waarde_canoniek": 250.00,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://werk.belgie.be/nl/themas/loon/eco-cheques",
  "bron_titel": "FOD Werkgelegenheid — ECO-cheques (cao 98 NAR)",
  "bron_tier": 1,
  "status": "actief",
  "betrouwbaarheid": 0.90,
  "audit_trail": [{ "datum": "2026-05-09", "actie": "aangemaakt", "bron": "Cao 98 NAR" }]
}
```

### 6.3 `fietsvergoeding_max_pc200_2026`

```json
{
  "id": "fietsvergoeding_max_pc200_2026",
  "categorie": "mobiliteit",
  "label": { "nl": "Fietsvergoeding PC 200 — fiscale max", "fr": "Indemnité vélo CP 200 — maximum fiscal" },
  "beschrijving": { "nl": "Maximaal vrijgestelde fietsvergoeding voor PC 200-bedienden inkomstenjaar 2026. Sectorale verhoging voorzien in cao 15/1/2026.", "fr": "Indemnité vélo maximale exonérée pour les employés CP 200 en 2026. Augmentation sectorielle prévue par CCT du 15/1/2026." },
  "eenheid": "eur_per_km",
  "waarde_bron": 0.37,
  "waarde_canoniek": 0.37,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027",
  "bron_titel": "Practicali — geïndexeerde bedragen AJ 2027",
  "bron_tier": 2,
  "status": "actief",
  "betrouwbaarheid": 0.85,
  "audit_trail": [
    { "datum": "2026-05-09", "actie": "aangemaakt", "bron": "Practicali (snapshot 05) + cao PC 200 15/1/2026 (verhoging te bevestigen)" }
  ]
}
```

```json
{
  "id": "fietsvergoeding_max_km_per_jaar_aj2027",
  "categorie": "mobiliteit",
  "label": { "nl": "Fietsvergoeding — maximum aantal vrijgestelde km/jaar", "fr": "Indemnité vélo — maximum km/an exonérés" },
  "beschrijving": { "nl": "Maximaal aantal kilometers per jaar waarvoor de fietsvergoeding fiscaal vrijgesteld is.", "fr": "Nombre maximum de kilomètres par an pour lesquels l'indemnité vélo est exonérée." },
  "eenheid": "eur",
  "waarde_bron": 3700,
  "waarde_canoniek": 3700,
  "geldig_van": "2026-01-01",
  "geldig_tot": null,
  "bron_url": "https://www.practicali.be/blog/geindexeerde-bedragen-aj-2027",
  "bron_titel": "Practicali — geïndexeerde bedragen AJ 2027",
  "bron_tier": 2,
  "status": "actief",
  "betrouwbaarheid": 0.90,
  "audit_trail": [{ "datum": "2026-05-09", "actie": "aangemaakt", "bron": "Practicali" }]
}
```

---

## 7. Pending datapunten (nog niet definitief)

| ID | Status | Reden | Acceptatiecriterium |
|---|---|---|---|
| `eindejaarspremie_formule_pc200_2026` | pending | Cao-tekst 18/12/2025 + 15/1/2026 nog te ontleden voor exacte formule (anciënniteit 5→3 jaar, gewerkte dagen, prorata) | Formule + 3 testcases (1j, 5j, 15j anciënniteit) |
| `tussenkomst_treinvervoer_pc200_2026` | pending | "Aangepast" in cao 15/1/2026 — exacte schaal nog te bevestigen | Tabel km-categorieën + werkgeverstussenkomst |
| `werkgeverstussenkomst_woonwerk_alle_modi_2026` | pending | Algemene cao woon-werkverkeer 2026 | Stand-by tot definitieve cao-tekst |
| `structurele_vermindering_loongrenzen_2026_april` | pending | KB 2/7/2025 noemt helling 0,1600 maar exacte loongrenzen per band te valideren | RSZ-instructies werkgevers Q2 2026 |

---

## 8. Integratie in bestaande dataset

De bovenstaande datapunten worden toegevoegd aan de bestaande `loonmotor_dataset.json` onder een nieuwe sectie:

```json
{
  "datapunten": {
    "fiscaal": { ... bestaande PB-schijven, vrije som, etc. ... },
    "rsz_werknemer": { ... },
    "werkbonus_sociaal": { ... },
    "werkbonus_fiscaal": { ... },
    "bbsz": { ... },
    "werkgeverskost": {
      "rsz_werkgever_basis_2026": { ... },
      "loonmatigingsbijdrage_2026": { ... },
      "sociaal_fonds_200_werkgever_2026": { ... },
      "arbeidsongevallen_bedienden_bureau_2026": { ... },
      "provisie_eindejaarspremie_pct_2026": { ... },
      "provisie_dubbel_vakantiegeld_pct_2026": { ... },
      "vakantiegeld_dubbel_pct_2026": { ... },
      "structurele_vermindering_helling_2026_april": { ... }
    },
    "extralegaal": {
      "maaltijdcheque_max_werkgeverdeel_2026": { ... },
      "eco_cheque_max_2026": { ... },
      "fietsvergoeding_max_pc200_2026": { ... },
      "fietsvergoeding_max_km_per_jaar_aj2027": { ... }
    }
  }
}
```

---

## 9. Validatie

Voor elke nieuwe datapunt:
- **Schema-validatie** via Zod / JSON-Schema in CI.
- **Betrouwbaarheid ≥ 0.65** vereist; lager = `pending`.
- **Audit-trail** verplicht voor elke wijziging.
- **Tier 1-bron** bij voorkeur; Tier 2 alleen als triangulatie tegen Tier 1 niet mogelijk.

Bij introductie van nieuwe parameters: testcase-impact-analyse — runt regressietest het 30-cases corpus binnen tolerantie?
