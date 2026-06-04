import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
  abbreviateRechtsvorm,
  isValidKboNumber,
  normalizeKboNumber,
  parseKboPage,
  isAppHtml,
} from "@/lib/kbo";
import { cbeEnterpriseToKboHtml, extractCbeEnterprise } from "@/lib/cbe";

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
  it("proxy't lokale Vite KBO-fallbackrequests via /kbo met TLS fallback", () => {
    const viteConfig = readFileSync("vite.config.ts", "utf8");
    expect(viteConfig).toContain('"/kbo"');
    expect(viteConfig).toContain("secure: false");
    expect(readFileSync("src/lib/kbo.ts", "utf8")).toContain("/kbo/zoeknummerform.html");
    expect(viteConfig).not.toContain('"/api/kbo"');
  });
});

describe("CBE API adapter", () => {
  it("zet CBE enterprise JSON om naar het bestaande KBO-parsercontract", () => {
    const enterprise = extractCbeEnterprise({
      data: {
        denomination: "BOER ZOEKT BIER",
        juridical_form_short: "VZW",
        fiscalYearEnd: "31 december",
        address: {
          street: "Muggenstraat",
          street_number: "5",
          box: "A",
          post_code: "3500",
          city: "Hasselt",
        },
      },
    });

    expect(parseKboPage(cbeEnterpriseToKboHtml(enterprise))).toEqual({
      name: "BOER ZOEKT BIER",
      form: "VZW",
      yearEnd: "31 december",
      address: {
        street: "Muggenstraat",
        houseNr: "5 bus A",
        zip: "3500",
        city: "Hasselt",
      },
    });
  });

  it("ondersteunt brede CBE-achtige JSON-varianten zonder de UI-parser te wijzigen", () => {
    const enterprise = extractCbeEnterprise({
      name: "JAakie Payroll",
      legalForm: { description: "Besloten vennootschap" },
      fiscalYearEnd: "31 december",
      address: {
        street: "Kerkstraat",
        houseNumber: "5",
        postalCode: "2000",
        municipality: "Antwerpen",
      },
    });

    expect(parseKboPage(cbeEnterpriseToKboHtml(enterprise))).toEqual({
      name: "JAakie Payroll",
      form: "BV",
      yearEnd: "31 december",
      address: {
        street: "Kerkstraat",
        houseNr: "5",
        zip: "2000",
        city: "Antwerpen",
      },
    });
  });

  it("gebruikt in de Vercel API-route CBE Bearer-auth in plaats van publieke KBO HTML", () => {
    const apiRoute = readFileSync("api/kbo.ts", "utf8");
    expect(apiRoute).toContain("https://cbeapi.be/api/v1/company/");
    expect(apiRoute).toContain("CBE_API_KEY");
    expect(apiRoute).toContain("Authorization");
    expect(apiRoute).not.toContain("kbopub.economie.fgov.be");
  });
});
