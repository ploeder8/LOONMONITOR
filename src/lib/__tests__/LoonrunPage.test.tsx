import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULTS } from "@/lib/profiel";
import { LoonrunPage } from "@/pages/LoonrunPage";
import { LOONRUN_STORAGE_KEY } from "@/lib/loonrunStorage";
import { SharedProfielProvider } from "@/lib/useSharedProfiel";

function withLocalStorage(value: string, callback: () => void) {
  const previous = globalThis.localStorage;
  globalThis.localStorage = {
    get length() {
      return 1;
    },
    clear() {},
    getItem(key: string) {
      return key === LOONRUN_STORAGE_KEY ? value : null;
    },
    key(index: number) {
      return index === 0 ? LOONRUN_STORAGE_KEY : null;
    },
    setItem() {},
    removeItem() {},
  };
  try {
    callback();
  } finally {
    globalThis.localStorage = previous;
  }
}

describe("LoonrunPage exportvoorbereiding", () => {
  it("toont de generieke exportvoorbereiding als controlelaag", () => {
    const html = renderToStaticMarkup(
      <SharedProfielProvider><LoonrunPage
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
      /></SharedProfielProvider>,
    );

    expect(html).toContain("Exportvoorbereiding");
    expect(html).toContain("jaakie-payroll-export-v1");
    expect(html).toContain("Voorbereiding voor sociaal secretariaat / boekhouding, geen officiële aangifte");
    expect(html).toContain("Exporteerbaar");
    expect(html).toContain("Download payroll-export v1");
  });

  it("schermt download af wanneer loonrunvalidaties export blokkeren", () => {
    const html = renderToStaticMarkup(
      <SharedProfielProvider><LoonrunPage
        initialInputs={[
          { id: "wn-1", naam: "Jan", profiel: { ...DEFAULTS, berekeningsMaand: "06" } },
          { id: "wn-2", naam: "Piet", profiel: { ...DEFAULTS, berekeningsMaand: "07" } },
        ]}
      /></SharedProfielProvider>,
    );

    expect(html).toContain("Geblokkeerd");
    expect(html).toContain("gemengde_periode");
    expect(html).toContain("Download geblokkeerd");
    expect(html).not.toContain("Download payroll-export v1</button>");
  });

  it("leest werknemers uit de gedeelde loonrunopslag", () => {
    withLocalStorage(
      JSON.stringify([
        {
          id: "wn-storage",
          naam: "Storage Werknemer",
          profiel: {
            ...DEFAULTS,
            werknemerNaam: "Storage Werknemer",
            werkgeverNaam: "Jaakie Payroll BV",
            werkgeverOndernemingsnummer: "0452.085.227",
          },
        },
      ]),
      () => {
        const html = renderToStaticMarkup(<SharedProfielProvider><LoonrunPage /></SharedProfielProvider>);

        expect(html).toContain("Storage Werknemer");
        expect(html).toContain("Exportvoorbereiding");
        expect(html).toContain("jaakie-payroll-export-v1");
      },
    );
  });
});
