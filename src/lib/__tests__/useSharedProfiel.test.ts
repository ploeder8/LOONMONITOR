import { describe, expect, it } from "bun:test";
import { PROFIEL_STORAGE_SCOPE } from "@/lib/useSharedProfiel";
describe("useSharedProfiel storage", () => {
    it("bewaart calculatorinputs per venster in plaats van browserbreed", () => {
        expect(PROFIEL_STORAGE_SCOPE).toBe("venster");
    });
});
