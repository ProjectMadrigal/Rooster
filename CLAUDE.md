# Rooster Project Madrigal

Webtool voor het vrijwilligersrooster van de bib van Project Madrigal, online op https://projectmadrigal.github.io/rooster/ (GitHub Pages, branch `main`, map root). De gebruiker is de oprichter, geen ontwikkelaar: antwoord in het Nederlands, kort en concreet, en zeg bij elke wijziging wat nog met de hand moet in de spreadsheet of Apps Script.

## Harde regels
- De repository is **publiek**. Nooit echte namen, codes of de inhoud van de spreadsheet in code, tests of de demo. De demo en tests gebruiken verzonnen voornamen.
- De tool bewaart enkel voornamen, geen telefoonnummers of e-mailadressen.
- Geen framework, geen build-stap: gewone HTML, CSS en JavaScript.
- Toegankelijk en drempelverlagend. Schrijfstijl: jij-vorm, actief, kort, geen gedachtestreepjes.
- De rol heet **planner** (vroeger coördinator). In de code heet de rol intern nog `coordinator`, laat dat zo.

## Opbouw
- `index.html`, `app.js`, `styles.css`: de tool (tabbladen "Wanneer kan ik?", "Rooster", "Planner").
- `roosterregels.js`: de vaste regels voor het voorstel (geen AI, deterministisch). Werkt in de browser en in Node.
- `config.js`: URL van de Apps Script web-app.
- `apps-script/Code.gs`: alle Apps Script-code in één bestand (installeer, instellingen, web-app met acties per rol). Wordt rechtstreeks geplakt in Apps Script.
- `tests/roosterregels.test.js`: tests van de regels. `tests/demo.html` + `tests/demo-api.js`: de tool met een nagebootste server (codes `demo` en `demo-planner`).
- `docs/OPDRACHT.md`: de oorspronkelijke opdracht, met bovenaan de latere wijzigingen.

## Keuzes per avond
`graag` (gewone shift), `backup` (enkel back-up), `niet`. Een oude keuze `kan` / "kan als het moet" telt als `backup`. Back-ups: eerst wie `backup` koos, anders een vrije `graag`-vrijwilliger.

## Werkwijze bij een wijziging
1. Tests: `node tests/roosterregels.test.js`. Pas de tests aan of voeg er een toe bij elke regelwijziging.
2. Controleer in de browser via `tests/demo.html` (Playwright, Chromium staat klaar). Pas `tests/demo-api.js` mee aan als de server iets nieuws teruggeeft.
3. Een kolom in de spreadsheet nooit verwijderen of verschuiven: de code leest per positie. Een kolom die niet meer nodig is, blijft staan met een nieuwe kop.
4. Een instelling hernoemen? Migreer ze in `werkOudeInstellingenBij()` en blijf de oude sleutel lezen.
5. Werk op een branch, open een pull request en merge.
6. Vertel de gebruiker daarna: het nieuwe `apps-script/Code.gs` plakken via een commit-specifieke link, **Rooster > Tabbladen installeren of herstellen**, en een **nieuwe versie** van de web-app publiceren.

## Verwante repository
`ProjectMadrigal/projectmadrigal.github.io`: de website en catalogus. Het uitleenscherm en bestuursscherm daar tonen dit rooster via de actie `maand` met de toegangscode voor vrijwilligers (`apps-script/Rooster.js` in die repository). Verander de vorm van het antwoord van `maand` dus niet zonder ook daar te kijken.
