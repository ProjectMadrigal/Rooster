# Rooster Project Madrigal

Een eenvoudige webtool voor het vrijwilligersrooster van de bib van Project Madrigal. Ze vervangt de maandelijkse poll in WhatsApp en het rooster dat met de hand in een spreadsheet gemaakt werd.

Deze handleiding is geschreven voor vrijwilligers en de planner **zonder technische kennis**. Je hebt niets te installeren: alles gebeurt in je browser, in de Google-spreadsheet en op GitHub.

| Wat | Waar |
| --- | --- |
| **De tool** | https://projectmadrigal.github.io/rooster/ |
| **Een demo met verzonnen namen** (er wordt niets bewaard) | https://projectmadrigal.github.io/rooster/tests/demo.html, codes `demo` en `demo-planner` |
| **De gegevens** | de Google-spreadsheet **Rooster Project Madrigal**, in het Google-account van Madrigal |

**Nieuw hier?** Lees eerst [Deel A: dagelijks gebruik](#deel-a-dagelijks-gebruik). Deel C beschrijft de installatie: die is al gebeurd.

## Inhoud

**Deel A. Dagelijks gebruik**

1. [Voor vrijwilligers](#a1-voor-vrijwilligers)
2. [Voor de planner: het rooster van een maand maken](#a2-voor-de-planner-het-rooster-van-een-maand-maken)
3. [Voor de planner: afmeldingen verwerken](#a3-voor-de-planner-afmeldingen-verwerken)
4. [Vrijwilligers en vaste events beheren](#a4-vrijwilligers-en-vaste-events-beheren)
5. [Wat te doen als iets niet werkt](#a5-wat-te-doen-als-iets-niet-werkt)

**Deel B. Achtergrond**

1. [Hoe het voorstel gemaakt wordt](#b1-hoe-het-voorstel-gemaakt-wordt)
2. [Hoe het in elkaar zit](#b2-hoe-het-in-elkaar-zit)
3. [Privacy en de codes](#b3-privacy-en-de-codes)
4. [Woordenlijst](#b4-woordenlijst)

**Deel C. Eenmalige installatie (al gebeurd)**

1. [De spreadsheet en het script installeren](#c1-de-spreadsheet-en-het-script-installeren)
2. [Het script publiceren als web-app](#c2-het-script-publiceren-als-web-app)
3. [De tool online zetten met GitHub Pages](#c3-de-tool-online-zetten-met-github-pages)
4. [Testen voor je de link deelt](#c4-testen-voor-je-de-link-deelt)

**Deel D. Voor een beheerder**

1. [Alle instellingen](#d1-alle-instellingen)
2. [Het jaaroverzicht](#d2-het-jaaroverzicht)
3. [Een nieuwe versie van het script publiceren](#d3-een-nieuwe-versie-van-het-script-publiceren)
4. [De tool zelf aanpassen](#d4-de-tool-zelf-aanpassen)
5. [Waar alles staat](#d5-waar-alles-staat)

---

# Deel A. Dagelijks gebruik

## A1. Voor vrijwilligers

1. Open de tool. De eerste keer vul je de **toegangscode** in. Die vind je in de WhatsApp-groep van de vrijwilligers. Je browser onthoudt ze.
2. Kies de **maand** (standaard de volgende maand) en je **naam**. Sta je er niet bij? Kies **Ik sta er niet bij** en typ je voornaam. De planner zet je daarna in de lijst.
3. Duid per open vrijdag aan:
   - **Graag**: je wil die avond in de bib staan.
   - **Back-up**: je springt in als iemand toch niet kan.
   - **Niet**: je kan niet.

   Gesloten avonden en workshops kan je niet aanduiden. Loopt er die avond een event, dan staat dat erbij.
4. Kies hoeveel shiften je die maand wil doen: 1, 2, 3, 4 of "maakt niet uit".
5. Kies eventueel met wie je graag samen staat, en schrijf een opmerking voor de planner.
6. Klik op **Verstuur**. Wil je later iets wijzigen? Vul opnieuw in: je vorige keuze verschijnt en je vervangt ze.

Je kan invullen tot een week voor het begin van de maand. Daarna sluit het invullen. Spreek dan de planner aan.

**Het rooster bekijken.** Klik bovenaan op **Rooster**. Je ziet het rooster van deze en volgende maand, zodra de planner het publiceerde, met de events van die avonden.

**Toch niet kunnen?** Kies bij **Rooster** je naam en klik bij die avond op **Afmelden**. De planner ziet dat meteen en zoekt een vervanger.

**Op je beginscherm.** Open de tool op je smartphone en kies in het menu van je browser **Toevoegen aan beginscherm**.

## A2. Voor de planner: het rooster van een maand maken

Klik onderaan op **Andere code ingeven** en vul de **code van de planner** in (tabblad Instellingen, `code_planner`). Bovenaan verschijnt het tabblad **Planner**. Kies de maand. Je ziet vijf onderdelen.

**Elke maand, in deze volgorde:**

1. **Avonden** (liefst voor de vrijwilligers invullen): zet een avond op **gesloten**, **workshop** of **ander**, en vul of verbeter het event. Klik op **Bewaar avonden**. Vaste events per week van de maand vult de tool zelf in (zie [A4](#a4-vrijwilligers-en-vaste-events-beheren)).
2. **Nieuwe namen**: wie zich met een nieuwe naam aanmeldde. Klik op **Goedkeuren** of **Weigeren**. Is het iemand die al in de lijst staat, maar anders geschreven? Keur de naam goed met de juiste schrijfwijze, dan worden de twee samengevoegd.
3. **Wie kan wanneer?**: een tabel met per vrijwilliger en per vrijdag de keuze (graag, back-up, niet), het maximum aantal shiften, met wie die graag samen staat en de opmerking. Onderaan zie je wie nog niet invulde.
4. **Rooster**: klik op **Maak voorstel**. De tool vult elke avond in en schrijft erbij waarom ze die mensen koos. Waarschuwingen (iets ontbreekt of klopt niet) en meldingen (ter info) staan bij de avond.
   - Pas aan waar nodig met de keuzelijsten.
   - **Bewaar als voorstel**: bewaart, maar vrijwilligers zien het nog niet.
   - **Publiceer**: vrijwilligers zien het rooster. De spreadsheet krijgt ook een tabblad **Kalender** in de vertrouwde vorm: weken in rijen, maandag tot zondag in kolommen, met de rijen events, bib en backup.
5. **Afmeldingen**: zie [A3](#a3-voor-de-planner-afmeldingen-verwerken).

Als planner kan je ook nog invullen voor iemand nadat het invullen gesloten is.

Het gepubliceerde rooster verschijnt ook in het uitleenscherm en het bestuursscherm van de catalogus.

## A3. Voor de planner: afmeldingen verwerken

Bij **Planner > Afmeldingen** staat wie zich afmeldde, voor welke avond en wanneer. Bij elke open afmelding:

1. De tool stelt een vervanger voor, met uitleg: eerst de back-up van die avond, daarna wie die avond "Back-up" koos, dan wie "Graag" koos en nog plaats heeft.
2. Kies de vervanger in de keuzelijst, of **niemand**.
3. Klik op **Bevestig**. Het rooster en de Kalender worden aangepast.

Wil je dat de back-up meteen overneemt, zonder dat jij bevestigt? Zet `afmelding_backup_valt_automatisch_in` op `ja` in Instellingen.

## A4. Vrijwilligers en vaste events beheren

**Vrijwilligers.** Tabblad **Vrijwilligers**, één rij per vrijwilliger:

| voornaam | actief | ervaren / heeft sleutel | opmerking voor de planner |
| --- | --- | --- | --- |
| Sam | ja | ja | |
| Lou | ja | nee | komt pas om 18:30 |

- **voornaam**: zoals die overal getoond wordt. Enkel voornamen. Twee mensen met dezelfde voornaam? Voeg een letter toe, bijvoorbeeld "Sam D.".
- **actief**: `ja` of `nee`. Wie op `nee` staat, verschijnt niet meer in de lijst. Wat die persoon eerder deed, blijft bewaard. Een nieuwe naam staat eerst op `nieuw`.
- **ervaren / heeft sleutel**: `ja` of `nee`. Vrijwilligers zien deze kolom nergens. De tool gebruikt ze enkel als je de regel "minstens één ervaren per avond" aanzet (zie [D1](#d1-alle-instellingen)).
- **opmerking**: enkel voor de planner.

Laat de volgorde van de kolommen staan. Voeg geen kolommen toe tussen de bestaande.

**Vaste events.** In het tabblad **Avonden**, kolom F en G, staat een klein blok:

| terugkerend: week van de maand | event |
| --- | --- |
| 1ste | Praatcafé |
| 2de | |
| 3de | Volkskeuken |
| 4de | |
| laatste | |

Vul in kolom G de vaste events in. De tool zet ze vanzelf bij de juiste vrijdag. Staat er zowel bij "4de" als bij "laatste" iets en heeft de maand 4 vrijdagen, dan wint "laatste". Uitzonderingen pas je aan bij **Planner > Avonden**.

## A5. Wat te doen als iets niet werkt

| Wat je ziet | Wat je doet |
| --- | --- |
| *"Deze code klopt niet"* | Vergelijk met het tabblad Instellingen. Hoofdletters en spaties voor of na de code maken niet uit. |
| *"Invullen voor ... kan niet meer"* | Het invullen is gesloten. Spreek de planner aan: die kan nog invullen. |
| *"Er is geen verbinding"* | Controleer je internet. Open de URL van de web-app: zie je *"De roosterserver werkt."*? Zo niet, zie [C2](#c2-het-script-publiceren-als-web-app). |
| *"De tool is nog niet gekoppeld aan de spreadsheet"* | De URL in `config.js` ontbreekt. Zie [C2](#c2-het-script-publiceren-als-web-app). |
| *"Het tabblad ... ontbreekt"* | Iemand heeft een tabblad verwijderd of hernoemd. Kies in de spreadsheet **Rooster > Tabbladen installeren of herstellen**. |
| Een wijziging in het script werkt niet | Publiceer een nieuwe versie, zie [D3](#d3-een-nieuwe-versie-van-het-script-publiceren). |
| De tool toont nog de oude versie | Wacht een paar minuten en vernieuw met **Ctrl+F5**. Kijk op GitHub bij **Actions** of de publicatie gelukt is. |
| Iemand staat er twee keer in, anders geschreven | Keur de nieuwe naam goed met de schrijfwijze van wie al in de lijst staat. De twee worden samengevoegd. |
| De keuzes van een oude maand zijn weg | Gegevens ouder dan de bewaartermijn worden gewist. Het Kalender-tabblad en het jaaroverzicht blijven staan. |
| Iets anders | Kijk in het tabblad **Logboek**. In de Apps Script-editor zie je links bij **Uitvoeringen** eventuele foutmeldingen. |

Werkt het nog altijd niet? Zet de vrijwilligers tijdelijk terug op de WhatsApp-poll. Het tabblad Kalender kan je altijd met de hand invullen.

---

# Deel B. Achtergrond

## B1. Hoe het voorstel gemaakt wordt

De tool gebruikt vaste regels, geen AI. Dezelfde keuzes geven altijd hetzelfde voorstel. De regels staan in [`roosterregels.js`](roosterregels.js), met uitleg.

**Nooit:**

- iemand inplannen op een avond die niet open is;
- iemand inplannen op een avond waarvoor die "Niet" koos of niets invulde;
- iemand boven het eigen maximum aantal shiften zetten;
- iemand die "Back-up" koos op een gewone plaats zetten.

**Daarna, in deze volgorde van belang:**

1. Eerst de vrijdagen waarop de minste mensen "Graag" kozen.
2. Minstens één ervaren vrijwilliger per avond (enkel als die regel aan staat).
3. Niet twee vrijdagen na elkaar (enkel als die regel aan staat).
4. Duo's samen.
5. Wie minder shiften heeft, gaat voor.
6. Bij gelijke stand: alfabetisch, zodat het resultaat altijd hetzelfde is.

**Back-ups:** eerst wie "Back-up" koos. Is er niemand, dan iemand die "Graag" koos en die avond nog niet ingepland staat.

Lukt iets niet, dan blijft de plaats leeg en krijg je een waarschuwing. Een oude keuze "kan als het moet" telt als "Back-up".

## B2. Hoe het in elkaar zit

```
Google-spreadsheet "Rooster Project Madrigal"
        │  alle gegevens blijven hier, in het Google-account van Madrigal
        ▼
Google Apps Script (een klein programma bij de spreadsheet)
        │  publiceert een "web-app": een adres dat gegevens doorgeeft
        ▼
GitHub Pages (deze repository)
           de tool die je in de browser ziet
```

- **Alles is gratis.**
- **Alle gegevens blijven in Google.** Deze repository is publiek en bevat enkel code. De tests en de demo gebruiken verzonnen namen.
- De catalogus van de bib (repository **projectmadrigal.github.io**) toont het gepubliceerde rooster in het uitleenscherm en het bestuursscherm. Daarvoor gebruikt ze de toegangscode voor vrijwilligers.

## B3. Privacy en de codes

De tool bewaart enkel voornamen en roosterkeuzes: per vrijdag de keuze, het aantal shiften, met wie je graag samen staat, een opmerking en het tijdstip van invullen. Er worden geen telefoonnummers of e-mailadressen bewaard.

Gegevens ouder dan de bewaartermijn (standaard 12 maanden) worden op de 1ste van elke maand automatisch gewist. Wat blijft: de Kalender-tabbladen (wie wanneer stond) en de jaaroverzichten (per voornaam het aantal shiften en back-ups). Die verwijdert de planner zelf als dat nodig is, bijvoorbeeld als iemand vraagt om gewist te worden.

**De codes zijn een eenvoudige drempel, geen echte beveiliging.** Wie de toegangscode kent, kan het rooster zien en zich onder eender welke naam aanmelden. Daarom bewaart de tool enkel voornamen.

- Deel de **toegangscode** enkel in de WhatsApp-groep.
- Geef de **code van de planner** enkel aan wie het rooster maakt.
- Komt een code buiten de groep terecht? Typ een nieuwe in het tabblad Instellingen. De oude werkt meteen niet meer, en vrijwilligers krijgen vanzelf het codescherm. Pas de nieuwe toegangscode ook aan bij `rooster_code` in de Instellingen van de catalogus.

## B4. Woordenlijst

| Woord | Betekenis |
| --- | --- |
| **Repository** | de map met alle bestanden van de tool op GitHub. Deze heet `rooster`. |
| **GitHub Pages** | de gratis dienst van GitHub die de bestanden als website toont. |
| **Commit** | een wijziging op GitHub bewaren. De knop heet **Commit changes**. |
| **Apps Script** | een klein programma bij de spreadsheet. Je opent het via **Extensies > Apps Script**. |
| **Web-app** | het adres van dat programma, dat de tool gebruikt om gegevens te vragen. Het eindigt op `/exec`. |
| **Nieuwe versie** | na een wijziging in het script moet je een nieuwe versie van de web-app publiceren, anders blijft de oude draaien. |
| **Voorstel, publiceren** | een voorstel ziet enkel de planner. Na publiceren zien de vrijwilligers het rooster. |

---

# Deel C. Eenmalige installatie (al gebeurd)

Dit deel heb je enkel nodig om alles opnieuw op te zetten.

## C1. De spreadsheet en het script installeren

Doe dit in het **Google-account van Madrigal**, niet in je eigen account. Zo blijft alles bij de bib, ook als jij stopt.

1. Log in op het Google-account van Madrigal en ga naar [sheets.new](https://sheets.new). Er opent een lege spreadsheet.
2. Geef ze bovenaan een naam: **Rooster Project Madrigal**.
3. Kies **Extensies > Apps Script**. Er opent een nieuw tabblad met een code-editor. Geef het project bovenaan de naam **Rooster**.
4. Selecteer alles in het bestand **Code.gs** en verwijder het.
5. Open in deze repository [`apps-script/Code.gs`](apps-script/Code.gs). Klik rechtsboven op **Copy raw file** (twee vierkantjes) en plak alles in de editor.
6. Klik op het diskette-icoon (**Project opslaan**).
7. Klik links op het tandwiel (**Projectinstellingen**) en kies bij Tijdzone **(GMT+01:00) Brussel**. Ga terug naar de editor met het icoon `< >`.
8. Kies bovenaan in de keuzelijst naast **Uitvoeren** de functie **installeer** en klik op **Uitvoeren**.
9. Google vraagt toestemming. Klik op **Machtigingen controleren**, kies het account van Madrigal, klik op **Geavanceerd** en daarna op **Ga naar Rooster (onveilig)**. Dat "onveilig" betekent enkel dat Google het script niet zelf nagekeken heeft. Klik op **Toestaan**.
10. Onderaan zie je *"Klaar. De codes staan in het tabblad Instellingen."*

In de spreadsheet staan nu de tabbladen **Instellingen**, **Vrijwilligers**, **Avonden**, **Beschikbaarheid**, **Rooster**, **Afmeldingen** en **Logboek**, en een menu **Rooster**. Zie je het menu niet, vernieuw de pagina dan.

`installeer` mag je gerust opnieuw uitvoeren, via **Rooster > Tabbladen installeren of herstellen**. Bestaande gegevens en instellingen blijven staan. Enkel wat ontbreekt, komt erbij.

`installeer` zet ook een automatische taak klaar die op de **1ste van elke maand** draait. In januari werkt die het jaaroverzicht bij. Daarna wist ze gegevens die ouder zijn dan de bewaartermijn.

Vul daarna de vrijwilligers en de vaste events in, zie [A4](#a4-vrijwilligers-en-vaste-events-beheren).

## C2. Het script publiceren als web-app

1. Kies in de spreadsheet **Extensies > Apps Script**.
2. Klik rechtsboven op **Implementeren > Nieuwe implementatie**.
3. Klik naast "Type selecteren" op het tandwiel en kies **Web-app**.
4. Vul in: beschrijving `Rooster`, uitvoeren als **Ik** (het account van Madrigal), toegang **Iedereen**.
5. Klik op **Implementeren** en geef toestemming als Google erom vraagt.
6. Kopieer de **URL van de web-app**. Ze begint met `https://script.google.com/macros/s/` en eindigt op `/exec`.
7. Open in deze repository [`config.js`](config.js), klik op het potloodje (**Edit this file**) en plak de URL tussen de aanhalingstekens achter `scriptUrl:`.
8. Klik op **Commit changes** en bevestig.

"Iedereen" betekent dat de tool het script mag aanspreken zonder in te loggen. Het script controleert zelf de code bij elke vraag. Niemand kan via de link de spreadsheet openen.

## C3. De tool online zetten met GitHub Pages

1. Ga op GitHub naar deze repository en klik op **Settings > Pages**.
2. Kies bij **Source** de optie **Deploy from a branch**, branch `main`, map `/ (root)`. Klik op **Save**.
3. Na een paar minuten staat de tool online op https://projectmadrigal.github.io/rooster/.

Het adres is `projectmadrigal.github.io/` gevolgd door de naam van de repository. Hernoem de repository dus niet, anders werkt de oude link niet meer.

## C4. Testen voor je de link deelt

1. **Werkt het script?** Open de URL van de web-app in je browser. Je moet *"De roosterserver werkt."* zien.
2. **Als vrijwilliger**: open de tool, vul de `toegangscode_vrijwilligers` in, kies volgende maand, typ als naam **Test** (via "Ik sta er niet bij") en vul alles in. In het tabblad Beschikbaarheid staat nu een rij.
3. **Als planner**: klik onderaan op **Andere code ingeven** en vul de `code_planner` in. Bij **Planner > Nieuwe namen** staat "Test". Klik op **Weigeren**: de test wordt gewist.
4. Probeer **Maak voorstel** en **Bewaar als voorstel**. Vrijwilligers zien een voorstel pas als je publiceert.
5. Probeer de tool op je smartphone.

Alles in orde? Deel dan in de WhatsApp-groep de link en de toegangscode.

---

# Deel D. Voor een beheerder

## D1. Alle instellingen

Alle instellingen staan in het tabblad **Instellingen**. Pas enkel de kolom **waarde** aan. Een wijziging werkt meteen, je hoeft niets te publiceren. Schrijf `ja` en `nee` voluit. Verander de **sleutels** in de eerste kolom niet.

| sleutel | standaard | wat het doet |
| --- | --- | --- |
| `openingsdag` | vrijdag | de dag waarop de bib open is |
| `beginuur`, `einduur` | 18:00, 21:00 | getoond aan vrijwilligers |
| `aantal_vrijwilligers` | 2 | hoeveel vrijwilligers per avond: 1 of 2 |
| `aantal_backups` | 1 | hoeveel back-ups per avond: 0 of 1 |
| `backup_verplicht` | nee | `ja`: een avond zonder back-up geeft een waarschuwing. `nee`: enkel een melding. |
| `standaard_max_shiften_per_maand` | 2 | het maximum voor wie "maakt niet uit" kiest |
| `backup_telt_mee_voor_maximum` | nee | `ja`: back-up zijn telt mee als shift |
| `niet_twee_weken_na_elkaar` | ja | de tool vermijdt dat iemand twee weken na elkaar staat. Lukt het niet anders, dan toch, met een melding. |
| `toegangscode_vrijwilligers` | (willekeurig) | de code voor de WhatsApp-groep |
| `code_planner` | (willekeurig) | de code voor de planner. Heette vroeger `code_coordinator`: **Tabbladen installeren of herstellen** hernoemt die vanzelf, de code blijft dezelfde. |
| `inschrijving_sluit` | 7 | zoveel dagen voor het begin van de maand sluit het invullen |
| `afmelding_backup_valt_automatisch_in` | nee | `ja`: bij een afmelding neemt de back-up meteen over. `nee`: de planner bevestigt. |
| `bewaartermijn_maanden` | 12 | gegevens ouder dan zoveel maanden worden gewist. `0` = nooit. Pas ook de termijn in `tekst_privacy` aan. |
| `minstens_een_ervaren_per_avond` | nee | `ja`: minstens één vrijwilliger per avond staat als ervaren in het tabblad Vrijwilligers. Lukt het niet, dan krijg je een waarschuwing. |
| `tekst_welkom` | | de welkomsttekst bovenaan |
| `tekst_uitleg` | | de uitleg onder "Hoe werkt het?" |
| `tekst_privacy` | | de privacymelding. Vermeld wie vragen beantwoordt. |

## D2. Het jaaroverzicht

Per jaar is er een tabblad **Jaaroverzicht 2026**, **Jaaroverzicht 2027**, enzovoort, met drie tabellen:

- **Shiften als vrijwilliger**: per voornaam het aantal shiften per maand en het totaal. Handig om vrijwilligers te bedanken.
- **Back-ups**: hetzelfde, voor de keren dat iemand back-up was.
- **Per maand**: hoe druk het was. Je ziet het aantal open, gesloten en workshop-avonden. Je ziet ook hoeveel avonden genoeg of te weinig vrijwilligers hadden en hoeveel geen back-up hadden. Daarnaast hoeveel mensen meehielpen of invulden, en hoeveel afmeldingen er waren.

Namen staan alfabetisch, zodat het geen ranglijst wordt. Enkel gepubliceerde roosters tellen mee. Een vervanging telt mee voor wie de shift overnam.

Het jaaroverzicht wordt bijgewerkt in januari, vóór oude gegevens gewist worden, en wanneer je wil via **Rooster > Jaaroverzicht bijwerken**.

## D3. Een nieuwe versie van het script publiceren

Verandert er iets in [`apps-script/Code.gs`](apps-script/Code.gs), dan moet je dat in Google opnieuw publiceren. Anders blijft de oude versie werken.

1. Open `apps-script/Code.gs` op GitHub, klik op **Copy raw file** en plak alles in de Apps Script-editor, in plaats van de oude code. Klik op **Project opslaan**.
2. Kies in de spreadsheet **Rooster > Tabbladen installeren of herstellen**. Zo komen nieuwe instellingen erbij. Wat er al staat, blijft.
3. Klik in Apps Script op **Implementeren > Implementaties beheren**.
4. Klik op het potloodje (**Bewerken**), kies bij **Versie** de optie **Nieuwe versie** en klik op **Implementeren**.

De URL blijft dezelfde. Kies **niet** voor "Nieuwe implementatie": dan krijg je een nieuwe URL, en moet je `config.js` en `rooster_url` in de catalogus aanpassen.

Wijzigingen aan de tool zelf (`index.html`, `app.js`, `styles.css`, `roosterregels.js`) hoef je niet in Google te publiceren. GitHub zet ze vanzelf online.

## D4. De tool zelf aanpassen

**Een klein ding wijzigen**, bijvoorbeeld een tekst:

1. Open het bestand op GitHub, bijvoorbeeld [`app.js`](app.js).
2. Klik op het **potlood** (Edit this file), pas de tekst aan en laat aanhalingstekens, komma's en haakjes staan.
3. Klik op **Commit changes**. Na een paar minuten staat de wijziging online. Vernieuw met **Ctrl+F5**.

Kleuren en lettertypes staan als variabelen bovenaan [`styles.css`](styles.css).

**Met hulp van Claude.** In deze repository staat [`CLAUDE.md`](CLAUDE.md): een samenvatting die Claude bij een nieuwe sessie automatisch leest. Begin per opdracht een nieuwe sessie en beschrijf alles wat je wil in één bericht.

**Voor wie de regels aanpast.** Open `tests/index.html` in je browser, of voer `node tests/roosterregels.test.js` uit als je [Node.js](https://nodejs.org) hebt. Alle tests moeten slagen. Probeer daarna de demo.

Belangrijk: verwijder of verschuif nooit een kolom in de spreadsheet. De tool leest de kolommen op hun plaats.

## D5. Waar alles staat

| Wat | Waar |
| --- | --- |
| De tool | deze repository, [`ProjectMadrigal/rooster`](https://github.com/ProjectMadrigal/rooster), online via GitHub Pages |
| De gegevens | de Google-spreadsheet **Rooster Project Madrigal** in het Google-account van Madrigal |
| De geschiedenis | de tabbladen **Kalender ...** (per maand) en **Jaaroverzicht ...** (per jaar) in die spreadsheet |
| Het script | in die spreadsheet via **Extensies > Apps Script**. Een kopie staat in [`apps-script/Code.gs`](apps-script/Code.gs). Hou die twee gelijk. |
| De koppeling | de URL van de web-app, in [`config.js`](config.js) |
| De codes en instellingen | het tabblad **Instellingen**. Nooit in deze repository: die is publiek. |
| De regels voor het voorstel | [`roosterregels.js`](roosterregels.js) |
| De schermen | [`index.html`](index.html), [`app.js`](app.js) en [`styles.css`](styles.css) |
| Het icoon | `icon.svg`, `icon-192.png` en `icon-512.png`. Vervang ze door het logo van Madrigal, met dezelfde bestandsnamen. |
| Beginscherm-instellingen | [`manifest.json`](manifest.json) |
| Tests en demo | [`tests/`](tests/) |
| De oorspronkelijke opdracht | [`docs/OPDRACHT.md`](docs/OPDRACHT.md), met de latere wijzigingen bovenaan |
| Samenvatting voor Claude | [`CLAUDE.md`](CLAUDE.md) |
| De koppeling met de catalogus | `apps-script/Rooster.js` in de repository **projectmadrigal.github.io**. Die gebruikt de actie `maand` en de toegangscode. |
