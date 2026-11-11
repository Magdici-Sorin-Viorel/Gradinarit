/*
 * Service worker – makes the app work offline.
 * Strategy: precache every app file on install; when online always load the newest
 * files from the network (and keep a copy), when offline serve the saved copy.
 *
 * IMPORTANT: when you change any file, increase CACHE_VERSION so phones pick up the update.
 */
var CACHE_VERSION = 'gradina-banat-v32';

var APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './lib/fontawesome/css/all.min.css',
  './lib/fontawesome/webfonts/fa-solid-900.woff2',
  './lib/fontawesome/webfonts/fa-regular-400.woff2',
  './lib/qrcode.js',
  './js/weather.js',
  './js/weather-advisor.js',
  './js/app.js',
  './js/data/core.js',
  './js/data/sources.js',
  './js/data/aromatic.js',
  './js/data/flowers.js',
  './js/data/trees.js',
  './js/data/shrubs.js',
  './js/data/vines.js',
  './js/data/climbers.js',
  './js/data/vegetables.js',
  './js/data/months.js',
  './js/data/orchard.js',
  './js/data/jobs.js',
  './js/data/soil.js',
  './js/data/hardiness.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // cache: 'reload' skips the browser's HTTP cache, so the new version never stores old files.
      .then(function (cache) {
        // The page, script and data files are required; icons and fonts are optional,
        // so one missing optional file never blocks an update.
        var optional = APP_FILES.filter(function (u) { return /\/(icons|lib\/fontawesome)\//.test(u); });
        var required = APP_FILES.filter(function (u) { return optional.indexOf(u) < 0; });
        return cache.addAll(required.map(function (u) { return new Request(u, { cache: 'reload' }); })).then(function () {
          return Promise.all(optional.map(function (u) {
            return cache.add(new Request(u, { cache: 'reload' })).catch(function () { /* optional file missing */ });
          }));
        });
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  // Delete caches from older versions.
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION && k !== PHOTO_CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

var PHOTO_CACHE = 'gradina-banat-photos';
var PHOTO_MAX = 400;   // about 2 entries per plant (API answer + image); older ones are removed first

function trimPhotos(cache) {
  cache.keys().then(function (keys) {
    var extra = keys.length - PHOTO_MAX;
    for (var i = 0; i < extra; i++) cache.delete(keys[i]);
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Plant photos from Wikipedia: keep a copy so they also show offline.
  if (url.hostname === 'upload.wikimedia.org' || (url.hostname === 'en.wikipedia.org' && url.pathname === '/w/api.php')) {
    event.respondWith(
      caches.open(PHOTO_CACHE).then(function (cache) {
        return cache.match(req.url).then(function (hit) {
          if (hit) return hit;
          // Ask for a CORS copy (Wikimedia allows it) so the stored image is a normal, small response.
          var net = url.hostname === 'upload.wikimedia.org'
            ? fetch(req.url, { mode: 'cors', credentials: 'omit' }).catch(function () { return fetch(req); })
            : fetch(req);
          return net.then(function (res) {
            if (res && (res.ok || res.type === 'opaque')) cache.put(req.url, res.clone()).then(function () { trimPhotos(cache); });
            return res;
          });
        });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // App files: network first (always the newest version when online), cache when offline.
  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined);
      });
    })
  );
});
