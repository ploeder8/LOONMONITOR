import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { HomePage } from "@/pages/HomePage";

it("rendert periodieke voordelen en mobiliteit niet als aparte onderste resultaatbanden", () => {
  const html = renderToStaticMarkup(<HomePage />);

  expect(html).not.toContain('id="band-voordelen"');
  expect(html).not.toContain('id="band-mobiliteit"');
});

it("rendert CSV import/export velden", () => {
  const html = renderToStaticMarkup(<HomePage />);

  expect(html).toContain("Exportnaam");
  expect(html).toContain("Commentaar");
  expect(html).toContain("Importeer CSV");
  expect(html).toContain("Exporteer CSV");
});

it("plaatst CSV export boven de bruto-netto-toggle zonder pijltjesicoon", () => {
  const html = renderToStaticMarkup(<HomePage />);

  expect(html.indexOf("Exportnaam")).toBeLessThan(html.indexOf("Bruto → Netto"));
  expect(html).not.toContain("lucide-arrow-right-left");
});
