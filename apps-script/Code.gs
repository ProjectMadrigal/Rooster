/**
 * Rooster Project Madrigal — Google Apps Script (de "server").
 *
 * Dit script hoort bij de Google-spreadsheet van Madrigal. Het leest en schrijft
 * de gegevens voor de webtool op projectmadrigal.github.io/rooster.
 *
 * Belangrijk:
 *  - Voer één keer installeer() uit. Die maakt alle tabbladen en kolomkoppen.
 *  - Alle instellingen staan in het tabblad Instellingen, niet in deze code.
 *  - Na elke wijziging aan deze code: Implementeren > Implementaties beheren >
 *    potloodje > Versie: Nieuwe versie > Implementeren. Anders blijft de oude
 *    versie actief.
 *
 * De volgorde van de kolommen in elk tabblad ligt vast (zie KOLOMMEN).
 * Verplaats dus geen kolommen in de spreadsheet.
 */

var TAB = {
  instellingen: 'Instellingen',
  vrijwilligers: 'Vrijwilligers',
  avonden: 'Avonden',
  beschikbaarheid: 'Beschikbaarheid',
  rooster: 'Rooster',
  afmeldingen: 'Afmeldingen',
  logboek: 'Logboek'
};

var KOLOMMEN = {
  Instellingen: ['sleutel', 'waarde', 'uitleg'],
  Vrijwilligers: ['voornaam', 'actief', 'ervaren / heeft sleutel', 'opmerking voor de coördinator'],
  Avonden: ['datum', 'status', 'event'],
  Beschikbaarheid: ['maand', 'voornaam', 'keuzes', 'max shiften', 'wil back-up zijn', 'graag samen met', 'opmerking', 'ingevuld op'],
  Rooster: ['datum', 'vrijwilliger 1', 'vrijwilliger 2', 'back-up', 'motivatie', 'status', 'bijgewerkt op'],
  Afmeldingen: ['tijdstip', 'datum', 'voornaam', 'rol', 'status', 'vervanger'],
  Logboek: ['tijdstip', 'actie', 'details']
};

var STATUSSEN = ['open', 'gesloten', 'workshop', 'ander'];
var KEUZES = { graag: 'graag', kan: 'kan als het moet', niet: 'niet' };
var WEKEN = ['1ste', '2de', '3de', '4de', 'laatste'];
var DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
var MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
  'september', 'oktober', 'november', 'december'];

// Standaardwaarden voor het tabblad Instellingen: sleutel, waarde, uitleg.
// installeer() voegt enkel sleutels toe die nog ontbreken; bestaande waarden blijven staan.
function standaardInstellingen() {
  return [
    ['openingsdag', 'vrijdag', 'De dag waarop de bib open is (maandag tot zondag).'],
    ['beginuur', '18:00', 'Wanneer de bib opengaat.'],
    ['einduur', '21:00', 'Wanneer de bib sluit.'],
    ['aantal_vrijwilligers', 2, 'Hoeveel vrijwilligers er per avond nodig zijn: 1 of 2.'],
    ['aantal_backups', 1, 'Hoeveel back-ups er per avond nodig zijn: 0 of 1.'],
    ['backup_verplicht', 'nee', 'ja: een avond zonder back-up geeft een waarschuwing. nee: enkel een melding.'],
    ['standaard_max_shiften_per_maand', 2, 'Maximum aantal shiften voor wie "maakt niet uit" kiest.'],
    ['backup_telt_mee_voor_maximum', 'nee', 'ja: een back-up-beurt telt mee als shift voor het maximum.'],
    ['niet_twee_weken_na_elkaar', 'ja', 'ja: de tool vermijdt dat iemand twee weken na elkaar staat (als het kan).'],
    ['toegangscode_vrijwilligers', maakCode(), 'De code die je deelt in de WhatsApp-groep. Pas gerust aan.'],
    ['code_coordinator', maakCode(), 'De code voor de coördinator. Deel die niet in de groep.'],
    ['inschrijving_sluit', 7, 'Zoveel dagen voor het begin van de maand kan je niet meer invullen.'],
    ['afmelding_backup_valt_automatisch_in', 'nee', 'ja: bij een afmelding neemt de back-up meteen over. nee: de coördinator bevestigt.'],
    ['bewaartermijn_maanden', 12, 'Gegevens ouder dan zoveel maanden worden automatisch gewist (de Kalender-tabbladen blijven).'],
    ['minstens_een_ervaren_per_avond', 'nee', 'ja: minstens één vrijwilliger per avond staat als ervaren in het tabblad Vrijwilligers.'],
    ['tekst_welkom', 'Fijn dat je meehelpt in de bib! Duid hier aan wanneer je kan.', 'Welkomsttekst bovenaan de pagina.'],
    ['tekst_uitleg', 'Kies je naam en de maand. Duid per avond aan of je graag komt, kan als het moet, of niet kan. ' +
      'De coördinator maakt daarna het rooster. Kan je toch niet op een avond waarvoor je ingepland staat? Meld je dan af bij Rooster.',
      'Uitleg voor vrijwilligers.'],
    ['tekst_privacy', 'We bewaren enkel je voornaam en je keuzes: wanneer je kan, hoeveel shiften je wil, ' +
      'of je back-up wil zijn, met wie je graag samen staat en je opmerking. We gebruiken dat alleen om het rooster ' +
      'van de bib te maken. Na 12 maanden wissen we het automatisch. Vragen, of wil je dat we je gegevens wissen? ' +
      'Spreek de coördinator aan.', 'Privacymelding. Pas de termijn aan als je bewaartermijn_maanden wijzigt.']
  ];
}

// ---------------------------------------------------------------------------
// Installatie en menu
// ---------------------------------------------------------------------------

/** Maakt alle tabbladen en kolomkoppen. Mag je veilig opnieuw uitvoeren. */
function installeer() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(KOLOMMEN).forEach(function (naam) {
    var blad = ss.getSheetByName(naam) || ss.insertSheet(naam);
    var koppen = KOLOMMEN[naam];
    blad.getRange(1, 1, 1, koppen.length).setValues([koppen]).setFontWeight('bold');
    blad.setFrozenRows(1);
  });

  // Datums als tekst bewaren, zodat Google ze niet omzet.
  zetTekstKolom(TAB.avonden, 1);
  zetTekstKolom(TAB.beschikbaarheid, 1);
  zetTekstKolom(TAB.rooster, 1);
  zetTekstKolom(TAB.afmeldingen, 2);

  // Instellingen: ontbrekende sleutels toevoegen.
  var inst = blad(TAB.instellingen);
  var bestaand = leesRijen(TAB.instellingen).map(function (r) { return String(r[0]).trim(); });
  standaardInstellingen().forEach(function (rij) {
    if (bestaand.indexOf(rij[0]) < 0) inst.appendRow(rij);
  });
  inst.getRange('B:B').setNumberFormat('@');
  inst.setColumnWidth(1, 260);
  inst.setColumnWidth(2, 320);
  inst.setColumnWidth(3, 520);
  inst.getRange('B:C').setWrap(true);

  // Avonden: het blok met terugkerende events in kolom F en G.
  var av = blad(TAB.avonden);
  av.getRange('F1:G1').setValues([['terugkerend: week van de maand', 'event']]).setFontWeight('bold');
  var huidig = av.getRange('F2:F6').getValues();
  WEKEN.forEach(function (w, i) { if (!huidig[i][0]) av.getRange(2 + i, 6).setValue(w); });
  av.setColumnWidth(3, 240);
  av.setColumnWidth(6, 220);
  av.setColumnWidth(7, 240);

  blad(TAB.rooster).setColumnWidth(5, 480);
  blad(TAB.beschikbaarheid).setColumnWidth(3, 420);

  // Eén keer per dag oude gegevens opruimen.
  var heeftTrigger = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'opruimen';
  });
  if (!heeftTrigger) ScriptApp.newTrigger('opruimen').timeBased().everyDays(1).atHour(3).create();

  var standaard = ss.getSheetByName('Blad1') || ss.getSheetByName('Sheet1');
  if (standaard && standaard.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(standaard);

  log('installeer', 'Tabbladen aangemaakt of bijgewerkt.');
  Logger.log('Klaar. De codes staan in het tabblad Instellingen.');
}

/** Voegt een menu "Rooster" toe aan de spreadsheet. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Rooster')
    .addItem('Tabbladen installeren of herstellen', 'installeer')
    .addItem('Oude gegevens nu opruimen', 'opruimen')
    .addToUi();
}

/** Schrijft een regel in het logboek als iemand de instellingen met de hand wijzigt. */
function onEdit(e) {
  try {
    var blad = e.range.getSheet();
    if (blad.getName() !== TAB.instellingen || e.range.getRow() < 2) return;
    var sleutel = String(blad.getRange(e.range.getRow(), 1).getValue());
    var waarde = /code/.test(sleutel) ? '(code gewijzigd)' : String(e.range.getValue());
    log('instellingen gewijzigd', sleutel + ': ' + waarde);
  } catch (fout) {
    // Een fout in het logboek mag het bewerken niet hinderen.
  }
}

// ---------------------------------------------------------------------------
// De web-app: alle vragen van de webtool komen hier binnen
// ---------------------------------------------------------------------------

/** Om te testen: open de URL van de web-app in je browser. */
function doGet() {
  return json({ ok: true, bericht: 'De roosterserver werkt.' });
}

function doPost(e) {
  var antwoord;
  try {
    var vraag = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    antwoord = verwerk(vraag);
  } catch (fout) {
    if (fout && fout.voorGebruiker) {
      antwoord = { ok: false, fout: fout.message };
    } else {
      console.error(fout);
      antwoord = { ok: false, fout: 'Er ging iets mis bij het opslaan. Probeer het straks opnieuw.' };
    }
  }
  return json(antwoord);
}

function json(gegevens) {
  return ContentService.createTextOutput(JSON.stringify(gegevens)).setMimeType(ContentService.MimeType.JSON);
}

// Een fout die de gebruiker te zien krijgt.
function weiger(boodschap) {
  var f = new Error(boodschap);
  f.voorGebruiker = true;
  throw f;
}

var ACTIES_VRIJWILLIGER = {
  start: actieStart,
  maand: actieMaand,
  mijnBeschikbaarheid: actieMijnBeschikbaarheid,
  bewaarBeschikbaarheid: actieBewaarBeschikbaarheid,
  afmelden: actieAfmelden
};
var ACTIES_COORDINATOR = {
  coordMaand: actieCoordMaand,
  bewaarAvonden: actieBewaarAvonden,
  keurNaamGoed: actieKeurNaamGoed,
  weigerNaam: actieWeigerNaam,
  bewaarRooster: actieBewaarRooster,
  verwerkAfmelding: actieVerwerkAfmelding
};

function verwerk(vraag) {
  if (!vraag || typeof vraag !== 'object') weiger('Ongeldige vraag.');
  var inst = leesInstellingen();
  var rol = bepaalRol(vraag.code, inst);
  if (!rol) return { ok: false, codeFout: true, fout: 'Deze code klopt niet. Kijk de code nog eens na in de WhatsApp-groep.' };
  var actie = String(vraag.actie || '');
  var functie = ACTIES_VRIJWILLIGER[actie] || (rol === 'coordinator' ? ACTIES_COORDINATOR[actie] : null);
  if (!functie) weiger(ACTIES_COORDINATOR[actie] ? 'Hiervoor heb je de code van de coördinator nodig.' : 'Onbekende actie.');
  var schrijft = actie !== 'start' && actie !== 'maand' && actie !== 'mijnBeschikbaarheid' && actie !== 'coordMaand';
  if (!schrijft) return functie(vraag, inst, rol);
  // Bij schrijven: één tegelijk, zodat twee mensen elkaar niet overschrijven.
  var slot = LockService.getScriptLock();
  slot.waitLock(20000);
  try {
    return functie(vraag, inst, rol);
  } finally {
    slot.releaseLock();
  }
}

// De codes zijn een eenvoudige drempel, geen echte beveiliging.
function bepaalRol(code, inst) {
  var c = String(code || '').trim().toLowerCase();
  if (!c || c.length > 100) return null;
  if (c === String(inst.code_coordinator || '').trim().toLowerCase()) return 'coordinator';
  if (c === String(inst.toegangscode_vrijwilligers || '').trim().toLowerCase()) return 'vrijwilliger';
  return null;
}

// ---------------------------------------------------------------------------
// Acties voor vrijwilligers
// ---------------------------------------------------------------------------

function actieStart(vraag, inst, rol) {
  return {
    ok: true,
    rol: rol,
    namen: actieveNamen(),
    teksten: { welkom: inst.tekst_welkom || '', uitleg: inst.tekst_uitleg || '', privacy: inst.tekst_privacy || '' },
    instellingen: publiekeInstellingen(inst)
  };
}

function actieMaand(vraag, inst) {
  var maand = controleerMaand(vraag.maand);
  var avonden = avondenVoorMaand(maand, inst);
  var rooster = roosterVoorMaand(maand);
  var gepubliceerd = rooster.length > 0 && rooster.every(function (r) { return r.status === 'gepubliceerd'; });
  var afgemeld = leesAfmeldingen().filter(function (a) {
    return a.datum.slice(0, 7) === maand && a.status === 'open';
  });
  return {
    ok: true,
    maand: maand,
    avonden: avonden,
    inschrijving: inschrijving(maand, inst),
    rooster: gepubliceerd ? rooster.map(function (r) {
      return {
        datum: r.datum,
        vrijwilligers: r.vrijwilligers,
        backups: r.backups,
        afgemeld: afgemeld.filter(function (a) { return a.datum === r.datum; }).map(function (a) { return a.naam; })
      };
    }) : null
  };
}

function actieMijnBeschikbaarheid(vraag) {
  var maand = controleerMaand(vraag.maand);
  var naam = normaliseerNaam(vraag.naam);
  var gevonden = zoekVrijwilliger(naam);
  if (gevonden) naam = gevonden.naam;
  var b = leesBeschikbaarheden(maand).filter(function (x) { return sleutelVan(x.naam) === sleutelVan(naam); })[0];
  return { ok: true, gevonden: !!b, beschikbaarheid: b || null };
}

function actieBewaarBeschikbaarheid(vraag, inst, rol) {
  var maand = controleerMaand(vraag.maand);
  if (rol !== 'coordinator' && !inschrijving(maand, inst).open) {
    weiger('Invullen voor ' + maandTekst(maand) + ' kan niet meer. Spreek de coördinator aan.');
  }
  var naam = normaliseerNaam(vraag.naam);
  if (!naam) weiger('Kies je naam of typ je voornaam.');

  // De keuzes per open avond.
  var avonden = avondenVoorMaand(maand, inst).filter(function (a) { return a.status === 'open'; });
  var keuzes = vraag.keuzes || {};
  var schoon = {};
  avonden.forEach(function (a) {
    var k = keuzes[a.datum];
    if (!KEUZES[k]) weiger('Duid voor elke open avond iets aan.');
    schoon[a.datum] = k;
  });

  var max = vraag.max;
  if (max !== 'maakt niet uit') {
    max = Number(max);
    if ([1, 2, 3, 4].indexOf(max) < 0) weiger('Kies hoeveel shiften je wil doen.');
  }
  if (typeof vraag.backup !== 'boolean') weiger('Duid aan of je back-up wil zijn.');
  var opmerking = schoneTekst(vraag.opmerking, 500);

  // De naam: een bestaande vrijwilliger, of een nieuwe naam die op goedkeuring wacht.
  var v = zoekVrijwilliger(naam);
  var nieuw = false;
  if (v) {
    naam = v.naam;
    if (v.actief === 'nee') {
      blad(TAB.vrijwilligers).getRange(v.rij, 2).setValue('nieuw');
      nieuw = true;
    } else if (v.actief === 'nieuw') {
      nieuw = true;
    }
  } else {
    blad(TAB.vrijwilligers).appendRow([veilig(naam), 'nieuw', 'nee', '']);
    log('nieuwe naam', naam);
    nieuw = true;
  }

  var samenMet = '';
  if (vraag.samenMet) {
    var s = zoekVrijwilliger(normaliseerNaam(vraag.samenMet));
    if (!s || s.actief !== 'ja') weiger('Kies iemand uit de lijst bij "graag samen met".');
    if (s.naam !== naam) samenMet = s.naam;
  }

  // Bestaat er al een keuze voor deze maand? Dan enkel overschrijven na bevestiging.
  var bladB = blad(TAB.beschikbaarheid);
  var bestaand = leesBeschikbaarheden(maand).filter(function (x) { return sleutelVan(x.naam) === sleutelVan(naam); })[0];
  if (bestaand && vraag.overschrijf !== true) {
    return { ok: false, bestaatAl: true, beschikbaarheid: bestaand };
  }
  var rij = [
    maand,
    veilig(naam),
    avonden.map(function (a) { return a.datum + ': ' + KEUZES[schoon[a.datum]]; }).join('; '),
    max === 'maakt niet uit' ? 'maakt niet uit' : max,
    vraag.backup ? 'ja' : 'nee',
    veilig(samenMet),
    veilig(opmerking),
    nu()
  ];
  if (bestaand) bladB.getRange(bestaand.rij, 1, 1, rij.length).setValues([rij]);
  else bladB.appendRow(rij);
  return { ok: true, naam: naam, nieuweNaam: nieuw };
}

function actieAfmelden(vraag, inst) {
  var datum = controleerDatum(vraag.datum);
  var naam = normaliseerNaam(vraag.naam);
  if (datum < vandaag()) weiger('Deze avond is al voorbij.');
  var r = roosterVoorMaand(datum.slice(0, 7)).filter(function (x) { return x.datum === datum; })[0];
  if (!r || r.status !== 'gepubliceerd') weiger('Er is nog geen rooster voor deze avond.');
  var rol = r.vrijwilligers.some(function (n) { return sleutelVan(n) === sleutelVan(naam); }) ? 'vrijwilliger'
    : r.backups.some(function (n) { return sleutelVan(n) === sleutelVan(naam); }) ? 'back-up' : '';
  if (!rol) weiger('Je staat niet ingepland op deze avond.');
  naam = r.vrijwilligers.concat(r.backups).filter(function (n) { return sleutelVan(n) === sleutelVan(naam); })[0];
  var al = leesAfmeldingen().some(function (a) { return a.datum === datum && a.naam === naam && a.status === 'open'; });
  if (al) weiger('Je afmelding voor deze avond is al doorgegeven.');

  var automatisch = jaNee(inst.afmelding_backup_valt_automatisch_in) && rol === 'vrijwilliger' && r.backups.length > 0;
  var vervanger = automatisch ? r.backups[0] : '';
  blad(TAB.afmeldingen).appendRow([nu(), datum, veilig(naam), rol, automatisch ? 'verwerkt' : 'open', veilig(vervanger)]);
  if (automatisch) {
    vervangInRooster(r, naam, vervanger);
    maakKalender(datum.slice(0, 7));
  }
  log('afmelding', naam + ' voor ' + datum + (automatisch ? ', back-up ' + vervanger + ' valt in' : ''));
  return { ok: true, automatisch: automatisch, vervanger: vervanger };
}

// ---------------------------------------------------------------------------
// Acties voor de coördinator
// ---------------------------------------------------------------------------

function actieCoordMaand(vraag, inst) {
  var maand = controleerMaand(vraag.maand);
  return {
    ok: true,
    maand: maand,
    avonden: avondenVoorMaand(maand, inst),
    terugkerend: leesTerugkerend(),
    vrijwilligers: leesVrijwilligers().map(function (v) {
      return { naam: v.naam, actief: v.actief, ervaren: v.ervaren, opmerking: v.opmerking };
    }),
    beschikbaarheden: leesBeschikbaarheden(maand).map(function (b) { delete b.rij; return b; }),
    rooster: roosterVoorMaand(maand).map(function (r) { delete r.rij; return r; }),
    afmeldingen: leesAfmeldingen().filter(function (a) { return a.datum.slice(0, 7) === maand; })
      .map(function (a) { delete a.rij; return a; }),
    inschrijving: inschrijving(maand, inst),
    instellingen: publiekeInstellingen(inst)
  };
}

function actieBewaarAvonden(vraag, inst) {
  var maand = controleerMaand(vraag.maand);
  var data = datumsVanMaand(maand, inst);
  var lijst = Array.isArray(vraag.avonden) ? vraag.avonden : weiger('Geen avonden ontvangen.');
  var rijen = lijst.map(function (a) {
    var datum = controleerDatum(a.datum);
    if (data.indexOf(datum) < 0) weiger(datum + ' is geen openingsdag in ' + maandTekst(maand) + '.');
    if (STATUSSEN.indexOf(a.status) < 0) weiger('Onbekende status: ' + a.status);
    return [datum, a.status, veilig(schoneTekst(a.event, 100))];
  });
  vervangMaandRijen(TAB.avonden, 3, maand, rijen);
  log('avonden bewaard', maandTekst(maand));
  return { ok: true };
}

function actieKeurNaamGoed(vraag) {
  var v = zoekVrijwilliger(normaliseerNaam(vraag.naam));
  if (!v || v.actief !== 'nieuw') weiger('Deze naam wacht niet op goedkeuring.');
  var juist = normaliseerNaam(vraag.juisteNaam || v.naam);
  if (!juist) weiger('Vul een naam in.');
  var ander = zoekVrijwilliger(juist);
  var bladV = blad(TAB.vrijwilligers);
  if (ander && ander.rij !== v.rij) {
    // De naam bestaat al: samenvoegen met de bestaande vrijwilliger.
    // Had die zelf al ingevuld voor een maand, dan blijft die eigen keuze staan.
    var alle = leesBeschikbaarhedenAlle();
    var bladB = blad(TAB.beschikbaarheid);
    alle.filter(function (b) {
      return b.naam === v.naam && alle.some(function (x) { return x.naam === ander.naam && x.maand === b.maand; });
    }).sort(function (a, b) { return b.rij - a.rij; })
      .forEach(function (b) { bladB.deleteRow(b.rij); });
    hernoemBeschikbaarheid(v.naam, ander.naam);
    if (ander.actief !== 'ja') bladV.getRange(ander.rij, 2).setValue('ja');
    bladV.deleteRow(v.rij);
    log('naam samengevoegd', v.naam + ' → ' + ander.naam);
    return { ok: true, naam: ander.naam };
  }
  bladV.getRange(v.rij, 1, 1, 2).setValues([[veilig(juist), 'ja']]);
  if (juist !== v.naam) hernoemBeschikbaarheid(v.naam, juist);
  log('naam goedgekeurd', juist);
  return { ok: true, naam: juist };
}

function actieWeigerNaam(vraag) {
  var v = zoekVrijwilliger(normaliseerNaam(vraag.naam));
  if (!v || v.actief !== 'nieuw') weiger('Deze naam wacht niet op goedkeuring.');
  var bladB = blad(TAB.beschikbaarheid);
  leesBeschikbaarhedenAlle().filter(function (b) { return b.naam === v.naam; })
    .sort(function (a, b) { return b.rij - a.rij; })
    .forEach(function (b) { bladB.deleteRow(b.rij); });
  blad(TAB.vrijwilligers).deleteRow(v.rij);
  log('naam geweigerd', v.naam);
  return { ok: true };
}

function actieBewaarRooster(vraag, inst) {
  var maand = controleerMaand(vraag.maand);
  var publiceer = vraag.publiceer === true;
  var avonden = avondenVoorMaand(maand, inst);
  var aantalV = Math.min(2, getal(inst.aantal_vrijwilligers, 2));
  var aantalB = Math.min(1, getal(inst.aantal_backups, 1));
  function controleerNaam(n) {
    n = normaliseerNaam(n);
    if (!n) return '';
    return actieveVrijwilliger(n).naam;
  }
  var lijst = Array.isArray(vraag.rijen) ? vraag.rijen : weiger('Geen rooster ontvangen.');
  var status = publiceer ? 'gepubliceerd' : 'voorstel';
  var rijen = lijst.map(function (r) {
    var datum = controleerDatum(r.datum);
    var avond = avonden.filter(function (a) { return a.datum === datum; })[0];
    if (!avond) weiger(datum + ' is geen openingsdag in ' + maandTekst(maand) + '.');
    var v = (r.vrijwilligers || []).map(controleerNaam).filter(Boolean);
    var b = (r.backups || []).map(controleerNaam).filter(Boolean);
    if (v.length > aantalV || b.length > aantalB) weiger('Te veel namen op ' + datum + '.');
    var alle = v.concat(b);
    if (alle.some(function (n, i) { return alle.indexOf(n) !== i; })) weiger('Iemand staat twee keer op ' + datum + '.');
    if (avond.status !== 'open' && alle.length) weiger('Op ' + datum + ' is de bib niet open.');
    return [datum, v[0] || '', v[1] || '', b[0] || '', veilig(schoneTekst(r.motivatie, 1000)), status, nu()];
  });
  vervangMaandRijen(TAB.rooster, 7, maand, rijen);
  if (publiceer) maakKalender(maand);
  log(publiceer ? 'rooster gepubliceerd' : 'voorstel bewaard', maandTekst(maand));
  return { ok: true, status: status };
}

function actieVerwerkAfmelding(vraag) {
  var datum = controleerDatum(vraag.datum);
  var sleutel = sleutelVan(normaliseerNaam(vraag.naam));
  var afm = leesAfmeldingen().filter(function (a) {
    return a.datum === datum && sleutelVan(a.naam) === sleutel && a.status === 'open';
  })[0];
  if (!afm) weiger('Deze afmelding is al verwerkt.');
  var naam = afm.naam;
  var vervanger = normaliseerNaam(vraag.vervanger || '');
  if (vervanger) vervanger = actieveVrijwilliger(vervanger).naam;
  var r = roosterVoorMaand(datum.slice(0, 7)).filter(function (x) { return x.datum === datum; })[0];
  if (!r) weiger('Er is geen rooster voor deze avond.');
  if (vervanger && r.vrijwilligers.concat(r.backups).indexOf(vervanger) >= 0 && r.backups.indexOf(vervanger) < 0) {
    weiger(vervanger + ' staat al op deze avond.');
  }
  vervangInRooster(r, naam, vervanger);
  blad(TAB.afmeldingen).getRange(afm.rij, 5, 1, 2).setValues([['verwerkt', veilig(vervanger)]]);
  if (r.status === 'gepubliceerd') maakKalender(datum.slice(0, 7));
  log('afmelding verwerkt', naam + ' op ' + datum + (vervanger ? ', vervangen door ' + vervanger : ', niet vervangen'));
  return { ok: true };
}

// Zet de vervanger op de plaats van wie zich afmeldde. Was de vervanger de back-up,
// dan wordt de plaats van back-up leeg.
function vervangInRooster(r, naam, vervanger) {
  var bladR = blad(TAB.rooster);
  var waarden = bladR.getRange(r.rij, 2, 1, 3).getValues()[0];
  var i = waarden.map(String).indexOf(naam);
  if (i < 0) weiger(naam + ' staat niet (meer) op deze avond.');
  if (vervanger && String(waarden[2]) === vervanger) waarden[2] = '';
  waarden[i] = vervanger;
  bladR.getRange(r.rij, 2, 1, 3).setValues([waarden]);
  bladR.getRange(r.rij, 7).setValue(nu());
}

// ---------------------------------------------------------------------------
// Het tabblad Kalender, in dezelfde vorm als het oude rooster
// ---------------------------------------------------------------------------

function maakKalender(maand) {
  var inst = leesInstellingen();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var naam = 'Kalender ' + maandTekst(maand);
  var k = ss.getSheetByName(naam) || ss.insertSheet(naam);
  k.clear();

  var avonden = {};
  avondenVoorMaand(maand, inst).forEach(function (a) { avonden[a.datum] = a; });
  var rooster = {};
  roosterVoorMaand(maand).forEach(function (r) { rooster[r.datum] = r; });

  var jaar = +maand.slice(0, 4), m = +maand.slice(5, 7);
  var dagenInMaand = new Date(jaar, m, 0).getDate();
  var eersteDag = (new Date(jaar, m - 1, 1).getDay() + 6) % 7; // 0 = maandag
  var rijen = [[maandTekst(maand), '', '', '', '', '', '', ''],
    ['', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag']];
  var datumRijen = [];
  for (var start = 1 - eersteDag; start <= dagenInMaand; start += 7) {
    var dagRij = [''], events = ['events'], bib = ['bib'], backup = ['backup'];
    for (var i = 0; i < 7; i++) {
      var dag = start + i;
      var binnen = dag >= 1 && dag <= dagenInMaand;
      var datum = binnen ? maand + '-' + ('0' + dag).slice(-2) : '';
      dagRij.push(binnen ? dag : '');
      var a = avonden[datum], r = rooster[datum];
      events.push(a ? (a.status === 'open' ? a.event : hoofdletter(a.status) + (a.event ? ': ' + a.event : '')) : '');
      bib.push(a && r ? r.vrijwilligers.join(' & ') : '');
      backup.push(a && r ? r.backups.join(' & ') : '');
    }
    datumRijen.push(rijen.length + 1);
    rijen.push(dagRij, events, bib, backup);
  }
  k.getRange(1, 1, rijen.length, 8).setValues(rijen);
  k.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  k.getRange(2, 1, 1, 8).setFontWeight('bold');
  datumRijen.forEach(function (r) { k.getRange(r, 1, 1, 8).setFontWeight('bold').setBackground('#eeeeee'); });
  k.getRange(2, 1, rijen.length - 1, 8).setBorder(true, true, true, true, true, true).setWrap(true).setVerticalAlignment('top');
  k.setColumnWidth(1, 80);
  for (var c = 2; c <= 8; c++) k.setColumnWidth(c, 140);
  k.getRange(2, 1, rijen.length - 1, 1).setFontStyle('italic');
}

// ---------------------------------------------------------------------------
// Oude gegevens wissen
// ---------------------------------------------------------------------------

/** Wist gegevens ouder dan bewaartermijn_maanden. Draait elke nacht vanzelf. */
function opruimen() {
  var inst = leesInstellingen();
  var maanden = getal(inst.bewaartermijn_maanden, 12);
  if (maanden < 1) return;
  var d = new Date();
  var grens = new Date(d.getFullYear(), d.getMonth() - maanden, 1);
  var grensTekst = Utilities.formatDate(grens, tijdzone(), 'yyyy-MM-dd');
  var gewist = 0;
  [[TAB.beschikbaarheid, 0], [TAB.avonden, 0], [TAB.rooster, 0], [TAB.afmeldingen, 1], [TAB.logboek, 0]].forEach(function (x) {
    gewist += bewaarRijen(x[0], function (r) {
      var w = alsDatumTekst(r[x[1]]);
      if (w.length === 7) w += '-01';
      return w.slice(0, 10) >= grensTekst;
    });
  });
  if (gewist) log('opgeruimd', gewist + ' oude rijen gewist (ouder dan ' + grensTekst + ').');
}

// ---------------------------------------------------------------------------
// Lezen uit de spreadsheet
// ---------------------------------------------------------------------------

function blad(naam) {
  var b = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(naam);
  if (!b) weiger('Het tabblad ' + naam + ' ontbreekt. Voer installeer() uit.');
  return b;
}

// Alle rijen onder de kolomkoppen, als lijsten.
function leesRijen(naam) {
  var b = blad(naam);
  var n = b.getLastRow() - 1;
  if (n < 1) return [];
  return b.getRange(2, 1, n, KOLOMMEN[naam].length).getValues();
}

function leesInstellingen() {
  var uit = {};
  leesRijen(TAB.instellingen).forEach(function (r) {
    var k = String(r[0]).trim();
    if (k) uit[k] = alsTekst(r[1]);
  });
  return uit;
}

function publiekeInstellingen(inst) {
  return {
    openingsdag: openingsdag(inst),
    beginuur: inst.beginuur || '',
    einduur: inst.einduur || '',
    aantalVrijwilligers: Math.min(2, Math.max(1, getal(inst.aantal_vrijwilligers, 2))),
    aantalBackups: Math.min(1, Math.max(0, getal(inst.aantal_backups, 1))),
    standaardMax: getal(inst.standaard_max_shiften_per_maand, 2),
    backupVerplicht: jaNee(inst.backup_verplicht),
    backupTeltMee: jaNee(inst.backup_telt_mee_voor_maximum),
    nietTweeWekenNaElkaar: jaNee(inst.niet_twee_weken_na_elkaar),
    minstensEenErvaren: jaNee(inst.minstens_een_ervaren_per_avond),
    automatischBackup: jaNee(inst.afmelding_backup_valt_automatisch_in)
  };
}

function leesVrijwilligers() {
  return leesRijen(TAB.vrijwilligers).map(function (r, i) {
    var actief = String(r[1]).trim().toLowerCase();
    return {
      rij: i + 2,
      naam: String(r[0]).replace(/\s+/g, ' ').trim(),
      actief: actief === 'nieuw' ? 'nieuw' : jaNee(actief) ? 'ja' : 'nee',
      ervaren: jaNee(r[2]),
      opmerking: String(r[3] || '')
    };
  }).filter(function (v) { return v.naam; });
}

function actieveNamen() {
  return leesVrijwilligers().filter(function (v) { return v.actief === 'ja'; })
    .map(function (v) { return v.naam; })
    .sort(function (a, b) { return a.localeCompare(b, 'nl'); });
}

// Geeft de actieve vrijwilliger met deze naam, of weigert.
function actieveVrijwilliger(naam) {
  var v = zoekVrijwilliger(naam);
  if (!v || v.actief !== 'ja') weiger(naam + ' staat niet in de lijst van actieve vrijwilligers.');
  return v;
}

function zoekVrijwilliger(naam) {
  var s = sleutelVan(naam);
  return leesVrijwilligers().filter(function (v) { return sleutelVan(v.naam) === s; })[0] || null;
}

function leesTerugkerend() {
  var waarden = blad(TAB.avonden).getRange('F2:G6').getValues();
  var uit = {};
  WEKEN.forEach(function (w, i) { uit[w] = String(waarden[i][1] || '').trim(); });
  return uit;
}

// De avonden van een maand: wat bewaard is, aangevuld met standaardwaarden.
function avondenVoorMaand(maand, inst) {
  var bewaard = {};
  leesRijen(TAB.avonden).forEach(function (r) {
    var d = alsDatumTekst(r[0]);
    if (d.slice(0, 7) === maand) {
      var s = String(r[1]).trim().toLowerCase();
      bewaard[d] = { datum: d, status: STATUSSEN.indexOf(s) >= 0 ? s : 'open', event: String(r[2] || '').trim() };
    }
  });
  var terug = leesTerugkerend();
  var jaar = +maand.slice(0, 4), m = +maand.slice(5, 7);
  var dagenInMaand = new Date(jaar, m, 0).getDate();
  return datumsVanMaand(maand, inst).map(function (d) {
    if (bewaard[d]) return bewaard[d];
    var dag = +d.slice(8, 10);
    var week = Math.ceil(dag / 7);
    var laatste = dag + 7 > dagenInMaand;
    var event = laatste && terug.laatste ? terug.laatste : week <= 4 ? terug[WEKEN[week - 1]] : '';
    return { datum: d, status: 'open', event: event || '' };
  });
}

// Alle openingsdagen (standaard: vrijdagen) van een maand.
function datumsVanMaand(maand, inst) {
  var dagIndex = DAGEN.indexOf(openingsdag(inst));
  var jaar = +maand.slice(0, 4), m = +maand.slice(5, 7);
  var uit = [];
  for (var dag = 1; dag <= new Date(jaar, m, 0).getDate(); dag++) {
    if (new Date(jaar, m - 1, dag).getDay() === dagIndex) uit.push(maand + '-' + ('0' + dag).slice(-2));
  }
  return uit;
}

function openingsdag(inst) {
  var d = String(inst.openingsdag || 'vrijdag').trim().toLowerCase();
  return DAGEN.indexOf(d) >= 0 ? d : 'vrijdag';
}

function leesBeschikbaarhedenAlle() {
  var labels = {};
  Object.keys(KEUZES).forEach(function (k) { labels[KEUZES[k]] = k; });
  return leesRijen(TAB.beschikbaarheid).map(function (r, i) {
    var keuzes = {};
    String(r[2] || '').split(';').forEach(function (deel) {
      var m = deel.trim().match(/^(\d{4}-\d{2}-\d{2}):\s*(.+)$/);
      if (m && labels[m[2].trim()]) keuzes[m[1]] = labels[m[2].trim()];
    });
    var max = String(r[3]).trim();
    return {
      rij: i + 2,
      maand: alsDatumTekst(r[0]).slice(0, 7),
      naam: String(r[1]).replace(/\s+/g, ' ').trim(),
      keuzes: keuzes,
      max: /^\d+$/.test(max) ? Number(max) : null,
      backup: jaNee(r[4]),
      samenMet: String(r[5] || '').trim(),
      opmerking: String(r[6] || ''),
      ingevuld: alsTekst(r[7])
    };
  });
}

function leesBeschikbaarheden(maand) {
  return leesBeschikbaarhedenAlle().filter(function (b) { return b.maand === maand; });
}

function hernoemBeschikbaarheid(oud, nieuw) {
  var bladB = blad(TAB.beschikbaarheid);
  leesBeschikbaarhedenAlle().forEach(function (b) {
    if (b.naam === oud) bladB.getRange(b.rij, 2).setValue(veilig(nieuw));
    if (b.samenMet === oud) bladB.getRange(b.rij, 6).setValue(veilig(nieuw));
  });
}

function roosterVoorMaand(maand) {
  return leesRijen(TAB.rooster).map(function (r, i) {
    return {
      rij: i + 2,
      datum: alsDatumTekst(r[0]),
      vrijwilligers: [String(r[1]).trim(), String(r[2]).trim()].filter(Boolean),
      backups: [String(r[3]).trim()].filter(Boolean),
      motivatie: String(r[4] || ''),
      status: String(r[5]).trim() === 'gepubliceerd' ? 'gepubliceerd' : 'voorstel'
    };
  }).filter(function (r) { return r.datum.slice(0, 7) === maand; });
}

function leesAfmeldingen() {
  return leesRijen(TAB.afmeldingen).map(function (r, i) {
    return {
      rij: i + 2,
      tijdstip: alsTekst(r[0]),
      datum: alsDatumTekst(r[1]),
      naam: String(r[2]).trim(),
      rol: String(r[3]).trim(),
      status: String(r[4]).trim() === 'verwerkt' ? 'verwerkt' : 'open',
      vervanger: String(r[5] || '').trim()
    };
  });
}

// Vervangt alle rijen van één maand in een tabblad door nieuwe rijen.
function vervangMaandRijen(naam, breedte, maand, nieuweRijen) {
  var b = blad(naam);
  var oud = leesRijen(naam).map(function (r) { return r.slice(0, breedte); });
  var blijven = oud.filter(function (r) {
    var d = alsDatumTekst(r[0]);
    return d && d.slice(0, 7) !== maand;
  }).map(function (r) { r[0] = alsDatumTekst(r[0]); return r; });
  var alles = blijven.concat(nieuweRijen).sort(function (x, y) { return x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0; });
  if (oud.length) b.getRange(2, 1, oud.length, breedte).clearContent();
  if (alles.length) b.getRange(2, 1, alles.length, breedte).setValues(alles);
}

// Houdt enkel de rijen waarvoor houden(rij) waar is; lege rijen verdwijnen.
// Herschrijft enkel de eigen kolommen (in Avonden blijft het blok in F en G staan).
// Geeft het aantal gewiste rijen terug.
function bewaarRijen(naam, houden) {
  var b = blad(naam);
  var breedte = KOLOMMEN[naam].length;
  var oud = leesRijen(naam).filter(function (r) { return String(r[0]).trim() !== ''; });
  var blijven = oud.filter(houden);
  if (blijven.length === oud.length) return 0;
  var n = b.getLastRow() - 1;
  if (n > 0) b.getRange(2, 1, n, breedte).clearContent();
  if (blijven.length) b.getRange(2, 1, blijven.length, breedte).setValues(blijven);
  return oud.length - blijven.length;
}

// ---------------------------------------------------------------------------
// Hulpfuncties
// ---------------------------------------------------------------------------

function log(actie, details) {
  try {
    blad(TAB.logboek).appendRow([nu(), actie, veilig(String(details || ''))]);
  } catch (fout) {
    console.error(fout);
  }
}

function tijdzone() { return Session.getScriptTimeZone() || 'Europe/Brussels'; }
function nu() { return Utilities.formatDate(new Date(), tijdzone(), 'yyyy-MM-dd HH:mm'); }
function vandaag() { return Utilities.formatDate(new Date(), tijdzone(), 'yyyy-MM-dd'); }

function alsTekst(w) {
  if (w instanceof Date) return Utilities.formatDate(w, tijdzone(), 'yyyy-MM-dd HH:mm');
  return String(w == null ? '' : w).trim();
}

function alsDatumTekst(w) {
  if (w instanceof Date) return Utilities.formatDate(w, tijdzone(), 'yyyy-MM-dd');
  return String(w == null ? '' : w).trim();
}

function zetTekstKolom(naam, kolom) {
  blad(naam).getRange(1, kolom, blad(naam).getMaxRows(), 1).setNumberFormat('@');
}

function jaNee(w) { return /^(ja|j|yes|y|true|waar|x)$/i.test(String(w == null ? '' : w).trim()); }

function getal(w, standaard) {
  var n = Number(String(w).replace(',', '.'));
  return String(w).trim() !== '' && isFinite(n) ? n : standaard;
}

function hoofdletter(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

function maandTekst(maand) { return MAANDEN[+maand.slice(5, 7) - 1] + ' ' + maand.slice(0, 4); }

function controleerMaand(w) {
  var m = String(w || '');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) weiger('Ongeldige maand.');
  return m;
}

function controleerDatum(w) {
  var d = String(w || '');
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d)) weiger('Ongeldige datum.');
  return d;
}

// Tot wanneer je kan invullen: de eerste dag van de maand min inschrijving_sluit dagen.
function inschrijving(maand, inst) {
  var dagen = Math.max(0, getal(inst.inschrijving_sluit, 7));
  var d = new Date(+maand.slice(0, 4), +maand.slice(5, 7) - 1, 1 - dagen);
  var laatsteDag = Utilities.formatDate(d, tijdzone(), 'yyyy-MM-dd');
  return { open: vandaag() <= laatsteDag, laatsteDag: laatsteDag };
}

// Maakt een naam netjes: spaties weg en elke naam met een hoofdletter.
function normaliseerNaam(t) {
  t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t.length > 40) weiger('Die naam is te lang. Typ enkel je voornaam.');
  if (!/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u.test(t)) weiger('Typ enkel je voornaam, zonder cijfers of tekens.');
  return t.split(' ').map(function (w) { return w.charAt(0).toLocaleUpperCase('nl') + w.slice(1); }).join(' ');
}

// Om namen te vergelijken, los van hoofdletters en spaties.
function sleutelVan(naam) { return String(naam || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('nl'); }

function schoneTekst(t, max) {
  t = String(t == null ? '' : t).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (t.length > max) weiger('Je tekst is te lang (maximum ' + max + ' tekens).');
  return t;
}

// Voorkomt dat tekst als formule in de spreadsheet terechtkomt.
function veilig(t) {
  t = String(t == null ? '' : t);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

// Een eenvoudige code zoals "boek-4821".
function maakCode() {
  var woorden = ['boek', 'blad', 'kaft', 'regenboog', 'lezer', 'verhaal', 'gedicht', 'atlas'];
  return woorden[Math.floor(Math.random() * woorden.length)] + '-' + (1000 + Math.floor(Math.random() * 9000));
}
