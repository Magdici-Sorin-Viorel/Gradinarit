/*
 * Weather data for Grădinărit (Open-Meteo).
 *
 * Built on the same technical model as BeeManager's js/weather.js:
 *  - plain fetch() to the free Open-Meteo API (no key, non-commercial use),
 *  - skip the request when offline or when the saved data is still fresh,
 *  - keep the last good forecast with its timestamp, never delete it on an error,
 *  - WMO weather codes mapped to an icon and a label.
 * Differences for the garden: automatic GPS position, or a locality chosen by name anywhere in Romania
 * (Open-Meteo geocoding, countryCode=RO); 7-day daily + hourly forecast and modelled soil temperature.
 *
 * Exposes window.WEATHER.
 */
(function () {
  var KEY = 'gradina-banat.weather.v1';
  var REFRESH_MS = 30 * 60 * 1000;          // do not ask the API more than every 30 minutes
  var STALE_MS = 6 * 60 * 60 * 1000;        // older than 6 h = shown as "not up to date"
  var FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
  var GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  var ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
  var HIST_YEARS = 10;                       // frost history: the last 10 full years
  var HIST_MS = 30 * 24 * 3600 * 1000;       // re-download at most once a month

  // WMO weather codes (as used by Open-Meteo) -> icon + Romanian label.
  var WMO = {
    0: ['☀️', 'Senin'], 1: ['🌤️', 'Predominant senin'], 2: ['⛅', 'Parțial noros'], 3: ['☁️', 'Noros'],
    45: ['🌫️', 'Ceață'], 48: ['🌫️', 'Ceață cu chiciură'],
    51: ['🌦️', 'Burniță slabă'], 53: ['🌦️', 'Burniță'], 55: ['🌧️', 'Burniță densă'],
    56: ['🌧️', 'Burniță care îngheață'], 57: ['🌧️', 'Burniță care îngheață'],
    61: ['🌧️', 'Ploaie slabă'], 63: ['🌧️', 'Ploaie'], 65: ['🌧️', 'Ploaie puternică'],
    66: ['🌧️', 'Ploaie care îngheață'], 67: ['🌧️', 'Ploaie care îngheață'],
    71: ['🌨️', 'Ninsoare slabă'], 73: ['🌨️', 'Ninsoare'], 75: ['❄️', 'Ninsoare puternică'], 77: ['🌨️', 'Grăunțe de zăpadă'],
    80: ['🌦️', 'Averse slabe'], 81: ['🌧️', 'Averse'], 82: ['⛈️', 'Averse puternice'],
    85: ['🌨️', 'Averse de ninsoare'], 86: ['🌨️', 'Averse de ninsoare'],
    95: ['⛈️', 'Furtună'], 96: ['⛈️', 'Furtună cu grindină'], 99: ['⛈️', 'Furtună cu grindină puternică']
  };
  function wmo(code) { return WMO[code] || ['🌡️', 'Necunoscut']; }

  var DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SV', 'V', 'NV'];
  function windDir(deg) { return deg == null ? '' : DIRS[Math.round(((deg % 360) / 45)) % 8]; }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage full or blocked */ }
  }

  var state = load();       // { loc: {...}, data: {...forecast json}, ts: ms, error: '...' }
  state.loading = false; state.locating = false; state.histLoading = false;   // never restore a spinner from a previous visit
  var listeners = [];
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } }); }

  /** fetch() with a time limit, so a weak signal does not leave "loading…" forever. */
  function fetchT(url, ms) {
    if (typeof AbortController === 'undefined') return fetch(url);
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, ms || 15000);
    return fetch(url, { signal: ctl.signal }).then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }

  // Variables the app asks for; the answer is checked so a missing one is reported, never guessed.
  var NEED = {
    hourly: { temperature_2m: 'temperatura pe ore', precipitation: 'ploaia pe ore', soil_temperature_6cm: 'temperatura solului' },
    daily: { temperature_2m_min: 'minimele zilnice', temperature_2m_max: 'maximele zilnice', precipitation_sum: 'ploaia zilnică' }
  };
  function missingVars(j) {
    var out = [];
    Object.keys(NEED).forEach(function (grp) {
      Object.keys(NEED[grp]).forEach(function (k) {
        var arr = j[grp] && j[grp][k];
        if (!arr || !arr.some(function (v) { return v != null; })) out.push(NEED[grp][k]);
      });
    });
    return out;
  }

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /** Searches localities in Romania by name. Resolves to a list of {name, lat, lon, elev, area, county}. */
  function searchPlaces(q) {
    q = (q || '').trim();
    if (q.length < 2) return Promise.resolve([]);
    if (!navigator.onLine) return Promise.reject(new Error('offline'));
    var url = GEO_URL + '?name=' + encodeURIComponent(q) + '&count=50&language=ro&format=json&countryCode=RO';
    return fetchT(url, 12000).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (j) {
      return (j.results || []).filter(function (x) { return x.country_code === 'RO' || !x.country_code; }).map(function (x) {
        var county = String(x.admin1 || '').replace(/^Jude[țţ]ul\s+/i, '').replace(/^Municipiul\s+/i, '');
        return {
          name: x.name, lat: x.latitude, lon: x.longitude, elev: x.elevation, county: county,
          area: [x.admin3, x.admin2].filter(function (a) { return a && a !== x.name; })[0] || ''
        };
      });
    });
  }

  function setLocation(loc) {
    // A locality chosen by hand switches automatic location off; GPS positions keep it on.
    state.mode = loc.auto ? 'auto' : 'manual';
    state.loc = loc;
    state.data = null; state.ts = 0; state.error = '';
    save(state); emit();
    return refresh(true);
  }

  /** Downloads the forecast for the saved locality (unless fresh, offline or no locality). */
  function refresh(force) {
    var loc = state.loc;
    if (!loc) return Promise.resolve(false);
    if (!force && state.ts && Date.now() - state.ts < REFRESH_MS) return Promise.resolve(false);
    if (!navigator.onLine) { state.error = 'offline'; emit(); return Promise.resolve(false); }
    var url = FORECAST_URL + '?latitude=' + loc.lat + '&longitude=' + loc.lon +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,shortwave_radiation' +
      '&hourly=temperature_2m,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_moisture_3_to_9cm' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,et0_fao_evapotranspiration' +
      '&timezone=Europe%2FBucharest&forecast_days=7&past_days=3';
    if (loc.elev != null) url += '&elevation=' + loc.elev;
    state.loading = true; emit();
    return fetchT(url, 15000).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.daily || !j.hourly || !j.daily.time || !j.hourly.time) throw new Error('date incomplete');
      state.data = j; state.ts = Date.now(); state.error = ''; state.loading = false;
      state.missing = missingVars(j);
      save(state); emit();
      loadHistory(false);
      return true;
    }).catch(function (e) {
      // Keep the last good forecast; only remember that the update failed.
      state.error = navigator.onLine ? 'eroare' : 'offline'; state.loading = false;
      save(state); emit();
      return false;
    });
  }

  /**
   * Frost history for the saved place: the last spring frost and the first autumn frost of
   * each of the last 10 full years (daily minimum at 2 m ≤ 0 °C), from the Open-Meteo
   * Historical Weather API (reanalysis on a grid, not a weather station).
   */
  function histKey(loc) { return loc ? (Math.round(loc.lat * 10) / 10) + ',' + (Math.round(loc.lon * 10) / 10) : ''; }
  function loadHistory(force) {
    var loc = state.loc;
    if (!loc || !navigator.onLine) return Promise.resolve(false);
    var key = histKey(loc);
    var h = state.hist;
    if (!force && h && h.key === key && Date.now() - h.ts < HIST_MS) return Promise.resolve(false);
    var y = new Date().getFullYear();
    var url = ARCHIVE_URL + '?latitude=' + loc.lat + '&longitude=' + loc.lon +
      '&start_date=' + (y - HIST_YEARS) + '-01-01&end_date=' + (y - 1) + '-12-31' +
      '&daily=temperature_2m_min&timezone=Europe%2FBucharest';
    if (loc.elev != null) url += '&elevation=' + loc.elev;
    state.histLoading = true;
    return fetchT(url, 25000).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (j) {
      state.hist = parseHistory(j, key);
      state.histLoading = false; state.histError = '';
      save(state); emit();
      return true;
    }).catch(function () {
      state.histLoading = false; state.histError = 'eroare';
      emit();
      return false;
    });
  }
  function parseHistory(j, key) {
    var t = j && j.daily && j.daily.time, v = j && j.daily && j.daily.temperature_2m_min;
    if (!t || !v) throw new Error('date incomplete');
    var years = {};
    for (var i = 0; i < t.length; i++) {
      var yr = t[i].slice(0, 4), md = t[i].slice(5);
      var Y = years[yr] || (years[yr] = { y: +yr, last: null, first: null, n: 0 });
      if (v[i] == null) continue;
      Y.n++;
      if (v[i] <= 0) {
        if (md < '07-01') Y.last = md;                    // last frost of the first half-year
        else if (!Y.first) Y.first = md;                  // first frost of the second half-year
      }
    }
    // Only years with (almost) complete data.
    var list = Object.keys(years).map(function (k) { return years[k]; }).filter(function (Y) { return Y.n >= 360; });
    return { key: key, ts: Date.now(), years: list };
  }

  // Distance in km between two points (to avoid re-downloading when the phone barely moved).
  function km(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  /**
   * Automatic location (as in BeeManager): asks the phone for its position and downloads the
   * forecast for it. Used on startup unless the user picked a locality by hand.
   * If the position is refused or not available, the saved locality (if any) is kept.
   */
  function locateAuto(userAsked) {
    if (!('geolocation' in navigator)) { state.gpsError = 'nesuportat'; emit(); return Promise.resolve(false); }
    if (userAsked) state.mode = 'auto';
    state.locating = true; emit();
    return new Promise(function (resolve) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        state.locating = false; state.gpsError = '';
        var loc = { name: 'Locația ta (GPS)', lat: Math.round(pos.coords.latitude * 1e4) / 1e4, lon: Math.round(pos.coords.longitude * 1e4) / 1e4, auto: true };
        if (state.loc && state.loc.auto && km(state.loc, loc) < 1 && state.data) {
          save(state); emit(); resolve(refresh(false)); return;   // same place: just refresh if old
        }
        resolve(setLocation(loc));
      }, function (err) {
        state.locating = false;
        state.gpsError = err && err.code === 1 ? 'refuzat' : 'indisponibil';
        save(state); emit();
        // No position now: keep using the last known place (GPS or chosen by hand), if any.
        resolve(state.loc ? refresh(false) : false);
      }, { timeout: 10000, maximumAge: 15 * 60 * 1000 });
    });
  }

  /** Startup: automatic location unless a locality was chosen by hand. */
  function start() {
    if (state.loc) loadHistory(false);
    if (state.mode !== 'manual') {
      if (state.loc) refresh(false);   // show the last place at once while the phone looks for its position
      locateAuto(false);
    } else refresh(false);
  }

  /** Local "YYYY-MM-DD" for today (Europe/Bucharest is what the API returns). */
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function hourIso() {
    var d = new Date();
    return todayIso() + 'T' + String(d.getHours()).padStart(2, '0') + ':00';
  }

  /**
   * The saved forecast, cut to the days that are still in the future.
   * Returns null when there is nothing usable.
   */
  function forecast() {
    var j = state.data;
    if (!j) return null;
    var t0 = todayIso();
    var D = j.daily, H = j.hourly;
    var days = [];
    var past = [];
    var et0 = D.et0_fao_evapotranspiration || null;
    for (var i = 0; i < D.time.length; i++) {
      if (D.time[i] < t0) {
        past.push({ date: D.time[i], rain: D.precipitation_sum[i], et0: et0 ? et0[i] : null, tmin: D.temperature_2m_min[i], tmax: D.temperature_2m_max[i] });
        continue;
      }
      days.push({ et0: et0 ? et0[i] : null,
        date: D.time[i], code: D.weather_code[i], tmax: D.temperature_2m_max[i], tmin: D.temperature_2m_min[i],
        rain: D.precipitation_sum[i], prob: D.precipitation_probability_max ? D.precipitation_probability_max[i] : null,
        wind: D.wind_speed_10m_max[i], gust: D.wind_gusts_10m_max ? D.wind_gusts_10m_max[i] : null,
        sunrise: D.sunrise ? D.sunrise[i] : null, sunset: D.sunset ? D.sunset[i] : null
      });
    }
    var h0 = hourIso();
    var hours = [];
    for (var k = 0; k < H.time.length; k++) {
      if (H.time[k] < h0) continue;
      hours.push({
        time: H.time[k], t: H.temperature_2m[k], prob: H.precipitation_probability ? H.precipitation_probability[k] : null,
        rain: H.precipitation[k], rh: H.relative_humidity_2m[k], wind: H.wind_speed_10m[k],
        gust: H.wind_gusts_10m ? H.wind_gusts_10m[k] : null, code: H.weather_code ? H.weather_code[k] : null,
        soil0: H.soil_temperature_0cm ? H.soil_temperature_0cm[k] : null,
        soil6: H.soil_temperature_6cm ? H.soil_temperature_6cm[k] : null,
        soil18: H.soil_temperature_18cm ? H.soil_temperature_18cm[k] : null,
        moist: H.soil_moisture_3_to_9cm ? H.soil_moisture_3_to_9cm[k] : null
      });
    }
    if (!days.length) return null;
    // Today: use only the hours still ahead, so last night's frost or this morning's rain
    // are not reported as coming. The whole-day values stay in tminDay / rainDay.
    var rest = hours.filter(function (h) { return h.time.slice(0, 10) === days[0].date; });
    if (days[0].date === t0 && rest.length) {
      var ts = rest.map(function (h) { return h.t; }).filter(function (v) { return v != null; });
      var rs = rest.map(function (h) { return h.rain; }).filter(function (v) { return v != null; });
      days[0].tminDay = days[0].tmin; days[0].rainDay = days[0].rain;
      if (ts.length) days[0].tmin = Math.min.apply(null, ts);
      if (rs.length) days[0].rain = rs.reduce(function (a, b) { return a + b; }, 0);
      days[0].partial = true;
    }
    return { days: days, hours: hours, past: past.slice(-3), current: j.current || null, elevation: j.elevation };
  }

  window.WEATHER = {
    state: function () { return state; },
    forecast: forecast,
    refresh: refresh,
    loadHistory: loadHistory,
    parseHistory: parseHistory,
    setLocation: setLocation,
    locateAuto: locateAuto,
    start: start,
    searchPlaces: searchPlaces,
    onChange: function (fn) { listeners.push(fn); },
    isStale: function () { return !state.ts || Date.now() - state.ts > STALE_MS; },
    wmo: wmo,
    windDir: windDir,
    attribution: { text: 'Date meteo furnizate de Open-Meteo', url: 'https://open-meteo.com/' }
  };
})();
