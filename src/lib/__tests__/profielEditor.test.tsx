import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfielEditor } from "@/pages/profiel/ProfielEditor";
import { DEFAULTS, type Profiel } from "@/lib/profiel";
import type { ProfielSetter, ProfielUpdate } from "@/pages/home/types";

describe("ProfielEditor", () => {
  it("rendert de gedeelde calculatorgroepen en identificatievelden", () => {
    const set = ((_kOfUpdate: keyof Profiel | ProfielUpdate, _v?: Profiel[keyof Profiel]) => {}) as ProfielSetter;

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
