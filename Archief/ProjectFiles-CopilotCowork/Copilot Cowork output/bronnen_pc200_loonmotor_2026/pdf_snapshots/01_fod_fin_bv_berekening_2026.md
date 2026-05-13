# SNAPSHOT — FOD Financiën — Berekening Bedrijfsvoorheffing 2026

**Bron:** https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/bedrijfsvoorheffing/berekening
**Snapshot-datum:** 9 mei 2026
**Tier:** 1 (officieel)

---

## Bedrijfsvoorheffing 2026 — directe links naar KB-documenten

De officiële BV-berekening voor inkomstenjaar 2026 is gepubliceerd op de FOD Fin-pagina. Volg de externe links voor:

- **Regels 1 januari 2026** — KB 11 december 2025 (BS 29 december 2025)
- **Sleutelformule vanaf 1 januari 2026** (PDF op FOD Fin-portaal)
- **Simulator — Bedrijfsvoorheffing 2026** (XLSX, downloadbaar)

## Historische versies (voor regressie-tests en backtest)

De pagina bevat ook alle voorgaande jaren (2011-2025), telkens met:
- Regels (KB-publicatie)
- Schalen
- Sleutelformule

Voor de loonmonitor zijn **2024**, **2025** en **2026** relevant als testbasis.

## Gebruik in de loonmonitor

1. Eerste fase POC → directe doorlinking naar de simulator (XLSX) als referentie.
2. Tweede fase POC → eigen TypeScript-implementatie van de sleutelformule volgens het KB; valideren tegen de XLSX-simulator (≤ €2 afwijking voor representatieve testcases).

> **Belangrijk:** wijzigingen in de Wet Diverse Bepalingen 18.12.2025 (BS 30.12.2025) zijn al verwerkt in de Bijlage III van inkomstenjaar 2026. Verifieer dit altijd in de definitieve KB-tekst.
