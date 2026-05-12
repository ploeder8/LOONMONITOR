# VH Design System — stijlgids voor coding agents

Kopieer deze sectie naar de `AGENTS.md` (of equivalent agent-instructiebestand) van elk nieuw Van Havermaet project.
Zo weet elke coding agent (Claude Code, Codex, Cursor, …) welke stijl er gehanteerd moet worden.

---

## VH Design System

Apply this style consistently across every page, component, and tool in the Van Havermaet Family Office suite.

### Color palette

| Token | Hex | Usage |
|---|---|---|
| sand | `#cbbba0` | Primary accent — active tabs, borders, chart lines, highlights |
| sandLight | `#e8dfcf` | Subtle backgrounds, hover states, secondary fills |
| sandPale | `#f5f0e8` | Card backgrounds, input backgrounds, alternating rows |
| sandDim | `rgba(203,187,160,0.18)` | Translucent overlays on white |
| brown | `#7b6a58` | Interactive elements — buttons, slider thumbs, active text, CTA |
| brownLight | `#9a8b7a` | Muted labels, secondary text, axis ticks |
| charcoal | `#3c3c3b` | Primary text, headings, dark tooltips |
| charcoalLight | `#5a5a59` | Inactive nav, secondary body text |
| bg | `#faf8f4` | Page background (warm off-white) |
| border | `#e2ddd5` | Card borders, dividers, input outlines |
| white | `#ffffff` | Header background, card surfaces |

**Rule:** never use pure black (`#000`) or cold greys. All neutrals must lean warm. Never use blue as a primary action color — brown (`#7b6a58`) is the VH action color.

### Typography

| Role | Variable | Font | When to use |
|---|---|---|---|
| Page titles, section headings | `var(--font-display)` | Space Grotesk | H1–H4, dashboard titles, KPI labels |
| Body, UI, nav, buttons | `var(--font-body)` | DM Sans | All body copy, input labels, nav tabs, descriptions |
| Numbers, chart values | `var(--font-mono)` | JetBrains Mono | All numeric output, currency, percentages, chart ticks/tooltips |

Add these fonts via Google Fonts in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

Define in your root CSS:
```css
:root {
  --font-display: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    "DM Sans",       -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    "JetBrains Mono", "SFMono-Regular", Menlo, monospace;
}

html, body {
  margin: 0; padding: 0;
  background: #faf8f4;
  color: #3c3c3b;
  font-family: var(--font-body);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.02em;
}
```

**Rules:**
- Always use CSS variables, never hardcode a font-family string.
- Nav/button labels: `font-weight: 600`, `font-size: 13px`, `letter-spacing: 0.01em`.
- Numbers in results or KPI cards: always `var(--font-mono)`.

### Spacing & layout

- Max content width: `1180px`, centered with `margin: 0 auto`.
- Page padding: `28px` horizontal on the outer wrapper.
- Section gap: `24px–32px` between major sections.
- Card padding: `1.3rem 1.4rem` (compact) or `1.5rem` (chart areas).
- Card border-radius: `14px` for content cards, `4px` for small UI elements (tabs, badges).
- Input border-radius: `8px`.

### Component patterns

**Cards**
```css
background: #ffffff;
border: 1px solid #e2ddd5;
border-radius: 14px;
padding: 1.3rem 1.4rem;
```

**Nav tabs (active / inactive)**
```js
// active
{ background: "#cbbba0", color: "#3c3c3b", borderRadius: 4, fontWeight: 600 }
// inactive
{ background: "transparent", color: "#5a5a59" }
// transition: "background 0.15s, color 0.15s"
```

**Sliders / range inputs**
```css
/* track */ height: 5px; border-radius: 3px; background: #e8dfcf;
/* thumb */ width: 20px; height: 20px; border-radius: 50%;
            background: #7b6a58; border: 3px solid #fff;
            box-shadow: 0 1px 4px rgba(60,60,59,0.25);
```

**Tooltips (chart)**
```js
{ background: "#3c3c3b", color: "#fff", borderRadius: 6, fontSize: 12,
  fontFamily: "var(--font-mono)" }
```

**Section headers**
```js
{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600,
  color: "#3c3c3b", letterSpacing: "-0.01em" }
```

**Muted labels / axis text**
```js
{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9a8b7a" }
```

### Elevation & shadow

- Header: `box-shadow: 0 2px 10px rgba(60,60,59,0.06)`
- Cards: no shadow — use border instead.
- Floating elements: `box-shadow: 0 4px 16px rgba(60,60,59,0.12)`

### Do / don't

| Do | Don't |
|---|---|
| Warm neutrals from the palette above | Cold greys, pure black, blue accents |
| `var(--font-mono)` for every number | Render financial figures in DM Sans |
| `border-radius: 14px` on cards | Sharp corners or very large radius (>16px) |
| Subtle transitions (0.15s) on interactive elements | Animations >300ms or bouncy easings |
| White card surfaces on warm `#faf8f4` page bg | White-on-white or grey-on-grey |
| Brown (`#7b6a58`) as the primary action color | Blue, green, or other non-VH action colors |

### Shared header (optional)

If using the VH shared Header component, copy from the main dashboard repo:
- `src/components/Header.jsx`
- `public/vh-logo.svg`
- Install: `npm install react-router-dom`
