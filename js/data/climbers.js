// Climbing plants. Every text comes from the sources in `src`.
// Bee value: 2 = confirmed visited by bees in a source, 0 = no source found.
addPlants('climbers', [
  {
    id: 'caprifoi', name: 'Caprifoi', latin: 'Lonicera periclymenum', life: 'Cățărătoare lemnoasă', sun: 'Semiumbră',
    plant: [11, 12, 1, 2], bloom: [6, 7, 8, 9], bee: 2,
    about: 'Înflorește de vara până la începutul toamnei, apoi face bobițe. Nu toate soiurile sunt parfumate.',
    how: 'Soiurile care își pierd frunzele se plantează iarna, evitând solul înghețat sau îmbibat de apă. Semiumbra îi priește cel mai bine; prea multă umbră oprește înflorirea.',
    water: 'Udă regulat în primul an. Apoi udă din belșug pe căldură: zidurile usucă solul.',
    care: 'Soiurile care înfloresc târziu se taie primăvara; cele timpurii, după înflorire. Plantele bătrâne se reîntineresc la sfârșitul iernii.',
    src: ['rhs_honeysuckle', 'rhs_pollinators']
  },
  {
    id: 'iedera', name: 'Iederă', latin: 'Hedera helix', life: 'Cățărătoare veșnic verde', sun: 'Umbră până la soare',
    plant: [3, 4, 9, 10], bloom: [9, 10, 11], bee: 2,
    about: 'Înflorește toamna târziu. Florile hrănesc albinele (inclusiv albina de iederă, care depinde de ea), sirfidele și fluturii. Bobițele negre-albăstrui hrănesc păsările iarna.',
    how: 'Lunile sunt cele obișnuite pentru plantele perene (primăvara sau toamna).',
    water: 'Udă bine la plantare și ține solul umed în primul an.',
    care: 'Doar iedera matură înflorește; tunsă des, nu se mai maturizează. Lasă o porțiune netunsă ca să înflorească.',
    src: ['rhs_ivy', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'clematis', name: 'Clematis (grupa 3)', latin: 'Clematis viticella / C. tangutica', life: 'Cățărătoare', sun: 'Soare',
    plant: [3, 4, 9, 10], bloom: [7, 8, 9], bee: 2,
    about: 'Clematisele din grupa 3 înfloresc la sfârșitul verii, pe lăstarii crescuți în același an.',
    how: 'Lunile sunt cele obișnuite pentru plantele perene (primăvara sau toamna).',
    water: 'Udă bine la plantare și ține solul umed în primul an.',
    care: 'Taie-o la sfârșitul iernii sau începutul primăverii, de obicei în februarie: tulpinile vechi se scurtează până la cea mai de jos pereche de muguri sănătoși, la 15–30 cm de sol. Clematis tangutica poate fi doar rărită și scurtată, ca să-i păstrezi semințele decorative.',
    src: ['rhs_clematis3', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'trandafir-cataratator', name: 'Trandafir cățărător', latin: 'Rosa', life: 'Cățărătoare lemnoasă', sun: 'Soare plin',
    plant: [2, 3, 11], bloom: [6, 7], bee: 2,
    about: 'Trandafirii sunt pe lista RHS de plante pentru polenizatori.',
    how: 'Trandafirii cu rădăcina nudă se plantează toamna târziu, la căderea frunzelor, sau de la sfârșitul iernii la începutul primăverii; cei la ghiveci oricând, dacă solul nu e înghețat sau foarte uscat. Punctul de altoire se pune la nivelul solului, nu sub el.',
    water: 'Udă bine pe secetă cel puțin două veri după plantare.',
    src: ['rhs_roses', 'rhs_pollinators']
  },
  {
    id: 'campsis', name: 'Trompetă (Campsis)', latin: 'Campsis radicans', life: 'Cățărătoare lemnoasă', sun: 'Soare plin',
    plant: [3, 10, 11], bloom: [8, 9, 10], bee: 2,
    about: 'Înflorește de la sfârșitul verii până la primele brume. Are nevoie de adăpost și de un suport de cel puțin 4 m.',
    how: 'Plantează din toamnă până la începutul primăverii, dacă solul nu e înghețat sau îmbibat, la soare plin, în sol bine drenat.',
    water: 'Rezistă destul de bine la secetă. Udă plantele tinere sau din ghiveci pe secetă. Solul rece sau uscat poate face mugurii florali să cadă.',
    care: 'Taie-o la sfârșitul iernii. După ce s-a format, scurtează lăstarii laterali în fiecare an. Lăstarii cu rădăcini de la bază se pot pune separat în ghivece.',
    src: ['rhs_campsis', 'rhs_pollinators']
  },
  {
    id: 'kiwi-mic', name: 'Kiwi', latin: 'Actinidia', life: 'Cățărătoare lemnoasă', sun: 'Soare, loc ferit',
    plant: [3, 4], bloom: [], harvest: [10], bee: 0,
    about: 'Plantele femele au nevoie de o plantă mascul aproape, sau alegi un soi autofertil (de exemplu „Jenny” sau „Issai”). Rodește de obicei după 3–4 ani.',
    how: 'Plantează primăvara, într-un loc cald, însorit și ferit, cu un suport mare și solid (pergolă sau sârme pe zid). Solul trebuie să fie fertil, bine drenat, ușor acid.',
    water: 'Udă regulat plantele tinere. Pe cele mature udă-le pe secetă, cât se măresc fructele.',
    care: 'Protejează lăstarii tineri de înghețul de primăvară. Taie-l la sfârșitul iernii și din nou din iunie.',
    pick: 'Culege fructele încă necoapte, înainte de primul îngheț puternic, și lasă-le să se coacă în casă.',
    src: ['rhs_kiwi']
  }
]);
