import {
  berekenWoonwerkVerkeer,
  type WoonwerkVerkeerResultaat,
} from "@/lib/woonwerkVerkeer";
import {
  vaaBedrijfswagen,
  type VaaBedrijfswagenResultaat,
} from "@/lib/vaaBedrijfswagen";
import {
  vaaForfaitsWerkmiddelen,
  type VaaForfaitsWerkmiddelenResultaat,
} from "@/lib/vaaForfaits";
import {
  berekenJaaroverzicht,
  type JaaroverzichtResultaat,
} from "@/lib/jaaroverzicht";
import { berekenNetto, type NettoResultaat } from "@/lib/netto";
import {
  werkgeverskost,
  loonwig,
  type WerkgeverskostResultaat,
} from "@/lib/werkgeverskost";
import { round2 } from "@/lib/money";
import {
  aantalWeekdagenInMaand,
  refDatumVoorMaand,
  type BeroepskostMethode,
  type Profiel,
} from "@/lib/profiel";

export interface MobiliteitBerekening {
  woonwerk: WoonwerkVerkeerResultaat;
  vaaBedrijfswagen: VaaBedrijfswagenResultaat | null;
}

export interface ProfielKernOutputs {
  bruto: number;
  netto: number | null;
  werkgeverskostMaand: number | null;
  loonwigPct: number | null;
  nettoJaar: number | null;
  werkgeverskostJaar: number | null;
}

export function berekenVaaWerkmiddelenVoorProfiel(
  p: Profiel,
  refDatum: string,
): VaaForfaitsWerkmiddelenResultaat {
  return vaaForfaitsWerkmiddelen({
    pcLaptopActief: p.vaaPcLaptopActief,
    gsmSmartphoneActief: p.vaaGsmSmartphoneActief,
    internetActief: p.vaaInternetActief,
    gsmAbonnementActief: p.vaaGsmAbonnementActief,
    refDatum,
  });
}

export function berekenWoonwerkVrijgesteld(
  woonwerk: WoonwerkVerkeerResultaat,
  privewagenMethode: BeroepskostMethode,
): number {
  const openbaarVervoer = round2(
    (woonwerk.componenten.trein?.vergoeding ?? 0) +
      (woonwerk.componenten.busTramMetro?.vergoeding ?? 0),
  );
  const fiets = Math.min(woonwerk.componenten.fiets?.vergoeding ?? 0, round2(3700 / 12));
  const privewagen =
    privewagenMethode === "forfaitair"
      ? Math.min(woonwerk.componenten.privewagen?.vergoeding ?? 0, round2(500 / 12))
      : 0;

  return round2(Math.max(0, openbaarVervoer + fiets + privewagen));
}

export function berekenMobiliteitVoorProfiel(
  p: Profiel,
  refDatum: string,
  brutoloonOverride?: number,
): MobiliteitBerekening {
  const werkdagenInMaand = aantalWeekdagenInMaand(p.berekeningsJaar, p.berekeningsMaand);
  const woonwerk = berekenWoonwerkVerkeer({
    refDatum,
    brutoloon: brutoloonOverride ?? p.brutoloon,
    arbeidsdagenPerMaand: p.arbeidsdagenPerMaand,
    werkdagenInMaand,
    fiets: { actief: p.woonwerkFiets, kmPerDag: p.kmPerDag },
    trein: { actief: p.woonwerkTrein, kmEnkel: p.treinKm },
    busTramMetro: {
      actief: p.woonwerkBusTramMetro,
      kmEnkel: p.busTramMetroKm,
      prijsPerMaand: p.busTramMetroPrijs,
    },
    privewagen: { actief: p.woonwerkPrivewagen, kmEnkel: p.privewagenKm },
  });
  const vaa = p.woonwerkBedrijfswagen
    ? vaaBedrijfswagen({
        cataloguswaarde: p.bedrijfswagenCataloguswaarde,
        datumEersteInschrijving: p.bedrijfswagenDatumEersteInschrijving,
        brandstof: p.bedrijfswagenBrandstof,
        co2: p.bedrijfswagenCo2,
        refDatum,
      })
    : null;
  return { woonwerk, vaaBedrijfswagen: vaa };
}

export function berekenNettoVoorProfiel(
  p: Profiel,
  refDatum: string,
  brutoloonOverride?: number,
): NettoResultaat {
  const brutoloon = brutoloonOverride ?? p.brutoloon;
  const heeftMaaltijdcheques = p.maaltijdchequesActief;
  const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum, brutoloon);
  const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);

  return berekenNetto({
    brutoloon,
    refDatum,
    bouwVlag: p.bouwVlag,
    gezinstype: p.gezinstype,
    kinderenTenLaste: p.kinderenTenLaste,
    fiscaalAlleenstaandeMetKind: p.fiscaalAlleenstaandeMetKind,
    groepsverzekeringEigenBijdrage: p.groepsverzekeringEigenBijdrage,
    maaltijdchequeWerknemersbijdragePerDag: heeftMaaltijdcheques
      ? p.maaltijdchequeWerknemersbijdragePerDag
      : 0,
    maaltijdchequeWerkdagen: heeftMaaltijdcheques ? p.arbeidsdagenPerMaand : 0,
    hospitalisatieEigenBijdrage: p.hospitalisatieEigenBijdrage,
    onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
    woonwerkVrijgesteldPerMaand: berekenWoonwerkVrijgesteld(
      mobiliteit.woonwerk,
      p.woonwerkPrivewagenBeroepskostMethode,
    ),
    vaaRszPlichtigPerMaand: vaaWerkmiddelen.totaalPerMaand,
    vaaBedrijfswagenPerMaand: mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0,
  });
}

export function berekenWerkgeverskostVoorProfiel(
  p: Profiel,
  refDatum: string,
  vaaWerkmiddelen?: VaaForfaitsWerkmiddelenResultaat,
  mobiliteit?: MobiliteitBerekening,
): WerkgeverskostResultaat {
  const resolvedVaaWerkmiddelen = vaaWerkmiddelen ?? berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
  const resolvedMobiliteit = mobiliteit ?? berekenMobiliteitVoorProfiel(p, refDatum);

  const vaaPerMaand =
    resolvedVaaWerkmiddelen.totaalPerMaand +
    (resolvedMobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0);

  return werkgeverskost({
    brutoloon: p.brutoloon,
    refDatum,
    bouwVlag: p.bouwVlag,
    arbeidsongevallenPct: p.arbeidsongevallenPct,
    premieEjpPct: 0,
    extraGroepsverzekering: p.extraGroepsverzekering,
    maaltijdchequeWerkgeversaandeelPerDag: p.maaltijdchequesActief
      ? p.maaltijdchequeWerkgeversaandeelPerDag
      : 0,
    maaltijdchequeWerkdagen: p.maaltijdchequesActief ? p.arbeidsdagenPerMaand : 0,
    extraHospitalisatie: p.extraHospitalisatie,
    extraEcocheques: 0,
    vaaRszPlichtigPerMaand: resolvedVaaWerkmiddelen.totaalPerMaand,
    vaaPerMaand,
    onkostenvergoedingPerMaand: p.onkostenvergoedingPerMaand,
    woonwerkVergoedingPerMaand: resolvedMobiliteit.woonwerk.totaalVergoeding,
  });
}

export function berekenJaaroverzichtVoorProfiel(
  p: Profiel,
  refDatum: string,
  netto: NettoResultaat,
  wgk: WerkgeverskostResultaat,
  vaaWerkmiddelen: VaaForfaitsWerkmiddelenResultaat,
  mobiliteit: MobiliteitBerekening,
): JaaroverzichtResultaat {
  return berekenJaaroverzicht({
    brutoloon: p.brutoloon,
    nettoloonPerMaand: netto.nettoloon,
    loonkostWerkgeverPerMaand: wgk.totaleLoonkostBreed,
    refDatum,
    gezinstype: p.gezinstype,
    kinderenTenLaste: p.kinderenTenLaste,
    ancienniteitMaanden: p.ancienniteitMaanden,
    prestatieMaandenInRefertepériode: p.prestatieMaanden,
    tewerkstellingsbreuk: p.tewerkstellingsbreuk,
    vaaPerMaand:
      vaaWerkmiddelen.totaalPerMaand +
      (mobiliteit.vaaBedrijfswagen?.vaaMaand ?? 0),
  });
}

export function berekenProfielKernOutputs(p: Profiel): ProfielKernOutputs {
  if (p.statuut !== "bediende") {
    return {
      bruto: p.brutoloon,
      netto: null,
      werkgeverskostMaand: null,
      loonwigPct: null,
      nettoJaar: null,
      werkgeverskostJaar: null,
    };
  }

  try {
    const refDatum = refDatumVoorMaand(p.berekeningsJaar, p.berekeningsMaand);
    const mobiliteit = berekenMobiliteitVoorProfiel(p, refDatum);
    const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(p, refDatum);
    const netto = berekenNettoVoorProfiel(p, refDatum);
    const wgk = berekenWerkgeverskostVoorProfiel(p, refDatum, vaaWerkmiddelen, mobiliteit);
    const jaaroverzicht = berekenJaaroverzichtVoorProfiel(
      p,
      refDatum,
      netto,
      wgk,
      vaaWerkmiddelen,
      mobiliteit,
    );

    return {
      bruto: p.brutoloon,
      netto: netto.nettoloon,
      werkgeverskostMaand: wgk.totaleLoonkostBreed,
      loonwigPct: loonwig(wgk.totaleLoonkostBreed, netto.nettoloon),
      nettoJaar: jaaroverzicht.netto.totaalNettoJaarloon,
      werkgeverskostJaar: jaaroverzicht.werkgever.totaleLoonkostJaar,
    };
  } catch {
    return {
      bruto: p.brutoloon,
      netto: null,
      werkgeverskostMaand: null,
      loonwigPct: null,
      nettoJaar: null,
      werkgeverskostJaar: null,
    };
  }
}
