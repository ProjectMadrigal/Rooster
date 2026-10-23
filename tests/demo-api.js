/*
 * demo-api.js — een nagebootste server, enkel voor tests/demo.html.
 *
 * Zo kan je de tool bekijken en uitproberen zonder Google-spreadsheet.
 * Alles staat in het geheugen van je browser: herlaad je de pagina, dan begin je opnieuw.
 * Codes in de demo: "demo" (vrijwilliger) en "demo-planner" (planner).
 * Alle namen zijn verzonnen.
 */
(function () {
  'use strict';

  var KEUZE_LABEL = window.Roosterregels.KEUZE_LABEL;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function maandPlus(n) {
    var d = new Date();
    d = new Date(d.getFullYear(), d.getMonth() + n, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  function vrijdagen(maand) {
    var j = +maand.slice(0, 4), m = +maand.slice(5, 7), uit = [];
    for (var d = 1; d <= new Date(j, m, 0).getDate(); d++) {
      if (new Date(j, m - 1, d).getDay() === 5) uit.push(maand + '-' + pad(d));
    }
    return uit;
  }
  function nu() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  var db = {
    vrijwilligers: [
      { naam: 'Alex', actief: 'ja', ervaren: true, opmerking: '' },
      { naam: 'Bo', actief: 'ja', ervaren: false, opmerking: '' },
      { naam: 'Charlie', actief: 'ja', ervaren: true, opmerking: '' },
      { naam: 'Dani', actief: 'ja', ervaren: false, opmerking: '' },
      { naam: 'Eli', actief: 'ja', ervaren: false, opmerking: '' },
      { naam: 'Fien', actief: 'ja', ervaren: true, opmerking: '' },
      { naam: 'Gus', actief: 'ja', ervaren: false, opmerking: '' },
      { naam: 'Hanne', actief: 'nieuw', ervaren: false, opmerking: '' }
    ],
    terugkerend: { '1ste': 'Praatcafé', '2de': '', '3de': 'Volkskeuken', '4de': '', laatste: '' },
    avonden: {},
    beschikbaarheden: [],
    rooster: {},
    afmeldingen: []
  };
  var inst = {
    openingsdag: 'vrijdag', beginuur: '18:00', einduur: '21:00', aantalVrijwilligers: 2, aantalBackups: 1,
    standaardMax: 2, backupVerplicht: false, backupTeltMee: false, nietTweeWekenNaElkaar: true,
    minstensEenErvaren: false, automatischBackup: false
  };

  function avondenVoorMaand(maand) {
    var data = vrijdagen(maand);
    return data.map(function (d, i) {
      if (db.avonden[d]) return db.avonden[d];
      var dag = +d.slice(8, 10);
      var laatste = i === data.length - 1;
      var week = ['1ste', '2de', '3de', '4de'][Math.ceil(dag / 7) - 1];
      return { datum: d, status: 'open', event: (laatste && db.terugkerend.laatste) || db.terugkerend[week] || '' };
    });
  }

  // Voorbeeldgegevens: keuzes voor volgende maand en een gepubliceerd rooster voor deze maand.
  (function vulVoorbeeld() {
    var volgende = maandPlus(1), deze = maandPlus(0);
    var vd = vrijdagen(volgende);
    if (vd[2]) db.avonden[vd[2]] = { datum: vd[2], status: 'workshop', event: 'Zinewerkplaats' };
    var patroon = ['graag', 'backup', 'niet', 'graag', 'graag'];
    ['Alex', 'Bo', 'Charlie', 'Dani', 'Eli', 'Gus', 'Hanne'].forEach(function (n, i) {
      var keuzes = {};
      avondenVoorMaand(volgende).forEach(function (a, j) {
        if (a.status === 'open') keuzes[a.datum] = patroon[(i + j) % patroon.length];
      });
      db.beschikbaarheden.push({
        maand: volgende, naam: n, keuzes: keuzes, max: i % 3 === 0 ? null : 1 + (i % 3),
        samenMet: n === 'Alex' ? 'Bo' : '', opmerking: n === 'Eli' ? 'Liefst niet de eerste vrijdag.' : '', ingevuld: nu()
      });
    });
    var namen = ['Alex', 'Bo', 'Charlie', 'Dani', 'Eli', 'Fien', 'Gus'];
    vrijdagen(deze).forEach(function (d, i) {
      db.rooster[d] = {
        datum: d, vrijwilligers: [namen[i % 7], namen[(i + 2) % 7]], backups: i % 2 ? [] : [namen[(i + 4) % 7]],
        motivatie: '', status: 'gepubliceerd'
      };
    });
  })();

  function rol(code) {
    code = String(code || '').trim().toLowerCase();
    return code === 'demo-planner' ? 'coordinator' : code === 'demo' ? 'vrijwilliger' : null;
  }
  function actieveNamen() {
    return db.vrijwilligers.filter(function (v) { return v.actief === 'ja'; }).map(function (v) { return v.naam; }).sort();
  }
  function zoek(naam) {
    var s = String(naam || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return db.vrijwilligers.filter(function (v) { return v.naam.toLowerCase() === s; })[0];
  }
  function netjes(naam) {
    return String(naam || '').replace(/\s+/g, ' ').trim().split(' ').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
  function roosterVan(maand) {
    return Object.keys(db.rooster).filter(function (d) { return d.slice(0, 7) === maand; }).sort()
      .map(function (d) { return db.rooster[d]; });
  }
  function inschrijving(maand) {
    var d = new Date(+maand.slice(0, 4), +maand.slice(5, 7) - 1, 1 - 7);
    var laatste = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    return { open: nu().slice(0, 10) <= laatste, laatsteDag: laatste };
  }
  function fout(t) { return { ok: false, fout: t }; }
  function kopie(x) { return JSON.parse(JSON.stringify(x)); }

  var acties = {
    start: function (v, r) {
      return {
        ok: true, rol: r, namen: actieveNamen(),
        teksten: {
          welkom: 'Fijn dat je meehelpt in de bib! Dit is een demo met verzonnen namen.',
          uitleg: 'Kies je naam en de maand. Duid per avond aan of je graag komt, enkel back-up wil zijn, of niet kan.',
          privacy: 'Demo: er wordt niets bewaard. In de echte tool bewaren we enkel je voornaam en je keuzes, 12 maanden lang.'
        },
        instellingen: inst
      };
    },
    maand: function (v) {
      var r = roosterVan(v.maand);
      var gepubliceerd = r.length && r.every(function (x) { return x.status === 'gepubliceerd'; });
      return {
        ok: true, maand: v.maand, avonden: avondenVoorMaand(v.maand), inschrijving: inschrijving(v.maand),
        rooster: gepubliceerd ? r.map(function (x) {
          return {
            datum: x.datum, vrijwilligers: x.vrijwilligers, backups: x.backups,
            afgemeld: db.afmeldingen.filter(function (a) { return a.datum === x.datum && a.status === 'open'; }).map(function (a) { return a.naam; })
          };
        }) : null
      };
    },
    mijnBeschikbaarheid: function (v) {
      var b = db.beschikbaarheden.filter(function (x) { return x.maand === v.maand && x.naam.toLowerCase() === netjes(v.naam).toLowerCase(); })[0];
      return { ok: true, gevonden: !!b, beschikbaarheid: b ? kopie(b) : null };
    },
    bewaarBeschikbaarheid: function (v) {
      var naam = netjes(v.naam);
      if (!naam) return fout('Kies je naam of typ je voornaam.');
      var w = zoek(naam), nieuw = false;
      if (w) { naam = w.naam; nieuw = w.actief !== 'ja'; if (w.actief === 'nee') w.actief = 'nieuw'; }
      else { db.vrijwilligers.push({ naam: naam, actief: 'nieuw', ervaren: false, opmerking: '' }); nieuw = true; }
      var bestaand = db.beschikbaarheden.filter(function (x) { return x.maand === v.maand && x.naam === naam; })[0];
      if (bestaand && !v.overschrijf) return { ok: false, bestaatAl: true };
      var rij = {
        maand: v.maand, naam: naam, keuzes: v.keuzes, max: v.max === 'maakt niet uit' ? null : +v.max,
        samenMet: v.samenMet || '', opmerking: v.opmerking || '', ingevuld: nu()
      };
      if (bestaand) db.beschikbaarheden[db.beschikbaarheden.indexOf(bestaand)] = rij;
      else db.beschikbaarheden.push(rij);
      return { ok: true, naam: naam, nieuweNaam: nieuw };
    },
    afmelden: function (v) {
      var r = db.rooster[v.datum];
      if (!r || r.status !== 'gepubliceerd') return fout('Er is nog geen rooster voor deze avond.');
      var rolNaam = r.vrijwilligers.indexOf(v.naam) >= 0 ? 'vrijwilliger' : r.backups.indexOf(v.naam) >= 0 ? 'back-up' : '';
      if (!rolNaam) return fout('Je staat niet ingepland op deze avond.');
      db.afmeldingen.push({ tijdstip: nu(), datum: v.datum, naam: v.naam, rol: rolNaam, status: 'open', vervanger: '' });
      return { ok: true, automatisch: false, vervanger: '' };
    },
    coordMaand: function (v) {
      return {
        ok: true, maand: v.maand, avonden: avondenVoorMaand(v.maand), terugkerend: db.terugkerend,
        vrijwilligers: kopie(db.vrijwilligers),
        beschikbaarheden: kopie(db.beschikbaarheden.filter(function (b) { return b.maand === v.maand; })),
        rooster: kopie(roosterVan(v.maand)),
        afmeldingen: kopie(db.afmeldingen.filter(function (a) { return a.datum.slice(0, 7) === v.maand; })),
        inschrijving: inschrijving(v.maand), instellingen: inst
      };
    },
    bewaarAvonden: function (v) {
      v.avonden.forEach(function (a) { db.avonden[a.datum] = { datum: a.datum, status: a.status, event: a.event }; });
      return { ok: true };
    },
    keurNaamGoed: function (v) {
      var w = zoek(v.naam);
      var juist = netjes(v.juisteNaam || v.naam);
      var ander = zoek(juist);
      if (ander && ander !== w) {
        db.vrijwilligers.splice(db.vrijwilligers.indexOf(w), 1);
        db.beschikbaarheden.forEach(function (b) { if (b.naam === w.naam) b.naam = ander.naam; });
        ander.actief = 'ja';
        return { ok: true, naam: ander.naam };
      }
      db.beschikbaarheden.forEach(function (b) { if (b.naam === w.naam) b.naam = juist; });
      w.naam = juist;
      w.actief = 'ja';
      return { ok: true, naam: juist };
    },
    weigerNaam: function (v) {
      var w = zoek(v.naam);
      db.vrijwilligers.splice(db.vrijwilligers.indexOf(w), 1);
      db.beschikbaarheden = db.beschikbaarheden.filter(function (b) { return b.naam !== w.naam; });
      return { ok: true };
    },
    bewaarRooster: function (v) {
      var status = v.publiceer ? 'gepubliceerd' : 'voorstel';
      v.rijen.forEach(function (r) {
        db.rooster[r.datum] = { datum: r.datum, vrijwilligers: r.vrijwilligers, backups: r.backups, motivatie: r.motivatie, status: status };
      });
      return { ok: true, status: status };
    },
    verwerkAfmelding: function (v) {
      var a = db.afmeldingen.filter(function (x) { return x.datum === v.datum && x.naam === v.naam && x.status === 'open'; })[0];
      var r = db.rooster[v.datum];
      ['vrijwilligers', 'backups'].forEach(function (k) {
        var i = r[k].indexOf(v.naam);
        if (i >= 0) r[k][i] = v.vervanger;
        r[k] = r[k].filter(Boolean);
      });
      if (v.vervanger && r.backups.indexOf(v.vervanger) >= 0 && r.vrijwilligers.indexOf(v.vervanger) >= 0) {
        r.backups.splice(r.backups.indexOf(v.vervanger), 1);
      }
      a.status = 'verwerkt';
      a.vervanger = v.vervanger;
      return { ok: true };
    }
  };

  window.ROOSTER_API = function (vraag) {
    var r = rol(vraag.code);
    if (!r) return { ok: false, codeFout: true, fout: 'Deze code klopt niet. In de demo is de code "demo".' };
    var actie = acties[vraag.actie];
    var coord = ['coordMaand', 'bewaarAvonden', 'keurNaamGoed', 'weigerNaam', 'bewaarRooster', 'verwerkAfmelding'];
    if (!actie || (coord.indexOf(vraag.actie) >= 0 && r !== 'coordinator')) return fout('Hiervoor heb je de code van de planner nodig.');
    // Kopie, zoals bij een echte server.
    return new Promise(function (ok) { setTimeout(function () { ok(kopie(actie(kopie(vraag), r))); }, 150); });
  };
  void KEUZE_LABEL;
})();
