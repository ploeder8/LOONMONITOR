import { round2 } from "@/lib/money";
import { bouwLoonficheVoorProfiel, type Loonfiche } from "@/lib/loonfiche";
import type { Profiel } from "@/lib/profiel";

export type LoonrunStatus = "concept" | "berekend" | "fout";

export interface LoonrunWerknemerInput {
  id: string;
  naam: string;
  profiel: Profiel;
}

export interface LoonrunWerknemer {
  id: string;
  naam: string;
  profiel: Profiel;
  status: LoonrunStatus;
  loonfiche?: Loonfiche;
  fout?: string;
}

export interface LoonrunTotalen {
  bruto: number;
  netto: number;
  werkgeverskost: number;
  loonwigPct: number | null;
  aantalBerekend: number;
  aantalFout: number;
}

export interface Loonrun {
  periode: string;
  werknemers: LoonrunWerknemer[];
  totalen: LoonrunTotalen;
}

export function bouwLoonrun(inputs: LoonrunWerknemerInput[]): Loonrun {
  const werknemers: LoonrunWerknemer[] = [];
  let bruto = 0;
  let netto = 0;
  let werkgeverskost = 0;
  let aantalBerekend = 0;
  let aantalFout = 0;

  for (const input of inputs) {
    try {
      const loonfiche = bouwLoonficheVoorProfiel(input.profiel);
      werknemers.push({
        id: input.id,
        naam: input.naam,
        profiel: input.profiel,
        status: "berekend",
        loonfiche,
      });
      bruto += loonfiche.totalen.brutoRszBasis;
      netto += loonfiche.totalen.nettoTeBetalen;
      werkgeverskost += loonfiche.totalen.werkgeverskostMaand;
      aantalBerekend += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      werknemers.push({
        id: input.id,
        naam: input.naam,
        profiel: input.profiel,
        status: "fout",
        fout: message,
      });
      aantalFout += 1;
    }
  }

  const loonwigPct =
    werkgeverskost > 0
      ? round2(((werkgeverskost - netto) / werkgeverskost) * 100)
      : null;

  return {
    periode: inputs[0]?.profiel
      ? periodeLabel(inputs[0].profiel)
      : "Onbekende periode",
    werknemers,
    totalen: {
      bruto: round2(bruto),
      netto: round2(netto),
      werkgeverskost: round2(werkgeverskost),
      loonwigPct,
      aantalBerekend,
      aantalFout,
    },
  };
}

function periodeLabel(profiel: Profiel): string {
  const maandNamen = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  const idx = parseInt(profiel.berekeningsMaand, 10) - 1;
  const maand = maandNamen[idx] ?? profiel.berekeningsMaand;
  return `${maand} ${profiel.berekeningsJaar}`;
}
