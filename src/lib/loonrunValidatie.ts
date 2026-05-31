import { brutolocheck } from "@/lib/baremas";
import { refDatumVoorMaand, type Profiel } from "@/lib/profiel";
export type LoonrunValidatieNiveau = "blokkerend" | "waarschuwing" | "info";
export interface LoonrunValidatie {
    niveau: LoonrunValidatieNiveau;
    code: string;
    boodschap: string;
    werknemerId?: string;
}
export function valideerLoonrunInput(inputs: Array<{
    id: string;
    naam: string;
    profiel: Profiel;
}>): LoonrunValidatie[] {
    const meldingen: LoonrunValidatie[] = [];
    const contexten = inputs.map((input) => ({
        input,
        periode: `${input.profiel.berekeningsJaar}-${input.profiel.berekeningsMaand}`,
        refDatum: refDatumVoorMaand(input.profiel.berekeningsJaar, input.profiel.berekeningsMaand),
        werkgever: normaliseerContext(input.profiel.werkgeverNaam),
        ondernemingsnummer: normaliseerContext(input.profiel.werkgeverOndernemingsnummer),
    }));
    voegContextBlokkeringToe(meldingen, contexten, "periode", "gemengde_periode", "De loonrun bevat meerdere periodes.");
    voegContextBlokkeringToe(meldingen, contexten, "refDatum", "gemengde_referentiedatum", "De loonrun bevat meerdere referentiedatums.");
    voegContextBlokkeringToe(meldingen, contexten, "werkgever", "gemengde_werkgever", "De loonrun bevat meerdere werkgevers.");
    voegContextBlokkeringToe(meldingen, contexten, "ondernemingsnummer", "gemengd_ondernemingsnummer", "De loonrun bevat meerdere ondernemingsnummers.");
    for (const { input, refDatum } of contexten) {
        const p = input.profiel;
        if (p.arbeidsdagenPerMaand <= 0) {
            meldingen.push({
                niveau: "blokkerend",
                code: "arbeidsdagen_ongeldig",
                boodschap: "Arbeidsdagen moeten groter zijn dan 0.",
                werknemerId: input.id,
            });
        }
        if (p.statuut === "bediende") {
            try {
                const check = brutolocheck(p.schaal, p.cat, p.ervaringJaren, p.brutoloon, refDatum, p.tewerkstellingsbreuk);
                if (!check.ok) {
                    meldingen.push({
                        niveau: "blokkerend",
                        code: "onder_barema",
                        boodschap: "Het brutoloon ligt onder het PC 200 barema.",
                        werknemerId: input.id,
                    });
                }
            }
            catch (error) {
                meldingen.push({
                    niveau: "blokkerend",
                    code: "barema_niet_controleerbaar",
                    boodschap: error instanceof Error ? error.message : "Barema kon niet worden gecontroleerd.",
                    werknemerId: input.id,
                });
            }
        }
        if (p.woonwerkBedrijfswagen && p.bedrijfswagenCataloguswaarde <= 0) {
            meldingen.push({
                niveau: "blokkerend",
                code: "vaa_auto_cataloguswaarde_ongeldig",
                boodschap: "VAA bedrijfswagen vereist een geldige cataloguswaarde.",
                werknemerId: input.id,
            });
        }
        if (p.statuut === "student" && (p.studentLeeftijd < 15 || p.studentLeeftijd > 30)) {
            meldingen.push({
                niveau: "blokkerend",
                code: "student_leeftijd_ongeldig",
                boodschap: "Studentenleeftijd valt buiten de ondersteunde controlegrenzen.",
                werknemerId: input.id,
            });
        }
        if (p.maaltijdchequesActief && (p.maaltijdchequeWerkgeversaandeelPerDag <= 0 || p.maaltijdchequeWerknemersbijdragePerDag <= 0)) {
            meldingen.push({
                niveau: "waarschuwing",
                code: "maaltijdcheques_onvolledig",
                boodschap: "Maaltijdcheques zijn actief maar werkgevers- of werknemersbijdrage is 0.",
                werknemerId: input.id,
            });
        }
        if (p.arbeidsongevallenPct > 0.01) {
            meldingen.push({
                niveau: "waarschuwing",
                code: "ao_percentage_hoog",
                boodschap: "Het arbeidsongevallenpercentage is hoger dan 1%.",
                werknemerId: input.id,
            });
        }
        if (!input.naam.trim()) {
            meldingen.push({
                niveau: "waarschuwing",
                code: "werknemernaam_ontbreekt",
                boodschap: "Werknemernaam ontbreekt.",
                werknemerId: input.id,
            });
        }
    }
    if (inputs.length > 0) {
        meldingen.push({
            niveau: "info",
            code: "lokale_opslag",
            boodschap: "Deze loonrun wordt lokaal in de browser bewaard.",
        });
    }
    return meldingen;
}
function normaliseerContext(value: string): string {
    return value.trim().toLowerCase();
}
function voegContextBlokkeringToe<K extends "periode" | "refDatum" | "werkgever" | "ondernemingsnummer">(meldingen: LoonrunValidatie[], contexten: Array<Record<K, string>>, key: K, code: string, boodschap: string): void {
    const waarden = new Set(contexten.map((context) => context[key]).filter(Boolean));
    if (waarden.size > 1) {
        meldingen.push({ niveau: "blokkerend", code, boodschap });
    }
}
