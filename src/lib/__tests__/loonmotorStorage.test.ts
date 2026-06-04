import { describe, expect, it } from "bun:test";
import { DEFAULTS } from "@/lib/profiel";
import {
  createLeegBedrijf,
  createMedewerkerVoorBedrijf,
  prependLoonmotorDossier,
  maskInsz,
  readLoonmotorDossiers,
  removeLoonmotorDossier,
  writeLoonmotorDossiers,
  type LoonmotorDossier,
} from "@/lib/loonmotor";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

describe("Loonmotor opslag", () => {
  it("valt terug naar een lege lijst bij corrupte lokale opslag", () => {
    const storage = memoryStorage({ "jaakie:loonmotor:dossiers:v1": "{geen-json" });
    expect(readLoonmotorDossiers(storage)).toEqual([]);
  });

  it("schrijft en leest lokale conceptdossiers", () => {
    const storage = memoryStorage();
    const bedrijf = createLeegBedrijf("bedrijf-1");
    const medewerker = createMedewerkerVoorBedrijf(bedrijf, "wn-1", {
      ...DEFAULTS,
      werknemerNaam: "Jan Peeters",
      werknemerReferentie: "JP",
      brutoloon: 3200,
    });
    const dossiers: LoonmotorDossier[] = [{ bedrijf, medewerkers: [medewerker] }];

    writeLoonmotorDossiers(storage, dossiers);

    expect(readLoonmotorDossiers(storage)).toEqual(dossiers);
  });

  it("maskeert INSZ in lijstweergaves", () => {
    expect(maskInsz("85.07.30-123.45")).toBe("*********3.45");
    expect(maskInsz("")).toBe("");
  });

  it("voegt een nieuw bedrijfsdossier bovenaan toe en selecteert het nieuwe bedrijf", () => {
    const bestaand = createLeegBedrijf("bedrijf-1");
    const nieuw = createLeegBedrijf("bedrijf-2");

    const result = prependLoonmotorDossier([{ bedrijf: bestaand, medewerkers: [] }], nieuw);

    expect(result.dossiers.map((dossier) => dossier.bedrijf.id)).toEqual(["bedrijf-2", "bedrijf-1"]);
    expect(result.selectedId).toBe("bedrijf-2");
  });

  it("verwijdert een bedrijf inclusief medewerkers en kiest een aangrenzend dossier", () => {
    const eerste = createLeegBedrijf("bedrijf-1");
    const tweede = createLeegBedrijf("bedrijf-2");
    const derde = createLeegBedrijf("bedrijf-3");
    const medewerker = createMedewerkerVoorBedrijf(tweede, "wn-1", DEFAULTS);

    const result = removeLoonmotorDossier(
      [
        { bedrijf: eerste, medewerkers: [] },
        { bedrijf: tweede, medewerkers: [medewerker] },
        { bedrijf: derde, medewerkers: [] },
      ],
      "bedrijf-2",
    );

    expect(result.dossiers.map((dossier) => dossier.bedrijf.id)).toEqual(["bedrijf-1", "bedrijf-3"]);
    expect(result.selectedId).toBe("bedrijf-3");
    expect(result.dossiers.some((dossier) => dossier.medewerkers.some((item) => item.id === "wn-1"))).toBe(false);
  });

  it("verwijdert het laatste bedrijf en zet de selectie leeg", () => {
    const bedrijf = createLeegBedrijf("bedrijf-1");

    const result = removeLoonmotorDossier([{ bedrijf, medewerkers: [] }], "bedrijf-1");

    expect(result.dossiers).toEqual([]);
    expect(result.selectedId).toBe("");
  });
});
