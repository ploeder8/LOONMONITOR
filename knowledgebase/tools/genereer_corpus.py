"""
Genereert 30 testcases voor de bruto-netto-validatie van de loonmotor PC 200.

Output:
  - /mnt/workspace/output/03_testcorpus_brutonetto.json
  - /mnt/workspace/output/03_testcorpus_brutonetto.md

Iedere case bevat:
  - id (TC-001..TC-030)
  - profielbeschrijving (NL)
  - input (LoonInput-veldwaarden)
  - berekend_netto (LoonResultaat — alle tussenstappen voor traceerbaarheid)
  - status_validatie: "pending" — wordt na vergelijking met
    FOD Fin Tax-Calc XLSX gewijzigd naar "ok", "kleine_afwijking" (≤ €15/maand)
    of "grote_afwijking" (> €15/maand).
  - tolerantie_marge_eur: aanvaardbare afwijking voor automatische validatie

Iedere case dekt een specifieke combinatie van factoren — zie bronnen_index
en netto_calculator_specificatie.md voor onderbouwing.
"""
import json
import sys
from dataclasses import asdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from calc_brutonetto_2026 import LoonInput, bereken_netto, werkgeverskost_maand


# =====================================================================
# 30 TESTCASES — representatieve doorsnede PC 200 bedienden 2026
# =====================================================================
# Categorieën:
#   A. Lage lonen / GGMMI / sociale werkbonus           (TC-001..TC-006)
#   B. Modale alleenstaanden                            (TC-007..TC-011)
#   C. Gezinnen / kinderen ten laste                    (TC-012..TC-017)
#   D. Hogere lonen / kaderleden                        (TC-018..TC-022)
#   E. Voordelen alle aard / bedrijfswagen              (TC-023..TC-026)
#   F. Randgevallen (50%-schijf, alleenstaande ouder)   (TC-027..TC-030)

CASES = [
    # --- A. Lage lonen / werkbonus ---------------------------------------
    {
        "id": "TC-001",
        "profiel": "Starter PC 200 op GGMMI vanaf 1/4/2026 (€2.189,81), alleenstaand, 0 kinderen",
        "input": {"bruto_maand": 2189.81},
        "test_focus": ["GGMMI hardvloer", "werkbonus volledige luiken A+B", "fiscale werkbonus 33,14%/52,54%"],
    },
    {
        "id": "TC-002",
        "profiel": "Junior bediende €2.300, alleenstaand, werkbonus volledig",
        "input": {"bruto_maand": 2300.00},
        "test_focus": ["werkbonus B in afbouw, A volledig"],
    },
    {
        "id": "TC-003",
        "profiel": "Bediende €2.500, alleenstaand — werkbonus A volledig, B in afbouw",
        "input": {"bruto_maand": 2500.00},
        "test_focus": ["werkbonus afbouwzone B"],
    },
    {
        "id": "TC-004",
        "profiel": "Bediende €2.800, alleenstaand — werkbonus A volledig, B nul",
        "input": {"bruto_maand": 2800.00},
        "test_focus": ["werkbonus B = 0", "A nog volledig"],
    },
    {
        "id": "TC-005",
        "profiel": "Bediende €3.000, alleenstaand — werkbonus A in afbouw, B nul",
        "input": {"bruto_maand": 3000.00},
        "test_focus": ["werkbonus A afbouwzone"],
    },
    {
        "id": "TC-006",
        "profiel": "Bediende €3.336,98 (cutoff luik A), werkbonus net 0",
        "input": {"bruto_maand": 3336.98},
        "test_focus": ["randwaarde werkbonus cutoff"],
    },

    # --- B. Modale alleenstaanden ----------------------------------------
    {
        "id": "TC-007",
        "profiel": "Modale bediende €3.500, alleenstaand, 0 kinderen",
        "input": {"bruto_maand": 3500.00},
        "test_focus": ["werkbonus = 0", "BBSZ-band 2"],
    },
    {
        "id": "TC-008",
        "profiel": "Bediende €4.000, alleenstaand",
        "input": {"bruto_maand": 4000.00},
        "test_focus": ["BBSZ-band 3 (3,38%-helling)"],
    },
    {
        "id": "TC-009",
        "profiel": "Bediende €4.500, alleenstaand",
        "input": {"bruto_maand": 4500.00},
        "test_focus": ["BBSZ-band 4"],
    },
    {
        "id": "TC-010",
        "profiel": "Bediende €5.000, alleenstaand",
        "input": {"bruto_maand": 5000.00},
        "test_focus": ["belastbaar in 45%-schijf"],
    },
    {
        "id": "TC-011",
        "profiel": "Bediende €5.500, alleenstaand",
        "input": {"bruto_maand": 5500.00},
        "test_focus": ["volledig in 45%-schijf"],
    },

    # --- C. Gezinnen / kinderen ------------------------------------------
    {
        "id": "TC-012",
        "profiel": "Bediende €2.500, gehuwd, 1 kind ten laste",
        "input": {"bruto_maand": 2500.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 1},
        "test_focus": ["BV-vermindering 1 kind", "toeslag belastingvrije som"],
    },
    {
        "id": "TC-013",
        "profiel": "Bediende €3.000, gehuwd, 2 kinderen",
        "input": {"bruto_maand": 3000.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 2},
        "test_focus": ["BV-vermindering 2 kinderen €154/m"],
    },
    {
        "id": "TC-014",
        "profiel": "Bediende €3.500, gehuwd, 2 kinderen waarvan 1 jonger dan 3",
        "input": {"bruto_maand": 3500.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 2, "kinderen_jonger_dan_3": 1},
        "test_focus": ["extra €760 voor kind <3 jaar"],
    },
    {
        "id": "TC-015",
        "profiel": "Bediende €4.000, gehuwd, 3 kinderen",
        "input": {"bruto_maand": 4000.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 3},
        "test_focus": ["belastingvrije som €11.720 toeslag", "BV-vermindering €414/m"],
    },
    {
        "id": "TC-016",
        "profiel": "Bediende €4.500, gehuwd, 4 kinderen",
        "input": {"bruto_maand": 4500.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 4},
        "test_focus": ["toeslag €18.970", "BV-vermindering €715/m"],
    },
    {
        "id": "TC-017",
        "profiel": "Bediende €3.500, alleenstaande ouder met 2 kinderen",
        "input": {"bruto_maand": 3500.00, "kinderen_ten_laste": 2, "alleenstaand_met_kinderen": True},
        "test_focus": ["extra basisbedrag alleenstaande ouder"],
    },

    # --- D. Hogere lonen / kaderleden ------------------------------------
    {
        "id": "TC-018",
        "profiel": "Senior bediende €6.000, alleenstaand",
        "input": {"bruto_maand": 6000.00},
        "test_focus": ["BBSZ-band 4", "raakt 50%-schijf op jaarbasis"],
    },
    {
        "id": "TC-019",
        "profiel": "Senior bediende €6.500, gehuwd",
        "input": {"bruto_maand": 6500.00, "burgerlijke_staat": "gehuwd_dubbel"},
        "test_focus": ["50%-schijf actief"],
    },
    {
        "id": "TC-020",
        "profiel": "Kaderlid €7.000, alleenstaand",
        "input": {"bruto_maand": 7000.00},
        "test_focus": ["BBSZ cap-zone naderend"],
    },
    {
        "id": "TC-021",
        "profiel": "Kaderlid €7.500, alleenstaand, 0 kinderen",
        "input": {"bruto_maand": 7500.00},
        "test_focus": ["50%-schijf grootste deel marginaal", "kostenforfait gecapt"],
    },
    {
        "id": "TC-022",
        "profiel": "Kaderlid €8.500, gehuwd, 2 kinderen",
        "input": {"bruto_maand": 8500.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 2},
        "test_focus": ["BBSZ cap €60,94", "kostenforfait max €6.070"],
    },

    # --- E. Voordelen alle aard / bedrijfswagen --------------------------
    {
        "id": "TC-023",
        "profiel": "Bediende €4.000 + bedrijfswagen VAA €180/m, alleenstaand",
        "input": {"bruto_maand": 4000.00, "vaa_bedrijfswagen": 180.00},
        "test_focus": ["VAA in belastbaar maar niet in cash"],
    },
    {
        "id": "TC-024",
        "profiel": "Bediende €5.000 + minimum-VAA bedrijfswagen €1.690/12 = €140,83/m, gehuwd, 1 kind",
        "input": {"bruto_maand": 5000.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 1, "vaa_bedrijfswagen": 140.83},
        "test_focus": ["minimum-VAA AJ 2027 €1.690"],
    },
    {
        "id": "TC-025",
        "profiel": "Kaderlid €7.000 + bedrijfswagen VAA €350/m + andere VAA €50/m",
        "input": {"bruto_maand": 7000.00, "vaa_bedrijfswagen": 350.00, "vaa_andere": 50.00},
        "test_focus": ["meervoudige VAA-optelling"],
    },
    {
        "id": "TC-026",
        "profiel": "Bediende €3.500 + groepsverzekering werknemersbijdrage €40/m (extra belastbaar)",
        "input": {"bruto_maand": 3500.00, "extra_belastbare_componenten": 40.00},
        "test_focus": ["extra belastbaar veld"],
    },

    # --- F. Randgevallen --------------------------------------------------
    {
        "id": "TC-027",
        "profiel": "Bediende €10.000, alleenstaand — top-tarief",
        "input": {"bruto_maand": 10000.00},
        "test_focus": ["50%-schijf overheersend", "BBSZ cap"],
    },
    {
        "id": "TC-028",
        "profiel": "Bediende €15.000, alleenstaand — extreem hoog (sanity check)",
        "input": {"bruto_maand": 15000.00},
        "test_focus": ["volledig 50%-schijf", "kostenforfait gecapt"],
    },
    {
        "id": "TC-029",
        "profiel": "Bediende €2.189,81 (GGMMI), alleenstaande ouder met 1 kind <3",
        "input": {"bruto_maand": 2189.81, "kinderen_ten_laste": 1, "kinderen_jonger_dan_3": 1, "alleenstaand_met_kinderen": True},
        "test_focus": ["combinatie GGMMI + kind <3 + alleenstaande ouder"],
    },
    {
        "id": "TC-030",
        "profiel": "Bediende €4.500, gehuwd, 5 kinderen waarvan 1 <3",
        "input": {"bruto_maand": 4500.00, "burgerlijke_staat": "gehuwd_dubbel", "kinderen_ten_laste": 5, "kinderen_jonger_dan_3": 1},
        "test_focus": ["> 4 kinderen extra-toeslag formule"],
    },
]


# =====================================================================
# GENERATIE
# =====================================================================

def bouw_corpus():
    corpus = []
    for case in CASES:
        li = LoonInput(**case["input"])
        res = bereken_netto(li)
        wgk = werkgeverskost_maand(li.bruto_maand)
        corpus.append({
            "id": case["id"],
            "profiel": case["profiel"],
            "test_focus": case["test_focus"],
            "input": case["input"],
            "berekend": asdict(res),
            "werkgeverskost": wgk,
            "status_validatie": "pending",
            "tolerantie_marge_eur": 5.00,
            "bron_formules": "calc_brutonetto_2026.py — peildatum 9 mei 2026",
        })
    return corpus


def schrijf_json(corpus, pad: Path):
    pad.write_text(json.dumps(corpus, indent=2, ensure_ascii=False), encoding="utf-8")


def schrijf_markdown(corpus, pad: Path):
    lines = [
        "# Testcorpus bruto-netto — PC 200 bedienden — inkomstenjaar 2026",
        "",
        "**Doel:** kalibratie en regressietesten voor de netto-rekenmodule van de loonmotor.",
        "",
        "**Peildatum formules:** 9 mei 2026 (sociale werkbonus geïndexeerd vanaf 1/4/2026, schalen AJ 2027).",
        "",
        "**Validatie-workflow:**",
        "1. Voer iedere case in op de **FOD Financiën Tax-Calc-simulator (XLSX, AJ 2027)** "
        "→ noteer het officiële netto.",
        "2. Vergelijk met `berekend.netto_maand` — afwijking ≤ €5/maand = `ok`, "
        "≤ €15/maand = `kleine_afwijking`, > €15/maand = `grote_afwijking`.",
        "3. Bij `grote_afwijking`: identificeer de afwijkende component "
        "(RSZ / BV / werkbonus / BBSZ) en pas `calc_brutonetto_2026.py` aan; her-genereer corpus.",
        "",
        "**BELANGRIJK:** de `berekend_netto`-kolom is een referentie-benadering "
        "met de gepubliceerde formules — niet de officiële Tax-Calc-output. "
        "De TypeScript-rekenmodule gebruikt sinds Golf 2 een lokale Bijlage III-sleutelformule "
        "met Group S-anker. Officiële FOD Tax-Calc waarden blijven de ground truth.",
        "",
        "## Samenvattende tabel",
        "",
        "| ID | Profiel | Bruto/m | RSZ-wn | Soc. werkbonus | Fisc. werkbonus | BV netto | BBSZ | **Netto/m** |",
        "|----|---------|--------:|-------:|---------------:|----------------:|---------:|-----:|------------:|",
    ]
    for c in corpus:
        b = c["berekend"]
        lines.append(
            f"| {c['id']} | {c['profiel'][:60]} | "
            f"{b['bruto_maand']:.2f} | {b['rsz_werknemer_netto']:.2f} | "
            f"{b['sociale_werkbonus_totaal']:.2f} | {b['fiscale_werkbonus']:.2f} | "
            f"{b['bedrijfsvoorheffing_netto']:.2f} | {b['bbsz']:.2f} | "
            f"**{b['netto_maand']:.2f}** |"
        )
    lines.append("")
    lines.append("## Detail per case")
    lines.append("")

    for c in corpus:
        b = c["berekend"]
        wgk = c["werkgeverskost"]
        lines.append(f"### {c['id']} — {c['profiel']}")
        lines.append("")
        lines.append(f"**Focus:** {', '.join(c['test_focus'])}")
        lines.append("")
        lines.append("**Input:**")
        lines.append("```json")
        lines.append(json.dumps(c["input"], indent=2, ensure_ascii=False))
        lines.append("```")
        lines.append("")
        lines.append("**Berekening (referentie-benadering):**")
        lines.append("")
        lines.append("| Component | Waarde |")
        lines.append("|---|---:|")
        lines.append(f"| Bruto maand | €{b['bruto_maand']:.2f} |")
        lines.append(f"| RSZ-werknemer (basis 13,07%) | €{b['rsz_werknemer_basis']:.2f} |")
        lines.append(f"| Sociale werkbonus luik A | €{b['sociale_werkbonus_luik_a']:.2f} |")
        lines.append(f"| Sociale werkbonus luik B | €{b['sociale_werkbonus_luik_b']:.2f} |")
        lines.append(f"| Sociale werkbonus totaal | €{b['sociale_werkbonus_totaal']:.2f} |")
        lines.append(f"| RSZ na werkbonus | €{b['rsz_werknemer_netto']:.2f} |")
        lines.append(f"| Belastbaar maandloon (incl. VAA) | €{b['belastbaar_loon_maand']:.2f} |")
        lines.append(f"| BV vóór gezinsverminderingen | €{b['bedrijfsvoorheffing_voor_verminderingen']:.2f} |")
        lines.append(f"| BV-vermindering kinderen | €{b['bv_vermindering_kinderen']:.2f} |")
        lines.append(f"| Fiscale werkbonus | €{b['fiscale_werkbonus']:.2f} |")
        lines.append(f"| BV netto | €{b['bedrijfsvoorheffing_netto']:.2f} |")
        lines.append(f"| BBSZ | €{b['bbsz']:.2f} |")
        lines.append(f"| **Netto maand (referentie)** | **€{b['netto_maand']:.2f}** |")
        lines.append(f"| Netto check op jaarbasis (× 12) | €{b['netto_check_jaar']:.2f} |")
        lines.append("")
        lines.append("**Werkgeverskost (zonder GV/MC/eco/hosp):**")
        lines.append("")
        lines.append("| Component | Waarde |")
        lines.append("|---|---:|")
        lines.append(f"| Bruto loon | €{wgk['bruto_maand']:.2f} |")
        lines.append(f"| RSZ-werkgever (~25%) | €{wgk['rsz_werkgever']:.2f} |")
        lines.append(f"| Sociaal Fonds 200 (0,23%) | €{wgk['sociaal_fonds_200']:.2f} |")
        lines.append(f"| Arbeidsongevallen-verzekering (~0,3%) | €{wgk['arbeidsongevallen_verzekering']:.2f} |")
        lines.append(f"| Provisie eindejaarspremie (~8,33%) | €{wgk['provisie_eindejaarspremie']:.2f} |")
        lines.append(f"| Provisie dubbel vakantiegeld (~6,67%) | €{wgk['provisie_dubbel_vakantiegeld']:.2f} |")
        lines.append(f"| **Totale loonkost werkgever** | **€{wgk['totale_loonkost_maand']:.2f}** |")
        lines.append(f"| Loonwig (totaal − bruto) / totaal | {wgk['loonwig_pct']}% |")
        lines.append("")
        if b["notities"]:
            lines.append("**Notities:**")
            for n in b["notities"]:
                lines.append(f"- {n}")
            lines.append("")
        lines.append(f"**Status validatie:** `{c['status_validatie']}` (tolerantie ±€{c['tolerantie_marge_eur']:.2f})")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("## Bronnen")
    lines.append("")
    lines.append("- **Sociale werkbonus 1/4/2026** — Partena Professional (snapshot 03), Securex Lex4you (snapshot 04)")
    lines.append("- **Belastingschalen AJ 2027 + belastingvrije som €11.180 + kostenforfait €6.070** — Practicali (snapshot 05), Wolters Kluwer Jef Wellens, Wet Diverse Bepalingen 18/12/2025 (BS 30/12/2025)")
    lines.append("- **GGMMI €2.189,81 vanaf 1/4/2026** — Acerta (snapshot 06), CAO 43/18 NAR 24/3/2026")
    lines.append("- **BBSZ-banden** — Liantis (snapshot 07), gevalideerd tegen Groups")
    lines.append("- **PC 200 indexering 2,21% + jaarlijkse premie €330,84 + Sociaal Fonds 200 0,23%** — sfonds200.be (snapshot 08)")
    lines.append("- **RSZ werknemer 13,07% + werkgever ~25%** — RSZ instructies werkgevers")
    lines.append("- **VAA bedrijfswagen min. €1.690 / ref-CO₂ 58/70 g/km AJ 2027** — Practicali")
    lines.append("")
    lines.append("Volledige bronnenarchief: `bronnen_pc200_loonmotor_2026.zip`.")
    lines.append("")
    pad.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    out_dir = Path("/mnt/workspace/output")
    out_dir.mkdir(exist_ok=True)
    corpus = bouw_corpus()
    schrijf_json(corpus, out_dir / "03_testcorpus_brutonetto.json")
    schrijf_markdown(corpus, out_dir / "03_testcorpus_brutonetto.md")
    print(f"Generated {len(corpus)} testcases.")
    print(f"  → {out_dir / '03_testcorpus_brutonetto.json'}")
    print(f"  → {out_dir / '03_testcorpus_brutonetto.md'}")
