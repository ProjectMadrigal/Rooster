/*
 * Tests voor roosterregels.js, met verzonnen namen.
 * Draaien met Node:      node tests/roosterregels.test.js
 * Of in de browser:      open tests/index.html
 */
(function () {
  'use strict';
  var R = typeof require === 'function' ? require('../roosterregels.js') : window.Roosterregels;
  var resultaten = [];

  function test(naam, fn) {
    try { fn(); resultaten.push({ naam: naam, ok: true }); }
    catch (e) { resultaten.push({ naam: naam, ok: false, fout: e.message }); }
  }
  function verwacht(voorwaarde, boodschap) { if (!voorwaarde) throw new Error(boodschap); }

  // Vier vrijdagen in november 2026.
  var DATA = ['2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27'];
  function avonden() { return DATA.map(function (d) { return { datum: d, status: 'open', event: '' }; }); }
  function overal(keuze) { var k = {}; DATA.forEach(function (d) { k[d] = keuze; }); return k; }
  function persoon(naam, extra) {
    var p = { naam: naam, keuzes: overal('graag'), max: 2, samenMet: '' };
    for (var k in extra) p[k] = extra[k];
    return p;
  }
  function invoer(mensen, instellingen, avondLijst, ervaren) {
    return {
      avonden: avondLijst || avonden(),
      beschikbaarheden: mensen,
      vrijwilligers: mensen.map(function (p) { return { naam: p.naam, ervaren: (ervaren || []).indexOf(p.naam) >= 0 }; }),
      instellingen: instellingen || {}
    };
  }
  function tel(voorstel) {
    var t = {};
    voorstel.avonden.forEach(function (a) { a.vrijwilligers.forEach(function (n) { t[n] = (t[n] || 0) + 1; }); });
    return t;
  }

  test('te weinig mensen: plaats blijft leeg en er is een waarschuwing', function () {
    var v = R.maakVoorstel(invoer([persoon('Alex', { max: 4 })]));
    v.avonden.forEach(function (a) {
      verwacht(a.vrijwilligers.length === 1, 'verwacht 1 vrijwilliger op ' + a.datum);
      verwacht(a.waarschuwingen.length > 0, 'verwacht een waarschuwing op ' + a.datum);
    });
  });

  test('iemand met maximum 1 staat maar één keer ingepland', function () {
    var mensen = [persoon('Bo', { max: 1 }), persoon('Charlie', { max: 4 }), persoon('Dani', { max: 4 })];
    var t = tel(R.maakVoorstel(invoer(mensen)));
    verwacht(t.Bo === 1, 'Bo staat ' + t.Bo + ' keer');
  });

  test('het maximum wordt nooit overschreden', function () {
    var mensen = ['Alex', 'Bo', 'Charlie'].map(function (n) { return persoon(n, { max: 1 }); });
    var v = R.maakVoorstel(invoer(mensen));
    var t = tel(v);
    Object.keys(t).forEach(function (n) { verwacht(t[n] <= 1, n + ' staat ' + t[n] + ' keer'); });
  });

  test('twee weken na elkaar wordt vermeden als het kan', function () {
    var mensen = ['Alex', 'Bo', 'Charlie', 'Dani'].map(function (n) { return persoon(n); });
    var v = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: true }));
    for (var i = 1; i < v.avonden.length; i++) {
      v.avonden[i].vrijwilligers.forEach(function (n) {
        verwacht(v.avonden[i - 1].vrijwilligers.indexOf(n) < 0, n + ' staat twee weken na elkaar');
      });
    }
  });

  test('twee weken na elkaar: als het niet anders kan, toch inplannen met een melding', function () {
    var mensen = [persoon('Eli', { max: 4 }), persoon('Fien', { max: 4 })];
    var v = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: true }));
    verwacht(v.avonden.every(function (a) { return a.vrijwilligers.length === 2; }), 'elke avond moet 2 mensen hebben');
    verwacht(v.avonden[1].meldingen.some(function (m) { return /week ervoor of erna/.test(m); }), 'verwacht een melding');
  });

  test('een duo wordt samen ingepland', function () {
    var mensen = [persoon('Gus', { samenMet: 'Hanne' }), persoon('Hanne'), persoon('Ilse'), persoon('Jo')];
    var v = R.maakVoorstel(invoer(mensen));
    var samen = v.avonden.filter(function (a) {
      return a.vrijwilligers.indexOf('Gus') >= 0 && a.vrijwilligers.indexOf('Hanne') >= 0;
    });
    verwacht(samen.length >= 1, 'Gus en Hanne staan nooit samen');
    verwacht(/samen staan/.test(samen[0].motivatie), 'de motivatie vermeldt het duo niet');
  });

  test('een gesloten avond wordt niet gepland', function () {
    var lijst = avonden();
    lijst[2].status = 'gesloten';
    var mensen = ['Alex', 'Bo', 'Charlie', 'Dani'].map(function (n) { return persoon(n); });
    var v = R.maakVoorstel(invoer(mensen, {}, lijst));
    verwacht(v.avonden[2].vrijwilligers.length === 0, 'er staat iemand op de gesloten avond');
    verwacht(v.avonden[2].waarschuwingen.length === 0, 'een gesloten avond geeft geen waarschuwing');
    verwacht(v.avonden[0].vrijwilligers.length === 2, 'de open avonden worden wel gepland');
  });

  test('wie back-up koos, staat nooit op een gewone plaats', function () {
    var mensen = [persoon('Alex', { keuzes: overal('backup'), max: 4 }), persoon('Bo', { max: 4 })];
    var v = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: false }));
    v.avonden.forEach(function (a) {
      verwacht(a.vrijwilligers.indexOf('Alex') < 0, 'Alex staat als vrijwilliger op ' + a.datum);
      verwacht(a.backups[0] === 'Alex', 'verwacht Alex als back-up op ' + a.datum);
    });
  });

  test('een oude keuze kan als het moet telt als back-up', function () {
    var mensen = [persoon('Alex', { keuzes: overal('kan'), max: 4 }), persoon('Bo', { max: 4 }), persoon('Charlie', { max: 4 })];
    var v = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: false }));
    verwacht(v.avonden[0].vrijwilligers.indexOf('Alex') < 0, 'Alex staat als vrijwilliger');
    verwacht(v.avonden[0].backups[0] === 'Alex', 'verwacht Alex als back-up');
    verwacht(/back-up/.test(v.avonden[0].motivatie), 'de motivatie vermeldt de back-up niet');
  });

  test('ervaren-regel aan: elke avond minstens één ervaren vrijwilliger', function () {
    var mensen = ['Alex', 'Bo', 'Charlie', 'Dani', 'Eli', 'Fien'].map(function (n) { return persoon(n, { max: 4 }); });
    var v = R.maakVoorstel(invoer(mensen, { minstensEenErvaren: true, nietTweeWekenNaElkaar: false }, null, ['Eli', 'Fien']));
    v.avonden.forEach(function (a) {
      verwacht(a.vrijwilligers.some(function (n) { return n === 'Eli' || n === 'Fien'; }), 'geen ervaren op ' + a.datum);
      verwacht(/ervaren/.test(a.motivatie), 'de motivatie vermeldt ervaren niet');
    });
  });

  test('ervaren-regel aan maar niemand ervaren: waarschuwing', function () {
    var mensen = ['Alex', 'Bo'].map(function (n) { return persoon(n, { max: 4 }); });
    var v = R.maakVoorstel(invoer(mensen, { minstensEenErvaren: true }));
    verwacht(v.avonden[0].waarschuwingen.some(function (w) { return /ervaren/.test(w); }), 'verwacht een waarschuwing');
  });

  test('ervaren-regel uit: de kolom ervaren wordt genegeerd', function () {
    var mensen = ['Alex', 'Bo'].map(function (n) { return persoon(n, { max: 4 }); });
    var v = R.maakVoorstel(invoer(mensen, { minstensEenErvaren: false, nietTweeWekenNaElkaar: false }));
    v.avonden.forEach(function (a) {
      verwacht(!a.waarschuwingen.some(function (w) { return /ervaren/.test(w); }), 'onverwachte waarschuwing');
      verwacht(!/ervaren/.test(a.motivatie), 'de motivatie vermeldt ervaren');
    });
  });

  test('back-up: eerst wie back-up koos, en niet iemand die al op die avond staat', function () {
    var mensen = [persoon('Alex'), persoon('Bo'), persoon('Charlie'), persoon('Dani'), persoon('Kim', { keuzes: overal('backup'), max: 0 })];
    var v = R.maakVoorstel(invoer(mensen));
    v.avonden.forEach(function (a) {
      verwacht(a.backups[0] === 'Kim', 'verwacht Kim als back-up op ' + a.datum);
      verwacht(a.vrijwilligers.indexOf('Kim') < 0, 'Kim staat ook als vrijwilliger');
    });
  });

  test('niemand koos back-up: een vrije graag-vrijwilliger wordt back-up', function () {
    var mensen = [persoon('Alex', { max: 4 }), persoon('Bo', { max: 4 }), persoon('Charlie', { max: 4 })];
    var a = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: false })).avonden[0];
    verwacht(a.backups.length === 1 && a.vrijwilligers.indexOf(a.backups[0]) < 0, 'verwacht een vrije back-up');
  });

  test('back-up op een gewone plaats geeft een melding', function () {
    var mensen = [persoon('Alex'), persoon('Kim', { keuzes: overal('backup') })];
    var c = R.controleerRooster({ '2026-11-06': { vrijwilligers: ['Alex', 'Kim'], backups: [] } }, invoer(mensen));
    verwacht(c['2026-11-06'].meldingen.some(function (m) { return /Kim koos enkel 'back-up'/.test(m); }), 'verwacht een melding');
  });

  test('lege back-up geeft enkel een melding, tenzij verplicht', function () {
    var mensen = [persoon('Alex', { max: 4 }), persoon('Bo', { max: 4 })];
    var a = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: false })).avonden[0];
    verwacht(a.waarschuwingen.length === 0 && a.meldingen.length > 0, 'verwacht enkel een melding');
    var b = R.maakVoorstel(invoer(mensen, { nietTweeWekenNaElkaar: false, backupVerplicht: true })).avonden[0];
    verwacht(b.waarschuwingen.length > 0, 'verwacht een waarschuwing');
  });

  test('zelfde invoer geeft altijd hetzelfde voorstel', function () {
    var mensen = ['Alex', 'Bo', 'Charlie', 'Dani', 'Eli'].map(function (n, i) {
      return persoon(n, { max: 1 + (i % 3), keuzes: { '2026-11-06': 'graag', '2026-11-13': i % 2 ? 'backup' : 'niet', '2026-11-20': 'backup', '2026-11-27': 'graag' } });
    });
    var a = JSON.stringify(R.maakVoorstel(invoer(mensen)));
    var b = JSON.stringify(R.maakVoorstel(invoer(mensen.slice().reverse())));
    verwacht(a === b, 'twee keer hetzelfde gaf een ander voorstel');
  });

  test('vervanging bij afmelding: eerst de back-up', function () {
    var mensen = [persoon('Alex'), persoon('Bo'), persoon('Kim', { keuzes: overal('backup') })];
    var rooster = { '2026-11-06': { vrijwilligers: ['Alex', 'Bo'], backups: ['Kim'] } };
    var v = R.stelVervangingVoor('2026-11-06', 'Alex', rooster, invoer(mensen));
    verwacht(v.naam === 'Kim', 'verwacht Kim, kreeg ' + v.naam);
  });

  // Resultaten tonen.
  var mislukt = resultaten.filter(function (r) { return !r.ok; });
  if (typeof document !== 'undefined' && document.getElementById('resultaten')) {
    var lijst = document.getElementById('resultaten');
    resultaten.forEach(function (r) {
      var li = document.createElement('li');
      li.textContent = (r.ok ? '✓ ' : '✗ ') + r.naam + (r.ok ? '' : ' — ' + r.fout);
      li.className = r.ok ? 'ok' : 'fout';
      lijst.appendChild(li);
    });
    document.getElementById('samenvatting').textContent =
      (resultaten.length - mislukt.length) + ' van de ' + resultaten.length + ' tests geslaagd.';
  } else {
    resultaten.forEach(function (r) { console.log((r.ok ? '✓ ' : '✗ ') + r.naam + (r.ok ? '' : ' — ' + r.fout)); });
    console.log((resultaten.length - mislukt.length) + ' van de ' + resultaten.length + ' tests geslaagd.');
    if (mislukt.length && typeof process !== 'undefined') process.exitCode = 1;
  }
})();
