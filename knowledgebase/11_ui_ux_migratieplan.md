# UI/UX Migratieplan — Master Document

Dit document bevat alle fasen van de UI/UX-migratie voor Jaakie. Elke fase wordt gemarkeerd met een status en bouwt voort op de vorige.

---

# ✅ Fase 1 — Direction Toggle + Hero Summary (DONE)

## Doel
Implementeer twee componenten in de bestaande `HomePage.tsx`:
1. **Direction Toggle** — bruto→netto / netto→bruto schakelaar
2. **Hero Summary** — 4 kaarten (Bruto, Netto, Werkgeverskost, Loonwig)

**NUL impact** op calculatie-logica. Enkel de `return()` JSX en CSS worden gewijzigd.

---

## Context: Huidige Code

### File: `src/pages/HomePage.tsx` (relevante delen)

De huidige `return()` ziet er zo uit (vereenvoudigd):

```tsx
return (
  <div className="min-h-screen bg-background font-body">
    <Header activeTab="Simulator" />
    <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
      {/* Linker Paneel - Input */}
      <aside className="lg:w-1/3 p-6 overflow-y-auto">
        <FormSection title="Profiel" icon={<Users />}>
          {/* Gezinstype, kinderen, gemeentebelasting, statuut */}
        </FormSection>
        <FormSection title="Werkgever" icon={<Building />}>
          {/* Maand, jaar, werkdagen, schaal, categorie, ervaring */}
        </FormSection>
        <FormSection title="Loon" icon={<Wallet />}>
          {/* Brutoloon input + barema check */}
        </FormSection>
        <FormSection title="Extra Toelagen" icon={<Gift />}>
          {/* Eindejaarspremie, ecocheques, woon-werk, bijdragen */}
        </FormSection>
        <AccordionSection title="Extra Looncomponenten">
          {/* Groepsverzekering, hospitalisatie, onkosten, maaltijdcheques, VAA */}
        </AccordionSection>
        <AccordionSection title="Woon-werk Verkeer">
          {/* Fiets, privewagen, bus, trein, bedrijfswagen */}
        </AccordionSection>
      </aside>

      {/* Rechter Paneel - Resultaten */}
      <main className="lg:w-2/3 p-6 space-y-6">
        {/* FOD Warning Banner */}\n        {/* SummaryBar (de huidige 3 kaarten) */}
        {/* ResultTabs: Maand, Jaaroverzicht, Loonbasis */}
      </main>
    </div>
  </div>
);
```

### Bestaande state (relevant)
```tsx
const [brutoNettoDirection, setBrutoNettoDirection] = useState<'bruto-netto' | 'netto-bruto'>('bruto-netto');
const [brutoLoon, setBrutoLoon] = useState<number>(2276.51);
```

### Bestaande berekende waarden (uit `useMemo`)
```tsx
const summary = useMemo(() => {
  // ... returns:
  // { nettoBedrag, kostBedrag, loonwigPercentage, ... }
}, [/* dependencies */]);
```

**Let op**: Er bestaat AL een `brutoNettoDirection` state. De toggle hoeft enkel de UI te tonen — de logica werkt al.

---

## Stap 1: CSS Custom Properties toevoegen

### File: `src/styles/brand.css` (bestaand — VOEG TOE aan het einde)

```css
/* ─── Fase 1: Hero & Toggle Tokens ─── */

:root {
  /* Hero Cards */
  --hero-bruto-bg: #FFFFFF;
  --hero-bruto-border: #E5EAF2;
  --hero-bruto-text: #131F37;
  
  --hero-netto-bg: #EFFFFA;
  --hero-netto-border: rgba(28, 210, 163, 0.2);
  --hero-netto-text: #10A982;
  
  --hero-kost-bg: #F3F6FA;
  --hero-kost-border: #E5EAF2;
  --hero-kost-text: #34425D;
  
  --hero-loonwig-bg: #FFF3EF;
  --hero-loonwig-border: #FFE0D6;
  --hero-loonwig-text: #D83A18;
  
  /* Toggle */
  --toggle-active-bg: #D83A18;
  --toggle-active-text: #FFFFFF;
  --toggle-inactive-bg: transparent;
  --toggle-inactive-text: #6B7280;
  --toggle-bg: #F3F6FA;
}
```

---

## Stap 2: DirectionToggle Component

### Nieuw bestand: `src/components/DirectionToggle.tsx`

```tsx
import { ArrowLeftRight } from "lucide-react";

interface DirectionToggleProps {
  value: "bruto-netto" | "netto-bruto";
  onChange: (dir: "bruto-netto" | "netto-bruto") => void;
}

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  return (
    <div className="flex justify-center mb-5">
      <div 
        className="inline-flex p-1 gap-0.5 rounded-full"
        style={{ background: "var(--toggle-bg)" }}
      >
        <button
          onClick={() => onChange("bruto-netto")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background: value === "bruto-netto" ? "var(--toggle-active-bg)" : "var(--toggle-inactive-bg)",
            color: value === "bruto-netto" ? "var(--toggle-active-text)" : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          <ArrowLeftRight size={16} />
          Bruto → Netto
        </button>
        <button
          onClick={() => onChange("netto-bruto")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background: value === "netto-bruto" ? "var(--toggle-active-bg)" : "var(--toggle-inactive-bg)",
            color: value === "netto-bruto" ? "var(--toggle-active-text)" : "var(--toggle-inactive-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          <ArrowLeftRight size={16} />
          Netto → Bruto
        </button>
      </div>
    </div>
  );
}
```

---

## Stap 3: HeroSummary Component

### Nieuw bestand: `src/components/HeroSummary.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

interface HeroSummaryProps {
  brutoloon: number;
  nettoloon: number;
  werkgeverskost: number;
  loonwig: number;
}

function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "", 
  decimals = 2 
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  decimals?: number;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplay(value);
      return;
    }
    hasAnimated.current = true;
    
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = value;
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = decimals === 0 
    ? Math.round(display).toString()
    : display.toLocaleString("nl-BE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

export function HeroSummary({ brutoloon, nettoloon, werkgeverskost, loonwig }: HeroSummaryProps) {
  const cards = [
    {
      label: "BRUTO",
      value: brutoloon,
      prefix: "€ ",
      decimals: 2,
      bg: "var(--hero-bruto-bg)",
      border: "var(--hero-bruto-border)",
      text: "var(--hero-bruto-text)",
      icon: null,
    },
    {
      label: "NETTO",
      value: nettoloon,
      prefix: "€ ",
      decimals: 2,
      bg: "var(--hero-netto-bg)",
      border: "var(--hero-netto-border)",
      text: "var(--hero-netto-text)",
      icon: null,
    },
    {
      label: "WERKGEVERSKOST",
      value: werkgeverskost,
      prefix: "€ ",
      decimals: 2,
      bg: "var(--hero-kost-bg)",
      border: "var(--hero-kost-border)",
      text: "var(--hero-kost-text)",
      icon: null,
    },
    {
      label: "LOONWIG",
      value: loonwig,
      prefix: "",
      suffix: "%",
      decimals: 1,
      bg: "var(--hero-loonwig-bg)",
      border: "var(--hero-loonwig-border)",
      text: "var(--hero-loonwig-text)",
      icon: <TrendingUp size={14} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl p-4 flex flex-col justify-center"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            boxShadow: "var(--shadow-sm)",
            minHeight: 90,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {card.icon}
            <span 
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              {card.label}
            </span>
          </div>
          <span
            className="text-3xl font-extrabold tabular-nums"
            style={{ 
              color: card.text, 
              fontFamily: "var(--font-mono)",
              letterSpacing: "-0.02em",
            }}
          >
            <AnimatedNumber 
              value={card.value} 
              prefix={card.prefix} 
              suffix={card.suffix} 
              decimals={card.decimals} 
            />
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## Stap 4: HomePage.tsx Aanpassen

### Import statements (VOEG TOE bovenaan HomePage.tsx)

```tsx
import { DirectionToggle } from "@/components/DirectionToggle";
import { HeroSummary } from "@/components/HeroSummary";
```

### JSX Aanpassingen

Zoek deze sectie in de huidige `return()` (het is de rechterpaneel / main content):

```tsx
{/* Rechter Paneel - Resultaten */}
<main className="lg:w-2/3 p-6 space-y-6">
```

**VERVANG** alles binnen `<main>...</main>` door:

```tsx
{/* Rechter Paneel - Resultaten */}
<main className="lg:w-2/3 p-6 space-y-6">
  {/* Fase 1: Direction Toggle */}
  <DirectionToggle 
    value={brutoNettoDirection} 
    onChange={setBrutoNettoDirection} 
  />

  {/* Fase 1: Hero Summary */}
  <HeroSummary
    brutoloon={getBarema().brutoLoon ?? brutoLoon}
    nettoloon={summary.nettoBedrag ?? 0}
    werkgeverskost={summary.kostBedrag ?? 0}
    loonwig={summary.loonwigPercentage ?? 0}
  />

  {/* Bestaande FOD Warning Banner — behouden */}
  <div className="rounded-lg p-4 border border-orange-200 bg-orange-50">
    ...
  </div>

  {/* Bestaande ResultTabs — behouden */}
  <ResultTabs ... />
</main>
```

### Wat er verwijderd wordt

- De **oude SummaryBar** (3 kaarten: Bruto/Netto/Kost) → vervangen door HeroSummary (4 kaarten)
- De **oude loonwig progress bar** → verplaatst naar de Maand tab (Fase 4)

### Wat er NIET gewijzigd wordt

- `useState` hooks
- `useMemo` / `useEffect` / calculaties
- `calculateBreakdown()` en andere functies
- `FormSection` componenten (linkerpaneel)
- Alle data constants
- `ResultTabs` logisch (enkel visueel via CSS)

---

## Stap 5: Hero Data Mapping

De 4 hero-kaarten krijgen hun waarden van het bestaande `summary` object. Map als volgt:

| Hero Card | Bron variabele | Fallback |
|-----------|---------------|----------|
| Bruto | `getBarema().brutoLoon ?? brutoLoon` | 0 |
| Netto | `summary.nettoBedrag` | 0 |
| Werkgeverskost | `summary.kostBedrag` | 0 |
| Loonwig | `summary.loonwigPercentage` | 0 |

**Note**: `summary` wordt berekend in een `useMemo` dat AL bestaat. Je hoeft niets te berekenen. Haal de waarden op die er al zijn.

---

## Stap 6: Responsive Gedrag

### Desktop (≥1024px)
- Toggle: gecentreerd, beide pillen naast elkaar
- Hero: 4 kaarten in 1 rij (`grid-cols-4`)

### Tablet (768–1023px)
- Toggle: gecentreerd
- Hero: 2 kaarten per rij (`grid-cols-2`)

### Mobile (<768px)
- Toggle: gecentreerd, pillen iets smaller (`px-4`)
- Hero: 2 kaarten per rij (`grid-cols-2`)

---

## Acceptatiecriteria

- [ ] DirectionToggle rendert bovenaan het rechterpaneel
- [ ] "Bruto → Netto" is actief (oranje) bij page load
- [ ] Klik op "Netto → Bruto" verandert de active state (oranje bg, wit text)
- [ ] `brutoNettoDirection` state updaten bij klik (werkt al)
- [ ] HeroSummary rendert 4 kaarten onder de toggle
- [ ] Waarden animeren van 0 naar eindwaarde over 1.2s (ease-out)
- [ ] Animatie speelt 1x bij mount, niet bij re-render
- [ ] Bruto-kaart: wit bg, zwart getal
- [ ] Netto-kaart: mint bg (#EFFFFA), mint groen getal (#10A982)
- [ ] Werkgeverskost-kaart: navy-50 bg, navy getal (#34425D)
- [ ] Loonwig-kaart: oranje bg (#FFF3EF), oranje getal (#D83A18) + TrendingUp icoon
- [ ] Alle getallen: tabular nums, € prefix (behalve loonwig: % suffix)
- [ ] Loonwig: 1 decimaal, rest: 2 decimalen
- [ ] Responsive: 4 kolom desktop, 2 kolom tablet/mobile
- [ ] Geen enkele calculatie-functie is gewijzigd
- [ ] Geen enkele useState/useMemo/useEffect is gewijzigd

---

## Files die gewijzigd worden

| File | Actie |
|------|-------|
| `src/styles/brand.css` | Tokens toevoegen (Stap 1) |
| `src/components/DirectionToggle.tsx` | **Nieuw** (Stap 2) |
| `src/components/HeroSummary.tsx` | **Nieuw** (Stap 3) |
| `src/pages/HomePage.tsx` | Imports + JSX (Stap 4) |

---

## Tips voor de Coding Agent

1. **Test eerst of `summary.nettoBedrag`, `summary.kostBedrag`, `summary.loonwigPercentage` bestaan** in het huidige `summary` useMemo. Als de naam anders is, gebruik de correcte property name.
2. De `getBarema()` functie retourneert `{ brutoLoon, ... }` — gebruik dit voor de bruto waarde.
3. Als `summary` properties ontbreken, gebruik de fallback 0 en log een console.warn.
4. De `brutoNettoDirection` state bestaat AL in HomePage.tsx. Zoek het op (ctrl+F `brutoNettoDirection`).
5. Verwijder NIET de oude SummaryBar import meteen — comment het uit zodat je terug kan als er iets mis is.
6. Na wijziging: `npm run build` moet slagen zonder TypeScript errors.

---

# ⏳ Fase 2 — Input Cockpit Grid (PENDING)

## Doel
Herschik de inputvelden van een verticale stapel (`FormSection` onder `FormSection`) naar een **2×2 cockpit grid** met visuele cards. Daarnaast worden de Extra Looncomponenten en Woon-werk verkeer verplaatst naar **accordion-secties** buiten het grid.

**NUL impact** op calculatie-logica of state. Elke `set(...)` call en elke `profiel.xxx` binding blijft identiek.

---

## Visueel: Huidig → Nieuw

### HUIDIG (verticale stapel in `<aside>`)
```
aside
├── CSV panel
├── BerekeningsRichtingToggle
├── "Profiel" heading
├── TaxProfileFields (gezinstype, kinderen)
├── Statuut select
├── Maand / Jaar
├── Werkdagen
├── Schaal / Categorie
├── Ervaring
├── Tewerkstelling (%)
├── Brutoloon / Nettoloon input
├── BaremaInlineCheck
├── Bouw-subset checkbox
├── "Bijkomende looncomponenten" FormSection
│   ├── Groepsverzekering
│   ├── VAA werkmiddelen (4 checkboxes)
│   └── Hospitalisatie
├── "Extra Toelagen" FormSection
│   ├── Eindejaarspremie
│   ├── Ecocheques
│   ├── Woon-werk
│   └── Werkgeversbijdragen
├── "Woon-werk Verkeer" FormSection
│   ├── Fiets (km)
│   ├── Privewagen (km + beroepskost)
│   ├── Bus/Tram/Metro (km + prijs)
│   ├── Trein (km)
│   └── Bedrijfswagen (catalogus + CO2)
└── "Werkgeversbijdragen" FormSection
    ├── Arbeidsongevallen (%)
    ├── Patronale groepsverzekering
    └── Hospitalisatie
```

### NIEUW (2×2 grid + accordions)
```
main content area
├── [RESULTATEN uit Fase 1 — blijven staan]
│
└── Input Cockpit Container (FULL WIDTH, onder resultaten)
    ├── Row 1: 2 cards
    │   ├── Card "Wie ben je?"    → statuut, gezinstype, kinderen
    │   └── Card "Arbeidscontext" → schaal, cat, ervaring, maand, jaar, werkdagen, tewerkstelling
    ├── Row 2: 2 cards
    │   ├── Card "Brutoloon"      → brutoloon/nettoloon input, barema check, onkostenvergoeding, bouw-subset
    │   └── Card "Woon-werk"      → 5 vervoersmiddelen (fiets, privewagen, bus, trein, bedrijfswagen)
    ├── Accordion "Extra Looncomponenten" (default: ingeklapt)
    │   ├── Groepsverzekering eigen bijdrage
    │   ├── Hospitalisatie eigen bijdrage
    │   ├── Maaltijdcheques (WG + WN)
    │   └── VAA werkmiddelen (4 checkboxes)
    └── Accordion "Werkgeversbijdragen" (default: ingeklapt)
        ├── Arbeidsongevallen (%)
        ├── Patronale groepsverzekering
        └── Hospitalisatieverzekering
```

**Belangrijke wijziging**: De inputs verhuizen van het **linkerpaneel** naar **onder de resultaten** in het rechterpaneel. Het linkerpaneel (`<aside>`) wordt VERWIJDERD. De hele pagina wordt een **single-column layout** (inputs onder resultaten).

---

## Stap 1: CSS Tokens toevoegen

### File: `src/branding/brand.css` — voeg toe aan het einde

```css
/* ─── Fase 2: Cockpit Grid Tokens ─── */

:root {
  --cockpit-card-bg: #FFFFFF;
  --cockpit-card-border: #E5EAF2;
  --cockpit-card-radius: var(--radius-lg);
  --cockpit-card-padding: 20px;
  --cockpit-card-shadow: var(--shadow-sm);
  --cockpit-grid-gap: 16px;
  --cockpit-section-icon-bg: #FFF3EF;
  --cockpit-section-icon-color: #D83A18;
  --cockpit-subsection-bg: #F3F6FA;
  --cockpit-subsection-radius: var(--radius-md);
  --cockpit-toggle-active-border: rgba(216, 58, 24, 0.2);
  --cockpit-toggle-active-bg: #FFF3EF;
  --cockpit-toggle-inactive-border: #E5EAF2;
  --cockpit-toggle-inactive-bg: #FFFFFF;
}
```

---

## Stap 2: Nieuwe Componenten maken

### 2A. `CockpitCard.tsx` — wrapper voor elke input card

Maak bestand: `src/components/CockpitCard.tsx`

```tsx
import type { ReactNode } from "react";

interface CockpitCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  highlight?: boolean; // voor Brutoloon card (mint border)
}

export function CockpitCard({ title, icon, children, highlight }: CockpitCardProps) {
  return (
    <div
      style={{
        background: "var(--cockpit-card-bg)",
        border: `1px solid ${highlight ? "rgba(28,210,163,0.3)" : "var(--cockpit-card-border)"}`,
        borderRadius: "var(--cockpit-card-radius)",
        boxShadow: "var(--cockpit-card-shadow)",
        padding: "var(--cockpit-card-padding)",
        transition: "box-shadow 0.2s ease",
        ...(highlight ? { background: "rgba(239,255,250,0.3)" } : {}),
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--cockpit-card-shadow)";
      }}
    >
      {/* Card Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--cockpit-section-icon-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cockpit-section-icon-color)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          {title}
        </span>
      </div>

      {/* Card Content */}
      {children}
    </div>
  );
}
```

### 2B. `CockpitAccordion.tsx` — inklapbare sectie

Maak bestand: `src/components/CockpitAccordion.tsx`

```tsx
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface CockpitAccordionProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CockpitAccordion({ title, subtitle, icon, children, defaultOpen = false }: CockpitAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--cockpit-card-bg)",
        border: "1px solid var(--cockpit-card-border)",
        borderRadius: "var(--cockpit-card-radius)",
        boxShadow: "var(--cockpit-card-shadow)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background: "var(--cockpit-section-icon-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cockpit-section-icon-color)",
            }}
          >
            {icon}
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
        <ChevronDown
          size={20}
          style={{
            color: "var(--color-text-muted)",
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );
}
```

---

## Stap 3: Profiel type inspectie (BELANGRIJK)

Lees het `Profiel` interface/type in `HomePage.tsx` of de bijbehorende type file. Je hebt deze property-namen nodig:

| Concept | Profiel property | Type |
|---------|-----------------|------|
| Statuut | `profiel.statuut` | `"bediende" \| "student"` |
| Gezinstype | `profiel.gezinstype` | `GezinsType` |
| Kinderen ten laste | `profiel.kinderenTenLaste` | `number` |
| Schaal | `profiel.schaal` | `Schaal` |
| Categorie | `profiel.cat` | `BaremaCat` |
| Ervaring | `profiel.ervaringJaren` | `number` |
| Maand | `profiel.berekeningsMaand` | `string` ("01"-"12") |
| Jaar | `profiel.berekeningsJaar` | `string` |
| Werkdagen | `profiel.arbeidsdagenPerMaand` | `number` |
| Tewerkstelling | `profiel.tewerkstellingsbreuk` | `number` (0-1) |
| Brutoloon | `profiel.brutoloon` | `number` |
| Doel nettoloon | `profiel.doelNettoloon` | `number` |
| Bouw subset | `profiel.bouwVlag` | `boolean` |
| Groepsverzekering eigen | `profiel.groepsverzekeringEigenBijdrage` | `number` |
| Hospitalisatie eigen | `profiel.hospitalisatieEigenBijdrage` | `number` |
| Onkostenvergoeding | `profiel.onkostenvergoeding` | `number` |
| Maaltijdcheque WG | `profiel.maaltijdchequeWerkgeversaandeelPerDag` | `number` |
| Maaltijdcheque WN | `profiel.maaltijdchequeWerknemersbijdragePerDag` | `number` |
| VAA PC/Laptop | `profiel.vaaPcLaptopActief` | `boolean` |
| VAA GSM | `profiel.vaaGsmSmartphoneActief` | `boolean` |
| VAA Internet | `profiel.vaaInternetActief` | `boolean` |
| VAA GSM-abonnement | `profiel.vaaGsmAbonnementActief` | `boolean` |
| Eindejaarspremie | `profiel.eindejaarspremieActief` | `boolean` |
| Ecocheques | `profiel.ecochequesActief` | `boolean` |
| Woon-werk algemeen | `profiel.woonwerkVergoedingActief` | `boolean` |
| WG-bijdragen | `profiel.werkgeversbijdragenActief` | `boolean` |
| Fiets | `profiel.woonwerkFiets` + `profiel.fietsKm` | `boolean` + `number` |
| Privewagen | `profiel.woonwerkPrivewagen` + `profiel.privewagenKm` + `profiel.privewagenBeroepskostMethode` | `boolean` + `number` + `string` |
| Bus/Tram/Metro | `profiel.woonwerkBusTramMetro` + `profiel.busTramMetroKm` + `profiel.busTramMetroPrijs` | `boolean` + `number` + `number` |
| Trein | `profiel.woonwerkTrein` + `profiel.treinKm` | `boolean` + `number` |
| Bedrijfswagen | `profiel.woonwerkBedrijfswagen` + `profiel.bedrijfswagenCataloguswaarde` + `profiel.bedrijfswagenCo2` + `profiel.bedrijfswagenBrandstof` + `profiel.bedrijfswagenDatumEersteInschrijving` + `profiel.woonwerkBedrijfswagenBeroepskostMethode` | complex |
| Arbeidsongevallen | `profiel.arbeidsongevallenPct` | `number` (0-1) |
| Patronale groepsverzekering | `profiel.extraGroepsverzekering` | `number` |
| Hospitalisatie WG | `profiel.extraHospitalisatie` | `number` |

**Helpers die AL bestaan** (niet opnieuw maken):
- `set(key, value)` — ProfielSetter
- `tewerkstellingsbreukNaarPercentage(x)` — converteert 0-1 naar 1-100
- `percentageNaarTewerkstellingsbreuk(x)` — converteert 1-100 naar 0-1
- `NumeriekeInput` — bestaand component voor nummers
- `FormField` — bestaand label+input wrapper
- `HelpTooltip` — bestaand (?) tooltip
- `inputClass`, `selectClass` — bestaande Tailwind classes
- `CheckboxLine` — bestaand checkbox+label component
- `FormSection` — bestaande accordion sectie (NIET gebruiken in nieuwe cards)

---

## Stap 4: HomePage.tsx — De Grote Refactor

### 4A. Imports toevoegen

```tsx
// NIEUW: Fase 2 imports
import { CockpitCard } from "@/components/CockpitCard";
import { CockpitAccordion } from "@/components/CockpitAccordion";
import {
  User,
  Building2,
  Euro,
  Bike,
  Car,
  Bus,
  Train,
  Shield,
  Receipt,
  Wifi,
  Gift,
  Wallet,
} from "lucide-react";
```

### 4B. `<aside>` VERWIJDEREN

**Zoek en VERWIJDER** de volledige `<aside>...</aside>` tag en ALLES erin (regels ~1008-1667). Dit is het hele linkerpaneel met alle inputvelden.

**WAT BLIJFT BEHOUDEN uit de `<aside>`:**
Niets. Alles wordt verplaatst naar de Cockpit componenten hieronder.

### 4C. Root layout aanpassen

**HUIDIG:**
```tsx
<div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
  <aside>...</aside>
  <main className="lg:w-2/3 p-6 space-y-6">
    {/* resultaten */}
  </main>
</div>
```

**NIEUW:** (single column, inputs onder resultaten)
```tsx
<div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <main className="space-y-6">
    {/* Fase 1: DirectionToggle */}
    <DirectionToggle ... />
    
    {/* Fase 1: HeroSummary */}
    <HeroSummary ... />
    
    {/* Fase 1: Bestaande resultaten */}
    <ResultsPanel profiel={profiel} />
    
    {/* === FASE 2: INPUT COCKPIT === */}
    <InputCockpit profiel={profiel} set={set} />
  </main>
</div>
```

### 4D. InputCockpit component maken

**Maak een nieuwe component** `InputCockpit` binnen `HomePage.tsx` (boven de `HomePage` functie, naast `TaxProfileFields`, `ResultsPanel`, etc.):

```tsx
function InputCockpit({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--cockpit-grid-gap)" }}>
      
      {/* Row 1: 2 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--cockpit-grid-gap)" }}>
        <WieBenJeCard profiel={profiel} set={set} />
        <ArbeidscontextCard profiel={profiel} set={set} />
      </div>
      
      {/* Row 2: 2 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--cockpit-grid-gap)" }}>
        <BrutoloonCard profiel={profiel} set={set} />
        <WoonWerkCard profiel={profiel} set={set} />
      </div>
      
      {/* Accordion: Extra Looncomponenten */}
      <CockpitAccordion
        title="Extra looncomponenten"
        subtitle="Verzekeringen, maaltijdcheques, VAA"
        icon={<Receipt size={16} />}
      >
        <ExtraLooncomponentenContent profiel={profiel} set={set} />
      </CockpitAccordion>
      
      {/* Accordion: Werkgeversbijdragen */}
      <CockpitAccordion
        title="Werkgeversbijdragen"
        subtitle="Arbeidsongevallen, groepsverzekering, hospitalisatie"
        icon={<Shield size={16} />}
      >
        <WerkgeversbijdragenContent profiel={profiel} set={set} />
      </CockpitAccordion>
    </div>
  );
}
```

### 4E. De 4 Card componenten

#### Card 1: `WieBenJeCard`

```tsx
function WieBenJeCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Wie ben je?" icon={<User size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Statuut — VERPLAATST van onder TaxProfileFields naar BOVENAN */}
        <FormField label="Statuut">
          <select
            className={selectClass}
            value={profiel.statuut}
            onChange={(e) => set("statuut", e.target.value as Statuut)}
          >
            <option value="bediende">Bediende</option>
            <option value="student">Student</option>
          </select>
        </FormField>

        {/* Gezinstype — UIT TaxProfileFields/GezinstypeField */}
        <FormField
          label={<>
            Gezinstype (voor BV)
            <HelpTooltip text="Een partner is fiscaal niet ten laste. Bij geen of beperkt beroepsinkomen past de BV-berekening Schaal II toe, wat de bedrijfsvoorheffing verlaagt en het geraamde nettoloon verhoogt." />
          </>}
        >
          <select
            className={selectClass}
            value={profiel.gezinstype}
            onChange={(e) => set("gezinstype", e.target.value as GezinsType)}
          >
            <option value="alleenstaand">Alleenstaand / eenoudergezin</option>
            <option value="gehuwd_met_inkomen">Gehuwd/wettelijk samenwonend - partner met inkomen</option>
            <option value="gehuwd_zonder_inkomen">Gehuwd/wettelijk samenwonend - partner zonder of beperkt beroepsinkomen</option>
          </select>
        </FormField>

        {/* Kinderen — UIT KinderenVoorheffingFields */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kinderen ten laste">
            <NumeriekeInput
              className={inputClass}
              min={0}
              max={12}
              value={profiel.kinderenTenLaste}
              modus="int"
              onValueChange={(waarde) => set("kinderenTenLaste", waarde)}
            />
          </FormField>
          {/* Gemeentebelasting — VRAAG: bestaat deze? Check profiel.xxx */}
          {/* Als gemeentebelasting een property is, toon hier. Anders weglaten. */}
        </div>

        {/* Fiscaal alleenstaande ouder — UIT AlleenstaandeOuderField */}
        {profiel.gezinstype === "alleenstaand" && profiel.kinderenTenLaste > 0 && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--color-navy-500)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={profiel.fiscaalAlleenstaandeMetKind}
              onChange={(e) => set("fiscaalAlleenstaandeMetKind", e.target.checked)}
              style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
            />
            Fiscaal alleenstaande ouder (+€52 BV-vermindering)
          </label>
        )}
      </div>
    </CockpitCard>
  );
}
```

#### Card 2: `ArbeidscontextCard`

```tsx
function ArbeidscontextCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Arbeidscontext" icon={<Building2 size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Rij 1: Schaal / Categorie / Ervaring */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Schaal">
            <select className={selectClass} value={profiel.schaal} onChange={(e) => set("schaal", e.target.value as Schaal)}>
              <option value="I">I</option>
              <option value="II">II</option>
            </select>
          </FormField>
          <FormField label="Categorie">
            <select className={selectClass} value={profiel.cat} onChange={(e) => set("cat", e.target.value as BaremaCat)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </FormField>
          <FormField label="Ervaring">
            <NumeriekeInput
              className={inputClass}
              min={0} max={60}
              value={profiel.ervaringJaren}
              modus="int"
              onValueChange={(waarde) => set("ervaringJaren", waarde)}
            />
          </FormField>
        </div>

        {/* Rij 2: Maand / Jaar / Werkdagen */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Maand">
            <select className={selectClass} value={profiel.berekeningsMaand} onChange={(e) => setBerekeningsMaand(e.target.value)}>
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Maa</option>
              <option value="04">Apr</option>
              <option value="05">Mei</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Okt</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </FormField>
          <FormField label="Jaar">
            <select className={selectClass} value={profiel.berekeningsJaar} onChange={(e) => setBerekeningsJaar(e.target.value)}>
              <option value="2026">2026</option>
            </select>
          </FormField>
          <FormField label="Werkdagen">
            <NumeriekeInput
              className={inputClass}
              min={0} max={31}
              value={profiel.arbeidsdagenPerMaand}
              modus="int"
              onValueChange={(waarde) => set("arbeidsdagenPerMaand", waarde)}
            />
          </FormField>
        </div>

        {/* Tewerkstelling */}
        <FormField label="Tewerkstelling (%)">
          <NumeriekeInput
            className={inputClass}
            step="1" min={1} max={100}
            value={tewerkstellingsbreukNaarPercentage(profiel.tewerkstellingsbreuk)}
            onValueChange={(waarde) => set("tewerkstellingsbreuk", percentageNaarTewerkstellingsbreuk(waarde))}
          />
        </FormField>
      </div>
    </CockpitCard>
  );
}
```

#### Card 3: `BrutoloonCard`

```tsx
function BrutoloonCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <CockpitCard title="Brutoloon" icon={<Euro size={16} />} highlight>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Brutoloon of Nettoloon input — conditie op berekeningsRichting */}
        {profiel.berekeningsRichting === "bruto_naar_netto" ? (
          <FormField label="Brutoloon (€)">
            <NumeriekeInput
              className={inputClass}
              step="0.01"
              value={profiel.brutoloon}
              onValueChange={(waarde) => set("brutoloon", waarde)}
            />
          </FormField>
        ) : (
          <>
            <FormField label="Gewenst nettoloon (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.doelNettoloon}
                onValueChange={(waarde) => set("doelNettoloon", waarde)}
              />
            </FormField>
            <FormField label="Berekend bruto (€)">
              <NumeriekeInput
                className={inputClass}
                step="0.01"
                value={profiel.brutoloon}
                disabled
                onValueChange={() => {}}
              />
            </FormField>
          </>
        )}

        {/* Barema check */}
        <BaremaInlineCheck profiel={profiel} />

        {/* Onkostenvergoeding — NIEUW veld (check of dit bestaat in Profiel!) */}
        <FormField label="Onkostenvergoeding (€/m)">
          <NumeriekeInput
            className={inputClass}
            step="0.01"
            min={0}
            value={profiel.onkostenvergoeding}
            onValueChange={(waarde) => set("onkostenvergoeding", waarde)}
          />
        </FormField>

        {/* Bouw-subset */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--color-navy-500)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={profiel.bouwVlag}
            onChange={(e) => set("bouwVlag", e.target.checked)}
            style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }}
          />
          Bouw-subset (+1,80% pensioen)
        </label>
      </div>
    </CockpitCard>
  );
}
```

#### Card 4: `WoonWerkCard`

```tsx
function WoonWerkCard({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  const vervoersmiddelen = [
    {
      key: "fiets" as const,
      label: "Fiets",
      icon: <Bike size={15} />,
      active: profiel.woonwerkFiets,
      onChange: (v: boolean) => set("woonwerkFiets", v),
      kmField: { value: profiel.fietsKm, onChange: (v: number) => set("fietsKm", v) },
    },
    {
      key: "privewagen" as const,
      label: "Privéwagen",
      icon: <Car size={15} />,
      active: profiel.woonwerkPrivewagen,
      onChange: (v: boolean) => set("woonwerkPrivewagen", v),
      kmField: { value: profiel.privewagenKm, onChange: (v: number) => set("privewagenKm", v) },
      extra: (
        <div className="flex items-center gap-3" style={{ paddingLeft: 4 }}>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Beroepskost</span>
          <label className="flex items-center gap-1 text-sm cursor-pointer">
            <input type="radio" name="privewagen-beroepskost" value="forfaitair"
              checked={profiel.privewagenBeroepskostMethode === "forfaitair"}
              onChange={() => set("privewagenBeroepskostMethode", "forfaitair")}
            /> Forfaitair
          </label>
          <label className="flex items-center gap-1 text-sm cursor-pointer">
            <input type="radio" name="privewagen-beroepskost" value="reeel"
              checked={profiel.privewagenBeroepskostMethode === "reeel"}
              onChange={() => set("privewagenBeroepskostMethode", "reeel")}
            /> Reëel
          </label>
        </div>
      ),
    },
    {
      key: "bus" as const,
      label: "Bus / tram / metro",
      icon: <Bus size={15} />,
      active: profiel.woonwerkBusTramMetro,
      onChange: (v: boolean) => set("woonwerkBusTramMetro", v),
      kmField: { value: profiel.busTramMetroKm, onChange: (v: number) => set("busTramMetroKm", v) },
      extraPrice: { label: "Prijs / maand", value: profiel.busTramMetroPrijs, onChange: (v: number) => set("busTramMetroPrijs", v) },
    },
    {
      key: "trein" as const,
      label: "Trein",
      icon: <Train size={15} />,
      active: profiel.woonwerkTrein,
      onChange: (v: boolean) => set("woonwerkTrein", v),
      kmField: { value: profiel.treinKm, onChange: (v: number) => set("treinKm", v) },
    },
    {
      key: "bedrijfswagen" as const,
      label: "Bedrijfswagen",
      icon: <Car size={15} />,
      active: profiel.woonwerkBedrijfswagen,
      onChange: (v: boolean) => set("woonwerkBedrijfswagen", v),
      bedrijfswagenFields: true,
    },
  ];

  return (
    <CockpitCard title="Woon-werk verkeer" icon={<Bike size={16} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {vervoersmiddelen.map((v) => (
          <div key={v.key}>
            {/* Toggle rij */}
            <label
              style={{
                display: "grid",
                gridTemplateColumns: v.kmField ? "1fr auto auto" : "1fr auto",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${v.active ? "var(--cockpit-toggle-active-border)" : "var(--cockpit-toggle-inactive-border)"}`,
                background: v.active ? "var(--cockpit-toggle-active-bg)" : "var(--cockpit-toggle-inactive-bg)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={v.active}
                  onChange={(e) => v.onChange(e.target.checked)}
                  style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
                />
                <span style={{ color: v.active ? "var(--color-primary)" : "var(--color-text-muted)", display: "flex" }}>
                  {v.icon}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: v.active ? "var(--color-primary)" : "var(--color-navy-500)" }}>
                  {v.label}
                </span>
              </div>

              {/* km veld */}
              {v.kmField && v.active && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <NumeriekeInput
                    className={inputClass}
                    min={0}
                    value={v.kmField.value}
                    onValueChange={v.kmField.onChange}
                    style={{ width: 70, textAlign: "right" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>km/dag</span>
                </div>
              )}

              {/* Extra prijs veld (bus/tram/metro) */}
              {v.extraPrice && v.active && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <NumeriekeInput
                    className={inputClass}
                    step="0.01"
                    min={0}
                    value={v.extraPrice.value}
                    onValueChange={v.extraPrice.onChange}
                    style={{ width: 80, textAlign: "right" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)" }}>€/m</span>
                </div>
              )}
            </label>

            {/* Extra velden wanneer actief */}
            {v.active && v.extra && <div style={{ marginTop: 6, paddingLeft: 32 }}>{v.extra}</div>}

            {/* Bedrijfswagen velden */}
            {v.key === "bedrijfswagen" && v.active && (
              <div style={{ marginTop: 10, paddingLeft: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FormField label="Cataloguswaarde (€)">
                  <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.bedrijfswagenCataloguswaarde} onValueChange={(w) => set("bedrijfswagenCataloguswaarde", w)} />
                </FormField>
                <FormField label="Eerste inschrijving">
                  <input className={inputClass} type="date" value={profiel.bedrijfswagenDatumEersteInschrijving} onChange={(e) => set("bedrijfswagenDatumEersteInschrijving", e.target.value)} />
                </FormField>
                <FormField label="Brandstof">
                  <select className={selectClass} value={profiel.bedrijfswagenBrandstof} onChange={(e) => set("bedrijfswagenBrandstof", e.target.value as BrandstofBedrijfswagen)}>
                    <option value="diesel">Diesel</option>
                    <option value="benzine">Benzine</option>
                    <option value="elektriciteit">Elektriciteit</option>
                  </select>
                </FormField>
                {profiel.bedrijfswagenBrandstof !== "elektriciteit" && (
                  <FormField label="CO₂-waarde">
                    <NumeriekeInput className={inputClass} min={0} value={profiel.bedrijfswagenCo2} onValueChange={(w) => set("bedrijfswagenCo2", w)} />
                  </FormField>
                )}
                <div className="flex items-center gap-3" style={{ gridColumn: "1 / -1", paddingLeft: 4 }}>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Berekeningsmethode</span>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" name="bw-beroepskost" value="forfaitair"
                      checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "forfaitair"}
                      onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "forfaitair")}
                    /> Forfaitair
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" name="bw-beroepskost" value="reeel"
                      checked={profiel.woonwerkBedrijfswagenBeroepskostMethode === "reeel"}
                      onChange={() => set("woonwerkBedrijfswagenBeroepskostMethode", "reeel")}
                    /> Reëel
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </CockpitCard>
  );
}
```

### 4F. Accordion content componenten

#### `ExtraLooncomponentenContent`

```tsx
function ExtraLooncomponentenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {/* Kolom 1: Verzekeringen */}
      <div style={{ background: "var(--cockpit-subsection-bg)", borderRadius: "var(--cockpit-subsection-radius)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          <Shield size={14} /> Verzekeringen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField label="Groepsverz. eigen bijdr. (€/m)">
            <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.groepsverzekeringEigenBijdrage} onValueChange={(w) => set("groepsverzekeringEigenBijdrage", w)} />
          </FormField>
          <FormField label="Hospitalisatie (€/m)">
            <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.hospitalisatieEigenBijdrage} onValueChange={(w) => set("hospitalisatieEigenBijdrage", w)} />
          </FormField>
        </div>
      </div>

      {/* Kolom 2: Maaltijdcheques */}
      <div style={{ background: "var(--cockpit-subsection-bg)", borderRadius: "var(--cockpit-subsection-radius)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          <Receipt size={14} /> Maaltijdcheques
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormField label="WG-aandeel (€/dag)">
            <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.maaltijdchequeWerkgeversaandeelPerDag} onValueChange={(w) => set("maaltijdchequeWerkgeversaandeelPerDag", w)} />
          </FormField>
          <FormField label="WN-bijdrage (€/dag)">
            <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.maaltijdchequeWerknemersbijdragePerDag} onValueChange={(w) => set("maaltijdchequeWerknemersbijdragePerDag", w)} />
          </FormField>
        </div>
      </div>

      {/* Kolom 3: VAA werkmiddelen */}
      <div style={{ background: "var(--cockpit-subsection-bg)", borderRadius: "var(--cockpit-subsection-radius)", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
          <Wifi size={14} /> VAA werkmiddelen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Laptop / pc", checked: profiel.vaaPcLaptopActief, set: (v: boolean) => set("vaaPcLaptopActief", v) },
            { label: "GSM", checked: profiel.vaaGsmSmartphoneActief, set: (v: boolean) => set("vaaGsmSmartphoneActief", v) },
            { label: "Internet", checked: profiel.vaaInternetActief, set: (v: boolean) => set("vaaInternetActief", v) },
            { label: "GSM-abonnement", checked: profiel.vaaGsmAbonnementActief, set: (v: boolean) => set("vaaGsmAbonnementActief", v) },
          ].map((item) => (
            <label key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", cursor: "pointer", fontSize: 13, color: "var(--color-navy-500)" }}>
              <input type="checkbox" checked={item.checked} onChange={(e) => item.set(e.target.checked)} style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }} />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### `WerkgeversbijdragenContent`

```tsx
function WerkgeversbijdragenContent({ profiel, set }: { profiel: Profiel; set: ProfielSetter }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      <FormField label={<>
        Arbeidsongevallen (%)
        <HelpTooltip text="Burelen: ~0,3%. Controleer uw polis." />
      </>}>
        <NumeriekeInput
          className={inputClass}
          step="0.01"
          min={0}
          max={10}
          value={profiel.arbeidsongevallenPct * 100}
          formatValue={(w) => w.toFixed(2)}
          onValueChange={(w) => set("arbeidsongevallenPct", w / 100)}
        />
      </FormField>
      <FormField label="Patronale groepsverzekering (€/m)">
        <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.extraGroepsverzekering} onValueChange={(w) => set("extraGroepsverzekering", w)} />
      </FormField>
      <FormField label="Hospitalisatieverzekering (€/m)">
        <NumeriekeInput className={inputClass} step="0.01" min={0} value={profiel.extraHospitalisatie} onValueChange={(w) => set("extraHospitalisatie", w)} />
      </FormField>
    </div>
  );
}
```

---

## Stap 5: OUDE componenten opruimen

Na de refactor zijn deze componenten binnen HomePage.tsx **dood code**. Verwijder ze:

1. **`TaxProfileFields`** — vervangen door `WieBenJeCard`
2. **`GezinstypeField`** — vervangen door inline in `WieBenJeCard`
3. **`KinderenVoorheffingFields`** — vervangen door inline in `WieBenJeCard`
4. **`AlleenstaandeOuderField`** — vervangen door inline in `WieBenJeCard`
5. **`FormSection` gebruik voor inputs** — vervangen door `CockpitCard`

**Laat staan** (worden elders gebruikt):
- `FormSection` component zelf (definitie)
- `CheckboxLine` component
- `HelpTooltip` component
- `NumeriekeInput` component
- `FormField` component
- `BaremaInlineCheck` component

---

## Stap 6: Responsive

### Desktop (≥1024px)
- Grid: 2 kolommen (`grid-cols-2`)
- Accordion content: 3 kolommen

### Tablet (768–1023px)
- Grid: 2 kolommen (behouden)
- Accordion content: 2 kolommen (Pas `gridTemplateColumns` naar `"repeat(2, 1fr)"`)

### Mobile (<768px)
- Grid: 1 kolom (`grid-cols-1` — gebruik CSS media query of Tailwind)
- Accordion content: 1 kolom
- Vervoersmiddelen: km velden onder de toggle in plaats van ernaast

**TIP**: Gebruik een simpele CSS media query in de style props:
```tsx
// In de grid containers, voeg een className toe voor responsive:
<div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--cockpit-grid-gap)" }}>
```

---

## Acceptatiecriteria

- [ ] De `<aside>` (linkerpaneel) is volledig verwijderd
- [ ] De pagina is single-column (geen `lg:flex-row` meer)
- [ ] 4 CockpitCards staan in een 2×2 grid
- [ ] Card "Wie ben je?" toont: statuut, gezinstype, kinderen, fiscaal alleenstaande ouder
- [ ] Card "Arbeidscontext" toont: schaal, cat, ervaring, maand, jaar, werkdagen, tewerkstelling
- [ ] Card "Brutoloon" toont: brutoloon/nettoloon input, barema check, onkostenvergoeding, bouw-subset
- [ ] Card "Woon-werk" toont: 5 vervoersmiddelen (fiets, privewagen, bus/tram/metro, trein, bedrijfswagen)
- [ ] Elke vervoersmiddel heeft een checkbox + km veld (bedrijfswagen heeft catalogus/CO2/brandstof)
- [ ] "Extra Looncomponenten" accordion toont: groepsverzekering, hospitalisatie, maaltijdcheques, VAA in 3 kolommen
- [ ] "Werkgeversbijdragen" accordion toont: arbeidsongevallen, patronale groepsverzekering, hospitalisatie in 3 kolommen
- [ ] Accordions zijn default ingeklapt
- [ ] Elke input werkt (waarden veranderen, state updates, berekeningen herberekenen)
- [ ] Responsive: 2 kolommen op desktop/tablet, 1 kolom op mobile
- [ ] Geen enkele `set(...)` call is gewijzigd
- [ ] Geen enkele calculate functie is gewijzigd
- [ ] `npm run build` slaagt zonder errors

---

## Files die gewijzigd worden

| File | Actie |
|------|-------|
| `src/branding/brand.css` | Tokens toevoegen |
| `src/components/CockpitCard.tsx` | **Nieuw** |
| `src/components/CockpitAccordion.tsx` | **Nieuw** |
| `src/pages/HomePage.tsx` | Grote refactor: `<aside>` verwijderen, `InputCockpit` + 6 sub-componenten toevoegen, layout omzetten naar single-column |

---

## Troubleshooting

### "Property 'xxx' does not exist on type 'Profiel'"
→ Check het `Profiel` interface. De property naam kan iets anders zijn (bv. `hospitalisatieEigenBijdrage` vs `extraHospitalisatie`). Pas de property naam aan in de card component.

### "Cannot find name 'tewerkstellingsbreukNaarPercentage'"
→ Deze helpers bestaan AL in HomePage.tsx. Zorg dat je ze aanroept binnen de `InputCockpit` functies (zijn in dezelfde scope).

### "'NumeriekeInput' cannot be used as a JSX component"
→ Import niet vergeten: `NumeriekeInput` wordt al gebruikt in HomePage.tsx, dus het is al beschikbaar in scope.

### Layout ziet er raar uit op mobile
→ Voeg Tailwind responsive classes toe aan de grids: `className="grid grid-cols-1 md:grid-cols-2"`.

### Waarden updaten niet wanneer ik input wijzig
→ Controleer dat elke `onValueChange` correct de `set("property", waarde)` aanroept met de EXACTE property naam uit het Profiel type.
