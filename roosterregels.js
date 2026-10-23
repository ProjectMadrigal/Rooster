/*
 * roosterregels.js — de regels die het voorstel voor het rooster maken.
 *
 * Dit bestand bevat geen toeval en geen AI: dezelfde invoer geeft altijd
 * hetzelfde voorstel. Het werkt zowel in de browser (als window.Roosterregels)
 * als in Node (met require), zodat de tests in tests/ het kunnen controleren.
 *
 * Woordenlijst
 *   avond          { datum: 'JJJJ-MM-DD', status: 'open' | 'gesloten' | 'workshop' | 'ander', event: '' }
 *   beschikbaarheid { naam, keuzes: { 'JJJJ-MM-DD': 'graag' | 'backup' | 'niet' },
 *                    max: getal of null (null = standaard), samenMet: '' of naam }
 *                  'graag' = wil die avond in de bib staan, 'backup' = enkel als back-up.
 *                  Een oude keuze 'kan' (kan als het moet) telt als 'backup'.
 *   vrijwilliger   { naam, ervaren: true/false }   (enkel goedgekeurde, actieve vrijwilligers)
 *   instellingen   { aantalVrijwilligers, aantalBackups, standaardMax, backupTeltMee,
 *                    nietTweeWekenNaElkaar, minstensEenErvaren, backupVerplicht }
 *
 * Harde grenzen (worden nooit overtreden):
 *   - enkel avonden met status "open" worden gepland;
 *   - niemand wordt ingepland op een avond waarvoor die "niet" koos of niets invulde;
 *   - wie "back-up" koos, komt op die avond enkel op de plaats van back-up;
 *   - niemand komt boven zijn of haar maximum aantal shiften.
 * Al de rest zijn voorkeuren, in deze volgorde van belang (zie sorteerSleutel):
 *   1. minstens één ervaren vrijwilliger per avond (enkel als die instelling aan staat);
 *   2. niet twee weken na elkaar (enkel als die instelling aan staat);
 *   3. duo's samen inplannen;
 *   4. wie minder shiften heeft, krijgt voorrang;
 *   5. bij een gelijke stand: alfabetisch, zodat het resultaat altijd hetzelfde is.
 * Back-ups: eerst wie "back-up" koos. Is er niemand, dan iemand die "graag" koos
 * en die avond nog niet ingepland staat.
 */
(function (globaal) {
  'use strict';

  var KEUZE_LABEL = { graag: 'graag', backup: 'back-up', niet: 'niet' };

  // Oude keuzes ('kan' = kan als het moet) tellen als 'backup'.
  function normaliseerKeuzes(keuzes) {
    var uit = {};
    Object.keys(keuzes || {}).forEach(function (d) { uit[d] = keuzes[d] === 'kan' ? 'backup' : keuzes[d]; });
    return uit;
  }

  // Zet de instellingen om naar vaste waarden, met de standaard uit de opdracht.
  function normaliseerInstellingen(i) {
    i = i || {};
    function getal(w, standaard) { return typeof w === 'number' && isFinite(w) ? w : standaard; }
    return {
      aantalVrijwilligers: getal(i.aantalVrijwilligers, 2),
      aantalBackups: getal(i.aantalBackups, 1),
      standaardMax: getal(i.standaardMax, 2),
      backupTeltMee: !!i.backupTeltMee,
      nietTweeWekenNaElkaar: i.nietTweeWekenNaElkaar !== false,
      minstensEenErvaren: !!i.minstensEenErvaren,
      backupVerplicht: !!i.backupVerplicht
    };
  }

  // Aantal dagen tussen twee datums 'JJJJ-MM-DD'.
  function dagenTussen(a, b) {
    function ms(d) { return Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)); }
    return Math.round((ms(b) - ms(a)) / 86400000);
  }

  // ["Sam", "Lou", "Kim"] wordt "Sam, Lou en Kim".
  function opsomming(namen) {
    if (namen.length <= 1) return namen.join('');
    return namen.slice(0, -1).join(', ') + ' en ' + namen[namen.length - 1];
  }

  function shiftenTekst(n) { return n === 1 ? '1 shift' : n + ' shiften'; }

  function vergelijk(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  // Vergelijk twee sorteersleutels (lijsten) element per element.
  function vergelijkSleutels(a, b) {
    for (var i = 0; i < a.length; i++) {
      var v = vergelijk(a[i], b[i]);
      if (v !== 0) return v;
    }
    return 0;
  }

  // Bereidt de gegevens voor: wie mag ingepland worden, met welk maximum.
  function bereidVoor(invoer) {
    var inst = normaliseerInstellingen(invoer.instellingen);
    var ervaren = {};
    (invoer.vrijwilligers || []).forEach(function (v) { ervaren[v.naam] = !!v.ervaren; });
    var mensen = (invoer.beschikbaarheden || [])
      .filter(function (b) { return Object.prototype.hasOwnProperty.call(ervaren, b.naam); })
      .map(function (b) {
        return {
          naam: b.naam,
          keuzes: normaliseerKeuzes(b.keuzes),
          max: typeof b.max === 'number' ? b.max : inst.standaardMax,
          samenMet: b.samenMet && Object.prototype.hasOwnProperty.call(ervaren, b.samenMet) ? b.samenMet : ''
        };
      })
      .sort(function (a, b) { return vergelijk(a.naam, b.naam); });
    var perNaam = {};
    mensen.forEach(function (p) { perNaam[p.naam] = p; });
    var avonden = (invoer.avonden || []).slice().sort(function (a, b) { return vergelijk(a.datum, b.datum); });
    return { inst: inst, ervaren: ervaren, mensen: mensen, perNaam: perNaam, avonden: avonden };
  }

  // Kan op deze avond komen: als vrijwilliger ('graag') of als back-up ('backup').
  function isBeschikbaar(p, datum) {
    var k = p.keuzes[datum];
    return k === 'graag' || k === 'backup';
  }

  // Wil op deze avond een gewone shift doen.
  function wilShift(p, datum) {
    return p.keuzes[datum] === 'graag';
  }

  // Twee mensen vormen een duo als minstens één van beiden de ander koos.
  function isDuo(ctx, a, b) {
    var pa = ctx.perNaam[a], pb = ctx.perNaam[b];
    return !!(pa && pb && (pa.samenMet === b || pb.samenMet === a));
  }

  // Maakt het voorstel. Geeft per avond de gekozen mensen, een motivatie,
  // waarschuwingen (iets ontbreekt of klopt niet) en meldingen (ter info).
  function maakVoorstel(invoer) {
    var ctx = bereidVoor(invoer);
    var inst = ctx.inst;
    var telling = {}, backupTelling = {};
    var rooster = {}, notities = {};
    ctx.avonden.forEach(function (a) {
      rooster[a.datum] = { vrijwilligers: [], backups: [] };
      notities[a.datum] = [];
    });
    var open = ctx.avonden.filter(function (a) { return a.status === 'open'; });

    // Shiften die meetellen voor het maximum.
    function shiften(naam) {
      return (telling[naam] || 0) + (inst.backupTeltMee ? (backupTelling[naam] || 0) : 0);
    }
    function staatEenWeekErnaast(naam, datum) {
      return open.some(function (a) {
        return Math.abs(dagenTussen(a.datum, datum)) === 7 && rooster[a.datum].vrijwilligers.indexOf(naam) >= 0;
      });
    }
    function aantalBeschikbaar(a) {
      return ctx.mensen.filter(function (p) { return wilShift(p, a.datum); }).length;
    }

    // Regel 3: eerst de avonden met de minste beschikbare mensen.
    var volgorde = open.slice().sort(function (a, b) {
      return aantalBeschikbaar(a) - aantalBeschikbaar(b) || vergelijk(a.datum, b.datum);
    });

    // De vrijwilligers, avond per avond, plaats per plaats.
    volgorde.forEach(function (a) {
      var gekozen = rooster[a.datum].vrijwilligers;
      for (var plaats = 0; plaats < inst.aantalVrijwilligers; plaats++) {
        var kandidaten = ctx.mensen.filter(function (p) {
          return wilShift(p, a.datum) && gekozen.indexOf(p.naam) < 0 && shiften(p.naam) < p.max;
        });
        if (!kandidaten.length) break;
        var ervarenNodig = inst.minstensEenErvaren && plaats === inst.aantalVrijwilligers - 1 &&
          !gekozen.some(function (n) { return ctx.ervaren[n]; });
        var sleutel = function (p) {
          var duo = gekozen.length
            ? gekozen.some(function (g) { return isDuo(ctx, g, p.naam); })
            : kandidaten.some(function (q) { return q !== p && isDuo(ctx, p.naam, q.naam); });
          return [
            ervarenNodig && !ctx.ervaren[p.naam] ? 1 : 0,
            inst.nietTweeWekenNaElkaar && staatEenWeekErnaast(p.naam, a.datum) ? 1 : 0,
            duo ? 0 : 1,
            shiften(p.naam),
            p.naam
          ];
        };
        kandidaten.sort(function (x, y) { return vergelijkSleutels(sleutel(x), sleutel(y)); });
        var keus = kandidaten[0];
        notities[a.datum].push({ naam: keus.naam, eerder: telling[keus.naam] || 0 });
        gekozen.push(keus.naam);
        telling[keus.naam] = (telling[keus.naam] || 0) + 1;
      }
    });

    // Regel 8: de back-ups, nadat alle vrijwilligers gekozen zijn.
    volgorde.forEach(function (a) {
      var r = rooster[a.datum];
      for (var plaats = 0; plaats < inst.aantalBackups; plaats++) {
        var kandidaten = ctx.mensen.filter(function (p) {
          return isBeschikbaar(p, a.datum) && r.vrijwilligers.indexOf(p.naam) < 0 &&
            r.backups.indexOf(p.naam) < 0 && (!inst.backupTeltMee || shiften(p.naam) < p.max);
        });
        if (!kandidaten.length) break;
        var sleutel = function (p) {
          return [p.keuzes[a.datum] === 'backup' ? 0 : 1, backupTelling[p.naam] || 0, shiften(p.naam), p.naam];
        };
        kandidaten.sort(function (x, y) { return vergelijkSleutels(sleutel(x), sleutel(y)); });
        r.backups.push(kandidaten[0].naam);
        backupTelling[kandidaten[0].naam] = (backupTelling[kandidaten[0].naam] || 0) + 1;
      }
    });

    var controle = controleerRooster(rooster, invoer);
    var avonden = ctx.avonden.map(function (a) {
      var r = rooster[a.datum];
      return {
        datum: a.datum,
        status: a.status,
        event: a.event || '',
        vrijwilligers: r.vrijwilligers,
        backups: r.backups,
        motivatie: a.status === 'open' ? schrijfMotivatie(ctx, a, r, notities[a.datum]) : '',
        waarschuwingen: controle[a.datum].waarschuwingen,
        meldingen: controle[a.datum].meldingen
      };
    });
    return { avonden: avonden };
  }

  // Schrijft de motivatie voor één avond, kort en in gewone taal.
  function schrijfMotivatie(ctx, avond, r, notities) {
    var zinnen = [];
    var namen = r.vrijwilligers;
    if (!namen.length) {
      zinnen.push('Niemand kon deze avond.');
    } else {
      zinnen.push(opsomming(namen) + '.');
      var keuzes = namen.map(function (n) { return ctx.perNaam[n].keuzes[avond.datum]; });
      var zin;
      if (namen.length > 1 && keuzes.every(function (k) { return k === keuzes[0]; })) {
        zin = (namen.length === 2 ? 'Allebei' : 'Allemaal') + " '" + KEUZE_LABEL[keuzes[0]] + "'";
      } else {
        zin = namen.map(function (n, i) { return n + " '" + KEUZE_LABEL[keuzes[i]] + "'"; }).join(', ');
      }
      if (namen.length === 2 && isDuo(ctx, namen[0], namen[1])) zin += ' en ze willen graag samen staan';
      zinnen.push(zin + '.');
      if (notities.every(function (n) { return n.eerder === 0; })) {
        zinnen.push(namen.length === 2 ? 'Geen van beiden had deze maand al een shift.'
          : namen.length === 1 ? namen[0] + ' had deze maand nog geen shift.'
            : 'Niemand van hen had deze maand al een shift.');
      } else {
        zinnen.push(notities.map(function (n, i) {
          var deel = n.eerder === 0 ? 'nog geen' : 'al ' + shiftenTekst(n.eerder);
          return i === 0 ? n.naam + ' had ' + deel + (n.eerder === 0 ? ' shift' : '') : n.naam + ' ' + deel;
        }).join(', ') + '.');
      }
      if (ctx.inst.minstensEenErvaren) {
        var ervaren = namen.filter(function (n) { return ctx.ervaren[n]; });
        if (ervaren.length) zinnen.push(opsomming(ervaren) + (ervaren.length === 1 ? ' is' : ' zijn') + ' ervaren.');
      }
    }
    if (r.backups.length) {
      zinnen.push('Back-up: ' + r.backups.map(function (n) {
        return n + " ('" + KEUZE_LABEL[ctx.perNaam[n].keuzes[avond.datum]] + "')";
      }).join(', ') + '.');
    } else if (ctx.inst.aantalBackups > 0) {
      zinnen.push('Geen back-up gevonden.');
    }
    return zinnen.join(' ');
  }

  // Controleert een rooster (een voorstel of een met de hand aangepast rooster).
  // rooster: { 'JJJJ-MM-DD': { vrijwilligers: [...], backups: [...] } }
  // Geeft per datum { waarschuwingen: [...], meldingen: [...] }.
  function controleerRooster(rooster, invoer) {
    var ctx = bereidVoor(invoer);
    var inst = ctx.inst;
    var uit = {};
    var aantal = {};
    ctx.avonden.forEach(function (a) {
      var r = rooster[a.datum] || { vrijwilligers: [], backups: [] };
      r.vrijwilligers.forEach(function (n) { if (n) aantal[n] = (aantal[n] || 0) + 1; });
      if (inst.backupTeltMee) r.backups.forEach(function (n) { if (n) aantal[n] = (aantal[n] || 0) + 1; });
    });

    ctx.avonden.forEach(function (a) {
      var w = [], m = [];
      var r = rooster[a.datum] || { vrijwilligers: [], backups: [] };
      var v = r.vrijwilligers.filter(Boolean), b = r.backups.filter(Boolean);
      uit[a.datum] = { waarschuwingen: w, meldingen: m };
      if (a.status !== 'open') {
        if (v.length || b.length) w.push('Deze avond is niet open, maar er staat toch iemand ingepland.');
        return;
      }
      if (v.length < inst.aantalVrijwilligers) {
        w.push(v.length === 0
          ? 'Er staat niemand op deze avond. Er zijn ' + inst.aantalVrijwilligers + ' vrijwilligers nodig.'
          : 'Er staat maar ' + v.length + ' vrijwilliger op deze avond. Er zijn er ' + inst.aantalVrijwilligers + ' nodig.');
      }
      if (b.length < inst.aantalBackups) {
        (inst.backupVerplicht ? w : m).push('Er is geen back-up voor deze avond.');
      }
      var alle = v.concat(b);
      alle.forEach(function (n, i) {
        if (alle.indexOf(n) !== i) w.push(n + ' staat twee keer op deze avond.');
      });
      alle.forEach(function (n) {
        var p = ctx.perNaam[n];
        if (!Object.prototype.hasOwnProperty.call(ctx.ervaren, n)) {
          w.push(n + ' staat niet in de lijst van actieve vrijwilligers.');
        } else if (!p || !p.keuzes[a.datum]) {
          m.push(n + ' vulde voor deze avond niets in.');
        } else if (p.keuzes[a.datum] === 'niet') {
          w.push(n + " koos 'niet' voor deze avond.");
        } else if (p.keuzes[a.datum] === 'backup' && v.indexOf(n) >= 0) {
          m.push(n + " koos enkel 'back-up' voor deze avond.");
        }
      });
      v.concat(inst.backupTeltMee ? b : []).forEach(function (n) {
        var p = ctx.perNaam[n];
        if (p && aantal[n] > p.max) {
          w.push(n + ' staat ' + aantal[n] + ' keer ingepland, maar wil maximum ' + p.max + '.');
        }
      });
      if (inst.nietTweeWekenNaElkaar) {
        v.forEach(function (n) {
          var ernaast = ctx.avonden.some(function (x) {
            var rx = rooster[x.datum];
            return Math.abs(dagenTussen(x.datum, a.datum)) === 7 && rx && rx.vrijwilligers.indexOf(n) >= 0;
          });
          if (ernaast) m.push(n + ' staat ook een week ervoor of erna.');
        });
      }
      if (inst.minstensEenErvaren && v.length && !v.some(function (n) { return ctx.ervaren[n]; })) {
        w.push('Er staat geen ervaren vrijwilliger op deze avond.');
      }
    });
    return uit;
  }

  // Stelt een vervanger voor wanneer iemand zich afmeldt.
  // Geeft { naam, uitleg }. naam is '' als er niemand gevonden is.
  function stelVervangingVoor(datum, afgemeld, rooster, invoer) {
    var ctx = bereidVoor(invoer);
    var r = rooster[datum] || { vrijwilligers: [], backups: [] };
    var wasBackup = r.backups.indexOf(afgemeld) >= 0;
    if (!wasBackup) {
      var backup = r.backups.filter(function (n) { return n && n !== afgemeld; })[0];
      if (backup) return { naam: backup, uitleg: backup + ' is back-up op deze avond.' };
    }
    var aantal = {};
    Object.keys(rooster).forEach(function (d) {
      rooster[d].vrijwilligers.forEach(function (n) { if (n) aantal[n] = (aantal[n] || 0) + 1; });
      if (ctx.inst.backupTeltMee) rooster[d].backups.forEach(function (n) { if (n) aantal[n] = (aantal[n] || 0) + 1; });
    });
    var bezet = r.vrijwilligers.concat(r.backups);
    var kandidaten = ctx.mensen.filter(function (p) {
      return isBeschikbaar(p, datum) && bezet.indexOf(p.naam) < 0 && (wasBackup || (aantal[p.naam] || 0) < p.max);
    });
    if (!kandidaten.length) return { naam: '', uitleg: 'Er is niemand anders beschikbaar die nog plaats heeft.' };
    kandidaten.sort(function (x, y) {
      return vergelijkSleutels(
        // Wie 'back-up' koos, bood aan om in te springen: die eerst.
        [x.keuzes[datum] === 'backup' ? 0 : 1, aantal[x.naam] || 0, x.naam],
        [y.keuzes[datum] === 'backup' ? 0 : 1, aantal[y.naam] || 0, y.naam]);
    });
    var k = kandidaten[0];
    return {
      naam: k.naam,
      uitleg: k.naam + " koos '" + KEUZE_LABEL[k.keuzes[datum]] + "' en staat deze maand " +
        ((aantal[k.naam] || 0) === 0 ? 'nog nergens' : shiftenTekst(aantal[k.naam])) + ' ingepland.'
    };
  }

  var api = {
    KEUZE_LABEL: KEUZE_LABEL,
    maakVoorstel: maakVoorstel,
    controleerRooster: controleerRooster,
    stelVervangingVoor: stelVervangingVoor
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globaal.Roosterregels = api;
})(this);
