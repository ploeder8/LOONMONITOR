import { round2, formatEUR } from "@/lib/money";
import type { Datapunt } from "@/types/dataset";
import { getDatapunt } from "@/lib/dataset";
import { safeGetValue } from "@/lib/periode";
import { brutolocheck, lookupBarema, lookupStudentenbarema } from "@/lib/baremas";
import type { Profiel, BerekeningsRichting } from "@/lib/profiel";
import {
  refDatumVoorMaand,
  heeftMaaltijdcheques,
} from "@/lib/profiel";
import {
  berekenNettoVoorProfiel,
  berekenWerkgeverskostVoorProfiel,
  berekenMobiliteitVoorProfiel,
  berekenVaaWerkmiddelenVoorProfiel,
  berekenMaaltijdchequeWaarde,
  zoekBrutoVoorProfielDoelNetto,
} from "@/lib/profielBerekeningen";
import type { NettoResultaat } from "@/lib/netto";
import type { WerkgeverskostResultaat } from "@/lib/werkgeverskost";
import { PC200DatasetError } from "@/lib/errors";

export type LoonficheRegelType =
  | "bruto"
  | "rsz"
  | "belastbaar"
  | "bv"
  | "inhouding"
  | "netto"
  | "werkgever"
  | "informatief"
  | "subtotaal";

export type LoonficheTeken = "plus" | "min" | "neutraal";

export interface LoonficheRegel {
  code: string;
  label: string;
  type: LoonficheRegelType;
  bedrag: number;
  teken: LoonficheTeken;
  sortering: number;
  datapunten?: Datapunt[];
  detail?: string;
}

export interface LoonficheTotalen {
  brutoRszBasis: number;
  belastbaarVoorBV: number;
  nettoTeBetalen: number;
  nettoInclusiefMaaltijdcheques: number;
  werkgeverskostMaand: number;
}

export interface Loonfiche {
  periode: string;
  profielSnapshot: Profiel;
  regels: LoonficheRegel[];
  totalen: LoonficheTotalen;
  waarschuwingen: string[];
  isStudent: boolean;
  richting: BerekeningsRichting;
}

interface RegelInput {
  code: string;
  label: string;
  type: LoonficheRegelType;
  bedrag: number;
  teken: LoonficheTeken;
  sortering: number;
  datapunten?: Datapunt[];
  detail?: string;
}

function r(input: RegelInput): LoonficheRegel {
  return { ...input };
}

function maandNaam(maandNummer: string): string {
  const namen = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  const idx = parseInt(maandNummer, 10) - 1;
  return namen[idx] ?? maandNummer;
}

export function bouwLoonficheVoorProfiel(profiel: Profiel): Loonfiche {
  const refDatum = refDatumVoorMaand(profiel.berekeningsJaar, profiel.berekeningsMaand);
  const periode = `${maandNaam(profiel.berekeningsMaand)} ${profiel.berekeningsJaar}`;
  const waarschuwingen: string[] = [];

  if (profiel.statuut === "student") {
    return bouwStudentenLoonfiche(profiel, refDatum, periode, waarschuwingen);
  }

  return bouwBediendeLoonfiche(profiel, refDatum, periode, waarschuwingen);
}

function bouwBediendeLoonfiche(
  profiel: Profiel,
  refDatum: string,
  periode: string,
  waarschuwingen: string[],
): Loonfiche {
  // Bepaal effectief bruto (rekening houdend met netto→bruto modus)
  let effectiefBruto = profiel.brutoloon;
  if (profiel.berekeningsRichting === "netto_naar_bruto") {
    const inverse = zoekBrutoVoorProfielDoelNetto(profiel, refDatum);
    if (inverse.gevondenBruto !== null) {
      effectiefBruto = inverse.gevondenBruto;
    }
  }

  // Berekeningen
  const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum, effectiefBruto);
  const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);
  const netto = berekenNettoVoorProfiel(profiel, refDatum, effectiefBruto);
  const wgk = berekenWerkgeverskostVoorProfiel(profiel, refDatum, vaaWerkmiddelen, mobiliteit);

  // Maaltijdcheques
  const maaltijdchequesActief = heeftMaaltijdcheques(profiel);
  const maaltijdcheques = maaltijdchequesActief
    ? berekenMaaltijdchequeWaarde({
        werkgeversaandeelPerDag: profiel.maaltijdchequeWerkgeversaandeelPerDag,
        werknemersbijdragePerDag: profiel.maaltijdchequeWerknemersbijdragePerDag,
        werkdagen: profiel.arbeidsdagenPerMaand,
      })
    : null;

  // Waarschuwingen
  try {
    const check = brutolocheck(
      profiel.schaal,
      profiel.cat,
      profiel.ervaringJaren,
      effectiefBruto,
      refDatum,
      profiel.tewerkstellingsbreuk,
    );
    if (!check.ok) {
      waarschuwingen.push(
        `Brutoloon ${formatEUR(effectiefBruto)} ligt onder het sectoraal minimum (${formatEUR(check.proRataMinimum)} pro rata).`,
      );
    }
  } catch {
    // negeren
  }

  if (profiel.arbeidsdagenPerMaand === 0) {
    waarschuwingen.push("Aantal arbeidsdagen per maand is 0.");
  }

  // Bouw regels
  const regels: LoonficheRegel[] = [];

  // 0001 - Richting label
  if (profiel.berekeningsRichting === "netto_naar_bruto") {
    regels.push(
      r({
        code: "0001",
        label: `Berekend uit doelnetto ${formatEUR(profiel.doelNettoloon)}`,
        type: "informatief",
        bedrag: 0,
        teken: "neutraal",
        sortering: 0,
      }),
    );
  }

  // 1000 - Brutoloon
  regels.push(
    r({
      code: "1000",
      label: profiel.berekeningsRichting === "netto_naar_bruto" ? "Berekend brutoloon" : "Brutoloon",
      type: "bruto",
      bedrag: effectiefBruto,
      teken: "plus",
      sortering: 100,
    }),
  );

  // 1010 - VAA werkmiddelen (RSZ-plichtig)
  if (vaaWerkmiddelen.totaalPerMaand > 0) {
    regels.push(
      r({
        code: "1010",
        label: "VAA werkmiddelen (RSZ-plichtig)",
        type: "bruto",
        bedrag: netto.vaaRszPlichtigPerMaand,
        teken: "plus",
        sortering: 110,
        datapunten: vaaWerkmiddelen.lijnen.map((l) => l.datapunt),
      }),
    );
  }

  // 1090 - Totaal bruto RSZ-basis
  regels.push(
    r({
      code: "1090",
      label: "Totaal bruto RSZ-basis",
      type: "subtotaal",
      bedrag: netto.brutoRszBasis,
      teken: "neutraal",
      sortering: 190,
    }),
  );

  // 2000 - RSZ werknemer
  regels.push(
    r({
      code: "2000",
      label: "RSZ werknemer",
      type: "rsz",
      bedrag: netto.rsz.werknemerBijdrage,
      teken: "min",
      sortering: 200,
      datapunten: netto.rsz.bronnen.filter((b) => b.label.includes("werknemer")).map((b) => b.datapunt),
      detail: "13,07 %",
    }),
  );

  // 2010 - Sociale werkbonus
  if (netto.werkbonus.totaal > 0) {
    regels.push(
      r({
        code: "2010",
        label: "Sociale werkbonus",
        type: "rsz",
        bedrag: netto.werkbonus.totaal,
        teken: "plus",
        sortering: 210,
        datapunten: [netto.werkbonus.datapunt],
      }),
    );
  }

  // 2090 - Loon na RSZ en werkbonus
  regels.push(
    r({
      code: "2090",
      label: "Loon na RSZ en werkbonus",
      type: "subtotaal",
      bedrag: netto.belastbaarMaandloon,
      teken: "neutraal",
      sortering: 290,
    }),
  );

  // 2100 - VAA bedrijfswagen
  if (netto.vaaBedrijfswagenPerMaand > 0) {
    regels.push(
      r({
        code: "2100",
        label: "VAA bedrijfswagen",
        type: "belastbaar",
        bedrag: netto.vaaBedrijfswagenPerMaand,
        teken: "plus",
        sortering: 300,
      }),
    );
  }

  // 2190 - Belastbaar loon voor BV
  regels.push(
    r({
      code: "2190",
      label: "Belastbaar loon voor BV",
      type: "subtotaal",
      bedrag: netto.belastbaarMaandloonVoorBV,
      teken: "neutraal",
      sortering: 390,
    }),
  );

  // 3000 - Bedrijfsvoorheffing
  regels.push(
    r({
      code: "3000",
      label: `Bedrijfsvoorheffing (Schaal ${netto.bv.schaal})`,
      type: "bv",
      bedrag: netto.bv.bvPerMaand,
      teken: "min",
      sortering: 400,
      datapunten: netto.bv.datapunten,
    }),
  );

  // 3010 - Vermindering kinderen
  if (netto.bv.verminderingKinderen > 0) {
    regels.push(
      r({
        code: "3010",
        label: "Vermindering kinderen",
        type: "bv",
        bedrag: netto.bv.verminderingKinderen,
        teken: "plus",
        sortering: 410,
        datapunten: netto.bv.datapunten,
      }),
    );
  }

  // 3020 - Vermindering alleenstaande
  if (netto.bv.verminderingAlleenstaandeKind > 0) {
    regels.push(
      r({
        code: "3020",
        label: "Vermindering fiscaal alleenstaande",
        type: "bv",
        bedrag: netto.bv.verminderingAlleenstaandeKind,
        teken: "plus",
        sortering: 420,
        datapunten: netto.bv.datapunten,
      }),
    );
  }

  // 3030 - Vermindering groepsverzekering
  if (netto.bv.verminderingGroepsverzekering > 0) {
    regels.push(
      r({
        code: "3030",
        label: "Vermindering groepsverzekering",
        type: "bv",
        bedrag: netto.bv.verminderingGroepsverzekering,
        teken: "plus",
        sortering: 430,
        datapunten: netto.bv.datapunten,
      }),
    );
  }

  // 3040 - Fiscale werkbonus
  if (netto.fiscaleWerkbonus > 0) {
    regels.push(
      r({
        code: "3040",
        label: "Fiscale werkbonus",
        type: "bv",
        bedrag: netto.fiscaleWerkbonus,
        teken: "plus",
        sortering: 440,
      }),
    );
  }

  // 3090 - BV na verminderingen
  regels.push(
    r({
      code: "3090",
      label: "BV na verminderingen",
      type: "subtotaal",
      bedrag: netto.bv.bvNaVerminderingen,
      teken: "min",
      sortering: 490,
    }),
  );

  // 4000 - BBSZ
  if (netto.bbsz.maandelijksBedrag > 0) {
    regels.push(
      r({
        code: "4000",
        label: "Bijzondere bijdrage sociale zekerheid (BBSZ)",
        type: "inhouding",
        bedrag: netto.bbsz.maandelijksBedrag,
        teken: "min",
        sortering: 500,
        datapunten: [netto.bbsz.datapunt],
      }),
    );
  }

  // 4010 - Maaltijdcheques werknemer
  if (netto.maaltijdchequeWerknemersbijdrage > 0) {
    regels.push(
      r({
        code: "4010",
        label: "Maaltijdcheques (werknemersbijdrage)",
        type: "inhouding",
        bedrag: netto.maaltijdchequeWerknemersbijdrage,
        teken: "min",
        sortering: 510,
      }),
    );
  }

  // 4020 - Eigen bijdrage hospitalisatie
  if (netto.hospitalisatieEigenBijdrage > 0) {
    regels.push(
      r({
        code: "4020",
        label: "Eigen bijdrage hospitalisatie",
        type: "inhouding",
        bedrag: netto.hospitalisatieEigenBijdrage,
        teken: "min",
        sortering: 520,
      }),
    );
  }

  // 4030 - Eigen bijdrage groepsverzekering
  if (profiel.groepsverzekeringEigenBijdrage > 0) {
    regels.push(
      r({
        code: "4030",
        label: "Eigen bijdrage groepsverzekering",
        type: "inhouding",
        bedrag: profiel.groepsverzekeringEigenBijdrage,
        teken: "min",
        sortering: 530,
      }),
    );
  }

  // 5000 - Woon-werkvergoeding
  if (netto.woonwerkVrijgesteldPerMaand > 0) {
    regels.push(
      r({
        code: "5000",
        label: "Woon-werkvergoeding (vrijgesteld)",
        type: "netto",
        bedrag: netto.woonwerkVrijgesteldPerMaand,
        teken: "plus",
        sortering: 600,
      }),
    );
  }

  // 5010 - Onkostenvergoeding
  if (netto.onkostenvergoedingPerMaand > 0) {
    regels.push(
      r({
        code: "5010",
        label: "Onkostenvergoeding",
        type: "netto",
        bedrag: netto.onkostenvergoedingPerMaand,
        teken: "plus",
        sortering: 610,
      }),
    );
  }

  // 6000 - Terugname VAA bedrijfswagen
  if (netto.vaaBedrijfswagenPerMaand > 0) {
    regels.push(
      r({
        code: "6000",
        label: "Terugname VAA bedrijfswagen",
        type: "inhouding",
        bedrag: netto.vaaBedrijfswagenPerMaand,
        teken: "min",
        sortering: 700,
      }),
    );
  }

  // 6010 - Terugname VAA werkmiddelen
  if (netto.vaaRszPlichtigPerMaand > 0) {
    regels.push(
      r({
        code: "6010",
        label: "Terugname VAA werkmiddelen",
        type: "inhouding",
        bedrag: netto.vaaRszPlichtigPerMaand,
        teken: "min",
        sortering: 710,
      }),
    );
  }

  // 9000 - Netto te betalen
  regels.push(
    r({
      code: "9000",
      label: "Netto te betalen",
      type: "netto",
      bedrag: netto.nettoloon,
      teken: "plus",
      sortering: 900,
    }),
  );

  // 9010 - Netto incl. maaltijdcheques
  if (maaltijdcheques && maaltijdcheques.totaleWaarde > 0) {
    regels.push(
      r({
        code: "9010",
        label: "Netto inclusief maaltijdcheques",
        type: "informatief",
        bedrag: round2(netto.nettoloon + maaltijdcheques.totaleWaarde),
        teken: "plus",
        sortering: 910,
      }),
    );
  }

  // 9500 - Werkgeverskost
  regels.push(
    r({
      code: "9500",
      label: "Werkgeverskost per maand",
      type: "werkgever",
      bedrag: wgk.totaleLoonkostBreed,
      teken: "neutraal",
      sortering: 950,
      datapunten: wgk.datapunten,
    }),
  );

  return {
    periode,
    profielSnapshot: { ...profiel },
    regels: filterEnSorteerRegels(regels),
    totalen: {
      brutoRszBasis: netto.brutoRszBasis,
      belastbaarVoorBV: netto.belastbaarMaandloonVoorBV,
      nettoTeBetalen: netto.nettoloon,
      nettoInclusiefMaaltijdcheques: maaltijdcheques ? round2(netto.nettoloon + maaltijdcheques.totaleWaarde) : netto.nettoloon,
      werkgeverskostMaand: wgk.totaleLoonkostBreed,
    },
    waarschuwingen,
    isStudent: false,
    richting: profiel.berekeningsRichting,
  };
}

function bouwStudentenLoonfiche(
  profiel: Profiel,
  refDatum: string,
  periode: string,
  waarschuwingen: string[],
): Loonfiche {
  waarschuwingen.push("Pro-forma loonfiche voor student; geen RSZ/BV-toepassing.");

  const barema = lookupStudentenbarema(profiel.studentenCat, profiel.studentLeeftijd, refDatum);
  const mobiliteit = berekenMobiliteitVoorProfiel(profiel, refDatum);
  const vaaWerkmiddelen = berekenVaaWerkmiddelenVoorProfiel(profiel, refDatum);

  const maaltijdchequesActief = heeftMaaltijdcheques(profiel);
  const maaltijdcheques = maaltijdchequesActief
    ? berekenMaaltijdchequeWaarde({
        werkgeversaandeelPerDag: profiel.maaltijdchequeWerkgeversaandeelPerDag,
        werknemersbijdragePerDag: profiel.maaltijdchequeWerknemersbijdragePerDag,
        werkdagen: profiel.arbeidsdagenPerMaand,
      })
    : null;

  const woonwerkVrijgesteld = round2(
    (mobiliteit.woonwerk.componenten.trein?.vergoeding ?? 0) +
      (mobiliteit.woonwerk.componenten.busTramMetro?.vergoeding ?? 0) +
      Math.min(mobiliteit.woonwerk.componenten.fiets?.vergoeding ?? 0, round2(3700 / 12)),
  );

  const bruto = barema.maandloonEUR;
  const netto = round2(
    bruto +
      woonwerkVrijgesteld +
      profiel.onkostenvergoedingPerMaand -
      (maaltijdcheques?.totaleWaarde ?? 0) -
      profiel.hospitalisatieEigenBijdrage,
  );

  const regels: LoonficheRegel[] = [];

  regels.push(
    r({
      code: "1000",
      label: "Brutoloon (studentenbarema)",
      type: "bruto",
      bedrag: bruto,
      teken: "plus",
      sortering: 100,
      datapunten: [barema.datapunt],
    }),
  );

  if (woonwerkVrijgesteld > 0) {
    regels.push(
      r({
        code: "5000",
        label: "Woon-werkvergoeding (vrijgesteld)",
        type: "netto",
        bedrag: woonwerkVrijgesteld,
        teken: "plus",
        sortering: 600,
      }),
    );
  }

  if (profiel.onkostenvergoedingPerMaand > 0) {
    regels.push(
      r({
        code: "5010",
        label: "Onkostenvergoeding",
        type: "netto",
        bedrag: profiel.onkostenvergoedingPerMaand,
        teken: "plus",
        sortering: 610,
      }),
    );
  }

  if (maaltijdcheques && maaltijdcheques.totaleWaarde > 0) {
    regels.push(
      r({
        code: "4010",
        label: "Maaltijdcheques (werknemersbijdrage)",
        type: "inhouding",
        bedrag: maaltijdcheques.totaleWaarde,
        teken: "min",
        sortering: 510,
      }),
    );
  }

  if (profiel.hospitalisatieEigenBijdrage > 0) {
    regels.push(
      r({
        code: "4020",
        label: "Eigen bijdrage hospitalisatie",
        type: "inhouding",
        bedrag: profiel.hospitalisatieEigenBijdrage,
        teken: "min",
        sortering: 520,
      }),
    );
  }

  regels.push(
    r({
      code: "9000",
      label: "Netto te betalen",
      type: "netto",
      bedrag: netto,
      teken: "plus",
      sortering: 900,
    }),
  );

  if (maaltijdcheques && maaltijdcheques.totaleWaarde > 0) {
    regels.push(
      r({
        code: "9010",
        label: "Netto inclusief maaltijdcheques",
        type: "informatief",
        bedrag: round2(netto + maaltijdcheques.totaleWaarde),
        teken: "plus",
        sortering: 910,
      }),
    );
  }

  // Voor studenten: minimale werkgeverskost = bruto + mobiliteit vergoeding
  const werkgeverskost = round2(bruto + (mobiliteit.woonwerk.totaalVergoeding ?? 0));
  regels.push(
    r({
      code: "9500",
      label: "Werkgeverskost per maand",
      type: "werkgever",
      bedrag: werkgeverskost,
      teken: "neutraal",
      sortering: 950,
    }),
  );

  return {
    periode,
    profielSnapshot: { ...profiel },
    regels: filterEnSorteerRegels(regels),
    totalen: {
      brutoRszBasis: bruto,
      belastbaarVoorBV: bruto,
      nettoTeBetalen: netto,
      nettoInclusiefMaaltijdcheques: maaltijdcheques ? round2(netto + maaltijdcheques.totaleWaarde) : netto,
      werkgeverskostMaand: werkgeverskost,
    },
    waarschuwingen,
    isStudent: true,
    richting: profiel.berekeningsRichting,
  };
}

function filterEnSorteerRegels(regels: LoonficheRegel[]): LoonficheRegel[] {
  const altijdTonen = new Set(["1090", "2090", "2190", "3090", "9000", "9500", "0001"]);
  const gefilterd = regels.filter((regel) => {
    if (altijdTonen.has(regel.code)) return true;
    return Math.abs(regel.bedrag) > 0.001;
  });
  gefilterd.sort((a, b) => a.sortering - b.sortering);
  return gefilterd;
}
