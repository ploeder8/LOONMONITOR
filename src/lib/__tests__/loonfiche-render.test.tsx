import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LoonficheDocument } from "@/pages/loonfiche/LoonficheDocument";
import { LoonficheTabel } from "@/pages/loonfiche/LoonficheTabel";
import { bouwLoonficheVoorProfiel } from "@/lib/loonfiche";
import { DEFAULTS } from "@/lib/profiel";

const loonfiche = bouwLoonficheVoorProfiel(DEFAULTS);

describe("LoonficheDocument rendering", () => {
    it("rendert de rode simulatie-banner", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).toContain("SIMULATIE");
        expect(html).toContain("geen officiële loonfiche");
    });

    it("toont de loonstrook-header met werkgever en periode", () => {
        const profiel = {
            ...DEFAULTS,
            werkgeverNaam: "Acme BV",
            werkgeverStraat: "Industrieweg",
            werkgeverHuisnummer: "78",
            werkgeverPostcode: "3620",
            werkgeverGemeente: "Lanaken",
        };
        const lf = bouwLoonficheVoorProfiel(profiel);
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={lf}/>);
        expect(html).toContain("LOONSTROOK");
        expect(html).toContain("Acme BV");
        expect(html).toContain("periode van 01.06.2026 tot 30.06.2026");
        expect(html).not.toContain("uittreksel van de individuele rekening");
    });

    it("toont 'Netto te betalen'", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).toContain("Netto te betalen");
    });

    it("toont geen werkgeverskost in het document", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).not.toContain("Werkgeverskost per maand");
    });

    it("toont de metadata-groepen", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).toContain("referte");
        expect(html).toContain("onderneming");
        expect(html).toContain("persoonlijke gegevens");
        expect(html).toContain("contractgegevens");
    });

    it("toont referte als enkele rij zonder uppercase groepstitel", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).toContain("referte");
        expect(html).not.toContain("REFERTE");
    });

    it("toont geen lege werknemersnaam-placeholder", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).not.toContain("loonfiche-employee-name");
    });

    it("toont werknemer- en werkgeverwaarden wanneer ingevuld", () => {
        const profiel = {
            ...DEFAULTS,
            werknemerNaam: "Jan Jansen",
            werknemerReferentie: "W12345",
            werkgeverNaam: "Acme BV",
            werkgeverOndernemingsnummer: "0123.456.789",
        };
        const lf = bouwLoonficheVoorProfiel(profiel);
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={lf}/>);
        expect(html).toContain("Jan Jansen");
        expect(html).toContain("W12345");
        expect(html).toContain("Acme BV");
        expect(html).toContain("0123.456.789");
    });

    it("toont em-dash voor lege identificatievelden", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).toContain("—");
    });

    it("toont nooit de bronvermelding", () => {
        const html = renderToStaticMarkup(<LoonficheDocument loonfiche={loonfiche}/>);
        expect(html).not.toContain("Bronvermelding");
    });

    it("toont subtotalen in de loonfichetabel", () => {
        const html = renderToStaticMarkup(<LoonficheTabel regels={loonfiche.regels}/>);
        expect(html).toContain("Totaal bruto");
        expect(html).toContain("Loon na RSZ en werkbonus");
        expect(html).toContain("Belastbaar loon");
        expect(html).toContain("BV na verminderingen");
    });

    it("toont geen plus-prefix bij positieve bedragen", () => {
        const html = renderToStaticMarkup(<LoonficheTabel regels={loonfiche.regels}/>);
        expect(html).not.toContain("+ €");
    });
});
