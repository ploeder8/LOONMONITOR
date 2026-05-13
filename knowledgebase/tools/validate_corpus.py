"""
Helper-script voor cross-validatie van het 30-cases testcorpus tegen FOD Fin Tax-Calc.

Gebruik:
    python3 validate_corpus.py taxcalc_resultaten.csv

CSV-formaat (1 regel per case):
    id,taxcalc_netto_maand,root_cause
    TC-001,1923.45,bv
    TC-002,2010.78,afronding
    ...

Output:
    - Console-tabel met afwijkingen en status (ok / kleine_afwijking / grote_afwijking)
    - Bijgewerkte ../TESTCASES.json met `taxcalc_netto_maand`
      en `status_validatie` per case

Tolerantiegrenzen:
    ≤ €5    → "ok"
    ≤ €15   → "kleine_afwijking"
    > €15   → "grote_afwijking"
"""
import csv
import json
import sys
from pathlib import Path


TOLERANCE_OK = 5.00
TOLERANCE_KLEIN = 15.00


def main():
    if len(sys.argv) != 2:
        print("Gebruik: python3 validate_corpus.py <taxcalc_resultaten.csv>")
        sys.exit(1)

    taxcalc_pad = Path(sys.argv[1])
    corpus_pad = Path(__file__).parents[1] / "TESTCASES.json"

    if not taxcalc_pad.exists():
        print(f"Tax-Calc CSV niet gevonden: {taxcalc_pad}")
        sys.exit(1)
    if not corpus_pad.exists():
        print(f"Corpus niet gevonden: {corpus_pad}")
        sys.exit(1)

    # Lees Tax-Calc resultaten
    taxcalc = {}
    with open(taxcalc_pad, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            taxcalc[row["id"]] = {
                "netto": float(row["taxcalc_netto_maand"]),
                "root_cause": row.get("root_cause") or None,
            }

    # Lees corpus
    corpus = json.loads(corpus_pad.read_text(encoding="utf-8"))

    print(f"\n{'ID':<8} {'Profiel':<55} {'Berekend':>10} {'TaxCalc':>10} {'Verschil':>10}  Status")
    print("-" * 110)

    aantal_ok = aantal_klein = aantal_groot = aantal_geen_data = 0

    for case in corpus:
        cid = case["id"]
        berekend = case["berekend"]["netto_maand"]
        taxcalc_resultaat = taxcalc.get(cid)
        taxcalc_netto = taxcalc_resultaat["netto"] if taxcalc_resultaat else None

        if taxcalc_netto is None:
            status = "pending"
            verschil = None
            aantal_geen_data += 1
        else:
            verschil = berekend - taxcalc_netto
            abs_verschil = abs(verschil)
            if abs_verschil <= TOLERANCE_OK:
                status = "ok"
                aantal_ok += 1
            elif abs_verschil <= TOLERANCE_KLEIN:
                status = "kleine_afwijking"
                aantal_klein += 1
            else:
                status = "grote_afwijking"
                aantal_groot += 1

        case["taxcalc_netto_maand"] = taxcalc_netto
        case["verschil_eur"] = verschil
        case["status_validatie"] = status
        if taxcalc_netto is None:
            case["root_cause"] = "pending_taxcalc"
        elif status == "ok":
            case["root_cause"] = None
        else:
            case["root_cause"] = taxcalc_resultaat["root_cause"] or "bv"

        profiel = case["profiel"][:55]
        if taxcalc_netto is None:
            print(f"{cid:<8} {profiel:<55} {berekend:>10.2f} {'—':>10} {'—':>10}  {status}")
        else:
            print(f"{cid:<8} {profiel:<55} {berekend:>10.2f} {taxcalc_netto:>10.2f} {verschil:>+10.2f}  {status}")

    print("-" * 110)
    print(f"Samenvatting: {aantal_ok} ok | {aantal_klein} klein | {aantal_groot} groot | {aantal_geen_data} zonder Tax-Calc data")

    # Schrijf bijgewerkt corpus
    corpus_pad.write_text(json.dumps(corpus, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nCorpus bijgewerkt: {corpus_pad}")


if __name__ == "__main__":
    main()
