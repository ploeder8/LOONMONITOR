# Jaakie Loonfiche & Loonrun Uitvoeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jaakie uitbreiden van PC 200-loonkostcalculator naar een pro-forma loonfichetool en daarna naar een lichte loonrun/workflow voor meerdere werknemers.

**Architecture:** De bestaande berekeningsmodules blijven de enige rekenbron. Nieuwe loonfiche- en loonrunmodules mappen bestaande resultaten naar loonfiche- en workflowweergaves, zonder payrollformules te dupliceren. De payrollruntime blijft browser-only.

**Tech Stack:** TypeScript 5.6, React 19, Vite 8, Tailwind CSS v4, HashRouter, `bun:test`.

---

## Strategische Keuze

De eerstvolgende productstap is **diepte binnen PC 200**, niet meteen een extra paritair comité.

**Waarom:**

- Een extra PC geeft vooral bredere dekking, maar vereist nieuwe barema's, premies, sectorlogica en tests.
- Een loonfichemodus maakt de bestaande motor direct bruikbaarder voor payroll-experts en klantgesprekken.
- PC 330 en PC 124 zijn groot, maar complex: PC 330 door subsectoren/non-profitlogica, PC 124 door arbeiderslogica, 108%-basis, mobiliteit en weerverlet.
- De loonfichelaag is een presentatie- en workflowlaag bovenop bestaande berekeningen en is daardoor sneller veilig te leveren.

**Belangrijke grens:** fase 1-5 leveren geen officiële loonbrief, geen aangifte, geen betaling en geen sociaal-secretariaatvervanging. De output is een pro-forma controle- en adviesdocument.

---

## Fase 1 — Pro-Forma Loonfiche Voor Eén Werknemer

**Target**

- Nieuwe route/tab: `#/loonfiche`.
- Eén loonfiche per huidig `Profiel`.
- Output lijkt op een loonbrief, maar toont duidelijk: `Pro-forma loonfiche - geen officiële loonbrief`.
- Alle bedragen komen uit bestaande modules.

**Publieke interface**

- Nieuwe module: `src/lib/loonfiche.ts`.
- Nieuwe types:

```ts
export type LoonficheRegelType =
  | "bruto"
  | "rsz"
  | "belastbaar"
  | "bv"
  | "inhouding"
  | "netto"
  | "werkgever"
  | "informatief";

export type LoonficheTeken = "plus" | "min" | "neutraal";

export interface LoonficheRegel {
  code: string;
  label: string;
  type: LoonficheRegelType;
  bedrag: number;
  teken: LoonficheTeken;
  sortering: number;
  datapunten?: Datapunt[];
}

export interface LoonficheTotalen {
  brutoRszBasis: number;
  belastbaarVoorBV: number;
  nettoTeBetalen: number;
  nettoInclusiefMaaltijdcheques: number;
  werkgeverskostMaand: number;
}

export interface Loonfiche {
  periode: string;
  profielSnapshot: Profiel;
  regels: LoonficheRegel[];
  totalen: LoonficheTotalen;
  waarschuwingen: string[];
}
```

- Nieuwe bouwfunctie:

```ts
export function bouwLoonficheVoorProfiel(profiel: Profiel): Loonfiche
```

**Berekeningsbronnen**

`bouwLoonficheVoorProfiel` hergebruikt:

- `berekenNettoVoorProfiel`
- `berekenWerkgeverskostVoorProfiel`
- `berekenMobiliteitVoorProfiel`
- `berekenVaaWerkmiddelenVoorProfiel`
- `berekenJaaroverzichtVoorProfiel`
- `berekenMaaltijdchequeWaarde`

**Loonfichelijnen v1**

Neem minimaal deze regels op, met vaste codes en volgorde:

| Code | Label | Type | Bron |
|---|---|---|---|
| `1000` | Brutoloon | bruto | `NettoResultaat.brutoloon` |
| `1010` | VAA werkmiddelen | bruto | `VaaForfaitsWerkmiddelenResultaat` |
| `1090` | Totaal bruto RSZ-basis | belastbaar | `NettoResultaat.brutoRszBasis` |
| `2000` | RSZ werknemer | rsz | `NettoResultaat.rsz.werknemerBijdrage` |
| `2010` | Sociale werkbonus | rsz | `NettoResultaat.werkbonus.totaal` |
| `2090` | Loon na RSZ en werkbonus | belastbaar | `NettoResultaat.belastbaarMaandloon` |
| `2100` | VAA bedrijfswagen | belastbaar | `NettoResultaat.vaaBedrijfswagenPerMaand` |
| `2190` | Belastbaar loon voor BV | belastbaar | `NettoResultaat.belastbaarMaandloonVoorBV` |
| `3000` | Bedrijfsvoorheffing | bv | `NettoResultaat.bv.bvPerMaand` |
| `3010` | BV-vermindering kinderen | bv | `NettoResultaat.bv.verminderingKinderen` |
| `3020` | BV-vermindering fiscaal alleenstaande | bv | `NettoResultaat.bv.verminderingAlleenstaandeKind` |
| `3030` | BV-vermindering groepsverzekering | bv | `NettoResultaat.bv.verminderingGroepsverzekering` |
| `3040` | Fiscale werkbonus | bv | `NettoResultaat.fiscaleWerkbonus` |
| `3090` | BV na verminderingen | bv | `NettoResultaat.bv.bvNaVerminderingen` |
| `4000` | Bijzondere bijdrage sociale zekerheid | inhouding | `NettoResultaat.bbsz.maandelijksBedrag` |
| `4010` | Maaltijdcheques werknemersbijdrage | inhouding | `NettoResultaat.maaltijdchequeWerknemersbijdrage` |
| `4020` | Eigen bijdrage hospitalisatie | inhouding | `NettoResultaat.hospitalisatieEigenBijdrage` |
| `5000` | Woon-werkvergoeding | netto | `NettoResultaat.woonwerkVrijgesteldPerMaand` |
| `5010` | Onkostenvergoeding | netto | `NettoResultaat.onkostenvergoedingPerMaand` |
| `6000` | Terugname VAA | inhouding | VAA wagen + VAA werkmiddelen |
| `9000` | Netto te betalen | netto | `NettoResultaat.nettoloon` |
| `9010` | Netto inclusief maaltijdcheques | informatief | netto + totale maaltijdchequewaarde |
| `9500` | Werkgeverskost per maand | werkgever | `WerkgeverskostResultaat.totaleLoonkostBreed` |

Regels met bedrag `0` worden standaard niet getoond, behalve subtotaalregels `1090`, `2090`, `2190`, `3090`, `9000`, `9500`.

**UI**

- Maak `src/pages/LoonfichePage.tsx`.
- Voeg route toe in `src/App.tsx`: `/loonfiche`.
- Voeg nav-item toe: `Loonfiche`.
- De eerste versie mag eigen profielstate gebruiken op basis van `DEFAULTS`; gedeelde profielstate met de calculator is een latere verbetering.
- Toon bovenaan compacte inputsectie met dezelfde kernvelden als het profiel:
  - maand/jaar
  - brutoloon of doelnetto
  - gezinstype
  - kinderen
  - tewerkstellingsbreuk
  - arbeidsdagen
  - maaltijdcheques aan/uit
  - VAA bedrijfswagen/werkmiddelen via bestaande componenten waar praktisch

**Tests**

- Voeg `src/lib/__tests__/loonfiche.test.ts` toe.
- Test dat `bouwLoonficheVoorProfiel(DEFAULTS)`:
  - een regel `9000` heeft;
  - `totalen.nettoTeBetalen` gelijk is aan `berekenNettoVoorProfiel(...).nettoloon`;
  - een regel `9500` heeft;
  - `totalen.werkgeverskostMaand` gelijk is aan `berekenWerkgeverskostVoorProfiel(...).totaleLoonkostBreed`.
- Voeg een VAA-test toe:
  - bedrijfswagen actief;
  - regel `2100` bestaat;
  - regel `6000` bestaat;
  - beide bedragen zijn groter dan nul.
- Voeg een maaltijdcheque-test toe:
  - maaltijdcheques actief;
  - regel `4010` bestaat;
  - `9010` is groter dan `9000`.

**Acceptatiecriteria**

- `bun test src/lib/__tests__/loonfiche.test.ts` slaagt.
- `bun run typecheck` slaagt.
- `bun run build` slaagt.
- Loonfiche toont dezelfde netto- en werkgeverskosttotalen als de bestaande calculatorresultaten.

---

## Fase 2 — Loonfiche UX, Print En Audit

**Target**

- De loonfiche is bruikbaar in klantgesprekken.
- Browserprint werkt professioneel op A4.
- Audit blijft beschikbaar per loonfiche.

**Implementatie**

- Maak `src/pages/loonfiche/LoonficheDocument.tsx`.
- Maak `src/pages/loonfiche/LoonficheTabel.tsx`.
- Maak `src/pages/loonfiche/LoonfichePrintActions.tsx`.
- Layout:
  - Header: Jaakie, periode, pro-forma label.
  - Werknemerblok.
  - Werkgeverblok.
  - Prestatieblok.
  - Loonfichetabel.
  - Totalenblok.
  - Bronnenblok.
- Voeg optionele profielvelden toe:

```ts
werknemerNaam: string;
werknemerReferentie: string;
werkgeverNaam: string;
werkgeverOndernemingsnummer: string;
```

- Defaults:

```ts
werknemerNaam: "";
werknemerReferentie: "";
werkgeverNaam: "";
werkgeverOndernemingsnummer: "";
```

- Breid `src/lib/profielCsv.ts` uit zodat deze velden worden geexporteerd en geimporteerd.
- Oude CSV's blijven geldig: ontbrekende kolommen krijgen lege string.
- Voeg print CSS toe aan bestaande globale styling:
  - header/nav/footer/chat verbergen bij print;
  - loonfiche op A4-breedte;
  - tabellen niet horizontaal laten overlopen;
  - bronsectie mag naar volgende pagina.

**Acties in UI**

- Knop `Print loonfiche`.
- Knop `Toon bronnen` / `Verberg bronnen`.
- Geen PDF-library in deze fase; browserprint is voldoende.

**Tests**

- Breid `HomePage.test.tsx` of nieuw render-testbestand uit:
  - route/pagina rendert `Pro-forma loonfiche`;
  - printknop is aanwezig;
  - loonfichetabel bevat `Netto te betalen`.
- Breid CSV-tests uit:
  - nieuwe identificatievelden roundtrippen;
  - oude CSV zonder nieuwe velden blijft importeerbaar.

**Acceptatiecriteria**

- Browserprint geeft een nette startpagina zonder navigatie/chat.
- Lange bronlabels breken netjes af.
- `bun test`, `bun run typecheck` en `bun run build` slagen.

---

## Fase 3 — Loonrun Light Voor Meerdere Werknemers

**Target**

- Meerdere werknemers via CSV verwerken.
- Per werknemer een loonfiche openen.
- Maandtotalen tonen.

**Publieke interface**

- Nieuwe module: `src/lib/loonrun.ts`.
- Types:

```ts
export type LoonrunStatus = "concept" | "berekend" | "fout";

export interface LoonrunWerknemer {
  id: string;
  naam: string;
  profiel: Profiel;
  status: LoonrunStatus;
  loonfiche?: Loonfiche;
  fout?: string;
}

export interface LoonrunTotalen {
  bruto: number;
  netto: number;
  werkgeverskost: number;
  aantalBerekend: number;
  aantalFout: number;
}

export interface Loonrun {
  periode: string;
  werknemers: LoonrunWerknemer[];
  totalen: LoonrunTotalen;
}
```

- Bouwfunctie:

```ts
export function bouwLoonrun(werknemers: Array<Pick<LoonrunWerknemer, "id" | "naam" | "profiel">>): Loonrun
```

**Gedrag**

- Per werknemer `bouwLoonficheVoorProfiel` uitvoeren.
- Fouten isoleren per werknemer.
- Een foutieve werknemer blokkeert de run niet.
- Totalen tellen alleen werknemers met status `berekend`.

**UI**

- Nieuwe route/tab: `#/loonrun`.
- Nieuwe pagina: `src/pages/LoonrunPage.tsx`.
- Importveld voor multi-row CSV.
- Tabelkolommen:
  - werknemer
  - bruto
  - netto
  - werkgeverskost
  - status
  - actie `Bekijk loonfiche`
- Export overzicht naar CSV.

**Tests**

- `src/lib/__tests__/loonrun.test.ts`:
  - loonrun met 3 geldige werknemers heeft `aantalBerekend = 3`;
  - totalen zijn som van individuele loonfiches;
  - foutieve profielcase geeft status `fout` zonder andere werknemers te blokkeren.

**Acceptatiecriteria**

- Een loonrun met minstens 5 werknemers toont correcte maandtotalen.
- Een foutieve rij blijft zichtbaar met foutstatus.
- CSV-export bevat per werknemer bruto, netto, werkgeverskost, loonwig indien beschikbaar, en status.

---

## Fase 4 — Controleworkflow Voor Payroll-Expert

**Target**

- De tool ondersteunt een eenvoudige payrollcontroleflow: voorbereiden, controleren, vastzetten.
- Nog steeds geen aangifte of betaling.

**Interfacewijziging**

Breid loonrunstatus uit naar:

```ts
export type LoonrunStatus =
  | "concept"
  | "te_controleren"
  | "gecontroleerd"
  | "vastgezet"
  | "fout";
```

**Validaties**

Voeg `src/lib/loonrunValidatie.ts` toe met:

```ts
export type LoonrunMeldingNiveau = "info" | "waarschuwing" | "blokkering";

export interface LoonrunMelding {
  niveau: LoonrunMeldingNiveau;
  code: string;
  boodschap: string;
  werknemerId?: string;
}
```

Minimale meldingen:

- `BAREMA_ONDER_MINIMUM`: blokkering.
- `ARBEIDSDAGEN_NUL`: blokkering.
- `VAA_WAGEN_CATALOGUSWAARDE_NUL`: blokkering wanneer bedrijfswagen actief is.
- `MAALTIJDCHEQUES_ZONDER_DAGWAARDE`: waarschuwing.
- `AO_PERCENTAGE_HOOG`: waarschuwing bij arbeidsongevallenpercentage boven 1%.

**UI**

- Controlepaneel op `LoonrunPage`.
- Toon blokkeringen apart van waarschuwingen.
- Knop `Markeer als gecontroleerd`.
- Knop `Zet loonrun vast`.
- Vastzetten is alleen browserstate/export; geen backend-lock.

**Acceptatiecriteria**

- Een loonrun met blokkeringen kan niet naar `vastgezet`.
- Waarschuwingen blokkeren niet.
- Export bevat status en meldingen.

---

## Fase 5 — Jaar- En Cumulatievenweergave

**Target**

- Payroll-expert ziet maandresultaat in jaarcontext.
- Dit is een simulatieve cumulatievenweergave, geen officiële individuele rekening.

**Implementatie**

Breid `Loonfiche` uit:

```ts
export interface LoonficheCumulatieven {
  methode: "simulatief_maand_x_aantal_maanden";
  maandenTotEnMet: number;
  bruto: number;
  rszWerknemer: number;
  bedrijfsvoorheffing: number;
  bbsz: number;
  netto: number;
  werkgeverskost: number;
}
```

Gedrag:

- Zonder echte historiek: huidige maand x aantal maanden tot en met de gekozen maand.
- Label altijd: `Simulatieve cumulatieven`.
- Gebruik bestaande `JaaroverzichtResultaat` voor jaarbedragen waar passend.

**Acceptatiecriteria**

- Loonfiche toont maandtotalen en simulatieve cumulatieven apart.
- Geen tekst suggereert dat dit een officiële individuele rekening is.
- Jaaroverzicht blijft consistent met bestaande jaaroverzichtpanelen.

---

## Fase 6 — Strategisch Beslispunt: Extra PC Of Echte Aangifteketen

Na fase 1-5 kiezen we op basis van gebruik:

**Route A: Extra PC**

Voorkeursvolgorde:

1. Een bedienden-PC met maximaal hergebruik van de huidige motor, bijvoorbeeld PC 226 indien er concrete vraag is.
2. Retail-PC's zoals PC 201/202/311 bij klantvraag.
3. PC 330 pas na aparte subsectoranalyse.
4. PC 124 pas later, omdat arbeiderslogica fundamenteel anders is.

**Route B: Echte loonverwerking**

Nodig:

- backend met dataversionering;
- historische loonruns;
- officiële loonbrief/PDF;
- auditlogs;
- rollen/rechten;
- DmfA/Belcotax-voorbereiding;
- juridische review;
- parallel-run met sociaal secretariaat.

---

## Globale Test- En Acceptatiecheck

Per fase minimaal:

```bash
bun test
bun run typecheck
bun run build
```

Voor UI-fases aanvullend:

- desktopweergave controleren;
- mobiele breedte controleren;
- printweergave controleren zodra print CSS is toegevoegd.

Releasecriteria:

- Geen duplicate payrollformules in loonfiche- of loonrunlagen.
- Alle bedragen in loonfiche zijn herleidbaar tot bestaande berekeningsresultaten.
- Elke datasetafhankelijke regel behoudt auditdatapunten.
- `knowledgebase/12_toolfunctionaliteit.md` is bijgewerkt zodra routes, outputs of gedrag wijzigen.
- `MEMORY.md` krijgt per fase een korte logregel.

---

## Documentatie Updates Per Fase

**Fase 1**

- `knowledgebase/12_toolfunctionaliteit.md`: loonfichepagina, pro-forma status, grenzen.
- `MEMORY.md`: korte logregel.

**Fase 2**

- `knowledgebase/12_toolfunctionaliteit.md`: print/export en auditweergave.
- `README.md`: pagina-overzicht uitbreiden met loonfiche.

**Fase 3**

- `knowledgebase/12_toolfunctionaliteit.md`: loonrun light en multi-row CSV.
- `knowledgebase/08_gaps_en_pending.md`: loonrun light als actief of gedeeltelijk actief markeren.

**Fase 4-5**

- `knowledgebase/12_toolfunctionaliteit.md`: controleworkflow en cumulatieven.
- `knowledgebase/01_project_scope.md`: expliciet blijven vermelden dat officiële aangifte en betaling buiten scope blijven.

---

## Assumptions And Defaults

- Eerste target is pro-forma loonfiche, niet juridisch officiële loonbrief.
- Scope blijft PC 200 bedienden.
- Payrollberekeningen blijven browser-only.
- Geen backend, auth, betaling, DmfA, Belcotax of sociaal-secretariaat-integratie in fase 1-5.
- Bestaande berekeningsmodules blijven de single source of calculation truth.
- Nieuwe loonfichelogica is een mapping- en presentatielaag.
- Nieuwe loonrunlogica is een workflow- en aggregatielaag.
