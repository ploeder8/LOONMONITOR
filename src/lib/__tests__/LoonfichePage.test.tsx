import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LoonfichePage } from "@/pages/LoonfichePage";
describe("LoonfichePage", () => {
    it("rendert een profielsnapshot en geen incomplete calculator-toolbar", () => {
        const html = renderToStaticMarkup(<LoonfichePage />);
        expect(html).toContain("Profiel bewerken");
        expect(html).toContain("Profielsnapshot");
        expect(html).toContain("Brutoloon");
        expect(html).toContain("juni 2026");
        expect(html).not.toContain(">Calculator</div>");
    });
});
