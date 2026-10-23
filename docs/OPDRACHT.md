# Opdracht: vrijwilligersrooster Project Madrigal

Dit is de oorspronkelijke opdracht waarmee deze tool gebouwd is. Ze staat hier zodat een volgende beheerder kan nalezen waarom de tool werkt zoals ze werkt.

Onderaan staan de keuzes die bij de bouw nog gemaakt zijn, waar de opdracht niet duidelijk was.

> **Later gewijzigd (oktober 2026).** De rol "coördinator" heet nu **planner** (instelling `code_planner`). De keuze "kan als het moet" is vervangen door **back-up**: wie dat kiest, komt die avond enkel op de plaats van back-up. De vraag "wil je ook back-up zijn?" is geschrapt. De tekst hieronder beschrijft de oorspronkelijke opdracht.

## Context

Project Madrigal is een queer bibliotheek in Antwerpen, gedragen door vrijwilligers. De bib is elke vrijdagavond open van 18:00 tot 21:00. Per avond zijn er 2 vrijwilligers en 1 back-up nodig.

Nu maakt een coördinator elke maand een poll in WhatsApp, waarna die met de hand een Google-spreadsheet opstelt. Bouw een eenvoudige webtool die dit vervangt.

Uitgangspunten:

- Vrijwilligers gebruiken de tool zonder account. Toegankelijkheid en een lage drempel zijn de belangrijkste waarden.
- De tool moet jarenlang bruikbaar blijven met minimaal onderhoud, door niet-technische vrijwilligers.
- Alles is gratis: GitHub Pages en een Google-spreadsheet met Google Apps Script.

## Hoe het huidige rooster eruitziet

Hou hier rekening mee, zodat de coördinator de nieuwe tool meteen herkent.

- Eén tabblad per maand, in kalendervorm: een rij per week, kolommen maandag tot zondag. Onder elke week staan drie rijen: events, bib en backup. Enkel de kolom vrijdag is ingevuld.
- Op veel vrijdagen loopt er tegelijk een event van een partnerorganisatie, met een vaste naam, bijvoorbeeld een praatcafé of een volkskeuken. Meestal volgen die een vast ritme per week van de maand, maar niet altijd.
- Een vrijdag kan een afwijkende status hebben: gesloten, of een workshop in plaats van de gewone opening.
- De back-up blijft vaak leeg. Soms staat er maar 1 vrijwilliger op een avond.
- Er zijn ongeveer tien tot vijftien vrijwilligers. Sommigen doen drie à vier shiften per maand, anderen één.
- Een aantal vrijwilligers staat bijna altijd samen als duo ingepland.
- Namen worden niet altijd op dezelfde manier geschreven (hoofdletters, spaties). De nieuwe tool moet dat vermijden.

## Architectuur

- Frontend in deze repository, gepubliceerd via GitHub Pages op `projectmadrigal.github.io/rooster`. Gewone HTML, CSS en JavaScript, zonder framework en zonder build-stap, zodat iedereen het later kan aanpassen.
- Backend: een Google Apps Script web-app die gekoppeld is aan een Google-spreadsheet in het Google-account van Madrigal. Het script leest en schrijft de gegevens.
- Zet de URL van de Apps Script web-app in één apart bestand, `config.js`.
- Zet de volledige Apps Script-code in de map `apps-script/` in deze repository, zodat ze bewaard blijft en mee versiebeheer krijgt.

## Structuur van de spreadsheet

Schrijf in het script een functie `installeer()` die alle tabbladen en kolomkoppen automatisch aanmaakt.

1. **Instellingen**: twee kolommen, sleutel en waarde, met uitleg per regel. Begin met deze standaardwaarden:
   - openingsdag: vrijdag
   - beginuur: 18:00
   - einduur: 21:00
   - aantal_vrijwilligers: 2
   - aantal_backups: 1
   - backup_verplicht: nee (een lege back-up geeft enkel een melding, geen waarschuwing)
   - standaard_max_shiften_per_maand: 2
   - backup_telt_mee_voor_maximum: nee
   - niet_twee_weken_na_elkaar: ja
   - toegangscode_vrijwilligers: een eenvoudige code om te delen in de WhatsApp-groep
   - code_coordinator: een aparte code voor de coördinator
   - inschrijving_sluit: aantal dagen voor het begin van de maand
   - afmelding_backup_valt_automatisch_in: nee (de coördinator bevestigt)
   - bewaartermijn_maanden: 12 (oudere gegevens worden gewist)
   - minstens_een_ervaren_per_avond: nee (zie het tabblad Vrijwilligers)
   - teksten: welkomsttekst, uitleg en privacymelding, zodat die zonder code aan te passen zijn
2. **Vrijwilligers**: de vaste lijst van namen. Kolommen: voornaam (zoals die overal getoond wordt), actief (ja of nee), ervaren / heeft sleutel (ja of nee), opmerking voor de coördinator. Enkel de coördinator beheert deze lijst. Vrijwilligers zien de kolom ervaren nergens. Zolang `minstens_een_ervaren_per_avond` op "nee" staat, negeert de tool die kolom.
3. **Avonden**: per vrijdag de datum, de status (open, gesloten, workshop, ander) en een optioneel event (vrije tekst). Daarnaast een klein blok terugkerende events: per week van de maand (1ste, 2de, 3de, 4de, laatste vrijdag) een eventnaam die de tool automatisch voorinvult. De coördinator kan elke avond afzonderlijk aanpassen.
4. **Beschikbaarheid**: maand, voornaam, per vrijdag de keuze (graag, kan als het moet, niet), maximum aantal shiften die maand, wil back-up zijn (ja of nee), graag samen met (optioneel, een naam uit de lijst), opmerking, tijdstip van invullen.
5. **Rooster**: het rooster per vrijdag, met vrijwilliger 1, vrijwilliger 2, back-up, de motivatie en de status (voorstel of gepubliceerd).
6. **Kalender**: na het publiceren maakt de tool per maand een tabblad in dezelfde kalendervorm als het huidige rooster (weken in rijen, maandag tot zondag in kolommen, en per week de rijen events, bib en backup). Zo blijft het overzicht vertrouwd en printbaar.
7. **Afmeldingen**: wie zich afmeldt voor welke vrijdag, met tijdstip.
8. **Logboek**: belangrijke acties (rooster gepubliceerd, afmelding, instellingen gewijzigd), voor het overzicht.

Lees alle instellingen uit het tabblad Instellingen. Zet niets hard in de code wat daar kan staan.

## Weergave voor vrijwilligers

- De vrijwilliger vult één keer de toegangscode in. De browser onthoudt die.
- Kies de maand. Standaard is dat de volgende maand.
- Kies je naam uit de lijst van actieve vrijwilligers. De browser onthoudt je keuze. Sta je er niet in, typ dan je voornaam. De coördinator keurt een nieuwe naam goed en zet die in de lijst.
- Zie per vrijdag de status en het event van die avond, bijvoorbeeld "Gesloten" of het event dat er loopt. Gesloten avonden en workshops kan je niet aanduiden.
- Duid per open vrijdag aan: graag, kan als het moet of niet.
- Duid aan hoeveel shiften je die maand wil doen: 1, 2, 3, 4 of "maakt niet uit".
- Duid aan of je ook back-up wil zijn.
- Duid eventueel aan met wie je graag samen staat.
- Voeg eventueel een opmerking toe.
- Opnieuw invullen voor dezelfde maand overschrijft je vorige keuze. Toon dan eerst je vorige keuze en vraag om bevestiging.
- Toon het gepubliceerde rooster van de huidige en de volgende maand, met de events erbij.
- Een vrijwilliger kan zich in het gepubliceerde rooster afmelden voor een vrijdag. De coördinator ziet dat meteen.

## Weergave voor de coördinator

Toegang met de coördinatorcode.

- De avonden van een maand beheren: status en event aanpassen, met de terugkerende events al voorgevuld.
- Nieuwe namen goedkeuren.
- Een overzicht van alle beschikbaarheden van een maand, als tabel: vrijwilligers tegenover vrijdagen.
- Een knop Maak voorstel die het rooster automatisch samenstelt, volgens de regels hieronder.
- Per vrijdag een korte motivatie in gewone taal. Bijvoorbeeld: "Sam en Lou. Allebei 'graag' en ze willen graag samen staan. Geen van beiden had deze maand al een shift. Back-up: Kim ('kan als het moet')."
- Duidelijke waarschuwingen wanneer een vrijdag geen 2 vrijwilligers heeft. Een lege back-up geeft enkel een melding, tenzij `backup_verplicht` op "ja" staat.
- De coördinator kan elke keuze met de hand aanpassen via keuzelijsten. Daarna kiest die Publiceer. Dan wordt ook het tabblad Kalender aangemaakt of bijgewerkt.
- Een overzicht van afmeldingen met de voorgestelde vervanging.

## Regels voor het voorstel

Werk met vaste, voorspelbare regels, niet met AI. Hetzelfde invoerresultaat geeft altijd hetzelfde voorstel.

1. Plan enkel avonden met status "open".
2. Het maximum aantal shiften per maand is een harde grens. Tel back-ups enkel mee als de instelling dat zegt.
3. Vul eerst de vrijdagen met de minste beschikbare mensen.
4. "Graag" gaat voor "kan als het moet".
5. Wie graag samen staat, wordt waar mogelijk samen ingepland, als beiden die avond beschikbaar zijn en hun maximum het toelaat. Dit is een voorkeur, geen harde regel.
6. Wie deze maand minder shiften heeft, krijgt voorrang, zodat de verdeling eerlijk blijft.
7. Vermijd dezelfde persoon twee vrijdagen na elkaar, als de instelling dat vraagt.
8. Kies de back-up uit wie back-up wil zijn en nog niet als vrijwilliger op die avond staat.
9. Als `minstens_een_ervaren_per_avond` op "ja" staat: zorg dat minstens één van de 2 vrijwilligers in het tabblad Vrijwilligers als ervaren staat. Vermeld dat in de motivatie. Lukt het niet, toon dan een waarschuwing.
10. Lukt het niet, laat de plaats dan leeg en toon een waarschuwing. Overtreed nooit een harde grens.
11. Schrijf bij elke keuze de motivatie in het Nederlands, in de jij-vorm, kort en concreet.

Zet de regels in een apart, goed becommentarieerd bestand. Voeg eenvoudige tests toe die in de browser of met Node draaien, met een paar voorbeeldsituaties: te weinig mensen, iemand met maximum 1, twee weken na elkaar, een duo, een gesloten avond, en de regel over ervaren vrijwilligers zowel aan als uit. Gebruik in de tests verzonnen namen.

## Vormgeving en toegankelijkheid

- Eerst ontworpen voor de smartphone, ook bruikbaar op een computer.
- Nederlands, warm en persoonlijk, in de jij-vorm. Gebruik nooit "u".
- Goed contrast (WCAG AA), grote knoppen, duidelijke labels, werkt met een schermlezer.
- Zet kleuren en lettertypes in CSS-variabelen bovenaan, zodat de huisstijl later makkelijk aan te passen is. Kies voorlopig een rustige, neutrale stijl.
- Voeg een `manifest.json` en een plaatshouder-icoon toe, zodat vrijwilligers de pagina op hun beginscherm kunnen zetten. Het logo van Madrigal komt er later in.

## Privacy en veiligheid

- Bewaar enkel voornamen, geen telefoonnummers of e-mailadressen.
- Toon een korte privacymelding: welke gegevens, waarvoor, hoe lang, en bij wie je terechtkunt.
- Wis gegevens ouder dan de bewaartermijn automatisch. De tabbladen Kalender van vorige maanden mogen blijven staan, tenzij de coördinator ze verwijdert.
- Controleer in het script alle invoer, ook de codes. De codes zijn een eenvoudige drempel, geen echte beveiliging. Vermeld dat in de handleiding.
- Geen echte namen, codes of andere gegevens in de repository. Die is publiek.

## Op te leveren

- `index.html`, `styles.css`, `app.js`, `config.js`, `manifest.json`, het bestand met de roosterregels en de tests.
- `apps-script/Code.gs` (en eventuele bijkomende scriptbestanden).
- `README.md` in het Nederlands, geschreven voor een niet-technische vrijwilliger, met:
  1. wat de tool doet;
  2. de spreadsheet aanmaken en `installeer()` uitvoeren;
  3. de lijst met vrijwilligers en de terugkerende events invullen;
  4. het script publiceren als web-app (uitvoeren als ik, toegang voor iedereen) en de URL in `config.js` zetten;
  5. GitHub Pages aanzetten;
  6. testen voor je de link deelt;
  7. instellingen aanpassen in de spreadsheet, met een aparte uitleg over hoe je de regel "minstens één ervaren vrijwilliger per avond" aanzet;
  8. na een wijziging in het script een nieuwe versie publiceren;
  9. wat te doen als iets niet werkt;
  10. waar alles staat, voor een volgende beheerder.
- Commentaar in de code in het Nederlands.

## Werkwijze

- Stel eerst vragen als iets in deze opdracht onduidelijk of tegenstrijdig is.
- Werk in kleine, duidelijke commits op de branch `main`.
- Geef op het einde een korte lijst van wat ik zelf nog moet doen in Google en in GitHub.

---

## Keuzes die bij de bouw gemaakt zijn

Op deze punten was de opdracht niet duidelijk. De keuzes zijn met de opdrachtgever afgesproken op 22 oktober 2026.

- **Niet twee vrijdagen na elkaar** is een *voorkeur*, geen harde grens. De tool vermijdt het waar het kan. Lukt het niet, dan plant ze de persoon toch in en vermeldt ze dat. Anders zou iemand die 4 shiften wil in een maand met 4 vrijdagen er nooit 4 krijgen.
- **Inschrijving sluit** staat standaard op 7 dagen voor het begin van de maand.
- **4de en laatste vrijdag**: hebben die allebei een terugkerend event, dan wint "laatste".
- **Nieuwe namen** kunnen al hun beschikbaarheid invullen, maar worden pas ingepland nadat de coördinator ze goedkeurt.
- **"Maakt niet uit"** bij het aantal shiften betekent: de waarde van `standaard_max_shiften_per_maand`.
- **Wissen en jaaroverzicht** (afgesproken op 23 oktober 2026): oude gegevens worden maandelijks gewist, niet elke nacht. `bewaartermijn_maanden` op 0 zet het wissen uit. Een tabblad "Jaaroverzicht" per jaar bewaart per voornaam het aantal shiften en back-ups per maand, en per maand hoe druk het was. Het wordt elk jaar in januari bijgewerkt, en ook vóór het wissen. Namen staan alfabetisch; afmeldingen worden niet per persoon geteld.
- **Aantal vrijwilligers en back-ups**: het tabblad Rooster heeft vaste kolommen voor vrijwilliger 1, vrijwilliger 2 en back-up. Daarom kan `aantal_vrijwilligers` 1 of 2 zijn en `aantal_backups` 0 of 1.
