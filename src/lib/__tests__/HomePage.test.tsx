import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { HomePage } from "@/pages/HomePage";

it("rendert periodieke voordelen en mobiliteit niet als aparte onderste resultaatbanden", () => {
  const html = renderToStaticMarkup(<HomePage />);

  expect(html).not.toContain('id="band-voordelen"');
  expect(html).not.toContain('id="band-mobiliteit"');
});
