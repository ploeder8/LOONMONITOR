# Feedback Expert

## Legende
- [ ] = open task
- [x] = completed task
- [r] = running task
- [h] = task on hold
- [e] = eline moet nakijken

## Feedback Jaak

### Afgerond

- [x] Wordt er ergens in de code "made by Claude" of iets dergelijk vermeld? Is het verstandig om een verwijzing naar mezelf in de code te bakken?
- [x] VH logo vervangen door Jaakie logo.
- [x] VH kleuren vervangen door Jaakie kleuren.

### Open

- [ ] Kleuren aanpasbaar maken en sticky maken.


### Te controleren door Eline

- [ ] Eline is niet zeker: Het lijkt er op dat de bijzondere bijdrage sociale zekerheid (BBSZ) niet correct berekend. 
- [ ] Loonkost werkgever: sociaal fonds 200 (eline weet niet wat dit is)
- [ ] Arbeidsongevallen, check of dit 0,30% is en van wat (eline weet niet wat dit is)

- [ ] Bijzondere bijdrage Sociale Zekerheid (BBSZ): ga na of er nieuwe regels zijn betreffende de berekening van de BBSZ sinds 2026
	-> codex://threads/019e3647-d79d-7fc0-888f-5bda17b79b72
	-> zie codex output

- [ ] Woonwerkverkeer: bij prive wagen en bij bedrijfswagen: hier toggle optie toevoegen: berekeningsmethode: forfaitaire of reeele beroepskost. Bij keuze voor forfaitair moet hij automatisch rekening houden met de vrijstelling die geld op het belastbaar woon werk verkeer (zoek dit op in de knowledge base en/of officiele bron). Bij keuze reeele dan is er geen vermindering op het belastbaar loon van toepassing want dan moet dit manueel op de fiscale fiche worden opgenomen. 
	-> check of hij dit correct heeft toegepast
	

## Feedback Eline - 15/05/2026

- [x] Loonkost werkgever: De tool moet een duidelijk onderscheid maken (in afzonderlijke kaders) tussen loonkost op maandbasis en loonkost op jaarbasis. Voeg de loonkost op jaarbasis onderaan toe (hou hier rekening met de maandelijkse loonkost x12 en jaarlijkse componenten). Ook voor de netto berekening moet er een overzichtelijk kader komen met alle jaarcomponenten gegroepeerd en dus een overzicht van het netto jaarloon. Zie printscreen 'jaaroverzicht.png' in issues screenshots/ voor een voorbeeld hoe dit er uit moet zien. 
- [x] bij de loonkost berekening op jaarbasis mag je niet vergeten rekening te houden met werkgeversRSZ (25%) over de eindejaarspremie en de jaarpremie ('jaaroverzicht.png' in issues screenshots/)
- [x] Loonkost werkgever: zet hier ook "Loonkost werkgever (per maand)". Hier mag je ook nog niet de eindejaarspremie, jaarlijkse premie en Ecocheques in meenemen. Deze zaken moeten komen bij de loonkost op jaarbasis. 
- [x] berekening van dubbel vakantiegeld is niet correct. dit moet zijn: Het totaal brutoloon (maandloon incl VAA) x 92%. Dit moet worden opgenomen in het jaaroverzicht. 
- [x] Bij de netto jaarberekening van de werknemer geldt er op de eindejaarspremie, dubbeld vakantiegeld en de jaarpremie exceptionele BV (niet de gewone BV). controleer of dit in de knowledgebase zit, indien niet ga dit na via officele bron: https://teams.microsoft.com/l/message/19:298e1c83-33cd-4b85-ba0e-246bca2264c1_bbf1eaff-5aa1-4c60-a448-8d7257cb1004@unq.gbl.spaces/1778842002320?context=%7B%22contextType%22%3A%22chat%22%7D) 
- [x] over het dubbel vakantiegeld moet er slechts op 85/92 rsz bijdrage (13,07%) gerekend worden. (controleer of dit in de knowledgebase zit)

## Feedback Eline - 18/05/2026
- [x] Bij gezinstype "Gehuwd/wettelijk SAMENWONEND - partner met inkomen" van maken
- [x] BBSZ-scenario is overbodig, op basis van het gezinstype dient hij af te leiden of de individuele of gemeenschappelijke aanslag van toepassing is
- [x] Maaltijdcheques (werknemersbijdrage en werkgeversbijdrage)zetten onder bijkomende looncomponenten ipv werkgeversbijdragen
- [e] Berekening bijzondere bijdrage RSZ loopt nog steeds niet correct. Bv bij een maandloon van 2658€ en partner zonder beroepsinkomen
		Formule is (43.32/3)+((2658-2190.18)*1.10%)= 19,59 terwijl Jaakie 48.47/3=16,15 doet?
		
	=>	Fix volgens KIMI: Klaar! De BBSZ-maandberekening is gecorrigeerd.

		Probleem: Jaakie berekende het maandbedrag als kwartaal / 3, maar volgens de officiële RSZ-instructies geldt voor de maandelijkse inhouding een aparte formule waarbij alleen het vaste kwartaaldeel door 3 wordt gedeeld en het percentage op maandloon ongewijzigd blijft.

		Voorbeeld (€2.658, partner zonder inkomen):

		Oud (fout): (43,32 + 0,011 × 467,82) / 3 = 48,47 / 3 = 16,16
		Nieuw (correct): 43,32/3 + 0,011 × 467,82 = 14,44 + 5,15 = 19,59
		Wijzigingen:

		src/lib/bbsz.ts — Aparte maandberekeningsfuncties toegevoegd (bbszMaandIndividueel, bbszMaandPartnerMetInkomen, bbszMaandPartnerZonderInkomen). De bbsz()-functie berekent nu kwartaal en maand apart.
		src/lib/__tests__/golden.test.ts — 3 nieuwe tests toegevoegd die expliciet valideren dat het maandbedrag de officiële maandformule volgt (incl. het specifieke gebruikersvoorbeeld).
		knowledgebase/04_calculator_netto.md — BBSZ-paragraaf geüpdatet met de correcte maandformule-beschrijving.
		Verificatie: typecheck, bun test (111/111 pass) en build slagen allemaal.
		
- [ ] Berekent bij aanduiden privéwagen 3 km niets bij de netto berekening per maand terwijl in de sectorale het bedrag per maand voor privévervoer 3km (enkel) 23,75€ is. Hij zou dit bedrag dan moeten delen door 21.67 en dat bedrag (=1,096€) zou hij moeten doen x het aantal gewerkte dagen. Geeft dit wel weer onder loonkost werkgever. 
- [ ] Graag ook onder het nettoloon per maand ook het "nettoloon per maand inclusief maaltijdcheques" weergeven. Hiervoor dient hij dus het aantal werkdagen x totale waarde maaltijdcheques (=werknemersbijdrage + werkgeversbijdrage) te doen
- [ ] Voor het bepalen van het percentage van de exceptionele bedrijfsvoorheffing op eindejaarspremie en vakantiegeld dient gekeken te worden naar jaarbedrag van de normale bruto bezoldigingen. Dit is het bedrag zonder de sociale zekerheidsbijdragen (13,07%). het perventage bij een eindejaarspremie bij een loon van 2658 zou dus 40,38% moeten zijn > ((2658 x 12) - ((2658 x 12) x 13,07%)))= 27727.19
- [ ] Er wordt geen bedrijfsvoorheffing berekend over de sectorale jaarpremie PC200. Jaakie rekent enkel RSZ.
- [ ] Graag ook onder het netto jaarloon ook "netto jaarloon per maand inclusief maaltijdcheques" toevoegen. Hiervoor dient hij dus het aantal werkdagen per jaar x totale waarde maaltijdcheques (=werknemersbijdrage + werkgeversbijdrage) te doen
- [ ] Bijdrage werkgever sociaal fonds 200 nog laten checken, alsook of 0,30% logische bijdrage arbeidsongevallenverzekering is voor een bediende in pc 200
- [ ] De periodieke voordelen: eindejaarspremie, Ecocheques en jaarlijkse premie EN Mobiliteit onderaan worden al getoond bij de berekening van de loonkost op maand en jaarbasis, deze moeten onderaan dus niet nog eens getoond worden. 


### Afgerond
13/05
- [x] Naam veranderen Loonkost Simulator, enkel in header balk.
- [x] Bediende (Schaal I/II): Schaal I/II mag weg.
- [x] Ervaring: hij geeft niet aan als het loon onder de baremalonen/minimumlonen ligt. Hou rekening met de schaal en het juiste jaartal. Bron: https://www.sfonds200.be/nl/sectorinformatie/loonschalen/
- [x] Voor de berekening van de werkgeverskost van maaltijdcheques moet het aantal werkdagen in de maand vermenigvuldigd worden met de kost per dag. Neem het aantal weekdagen van de opgegeven maand in de inputs, geef dit als vooringegeven veld onder de maand- en jaarinput, maar geef de user de mogelijkheid om dit veld aan te passen. Dit aantal dagen zal later nog gebruikt worden. Ook de maximale waarde van EUR 6,91 is verouderd; dit is verhoogd naar EUR 8,91 vanaf 01/01/2026.
- [x] Netto berekening (per maand): hier moet je automatisch EUR 1,09 * aantal opgegeven werkdagen aftrekken van het nettoloon en dit weergeven in de berekening, indien maaltijdcheques werden ingegeven. Deze EUR 1,09 is het minimumbedrag. Dit kan ook hoger liggen, dus de user moet ook de mogelijkheid krijgen om deze werknemersbijdrage aan te passen.
- [x] Eindejaarspremie: hier gaan we vereenvoudigen. Maak hier enkel een checkbox van eindejaarspremie Ja of Nee, neem standaard 12 maanden.
- [x] Ecocheques: maak hier een percentage van als input, dat is duidelijker voor de user.
- [x] Woon-werk verkeer: nu zijn er afzonderlijke invulvelden voor Fietsvergoeding en Woon-werk trein. Er is geen veld voor busvervoer of voor prive vervoer. Maak hier 1 blokje van "Woon-werk verkeer" waar je een select all kan doen (fiets, prive wagen, bus, trein, bedrijfswagen, ...) en dan krijg je per component de nodige invulvelden waar rekening mee wordt gehouden in de calculatie. Voor bus, trein en prive is het logischer om de kilometers in te geven. Dan moet er op basis van de woon-werk tabellen per arbeidsdag die we hebben opgegeven worden gerekend. Bron: https://www.sfonds200.be/nl/sectorinformatie/vervoerskosten/
- [x] Indexatie mag volledig weg. Verwijder ook alle referenties hiernaar.
- [x] De invulvelden onder "netto berekening" (gezinstype en kinderen ten laste) als allereerste invulvelden, dus nog boven "Statuut". Groepsverz. eigen bijdrage mag je beneden laten staan als "bijkomende looncomponenten". Waarom vraag je hoeveel kinderen er <3 jaar zijn? Wat is hier de impact van?
- [x] Er zijn nog andere "Bijkomende looncomponenten": "Eigen bijdrage hospitalisatieverzekering" (bedrag in EUR/maand dat in mindering gebracht moet worden van het nettoloon) en "Onkostenvergoedingen" (bedrag in EUR/maand dat in meerdering gebracht moet worden van het nettoloon).
- [x] Plaats de werkgeversbijdragen-invulvelden onderaan als laatste invulvelden in de lijst.
- [x] Er wordt momenteel geen rekening gehouden met het feit of de werknemer een wagen van het werk heeft. Dit moet als aanvinkoptie komen onder "Woon-werk verkeer". Als je dit aanvinkt moet je volgende gegevens invullen: "Cataloguswaarde", "Datum eerste inschrijving", "Brandstof" met opties Diesel, Benzine, Elektriciteit, en "CO2-Waarde" (bij keuze "Elektriciteit" moet dit niet ingevuld worden). Dit vormen inputs voor de formule voor het VAA te berekenen. Deze formule is aanwezig in de knowledgebase. Dit VAA moet ook correct in rekening worden gebracht, zie knowledgebase voor correcte toepassing.
15/06
- [x] Kinderen minder dan 3j, heeft ze nog nooit gezien, ze weet niet goed waar het vandaan komt. We gaan dit nu verwijderen
- [x] toevoegen: partner ten laste is ook een optie, dan krijg je ook een fiscaal voordeel, ga dit na in de knowledgebase en/of verifieer op officiele bronnen
- [x] bijkomende looncomponenten: Bij privé gebruik van laptop, gsm, .. van het werk moet er ook een VAA toegevoegd worden. Hier is een niet exhaustieve lijst va nde meest gebruikte VAA: gsm, abonnement, internet, laptop, internet (met elk vast bedrag VAA, vefifieer dit). dit moet meegeteld worden zodat er RSZ en BV op berekend wordt. Maar nadien wordt het net zoals het VAA van de wagen terug in mindering gebracht van het nettoloon.
- [x] Netto berekening (per maand): Zie Issues Screenshots/ bestand overzicht_netto_loon.png/: deze weergave is overzichtelijker. Heeft ook een lijn 'totaal bruto' & 'belastbaar loon'. ook VAA wordt duidelijk weergegeven en opgeteld bij brutoloon voor de berekening van rsz. VAA wagen komt na totaal brutoloon want hier zit geen rsz op. Dan komen we op belastbaar loon. Dan halen we de bedrijsvoorheffing er van af. Dan volgend de Onkostenvergoedingen en inhoudingen zoals terugname VAA (voeg terugname VAA als 1 lijn toe, maar laat de user dit open kunnen klikken zodat hij de details kan zien) , zo krijg je het nettoloon. 
- [x] het is niet duidelijk in het nettoloon overzicht dat je twee keer RSZ in mindering toont. RSZ werknemer en Effectieve RSZ. Laat effectieve RSZ weg, als er een werkbonus van toepassing is mag deze ook gewoon zichtbaar zijn in de berekening. 
- [x] Fietsvergoeding geeft een error.
17/05
- [x] bij de invulvelden met cijfers is er steeds een "sticky" '0' die niet verdwijnt als ik de cijfers wil wegdoen, als ik dan iets wil invullen blijft de 0 ook staan, hoe lossen we dit op?
- [x] Maak een checkbox voor VAA werkmiddelen want dit zijn vaste forfaits (de uitleg tekst mag hier achter een klein '?' gestoken worden bij de inputs dat als hover veld komt)



## Vragen aan Eline

- [ ] Eindejaarspremie neemt hij niet op in het maandloon. Is dit correct?
- [ ] Check kind <3j: tekst staat bij het veld.

## Features / Later

- [ ] Netto naar bruto ook.
