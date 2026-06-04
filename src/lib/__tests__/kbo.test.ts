import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
  abbreviateRechtsvorm,
  isValidKboNumber,
  normalizeKboNumber,
  parseKboPage,
  isAppHtml,
} from "@/lib/kbo";

describe("KBO helpers", () => {
  it("normaliseert Belgische ondernemingsnummers naar XXXX.XXX.XXX", () => {
    expect(normalizeKboNumber("452085227")).toBe("0452.085.227");
    expect(normalizeKboNumber("BE 0452 085 227")).toBe("0452.085.227");
    expect(normalizeKboNumber("123")).toBe("");
  });

  it("valideert ondernemingsnummers met modulo-97 controle", () => {
    expect(isValidKboNumber("0452.085.227")).toBe(true);
    expect(isValidKboNumber("0452.085.226")).toBe(false);
    expect(isValidKboNumber("9452.085.227")).toBe(false);
  });

  it("kort rechtsvormen af waar mogelijk", () => {
    expect(abbreviateRechtsvorm("Besloten vennootschap")).toBe("BV");
    expect(abbreviateRechtsvorm("Naamloze vennootschap")).toBe("NV");
    expect(abbreviateRechtsvorm("Onbekende vorm")).toBe("Onbekende vorm");
  });

  it("parseert naam, rechtsvorm, boekjaareinde en zeteladres uit KBO-html", () => {
    const html = `
      <table>
        <tr><td>Naam:</td><td>Jaakie Payroll BV<br><span class="upd">update</span></td></tr>
        <tr><td>Rechtsvorm:</td><td>Besloten vennootschap</td></tr>
        <tr><td>Einddatum boekjaar</td><td>31 december</td></tr>
        <tr><td>Adres van de zetel:</td><td>Kerkstraat 12 bus A<br>2000 Antwerpen</td></tr>
      </table>
    `;

    expect(parseKboPage(html)).toEqual({
      name: "Jaakie Payroll BV",
      form: "BV",
      yearEnd: "31 december",
      address: {
        street: "Kerkstraat",
        houseNr: "12 bus A",
        zip: "2000",
        city: "Antwerpen",
      },
    });
  });

  it("decodeert HTML-entities in echte KBO-adressen", () => {
    const parsed = parseKboPage(`
      <table>
        <tr><td>Naam:</td><td>BOER ZOEKT BIER</td></tr>
        <tr><td>Rechtsvorm:</td><td>Vereniging zonder winstoogmerk</td></tr>
        <tr><td>Adres van de zetel:</td><td>Muggenstraat&nbsp;5<br>3500&nbsp;Hasselt</td></tr>
      </table>
    `);

    expect(parsed.address).toEqual({
      street: "Muggenstraat",
      houseNr: "5",
      zip: "3500",
      city: "Hasselt",
    });
  });

  it("herkent een lokaal geserveerd API-bronbestand als proxyfout", () => {
    expect(isAppHtml("export default async function handler(request: Request): Promise<Response> {}")).toBe(true);
  });
});

describe("KBO dev proxy", () => {
  it("proxy't lokale Vite KBO-requests via /api/kbo en /kbo met TLS fallback", () => {
    const viteConfig = readFileSync("vite.config.ts", "utf8");
    expect(viteConfig).toContain('"/api/kbo"');
    expect(viteConfig).toContain('"/kbo"');
    expect(viteConfig).toContain("secure: false");
    expect(viteConfig).toContain("zoeknummerform.html");
  });
});
