import { expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage } from "@/pages/HomePage";
it("rendert periodieke voordelen en mobiliteit niet als aparte onderste resultaatbanden", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).not.toContain('id="band-voordelen"');
    expect(html).not.toContain('id="band-mobiliteit"');
});
it("splitst loonkost & netto in twee aparte banden met maand/jaar naast elkaar", () => {
    const html = renderToStaticMarkup(<HomePage />);
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
it("rendert CSV import/export als sticky ontwikkelactie zonder open velden", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("calculator-sticky-summary");
    expect(html).toContain("calculator-dev-actions");
    expect(html).toContain("CSV import/export");
    expect(html).not.toContain("Exportnaam");
    expect(html).not.toContain("Commentaar");
});
it("rendert toggle, kerncijfers en acties in een compacte sticky rekenbalk", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("margin:-18px auto 0");
    expect(html).toContain("padding:0 1rem 1.5rem");
    expect(html).toContain("calculator-sticky-summary");
    expect(html).toContain("direction-toggle direction-toggle-compact");
    expect(html).toContain("hero-summary hero-summary-compact");
    expect(html).toContain("BRUTO");
    expect(html).toContain("WERKGEVERSKOST");
    expect(html).toContain("Print overzicht");
});
it("toont bruto-netto-toggle en CSV velden zonder pijltjesicoon", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("CSV import/export");
    expect(html).toContain("Bruto → Netto");
    expect(html).not.toContain("lucide-arrow-right-left");
});
it("centreert de compacte toggle en verkleint de sticky kerncijfers", () => {
    const css = readFileSync("src/index.css", "utf8");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);");
    expect(css).toContain("grid-column: 2;");
    expect(css).toContain("grid-column: 3;");
    expect(css).toContain("min-height: 26px;");
    expect(css).toContain("min-height: 29px;");
    expect(css).toContain("padding: 5px 0 6px;");
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
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("result-detail-card");
    expect(html).toContain("result-detail-title");
    expect(html).toContain("result-detail-table");
    expect(html).toContain("result-loonwig-callout");
    expect(html).toContain("padding:0.5rem 0.65rem");
    expect(html).toContain("border:1px solid var(--color-primary)");
});
