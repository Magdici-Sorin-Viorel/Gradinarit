/*
 * Grădinărit – main application script.
 * A small hash-routed single-page app (no framework, no build step).
 *
 * Routes:
 *   #calendar[/<month 1-12>]  – month view (plant / harvest / bloom / tasks)
 *   #plante                   – category list
 *   #plante-<categoryId>       – plants of one category
 *   #gradina                  – "My garden" (favorites saved on the device)
 *   #p-<plantId>               – plant detail sheet, shown over the previous page
 */
(function () {
  'use strict';

  var CATS = window.CATEGORIES;
  var PLANTS = window.PLANTS;
  var MONTHS = window.MONTHS;
  var MONTHS_SHORT = window.MONTHS_SHORT;
  var STORAGE_KEY = 'gradina-banat.garden.v1';
  var PREFS_KEY = 'gradina-banat.prefs.v1';
  var SOILTEST_KEY = 'gradina-banat.soiltests.v1'; // [{ id, date, place, ph, method, type, fizz, note }]
  var DONE_KEY = 'gradina-banat.done.v1';   // { '2026': { 'mar|11|Tăiere…': '2026-11-11' } }
  /** Shown in Settings. Keep in step with CACHE_VERSION in sw.js. */
  var APP_VERSION = 'v36';

  var viewEl = document.getElementById('view');
  var sheetEl = document.getElementById('sheet');
  var backdropEl = document.getElementById('sheet-backdrop');
  var toastEl = document.getElementById('toast');

  var currentMonth = new Date().getMonth() + 1;

  // UI state that is not part of the URL.
  var state = {
    month: currentMonth,
    calTab: 'todo',        // todo | plant | harvest | bloom | orchard | tasks
    orchardMonth: currentMonth, // month shown on the Livadă page
    calCat: 'all',         // 'all' or a category id
    onlyGarden: false,
    search: '',
    baseHash: '#calendar',
    baseRendered: false,
    sheetPushed: false     // true when the detail sheet was opened by a click inside the app
  };

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  /** Escapes text for safe insertion into HTML. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function catById(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
    return null;
  }

  function plantById(id) {
    for (var i = 0; i < PLANTS.length; i++) if (PLANTS[i].id === id) return PLANTS[i];
    return null;
  }

  function catOrder(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return i;
    return 99;
  }

  /** Romanian alphabetical compare. */
  function byName(a, b) { return a.name.localeCompare(b.name, 'ro'); }

  function seasonOf(m) {
    if (m === 12 || m <= 2) return 'Iarnă';
    if (m <= 5) return 'Primăvară';
    if (m <= 8) return 'Vară';
    return 'Toamnă';
  }

  /** Formats a list of months as compact ranges, e.g. [3,4,5,9] -> "Mar–Mai, Sep". */
  function monthRanges(list) {
    if (!list || !list.length) return '—';
    var sorted = list.slice().sort(function (a, b) { return a - b; });
    var parts = [];
    var start = sorted[0], prev = sorted[0];
    for (var i = 1; i <= sorted.length; i++) {
      var m = sorted[i];
      if (m === prev + 1) { prev = m; continue; }
      parts.push(start === prev ? MONTHS_SHORT[start - 1] : MONTHS_SHORT[start - 1] + '–' + MONTHS_SHORT[prev - 1]);
      start = prev = m;
    }
    return parts.join(', ');
  }

  // Bee value: 0 = no source confirms it, 2 = a source confirms bees visit it.
  var BEE_LABELS = ['Nu e trecută ca plantă pentru albine', '', 'Vizitată de albine – confirmat de sursă (nectarul și polenul nu sunt gradate)'];

  /** Full whitewash block: purpose, recipe, preparation, safety. Shared by the card, the month view and the orchard page. */
  function limeHtml() {
    return '<p>' + txt(ORCHARD.limeTxt) + '</p>' +
      '<h5>Rețeta naturală (doar două ingrediente)</h5>' +
      '<table class="recipe-t"><tbody>' + ORCHARD.limeRecipe.map(function (r) {
        return '<tr><td>' + esc(r.i) + '</td><td>' + esc(r.q) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<p class="mut">Formulă tradițională de pornire, nu o concentrație dovedită sigură pentru toate speciile.</p>' +
      '<h5>Cum se prepară și se aplică</h5><p>' + txt(ORCHARD.limeHow) + '</p>' +
      '<h5>⚠️ Siguranță</h5><ul class="pc-list">' + ORCHARD.limeSafety.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }

  var MODE_LABEL = { direct: 'Semănat direct în grădină', transplant: 'Plantare de răsaduri', both: 'Semănat direct sau răsaduri', bulb: 'Plantare de bulbi / căței', tuber: 'Plantare de tuberculi', rhizome: 'Plantare de rizomi' };
  var FROST_LABEL = {
    tender: '❄️ Sensibilă la îngheț – nu o pune afară cât mai e risc de brumă',
    hardy: '🧊 Suportă frigul – se seamănă/plantează devreme, înainte de ultimul îngheț',
    half: '🌡️ Partea de deasupra solului poate fi afectată de îngheț'
  };
  var GERM_LIGHT = {
    L: 'semințele au nevoie de lumină: nu le acoperi cu pământ',
    D: 'acoperă semințele, germinează la întuneric',
    LD: 'germinează și la lumină, și la întuneric: acoperă-le ușor'
  };
  function fmtC(n) { return String(n).replace('.', ','); }

  /** Sowing/planting conditions for vegetables (and basil): mode, frost class, soil and night temperatures. */
  function conditionsHtml(p) {
    if (!p.mode && !p.frost && !p.soilT && !p.nightMin && !p.germ) return '';
    var li = [];
    if (p.mode) li.push('<b>' + esc(MODE_LABEL[p.mode]) + '</b>');
    if (p.frost) li.push(esc(FROST_LABEL[p.frost]));
    if (p.soilT) li.push('🌱 Temperatura solului pentru încolțire: minimum ' + fmtC(p.soilT[0]) + ' °C' + (p.soilT[1] > p.soilT[0] ? ', bine de la ' + fmtC(p.soilT[1]) + ' °C în sus' : '') + '. Măsoar-o cu un termometru de sol, la adâncimea semănatului.');
    if (p.nightMin) li.push('🌙 Plantează afară când nopțile rămân constant peste ' + p.nightMin + ' °C.');
    if (p.mode === 'transplant' || p.mode === 'both') li.push('🪴 Răsadurile crescute în casă se călesc 2–3 săptămâni: le scoți afară ziua tot mai mult și le aduci înăuntru noaptea. Călirea nu le face rezistente la îngheț.');
    if (p.germ) li.push('🌡️ Germinare: optim ' + esc(p.germ.t) + ' °C, răsare în ' + esc(p.germ.days) + ' zile; ' + GERM_LIGHT[p.germ.light] + '.');
    if (p.early && p.early.length) li.push('⏳ În ' + monthRanges(p.early) + ' doar dacă vremea permite; luna principală e ' + monthRanges(p.plant) + '.');
    return '<h5>Condiții</h5><ul class="pc-list">' + li.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
  }

  function beeIcons(level) {
    if (!level) return '';
    return '<span class="bees" title="' + esc(BEE_LABELS[2]) + '" aria-label="' + esc(BEE_LABELS[2]) + '">🐝</span>';
  }

  /** 12-cell bar showing planting (green), bloom (yellow) and harvest (red) months. */
  function monthBar(p, big, shown) {
    shown = shown || currentMonth;
    var html = '<div class="mbar' + (big ? ' big' : '') + '" aria-hidden="true">';
    for (var m = 1; m <= 12; m++) {
      html += '<div class="mcell' + (m === shown ? ' now' : '') + '">';
      if (p.harvest.indexOf(m) > -1) html += '<i class="h"></i>';
      if (p.bloom.indexOf(m) > -1 && p.bee > 0) html += '<i class="b"></i>';
      if (p.plant.indexOf(m) > -1) html += '<i class="p"></i>';
      html += '</div>';
    }
    html += '</div><div class="mlabels" aria-hidden="true">';
    for (var k = 0; k < 12; k++) html += '<span>' + MONTHS_SHORT[k].charAt(0) + '</span>';
    return html + '</div>';
  }

  function legendHtml() {
    return '<div class="legend">' +
      '<span><i style="background:var(--plant)"></i>Plantare</span>' +
      '<span><i style="background:var(--bloom)"></i>Înflorire (albine)</span>' +
      '<span><i style="background:var(--harvest)"></i>Recoltare</span>' +
      '</div>';
  }

  // ------------------------------------------------------------------
  // Orchard work (fruit trees): pruning, thinning, grafting, whitewash, moving, feeding
  // ------------------------------------------------------------------

  var ORCHARD = window.ORCHARD;

  /** Orchard work definitions shown in the "Livadă" tab and the tree detail sheet. */
  var WORK_TYPES = [
    { key: 'prune', icon: '✂️', label: 'Tăiere și rărirea coroanei', short: 'Tăiere', color: 'var(--w-prune)' },
    { key: 'thin', icon: '🍏', label: 'Rărirea fructelor', short: 'Rărire fructe', color: 'var(--w-thin)' },
    { key: 'graft', icon: '🌿', label: 'Altoire', short: 'Altoire', color: 'var(--w-graft)' },
    { key: 'lime', icon: '⚪', label: 'Var pe trunchi', short: 'Var', color: 'var(--w-lime)' },
    { key: 'feed', icon: '🌾', label: 'Hrănire naturală (compost, gunoi descompus)', short: 'Hrănire', color: 'var(--w-feed)' },
    { key: 'protectM', icon: '🛡️', label: 'Protecție (dăunători, îngheț, păsări)', short: 'Protecție', color: 'var(--w-move)' }
  ];

  // Attach the protection jobs to each tree and collect their months for the grid.
  Object.keys(ORCHARD.trees).forEach(function (id) {
    var o = ORCHARD.trees[id];
    o.protect = (ORCHARD.protect && ORCHARD.protect[id]) || [];
    var ms = {};
    o.protect.forEach(function (j) { j.m.forEach(function (m) { ms[m] = true; }); });
    o.protectM = Object.keys(ms).map(Number).sort(function (a, b) { return a - b; });
    o.protectSrc = o.protect.reduce(function (a, j) { return a.concat(j.src || []); }, []);
  });

  function orchardOf(p) { return p && p.cat === 'trees' ? ORCHARD.trees[p.id] : null; }

  /** Months for one work type on one tree (whitewash is shared by all trees). */
  function workMonths(o, key) {
    if (key === 'lime') return ORCHARD.lime;
    return (o && o[key]) || [];
  }

  /** Compact grid: one row per work type, 12 month cells. */
  function workGrid(o) {
    var html = '<div class="wgrid" role="table" aria-label="Calendarul lucrărilor la pom">';
    html += '<div class="wrow wlabels" role="row"><span></span>' + MONTHS_SHORT.map(function (s, i) {
      return '<span class="' + (i + 1 === currentMonth ? 'now' : '') + '">' + s.charAt(0) + '</span>';
    }).join('') + '</div>';
    WORK_TYPES.forEach(function (w) {
      var ms = workMonths(o, w.key);
      if (!ms.length) return;
      html += '<div class="wrow" role="row"><span class="wname">' + w.icon + ' ' + esc(w.short) + '</span>';
      for (var m = 1; m <= 12; m++) {
        var on = ms.indexOf(m) > -1;
        html += '<span class="wcell' + (on ? ' on' : '') + (m === currentMonth ? ' now' : '') + '" style="--wc:' + w.color + '"' +
          (on ? ' aria-label="' + esc(w.short + ' – ' + MONTHS[m - 1]) + '"' : '') + '></span>';
      }
      html += '</div>';
    });
    return html + '</div>';
  }

  /** Orchard tab body for a given month. */
  function orchardMonthHtml(m, hideGuideLink) {
    var trees = PLANTS.filter(function (p) {
      return p.cat === 'trees' && (!state.onlyGarden || inGarden(p.id));
    }).sort(byName);

    var html = '<p class="intro">' +
      'Ce lucrări faci la pomi în ' + MONTHS[m - 1].toLowerCase() + '. Apasă pe un pom pentru detalii.</p>';

    var any = false;
    WORK_TYPES.forEach(function (w) {
      if (w.key === 'lime') {
        if (ORCHARD.lime.indexOf(m) === -1) return;
        any = true;
        html += '<div class="work"><h3><span aria-hidden="true">' + w.icon + '</span>' + esc(w.label) + '</h3>' +
          '<p>La pomii cu scoarță matură, pe trunchi, de la bază până la cam 1 m. ' +
          (m === 11 ? 'Văruirea de toamnă: după căderea frunzelor, înainte de ger.' : m === 3 ? 'Dacă n-ai apucat în februarie: doar cât mugurii n-au pornit și pomii n-au înflorit.' : 'Văruirea de primăvară: înainte de pornirea mugurilor și de înflorire.') +
          '</p><details class="recipe"><summary>Rețeta naturală și siguranța</summary>' + limeHtml() + '</details></div>';
        return;
      }
      var list = trees.filter(function (p) { return workMonths(orchardOf(p), w.key).indexOf(m) > -1; });
      if (!list.length) return;
      any = true;
      html += '<div class="work"><h3><span aria-hidden="true">' + w.icon + '</span>' + esc(w.label) + '</h3><div class="tchips">' +
        list.map(function (p) {
          return '<button type="button" class="chip" data-open="' + p.id + '">' + esc(p.name) + '</button>';
        }).join('') + '</div></div>';
    });

    if (!any) {
      html += '<div class="empty"><span class="big">🌳</span>' +
        (state.onlyGarden ? 'Niciun pom din grădina ta nu are lucrări luna aceasta.' : 'Nicio lucrare la pomi luna aceasta.') + '</div>';
    }

    html += '<p class="section-title">💡 Idei pentru ' + MONTHS[m - 1].toLowerCase() + '</p>' +
      '<ul class="tasks ideas">' + ORCHARD.ideas[m - 1].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      (hideGuideLink ? '' : '<a class="btn secondary" href="#altoire" style="text-decoration:none">🌿 Ghid de altoire: ce pe ce se altoiește</a>');
    return html;
  }

  /** Number of trees with at least one job this month (shown in the tab badge). */
  function orchardCount(m) {
    return PLANTS.filter(function (p) {
      if (p.cat !== 'trees' || (state.onlyGarden && !inGarden(p.id))) return false;
      var o = orchardOf(p);
      return WORK_TYPES.some(function (w) { return w.key !== 'lime' && workMonths(o, w.key).indexOf(m) > -1; });
    }).length;
  }

  /** Grafting guide page. */
  /** Month selector for the Livadă page (opens on the current month). */
  function orchardMonthPicker() {
    var m = state.orchardMonth;
    var pills = '';
    for (var i = 1; i <= 12; i++) {
      pills += '<button type="button" class="month-pill' + (i === currentMonth ? ' is-today' : '') +
        '" data-omonth="' + i + '" aria-pressed="' + (i === m) + '">' + MONTHS_SHORT[i - 1] + '</button>';
    }
    return '<div class="month-head" style="margin-top:14px">' +
        '<button type="button" class="icon-btn" data-omonth="' + (m === 1 ? 12 : m - 1) + '" aria-label="Luna anterioară">‹</button>' +
        '<div style="text-align:center"><h2>' + MONTHS[m - 1] + '</h2><div class="season">' +
          (m === currentMonth ? 'luna curentă' : '<button type="button" class="link-btn" data-omonth="' + currentMonth + '">Înapoi la luna curentă</button>') + '</div></div>' +
        '<button type="button" class="icon-btn" data-omonth="' + (m === 12 ? 1 : m + 1) + '" aria-label="Luna următoare">›</button>' +
      '</div><div class="month-strip">' + pills + '</div>';
  }

  function renderGrafting() {
    var trees = PLANTS.filter(function (p) { return p.cat === 'trees'; });
    // Most useful rootstocks first, as asked about most often.
    var order = ['corcodus', 'gutui', 'mar', 'par', 'prun', 'cais', 'piersic', 'cires', 'visin', 'migdal', 'mosmon', 'castan', 'nuc', 'smochin'];
    trees.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });

    viewEl.innerHTML =
      '<div class="page-head"><div><h2>Livadă și altoire</h2><p>Lucrările lunii la pomi, ce poți altoi pe fiecare pom, când și cum, plus varul pe trunchi.</p></div></div>' +
      orchardMonthPicker() +
      orchardMonthHtml(state.orchardMonth, true) +
      '<p class="section-title">🌿 Ghid de altoire</p>' +

      '<div class="note">Regula de bază: se prind doar pomii înrudiți. <b>Sâmburoasele</b> între ele (prun, cais, piersic, migdal pe corcoduș), <b>semințoasele</b> între ele (păr și moșmon pe gutui), iar <b>cireșul cu vișinul</b> formează o grupă separată. Mărul se altoiește doar pe măr.</div>' +

      '<p class="section-title">Ce pui pe fiecare pom</p>' +
      '<div class="cards">' + trees.map(function (p) {
        var o = orchardOf(p);
        var c = catById(p.cat);
        return '<div class="garden-item" style="--cat-color:' + c.color + ';--soil:' + soilOf(p).g.color + '">' +
          '<div class="row"><button type="button" class="link" data-open="' + p.id + '"><div class="card-title">Pe ' + esc(p.name.toLowerCase()) + ' poți altoi:</div></button></div>' +
          '<ul class="hosts">' + o.hosts.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
          '<p class="warn">⚠️ ' + esc(o.notOn) + '</p>' +
          '<p class="card-latin" style="font-style:normal">' + esc(p.name) + ' se altoiește pe: ' + esc(o.graftOn) +
          (o.graft.length ? ' · Luni: ' + monthRanges(o.graft) : '') + '</p>' + '</div>';
      }).join('') + '</div>' +

      '<p class="section-title">Metode de altoire</p>' +
      '<div class="cards">' + ORCHARD.methods.map(function (mt) {
        return '<div class="block" style="margin-top:0"><h3>' + esc(mt.name) + ' <span class="tag">' + monthRanges(mt.months) + '</span></h3><p>' + esc(mt.txt) + '</p>' + '</div>';
      }).join('') + '</div>' +

      '<div class="note">⚠️ ' + esc(ORCHARD.graftWarn) + '</div>' +
      '<p class="section-title">Tipuri de tăieri</p>' +
      '<div class="cards">' + ORCHARD.pruneTypes.map(function (x) {
        return '<div class="block" style="margin-top:0"><h3>✂️ ' + esc(x.t) + '</h3><p>' + esc(x.d) + '</p></div>';
      }).join('') + '</div>' +
      '<div class="block"><h3><span aria-hidden="true">⚪</span>Văruirea pomilor · ' + monthRanges(ORCHARD.limeAutumn) + ' și ' + monthRanges(ORCHARD.limeSpring) + '</h3>' + limeHtml() + '</div>';
  }

  /** Escapes text and keeps line breaks. */
  function txt(s) { return esc(s).replace(/\n/g, '<br>'); }

  /** Renders a "Surse" (sources) list for the given source ids. */
  function sourcesHtml(ids, title) {
    if (!ids || !ids.length) return '';
    var seen = {};
    var items = ids.filter(function (id) { if (seen[id] || !window.SOURCES[id]) return false; seen[id] = true; return true; })
      .map(function (id) {
        var s = window.SOURCES[id];
        return '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a></li>';
      }).join('');
    return '<div class="sources"><h3><i class="fas fa-book-open" aria-hidden="true"></i>' + esc(title || 'Surse') + '</h3><ul>' + items + '</ul></div>';
  }

  // ------------------------------------------------------------------
  // Photos: loaded at runtime from Wikipedia (free images), cached on the device
  // ------------------------------------------------------------------

  var WIKI_TITLES = {
    'vita-masa': 'Table grape', 'vita-vin': 'Vitis vinifera', 'vita-rezistenta': 'Vitis', 'vita-pergola': 'Grape',
    mur: 'Blackberry', capsuni: 'Garden strawberry', 'trandafir-cataratator': 'Climbing rose',
    varza: 'Cabbage', conopida: 'Cauliflower', gulie: 'Kohlrabi', kale: 'Kale', porumb: 'Sweet corn',
    dovleac: 'Pumpkin', 'fasole-pastai': 'Green bean', 'fasole-boabe': 'Phaseolus vulgaris',
    broccoli: 'Broccoli', 'kiwi-mic': 'Actinidia arguta',
    rosii: 'Tomato', ardei: 'Bell pepper', vinete: 'Eggplant', castraveti: 'Cucumber', dovlecei: 'Zucchini',
    'pepene-verde': 'Watermelon', 'pepene-galben': 'Muskmelon', mazare: 'Pea', bob: 'Vicia faba', cartofi: 'Potato',
    ceapa: 'Onion', usturoi: 'Garlic', morcov: 'Carrot', patrunjel: 'Parsley', pastarnac: 'Parsnip', ridichi: 'Radish',
    sfecla: 'Beetroot', salata: 'Lettuce', spanac: 'Spinach', praz: 'Leek', telina: 'Celeriac', rucola: 'Eruca vesicaria',
    sparanghel: 'Asparagus', revent: 'Rhubarb',
    mar: 'Apple', par: 'Pear', gutui: 'Quince', cires: 'Prunus avium', visin: 'Prunus cerasus', cais: 'Apricot',
    piersic: 'Peach', prun: 'Prunus domestica', corcodus: 'Prunus cerasifera', mosmon: 'Mespilus germanica',
    smochin: 'Common fig', nuc: 'Juglans regia',
    lalele: 'Tulip', narcise: 'Narcissus (plant)', zambile: 'Hyacinth (plant)'
  };

  /** Wikipedia article title for a plant (English Wikipedia). */
  function wikiTitle(p) {
    if (WIKI_TITLES[p.id]) return WIKI_TITLES[p.id];
    return p.latin.split(' /')[0].split(' (')[0].replace(' spp.', '').trim();
  }

  var PHOTO_KEY = 'gradina-banat.photos.v2'; // v1 stored resized URLs that Wikimedia may refuse
  var photoCache = loadJson(PHOTO_KEY, {});
  var photoPending = {};

  /** Gets {img, page} for a plant from cache or Wikipedia; calls back with null if not available. */
  function getPhoto(p, cb) {
    if (photoCache[p.id]) { cb(photoCache[p.id]); return; }
    if (photoPending[p.id]) { photoPending[p.id].push(cb); return; }
    photoPending[p.id] = [cb];
    var done = function (val) {
      var cbs = photoPending[p.id] || [];
      delete photoPending[p.id];
      cbs.forEach(function (f) { f(val); });
    };
    if (!window.fetch) { done(null); return; }
    // MediaWiki Action API (stable, allows browser requests with origin=*).
    // pithumbsize=500 is one of Wikimedia's standard thumbnail widths.
    var title = wikiTitle(p);
    var api = 'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*' +
      '&redirects=1&prop=pageimages&piprop=thumbnail%7Coriginal&pithumbsize=500&titles=' + encodeURIComponent(title);
    fetch(api)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var page = d && d.query && d.query.pages && d.query.pages[0];
        if (!page || !page.thumbnail) { done(null); return; }
        var val = {
          // The image URL is used exactly as Wikipedia gives it; the full image is a fallback.
          img: page.thumbnail.source,
          full: (page.original && page.original.source) || '',
          page: 'https://en.m.wikipedia.org/wiki/' + encodeURIComponent(page.title.replace(/ /g, '_'))
        };
        photoCache[p.id] = val;
        saveJson(PHOTO_KEY, photoCache);
        done(val);
      })
      .catch(function () { done(null); });
  }

  /** Fills every empty photo slot currently on the page. */
  function loadPhotos(root) {
    (root || document).querySelectorAll('[data-photo]:not([data-loaded])').forEach(function (el) {
      el.setAttribute('data-loaded', '1');
      var p = plantById(el.getAttribute('data-photo'));
      if (!p) return;
      getPhoto(p, function (ph) {
        if (!ph) { el.classList.add('nophoto'); return; }
        var img = new Image();
        img.alt = 'Fotografie: ' + p.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.crossOrigin = 'anonymous';
        img.onload = function () { el.classList.add('ok'); };
        img.onerror = function () {
          // Try the full-size image once before giving up.
          if (ph.full && img.src !== ph.full) { img.src = ph.full; return; }
          el.classList.add('nophoto');
        };
        img.src = ph.img;
        el.appendChild(img);
        if (el.hasAttribute('data-credit') && ph.page) {
          var a = document.createElement('a');
          a.className = 'credit'; a.href = ph.page; a.target = '_blank'; a.rel = 'noopener';
          a.textContent = 'Foto: Wikipedia';
          el.appendChild(a);
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // Background download of ALL plant photos, so they are on the phone even offline
  // ------------------------------------------------------------------

  var photoSync = { running: false };

  function countCachedPhotos() {
    return PLANTS.filter(function (p) { return photoCache[p.id] && photoCache[p.id].saved; }).length;
  }

  /** Updates the progress line on the Plante page. */
  function updatePhotoStatus() {
    var el = document.getElementById('photo-status');
    if (!el) return;
    var have = countCachedPhotos();
    var total = PLANTS.length;
    var text;
    if (photoSync.running) {
      text = 'Se descarcă pozele plantelor: ' + have + ' din ' + total + '…';
    } else if (have >= total) {
      text = 'Toate pozele (' + total + ') sunt salvate pe telefon.';
    } else if (!navigator.onLine) {
      text = have + ' din ' + total + ' poze salvate. Restul se descarcă singure când ai internet.';
    } else {
      text = have + ' din ' + total + ' poze salvate. Pentru unele plante Wikipedia nu are poză.';
    }
    el.querySelector('span').textContent = text;
    var btn = el.querySelector('button');
    if (btn) btn.hidden = photoSync.running || have >= total || !navigator.onLine;
  }

  /** Downloads photos for every plant, one after another, and keeps the images in the offline cache. */
  function syncAllPhotos() {
    if (photoSync.running || !navigator.onLine || !window.fetch) { updatePhotoStatus(); return; }
    var queue = PLANTS.filter(function (p) { return !photoCache[p.id] || !photoCache[p.id].saved; });
    if (!queue.length) { updatePhotoStatus(); return; }
    photoSync.running = true;
    updatePhotoStatus();

    var next = function () {
      var p = queue.shift();
      if (!p) {
        photoSync.running = false;
        saveJson(PHOTO_KEY, photoCache);
        updatePhotoStatus();
        loadPhotos(document);
        return;
      }
      getPhoto(p, function (ph) {
        if (!ph) { updatePhotoStatus(); setTimeout(next, 150); return; }
        // Fetching the image makes the service worker keep a copy for offline use.
        fetch(ph.img, { mode: 'cors' })
          .then(function (r) {
            if (r.ok) return r;
            if (ph.full) { ph.img = ph.full; return fetch(ph.full, { mode: 'cors' }); }
            return r;
          })
          .then(function (r) { if (r && r.ok) { ph.saved = true; saveJson(PHOTO_KEY, photoCache); } })
          .catch(function () { /* tried again on the next start */ })
          .then(function () { updatePhotoStatus(); setTimeout(next, 150); });
      });
    };
    next();
  }

  function photoSlot(p, big) {
    var c = catById(p.cat);
    return '<div class="photo' + (big ? ' big' : '') + '" data-photo="' + esc(p.id) + '"' + (big ? ' data-credit' : '') + '>' +
      '<span class="ph-fallback" aria-hidden="true">' + c.icon + '</span>' +
      (big ? '<span class="ph-note">Poza se încarcă de pe Wikipedia când ai internet</span>' : '') + '</div>';
  }

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  // ------------------------------------------------------------------
  // Storage ("My garden" and preferences), kept on the device only
  // ------------------------------------------------------------------

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  // { plantId: { status: 'have'|'planted'|'prep', date: 'YYYY-MM-DD', added: 'YYYY-MM-DD',
  //               varieties: [{ name: 'Ionatan', count: 3 }] } }
  var garden = loadJson(STORAGE_KEY, {});
  // Older versions used 'planned'; it now means "preparing to plant".
  Object.keys(garden).forEach(function (id) {
    var g = garden[id];
    if (!g || typeof g !== 'object') { delete garden[id]; return; }
    if (g.status === 'planned' || !g.status) g.status = 'prep';
  });

  /** The three garden statuses, in display order. */
  var STATUS = {
    have: { label: 'Am deja', long: 'Le am deja', icon: 'fa-circle-check', cls: 's-have' },
    planted: { label: 'Plantat acum', long: 'Le-am plantat acum', icon: 'fa-seedling', cls: 's-planted' },
    prep: { label: 'Pregătesc', long: 'Le pregătesc pentru plantare', icon: 'fa-clipboard-list', cls: 's-prep' }
  };
  var STATUS_ORDER = ['have', 'planted', 'prep'];

  /** Categories where you can keep a list of varieties with a count of plants. */
  var VARIETY_UNIT = { vines: ['butuc', 'butuci'], shrubs: ['tufă', 'tufe'] };

  /** Categories where you only keep how many plants you have (no varieties). */
  var COUNT_UNIT = { trees: ['pom', 'pomi'] };

  // Trees used to have varieties: keep their total as the simple count.
  Object.keys(garden).forEach(function (id) {
    var g = garden[id];
    if (g.varieties && typeof g.count !== 'number' && window.PLANTS.some(function (p) { return p.id === id && p.cat === 'trees'; })) {
      var sum = g.varieties.reduce(function (a, v) { return a + (parseInt(v.count, 10) || 0); }, 0);
      if (sum) g.count = sum;
      delete g.varieties;
    }
  });

  function unitOf(p) { return p ? (COUNT_UNIT[p.cat] || VARIETY_UNIT[p.cat] || null) : null; }

  /** Number of plants of this kind in the garden (count for trees, sum of varieties otherwise). */
  function plantCount(p) {
    var g = garden[p.id];
    if (!g) return 0;
    if (COUNT_UNIT[p.cat]) return parseInt(g.count, 10) || 1;
    return varietyTotal(p.id);
  }

  /** Simple "how many trees" counter. */
  function countEditor(p) {
    var unit = COUNT_UNIT[p.cat];
    var g = garden[p.id];
    if (!unit || !g) return '';
    var n = parseInt(g.count, 10) || 1;
    return '<div class="varieties count-row">' +
      '<label class="cnt-lbl" for="cnt-' + esc(p.id) + '">Câți ' + esc(unit[1]) + ' ai</label>' +
      '<div class="stepper">' +
        '<button type="button" data-cnt-dec data-id="' + esc(p.id) + '" aria-label="Mai puțini"><i class="fas fa-minus" aria-hidden="true"></i></button>' +
        '<input type="number" inputmode="numeric" min="1" max="9999" id="cnt-' + esc(p.id) + '" data-cnt data-id="' + esc(p.id) + '" value="' + n + '">' +
        '<button type="button" data-cnt-inc data-id="' + esc(p.id) + '" aria-label="Mai mulți"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
      '</div></div>';
  }

  /** Count editor for trees, variety editor for vines and shrubs. */
  function amountEditor(p) {
    return COUNT_UNIT[p.cat] ? countEditor(p) : varietyEditor(p);
  }

  /** Romanian count + noun, e.g. 1 pom, 5 pomi, 20 de pomi. */
  function countLabel(n, unit) {
    if (n === 1) return '1 ' + unit[0];
    var r = n % 100;
    return n + ' ' + (n > 0 && (r === 0 || r >= 20) ? 'de ' : '') + unit[1];
  }

  function varietyTotal(id) {
    var g = garden[id];
    if (!g || !g.varieties) return 0;
    return g.varieties.reduce(function (sum, v) { return sum + (parseInt(v.count, 10) || 0); }, 0);
  }

  /** Small status badge. */
  function statusBadge(id) {
    var g = garden[id];
    if (!g) return '';
    var st = STATUS[g.status] || STATUS.prep;
    return '<span class="sbadge ' + st.cls + '"><i class="fas ' + st.icon + '" aria-hidden="true"></i>' + esc(st.label) + '</span>';
  }

  /** The three status buttons (pressed = current status). */
  function statusButtons(id, compact) {
    var g = garden[id];
    return STATUS_ORDER.map(function (k) {
      var st = STATUS[k];
      return '<button type="button" class="gopt ' + st.cls + '" data-setstatus="' + k + '" data-id="' + esc(id) + '" aria-pressed="' + !!(g && g.status === k) + '">' +
        '<i class="fas ' + st.icon + '" aria-hidden="true"></i><span>' + esc(compact ? st.label : st.long) + '</span></button>';
    }).join('');
  }

  /** Card footer: one button that opens the three choices. */
  function gardenAction(p) {
    var g = garden[p.id];
    var label = g
      ? statusBadge(p.id).replace('class="sbadge', 'class="sbadge inline') + '<span class="gchange">Schimbă</span>'
      : '<i class="fas fa-plus" aria-hidden="true"></i><span>Adaugă în grădina mea</span>';
    return '<div class="card-actions">' +
      '<button type="button" class="gbtn' + (g ? ' in' : '') + '" data-gtoggle aria-expanded="false">' + label +
        '<i class="fas fa-chevron-down gchev" aria-hidden="true"></i></button>' +
      '<div class="gpick" hidden>' + statusButtons(p.id, false) +
        (g ? '<button type="button" class="gremove" data-remove="' + esc(p.id) + '"><i class="fas fa-trash-can" aria-hidden="true"></i>Scoate din grădina mea</button>' : '') +
      '</div></div>';
  }

  /** Editor for the varieties of one tree / vine in the garden. */
  function varietyEditor(p) {
    var unit = VARIETY_UNIT[p.cat];
    var g = garden[p.id];
    if (!unit || !g) return '';
    var list = g.varieties || [];
    var rows = list.map(function (v, i) {
      return '<div class="var-row">' +
        '<input type="text" class="var-name" id="vn-' + esc(p.id) + '-' + i + '" data-var-name data-id="' + esc(p.id) + '" data-idx="' + i + '"' +
          ' value="' + esc(v.name || '') + '" placeholder="Numele soiului" aria-label="Numele soiului" autocomplete="off">' +
        '<div class="stepper">' +
          '<button type="button" data-var-dec data-id="' + esc(p.id) + '" data-idx="' + i + '" aria-label="Mai puțini"><i class="fas fa-minus" aria-hidden="true"></i></button>' +
          '<input type="number" inputmode="numeric" min="1" max="9999" id="vc-' + esc(p.id) + '-' + i + '" data-var-count data-id="' + esc(p.id) + '" data-idx="' + i + '" value="' + (parseInt(v.count, 10) || 1) + '" aria-label="Număr de ' + esc(unit[1]) + '">' +
          '<button type="button" data-var-inc data-id="' + esc(p.id) + '" data-idx="' + i + '" aria-label="Mai mulți"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
        '</div>' +
        '<button type="button" class="var-del" data-var-del data-id="' + esc(p.id) + '" data-idx="' + i + '" aria-label="Șterge soiul"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
      '</div>';
    }).join('');
    return '<div class="varieties">' +
      '<div class="var-head"><span>Soiurile mele</span><span class="var-total" data-var-total="' + esc(p.id) + '">' +
        (list.length ? countLabel(varietyTotal(p.id), unit) + ' în total' : '') + '</span></div>' +
      (list.length ? rows : '<p class="var-empty">Adaugă soiurile pe care le ai și ' + (unit[1] === 'tufe' ? 'câte ' : 'câți ') + esc(unit[1]) + ' ai din fiecare.</p>') +
      '<button type="button" class="var-add" data-var-add data-id="' + esc(p.id) + '"><i class="fas fa-plus" aria-hidden="true"></i>Adaugă soi</button>' +
      '</div>';
  }

  /** Refreshes the total next to a variety list without re-rendering the page. */
  function updateVarietyTotal(id) {
    var p = plantById(id);
    var unit = p && VARIETY_UNIT[p.cat];
    if (!unit) return;
    document.querySelectorAll('[data-var-total="' + id + '"]').forEach(function (el) {
      el.textContent = countLabel(varietyTotal(id), unit) + ' în total';
    });
  }
  var prefs = loadJson(PREFS_KEY, {});
  if (prefs.onlyGarden) state.onlyGarden = true;

  function saveGarden() { saveJson(STORAGE_KEY, garden); }

  function inGarden(id) { return Object.prototype.hasOwnProperty.call(garden, id); }

  function todayIso() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    return parseInt(parts[2], 10) + ' ' + MONTHS[parseInt(parts[1], 10) - 1].toLowerCase() + ' ' + parts[0];
  }

  // ------------------------------------------------------------------
  // Card rendering
  // ------------------------------------------------------------------

  /**
   * Everything that applies to one plant in one month.
   * Returns { yes: [...], no: [...], info: [...] }; each item has icon, t (label), d (details), sub.
   */
  function monthActions(p, m, skipPlant) {
    var yes = [], no = [], info = [];
    var o = orchardOf(p);
    var veg = p.cat === 'vegetables';

    if (skipPlant) {
      // Already in the ground: planting is not a job any more.
    } else if (p.plant.indexOf(m) > -1) {
      yes.push({ icon: 'fa-seedling', cls: 'a-plant', t: p.mode ? MODE_LABEL[p.mode] + ' – acum' : veg ? 'Se seamănă / se plantează acum' : 'Se plantează acum',
        d: p.how + (p.water ? '\n💧 ' + p.water : '') });
    } else if (p.early && p.early.indexOf(m) > -1) {
      info.push({ icon: 'fa-hourglass-half', t: 'Posibil spre sfârșitul lunii, doar dacă vremea permite', d: '' });
    } else if (p.plant.length) {
      no.push({ icon: 'fa-seedling', t: veg ? 'Nu se seamănă / nu se plantează acum' : 'Nu se plantează acum',
        sub: 'Se plantează: ' + monthRanges(p.plant) });
    }

    if (p.harvest.length) {
      if (p.harvest.indexOf(m) > -1) {
        yes.push({ icon: 'fa-basket-shopping', cls: 'a-harvest', t: 'Se culege acum', d: p.pick || '' });
      } else {
        no.push({ icon: 'fa-basket-shopping', t: 'Nu se culege acum', sub: 'Se culege: ' + monthRanges(p.harvest) });
      }
    }

    if (o) {
      var add = function (months, icon, t, d) { if (months && months.indexOf(m) > -1) yes.push({ icon: icon, cls: 'a-work', t: t, d: d }); };
      add(o.prune, 'fa-scissors', 'Tăiere / rărirea coroanei acum', o.pruneTxt);
      add(o.thin, 'fa-apple-whole', 'Rărirea fructelor acum', o.thinTxt);
      add(o.graft, 'fa-code-branch', 'Se poate altoi acum', o.graftTxt);
      add(o.feed, 'fa-wheat-awn', 'Se dă îngrășământ acum', o.feedTxt);
      o.protect.forEach(function (j) { add(j.m, 'fa-shield-halved', j.t, j.d); });
      add(ORCHARD.lime, 'fa-paint-roller', m === 11 ? 'Văruirea de toamnă acum' : m === 3 ? 'Văruirea de primăvară (dacă mugurii n-au pornit)' : 'Văruirea de primăvară acum', ORCHARD.limeTxt + '\nRețetă: 1 kg var hidratat la 5 l apă (detalii în secțiunea „Var pe trunchi”).');
      if (!o.feed || o.feed.indexOf(m) === -1) {
        no.push({ icon: 'fa-wheat-awn', t: 'Nu se dă îngrășământ acum', sub: o.feed && o.feed.length ? 'Îngrășământ: ' + monthRanges(o.feed) : '' });
      }
      if (!o.prune || o.prune.indexOf(m) === -1) {
        no.push({ icon: 'fa-scissors', t: 'Nu se taie acum', sub: o.prune && o.prune.length ? 'Tăiere: ' + monthRanges(o.prune) : '' });
      }
    }

    (p.jobs || []).forEach(function (j) {
      if (j.m.indexOf(m) > -1) yes.push({ icon: 'fa-list-check', cls: 'a-work', t: j.t, d: j.d });
    });

    if (p.bloom.indexOf(m) > -1) {
      info.push({ icon: 'fa-spa', t: p.bee ? 'Înflorește acum – hrană pentru albine 🐝' : 'Înflorește acum' });
    }
    return { yes: yes, no: no, info: info };
  }

  /** True when the plant has at least one job this month. */
  function hasWork(p, m) { return monthActions(p, m).yes.length > 0; }

  // ------------------------------------------------------------------
  // Soil and neighbours (data in js/data/soil.js)
  // ------------------------------------------------------------------

  /** Four soil colours. Each plant gets exactly one. */
  var SOIL_GROUPS = [
    { id: 'acid', color: '#e04f4f', dot: '🔴', name: 'Sol acid', short: 'Acid', sub: 'Vrea pH sub 6. Le poți pune împreună în același strat.' },
    { id: 'mid', color: '#f0a030', dot: '🟠', name: 'Ușor acid – neutru', short: 'Ușor acid', sub: 'Vrea pH cam 5,5–7, adică de la ușor acid până la neutru.' },
    { id: 'wide', color: '#4caf50', dot: '🟢', name: 'Tolerantă', short: 'Tolerantă', sub: 'Crește bine de la sol ușor acid până la ușor alcalin.' },
    { id: 'alk', color: '#4a90e2', dot: '🔵', name: 'Neutru – alcalin', short: 'Alcalin', sub: 'Vrea pH de la 6,5 în sus. Nu-i place solul acid.' }
  ];
  var DRAIN_GROUPS = [
    { id: 'dry', icon: '🏔️', name: 'Vrea sol foarte bine drenat', sub: 'pe sol greu (argilos): strat înălțat sau movilă' },
    { id: 'moist', icon: '💧', name: 'Vrea sol care rămâne umed', sub: 'direct în sol, într-un loc care nu se usucă' },
    { id: 'none', icon: '🌍', name: 'Fără cerință specială în surse', sub: 'sol de grădină obișnuit, bine lucrat' }
  ];
  var PH_CAT_TXT = { A: 'acid', N: 'neutru', L: 'alcalin' };

  function fmtPh(n) { return String(n).replace('.', ','); }
  function soilGroupById(id) { return SOIL_GROUPS.filter(function (g) { return g.id === id; })[0]; }

  /** Soil info for a plant: pH, colour group, drainage and rotation family. */
  function soilOf(p) {
    var S = window.SOIL;
    var ph = S.PH[p.id] || null;
    var cat = S.PH_CAT[p.id] || null;
    var pt = S.PH_TEXT[p.id] || null;
    var group;
    if (ph) group = ph[1] <= 6 ? 'acid' : ph[0] >= 6.5 ? 'alk' : ph[1] <= 7 ? 'mid' : 'wide';
    else if (cat) group = cat[0] === 'A' ? 'acid' : cat[0].indexOf('A') < 0 ? 'alk' : 'wide';
    else group = 'mid'; // only kiwi: "slightly acid" in the source
    var drain = S.DRAIN.dry[p.id] ? 'dry' : S.DRAIN.moist[p.id] ? 'moist' : 'none';
    var rot = null;
    Object.keys(S.ROT).forEach(function (k) { if (S.ROT[k].ids.indexOf(p.id) > -1) rot = k; });
    return {
      ph: ph, cat: cat, phText: pt, group: group, g: soilGroupById(group), drain: drain,
      drainSrc: drain === 'none' ? null : S.DRAIN[drain][p.id], rot: rot
    };
  }

  function phLabel(s) {
    if (s.ph) return 'pH ' + fmtPh(s.ph[0]) + '–' + fmtPh(s.ph[1]);
    if (s.cat) return s.cat[0].split('').map(function (c) { return PH_CAT_TXT[c]; }).join(', ');
    return 'ușor acid';
  }

  /** Coloured soil badge shown on every card. */
  function soilBadge(p) {
    var s = soilOf(p);
    return '<span class="soilbadge" style="--soil:' + s.g.color + '"><i aria-hidden="true"></i>' + esc(s.g.short) +
      (s.drain === 'dry' ? ' · 🏔️' : s.drain === 'moist' ? ' · 💧' : '') + '</span>';
  }

  /** Legend for the four colours. */
  /** True when the plant matches the soil filter chosen in the legend (none = all). */
  function matchSoil(p) {
    var f = state.soilFilter;
    if (!f) return true;
    var s = soilOf(p);
    return f === 'dry' || f === 'moist' ? s.drain === f : s.group === f;
  }

  /** Legend for the soil colours. Each item is a filter: tap to show only those plants, tap again for all. */
  function soilLegend() {
    var f = state.soilFilter || '';
    var btn = function (id, inner, style) {
      return '<button type="button" class="soilf' + (f === id ? ' on' : '') + (f && f !== id ? ' off' : '') + '" data-soilfilter="' + id + '"' +
        (style ? ' style="' + style + '"' : '') + ' aria-pressed="' + (f === id) + '">' + inner + '</button>';
    };
    return '<div class="soil-legend" role="group" aria-label="Filtrează după sol">' +
      SOIL_GROUPS.map(function (g) {
        return btn(g.id, '<span class="soilbadge" style="--soil:' + g.color + '"><i aria-hidden="true"></i>' + esc(g.name) + '</span>');
      }).join('') +
      btn('dry', '<span class="soil-legend-x">🏔️ drenaj foarte bun</span>') +
      btn('moist', '<span class="soil-legend-x">💧 sol umed</span>') +
      (f ? '<button type="button" class="soilf-clear" data-soilfilter="">✕ Arată toate</button>' : '') +
      '</div>' +
      (f ? '<p class="soilf-note">Arăt doar plantele cu: <b>' + esc(f === 'dry' ? 'drenaj foarte bun' : f === 'moist' ? 'sol umed' : soilGroupById(f).name) + '</b>.</p>' : '');
  }

  function neighbours(p) {
    return window.SOIL.RULES.filter(function (r) { return r.ids.indexOf(p.id) > -1; });
  }

  /** Soil + neighbours: compact on cards, full in the detail sheet. */
  function soilNbHtml(p, inSheet) {
    var s = soilOf(p);
    var nb = neighbours(p);
    var badN = nb.filter(function (r) { return r.kind === 'bad'; });
    var goodN = nb.filter(function (r) { return r.kind === 'good'; });
    var src = [];
    var add = function (ids) { src = src.concat(ids || []); };

    var soil = '<div class="snb-sec"><h4>🧪 Sol</h4><ul>' +
      '<li><span class="soilbadge" style="--soil:' + s.g.color + '"><i aria-hidden="true"></i>' + esc(s.g.name) + '</span> ' + esc(s.g.sub) + '</li>';
    if (s.ph) { soil += '<li>Sursa dă <b>pH ' + fmtPh(s.ph[0]) + '–' + fmtPh(s.ph[1]) + '</b>.</li>'; add([s.ph[2]]); }
    else if (s.cat) {
      soil += '<li>Sursa o dă pentru sol <b>' + esc(phLabel(s)) + '</b>' +
        (s.cat[1].indexOf('ncsu') === 0 ? ' (acid = sub 6; neutru = 6–8; alcalin = peste 8).' : '.') + '</li>';
      add([s.cat[1]]);
    } else if (s.phText) { soil += '<li>' + esc(s.phText[1]) + '</li>'; add([s.phText[2]]); }
    if (s.drain === 'dry') { soil += '<li>Vrea sol <b>foarte bine drenat</b>; pe sol greu (argilos) pune-o pe strat înălțat sau movilă.</li>'; add([s.drainSrc]); }
    if (s.drain === 'moist') { soil += '<li>Îi place solul <b>care rămâne umed</b> și fertil.</li>'; add([s.drainSrc]); }
    soil += '</ul></div>';

    var rule = function (r) {
      add(r.src);
      return '<li><b>' + esc(r.other) + '</b><span>' + esc(r.why) + '</span></li>';
    };
    var nbHtml = '<div class="snb-sec"><h4>🚫 Să nu stea lângă</h4>' +
      (badN.length ? '<ul class="nb bad">' + badN.map(rule).join('') + '</ul>'
        : '<p class="mut">Poate sta lângă orice altă plantă din grădină.</p>') + '</div>' +
      '<div class="snb-sec"><h4>🤝 Merge bine lângă</h4>' +
      (goodN.length ? '<ul class="nb good">' + goodN.map(rule).join('') + '</ul>'
        : '<p class="mut">Poate sta lângă orice altă plantă din grădină.</p>') + '</div>';

    var rotHtml = '';
    if (s.rot) {
      var R = window.SOIL.ROT[s.rot];
      add(window.SOIL.rotSrc);
      rotHtml = '<div class="snb-sec"><h4>🔄 Rotația culturilor</h4><p>Grupa: <b>' + esc(R.name) + '</b>. ' +
        (s.rot === 'perennial' ? esc(R.why)
          : 'Nu pune legume din aceeași grupă pe același loc în anii următori; rotația se face pe 3–4 ani. ' + esc(R.why)) + '</p>' +
        (s.rot !== 'perennial' ? '<p class="mut">Din aceeași grupă: ' + R.ids.filter(function (i) { return i !== p.id; })
          .map(function (i) { var q = plantById(i); return q ? esc(q.name) : ''; }).filter(Boolean).join(', ') + '.</p>' : '') + '</div>';
    }

    var body = soil + nbHtml + rotHtml;
    if (inSheet === 'body') return body;
    if (inSheet) return '<div class="block snb-sheet"><h3><span aria-hidden="true">🧪</span>Sol și vecini</h3>' + body + '</div>';

    var chips = '<span class="schip">' + esc(phLabel(s)) + '</span>' +
      (badN.length ? '<span class="schip bad">🚫 ' + badN.length + '</span>' : '') +
      (goodN.length ? '<span class="schip good">🤝 ' + goodN.length + '</span>' : '') +
      (s.rot ? '<span class="schip">🔄 rotație</span>' : '');
    return '<details class="snb"><summary><span class="snb-t">Sol și vecini</span>' + chips + '</summary>' + body + '</details>';
  }

  /** Page that groups all plants by soil colour (or drainage), then by category. */

  // ------------------------------------------------------------------
  // General soil guide (RHS) and "my soil test results" (kept apart from the plant data)
  // ------------------------------------------------------------------

  var SOIL_TYPES = [
    { id: 'argilos', name: 'Argilos (greu)', feel: 'Lipicios și unsuros când e ud; se rulează într-un „cârnăcior” lung și subțire și devine lucios când îl freci cu degetul.',
      good: 'Poate fi fertil și ține bine hrana.', bad: 'Ține multă apă și se scurge greu, se încălzește încet primăvara, se tasează ușor dacă calci pe el ud, iar vara se întărește și crapă.',
      fix: 'Adaugă materie organică: leagă argila în firimituri, solul devine mai cald, mai ușor de lucrat și se tasează mai greu.' },
    { id: 'nisipos', name: 'Nisipos (ușor)', feel: 'Aspru, simți firele de nisip; curge printre degete și nu se poate rula.',
      good: 'Se scurge repede, se lucrează ușor și se încălzește repede primăvara.', bad: 'Se usucă repede, e sărac în hrană (ploaia o spală) și e adesea foarte acid.',
      fix: 'Adaugă multă materie organică, care leagă nisipul în firimituri mai fertile. Poate fi nevoie și de îngrășământ (de preferat organic).' },
    { id: 'prafos', name: 'Prăfos (aluvionar, „silt”)', feel: 'Puțin săpunos și alunecos; nu se lipește ușor în bulgări. E rar în grădini.',
      good: 'Fertil, destul de bine drenat, ține mai multă apă decât nisipul.', bad: 'Se tasează ușor.',
      fix: 'Adaugă materie organică, care leagă particulele în firimituri mai stabile. Ține-l acoperit cu plante, ca să nu-l spele ploaia sau să-l ia vântul.' },
    { id: 'lutos', name: 'Lutos (amestec, „loam”)', feel: 'Amestec de argilă, nisip și praf; poate fi lut argilos sau lut nisipos.',
      good: 'Fertil, bine drenat, ușor de lucrat.', bad: '',
      fix: 'Adaugă regulat materie organică, mai ales dacă sapi sau lucrezi solul în fiecare an.' },
    { id: 'calcaros', name: 'Calcaros (bogat în var)', feel: 'Poate fi ușor sau greu; uneori vezi bucăți albe de calcar. Spumează când torni oțet pe o probă.',
      good: '', bad: 'Foarte alcalin; nu poate fi făcut acid.',
      fix: 'Nu încerca să-l acidifiezi: alege plante care suportă solul alcalin (🔵 și 🟢 în lista după pH).' },
    { id: 'turbos', name: 'Turbos', feel: 'Format mai ales din materie organică. Rar în grădini.',
      good: 'Foarte fertil și ține multă apă.', bad: '', fix: '' }
  ];

  /** What the RHS says to do for a measured pH. */
  function phAdvice(ph) {
    if (ph == null || isNaN(ph)) return '';
    if (ph < 3) return 'Valoare neobișnuit de mică: repetă testul.';
    if (ph <= 5) return 'Sol foarte acid: adaugă var ca să urci pH-ul peste 5. Varul ajută și la afânarea argilelor acide.';
    if (ph <= 6) return 'Sol acid: adaugă var doar dacă nu crești plante iubitoare de sol acid (de ex. afinul).';
    if (ph <= 7) return 'De obicei nu e nevoie de nimic. pH 6,5 (ușor acid) e cel mai bun pentru majoritatea plantelor de grădină.';
    if (ph <= 8) return 'Sol alcalin: uneori se poate coborî pH-ul cu sulf (cel mai folosit). Solurile argiloase cer cantități foarte mari, iar cele cu calcar liber (spumează cu oțet) de obicei nu se pot corecta: alege plante potrivite.';
    if (ph <= 10) return 'Sol foarte alcalin: sursa nu dă o recomandare pentru peste 8. Alege plante care suportă solul alcalin.';
    return 'Valoare neobișnuită: repetă testul.';
  }

  window.SOILTESTS = {
    all: function () { return loadJson(SOILTEST_KEY, []).filter(function (t) { return t && t.id; }); },
    save: function (list) { saveJson(SOILTEST_KEY, list); },
    importAll: function (list, mode) {
      if (!Array.isArray(list)) return;
      var clean = list.filter(function (t) { return t && typeof t === 'object'; }).map(function (t) {
        var ph = parseFloat(t.ph);
        return { id: String(t.id || Date.now() + Math.random()).slice(0, 40), date: /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : todayStr(),
          place: String(t.place || '').slice(0, 60), ph: isNaN(ph) ? null : Math.round(ph * 10) / 10,
          method: ['kit', 'aparat', 'laborator'].indexOf(t.method) > -1 ? t.method : '', type: String(t.type || '').slice(0, 20),
          fizz: ['da', 'nu'].indexOf(t.fizz) > -1 ? t.fizz : '', note: String(t.note || '').slice(0, 300) };
      });
      var cur = mode === 'replace' ? [] : this.all();
      var ids = cur.map(function (t) { return t.id; });
      clean.forEach(function (t) { if (ids.indexOf(t.id) < 0) cur.push(t); });
      this.save(cur);
    }
  };

  function soilGuideHtml() {
    var srcs = function (ids) { return '<p class="adv-src">Sursa: ' + ids.map(function (id) { return '<a href="' + esc(window.SOURCES[id].u) + '" target="_blank" rel="noopener">' + esc(window.SOURCES[id].t) + '</a>'; }).join(', ') + '</p>'; };
    return '<div class="sg">' +
      '<details class="set-card sg-sec" open><summary><h3>✋ Ce sol ai? Proba cu mâna</h3></summary>' +
        '<p>Ia puțin pământ umed, freacă-l și încearcă să-l rulezi între palme:</p><ul class="pc-list">' +
        SOIL_TYPES.filter(function (t) { return t.id !== 'turbos' && t.id !== 'lutos'; }).map(function (t) { return '<li><b>' + esc(t.name) + ':</b> ' + esc(t.feel) + '</li>'; }).join('') +
        '</ul><p><b>Proba cu oțet:</b> pune puțin oțet pe o probă de sol. Dacă face spumă, solul conține calcar liber (e bogat în var).</p>' + srcs(['rhs_soiltypes']) + '</details>' +
      '<details class="set-card sg-sec"><summary><h3>🟫 Tipurile de sol și cum le îmbunătățești</h3></summary>' +
        SOIL_TYPES.map(function (t) {
          return '<div class="sg-type"><h4>' + esc(t.name) + '</h4>' +
            (t.good ? '<p>👍 ' + esc(t.good) + '</p>' : '') + (t.bad ? '<p>⚠️ ' + esc(t.bad) + '</p>' : '') + (t.fix ? '<p>🛠️ ' + esc(t.fix) + '</p>' : '') + '</div>';
        }).join('') + srcs(['rhs_soiltypes']) + '</details>' +
      '<details class="set-card sg-sec"><summary><h3>🧪 pH-ul: ce e și cum îl măsori</h3></summary>' +
        '<p>Scara merge de la 0 la 14. <b>7 e neutru</b>, sub 7 e acid, peste 7 e alcalin. Un sol <b>ușor acid, cu pH 6,5</b>, e cel mai bun pentru majoritatea plantelor de grădină. Plantele iubitoare de sol acid (de ex. afinul) nu suportă solul alcalin.</p>' +
        '<p><b>Când măsori:</b> înainte să faci o grădină sau un strat nou de legume, înainte să plantezi pomi și arbuști fructiferi, sau când plantele cresc prost ori au frunze îngălbenite. Poți măsura oricând, dar rezultatul poate înșela dacă în ultimele 3 luni ai dat var, îngrășământ sau materie organică.</p>' +
        '<p><b>Cum măsori:</b> trusele de grădină (kit) sunt ieftine, ușor de folosit și dau o idee bună despre pH. Pentru cel mai bun rezultat, trimite o probă la un laborator: îți spune și dacă solul are calcar liber. Ia proba exact cum scrie în instrucțiunile trusei sau ale laboratorului.</p>' + srcs(['rhs_phtest']) + '</details>' +
      '<details class="set-card sg-sec"><summary><h3>⚖️ Cum corectezi pH-ul</h3></summary>' +
        '<table class="wx-table sg-table"><tr><th>pH măsurat</th><th>Ce faci</th></tr>' +
        [[4, '3,0–5,0'], [5.5, '5,1–6,0'], [6.5, '6,1–7,0'], [7.5, '7,1–8,0']].map(function (r) { return '<tr><td>' + r[1] + '</td><td>' + esc(phAdvice(r[0])) + '</td></tr>'; }).join('') +
        '</table><p class="mut">Varul (natural) ridică pH-ul; sulful îl coboară. Cantitățile depind de sol și de produs: urmează instrucțiunile de pe ambalaj sau recomandarea laboratorului.</p>' + srcs(['rhs_phtest']) + '</details>' +
    '</div>';
  }

  function soilTestHtml() {
    var list = SOILTESTS.all().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    var mine = Object.keys(garden).map(plantById).filter(Boolean);
    var fitList = function (ph) {
      if (ph == null || !mine.length) return '';
      var ok = [], out = [], info = [];
      mine.forEach(function (p) {
        var so = soilOf(p);
        if (so.ph) (ph >= so.ph[0] && ph <= so.ph[1] ? ok : out).push(p.name + (ph < so.ph[0] || ph > so.ph[1] ? ' (' + fmtPh(so.ph[0]) + '–' + fmtPh(so.ph[1]) + ')' : ''));
        else if (so.cat && so.cat[0] === 'ANL') ok.push(p.name);
        else info.push(p.name + ' (' + phLabel(so) + ')');
      });
      return '<div class="st-fit">' +
        (ok.length ? '<p>✅ <b>Potrivite</b> după sursele din aplicație: ' + esc(ok.join(', ')) + '.</p>' : '') +
        (out.length ? '<p>⚠️ <b>În afara intervalului din sursă:</b> ' + esc(out.join(', ')) + '.</p>' : '') +
        (info.length ? '<p>ℹ️ Sursa dă doar o categorie, compară tu: ' + esc(info.join(', ')) + '.</p>' : '') + '</div>';
    };
    var TYPE_N = {}; SOIL_TYPES.forEach(function (t) { TYPE_N[t.id] = t.name; });
    var METHOD_N = { kit: 'trusă (kit)', aparat: 'aparat de măsură', laborator: 'laborator' };
    var rows = list.map(function (t, i) {
      var conf = state.stDel === t.id;
      return '<div class="st-item' + (i === 0 ? ' latest' : '') + '">' +
        '<div class="st-head"><b>' + (t.ph != null ? 'pH ' + fmtPh(t.ph) : 'fără pH') + '</b><span>' + esc(fmtDay(t.date)) + ' ' + t.date.slice(0, 4) + (t.place ? ' · ' + esc(t.place) : '') + '</span>' +
          (conf ? '<span class="st-del"><button type="button" class="btn danger" data-stdel-yes="' + esc(t.id) + '">Șterge</button><button type="button" class="btn secondary" data-stdel-no>Nu</button></span>'
            : '<button type="button" class="icon-btn" data-stdel="' + esc(t.id) + '" aria-label="Șterge măsurătoarea"><i class="fas fa-trash" aria-hidden="true"></i></button>') + '</div>' +
        '<p class="mut">' + [t.method ? 'Metodă: ' + METHOD_N[t.method] : '', t.type ? 'Sol: ' + esc(TYPE_N[t.type] || t.type) : '', t.fizz ? 'Spumează cu oțet: ' + t.fizz : ''].filter(Boolean).join(' · ') + '</p>' +
        (t.note ? '<p>' + esc(t.note) + '</p>' : '') +
        (t.ph != null ? '<p class="st-adv">💡 ' + esc(phAdvice(t.ph)) + '</p>' : '') +
        (t.fizz === 'da' && t.ph != null && t.ph > 7 ? '<p class="st-adv">💡 Solul are calcar liber: de obicei nu poate fi făcut acid.</p>' : '') +
        (t.type && SOIL_TYPES.filter(function (x) { return x.id === t.type && x.fix; }).length ? '<p class="st-adv">🛠️ ' + esc(SOIL_TYPES.filter(function (x) { return x.id === t.type; })[0].fix) + '</p>' : '') +
        (i === 0 ? fitList(t.ph) : '') +
      '</div>';
    }).join('');
    return '<div class="set-card st-card"><h3><i class="fas fa-flask" aria-hidden="true"></i>Rezultatele testului meu</h3>' +
      '<p class="mut">Măsurătorile tale, păstrate doar pe acest telefon (și în copia de siguranță). Sunt separate de datele plantelor, care vin din surse: aici aplicația doar compară valoarea ta cu ele.</p>' +
      '<form id="st-form" class="st-form" novalidate>' +
        '<label>Data<input type="date" name="date" value="' + todayStr() + '" required></label>' +
        '<label>Locul<input type="text" name="place" maxlength="60" placeholder="ex. strat legume, livadă"></label>' +
        '<label>pH măsurat<input type="text" name="ph" inputmode="decimal" maxlength="5" placeholder="ex. 6,5"></label>' +
        '<label>Cum ai măsurat<select name="method"><option value="">–</option><option value="kit">trusă (kit)</option><option value="aparat">aparat de măsură</option><option value="laborator">laborator</option></select></label>' +
        '<label>Tipul solului (proba cu mâna)<select name="type"><option value="">nu știu</option>' + SOIL_TYPES.map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('') + '</select></label>' +
        '<label>Spumează cu oțet?<select name="fizz"><option value="">n-am încercat</option><option value="da">da</option><option value="nu">nu</option></select></label>' +
        '<label class="st-wide">Notă<input type="text" name="note" maxlength="300" placeholder="ex. probă după ploaie, în 3 locuri"></label>' +
        '<p class="bk-err" id="st-err" hidden></p>' +
        '<button type="submit" class="btn st-wide"><i class="fas fa-plus" aria-hidden="true"></i> Salvează măsurătoarea</button>' +
      '</form>' +
      (rows ? '<p class="section-title">Măsurătorile mele (' + list.length + ')</p>' + rows : '<p class="mut">Nu ai salvat încă nicio măsurătoare.</p>') +
      '</div>';
  }

  function renderSoil() {
    var view = state.soilView || 'ph';
    var groups = view === 'ph' ? SOIL_GROUPS : DRAIN_GROUPS;
    var key = view === 'ph' ? 'group' : 'drain';

    var row = function (p) {
      var s = soilOf(p);
      var bad = neighbours(p).filter(function (r) { return r.kind === 'bad'; }).length;
      return '<button type="button" class="srow" style="--soil:' + s.g.color + '" data-open="' + esc(p.id) + '"><span class="srow-n">' + esc(p.name) +
        (inGarden(p.id) ? ' <i class="fas fa-heart" aria-label="în grădina mea"></i>' : '') + '</span>' +
        '<span class="srow-c">' + (view === 'drain' ? soilBadge(p) : '<span class="schip">' + esc(phLabel(s)) + '</span>') +
        (view === 'ph' && s.drain === 'dry' ? '<span class="schip">🏔️</span>' : '') +
        (view === 'ph' && s.drain === 'moist' ? '<span class="schip">💧</span>' : '') +
        (bad ? '<span class="schip bad">🚫 ' + bad + '</span>' : '') + '</span></button>';
    };

    var subgroups = function (items) {
      var html = '';
      CATS.forEach(function (c) {
        var inCat = items.filter(function (p) { return p.cat === c.id; }).sort(byName);
        if (!inCat.length) return;
        html += '<div class="ssub"><h4>' + c.icon + ' ' + esc(c.name) + ' <small>(' + inCat.length + ')</small></h4>';
        if (c.id === 'vegetables') {
          // Vegetables: one more level, by crop-rotation family.
          Object.keys(window.SOIL.ROT).forEach(function (rk) {
            var fam = inCat.filter(function (p) { return soilOf(p).rot === rk; });
            if (!fam.length) return;
            html += '<p class="sfam">🔄 ' + esc(window.SOIL.ROT[rk].name) + '</p><div class="srows">' + fam.map(row).join('') + '</div>';
          });
        } else {
          html += '<div class="srows">' + inCat.map(row).join('') + '</div>';
        }
        html += '</div>';
      });
      return html;
    };

    viewEl.innerHTML =
      '<div class="page-head"><a class="icon-btn" href="#plante" aria-label="Înapoi la plante" style="text-decoration:none">‹</a>' +
      '<div><h2>🧪 Plante după sol</h2><p>Aceeași culoare = același tip de sol. Le poți pune împreună, dacă nu sunt vecini de evitat (🚫).</p></div></div>' +
      '<div class="segments" role="tablist" style="margin-top:12px">' +
        '<button type="button" role="tab" data-soilview="ph" aria-selected="' + (view === 'ph') + '">După pH (culori)</button>' +
        '<button type="button" role="tab" data-soilview="drain" aria-selected="' + (view === 'drain') + '">După drenaj</button>' +
        '<button type="button" role="tab" data-soilview="guide" aria-selected="' + (view === 'guide') + '">Ghid</button>' +
        '<button type="button" role="tab" data-soilview="test" aria-selected="' + (view === 'test') + '">Testul meu</button>' +
      '</div>' +
      (view === 'guide' ? soilGuideHtml() : view === 'test' ? soilTestHtml() : groups.map(function (g) {
        var items = PLANTS.filter(function (p) { return soilOf(p)[key] === g.id; });
        if (!items.length) return '';
        var head = view === 'ph'
          ? '<h3 class="group-head sgroup-h" style="--soil:' + g.color + '"><i aria-hidden="true"></i>' + esc(g.name) + ' <small>(' + items.length + ')</small></h3>'
          : '<h3 class="group-head">' + g.icon + ' ' + esc(g.name) + ' <small>(' + items.length + ')</small></h3>';
        return '<section class="sgroup"' + (view === 'ph' ? ' style="--soil:' + g.color + '"' : '') + '>' + head +
          '<p class="sgroup-sub">' + esc(g.sub) + '</p>' + subgroups(items) + '</section>';
      }).join('') +
      '<div class="note">🚫 = are vecini de evitat. Apasă pe o plantă pentru detalii și surse.</div>');
  }

  // ------------------------------------------------------------------
  // Plant card: ONE standard component used on every page and in the detail sheet.
  // Order is dynamic: what matters in the shown month comes first, then the rest
  // in the order it comes up in the following months.
  // ------------------------------------------------------------------

  /** Months from `from` until the first month in `months` (0 = this month). Infinity when none. */
  function monthDist(from, months) {
    var best = Infinity;
    (months || []).forEach(function (mm) { var d = (mm - from + 12) % 12; if (d < best) best = d; });
    return best;
  }

  function uniqMonths(list) {
    var seen = {};
    return list.filter(function (x) { if (seen[x]) return false; seen[x] = true; return true; }).sort(function (a, b) { return a - b; });
  }

  function para(t) { return t ? '<p>' + txt(t) + '</p>' : ''; }

  /** Basic facts about the plant. */
  function aboutHtml(p) {
    var fact = function (k, v) { return v ? '<div class="pc-fact"><small>' + k + '</small><strong>' + v + '</strong></div>' : ''; };
    return para(p.about) + '<div class="pc-facts">' +
      fact('Tip', esc(p.life)) + fact('Lumină', esc(p.sun)) +
      fact('Se plantează', monthRanges(p.plant)) +
      (p.harvest.length ? fact('Recoltare', monthRanges(p.harvest)) : '') +
      (p.bloom.length ? fact('Înflorire', monthRanges(p.bloom)) : '') +
      (p.hardy ? fact('Rezistă la ger', '🥶 RHS ' + esc(p.hardy.r) + ': ' + esc(p.hardy.range) + (p.hardy.note ? '<br><small>' + esc(p.hardy.note) + '</small>' : '')) : '') +
      fact('Albine', (p.bee ? '🐝 ' : '') + esc(BEE_LABELS[p.bee]) + (p.beeNote ? '<br><small>' + esc(p.beeNote) + '</small>' : '')) +
      '</div>';
  }

  /** All the information about a plant, split into sections. Each section knows its months. */
  function plantSections(p, skipPlant) {
    var o = orchardOf(p);
    var out = [];
    var add = function (id, icon, title, months, html) {
      if (html) out.push({ id: id, icon: icon, title: title, months: months || [], html: html });
    };
    var list = function (items) {
      return '<ul class="pc-list">' + items.map(function (j) {
        return '<li><b>' + esc(j.t) + '</b> <span class="pc-mon">' + monthRanges(j.m) + '</span>' + (j.d ? '<br>' + esc(j.d) : '') + '</li>';
      }).join('') + '</ul>';
    };
    var jobs = p.jobs || [];

    add('plant', '🌱', p.cat === 'vegetables' ? 'Semănat și plantare' : 'Plantare', skipPlant ? [] : p.plant, para(p.how) + conditionsHtml(p));
    add('water', '💧', 'Udare', uniqMonths(p.plant.concat([6, 7, 8])), para(p.water));
    add('pick', '🧺', 'Recoltare', p.harvest, para(p.pick));
    if (o) {
      add('prune', '✂️', o.thin.length ? 'Tăiere și rărire' : 'Tăiere', uniqMonths(o.prune.concat(o.thin)),
        para(o.pruneTxt) + (o.thin.length ? '<h5>🍏 Rărirea fructelor · ' + monthRanges(o.thin) + '</h5>' + para(o.thinTxt) : ''));
      add('protect', '🛡️', 'Protecție: dăunători, îngheț, păsări', o.protectM, o.protect.length ? list(o.protect) : '');
      add('feed', '🌾', 'Hrănire', o.feed, para(o.feedTxt));
      add('lime', '⚪', 'Var pe trunchi', ORCHARD.lime, limeHtml());
      add('graft', '🌿', 'Altoire', o.graft, para(o.graftTxt) +
        '<p><b>Se altoiește pe:</b> ' + esc(o.graftOn) + '</p>' +
        '<p><b>Pe ' + esc(p.name.toLowerCase()) + ' poți altoi:</b></p>' +
        '<ul class="pc-list">' + o.hosts.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
        '<p class="warn">⚠️ ' + esc(o.notOn) + '</p>' +
        '<p class="mut">' + esc(ORCHARD.graftWarn) + '</p>' +
        '<a class="pc-link" href="#altoire">🌿 Ghidul complet de altoire →</a>');
    }
    var jobMonths = uniqMonths([].concat.apply([], jobs.map(function (j) { return j.m; })));
    add('care', '🧤', 'Îngrijire', jobMonths, (jobs.length ? list(jobs) : '') + para(p.care));
    add('soil', '🧪', 'Sol și vecini', [], soilNbHtml(p, 'body'));
    if (o) {
      add('form', '📏', 'Formare și înmulțire', [], '<h5>Cum îl faci să crească drept</h5>' + para(o.formTxt) + '<h5>Înmulțire</h5>' + para(o.propTxt));
    }
    add('about', '📖', 'Despre plantă', [], aboutHtml(p));
    if (o) {
      add('ask', '❓', 'Pot să-l mut? Dacă băltește apa?', [],
        '<h5>Pot să-l mut?</h5><p>' + (o.move && o.move.length ? 'Se poate muta în: ' + monthRanges(o.move) + '. ' : '') + esc(o.moveTxt || '') + '</p>' +
        '<h5>Dacă băltește apa</h5>' + para(ORCHARD.waterlogTxt));
    }
    return out;
  }

  /** "Now" block: jobs for the month, with "cum?" details, plus what does NOT apply now. */
  function nowHtml(p, m, skipPlant) {
    var a = monthActions(p, m, skipPlant);
    var item = function (x, kind) {
      var head = '<span class="pc-ico ' + (x.cls || kind) + '"><i class="fas ' + x.icon + '" aria-hidden="true"></i></span><span class="pc-t">' + esc(x.t) + '</span>';
      if (kind === 'yes' && x.d && x.d.trim()) {
        return '<li><details><summary>' + head + '<span class="pc-how">cum?</span></summary><div class="pc-howtxt">' + txt(x.d) + '</div></details></li>';
      }
      return '<li class="' + kind + '">' + head + '</li>';
    };
    var later = a.no.filter(function (x) { return x.sub; });
    return '<div class="pc-now">' +
      '<div class="pc-lbl"><i class="fas fa-calendar-day" aria-hidden="true"></i>Acum · ' + esc(MONTHS[m - 1]) + '</div>' +
      '<ul class="pc-do">' +
        (a.yes.length ? a.yes.map(function (x) { return item(x, 'yes'); }).join('')
          : '<li class="none"><span class="pc-ico none"><i class="fas fa-mug-hot" aria-hidden="true"></i></span><span class="pc-t">Nimic de făcut luna aceasta.</span></li>') +
        a.info.map(function (x) { return item(x, 'info'); }).join('') +
      '</ul>' +
      plantWeatherNote(p, m) +
      (later.length ? '<div class="pc-later"><span>Nu acum:</span>' + later.map(function (x) {
        return '<span class="pc-chip"><i class="fas ' + x.icon + '" aria-hidden="true"></i>' + esc(x.sub) + '</span>';
      }).join('') + '</div>' : '') +
      '</div>';
  }

  /** "Coming up": the next jobs after the shown month, in order. */
  function nextHtml(p, m, skipPlant) {
    var seen = {}, items = [];
    for (var k = 1; k < 12 && items.length < 4; k++) {
      var mm = ((m - 1 + k) % 12) + 1;
      monthActions(p, mm, skipPlant).yes.forEach(function (x) {
        var t = x.t.replace(/\s*acum\b/i, '').trim();
        if (seen[t] || items.length >= 4) return;
        seen[t] = true;
        items.push({ m: mm, t: t, icon: x.icon });
      });
    }
    if (!items.length) return '';
    return '<div class="pc-next"><div class="pc-lbl"><i class="fas fa-forward" aria-hidden="true"></i>Urmează</div><ol>' +
      items.map(function (x) {
        return '<li><b>' + MONTHS_SHORT[x.m - 1] + '</b><span><i class="fas ' + x.icon + '" aria-hidden="true"></i>' + esc(x.t) + '</span></li>';
      }).join('') + '</ol></div>';
  }

  /** The sections, ordered: this month first, then by how soon they come up. */
  function sectionsHtml(p, m, skipPlant, full) {
    var secs = plantSections(p, skipPlant).map(function (s, i) { return { s: s, i: i, d: monthDist(m, s.months) }; });
    secs.sort(function (a, b) { return a.d - b.d || a.i - b.i; });
    return secs.map(function (x) {
      var s = x.s;
      var when = x.d === 0 ? '<span class="pc-when now">recomandat</span>'
        : x.d < Infinity ? '<span class="pc-when">din ' + MONTHS_SHORT[((m - 1 + x.d) % 12)] + '</span>' : '';
      return '<details class="pc-sec"' + (full && x.d === 0 ? ' open' : '') + '><summary>' +
        '<span class="pc-sico" aria-hidden="true">' + s.icon + '</span><span class="pc-st">' + esc(s.title) +
        (s.months.length && s.id !== 'water' ? '<small>' + monthRanges(s.months) + '</small>' : '') + '</span>' + when +
        '<i class="fas fa-chevron-down pc-chev" aria-hidden="true"></i></summary><div class="pc-body">' + s.html + '</div></details>';
    }).join('');
  }

  /** Extra garden controls (planting date, how many) for plants in "My garden". */
  function gardenExtras(p) {
    var g = garden[p.id];
    if (!g) return '';
    return (g.status === 'planted'
      ? '<div class="pc-date"><label for="date-' + esc(p.id) + '">Plantat pe</label><input type="date" id="date-' + esc(p.id) + '" data-date="' + esc(p.id) + '" value="' + esc(g.date || '') + '"></div>'
      : '') + amountEditor(p);
  }

  /**
   * Renders the standard plant card.
   * @param {Object} p - plant
   * @param {Object} [opt] - { m: month shown, skipPlant: already in the ground, full: detail sheet, garden: show garden editors }
   */
  function plantCard(p, opt) {
    opt = opt || {};
    var m = opt.m || currentMonth;
    var cat = catById(p.cat);
    var s = soilOf(p);
    var chips = soilBadge(p) +
      '<span class="pc-chip">' + cat.icon + ' ' + esc(cat.short) + '</span>' +
      '<span class="pc-chip">' + esc(p.life) + '</span>';
    if (inGarden(p.id)) {
      chips += statusBadge(p.id);
      var tot = plantCount(p);
      if (tot && unitOf(p)) chips += '<span class="pc-chip fav">' + countLabel(tot, unitOf(p)) + '</span>';
    }
    var headInner = photoSlot(p, !!opt.full) +
      '<div class="pc-title"><h3' + (opt.full ? ' id="sheet-title"' : '') + '>' + esc(p.name) + beeIcons(p.bee) + '</h3>' +
      '<p class="pc-latin">' + esc(p.latin) + '</p><div class="pc-chips">' + chips + '</div></div>';
    var head = opt.full
      ? '<div class="pc-head full">' + headInner + '</div>'
      : '<button type="button" class="pc-head" data-open="' + esc(p.id) + '" aria-label="Deschide ' + esc(p.name) + '">' + headInner +
        '<i class="fas fa-chevron-right pc-go" aria-hidden="true"></i></button>';
    var n = plantSections(p, opt.skipPlant).length;

    return '<article class="pc' + (opt.full ? ' full' : '') + '" style="--cat:' + cat.color + ';--soil:' + s.g.color + '">' +
      head +
      (opt.noNow ? '' : nowHtml(p, m, opt.skipPlant)) +
      nextHtml(p, m, opt.skipPlant) +
      '<div class="pc-bar">' + monthBar(p, false, m) + '</div>' +
      '<details class="pc-more"' + (opt.full ? ' open' : '') + '><summary><span>Toate informațiile</span><small>' + n + ' secțiuni</small>' +
        '<i class="fas fa-chevron-down pc-chev" aria-hidden="true"></i></summary>' +
        '<div class="pc-secs">' + sectionsHtml(p, m, opt.skipPlant, opt.full) + '</div></details>' +
      '<div class="pc-foot">' + gardenAction(p) + (opt.garden || opt.full ? gardenExtras(p) : '') + '</div>' +
      '</article>';
  }

  /** Card for list / calendar pages. */
  function card(p, mode) {
    return plantCard(p, { m: mode === 'list' ? currentMonth : state.month });
  }

  /** Groups plants by category and renders headers + cards. */
  function groupedCards(list, mode) {
    var html = '';
    CATS.forEach(function (c) {
      var items = list.filter(function (p) { return p.cat === c.id; });
      if (!items.length) return;
      html += '<h3 class="group-head"><span class="dot" style="background:' + c.color + '"></span>' +
        c.icon + ' ' + esc(c.name) + ' <small>(' + items.length + ')</small></h3>';
      html += '<div class="cards">' + items.map(function (p) { return card(p, mode); }).join('') + '</div>';
    });
    return html;
  }

  // ------------------------------------------------------------------
  // Calendar view
  // ------------------------------------------------------------------

  function plantsFor(month, kind) {
    return PLANTS.filter(function (p) {
      if (state.onlyGarden && !inGarden(p.id)) return false;
      if (kind === 'todo') return hasWork(p, month);
      if (kind === 'plant') return p.plant.indexOf(month) > -1;
      if (kind === 'harvest') return p.harvest.indexOf(month) > -1;
      if (kind === 'bloom') return p.bee > 0 && p.bloom.indexOf(month) > -1;
      return false;
    }).sort(function (a, b) {
      if (kind === 'bloom' && a.bee !== b.bee) return b.bee - a.bee;
      return catOrder(a.cat) - catOrder(b.cat) || byName(a, b);
    });
  }

  /** Calendar search: finds any plant by name and shows its card for the month being viewed. */
  function renderCalSearch() {
    var box = document.getElementById('cal-results');
    var main = document.getElementById('cal-main');
    if (!box || !main) return;
    var q = (state.calSearch || '').trim();
    if (q.length < 2) { box.innerHTML = ''; main.hidden = false; return; }
    var norm = function (x) { return x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    var nq = norm(q);
    var found = PLANTS.filter(function (p) { return norm(p.name).indexOf(nq) > -1 || norm(p.latin).indexOf(nq) > -1; }).sort(byName);
    main.hidden = true;
    box.innerHTML = found.length
      ? '<p class="section-title">Rezultate (' + found.length + ') · ' + esc(MONTHS[state.month - 1].toLowerCase()) + '</p><div class="cards">' +
          found.map(function (p) { return card(p, 'calendar'); }).join('') + '</div>'
      : '<div class="empty">Nicio plantă găsită pentru „' + esc(q) + '”.</div>';
    loadPhotos(box);
  }

  function renderCalendar(month) {
    state.month = month;
    var m = month;
    var counts = {
      todo: plantsFor(m, 'todo'),
      plant: plantsFor(m, 'plant'),
      harvest: plantsFor(m, 'harvest'),
      bloom: plantsFor(m, 'bloom')
    };

    var pills = '';
    for (var i = 1; i <= 12; i++) {
      pills += '<button type="button" class="month-pill' + (i === currentMonth ? ' is-today' : '') +
        '" data-month="' + i + '" aria-pressed="' + (i === m) + '">' + MONTHS_SHORT[i - 1] + '</button>';
    }

    var tabs = [
      { id: 'todo', label: 'De făcut', n: counts.todo.length },
      { id: 'plant', label: 'Plantat', n: counts.plant.length },
      { id: 'harvest', label: 'Recoltat', n: counts.harvest.length },
      { id: 'bloom', label: 'Albine', n: counts.bloom.length },
      { id: 'orchard', label: 'Livadă', n: orchardCount(m) },
      { id: 'tasks', label: 'Lucrări', n: window.MONTH_TASKS[m - 1].length }
    ];
    var seg = '<div class="segments" role="tablist">' + tabs.map(function (t) {
      return '<button type="button" role="tab" data-caltab="' + t.id + '" aria-selected="' + (state.calTab === t.id) + '">' +
        esc(t.label) + '<span class="count">' + t.n + '</span></button>';
    }).join('') + '</div>';

    var body = '';
    if (state.calTab === 'orchard') {
      body = orchardMonthHtml(m);
    } else if (state.calTab === 'tasks') {
      body = '<ul class="tasks">' + window.MONTH_TASKS[m - 1].map(function (t) {
        return '<li>' + esc(t.t) + '</li>';
      }).join('') + '</ul>' +
        '<div class="note">📍 Datele exacte diferă de la o zonă la alta: în Câmpia de Vest (Timișoara) ultimul îngheț de primăvară a fost în medie pe 26 martie și primul de toamnă pe 28 octombrie (2010–2014); în zonele mai reci, la deal și la munte, sezonul începe mai târziu și se termină mai devreme. Pentru locul tău, vezi pagina Vreme.</div>';
    } else {
      var list = counts[state.calTab];
      var present = {};
      list.forEach(function (p) { present[p.cat] = true; });
      if (state.calCat !== 'all' && !present[state.calCat]) state.calCat = 'all';

      var chips = '<div class="chips" role="group" aria-label="Filtru categorie">' +
        '<button type="button" class="chip" data-calcat="all" aria-pressed="' + (state.calCat === 'all') + '">Toate</button>' +
        CATS.filter(function (c) { return present[c.id]; }).map(function (c) {
          return '<button type="button" class="chip" data-calcat="' + c.id + '" aria-pressed="' + (state.calCat === c.id) + '">' + c.icon + ' ' + esc(c.short) + '</button>';
        }).join('') + '</div>';

      var filtered = state.calCat === 'all' ? list : list.filter(function (p) { return p.cat === state.calCat; });

      var intro = {
        todo: 'Toate plantele la care ai ceva de făcut în ' + MONTHS[m - 1].toLowerCase() + ': plantat, cules, tăiat, îngrășat și alte lucrări. Apasă „cum?” pentru detalii.',
        plant: 'Ce poți planta sau semăna afară, în grădină, în ' + MONTHS[m - 1].toLowerCase() + '.',
        harvest: 'Ce poți recolta în ' + MONTHS[m - 1].toLowerCase() + '.',
        bloom: 'Plante melifere înflorite în ' + MONTHS[m - 1].toLowerCase() + ' – hrană pentru albine. Cele mai valoroase sunt primele.'
      }[state.calTab];

      body = '<p class="intro">' + esc(intro) + '</p>';
      if (filtered.length) {
        var bySoil = filtered.filter(matchSoil);
        body += chips + soilLegend();
        body += !bySoil.length
          ? '<div class="empty">Nicio plantă cu acest tip de sol aici. Apasă „Arată toate”.</div>'
          : state.calTab === 'bloom' && state.calCat === 'all'
            ? '<div class="cards" style="margin-top:12px">' + bySoil.map(function (p) { return card(p, 'bloom'); }).join('') + '</div>'
            : groupedCards(bySoil, state.calTab);
      } else {
        var emptyMsg = {
          todo: 'Nimic de făcut la plante luna aceasta. Verifică fila „Lucrări”.',
          plant: 'Nimic de plantat afară luna aceasta. Verifică fila „Lucrări”.',
          harvest: 'Nimic de recoltat luna aceasta.',
          bloom: 'Luna aceasta albinele stau în stup – nu înflorește nimic din listă.'
        }[state.calTab];
        body += '<div class="empty"><span class="big">' + (state.onlyGarden ? '🐝' : '❄️') + '</span>' +
          (state.onlyGarden
            ? 'Nicio plantă din grădina ta pentru această lună.<br>Dezactivează filtrul „Doar grădina mea” ca să vezi tot.'
            : emptyMsg) + '</div>';
      }
    }

    viewEl.innerHTML =
      '<div class="month-head">' +
        '<button type="button" class="icon-btn" data-month="' + (m === 1 ? 12 : m - 1) + '" aria-label="Luna anterioară">‹</button>' +
        '<div style="text-align:center"><h2>' + MONTHS[m - 1] + '</h2><div class="season">' + seasonOf(m) +
          (m === currentMonth ? ' · luna curentă' : '') + '</div></div>' +
        '<button type="button" class="icon-btn" data-month="' + (m === 12 ? 1 : m + 1) + '" aria-label="Luna următoare">›</button>' +
      '</div>' +
      '<div class="month-strip">' + pills + '</div>' +
      (m === currentMonth ? weatherStripHtml() : '') +
      '<label class="toggle-row"><span>★ Doar plantele din grădina mea</span>' +
        '<span class="switch"><input type="checkbox" id="only-garden"' + (state.onlyGarden ? ' checked' : '') + '><span></span></span></label>' +
      '<div class="cal-search">' +
        '<input class="search" type="search" id="cal-search" placeholder="Caută o plantă în ' + esc(MONTHS[m - 1].toLowerCase()) + '…" value="' + esc(state.calSearch || '') + '" autocomplete="off"></div>' +
      '<div id="cal-results"></div>' +
      '<div id="cal-main">' + seg + body + '</div>';
    renderCalSearch();

    // Keep the selected month pill visible in the scroller.
    var sel = viewEl.querySelector('.month-pill[aria-pressed="true"]');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  // ------------------------------------------------------------------
  // Categories and category pages
  // ------------------------------------------------------------------

  function renderCategories() {
    viewEl.innerHTML =
      '<div class="page-head"><div><h2>Plante</h2><p>' + PLANTS.length + ' plante pentru grădinile din România. Sursele sunt în Setări.</p></div></div>' +
      '<input class="search" type="search" id="global-search" placeholder="Caută o plantă…" value="' + esc(state.search) + '" autocomplete="off">' +
      '<div id="search-results"></div>' +
      '<a class="btn secondary" href="#sol" style="text-decoration:none;margin-top:12px">🧪 Plante după sol (pe culori) și vecini</a>' +
      '<p class="section-title">Categorii</p>' +
      '<div class="cat-grid">' + CATS.map(function (c) {
        var n = PLANTS.filter(function (p) { return p.cat === c.id; }).length;
        var nowN = PLANTS.filter(function (p) { return p.cat === c.id && p.plant.indexOf(currentMonth) > -1; }).length;
        return '<a class="cat-card" href="#plante-' + c.id + '" style="--cat-color:' + c.color + '">' +
          '<span class="emoji" aria-hidden="true">' + c.icon + '</span><h3>' + esc(c.name) + '</h3>' +
          '<small>' + n + ' plante' + (nowN ? ' · ' + nowN + ' de plantat acum' : '') + '</small></a>';
      }).join('') + '</div>';
    renderSearchResults();
    updatePhotoStatus();
  }

  function renderSearchResults() {
    var box = document.getElementById('search-results');
    if (!box) return;
    var q = state.search.trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = ''; return; }
    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    var nq = norm(q);
    var found = PLANTS.filter(function (p) { return norm(p.name).indexOf(nq) > -1 || norm(p.latin).indexOf(nq) > -1; }).sort(byName);
    box.innerHTML = found.length
      ? '<p class="section-title">Rezultate (' + found.length + ')</p><div class="cards">' + found.map(function (p) { return card(p, 'list'); }).join('') + '</div>'
      : '<div class="empty">Nicio plantă găsită pentru „' + esc(state.search) + '”.</div>';
  }

  /** Bee note for a category page; names any plant that is not a bee plant. */
  function beeNote(list) {
    var non = list.filter(function (p) { return !p.bee; }).map(function (p) { return p.name; });
    var base = 'Albinuța 🐝 arată că o sursă confirmă că planta e vizitată de albine; sursele nu gradează nectarul și polenul.';
    if (!non.length) return 'Toate plantele din această categorie sunt confirmate ca vizitate de albine. ' + base;
    return 'Informații insuficiente despre valoarea pentru albine (nu înseamnă că nu sunt melifere): ' + non.join(', ') + '. ' + base;
  }

  function renderCategory(catId) {
    var c = catById(catId);
    if (!c) { location.replace('#plante'); return; }
    var list = PLANTS.filter(function (p) { return p.cat === catId; }).sort(byName);
    var nowList = list.filter(function (p) { return p.plant.indexOf(currentMonth) > -1; });
    var shown = list.filter(matchSoil);

    viewEl.innerHTML =
      '<div class="page-head"><a class="icon-btn" href="#plante" aria-label="Înapoi la categorii" style="text-decoration:none">‹</a>' +
      '<div><h2>' + c.icon + ' ' + esc(c.name) + '</h2><p>' + list.length + ' plante · ' + nowList.length + ' se pot planta în ' + MONTHS[currentMonth - 1].toLowerCase() + '</p></div></div>' +
      '<div class="note">🐝 ' + beeNote(list) + '</div>' +
      (catId === 'trees' ? '<a class="btn secondary" href="#altoire" style="text-decoration:none;margin-top:12px">🌿 Ghid de altoire și var pe trunchi</a>' : '') +
      (catId === 'trees' || catId === 'shrubs' || catId === 'vines'
        ? '<div class="note">🌳 Lunile de plantare sunt pentru puieți cu rădăcina nudă. Cei la ghiveci se pot planta și în alte luni, cât solul nu e înghețat, evitând perioadele calde și secetoase.</div>' : '') +
      '<div class="note">📅 Lunile sunt orientative pentru zonele joase din România. Au pornit de la calendare de grădină românești și de la datele de îngheț din Câmpia de Vest (ultimul îngheț de primăvară, în medie 26 martie). În zonele mai reci sau la altitudine, primăvara vine de obicei mai târziu: pagina Vreme îți spune, pentru locul tău, dacă e momentul. Lunile de înflorire sunt orientative.</div>' +
      legendHtml() + soilLegend() +
      (shown.length
        ? '<div class="cards" style="margin-top:12px">' + shown.map(function (p) { return card(p, 'list'); }).join('') + '</div>'
        : '<div class="empty">Nicio plantă din această categorie cu acest tip de sol. Apasă „Arată toate”.</div>');
  }


  // ------------------------------------------------------------------
  // Weather (Open-Meteo) and garden advice – see js/weather.js and js/weather-advisor.js
  // ------------------------------------------------------------------

  var LVL = {
    warn: { label: 'Avertizare', icon: 'fa-triangle-exclamation' },
    watch: { label: 'Atenție', icon: 'fa-eye' },
    rec: { label: 'Recomandare', icon: 'fa-circle-check' }
  };

  function wxCtx(m, day) {
    return { fc: WEATHER.forecast(), month: m || currentMonth, plants: PLANTS, garden: garden, orchard: ORCHARD, hist: WEATHER.state().hist, day: day || 0 };
  }

  function fmtTime(ms) {
    var d = new Date(ms);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) + ', ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /** "Updated at …" line, clearly marking old data. */
  function wxStatusHtml() {
    var st = WEATHER.state();
    if (!st.loc) return '';
    if (st.loading && !st.ts) return '<p class="wx-upd"><i class="fas fa-rotate fa-spin" aria-hidden="true"></i>Se descarcă prognoza…</p>';
    if (!st.ts) {
      return '<p class="wx-upd bad"><i class="fas fa-wifi" aria-hidden="true"></i>' +
        (st.error === 'offline' ? 'Ești offline și nu există încă o prognoză salvată.' : 'Prognoza nu a putut fi descărcată. Încearcă din nou.') + '</p>';
    }
    var stale = WEATHER.isStale();
    return '<p class="wx-upd' + (stale ? ' bad' : '') + '"><i class="fas ' + (stale ? 'fa-clock-rotate-left' : 'fa-clock') + '" aria-hidden="true"></i>' +
      'Actualizat: ' + fmtTime(st.ts) +
      (stale ? ' – <b>datele nu mai sunt actuale</b>' : '') +
      (st.error === 'offline' ? ' · offline, arăt ultima prognoză salvată' : st.error ? ' · actualizarea a eșuat, arăt ultima prognoză salvată' : '') +
      '</p>' +
      (st.missing && st.missing.length ? '<p class="wx-upd bad"><i class="fas fa-circle-exclamation" aria-hidden="true"></i>Prognoza nu conține: ' + esc(st.missing.join(', ')) + '. Recomandările care depind de ele nu se afișează.</p>' : '');
  }

  function adviceHtml(list, max) {
    var shown = max ? list.slice(0, max) : list;
    return shown.map(function (a) {
      var items = a.items || [];
      var src = [].concat(a.src || [], [].concat.apply([], items.map(function (x) { return x.src || []; })));
      return '<details class="adv lvl-' + a.lvl + '"' + (max ? '' : ' open') + '><summary>' +
        '<span class="adv-ico" aria-hidden="true">' + a.icon + '</span>' +
        '<span class="adv-t"><small><i class="fas ' + LVL[a.lvl].icon + '" aria-hidden="true"></i>' + LVL[a.lvl].label + '</small>' + esc(a.title) + '</span>' +
        '<i class="fas fa-chevron-down pc-chev" aria-hidden="true"></i></summary>' +
        '<div class="adv-body"><p class="adv-why">' + esc(a.why) + '</p>' +
        (items.length ? '<ul>' + items.map(function (x) {
          var mine = (x.ids || []).filter(function (id) { return garden[id]; }).length;
          return '<li>' + esc(x.t) + (mine ? ' <span class="adv-g">★ ai în grădină</span>' : '') + '</li>';
        }).join('') + '</ul>' : '') +
        (src.length ? '<p class="adv-src">Bazat pe: ' + uniqStr(src).map(function (id) { return window.SOURCES[id] ? esc(window.SOURCES[id].t.split(' – ')[0]) : ''; }).filter(Boolean).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).join(', ') + ' (detalii în Setări → Surse)</p>' : '') +
        '</div></details>';
    }).join('');
  }
  function uniqStr(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  /** Locality chooser (weather page and settings). */
  function locPickerHtml() {
    var st = WEATHER.state();
    var auto = st.mode !== 'manual';
    var gpsMsg = st.locating ? '<p class="wx-upd"><i class="fas fa-location-crosshairs fa-beat" aria-hidden="true"></i>Caut locația telefonului…</p>'
      : st.gpsError === 'refuzat' ? '<p class="wx-upd bad"><i class="fas fa-location-dot" aria-hidden="true"></i>Accesul la locație e refuzat. Permite-l din setările browserului pentru acest site sau alege localitatea mai jos.</p>'
      : st.gpsError ? '<p class="wx-upd bad"><i class="fas fa-location-dot" aria-hidden="true"></i>Locația telefonului nu e disponibilă acum (GPS oprit?). Alege localitatea mai jos.</p>' : '';
    return '<div class="wx-loc">' +
      (st.loc ? '<p class="wx-loc-now"><i class="fas ' + (st.loc.auto ? 'fa-location-crosshairs' : 'fa-location-dot') + '" aria-hidden="true"></i><b>' + esc(st.loc.name) + '</b>' +
        (st.loc.area ? ' · ' + esc(st.loc.area) : '') + (st.loc.county ? ' · jud. ' + esc(st.loc.county) : '') +
        (st.loc.auto ? ' · ' + String(st.loc.lat).replace('.', ',') + ', ' + String(st.loc.lon).replace('.', ',') : '') +
        (st.loc.elev != null ? ' · ' + Math.round(st.loc.elev) + ' m altitudine' : '') + '</p>' : '') +
      '<p class="wx-mode">' + (auto ? '📡 <b>Automat</b>: vremea se ia după locația telefonului la fiecare pornire.' : '✋ <b>Manual</b>: folosesc localitatea aleasă de tine.') + '</p>' +
      gpsMsg +
      '<button type="button" class="btn secondary" data-wxgps><i class="fas fa-location-crosshairs" aria-hidden="true"></i><span>' +
        (auto ? 'Actualizează locația acum' : 'Treci pe locația automată (GPS)') + '</span></button>' +
      '<label class="wx-loc-l" for="wx-q">' + (st.loc ? 'Sau alege manual localitatea' : 'Sau alege manual localitatea ta') + '</label>' +
      '<input class="search" type="search" id="wx-q" placeholder="ex. Parța, Sibiu, Câmpulung, Vaslui…" autocomplete="off">' +
      '<div id="wx-res" class="wx-res"></div>' +
      '<p class="mut wx-loc-x">Dacă alegi manual o localitate, aplicația nu mai folosește GPS-ul până apeși „Treci pe locația automată”. Prognoza se calculează pentru coordonatele locului tău, oriunde în România.</p>' +
      '</div>';
  }

  var wxSearchTimer = null;
  function wxSearch(q) {
    var box = document.getElementById('wx-res');
    if (!box) return;
    clearTimeout(wxSearchTimer);
    if (q.trim().length < 2) { box.innerHTML = ''; return; }
    wxSearchTimer = setTimeout(function () {
      box.innerHTML = '<p class="mut">Caut…</p>';
      WEATHER.searchPlaces(q).then(function (list) {
        box.innerHTML = list.length ? list.slice(0, 12).map(function (x, i) {
          return '<button type="button" class="wx-place" data-wxplace="' + i + '"><b>' + esc(x.name) + '</b>' +
            '<small>' + esc([x.area, x.county ? 'jud. ' + x.county : '', x.elev != null ? Math.round(x.elev) + ' m' : ''].filter(Boolean).join(' · ')) + '</small></button>';
        }).join('') : '<p class="mut">Nicio localitate din România cu acest nume.</p>';
        box._list = list;
      }).catch(function (e) {
        box.innerHTML = '<p class="mut">' + (e && e.message === 'offline' ? 'Ești offline: căutarea localităților are nevoie de internet.' : 'Căutarea nu a mers. Încearcă din nou.') + '</p>';
      });
    }, 350);
  }

  /** Small weather + top advice block on the calendar (current month). */
  function weatherStripHtml() {
    var st = WEATHER.state();
    if (!st.loc) {
      return '<a class="wx-strip empty" href="#vreme"><i class="fas fa-cloud-sun" aria-hidden="true"></i>' +
        '<span><b>Recomandări după vreme</b><small>' + (WEATHER.state().locating ? 'Caut locația telefonului…' : 'Permite accesul la locație sau alege localitatea în Setări, ca să-ți spun ce merită făcut în zilele următoare.') + '</small></span><i class="fas fa-chevron-right" aria-hidden="true"></i></a>';
    }
    var fc = WEATHER.forecast();
    if (!fc) return '<a class="wx-strip empty" href="#vreme"><i class="fas fa-cloud" aria-hidden="true"></i><span><b>' + esc(st.loc.name) + '</b><small>' +
      (st.loading ? 'Se descarcă prognoza…' : 'Nu am încă o prognoză. Deschide pagina Vreme când ai internet.') + '</small></span></a>';
    var adv = ADVISOR.advise(wxCtx(currentMonth));
    var c = fc.current;
    var w = WEATHER.wmo(c ? c.weather_code : fc.days[0].code);
    var top = adv.filter(function (a) { return a.lvl !== 'rec'; }).slice(0, 2);
    if (!top.length) top = adv.slice(0, 1);
    return '<div class="wx-strip">' +
      '<a class="wx-strip-head" href="#vreme"><span class="wx-strip-ico" aria-hidden="true">' + w[0] + '</span>' +
        '<span><b>' + (c && c.temperature_2m != null ? Math.round(c.temperature_2m) + ' °C' : fc.days[0].tmax != null ? Math.round(fc.days[0].tmax) + ' °C max' : '– °C') + ' · ' + esc(st.loc.name) + '</b>' +
        '<small>' + esc(w[1]) + (fc.days[0].tmin != null && fc.days[0].tmax != null ? ' · azi ' + Math.round(fc.days[0].tmin) + '…' + Math.round(fc.days[0].tmax) + ' °C' : '') + (WEATHER.isStale() ? ' · date vechi' : '') + '</small></span>' +
        '<span class="wx-more">Vremea și grădina <i class="fas fa-chevron-right" aria-hidden="true"></i></span></a>' +
      (top.length ? adviceHtml(top, 2) : '<p class="mut" style="padding:0 12px 10px">Nimic special în prognoză pentru grădină.</p>') +
      '</div>';
  }

  /** Weather note on a plant card (only for the current month, only when relevant). */
  function plantWeatherNote(p, m) {
    if (m !== currentMonth || !window.WEATHER || !WEATHER.state().loc) return '';
    var n = ADVISOR.plantNote(p, wxCtx(m));
    if (!n) return '';
    return '<p class="pc-wx lvl-' + n.lvl + '"><i class="fas fa-cloud-bolt" aria-hidden="true"></i><span><b>Vremea:</b> ' + esc(n.t) + '</span></p>';
  }

  function renderWeather() {
    var st = WEATHER.state();
    var fc = WEATHER.forecast();
    var head = '<div class="page-head"><div><h2>🌦️ Vremea și grădina</h2><p>Prognoza pe 7 zile pentru localitatea ta și ce înseamnă pentru grădină.</p></div>' +
      (st.loc ? '<button type="button" class="icon-btn" data-wxrefresh aria-label="Actualizează prognoza"><i class="fas fa-rotate' + (st.loading ? ' fa-spin' : '') + '" aria-hidden="true"></i></button>' : '') + '</div>';
    var attr = '<p class="wx-attr"><a href="' + WEATHER.attribution.url + '" target="_blank" rel="noopener">' + esc(WEATHER.attribution.text) + '</a> · prognozele sunt estimări și pot greși, mai ales după 3 zile.</p>';

    if (!st.loc) {
      viewEl.innerHTML = head + '<div class="set-card">' + locPickerHtml() + '</div>' + attr;
      return;
    }
    if (!fc) {
      viewEl.innerHTML = head + '<div class="set-card">' + locPickerHtml() + wxStatusHtml() + '</div>' + attr;
      return;
    }

    var c = fc.current;
    var h0 = fc.hours[0] || {};
    var w = WEATHER.wmo(c ? c.weather_code : fc.days[0].code);
    var wday = Math.min(state.wxDay || 0, fc.days.length - 1);
    var adv = ADVISOR.advise(wxCtx(currentMonth, wday));
    // Values the API did not send are shown as "–", never as 0.
    var n0 = function (v, unit) { return v == null || isNaN(v) ? '–' : Math.round(v) + (unit || ''); };
    var n1 = function (v, unit) { return v == null || isNaN(v) ? '–' : fmtC(Math.round(v * 10) / 10) + (unit || ''); };
    var isFrost = function (v) { return v != null && v <= 0; };
    var stat = function (icon, label, val) { return val == null || val === '' ? '' : '<div class="wx-stat"><i class="fas ' + icon + '" aria-hidden="true"></i><small>' + label + '</small><b>' + val + '</b></div>'; };

    // 1. Current conditions
    var now = '<div class="wx-now">' +
      '<div class="wx-now-main"><span class="wx-big" aria-hidden="true">' + w[0] + '</span><div>' +
        '<div class="wx-temp">' + (c ? n0(c.temperature_2m) : '–') + ' °C</div>' +
        '<div class="mut">' + esc(w[1]) + (c && c.apparent_temperature != null ? ' · se simte ca ' + Math.round(c.apparent_temperature) + ' °C' : '') + '</div>' +
        '<div class="wx-place-n"><i class="fas fa-location-dot" aria-hidden="true"></i>' + esc(st.loc.name) + (st.loc.elev != null ? ' · ' + Math.round(st.loc.elev) + ' m' : '') + '</div>' +
      '</div></div>' +
      '<div class="wx-stats">' +
        stat('fa-droplet', 'Umiditate', c && c.relative_humidity_2m != null ? n0(c.relative_humidity_2m, '%') : null) +
        stat('fa-wind', 'Vânt', c && c.wind_speed_10m != null ? n0(c.wind_speed_10m, ' km/h ') + WEATHER.windDir(c.wind_direction_10m) : null) +
        stat('fa-wind', 'Rafale', c && c.wind_gusts_10m != null ? Math.round(c.wind_gusts_10m) + ' km/h' : null) +
        stat('fa-umbrella', 'Șanse ploaie', h0.prob != null ? h0.prob + '%' : null) +
        stat('fa-cloud-rain', 'Precipitații acum', c && c.precipitation != null ? n1(c.precipitation, ' mm') : null) +
        stat('fa-sun', 'Radiație solară', c && c.shortwave_radiation != null ? Math.round(c.shortwave_radiation) + ' W/m²' : null) +
      '</div>' + wxStatusHtml() + '</div>';

    // 2. Garden advice (important first)
    var dayTabs = '<div class="wx-daytabs" role="group" aria-label="Recomandări pentru ziua">' + fc.days.map(function (d, i) {
      var nm = ADVISOR.dayName(d.date);
      return '<button type="button" class="chip" aria-pressed="' + (i === wday) + '" data-wxday="' + i + '">' +
        (ADVISOR.goodDay(d) ? '<span class="wx-ok" title="Zi bună de lucru">✓</span>' : '') + nm.charAt(0).toUpperCase() + nm.slice(1) + '</button>';
    }).join('') + '</div>';
    var advHtml = '<p class="section-title">Pentru grădină' + (wday ? ' – ' + ADVISOR.dayName(fc.days[wday].date) + ' ' + fc.days[wday].date.slice(8, 10) + '.' + fc.days[wday].date.slice(5, 7) : '') + '</p>' + dayTabs +
      (wday >= 3 ? '<p class="mut wx-note">Pentru zilele de după a treia, prognoza e mai nesigură.</p>' : '') +
      (adv.length ? '<div class="adv-list">' + adviceHtml(adv) + '</div>'
        : '<div class="empty">Nimic special în prognoză. Urmează calendarul lunii.</div>') +
      '<p class="mut wx-note">Pragurile pentru ploaie, vânt, caniculă și umezeală sunt orientative (ale aplicației). Pragurile pe plante (sol, nopți, îngheț) vin din surse – vezi Setări → Surse.</p>';

    // 3. 7 days
    var daysHtml = '<p class="section-title">Următoarele 7 zile</p><div class="wx-days">' + fc.days.map(function (d, i) {
      var dw = WEATHER.wmo(d.code);
      return '<div class="wx-day' + (isFrost(d.tmin) ? ' frost' : '') + '">' +
        '<b>' + ADVISOR.dayName(d.date, i) + (d.partial ? ' <small>(orele rămase)</small>' : '') + '</b><small>' + d.date.slice(8, 10) + '.' + d.date.slice(5, 7) + '</small>' +
        '<span class="wx-day-ico" title="' + esc(dw[1]) + '">' + dw[0] + '</span>' +
        '<span class="wx-mm"><span class="mx">' + n0(d.tmax, '°') + '</span><span class="mn">' + n0(d.tmin, '°') + '</span></span>' +
        '<small><i class="fas fa-cloud-rain" aria-hidden="true"></i> ' + n1(d.rain, ' mm') + (d.prob != null ? ' · ' + d.prob + '%' : '') + '</small>' +
        '<small><i class="fas fa-wind" aria-hidden="true"></i> ' + n0(d.wind) + (d.gust != null ? '/' + n0(d.gust) : '') + ' km/h</small>' +
        (d.sunrise ? '<small>☀ ' + d.sunrise.slice(11, 16) + '–' + (d.sunset || '').slice(11, 16) + '</small>' : '') +
        (isFrost(d.tmin) ? '<span class="wx-frost">❄ îngheț</span>' : '') +
        (ADVISOR.goodDay(d) ? '<span class="wx-good">✓ bună de lucru</span>' : '') +
        '</div>';
    }).join('') + '</div>' + '<p class="mut wx-note">✓ = zi bună de lucru în grădină: fără îngheț, fără ploaie de peste ' + ADVISOR.thresholds.rainSkipWater + ' mm, fără vânt puternic, caniculă sau furtună (praguri orientative).</p>' + (fc.days.length > 3 ? '<p class="mut wx-note">Zilele 4–7 sunt mai nesigure; recomandările de lucru se bazează mai ales pe primele 3 zile.</p>' : '');

    // 4. Hourly (next 24 h)
    var hours = fc.hours.slice(0, 24);
    var hourHtml = '<p class="section-title">Pe ore (următoarele 24 de ore)</p><div class="wx-hours">' + hours.map(function (h) {
      var hw = h.code != null ? WEATHER.wmo(h.code) : ['', ''];
      return '<div class="wx-hour' + (isFrost(h.t) ? ' frost' : '') + '"><b>' + h.time.slice(11, 16) + '</b>' +
        '<span>' + hw[0] + '</span><span class="t">' + n0(h.t, '°') + '</span>' +
        '<small>' + (h.prob != null ? h.prob + '%' : '') + (h.rain ? ' · ' + fmtC(Math.round(h.rain * 10) / 10) + ' mm' : '') + '</small>' +
        '<small>' + n0(h.wind, ' km/h') + '</small><small>' + n0(h.rh, '%') + '</small>' +
        (isFrost(h.t) ? '<span class="wx-frost">❄</span>' : '') + '</div>';
    }).join('') + '</div>';

    // 5. Soil temperature (model)
    var s0 = h0.soil0, s6 = h0.soil6, s18 = h0.soil18;
    var soilHtml = '<p class="section-title">Temperatura solului</p><div class="set-card">' +
      (s6 != null
        ? '<div class="wx-stats">' + stat('fa-temperature-low', 'La suprafață', n1(s0, ' °C')) +
            stat('fa-seedling', 'La 6 cm', n1(s6, ' °C')) + stat('fa-arrow-down', 'La 18 cm', n1(s18, ' °C')) + '</div>' +
          '<p class="mut">Valori <b>estimate de modelul meteo</b> pentru zona ta, nu măsurate în grădina ta. Pentru semănat, măsoară solul cu un termometru, la adâncimea de semănat.</p>'
        : '<p>Prognoza nu are temperatura solului pentru localitatea aleasă. Măsoar-o local, cu un termometru de sol – temperatura aerului nu e același lucru.</p>') +
      '</div>';

    // 6. Water balance (rain vs evaporation)
    var wb = ADVISOR.waterBalance(fc);
    var waterHtml = '<p class="section-title">Apa în sol: ploaie și evaporare</p><div class="set-card">' + (wb
      ? '<div class="wx-stats">' + stat('fa-cloud-rain', 'Ploaie', n1(wb.rain, ' mm')) + stat('fa-sun', 'Evaporare (ET₀)', n1(wb.et0, ' mm')) +
          stat('fa-scale-balanced', 'Bilanț', (wb.bal >= 0 ? '+' : '−') + n1(Math.abs(wb.bal), ' mm')) + '</div>' +
        '<p class="mut">Ultimele ' + wb.nPast + ' zile și următoarele ' + (wb.n - wb.nPast) + '. 1 mm = 1 litru de apă pe m². ET₀ e pierderea de apă a unui gazon bine udat (metoda FAO-56), calculată de Open-Meteo. ' +
          'Plantele tale pot pierde mai mult sau mai puțin decât gazonul, iar ghivecele se usucă mult mai repede. Umiditatea reală se verifică în sol.</p>'
      : '<p>Prognoza nu are evaporarea (ET₀) pentru localitatea aleasă, așa că nu pot face bilanțul apei. Verifică solul direct.</p>') + '</div>';

    // 7. Local frost history
    var fs = ADVISOR.frostStats(st.hist && st.loc && st.hist.key === (Math.round(st.loc.lat * 10) / 10) + ',' + (Math.round(st.loc.lon * 10) / 10) ? st.hist : null);
    var md = ADVISOR.mdName;
    var frostHtml = '<p class="section-title">Înghețurile la tine (ultimii ani)</p><div class="set-card">' + (fs
      ? '<div class="wx-stats">' +
          (fs.last ? stat('fa-snowflake', 'Ultimul îngheț de primăvară', 'de obicei ~' + md(fs.last.median) + '<span class="wx-sub">cel mai târziu: ' + md(fs.last.latest) + '</span>') : '') +
          (fs.first ? stat('fa-snowflake', 'Primul îngheț de toamnă', 'de obicei ~' + md(fs.first.median) + '<span class="wx-sub">cel mai devreme: ' + md(fs.first.earliest) + '</span>') : '') +
        '</div>' +
        '<details class="wx-hist"><summary>Pe ani</summary><table class="wx-table"><tr><th>An</th><th>Ultimul îngheț (primăvară)</th><th>Primul îngheț (toamnă)</th></tr>' +
          fs.years.map(function (y) { return '<tr><td>' + y.y + '</td><td>' + (y.last ? md(y.last) : '–') + '</td><td>' + (y.first ? md(y.first) : '–') + '</td></tr>'; }).join('') + '</table></details>' +
        '<p class="mut">Zile cu minima aerului (la 2 m) de 0 °C sau mai puțin, în ultimii ' + fs.n + ' ani, din <b>date istorice estimate</b> pentru zona ta (Open-Meteo, modele de reanaliză pe o grilă de câțiva km), nu dintr-o stație din curtea ta. ' +
          'Bruma la nivelul solului poate apărea și când aerul are 1–4 °C, iar în văi și locuri joase se adună aerul rece, așa că la tine poate îngheța și mai târziu.</p>'
      : st.histLoading ? '<p class="mut"><i class="fas fa-rotate fa-spin" aria-hidden="true"></i> Se descarcă istoricul…</p>'
      : '<p class="mut">Istoricul înghețurilor nu e descărcat încă' + (st.histError ? ' (descărcarea a eșuat)' : '') + '. Se descarcă automat când ai internet.</p>' +
        '<button type="button" class="btn" data-wxhist><i class="fas fa-download" aria-hidden="true"></i> Descarcă acum</button>') + '</div>';

    viewEl.innerHTML = head + now + advHtml + daysHtml + hourHtml + soilHtml + waterHtml + frostHtml +
      '<p class="section-title">Localitatea</p><div class="set-card">' + locPickerHtml() + '</div>' + attr;
  }

  // ------------------------------------------------------------------
  // Settings: theme, photos and all the sources (moved here from the cards)
  // ------------------------------------------------------------------

  /** Every source used for one plant: plant data, soil, neighbours, orchard work. */
  function plantSourceIds(p) {
    var ids = (p.src || []).slice();
    var Z = window.SOIL;
    if (Z.PH[p.id]) ids.push(Z.PH[p.id][2]);
    if (Z.PH_CAT[p.id]) ids.push(Z.PH_CAT[p.id][1]);
    if (Z.PH_TEXT[p.id]) ids.push(Z.PH_TEXT[p.id][2]);
    if (Z.DRAIN.dry[p.id]) ids.push(Z.DRAIN.dry[p.id]);
    if (Z.DRAIN.moist[p.id]) ids.push(Z.DRAIN.moist[p.id]);
    neighbours(p).forEach(function (r) { ids = ids.concat(r.src); });
    if (soilOf(p).rot) ids = ids.concat(Z.rotSrc);
    var o = orchardOf(p);
    if (o) ids = ids.concat(o.src || [], o.protectSrc || [], ORCHARD.limeSrc || [], ORCHARD.waterlogSrc || [], ORCHARD.feedSrc || [], ORCHARD.graftWarnSrc || []);
    return ids;
  }

  // ---- "Give the app to someone": QR + link (same idea as BeeManager settings) ----
  var APP_HOME = 'https://magdici-sorin-viorel.github.io/Gradinarit/';  // exact repo name (Pages paths are case-sensitive)
  /** The app's public address: where it runs when that is GitHub Pages, otherwise the real GitHub Pages address. */
  function appUrl() {
    var base = /github\.io$/.test(location.hostname) ? location.origin + location.pathname : APP_HOME;
    return base.replace(/index\.html$/, '');
  }
  var appQrCache = { url: '', svg: '' };
  function appQrSvg(u) {
    if (typeof qrcode !== 'function') return '';
    if (appQrCache.url !== u) {
      var q = qrcode(0, 'M'); q.addData(u); q.make();
      appQrCache = { url: u, svg: q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }) };
    }
    return appQrCache.svg;
  }
  function shareHtml() {
    var u = appUrl();
    return '<div class="set-card"><h3><i class="fas fa-qrcode" aria-hidden="true"></i>Dă aplicația mai departe</h3>' +
      '<p class="mut">Cine vrea aplicația scanează codul cu camera telefonului (sau primește linkul), o deschide în Chrome și alege „Adaugă pe ecranul de pornire”. Fiecare telefon are datele lui: grădina ta nu se trimite.</p>' +
      '<div class="share-qr">' + appQrSvg(u) + '</div>' +
      '<input type="text" id="app-url" class="share-url" readonly value="' + esc(u) + '" aria-label="Linkul aplicației">' +
      '<div class="share-btns"><button type="button" class="btn secondary" data-appcopy><i class="fas fa-copy" aria-hidden="true"></i><span>Copiază linkul</span></button>' +
      (navigator.share ? '<button type="button" class="btn secondary" data-appshare><i class="fas fa-share-nodes" aria-hidden="true"></i><span>Trimite</span></button>' : '') +
      '</div></div>';
  }

  function renderSettings() {
    var general = ['openmeteo', 'openmeteo_geo', 'openmeteo_hist', 'openmeteo_et0', 'rhs_watering', 'rhs_vegwater', 'rhs_hardiness', 'iastate_germ', 'beemanager', 'rhs_tender', 'rhs_hardening', 'rhs_frost', 'osu_soiltemp', 'rhs_organicmatter', 'rhs_homefeed', 'rhs_pruneapples', 'lwg_nutzgarten', 'rjas_frost', 'agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_pollinators', 'uconn_ph', 'almanac_ph', 'rhs_soilph', 'rhs_rotation']
      .concat(ORCHARD.limeSrc || [], [].concat.apply([], window.MONTH_TASKS.map(function (l) { return [].concat.apply([], l.map(function (t) { return t.src || []; })); })),
        [].concat.apply([], ORCHARD.methods.map(function (mt) { return mt.src || []; })));
    var all = Object.keys(window.SOURCES).map(function (k) { return window.SOURCES[k]; })
      .sort(function (a, b) { return a.t.localeCompare(b.t, 'ro'); });
    var light = prefs.theme === 'light';

    viewEl.innerHTML =
      '<div class="page-head"><div><h2>⚙️ Setări</h2><p>Aspect, poze și sursele tuturor informațiilor din aplicație.</p></div></div>' +
      '<div class="set-card"><h3><i class="fas fa-circle-info" aria-hidden="true"></i>Versiunea aplicației</h3><p><b>' + APP_VERSION + '</b> · dacă vezi alt număr decât cel nou, închide aplicația de tot și deschide-o din nou.</p></div>' +
      shareHtml() +
      '<div class="set-card"><h3><i class="fas fa-location-dot" aria-hidden="true"></i>Localitatea (pentru vreme)</h3>' + locPickerHtml() + '</div>' +
      backupHtml() +
      '<div class="set-card"><h3><i class="fas fa-circle-half-stroke" aria-hidden="true"></i>Aspect</h3>' +
        '<button type="button" class="btn secondary" data-theme-toggle><i class="fas ' + (light ? 'fa-moon' : 'fa-sun') + '" aria-hidden="true"></i><span>' + (light ? 'Temă închisă' : 'Temă deschisă') + '</span></button></div>' +
      '<div class="set-card"><h3><i class="fas fa-camera" aria-hidden="true"></i>Poze</h3>' +
        '<div class="photo-status" id="photo-status"><i class="fas fa-camera" aria-hidden="true"></i><span></span>' +
        '<button type="button" class="link-btn" data-sync-photos hidden>Descarcă acum</button></div></div>' +
      '<div class="set-card"><h3><i class="fas fa-book-open" aria-hidden="true"></i>Surse</h3>' +
        '<p class="mut">Toate informațiile din aplicație vin din sursele de mai jos. La „Surse pe plante” găsești sursele pentru fiecare plantă în parte.</p>' +
        '<details class="set-acc"><summary>Surse pe plante</summary>' +
          CATS.map(function (c) {
            var list = PLANTS.filter(function (p) { return p.cat === c.id; }).sort(byName);
            return '<p class="set-cat">' + c.icon + ' ' + esc(c.name) + '</p>' + list.map(function (p) {
              return '<details class="set-plant"><summary>' + esc(p.name) + '</summary>' + sourcesHtml(plantSourceIds(p), 'Surse – ' + p.name) + '</details>';
            }).join('');
          }).join('') +
        '</details>' +
        '<details class="set-acc"><summary>Surse generale (vreme, calendar, înghețuri, sol, livadă)</summary>' + sourcesHtml(general, 'Surse generale') + '</details>' +
        '<details class="set-acc"><summary>Toate sursele (' + all.length + ')</summary><div class="sources"><ul>' +
          all.map(function (x) { return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(x.t) + '</a></li>'; }).join('') +
        '</ul></div></details>' +
      '</div>';
    updatePhotoStatus();
  }

  // ------------------------------------------------------------------
  // My garden
  // ------------------------------------------------------------------

  /** "Your garden by soil colour": which of your plants can share the same soil. */
  function gardenSoilHtml(list) {
    var rows = SOIL_GROUPS.map(function (g) {
      var items = list.filter(function (p) { return p && soilOf(p).group === g.id; }).sort(byName);
      if (!items.length) return '';
      return '<div class="gsoil-row" style="--soil:' + g.color + '"><span class="soilbadge"><i aria-hidden="true"></i>' + esc(g.name) + '</span>' +
        '<div class="gsoil-items">' + items.map(function (p) {
          var bad = neighbours(p).filter(function (r) { return r.kind === 'bad'; }).length;
          return '<button type="button" class="gsoil-chip" data-open="' + esc(p.id) + '">' + esc(p.name) + (bad ? ' <span class="bad">🚫' + bad + '</span>' : '') + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    return '<p class="section-title">Grădina ta pe tipuri de sol</p><div class="gsoil">' + rows +
      '<p class="mut gsoil-x">Aceeași culoare = același tip de sol. 🚫 = are vecini de evitat (vezi „Sol și vecini” pe cartonaș).</p></div>';
  }

  // ------------------------------------------------------------------
  // "Azi în grădină": this month's jobs for the plants in My garden, with ticks per year
  // ------------------------------------------------------------------

  var done = loadJson(DONE_KEY, {});
  function yearKey() { return String(new Date().getFullYear()); }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function taskId(p, m, t) { return p.id + '|' + m + '|' + t; }
  function isDone(id) { var y = done[yearKey()]; return y && y[id]; }
  function setDone(id, on) {
    var y = yearKey();
    done[y] = done[y] || {};
    if (on) done[y][id] = todayStr(); else delete done[y][id];
    saveJson(DONE_KEY, done);
  }

  /** The jobs of month m for the plants in My garden: [{ p, x (action), id }]. */
  function gardenTasks(m) {
    var out = [];
    Object.keys(garden).map(plantById).filter(Boolean).forEach(function (p) {
      var g = garden[p.id];
      var inGround = g.status === 'have' || g.status === 'planted';
      monthActions(p, m, inGround).yes.forEach(function (x) { out.push({ p: p, x: x, id: taskId(p, m, x.t) }); });
    });
    return out.sort(function (a, b) { return catOrder(a.p.cat) - catOrder(b.p.cat) || byName(a.p, b.p); });
  }

  function fmtDay(iso) {
    var p = String(iso).split('-');
    return p.length === 3 ? (+p[2]) + ' ' + MONTHS[+p[1] - 1].toLowerCase() : iso;
  }

  // ------------------------------------------------------------------
  // Backup: export / import of My garden (and the ticks, the place and the theme)
  // ------------------------------------------------------------------

  function backupData() {
    var wx = WEATHER.state();
    return {
      app: 'gradinarit', format: 1, exported: new Date().toISOString(), version: APP_VERSION,
      garden: garden, done: done, prefs: { theme: prefs.theme || null },
      place: wx.loc && !wx.loc.auto ? { name: wx.loc.name, lat: wx.loc.lat, lon: wx.loc.lon, elev: wx.loc.elev, county: wx.loc.county } : null,
      soilTests: window.SOILTESTS ? SOILTESTS.all() : undefined
    };
  }
  function backupText() { return JSON.stringify(backupData(), null, 1); }

  /** Checks an imported text. Returns { ok, data, n, unknown, err }. */
  function parseBackup(text) {
    var j;
    try { j = JSON.parse(text); } catch (e) { return { ok: false, err: 'Textul nu e o copie de siguranță validă (nu e JSON).' }; }
    if (!j || j.app !== 'gradinarit' || typeof j.garden !== 'object' || !j.garden) return { ok: false, err: 'Fișierul nu e o copie de siguranță din Grădinărit.' };
    var g = {}, unknown = [];
    Object.keys(j.garden).forEach(function (id) {
      var e = j.garden[id];
      if (!plantById(id)) { unknown.push(id); return; }
      if (!e || typeof e !== 'object') return;
      var st = e.status === 'planned' ? 'prep' : e.status;
      if (!STATUS[st]) st = 'prep';
      var out = { status: st };
      ['date', 'added'].forEach(function (k) { if (typeof e[k] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e[k])) out[k] = e[k]; });
      if (Array.isArray(e.varieties)) out.varieties = e.varieties.filter(function (v) { return v && typeof v.name === 'string'; }).map(function (v) { return { name: v.name.slice(0, 80), count: Math.max(0, Math.min(9999, parseInt(v.count, 10) || 0)) }; });
      if (e.count != null) out.count = Math.max(0, Math.min(9999, parseInt(e.count, 10) || 0));
      g[id] = out;
    });
    var dn = {};
    if (j.done && typeof j.done === 'object') Object.keys(j.done).forEach(function (y) {
      if (!/^\d{4}$/.test(y) || typeof j.done[y] !== 'object') return;
      dn[y] = {};
      Object.keys(j.done[y]).forEach(function (k) { if (typeof j.done[y][k] === 'string') dn[y][k] = j.done[y][k].slice(0, 10); });
    });
    return { ok: true, data: { garden: g, done: dn, prefs: j.prefs || {}, place: j.place || null, soilTests: j.soilTests || null, exported: j.exported },
      n: Object.keys(g).length, unknown: unknown };
  }

  function applyBackup(b, mode) {
    if (mode === 'replace') {
      Object.keys(garden).forEach(function (k) { delete garden[k]; });
      Object.keys(done).forEach(function (k) { delete done[k]; });
    }
    Object.keys(b.garden).forEach(function (id) { if (mode === 'replace' || !garden[id]) garden[id] = b.garden[id]; });
    Object.keys(b.done).forEach(function (y) {
      done[y] = done[y] || {};
      Object.keys(b.done[y]).forEach(function (k) { done[y][k] = b.done[y][k]; });
    });
    saveJson(STORAGE_KEY, garden);
    saveJson(DONE_KEY, done);
    if (b.prefs && (b.prefs.theme === 'light' || b.prefs.theme === 'dark')) { prefs.theme = b.prefs.theme; saveJson(PREFS_KEY, prefs); applyTheme(); }
    var p = b.place;
    if (p && typeof p.lat === 'number' && typeof p.lon === 'number' && p.lat > 43 && p.lat < 49 && p.lon > 20 && p.lon < 30.5 && !WEATHER.state().loc) {
      WEATHER.setLocation({ name: String(p.name || 'Localitatea mea').slice(0, 80), lat: p.lat, lon: p.lon, elev: typeof p.elev === 'number' ? p.elev : null, county: String(p.county || '').slice(0, 40) });
    }
    if (b.soilTests && window.SOILTESTS) SOILTESTS.importAll(b.soilTests, mode);
  }

  function backupHtml() {
    var n = Object.keys(garden).filter(function (id) { return plantById(id); }).length;
    var pend = state.importPending;
    return '<div class="set-card" id="backup"><h3><i class="fas fa-box-archive" aria-hidden="true"></i>Copie de siguranță a grădinii</h3>' +
      '<p class="mut">Grădina ta (' + n + ' plante), bifele lucrărilor' + (window.SOILTESTS ? ', testele de sol' : '') + ', localitatea aleasă manual și tema stau doar pe acest telefon. Salvează o copie ca să le muți pe alt telefon sau să nu le pierzi.</p>' +
      '<div class="bk-row"><button type="button" class="btn" data-bkexport><i class="fas fa-file-arrow-down" aria-hidden="true"></i> Salvează fișierul</button>' +
        '<button type="button" class="btn secondary" data-bkcopy><i class="fas fa-copy" aria-hidden="true"></i> Copiază ca text</button></div>' +
      '<textarea id="bk-text" class="bk-text" rows="3" readonly hidden aria-label="Copia de siguranță ca text"></textarea>' +
      '<h4 class="bk-h">Restaurează dintr-o copie</h4>' +
      '<div class="bk-row"><label class="btn secondary bk-file"><i class="fas fa-file-arrow-up" aria-hidden="true"></i> Alege fișierul<input type="file" id="bk-file" accept=".json,application/json,text/plain" hidden></label></div>' +
      '<textarea id="bk-paste" class="bk-text" rows="3" placeholder="…sau lipește aici textul copiat" aria-label="Lipește copia de siguranță"></textarea>' +
      '<div class="bk-row"><button type="button" class="btn secondary" data-bkcheck><i class="fas fa-magnifying-glass" aria-hidden="true"></i> Verifică textul</button></div>' +
      (pend ? (pend.ok
        ? '<div class="bk-confirm"><p><b>Copie găsită:</b> ' + (pend.n === 1 ? '1 plantă' : pend.n + ' plante') + (pend.data.exported ? ', salvată pe ' + esc(fmtDay(pend.data.exported.slice(0, 10))) + ' ' + pend.data.exported.slice(0, 4) : '') +
            (pend.unknown.length ? '. ' + (pend.unknown.length === 1 ? 'O plantă necunoscută va fi ignorată' : pend.unknown.length + ' plante necunoscute vor fi ignorate') : '') + '.</p>' +
            '<div class="bk-row"><button type="button" class="btn" data-bkapply="merge">Adaugă la grădina mea</button>' +
            '<button type="button" class="btn danger" data-bkapply="replace">Înlocuiește tot</button>' +
            '<button type="button" class="btn secondary" data-bkcancel>Renunță</button></div>' +
            '<p class="mut">„Adaugă” păstrează plantele tale și le adaugă pe cele noi. „Înlocuiește tot” șterge grădina de acum și pune copia în locul ei.</p></div>'
        : '<p class="bk-err"><i class="fas fa-circle-exclamation" aria-hidden="true"></i> ' + esc(pend.err) + '</p>') : '') +
      '</div>';
  }

  function exportBackup() {
    var text = backupText();
    var name = 'gradinarit-' + todayStr() + '.json';
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
      toast('💾 Am salvat ' + name + ' (în Descărcări)');
    } catch (e) { toast('Nu am putut salva fișierul. Folosește „Copiază ca text”.'); }
  }

  /** One row of the jobs list (tick, plant, job, "how"). */
  function taskRow(t) {
    var dn = isDone(t.id);
    return '<li class="td-row' + (dn ? ' done' : '') + '">' +
      '<button type="button" class="td-check" data-done="' + esc(t.id) + '" aria-pressed="' + (dn ? 'true' : 'false') + '" aria-label="' + (dn ? 'Marchează ca nefăcut: ' : 'Marchează ca făcut: ') + esc(t.p.name + ' – ' + t.x.t) + '">' +
        '<span class="td-box" aria-hidden="true">' + (dn ? '<i class="fas fa-check"></i>' : '') + '</span></button>' +
      '<div class="td-main"><a href="#p-' + encodeURIComponent(t.p.id) + '" class="td-plant">' + esc(t.p.name) + '</a>' +
        '<span class="td-t"><i class="fas ' + t.x.icon + ' ' + (t.x.cls || '') + '" aria-hidden="true"></i>' + esc(t.x.t) + '</span>' +
        (dn ? '<small class="td-when">făcut pe ' + esc(fmtDay(dn)) + '</small>'
          : t.x.d && t.x.d.trim() ? '<details class="td-how"><summary>cum?</summary><div>' + txt(t.x.d) + '</div></details>' : '') +
      '</div></li>';
  }

  /** Jobs of this month for the plants in the garden, with ticks (kept per year). */
  function jobsHtml(m, tasks) {
    if (!tasks.length) return '<p class="mut gm-none">Pentru plantele tale nu e nicio lucrare în ' + esc(MONTHS[m - 1].toLowerCase()) + '.</p>';
    var nDone = tasks.filter(function (t) { return isDone(t.id); }).length;
    var pct = Math.round(nDone / tasks.length * 100);
    var todo = tasks.filter(function (t) { return !isDone(t.id); });
    var fin = tasks.filter(function (t) { return isDone(t.id); });
    return '<div class="td-prog"><div class="td-bar"><i style="width:' + pct + '%"></i></div><span><b>' + nDone + ' din ' + tasks.length + '</b> făcute</span></div>' +
      (todo.length ? '<ul class="td-list">' + todo.map(taskRow).join('') + '</ul>'
        : '<p class="gm-none">🎉 Ai terminat lucrările lunii.</p>') +
      (fin.length ? '<details class="gm-done"><summary>Făcute (' + fin.length + ')</summary><ul class="td-list">' + fin.map(taskRow).join('') + '</ul></details>' : '') +
      '<p class="mut wx-note">Bifele se păstrează pe an: anul viitor lista pornește din nou goală.</p>';
  }

  /** One page for the garden: this month's jobs first, then the plants by status. */
  function renderGarden() {
    var m = currentMonth;
    var dateTxt = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
    var head = '<div class="page-head"><div><h2>Grădina mea</h2><p>' + esc(dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1)) + '</p></div></div>';
    var ids = Object.keys(garden).filter(function (id) { return plantById(id); });
    var items = ids.map(plantById).sort(function (a, b) { return catOrder(a.cat) - catOrder(b.cat) || byName(a, b); });

    if (!items.length) {
      viewEl.innerHTML = head + weatherStripHtml() +
        '<div class="empty"><span class="big">🌱</span>Încă nu ai adăugat nicio plantă.<br>' +
          'Pe orice cartonaș din Plante sau Calendar apasă <b>„Adaugă în grădina mea”</b> și aici vei vedea lucrările lunii pentru ele.</div>' +
        '<a class="btn" href="#plante" style="text-decoration:none">Vezi plantele</a>';
      return;
    }

    var by = { have: [], planted: [], prep: [] };
    items.forEach(function (p) { (by[garden[p.id].status] || by.prep).push(p); });
    var inGround = function (p) { return garden[p.id].status === 'have' || garden[p.id].status === 'planted'; };
    // In each group, plants with work this month come first.
    var jobsNow = function (p) { return monthActions(p, m, inGround(p)).yes.length ? 0 : 1; };
    Object.keys(by).forEach(function (k) { by[k].sort(function (x, y) { return jobsNow(x) - jobsNow(y); }); });

    var totalOf = function (cat) {
      return items.filter(function (p) { return p.cat === cat; }).reduce(function (sum, p) { return sum + plantCount(p); }, 0);
    };
    var treeTotal = totalOf('trees'), vineTotal = totalOf('vines'), shrubTotal = totalOf('shrubs');
    var summary = [treeTotal ? countLabel(treeTotal, COUNT_UNIT.trees) + ' fructiferi' : '',
      vineTotal ? countLabel(vineTotal, VARIETY_UNIT.vines) + ' de viță' : '',
      shrubTotal ? countLabel(shrubTotal, VARIETY_UNIT.shrubs) + ' de arbuști' : ''].filter(Boolean).join(' · ');

    var tasks = gardenTasks(m);
    var jobs = '<section class="gm-sec"><h3 class="gm-h"><i class="fas fa-sun" aria-hidden="true"></i> Lucrările lunii ' + esc(MONTHS[m - 1].toLowerCase()) + '</h3>' + jobsHtml(m, tasks) + '</section>';

    var plants = STATUS_ORDER.map(function (k) {
      if (!by[k].length) return '';
      var st = STATUS[k];
      return '<p class="section-title gsec ' + st.cls + '"><i class="fas ' + st.icon + '" aria-hidden="true"></i>' + esc(st.long) + ' (' + by[k].length + ')</p>' +
        '<div class="cards">' + by[k].map(function (p) { return plantCard(p, { m: m, skipPlant: inGround(p), garden: true, noNow: true }); }).join('') + '</div>';
    }).join('');

    viewEl.innerHTML = head + weatherStripHtml() + jobs +
      '<section class="gm-sec"><h3 class="gm-h"><i class="fas fa-seedling" aria-hidden="true"></i> Plantele mele (' + items.length + ')</h3>' +
        (summary ? '<p class="mut">' + esc(summary) + '.</p>' : '') +
        gardenSoilHtml(items) + plants + '</section>' +
      '<p class="card-latin gm-foot">Datele rămân doar pe acest telefon. Copia de siguranță e în <a href="#setari">Setări</a>.</p>';
  }

  // ------------------------------------------------------------------
  // Plant detail sheet
  // ------------------------------------------------------------------

  function openSheet(id) {
    var p = plantById(id);
    if (!p) { closeSheet(); return; }
    var g = garden[p.id];
    // Same card as everywhere, opened in full. On the calendar it follows the month you are viewing.
    var m = state.baseHash.indexOf('#calendar') === 0 ? state.month : currentMonth;
    var skip = !!(g && (g.status === 'have' || g.status === 'planted'));

    sheetEl.innerHTML =
      '<div class="sheet-grip" aria-hidden="true"></div>' +
      '<button type="button" class="icon-btn sheet-close" data-close aria-label="Închide">✕</button>' +
      plantCard(p, { m: m, skipPlant: skip, full: true }) +
      '<div class="sheet-end"><button type="button" class="btn secondary" data-close>✕ Închide</button></div>';

    var wasHidden = sheetEl.hidden;
    sheetEl.hidden = false;
    backdropEl.hidden = false;
    document.body.style.overflow = 'hidden';
    if (wasHidden) {
      sheetEl.scrollTop = 0;
      var closeBtn = sheetEl.querySelector('[data-close]');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }
  }

  function hideSheet() {
    sheetEl.hidden = true;
    backdropEl.hidden = true;
    document.body.style.overflow = '';
  }

  /** Closes the sheet using browser history so the Android back button stays consistent. */
  function closeSheet() {
    if (state.sheetPushed) {
      state.sheetPushed = false;
      history.back();
    } else {
      location.replace(state.baseHash);
    }
  }

  // ------------------------------------------------------------------
  // Router
  // ------------------------------------------------------------------

  var TAB_INFO = {
    calendar: { title: 'Calendar', icon: 'fa-calendar-days' },
    plante: { title: 'Plante', icon: 'fa-seedling' },
    livada: { title: 'Livadă și altoire', icon: 'fa-tree' },
    gradina: { title: 'Grădina mea', icon: 'fa-heart' },
    setari: { title: 'Setări', icon: 'fa-gear' },
    vreme: { title: 'Vremea și grădina', icon: 'fa-cloud-sun' }
  };

  /** Highlights the current section in the bottom bar and side menu, and updates the top bar title. */
  function setActiveTab(hash) {
    var tab = hash.indexOf('#plante') === 0 || hash.indexOf('#sol') === 0 ? 'plante'
      : hash.indexOf('#altoire') === 0 ? 'livada'
      : hash.indexOf('#gradina') === 0 ? 'gradina'
      : hash.indexOf('#setari') === 0 ? 'setari'
      : hash.indexOf('#vreme') === 0 ? 'vreme'
      : 'calendar';
    document.querySelectorAll('[data-tab]').forEach(function (a) {
      var on = a.getAttribute('data-tab') === tab;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var info = TAB_INFO[tab];
    var titleEl = document.getElementById('tb-title');
    var icoEl = document.getElementById('tb-ico');
    if (titleEl) titleEl.textContent = info.title;
    if (icoEl) icoEl.className = 'fas ' + info.icon + ' tb-ico';
  }

  // ------------------------------------------------------------------
  // Theme: dark by default (like BeeManager), light on request
  // ------------------------------------------------------------------

  function applyTheme() {
    var light = prefs.theme === 'light';
    document.body.classList.toggle('light', light);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var i = b.querySelector('i');
      if (i) i.className = 'fas ' + (light ? 'fa-moon' : 'fa-sun');
      var label = b.querySelector('span');
      if (label) label.textContent = light ? 'Temă închisă' : 'Temă deschisă';
      b.setAttribute('aria-label', light ? 'Treci la tema închisă' : 'Treci la tema deschisă');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#fff7e8' : '#0f0e0e');
  }

  function renderBase(hash, scrollTop) {
    // Routes use plain names joined by the first hyphen, e.g. "calendar-5", "plante-trees".
    var raw = hash.replace(/^#/, '');
    var dash = raw.indexOf('-');
    var parts = dash > -1 ? [raw.slice(0, dash), raw.slice(dash + 1)] : [raw];
    var route = parts[0] || 'calendar';

    if (route === 'plante' && parts[1]) renderCategory(parts[1]);
    else if (route === 'plante') renderCategories();
    else if (route === 'altoire') renderGrafting();
    else if (route === 'sol') renderSoil();
    else if (route === 'setari') renderSettings();
    else if (route === 'vreme') renderWeather();
    else if (route === 'gradina') renderGarden();
    else {
      var m = parseInt(parts[1], 10);
      renderCalendar(m >= 1 && m <= 12 ? m : state.month);
    }
    setActiveTab(hash);
    // Sub-pages get a floating X that goes back to the section's main page.
    var pc = document.getElementById('page-close');
    if (pc) {
      var parent = route === 'plante' && parts[1] ? '#plante' : route === 'sol' ? '#plante' : route === 'setari' ? '#calendar' : null;
      pc.hidden = !parent;
      if (parent) pc.setAttribute('href', parent);
    }
    loadPhotos(viewEl);
    state.baseHash = hash;
    state.baseRendered = true;
    if (scrollTop) window.scrollTo(0, 0);
  }

  function route() {
    var hash = location.hash || '#calendar';
    // The jobs page was merged into Grădina mea; old links go there.
    if (hash.indexOf('#azi') === 0) { history.replaceState(null, '', '#gradina'); hash = '#gradina'; }

    if (hash.indexOf('#p-') === 0) {
      // Detail sheet: render the page beneath first if needed (deep link / reload).
      if (!state.baseRendered) renderBase(state.baseHash, false);
      openSheet(decodeURIComponent(hash.slice(3)));
      return;
    }

    var reopenBase = !sheetEl.hidden && hash === state.baseHash;
    if (hash !== state.baseHash || sheetEl.hidden) state.sheetPushed = false;
    hideSheet();
    if (reopenBase) {
      // Returning from the sheet: refresh the page in place, keep scroll position.
      var y = window.scrollY;
      renderBase(hash, false);
      window.scrollTo(0, y);
    } else {
      renderBase(hash, true);
    }
  }

  /** Re-renders the current page (and sheet) after a data change, keeping the scroll position. */
  function refresh() {
    var y = window.scrollY;
    var sheetY = sheetEl.scrollTop;
    renderBase(state.baseHash, false);
    window.scrollTo(0, y);
    if (!sheetEl.hidden) {
      var id = location.hash.indexOf('#p-') === 0 ? decodeURIComponent(location.hash.slice(3)) : null;
      if (id) { openSheet(id); sheetEl.scrollTop = sheetY; }
    }
  }

  // ------------------------------------------------------------------
  // Events (delegated)
  // ------------------------------------------------------------------

  document.addEventListener('click', function (e) {
    var wp = e.target.closest('[data-wxplace]');
    if (wp) {
      var box = document.getElementById('wx-res');
      var loc = box && box._list ? box._list[+wp.getAttribute('data-wxplace')] : null;
      if (loc) { WEATHER.setLocation(loc); toast('📍 ' + loc.name + ' – descarc prognoza'); }
      return;
    }
    var sd = e.target.closest('[data-stdel]');
    if (sd) { state.stDel = sd.getAttribute('data-stdel'); renderSoil(); return; }
    if (e.target.closest('[data-stdel-no]')) { state.stDel = null; renderSoil(); return; }
    var sy = e.target.closest('[data-stdel-yes]');
    if (sy) {
      var del = sy.getAttribute('data-stdel-yes');
      SOILTESTS.save(SOILTESTS.all().filter(function (t) { return t.id !== del; }));
      state.stDel = null; toast('Măsurătoarea a fost ștearsă'); renderSoil(); return;
    }
    var dn = e.target.closest('[data-done]');
    if (dn) {
      var tid = dn.getAttribute('data-done'), was = !!isDone(tid);
      setDone(tid, !was);
      toast(was ? 'Lucrare marcată ca nefăcută' : '✅ Bifat ca făcut');
      refresh();
      return;
    }
    if (e.target.closest('[data-bkexport]')) { exportBackup(); return; }
    if (e.target.closest('[data-bkcopy]')) {
      var ta = document.getElementById('bk-text'), t2 = backupText();
      if (ta) { ta.hidden = false; ta.value = t2; }
      var sel = function () { if (ta) { ta.focus(); ta.select(); } toast('Textul e selectat: copiază-l și păstrează-l.'); };
      try { navigator.clipboard.writeText(t2).then(function () { toast('📋 Copia de siguranță e copiată ca text'); }, sel); } catch (er) { sel(); }
      return;
    }
    if (e.target.closest('[data-bkcheck]')) {
      var pv = document.getElementById('bk-paste');
      state.importPending = parseBackup(pv ? pv.value : '');
      refresh(); return;
    }
    var ba = e.target.closest('[data-bkapply]');
    if (ba && state.importPending && state.importPending.ok) {
      applyBackup(state.importPending.data, ba.getAttribute('data-bkapply'));
      var nn = state.importPending.n;
      state.importPending = null;
      toast('✅ Grădina a fost restaurată (' + nn + ' plante)');
      refresh(); return;
    }
    if (e.target.closest('[data-bkcancel]')) { state.importPending = null; refresh(); return; }
    if (e.target.closest('[data-wxrefresh]')) { WEATHER.refresh(true); return; }
    if (e.target.closest('[data-wxhist]')) { WEATHER.loadHistory(true); renderWeather(); return; }
    var wd = e.target.closest('[data-wxday]');
    if (wd) { state.wxDay = +wd.getAttribute('data-wxday'); renderWeather(); return; }
    if (e.target.closest('[data-wxgps]')) { WEATHER.locateAuto(true); return; }
    if (e.target.closest('[data-appcopy]')) {
      var u = appUrl(), inp = document.getElementById('app-url');
      var fallback = function () {
        if (inp) { inp.focus(); inp.select(); try { inp.setSelectionRange(0, u.length); } catch (er) { /* ignore */ } }
        var ok = false; try { ok = document.execCommand('copy'); } catch (er) { /* ignore */ }
        toast(ok ? '📋 Link copiat' : 'Linkul e selectat – copiază-l');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { toast('📋 Link copiat'); }, fallback);
      else fallback();
      return;
    }
    if (e.target.closest('[data-appshare]')) {
      navigator.share({ title: 'Grădinărit', text: 'Calendarul grădinii, cu vremea locului tău – se instalează pe telefon din Chrome:', url: appUrl() }).catch(function () { /* cancelled */ });
      return;
    }
    if (e.target.closest('[data-sync-photos]')) { syncAllPhotos(); return; }

    // Card footer: open / close the three garden choices.
    var tg = e.target.closest('[data-gtoggle]');
    if (tg) {
      var pick = tg.parentNode.querySelector('.gpick');
      var open = pick.hidden;
      pick.hidden = !open;
      tg.setAttribute('aria-expanded', String(open));
      return;
    }

    // Set garden status (adds the plant if it is not in the garden yet).
    var ss = e.target.closest('[data-setstatus]');
    if (ss) {
      var gid = ss.getAttribute('data-id');
      var st = ss.getAttribute('data-setstatus');
      var isNew = !garden[gid];
      if (isNew) garden[gid] = { added: todayIso() };
      garden[gid].status = st;
      if (st === 'planted' && !garden[gid].date) garden[gid].date = todayIso();
      var gp = plantById(gid);
      if (isNew && gp && VARIETY_UNIT[gp.cat] && !garden[gid].varieties) garden[gid].varieties = [];
      if (isNew && gp && COUNT_UNIT[gp.cat]) garden[gid].count = 1;
      saveGarden();
      toast((gp ? gp.name : '') + ': ' + STATUS[st].long.toLowerCase());
      refresh();
      return;
    }

    // Tree count.
    var cb = e.target.closest('[data-cnt-inc],[data-cnt-dec]');
    if (cb) {
      var cid = cb.getAttribute('data-id');
      if (!garden[cid]) return;
      garden[cid].count = Math.max(1, Math.min(9999, (parseInt(garden[cid].count, 10) || 1) + (cb.hasAttribute('data-cnt-inc') ? 1 : -1)));
      saveGarden();
      document.querySelectorAll('[data-cnt][data-id="' + cid + '"]').forEach(function (el) { el.value = garden[cid].count; });
      return;
    }

    // Varieties of vines / shrubs.
    var vb = e.target.closest('[data-var-add],[data-var-inc],[data-var-dec],[data-var-del]');
    if (vb) {
      var vid = vb.getAttribute('data-id');
      var gv = garden[vid];
      if (!gv) return;
      gv.varieties = gv.varieties || [];
      var idx = parseInt(vb.getAttribute('data-idx'), 10);
      if (vb.hasAttribute('data-var-add')) {
        gv.varieties.push({ name: '', count: 1 });
        saveGarden();
        refresh();
        var inputs = document.querySelectorAll('[data-var-name][data-id="' + vid + '"]');
        var last = inputs[inputs.length - 1];
        if (last) last.focus();
        return;
      }
      if (vb.hasAttribute('data-var-del')) {
        gv.varieties.splice(idx, 1);
        saveGarden();
        refresh();
        return;
      }
      var v = gv.varieties[idx];
      if (!v) return;
      v.count = Math.max(1, Math.min(9999, (parseInt(v.count, 10) || 1) + (vb.hasAttribute('data-var-inc') ? 1 : -1)));
      saveGarden();
      document.querySelectorAll('[data-var-count][data-id="' + vid + '"][data-idx="' + idx + '"]').forEach(function (el) { el.value = v.count; });
      updateVarietyTotal(vid);
      return;
    }

    if (e.target.closest('[data-theme-toggle]')) {
      prefs.theme = prefs.theme === 'light' ? 'dark' : 'light';
      saveJson(PREFS_KEY, prefs);
      applyTheme();
      return;
    }
    var sf = e.target.closest('[data-soilfilter]');
    if (sf) {
      var fv = sf.getAttribute('data-soilfilter');
      state.soilFilter = state.soilFilter === fv ? '' : fv;
      var yy = window.scrollY; renderBase(state.baseHash, false); window.scrollTo(0, yy);
      return;
    }
    var sv = e.target.closest('[data-soilview]');
    if (sv) { state.soilView = sv.getAttribute('data-soilview'); renderSoil(); return; }
    var t = e.target.closest('[data-omonth],[data-open],[data-month],[data-caltab],[data-calcat],[data-remove],[data-close]');
    if (!t) return;

    if (t.hasAttribute('data-open')) {
      state.sheetPushed = true;
      location.hash = '#p-' + encodeURIComponent(t.getAttribute('data-open'));
      return;
    }
    if (t.hasAttribute('data-close')) { closeSheet(); return; }

    if (t.hasAttribute('data-omonth')) {
      state.orchardMonth = parseInt(t.getAttribute('data-omonth'), 10);
      renderGrafting();
      var sel = viewEl.querySelector('.month-pill[aria-pressed="true"]');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
      return;
    }
    if (t.hasAttribute('data-month')) {
      var m = parseInt(t.getAttribute('data-month'), 10);
      state.calCat = 'all';
      location.replace('#calendar-' + m);
      return;
    }
    if (t.hasAttribute('data-caltab')) {
      state.calTab = t.getAttribute('data-caltab');
      state.calCat = 'all';
      renderCalendar(state.month);
      return;
    }
    if (t.hasAttribute('data-calcat')) {
      state.calCat = t.getAttribute('data-calcat');
      renderCalendar(state.month);
      return;
    }
    if (t.hasAttribute('data-remove')) {
      var rmId = t.getAttribute('data-remove');
      var rp = plantById(rmId);
      delete garden[rmId];
      saveGarden();
      toast('„' + (rp ? rp.name : rmId) + '” a fost scoasă din grădină');
      refresh();
      return;
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id === 'only-garden') {
      state.onlyGarden = e.target.checked;
      prefs.onlyGarden = state.onlyGarden;
      saveJson(PREFS_KEY, prefs);
      state.calCat = 'all';
      renderCalendar(state.month);
      return;
    }
    if (e.target.hasAttribute('data-cnt')) {
      var tid = e.target.getAttribute('data-id');
      if (!garden[tid]) return;
      garden[tid].count = Math.max(1, Math.min(9999, parseInt(e.target.value, 10) || 1));
      e.target.value = garden[tid].count;
      saveGarden();
      toast('Salvat');
      return;
    }
    if (e.target.hasAttribute('data-var-name') || e.target.hasAttribute('data-var-count')) {
      var vid = e.target.getAttribute('data-id');
      var idx = parseInt(e.target.getAttribute('data-idx'), 10);
      var v = garden[vid] && garden[vid].varieties && garden[vid].varieties[idx];
      if (!v) return;
      if (e.target.hasAttribute('data-var-name')) {
        v.name = e.target.value.trim();
      } else {
        v.count = Math.max(1, Math.min(9999, parseInt(e.target.value, 10) || 1));
        e.target.value = v.count;
        updateVarietyTotal(vid);
      }
      saveGarden();
      toast('Salvat');
      return;
    }
    if (e.target.hasAttribute('data-date')) {
      var id = e.target.getAttribute('data-date');
      if (garden[id]) { garden[id].date = e.target.value; saveGarden(); toast('Data salvată'); }
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'cal-search') { state.calSearch = e.target.value; renderCalSearch(); return; }
    if (e.target.id === 'wx-q') { wxSearch(e.target.value); return; }
    if (e.target.id === 'global-search') {
      state.search = e.target.value;
      renderSearchResults();
    }
  });

  backdropEl.addEventListener('click', closeSheet);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheetEl.hidden) closeSheet();
  });

  window.addEventListener('hashchange', route);

  // Re-check the current month when the app comes back to the foreground (e.g. left open overnight).
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    var nowM = new Date().getMonth() + 1;
    if (nowM !== currentMonth) {
      currentMonth = nowM;
      state.month = nowM;
      state.orchardMonth = nowM;
      refresh();
    }
  });

  // ------------------------------------------------------------------
  // Start
  // ------------------------------------------------------------------

  applyTheme();

  // Fill photo slots whenever a page or the detail sheet is (re)rendered.
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { loadPhotos(document); });
    mo.observe(viewEl, { childList: true, subtree: true });
    mo.observe(sheetEl, { childList: true });
  }

  // Download all plant photos in the background shortly after start, and again when back online.
  setTimeout(syncAllPhotos, 2500);
  window.addEventListener('online', function () { updatePhotoStatus(); syncAllPhotos(); });
  window.addEventListener('offline', updatePhotoStatus);

  // Always open on the current month: a saved month from an earlier visit is not reused.
  // The app always opens on the calendar of the current month.
  if (!location.hash || location.hash.indexOf('#calendar') === 0 || location.hash.indexOf('#p-') === 0) {
    history.replaceState(null, '', '#calendar');
  }
  route();

  // Soil test form.
  document.addEventListener('submit', function (e) {
    if (!e.target || e.target.id !== 'st-form') return;
    e.preventDefault();
    var f = e.target, err = document.getElementById('st-err');
    var phRaw = String(f.ph.value || '').replace(',', '.').trim();
    var ph = phRaw === '' ? null : parseFloat(phRaw);
    var msg = '';
    if (ph != null && (isNaN(ph) || ph < 3 || ph > 10)) msg = 'pH-ul trebuie să fie un număr între 3 și 10.';
    else if (ph == null && !f.type.value && f.fizz.value === '' && !f.note.value.trim()) msg = 'Completează măcar pH-ul sau tipul solului.';
    if (msg) { if (err) { err.textContent = msg; err.hidden = false; } return; }
    var list = SOILTESTS.all();
    list.push({ id: String(Date.now()), date: /^\d{4}-\d{2}-\d{2}$/.test(f.date.value) ? f.date.value : todayStr(), place: f.place.value.trim().slice(0, 60),
      ph: ph == null ? null : Math.round(ph * 10) / 10, method: f.method.value, type: f.type.value, fizz: f.fizz.value, note: f.note.value.trim().slice(0, 300) });
    SOILTESTS.save(list);
    toast('✅ Măsurătoarea a fost salvată');
    renderSoil();
  });

  // Backup file chosen: read it and ask what to do with it.
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'bk-file' && e.target.files && e.target.files[0]) {
      var f = e.target.files[0];
      if (f.size > 2 * 1024 * 1024) { state.importPending = { ok: false, err: 'Fișierul e prea mare pentru o copie de siguranță.' }; refresh(); return; }
      var rd = new FileReader();
      rd.onload = function () { state.importPending = parseBackup(String(rd.result || '')); refresh(); };
      rd.onerror = function () { state.importPending = { ok: false, err: 'Fișierul nu a putut fi citit.' }; refresh(); };
      rd.readAsText(f);
    }
  });

  // Weather: re-draw the pages that show it when new data arrives; refresh when back online.
  WEATHER.onChange(function () {
    var h = location.hash || '';
    var focused = document.activeElement && document.activeElement.id === 'wx-q';
    if (focused) return; // do not disturb typing in the locality search
    if (h.indexOf('#vreme') === 0 || h.indexOf('#setari') === 0 || h.indexOf('#calendar') === 0 || h.indexOf('#gradina') === 0) {
      var y = window.scrollY; renderBase(state.baseHash, false); window.scrollTo(0, y);
    }
  });
  WEATHER.start();
  window.addEventListener('online', function () { WEATHER.refresh(false); });

  // Offline support: register the service worker (only works over HTTPS or localhost).
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        reg.update();
      }).catch(function () { /* offline mode not available */ });
    });
    // When a new version takes over, reload once so the new files are used right away.
    var hadController = !!navigator.serviceWorker.controller;
    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
})();
