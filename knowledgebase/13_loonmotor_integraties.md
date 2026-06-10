# Loonmotor-integraties

**Status:** strategische integratieverkenning plus eerste browser-only control/export-runtime.
**Peildatum:** 10 juni 2026.
**Scope:** hoe Jaakie later kan aansluiten op HR-systemen, sociale secretariaten, officiële aangiftes, betalingen en boekhouding.

Jaakie rekent vandaag browser-only en fungeert als audit-traceerbare controle- en simulatieomgeving. De integratiestrategie moet daarom gefaseerd blijven: eerst data en exports beheersbaar maken, daarna partnerkoppelingen opzetten, en pas later officiële aangiftes of betalingen uitvoeren.

Sinds 10 juni 2026 bevat de loonrun een eerste concrete control/export-stap: een generieke Jaakie payroll-exportbatch v1 (`jaakie-payroll-export-v1`) met batchmetadata, validatiecodes, dataset-/refdatumcontext, werknemerregels en totalen. De tweede interne mijlpaal sluit Loonmotor browser-only aan op Loonrun: medewerkers uit lokale dossiers kunnen naar de loonrun worden doorgestuurd, waarna dezelfde controle- en exportvoorbereiding gebruikt wordt. Dit is nog geen provideradapter, backendopslag, officiële aangifte of payrollfinalisatie.

## Kernconclusie

Behandel de toekomstige loonmotor niet als één grote payrollkoppeling. Splits integratie in vier lagen:

1. **Input-integraties** voor HR-masterdata, contracten, prestaties, afwezigheden, voordelen, mobiliteit en kosten.
2. **Payroll-provider integraties** voor aanlevering naar een sociaal secretariaat of payrollplatform.
3. **Officiële aangifte-integraties** voor Dimona, DmfA, Belcotax-on-web, FinProf, e-Box en eventueel Sigedis/DB2P.
4. **Output-integraties** voor loonbrieven, SEPA-betaalbestanden, boekhoudjournalen, rapporten, auditexports en data-exit.

De beste volgende productstap is **Jaakie als payroll control layer**: Jaakie verzamelt, valideert, berekent en verklaart payrollinput en -output, maar neemt nog niet de rol van sociaal secretariaat of aangiftemandataris over.

## Marktpatroon

Belgische sociale secretariaten zoals SD Worx, Acerta, Partena Professional, Liantis, Securex en Group S zijn sterk in volledige uitvoering, compliance, aangiftes en dienstverlening. Hun integraties zijn vaak klant-, partner- of portaalgedreven: importtemplates, batchbestanden, SFTP, klantspecifieke flows of commerciële partnerafspraken. Publieke API-first documentatie is minder vanzelfsprekend.

HR-tech challengers en internationale payrollplatformen leggen meer nadruk op publieke API's, webhooks en integratiemarktplaatsen. Officient publiceert een HR API en positioneert zich als integrerende HR-laag met Belgische payroll providers. Deel publiceert een developerplatform met REST, OpenAPI, webhooks en embedded flows voor hiring, payroll, HR en compliance.

Voor Jaakie betekent dit:

- Reken niet op één uniforme Belgische payroll-API.
- Ontwerp eerst een intern integratiecontract.
- Bouw daarna per tegenpartij een adapter of exportmapping.
- Houd officiële aangiftes gescheiden van sociaal-secretariaat-aanlevering.

## Integratielagen

### 1. Input-integraties

Voor een echte loonrun heeft Jaakie meer input nodig dan de huidige calculatorprofielen:

- werkgever, onderneming, vestigingseenheid, paritair comité en sociaal-secretariaatcontext;
- werknemeridentiteit, INSZ, adres, gezins- en fiscale status, tewerkstellingsbreuk;
- contract, functie, categorie, barema, anciënniteit, begin- en einddatum;
- prestaties, kalender, werkregime, afwezigheidscodes, vakantie, ziekte en correcties;
- looncomponenten, voordelen alle aard, mobiliteit, maaltijdcheques, groepsverzekering, hospitalisatie;
- periodecontext, referentiedatum, runstatus en validatiestatus.

Mogelijke bronnen zijn eigen UI, CSV, HRIS-systemen zoals Officient, tijdsregistratie zoals Protime/BCC, of exports uit bestaande sociale secretariaten.

### 2. Payroll-provider integraties

Dit is de meest realistische middellange-termijnroute. Jaakie blijft de controle- en voorbereidingslaag en levert een gevalideerde dataset aan een sociaal secretariaat of payrollplatform.

Nodige artefacten:

- per provider een veldmapping;
- importtemplate of bestandsformaat;
- validatieregels vóór export;
- statusmodel: concept, gecontroleerd, vastgezet, geëxporteerd, bevestigd, geweigerd;
- auditlog met wie/wat/wanneer;
- foutfeedback terug naar dossier en loonrun.

Voor partnergesprekken moet Jaakie minimaal vragen naar sandboxmogelijkheden, importformats, API/SFTP/portaalopties, testdossiers, foutcodes, aansprakelijkheid, SLA's en data-exit.

### 3. Officiële aangifte-integraties

Deze laag hoort pas na juridische en operationele gates.

Belangrijke aangiftes:

- **Dimona:** elektronische melding van in- en uitdiensttreding bij RSZ. Verplicht voor werkgevers.
- **DmfA:** multifunctionele kwartaalaangifte met loon- en arbeidstijdgegevens.
- **Belcotax-on-web:** indiening van fiches 281.xx en andere fiscale fiches.
- **FinProf:** bedrijfsvoorheffing/voorafbetalingscontext, afhankelijk van precieze payrollscope.
- **e-Box Enterprise:** communicatiekanaal voor officiële berichten.
- **Sigedis/DB2P:** later relevant bij aanvullende pensioenen en loopbaan-/pensioengegevens.

Voor deze laag zijn vereist:

- mandaten en toegangsbeheer;
- juridische rolafbakening: adviseur, verwerker, mandataris of erkend sociaal secretariaat;
- technische aansluiting op officiële kanalen;
- schema- en XSD-validatie waar van toepassing;
- idempotency op alle write-acties;
- outbox/retry-mechanisme;
- SLA-monitoring op deadlines;
- vier-ogencontrole voor indiening en correcties;
- productieparallelrun naast bestaand sociaal secretariaat.

Gebruik actuele officiële applicatie- en technische documentatie. De oude onderzoekslinks naar `general/documentation.htm` op socialsecurity.be gaven bij controle op 10 juni 2026 een 404-titel terug; pin daarom geen implementatie op die oude URL's zonder herbevestiging.

### 4. Output-integraties

Output-integraties zijn nuttig vóór officiële aangiftes:

- pro-forma loonfiche en definitieve loonbrief zodra de juridische scope dat toelaat;
- SEPA pain.001 betaalbestand met end-to-end-id en vier-ogencontrole;
- boekhoudjournaal naar Exact, Odoo, WinBooks, Yuki of generiek CSV;
- managementrapporten per werkgever, run, periode en kostensoort;
- audit-export met gebruikte datapunten, bronstatussen en validaties;
- volledige data-exit in machineleesbaar formaat.

## Wat Jaakie nu al kan voorbereiden

### Eerste gerealiseerde stap

De loonrun bouwt nu browser-only een provider-onafhankelijke exportbatch via `bouwIntegratieExportBatch()`. `integratieExportBatchNaarCsv()` zet die batch om naar CSV v1. Blokkerende loonrunvalidaties zetten de batchstatus op `geblokkeerd` en schermen de download af; geldige runs krijgen status `exporteerbaar`.

### Tweede interne mijlpaal

Loonmotor kan medewerkers uit het lokale dossier nu naar de loonrun schrijven via de gedeelde `jaakie:loonrun` browseropslag. De doorstroom gebruikt een pure mapper van `LoonmotorMedewerker` naar `LoonrunWerknemerInput`, behoudt bron-id's, vervangt duplicaten op medewerker-id en blijft volledig browser-only.

Deze stap maakt Jaakie sterker als interne control layer: dossieropbouw gebeurt in Loonmotor, controle en exportvoorbereiding in Loonrun. Externe integraties blijven pas aan de orde nadat het interne contract, de validaties en de auditmetadata stabiel genoeg zijn.

### Integratiecontract

Definieer een stabiel intern contract voor:

- `Werkgever`
- `Vestiging`
- `Medewerker`
- `Contract`
- `PayrollInput`
- `Looncomponent`
- `Prestatie`
- `Afwezigheid`
- `PayrollRun`
- `PayrollRunRegel`
- `ValidatieMelding`
- `AuditBron`
- `ExportBatch`

Leg per veld vast:

- betekenis en payrollbron;
- eigenaar van de waarheid;
- verplicht/optioneel;
- dataclassificatie;
- mutatierecht;
- exportnaam per adapter;
- datumgeldigheid;
- validatieregels.

### Adaptermodel

Ontwerp adapters als randlaag, niet in de rekenmodules:

- importadapter: extern formaat naar Jaakie-contract;
- exportadapter: Jaakie-contract naar provider/boekhouding/aangifteformaat;
- validator: technische en payrollvalidaties vóór export;
- reconciliatie: terugkoppeling van provideroutput naar Jaakie.

De bestaande laaggrenzen blijven gelden: `src/lib/` rekent puur, `src/pages/` orkestreert UI, en integraties met secrets horen server-side.

### Partneronderzoek

Start met twee praktische sporen:

1. **HRIS/API-spoor:** Officient of vergelijkbare HRIS. Doel: masterdata en afwezigheden kunnen importeren.
2. **Sociaal-secretariaatspoor:** één Belgische provider. Doel: importtemplate, testdossier en partnervoorwaarden verkrijgen.

Pas na deze twee sporen heeft het zin om provider-specifieke code te bouwen.

## Go/no-go gates

Een integratie mag pas naar de volgende fase als deze gates gehaald zijn:

| Gate | Minimumcriterium |
|---|---|
| Data-contract | Alle verplichte payrollvelden hebben type, eigenaar, validatie en auditcontext. |
| Security | Secrets blijven server-side; RBAC, auditlog en dataretentie zijn beschreven. |
| Juridisch | Rol van Jaakie is contractueel afgebakend. |
| Provider | Testdossier, mapping en foutfeedback zijn beschikbaar. |
| Aangifte | Officiële documentatie, testkanaal, mandaat en schema-validatie zijn bevestigd. |
| Productie | Parallelrun naast bestaand sociaal secretariaat toont gecontroleerde verschillen. |

## Aanbevolen roadmap

1. **Gedaan:** generieke loonrun-export met expliciete status, validaties, bronversie en auditmetadata.
2. **Gedaan:** interne Loonmotor -> Loonrun-doorstroom met gedeelde browseropslag, duplicaatvervanging en dossier-readiness.
3. **Nu:** documenteer het interne integratiecontract verder per veld en breid CSV/exportdenken uit met provider-onafhankelijke veldnamen.
4. **Daarna:** voer een pilotmapping uit naar één sociaal-secretariaattemplate of HRIS-import/export.
5. **Daarna:** voeg backendopslag en rolbeheer toe voor dossiers, runs en exportbatches.
6. **Daarna:** voer 3 maanden parallelrun uit tegen een bestaand sociaal secretariaat.
7. **Pas later:** bouw officiële Dimona/DmfA/Belcotax/FinProf-koppelingen.

## Bronnen

- Jaakie toolwerking: `knowledgebase/12_toolfunctionaliteit.md`
- Onderzoeksdossier: `knowledgebase/onderzoek/`
- RSZ Dimona: https://www.socialsecurity.be/site_nl/employer/applics/dimona/index.htm
- RSZ DmfA: https://www.socialsecurity.be/site_nl/employer/applics/dmfa/index.htm
- FOD Financiën Belcotax-on-web: https://financien.belgium.be/nl/E-services/Belcotaxonweb
- Officient API docs: https://apidocs.officient.io/
- Officient integraties: https://www.officient.io/nl-be/integraties
- Deel developer docs: https://developer.deel.com/
