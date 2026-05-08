import { round2 } from "@/lib/money";
import { safeGetValue } from "@/lib/periode";
import type { Datapunt } from "@/types/dataset";

export interface RszInput {
  brutoloon: number;
  refDatum: string; // ISO YYYY-MM-DD
  bouwVlag?: boolean;
}

export interface RszResultaat {
  brutoloon: number;
  werknemerBijdrage: number;
  werkgeverBasisbijdrage: number;
  sociaalFonds200: number;
  bouwAanvullendPensioen: number | null;
  totaalWerkgever: number;
  bronnen: Array<{
    label: string;
    datapunt: Datapunt;
    bedrag: number;
  }>;
  waarschuwingen: string[];
}

export function rszBijdragen(input: RszInput): RszResultaat {
  const { brutoloon, refDatum, bouwVlag = false } = input;

  const werknemer = safeGetValue("rsz_werknemer_basis", { refDatum });
  const werkgever = safeGetValue("rsz_werkgever_profit_basis", { refDatum });
  const sociaalFonds = safeGetValue(
    "rsz_pc200_sociaal_fonds_200_werkgeversbijdrage_2026",
    { refDatum },
  );

  const wn = brutoloon * (werknemer.waarde ?? 0);
  const wg = brutoloon * (werkgever.waarde ?? 0);
  const sf = brutoloon * (sociaalFonds.waarde ?? 0);

  let bouw = 0;
  let bouwBron: Datapunt | null = null;
  if (bouwVlag) {
    const r = safeGetValue("rsz_pc200_bouw_aanvullend_pensioen_2026", { refDatum });
    bouw = brutoloon * (r.waarde ?? 0);
    bouwBron = r.datapunt;
  }

  const wnR = round2(wn);
  const wgR = round2(wg);
  const sfR = round2(sf);
  const bouwR = round2(bouw);
  const totWg = round2(wgR + sfR + bouwR);

  const bronnen: RszResultaat["bronnen"] = [
    { label: "RSZ werknemer", datapunt: werknemer.datapunt, bedrag: wnR },
    { label: "RSZ werkgever (basis profit)", datapunt: werkgever.datapunt, bedrag: wgR },
    { label: "Sociaal Fonds 200", datapunt: sociaalFonds.datapunt, bedrag: sfR },
  ];
  if (bouwVlag && bouwBron) {
    bronnen.push({
      label: "Bouw — aanvullend pensioen (1,80 %)",
      datapunt: bouwBron,
      bedrag: bouwR,
    });
  }

  const waarschuwingen = [werknemer, werkgever, sociaalFonds]
    .map((r) => r.waarschuwing)
    .filter((w): w is string => Boolean(w));

  return {
    brutoloon,
    werknemerBijdrage: wnR,
    werkgeverBasisbijdrage: wgR,
    sociaalFonds200: sfR,
    bouwAanvullendPensioen: bouwVlag ? bouwR : null,
    totaalWerkgever: totWg,
    bronnen,
    waarschuwingen,
  };
}
