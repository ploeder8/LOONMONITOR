"""
Bruto-netto rekenmodule voor inkomstenjaar 2026 (PC 200 bedienden).

Doel: éénduidige, gedocumenteerde computatie van het verwachte netto
voor de 30 testcases. Iedere component is traceerbaar naar een
expliciete bron — zie bronnen_index.md in het bronnen-archief.

BELANGRIJK: deze Python-module is een legacy REFERENTIE-BENADERING met de
gepubliceerde formules. De TypeScript-module bevat sinds Golf 2 de lokale
Bijlage III-sleutelformule. De definitieve "ground truth" blijft FOD Fin
FOD Bijlage III 2026.
Gebruik validate_bijlage_iii_corpus.py om afwijkingen te flaggen.

Auteur: Loonmotor PC 200 — Golf 1
Peildatum formules: 1 april 2026 (sociale werkbonus geïndexeerd)
"""
from dataclasses import dataclass, asdict, field
from typing import Optional


# =====================================================================
# CONSTANTEN — INKOMSTENJAAR 2026 / AANSLAGJAAR 2027
# =====================================================================

RSZ_WERKNEMER_PCT = 0.1307  # bedienden privé

# Sociale werkbonus 1/4/2026 — bedienden (Partena, Securex Lex4you)
WERKBONUS_LUIK_A_R = 125.04
WERKBONUS_LUIK_A_S0 = 2880.32
WERKBONUS_LUIK_A_HELLING = 0.2738
WERKBONUS_LUIK_A_CUTOFF = 3336.98

WERKBONUS_LUIK_B_R = 168.62
WERKBONUS_LUIK_B_S0 = 2255.50
WERKBONUS_LUIK_B_HELLING = 0.2699
WERKBONUS_LUIK_B_CUTOFF = 2880.32

# Fiscale werkbonus (huidig regime — Arizona-verhoging tot 35/63% nog pending)
FISCALE_WERKBONUS_LUIK_A_PCT = 0.3314
FISCALE_WERKBONUS_LUIK_B_PCT = 0.5254

# Belastingschijven AJ 2027 (Practicali, Wolters Kluwer Jef Wellens)
PB_SCHIJVEN_AJ2027 = [
    (16720.00, 0.25),
    (29510.00, 0.40),
    (51070.00, 0.45),
    (float('inf'), 0.50),
]

# Belastingvrije som AJ 2027 — basisbedrag
BELASTINGVRIJE_SOM_AJ2027 = 11180.00

# Barema belastingvrije som AJ 2027
BAREMA_VRIJSTELLING = [
    (11750.00, 0.25),
    (16720.00, 0.30),
    (27860.00, 0.40),
    (51070.00, 0.45),
    (float('inf'), 0.50),
]

# Forfaitaire beroepskosten werknemers AJ 2027
KOSTENFORFAIT_PCT = 0.30
KOSTENFORFAIT_MAX = 6070.00

# Verhoogde belastingvrije som per kind ten laste (huidig regime AJ 2027)
TOESLAG_KINDEREN = {
    1: 2030.00,
    2: 5230.00,
    3: 11720.00,
    4: 18970.00,
    # > 4: + €7.240 per extra kind
}
TOESLAG_KIND_EXTRA = 7240.00

# BV-vermindering voor kinderen ten laste — vereenvoudigde maandtabel
# (Bijlage III KB 11/12/2025 sectie "verminderingen voor gezinslasten")
# Deze waarden zijn benaderingen voor lonen € 2.000 - € 7.500 — voor randgevallen
# de exacte tabel raadplegen.
BV_VERMINDERING_KINDEREN_PER_MAAND = {
    1: 56.00,
    2: 154.00,
    3: 414.00,
    4: 715.00,
    5: 1019.00,
    6: 1322.00,
    7: 1626.00,
    8: 1930.00,
}

# BBSZ-banden (kwartaal-omgezet naar maand) — individuele aanslag
# Bron: Liantis (snapshot 07), gevalideerd tegen Groups
def bbsz_maand(maandloon: float) -> float:
    """Maandelijkse inhouding BBSZ — individuele aanslag (alleenstaand of
    één-inkomensgezin via gemeenschappelijke aanslag).
    """
    if maandloon < 1945.39:
        return 0.0
    if maandloon <= 2190.18:
        return 0.0422 * (maandloon - 1945.38)
    if maandloon <= 3737.00:
        return 10.33 + 0.011 * (maandloon - 2190.18)
    if maandloon <= 4100.00:
        return 27.35 + 0.0338 * (maandloon - 3737.00)
    if maandloon <= 6038.82:
        return 39.61 + 0.011 * (maandloon - 4100.00)
    return 60.94


# =====================================================================
# DEELFUNCTIES
# =====================================================================

def sociale_werkbonus(maandloon: float) -> tuple[float, float, float]:
    """Returns (luik_A, luik_B, totaal) voor bedienden vanaf 1/4/2026."""
    # Luik A
    if maandloon <= WERKBONUS_LUIK_A_S0:
        a = WERKBONUS_LUIK_A_R
    elif maandloon <= WERKBONUS_LUIK_A_CUTOFF:
        a = WERKBONUS_LUIK_A_R - WERKBONUS_LUIK_A_HELLING * (maandloon - WERKBONUS_LUIK_A_S0)
    else:
        a = 0.0
    # Luik B
    if maandloon <= WERKBONUS_LUIK_B_S0:
        b = WERKBONUS_LUIK_B_R
    elif maandloon <= WERKBONUS_LUIK_B_CUTOFF:
        b = WERKBONUS_LUIK_B_R - WERKBONUS_LUIK_B_HELLING * (maandloon - WERKBONUS_LUIK_B_S0)
    else:
        b = 0.0
    return round(max(a, 0), 2), round(max(b, 0), 2), round(max(a, 0) + max(b, 0), 2)


def fiscale_werkbonus(luik_a: float, luik_b: float) -> float:
    return round(FISCALE_WERKBONUS_LUIK_A_PCT * luik_a + FISCALE_WERKBONUS_LUIK_B_PCT * luik_b, 2)


def kostenforfait(jaarloon_belastbaar: float) -> float:
    return round(min(KOSTENFORFAIT_PCT * jaarloon_belastbaar, KOSTENFORFAIT_MAX), 2)


def belasting_progressief(belastbaar: float, schijven=PB_SCHIJVEN_AJ2027) -> float:
    """Pas progressieve schijven toe."""
    belasting = 0.0
    vorige = 0.0
    for grens, pct in schijven:
        if belastbaar <= grens:
            belasting += (belastbaar - vorige) * pct
            return round(belasting, 2)
        belasting += (grens - vorige) * pct
        vorige = grens
    return round(belasting, 2)


def belastingvrije_som_jaar(kinderen: int, alleenstaand_met_kinderen: bool = False) -> float:
    """Totale belastingvrije som incl. toeslagen kinderen."""
    som = BELASTINGVRIJE_SOM_AJ2027
    if kinderen == 0:
        return som
    if kinderen <= 4:
        som += TOESLAG_KINDEREN[kinderen]
    else:
        som += TOESLAG_KINDEREN[4] + (kinderen - 4) * TOESLAG_KIND_EXTRA
    if alleenstaand_met_kinderen:
        som += 2030.00  # huidig basisbedrag AJ 2027
    return som


def belastingvermindering_op_vrije_som(vrije_som: float) -> float:
    """Pas barema belastingvrije som toe."""
    return belasting_progressief(vrije_som, BAREMA_VRIJSTELLING)


def bv_vermindering_kinderen_maand(kinderen: int) -> float:
    if kinderen == 0:
        return 0.0
    if kinderen >= 8:
        return BV_VERMINDERING_KINDEREN_PER_MAAND[8] + (kinderen - 8) * 304.0
    return BV_VERMINDERING_KINDEREN_PER_MAAND.get(kinderen, 0.0)


# =====================================================================
# HOOFDFUNCTIE — netto maandloon
# =====================================================================

@dataclass
class LoonInput:
    bruto_maand: float
    burgerlijke_staat: str = "alleenstaand"  # alleenstaand | gehuwd_alleen | gehuwd_dubbel
    kinderen_ten_laste: int = 0
    kinderen_jonger_dan_3: int = 0  # documentair/pending; niet gebruikt in actieve calculatorlogica
    alleenstaand_met_kinderen: bool = False
    voltijds: bool = True
    vaa_bedrijfswagen: float = 0.0
    vaa_andere: float = 0.0
    extra_belastbare_componenten: float = 0.0  # bv. groepsverz wn deel, …


@dataclass
class LoonResultaat:
    bruto_maand: float
    rsz_werknemer_basis: float
    sociale_werkbonus_luik_a: float
    sociale_werkbonus_luik_b: float
    sociale_werkbonus_totaal: float
    rsz_werknemer_netto: float
    belastbaar_loon_maand: float
    bedrijfsvoorheffing_voor_verminderingen: float
    bv_vermindering_kinderen: float
    fiscale_werkbonus: float
    bedrijfsvoorheffing_netto: float
    bbsz: float
    netto_maand: float
    netto_check_jaar: float
    notities: list = field(default_factory=list)


def bereken_netto(li: LoonInput) -> LoonResultaat:
    notities = []
    bruto = li.bruto_maand
    vaa_totaal = li.vaa_bedrijfswagen + li.vaa_andere

    # 1. RSZ werknemer
    rsz_basis = round(bruto * RSZ_WERKNEMER_PCT, 2)
    a, b, sw_totaal = sociale_werkbonus(bruto)
    rsz_netto = round(rsz_basis - sw_totaal, 2)
    if rsz_netto < 0:
        rsz_netto = 0.0
        notities.append("RSZ-vermindering geplafonneerd op 0")

    # 2. Belastbaar loon (maandelijks)
    belastbaar_maand = round(bruto - rsz_netto + vaa_totaal + li.extra_belastbare_componenten, 2)

    # 3. Bedrijfsvoorheffing — geannualiseerde benadering (niet sleutelformule KB)
    #    Wettelijk: BV per maand via Bijlage III. We gebruiken hier:
    #      jaarbasis = belastbaar_maand × 12
    #      − kostenforfait
    #      → progressieve schijven AJ 2027
    #      − belastingvermindering belastingvrije som
    #      / 12 = maandelijkse BV vóór gezinsverminderingen
    jaar_belastbaar = belastbaar_maand * 12
    forfait = kostenforfait(jaar_belastbaar)
    netto_belastbaar_jaar = jaar_belastbaar - forfait
    belasting_jaar = belasting_progressief(netto_belastbaar_jaar)

    vrije_som = belastingvrije_som_jaar(
        li.kinderen_ten_laste,
        li.alleenstaand_met_kinderen,
    )
    vermind_jaar = belastingvermindering_op_vrije_som(vrije_som)

    bv_jaar = max(0, belasting_jaar - vermind_jaar)
    bv_voor_kinderen = round(bv_jaar / 12, 2)

    # 4. Maand-BV-vermindering kinderen (extra bovenop belastingvrije som)
    bv_kinderen_korting = bv_vermindering_kinderen_maand(li.kinderen_ten_laste)

    # 5. Fiscale werkbonus
    fwb = fiscale_werkbonus(a, b)

    bv_netto = round(max(0, bv_voor_kinderen - bv_kinderen_korting - fwb), 2)

    # 6. BBSZ
    bbsz = round(bbsz_maand(bruto), 2)
    if li.burgerlijke_staat == "gehuwd_dubbel":
        notities.append(
            "BBSZ benadering: bij twee inkomens kan band en bedrag verschillen — "
            "definitieve afrekening in PB-aangifte AJ 2027."
        )

    # 7. Netto
    netto = round(bruto - rsz_netto - bv_netto - bbsz - vaa_totaal, 2)
    # VAA wordt niet uitbetaald maar wel belast → niet aftrekken bovenop bruto;
    # we passen aan: VAA telt mee in belastbaar loon, niet in cashloon.
    # Dus: netto_cash = bruto - RSZ - BV - BBSZ. (VAA is beloning in natura, geen geld).
    netto = round(bruto - rsz_netto - bv_netto - bbsz, 2)

    return LoonResultaat(
        bruto_maand=bruto,
        rsz_werknemer_basis=rsz_basis,
        sociale_werkbonus_luik_a=a,
        sociale_werkbonus_luik_b=b,
        sociale_werkbonus_totaal=sw_totaal,
        rsz_werknemer_netto=rsz_netto,
        belastbaar_loon_maand=belastbaar_maand,
        bedrijfsvoorheffing_voor_verminderingen=bv_voor_kinderen,
        bv_vermindering_kinderen=bv_kinderen_korting,
        fiscale_werkbonus=fwb,
        bedrijfsvoorheffing_netto=bv_netto,
        bbsz=bbsz,
        netto_maand=netto,
        netto_check_jaar=round(netto * 12, 2),
        notities=notities,
    )


# =====================================================================
# WERKGEVERSKOST
# =====================================================================

# Werkgevers-RSZ profitsector
RSZ_WERKGEVER_BASIS_PCT = 0.25
SOCIAAL_FONDS_200_PCT = 0.0023
ARBEIDSONGEVALLEN_VERZEKERING_PCT = 0.003  # benadering bedienden bureau (sector-afhankelijk)

# Provisies (jaarbasis omgezet naar % brutoloon)
PROVISIE_EINDEJAARSPREMIE_PCT = 0.0833  # ~13e maand / 12
PROVISIE_DUBBEL_VAKANTIEGELD_PCT = 0.0667  # 92% × bruto / 12 (benadering dubbel VG bedienden)


def werkgeverskost_maand(bruto_maand: float, *,
                          structurele_vermindering: float = 0.0,
                          extra_voordelen: float = 0.0) -> dict:
    """Totale loonkost werkgever — exclusief eventuele groepsverzekering, MC, ECO, hosp."""
    rsz_wg = round(bruto_maand * RSZ_WERKGEVER_BASIS_PCT, 2)
    sf200 = round(bruto_maand * SOCIAAL_FONDS_200_PCT, 2)
    ao = round(bruto_maand * ARBEIDSONGEVALLEN_VERZEKERING_PCT, 2)
    eindejaarspremie_provisie = round(bruto_maand * PROVISIE_EINDEJAARSPREMIE_PCT, 2)
    vakantiegeld_provisie = round(bruto_maand * PROVISIE_DUBBEL_VAKANTIEGELD_PCT, 2)
    totaal = round(
        bruto_maand
        + rsz_wg + sf200 + ao
        + eindejaarspremie_provisie + vakantiegeld_provisie
        + extra_voordelen
        - structurele_vermindering,
        2
    )
    return {
        "bruto_maand": bruto_maand,
        "rsz_werkgever": rsz_wg,
        "sociaal_fonds_200": sf200,
        "arbeidsongevallen_verzekering": ao,
        "provisie_eindejaarspremie": eindejaarspremie_provisie,
        "provisie_dubbel_vakantiegeld": vakantiegeld_provisie,
        "extra_voordelen": extra_voordelen,
        "structurele_vermindering": structurele_vermindering,
        "totale_loonkost_maand": totaal,
        "loonwig_pct": round((totaal - bruto_maand) / totaal * 100, 1) if totaal > 0 else 0,
    }


if __name__ == "__main__":
    # Sanity check
    r = bereken_netto(LoonInput(bruto_maand=3000.00))
    print(f"Bruto €3000 alleenstaand → netto {r.netto_maand}")
    r = bereken_netto(LoonInput(bruto_maand=2500.00, kinderen_ten_laste=2))
    print(f"Bruto €2500 + 2 kinderen → netto {r.netto_maand}")
    print(werkgeverskost_maand(3000))
