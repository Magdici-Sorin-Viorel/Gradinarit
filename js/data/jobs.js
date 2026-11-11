/*
 * Month-specific jobs for plants (besides planting, harvesting and the orchard work of fruit trees).
 * Each job: m = months (1–12), t = short label, d = details. All texts come from the care
 * information of the plant, so they share the plant's sources (`src`).
 */
(function () {
  var J = {
    // Spring bulbs
    lalele: [
      { m: [3, 4], t: 'Hrană cu potasiu, săptămânal', d: 'Un îngrășământ lichid bogat în potasiu, de preferat organic (macerat de tătăneasă diluat 1:20), până încep să se îngălbenească frunzele.' },
      { m: [5], t: 'Rupe florile trecute', d: 'Taie tija chiar deasupra frunzelor, ca să nu facă semințe. Lasă frunzele.' },
      { m: [6], t: 'Frunzele uscate / scoaterea bulbilor', d: 'Scoate tulpinile și frunzele când se fac ca paiul. Dacă vrei, scoate bulbii (cam la 6 săptămâni după înflorire), usucă-i și păstrează-i la 18–20 °C până toamna.' }
    ],
    narcise: [
      { m: [2, 3, 4], t: 'Hrană cu potasiu', d: 'De când apar lăstarii până încep să se usuce frunzele: de preferat organic (macerat de tătăneasă diluat 1:20).' },
      { m: [5], t: 'Lasă frunzele să se usuce singure', d: 'Nu le tăia mai devreme de cam 6 săptămâni după înflorire și nu le lega sau înnoda.' }
    ],
    zambile: [
      { m: [4], t: 'Taie tija florilor trecute', d: 'Tai-o de la bază; continuă udarea și hrănirea până se îngălbenesc frunzele.' },
      { m: [5, 6], t: 'Scoaterea bulbilor (dacă vrei)', d: 'După ce se usucă frunzele: scoți bulbii, îi cureți și îi ții la loc răcoros și uscat până toamna. În sol bine drenat pot rămâne pe loc. Lucrează cu mănuși.' }
    ],
    // Aromatic
    levantica: [{ m: [8], t: 'Tunde levănțica după înflorire', d: 'Scoți tijele florale trecute și cam 2,5 cm din frunziș. Nu tăia în lemnul bătrân.' }],
    cimbru: [{ m: [4, 5, 7], t: 'Tundere ușoară', d: 'La mijlocul–sfârșitul primăverii și/sau imediat după înflorire.' }],
    cimbrisor: [{ m: [7], t: 'Tundere foarte ușoară după înflorire', d: 'Doar ca să scoți florile trecute.' }],
    salvie: [{ m: [4, 5], t: 'Tăiere ușoară (o dată pe an)', d: 'Nu tăia adânc în lemnul bătrân.' }],
    rozmarin: [{ m: [12, 1, 2], t: 'Protecție pe ger', d: 'Pe frig mare acoperă-l cu agrotextil sau o pânză; ghivecele le muți la adăpost.' }],
    isop: [{ m: [4], t: 'Tăiere la pornirea creșterii', d: 'Taie-l la mijlocul primăverii, ca să se îndesească.' }],
    oregano: [{ m: [5], t: 'Tundere pentru tufă compactă', d: 'Scoate și tulpinile uscate sau prea lungi.' },
              { m: [4, 8, 9], t: 'Se poate împărți tufa', d: 'Primăvara sau la sfârșitul verii–începutul toamnei.' }],
    menta: [{ m: [8], t: 'Taie menta la 5 cm după înflorire', d: 'Așa face frunze noi.' },
            { m: [11, 12, 1, 2, 3], t: 'Scoate tulpinile vechi', d: 'Până primăvara, chiar înainte să apară lăstarii noi.' },
            { m: [3, 4, 9, 10], t: 'Se poate împărți tufa (o dată la câțiva ani)', d: '' }],
    roinita: [{ m: [8], t: 'Taie aproape de bază după înflorire', d: 'Înainte să facă semințe: face frunze noi și nu se mai autoînsămânțează.' },
              { m: [3, 4, 9, 10], t: 'Se poate împărți tufa (o dată la câțiva ani)', d: '' }],
    agastache: [{ m: [3, 4], t: 'Curăță tulpinile uscate', d: 'Nu o tăia toamna.' }],
    'iarba-matei': [{ m: [8], t: 'Taie după înflorire', d: 'Poate înflori din nou.' }],
    monarda: [{ m: [4], t: 'Se poate împărți tufa (o dată la câțiva ani)', d: '' }],
    fenicul: [{ m: [3], t: 'Taie tulpinile uscate la sol', d: 'Înainte să apară lăstarii noi.' }],
    arpagic: [{ m: [7], t: 'Poți tăia tufa la 5 cm după înflorire', d: 'Ca să facă frunze noi.' }],
    leustean: [{ m: [10, 11], t: 'Taie tulpinile uscate', d: '' }],

    // Flowers
    brandusa: [{ m: [2, 3, 4], t: 'În ghiveci: hrană cu potasiu', d: 'De preferat organic (macerat de tătăneasă diluat 1:20), la 7–10 zile, de când apar lăstarii până se usucă frunzele.' }],
    elebor: [{ m: [2, 3], t: 'Taie frunzele vechi (hibrizii orientali)', d: 'La celelalte tipuri, la sfârșitul primăverii.' }],
    'floarea-soarelui': [{ m: [6, 7], t: 'Susține soiurile înalte cu un arac', d: '' }],
    cosmos: [{ m: [5, 6], t: 'Ciupește vârfurile', d: 'Când are 2–3 perechi de frunze.' },
             { m: [6, 7, 8, 9], t: 'Rupe florile trecute', d: '' }],
    zinnia: [{ m: [7, 8, 9], t: 'Rupe florile trecute', d: 'Ca să înflorească mai mult.' }],
    'gura-leului': [{ m: [6, 7, 8, 9, 10], t: 'Rupe florile trecute', d: '' }],
    rudbeckia: [{ m: [3, 4], t: 'Se poate împărți tufa (la 3–5 ani)', d: '' }],
    sedum: [{ m: [3, 4], t: 'Taie inflorescențele uscate', d: '' },
            { m: [5], t: 'Poți scurta tulpinile la jumătate', d: 'La sfârșitul lui mai, ca plantele să rămână compacte.' }],
    'salvia-nemorosa': [{ m: [7, 8], t: 'Taie aproape de sol după înflorire', d: 'Pentru a doua înflorire.' },
                        { m: [10], t: 'Taie din nou (sau primăvara, în locuri reci)', d: '' }],
    verbena: [{ m: [10], t: 'Mulci de paie uscate pentru iarnă', d: '' },
              { m: [3, 4], t: 'Taie tulpinile vechi', d: 'Înainte de creșterea nouă.' }],
    echinops: [{ m: [9], t: 'Taie după înflorire', d: 'Poate înflori din nou.' }],
    gaillardia: [{ m: [6, 7, 8, 9, 10], t: 'Rupe florile trecute', d: 'După înflorire taie tulpinile la sol.' }],

    // Shrubs
    'coacaz-negru': [{ m: [12, 1, 2], t: 'Tăiere de iarnă', d: 'La tufele de peste 4 ani scoate de la bază până la o treime din tulpinile cele mai bătrâne.' }],
    'coacaz-rosu': [{ m: [2, 3], t: 'Tăiere', d: 'La sfârșitul iernii sau începutul primăverii.' }],
    agris: [{ m: [12, 1, 2], t: 'Tăiere de iarnă', d: 'Tufa să aibă mijlocul deschis.' },
            { m: [7], t: 'Tăiere de vară', d: '' }],
    zmeur: [{ m: [2], t: 'Soiurile de toamnă: taie toate tulpinile la sol', d: '' },
            { m: [8, 9], t: 'Soiurile de vară: taie tulpinile care au rodit', d: 'Leagă 6–8 tulpini noi la 10 cm una de alta.' }],
    mur: [{ m: [9, 10], t: 'Taie tulpinile care au rodit', d: 'De la bază, după recoltare.' }],
    capsuni: [{ m: [5, 6], t: 'Pune paie sub fructe', d: 'Ca să rămână curate.' },
              { m: [8], t: 'Poți înrădăcina stolonii în ghivece', d: '' },
              { m: [10], t: 'Scoate paiele', d: '' }],
    afin: [{ m: [2], t: 'Tăiere (din anul al treilea)', d: 'Scoate tulpinile uscate, rupte sau încrucișate.' }],
    goji: [{ m: [3], t: 'Tăiere ușoară', d: '' }],
    corn: [{ m: [2], t: 'Tăiere', d: 'Scoate lemnul uscat sau bolnav și dă-i formă.' }],
    alun: [{ m: [1, 2], t: 'Tăiere când mâțișorii eliberează polenul', d: 'Ajută polenizarea. Scoate și lăstarii de la bază.' }],
    soc: [{ m: [2, 3], t: 'Tăiere', d: 'Începând cu al doilea an după plantare.' }],
    buddleja: [{ m: [3, 4], t: 'Tăiere scurtă', d: 'Până la un schelet jos de tulpini.' }],
    caryopteris: [{ m: [3, 4], t: 'Tăiere', d: 'Tulpinile până la câțiva muguri de la bază.' }],
    mahonia: [{ m: [11, 12, 1, 2], t: 'Mulcește', d: '' }],

    // Vines
    'vita-masa': [{ m: [2], t: 'Compost sau gunoi bine descompus la bază', d: 'Ca mulci, 5–8 cm, pe sol care nu e înghețat sau îmbibat.' },
                  { m: [12, 1], t: 'Tăiere în repaus', d: 'Tăiată târziu, vița „plânge”.' },
                  { m: [5, 6, 7, 8], t: 'Îngrășământ cu potasiu la două săptămâni', d: 'De la o lună după pornire până la coacere.' }],
    'vita-vin': [{ m: [2], t: 'Compost sau gunoi bine descompus la bază', d: 'Ca mulci, 5–8 cm, pe sol care nu e înghețat sau îmbibat.' },
                 { m: [12, 1], t: 'Tăiere în repaus', d: 'Tăiată târziu, vița „plânge”.' }],

    // Climbers
    caprifoi: [{ m: [3, 4], t: 'Tăiere (soiurile care înfloresc târziu)', d: 'Cele timpurii se taie după înflorire.' }],
    clematis: [{ m: [2], t: 'Tăiere', d: 'Tulpinile vechi până la cea mai de jos pereche de muguri sănătoși, la 15–30 cm de sol.' }],
    campsis: [{ m: [2], t: 'Tăiere', d: 'Scurtează lăstarii laterali.' }],
    'kiwi-mic': [{ m: [2], t: 'Tăiere de iarnă', d: '' },
                 { m: [6, 7], t: 'Tăiere de vară', d: '' },
                 { m: [4], t: 'Protejează lăstarii tineri de îngheț', d: '' }],

    // Vegetables
    cartofi: [{ m: [6, 7], t: 'Udare la 10–14 zile', d: 'După ce tuberculii au mărimea unei bile.' }],
    sparanghel: [{ m: [10], t: 'Taie tulpinile la sol', d: 'Când frunzișul se îngălbenește.' }],
    revent: [{ m: [3], t: 'Mulcește', d: '' },
             { m: [4, 5, 6], t: 'Scoate tijele florale cum apar', d: '' }],
    kale: [{ m: [5, 6, 7, 8], t: 'Plasă contra insectelor', d: '' }]
  };

  window.PLANTS.forEach(function (p) { p.jobs = J[p.id] || []; });
})();
