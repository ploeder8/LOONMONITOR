# KBO-functionaliteit via ondernemingsnummer

Deze pagina beschrijft exact hoe de waarderingstool publieke KBO-data ophaalt op basis van een Belgisch ondernemingsnummer. De bedoeling is dat een andere agent deze functionaliteit kan nabouwen zonder bijkomende context.

## Doel en scope

De KBO-functionaliteit vult basisgegevens van een onderneming automatisch aan nadat de gebruiker een ondernemingsnummer invoert en op `Ophalen` klikt.

De lookup haalt HTML op uit de publieke KBO Public Search en parseert daaruit uitsluitend deze velden:

- `name`: ondernemingsnaam
- `form`: rechtsvorm, afgekort waar mogelijk
- `yearEnd`: einddatum boekjaar
- `street`: straat
- `houseNr`: huisnummer
- `zip`: postcode
- `city`: gemeente

De lookup vult geen sector, FTE, contactpersoon, historische cijfers, aandeelhoudersinformatie, bestuurders, activiteiten, vestigingen of jaarrekeningdata in.

Belangrijke bronbestanden:

- `src/components/tabs/Tab0Welkom.jsx`: UI voor ondernemingsnummer, knop en feedback.
- `src/context/ValuationContext.jsx`: lookup-flow, validatie, fetch-fallbacks en state-update.
- `src/lib/kbo.js`: normalisatie, validatie, HTML-parser, rechtsvorm-afkortingen en adresparser.
- `api/kbo.js`: actieve Vercel serverless proxy.
- `netlify/functions/kbo.js`: Netlify fallback proxy.
- `vite.config.js`: lokale dev/preview proxy voor `/kbo`.
- `vercel.json`: Vercel rewrite voor `/kbo`.
- `netlify.toml`: Netlify redirects als fallback.

## UI-flow

De KBO-lookup staat in tab 0, "Basisgegevens onderneming".

Het veld `Ondernemingsnummer` is gekoppeld aan `co.kbo`:

```jsx
<input
  style={css(S.inp, { flex: 1 })}
  value={co.kbo}
  onChange={function (e) {
    setCo(function (p) {
      return Object.assign({}, p, { kbo: e.target.value });
    });
  }}
  onBlur={function (e) {
    var kbo = normalizeKboNumber(e.target.value);
    if (kbo) {
      setCo(function (p) {
        return Object.assign({}, p, { kbo: kbo });
      });
    }
  }}
  placeholder="XXXX.XXX.XXX"
/>
```

Gedrag:

- Tijdens typen wordt de ruwe invoer in `co.kbo` bewaard.
- Bij `onBlur` wordt `normalizeKboNumber()` uitgevoerd.
- Als normalisatie een geldig formaat oplevert, wordt `co.kbo` vervangen door `XXXX.XXX.XXX`.
- Als normalisatie mislukt, blijft de invoer staan en wordt er nog geen foutmelding getoond.

Naast het veld staat de knop `Ophalen`:

```jsx
<button
  type="button"
  style={css(S.btn, { whiteSpace: "nowrap", opacity: kboLoading ? 0.6 : 1 })}
  onClick={lookupKBO}
  disabled={kboLoading}
>
  {kboLoading ? "..." : "Ophalen"}
</button>
```

Gedrag:

- Klik op de knop start `lookupKBO()`.
- Zolang `kboLoading` `true` is, is de knop disabled.
- De knoptekst wordt `"..."` tijdens het ophalen.
- Feedback wordt getoond via `kboMsg`.
- Een bericht dat begint met `✓` krijgt kleur `P.gn`.
- Alle andere berichten krijgen kleur `P.brown`.

## State-model

De bedrijfsgegevens zitten in de globale React context:

```js
var _co = useState({
  name: "",
  form: "",
  kbo: "",
  yearEnd: "",
  sector: "Business Services",
  fte: "",
  opgesteld: "",
  ondertekenaar: "",
  ondFunctie: "",
});
var co = _co[0], setCo = _co[1];
```

De KBO-flow gebruikt daarnaast twee UI-transients:

```js
var _kboMsg = useState(""), kboMsg = _kboMsg[0], setKboMsg = _kboMsg[1];
var _kboLoading = useState(false), kboLoading = _kboLoading[0], setKboLoading = _kboLoading[1];
```

`kboMsg` en `kboLoading` worden niet meegeserialiseerd in dossiers. Ze zijn alleen bedoeld voor de huidige UI-status.

## Normalisatie en validatie

### `normalizeKboNumber(value)`

Input: een willekeurige string, bijvoorbeeld `452085227`, `0452.085.227`, `BE 0452 085 227`.

Output: een string in formaat `XXXX.XXX.XXX`, of `""` als normalisatie niet kan.

Exact gedrag:

1. Zet de input om naar string.
2. Verwijder alle niet-cijfers met `replace(/\D/g, "")`.
3. Als er 9 cijfers overblijven, voeg vooraan een `0` toe.
4. Als er daarna niet exact 10 cijfers zijn, return `""`.
5. Format als `digits.slice(0, 4) + "." + digits.slice(4, 7) + "." + digits.slice(7)`.

Referentie-implementatie:

```js
export function normalizeKboNumber(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 9) digits = "0" + digits;
  if (digits.length !== 10) return "";
  return digits.slice(0, 4) + "." + digits.slice(4, 7) + "." + digits.slice(7);
}
```

Voorbeelden:

| Input | Output |
|---|---|
| `452085227` | `0452.085.227` |
| `0452085227` | `0452.085.227` |
| `BE 0452 085 227` | `0452.085.227` |
| `123` | `""` |

### `isValidKboNumber(value)`

Input: een ruwe of geformatteerde KBO-string.

Output: boolean.

Exact gedrag:

1. Normaliseer met `normalizeKboNumber(value)`.
2. Controleer het formaat met regex `^[0-2]\d{3}\.\d{3}\.\d{3}$`.
3. Strip opnieuw alle niet-cijfers.
4. Neem de eerste 8 cijfers als `base`.
5. Neem de laatste 2 cijfers als `control`.
6. Het nummer is geldig als `97 - (base % 97) === control`.

Referentie-implementatie:

```js
export function isValidKboNumber(value) {
  var formatted = normalizeKboNumber(value);
  if (!/^[0-2]\d{3}\.\d{3}\.\d{3}$/.test(formatted)) return false;
  var digits = formatted.replace(/\D/g, "");
  var base = parseInt(digits.slice(0, 8), 10);
  var control = parseInt(digits.slice(8), 10);
  return 97 - (base % 97) === control;
}
```

Let op: `lookupKBO()` voert eerst een lossere formaatcheck uit op `^\d{4}\.\d{3}\.\d{3}$` en daarna pas de volledige geldigheidscheck met `isValidKboNumber()`.

## Lookup-flow

De knop roept `lookupKBO()` aan.

Exacte flow:

1. `formatted = normalizeKboNumber(co.kbo)`.
2. Als `formatted` niet matcht met `^\d{4}\.\d{3}\.\d{3}$`, toon `⚠ Gebruik formaat XXXX.XXX.XXX` en stop.
3. Als `isValidKboNumber(formatted)` false is, toon `⚠ Ongeldig ondernemingsnummer` en stop.
4. Zet `kboLoading` op `true`.
5. Zet `kboMsg` op `Ophalen...`.
6. Roep `fetchKboHtml(formatted.replace(/\D/g, ""))` aan, dus met 10 cijfers zonder punten.
7. Parse de HTML met `parseKboPage(result.html)`.
8. Als `parsed.name`, `parsed.form` of `parsed.address.street` aanwezig is, update `co`.
9. Als er geen bruikbare data is, kies een foutmelding op basis van response/status/html.
10. Zet `kboLoading` altijd terug op `false`.

De state-update bij succes:

```js
setCo(function (p) {
  return Object.assign({}, p, parsed.address, {
    kbo: formatted,
    name: parsed.name || p.name,
    form: parsed.form || p.form,
    yearEnd: parsed.yearEnd || p.yearEnd,
  });
});
```

Belangrijk:

- `kbo` wordt altijd naar het geformatteerde nummer gezet.
- `parsed.address` wordt volledig gemerged. Daardoor kunnen lege adresvelden bestaande adreswaarden overschrijven.
- `name`, `form` en `yearEnd` behouden hun bestaande waarde als de parser voor dat veld niets terugvindt.
- Succesbericht: `✓ Gegevens opgehaald` plus `: <naam>` als `parsed.name` bestaat.

## Fetch-volgorde en fallbacks

`fetchKboHtml(nummer)` probeert drie URLs in vaste volgorde. `nummer` is altijd het 10-cijferige ondernemingsnummer zonder punten.

Volgorde:

1. `/api/kbo?nummer=<nummer>`
2. `/.netlify/functions/kbo?nummer=<nummer>`
3. `/kbo/zoeknummerform.html?nummer=<nummer>&actionLu=Zoek`

Referentie-implementatie:

```js
function fetchKboHtml(nummer) {
  var urls = [
    "/api/kbo?nummer=" + nummer,
    "/.netlify/functions/kbo?nummer=" + nummer,
    "/kbo/zoeknummerform.html?nummer=" + nummer + "&actionLu=Zoek",
  ];
  var last = null;

  function tryUrl(idx) {
    return fetch(urls[idx])
      .then(function (r) {
        return r.text().then(function (html) {
          return { ok: r.ok, status: r.status, html: html };
        });
      })
      .then(function (result) {
        var parsed = parseKboPage(result.html);
        if (parsed.name || parsed.form || parsed.address.street) return result;
        last = result;
        if (idx + 1 < urls.length) return tryUrl(idx + 1);
        return result;
      });
  }

  return tryUrl(0).catch(function (err) {
    if (last) return last;
    throw err;
  });
}
```

Fallback-regels:

- Elke response wordt als tekst gelezen, ook bij niet-2xx status.
- Na elke response wordt meteen geprobeerd te parsen.
- Als de parser naam, rechtsvorm of straat vindt, stopt de fallback-keten en wordt die response gebruikt.
- Als er geen bruikbare data is, wordt de response als `last` bewaard en wordt de volgende URL geprobeerd.
- Als een latere fetch faalt maar er al een `last` response is, wordt `last` teruggegeven.
- Als de eerste fetch faalt zonder `last`, wordt de error doorgelaten naar `lookupKBO()`.

## KBO-bron en proxy's

De externe bron is:

```text
https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=<10-cijfers>&actionLu=Zoek
```

De app gebruikt proxy's omdat de browser niet betrouwbaar rechtstreeks naar de KBO-site kan fetchen door CORS en deployment-verschillen.

### Vercel serverless handler

Bestand: `api/kbo.js`.

Gedrag:

- Leest `req.query.nummer`.
- Verwijdert alle niet-cijfers.
- Vereist exact 10 cijfers met `^\d{10}$`.
- Bij ongeldig nummer: HTTP 400 met body `Ongeldig ondernemingsnummer`.
- Fetcht de KBO-bron met header `{ "user-agent": "VH Waarderingstool" }`.
- Stuurt de HTML door met content-type `text/html; charset=utf-8`.
- Status is `200` als de KBO-response ok is, anders de status van KBO.
- Bij fetch-error: HTTP 502 met body `KBO kon niet opgehaald worden: <err.message>`.

Referentie:

```js
export default async function handler(req, res) {
  var nummer = String(req.query.nummer || "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(nummer)) {
    res.status(400).send("Ongeldig ondernemingsnummer");
    return;
  }

  try {
    var url = "https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=" + nummer + "&actionLu=Zoek";
    var response = await fetch(url, { headers: { "user-agent": "VH Waarderingstool" } });
    var html = await response.text();
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(response.ok ? 200 : response.status).send(html);
  } catch (err) {
    res.status(502).send("KBO kon niet opgehaald worden: " + err.message);
  }
}
```

### Netlify fallback handler

Bestand: `netlify/functions/kbo.js`.

Deze handler doet inhoudelijk hetzelfde als de Vercel handler, maar gebruikt de Netlify function signature:

```js
export async function handler(event) {
  var nummer = String(event.queryStringParameters && event.queryStringParameters.nummer || "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(nummer)) {
    return { statusCode: 400, body: "Ongeldig ondernemingsnummer" };
  }

  try {
    var url = "https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=" + nummer + "&actionLu=Zoek";
    var response = await fetch(url, { headers: { "user-agent": "VH Waarderingstool" } });
    var html = await response.text();
    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { "content-type": "text/html; charset=utf-8" },
      body: html,
    };
  } catch (err) {
    return { statusCode: 502, body: "KBO kon niet opgehaald worden: " + err.message };
  }
}
```

### Vite dev/preview proxy

Bestand: `vite.config.js`.

Zowel `server.proxy` als `preview.proxy` bevat:

```js
"/kbo": {
  target: "https://kbopub.economie.fgov.be",
  changeOrigin: true,
  secure: true,
  rewrite: function (path) { return path.replace(/^\/kbo/, "/kbopub"); },
}
```

Dit betekent:

- Browser vraagt `/kbo/zoeknummerform.html?...`.
- Vite stuurt door naar `https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?...`.
- `changeOrigin: true` zorgt dat de origin-header past bij de target.
- `secure: true` houdt TLS-certificaatvalidatie actief.

### Vercel rewrite

Bestand: `vercel.json`.

```json
{
  "rewrites": [
    {
      "source": "/kbo/:path*",
      "destination": "https://kbopub.economie.fgov.be/kbopub/:path*"
    }
  ]
}
```

Deze rewrite ondersteunt de derde fallback-URL `/kbo/...` in Vercel deployments.

### Netlify redirects

Bestand: `netlify.toml`.

```toml
[[redirects]]
  from = "/api/kbo"
  to = "/.netlify/functions/kbo"
  status = 200

[[redirects]]
  from = "/kbo/*"
  to = "https://kbopub.economie.fgov.be/kbopub/:splat"
  status = 200
  force = true
```

Netlify is niet de actieve deploymentomgeving, maar deze fallback blijft bewust aanwezig.

## HTML-parser

De parser staat in `src/lib/kbo.js` en werkt op de HTML van KBO Public Search.

Hoofdfunctie:

```js
export function parseKboPage(html) {
  var doc = new DOMParser().parseFromString(html, "text/html");
  return {
    name: fieldText(doc, "Naam:").split(/\n/)[0],
    form: abbreviateRechtsvorm(fieldText(doc, "Rechtsvorm:").split(/\n/)[0]),
    yearEnd: fieldText(doc, "Einddatum boekjaar").split(/\n/)[0],
    address: parseAddress(fieldText(doc, "Adres van de zetel:")),
  };
}
```

Parser-output:

```js
{
  name: string,
  form: string,
  yearEnd: string,
  address: {
    street: string,
    houseNr: string,
    zip: string,
    city: string
  }
}
```

### Label matching

`fieldText(doc, label)` zoekt alle `td`-cellen in documentvolgorde:

```js
function fieldText(doc, label) {
  var cells = Array.prototype.slice.call(doc.querySelectorAll("td"));
  for (var i = 0; i < cells.length; i++) {
    if (cleanText(cells[i].textContent) === label) {
      return cellText(cells[i + 1]);
    }
  }
  return "";
}
```

Gedrag:

- Alleen exacte labeltekst na `cleanText()` telt.
- De waarde wordt gelezen uit de volgende `td`.
- Als label of volgende cel ontbreekt, wordt `""` teruggegeven.

Labels die gebruikt worden:

- `Naam:`
- `Rechtsvorm:`
- `Einddatum boekjaar`
- `Adres van de zetel:`

### Tekst lezen uit nodes

`readNodeText(node)` leest recursief tekst uit DOM nodes:

- Text node (`nodeType === 3`): geef `node.nodeValue` terug.
- Niet-element en niet-text: geef `""` terug.
- `<br>` wordt `"\n"`.
- `<sup>` wordt genegeerd.
- Elementen met class `upd` worden genegeerd.
- Andere elementen worden recursief gelezen over `childNodes`.

Daarna schoont `cleanText(value)` op:

```js
function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
```

Dit vervangt non-breaking spaces, ruimt tabs/spaties rond newlines op, reduceert dubbele spaties en trimt.

## Rechtsvorm-afkortingen

`abbreviateRechtsvorm(form)` lowercaset en trimt de tekst en zoekt die op in `RECHTSVORMEN`. Als er geen match is, wordt de originele rechtsvorm teruggegeven.

Mapping:

| KBO-tekst, lowercase | Output |
|---|---|
| `naamloze vennootschap` | `NV` |
| `besloten vennootschap` | `BV` |
| `coöperatieve vennootschap` | `CV` |
| `cooperatieve vennootschap` | `CV` |
| `coöperatieve vennootschap met beperkte aansprakelijkheid` | `CVBA` |
| `coöperatieve vennootschap met onbeperkte aansprakelijkheid` | `CVOA` |
| `commanditaire vennootschap` | `CommV` |
| `gewone commanditaire vennootschap` | `CommV` |
| `commanditaire vennootschap op aandelen` | `Comm.VA` |
| `maatschap` | `Maatschap` |
| `vennootschap onder firma` | `VOF` |
| `vereniging zonder winstoogmerk` | `VZW` |
| `internationale vereniging zonder winstoogmerk` | `IVZW` |
| `stichting van openbaar nut` | `SON` |
| `private stichting` | `PS` |
| `stichting` | `Stichting` |
| `eenmanszaak` | `Eenmanszaak` |
| `buitenlandse vennootschap` | `Buitenl. venn.` |
| `landbouwvennootschap` | `LV` |
| `economisch samenwerkingsverband` | `ESV` |
| `europees economisch samenwerkingsverband` | `EESV` |
| `europese vennootschap` | `SE` |
| `europese coöperatieve vennootschap` | `SCE` |
| `europese cooperatieve vennootschap` | `SCE` |
| `beroepsvereniging` | `BV` |

## Adresparser

`parseAddress(text)` verwerkt de tekst uit het KBO-veld `Adres van de zetel:`.

Exact gedrag:

1. `cleanText(text)`.
2. Split op newline: `.split(/\n/)`.
3. Verwijder lege regels met `.filter(Boolean)`.
4. Zoek de eerste regel die matcht met `^\d{4}\s+`; dit is `cityIdx`.
5. `streetLine`:
   - als `cityIdx > 0`: join alle regels voor `cityIdx` met spatie;
   - anders: neem de eerste regel.
6. `cityLine`:
   - als `cityIdx >= 0`: neem die regel;
   - anders: neem tweede regel of `""`.
7. Splits straat en huisnummer met `^(.+?)\s+(\d+\S*(?:\s+\S+)*)$`.
8. Splits postcode en gemeente met `^(\d{4})\s+(.+)$`.

Referentie-implementatie:

```js
function parseAddress(text) {
  var lines = cleanText(text).split(/\n/).filter(Boolean);
  var cityIdx = lines.findIndex(function (line) {
    return /^\d{4}\s+/.test(line);
  });
  var streetLine = (cityIdx > 0 ? lines.slice(0, cityIdx) : lines.slice(0, 1)).join(" ");
  var cityLine = cityIdx >= 0 ? lines[cityIdx] : (lines[1] || "");
  var streetMatch = streetLine.match(/^(.+?)\s+(\d+\S*(?:\s+\S+)*)$/);
  var cityMatch = cityLine.match(/^(\d{4})\s+(.+)$/);
  return {
    street: streetMatch ? streetMatch[1] : streetLine,
    houseNr: streetMatch ? streetMatch[2] : "",
    zip: cityMatch ? cityMatch[1] : "",
    city: cityMatch ? cityMatch[2] : cityLine,
  };
}
```

Voorbeeld:

```text
Gouverneur Roppesingel 131
3500 Hasselt
```

Wordt:

```js
{
  street: "Gouverneur Roppesingel",
  houseNr: "131",
  zip: "3500",
  city: "Hasselt"
}
```

## Foutmeldingen

`lookupKBO()` toont deze berichten:

| Situatie | Bericht |
|---|---|
| Normalisatie levert geen `XXXX.XXX.XXX` op | `⚠ Gebruik formaat XXXX.XXX.XXX` |
| Modulo-97 of prefix-regex faalt | `⚠ Ongeldig ondernemingsnummer` |
| Fetch gestart | `Ophalen...` |
| Succes zonder naam | `✓ Gegevens opgehaald` |
| Succes met naam | `✓ Gegevens opgehaald: <naam>` |
| Response niet ok en geen bruikbare parse | `⚠ KBO gaf geen bruikbare gegevens terug (status <status>)` |
| HTML lijkt de eigen app-shell te zijn | `⚠ KBO-proxy niet actief in deze omgeving. Herdeploy de laatste branch.` |
| Response ok, geen app-shell, maar geen parsebare data | `⚠ Geen KBO-gegevens gevonden voor <formatted>` |
| Fetch-error zonder fallback-resultaat | `⚠ KBO-lookup niet beschikbaar: <err.message>` |

App-shell-detectie gebeurt met:

```js
function isAppHtml(html) {
  return /<div id="root"><\/div>/.test(html) ||
    /\/src\/main\.jsx/.test(html) ||
    /Waarderingstool/.test(html);
}
```

Deze detectie vangt situaties op waarin `/kbo/...` door een foutieve rewrite naar de React app zelf terugvalt.

## Persistentie en downstream gebruik

De lookup schrijft niet rechtstreeks naar Supabase of een andere database. De lookup update alleen `co` in `ValuationContext`.

Daarna werken bestaande flows verder met `co`:

- `serializeDossier` bevat `co`.
- `loadDossier(data)` kan `co` opnieuw herstellen uit een opgeslagen dossier.
- `useDossierAutosave()` gebruikt `serializeDossier` als volledige dossierdata.
- Bij Supabase upsert wordt metadata gebouwd uit:
  - `company_name: co.name || null`
  - `kbo: co.kbo || null`
  - `sector: co.sector || null`
  - `valuation: ctx.wEQ`

De dossierlijst haalt later alleen lichte metadata op:

```js
.select("id, company_name, kbo, sector, valuation, updated_at, created_at, report_pdf_path, report_pdf_at")
```

Rapportflows gebruiken `co.name` en `co.kbo` ook als rapportmetadata en dossier-identificatie, maar de KBO-lookup zelf genereert geen rapportinhoud.

## Nabouwspecificatie

Maak minimaal deze functies:

```ts
function normalizeKboNumber(value: unknown): string;
function isValidKboNumber(value: unknown): boolean;
function abbreviateRechtsvorm(form: string): string;
function parseKboPage(html: string): {
  name: string;
  form: string;
  yearEnd: string;
  address: {
    street: string;
    houseNr: string;
    zip: string;
    city: string;
  };
};
async function fetchKboHtml(nummer: string): Promise<{
  ok: boolean;
  status: number;
  html: string;
}>;
async function lookupKBO(): Promise<void>;
```

Pseudo-code voor de volledige clientflow:

```js
async function lookupKBO() {
  var formatted = normalizeKboNumber(co.kbo);

  if (!/^\d{4}\.\d{3}\.\d{3}$/.test(formatted)) {
    setKboMsg("⚠ Gebruik formaat XXXX.XXX.XXX");
    return;
  }

  if (!isValidKboNumber(formatted)) {
    setKboMsg("⚠ Ongeldig ondernemingsnummer");
    return;
  }

  setKboLoading(true);
  setKboMsg("Ophalen...");

  try {
    var result = await fetchKboHtml(formatted.replace(/\D/g, ""));
    var parsed = parseKboPage(result.html);

    if (parsed.name || parsed.form || parsed.address.street) {
      setCo(function (p) {
        return Object.assign({}, p, parsed.address, {
          kbo: formatted,
          name: parsed.name || p.name,
          form: parsed.form || p.form,
          yearEnd: parsed.yearEnd || p.yearEnd,
        });
      });
      setKboMsg("✓ Gegevens opgehaald" + (parsed.name ? ": " + parsed.name : ""));
      return;
    }

    if (!result.ok) {
      setKboMsg("⚠ KBO gaf geen bruikbare gegevens terug (status " + result.status + ")");
    } else if (isAppHtml(result.html)) {
      setKboMsg("⚠ KBO-proxy niet actief in deze omgeving. Herdeploy de laatste branch.");
    } else {
      setKboMsg("⚠ Geen KBO-gegevens gevonden voor " + formatted);
    }
  } catch (err) {
    setKboMsg("⚠ KBO-lookup niet beschikbaar: " + err.message);
  } finally {
    setKboLoading(false);
  }
}
```

Minimale hosting-specificatie:

- Maak een server endpoint `/api/kbo?nummer=<10-cijfers>` dat de publieke KBO-HTML proxyt.
- Valideer server-side opnieuw op exact 10 cijfers.
- Gebruik de externe KBO-url `https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?nummer=<10-cijfers>&actionLu=Zoek`.
- Stuur de HTML ongewijzigd terug met `content-type: text/html; charset=utf-8`.
- Voor lokale Vite-ontwikkeling moet `/kbo/*` herschreven worden naar `/kbopub/*` op `https://kbopub.economie.fgov.be`.

## Acceptatiecriteria

Een correcte nabouw voldoet aan deze criteria:

1. Invoer `452085227` wordt bij blur of lookup genormaliseerd naar `0452.085.227`.
2. Een nummer met verkeerd formaat toont `⚠ Gebruik formaat XXXX.XXX.XXX`.
3. Een nummer dat niet door de modulo-97 controle raakt toont `⚠ Ongeldig ondernemingsnummer`.
4. De fetch probeert exact deze volgorde: `/api/kbo`, `/.netlify/functions/kbo`, `/kbo/zoeknummerform.html`.
5. De externe request gebruikt het 10-cijferige nummer zonder punten.
6. De parser gebruikt `DOMParser` en zoekt `td`-labels exact op tekst.
7. De parser leest alleen `Naam:`, `Rechtsvorm:`, `Einddatum boekjaar` en `Adres van de zetel:`.
8. Bij succes worden alleen `kbo`, `name`, `form`, `yearEnd`, `street`, `houseNr`, `zip` en `city` automatisch aangepast.
9. Als naam, rechtsvorm of boekjaareinde leeg terugkomt, blijft de bestaande waarde in `co` behouden.
10. De lookup schrijft niet rechtstreeks naar Supabase; persistentie gebeurt alleen via de bestaande dossier-serialisatie/autosave.
11. Als de proxy per ongeluk React app HTML teruggeeft, verschijnt de proxy-foutmelding.
12. Tijdens fetch is de knop disabled en toont ze `"..."`.
