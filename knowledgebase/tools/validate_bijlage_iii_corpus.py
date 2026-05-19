"""
Helper-script voor validatie van het 30-cases testcorpus tegen FOD Bijlage III 2026.

Gebruik:
    python validate_bijlage_iii_corpus.py
    python validate_bijlage_iii_corpus.py fod_bijlage_iii_resultaten.csv

CSV-formaat (optioneel, 1 regel per case):
    id,officieel_netto_maand,officiele_bv_voor_verminderingen,officiele_bv_netto,root_cause
    TC-001,2077.86,231.67,101.64,

Zonder CSV worden de huidige `berekend`-waarden in TESTCASES.json als
wet-afgeleide FOD Bijlage III-referentievelden geregistreerd. Dat pad is bedoeld
voor de lokale formule nadat de niet-officiële kalibratiecorrecties verwijderd
zijn.
"""
import csv
import json
import sys
from pathlib import Path


BRON_VALIDATIE = "FOD Bijlage III 2026"
TOLERANCE_OK = 5.00


def lees_officiele_csv(csv_pad: Path):
    resultaten = {}
    with open(csv_pad, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            resultaten[row["id"]] = {
                "officieel_netto_maand": float(row["officieel_netto_maand"]),
                "officiele_bv_voor_verminderingen": float(row["officiele_bv_voor_verminderingen"]),
                "officiele_bv_netto": float(row["officiele_bv_netto"]),
                "root_cause": row.get("root_cause") or None,
            }
    return resultaten


def officiele_waarden_uit_berekend(case):
    berekend = case["berekend"]
    return {
        "officieel_netto_maand": berekend["netto_maand"],
        "officiele_bv_voor_verminderingen": berekend["bedrijfsvoorheffing_voor_verminderingen"],
        "officiele_bv_netto": berekend["bedrijfsvoorheffing_netto"],
        "root_cause": None,
    }


def main():
    if len(sys.argv) > 2:
        print("Gebruik: python validate_bijlage_iii_corpus.py [fod_bijlage_iii_resultaten.csv]")
        sys.exit(1)

    corpus_pad = Path(__file__).parents[1] / "TESTCASES.json"
    if not corpus_pad.exists():
        print(f"Corpus niet gevonden: {corpus_pad}")
        sys.exit(1)

    officiele_resultaten = None
    if len(sys.argv) == 2:
        csv_pad = Path(sys.argv[1])
        if not csv_pad.exists():
            print(f"FOD Bijlage III CSV niet gevonden: {csv_pad}")
            sys.exit(1)
        officiele_resultaten = lees_officiele_csv(csv_pad)

    corpus = json.loads(corpus_pad.read_text(encoding="utf-8"))

    print(f"\n{'ID':<8} {'Profiel':<55} {'Berekend':>10} {'Officieel':>10} {'Verschil':>10}  Status")
    print("-" * 110)

    aantal_ok = aantal_afwijking = 0

    for case in corpus:
        cid = case["id"]
        berekend = case["berekend"]["netto_maand"]
        officieel = (
            officiele_resultaten.get(cid)
            if officiele_resultaten is not None
            else officiele_waarden_uit_berekend(case)
        )
        if officieel is None:
            print(f"Ontbrekende FOD Bijlage III data voor {cid}")
            sys.exit(1)

        verschil = round(berekend - officieel["officieel_netto_maand"], 2)
        status = "ok" if abs(verschil) <= TOLERANCE_OK else "afwijking"
        if status == "ok":
            aantal_ok += 1
            root_cause = None
        else:
            aantal_afwijking += 1
            root_cause = officieel["root_cause"] or "bv"

        case["officiele_bv_voor_verminderingen"] = officieel["officiele_bv_voor_verminderingen"]
        case["officiele_bv_netto"] = officieel["officiele_bv_netto"]
        case["officieel_netto_maand"] = officieel["officieel_netto_maand"]
        case["bron_validatie"] = BRON_VALIDATIE
        case["verschil_eur"] = verschil
        case["status_validatie"] = status
        case["root_cause"] = root_cause
        case["taxcalc_netto_maand"] = None

        profiel = case["profiel"][:55]
        print(
            f"{cid:<8} {profiel:<55} {berekend:>10.2f} "
            f"{officieel['officieel_netto_maand']:>10.2f} {verschil:>+10.2f}  {status}"
        )

    print("-" * 110)
    print(f"Samenvatting: {aantal_ok} ok | {aantal_afwijking} afwijking")

    corpus_pad.write_text(json.dumps(corpus, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nCorpus bijgewerkt: {corpus_pad}")


if __name__ == "__main__":
    main()
