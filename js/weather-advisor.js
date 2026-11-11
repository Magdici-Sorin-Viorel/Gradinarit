/*
 * Garden advice from the weather forecast (rules engine, no AI).
 *
 * Compares the 7-day Open-Meteo forecast with:
 *  - the monthly calendar (what is planted / sown / in bloom this month),
 *  - each plant's own needs (frost class, minimum soil temperature, minimum night temperature),
 *  - the plants in "My garden".
 * Every advice is deterministic and says WHY (the numbers that triggered it).
 *
 * Levels: 'warn'  = Avertizare (postpone a job / protect plants)
 *         'watch' = Atenție (conditions to keep an eye on)
 *         'rec'   = Recomandare (a job that suits the weather now)
 *
 * Plant-specific thresholds come from the plant data (sources in sources.js).
 * General thresholds for rain, wind, heat and humidity are the app's own orientative
 * values; they are marked as such in the interface.
 */
(function () {
  // General orientative thresholds (not from a source – shown as "prag orientativ" in the UI).
  var T = {
    frostRiskMin: 3,      // °C air: ground frost is still possible at 1–4 °C (RHS)
    rainSkipWater: 5,     // mm in 24 h: skip watering
    rainHeavy: 15,        // mm in 24 h: wet soil, postpone sowing / planting
    rain3Heavy: 25,       // mm in 3 days
    heat: 32,             // °C max: heat stress
    hot: 25,              // °C max: used for "dry and warm"
    dryWeek: 2,           // mm in 7 days: dry spell
    windMax: 40,          // km/h sustained
    gust: 50,             // km/h gusts
    humid: 85,            // % mean relative humidity
    wetDays: 3,           // days with ≥1 mm rain in the week
    waterEdge: 5          // mm of water deficit (rain minus ET0) below which the soil is 'borderline'
  };

  var DAYS = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  /** "azi", "mâine" or the weekday, from the date itself (the second argument is kept for old calls). */
  function dayName(iso) {
    var diff = Math.round((new Date(iso + 'T12:00:00') - new Date(todayIso() + 'T12:00:00')) / 86400000);
    if (diff === 0) return 'azi';
    if (diff === 1) return 'mâine';
    if (diff === -1) return 'ieri';
    return DAYS[new Date(iso + 'T12:00:00').getDay()];
  }
  var MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  /** "MM-DD" -> "12 aprilie". */
  function mdName(md) { return md ? (+md.slice(3)) + ' ' + MONTHS_RO[+md.slice(0, 2) - 1] : ''; }

  /**
   * The forecast as seen from day i (0 = today): the days and hours from that day on, and the
   * 3 days before it (real past days from the API, then forecast days) for the water balance.
   */
  function shift(fc, i) {
    if (!fc || !i) return fc;
    var d = fc.days[i];
    if (!d) return fc;
    var start = d.date + 'T00:00';
    return {
      days: fc.days.slice(i), hours: fc.hours.filter(function (h) { return h.time >= start; }),
      past: (fc.past || []).concat(fc.days.slice(0, i).map(function (x) {
        return { date: x.date, rain: x.rainDay != null ? x.rainDay : x.rain, et0: x.et0, tmin: x.tminDay != null ? x.tminDay : x.tmin, tmax: x.tmax };
      })).slice(-3),
      current: null, elevation: fc.elevation, from: i
    };
  }

  /**
   * Water balance (mm = litres per m²): rain minus reference evapotranspiration (FAO-56 ET0,
   * from Open-Meteo) for the last 3 days plus the first 3 forecast days.
   * Returns null when the forecast has no ET0.
   */
  function waterBalance(fc) {
    var list = (fc.past || []).concat(fc.days.slice(0, 3).map(function (d) {
      return { date: d.date, rain: d.rainDay != null ? d.rainDay : d.rain, et0: d.et0 };
    }));
    var ok = list.filter(function (d) { return d.et0 != null && d.rain != null; });
    if (ok.length < 4) return null;
    var rain = sum(ok.map(function (d) { return d.rain; })), et = sum(ok.map(function (d) { return d.et0; }));
    var pastOk = ok.filter(function (d) { return (fc.past || []).indexOf(d) > -1; });
    return { rain: rain, et0: et, bal: rain - et, n: ok.length, nPast: pastOk.length };
  }

  /** A day that suits garden work: no frost, no heavy rain, no strong wind, no heat, no hail. */
  function goodDay(d) {
    if (!d || d.tmin == null || d.tmax == null) return false;
    return d.tmin > 0 && (d.rain || 0) < T.rainSkipWater && (d.prob == null || d.prob < 60) &&
      d.wind < T.windMax && (d.gust == null || d.gust < T.gust) && d.tmax < T.heat && d.code !== 95 && d.code !== 96 && d.code !== 99;
  }
  function r1(n) { return n == null ? '?' : String(Math.round(n * 10) / 10).replace('.', ','); }
  function names(list) { return list.map(function (p) { return p.name; }).join(', '); }
  function sum(a) { return a.reduce(function (s, x) { return s + (x || 0); }, 0); }
  function mean(a) { var v = a.filter(function (x) { return x != null; }); return v.length ? sum(v) / v.length : null; }
  function minOf(a) { var v = a.filter(function (x) { return x != null; }); return v.length ? Math.min.apply(null, v) : null; }

  /** Mean modelled soil temperature at 6 cm over the next 72 h (null if the API gave none). */
  function soil6(fc) {
    return mean(fc.hours.slice(0, 72).map(function (h) { return h.soil6; }));
  }

  /** Hours with air temperature ≤ 0 °C in the next 72 h, grouped as readable ranges. */
  function frostHours(fc) {
    var out = [], cur = null;
    fc.hours.slice(0, 72).forEach(function (h) {
      if (h.t != null && h.t <= 0) {
        if (!cur) { cur = { from: h.time, to: h.time, min: h.t }; out.push(cur); }
        else { cur.to = h.time; cur.min = Math.min(cur.min, h.t); }
      } else cur = null;
    });
    return out;
  }

  /** Median / earliest / latest of a list of "MM-DD" strings. */
  function mdStats(list) {
    if (!list.length) return null;
    var a = list.slice().sort();
    return { median: a[Math.floor((a.length - 1) / 2)], earliest: a[0], latest: a[a.length - 1], n: a.length };
  }
  /** Summary of the frost history (see WEATHER.loadHistory). */
  function frostStats(hist) {
    if (!hist || !hist.years || hist.years.length < 5) return null;
    var Y = hist.years;
    return {
      n: Y.length,
      last: mdStats(Y.map(function (y) { return y.last; }).filter(Boolean)),
      first: mdStats(Y.map(function (y) { return y.first; }).filter(Boolean)),
      noSpring: Y.filter(function (y) { return !y.last; }).length,
      years: Y
    };
  }

  // Critical watering stages (RHS – Watering vegetables and fruit).
  var CRIT = {
    mazare: 'la înflorire, ca să lege păstăile, și din nou după 2 săptămâni',
    'fasole-pastai': 'umezeală constantă ca să lege păstăile',
    dovlecei: 'umezeală constantă până la recoltare',
    vinete: 'udare regulată la înflorire și rodire', porumb: 'udare regulată la înflorire și rodire', rosii: 'udare regulată la înflorire și rodire',
    varza: 'când începe să facă căpățâna', salata: 'când începe să facă căpățâna; dacă nu poți uda des, măcar la stadiul de rozetă',
    conopida: 'la stadiul de rozetă', cartofi: 'când se formează tuberculii, chiar înainte de înflorire; apoi la 10–14 zile',
    morcov: 'înainte să se usuce solul (de ex. după 14 zile fără ploaie); prea multă apă îi crapă', sfecla: 'înainte să se usuce solul (de ex. după 14 zile fără ploaie)',
    pastarnac: 'înainte să se usuce solul (de ex. după 14 zile fără ploaie)', ridichi: 'săptămânal pe secetă',
    ceapa: 'doar cât se prinde și pe secetă mare', praz: 'doar cât se prinde și pe secetă mare',
    capsuni: 'bine udate de la înflorire până la recoltare', afin: 'bine udate de la înflorire până la recoltare', zmeur: 'bine udate de la înflorire până la recoltare'
  };

  /** Watering advice from the water balance, grouped by kind of plant (RHS). */
  function waterAdvice(wb, ctx, d3) {
    var G = ctx.garden || {}, P = ctx.plants, m = ctx.month;
    var mine = P.filter(function (p) { var g = G[p.id]; return g && (g.status === 'planted' || g.status === 'have'); });
    var thisYear = String(new Date().getFullYear());
    var young = mine.filter(function (p) {
      var g = G[p.id];
      return (p.cat === 'trees' || p.cat === 'shrubs' || p.cat === 'vines' || p.cat === 'climbers') && g.status === 'planted' && (!g.date || g.date.slice(0, 4) >= String(+thisYear - 2));
    });
    var veg = mine.filter(function (p) { return p.cat === 'vegetables' || CRIT[p.id]; });
    var crit = veg.filter(function (p) { return CRIT[p.id] && (p.harvest.indexOf(m) > -1 || p.bloom.indexOf(m) > -1 || p.plant.indexOf(m) > -1); });
    var annual = mine.filter(function (p) { return /Anual/.test(p.life || '') && p.cat !== 'vegetables'; });
    var head = 'Ultimele ' + wb.nPast + ' zile și următoarele ' + (wb.n - wb.nPast) + ': ploaie ' + r1(wb.rain) + ' mm, evaporare ' + r1(wb.et0) + ' mm' +
      ' (evapotranspirația de referință FAO-56, adică pierderea de apă a unui gazon bine udat; 1 mm = 1 litru pe m²).';
    var how = [];
    how.push({ t: 'Verifică solul înainte să uzi: la legume sapă cât lama cazmalei și simte dacă e umed; în straturi și la flori anuale trebuie să fie umed la 15 cm; ghivecele le uzi când pământul e uscat la 2–3 cm sub suprafață.', src: ['rhs_watering', 'rhs_vegwater'] });
    if (crit.length) how.push({ t: 'Etape în care apa contează cel mai mult: ' + crit.map(function (p) { return p.name + ' – ' + CRIT[p.id]; }).join('; ') + '.', ids: crit.map(function (p) { return p.id; }), src: ['rhs_vegwater'] });
    if (young.length) how.push({ t: 'Pomi și arbuști plantați de curând (primul an, cei mari până la 3 veri): udă pe secetă, ca solul să fie umed la 20–30 cm: ' + names(young) + '.', ids: young.map(function (p) { return p.id; }), src: ['rhs_watering'] });
    if (annual.length) how.push({ t: 'Flori anuale: au nevoie de apă pe vreme secetoasă: ' + names(annual) + '.', ids: annual.map(function (p) { return p.id; }), src: ['rhs_watering'] });
    how.push({ t: 'Pomii, arbuștii și perenele bine prinse se udă doar pe secetă mare. Udă dimineața devreme, la rădăcină, nu pe frunze și nu la prânz.', src: ['rhs_watering'] });
    var rainSoon = sum(d3.slice(0, 2).map(function (d) { return d.rain; }));
    if (wb.bal >= 0) {
      return { lvl: 'rec', icon: '💧', title: 'Ploaia a acoperit evaporarea: +' + r1(wb.bal) + ' mm', why: head + ' Plantele din sol nu au nevoie de udare acum; ghivecele verifică-le oricum.', items: [], src: ['openmeteo_et0'] };
    }
    var d = -wb.bal;
    if (d < T.waterEdge) {
      return { lvl: 'watch', icon: '💧', title: 'Apa din sol e la limită: deficit de ' + r1(d) + ' mm', why: head + ' Prag orientativ al aplicației: ' + T.waterEdge + ' mm.', items: how, src: ['openmeteo_et0'] };
    }
    return {
      lvl: 'watch', icon: '💧', title: 'Solul pierde apă: deficit de ' + r1(d) + ' mm (≈ ' + Math.round(d) + ' l/m²)',
      why: head + (rainSoon >= T.rainSkipWater ? ' Vine ploaie în următoarele 2 zile (' + r1(rainSoon) + ' mm) – poți aștepta, dacă solul nu e uscat.' : '') + ' Prag orientativ al aplicației: ' + T.waterEdge + ' mm.',
      items: how, src: ['openmeteo_et0']
    };
  }

  /**
   * Builds the list of advice.
   * ctx = { fc, month, plants, garden, orchard }
   */
  function advise(ctx) {
    var fc = shift(ctx.fc, ctx.day || 0), m = ctx.month, P = ctx.plants, G = ctx.garden || {};
    if (!fc || !fc.days.length) return [];
    var days = fc.days.slice(0, 7);
    var d3 = days.slice(0, 3);
    var out = [];
    var inGarden = function (p) { return !!G[p.id]; };
    var gardenFirst = function (a, b) { return (inGarden(b) ? 1 : 0) - (inGarden(a) ? 1 : 0) || a.name.localeCompare(b.name, 'ro'); };

    // Plants whose calendar says "plant/sow now" (or "possible now if the weather allows").
    var plantNow = P.filter(function (p) { return p.plant.indexOf(m) > -1 || (p.early && p.early.indexOf(m) > -1); });
    var tenderNow = plantNow.filter(function (p) { return p.frost === 'tender'; }).sort(gardenFirst);
    var hardyNow = plantNow.filter(function (p) { return p.frost === 'hardy'; }).sort(gardenFirst);
    var treesNow = plantNow.filter(function (p) { return p.cat === 'trees' || p.cat === 'shrubs' || p.cat === 'vines'; }).sort(gardenFirst);
    // Fruit trees / bushes in bloom this month (blossom is the part most hurt by frost).
    var bloomFruit = P.filter(function (p) {
      return (p.cat === 'trees' || p.cat === 'shrubs' || p.cat === 'vines') && p.bloom.indexOf(m) > -1;
    }).sort(gardenFirst);
    // Frost-tender plants already in the ground in the warm season.
    var tenderPlanted = P.filter(function (p) {
      var g = G[p.id];
      return p.frost === 'tender' && g && (g.status === 'planted' || g.status === 'have') && m >= 4 && m <= 10;
    });

    var min3 = minOf(d3.map(function (d) { return d.tmin; }));
    var min7 = minOf(days.map(function (d) { return d.tmin; }));
    var max7 = Math.max.apply(null, days.map(function (d) { return d.tmax; }));
    // Rain in the next 24 hours (hourly data), not the whole calendar day.
    var rain24 = sum(fc.hours.slice(0, 24).map(function (h) { return h.rain; }));
    var rain3 = sum(d3.map(function (d) { return d.rain; }));
    var rain7 = sum(days.map(function (d) { return d.rain; }));
    var frostDays = days.filter(function (d) { return d.tmin != null && d.tmin <= 0; });
    var soil = soil6(fc);

    // ---- 1. Frost --------------------------------------------------------
    if (frostDays.length && frostDays[0] && days.indexOf(frostDays[0]) <= 2) {
      var fd = frostDays.filter(function (d) { return days.indexOf(d) <= 2; });
      var items = [];
      var fh = frostHours(fc);
      if (fh.length) {
        items.push({ t: 'Ore cu îngheț: ' + fh.map(function (x) {
          return dayName(x.from.slice(0, 10), days.findIndex(function (d) { return d.date === x.from.slice(0, 10); })) + ' ' + x.from.slice(11, 16) + '–' + x.to.slice(11, 16) + ' (min ' + r1(x.min) + ' °C)';
        }).join('; ') + '.' });
      }
      if (tenderNow.length) items.push({ t: 'Amână plantarea/semănatul plantelor sensibile: ' + names(tenderNow) + '.', ids: tenderNow.map(function (p) { return p.id; }), src: ['rhs_tender'] });
      if (tenderPlanted.length) items.push({ t: 'Acoperă peste noapte cu agrotextil (un strat gros dă cam 2 °C protecție; pe nopțile cele mai reci, dublu): ' + names(tenderPlanted) + '.', ids: tenderPlanted.map(function (p) { return p.id; }), src: ['rhs_tender'] });
      if (bloomFruit.length) items.push({ t: 'Florile sunt partea cea mai sensibilă. Pomii și arbuștii mici înfloriți se acoperă peste noapte și se descoperă ziua, pentru albine: ' + names(bloomFruit) + '.', ids: bloomFruit.map(function (p) { return p.id; }), src: ['rhs_frostfruit', 'rhs_frost'] });
      if (hardyNow.length) items.push({ t: 'Suportă frigul (le poți semăna/planta în continuare, nu în sol înghețat): ' + names(hardyNow) + '.', ids: hardyNow.map(function (p) { return p.id; }) });
      if (treesNow.length) items.push({ t: 'Pomii și arbuștii nu se plantează în sol înghețat: așteaptă dezghețul.', src: ['dedeman_plant'] });
      var fig = P.filter(function (p) { return p.id === 'smochin' && inGarden(p); });
      if (fig.length && (m >= 10 || m <= 3)) items.push({ t: 'Smochin: după căderea frunzelor, învelește-l cu paie și agrotextil; ghivecele la adăpost, neîncălzit.', ids: ['smochin'], src: ['rhs_fig'] });
      items.push({ t: 'Nu da hrană bogată în azot târziu în sezon și nu tăia imediat ce a înghețat: taie părțile afectate abia după ce trece riscul de îngheț.', src: ['rhs_frost'] });
      out.push({
        lvl: 'warn', icon: '❄️', title: 'Îngheț ' + fd.map(function (d) { return dayName(d.date, days.indexOf(d)); }).join(', ') + ' (min ' + r1(min3) + ' °C)',
        why: 'Prognoza dă temperaturi minime sub 0 °C în următoarele 3 zile.', items: items
      });
    } else if (min3 != null && min3 <= T.frostRiskMin) {
      out.push({
        lvl: 'watch', icon: '🌡️', title: 'Nopți reci: risc de brumă la sol (min ' + r1(min3) + ' °C)',
        why: 'La 1–4 °C în aer poate apărea brumă la nivelul solului. Prag orientativ: ' + T.frostRiskMin + ' °C.',
        items: tenderPlanted.length ? [{ t: 'Pregătește agrotextil pentru: ' + names(tenderPlanted) + '.', ids: tenderPlanted.map(function (p) { return p.id; }), src: ['rhs_tender'] }] : [],
        src: ['rhs_tender']
      });
    }

    // ---- 1b. Forecast colder than a garden plant's RHS hardiness rating ----
    var tooCold = min7 == null ? [] : P.filter(function (p) {
      var g = G[p.id];
      return p.hardy && g && (g.status === 'planted' || g.status === 'have') && min7 < p.hardy.min;
    }).sort(function (a, b) { return b.hardy.min - a.hardy.min; });
    if (tooCold.length) {
      out.push({
        lvl: 'warn', icon: '🥶', title: 'Mai frig decât suportă unele plante din grădina ta (min ' + r1(min7) + ' °C)',
        why: 'Minima din prognoză coboară sub limita clasei de rezistență RHS a plantei. Clasa e orientativă: plantele tinere, cele din ghiveci și cele pe sol ud suferă mai repede.',
        items: [
          { t: tooCold.map(function (p) { return p.name + ' (RHS ' + p.hardy.r + ', până la ' + p.hardy.min + ' °C)'; }).join(', ') + '.', ids: tooCold.map(function (p) { return p.id; }), src: ['rhs_hardiness'] },
          { t: 'Plantele din ghiveci se mută la adăpost sau ghivecele se învelesc; peste rădăcinile celor din sol pui mulci gros, iar plantele mici le acoperi cu agrotextil în nopțile reci.', src: ['rhs_frost'] }
        ],
        src: ['rhs_hardiness']
      });
    }

    // ---- 2. Nights too cold for tender plants (no frost, but below their own minimum) ----
    if (!frostDays.length && tenderNow.length && min7 != null) {
      var cold = tenderNow.filter(function (p) { return p.nightMin && min7 < p.nightMin; });
      var ok = tenderNow.filter(function (p) { return !p.nightMin || min7 >= p.nightMin; });
      if (cold.length) {
        out.push({
          lvl: 'warn', icon: '🌙', title: 'Încă e prea frig noaptea pentru: ' + names(cold),
          why: 'Cea mai rece noapte din următoarele 7 zile: ' + r1(min7) + ' °C. Aceste plante vor nopți constant peste ' +
            cold.map(function (p) { return p.name + ' ' + p.nightMin + ' °C'; }).join(', ') + '.',
          items: [{ t: 'Nu le planta încă în câmp. Așteaptă încălzirea și verifică temperatura solului. Între timp călește răsadurile (2–3 săptămâni).', ids: cold.map(function (p) { return p.id; }), src: ['rhs_tender', 'rhs_hardening'] }]
        });
      }
      if (ok.length && !cold.length) {
        // handled by the "good window" block below
      }
    }

    // ---- 3. Soil temperature for direct sowing (modelled values) ----------
    var sowNow = plantNow.filter(function (p) { return p.soilT && (p.mode === 'direct' || p.mode === 'both'); });
    if (sowNow.length) {
      if (soil == null) {
        out.push({ lvl: 'watch', icon: '🌱', title: 'Temperatura solului nu e disponibilă', why: 'Prognoza nu are date de sol pentru localitatea aleasă. Măsoar-o local, cu un termometru de sol, înainte de semănat.', items: [] });
      } else {
        var tooCold = sowNow.filter(function (p) { return soil < p.soilT[0]; });
        var slow = sowNow.filter(function (p) { return soil >= p.soilT[0] && soil < p.soilT[1]; });
        var warm = sowNow.filter(function (p) { return soil >= p.soilT[1]; });
        var why = 'Solul la 6 cm: în medie ' + r1(soil) + ' °C în următoarele 3 zile (valoare estimată de modelul meteo, nu măsurată – verifică cu un termometru de sol).';
        if (tooCold.length) out.push({ lvl: 'warn', icon: '🌱', title: 'Sol prea rece pentru semănat: ' + names(tooCold), why: why,
          items: tooCold.map(function (p) { return { t: p.name + ': încolțește de la minimum ' + r1(p.soilT[0]) + ' °C. Amână semănatul.', ids: [p.id], src: ['osu_soiltemp'] }; }) });
        if (slow.length) out.push({ lvl: 'watch', icon: '🐢', title: 'Semințele încolțesc încet: ' + names(slow), why: why,
          items: slow.map(function (p) { return { t: p.name + ': peste minimul de ' + r1(p.soilT[0]) + ' °C, dar sub ' + r1(p.soilT[1]) + ' °C – răsare încet.', ids: [p.id], src: ['osu_soiltemp'] }; }) });
        if (warm.length && !frostDays.length) out.push({ lvl: 'rec', icon: '🌱', title: 'Sol suficient de cald pentru semănat: ' + names(warm), why: why,
          items: [{ t: 'Verifică totuși solul local și să nu fie îmbibat cu apă.', ids: warm.map(function (p) { return p.id; }), src: ['osu_soiltemp'] }] });
      }
    }

    // ---- 4. Rain --------------------------------------------------------
    if (rain24 >= T.rainHeavy || rain3 >= T.rain3Heavy) {
      out.push({
        lvl: 'watch', icon: '🌧️', title: 'Ploi abundente: ' + r1(rain24) + ' mm în 24 de ore, ' + r1(rain3) + ' mm în 3 zile',
        why: 'Prag orientativ: ' + T.rainHeavy + ' mm într-o zi sau ' + T.rain3Heavy + ' mm în 3 zile.',
        items: [
          { t: 'Amână semănatul, plantarea și lucrul solului cât e îmbibat; nu călca pe straturile ude.', src: ['rhs_waterlog'] },
          { t: 'Nu pune compost sau gunoi pe sol îmbibat.', src: ['rhs_organicmatter'] },
          { t: 'Nu e nevoie de udare.' }
        ]
      });
    } else if (rain24 >= T.rainSkipWater) {
      out.push({ lvl: 'rec', icon: '💧', title: 'Amână udarea: se anunță ' + r1(rain24) + ' mm în următoarele 24 de ore',
        why: 'Dacă solul e deja umed, ploaia ajunge. Prag orientativ: ' + T.rainSkipWater + ' mm.', items: [] });
    }

    // ---- 5. Heat and drought ----------------------------------------------
    if (max7 >= T.heat) {
      var hot = days.filter(function (d) { return d.tmax >= T.heat; });
      out.push({
        lvl: 'warn', icon: '🔥', title: 'Caniculă: până la ' + r1(max7) + ' °C (' + hot.map(function (d) { return dayName(d.date, days.indexOf(d)); }).join(', ') + ')',
        why: 'Prag orientativ: ' + T.heat + ' °C.',
        items: [
          { t: 'Verifică umiditatea solului la 5–10 cm adâncime înainte să uzi; udă dimineața devreme sau seara, nu la prânz.' },
          { t: 'Pune mulci organic de 5–7,5 cm după udare, ca să ții apa în sol.', src: ['rhs_vegwater'] },
          { t: 'Atenție mai ales la răsaduri, plantele proaspăt plantate și legumele cu fruct (udarea neregulată dă putregaiul vârfului la roșii).', src: ['rhs_vegwater'] }
        ]
      });
    }
    var wb = waterBalance(fc);
    if (wb && m >= 3 && m <= 10) {
      var wa = waterAdvice(wb, ctx, d3);
      if (!(wa.lvl === 'rec' && rain24 >= T.rainSkipWater)) out.push(wa);
    } else if (!wb && rain7 < T.dryWeek && max7 >= T.hot && max7 < T.heat) {
      out.push({
        lvl: 'watch', icon: '☀️', title: 'Săptămână secetoasă: ' + r1(rain7) + ' mm de ploaie în 7 zile',
        why: 'Maxime până la ' + r1(max7) + ' °C și aproape fără ploaie. Praguri orientative.',
        items: [{ t: 'Verifică solul înainte să uzi; udă plantele tinere și legumele cu fruct; mulcește.', src: ['rhs_vegwater'] }]
      });
    }

    // ---- 6. Wind ---------------------------------------------------------
    var windy = days.filter(function (d) { return (d.gust != null && d.gust >= T.gust) || d.wind >= T.windMax; });
    if (windy.length && days.indexOf(windy[0]) <= 3) {
      var wmax = Math.max.apply(null, windy.map(function (d) { return d.gust != null ? d.gust : d.wind; }));
      out.push({
        lvl: 'warn', icon: '💨', title: 'Vânt puternic ' + windy.map(function (d) { return dayName(d.date, days.indexOf(d)); }).join(', ') + ' (rafale până la ' + Math.round(wmax) + ' km/h)',
        why: 'Prag orientativ: rafale de ' + T.gust + ' km/h sau vânt de ' + T.windMax + ' km/h.',
        items: [
          { t: 'Verifică aracii și legăturile pomilor tineri, ale plantelor înalte (roșii, porumb, floarea-soarelui) și ale cățărătoarelor.' },
          { t: 'Prinde bine agrotextilul și plasele.' },
          { t: 'Amână stropirile (inclusiv cele biologice, de ex. nematozii): vântul le duce în altă parte.' }
        ]
      });
    }

    // ---- 7. Hail ---------------------------------------------------------
    var hail = days.filter(function (d) { return d.code === 96 || d.code === 99; });
    if (hail.length) {
      out.push({ lvl: 'warn', icon: '⛈️', title: 'Furtună cu grindină posibilă ' + hail.map(function (d) { return dayName(d.date, days.indexOf(d)); }).join(', '),
        why: 'Prognoza dă cod de furtună cu grindină. Prognozele de grindină sunt nesigure.',
        items: [{ t: 'Adu ghivecele și răsadurile la adăpost; acoperă ce poți (plasă, agrotextil prins bine).' }] });
    }

    // ---- 8. Long humid spell: fungal diseases possible --------------------
    var wetDays = days.filter(function (d) { return (d.rain || 0) >= 1; }).length;
    var rh = mean(fc.hours.slice(0, 72).map(function (h) { return h.rh; }));
    if (wetDays >= T.wetDays && rh != null && rh >= T.humid && m >= 3 && m <= 10) {
      out.push({
        lvl: 'watch', icon: '🍄', title: 'Vreme umedă mai multe zile: condiții bune pentru boli din ciuperci',
        why: wetDays + ' zile cu ploaie în 7 zile și umiditate medie ' + Math.round(rh) + '% în următoarele 3 zile. Asta NU înseamnă că boala va apărea.',
        items: [
          { t: 'Aerisește solariile și culturile acoperite.' },
          { t: 'Urmărește roșiile și cartofii (mana), mărul și părul (rapănul), vița de vie.', src: ['rhs_tomatoblight', 'rhs_scab'] },
          { t: 'Scoate la timp frunzele bolnave; nu uda pe frunze.' }
        ]
      });
    }

    // ---- 9. Good window for the jobs of the month -------------------------
    var calm = !frostDays.length && rain24 < T.rainHeavy && rain3 < T.rain3Heavy && !windy.length && max7 < T.heat;
    if (calm) {
      var goodTender = tenderNow.filter(function (p) { return !p.nightMin || min7 >= p.nightMin; })
        .filter(function (p) { return !(p.soilT && soil != null && soil < p.soilT[0]); });
      var goodHardy = hardyNow;
      var it = [];
      if (goodTender.length) it.push({ t: 'Plante sensibile, nopți destul de calde toată săptămâna (min ' + r1(min7) + ' °C): ' + names(goodTender) + '.', ids: goodTender.map(function (p) { return p.id; }), src: ['rhs_tender'] });
      if (goodHardy.length) it.push({ t: 'Culturi care suportă frigul: ' + names(goodHardy) + '.', ids: goodHardy.map(function (p) { return p.id; }) });
      if (treesNow.length) it.push({ t: 'Plantare de pomi și arbuști (sol neînghețat, nu îmbibat): ' + names(treesNow.slice(0, 8)) + (treesNow.length > 8 ? '…' : '') + '.', ids: treesNow.map(function (p) { return p.id; }), src: ['dedeman_plant'] });
      if (it.length) out.push({ lvl: 'rec', icon: '✅', title: 'Vreme potrivită pentru lucrările lunii', why: 'Fără îngheț, ploi mari, vânt puternic sau caniculă în prognoza pe 7 zile.', items: it });
    }

    // ---- 10. Whitewash day (twice a year) ---------------------------------
    var O = ctx.orchard;
    if (O && O.lime.indexOf(m) > -1) {
      var good = days.filter(function (d, i) {
        var next = days[i + 1];
        return i < 6 && (d.rain || 0) === 0 && (d.prob == null || d.prob < 30) && d.tmin > 0 && d.tmax < 25 &&
          next && (next.rain || 0) < 1 && next.tmin > 0;
      });
      out.push(good.length
        ? { lvl: 'rec', icon: '⚪', title: 'Zi bună pentru văruirea pomilor: ' + dayName(good[0].date, days.indexOf(good[0])),
            why: 'Fără ploaie și fără ger în ziua aceea și a doua zi (min ' + r1(good[0].tmin) + ' °C), fără căldură mare.',
            items: [{ t: 'Rețeta: 1 kg var hidratat la 5 l apă, pe trunchi uscat. Mănuși și ochelari.', src: O.limeSrc }] }
        : { lvl: 'watch', icon: '⚪', title: 'Văruirea pomilor: așteaptă o zi potrivită',
            why: 'În următoarele zile e ploaie, ger sau căldură mare. Varul se dă pe trunchi uscat, nu înainte de ploaie, nu pe ger.', items: [] });
    }

    // ---- 11. Next good day for garden work ----------------------------------
    if (!goodDay(days[0])) {
      var next = days.filter(function (d, i) { return i > 0 && goodDay(d); })[0];
      out.push(next
        ? { lvl: 'rec', icon: '📅', title: 'Următoarea zi bună de lucru: ' + dayName(next.date) + ' (' + next.date.slice(8, 10) + '.' + next.date.slice(5, 7) + ')',
            why: (fc.from ? 'Ziua aleasă' : 'Azi') + ' nu e potrivită (îngheț, ploaie, vânt, caniculă sau furtună). ' + dayName(next.date).replace(/^./, function (c) { return c.toUpperCase(); }) + ': ' + r1(next.tmin) + '…' + r1(next.tmax) + ' °C, ' + r1(next.rain || 0) + ' mm. Praguri orientative.', items: [] }
        : { lvl: 'watch', icon: '📅', title: 'Nicio zi bună de lucru în prognoză', why: 'Toate zilele din prognoză au îngheț, ploaie, vânt puternic, caniculă sau furtună (praguri orientative).', items: [] });
    }

    // ---- 12. Local frost history (last spring frost) ------------------------
    var fh = frostStats(ctx.hist);
    if (fh && fh.last && m >= 3 && m <= 5 && tenderNow.length) {
      var today = (days[0].date || '').slice(5);
      if (today <= fh.last.latest) {
        out.push({
          lvl: 'watch', icon: '📆', title: 'La tine a mai înghețat până pe ' + mdName(fh.last.latest) + ' (ultimii ' + fh.n + ' ani)',
          why: 'Ultimul îngheț de primăvară, în ultimii ' + fh.n + ' ani: de obicei pe la ' + mdName(fh.last.median) + ', cel mai târziu pe ' + mdName(fh.last.latest) + '. Din date istorice estimate pentru zona ta (Open-Meteo), nu din stația ta.',
          items: [{ t: 'Plantele sensibile la îngheț se pun afară după ce trece riscul de îngheț; ține agrotextilul la îndemână până atunci: ' + names(tenderNow.slice(0, 8)) + (tenderNow.length > 8 ? '…' : '') + '.', ids: tenderNow.map(function (p) { return p.id; }), src: ['rhs_tender'] }],
          src: ['openmeteo_hist']
        });
      }
    }

    var order = { warn: 0, watch: 1, rec: 2 };
    out.sort(function (a, b) { return order[a.lvl] - order[b.lvl]; });
    return out;
  }

  /**
   * Short weather note for one plant card (current month only).
   * Never removes the calendar advice – it only adds context.
   */
  function plantNote(p, ctx) {
    var fc = ctx.fc, m = ctx.month;
    if (!fc || !fc.days.length) return null;
    var days = fc.days.slice(0, 7);
    var d3 = days.slice(0, 3);
    var min3 = minOf(d3.map(function (d) { return d.tmin; }));
    var min7 = minOf(days.map(function (d) { return d.tmin; }));
    var plantingNow = p.plant.indexOf(m) > -1 || (p.early && p.early.indexOf(m) > -1);
    var g = (ctx.garden || {})[p.id];
    if (min3 != null && min3 <= 0) {
      if (plantingNow && p.frost === 'tender') return { lvl: 'warn', t: 'Îngheț în următoarele zile (min ' + r1(min3) + ' °C): amână plantarea.' };
      if (p.frost === 'tender' && g && m >= 4 && m <= 10) return { lvl: 'warn', t: 'Îngheț prognozat (min ' + r1(min3) + ' °C): acoperă planta peste noapte.' };
      if ((p.cat === 'trees' || p.cat === 'shrubs' || p.cat === 'vines') && p.bloom.indexOf(m) > -1) return { lvl: 'warn', t: 'Îngheț prognozat cât e înflorit (min ' + r1(min3) + ' °C): protejează florile peste noapte.' };
    }
    if (p.hardy && g && (g.status === 'planted' || g.status === 'have') && min7 != null && min7 < p.hardy.min) {
      return { lvl: 'warn', t: 'Prognoza coboară la ' + r1(min7) + ' °C, sub limita RHS ' + p.hardy.r + ' (' + p.hardy.min + ' °C): protejează planta.' };
    }
    if (plantingNow && p.nightMin && min7 != null && min7 < p.nightMin) {
      return { lvl: 'warn', t: 'Nopți de ' + r1(min7) + ' °C în prognoză; vrea peste ' + p.nightMin + ' °C. Mai așteaptă.' };
    }
    if (plantingNow && p.soilT && (p.mode === 'direct' || p.mode === 'both')) {
      var s = soil6(fc);
      if (s != null && s < p.soilT[0]) return { lvl: 'warn', t: 'Solul (≈' + r1(s) + ' °C, estimat) e sub minimul de ' + r1(p.soilT[0]) + ' °C. Amână semănatul.' };
    }
    return null;
  }

  window.ADVISOR = { advise: advise, plantNote: plantNote, thresholds: T, dayName: dayName, goodDay: goodDay, waterBalance: waterBalance, frostStats: frostStats, mdName: mdName, shift: shift };
})();
