import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfielEditor } from "@/pages/profiel/ProfielEditor";
import { DEFAULTS, type Profiel } from "@/lib/profiel";

describe("ProfielEditor", () => {
  it("rendert de gedeelde calculatorgroepen en identificatievelden", () => {
    function set<K extends keyof Profiel>(_k: K, _v: Profiel[K]) {}

    const html = renderToStaticMarkup(
      <ProfielEditor profiel={DEFAULTS} set={set} />,
    );

    expect(html).toContain("Identificatie");
    expect(html).toContain("Werknemer naam");
    expect(html).toContain("Werkgever ondernemingsnummer");
    expect(html).toContain("Wie ben je?");
    expect(html).toContain("Arbeidscontext");
    expect(html).toContain("Brutoloon");
    expect(html).toContain("Extra looncomponenten");
    expect(html).toContain("Werkgeversbijdragen");
  });
});
