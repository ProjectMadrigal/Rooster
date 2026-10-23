# Rooster Project Madrigal

Een eenvoudige webtool voor het vrijwilligersrooster van de bib van Project Madrigal. De tool vervangt de maandelijkse poll in WhatsApp en het rooster dat met de hand in een spreadsheet gemaakt wordt.

Deze handleiding is geschreven voor vrijwilligers zonder technische kennis. Je hebt niets te installeren: alles gebeurt in je browser, in Google en op GitHub.

**Inhoud**

1. [Wat de tool doet](#1-wat-de-tool-doet)
2. [De spreadsheet aanmaken en `installeer()` uitvoeren](#2-de-spreadsheet-aanmaken-en-installeer-uitvoeren)
3. [De vrijwilligers en de terugkerende events invullen](#3-de-vrijwilligers-en-de-terugkerende-events-invullen)
4. [Het script publiceren als web-app en de URL in `config.js` zetten](#4-het-script-publiceren-als-web-app-en-de-url-in-configjs-zetten)
5. [GitHub Pages aanzetten](#5-github-pages-aanzetten)
6. [Testen voor je de link deelt](#6-testen-voor-je-de-link-deelt)
7. [Instellingen aanpassen](#7-instellingen-aanpassen)
8. [Na een wijziging in het script: een nieuwe versie publiceren](#8-na-een-wijziging-in-het-script-een-nieuwe-versie-publiceren)
9. [Als iets niet werkt](#9-als-iets-niet-werkt)
10. [Waar alles staat](#10-waar-alles-staat)

---

## 1. Wat de tool doet

**Voor vrijwilligers** (met de toegangscode uit de WhatsApp-groep):

- Je duidt per vrijdag aan of je **graag** komt, **kan als het moet**, of **niet** kan.
- Je kiest hoeveel shiften je die maand wil doen, of je ook **back-up** wil zijn, en met wie je graag samen staat.
- Je ziet het rooster van deze en volgende maand, met de events van die avonden.
- Kan je toch niet? Dan meld je je af met één knop. De coördinator ziet dat meteen.

Je hebt geen account nodig. Je browser onthoudt de code en je naam.

**Voor de coördinator** (met de code van de coördinator):

- Je zet avonden op gesloten, workshop of iets anders, en vult events in.
- Je keurt nieuwe namen goed.
- Je ziet in één tabel wie wanneer kan.
- Met **Maak voorstel** stelt de tool het rooster samen. Per vrijdag staat erbij waarom die mensen gekozen zijn.
- Je past aan waar nodig en kiest **Publiceer**. De spreadsheet krijgt dan ook een tabblad **Kalender** in de vertrouwde vorm: weken in rijen, maandag tot zondag in kolommen, met de rijen events, bib en backup.
- Je ziet de afmeldingen, met een voorstel voor een vervanger.
- In de spreadsheet staat per jaar een **jaaroverzicht**: hoeveel shiften elke vrijwilliger deed, en hoe druk het was per maand (zie stap 7).

**Hoe het voorstel gemaakt wordt.** De tool gebruikt vaste regels, geen AI. Dezelfde keuzes geven altijd hetzelfde voorstel. De regels staan in `roosterregels.js`, met uitleg:

- Enkel open avonden worden gepland.
- Niemand komt boven zijn of haar maximum aantal shiften.
- Eerst worden de vrijdagen gevuld waarop de minste mensen kunnen.
- "Graag" gaat voor "kan als het moet".
- Duo's worden waar het kan samen ingepland.
- Wie minder shiften heeft, krijgt voorrang.
- De tool vermijdt dat iemand twee vrijdagen na elkaar staat.
- Lukt iets niet, dan blijft de plaats leeg en krijg je een waarschuwing.

**Hoe de tool in elkaar zit.** De website zelf staat op GitHub, in deze repository. De gegevens staan in een Google-spreadsheet in het Google-account van Madrigal. Een klein script bij die spreadsheet (Google Apps Script) zorgt voor de verbinding. Alles is gratis.

> **Over de codes.** De toegangscode en de code van de coördinator zijn een eenvoudige drempel, geen echte beveiliging. Iemand die de code kent, kan het rooster zien en zich onder eender welke naam aanmelden. Daarom bewaart de tool enkel voornamen, en geen telefoonnummers of e-mailadressen. Komt de code buiten de groep terecht? Verander ze dan in het tabblad Instellingen (zie stap 7).

---

## 2. De spreadsheet aanmaken en `installeer()` uitvoeren

Doe dit in het **Google-account van Madrigal**, niet in je eigen account. Zo blijft alles bij de bib, ook als jij stopt.

1. Log in op het Google-account van Madrigal en ga naar [sheets.new](https://sheets.new). Er opent een lege spreadsheet.
2. Geef ze bovenaan een naam, bijvoorbeeld **Rooster Project Madrigal**.
3. Kies in het menu **Extensies → Apps Script**. Er opent een nieuw tabblad met een code-editor.
4. Geef het project bovenaan een naam, bijvoorbeeld **Rooster**.
5. Je ziet een bestand **Code.gs** met een paar regels. Selecteer alles en verwijder het.
6. Open in deze repository het bestand [`apps-script/Code.gs`](apps-script/Code.gs). Klik rechtsboven op het knopje **Copy raw file** (twee vierkantjes) en plak alles in de editor.
7. Klik op het diskette-icoon (**Project opslaan**).
8. Zet de tijdzone juist: klik links op het tandwiel (**Projectinstellingen**) en kies bij Tijdzone **(GMT+01:00) Brussel**. Ga terug naar de editor met het icoon `< >`.
9. Kies bovenaan in de keuzelijst naast **Uitvoeren** de functie **installeer** en klik op **Uitvoeren**.
10. Google vraagt toestemming. Klik op **Machtigingen controleren** en kies het account van Madrigal.
11. Je krijgt mogelijk de melding *"Google heeft deze app niet geverifieerd"*. Dat is normaal: het is jullie eigen script. Klik op **Geavanceerd** en daarna op **Ga naar Rooster (onveilig)**. Klik op **Toestaan**.
12. Onderaan zie je *"Klaar. De codes staan in het tabblad Instellingen."*

Ga terug naar de spreadsheet. Je ziet nu de tabbladen **Instellingen**, **Vrijwilligers**, **Avonden**, **Beschikbaarheid**, **Rooster**, **Afmeldingen** en **Logboek**. Er is ook een menu **Rooster** bijgekomen. Zie je het niet meteen, herlaad de pagina dan.

`installeer()` mag je gerust opnieuw uitvoeren, bijvoorbeeld via het menu **Rooster → Tabbladen installeren of herstellen**. Bestaande gegevens en instellingen blijven staan. Enkel ontbrekende tabbladen, kolomkoppen en instellingen worden toegevoegd.

`installeer()` zet ook een automatische taak klaar die op de **1ste van elke maand** draait. In januari werkt die het jaaroverzicht van het afgelopen jaar af. Daarna wist ze de gegevens die ouder zijn dan de bewaartermijn (zie `bewaartermijn_maanden` in stap 7). De Kalender-tabbladen en de jaaroverzichten worden nooit gewist.

---

## 3. De vrijwilligers en de terugkerende events invullen

### Vrijwilligers

Open het tabblad **Vrijwilligers** en vul per vrijwilliger een rij in:

| voornaam | actief | ervaren / heeft sleutel | opmerking voor de coördinator |
|---|---|---|---|
| Sam | ja | ja | |
| Lou | ja | nee | komt pas om 18:30 |

- **voornaam**: precies zoals die overal getoond moet worden. Gebruik enkel voornamen. Hebben twee mensen dezelfde voornaam, voeg dan een letter toe, bijvoorbeeld "Sam D.".
- **actief**: `ja` of `nee`. Wie op `nee` staat, verschijnt niet meer in de lijst, maar alles wat die persoon eerder deed, blijft bewaard.
- **ervaren / heeft sleutel**: `ja` of `nee`. Vrijwilligers zien deze kolom nergens. De tool gebruikt ze enkel als je de regel uit stap 7 aanzet.
- **opmerking**: enkel voor de coördinator.

Typt iemand in de tool een naam die nog niet in de lijst staat? Dan verschijnt die naam hier met **actief = nieuw**. Je keurt die goed in de tool (bij Coördinator → Nieuwe namen) of zet hier zelf `ja`.

Laat de volgorde van de kolommen staan. Voeg geen kolommen toe tussen de bestaande.

### Terugkerende events

Open het tabblad **Avonden**. In kolom **F en G** staat een klein blok:

| terugkerend: week van de maand | event |
|---|---|
| 1ste | Praatcafé |
| 2de | |
| 3de | Volkskeuken |
| 4de | |
| laatste | |

Vul in kolom G de vaste events in. De tool vult ze automatisch in bij de juiste vrijdag. Heeft een maand 4 vrijdagen en staat er zowel bij "4de" als bij "laatste" iets? Dan wint "laatste".

Uitzonderingen pas je aan in de tool, bij **Coördinator → Avonden**. Daar zet je ook een avond op **gesloten**, **workshop** of **ander**. Op die avonden kunnen vrijwilligers niets aanduiden.

---

## 4. Het script publiceren als web-app en de URL in `config.js` zetten

1. Ga naar de Apps Script-editor (in de spreadsheet: **Extensies → Apps Script**).
2. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
3. Klik naast "Type selecteren" op het tandwiel en kies **Web-app**.
4. Vul in:
   - **Beschrijving**: bijvoorbeeld `Rooster`
   - **Uitvoeren als**: **Ik** (het account van Madrigal)
   - **Wie heeft toegang**: **Iedereen**
5. Klik op **Implementeren**. Geef toestemming als Google daarom vraagt (zoals in stap 2).
6. Je krijgt een **URL van de web-app**. Die begint met `https://script.google.com/macros/s/` en eindigt op `/exec`. Kopieer ze.

Zet de URL nu in `config.js`:

1. Open in deze repository het bestand [`config.js`](config.js).
2. Klik rechtsboven op het potloodje (**Edit this file**).
3. Plak de URL tussen de aanhalingstekens:
   ```js
   window.ROOSTER_CONFIG = {
     scriptUrl: 'https://script.google.com/macros/s/.../exec'
   };
   ```
4. Klik op **Commit changes…** en daarna nog eens op **Commit changes**.

"Iedereen" betekent dat de website het script mag aanspreken zonder in te loggen. Het script controleert zelf de code bij elke vraag. Niemand kan via de link de spreadsheet zelf openen.

---

## 5. GitHub Pages aanzetten

GitHub Pages zet de website gratis online.

1. Ga op GitHub naar deze repository en klik op **Settings**.
2. Klik links op **Pages**.
3. Kies bij **Source** de optie **Deploy from a branch**.
4. Kies bij **Branch** `main` en de map `/ (root)`. Klik op **Save**.
5. Wacht een paar minuten en herlaad de pagina. Bovenaan verschijnt *"Your site is live at …"*, met de link naar de tool.

Het adres is `https://projectmadrigal.github.io/` gevolgd door de naam van de repository. Wil je precies `projectmadrigal.github.io/rooster`, geef de repository dan de naam `rooster`, met kleine letters (**Settings → General → Repository name**).

Na elke wijziging in de repository werkt GitHub de site vanzelf bij, meestal binnen een paar minuten.

---

## 6. Testen voor je de link deelt

1. **Werkt het script?** Open de URL van de web-app (uit stap 4) in je browser. Je moet *"De roosterserver werkt."* zien.
2. **Werkt de site?** Open de link van GitHub Pages. Je ziet het welkomstscherm met een vak voor de code.
3. **Als vrijwilliger**: vul de `toegangscode_vrijwilligers` in uit het tabblad Instellingen. Kies volgende maand, typ als naam **Test** (via "Ik sta er niet bij") en vul alles in. Kijk in de spreadsheet of er een rij bij staat in het tabblad Beschikbaarheid.
4. **Als coördinator**: klik onderaan op **Andere code ingeven** en vul de `code_coordinator` in. Bij **Coördinator** zie je "Test" bij Nieuwe namen. Klik op **Weigeren**: de test wordt dan gewist.
5. Probeer ook eens **Maak voorstel** en **Bewaar als voorstel**. Vrijwilligers zien een voorstel pas als je publiceert.
6. Probeer de site op je smartphone. Via het menu van je browser kan je ze **op je beginscherm zetten**.

Alles in orde? Deel dan in de WhatsApp-groep de link en de toegangscode.

> **Tip:** wil je de tool eerst bekijken zonder Google? Open dan `tests/demo.html` op de site, bijvoorbeeld `https://projectmadrigal.github.io/rooster/tests/demo.html`. Daar draait een demo met verzonnen namen. Codes: `demo` en `demo-coordinator`. Er wordt niets bewaard.

---

## 7. Instellingen aanpassen

Alle instellingen staan in het tabblad **Instellingen** van de spreadsheet. Pas enkel de kolom **waarde** aan. De kolom **uitleg** zegt wat elke regel doet. De tool leest de instellingen bij elke vraag, dus een wijziging werkt meteen. Je hoeft niets opnieuw te publiceren.

| sleutel | standaard | wat het doet |
|---|---|---|
| `openingsdag` | vrijdag | De dag waarop de bib open is. |
| `beginuur`, `einduur` | 18:00, 21:00 | Getoond aan vrijwilligers. |
| `aantal_vrijwilligers` | 2 | Hoeveel vrijwilligers per avond: 1 of 2. |
| `aantal_backups` | 1 | Hoeveel back-ups per avond: 0 of 1. |
| `backup_verplicht` | nee | `ja`: een avond zonder back-up geeft een waarschuwing. `nee`: enkel een melding. |
| `standaard_max_shiften_per_maand` | 2 | Het maximum voor wie "maakt niet uit" kiest. |
| `backup_telt_mee_voor_maximum` | nee | `ja`: back-up zijn telt mee als shift. |
| `niet_twee_weken_na_elkaar` | ja | De tool vermijdt dat iemand twee weken na elkaar staat. Lukt het niet anders, dan gebeurt het toch, met een melding. |
| `toegangscode_vrijwilligers` | (willekeurig) | De code voor de WhatsApp-groep. |
| `code_coordinator` | (willekeurig) | De code voor de coördinator. Deel die niet. |
| `inschrijving_sluit` | 7 | Zoveel dagen voor het begin van de maand sluit het invullen. De coördinator kan daarna nog wel invullen. |
| `afmelding_backup_valt_automatisch_in` | nee | `ja`: bij een afmelding neemt de back-up meteen over. `nee`: de coördinator bevestigt. |
| `bewaartermijn_maanden` | 12 | Gegevens ouder dan zoveel maanden worden op de 1ste van elke maand gewist. `0` betekent: nooit wissen. De Kalender-tabbladen en de jaaroverzichten blijven altijd staan. Pas ook de termijn aan in `tekst_privacy` als je dit wijzigt. |
| `minstens_een_ervaren_per_avond` | nee | Zie hieronder. |
| `tekst_welkom` | | De welkomsttekst bovenaan. |
| `tekst_uitleg` | | De uitleg onder "Hoe werkt het?". |
| `tekst_privacy` | | De privacymelding. Vermeld wie vragen beantwoordt. |

Schrijf `ja` en `nee` voluit. Verander de **sleutels** in de eerste kolom niet: de tool zoekt de instellingen op die naam.

**Een code veranderen.** Typ een nieuwe code in de kolom waarde. Vanaf dan werkt de oude code niet meer. Vrijwilligers krijgen dan vanzelf het codescherm te zien en vullen de nieuwe code in.

### De regel "minstens één ervaren vrijwilliger per avond" aanzetten

Gebruik deze regel als er op elke avond iemand moet zijn die de bib kent of een sleutel heeft.

1. Open het tabblad **Vrijwilligers**. Zet in de kolom **ervaren / heeft sleutel** `ja` bij wie ervaren is, en `nee` bij de anderen.
2. Open het tabblad **Instellingen** en zet `minstens_een_ervaren_per_avond` op `ja`.
3. Kies in de tool opnieuw **Maak voorstel**. De tool zet nu op elke avond minstens één ervaren vrijwilliger, als dat kan, en vermeldt dat in de motivatie. Lukt het niet, dan krijg je bij die avond de waarschuwing *"Er staat geen ervaren vrijwilliger op deze avond."*

Uitzetten: zet de instelling terug op `nee`. De kolom ervaren wordt dan genegeerd.

Vrijwilligers zien nooit wie als ervaren staat.

### Het jaaroverzicht

Per jaar is er een tabblad **Jaaroverzicht 2026**, **Jaaroverzicht 2027**, enzovoort. Daarin staan drie tabellen:

- **Shiften als vrijwilliger**: per voornaam het aantal shiften per maand en het totaal van het jaar. Handig om vrijwilligers te bedanken.
- **Back-ups**: hetzelfde, voor de keren dat iemand back-up was.
- **Per maand**: hoe druk het was. Je ziet het aantal open avonden en avonden die gesloten waren of een workshop hadden. Je ziet ook hoeveel avonden genoeg of te weinig vrijwilligers hadden, hoeveel avonden geen back-up hadden, hoeveel verschillende mensen meehielpen, hoeveel mensen hun beschikbaarheid invulden en hoeveel afmeldingen er waren.

Namen staan alfabetisch, zodat het geen ranglijst wordt. Afmeldingen worden enkel per maand geteld, niet per persoon.

**Wanneer het bijgewerkt wordt:**
- Elk jaar in januari vanzelf, voor het afgelopen jaar.
- Vóór oude gegevens gewist worden: dan worden de aantallen eerst bewaard. Wat al in het overzicht staat, blijft staan, ook als de details weg zijn.
- Wanneer je wil, via het menu **Rooster → Jaaroverzicht bijwerken** (voor dit en vorig jaar).

Enkel gepubliceerde roosters tellen mee. Een vervanging na een afmelding telt mee voor wie de shift overnam.

---

## 8. Na een wijziging in het script: een nieuwe versie publiceren

Heb je iets veranderd in `apps-script/Code.gs`? Dan moet je dat in Google opnieuw publiceren. Anders blijft de oude versie werken.

1. Kopieer de nieuwe `Code.gs` uit de repository en plak ze in de Apps Script-editor, in plaats van de oude. Klik op **Project opslaan**.
2. Klik op **Implementeren → Implementaties beheren**.
3. Klik op het potloodje (**Bewerken**).
4. Kies bij **Versie** de optie **Nieuwe versie** en klik op **Implementeren**.

De URL blijft dezelfde, dus `config.js` hoef je niet aan te passen.

Kies **niet** voor "Nieuwe implementatie": dan krijg je een nieuwe URL.

Wijzigingen aan de website zelf (`index.html`, `app.js`, `styles.css`, `roosterregels.js`) hoef je niet in Google te publiceren. GitHub zet ze vanzelf online.

---

## 9. Als iets niet werkt

| Wat je ziet | Wat je kan doen |
|---|---|
| *"De tool is nog niet gekoppeld aan de spreadsheet"* | De URL in `config.js` ontbreekt. Zie stap 4. |
| *"Er is geen verbinding"* | Controleer je internet. Open de URL van de web-app: zie je *"De roosterserver werkt."*? Zo niet, publiceer dan opnieuw (stap 4), met toegang voor **Iedereen**. |
| *"Deze code klopt niet"* | Vergelijk met het tabblad Instellingen. Hoofdletters en spaties voor of na de code maken niet uit. |
| *"Het tabblad … ontbreekt"* | Iemand heeft een tabblad verwijderd of hernoemd. Kies in de spreadsheet **Rooster → Tabbladen installeren of herstellen**. |
| Een wijziging in het script werkt niet | Publiceer een nieuwe versie (stap 8). |
| De site toont nog de oude versie | Wacht een paar minuten en herlaad. Kijk op GitHub bij **Actions** of de publicatie gelukt is. |
| Iemand staat er twee keer in, anders geschreven | Keur de nieuwe naam goed met de juiste schrijfwijze (de naam van wie al in de lijst staat). De twee worden dan samengevoegd. |
| De keuzes van een maand zijn weg | Gegevens ouder dan `bewaartermijn_maanden` worden gewist. Het Kalender-tabblad en het jaaroverzicht blijven wel staan. |
| Iets anders | Kijk in het tabblad **Logboek** wat er gebeurde. In de Apps Script-editor zie je links bij **Uitvoeringen** eventuele foutmeldingen. |

Werkt het nog altijd niet? Zet de vrijwilligers tijdelijk terug op de WhatsApp-poll. Het tabblad Kalender kan je altijd met de hand invullen.

---

## 10. Waar alles staat

Voor een volgende beheerder:

| Wat | Waar |
|---|---|
| De website | Deze repository op GitHub, `ProjectMadrigal/Rooster`. Online via GitHub Pages (stap 5). |
| De gegevens | De Google-spreadsheet **Rooster Project Madrigal** in het Google-account van Madrigal. |
| De geschiedenis | De tabbladen **Kalender …** (per maand) en **Jaaroverzicht …** (per jaar) in die spreadsheet. |
| Het script | In die spreadsheet: **Extensies → Apps Script**. Een kopie staat in [`apps-script/Code.gs`](apps-script/Code.gs). Hou die twee gelijk. |
| De koppeling | De URL van de web-app, in [`config.js`](config.js). |
| De codes en instellingen | Het tabblad **Instellingen** in de spreadsheet. Nooit in deze repository: die is publiek. |
| De regels voor het voorstel | [`roosterregels.js`](roosterregels.js) |
| De schermen | [`index.html`](index.html), [`app.js`](app.js) en [`styles.css`](styles.css). Kleuren en lettertypes staan als variabelen bovenaan `styles.css`. |
| Het icoon | `icon.svg`, `icon-192.png` en `icon-512.png`: plaatshouders. Vervang ze door het logo van Madrigal, met dezelfde bestandsnamen. |
| Beginscherm-instellingen | [`manifest.json`](manifest.json) |
| Tests van de regels | [`tests/`](tests/). Open `tests/index.html` in je browser, of voer `node tests/roosterregels.test.js` uit als je Node hebt. |
| Demo zonder Google | [`tests/demo.html`](tests/demo.html) met [`tests/demo-api.js`](tests/demo-api.js) |
| De oorspronkelijke opdracht | [`docs/OPDRACHT.md`](docs/OPDRACHT.md), met de keuzes die bij de bouw gemaakt zijn |

De tool heeft geen framework en geen build-stap. Wie een beetje HTML kent, kan de bestanden rechtstreeks op GitHub aanpassen. Vraag bij grotere wijzigingen eerst of iemand de tests wil laten draaien.

### Privacy

De tool bewaart enkel voornamen en roosterkeuzes: per vrijdag de keuze, het aantal shiften, back-up ja of nee, met wie je graag samen staat, een opmerking en het tijdstip van invullen. Er worden geen telefoonnummers of e-mailadressen bewaard. Gegevens ouder dan de bewaartermijn worden automatisch gewist, op de 1ste van elke maand. Wat blijft: de Kalender-tabbladen (wie wanneer stond) en de jaaroverzichten (per voornaam het aantal shiften en back-ups). Die verwijdert de coördinator zelf als dat nodig is, bijvoorbeeld als iemand vraagt om gewist te worden.
