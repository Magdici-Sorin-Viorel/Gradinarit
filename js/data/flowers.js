// Ornamental flowers. Every text comes from the sources in `src`.
// All entries are on the RHS Plants for Pollinators list (bee value 2 = confirmed).
// Months translate the seasons in the sources to the lowlands of Romania (reference: average last frost 26 March in the western plain – see rjas_frost).
var BULB_HOW = 'Bulbii care înfloresc primăvara se plantează toamna, ideal până la sfârșitul lui septembrie, la o adâncime de 2–3 ori înălțimea bulbului (în ghiveci, de 3 ori).';
var PERENNIAL_WATER = 'Udă bine după plantare, chiar dacă solul e umed. Apoi ține solul umed, dar nu ud, mai ales în primul an, udând sub frunze.';

addPlants('flowers', [
  {
    id: 'ghiocel', name: 'Ghiocel', latin: 'Galanthus nivalis', life: 'Bulb peren', sun: 'Semiumbră',
    plant: [3, 9], bloom: [2, 3], bee: 2,
    about: 'Se plantează cel mai sigur „în verde”, adică după înflorire, cât încă are frunze.',
    how: 'Plantează, mută sau împarte ghioceii „în verde”, după înflorire, cât au frunze. Bulbii uscați se pot planta toamna, dar se prind mai greu.',
    water: 'În ghiveci, redu udarea când frunzele încep să se usuce.',
    src: ['rhs_bulbs', 'rhs_pollinators']
  },
  {
    id: 'brandusa', name: 'Brândușă de primăvară (Crocus)', latin: 'Crocus', life: 'Bulb peren', sun: 'Soare sau semiumbră',
    plant: [9, 10], bloom: [2, 3], bee: 2,
    about: 'Una dintre primele flori de primăvară vizitate de albine.',
    how: BULB_HOW,
    water: 'În ghiveci, redu udarea când frunzele încep să se usuce.',
    care: 'În ghiveci dă un îngrășământ lichid bogat în potasiu, de preferat organic (de ex. macerat de tătăneasă diluat 1:20) la 7–10 zile, de când apar lăstarii până se usucă frunzele.',
    src: ['rhs_bulbs', 'rhs_pollinators']
  },
  {
    id: 'muscari', name: 'Muscari (Zambiluță)', latin: 'Muscari', life: 'Bulb peren', sun: 'Soare sau semiumbră',
    plant: [9, 10], bloom: [3, 4], bee: 2,
    about: 'Bulb de primăvară, pe lista RHS de plante pentru polenizatori.',
    how: BULB_HOW,
    water: 'În ghiveci, redu udarea când frunzele încep să se usuce.',
    src: ['rhs_bulbs', 'rhs_pollinators']
  },
  {
    id: 'allium', name: 'Ceapă decorativă (Allium)', latin: 'Allium', life: 'Bulb peren', sun: 'Soare plin',
    plant: [9, 10], bloom: [5, 6], bee: 2,
    about: 'Majoritatea înfloresc în mai–iunie; unele în iulie–august. Frunzele se usucă până la înflorire: ascunde-le cu alte plante în față.',
    how: 'Plantează la începutul–mijlocul toamnei, la o adâncime de cam 4 ori diametrul bulbului, în loc însorit, ferit și bine drenat. Evită locurile reci, expuse sau care băltesc.',
    water: 'Nu suportă solul care băltește.',
    src: ['rhs_allium', 'rhs_pollinators']
  },
  {
    id: 'elebor', name: 'Spânz decorativ (Elebor)', latin: 'Helleborus', life: 'Perenă', sun: 'Semiumbră',
    plant: [3, 4, 9, 10, 11], bloom: [2, 3, 4], bee: 2,
    about: 'Înflorește de la sfârșitul iernii până primăvara și dă nectar devreme bondarilor.',
    how: 'Plantează din toamnă până primăvara, la semiumbră, în sol umed dar bine drenat.',
    water: 'Udă plantele noi în primul sezon; pe cele prinse, pe căldură și secetă.',
    care: 'La hibrizii orientali taie frunzele vechi la sfârșitul iernii sau începutul primăverii; la celelalte tipuri, la sfârșitul primăverii.',
    src: ['rhs_hellebore', 'rhs_pollinators']
  },
  {
    id: 'facelia', name: 'Facelia', latin: 'Phacelia tanacetifolia', life: 'Anuală', sun: 'Soare plin',
    plant: [3, 4, 5, 6, 7, 8, 9], bloom: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Înflorește la 6–8 săptămâni după semănat. Se folosește și ca îngrășământ verde.',
    how: 'Seamănă direct din martie până în septembrie, la soare plin, în sol bine pregătit. Pentru flori, seamănă la 10 cm și rărește la 30 cm. Ca îngrășământ verde: 1 g de semințe pe metru pătrat, apoi încorporezi plantele în sol înainte să înflorească.',
    water: 'Udă doar pe secetă.',
    care: 'Lasă câteva flori pentru albine și scoate-le pe celelalte, ca să nu se autoînsămânțeze.',
    src: ['gw_phacelia', 'rhs_pollinators']
  },
  {
    id: 'floarea-soarelui', name: 'Floarea-soarelui', latin: 'Helianthus annuus', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], bloom: [7, 8, 9], harvest: [9], bee: 2,
    about: 'Majoritatea soiurilor înfloresc din iulie până în septembrie. Capitulele uscate hrănesc păsările.',
    how: 'Seamănă direct în aprilie–mai, când solul începe să se încălzească, sau câte o sămânță în ghivece de 10 cm, la 1,5 cm adâncime, apoi le muți afară după ce trece riscul de îngheț.',
    water: 'Ține plantele bine udate; nu le lăsa să se usuce.',
    care: 'Susține soiurile înalte cu un arac.',
    src: ['gw_sunflower', 'rhs_annual_spring', 'rhs_pollinators']
  },
  {
    id: 'cosmos', name: 'Cosmos (Ochiul boului)', latin: 'Cosmos bipinnatus', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], bloom: [6, 7, 8, 9], bee: 2,
    about: 'Înflorește din vară până în septembrie și e iubit de polenizatori.',
    how: 'Seamănă primăvara direct afară sau în ghivece. Plantele se mută afară de la sfârșitul lui aprilie până la începutul lui iunie, după ce a trecut înghețul.',
    water: 'Udă plantele tinere regulat în primele luni, apoi mai ales pe secetă și căldură.',
    care: 'Nu-l îngrășa cu azot și nu-l pune în sol prea bogat: face mai puține flori. Ciupește vârfurile când are 2–3 perechi de frunze și rupe florile trecute.',
    src: ['gw_cosmos', 'rhs_annuals', 'rhs_pollinators']
  },
  {
    id: 'zinnia', name: 'Cârciumăreasă (Zinnia)', latin: 'Zinnia elegans', life: 'Anuală', sun: 'Soare plin',
    plant: [5, 6], bloom: [7, 8, 9], bee: 2,
    about: 'Înflorește din vară până la începutul toamnei. Soiurile cu flori simple atrag polenizatorii.',
    how: 'Mută plantele afară după ce a trecut pericolul de îngheț, la 30–40 cm, în grupuri.',
    water: 'Udă bine pe căldură și secetă, fără să uzi frunzele (contra bolilor).',
    care: 'Rupe florile trecute ca să înflorească mai mult.',
    src: ['rhs_zinnia', 'rhs_pollinators']
  },
  {
    id: 'galbenele', name: 'Gălbenele', latin: 'Calendula officinalis', life: 'Anuală', sun: 'Soare plin',
    plant: [3, 4, 5, 9, 10], bloom: [5, 6, 7, 8, 9], bee: 2,
    about: 'Semănate toamna, înfloresc mai devreme decât cele semănate primăvara.',
    how: 'Seamănă direct în septembrie–octombrie, când solul e umed, sau din sfârșitul lui martie până în mai, pe rânduri sau prin împrăștiere.',
    water: 'Ține solul umed până răsar. Apoi udă la 10–14 zile pe secetă.',
    care: 'Dacă se anunță ger puternic, acoperă plantele tinere cu agrotextil. Rărește plantele autoînsămânțate.',
    src: ['rhs_annual_autumn', 'rhs_annual_spring', 'rhs_pollinators']
  },
  {
    id: 'albastrele', name: 'Albăstrele', latin: 'Centaurea cyanus', life: 'Anuală', sun: 'Soare plin',
    plant: [3, 4, 5, 9, 10], bloom: [5, 6, 7], bee: 2,
    about: 'Semănate toamna, înfloresc mai devreme decât cele semănate primăvara.',
    how: 'Seamănă direct în septembrie–octombrie, când solul e umed, sau din sfârșitul lui martie până în mai.',
    water: 'Ține solul umed până răsar. Apoi udă la 10–14 zile pe secetă.',
    care: 'Dacă se anunță ger puternic, acoperă plantele tinere cu agrotextil.',
    src: ['rhs_annual_autumn', 'rhs_annual_spring', 'rhs_pollinators']
  },
  {
    id: 'gura-leului', name: 'Gura-leului', latin: 'Antirrhinum majus', life: 'Anuală', sun: 'Soare',
    plant: [4, 5], bloom: [6, 7, 8, 9, 10], bee: 2,
    about: 'Înflorește din iunie până în octombrie și atrage bondarii.',
    how: 'Seamănă toamna sau primăvara devreme. Mută plantele afară după ce trece riscul de îngheț, după două săptămâni de obișnuire cu afară, la 30 cm, în grupuri de 3 sau 5.',
    water: 'Udă bine până se prind și mai mult pe secetă și în ghiveci.',
    care: 'Rupe des florile trecute.',
    src: ['gw_snapdragon', 'rhs_pollinators']
  },
  {
    id: 'mac', name: 'Mac de câmp', latin: 'Papaver rhoeas', life: 'Anuală', sun: 'Soare plin',
    plant: [9, 10], bloom: [5, 6, 7], bee: 2,
    about: 'Înflorește vara; insectele vizitează florile.',
    how: 'Seamănă direct unde vrei să înflorească, la începutul lui octombrie (semănatul de toamnă e recomandat și în septembrie), pe o zi uscată: un rând puțin adânc, semințele la un deget una de alta, acoperite ușor.',
    water: 'Udă ușor, cu stropitoare cu sită.',
    src: ['rhs_poppy', 'rhs_annual_autumn', 'rhs_pollinators']
  },
  {
    id: 'echinacea', name: 'Echinacea (Rudbeckia purpurie)', latin: 'Echinacea purpurea', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5, 6], bloom: [7, 8, 9], bee: 2,
    about: 'Înflorește la sfârșitul verii; florile atrag albinele și fluturii. Suportă solul uscat.',
    how: 'Plantează primăvara sau vara, la soare plin, în sol care se scurge ușor. Plantată toamna, putrezește mai ușor iarna, mai ales în sol ud sau greu.',
    water: PERENNIAL_WATER,
    src: ['rhs_echinacea', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'rudbeckia', name: 'Rudbeckia', latin: 'Rudbeckia fulgida', life: 'Perenă', sun: 'Soare',
    plant: [3, 4, 5], bloom: [8, 9, 10], bee: 2,
    about: 'Înflorește de la sfârșitul verii până toamna. Soiurile cu flori simple sunt bune pentru polenizatori.',
    how: 'Plantează primăvara (martie–începutul lui mai), cât solul e umed, în sol fertil care reține apa. Mulcește cu materie organică după plantare și în fiecare primăvară.',
    water: 'Udă din belșug, dar rar, mai ales pe secetă. Evită solul îmbibat.',
    care: 'Împarte tufele o dată la 3–5 ani, la începutul primăverii (martie–aprilie).',
    src: ['rhs_rudbeckia', 'rhs_pollinators']
  },
  {
    id: 'sedum', name: 'Iarbă-grasă înaltă (Sedum)', latin: 'Hylotelephium', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 9, 10], bloom: [8, 9, 10], bee: 2,
    about: 'Florile de la sfârșitul verii și din toamnă atrag albinele, sirfidele și fluturii.',
    how: 'Plantează toamna, cât solul e cald, sau primăvara, în sol fertil și bine drenat.',
    water: 'Udă plantele noi câteva luni. Cele prinse au nevoie de apă doar pe secete lungi.',
    care: 'La sfârșitul lui mai poți scurta tulpinile noi la jumătate, ca plantele să rămână compacte. Lasă inflorescențele uscate peste iarnă și taie-le primăvara.',
    src: ['rhs_sedum', 'rhs_pollinators']
  },
  {
    id: 'aster-toamna', name: 'Aster de toamnă (Tufănică de toamnă)', latin: 'Symphyotrichum', life: 'Perenă', sun: 'Soare',
    plant: [3, 4, 5], bloom: [8, 9, 10], bee: 2,
    about: 'Majoritatea înfloresc vara și toamna. Soiurile cu flori simple sunt bune pentru polenizatori.',
    how: 'Plantează la începutul primăverii (martie–mai), sau oricând dacă solul nu e înghețat sau îmbibat. Majoritatea preferă solul care reține umezeala.',
    water: 'Udă din belșug, dar rar; în ghiveci mai des.',
    care: 'Asterii de tip New York pot face făinare. Împarte tufele o dată la 3–5 ani.',
    src: ['rhs_aster', 'rhs_pollinators']
  },
  {
    id: 'salvia-nemorosa', name: 'Salvie decorativă', latin: 'Salvia nemorosa', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5, 9, 10], bloom: [6, 7, 8, 9], bee: 2,
    about: 'Dacă o tai după prima înflorire, înflorește din nou.',
    how: 'Plantează primăvara (mijlocul lui aprilie–mai) sau toamna, într-un loc însorit, ferit, cu sol bine drenat. Nu-i place solul greu, argilos.',
    water: 'Udă bine, dar lasă plantele prinse să se usuce între udări.',
    care: 'După iulie, când se trec florile, taie aproape de sol pentru a doua înflorire. Taie din nou toamna sau, în locuri reci, primăvara.',
    src: ['rhs_salvia', 'rhs_pollinators']
  },
  {
    id: 'verbena', name: 'Verbena bonariensis', latin: 'Verbena bonariensis', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5], bloom: [6, 7, 8, 9, 10], bee: 2,
    about: 'Înflorește de la începutul verii până la îngheț și atrage albinele, fluturii și sirfidele. Se autoînsămânțează ușor.',
    how: 'Plantează primăvara, după ce solul s-a încălzit, la soare plin, în sol bine drenat.',
    water: PERENNIAL_WATER,
    care: 'Iernile reci și ude o pot omorî: toamna mulcește cu paie uscate. Taie tulpinile primăvara, înainte de creșterea nouă; lasă semințele peste iarnă pentru păsări.',
    src: ['rhs_verbena', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'echinops', name: 'Ciulin decorativ (Echinops)', latin: 'Echinops', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 5], bloom: [7, 8], bee: 2,
    about: 'Înflorește la sfârșitul verii și atrage albinele.',
    how: 'Plantează sau seamănă primăvara, la soare plin, în sol care se scurge ușor; adaugă pietriș în groapă.',
    water: PERENNIAL_WATER,
    care: 'Taie-l după înflorire; poate înflori din nou. Tufele prea dese se împart toamna sau primăvara.',
    src: ['gw_echinops', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'gaillardia', name: 'Gaillardia', latin: 'Gaillardia × grandiflora', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 5], bloom: [6, 7, 8, 9, 10], bee: 2,
    about: 'Înflorește din vară până toamna. Soiurile cu flori simple atrag polenizatorii. Iernile ude îi pot scurta viața.',
    how: 'Plantează primăvara, la 30–60 cm, în sol însorit, drenat, sărac, fără îngrășăminte sau materie organică. Pe argilă folosește strat înălțat, mușuroi sau pietriș.',
    water: 'Udă până se prinde; apoi rezistă la secetă.',
    care: 'Rupe florile trecute ca să înflorească mai mult timp. După înflorire taie tulpinile la sol.',
    src: ['gw_gaillardia', 'rhs_pollinators']
  },
  // Clovers: nitrogen-fixing legumes, both on the RHS Plants for Pollinators list.
  {
    id: 'trifoi-alb', name: 'Trifoi alb', latin: 'Trifolium repens', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 5, 6, 7, 8], bloom: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Leguminoasă care fixează azotul din aer în sol. Florile dau nectar prețios pentru albine. Rămâne verde fără îngrășăminte și se întinde singur, așa că se poate folosi și în gazon (microtrifoi).',
    how: 'Seamănă de la începutul primăverii până la sfârșitul verii, la soare plin. Merge în sol argilos, lutos, nisipos sau calcaros, acid, neutru sau alcalin, umed dar bine drenat.',
    water: 'Ține solul umed 7–10 zile după semănat, până răsare. După ce se prinde rămâne de obicei verde fără udare, dar suferă la căldură mare și secetă prelungită.',
    care: 'Nu-i place umbra. Iarna partea de deasupra se usucă și pornește din nou primăvara. Se întinde: dacă nu-l vrei în straturi, ține-l doar în gazon.',
    src: ['rhsdb_trifoi_alb', 'illinois_clover', 'rhs_cloverlawn', 'rhs_pollinators']
  },
  {
    id: 'trifoi-rosu', name: 'Trifoi roșu', latin: 'Trifolium pratense', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 5, 6, 7, 8], bloom: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Leguminoasă folosită ca îngrășământ verde: fixează azotul din aer (doar vara) și e bun mai ales pentru solurile lutoase. Florile sunt vizitate de polenizatori.',
    how: 'Seamănă din martie până în august, la soare plin, în sol argilos, lutos sau nisipos, acid sau neutru. Ca îngrășământ verde îl lași să crească 2–3 luni sau 1–2 ani.',
    care: 'Când îl folosești ca îngrășământ verde, îl încorporezi în stratul de sus al solului (25 cm) și aștepți o lună înainte să semeni sau să plantezi acolo.',
    src: ['rhsdb_trifoi_rosu', 'rhs_greenmanure', 'rhs_pollinators']
  },
  // Classic spring bulbs. Not bee plants (not on the RHS pollinator list), kept as ornamental flowers.
  {
    id: 'lalele', name: 'Lalele', latin: 'Tulipa', life: 'Bulb peren', sun: 'Soare',
    plant: [9, 10, 11], bloom: [4, 5], bee: 0,
    about: 'Floare de primăvară clasică. Nu e plantă meliferă, dar o ținem ca floare decorativă.',
    how: 'Plantează bulbii toamna, cu vârful în sus, la o adâncime de 2–3 ori înălțimea bulbului și la cel puțin de două ori lățimea lui unul de altul. Le place soarele și solul neutru spre alcalin, care să nu bălteasă.',
    water: 'În straturi udă doar în secete lungi (peste 2–3 săptămâni fără ploaie), ca solul să fie umed, nu ud. În ghiveci udă când se usucă.',
    care: 'Din martie, de când pornesc, dă săptămânal un îngrășământ lichid bogat în potasiu, de preferat organic (de ex. macerat de tătăneasă diluat 1:20), până încep să se îngălbenească frunzele. După înflorire rupe capsula cu semințe, tăind tija chiar deasupra frunzelor. Vara scoate tulpinile și frunzele când se fac ca paiul.\nPoți scoate bulbii când se îngălbenesc frunzele, cam la 6 săptămâni după înflorire: îi usuci, îi păstrezi la 18–20 °C și îi plantezi din nou toamna (nu e sigur că reînfloresc la fel).\nProbleme: „focul lalelelor” (pete maronii, petale și frunze deformate), melcii primăvara, rozătoarele care scot bulbii (ajută plasa de sârmă). Dacă bulbii putrezesc (sclerotinia), scoate plantele bolnave și nu mai pune lalele pe acel loc 5 ani.',
    src: ['rhs_tulip', 'rhs_homefeed']
  },
  {
    id: 'narcise', name: 'Narcise', latin: 'Narcissus', life: 'Bulb peren', sun: 'Soare',
    plant: [9, 10], bloom: [3, 4], bee: 0,
    about: 'Floare de primăvară clasică, rămâne mulți ani pe loc. Nu e plantă meliferă, dar o ținem ca floare decorativă.',
    how: 'Plantează bulbii în septembrie (cel târziu octombrie; mai devreme e mai bine), la o adâncime de 3 ori înălțimea bulbului. Dacă îi pui prea sus, narcisele pot rămâne fără flori în anii următori. Le place solul fertil, bine drenat, și soarele; nu le plac solul care băltește, seceta mare și umbra deasă.',
    water: 'Nu le lăsa nici în apă, nici în secetă mare. Udă până se usucă frunzele de la sine.',
    care: 'De când apar lăstarii până încep să se usuce frunzele, dă un îngrășământ lichid bogat în potasiu, de preferat organic (de ex. macerat de tătăneasă diluat 1:20). Nu tăia frunzele până nu se usucă singure (cam 6 săptămâni după înflorire) și nu le lega sau înnoda, altfel nu mai înfloresc la anul.\nProbleme: putregaiul bazei bulbului și musca narciselor. Frunzele cu pete galbene marmorate arată un virus care nu se tratează: aruncă bulbii.',
    src: ['rhs_daffodil', 'rhs_bulbs_guide', 'rhs_homefeed']
  },
  {
    id: 'zambile', name: 'Zambile', latin: 'Hyacinthus orientalis', life: 'Bulb peren', sun: 'Soare',
    plant: [9, 10], bloom: [3, 4], bee: 0,
    about: 'Floare de primăvară foarte parfumată. Nu e plantă meliferă, dar o ținem ca floare decorativă. Bulbii irită pielea – lucrează cu mănuși.',
    how: 'Plantează bulbii afară la începutul toamnei, cu vârful în sus, la 10 cm adâncime și la cel puțin 7,5 cm unul de altul. Ca să rămână mai mulți ani, le trebuie sol bine drenat, moderat fertil, și soare plin.',
    water: 'Ține bulbii umezi cât cresc și înfloresc; redu apa când frunzele încep să se usuce singure. În ghiveci fără găuri nu uda prea mult, putrezesc.',
    care: 'Când se trec florile, taie tija florii de la bază. Udă și hrănește până se îngălbenesc frunzele (în ghiveci: un îngrășământ lichid bogat în potasiu, de preferat organic (de ex. macerat de tătăneasă diluat 1:20), din primăvară până la 6 săptămâni după înflorire).\nDupă ce se usucă frunzele, poți scoate bulbii, îi cureți și îi păstrezi la loc răcoros și uscat până toamna. În sol bine drenat pot rămâne pe loc și înfloresc și la anul.\nAtenție: bulbii irită pielea și nu se mănâncă; țin-o departe de animale.',
    src: ['rhs_hyacinth', 'rhsdb_zambile', 'rhs_homefeed']
  }
]);
