# Bronnenarchief — Loonmonitor PC 200 (inkomstenjaar 2026)

**Peildatum:** 9 mei 2026
**Doel:** alle primaire en secundaire bronnen die geciteerd zijn in de output-deliverables (`netto_calculator_specificatie.md`, `dataset_uitbreiding_voorstel.md`, `sources_guideline.md`, `01_research_payroll_regelkader_2026.md`, `02_research_netto_calculator_ingredienten.md`) op één plek bundelen.

## Structuur van dit archief

```
bronnen_pc200_loonmonitor_2026.zip
├── 00_LEES_MIJ.md                         ← dit bestand
├── bronnen_index.md                       ← MASTER-index, gegroepeerd per Tier en topic
├── tier1_overheid/                        ← .url-snelkoppelingen naar overheidsbronnen
│   ├── *.url                              (FOD Fin, RSZ, BS, sociale zekerheid)
├── tier2_secretariaten/                   ← .url-snelkoppelingen naar Big-4 + secretariaten
│   ├── *.url                              (Securex, Acerta, Partena, SD Worx, Liantis, Attentia)
├── tier3_overig/                          ← .url-snelkoppelingen naar overige bronnen
│   ├── *.url                              (vakbonden, blogs, Wikipedia)
├── calculators/                           ← .url-snelkoppelingen naar referentie-rekenmodules
│   └── *.url                              (FOD Fin Tax-Calc, Find My Bonus, etc.)
└── pdf_snapshots/                         ← gedownloade HTML/PDF-snapshots (waar beschikbaar)
    └── *.html / *.pdf
```

## Waarom .url-bestanden i.p.v. PDF's?

Het overgrote deel van de Belgische fiscale en sociale primaire bronnen is **online HTML-content** op overheidsportalen (financien.belgium.be, socialsecurity.be, sfonds200.be) en niet als standalone PDF gepubliceerd. KB's en wetten zijn beschikbaar via Belgisch Staatsblad (ejustice.just.fgov.be) maar vereisen specifieke zoekparameters.

De `.url`-snelkoppelingen in dit archief openen rechtstreeks de officiële bron — dat garandeert dat je altijd de **actuele versie** raadpleegt (cruciaal omdat tarieven jaarlijks wijzigen via indexatie en programmawetten).

In `pdf_snapshots/` vind je waar mogelijk een opgehaalde HTML/PDF-kopie van de pagina op peildatum 9 mei 2026 — handig als referentie maar niet authoritatief; raadpleeg altijd de live-bron via `bronnen_index.md`.

## Hoe te gebruiken

1. **Snel iets opzoeken?** → open `bronnen_index.md` en zoek op trefwoord (BV, RSZ, werkbonus, VAA, …).
2. **Een bron citeren in een rapport?** → klik op de `.url` in `tier1_overheid/`, kopieer de definitieve URL en de toegangsdatum.
3. **Off-line werken?** → kijk in `pdf_snapshots/` of er een lokale kopie is; zo niet, kopieer de pagina handmatig.

## Onderhoud

Werk dit archief bij na elk van de [triggers in de hoofdskill `belgisch-belastingsysteem`](https://github.com/) — nieuwe Programmawet, nieuwe FOD-circulaire, jaarlijkse indexatie in januari.
