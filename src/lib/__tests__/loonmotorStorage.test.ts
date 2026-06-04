import { describe, expect, it } from "bun:test";
import { DEFAULTS } from "@/lib/profiel";
import {
  createLeegBedrijf,
  createMedewerkerVoorBedrijf,
  maskInsz,
  readLoonmotorDossiers,
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
});
