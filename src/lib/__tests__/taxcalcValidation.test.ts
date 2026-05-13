import { describe, expect, it } from "bun:test";

import {
  brutoNettoValidatieCases,
  summarizeValidation,
  triangulatieAnchors,
} from "@/lib/taxcalcValidation";

describe("Golf 2 — Tax-Calc-validatiemetadata", () => {
  it("legt de 30 bruto-netto cases vast als pending zolang FOD Tax-Calc niet is ingevoerd", () => {
    const summary = summarizeValidation(brutoNettoValidatieCases);

    expect(brutoNettoValidatieCases).toHaveLength(30);
    expect(summary.pending).toBe(30);
    expect(summary.ok).toBe(0);
    expect(summary.afwijkingKlein).toBe(0);
    expect(summary.afwijkingGroot).toBe(0);
  });

  it("bevat minstens 5 Tier-2 triangulatie-ankers voor sociale-secretariaatvergelijking", () => {
    expect(triangulatieAnchors.length).toBeGreaterThanOrEqual(5);
    expect(triangulatieAnchors.every((anchor) => anchor.status === "pending")).toBe(true);
    expect(triangulatieAnchors.some((anchor) => anchor.bron === "Group S Salary Sim")).toBe(true);
  });
});
