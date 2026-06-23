import { expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SharedProfielProvider } from "@/lib/useSharedProfiel";
import { HomePage } from "@/pages/HomePage";

function renderWithProfiel(element: React.ReactElement): string {
    return renderToStaticMarkup(<SharedProfielProvider>{element}</SharedProfielProvider>);
}
it("rendert periodieke voordelen en mobiliteit niet als aparte onderste resultaatbanden", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).not.toContain('id="band-voordelen"');
    expect(html).not.toContain('id="band-mobiliteit"');
});
it("splitst loonkost & netto in twee aparte banden met maand/jaar naast elkaar", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).toContain('id="band-netto"');
    expect(html).toContain('id="band-loonkost-werkgever"');
    expect(html).not.toContain('id="band-loonkost"');
    expect(html).toContain(">Netto<");
    expect(html).toContain("Loonkost werkgever<");
    expect(html).toContain("Netto berekening (per maand)");
    expect(html).toContain("Netto jaaroverzicht");
    expect(html).toContain("Loonkost werkgever (per maand)");
    expect(html).toContain("Loonkost werkgever (per jaar)");
});
it("rendert CSV import/export als page action zonder open velden", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).toContain("calculator-page-actions");
    expect(html).toContain("calculator-dev-actions");
    expect(html).toContain("CSV import/export");
    expect(html).not.toContain("Exportnaam");
    expect(html).not.toContain("Commentaar");
});
it("rendert richting-toggle en acties inline; kerncijfers niet meer in de pagina", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).toContain("margin:-22px auto 0");
    expect(html).toContain("padding:0 1rem 1.5rem");
    expect(html).toContain("calculator-page-actions");
    expect(html).toContain("direction-toggle direction-toggle-compact");
    expect(html).not.toContain("hero-summary");
    expect(html).not.toContain("BRUTO");
    expect(html).not.toContain("WERKGEVERSKOST");
    expect(html).toContain("Print overzicht");
});
it("toont bruto-netto-toggle en CSV velden zonder pijltjesicoon", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).toContain("CSV import/export");
    expect(html).toContain("Bruto → Netto");
    expect(html).not.toContain("lucide-arrow-right-left");
});
it("plaatst page-actions rechts en gebruikt compacte actieknoppen", () => {
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toContain(".calculator-page-actions");
    expect(css).toContain("justify-content: flex-end;");
    expect(css).toContain(".calculator-dev-actions");
    expect(css).toContain("min-height: 29px;");
    expect(css).toContain("padding: 0 10px;");
});
it("gebruikt compacte cockpitkaarten en formulierinputs", () => {
    const brandCss = readFileSync("src/branding/brand.css", "utf8");
    const css = readFileSync("src/index.css", "utf8");
    expect(brandCss).toContain("--cockpit-card-padding: 14px;");
    expect(brandCss).toContain("--cockpit-grid-gap: 10px;");
    expect(css).toContain(".home-layout .rounded-\\[12px\\]");
    expect(css).toContain("min-height: 34px;");
    expect(css).toContain(".home-layout label");
    expect(css).toContain("font-size: 12px;");
});
it("rendert compacte loonkost- en nettodetailkaarten", () => {
    const html = renderWithProfiel(<HomePage />);
    expect(html).toContain("result-detail-card");
    expect(html).toContain("result-detail-title");
    expect(html).toContain("result-detail-table");
    expect(html).toContain("result-loonwig-callout");
    expect(html).toContain("padding:0.5rem 0.65rem");
    expect(html).toContain("border:1px solid var(--color-primary)");
});
