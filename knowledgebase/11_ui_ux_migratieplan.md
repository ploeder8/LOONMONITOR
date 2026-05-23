# Fase 1 — Direction Toggle + Hero Summary

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
