/*
 * app.js — de webtool voor het rooster van Project Madrigal.
 *
 * Gewone JavaScript, zonder framework: elk scherm wordt hier opgebouwd.
 * Alle gegevens komen van het Apps Script (de URL staat in config.js).
 * De regels voor het voorstel staan apart in roosterregels.js.
 *
 * Schermen:
 *   - code invullen (één keer, de browser onthoudt de code)
 *   - "Wanneer kan ik?": beschikbaarheid invullen
 *   - "Rooster": het gepubliceerde rooster, met afmelden
 *   - "Planner": enkel met de code van de planner
 */
(function () {
  'use strict';

  var CONFIG = window.ROOSTER_CONFIG || {};
  var Regels = window.Roosterregels;
  var KEUZE_LABEL = Regels.KEUZE_LABEL;
  var STATUS_LABEL = { open: 'Open', gesloten: 'Gesloten', workshop: 'Workshop', ander: 'Ander' };
  var PRIVACY_STANDAARD = 'We bewaren enkel je voornaam en je keuzes voor het rooster. ' +
    'We wissen ze automatisch na de bewaartermijn. Vragen? Spreek de planner aan.';

  // Onthouden in de browser. In een privévenster kan dat mislukken; dan werkt alles gewoon verder.
  var opslag = {
    lees: function (k) {
      try { return localStorage.getItem('rooster.' + k); } catch (e) { return null; }
    },
    schrijf: function (k, w) {
      try {
        if (w == null || w === '') localStorage.removeItem('rooster.' + k);
        else localStorage.setItem('rooster.' + k, w);
      } catch (e) { /* niet erg */ }
    }
  };

  var staat = {
    code: opslag.lees('code') || '',
    naam: opslag.lees('naam') || '',
    rol: null,
    namen: [],
    teksten: {},
    instellingen: {},
    scherm: 'beschikbaarheid'
  };

  var inhoud = document.getElementById('inhoud');
  var tabs = document.getElementById('tabs');

  // -------------------------------------------------------------------------
  // Verbinding met het Apps Script
  // -------------------------------------------------------------------------

  function api(actie, gegevens) {
    var vraag = Object.assign({ actie: actie, code: staat.code }, gegevens || {});
    var belofte;
    if (typeof window.ROOSTER_API === 'function') {
      // Enkel voor de demo in tests/demo.html.
      belofte = Promise.resolve().then(function () { return window.ROOSTER_API(vraag); });
    } else if (!CONFIG.scriptUrl) {
      return Promise.reject(new Error('De tool is nog niet gekoppeld aan de spreadsheet. ' +
        'Zet de URL van de web-app in config.js (zie de handleiding).'));
    } else {
      // Gewone tekst als body, zodat de browser geen extra controlevraag stuurt.
      belofte = fetch(CONFIG.scriptUrl, { method: 'POST', body: JSON.stringify(vraag) })
        .then(function (r) { return r.json(); }, function () {
          throw new Error('Er is geen verbinding. Controleer je internet en probeer het opnieuw.');
        });
    }
    return belofte.then(function (a) {
      if (!a || (!a.ok && !a.bestaatAl)) {
        var fout = new Error((a && a.fout) || 'Er ging iets mis. Probeer het opnieuw.');
        fout.codeFout = !!(a && a.codeFout);
        throw fout;
      }
      return a;
    });
  }

  // -------------------------------------------------------------------------
  // Kleine hulpfuncties
  // -------------------------------------------------------------------------

  // Maakt een element: el('p', { class: 'x', tekst: 'Hallo' }, kind1, kind2).
  var EIGENSCHAPPEN = ['checked', 'selected', 'value', 'disabled'];
  function el(tag, eig) {
    var e = document.createElement(tag);
    Object.keys(eig || {}).forEach(function (k) {
      var w = eig[k];
      if (w == null || w === false) return;
      if (k === 'tekst') e.textContent = w;
      else if (k === 'class') e.className = w;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), w);
      else if (EIGENSCHAPPEN.indexOf(k) >= 0) e[k] = w;
      else e.setAttribute(k, w === true ? '' : w);
    });
    for (var i = 2; i < arguments.length; i++) voegToe(e, arguments[i]);
    return e;
  }
  function voegToe(ouder, kind) {
    if (kind == null || kind === false) return;
    if (Array.isArray(kind)) kind.forEach(function (k) { voegToe(ouder, k); });
    else ouder.appendChild(typeof kind === 'string' ? document.createTextNode(kind) : kind);
  }
  function leeg(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }

  var teller = 0;
  function uniekId(basis) { teller += 1; return basis + '-' + teller; }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function datumObj(d) { return new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))); }
  function datumTekst(d) {
    return datumObj(d).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  }
  // '2026-10-23 17:21' wordt '23 oktober om 17:21'.
  function tijdstipTekst(t) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(t || '')) return t || '';
    var dag = datumObj(t.slice(0, 10)).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    return dag + (t.length >= 16 ? ' om ' + t.slice(11, 16) : '');
  }
  function kortDatum(d) { return +d.slice(8, 10) + '/' + +d.slice(5, 7); }
  function maandTekst(m) {
    return datumObj(m + '-01').toLocaleDateString('nl-BE', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function maandPlus(n) {
    var d = new Date();
    d = new Date(d.getFullYear(), d.getMonth() + n, 1);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }
  function vandaag() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function hoofdletter(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function opsomming(namen) {
    if (namen.length <= 1) return namen.join('');
    return namen.slice(0, -1).join(', ') + ' en ' + namen[namen.length - 1];
  }
  function eventTekst(a) {
    if (a.status === 'open') return a.event || '';
    return STATUS_LABEL[a.status] + (a.event ? ': ' + a.event : '');
  }

  function bezig(doel, tekst) {
    leeg(doel).appendChild(el('p', { class: 'bezig', role: 'status', tekst: tekst || 'Even laden…' }));
  }
  function foutBlok(tekst, opnieuw) {
    return el('div', { class: 'blok fout', role: 'alert' },
      el('p', { tekst: tekst }),
      opnieuw ? el('button', { type: 'button', class: 'knop', onclick: opnieuw, tekst: 'Probeer opnieuw' }) : null);
  }

  // Een groep keuzerondjes als grote knoppen.
  function keuzeGroep(naam, legende, opties, gekozen, hulp) {
    var hulpId = hulp ? uniekId('hulp') : null;
    return el('fieldset', { class: 'groep', 'aria-describedby': hulpId },
      el('legend', { tekst: legende }),
      hulp ? el('p', { class: 'hulp', id: hulpId, tekst: hulp }) : null,
      el('div', { class: 'keuzes' }, opties.map(function (o) {
        return el('label', { class: 'keuze' },
          el('input', { type: 'radio', name: naam, value: o.waarde, checked: o.waarde === gekozen }),
          el('span', { tekst: o.label }));
      })));
  }
  function gekozenWaarde(form, naam) {
    var e = form.querySelector('input[name="' + naam + '"]:checked');
    return e ? e.value : null;
  }

  // -------------------------------------------------------------------------
  // Start en navigatie
  // -------------------------------------------------------------------------

  function begin() {
    document.getElementById('privacy-knop').addEventListener('click', toonPrivacy);
    document.getElementById('code-wissen').addEventListener('click', function () {
      staat.code = '';
      opslag.schrijf('code', '');
      toonCodeScherm();
    });
    if (!staat.code) toonCodeScherm();
    else laadStart();
  }

  function laadStart() {
    tabs.hidden = true;
    bezig(inhoud);
    api('start').then(function (a) {
      staat.rol = a.rol;
      staat.namen = a.namen || [];
      staat.teksten = a.teksten || {};
      staat.instellingen = a.instellingen || {};
      if (staat.scherm === 'coordinator' && staat.rol !== 'coordinator') staat.scherm = 'beschikbaarheid';
      ga(staat.scherm);
    }).catch(function (e) {
      if (e.codeFout) {
        staat.code = '';
        opslag.schrijf('code', '');
        toonCodeScherm(e.message);
      } else {
        leeg(inhoud).appendChild(foutBlok(e.message, laadStart));
      }
    });
  }

  var SCHERMEN = [
    ['beschikbaarheid', 'Wanneer kan ik?'],
    ['rooster', 'Rooster'],
    ['coordinator', 'Planner']
  ];

  function toonTabs() {
    leeg(tabs).hidden = false;
    var lijst = el('ul', { class: 'breed' });
    SCHERMEN.forEach(function (s) {
      if (s[0] === 'coordinator' && staat.rol !== 'coordinator') return;
      lijst.appendChild(el('li', null, el('button', {
        type: 'button',
        class: 'tab',
        'aria-current': staat.scherm === s[0] ? 'page' : null,
        onclick: function () { ga(s[0]); },
        tekst: s[1]
      })));
    });
    tabs.appendChild(lijst);
  }

  function ga(scherm) {
    staat.scherm = scherm;
    toonTabs();
    leeg(inhoud);
    if (scherm === 'rooster') toonRooster();
    else if (scherm === 'coordinator') toonCoordinator();
    else toonBeschikbaarheid();
    var kop = inhoud.querySelector('h1');
    if (kop) kop.focus();
  }

  function kop(tekst) { return el('h1', { tabindex: '-1', tekst: tekst }); }

  // -------------------------------------------------------------------------
  // Code invullen
  // -------------------------------------------------------------------------

  function toonCodeScherm(fout) {
    tabs.hidden = true;
    leeg(inhoud);
    var invoer = el('input', {
      id: 'code', type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false',
      required: true, 'aria-describedby': 'code-hulp'
    });
    var foutVak = el('div', { 'aria-live': 'assertive' }, fout ? foutBlok(fout) : null);
    var form = el('form', {
      class: 'blok', novalidate: true,
      onsubmit: function (e) {
        e.preventDefault();
        var code = invoer.value.trim();
        if (!code) {
          leeg(foutVak).appendChild(foutBlok('Vul de code in.'));
          invoer.focus();
          return;
        }
        staat.code = code;
        opslag.schrijf('code', code);
        laadStart();
      }
    },
      el('label', { for: 'code', tekst: 'Code' }),
      el('p', { class: 'hulp', id: 'code-hulp', tekst: 'Je vindt de code in de WhatsApp-groep van de vrijwilligers.' }),
      invoer,
      foutVak,
      el('button', { type: 'submit', class: 'knop hoofd', tekst: 'Verder' }));
    voegToe(inhoud, [
      kop('Welkom!'),
      el('p', { tekst: 'Hier duid je aan wanneer je kan helpen in de bib, en zie je het rooster. ' +
        'Vul eerst de code in. Je browser onthoudt die, dus dit doe je maar één keer.' }),
      form
    ]);
    invoer.focus();
  }

  // -------------------------------------------------------------------------
  // Wanneer kan ik? (beschikbaarheid)
  // -------------------------------------------------------------------------

  function naamKiezer(bijWijziging) {
    var kiesId = uniekId('naam');
    var nieuwId = uniekId('nieuwe-naam');
    var bekend = staat.namen.indexOf(staat.naam) >= 0;
    var kies = el('select', { id: kiesId },
      el('option', { value: '', tekst: 'Kies je naam' }),
      staat.namen.map(function (n) { return el('option', { value: n, tekst: n, selected: n === staat.naam }); }),
      el('option', { value: '__nieuw', tekst: 'Ik sta er niet bij', selected: !!staat.naam && !bekend }));
    var nieuw = el('input', { id: nieuwId, type: 'text', autocomplete: 'given-name', maxlength: '40', value: bekend ? '' : staat.naam });
    var nieuwVak = el('div', { class: 'veld', hidden: kies.value !== '__nieuw' },
      el('label', { for: nieuwId, tekst: 'Je voornaam' }),
      el('p', { class: 'hulp', tekst: 'De planner zet je naam daarna in de lijst.' }),
      el('div', { class: 'rij' }, nieuw,
        el('button', { type: 'button', class: 'knop', tekst: 'Verder', onclick: kies_klaar })));
    function huidig() { return kies.value === '__nieuw' ? nieuw.value.replace(/\s+/g, ' ').trim() : kies.value; }
    function kies_klaar() {
      staat.naam = huidig();
      opslag.schrijf('naam', staat.naam);
      bijWijziging(staat.naam);
    }
    kies.addEventListener('change', function () {
      nieuwVak.hidden = kies.value !== '__nieuw';
      if (kies.value === '__nieuw') { nieuw.focus(); if (!nieuw.value) return; }
      kies_klaar();
    });
    nieuw.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); kies_klaar(); } });
    return {
      element: el('div', { class: 'veld' }, el('label', { for: kiesId, tekst: 'Wie ben jij?' }), kies, nieuwVak),
      waarde: huidig
    };
  }

  function toonBeschikbaarheid() {
    var maandId = uniekId('maand');
    var maand = el('select', { id: maandId }, [0, 1, 2].map(function (n) {
      var m = maandPlus(n);
      return el('option', { value: m, tekst: maandTekst(m), selected: n === 1 });
    }));
    var vak = el('div', { 'aria-live': 'polite' });
    var naam = naamKiezer(laad);
    maand.addEventListener('change', laad);

    function laad() {
      var n = naam.waarde();
      if (!n) {
        leeg(vak).appendChild(el('p', { class: 'hulp', tekst: 'Kies eerst je naam.' }));
        return;
      }
      bezig(vak);
      var m = maand.value;
      Promise.all([api('maand', { maand: m }), api('mijnBeschikbaarheid', { maand: m, naam: n })])
        .then(function (a) { bouwFormulier(vak, a[0], a[1].gevonden ? a[1].beschikbaarheid : null, n, m); })
        .catch(function (e) { leeg(vak).appendChild(foutBlok(e.message, laad)); });
    }

    voegToe(inhoud, [
      kop('Wanneer kan jij?'),
      staat.teksten.welkom ? el('p', { class: 'intro', tekst: staat.teksten.welkom }) : null,
      staat.teksten.uitleg ? el('details', { class: 'uitleg' },
        el('summary', { tekst: 'Hoe werkt het?' }), el('p', { tekst: staat.teksten.uitleg })) : null,
      el('div', { class: 'blok' },
        el('div', { class: 'veld' }, el('label', { for: maandId, tekst: 'Maand' }), maand),
        naam.element),
      vak
    ]);
    laad();
  }

  function bouwFormulier(vak, m, vorige, naam, maand) {
    leeg(vak);
    var open = m.avonden.filter(function (a) { return a.status === 'open'; });
    var magInvullen = m.inschrijving.open || staat.rol === 'coordinator';

    if (!m.inschrijving.open) {
      vak.appendChild(el('div', { class: 'blok info' },
        el('p', { tekst: 'Invullen voor ' + maandTekst(maand) + ' is gesloten sinds ' + datumTekst(m.inschrijving.laatsteDag) + '. ' +
          'Wil je nog iets doorgeven? Spreek de planner aan.' }),
        staat.rol === 'coordinator' ? el('p', { tekst: 'Jij bent planner, dus jij kan toch nog invullen.' }) : null));
    } else {
      vak.appendChild(el('p', { class: 'hulp', tekst: 'Je kan invullen tot en met ' + datumTekst(m.inschrijving.laatsteDag) + '.' }));
    }
    if (vorige) {
      vak.appendChild(el('div', { class: 'blok info' },
        el('p', { tekst: 'Je vulde ' + maandTekst(maand) + ' al in' + (vorige.ingevuld ? ' op ' + tijdstipTekst(vorige.ingevuld) : '') +
          '. Hieronder zie je je vorige keuze. Verstuur je opnieuw, dan vervang je die.' })));
    }
    if (!magInvullen) return;
    if (!open.length) {
      vak.appendChild(el('p', { tekst: 'Er zijn geen open avonden in ' + maandTekst(maand) + '.' }));
    }

    var foutVak = el('div', { 'aria-live': 'assertive' });
    var form = el('form', { class: 'formulier', novalidate: true });
    var uren = staat.instellingen.beginuur ? ' (' + staat.instellingen.beginuur + '–' + staat.instellingen.einduur + ')' : '';
    if (open.length) {
      form.appendChild(el('p', { class: 'hulp', tekst: 'Graag: je wil die avond in de bib staan. Back-up: je springt in als iemand toch niet kan. Niet: je kan niet.' }));
    }

    m.avonden.forEach(function (a) {
      if (a.status !== 'open') {
        form.appendChild(el('div', { class: 'blok avond dicht' },
          el('p', { class: 'avond-datum', tekst: datumTekst(a.datum) }),
          el('p', { tekst: eventTekst(a) + '. Hier kan je niets aanduiden.' })));
        return;
      }
      var groep = keuzeGroep('avond-' + a.datum, datumTekst(a.datum) + uren, [
        { waarde: 'graag', label: 'Graag' },
        { waarde: 'backup', label: 'Back-up' },
        { waarde: 'niet', label: 'Niet' }
      ], vorige ? vorige.keuzes[a.datum] : null, a.event ? 'Die avond: ' + a.event : null);
      groep.classList.add('avond');
      form.appendChild(groep);
    });

    var maxVorig = vorige ? (vorige.max == null ? 'maakt niet uit' : String(vorige.max)) : null;
    form.appendChild(keuzeGroep('max', 'Hoeveel shiften wil je deze maand doen?', [
      { waarde: '1', label: '1' }, { waarde: '2', label: '2' }, { waarde: '3', label: '3' },
      { waarde: '4', label: '4' }, { waarde: 'maakt niet uit', label: 'Maakt niet uit' }
    ], maxVorig));

    var samenId = uniekId('samen');
    var samen = el('select', { id: samenId },
      el('option', { value: '', tekst: 'Niemand in het bijzonder' }),
      staat.namen.filter(function (n) { return n !== naam; }).map(function (n) {
        return el('option', { value: n, tekst: n, selected: vorige && vorige.samenMet === n });
      }));
    form.appendChild(el('div', { class: 'veld' },
      el('label', { for: samenId, tekst: 'Met wie sta je graag samen? (mag je leeg laten)' }), samen));

    var opmerkingId = uniekId('opmerking');
    var opmerking = el('textarea', { id: opmerkingId, rows: '3', maxlength: '500' });
    opmerking.value = vorige ? vorige.opmerking : '';
    form.appendChild(el('div', { class: 'veld' },
      el('label', { for: opmerkingId, tekst: 'Opmerking voor de planner (mag je leeg laten)' }), opmerking));

    form.appendChild(foutVak);
    var knop = el('button', { type: 'submit', class: 'knop hoofd', tekst: vorige ? 'Vervang mijn keuze' : 'Verstuur' });
    form.appendChild(knop);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      leeg(foutVak);
      var keuzes = {};
      var ontbreekt = null;
      open.forEach(function (a) {
        var k = gekozenWaarde(form, 'avond-' + a.datum);
        if (k) keuzes[a.datum] = k;
        else if (!ontbreekt) ontbreekt = { naam: 'avond-' + a.datum, tekst: 'Duid voor ' + datumTekst(a.datum) + ' iets aan.' };
      });
      var max = gekozenWaarde(form, 'max');
      if (!ontbreekt && !max) ontbreekt = { naam: 'max', tekst: 'Duid aan hoeveel shiften je wil doen.' };
      if (ontbreekt) {
        foutVak.appendChild(foutBlok(ontbreekt.tekst));
        form.querySelector('input[name="' + ontbreekt.naam + '"]').focus();
        return;
      }
      if (vorige && !window.confirm('Je vervangt je vorige keuze voor ' + maandTekst(maand) + '. Doorgaan?')) return;
      var gegevens = {
        maand: maand, naam: naam, keuzes: keuzes, max: max,
        samenMet: samen.value, opmerking: opmerking.value, overschrijf: !!vorige
      };
      verstuur(gegevens);
    });

    function verstuur(gegevens) {
      knop.disabled = true;
      knop.textContent = 'Bezig met bewaren…';
      api('bewaarBeschikbaarheid', gegevens).then(function (a) {
        if (a.bestaatAl) {
          // Iemand vulde intussen al in voor deze naam (bijvoorbeeld op een ander toestel).
          if (window.confirm('Er is al een keuze bewaard voor ' + naam + ' in ' + maandTekst(maand) + '. Wil je die vervangen?')) {
            gegevens.overschrijf = true;
            return verstuur(gegevens);
          }
          knop.disabled = false;
          knop.textContent = 'Verstuur';
          return;
        }
        staat.naam = a.naam;
        opslag.schrijf('naam', a.naam);
        leeg(vak).appendChild(el('div', { class: 'blok gelukt', role: 'status' },
          el('h2', { tekst: 'Dankjewel, ' + a.naam + '!' }),
          el('p', { tekst: 'Je keuze voor ' + maandTekst(maand) + ' is bewaard.' }),
          a.nieuweNaam ? el('p', { tekst: 'Je naam is nieuw voor ons. De planner zet je op de lijst.' }) : null,
          el('button', { type: 'button', class: 'knop', tekst: 'Bekijk of pas aan', onclick: function () { ga('beschikbaarheid'); } })));
      }).catch(function (e) {
        knop.disabled = false;
        knop.textContent = vorige ? 'Vervang mijn keuze' : 'Verstuur';
        leeg(foutVak).appendChild(foutBlok(e.message));
      });
    }

    vak.appendChild(form);
  }

  // -------------------------------------------------------------------------
  // Rooster (gepubliceerd) en afmelden
  // -------------------------------------------------------------------------

  function toonRooster() {
    var naam = naamKiezer(function () { secties.forEach(function (s) { s.laad(); }); });
    var i = staat.instellingen;
    voegToe(inhoud, [
      kop('Rooster'),
      i.beginuur ? el('p', { class: 'intro', tekst: 'De bib is open van ' + i.beginuur + ' tot ' + i.einduur + '.' }) : null,
      el('div', { class: 'blok' }, naam.element,
        el('p', { class: 'hulp', tekst: 'Kies je naam om je te kunnen afmelden voor een avond.' }))
    ]);
    var secties = [maandPlus(0), maandPlus(1)].map(function (m) {
      var vak = el('section', { 'aria-labelledby': 'rooster-' + m },
        el('h2', { id: 'rooster-' + m, tekst: maandTekst(m) }));
      var lijst = el('div', { 'aria-live': 'polite' });
      vak.appendChild(lijst);
      inhoud.appendChild(vak);
      function laad() {
        bezig(lijst);
        api('maand', { maand: m }).then(function (a) { toonMaandRooster(lijst, a, laad); })
          .catch(function (e) { leeg(lijst).appendChild(foutBlok(e.message, laad)); });
      }
      laad();
      return { laad: laad };
    });
  }

  function toonMaandRooster(vak, m, herlaad) {
    leeg(vak);
    if (!m.rooster) {
      vak.appendChild(el('p', { tekst: 'Het rooster voor ' + maandTekst(m.maand) + ' is nog niet klaar.' }));
      return;
    }
    var perDatum = {};
    m.rooster.forEach(function (r) { perDatum[r.datum] = r; });
    var lijst = el('ul', { class: 'rooster' });
    m.avonden.forEach(function (a) {
      var r = perDatum[a.datum] || { vrijwilligers: [], backups: [], afgemeld: [] };
      function metAfmelding(n) { return r.afgemeld.indexOf(n) >= 0 ? n + ' (afgemeld)' : n; }
      var ikSta = staat.naam && (r.vrijwilligers.indexOf(staat.naam) >= 0 || r.backups.indexOf(staat.naam) >= 0);
      var kanAfmelden = ikSta && a.datum >= vandaag() && r.afgemeld.indexOf(staat.naam) < 0;
      lijst.appendChild(el('li', { class: 'avond' + (a.status === 'open' ? '' : ' dicht') + (ikSta ? ' ik' : '') },
        el('p', { class: 'avond-datum', tekst: datumTekst(a.datum) }),
        eventTekst(a) ? el('p', { class: 'event', tekst: eventTekst(a) }) : null,
        a.status === 'open' ? [
          el('p', { tekst: 'Bib: ' + (r.vrijwilligers.length ? opsomming(r.vrijwilligers.map(metAfmelding)) : 'nog niemand') }),
          el('p', { tekst: 'Back-up: ' + (r.backups.length ? opsomming(r.backups.map(metAfmelding)) : 'niemand') })
        ] : null,
        kanAfmelden ? el('button', {
          type: 'button', class: 'knop',
          tekst: 'Ik kan toch niet',
          onclick: function (e) { afmelden(e.target, a.datum, herlaad); }
        }) : null));
    });
    vak.appendChild(lijst);
  }

  function afmelden(knop, datum, herlaad) {
    if (!window.confirm('Wil je je afmelden voor ' + datumTekst(datum) + '? De planner ziet dat meteen.')) return;
    knop.disabled = true;
    api('afmelden', { datum: datum, naam: staat.naam }).then(function (a) {
      window.alert(a.automatisch
        ? 'Je bent afgemeld. ' + a.vervanger + ' neemt als back-up je plaats in.'
        : 'Je bent afgemeld. De planner zoekt een vervanger.');
      herlaad();
    }).catch(function (e) {
      knop.disabled = false;
      window.alert(e.message);
    });
  }

  // -------------------------------------------------------------------------
  // Planner
  // -------------------------------------------------------------------------

  function toonCoordinator() {
    var maandId = uniekId('maand');
    var maand = el('select', { id: maandId }, [-1, 0, 1, 2].map(function (n) {
      var m = maandPlus(n);
      return el('option', { value: m, tekst: maandTekst(m), selected: n === 1 });
    }));
    var vak = el('div');
    maand.addEventListener('change', function () { laadCoordinator(vak, maand.value); });
    voegToe(inhoud, [
      kop('Planner'),
      el('div', { class: 'blok' }, el('div', { class: 'veld' }, el('label', { for: maandId, tekst: 'Maand' }), maand)),
      vak
    ]);
    laadCoordinator(vak, maand.value);
  }

  function laadCoordinator(vak, maand) {
    bezig(vak);
    api('coordMaand', { maand: maand }).then(function (d) {
      leeg(vak);
      var herlaad = function () { laadCoordinator(vak, maand); };
      voegToe(vak, [
        sectieNamen(d, herlaad),
        sectieAvonden(d, herlaad),
        sectieBeschikbaarheid(d),
        sectieRooster(d, herlaad),
        sectieAfmeldingen(d, herlaad)
      ]);
    }).catch(function (e) { leeg(vak).appendChild(foutBlok(e.message, function () { laadCoordinator(vak, maand); })); });
  }

  function sectie(id, titel) {
    return el('section', { class: 'sectie', 'aria-labelledby': id }, el('h2', { id: id, tekst: titel }));
  }

  // Wat roosterregels.js nodig heeft, uit de gegevens van de planner.
  function regelInvoer(d) {
    var actief = d.vrijwilligers.filter(function (v) { return v.actief === 'ja'; });
    var namen = actief.map(function (v) { return v.naam; });
    return {
      avonden: d.avonden,
      beschikbaarheden: d.beschikbaarheden.filter(function (b) { return namen.indexOf(b.naam) >= 0; }),
      vrijwilligers: actief.map(function (v) { return { naam: v.naam, ervaren: v.ervaren }; }),
      instellingen: d.instellingen
    };
  }
  function actieveNamen(d) {
    return d.vrijwilligers.filter(function (v) { return v.actief === 'ja'; })
      .map(function (v) { return v.naam; })
      .sort(function (a, b) { return a.localeCompare(b, 'nl'); });
  }

  // Een knop die tijdens het wachten uitgeschakeld is.
  function actieKnop(tekst, klasse, doe) {
    var knop = el('button', { type: 'button', class: 'knop ' + (klasse || ''), tekst: tekst });
    knop.addEventListener('click', function () {
      var belofte = doe();
      if (!belofte) return;
      knop.disabled = true;
      belofte.catch(function (e) { window.alert(e.message); }).then(function () { knop.disabled = false; });
    });
    return knop;
  }

  function sectieNamen(d, herlaad) {
    var wachtend = d.vrijwilligers.filter(function (v) { return v.actief === 'nieuw'; });
    if (!wachtend.length) return null;
    var s = sectie('c-namen', 'Nieuwe namen');
    s.appendChild(el('p', { class: 'hulp', tekst: 'Pas de schrijfwijze aan als dat nodig is. Typ je de naam van iemand ' +
      'die al in de lijst staat, dan voeg je de twee samen.' }));
    wachtend.forEach(function (v) {
      var id = uniekId('juist');
      var invoer = el('input', { id: id, type: 'text', value: v.naam, maxlength: '40' });
      s.appendChild(el('div', { class: 'blok' },
        el('label', { for: id, tekst: 'Nieuwe naam: ' + v.naam }), invoer,
        el('div', { class: 'knoppen' },
          actieKnop('Goedkeuren', 'hoofd', function () {
            return api('keurNaamGoed', { naam: v.naam, juisteNaam: invoer.value }).then(herlaad);
          }),
          actieKnop('Weigeren', '', function () {
            if (!window.confirm('Weet je het zeker? Ook wat ' + v.naam + ' invulde, wordt gewist.')) return null;
            return api('weigerNaam', { naam: v.naam }).then(herlaad);
          }))));
    });
    return s;
  }

  function sectieAvonden(d, herlaad) {
    var s = sectie('c-avonden', 'Avonden');
    var terug = Object.keys(d.terugkerend || {}).filter(function (w) { return d.terugkerend[w]; });
    s.appendChild(el('p', { class: 'hulp', tekst: terug.length
      ? 'Terugkerende events (aan te passen in het tabblad Avonden, kolom F en G): ' +
        terug.map(function (w) { return w + ' vrijdag: ' + d.terugkerend[w]; }).join('; ') + '.'
      : 'Er zijn nog geen terugkerende events. Vul ze in het tabblad Avonden in, kolom F en G.' }));
    var velden = d.avonden.map(function (a) {
      var statusId = uniekId('status'), eventId = uniekId('event');
      var status = el('select', { id: statusId }, Object.keys(STATUS_LABEL).map(function (k) {
        return el('option', { value: k, tekst: STATUS_LABEL[k], selected: a.status === k });
      }));
      var event = el('input', { id: eventId, type: 'text', maxlength: '100', value: a.event });
      s.appendChild(el('fieldset', { class: 'blok avond-beheer' },
        el('legend', { tekst: hoofdletter(datumTekst(a.datum)) }),
        el('div', { class: 'veld' }, el('label', { for: statusId, tekst: 'Status' }), status),
        el('div', { class: 'veld' }, el('label', { for: eventId, tekst: 'Event (mag leeg)' }), event)));
      return { datum: a.datum, status: status, event: event };
    });
    s.appendChild(actieKnop('Bewaar avonden', 'hoofd', function () {
      return api('bewaarAvonden', {
        maand: d.maand,
        avonden: velden.map(function (v) { return { datum: v.datum, status: v.status.value, event: v.event.value }; })
      }).then(herlaad);
    }));
    return s;
  }

  function sectieBeschikbaarheid(d) {
    var s = sectie('c-beschikbaarheid', 'Wie kan wanneer?');
    var lijst = d.beschikbaarheden.slice().sort(function (a, b) { return a.naam.localeCompare(b.naam, 'nl'); });
    var status = {};
    d.vrijwilligers.forEach(function (v) { status[v.naam] = v.actief; });
    if (!lijst.length) {
      s.appendChild(el('p', { tekst: 'Nog niemand vulde ' + maandTekst(d.maand) + ' in.' }));
    } else {
      var kort = { graag: 'graag', backup: 'back-up', niet: 'niet' };
      var tabel = el('table', { class: 'tabel' },
        el('caption', { tekst: 'Beschikbaarheid in ' + maandTekst(d.maand) }),
        el('thead', null, el('tr', null,
          el('th', { scope: 'col', tekst: 'Naam' }),
          d.avonden.map(function (a) {
            return el('th', { scope: 'col', title: datumTekst(a.datum) },
              kortDatum(a.datum), a.status !== 'open' ? el('span', { class: 'klein', tekst: ' ' + STATUS_LABEL[a.status].toLowerCase() }) : null);
          }),
          el('th', { scope: 'col', tekst: 'Max' }),
          el('th', { scope: 'col', tekst: 'Samen met' }),
          el('th', { scope: 'col', tekst: 'Opmerking' }))),
        el('tbody', null, lijst.map(function (b) {
          return el('tr', null,
            el('th', { scope: 'row' }, b.naam, status[b.naam] === 'nieuw' ? el('span', { class: 'klein', tekst: ' (nieuw)' }) : null),
            d.avonden.map(function (a) {
              var k = b.keuzes[a.datum];
              return el('td', { class: k ? 'k-' + k : '', tekst: k ? kort[k] : '–' });
            }),
            el('td', { tekst: b.max == null ? 'maakt niet uit' : String(b.max) }),
            el('td', { tekst: b.samenMet || '' }),
            el('td', { class: 'opmerking', tekst: b.opmerking || '' }));
        })));
      s.appendChild(el('div', { class: 'tabel-scroll', tabindex: '0', role: 'region', 'aria-label': 'Tabel beschikbaarheid, scrol opzij voor meer' }, tabel));
    }
    var ingevuld = lijst.map(function (b) { return b.naam; });
    var nogNiet = actieveNamen(d).filter(function (n) { return ingevuld.indexOf(n) < 0; });
    if (nogNiet.length) s.appendChild(el('p', { tekst: 'Nog niet ingevuld: ' + opsomming(nogNiet) + '.' }));
    return s;
  }

  function sectieRooster(d, herlaad) {
    var s = sectie('c-rooster', 'Rooster');
    var invoer = regelInvoer(d);
    var inst = d.instellingen;
    var namen = actieveNamen(d);
    var perNaam = {};
    invoer.beschikbaarheden.forEach(function (b) { perNaam[b.naam] = b; });

    // Het rooster zoals het nu in dit scherm staat.
    var rooster = {};
    var motivatie = {};
    var bewaardeStatus = d.rooster.length ? d.rooster[0].status : '';
    d.rooster.forEach(function (r) {
      rooster[r.datum] = { vrijwilligers: r.vrijwilligers.slice(), backups: r.backups.slice() };
      motivatie[r.datum] = r.motivatie;
    });

    var statusTekst = el('p', { class: 'hulp', 'aria-live': 'polite' });
    var samenvatting = el('div', { 'aria-live': 'polite' });
    var editor = el('div');
    var meldingVakken = {};

    function zetStatusTekst() {
      statusTekst.textContent = bewaardeStatus === 'gepubliceerd'
        ? 'Dit rooster is gepubliceerd: vrijwilligers zien het.'
        : bewaardeStatus === 'voorstel' ? 'Dit is een bewaard voorstel. Vrijwilligers zien het nog niet.'
          : 'Er is nog geen rooster voor deze maand. Kies Maak voorstel.';
    }

    function optieTekst(n, datum) {
      var b = perNaam[n];
      var k = b && b.keuzes[datum];
      return n + ' (' + (k ? KEUZE_LABEL[k] : 'niets ingevuld') + ')';
    }

    function keuzelijst(labelTekst, datum, soort, plaats) {
      var id = uniekId('plek');
      var huidige = (rooster[datum] && rooster[datum][soort][plaats]) || '';
      var lijst = el('select', { id: id },
        el('option', { value: '', tekst: '— niemand —' }),
        namen.map(function (n) { return el('option', { value: n, tekst: optieTekst(n, datum), selected: n === huidige }); }));
      lijst.addEventListener('change', function () {
        var r = rooster[datum] || (rooster[datum] = { vrijwilligers: [], backups: [] });
        r[soort][plaats] = lijst.value;
        motivatie[datum] = 'Met de hand aangepast.';
        var m = editor.querySelector('[data-motivatie="' + datum + '"]');
        if (m) m.textContent = motivatie[datum];
        controleer();
      });
      return el('div', { class: 'veld' }, el('label', { for: id, tekst: labelTekst }), lijst);
    }

    function bouwEditor() {
      leeg(editor);
      meldingVakken = {};
      d.avonden.forEach(function (a) {
        if (a.status !== 'open') {
          editor.appendChild(el('div', { class: 'blok avond dicht' },
            el('h3', { tekst: datumTekst(a.datum) }), el('p', { tekst: eventTekst(a) })));
          return;
        }
        var meldingen = el('div');
        meldingVakken[a.datum] = meldingen;
        var kaart = el('div', { class: 'blok avond' },
          el('h3', { tekst: datumTekst(a.datum) }),
          a.event ? el('p', { class: 'event', tekst: a.event }) : null);
        for (var i = 0; i < inst.aantalVrijwilligers; i++) kaart.appendChild(keuzelijst('Vrijwilliger ' + (i + 1), a.datum, 'vrijwilligers', i));
        for (var j = 0; j < inst.aantalBackups; j++) kaart.appendChild(keuzelijst('Back-up', a.datum, 'backups', j));
        kaart.appendChild(el('p', { class: 'motivatie', 'data-motivatie': a.datum, tekst: motivatie[a.datum] || '' }));
        kaart.appendChild(meldingen);
        editor.appendChild(kaart);
      });
      controleer();
    }

    // Toont per avond de waarschuwingen en meldingen, en bovenaan een samenvatting.
    function controleer() {
      var schoon = {};
      Object.keys(rooster).forEach(function (dt) {
        schoon[dt] = {
          vrijwilligers: rooster[dt].vrijwilligers.filter(Boolean),
          backups: rooster[dt].backups.filter(Boolean)
        };
      });
      var c = Regels.controleerRooster(schoon, invoer);
      var aantalW = 0;
      Object.keys(meldingVakken).forEach(function (dt) {
        var vakje = leeg(meldingVakken[dt]);
        var r = c[dt] || { waarschuwingen: [], meldingen: [] };
        aantalW += r.waarschuwingen.length;
        if (r.waarschuwingen.length) vakje.appendChild(el('ul', { class: 'waarschuwingen' },
          r.waarschuwingen.map(function (w) { return el('li', null, el('strong', { tekst: 'Let op: ' }), w); })));
        if (r.meldingen.length) vakje.appendChild(el('ul', { class: 'meldingen' },
          r.meldingen.map(function (m) { return el('li', { tekst: m }); })));
      });
      var tel = {};
      Object.keys(schoon).forEach(function (dt) {
        schoon[dt].vrijwilligers.forEach(function (n) { tel[n] = (tel[n] || 0) + 1; });
      });
      leeg(samenvatting);
      if (!Object.keys(rooster).length) return;
      samenvatting.appendChild(el('div', { class: 'blok ' + (aantalW ? 'let-op' : 'gelukt') },
        el('p', { tekst: aantalW ? aantalW + (aantalW === 1 ? ' waarschuwing' : ' waarschuwingen') + '. Kijk de avonden hieronder na.'
          : 'Geen waarschuwingen.' }),
        el('p', { class: 'hulp', tekst: 'Shiften: ' + (namen.map(function (n) {
          var b = perNaam[n];
          if (!b) return null;
          return n + ' ' + (tel[n] || 0) + ' van max ' + (b.max == null ? inst.standaardMax : b.max);
        }).filter(Boolean).join(', ') || 'nog niemand') + '.' })));
      samenvatting.aantalWaarschuwingen = aantalW;
    }

    function bewaar(publiceer) {
      var rijen = d.avonden.map(function (a) {
        var r = rooster[a.datum] || { vrijwilligers: [], backups: [] };
        return {
          datum: a.datum,
          vrijwilligers: a.status === 'open' ? r.vrijwilligers.filter(Boolean) : [],
          backups: a.status === 'open' ? r.backups.filter(Boolean) : [],
          motivatie: motivatie[a.datum] || ''
        };
      });
      return api('bewaarRooster', { maand: d.maand, rijen: rijen, publiceer: publiceer }).then(function (a) {
        bewaardeStatus = a.status;
        zetStatusTekst();
        window.alert(publiceer ? 'Het rooster is gepubliceerd. Het tabblad Kalender is bijgewerkt.' : 'Het voorstel is bewaard.');
      });
    }

    var knoppen = el('div', { class: 'knoppen' },
      el('button', {
        type: 'button', class: 'knop', tekst: 'Maak voorstel',
        onclick: function () {
          if (Object.keys(rooster).length &&
            !window.confirm('Een nieuw voorstel vervangt het rooster dat nu in dit scherm staat. Doorgaan?')) return;
          var v = Regels.maakVoorstel(invoer);
          rooster = {};
          motivatie = {};
          v.avonden.forEach(function (a) {
            rooster[a.datum] = { vrijwilligers: a.vrijwilligers.slice(), backups: a.backups.slice() };
            motivatie[a.datum] = a.motivatie;
          });
          bouwEditor();
          statusTekst.textContent = 'Nieuw voorstel gemaakt. Pas aan waar nodig, en bewaar of publiceer.';
        }
      }),
      actieKnop('Bewaar als voorstel', '', function () {
        if (bewaardeStatus === 'gepubliceerd' && !window.confirm('Dit rooster is gepubliceerd. Bewaar je het als voorstel, ' +
          'dan zien vrijwilligers het niet meer tot je opnieuw publiceert. Doorgaan?')) return null;
        return bewaar(false);
      }),
      actieKnop('Publiceer', 'hoofd', function () {
        var w = samenvatting.aantalWaarschuwingen || 0;
        var vraag = w ? (w === 1 ? 'Er is nog 1 waarschuwing.' : 'Er zijn nog ' + w + ' waarschuwingen.') + ' Toch publiceren?'
          : 'Publiceren? Vrijwilligers zien het rooster dan meteen.';
        if (!window.confirm(vraag)) return null;
        return bewaar(true);
      }));

    zetStatusTekst();
    voegToe(s, [statusTekst, knoppen, samenvatting, editor]);
    bouwEditor();
    return s;
  }

  function sectieAfmeldingen(d, herlaad) {
    var s = sectie('c-afmeldingen', 'Afmeldingen');
    if (!d.afmeldingen.length) {
      s.appendChild(el('p', { tekst: 'Geen afmeldingen in ' + maandTekst(d.maand) + '.' }));
      return s;
    }
    var invoer = regelInvoer(d);
    var rooster = {};
    d.rooster.forEach(function (r) { rooster[r.datum] = { vrijwilligers: r.vrijwilligers, backups: r.backups }; });
    var namen = actieveNamen(d);
    d.afmeldingen.slice().sort(function (a, b) { return a.datum < b.datum ? -1 : 1; }).forEach(function (a) {
      var blok = el('div', { class: 'blok' + (a.status === 'open' ? ' let-op' : '') },
        el('p', null, el('strong', { tekst: hoofdletter(datumTekst(a.datum)) + ': ' }),
          a.naam + ' (' + a.rol + ') meldde zich af op ' + tijdstipTekst(a.tijdstip) + '.'));
      if (a.status !== 'open') {
        blok.appendChild(el('p', { tekst: a.vervanger ? 'Verwerkt: ' + a.vervanger + ' neemt over.' : 'Verwerkt, zonder vervanger.' }));
      } else {
        var voorstel = Regels.stelVervangingVoor(a.datum, a.naam, rooster, invoer);
        var id = uniekId('vervanger');
        var lijst = el('select', { id: id },
          el('option', { value: '', tekst: '— niemand —' }),
          namen.filter(function (n) { return n !== a.naam; }).map(function (n) {
            return el('option', { value: n, tekst: n, selected: n === voorstel.naam });
          }));
        voegToe(blok, [
          el('p', { tekst: 'Voorstel: ' + voorstel.uitleg }),
          el('div', { class: 'veld' }, el('label', { for: id, tekst: 'Vervanger' }), lijst),
          actieKnop('Bevestig', 'hoofd', function () {
            return api('verwerkAfmelding', { datum: a.datum, naam: a.naam, vervanger: lijst.value }).then(herlaad);
          })
        ]);
      }
      s.appendChild(blok);
    });
    return s;
  }

  // -------------------------------------------------------------------------
  // Privacy
  // -------------------------------------------------------------------------

  function toonPrivacy() {
    tabs.hidden = !staat.rol;
    leeg(inhoud);
    voegToe(inhoud, [
      kop('Privacy'),
      el('p', { tekst: staat.teksten.privacy || PRIVACY_STANDAARD }),
      el('p', { tekst: 'De code is een eenvoudige drempel, zodat niet iedereen het rooster kan aanpassen. ' +
        'Het is geen echte beveiliging: vul dus niets in wat geheim moet blijven.' }),
      el('button', {
        type: 'button', class: 'knop', tekst: 'Terug',
        onclick: function () { if (staat.rol) ga(staat.scherm); else toonCodeScherm(); }
      })
    ]);
    inhoud.querySelector('h1').focus();
  }

  begin();
})();
