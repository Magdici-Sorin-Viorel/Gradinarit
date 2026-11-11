// Fruit trees (Romania). Checked against the sources listed in each entry's `src`.
// Planting months: bare-root trees are planted while dormant – mid-October to November and March to April (Dedeman, RHS).
// Container trees can be planted at other times, avoiding hot, dry weather (RHS).
var PLANT_DORMANT = 'Plantează pomul cât e în repaus, fără frunze: de la jumătatea lui octombrie până în noiembrie (sau începutul lui decembrie, dacă nu a înghețat), ori din martie până la sfârșitul lui aprilie. Pune-l la aceeași adâncime la care a stat în pepinieră, cu punctul de altoire la 2–3 cm deasupra solului tasat.';
var WATER_NEW = 'Udă abundent imediat după plantare. Dacă toamna e secetoasă, repetă udarea; în rest, iarna nu mai e nevoie. Vara udă pe secetă – o udare bună înseamnă cel puțin 20–30 l pe metrul pătrat.';

addPlants('trees', [
  {
    id: 'mar', name: 'Măr', latin: 'Malus domestica', life: 'Pom', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [4, 5], harvest: [7, 8, 9, 10], bee: 2,
    about: 'Pomul de bază al livezii. Mărul este pe lista RHS de plante pentru polenizatori.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Tăierea de iarnă se face la sfârșitul iernii, cu cât mai puține tăieri. Mărul altoit pe portaltoi slab (M9) are nevoie de arac toată viața; cel pe portaltoi viguros, în general, nu.',
    pick: 'Soiurile de vară se culeg din iulie, cele de toamnă și iarnă în septembrie–octombrie (depinde de soi).',
    src: ['dedeman_plant', 'fibl_pomi', 'casa_taieri', 'rhs_pollinators']
  },
  {
    id: 'par', name: 'Păr', latin: 'Pyrus communis', life: 'Pom', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [4], harvest: [7, 8, 9, 10], bee: 2,
    about: 'Pom de livadă tradițional, pe lista RHS de plante pentru polenizatori.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Se taie ca mărul, la sfârșitul iernii. Dacă apare focul bacterian (ramuri care arată ca arse), nu mai face tăieri în timpul verii.',
    pick: 'Din iulie (soiurile de vară) până în octombrie (cele de iarnă), după soi.',
    src: ['dedeman_plant', 'fibl_pomi', 'rhs_pollinators']
  },
  {
    id: 'gutui', name: 'Gutui', latin: 'Cydonia oblonga', life: 'Pom', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [5], harvest: [10], bee: 0,
    about: 'Pom tradițional în grădinile din România; gutuiul este și portaltoi pentru păr și moșmon.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Tăieri ușoare la sfârșitul iernii.',
    pick: 'În octombrie, când fructele se îngălbenesc.',
    src: ['dedeman_plant', 'blockhill_compat']
  },
  {
    id: 'cires', name: 'Cireș', latin: 'Prunus avium', life: 'Pom', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [4], harvest: [5, 6], bee: 2,
    about: 'Cireșul (genul Prunus) este pe lista RHS de plante pentru polenizatori.',
    how: PLANT_DORMANT + ' Cireșul se plantează cât e în repaus, din noiembrie până în martie.',
    water: WATER_NEW,
    care: 'Se taie o dată pe an, imediat după recoltare (iulie–august), pe vreme uscată: așa scade riscul de boli care intră prin răni. Pomii tineri primesc doar tăieri de formare la început de primăvară.',
    pick: 'Culege doar cireșele complet coapte (nu se mai coc după cules), ținându-le de codiță.',
    src: ['rhs_cherry', 'dedeman_plant', 'rhs_pollinators']
  },
  {
    id: 'visin', name: 'Vișin', latin: 'Prunus cerasus', life: 'Pom', sun: 'Soare',
    plant: [3, 4, 10, 11], bloom: [4], harvest: [6, 7], bee: 2,
    about: 'Pom mai mic decât cireșul; rodește mai ales pe lăstarii crescuți anul trecut.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Se taie după recoltare, vara, ca cireșul. Tăierea înlocuiește ramurile bătrâne cu lăstari tineri, pe care vin fructele.',
    pick: 'Când vișinele sunt complet coapte.',
    src: ['rhs_cherry', 'dedeman_plant', 'rhs_pollinators']
  },
  {
    id: 'cais', name: 'Cais', latin: 'Prunus armeniaca', life: 'Pom', sun: 'Soare plin, loc ferit',
    plant: [3, 4, 10, 11], bloom: [3, 4], harvest: [6, 7, 8], bee: 2,
    about: 'Înflorește devreme, deci florile pot fi prinse de înghețurile de primăvară – evită locurile joase, unde se strânge frigul.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Se taie doar primăvara sau vara, niciodată iarna (riscul de boli care intră prin răni). Dacă se anunță îngheț în timpul înfloririi, acoperă pomul peste noapte cu o pânză sau agrotextil și descoperă-l ziua, ca să poată ajunge albinele la flori.',
    pick: 'Caisele coapte sunt moi, colorate și se desprind ușor; se păstrează doar câteva zile.',
    src: ['rhs_apricot', 'dedeman_plant', 'rhs_pollinators']
  },
  {
    id: 'piersic', name: 'Piersic și nectarin', latin: 'Prunus persica', life: 'Pom', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [3, 4], harvest: [7, 8, 9], bee: 2,
    about: 'Rodește mai ales pe lăstarii crescuți anul trecut, așa că are nevoie de tăiere în fiecare an.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Se taie doar primăvara sau vara, pe vreme uscată. Pomii liberi (nu pe spalier) se taie vara, după recoltare.',
    pick: 'Când fructul e complet colorat și pulpa de lângă codiță cedează la apăsare.',
    src: ['rhs_peach', 'dedeman_plant', 'rhs_pollinators']
  },
  {
    id: 'prun', name: 'Prun', latin: 'Prunus domestica', life: 'Pom', sun: 'Soare',
    plant: [3, 4, 10, 11], bloom: [4], harvest: [7, 8, 9], bee: 2,
    about: 'Pom tradițional în satele din România; se altoiește de obicei pe corcoduș.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Nu tăia prunul iarna (crește riscul bolii „frunza argintie”). Pomii tineri se taie la început de primăvară, cei maturi la mijlocul verii.',
    pick: 'Din iulie până în septembrie, după soi.',
    src: ['rhs_plum_prune', 'dedeman_plant', 'bzi_altoire', 'rhs_pollinators']
  },
  {
    id: 'corcodus', name: 'Corcoduș', latin: 'Prunus cerasifera', life: 'Pom', sun: 'Soare',
    plant: [3, 4, 10, 11], bloom: [3], harvest: [7, 8], bee: 2,
    about: 'Pom foarte viguros, care suportă multe tipuri de sol; este principalul portaltoi pentru prun.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Este un prun, așa că se taie ca prunul: nu iarna, ci la început de primăvară sau vara.',
    pick: 'Pentru gem și compot, vara.',
    src: ['bzi_altoire', 'promesse_rootstock', 'rhs_plum_prune', 'rhs_pollinators']
  },
  {
    id: 'mosmon', name: 'Moșmon', latin: 'Mespilus germanica', life: 'Pom mic', sun: 'Soare sau semiumbră',
    plant: [3, 4, 10, 11], bloom: [5], harvest: [10, 11], bee: 2,
    about: 'Pom vechi de grădină, autofertil: un singur pom e suficient pentru rod. Fructele se mănâncă abia după ce se înmoaie.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Se taie iarna, cât e în repaus. Pomul matur are nevoie doar de tăieri ușoare: ramuri uscate, rupte sau prea dese.',
    pick: 'Culege la sfârșitul lui octombrie–noiembrie, după brumă. Fructele sunt tari și amare: lasă-le 2–3 săptămâni într-un loc răcoros și întunecos până se înmoaie și se înnegresc.',
    src: ['rhs_medlar', 'dedeman_plant', 'rhs_pollinators']
  },
  {
    id: 'smochin', name: 'Smochin', latin: 'Ficus carica', life: 'Pom mic / arbust', sun: 'Soare plin, loc adăpostit',
    plant: [4, 5], bloom: [], harvest: [8, 9], bee: 0,
    about: 'Are nevoie de cel mai cald și ferit loc din grădină, ideal lângă un zid însorit (sud sau sud-vest). Florile sunt ascunse în fruct, deci nu e plantă meliferă.',
    how: 'Plantează primăvara, ca să aibă un sezon întreg să se prindă. Rădăcinile restrânse îl fac să rodească mai bine: în pământ, căptușește o groapă de 60 cm cu dale puse vertical; în ghiveci, folosește un vas de cam 30 cm.',
    water: 'Ține pământul uniform umed în sezonul de creștere. Pe căldură mare, verifică zilnic smochinii plantați de curând sau cei din ghiveci. Nu lăsa apa să stagneze, mai ales iarna.',
    care: 'Iarna, unde e frig, învelește-l cu paie și apoi cu agrotextil după căderea frunzelor. Smochinul din ghiveci îl muți într-o încăpere neîncălzită până trec înghețurile. Seva irită pielea – lucrează cu mănuși.',
    pick: 'Când fructele sunt moi și atârnă pe codiță.',
    src: ['rhs_fig', 'casa_taieri']
  },
  {
    id: 'nuc', name: 'Nuc', latin: 'Juglans regia', life: 'Pom mare', sun: 'Soare',
    plant: [3, 4, 10, 11], bloom: [4, 5], harvest: [9, 10], bee: 0,
    about: 'Devine un pom foarte mare: alege de la început locul definitiv.',
    how: PLANT_DORMANT,
    water: WATER_NEW,
    care: 'Nu-l tăia iarna sau primăvara: „plânge” (curge seva). Taie-l doar la mijlocul verii.',
    pick: 'Toamna, când nucile cad.',
    src: ['rhs_bleeding', 'dedeman_plant']
  }
]);
