// Fruit shrubs and small fruits, plus a few ornamental bee shrubs. Every text comes from the sources in `src`.
// Bee value: 2 = confirmed visited by bees in a source, 0 = no source found.
addPlants('shrubs', [
  {
    id: 'coacaz-negru', name: 'Coacăz negru', latin: 'Ribes nigrum', life: 'Arbust', sun: 'Soare',
    plant: [3, 10, 11], bloom: [4], harvest: [7], bee: 2,
    about: 'Arbust fructifer care se taie în fiecare iarnă.',
    how: 'Plantează cât e în repaus, de la sfârșitul lui octombrie până în martie, cu cam 5 cm mai adânc decât era înainte. Distanța este de 1,5–1,8 m. Cei din ghiveci se pot planta tot anul, cu udare în plus pe secetă.',
    water: 'Udă plantele noi pe secetă în primii doi ani. Tufele prinse în pământ nu au nevoie de udare regulată.',
    care: 'Taie-l în fiecare iarnă. Tufele noi se taie scurt după plantare. La tufele de peste 4 ani, scoate de la bază până la o treime din tulpinile cele mai bătrâne.',
    pick: 'De pe la mijlocul verii, în funcție de soi.',
    src: ['rhs_blackcurrant', 'rhs_pollinators']
  },
  {
    id: 'coacaz-rosu', name: 'Coacăz roșu', latin: 'Ribes rubrum', life: 'Arbust', sun: 'Soare sau semiumbră',
    plant: [3, 11], bloom: [4], harvest: [7, 8], bee: 2,
    about: 'Ciorchini roșii pentru gem și suc.',
    how: 'Plantează din noiembrie până în martie, cât e în repaus. Tufele se pun la 1,2–1,5 m distanță.',
    water: 'Udă regulat pe secetă în primii doi ani. Tufele prinse rareori au nevoie de apă.',
    care: 'Tufele se taie la sfârșitul iernii sau la începutul primăverii.',
    pick: 'Din iulie până la sfârșitul lui august; taie ciorchinii întregi.',
    src: ['rhs_redcurrant', 'rhs_pollinators']
  },
  {
    id: 'agris', name: 'Agriș', latin: 'Ribes uva-crispa', life: 'Arbust', sun: 'Soare sau semiumbră',
    plant: [3, 10, 11], bloom: [4], harvest: [6, 7, 8], bee: 2,
    about: 'Făinarea este cea mai gravă boală a agrișului.',
    how: 'Tufele cu rădăcina nudă se plantează de la sfârșitul toamnei până la începutul primăverii. Cele la ghiveci se pot planta oricând, dacă solul nu e îmbibat, uscat sau înghețat. Distanța este de 1,2–1,5 m.',
    water: 'Udă plantele noi pe secetă timp de doi ani.',
    care: 'Taie-l de două ori pe an, vara și iarna, ca tufa să aibă mijlocul deschis. Contra făinării alege soiuri rezistente și nu exagera cu azotul.',
    pick: 'În iunie poți culege fructe verzi pentru gătit, câte una din două. Restul se coc în iulie–august.',
    src: ['rhs_gooseberry', 'rhs_pollinators']
  },
  {
    id: 'zmeur', name: 'Zmeur', latin: 'Rubus idaeus', life: 'Arbust', sun: 'Soare',
    plant: [3, 11, 12], bloom: [6, 7], harvest: [6, 7, 8, 9, 10], bee: 2,
    about: 'Există soiuri de vară și soiuri de toamnă (remontante), care se taie diferit.',
    how: 'Plantează din noiembrie până în martie, cât solul nu e înghețat. Distanța este de 40–60 cm între plante și 1,5–2 m între rânduri. Soiurile de vară au nevoie de stâlpi de cam 1,8 m cu trei sârme la 60 cm una de alta; cele de toamnă, de stâlpi de cam 60 cm.',
    water: 'Udă bine după plantare și pe secetă în primul sezon. Plantele prinse au nevoie de puțină apă în plus.',
    care: 'Soiuri de vară: după recoltare taie tulpinile care au rodit la nivelul solului și leagă 6–8 tulpini noi la 10 cm una de alta. Soiuri de toamnă: în februarie taie toate tulpinile la sol.',
    pick: 'Soiurile de vară rodesc din iunie până în septembrie, cele de toamnă din august până în octombrie.',
    src: ['rhs_raspberry', 'rhs_pollinators']
  },
  {
    id: 'mur', name: 'Mur de cultură', latin: 'Rubus fruticosus agg.', life: 'Arbust semicățărător', sun: 'Soare',
    plant: [3, 10, 11], bloom: [6, 7], harvest: [7, 8, 9], bee: 2,
    about: 'Are nevoie de sârme de susținere.',
    how: 'Plantează de la mijlocul toamnei până la începutul primăverii. Cei la ghiveci se pot pune tot anul, evitând perioadele calde și secetoase. Distanța este de 2,5–3,5 m (până la 4 m la soiurile foarte viguroase). Montează înainte sârme orizontale la cam 45 cm una de alta, cea de jos la 45 cm de sol.',
    water: 'Udă bine după plantare și pe secetă în primul sezon. Plantele prinse rareori au nevoie de apă.',
    care: 'După recoltare taie de la bază tulpinile care au rodit, ca să faci loc celor noi.',
    pick: 'De la mijlocul verii până la începutul toamnei, în funcție de soi.',
    src: ['rhs_blackberry', 'rhs_pollinators']
  },
  {
    id: 'capsuni', name: 'Căpșuni', latin: 'Fragaria × ananassa', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 8, 9], bloom: [4, 5], harvest: [5, 6, 7], bee: 2,
    about: 'Plantația se reînnoiește o dată la 3–4 ani, pe alt loc.',
    how: 'Plantează primăvara, la sfârșitul verii sau la începutul toamnei, la 35–40 cm între plante și 75 cm între rânduri. „Inima” plantei trebuie să fie exact la nivelul solului: prea adânc putrezește, prea sus se usucă.',
    water: 'Udă regulat până se prind și pe secetă. Udă dimineața, fără să uzi inima plantei și fructele.',
    care: 'Când apar fructele, pune paie uscate sub ele, ca să rămână curate; scoate paiele toamna. Stolonii îi poți înrădăcina în ghivece la sfârșitul verii.',
    pick: 'Culege fructele complet roșii, ideal în partea cea mai caldă a zilei.',
    src: ['rhs_strawberry', 'rhs_pollinators']
  },
  {
    id: 'afin', name: 'Afin de cultură', latin: 'Vaccinium corymbosum', life: 'Arbust', sun: 'Soare sau semiumbră',
    plant: [3, 10, 11], bloom: [4, 5], harvest: [7, 8], bee: 2,
    about: 'Are nevoie de sol acid (pH 4,5–5,5). Pe sol calcaros sau argilos crește-l în ghiveci mare sau strat înălțat.',
    how: 'Plantează de la mijlocul toamnei până la începutul primăverii, la 1–2 m distanță, în pământ pentru plante acidofile (ericaceae). Pentru recolte mai mari pune 2–3 soiuri.',
    water: 'Udă cu apă de ploaie: apa de la robinet e de obicei calcaroasă.',
    care: 'Din al treilea an, taie la sfârșitul iernii tulpinile uscate, rupte sau încrucișate.',
    pick: 'Fructele se coc de la mijlocul verii; culege-le în mai multe treceri.',
    src: ['rhs_blueberry', 'rhs_pollinators']
  },
  {
    id: 'aronia', name: 'Aronia', latin: 'Aronia melanocarpa', life: 'Arbust', sun: 'Soare plin',
    plant: [3, 4, 10, 11], bloom: [5], harvest: [8, 9], bee: 0,
    about: 'Suportă soluri foarte diferite, de la umede la bine drenate (pH 5–8,5, ideal 6–6,5). Este autofertilă.',
    how: 'Distanța este de 1,2–1,8 m între plante. Evită locurile joase, unde poate îngheța floarea. (Lunile de plantare sunt cele obișnuite pentru arbuști, în repaus.)',
    water: 'Udă când stratul de sus al solului e uscat.',
    care: 'La tăiere lasă destui muguri de floare: rodul de anul viitor se formează în timp ce se coc fructele de anul acesta.',
    pick: 'Fructele sunt coapte când sunt complet negre (în sursă: mijlocul lui august–începutul lui septembrie).',
    src: ['osu_aronia']
  },
  {
    id: 'goji', name: 'Goji', latin: 'Lycium barbarum', life: 'Arbust', sun: 'Soare plin',
    plant: [8, 9, 10], bloom: [6, 7, 8], harvest: [8, 9, 10], bee: 0,
    about: 'Complet rezistent la ger. Rodește pe tulpinile crescute anul trecut.',
    how: 'Plantează de la sfârșitul verii până toamna, la cel puțin 2 m distanță, în sol drenat îmbogățit cu compost sau gunoi bine descompus.',
    water: 'Plantele prinse rezistă la secetă.',
    care: 'Taie ușor la începutul primăverii.',
    pick: 'De la sfârșitul verii până la primele brume.',
    src: ['rhs_goji']
  },
  {
    id: 'corn', name: 'Corn', latin: 'Cornus mas', life: 'Arbust mare / pom mic', sun: 'Soare sau semiumbră',
    plant: [3, 10, 11], bloom: [2, 3], harvest: [8, 9], bee: 2,
    about: 'Florile galbene apar la sfârșitul iernii, înaintea frunzelor, și dau albinelor nectar și polen devreme.',
    how: 'Suportă multe soluri, chiar sărace; preferă solul drenat, fertil, care rămâne reavăn (pH 6–7,5). (Lunile de plantare sunt cele obișnuite pentru arbuști, în repaus.)',
    water: 'Udă când stratul de sus al solului e uscat.',
    care: 'La sfârșitul iernii scoate lemnul uscat sau bolnav și dă-i formă.',
    pick: 'Fructele se înroșesc și se coc de la sfârșitul verii la începutul toamnei.',
    src: ['blockhill_cornus', 'rhs_pollinators']
  },
  {
    id: 'alun', name: 'Alun', latin: 'Corylus avellana', life: 'Arbust mare', sun: 'Soare sau semiumbră',
    plant: [3, 11, 12], bloom: [1, 2, 3], harvest: [9, 10], bee: 0,
    about: 'Polenizat de vânt: pune cel puțin două soiuri diferite pentru alune multe. Mâțișorii apar din ianuarie până în martie.',
    how: 'Plantează din noiembrie până în martie, cât e în repaus, la cam 5 m distanță.',
    water: 'Udă când stratul de sus al solului e uscat.',
    care: 'Taie-l iarna, când mâțișorii eliberează polenul: ajută polenizarea. Scoate lăstarii de la bază.',
    pick: 'De la sfârșitul lui septembrie, când învelișul alunelor începe să se îngălbenească.',
    src: ['rhs_cobnut']
  },
  {
    id: 'soc', name: 'Soc', latin: 'Sambucus nigra', life: 'Arbust mare', sun: 'Soare sau semiumbră',
    plant: [3, 4, 10, 11], bloom: [5, 6], harvest: [8, 9], bee: 0,
    about: 'Toate părțile sunt otrăvitoare crude. Doar fructele coapte și gătite se mănâncă. Florile hrănesc polenizatorii, fructele hrănesc păsările.',
    how: 'Plantează primăvara sau toamna, nu pe sol ud, înghețat sau uscat. Suportă orice sol care nu băltește.',
    water: 'Udă regulat în primul an. Odată prins, rezistă la secetă.',
    care: 'Începe tăierile la doi ani după plantare, la sfârșitul iernii sau începutul primăverii.',
    src: ['rhs_sambucus']
  },
  {
    id: 'trandafir-dulceata', name: 'Trandafir (pentru petale și măceșe)', latin: 'Rosa', life: 'Arbust', sun: 'Soare plin',
    plant: [2, 3, 11], bloom: [5, 6], harvest: [], bee: 2,
    about: 'Trandafirii sunt pe lista RHS de plante pentru polenizatori.',
    how: 'Trandafirii cu rădăcina nudă se plantează toamna târziu, la căderea frunzelor, sau de la sfârșitul iernii la începutul primăverii; cei la ghiveci oricând, dacă solul nu e înghețat sau foarte uscat. Punctul de altoire se pune la nivelul solului, nu sub el.',
    water: 'Udă bine pe secetă cel puțin două veri după plantare.',
    src: ['rhs_roses', 'rhs_pollinators']
  },
  {
    id: 'buddleja', name: 'Liliac de vară (Buddleja)', latin: 'Buddleja davidii', life: 'Arbust ornamental', sun: 'Soare plin',
    plant: [3, 4], bloom: [6, 7, 8], harvest: [], bee: 2,
    about: 'Înflorește de la începutul până la sfârșitul verii.',
    how: 'Ideal se plantează primăvara, în sol bine drenat: rădăcinile ude putrezesc iarna.',
    water: 'Ține solul umed, dar nu îmbibat, cam 18 luni, până se prinde.',
    care: 'Taie-l scurt la începutul primăverii (sfârșitul lui martie–mijlocul lui aprilie), până la un schelet jos de tulpini.',
    src: ['rhs_buddleja', 'rhs_pollinators']
  },
  {
    id: 'caryopteris', name: 'Barbă albastră (Caryopteris)', latin: 'Caryopteris × clandonensis', life: 'Arbust mic ornamental', sun: 'Soare plin',
    plant: [3, 4, 5], bloom: [8, 9], harvest: [], bee: 2,
    about: 'Florile de la sfârșitul verii și începutul toamnei atrag albinele și fluturii.',
    how: 'Plantează primăvara, în sol ușor și drenat, la soare plin. Nu-i plac rădăcinile ude.',
    water: 'Udă plantele noi în prima vară. Apoi rezistă la secetă; în ghiveci udă regulat.',
    care: 'În fiecare an, în martie sau începutul lui aprilie, taie tulpinile până la câțiva muguri de la bază.',
    src: ['rhs_caryopteris', 'rhs_pollinators']
  },
  {
    id: 'mahonia', name: 'Mahonia', latin: 'Mahonia aquifolium', life: 'Arbust veșnic verde', sun: 'Semiumbră',
    plant: [3, 4, 10], bloom: [3, 4], harvest: [], bee: 2,
    about: 'Florile de la sfârșitul iernii și începutul primăverii dau nectar devreme.',
    how: 'Ideală este semiumbra; suportă și soarele dacă solul rămâne umed. Sol fertil, bine drenat. (Lunile de plantare sunt cele obișnuite pentru arbuști.)',
    water: 'Udă regulat în primii ani. Plantele prinse au nevoie de puțină apă, dacă solul nu se usucă.',
    care: 'Mulcește din noiembrie până în februarie. Tufele vechi se reîntineresc după înflorire. Nu tăia florile trecute dacă vrei fructele mov-negre.',
    src: ['rhs_mahonia', 'rhs_pollinators']
  }
]);
