import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AiChatWidget } from "@/components/AiChatWidget";
describe("AiChatWidget", () => {
    it("rendert een compacte publieke chatknop", () => {
        const html = renderToStaticMarkup(createElement(AiChatWidget));
        expect(html).toContain("Vraag aan Jaakie");
        expect(html).toContain("aria-label=\"Open Jaakie chat\"");
    });
});
