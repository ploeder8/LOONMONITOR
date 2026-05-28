# Toolfunctionaliteit Jaakie

**Status:** MVP-document voor chatbot-corpus en support.
**Onderhoudsregel:** werk dit bestand bij wanneer UI, routes, inputs, outputs, berekeningsflow, chatbotgedrag of featurebeschikbaarheid wijzigen. Dit bestand wordt geindexeerd voor de AI-chat en moet de actuele werking van Jaakie beschrijven.

---

## Doel

Jaakie is een browsergerichte loonmotor voor Belgische bedienden onder Paritair Comite 200. De tool helpt gebruikers bruto-netto, netto-bruto, werkgeverskost, loonwig, sectorale voordelen en mobiliteitscomponenten te begrijpen en te controleren op basis van de lokale dataset en de kennisbank.

De payrollberekeningen draaien client-side in de browser. De optionele AI-chat is een aparte Vercel serverless laag die alleen de kennisbank en het onderzoeksdossier mag gebruiken als antwoordbasis.

---

## Navigatie

Jaakie gebruikt een HashRouter met deze hoofdonderdelen:

| Route | Functie |
|---|---|
| `/` | Profiel en calculator. Gebruikers voeren loon-, arbeids- en voordeelgegevens in en zien resultaten met audit-trail. |
| `/loonfiche` | Pro-forma loonfiche voor één werknemer. Toont een document-achtige weergave van brutoloon → netto met alle tussenstappen, vergelijkbaar met een loonbrief maar expliciet gelabeld als pro-forma. Deelt profielstate met de calculator. Ondersteunt identificatievelden (werknemer-/werkgevernaam en -referentie), print en audit-toggle. |
| `/loonrun` | Multi-werknemer loonrun. Importeert een multi-row CSV, berekent alle werknemers geïsoleerd, toont een overzichtstabel met totalen en laat individuele loonfiches bekijken per werknemer. |
| `/testcases` | Overzicht van testcases en validatiecontext. |
| `/scope` | Scope, bekende beperkingen en manco's. |
| `/onderzoek/index.html` | Statisch HTML-onderzoeksdossier met markt-, juridische en technische analyse. |

---

## Calculatorflow

De hoofdpagina bestaat uit invoerblokken en resultaatbanden.

### Invoer

Gebruikers kunnen onder meer invullen of aanpassen:

- berekeningsrichting: bruto naar netto of netto naar bruto;
- bruto maandloon of gewenst nettoloon;
- referentiedatum;
- leeftijd, ervaring, baremacategorie en functiecontext;
- arbeidsregime, tewerkstellingsbreuk en arbeidsdagen per maand;
- gezinstype en kinderen ten laste;
- maaltijdcheques en andere voordelen;
- woon-werkcomponenten: fiets, privewagen, openbaar vervoer, trein;
- bedrijfswagen/VAA en werkgeverskostparameters zoals arbeidsongevallenpercentage, groepsverzekering en hospitalisatie.

### Berekening

De berekeningslogica zit in `src/lib/` en gebruikt de dataset via `getDatapunt`, `indexById` en `safeGetValue`. De runtime rekent niet op `waarde_bron`, maar op genormaliseerde waarden en tabellen. Elke datasetafhankelijke berekening moet een audit-datapunt meedragen.

De belangrijkste modules zijn:

- `baremas.ts` voor sectorale minimumlonen;
- `rsz.ts`, `werkbonus.ts`, `bbsz.ts`, `bv.ts` en `bvBijzonder.ts` voor netto;
- `netto.ts` voor bruto naar netto;
- `nettoNaarBruto.ts` voor inverse berekening;
- `werkgeverskost.ts` voor totale werkgeverskost en loonwig;
- voordeelmodules voor eindejaarspremie, jaarpremie, ecocheques, fietsvergoeding, woon-werkverkeer, trein en VAA.

Voor jaarcomponenten gebruikt Jaakie de bijzondere BV-schaal van Bijlage III:
eindejaarspremie en dubbel vakantiegeld krijgen een tarief op basis van het normale refertejaarloon, terwijl eventuele kindvrijstelling of kindvermindering de aparte regels voor exceptionele vergoedingen volgt. De gewone maandelijkse BV-kindvermindering wordt niet opnieuw rechtstreeks afgetrokken van deze jaarcomponenten. De sectorale PC 200-jaarpremie houdt wel werknemers-RSZ in, maar geen bedrijfsvoorheffing.

De eindejaarspremie wordt in de gebruikersflow als volledig gewerkt jaar getoond: bruto eindejaarspremie = 1 brutomaandloon. Pro-rata anciënniteit- en prestatievelden zijn geen gebruikersinstelling meer; oude CSV-imports met afwijkende waarden worden voor actieve eindejaarspremie naar 12/12 genormaliseerd.

### Resultaten

De resultaatkolom toont een samenvatting en detailbanden:

- kerncijfers: bruto, netto, werkgeverskost en loonwig;
- netto- en werkgeverskostpanelen;
- het netto maandpaneel verbergt VAA-bedrijfswagen en terugname-VAA regels wanneer de bedragen nul zijn;
- loonbasis met sectorale minimumcontrole;
- voordelen en premies;
- mobiliteit en VAA;
- auditpanelen met bronverwijzingen.

Studentenmodus beperkt de samenvatting tot relevante studentencijfers.

### Print overzicht

De knop **"Print overzicht"** opent een estetisch, print-vriendelijk document voor de huidige werknemer:

- **Header**: Jaakie brand, titel "Loonoverzicht", periode, statuut, werknemer-/werkgever-metadata.
- **Executive summary**: 6 cards met bruto, netto (maand), werkgeverskost, loonwig, netto (jaar), werkgeverskost (jaar).
- **Netto loon tabel**: bruto → RSZ → werkbonus → belastbaar loon → bedrijfsvoorheffing → BBSZ → netto te betalen.
- **Werkgeverskost tabel**: brutoloon → RSZ werkgever → Sociaal Fonds 200 → provisies → totale werkgeverskost.
- **Jaaroverzicht**: netto- en werkgeverskant met eindejaarspremie, vakantiegeld, jaarpremie, ecocheques.
- **Footer**: pro-forma disclaimer.

Het overzicht is **print-vriendelijk** (A4 via `@media print`) en bevat geen audit-trail. Studentenmodus toont een vereenvoudigde melding.

---

## Loonfiche

De loonfiche-pagina (`#/loonfiche`) toont een pro-forma loonfiche per huidig profiel. De profielstate wordt gedeeld met de calculator via `localStorage`; wijzigingen op één pagina zijn zichtbaar op de andere.

### Gedeelde profielstate

- `HomePage` en `LoonfichePage` lezen/schrijven hetzelfde profiel via `useSharedProfiel()` → `localStorage` key `jaakie:profiel`.
- Fallback naar `DEFAULTS` wanneer localStorage leeg is.

### Loonfiche regels

De loonfiche bevat gecodeerde regels (bv. `1000` Brutoloon, `2000` RSZ werknemer, `3000` Bedrijfsvoorheffing, `9000` Netto te betalen, `9500` Werkgeverskost). Subtotalen (`1090`, `2090`, `2190`, `3090`) en totaalregels worden altijd getoond; nulregels worden verborgen. De tabel rendert regels op globale sortering zodat subtotalen tussen de juiste stappen blijven staan.

### Modi

- **Bediende:** volledige RSZ → BV → netto flow met alle verminderingen en inhoudingen.
- **Student:** vereenvoudigde loonfiche zonder RSZ/BV/BBSZ; bruto komt uit het studentenbarema. Maaltijdcheques verminderen het cash-netto alleen met de werknemersbijdrage; de totale chequewaarde blijft informatief via "Netto inclusief maaltijdcheques".
- **Netto → Bruto:** toont het berekende bruto als "Berekend brutoloon" en het doelnetto als referentie. Hetzelfde berekende bruto wordt gebruikt voor netto, werkgeverskost, loonfiche-totalen en loonrun-totalen.

### Profiel bewerken en identificatie

De loonfiche heeft geen aparte incomplete calculator-invoer meer. Boven het document staat een compacte **Profielsnapshot** met de belangrijkste actieve profielkeuzes: werknemer/werkgever, periode, loonrichting, statuut, tewerkstellingsbreuk, fiscale context, voordelen en mobiliteit. De actie **Profiel bewerken** opent een zijpaneel met dezelfde gedeelde profiel-editor als de calculator.

De gedeelde profiel-editor bevat een aparte identificatiegroep:

- Werknemer: naam en referentie
- Werkgever: naam en ondernemingsnummer

Deze velden worden opgeslagen in het gedeelde profiel, meegenomen in CSV export/import en getoond in de loonficheblokken boven de tabel. De loonfiche zelf blijft een document- en controleweergave; alle impactvolle berekeningsinputs worden via het gedeelde profiel aangepast.

### Prestatieblok

De loonfiche toont naast werknemer en werkgever ook een prestatieblok met periode, statuut, tewerkstellingsbreuk en arbeidsdagen.

### Print

 De loonfiche is print-vriendelijk: `@media print` verbergt header, navigatie, footer, chat, de input-toolbar en de actieknoppen; toont de loonfiche compact op één A4-pagina zonder schaduwen. Wanneer bronnen zichtbaar zijn, starten ze op een aparte tweede pagina als samenhangend bronblok, zodat de loonfiche zelf niet over twee pagina's wordt gesplitst.

### Acties

- **Print loonfiche** — opent het systeem-printdialoog.
- **Toon bronnen / Verberg bronnen** — toggelt de zichtbaarheid van de bronvermelding onder de loonfiche.

---

## Loonrun

De loonrun-pagina (`#/loonrun`) laat gebruikers meerdere werknemers in één keer berekenen en controleren.

### CSV-import

Gebruikers uploaden een multi-row CSV met dezelfde kolommen als de single-row CSV van de calculator. Elke rij wordt als apart werknemerprofiel geïmporteerd. De header wordt één keer gelezen en toegepast op alle datarijen.

### Berekening

Per rij roept `bouwLoonrun()` `bouwLoonficheVoorProfiel()` aan. Fouten bij één werknemer blokkeren de andere werknemers niet; de betreffende werknemer krijgt status `fout` met een foutmelding, terwijl de rest normaal doorgerekend wordt. Geldige werknemers krijgen status `te_controleren`, tenzij de gebruiker ze lokaal markeert als `gecontroleerd` of `vastgezet`.

De loonrun voert contextvalidaties uit. Meerdere periodes, referentiedatums, werkgevers of ondernemingsnummers in één run leveren een blokkerende validatie op. Een run met blokkeringen kan niet geëxporteerd worden.

De knoppen **Gecontroleerd** en **Vastzetten** zetten alle berekende werknemers respectievelijk naar `gecontroleerd` of `vastgezet`. Dit kan alleen zonder blokkerende validaties. Omdat Jaakie browser-only is, is `vastgezet` een lokale workflowlock/status en geen officiële payrollfinalisatie.

### Resultaatweergave

- **Tabel** met kolommen: Naam, Bruto cash, RSZ-basis, Netto, Werkgeverskost, Loonwig, Status.
- **Totaalregel** onderaan: som van alle succesvol berekende werknemers plus loonwig op aggregaatniveau.
- **Per werknemer**: klik op "Bekijk loonfiche" opent een modal met de volledige pro-forma loonfiche en audit-trail van die werknemer.

De loonrun maakt onderscheid tussen:

- **Bruto cash:** het contractuele bruto loonbedrag.
- **RSZ-basis:** bruto cash plus RSZ-plichtige voordelen zoals VAA werkmiddelen.
- **Belastbaar voor BV:** basis voor bedrijfsvoorheffing na RSZ/werkbonus en belastbare VAA.

### Export

De summary CSV-export bevat één rij per werknemer met expliciete kolommen (`id;naam;cash_bruto;bruto_rsz_basis;belastbaar_voor_bv;netto;werkgeverskost;loonwig_pct;status;validaties;fout`) plus een totaalregel. Export wordt geblokkeerd bij blokkerende loonrunvalidaties.

### Lokale opslag

De loonrun-inputs worden lokaal in de browser bewaard via `localStorage` key `jaakie:loonrun`, zodat een import niet verdwijnt bij navigatie of refresh. De UI toont hiervoor een melding. De actie **Wissen** verwijdert de werknemers uit de loonrun en wist de lokale opslagkey.

### Rapport voor werkgever

De knop **"Rapport"** opent een estetisch overzicht dat de payroll-expert kan delen met de werkgever:

- **Header**: Jaakie brand, titel "Loonkostoverzicht", periode, werkgevernaam (indien ingevuld in profiel), generatiedatum.
- **Executive summary**: cards met totaal bruto cash, totaal RSZ-basis, totaal netto, totale werkgeverskost en loonwig.
- **Tabel**: per werknemer bruto cash, RSZ-basis, netto, werkgeverskost en loonwig; werknemers met berekeningsfouten worden getoond met "—" voor bedragen.
- **Totalenrij**: onderaan de tabel met geaggregeerde bedragen.
- **Footer**: pro-forma disclaimer en korte uitleg van loonwig.

Het rapport is **print-vriendelijk** (A4 via `@media print`) en bevat geen audit-trail of technische details. De werkgever ontvangt een helder, zakelijk overzicht.

---

## AI-chat MVP

De AI-chat is bedoeld om gebruikers vragen te laten stellen over:

- de werking van Jaakie;
- de PC 200-kennisbank;
- het onderzoeksdossier;
- de datasetstructuur, testcases en bronhierarchie;
- de calculatorflow en bekende beperkingen.

De chatbot mag niet optreden als algemene HR-, fiscale of juridische adviseur buiten het corpus. Wanneer een antwoord niet onderbouwd is door de geindexeerde kennisbank of het onderzoeksdossier, moet de chatbot aangeven dat het antwoord niet in de kennisbank teruggevonden wordt.

### Technische werking

- Frontend: chatpaneel in de Jaakie-app dat `/api/chat` aanroept.
- Backend: Vercel serverless endpoint.
- Retrieval: OpenAI Responses API met file search op een vector store met `knowledgebase/` en `knowledgebase/onderzoek/`.
- Rate limiting: Supabase Postgres via server-side secret key.
- Secrets: `OPENAI_API_KEY`, `OPENAI_VECTOR_STORE_ID`, `SUPABASE_URL` en `SUPABASE_SECRET_KEY` staan uitsluitend in Vercel/server-env.

### Beschikbaarheid

De MVP-chat is publiek toegankelijk wanneer `AI_CHAT_ENABLED=true`. De implementatie moet role-ready blijven: latere beschikbaarheid kan afhangen van gebruikersrollen, zonder dat de frontend ooit rechtstreeks met OpenAI of Supabase praat.

---

## Grenzen

- De AI-chat mag geen bronwaarden, URLs of datapunten fabriceren.
- De AI-chat mag geen live websearch doen.
- De AI-chat mag geen API-keys, server-env of interne secrets tonen.
- Payrollberekeningen blijven deterministisch in `src/lib/`; de AI-chat legt uit, maar vervangt de calculator niet.
