import { describe, expect, it } from "bun:test";
import { DEFAULTS } from "@/lib/profiel";
import {
  appendLoonrunInputs,
  clearLoonrunInputs,
  LOONRUN_STORAGE_KEY,
  readLoonrunInputs,
  writeLoonrunInputs,
} from "@/lib/loonrunStorage";
import type { LoonrunWerknemerInput } from "@/lib/loonrun";

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

describe("Loonrun opslag", () => {
  it("valt terug naar een lege lijst bij corrupte lokale opslag", () => {
    const storage = memoryStorage({ [LOONRUN_STORAGE_KEY]: "{geen-json" });

    expect(readLoonrunInputs(storage)).toEqual([]);
  });

  it("schrijft en leest loonruninputs", () => {
    const storage = memoryStorage();
    const inputs: LoonrunWerknemerInput[] = [
      { id: "wn-1", naam: "Jan Peeters", profiel: { ...DEFAULTS, brutoloon: 3200 }, insz: "85.07.30-123.45" },
    ];

    writeLoonrunInputs(inputs, storage);

    expect(readLoonrunInputs(storage)).toEqual(inputs);
  });

  it("laat storagefouten de loonrunflow niet crashen", () => {
    const storage = {
      getItem() {
        return "[]";
      },
      setItem() {
        throw new Error("quota");
      },
      removeItem() {
        throw new Error("private mode");
      },
    };

    expect(() => writeLoonrunInputs([], storage)).not.toThrow();
    expect(() => clearLoonrunInputs(storage)).not.toThrow();
  });

  it("voegt nieuwe werknemers toe", () => {
    const existing: LoonrunWerknemerInput[] = [
      { id: "wn-1", naam: "Jan", profiel: { ...DEFAULTS, brutoloon: 3000 } },
    ];
    const additions: LoonrunWerknemerInput[] = [
      { id: "wn-2", naam: "Piet", profiel: { ...DEFAULTS, brutoloon: 3300 } },
    ];

    const result = appendLoonrunInputs(existing, additions);

    expect(result.map((input) => input.id)).toEqual(["wn-1", "wn-2"]);
  });

  it("vervangt bestaande werknemers met hetzelfde id", () => {
    const existing: LoonrunWerknemerInput[] = [
      { id: "wn-1", naam: "Jan oud", profiel: { ...DEFAULTS, brutoloon: 3000 } },
    ];
    const additions: LoonrunWerknemerInput[] = [
      { id: "wn-1", naam: "Jan nieuw", profiel: { ...DEFAULTS, brutoloon: 3600 } },
    ];

    const result = appendLoonrunInputs(existing, additions);

    expect(result).toHaveLength(1);
    expect(result[0].naam).toBe("Jan nieuw");
    expect(result[0].profiel.brutoloon).toBe(3600);
  });

  it("wist de opslagkey", () => {
    const storage = memoryStorage({ [LOONRUN_STORAGE_KEY]: "[]" });

    clearLoonrunInputs(storage);

    expect(storage.getItem(LOONRUN_STORAGE_KEY)).toBeNull();
  });
});
