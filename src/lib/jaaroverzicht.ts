import { berekenBvBijzonder } from "@/lib/bvBijzonder";
import type { GezinsType } from "@/lib/bv";
import { getDatapunt } from "@/lib/dataset";
import { ecocheques } from "@/lib/ecocheques";
import { eindejaarspremie } from "@/lib/eindejaarspremie";
import { jaarlijksePremie2026 } from "@/lib/jaarpremie";
import { round2 } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";

const RSZ_WERKNEMER_PCT = 0.1307;
const RSZ_WERKGEVER_JAARPREMIES_PCT = 0.25;
const DUBBEL_VAKANTIEGELD_PCT = 0.92;
const DUBBEL_VAKANTIEGELD_RSZ_BASIS_FRACTIE = 85 / 92;

export interface JaaroverzichtInput {
  brutoloon: number;
  nettoloonPerMaand: number;
  loonkostWerkgeverPerMaand: number;
  refDatum: string;
  gezinstype: GezinsType;
  kinderenTenLaste: number;
  ancienniteitMaanden: number;
  prestatieMaandenInRefertepériode: number;
  tewerkstellingsbreuk: number;
  vaaPerMaand?: number;
}

export interface JaarcomponentNetto {
  bruto: number;
  rsz: number;
  belastbaar: number;
  bv: number;
  bvTarief: number;
  netto: number;
  datapunten: Datapunt[];
}

export interface NettoJaaroverzicht {
  maandloonNettoX12: number;
  eindejaarspremie: JaarcomponentNetto;
  dubbelVakantiegeld: JaarcomponentNetto;
  jaarpremie: JaarcomponentNetto;
  ecocheques: number;
  totaalNettoJaarloon: number;
}

export interface WerkgeverJaaroverzicht {
  maandbasisX12: number;
  jaarpremiesEnEcocheques: number;
  rszOpEindejaarspremieEnJaarpremie: number;
  dubbelVakantiegeld: number;
  totaleLoonkostJaar: number;
  datapunten: Datapunt[];
}

export interface JaaroverzichtResultaat {
  netto: NettoJaaroverzicht;
  werkgever: WerkgeverJaaroverzicht;
}

export function berekenJaaroverzicht(input: JaaroverzichtInput): JaaroverzichtResultaat {
  const refertejaarloon = round2(input.brutoloon * 12);
  const eindejaar = eindejaarspremie({
    brutoloon: input.brutoloon,
    ancienniteitMaanden: input.ancienniteitMaanden,
    prestatieMaandenInRefertepériode: input.prestatieMaandenInRefertepériode,
  });
  const jaarpremie = jaarlijksePremie2026(input.refDatum);
  const eco = ecocheques({
    tewerkstellingsbreuk: input.tewerkstellingsbreuk,
    refDatum: input.refDatum,
  });

  const eindejaarNetto = berekenAndereExceptioneleComponent(
    eindejaar.premie,
    refertejaarloon,
    input.gezinstype,
    input.kinderenTenLaste,
    eindejaar.datapunt,
  );
  const dubbelVakantiegeld = berekenDubbelVakantiegeldComponent(input, refertejaarloon);
  const jaarpremieNetto = berekenAndereExceptioneleComponent(
    jaarpremie.bedrag,
    refertejaarloon,
    input.gezinstype,
    input.kinderenTenLaste,
    jaarpremie.datapunt,
  );

  const maandloonNettoX12 = round2(input.nettoloonPerMaand * 12);
  const totaalNettoJaarloon = round2(
    maandloonNettoX12 +
      eindejaarNetto.netto +
      dubbelVakantiegeld.netto +
      jaarpremieNetto.netto +
      eco.bedrag,
  );

  const maandbasisX12 = round2(input.loonkostWerkgeverPerMaand * 12);
  const jaarpremiesEnEcocheques = round2(eindejaar.premie + jaarpremie.bedrag + eco.bedrag);
  const rszOpEindejaarspremieEnJaarpremie = round2(
    (eindejaar.premie + jaarpremie.bedrag) * RSZ_WERKGEVER_JAARPREMIES_PCT,
  );
  const totaleLoonkostJaar = round2(
    maandbasisX12 +
      jaarpremiesEnEcocheques +
      rszOpEindejaarspremieEnJaarpremie +
      dubbelVakantiegeld.bruto,
  );

  return {
    netto: {
      maandloonNettoX12,
      eindejaarspremie: eindejaarNetto,
      dubbelVakantiegeld,
      jaarpremie: jaarpremieNetto,
      ecocheques: eco.bedrag,
      totaalNettoJaarloon,
    },
    werkgever: {
      maandbasisX12,
      jaarpremiesEnEcocheques,
      rszOpEindejaarspremieEnJaarpremie,
      dubbelVakantiegeld: dubbelVakantiegeld.bruto,
      totaleLoonkostJaar,
      datapunten: uniekeDatapunten([
        eindejaar.datapunt,
        jaarpremie.datapunt,
        eco.datapunt,
        ...dubbelVakantiegeld.datapunten,
      ]),
    },
  };
}

function berekenAndereExceptioneleComponent(
  bruto: number,
  refertejaarloon: number,
  gezinstype: GezinsType,
  kinderenTenLaste: number,
  datapunt: Datapunt,
): JaarcomponentNetto {
  const rsz = round2(bruto * RSZ_WERKNEMER_PCT);
  const belastbaar = round2(bruto - rsz);
  const bv = berekenBvBijzonder({
    refertejaarloon,
    exceptioneelBruto: belastbaar,
    gezinstype,
    kinderenTenLaste,
    soort: "andere_exceptionele_vergoeding",
  });

  return {
    bruto,
    rsz,
    belastbaar,
    bv: bv.bvNetto,
    bvTarief: bv.tarief,
    netto: bv.nettoBedrag,
    datapunten: uniekeDatapunten([datapunt, bv.datapunt]),
  };
}

function berekenDubbelVakantiegeldComponent(
  input: JaaroverzichtInput,
  refertejaarloon: number,
): JaarcomponentNetto {
  const bruto = round2(
    (input.brutoloon + Math.max(input.vaaPerMaand ?? 0, 0)) * DUBBEL_VAKANTIEGELD_PCT,
  );
  const rszBasis = round2(bruto * DUBBEL_VAKANTIEGELD_RSZ_BASIS_FRACTIE);
  const rsz = round2(rszBasis * RSZ_WERKNEMER_PCT);
  const belastbaar = round2(bruto - rsz);
  const bv = berekenBvBijzonder({
    refertejaarloon,
    exceptioneelBruto: belastbaar,
    gezinstype: input.gezinstype,
    kinderenTenLaste: input.kinderenTenLaste,
    soort: "vakantiegeld",
  });
  const vakantiegeldDatapunt = getDatapunt("pc200_vakantiegeld_bedienden");

  return {
    bruto,
    rsz,
    belastbaar,
    bv: bv.bvNetto,
    bvTarief: bv.tarief,
    netto: bv.nettoBedrag,
    datapunten: uniekeDatapunten([vakantiegeldDatapunt, bv.datapunt]),
  };
}

function uniekeDatapunten(datapunten: Array<Datapunt | null | undefined>): Datapunt[] {
  return datapunten.filter((dp, index, all): dp is Datapunt => {
    if (!dp) return false;
    return all.findIndex((item) => item?.id === dp.id) === index;
  });
}
