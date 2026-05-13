# jaakie — Eenvoudige Brand Guideline & Designsysteem

Deze guideline is gebaseerd op het oranje **jaakie**-logo als hoofdidentiteit, aangevuld met het navy en mint gevoel uit de alternatieve logorichting.

## Merkgevoel

**jaakie** voelt modern, vriendelijk, slim en betrouwbaar.

De visuele stijl gebruikt:
- afgeronde vormen;
- veel witruimte;
- zachte schaduwen;
- duidelijke cijfers;
- rustige dashboards;
- een professionele maar toegankelijke uitstraling.

De UI mag payroll, loonberekening en financiële data helder maken zonder zwaar of afstandelijk aan te voelen.

---

## Kleurstrategie

Gebruik **oranje** als merk- en actiekleur, **navy** als basis voor vertrouwen en structuur, en **mint** als frisse accentkleur voor positieve feedback.

### Hoofdkleuren

| Rol | Naam | Hex | Gebruik |
|---|---|---:|---|
| Primary | Jaakie Orange | `#D83A18` | Logo, primaire knoppen, actieve states, highlights |
| Base | Deep Navy | `#131F37` | Hoofdtekst, titels, iconen, navigatie |
| Accent | Mint Green | `#1CD2A3` | Success states, positieve bedragen, badges, grafiekaccenten |
| Background | Soft White | `#FAFBFC` | App-achtergrond, dashboards |
| Surface | Pure White | `#FFFFFF` | Cards, panels, modals, formulieren |

---

## Uitgebreid kleurenpalet

### Primary — Jaakie Orange

| Token | Hex | Gebruik |
|---|---:|---|
| `orange-50` | `#FFF3EF` | Zeer lichte achtergrond, hover zones |
| `orange-100` | `#FFE0D6` | Subtiele alerts, chips, zachte badges |
| `orange-300` | `#F0764F` | Secundaire accenten |
| `orange-500` | `#D83A18` | Primaire merkleur |
| `orange-600` | `#B92F12` | Button hover |
| `orange-700` | `#8F230D` | Button pressed, donkere accenten |

### Navy — Trust & Structure

| Token | Hex | Gebruik |
|---|---:|---|
| `navy-50` | `#F3F6FA` | Achtergrondvlakken |
| `navy-100` | `#E5EAF2` | Borders, dividers |
| `navy-300` | `#8D9AAF` | Placeholdertekst, disabled states |
| `navy-500` | `#34425D` | Secundaire tekst |
| `navy-700` | `#1D2B46` | Navigatie, labels |
| `navy-900` | `#131F37` | Hoofdtekst, titels |

### Mint — Positive Accent

| Token | Hex | Gebruik |
|---|---:|---|
| `mint-50` | `#EFFFFA` | Success background |
| `mint-100` | `#CFF8EC` | Badges, zachte accenten |
| `mint-300` | `#5CE3BF` | Grafieken, illustraties |
| `mint-500` | `#1CD2A3` | Success, positieve highlights |
| `mint-600` | `#10A982` | Success hover/darker |
| `mint-700` | `#087F63` | Donkere success tekst |

---

## Functionele UI-kleuren

| Status | Token | Hex | Gebruik |
|---|---|---:|---|
| Success | `success` | `#1CD2A3` | Correcte berekening, positieve status |
| Warning | `warning` | `#F59E0B` | Aandacht nodig, ontbrekende data |
| Error | `error` | `#E11D48` | Fouten, validatieproblemen |
| Info | `info` | `#2563EB` | Informatieve meldingen |
| Border | `border` | `#E5EAF2` | Inputvelden, cards, tabellen |
| Muted Text | `text-muted` | `#6B7280` | Subtekst, toelichting |
| Disabled | `disabled` | `#CBD5E1` | Niet-actieve elementen |

> Gebruik warning en error apart van de merkleur. Zo voelt oranje niet automatisch als een foutkleur.

---

## Aanbevolen kleurgebruik

### Primaire knop

- Achtergrond: `#D83A18`
- Tekst: `#FFFFFF`
- Hover: `#B92F12`
- Pressed: `#8F230D`

### Secundaire knop

- Achtergrond: `#FFF3EF`
- Tekst: `#D83A18`
- Border: `#FFE0D6`

### Dashboard achtergrond

Gebruik:
- `#FAFBFC` voor algemene pagina-achtergrond;
- `#F3F6FA` voor zachte secties of dashboardzones.

### Cards

- Achtergrond: `#FFFFFF`
- Border: `#E5EAF2`
- Shadow: zacht en subtiel
- Radius: `16px`

### Belangrijke cijfers

Gebruik navy voor het bedrag en mint voor positieve indicatoren.

Voorbeeld:
- nettoloonbedrag: `#131F37`
- positieve status: `#10A982`
- stijging of correct-label: `#1CD2A3`

---

## Typografie

Gebruik een moderne, ronde sans-serif.

### Aanbevolen fonts

1. **Inter**  
   Beste keuze voor dashboards, tabellen en financiële data.

2. **Manrope**  
   Iets vriendelijker en ronder, goed voor marketingpagina’s.

3. **Nunito Sans**  
   Zachter en toegankelijker, minder zakelijk.

### Voorkeur

Voor jaakie wordt **Inter** aanbevolen als standaard UI-font.

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

## Typografische schaal

| Element | Grootte | Gewicht | Gebruik |
|---|---:|---:|---|
| Display | `56px–72px` | `800–900` | Hero headlines |
| H1 | `40px–56px` | `800` | Paginatitels |
| H2 | `28px–36px` | `800` | Sectiekoppen |
| H3 | `20px–24px` | `700` | Cardtitels |
| Body | `16px` | `400–500` | Normale tekst |
| Small | `14px` | `400–600` | Labels, meta-info |
| Caption | `12px` | `600–700` | Badges, kleine statuslabels |

---

## Border radius

Omdat het logo ronde, vriendelijke vormen heeft, gebruikt de UI zachte hoeken.

| Element | Radius |
|---|---:|
| Kleine elementen | `8px` |
| Buttons | `12px` |
| Inputvelden | `10px–12px` |
| Cards | `16px` |
| Modals | `20px–24px` |
| Badges / pills | `999px` |

---

## Spacing

Gebruik een eenvoudige schaal gebaseerd op 4px.

| Token | Waarde |
|---|---:|
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `20px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-10` | `40px` |
| `space-12` | `48px` |
| `space-16` | `64px` |

---

## Schaduwen

Gebruik zachte schaduwen. De UI moet licht en modern blijven.

| Token | Waarde | Gebruik |
|---|---|---|
| `shadow-sm` | `0 4px 12px rgba(19, 31, 55, 0.06)` | Kleine cards |
| `shadow-md` | `0 10px 28px rgba(19, 31, 55, 0.08)` | Panels |
| `shadow-lg` | `0 18px 45px rgba(19, 31, 55, 0.10)` | Hero cards, modals |

---

## Componentrichtlijnen

### Buttons

**Primary button**
- Gebruik voor de belangrijkste actie op een pagina.
- Maximaal één primaire knop per sectie.
- Kleur: `orange-500`

**Secondary button**
- Gebruik voor ondersteunende acties.
- Kleur: lichte orange achtergrond of witte achtergrond met border.

**Tertiary button**
- Gebruik als tekstlink of subtiele actie.
- Kleur: `navy-700` of `orange-500`.

---

### Inputs

Inputvelden moeten rustig en duidelijk zijn.

- Achtergrond: `#FFFFFF`
- Border: `#E5EAF2`
- Focus border: `#D83A18`
- Tekstkleur: `#131F37`
- Placeholder: `#8D9AAF`
- Radius: `10px–12px`

---

### Cards

Cards zijn de basis voor dashboards en berekeningen.

- Achtergrond: `#FFFFFF`
- Border: `#E5EAF2`
- Radius: `16px`
- Padding: `20px–24px`
- Shadow: `shadow-sm` of `shadow-md`

---

### Badges

Gebruik badges voor statussen zoals:
- `Gevalideerd`
- `Concept`
- `Ontbreekt`
- `Klaar`
- `Actief`

Voorbeelden:
- Success badge: mint achtergrond + donkere mint tekst
- Warning badge: zachte gele achtergrond + donkere gele tekst
- Error badge: zachte rode achtergrond + donkere rode tekst

---

## Tone of voice

De copy van jaakie is:
- helder;
- vriendelijk;
- professioneel;
- niet te technisch;
- geruststellend;
- actiegericht.

### Voorbeelden

Goed:
- “Berekening klaar”
- “Er ontbreken nog 2 gegevens”
- “Bekijk je nettoloon”
- “Controleer de simulatie”

Vermijd:
- “Payroll execution failed”
- “Invalid fiscal object”
- “Unknown error”
- “User action required”

---

## CSS design tokens

```css
:root {
  --color-primary: #D83A18;
  --color-primary-hover: #B92F12;
  --color-primary-pressed: #8F230D;
  --color-primary-soft: #FFF3EF;

  --color-navy-900: #131F37;
  --color-navy-700: #1D2B46;
  --color-navy-500: #34425D;
  --color-navy-300: #8D9AAF;
  --color-navy-100: #E5EAF2;
  --color-navy-50: #F3F6FA;

  --color-mint: #1CD2A3;
  --color-mint-dark: #10A982;
  --color-mint-soft: #EFFFFA;

  --color-background: #FAFBFC;
  --color-surface: #FFFFFF;
  --color-border: #E5EAF2;
  --color-text: #131F37;
  --color-text-muted: #6B7280;

  --color-success: #1CD2A3;
  --color-warning: #F59E0B;
  --color-error: #E11D48;
  --color-info: #2563EB;
  --color-disabled: #CBD5E1;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --shadow-sm: 0 4px 12px rgba(19, 31, 55, 0.06);
  --shadow-md: 0 10px 28px rgba(19, 31, 55, 0.08);
  --shadow-lg: 0 18px 45px rgba(19, 31, 55, 0.10);
}
```

---

## Korte samenvatting

Gebruik **oranje voor merk en actie**, **navy voor vertrouwen en structuur**, en **mint voor positieve feedback en frisse accenten**.

Zo blijft jaakie herkenbaar, professioneel en modern, zonder afstandelijk te worden.
