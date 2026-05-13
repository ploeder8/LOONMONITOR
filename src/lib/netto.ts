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
}

export interface NettoResultaat {
  brutoloon: number;
  rsz: RszResultaat;
  werkbonus: WerkbonusResultaat;
  fiscaleWerkbonus: number;        // 33,14% × Luik A + 52,54% × Luik B
  effectieveRsz: number;
  belastbaarMaandloon: number;
  bbsz: BbszResultaat;
  bv: BvResultaat;
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
  } = input;

  const rszR = rszBijdragen({ brutoloon, refDatum, bouwVlag });
  const werkbonusR = werkbonus({ brutoloon, refDatum });
  const bbszR = bbsz({ brutoloon });

  // Effective RSZ = statutory RSZ minus social bonus (werkbonus), minimum 0
  const effectieveRsz = round2(Math.max(0, rszR.werknemerBijdrage - werkbonusR.totaal));
  const belastbaarMaandloon = round2(brutoloon - effectieveRsz);

  // Fiscale werkbonus = belastingkrediet op de BV (33,14% × Luik A + 52,54% × Luik B)
  const fiscaleWerkbonus = round2(
    FISCALE_WERKBONUS_PCT_LUIK_A * werkbonusR.luikA +
      FISCALE_WERKBONUS_PCT_LUIK_B * werkbonusR.luikB,
  );

  const bvR = berekenBV({
    belastbaarMaandloon,
    gezinstype,
    kinderenTenLaste,
    kinderenOnder3,
    fiscaalAlleenstaandeMetKind,
    groepsverzekeringEigenBijdrage,
    fiscaleWerkbonusKrediet: fiscaleWerkbonus,
  });

  const nettoloon = round2(
    brutoloon - effectieveRsz - bvR.bvNaVerminderingen - bbszR.maandelijksBedrag,
  );

  return {
    brutoloon,
    rsz: rszR,
    werkbonus: werkbonusR,
    fiscaleWerkbonus,
    effectieveRsz,
    belastbaarMaandloon,
    bbsz: bbszR,
    bv: bvR,
    nettoloon,
  };
}
