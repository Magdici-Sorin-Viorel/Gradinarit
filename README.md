# Grădinărit

Installable Progressive Web App (PWA) – a monthly garden calendar for Romania, adjusted by the local weather (Open-Meteo, GPS or a chosen locality).
The UI is in Romanian; code and comments are in English. No framework, no build step.

## Structure

```
index.html              App shell
manifest.webmanifest    PWA manifest (name, icons, standalone display)
sw.js                   Service worker – offline cache (bump CACHE_VERSION on every change)
css/style.css           Styles (mobile-first, light/dark)
js/app.js               Router, views, "My garden" (localStorage)
js/weather.js           Open-Meteo forecast + locality search (all Romania), offline cache (localStorage)
js/weather-advisor.js   Rules engine: garden advice from the forecast + calendar + plant needs
js/data/soil.js         Soil colour groups, pH, drainage, neighbours, crop rotation
js/data/core.js         Categories, month names, plant schema + addPlants()
js/data/*.js            Plant data, one file per category
js/data/months.js       General garden tasks per month
js/data/orchard.js      Orchard work for fruit trees (pruning, grafting, whitewash, feeding)
js/data/sources.js      Sources used to check the information (shown in the app)
icons/                  App icons (any + maskable)
lib/fontawesome/        Font Awesome Free 6.4.0 icons (local copy, works offline)
```

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push the folder contents to a GitHub repository and enable GitHub Pages (branch `main`, root).
All paths are relative, so it works under `https://<user>.github.io/<repo>/`.
See `INSTALARE.md` (Romanian) for step-by-step instructions.

## Adding a plant

Add an object to the matching `js/data/<category>.js` file. Fields are documented at the top of `js/data/core.js`.
Months are numbers 1–12, orientative for the Romanian lowlands; the weather module adds local warnings.
List the sources for the entry in its `src` array (ids from `js/data/sources.js`).

## Photos

Plant photos are loaded at runtime from the English Wikipedia REST API (`page/summary`) and cached by the service worker
for offline use. The article title is derived from the Latin name, with overrides in `WIKI_TITLES` in `js/app.js`.

## Design

Visual design follows the BeeManager Pro app (dark theme with gold accent, bottom bar on phones, side menu on desktop).

## Weather module

- Data: [Open-Meteo](https://open-meteo.com/) forecast and geocoding APIs (free, no key, non-commercial use; attribution shown in the app).
- Model: same approach as BeeManager's `js/weather.js` (fetch, throttle, keep last good data, WMO codes).
- Location is automatic (phone GPS on every start, like BeeManager). If GPS is off or refused, the user picks a locality by name (anywhere in Romania); a manual pick stays until "use automatic location" is pressed.
- Forecast is refreshed at most every 30 minutes; older than 6 hours is shown as "not up to date".
- `weather-advisor.js` produces three levels of advice (Avertizare / Atenție / Recomandare). Plant thresholds
  (frost class, soil temperature, night temperature) live in the plant data with sources; general
  rain/wind/heat/humidity thresholds are orientative and labelled as such in the UI.

## Noutăți v28–v31

- **v28:** rezistența la ger după RHS (H1a–H7) pentru 80 de plante; temperaturi de germinare (Iowa State) pentru 8 plante; trifoi alb și trifoi roșu; avertizare când prognoza coboară sub limita unei plante din Grădina mea.
- **v29:** bilanțul apei (ploaie minus evapotranspirația FAO-56 ET₀ de la Open-Meteo, ultimele 3 zile și următoarele 3) cu sfaturi de udare RHS; recomandări pe zile; următoarea zi bună de lucru; înghețurile locale din ultimii 10 ani (Open-Meteo Historical Weather API).
- **v30:** ecranul „Azi în grădină” (butonul Azi), cu lucrările lunii pentru plantele tale și bife păstrate pe an; copie de siguranță (export/import, fișier sau text).
- **v31:** ghid general de sol (RHS: tipuri de sol, proba cu mâna și cu oțet, pH, corectarea pH-ului) și „Rezultatele testului meu”, separat de datele plantelor.

Chei noi în localStorage: `gradina-banat.done.v1` (bife pe an), `gradina-banat.soiltests.v1` (măsurătorile de sol).
- **v32:** aplicația se deschide din nou pe Calendar, la luna curentă.
- **v33:** adresa aplicației din QR și link scrisă exact ca repo-ul: https://magdici-sorin-viorel.github.io/Gradinarit/
- **v35:** „Azi în grădină” și „Grădina mea” sunt o singură pagină: lucrările lunii sus, plantele dedesubt. Vechiul link #azi duce acolo.
- **v37:** zilele din avertizări au și data (ex. „marți 17.11”).
- **v38:** pagina „Livadă și altoire” a fost scoasă; tipurile de tăieri, regula și metodele de altoire sunt acum pe cartonașul fiecărui pom, iar lucrarea „Se poate altoi acum” arată metoda lunii. Linkul vechi #altoire duce la Pomi.
- **v39:** „Vremea și grădina” nu mai e în bara de jos: se deschide din Setări sau din banda de vreme de pe Calendar și Grădina mea. Localitatea se alege doar în Setări.
- **v40:** ordinea paginilor (Calendar, Plante, Grădina mea) se alege din Setări; prima pagină e cea cu care se deschide aplicația.
