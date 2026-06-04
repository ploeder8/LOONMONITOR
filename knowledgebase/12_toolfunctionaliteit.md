# Toolfunctionaliteit Jaakie

**Status:** MVP-document voor chatbot-corpus en support.
**Onderhoudsregel:** werk dit bestand bij wanneer UI, routes, inputs, outputs, berekeningsflow, chatbotgedrag of featurebeschikbaarheid wijzigen. Dit bestand wordt geindexeerd voor de AI-chat en moet de actuele werking van Jaakie beschrijven.

---

## Doel

Jaakie is een browsergerichte loonmotor voor Belgische bedienden onder Paritair Comite 200. De tool helpt gebruikers bruto-netto, netto-bruto, werkgeverskost, loonwig, sectorale voordelen en mobiliteitscomponenten te begrijpen en te controleren op basis van de lokale dataset en de kennisbank.

De payrollberekeningen draaien client-side in de browser. De optionele AI-chat is een aparte Vercel serverless laag die alleen de kennisbank en het onderzoeksdossier mag gebruiken als antwoordbasis.

---

## Navigatie

Jaakie gebruikt een HashRouter met een rustige app-shell:

- De topbar toont Jaakie-branding links en de actieve contextstroom rechts; er staat geen volledige tabrij meer in de header.
- Desktop gebruikt een vaste linkerrail met de hoofdmodules **Loonmotor**, **Simulator** en **Ontwikkeling**.
- Mobiel gebruikt een compacte bottom navigation met **Loonmotor**, **Simulator** en **Meer**.
- De Simulator-subnavigatie (`Calculator`, `Loonfiche`, `Loonrun`) verschijnt alleen binnen de simulatorcontext.
- Ontwikkelingslinks (`Testcases`, `Scope & bekend manco`, `Onderzoeksdossier`) zijn secundair onder de Ontwikkeling-context.

| Route | Functie |
|---|---|
| `/` | Profiel en calculator. Gebruikers voeren loon-, arbeids- en voordeelgegevens in en zien resultaten met audit-trail. |
| `/loonfiche` | Pro-forma loonfiche voor één werknemer. Toont een document-achtige weergave van brutoloon → netto met alle tussenstappen, vergelijkbaar met een loonbrief maar expliciet gelabeld als pro-forma. Deelt binnen hetzelfde browservenster de profielstate met de calculator. Ondersteunt identificatievelden (werknemer-/werkgevernaam en -referentie), print en audit-toggle. |
| `/loonrun` | Multi-werknemer loonrun. Importeert een multi-row CSV, berekent alle werknemers geïsoleerd, toont een overzichtstabel met totalen en laat individuele loonfiches bekijken per werknemer. |
| `/loonmotor` | Dossiercockpit voor bedrijven en medewerkers. V1 bewaart lokale conceptdossiers in de browser, kan publieke KBO-basisgegevens ophalen via ondernemingsnummer en kan een medewerkerprofiel openen in de calculator. |
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
- maaltijdcheques, bonus en andere voordelen;
- woon-werkcomponenten: fiets, privewagen, openbaar vervoer, trein en bedrijfswagen/VAA;
- werkgeverskostparameters zoals arbeidsongevallenpercentage, groepsverzekering en hospitalisatie.

De vroegere bouw-subsetoptie voor een aparte 1,80% aanvullende pensioenbijdrage is niet langer zichtbaar of actief. Oude CSV-profielen met `bouwVlag` blijven inleesbaar, maar Jaakie telt geen aparte bouwbijdrage bovenop de globale werkgevers-RSZ.

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
eindejaarspremie, sectorale jaarpremie en dubbel vakantiegeld krijgen een tarief op basis van het normale refertejaarloon, terwijl eventuele kindvrijstelling of kindvermindering de aparte regels voor exceptionele vergoedingen volgt. De gewone maandelijkse BV-kindvermindering wordt niet opnieuw rechtstreeks afgetrokken van deze jaarcomponenten. De sectorale PC 200-jaarpremie gebruikt dezelfde bijzondere BV-kolom als de eindejaarspremie. Dubbel vakantiegeld is 92% van het brutomaandloon.

De bonusinvoer hoort bij de extra looncomponenten. Gebruikers kiezen of het ingevoerde bedrag per maand of per jaar is; Jaakie rekent dit altijd om naar een eenmalige jaarbonus. De bonus telt niet mee in het gewone maandnetto, netto-bruto, barema, werkbonus, BBSZ of maandelijkse werkgeverskost. In het jaaroverzicht verwerkt Jaakie drie gekoppelde exceptionele componenten: de bonus zelf, variabel enkel vakantiegeld op bonus en variabel dubbel vakantiegeld op bonus. Elke component krijgt 13,07% werknemers-RSZ, bijzondere BV volgens Bijlage III (kolom andere exceptionele vergoeding) en 25% patronale RSZ in de werkgeversjaarcomponent.

De eindejaarspremie wordt in de gebruikersflow als volledig gewerkt jaar getoond: bruto eindejaarspremie = 1 brutomaandloon. Pro-rata anciënniteit- en prestatievelden zijn geen gebruikersinstelling meer; oude CSV-imports met afwijkende waarden worden voor actieve eindejaarspremie naar 12/12 genormaliseerd.

Voor woon-werk privévervoer verwerkt Jaakie het maandbedrag als belastbare werkgeverstussenkomst in het netto-pad. De BV-berekening past daarna de woon-werkvrijstelling (bv. forfaitaire €500/jaar) apart toe op de BV-grondslag. Fiets- en openbaarvervoercomponenten (trein, bus, tram, metro) worden in de nettoflow als netto-vrijgestelde vergoeding verwerkt en verhogen de BV-grondslag niet.

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
- **Werkgeverskost tabel**: brutoloon → RSZ werkgever → arbeidsongevallen → provisies → totale werkgeverskost.
- **Jaaroverzicht**: netto- en werkgeverskant met eindejaarspremie, vakantiegeld, jaarpremie, bonus, variabel enkel/dubbel vakantiegeld op bonus en ecocheques.
- **Footer**: pro-forma disclaimer.

Het overzicht is **print-vriendelijk** (A4 via `@media print`) en bevat geen audit-trail. Studentenmodus toont een vereenvoudigde melding.

---

## Loonfiche

De loonfiche-pagina (`#/loonfiche`) toont een pro-forma loonfiche per huidig profiel. De profielstate wordt binnen hetzelfde browservenster gedeeld met de calculator via `sessionStorage`; wijzigingen op één pagina zijn zichtbaar op de andere route in dat venster. Andere browservensters kunnen onafhankelijk andere inputscenario's hebben.

### Gedeelde profielstate

- `HomePage` en `LoonfichePage` lezen/schrijven hetzelfde profiel via `useSharedProfiel()` → `sessionStorage` key `jaakie:profiel`.
- Fallback naar `DEFAULTS` wanneer de vensteropslag leeg is.
- Een refresh binnen hetzelfde venster behoudt de inputs; een tweede browservenster kan apart worden ingevuld zonder het eerste venster te overschrijven.

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

## Loonmotor

De loonmotor-pagina (`#/loonmotor`) is een dossiercockpit voor payrollvoorbereiding. De pagina is bedoeld om bedrijven en medewerkers op te zetten voordat ze naar de calculator, loonfiche of loonrun gaan.

### Lokale conceptdossiers

V1 werkt zonder backend. Bedrijven en medewerkers worden als lokale concepten bewaard in `localStorage` key `jaakie:loonmotor:dossiers:v1`. De UI toont daarom expliciet dat de opslag alleen in deze browser gebeurt en geen officiële payrollfinalisatie of backend-synchronisatie is. De actie **Backend opslaan** is zichtbaar maar uitgeschakeld tot de backendkoppeling bestaat.

### Bedrijven

Gebruikers kunnen een bedrijf aanmaken via:

- **Ophalen uit KBO**: compacte zoekrij met invoer van een ondernemingsnummer, normalisatie naar `XXXX.XXX.XXX`, modulo-97-validatie en lookup via `/api/kbo?nummer=<10-cijfers>`.
- **Handmatig bedrijf aanmaken**: leeg lokaal bedrijfsconcept.

Ook na het eerste dossier blijft de bedrijvenrail een compacte actie **Bedrijf toevoegen** tonen. Een nieuw KBO- of handmatig dossier wordt bovenaan toegevoegd en meteen geselecteerd.

De KBO-flow vult in v1 alleen publieke basisvelden aan: ondernemingsnummer, naam, rechtsvorm, einddatum boekjaar waar beschikbaar, straat, huisnummer, postcode en gemeente. In Vercel loopt `/api/kbo` via de CBE API (`https://cbeapi.be/api/v1/company/{nummer}`) met `CBE_API_KEY` als server-side Bearer-token; secrets of serverconfiguratie worden nooit naar de browser gebracht. Voor lokale Vite-ontwikkeling blijft `/kbo/*` een publieke KBO Public Search fallback met TLS-fallback voor UI-dev, maar CBE-pariteit test je lokaal via `pnpm exec vercel dev`.

Een bedrijfsdossier bevat daarnaast handmatige payroll- en contactvelden: contactpersoon, e-mail, telefoon, arbeidsongevallenpercentage, maaltijdcheque-defaults, groepsverzekering/hospitalisatie-defaults, eerste-aanwerving-indicator en notities. De payrollscope blijft PC 200.

De actie **Bedrijf verwijderen** staat in het dossieractie-paneel, niet als rij-icoon in de bedrijvenlijst. Verwijderen vraagt bevestiging en verwijdert het lokale bedrijfsdossier inclusief alle medewerkers; als er nog bedrijven bestaan selecteert Jaakie automatisch een aangrenzend dossier, anders keert de pagina terug naar de lege Loonmotor-state.

### Medewerkers

Binnen elk bedrijf kan de gebruiker medewerkers toevoegen. Een medewerker bevat de essentie voor simulatie:

- naam en interne referentie;
- optioneel INSZ, gemaskeerd in de lijstweergave en niet nodig voor berekening;
- optionele geboortedatum, startdatum, statuut en functie;
- brutoloon, tewerkstellingspercentage, ervaring, fiscale context en enkele voordeelvelden;
- een onderliggend `Profiel` dat aansluit op de bestaande calculator.

De medewerkerstabel toont indicatieve bruto-, netto- en werkgeverskostcijfers via de bestaande loonfiche/profielberekeningen. De actie **Open in calculator** zet het gedeelde vensterprofiel en navigeert naar de calculator. **Toevoegen aan loonrun** is zichtbaar maar nog uitgeschakeld in v1.

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
