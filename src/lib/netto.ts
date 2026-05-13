import { round2 } from "@/lib/money";
import { rszBijdragen, type RszResultaat } from "@/lib/rsz";
import { werkbonus, type WerkbonusResultaat } from "@/lib/werkbonus";
import { bbsz, type BbszResultaat } from "@/lib/bbsz";
import { berekenBV, type BvResultaat, type GezinsType } from "@/lib/bv";

export type { GezinsType };

const FISCALE_WERKBONUS_PCT_LUIK_A = 0.3314;
const FISCALE_WERKBONUS_PCT_LUIK_B = 0.5254;

export interface NettoInput {
  brutoloon: number;
  refDatum: string;
  bouwVlag?: boolean;
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  kinderenOnder3?: number;
  fiscaalAlleenstaandeMetKind?: boolean;
  groepsverzekeringEigenBijdrage?: number;
  maaltijdchequeWerknemersbijdragePerDag?: number;
  maaltijdchequeWerkdagen?: number;
  woonwerkVrijgesteldPerMaand?: number;
  hospitalisatieEigenBijdrage?: number;
  onkostenvergoedingPerMaand?: number;
  vaaBedrijfswagenPerMaand?: number;
}

export interface NettoResultaat {
  brutoloon: number;
  rsz: RszResultaat;
  werkbonus: WerkbonusResultaat;
  fiscaleWerkbonus: number;        // 33,14% × Luik A + 52,54% × Luik B
  effectieveRsz: number;
  belastbaarMaandloon: number;
  belastbaarMaandloonVoorBV: number;
  woonwerkVrijgesteldPerMaand: number;
  vaaBedrijfswagenPerMaand: number;
  bbsz: BbszResultaat;
  bv: BvResultaat;
  maaltijdchequeWerknemersbijdragePerDag: number;
  maaltijdchequeWerkdagen: number;
  maaltijdchequeWerknemersbijdrage: number;
  hospitalisatieEigenBijdrage: number;
  onkostenvergoedingPerMaand: number;
  nettoloon: number;
}

export function berekenNetto(input: NettoInput): NettoResultaat {
  const {
    brutoloon,
    refDatum,
    bouwVlag = false,
    gezinstype,
    kinderenTenLaste,
    kinderenOnder3 = 0,
    fiscaalAlleenstaandeMetKind = false,
    groepsverzekeringEigenBijdrage = 0,
    maaltijdchequeWerknemersbijdragePerDag = 0,
    maaltijdchequeWerkdagen = 0,
    woonwerkVrijgesteldPerMaand = 0,
    hospitalisatieEigenBijdrage = 0,
    onkostenvergoedingPerMaand = 0,
    vaaBedrijfswagenPerMaand = 0,
  } = input;

  const rszR = rszBijdragen({ brutoloon, refDatum, bouwVlag });
  const werkbonusR = werkbonus({ brutoloon, refDatum });
  const bbszR = bbsz({ brutoloon });

  // Effective RSZ = statutory RSZ minus social bonus (werkbonus), minimum 0
  const effectieveRsz = round2(Math.max(0, rszR.werknemerBijdrage - werkbonusR.totaal));
  const belastbaarMaandloon = round2(brutoloon - effectieveRsz);
  const belastbaarMaandloonVoorBV = round2(
    belastbaarMaandloon + Math.max(vaaBedrijfswagenPerMaand, 0),
  );

  // Fiscale werkbonus = belastingkrediet op de BV (33,14% × Luik A + 52,54% × Luik B)
  const fiscaleWerkbonus = round2(
    FISCALE_WERKBONUS_PCT_LUIK_A * werkbonusR.luikA +
      FISCALE_WERKBONUS_PCT_LUIK_B * werkbonusR.luikB,
  );

  const bvR = berekenBV({
    belastbaarMaandloon: belastbaarMaandloonVoorBV,
    gezinstype,
    kinderenTenLaste,
    kinderenOnder3,
    fiscaalAlleenstaandeMetKind,
    groepsverzekeringEigenBijdrage,
    fiscaleWerkbonusKrediet: fiscaleWerkbonus,
  });

  const maaltijdchequeWerknemersbijdrage = round2(
    Math.max(maaltijdchequeWerknemersbijdragePerDag, 0) *
      Math.max(maaltijdchequeWerkdagen, 0),
  );
  const maaltijdchequeBijdragePerDag = round2(
    Math.max(maaltijdchequeWerknemersbijdragePerDag, 0),
  );
  const maaltijdchequeDagen = Math.max(maaltijdchequeWerkdagen, 0);
  const hospitalisatieEigenBijdrageBedrag = round2(Math.max(hospitalisatieEigenBijdrage, 0));
  const onkostenvergoedingBedrag = round2(Math.max(onkostenvergoedingPerMaand, 0));

  const nettoloon = round2(
    brutoloon -
      effectieveRsz -
      bvR.bvNaVerminderingen -
      bbszR.maandelijksBedrag -
      maaltijdchequeWerknemersbijdrage +
      Math.max(woonwerkVrijgesteldPerMaand, 0) -
      hospitalisatieEigenBijdrageBedrag +
      onkostenvergoedingBedrag,
  );

  return {
    brutoloon,
    rsz: rszR,
    werkbonus: werkbonusR,
    fiscaleWerkbonus,
    effectieveRsz,
    belastbaarMaandloon,
    belastbaarMaandloonVoorBV,
    woonwerkVrijgesteldPerMaand: round2(Math.max(woonwerkVrijgesteldPerMaand, 0)),
    vaaBedrijfswagenPerMaand: round2(Math.max(vaaBedrijfswagenPerMaand, 0)),
    bbsz: bbszR,
    bv: bvR,
    maaltijdchequeWerknemersbijdragePerDag: maaltijdchequeBijdragePerDag,
    maaltijdchequeWerkdagen: maaltijdchequeDagen,
    maaltijdchequeWerknemersbijdrage,
    hospitalisatieEigenBijdrage: hospitalisatieEigenBijdrageBedrag,
    onkostenvergoedingPerMaand: onkostenvergoedingBedrag,
    nettoloon,
  };
}
