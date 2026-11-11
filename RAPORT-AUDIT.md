# Raport de audit și dezvoltare – Grădina din Banat (versiunea v25)

Data: 11 noiembrie 2026

## 1. Fișiere modificate / adăugate

| Fișier | Ce s-a schimbat |
|---|---|
| `js/weather.js` (NOU) | Modulul meteo Open-Meteo: căutare localitate (doar județul Timiș), prognoză curentă / pe ore / pe 7 zile, temperatura solului (model), salvare offline |
| `js/weather-advisor.js` (NOU) | Motorul de recomandări: avertizări, atenționări și recomandări din prognoză + calendar + cerințele fiecărei plante |
| `js/app.js` | Pagina „Vremea și grădina”, rezumat meteo în Calendar, nota meteo pe cartonașe, localitatea în Setări, rețeta de var, condițiile de semănat, avertizarea la altoire, tipuri de tăieri, etichete albine |
| `js/data/orchard.js` | Rețeta naturală de var (1 kg / 5 l), 2 perioade (nov. + feb.), siguranța varului; hrănire organică; nematozi, capcane cu feromoni, benzi cu clei explicate corect; compatibilități la altoire corectate; tipuri de tăieri |
| `js/data/vegetables.js` | Mod de semănat/plantat, sensibilitate la îngheț, temperaturi sol/noapte; lunile culturilor de căldură corectate; albine confirmate de LWG Bayern |
| `js/data/aromatic.js` | Busuiocul marcat sensibil la îngheț (nopți peste 10 °C) |
| `js/data/soil.js` | Juglona: diferențiat nucul negru de nucul comun; grupă separată pentru cucurbitacee |
| `js/data/months.js`, `jobs.js`, `vines.js`, `flowers.js` | Îngrășăminte de sinteză înlocuite cu variante organice; văruirea de primăvară și de toamnă |
| `js/data/sources.js` | 16 surse noi (162 în total) |
| `index.html`, `sw.js`, `css/style.css`, `README.md` | Tab nou „Vreme”, fișierele noi în cache, stiluri, versiunea v25 |

## 2. Plantele

- **Toate cele 111 plante au fost păstrate** (20 aromatice, 24 flori, 12 pomi, 16 arbuști, 2 viță de vie, 6 cățărătoare, 31 legume). Nu am eliminat nicio plantă.
- Pomi verificați: măr, păr, gutui, cireș, vișin, cais, piersic, prun, corcoduș, moșmon, smochin, nuc – toți rămân.
- Nicio plantă nu e imposibil de cultivat în România; smochinul și kiwi au deja protecția de iarnă descrisă.

## 3. Erori corectate

1. **Rețeta de var** conținea sulfat de cupru, sare grunjoasă, gunoi de grajd și lut, iar textul spunea că varul „distruge dăunătorii și ouăle”. Înlocuită cu rețeta naturală și cu rolul real (reflectă lumina, reduce încălzirea scoarței).
2. **Lunile varului** `[2, 3, 11]` nu se potriveau cu „de două ori pe an” → acum `[2, 11]`: toamna (noiembrie) și primăvara (februarie, cel târziu începutul lui martie).
3. **Hrănirea pomilor** – textul despre azot a fost rescris pentru compost/gunoi bine descompus; avertizare contra gunoiului proaspăt și a azotului târziu.
4. **Vița de vie, bulbii** – „îngrășământ general și sulfat de potasiu” / „îngrășământ ca pentru roșii” → compost ca mulci și macerat de tătăneasă diluat 1:20.
5. **Capcanele cu feromoni** prezentate ca metodă de combatere → acum: în primul rând monitorizare.
6. **Benzile cu clei** – precizat că prind doar femelele fără aripi (cotarul de iarnă etc.), nu viermele merelor/prunelor; prind și insecte utile.
7. **Nematozii** – adăugat când (sept.–oct., după ieșirea omizilor), unde (trunchi, ramuri, solul de sub coroană), că sursa nu dă praguri de temperatură/umiditate (se respectă eticheta produsului) și limitele.
8. **Altoire**: cireș pe vișin nu e confirmat de sursă (marcat ca test); lista completă de soiuri de păr incompatibile direct cu gutuiul; părul pe gutui trăiește mai puțin; avertizare generală că incompatibilitatea poate apărea după ani.
9. **Juglona** – lista de plante sensibile era aplicată nucului comun ca la nucul negru; acum e marcată ca precauție.
10. **Calendarul legumelor de căldură** – roșii, ardei, castraveți, dovlecei, dovleac, pepeni, fasole: luna principală e mai; aprilie apare doar ca „posibil dacă vremea permite”.
11. **Albine** – valoarea 0 însemna și „nu e meliferă” și „nu știu”. Acum e afișat clar „Informații insuficiente” (nu înseamnă că nu e meliferă).

## 4. Rețeta finală de văruire

| Ingredient | Cantitate |
|---|---:|
| Var hidratat (var stins, hidroxid de calciu) | 1 kg |
| Apă curată | 5 litri |

- Doar var stins/hidratat, niciodată var nestins. Varul se adaugă treptat în apă, amestecând; consistență de vopsea; doar cât folosești în ziua aceea.
- Strat subțire, pe trunchi uscat, de la bază până la ~1 m. De două ori pe an: noiembrie (după căderea frunzelor, înainte de ger) și februarie (înainte de pornirea mugurilor și de înflorire).
- Fără sare, piatră vânătă, gunoi, ciment, adezivi, vopsea. Lut: neinclus (nu am găsit proporții și date de siguranță).
- Siguranță: doar pe scoarță matură și sănătoasă; nu pe frunze, muguri, flori, fructe, răni proaspete sau pomi foarte tineri; nu pe ploaie, ger sau căldură mare; mănuși și ochelari, fără inhalarea prafului; test pe câțiva pomi în primul an.
- Surse: Zerimar Laboratoire (proporția 1 kg / 5 l, precauții), UC IPM (rolul de reflectare a luminii), Organic Gardener (caracterul caustic), NPS (var hidratat și apă ca practică tradițională).

## 5. Modulul meteo

- Pagina **Vreme** (tab nou) și un rezumat în **Calendar**, pe luna curentă, cu cele mai importante 1–2 mesaje.
- Locația se ia **automat** din GPS-ul telefonului la fiecare pornire (ca în BeeManager). Dacă GPS-ul e oprit sau accesul e refuzat, localitatea se alege manual după nume (geocodarea Open-Meteo, doar județul Timiș), din Setări sau din pagina Vreme. O localitate aleasă manual rămâne până apeși „Treci pe locația automată”.
- Afișează: vremea actuală (temperatură, resimțită, umiditate, vânt + direcție, rafale, șanse și cantitate de precipitații, starea cerului, radiația solară), 24 de ore (cu orele de îngheț marcate), 7 zile (min/max, ploaie mm și %, vânt/rafale, răsărit/apus), temperatura solului la 0, 6 și 18 cm (estimată de model, marcată ca atare).
- **Recomandări** pe 3 niveluri: Avertizare / Atenție / Recomandare, fiecare cu motivul (cifrele) și plantele vizate; plantele din „Grădina mea” sunt marcate.
  Reguli: îngheț (separat pentru plante sensibile, rezistente, pomi înfloriți, smochin), nopți prea reci pentru fiecare plantă sensibilă, solul prea rece pentru semănat (pe fiecare legumă), ploaie (amânarea udării / a lucrului solului), caniculă, secetă, vânt, grindină, umezeală prelungită (boli fungice posibile, nu sigure), vreme potrivită pentru lucrările lunii, zi bună pentru văruire.
- **Legat de calendar**: pe cartonașul unei plante apare o notă meteo doar când contează (ex. roșii programate în mai, dar nopți de 8 °C). Recomandarea din calendar nu dispare.
- **Offline**: ultima prognoză e salvată; se afișează ora actualizării; după 6 ore apare „datele nu mai sunt actuale”; la eroare datele vechi nu se șterg. API-ul e întrebat cel mult o dată la 30 de minute.
- Atribuire: „Date meteo furnizate de Open-Meteo” cu link.

## 6. Informații care NU au putut fi verificate (lăsate deoparte sau marcate)

- **Gradarea nectarului și a polenului** (redus / mediu / ridicat) – nu am găsit o sursă accesibilă care să gradeze toate cele 111 plante. Plantele confirmate apar ca „vizitată de albine – confirmat de sursă, negradat”; restul ca „informații insuficiente”. Trifoiul alb și roșu nu sunt în aplicație.
- **Temperatura solului de 12–14 °C pentru roșii** și **18 °C pentru pepeni** – nu am găsit-o într-o sursă. Am folosit tabelul Oregon State (minim 10 °C la roșii, minim 15,5 °C / optim de la 21–24 °C la pepeni) și pragul RHS de nopți peste 10 °C.
- **Lunile de semănat pentru răsaduri** (în casă) – nu am găsit o sursă pentru Timiș; e descrisă doar călirea (RHS: 2–3 săptămâni).
- **Lutul în var** – fără proporții sigure în surse; neinclus.
- **Pragurile pentru nematozi** (temperatură, umiditate) – sursa nu le dă; trimitere la eticheta produsului.
- **Cireș pe portaltoi de vișin, cais/piersic pe corcoduș** – Blockhill nu le acoperă; rămân cu avertizare.
- **Plante companion** – aplicația nu conține afirmații de tip „planta X alungă dăunătorul Y”; vecinii trecuți sunt doar cei din surse (juglonă, rugina părului, mană, boala replantării, polenizare).
- **Pragurile generale** pentru ploaie (5/15/25 mm), vânt (40 km/h, rafale 50 km/h), caniculă (32 °C), umezeală (85%) sunt ale aplicației, orientative, și sunt marcate așa în interfață.
- **Calendar pe zone ale județului** – nu există calendare separate; diferențele (est vs. câmpie, altitudine) sunt prinse prin prognoza locală pentru localitatea aleasă.

## 7. Teste efectuate

- Date: 111 plante, 0 identificatori duplicați, 0 luni invalide, 0 surse lipsă (162 de surse).
- Interfață: 18 pagini pe telefon (400 px) și calculator (1280 px), fără erori JavaScript și fără depășire pe orizontală.
- Modul meteo (API simulat): căutare „Parta” → doar Parța din Timiș (nu și cea din Alba); scenariu noiembrie (îngheț −3 °C, vânt 83 km/h) și scenariu mai (nopți de 8 °C, sol 13 °C) → avertizările corecte, inclusiv pe cartonașe; mod offline și date vechi marcate corect.
- PWA: service worker v25 activ, fișierele noi în cache, aplicația merge offline cu ultima prognoză.
- Neverificat aici: apelul real către Open-Meteo (mediul de lucru nu are acces la internet spre API) – se verifică pe telefon după publicarea pe GitHub.

## 8. Surse noi principale

- Open-Meteo – Forecast API și Geocoding API: https://open-meteo.com/en/docs
- BeeManager – modelul modulului meteo: https://github.com/Magdici-Sorin-Viorel/BeeManager
- Zerimar Laboratoire – văruirea trunchiului: https://www.zerimarlaboratoire.com/en/copy-2-of-tratamientosparticulares-/encalado-del-tronco
- UC IPM – Whitewashing trunks: https://ipm.ucanr.edu/PMG/GARDEN/ENVIRON/whitewashing.html
- Organic Gardener – Lime-based whitewash: https://organicgardener.com.au/?p=13904
- NPS – Limewash: https://www.nps.gov/articles/limewash-an-old-practice-and-a-good-one.htm
- Oregon State University – Soil temperature for vegetable seed germination: https://extension.oregonstate.edu/gardening/soil-compost/soil-temperature-conditions-vegetable-seed-germination
- RHS – Planting out tender plants: https://www.rhs.org.uk/garden-jobs/when-to-plant-out-tender-plants-avoiding-late-frosts
- RHS – Hardening off: https://www.rhs.org.uk/prevention-protection/hardening-off-tender-plants
- RHS – Frost damage: https://rhs.org.uk/advice/profile?pid=704
- RHS – Organic matter: https://www.rhs.org.uk/soil-composts-mulches/organic-matter-how-to-use-in-garden
- RHS – Homemade fertilisers: https://www.rhs.org.uk/garden-jobs/homemade-fertilisers
- RHS – Pruning apples and pears: https://www.rhs.org.uk/fruit/apples/pruning-made-easy
- RHS – Codling moth / Plum moth / Grease bands (deja existente, recitite)
- Blockhill – Rootstock/scion compatibility (deja existent, recitit)
- LWG Bayern – Bienenweide im Nutzgarten: https://lwg.bayern.de/mam/cms06/bienen/dateien/bienenweide_im_nutzgarten_neu.pdf
- Mississippi State University – Transplanting: https://extension.msstate.edu/lawn-and-garden/vegetable-gardens/transplanting
