import { round2 } from "@/lib/money";
import { bouwLoonficheVoorProfiel, type Loonfiche } from "@/lib/loonfiche";
import type { Profiel } from "@/lib/profiel";
import { profielPeriodeLabel } from "@/lib/profielLabels";
import { valideerLoonrunInput, type LoonrunValidatie } from "@/lib/loonrunValidatie";
export type LoonrunStatus = "concept" | "te_controleren" | "gecontroleerd" | "vastgezet" | "fout";
export interface LoonrunWerknemerInput {
    id: string;
    naam: string;
    profiel: Profiel;
    status?: LoonrunStatus;
    insz?: string;
    bronBedrijfId?: string;
    bronMedewerkerId?: string;
}
export interface LoonrunWerknemer {
    id: string;
    naam: string;
    profiel: Profiel;
    status: LoonrunStatus;
    loonfiche?: Loonfiche;
    fout?: string;
    validaties: LoonrunValidatie[];
}
export interface LoonrunTotalen {
    cashBruto: number;
    brutoRszBasis: number;
    belastbaarVoorBV: number;
    netto: number;
    werkgeverskost: number;
    loonwigPct: number | null;
    aantalBerekend: number;
    aantalFout: number;
    aantalConcept: number;
    aantalTeControleren: number;
    aantalGecontroleerd: number;
    aantalVastgezet: number;
}
export interface Loonrun {
    periode: string;
    werknemers: LoonrunWerknemer[];
    totalen: LoonrunTotalen;
    validaties: LoonrunValidatie[];
    heeftBlokkeringen: boolean;
}
export function bouwLoonrun(inputs: LoonrunWerknemerInput[]): Loonrun {
    const werknemers: LoonrunWerknemer[] = [];
    const validaties = valideerLoonrunInput(inputs);
    let cashBruto = 0;
    let brutoRszBasis = 0;
    let belastbaarVoorBV = 0;
    let netto = 0;
    let werkgeverskost = 0;
    let aantalBerekend = 0;
    let aantalFout = 0;
    let aantalConcept = 0;
    let aantalTeControleren = 0;
    let aantalGecontroleerd = 0;
    let aantalVastgezet = 0;
    for (const input of inputs) {
        try {
            const loonfiche = bouwLoonficheVoorProfiel(input.profiel);
            const werknemerValidaties = validaties.filter((v) => v.werknemerId === input.id);
            const status = werknemerValidaties.some((v) => v.niveau === "blokkerend")
                ? "te_controleren"
                : input.status ?? "te_controleren";
            werknemers.push({
                id: input.id,
                naam: input.naam,
                profiel: input.profiel,
                status,
                loonfiche,
                validaties: werknemerValidaties,
            });
            cashBruto += loonfiche.totalen.cashBrutoloon;
            brutoRszBasis += loonfiche.totalen.brutoRszBasis;
            belastbaarVoorBV += loonfiche.totalen.belastbaarVoorBV;
            netto += loonfiche.totalen.nettoTeBetalen;
            werkgeverskost += loonfiche.totalen.werkgeverskostMaand;
            aantalBerekend += 1;
            if (status === "concept")
                aantalConcept += 1;
            if (status === "te_controleren")
                aantalTeControleren += 1;
            if (status === "gecontroleerd")
                aantalGecontroleerd += 1;
            if (status === "vastgezet")
                aantalVastgezet += 1;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Onbekende fout";
            werknemers.push({
                id: input.id,
                naam: input.naam,
                profiel: input.profiel,
                status: "fout",
                fout: message,
                validaties: [
                    ...validaties.filter((v) => v.werknemerId === input.id),
                    {
                        niveau: "blokkerend",
                        code: "berekening_mislukt",
                        boodschap: message,
                        werknemerId: input.id,
                    },
                ],
            });
            aantalFout += 1;
        }
    }
    const loonwigPct = werkgeverskost > 0
        ? round2(((werkgeverskost - netto) / werkgeverskost) * 100)
        : null;
    return {
        periode: inputs[0]?.profiel ? profielPeriodeLabel(inputs[0].profiel) : "Onbekende periode",
        werknemers,
        totalen: {
            cashBruto: round2(cashBruto),
            brutoRszBasis: round2(brutoRszBasis),
            belastbaarVoorBV: round2(belastbaarVoorBV),
            netto: round2(netto),
            werkgeverskost: round2(werkgeverskost),
            loonwigPct,
            aantalBerekend,
            aantalFout,
            aantalConcept,
            aantalTeControleren,
            aantalGecontroleerd,
            aantalVastgezet,
        },
        validaties: [
            ...validaties,
            ...werknemers.flatMap((w) => w.validaties).filter((v) => v.code === "berekening_mislukt"),
        ],
        heeftBlokkeringen: [
            ...validaties,
            ...werknemers.flatMap((w) => w.validaties).filter((v) => v.code === "berekening_mislukt"),
        ].some((v) => v.niveau === "blokkerend"),
    };
}
