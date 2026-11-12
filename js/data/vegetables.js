// Vegetables. Planting months come from Romanian garden calendars (agrointel_cal, agrotv_cal, evz_legume);
// watering advice from the RHS watering guide (rhs_vegwater); other details from the sources listed per plant.
var W_FRUIT = 'Udă bine la plantare, apoi constant în timpul înfloririi și al formării fructelor. Udarea neregulată poate duce la putregaiul vârfului fructelor. După udare sau ploaie pune un strat de mulci organic de 5–7,5 cm.';
var W_LEAF = 'Are nevoie de apă în toate fazele de creștere. Dacă apa e puțină, udă bine când se formează căpățâna. Mulcește după udare sau ploaie.';
var W_ROOT = 'Udă înainte ca solul să se usuce, de exemplu după cam 14 zile fără ploaie. Udarea prea multă poate crăpa rădăcinile.';
var W_ONION = 'Are nevoie de apă doar până se prinde și pe secetă foarte mare.';

addPlants('vegetables', [
  {
    id: 'rosii', name: 'Roșii', latin: 'Solanum lycopersicum', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], harvest: [],
    about: 'Se plantează afară ca răsad, după ce a trecut riscul de îngheț.',
    how: 'Răsadurile se plantează afară în primele trei săptămâni din mai (1–20 mai); sfârșitul lui aprilie doar dacă nu mai e risc de îngheț și nopțile rămân peste 10 °C. Dacă n-ai plantat în mai, se mai pot planta la începutul lui iunie.',
    water: W_FRUIT,
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'ardei', name: 'Ardei gras și ardei iute', latin: 'Capsicum annuum', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], harvest: [],
    about: 'Se plantează afară ca răsad.',
    how: 'Calendarele locale dau plantarea răsadurilor între 10 aprilie și 20 mai, în sol bine pregătit. Ardeiul nu suportă frigul: plantează devreme (aprilie) doar dacă nu mai e risc de îngheț și nopțile rămân peste 10 °C; altfel așteaptă luna mai.',
    water: 'Udă regulat. Mulcește după udare.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'vinete', name: 'Vinete', latin: 'Solanum melongena', life: 'Anuală', sun: 'Soare plin',
    plant: [5, 6], harvest: [],
    about: 'Se plantează afară ca răsad.',
    how: 'Răsadurile se plantează afară în primele trei săptămâni din mai (1–20 mai), sau la începutul lui iunie dacă n-ai plantat în mai.',
    water: W_FRUIT,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'castraveti', name: 'Castraveți', latin: 'Cucumis sativus', life: 'Anuală', sun: 'Soare',
    plant: [4, 5, 6, 7], harvest: [],
    about: 'Se seamănă direct în grădină, în mai multe serii.',
    how: 'Seamănă direct de la sfârșitul lui aprilie, în mai și până la sfârșitul lui iunie, la câte 10 zile. Mai poți semăna și la mijlocul lui iulie.',
    water: 'Udă regulat. Mulcește după udare.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'dovlecei', name: 'Dovlecei', latin: 'Cucurbita pepo', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], harvest: [],
    about: 'Se seamănă direct în grădină.',
    how: 'Calendarele locale dau semănatul direct în aprilie (în trei serii: 1–10, 10–20, 20–30) sau în mai. Semințele au nevoie de sol cald (vezi „Condiții” mai jos); dacă aprilie e rece, seamănă în mai.',
    water: 'Au nevoie de umezeală constantă ca să dea recoltă.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'dovleac', name: 'Dovleac de copt', latin: 'Cucurbita maxima', life: 'Anuală', sun: 'Soare plin',
    plant: [4], harvest: [],
    about: 'Se seamănă direct în grădină.',
    how: 'Calendarele locale dau semănatul direct în a doua jumătate a lui aprilie (10–30 aprilie). Semințele au nevoie de sol cald (vezi „Condiții” mai jos); dacă aprilie e rece, seamănă în mai. Poți face și răsad la ghiveci în casă, plantat afară după călire, când nopțile rămân peste 10 °C.',
    water: 'Udă regulat. Mulcește după udare.',
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'pepene-verde', name: 'Pepene verde', latin: 'Citrullus lanatus', life: 'Anuală', sun: 'Soare plin',
    plant: [4], harvest: [],
    about: 'Se seamănă direct în grădină.',
    how: 'Calendarele locale dau semănatul direct în a doua jumătate a lui aprilie (10–30 aprilie). Semințele au nevoie de sol cald (vezi „Condiții” mai jos); dacă aprilie e rece, seamănă în mai. Poți face și răsad la ghiveci în casă, plantat afară după călire, când nopțile rămân peste 10 °C.',
    water: 'Udă regulat. Mulcește după udare.',
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'pepene-galben', name: 'Pepene galben', latin: 'Cucumis melo', life: 'Anuală', sun: 'Soare plin',
    plant: [4], harvest: [],
    about: 'Se seamănă direct în grădină.',
    how: 'Calendarele locale dau semănatul direct în a doua jumătate a lui aprilie (10–30 aprilie). Semințele au nevoie de sol cald (vezi „Condiții” mai jos); dacă aprilie e rece, seamănă în mai. Poți face și răsad la ghiveci în casă, plantat afară după călire, când nopțile rămân peste 10 °C.',
    water: 'Udă regulat. Mulcește după udare.',
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'fasole-pastai', name: 'Fasole verde (păstăi)', latin: 'Phaseolus vulgaris', life: 'Anuală', sun: 'Soare',
    plant: [4, 5, 6, 7], harvest: [],
    about: 'Se seamănă direct, în mai multe serii, ca să ai păstăi toată vara.',
    how: 'Seamănă direct de la sfârșitul lui aprilie, când solul s-a încălzit, apoi în serii la câte 10 zile în mai, iunie și iulie.',
    water: 'Fasolea pitică suportă puțină uscăciune. Fasolea urcătoare are nevoie de umezeală constantă ca să lege păstăi.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'mazare', name: 'Mazăre', latin: 'Pisum sativum', life: 'Anuală', sun: 'Soare',
    plant: [2, 3, 4, 11], harvest: [],
    about: 'Se seamănă devreme, de la sfârșitul lui februarie.',
    how: 'Seamănă de la sfârșitul lui februarie și în martie. Soiurile târzii se seamănă până la mijlocul lui aprilie. Se mai poate semăna la începutul lui noiembrie pentru recoltă timpurie anul următor.',
    water: 'Udă mult la înflorire și încă două săptămâni după ce începe înflorirea, dar nu prea mult cât plantele sunt tinere.',
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'cartofi', name: 'Cartofi', latin: 'Solanum tuberosum', life: 'Anuală', sun: 'Soare',
    plant: [3, 4, 6], harvest: [],
    about: 'Cei timpurii se pun în martie, cei de toamnă la sfârșitul lui iunie.',
    how: 'Cartofii timpurii se pun din 10 martie până pe 10 aprilie. Cartofii preîncolțiți se pun de la mijlocul lui aprilie, la 10 cm adâncime, cu 70 cm între rânduri și 30–40 cm între cuiburi. Cartofii de toamnă se pun în 20–30 iunie.',
    water: 'Udă când se formează tuberculii, chiar înainte de înflorire. După ce tuberculii au mărimea unei bile, udă la 10–14 zile.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'ceapa', name: 'Ceapă (sămânță și arpagic)', latin: 'Allium cepa', life: 'Bienală', sun: 'Soare plin',
    plant: [2, 3, 4, 11], harvest: [],
    about: 'Arpagicul se pune la începutul lui martie.',
    how: 'Ceapa din sămânță se seamănă de la sfârșitul lui februarie, în martie și până la mijlocul lui aprilie. Arpagicul se pune în 1–10 martie. Pentru recoltă timpurie anul următor, se mai seamănă la începutul lui noiembrie.',
    water: W_ONION,
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'usturoi', name: 'Usturoi', latin: 'Allium sativum', life: 'Anuală', sun: 'Soare plin',
    plant: [2, 3, 11], harvest: [],
    about: 'Se pune la sfârșitul iernii sau toamna.',
    how: 'Se pune de la sfârșitul lui februarie până pe 10 martie, sau la începutul lui noiembrie pentru recoltă timpurie anul următor.',
    water: 'Udă când stratul de sus al solului e uscat.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume']
  },
  {
    id: 'morcov', name: 'Morcov', latin: 'Daucus carota', life: 'Bienală', sun: 'Soare',
    plant: [2, 3, 4, 8, 11], harvest: [],
    about: 'Se seamănă devreme primăvara.',
    how: 'Seamănă de la sfârșitul lui februarie până la mijlocul lui aprilie, pe rânduri la 25 cm. Pe terenurile eliberate în august se mai poate semăna pentru primăvară, iar la începutul lui noiembrie pentru recoltă timpurie anul următor.',
    water: W_ROOT,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'patrunjel', name: 'Pătrunjel (frunze și rădăcină)', latin: 'Petroselinum crispum', life: 'Bienală', sun: 'Soare sau semiumbră',
    plant: [2, 3, 4, 8, 11], harvest: [],
    about: 'Se seamănă devreme primăvara, ca morcovul.',
    how: 'Seamănă de la sfârșitul lui februarie până la mijlocul lui aprilie, pe rânduri la 25 cm. Pe terenurile eliberate în august se mai poate semăna pentru primăvară, iar la începutul lui noiembrie pentru recoltă timpurie.',
    water: W_ROOT,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'pastarnac', name: 'Păstârnac', latin: 'Pastinaca sativa', life: 'Bienală', sun: 'Soare',
    plant: [3, 4], harvest: [],
    about: 'Rădăcinoasă semănată primăvara.',
    how: 'Seamănă până la mijlocul lui aprilie, pe rânduri la 25 cm.',
    water: W_ROOT,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'ridichi', name: 'Ridichi', latin: 'Raphanus sativus', life: 'Anuală', sun: 'Soare sau semiumbră',
    plant: [2, 3, 4, 7, 8], harvest: [],
    about: 'Ridichile de lună se seamănă primăvara devreme, cele de vară în aprilie și cele de iarnă la sfârșitul verii.',
    how: 'Ridichile de lună se seamănă de la sfârșitul lui februarie până la sfârșitul lui martie. Ridichile de vară se seamănă în 1–20 aprilie. Ridichile de iarnă se seamănă de la sfârșitul lui iulie până pe 10 august.',
    water: 'Udă când stratul de sus al solului e uscat.',
    src: ['agrointel_cal', 'agrotv_cal']
  },
  {
    id: 'sfecla', name: 'Sfeclă roșie', latin: 'Beta vulgaris', life: 'Bienală', sun: 'Soare',
    plant: [4, 6, 7], harvest: [],
    about: 'Se seamănă din a doua jumătate a lui aprilie și din nou vara.',
    how: 'Seamănă din mijlocul lui aprilie, pe rânduri la 30 cm. Se mai seamănă la sfârșitul lui iunie și în iulie.',
    water: W_ROOT,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'salata', name: 'Salată', latin: 'Lactuca sativa', life: 'Anuală', sun: 'Soare sau semiumbră',
    plant: [2, 3, 4, 8, 9], harvest: [],
    about: 'Se seamănă primăvara devreme și din nou la sfârșitul verii.',
    how: 'Seamănă de la sfârșitul lui februarie până la mijlocul lui aprilie. Salata care iernează se seamănă de la sfârșitul lui august până pe 10 septembrie.',
    water: W_LEAF + ' Salatei nu-i face bine seceta.',
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'spanac', name: 'Spanac', latin: 'Spinacia oleracea', life: 'Anuală', sun: 'Soare sau semiumbră',
    plant: [2, 3, 4, 7, 8, 9, 10], harvest: [],
    about: 'Se seamănă primăvara devreme și din nou de la sfârșitul verii până toamna.',
    how: 'Seamănă de la sfârșitul lui februarie până pe 20 aprilie. Din nou de la sfârșitul lui iulie până în septembrie. Semănat în 1–10 octombrie, dă recoltă timpurie primăvara.',
    water: 'Udă când stratul de sus al solului e uscat.',
    src: ['agrointel_cal', 'agrotv_cal']
  },
  {
    id: 'varza', name: 'Varză', latin: 'Brassica oleracea var. capitata', life: 'Bienală', sun: 'Soare',
    plant: [4, 5, 6, 7], harvest: [],
    about: 'Varza timpurie se plantează în aprilie; cea de vară în mai–iunie; cea de toamnă la sfârșitul lui iunie–începutul lui iulie.',
    how: 'Varza timpurie se plantează în 1–10 aprilie. Cea semitimpurie se plantează la sfârșitul lui aprilie. Varza de vară se pune de la sfârșitul lui mai până pe 10 iunie. Varza de toamnă (pentru murat) se pune de la sfârșitul lui iunie până pe 10 iulie.',
    water: W_LEAF,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'conopida', name: 'Conopidă', latin: 'Brassica oleracea var. botrytis', life: 'Anuală', sun: 'Soare',
    plant: [4, 5, 6], harvest: [],
    about: 'Se plantează primăvara sau la sfârșitul lui iunie.',
    how: 'Se plantează de la mijlocul lui aprilie, pe pământ umed, la 7–10 °C. Se mai plantează în 20–30 iunie, pe sol îngrășat cu îngrășăminte organice.',
    water: W_LEAF,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'broccoli', name: 'Broccoli', latin: 'Brassica oleracea var. italica', life: 'Anuală', sun: 'Soare',
    plant: [5, 6], harvest: [],
    about: 'Se plantează la sfârșitul primăverii și în iunie.',
    how: 'Se poate planta pe pământ umed, la 7–10 °C, și în iunie, pe sol îngrășat cu îngrășăminte organice.',
    water: W_LEAF,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'gulie', name: 'Gulie', latin: 'Brassica oleracea var. gongylodes', life: 'Anuală', sun: 'Soare',
    plant: [4, 5, 6, 7], harvest: [],
    about: 'Se plantează în mai multe serii, din aprilie până în iulie.',
    how: 'Se plantează de la mijlocul lui aprilie, apoi la sfârșitul lui mai și în iunie. Se mai seamănă în iulie.',
    water: W_LEAF,
    src: ['agrointel_cal', 'agrotv_cal', 'rhs_vegwater']
  },
  {
    id: 'kale', name: 'Kale (varză kale)', latin: 'Brassica oleracea (Acephala Group)', life: 'Bienală', sun: 'Soare',
    plant: [3, 4, 5, 6], harvest: [9, 10, 11, 12, 1, 2],
    about: 'Una dintre cele mai rezistente la ger legume cu frunze: dă frunze toată iarna.',
    how: 'Seamănă afară din martie până în iunie. Plantează răsadurile la sfârșitul primăverii–începutul verii, când au 10–15 cm, la 30–60 cm distanță.',
    water: 'Udă regulat plantele tinere. Cele mature au nevoie de apă mai ales pe secete lungi.',
    care: 'Acoperă cu plasă contra insectelor, pe arcuri sau araci.',
    pick: 'Din septembrie: rupe 2–3 frunze de jos de pe fiecare plantă, timp de mai multe luni.',
    src: ['rhs_kale']
  },
  {
    id: 'praz', name: 'Praz', latin: 'Allium porrum', life: 'Bienală', sun: 'Soare',
    plant: [3, 4, 5, 6], harvest: [8, 9, 10, 11, 12],
    about: 'Soiurile de iarnă rezistă în grădină peste iarnă, fără protecție.',
    how: 'Seamănă afară în martie–aprilie. Mută plantele când au cam 20 cm și grosimea unui creion: fă găuri de 15 cm adâncime, pune câte un praz în fiecare și umple doar cu apă, fără pământ. Distanța este de 15–20 cm, cu 30 cm între rânduri.',
    water: 'Udă plantele tinere până se prind, apoi doar pe secete lungi, fără să uzi frunzele.',
    care: 'Mușuroiește tulpina ca să ai partea albă mai lungă, fără să intre pământ între frunze.',
    pick: 'De la sfârșitul verii.',
    src: ['rhs_leeks']
  },
  {
    id: 'telina', name: 'Țelină', latin: 'Apium graveolens', life: 'Bienală', sun: 'Soare',
    plant: [4], harvest: [],
    about: 'Se plantează ca răsad.',
    how: 'Se plantează de la mijlocul lui aprilie, la 40 cm între rânduri și 40 cm pe rând.',
    water: 'Udă când stratul de sus al solului e uscat.',
    src: ['agrointel_cal', 'agrotv_cal']
  },
  {
    id: 'porumb', name: 'Porumb dulce', latin: 'Zea mays', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5, 6], harvest: [],
    about: 'Se seamănă direct, din a doua jumătate a lui aprilie.',
    how: 'Porumbul de fiert se seamănă în 10–30 aprilie. Porumbul dulce se seamănă de la mijlocul lui aprilie, apoi în serii în mai și până pe 20 iunie.',
    water: 'Udă bine la plantare, apoi constant în timpul înfloririi și formării știuleților.',
    src: ['agrointel_cal', 'agrotv_cal', 'evz_legume', 'rhs_vegwater']
  },
  {
    id: 'rucola', name: 'Rucola', latin: 'Eruca vesicaria', life: 'Anuală', sun: 'Soare sau semiumbră',
    plant: [4, 5, 6, 7, 8, 9], harvest: [5, 6, 7, 8, 9, 10],
    about: 'Căldura și seceta o fac să înflorească devreme.',
    how: 'Seamănă afară din aprilie până la începutul lui septembrie, la cel mult 1 cm adâncime, cu 15 cm între plante și între rânduri.',
    water: 'Ține solul umed; pe căldură, la umbră și udată.',
    care: 'Seamănă câte puțin la câteva săptămâni ca să ai mereu frunze.',
    pick: 'La 4–6 săptămâni după semănat.',
    src: ['rhs_rocket']
  },
  {
    id: 'sparanghel', name: 'Sparanghel', latin: 'Asparagus officinalis', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4], harvest: [4, 5, 6],
    about: 'Cultură de lungă durată: prima recoltă abia în al treilea an.',
    how: 'Plantează rizomii („ghearele”) în martie–începutul lui aprilie. Fă gropi de 30 cm lățime și 20 cm adâncime (sau un șanț), cu un mușuroi de 10 cm pe fund. Așază rizomul pe mușuroi cu mugurii în sus și acoperă-l lăsând vârfurile vizibile. Distanța este de 30–45 cm, cu 45 cm între rânduri.',
    water: 'Udă regulat în prima vară, apoi doar pe secete lungi.',
    care: 'Toamna, când frunzișul se îngălbenește, taie tulpinile la sol.',
    pick: 'Nu recolta în primii doi ani. Din anul trei, taie lăstarii de la mijlocul lui aprilie timp de 6–8 săptămâni.',
    src: ['rhs_asparagus', 'evz_legume']
  },
  {
    id: 'revent', name: 'Revent (Rubarbă)', latin: 'Rheum × hybridum', life: 'Perenă', sun: 'Soare sau semiumbră',
    plant: [3, 4, 10, 11], harvest: [4, 5, 6],
    about: 'Frunzele nu se mănâncă: conțin acid oxalic. Se folosesc doar codițele.',
    how: 'Plantează primăvara sau toamna (rizomii fără pământ din noiembrie până în martie), la 75–90 cm, cu vârful rizomului puțin deasupra solului.',
    water: 'Udă plantele noi pe secetă. Cele prinse au nevoie de apă doar pe secete lungi vara.',
    care: 'Mulcește în fiecare primăvară. Scoate tijele florale de la bază cum apar. Împarte tufa cam la 5 ani, în repaus.',
    pick: 'Nu recolta în primul an; în al doilea doar câteva codițe. Apoi din aprilie–mai până la sfârșitul lui iunie–începutul lui iulie, cel mult o treime din codițe.',
    src: ['rhs_rhubarb']
  }
]);

/*
 * How each vegetable goes in the ground, frost sensitivity and temperature references.
 *  mode:  direct (sown in place) | transplant (seedlings) | both | bulb (sets/cloves) | tuber | rhizome
 *  frost: tender (killed by frost: wait for warm nights) | hardy (cool-season, sown early) | half (top growth hurt by frost) | null (no source)
 *  soil:  [minimum, lower end of optimum] soil temperature in °C for seed germination (Oregon State table, converted from °F)
 *  night: minimum night temperature before planting out (RHS: 7 °C in general, 10 °C for tomatoes, peppers and cucurbits)
 *  early: months when it is possible only if the weather allows (shown as a conditional note, not as "plant now")
 */
(function () {
  var V = {
    rosii: { mode: 'transplant', frost: 'tender', soil: [10, 15.5], night: 10, plant: [5], early: [4] },
    ardei: { mode: 'transplant', frost: 'tender', soil: [15.5, 18], night: 10, plant: [5], early: [4] },
    vinete: { mode: 'transplant', frost: 'tender', soil: [15.5, 24], night: 10 },
    castraveti: { mode: 'direct', frost: 'tender', soil: [15.5, 15.5], night: 10, plant: [5, 6, 7], early: [4] },
    dovlecei: { mode: 'direct', frost: 'tender', soil: [15.5, 21], night: 10, plant: [5], early: [4] },
    dovleac: { mode: 'direct', frost: 'tender', soil: [15.5, 21], night: 10, plant: [5], early: [4] },
    'pepene-verde': { mode: 'direct', frost: 'tender', soil: [15.5, 21], night: 10, plant: [5], early: [4] },
    'pepene-galben': { mode: 'direct', frost: 'tender', soil: [15.5, 24], night: 10, plant: [5], early: [4] },
    'fasole-pastai': { mode: 'direct', frost: 'tender', soil: [15.5, 15.5], night: 7, plant: [5, 6, 7], early: [4] },
    porumb: { mode: 'direct', frost: 'tender', soil: [10, 15.5], night: 7 },
    mazare: { mode: 'direct', frost: 'hardy', soil: [4.5, 4.5] },
    cartofi: { mode: 'tuber', frost: 'half' },
    ceapa: { mode: 'both', frost: 'hardy', soil: [1.5, 10] },
    usturoi: { mode: 'bulb', frost: 'hardy' },
    morcov: { mode: 'direct', frost: 'hardy', soil: [4.5, 7] },
    patrunjel: { mode: 'direct', frost: 'hardy', soil: [4.5, 10] },
    pastarnac: { mode: 'direct', frost: 'hardy', soil: [1.5, 10] },
    ridichi: { mode: 'direct', frost: 'hardy', soil: [4.5, 7] },
    sfecla: { mode: 'direct', frost: 'hardy', soil: [4.5, 10] },
    salata: { mode: 'direct', frost: 'hardy', soil: [1.5, 4.5] },
    spanac: { mode: 'direct', frost: 'hardy', soil: [1.5, 7] },
    varza: { mode: 'transplant', frost: 'hardy', soil: [4.5, 7] },
    conopida: { mode: 'transplant', frost: 'hardy', soil: [4.5, 7] },
    broccoli: { mode: 'transplant', frost: 'hardy' },
    gulie: { mode: 'transplant', frost: 'hardy' },
    kale: { mode: 'both', frost: 'hardy' },
    praz: { mode: 'transplant', frost: 'hardy' },
    telina: { mode: 'transplant', frost: null },
    rucola: { mode: 'direct', frost: null },
    sparanghel: { mode: 'rhizome', frost: 'hardy', soil: [10, 15.5] },
    revent: { mode: 'rhizome', frost: 'hardy' }
  };
  window.PLANTS.forEach(function (p) {
    var v = V[p.id];
    if (!v) return;
    p.mode = v.mode;
    p.frost = v.frost;
    if (v.soil) p.soilT = v.soil;
    if (v.night) p.nightMin = v.night;
    if (v.plant) p.plant = v.plant;
    p.early = v.early || [];
    p.src = p.src.concat(v.soil ? ['osu_soiltemp'] : [], v.frost === 'tender' ? ['rhs_tender', 'rhs_hardening'] : []);
  });
})();

/*
 * Bee interest confirmed by LWG Bayern ("Bienenweide im Nutzgarten", Bavarian State Institute for
 * Viticulture and Horticulture). The source confirms these plants as bee forage but does NOT grade
 * nectar/pollen, so they get the same level as the RHS-confirmed plants ("confirmed, not graded").
 * Some vegetables only flower if left to go to seed (noted on the card).
 */
(function () {
  var LWG = ['coriandru', 'marar', 'patrunjel', 'gutui', 'alun', 'aronia', 'dovlecei', 'dovleac', 'porumb', 'sparanghel', 'ceapa', 'praz', 'broccoli'];
  var SEED_ONLY = ['ceapa', 'praz', 'broccoli', 'patrunjel'];
  window.PLANTS.forEach(function (p) {
    if (LWG.indexOf(p.id) < 0) return;
    p.bee = 2;
    p.src = p.src.concat(['lwg_nutzgarten']);
    if (SEED_ONLY.indexOf(p.id) > -1) p.beeNote = 'Înflorește (și ajută albinele) doar dacă lași câteva plante la sămânță.';
  });
})();
