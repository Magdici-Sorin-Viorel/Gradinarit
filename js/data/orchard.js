/*
 * Orchard work for fruit trees (Romania): pruning, fruit thinning,
 * whitewashing trunks, grafting, moving, feeding. Every block lists its sources.
 *
 * Per-tree fields (keyed by the plant id from trees.js):
 *   prune, pruneTxt   - pruning months and how
 *   thin, thinTxt     - fruit thinning months and how (empty if not needed)
 *   graft, graftTxt   - grafting months and methods
 *   graftOn           - rootstocks this tree is grafted ONTO
 *   hosts             - what you can graft onto THIS tree
 *   notOn             - combinations that do NOT work
 *   move, moveTxt     - when and how to move it
 *   formTxt           - shaping the crown, staking
 *   propTxt           - propagation
 *   feed, feedTxt     - feeding
 *   src               - source ids for this tree's orchard info (see sources.js)
 */
(function () {
  var MOVE_DORMANT = 'Mută pomul doar cât e în repaus, fără frunze: de la jumătatea lui octombrie până în noiembrie sau din martie până în aprilie. Scoate-l cu cât mai mult pământ pe rădăcini, plantează-l la aceeași adâncime și udă abundent. Cu cât pomul e mai tânăr, cu atât se prinde mai ușor.';
  var FEED = 'Hrănire naturală: compost matur sau gunoi de grajd bine descompus, întins ca strat (mulci) pe zona rădăcinilor, din februarie până la mijlocul lui aprilie. Un strat de 5–8 cm ține și buruienile și umezeala. Pomul are cea mai mare nevoie de hrană între mijlocul lui martie și mai, când pornește creșterea.\nNu folosi gunoi de grajd proaspăt lângă rădăcini (dacă nu ai altul, pune jumătate din cantitate și niciodată pe straturi cu legume care se mănâncă crude). Nu pune nimic pe sol înghețat sau îmbibat cu apă. Nu da hrană bogată în azot târziu în sezon: face lăstari moi, care îngheață ușor.\nPomii mari, bine prinși, de obicei nu au nevoie de îngrășăminte lichide.';
  var FEED_SRC = ['fibl_pomi', 'rhs_organicmatter', 'rhs_frost', 'rhs_homefeed'];
  var THIN_GENERAL = 'După căderea naturală a fructelor din iunie, rupe fructele deformate, lovite și pe cele prea înghesuite. Orientativ: un fruct la 15–30 de frunze. Termină rărirea înainte să se întărească sâmburele.';
  var FORM_GENERAL = 'Coroanele cu ax central (piramidă) se formează pe un trunchi de 100–120 cm. La plantare, partea de sus se scurtează, ca rădăcinile să se refacă. Pomii pe portaltoi viguros în general nu au nevoie de arac; cei pe portaltoi slab (de ex. măr pe M9) au nevoie de sprijin.';
  var FORM_VASE = 'Se poate forma ca vas (coroană fără ax central, cu centrul deschis), una dintre formele naturale de coroană. La plantare, partea de sus se scurtează, ca rădăcinile să se refacă.';

  // Protection against pests, frost and birds (months + what to do). Keyed by tree id.
  var GREASE = [
    { m: [10], t: 'Pune benzi cu clei pe trunchi (contra cotarului)', d: 'La sfârșitul lui octombrie, la cam 45 cm de sol, pe trunchi și pe arac, înainte să apară fluturii cotarului de iarnă în noiembrie. Benzile prind femelele fără aripi ale cotarului (și ale altor fluturi asemănători) când urcă în pom să depună ouă.\nNU ajută contra viermelui merelor sau al prunelor (femelele lor zboară, vara) și nici contra altor omizi. Prind și insecte folositoare (de ex. urechelnițe), așa că folosește-le doar unde cotarul a făcut pagube înainte.', src: ['rhs_greaseband'] },
    { m: [11, 12, 1, 2, 3, 4], t: 'Verifică benzile cu clei de pe trunchi', d: 'Să rămână lipicioase și curate de frunze și resturi. Ține-le doar din toamnă până în primăvară (aprilie), apoi scoate-le.', src: ['rhs_greaseband'] }
  ];
  var CODLING = [
    { m: [5], t: 'Capcană cu feromoni pentru viermele merelor', d: 'Agață capcana la începutul lui mai și numără săptămânal fluturii prinși. Capcana e în primul rând pentru MONITORIZARE: îți arată când zboară fluturii. Singură rareori ține viermele sub control; doar la un pom izolat poate prinde destui masculi cât să scadă ouăle fertile.', src: ['rhs_codling'] },
    { m: [9, 10], t: 'Contra viermelui merelor: nematozi', d: 'Când: în septembrie–octombrie, după ce omizile au ieșit din fructe.\nUnde: stropești trunchiul, ramurile și solul de sub coroană.\nCondiții: sursa nu dă praguri de temperatură sau umiditate – ele depind de produsul biologic folosit, deci respectă exact instrucțiunile de pe ambalaj.\nLimite: nu te apără anul următor de fluturii veniți din grădinile vecine, iar nematozii pot ataca și alte insecte; folosește-i doar dacă ai cu adevărat problema.\nAjută și păsările, viespile și gândacii de sol; dacă se poate, acceptă câteva fructe atacate.', src: ['rhs_codling'] }
  ];
  var SCAB = [
    { m: [10, 11], t: 'Strânge frunzele căzute și fructele bolnave', d: 'Așa scade rapănul de anul următor. Taie și ramurile tinere cu bășici.', src: ['rhs_scab'] }
  ];
  var FIREBLIGHT = [
    { m: [5, 6, 7, 8, 9], t: 'Verifică dacă apare focul bacterian', d: 'Semne: flori ofilite, lăstari uscați ca arși, scurgeri pe vreme umedă. Taie ramura cu 30 cm (ramuri mici) sau 60 cm (ramuri mari) sub partea bolnavă și dezinfectează foarfeca între tăieturi.', src: ['rhs_fireblight'] }
  ];
  var FROST = [
    { m: [3, 4], t: 'Protejează florile de îngheț', d: 'Când se anunță îngheț, acoperă pomii mici peste noapte cu agrotextil sau un cearșaf vechi și descoperă-i ziua, ca să ajungă albinele la flori. Pe ger puternic, ține protecția până la două săptămâni după înflorire.', src: ['rhs_frostfruit', 'rhs_cherry'] }
  ];
  var PROTECT = {
    mar: GREASE.concat(CODLING, SCAB, FIREBLIGHT),
    par: GREASE.concat(CODLING, SCAB, FIREBLIGHT),
    cires: GREASE.concat(FROST, [{ m: [5], t: 'Pune plasă contra păsărilor', d: 'Înainte să se coloreze fructele: pe tot pomul sau pe ramuri. Ține plasa întinsă, pe araci, ca să nu se încurce păsările în ea.', src: ['rhs_cherry'] }]),
    visin: GREASE.concat(FROST, [{ m: [6], t: 'Pune plasă contra păsărilor', d: 'Înainte să se coloreze fructele. Ține plasa întinsă, pe araci, ca să nu se încurce păsările în ea.', src: ['rhs_cherry'] }]),
    prun: GREASE.concat([
      { m: [5], t: 'Capcană cu feromoni pentru viermele prunelor', d: 'Se agață la începutul lui mai. E în primul rând pentru MONITORIZARE; singură rareori controlează viermele, doar la un pom izolat poate scădea împerecherea. Dacă pui și plasă contra păsărilor, scade riscul ca păsările să se prindă în capcană.', src: ['rhs_plummoth'] },
      { m: [9, 10], t: 'Contra viermelui prunelor: nematozi', d: 'Când: în septembrie–octombrie, după ce omizile au ieșit din fructe.\nUnde: trunchiul, ramurile și solul de sub coroană.\nCondiții: sursa nu dă praguri de temperatură sau umiditate – depind de produs; respectă instrucțiunile producătorului.\nLimite: nu te apără anul următor de fluturii din grădinile vecine (unde sunt mulți pruni în jur, poate să nu merite); pot ataca și alte insecte, deci doar dacă ai problema. Ajută păsările, ariciul și gândacii de sol.', src: ['rhs_plummoth'] }
    ]),
    cais: FROST,
    piersic: FROST.concat([
      { m: [11, 12, 1, 2, 3, 4, 5], t: 'Contra bășicării frunzelor: adăpost de ploaie', d: 'La piersicii conduși pe zid sau gard: o folie de plastic deasupra și în față, de la căderea frunzelor (noiembrie) până la mijlocul lui mai, cu capetele deschise pentru albine.', src: ['rhs_leafcurl'] },
      { m: [4, 5, 6], t: 'Rupe frunzele bășicate', d: 'Imediat ce le vezi, înainte să se acopere cu pulbere albă.', src: ['rhs_leafcurl'] }
    ]),
    smochin: [{ m: [11, 12, 1, 2, 3], t: 'Protecție de iarnă', d: 'După căderea frunzelor învelește-l cu paie și apoi cu agrotextil; ghivecele se mută într-o încăpere neîncălzită până trec înghețurile.', src: ['rhs_fig'] }]
  };

  // What to do if water stands around the roots (all trees).
  var WATERLOG = 'Semne: frunze îngălbenite între nervuri, pomul se ofilește deși solul e ud, lăstari care se usucă, rădăcini negre-albăstrui cu miros acru. După inundație nu călca pe sol până nu se poate lucra, strânge resturile și taie lăstarii afectați. Primăvara adaugă materie organică (compost matur) și mulcește zona rădăcinilor; udă pe secetă. Prevenire: îmbunătățește drenajul și plantează pomii pe un mic mușuroi.';

  window.ORCHARD = {
    protect: PROTECT,
    feedSrc: FEED_SRC,
    waterlogTxt: WATERLOG,
    waterlogSrc: ['rhs_waterlog'],
    // Whitewashing: two applications a year (a traditional practice kept on purpose).
    lime: [2, 3, 11],
    limeSpring: [2, 3], limeAutumn: [11],
    limeTxt: 'De două ori pe an (practică tradițională):\n• Toamna – după căderea frunzelor și înainte de ger (de obicei în noiembrie).\n• Primăvara – în februarie sau la începutul lui martie, după cum e vremea la tine: înainte să pornească mugurii și înainte de înflorire.\nLa ce folosește: stratul alb reflectă lumina și scade încălzirea scoarței, ajutând contra arsurilor de soare și a crăpăturilor de iarnă. NU înlocuiește tratamentele, nu omoară toate ouăle de insecte și nu garantează protecția la îngheț.',
    limeRecipe: [
      { i: 'Var hidratat (var stins, hidroxid de calciu)', q: '1 kg' },
      { i: 'Apă curată', q: '5 litri' }
    ],
    limeHow: 'Folosește DOAR var stins/hidratat, niciodată var nestins (bulgări, oxid de calciu).\nPune apa în găleată și adaugă varul treptat, amestecând. Dacă e prea gros, mai pune apă; dacă e prea subțire, nu mări „din ochi” cantitatea de var. Trebuie să se întindă cu pensula ca o vopsea. Prepară doar cât folosești în ziua aceea.\nAplică un strat subțire și uniform pe trunchi, de la bază până la cam 1 m, pe scoarță uscată. NU răzui scoarța sănătoasă: cel mult îndepărtezi cu mâna sau cu o perie moale resturile care se desprind singure (mușchi, scoarță moartă căzută).\nNu adăuga sare, piatră vânătă, gunoi de grajd, ciment, adezivi sau vopsea. Lutul nu e inclus în rețetă.',
    limeSafety: [
      'Doar pe scoarță matură și sănătoasă – nu pe frunze, muguri, flori sau fructe și nu pe răni proaspete.',
      'Nu pe pomi foarte tineri, cu scoarța subțire sau sensibilă: acolo varul caustic poate arde scoarța.',
      'Nu pe trunchi ud, pe ploaie sau înainte de ploaie; evită zilele cu ger și pe cele foarte calde.',
      'Varul hidratat e caustic: poartă mănuși și ochelari de protecție, nu respira praful.',
      'Primul an: încearcă pe câțiva pomi și urmărește scoarța. Dacă apar arsuri sau decolorări ciudate, oprește-te.'
    ],
    limeSrc: ['zerimar_lime', 'ucipm_whitewash', 'organicgardener_lime', 'nps_limewash', 'kstate_sunscald', 'protv_var', 'playtech_var'],

    // Grafting: a graft that takes is not proof of long-term compatibility.
    graftWarn: 'O altoire care s-a prins nu dovedește compatibilitatea pe termen lung: incompatibilitatea poate apărea abia după câțiva ani, prin ruperea punctului de altoire. Încearcă întâi pe puțini pomi și urmărește-i în timp. O intermediară (un soi compatibil altoit între ele) poate face legătura între specii care nu se potrivesc direct.',
    graftWarnSrc: ['blockhill_compat'],

    // Kinds of pruning (shown on the orchard page).
    pruneTypes: [
      { t: 'Tăiere de formare', d: 'La pomii tineri, în primii ani: construiește un schelet de ramuri echilibrat, pe care pomul va rodi.' },
      { t: 'Tăiere de fructificare (pomi maturi)', d: 'La măr și păr, iarna, fără frunze: cel mult 10–20% din coroană într-o iarnă. Majoritatea lemnului de rod trebuie să fie tânăr (1–4 ani). Sâmburoasele au alte reguli (vezi fiecare pom).' },
      { t: 'Tăiere de vară / întreținere', d: 'Principala tăiere la formele conduse (cordon, spalier, evantai, piramidă); scoate și lăstarii lacomi.' },
      { t: 'Tăiere de regenerare (pomi bătrâni, neîngrijiți)', d: 'Se împarte pe mai multe ierni, ca să nu pornească mulți lăstari lacomi. Evită să tai ramuri foarte groase dintr-o dată.' },
      { t: 'Tăiere sanitară', d: 'Scoate ramurile cu cancer (dacă nu e pe trunchi sau o șarpantă principală) și fructele mumificate (putregai brun). Uscarea fără motiv a ramurilor poate arăta o problemă la rădăcină.' }
    ],
    pruneTypesSrc: ['rhs_pruneapples'],

    trees: {
      mar: {
        prune: [2, 3, 7, 8],
        pruneTxt: 'Tăierea de iarnă se face cât pomul e în repaus, de la sfârșitul iernii până după înflorire, cu cât mai puține tăieri (stimulează creșterea lăstarilor). Vara, după ce lăstarii s-au format, poți rupe lăstarii lacomi. Nu tăia sub -5 °C.',
        thin: [6, 7], thinTxt: THIN_GENERAL,
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai (altoire în coroană, când înflorește forsythia). Vara–toamna, între 15 iulie și 15 septembrie: altoire în ochi dormind.',
        graftOn: 'Portaltoi de măr: M9 și M26 (pom mic), MM106 (pom mijlociu) sau măr din sămânță.',
        hosts: ['Alte soiuri de măr', 'Moșmon – trecut ca altoi compatibil pe măr'],
        notOn: 'Mărul nu apare ca altoi compatibil pe gutui sau pe păr; pe păr se prinde doar soiul Northern Spy. Altoiește mărul doar pe măr.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire pe portaltoi de măr.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['fibl_pomi', 'casa_taieri', 'bzi_altoire', 'promesse_rootstock', 'blockhill_compat', 'dedeman_plant']
      },
      par: {
        prune: [2, 3, 7, 8],
        pruneTxt: 'Ca la măr: tăierea de iarnă la sfârșitul iernii, cu cât mai puține tăieri. Dacă există focul bacterian în zonă, renunță la tăierile de vară.',
        thin: [6, 7], thinTxt: THIN_GENERAL,
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Păr din sămânță (pom viguros) sau gutui (pom mai mic, rodește mai repede, dar trăiește mai puțin decât pe păr din sămânță). Pe gutui nu se prind direct toate soiurile (vezi la gutui).',
        hosts: ['Alte soiuri de păr'],
        notOn: 'Gutuiul NU se prinde pe păr. Moșmonul se prinde doar imperfect pe păr – mai bine pe gutui sau păducel.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire pe păr din sămânță sau pe gutui.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['fibl_pomi', 'casa_taieri', 'bzi_altoire', 'promesse_rootstock', 'blockhill_compat', 'teepee_graft', 'dedeman_plant']
      },
      gutui: {
        prune: [2, 3],
        pruneTxt: 'Tăieri ușoare la sfârșitul iernii, cât pomul e în repaus. Nu tăia sub -5 °C.',
        thin: [], thinTxt: '',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Gutui.',
        hosts: [
          'Păr – gutuiul ține părul mai mic și îl face să rodească mai repede. Soiuri compatibile direct: Conference, Beurré Hardy, Doyenne du Comice, Abate Fetel.',
          'NU se prind direct pe gutui: Bartlett (Williams), Bosc, Seckel, Winter Nelis, Clapp\'s Favorite, Forelle. Pentru ele altoiești întâi un soi compatibil (de ex. Beurré Hardy) ca intermediar, apoi soiul dorit pe acesta. Compatibile direct (după sursă): Beurré Hardy, Anjou, Comice, Packham\'s Triumph, Old Home.',
          'Moșmon – de obicei se altoiește pe gutui sau păducel.',
          'Alte soiuri de gutui'
        ],
        notOn: 'Mărul nu e listat ca altoi compatibil pe gutui. Gutuiul nu se prinde nici pe păr.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se altoiește pe gutui.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['blockhill_quince', 'blockhill_compat', 'teepee_graft', 'rhs_medlar', 'bzi_altoire', 'casa_taieri']
      },
      cires: {
        prune: [3, 7, 8],
        pruneTxt: 'O dată pe an, imediat după recoltare (sfârșitul lui iulie–august), pe vreme uscată. Tăierea de vară scade riscul de boli. Pomii tineri primesc tăieri de formare la început de primăvară.',
        thin: [], thinTxt: '',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Cireș sălbatic (Prunus avium) sau mahaleb (Prunus mahaleb); în pepiniere și Gisela 5 sau Colt.',
        hosts: ['Alte soiuri de cireș', 'Vișin'],
        notOn: 'Cireșul se altoiește pe cireș, vișin sau mahaleb – nu pe corcoduș sau prun.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire pe cireș sălbatic sau mahaleb.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_cherry', 'promesse_rootstock', 'blockhill_compat', 'bzi_altoire']
      },
      visin: {
        prune: [3, 7, 8],
        pruneTxt: 'După recoltare, vara, pe vreme uscată. Vișinul rodește mai ales pe lăstarii de anul trecut: tăierea scoate ramurile bătrâne și lasă lăstari tineri.',
        thin: [], thinTxt: '',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Cireș sălbatic sau mahaleb.',
        hosts: ['Alte soiuri de vișin', 'Cireș – sursa nu confirmă cireșul pe portaltoi de vișin; dacă încerci, fă un test pe puțini pomi'],
        notOn: 'Ca la cireș: nu pe corcoduș sau prun.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_cherry', 'promesse_rootstock', 'blockhill_compat', 'bzi_altoire']
      },
      cais: {
        prune: [3, 4, 7, 8],
        pruneTxt: 'Doar primăvara sau vara, pe vreme uscată. Pomii abia plantați se taie la început de primăvară, cei maturi după ce au rodit.',
        thin: [5, 6], thinTxt: 'De obicei e nevoie doar când pomul e foarte încărcat. Când fructele sunt cât o cireașă (sfârșitul primăverii), rărește-le la 5–8 cm unul de altul.',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Corcoduș (myrobalan), prun St Julien A, piersic din sâmbure sau cais.',
        hosts: ['Alte soiuri de cais'],
        notOn: 'Prunul european nu se prinde pe cais (la majoritatea soiurilor). Piersicul și nectarinul pe cais trăiesc puțin.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_VASE,
        propTxt: 'Se înmulțește prin altoire.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_apricot', 'promesse_rootstock', 'blockhill_compat', 'bzi_altoire', 'casa_taieri']
      },
      piersic: {
        prune: [4, 7, 8],
        pruneTxt: 'Doar primăvara sau vara, pe vreme uscată. Pomii abia plantați se taie imediat după ce pornesc mugurii, primăvara. Pomii liberi (nu pe spalier) se taie vara, după recoltare. Rodește pe lemnul de anul trecut, de aceea are nevoie de tăiere anuală.',
        thin: [5, 6], thinTxt: 'Când fructele sunt între mărimea unei alune și a unei nuci, rărește-le la cam 20 cm unul de altul. Începe cu cele deformate sau mult mai mici.',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai. Ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Piersic din sâmbure, corcoduș (myrobalan) sau prun St Julien A. Atenție: pe unii portaltoi de prun, altoiul de piersic poate ceda după câțiva ani.',
        hosts: ['Alte soiuri de piersic și nectarin'],
        notOn: 'Prunul european pe piersic trăiește puțin.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_VASE,
        propTxt: 'Se înmulțește prin altoire.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_peach', 'promesse_rootstock', 'ucanr_rootstock', 'blockhill_compat', 'bzi_altoire']
      },
      prun: {
        prune: [4, 7],
        pruneTxt: 'Nu tăia prunul iarna (crește riscul bolii „frunza argintie”). Pomii tineri se taie la început de primăvară (aprilie), cei maturi la mijlocul verii (iulie).',
        thin: [6], thinTxt: 'Rupe fructele de pe ramurile prea încărcate și umbrite, după căderea naturală din iunie și înainte să se întărească sâmburele.',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai (altoire în coroană, ca să schimbi soiul pe ramuri bătrâne). Ochi dormind între 15 iulie și 15 septembrie. Portaltoiul ideal are 1,5–5 cm grosime.',
        graftOn: 'Corcoduș – apreciat pentru vigoare și pentru că suportă soluri diferite. Și prun St Julien.',
        hosts: ['Alte soiuri de prun'],
        notOn: 'Cireșul și vișinul nu se altoiesc pe prun.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire, de obicei pe corcoduș.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_plum_prune', 'bzi_altoire', 'promesse_rootstock', 'fibl_pomi']
      },
      corcodus: {
        prune: [4, 7],
        pruneTxt: 'Ca prunul: nu iarna, ci la început de primăvară sau la mijlocul verii.',
        thin: [], thinTxt: '',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Ca portaltoi: primăvara, de la jumătatea lui martie până în mai, sau ochi dormind între 15 iulie și 15 septembrie, pe o tulpină de 1,5–5 cm grosime.',
        graftOn: 'Corcoduș.',
        hosts: [
          'Prun – corcodușul e portaltoiul cel mai folosit pentru prun',
          'Cais',
          'Piersic și nectarin (atenție: pe unii portaltoi de prun, altoiul de piersic poate ceda după câțiva ani)',
          'Migdal'
        ],
        notOn: 'Pe corcoduș NU se altoiesc cireșul și vișinul. Nici mărul, părul sau gutuiul nu se altoiesc pe el.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se folosește chiar ca portaltoi (myrobalan).',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['bzi_altoire', 'promesse_rootstock', 'ucanr_rootstock', 'rhs_plum_prune']
      },
      mosmon: {
        prune: [12, 1, 2],
        pruneTxt: 'Iarna, cât e în repaus. Pomul matur are nevoie doar de tăieri ușoare: ramuri uscate, rupte sau prea dese.',
        thin: [], thinTxt: '',
        graft: [3, 4, 5, 7, 8, 9],
        graftTxt: 'Primăvara, de la jumătatea lui martie până în mai, sau ochi dormind între 15 iulie și 15 septembrie.',
        graftOn: 'Păducel sau gutui (cele mai folosite). Se prinde și pe măr.',
        hosts: ['Alte soiuri de moșmon'],
        notOn: 'Pe păr se prinde doar imperfect.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT,
        formTxt: FORM_GENERAL,
        propTxt: 'Se înmulțește prin altoire pe păducel sau gutui.',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_medlar', 'blockhill_compat', 'bzi_altoire']
      },
      smochin: {
        prune: [4, 6],
        pruneTxt: 'De două ori pe an: primăvara și la început de vară. Vara ciupește vârfurile lăstarilor. La sfârșitul verii, ciupirea ajută lăstarii să se maturizeze și să reziste la ger.',
        thin: [], thinTxt: '',
        graft: [], graftTxt: 'Nu se altoiește de obicei; se înmulțește prin butași.',
        graftOn: 'Pe rădăcini proprii (din butaș).',
        hosts: ['Nu se folosește ca portaltoi.'],
        notOn: 'Nu se altoiește pe alți pomi din livadă.',
        move: [4], moveTxt: 'Ca la plantare: primăvara, ca să aibă tot sezonul să se prindă.',
        formTxt: 'Poate fi format pe spalier în evantai lângă un zid (cam 1,8 m înălțime și 3,5 m lățime), sau ținut în ghiveci.',
        propTxt: 'Butași lemnoși de cam 20 cm, luați toamna. Sau marcotaj (îngropi o ramură joasă) primăvara sau toamna, ori drajonii de la bază, puși la ghiveci primăvara.',
        feed: [3, 4, 5, 6, 7], feedTxt: 'În pământ: o dată pe an, la început de primăvară, compost matur sau gunoi bine descompus pe zona rădăcinilor. În ghiveci: la 2 săptămâni, până încep să se coacă fructele, un îngrășământ lichid organic bogat în potasiu – de exemplu macerat de tătăneasă diluat 1:20.',
        src: ['rhs_fig', 'casa_taieri']
      },
      nuc: {
        prune: [6, 7],
        pruneTxt: 'Doar la mijlocul verii. Iarna și primăvara „plânge” (curge seva din tăieturi).',
        thin: [], thinTxt: '',
        graft: [], graftTxt: 'Altoirea nucului e dificilă; pentru o grădină e mai simplu să cumperi puieți altoiți.',
        graftOn: 'Nuc.',
        hosts: ['Alte soiuri de nuc'],
        notOn: 'Se altoiește doar nuc pe nuc.',
        move: [3, 4, 10, 11], moveTxt: MOVE_DORMANT + ' Nucul devine foarte mare – alege de la început locul definitiv.',
        formTxt: FORM_GENERAL,
        propTxt: 'Prin altoire (puieți din pepinieră).',
        feed: [2, 3, 4], feedTxt: FEED,
        src: ['rhs_bleeding', 'dedeman_plant', 'fibl_pomi']
      }
    },

    methods: [
      { name: 'Altoire de primăvară (în coroană, despicătură, copulație)', months: [3, 4, 5],
        txt: 'De la jumătatea lui martie până în mai; un semn bun e când înflorește forsythia (ciuboțica-cucului de grădină). Altoirea în coroană înlocuiește ramurile bătrâne cu ramuri de alt soi. Portaltoiul ideal are 1,5–5 cm grosime; mai gros, se prinde mai greu.',
        src: ['bzi_altoire'] },
      { name: 'Ochi dormind', months: [7, 8, 9],
        txt: 'Între 15 iulie și 15 septembrie, pe temperaturi moderate. Un mugur sănătos se introduce în scoarța portaltoiului. După ce s-a prins, portaltoiul se taie deasupra lui, ca să pornească lăstarul nou.',
        src: ['bzi_altoire'] }
    ],

    // Monthly orchard ideas (index 0 = January). Only tasks backed by the sources above.
    ideas: [
      ['Moșmonul se poate tăia acum, cât e în repaus.',
       'Verifică protecția de iarnă a smochinului (paie și agrotextil).'],
      ['Tăieri la măr, păr și gutui în zilele fără ger (nu sub -5 °C).',
       'Văruirea de primăvară: înainte de pornirea mugurilor și de înflorire, pe trunchi uscat.',
       'Din februarie până la jumătatea lui aprilie poți da compost sau gunoi de grajd bine descompus.'],
      ['Plantează pomii cu rădăcină nudă până la sfârșitul lui aprilie.',
       'De la jumătatea lunii începe altoirea de primăvară (când înflorește forsythia).',
       'Dacă se anunță îngheț când înflorește caisul, acoperă-l peste noapte.'],
      ['Tăieri la prunii, piersicii și caișii tineri, la început de primăvară.',
       'Continuă altoirea de primăvară.',
       'Plantează smochinul (primăvara).'],
      ['Ultima lună pentru altoirea de primăvară.',
       'Azotul se dă între mijlocul lui martie și mai.',
       'Rărește caisele când sunt cât o cireașă, la 5–8 cm unul de altul.'],
      ['După căderea naturală a fructelor din iunie, rărește merele, perele și prunele.',
       'Rărește piersicile la cam 20 cm, când sunt între mărimea unei alune și a unei nuci.',
       'La smochin: a doua tăiere, la început de vară, și ciupirea vârfurilor.'],
      ['Taie cireșul și vișinul imediat după recoltare, pe vreme uscată.',
       'Tăieri la prunii maturi, la mijlocul verii; tăieri la nuc.',
       'De la 15 iulie începe altoirea în ochi dormind.'],
      ['Continuă altoirea în ochi dormind.',
       'Taie caișii și piersicii după ce au rodit.',
       'Tăieri de vară la măr și păr: rupe lăstarii lacomi.'],
      ['Ochi dormind până pe 15 septembrie.',
       'La sfârșitul verii ciupește vârfurile smochinului ca lemnul să se maturizeze înainte de iarnă.'],
      ['De la jumătatea lunii poți planta pomii cu rădăcină nudă.',
       'Culege moșmonul după brumă și lasă-l să se înmoaie 2–3 săptămâni.'],
      ['Continuă plantarea pomilor cât solul nu e înghețat.',
       'Văruirea de toamnă: după căderea frunzelor și înainte de ger, pe trunchi uscat.',
       'Învelește smochinul cu paie și agrotextil după căderea frunzelor.'],
      ['Moșmonul se poate tăia acum, cât e în repaus.',
       'Planifică ce soiuri vrei să altoiești în primăvară.']
    ]
  };
})();
