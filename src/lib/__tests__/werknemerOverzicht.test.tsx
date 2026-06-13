import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { WerknemerOverzicht } from "@/pages/home/WerknemerOverzicht";
import { DEFAULTS } from "@/lib/profiel";
import { formatEUR } from "@/lib/money";
import { berekenProfielKernOutputs } from "@/lib/profielBerekeningen";

describe("WerknemerOverzicht rendering", () => {
    it("toont de titel en periode", () => {
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS}/>);
        expect(html).toContain("Loonoverzicht");
        expect(html).toContain("juni 2026");
    });

    it("toont werknemer- en werkgever-metadata", () => {
        const profiel = {
            ...DEFAULTS,
            werknemerNaam: "Jan Jansen",
            werknemerReferentie: "W12345",
            werknemerRijksregister: "86.07.19-123.45",
            werkgeverNaam: "Acme BV",
            werkgeverOndernemingsnummer: "0123.456.789",
            werkgeverStraat: "Kerkstraat",
            werkgeverHuisnummer: "1",
            werkgeverPostcode: "1000",
            werkgeverGemeente: "Brussel",
        };
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel}/>);
        expect(html).toContain("Jan Jansen");
        expect(html).toContain("W12345");
        expect(html).toContain("86.07.19-123.45");
        expect(html).toContain("Acme BV");
        expect(html).toContain("0123.456.789");
        expect(html).toContain("Kerkstraat 1");
        expect(html).toContain("1000 Brussel");
    });

    it("toont de nieuwe maand- en jaartabellen", () => {
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS}/>);
        expect(html).toContain("Bruto Netto op maandbasis");
        expect(html).toContain("Loonkost op maandbasis");
        expect(html).toContain("Bruto Netto op jaarbasis");
        expect(html).toContain("Loonkost op jaarbasis");
        expect(html).toContain("Brutoloon");
        expect(html).toContain("RSZ werknemer");
        expect(html).toContain("Belastbaar loon");
        expect(html).toContain("Bedrijfsvoorheffing");
        expect(html).toContain("Netto op maandbasis");
        expect(html).toContain("RSZ werkgever");
        expect(html).toContain("Totale loonkost op maandbasis");
        expect(html).toContain("Netto op jaarbasis");
        expect(html).toContain("Totale loonkost op jaarbasis");
        expect(html).not.toContain("Sociaal Fonds 200");
    });

    it("toont de berekende kernbedragen in de tabellen", () => {
        const outputs = berekenProfielKernOutputs(DEFAULTS);
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS}/>);
        expect(html).toContain(formatEUR(outputs.bruto));
        if (outputs.netto !== null) {
            expect(html).toContain(formatEUR(outputs.netto));
        }
        if (outputs.werkgeverskostMaand !== null) {
            expect(html).toContain(formatEUR(outputs.werkgeverskostMaand));
        }
    });

    it("toont de jaarbonus in het printoverzicht wanneer die actief is", () => {
        const profiel = {
            ...DEFAULTS,
            bonusBedrag: 1200,
            bonusPeriode: "jaar" as const,
        };
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel}/>);
        expect(html).toContain("Bonus");
        expect(html).toContain(formatEUR(1200));
    });

    it("toont de pro-forma banner en de disclaimer", () => {
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={DEFAULTS}/>);
        expect(html).toContain("Pro-forma overzicht");
        expect(html).toContain("geen officiële loonafrekening");
        expect(html).toContain("Het doel van deze simulatie is om u een beeld te geven");
        expect(html).toContain("Wij kunnen in geen geval aansprakelijk gesteld worden");
    });

    it("toont de doelgroepvermindering-voorwaarde wanneer van toepassing", () => {
        const profiel = {
            ...DEFAULTS,
            berekeningsMaand: "07" as const,
            doelgroepverminderingEersteAanwervingen: "eerste_werknemer" as const,
        };
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel}/>);
        expect(html).toContain("Voorwaarde doelgroepvermindering");
        expect(html).toContain("daadwerkelijk extra werkgelegenheid creëert");
    });

    it("toont studentenmodus voor studenten", () => {
        const profiel = { ...DEFAULTS, statuut: "student" as const };
        const html = renderToStaticMarkup(<WerknemerOverzicht profiel={profiel}/>);
        expect(html).toContain("Studentenmodus");
        expect(html).toContain("Voor studenten worden geen RSZ");
    });
});
