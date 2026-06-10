import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULTS } from "@/lib/profiel";
import { LoonrunPage } from "@/pages/LoonrunPage";

describe("LoonrunPage exportvoorbereiding", () => {
  it("toont de generieke exportvoorbereiding als controlelaag", () => {
    const html = renderToStaticMarkup(
      <LoonrunPage
        initialInputs={[
          {
            id: "wn-1",
            naam: "Jan Peeters",
            profiel: {
              ...DEFAULTS,
              werknemerNaam: "Jan Peeters",
              werkgeverNaam: "Jaakie Payroll BV",
              werkgeverOndernemingsnummer: "0452.085.227",
              brutoloon: 3200,
            },
          },
        ]}
      />,
    );

    expect(html).toContain("Exportvoorbereiding");
    expect(html).toContain("jaakie-payroll-export-v1");
    expect(html).toContain("Voorbereiding voor sociaal secretariaat / boekhouding, geen officiële aangifte");
    expect(html).toContain("Exporteerbaar");
    expect(html).toContain("Download payroll-export v1");
  });

  it("schermt download af wanneer loonrunvalidaties export blokkeren", () => {
    const html = renderToStaticMarkup(
      <LoonrunPage
        initialInputs={[
          { id: "wn-1", naam: "Jan", profiel: { ...DEFAULTS, berekeningsMaand: "06" } },
          { id: "wn-2", naam: "Piet", profiel: { ...DEFAULTS, berekeningsMaand: "07" } },
        ]}
      />,
    );

    expect(html).toContain("Geblokkeerd");
    expect(html).toContain("gemengde_periode");
    expect(html).toContain("Download geblokkeerd");
    expect(html).not.toContain("Download payroll-export v1</button>");
  });
});
