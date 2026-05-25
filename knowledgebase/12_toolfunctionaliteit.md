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

### Resultaten

De resultaatkolom toont een samenvatting en detailbanden:

- kerncijfers: bruto, netto, werkgeverskost en loonwig;
- netto- en werkgeverskostpanelen;
- loonbasis met sectorale minimumcontrole;
- voordelen en premies;
- mobiliteit en VAA;
- auditpanelen met bronverwijzingen.

Studentenmodus beperkt de samenvatting tot relevante studentencijfers.

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
