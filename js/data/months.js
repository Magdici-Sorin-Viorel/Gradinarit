// General garden tasks per month (Romanian lowlands, orientative). Index 0 = January.
// Each task lists its sources (ids from sources.js). Only tasks backed by a source are included.
window.MONTH_TASKS = [
  // January
  [{ t: 'Alunul înflorește (mâțișori) din ianuarie până în martie; taie-l când mâțișorii eliberează polenul.', src: ['rhs_cobnut'] }],
  // February
  [{ t: 'Tăierea pomilor semințoși (măr, păr, gutui) în zilele fără ger, nu sub -5 °C.', src: ['casa_taieri'] },
   { t: 'Zmeurul de toamnă se taie acum la nivelul solului.', src: ['rhs_raspberry'] },
   { t: 'Clematisele din grupa 3 se taie acum, până la cea mai de jos pereche de muguri sănătoși.', src: ['rhs_clematis3'] },
   { t: 'De la sfârșitul lunii se seamănă morcov, pătrunjel, ceapă, usturoi, mazăre, spanac și salată.', src: ['agrointel_cal'] },
   { t: 'Vița de vie: compost matur sau gunoi bine descompus ca mulci la bază.', src: ['rhs_grapes', 'rhs_organicmatter'] },
   { t: 'Văruirea de primăvară a pomilor: înainte de pornirea mugurilor și de înflorire, pe trunchi uscat.', src: ['zerimar_lime', 'ucipm_whitewash', 'protv_var'] }],
  // March
  [{ t: 'Plantează pomii și arbuștii cu rădăcină nudă cât sunt în repaus.', src: ['dedeman_plant', 'rhs_blackcurrant'] },
   { t: 'Se seamănă morcov, pătrunjel, mărar, ridichi de lună, ceapă, mazăre, spanac și salată; se pun cartofii timpurii.', src: ['agrointel_cal'] },
   { t: 'Taie scurt liliacul de vară (Buddleja) și barba albastră (Caryopteris).', src: ['rhs_buddleja', 'rhs_caryopteris'] },
   { t: 'Perenele cu rădăcină nudă se plantează din martie până la începutul lui mai.', src: ['rhs_perennials'] },
   { t: 'Plantează sparanghelul.', src: ['rhs_asparagus'] }],
  // April
  [{ t: 'Se plantează varza timpurie, conopida și gulia; se seamănă dovleceii, pepenii și porumbul.', src: ['agrointel_cal', 'agrotv_cal'] },
   { t: 'De la sfârșitul lunii se plantează primele răsaduri de roșii și ardei.', src: ['agrotv_cal', 'evz_legume'] },
   { t: 'Plantează levănțica, cimbrul, salvia și rozmarinul, când solul s-a încălzit.', src: ['rhs_lavender', 'rhs_thyme', 'rhs_sage', 'rhs_rosemary'] },
   { t: 'Taie salvia (de bucătărie) ușor, o dată pe an.', src: ['rhs_sage'] }],
  // May
  [{ t: 'În 1–20 mai se plantează roșiile, ardeii și vinetele și se seamănă castraveții, fasolea și porumbul dulce.', src: ['agrointel_cal'] },
   { t: 'Busuiocul se pune afară când nopțile rămân peste 10 °C.', src: ['rhs_basil'] },
   { t: 'La sfârșitul lunii poți scurta la jumătate tulpinile de iarbă-grasă (Sedum).', src: ['rhs_sedum'] },
   { t: 'După udare sau ploaie, mulcește legumele cu 5–7,5 cm de materie organică.', src: ['rhs_vegwater'] }],
  // June
  [{ t: 'Se plantează varza de vară și gulia; se seamănă castraveți, fasole verde și mărar.', src: ['agrointel_cal'] },
   { t: 'La sfârșitul lunii se pun cartofii de toamnă și varza de toamnă.', src: ['agrointel_cal', 'agrotv_cal'] },
   { t: 'Udă cartofii la 10–14 zile, după ce tuberculii au mărimea unei bile.', src: ['rhs_vegwater'] }],
  // July
  [{ t: 'Se seamănă sfeclă roșie, fasole verde și mărar; la sfârșitul lunii ridichi de iarnă și spanac.', src: ['agrointel_cal'] },
   { t: 'După recoltare, taie tulpinile de zmeur de vară care au rodit.', src: ['rhs_raspberry'] },
   { t: 'După înflorire, taie salvia decorativă aproape de sol pentru a doua înflorire.', src: ['rhs_salvia'] }],
  // August
  [{ t: 'Se seamănă spanac și ridichi de iarnă; la sfârșitul lunii salata care iernează.', src: ['agrointel_cal'] },
   { t: 'La sfârșitul verii poți planta căpșuni.', src: ['rhs_strawberry'] },
   { t: 'Tunde levănțica imediat după înflorire, fără să tai în lemnul bătrân.', src: ['rhs_lavender'] }],
  // September
  [{ t: 'Plantează bulbii de primăvară (crocus, muscari), ideal până la sfârșitul lunii.', src: ['rhs_bulbs'] },
   { t: 'Seamănă gălbenele, albăstrele și mac pentru flori mai devreme anul viitor.', src: ['rhs_annual_autumn'] },
   { t: 'Perenele cu rădăcină nudă se pot planta de la sfârșitul lunii până în octombrie.', src: ['rhs_perennials'] }],
  // October
  [{ t: 'Plantează pomii și arbuștii fructiferi cu rădăcină nudă, de la jumătatea lunii.', src: ['dedeman_plant'] },
   { t: 'Plantează ceapa decorativă (Allium).', src: ['rhs_allium'] },
   { t: 'Se seamănă spanac pentru recoltă timpurie primăvara.', src: ['agrointel_cal'] }],
  // November
  [{ t: 'Continuă plantarea pomilor și arbuștilor cât solul nu e înghețat.', src: ['dedeman_plant', 'rhs_raspberry'] },
   { t: 'Se seamănă morcov, pătrunjel, ceapă, usturoi și mazăre pentru recoltă timpurie anul viitor.', src: ['agrointel_cal'] },
   { t: 'Văruirea de toamnă: după căderea frunzelor și înainte de ger, pe trunchi uscat (rețeta naturală e în Livadă).', src: ['zerimar_lime', 'ucipm_whitewash', 'playtech_var'] }],
  // December
  [{ t: 'Coacăzul negru se taie în fiecare iarnă.', src: ['rhs_blackcurrant'] },
   { t: 'Moșmonul se taie iarna, cât e în repaus.', src: ['rhs_medlar'] }]
];
