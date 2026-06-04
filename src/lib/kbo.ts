export interface KboLookupResult {
  name: string;
  form: string;
  yearEnd: string;
  address: {
    street: string;
    houseNr: string;
    zip: string;
    city: string;
  };
}

export interface KboFetchResult {
  ok: boolean;
  status: number;
  html: string;
}

const RECHTSVORMEN: Record<string, string> = {
  "naamloze vennootschap": "NV",
  "besloten vennootschap": "BV",
  "coöperatieve vennootschap": "CV",
  "cooperatieve vennootschap": "CV",
  "coöperatieve vennootschap met beperkte aansprakelijkheid": "CVBA",
  "cooperatieve vennootschap met beperkte aansprakelijkheid": "CVBA",
  "coöperatieve vennootschap met onbeperkte aansprakelijkheid": "CVOA",
  "cooperatieve vennootschap met onbeperkte aansprakelijkheid": "CVOA",
  "commanditaire vennootschap": "CommV",
  "gewone commanditaire vennootschap": "CommV",
  "commanditaire vennootschap op aandelen": "Comm.VA",
  maatschap: "Maatschap",
  "vennootschap onder firma": "VOF",
  "vereniging zonder winstoogmerk": "VZW",
  "internationale vereniging zonder winstoogmerk": "IVZW",
  "stichting van openbaar nut": "SON",
  "private stichting": "PS",
  stichting: "Stichting",
  eenmanszaak: "Eenmanszaak",
  "buitenlandse vennootschap": "Buitenl. venn.",
  landbouwvennootschap: "LV",
  "economisch samenwerkingsverband": "ESV",
  "europees economisch samenwerkingsverband": "EESV",
  "europese vennootschap": "SE",
  "europese coöperatieve vennootschap": "SCE",
  "europese cooperatieve vennootschap": "SCE",
  beroepsvereniging: "BV",
};

export function normalizeKboNumber(value: unknown): string {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 9) digits = `0${digits}`;
  if (digits.length !== 10) return "";
  return `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}`;
}

export function isValidKboNumber(value: unknown): boolean {
  const formatted = normalizeKboNumber(value);
  if (!/^[0-2]\d{3}\.\d{3}\.\d{3}$/.test(formatted)) return false;
  const digits = formatted.replace(/\D/g, "");
  const base = parseInt(digits.slice(0, 8), 10);
  const control = parseInt(digits.slice(8), 10);
  return 97 - (base % 97) === control;
}

export function abbreviateRechtsvorm(form: string): string {
  const cleaned = cleanText(form);
  return RECHTSVORMEN[cleaned.toLowerCase()] ?? cleaned;
}

export function parseKboPage(html: string): KboLookupResult {
  const name = fieldText(html, "Naam:").split(/\n/)[0];
  const form = fieldText(html, "Rechtsvorm:").split(/\n/)[0];
  const yearEnd = fieldText(html, "Einddatum boekjaar").split(/\n/)[0];
  return {
    name,
    form: abbreviateRechtsvorm(form),
    yearEnd,
    address: parseAddress(fieldText(html, "Adres van de zetel:")),
  };
}

export async function fetchKboHtml(nummer: string): Promise<KboFetchResult> {
  const urls = [
    `/api/kbo?nummer=${nummer}&actionLu=Zoek`,
    `/.netlify/functions/kbo?nummer=${nummer}`,
    `/kbo/zoeknummerform.html?nummer=${nummer}&actionLu=Zoek`,
  ];
  let last: KboFetchResult | null = null;

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const result = {
        ok: response.ok,
        status: response.status,
        html: await response.text(),
      };
      const parsed = parseKboPage(result.html);
      if (parsed.name || parsed.form || parsed.address.street) return result;
      last = result;
    } catch (error) {
      if (last) return last;
      throw error;
    }
  }

  return last ?? { ok: false, status: 0, html: "" };
}

export function isAppHtml(html: string): boolean {
  return /<div id="root"><\/div>/.test(html) ||
    /\/src\/main\.[jt]sx/.test(html) ||
    /export default async function handler/.test(html) ||
    /Waarderingstool/.test(html) ||
    /Jaakie/.test(html);
}

function fieldText(html: string, label: string): string {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cells = Array.from(doc.querySelectorAll("td"));
    for (let i = 0; i < cells.length; i += 1) {
      if (cleanText(readNodeText(cells[i])) === label) {
        return cleanText(readNodeText(cells[i + 1]));
      }
    }
    return "";
  }

  const cells = Array.from(html.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)).map((match) => cellTextFallback(match[1]));
  for (let i = 0; i < cells.length; i += 1) {
    if (cleanText(cells[i]) === label) return cleanText(cells[i + 1] ?? "");
  }
  return "";
}

function readNodeText(node: Node | undefined): string {
  if (!node) return "";
  if (node.nodeType === 3) return node.nodeValue ?? "";
  if (node.nodeType !== 1) return "";
  const element = node as Element;
  if (element.tagName.toLowerCase() === "br") return "\n";
  if (element.tagName.toLowerCase() === "sup") return "";
  if (element.classList.contains("upd")) return "";
  return Array.from(element.childNodes).map(readNodeText).join("");
}

function cellTextFallback(value: string): string {
  return value
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<[^>]*class=["'][^"']*\bupd\b[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
}

function parseAddress(text: string): KboLookupResult["address"] {
  const lines = cleanText(text).split(/\n/).filter(Boolean);
  const cityIdx = lines.findIndex((line) => /^\d{4}\s+/.test(line));
  const streetLine = (cityIdx > 0 ? lines.slice(0, cityIdx) : lines.slice(0, 1)).join(" ");
  const cityLine = cityIdx >= 0 ? lines[cityIdx] : lines[1] || "";
  const streetMatch = streetLine.match(/^(.+?)\s+(\d+\S*(?:\s+\S+)*)$/);
  const cityMatch = cityLine.match(/^(\d{4})\s+(.+)$/);
  return {
    street: streetMatch ? streetMatch[1] : streetLine,
    houseNr: streetMatch ? streetMatch[2] : "",
    zip: cityMatch ? cityMatch[1] : "",
    city: cityMatch ? cityMatch[2] : cityLine,
  };
}

function cleanText(value: unknown): string {
  return String(value || "")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
