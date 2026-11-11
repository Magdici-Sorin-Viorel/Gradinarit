// Aromatic herbs. Every text below comes from the sources in `src`.
// Bee value: 2 = confirmed visited by bees in a source, 0 = no source found.
// Months translate the seasons in the sources to the lowlands of Romania (reference: average last frost 26 March in the western plain – see rjas_frost).
addPlants('aromatic', [
  {
    id: 'levantica', name: 'Levănțică', latin: 'Lavandula angustifolia', life: 'Perenă (subarbust)', sun: 'Soare plin',
    plant: [4, 5], bloom: [6, 7, 8], harvest: [], bee: 2,
    about: 'Iubește solul sărac, chiar calcaros, și locurile uscate. Pe sol greu, argilos, nu se dezvoltă bine.',
    how: 'Plantează în aprilie–mai, când solul s-a încălzit. Nu o planta iarna: plantele tinere putrezesc în solul rece și ud. Distanța este de cam 90 cm între plante în grupuri sau 30–45 cm pentru gard viu. Pe sol greu, plantează pe un mic val de pământ de 20–30 cm sau în strat înălțat.',
    water: 'Udă regulat în prima vară. După ce s-a prins rezistă la secetă și rareori are nevoie de apă, în afară de seceta foarte mare.',
    care: 'Nu are nevoie de îngrășăminte. Tunde-o în fiecare an la sfârșitul verii, imediat după înflorire: scoți tijele florale trecute și cam 2,5 cm din frunziș. Nu tăia în lemnul bătrân, pentru că nu mai lăstărește din el.',
    src: ['rhs_lavender', 'rhs_pollinators']
  },
  {
    id: 'cimbru', name: 'Cimbru de grădină', latin: 'Thymus vulgaris', life: 'Perenă (subarbust)', sun: 'Soare plin',
    plant: [4, 5, 6], bloom: [5, 6, 7], harvest: [4, 5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Are nevoie de un loc cald, însorit, și de sol ușor, bine drenat. Pe sol greu sau umed iarna, crește-l în ghiveci sau strat înălțat.',
    how: 'Plantează afară de la mijlocul primăverii până la începutul verii, la 20–30 cm distanță, în funcție de soi.',
    water: 'Rezistă la secetă și rareori trebuie udat, doar după plantare sau în ghiveci pe vreme caldă. Udarea prea multă e riscul mai mare: rădăcinile putrezesc.',
    care: 'Tunde ușor tufele la mijlocul sau sfârșitul primăverii și/sau imediat după înflorire. După câțiva ani tufele se răresc și e mai bine să le înlocuiești, din butași sau marcotaj.',
    pick: 'Frunzele se pot culege tot anul. Cele mai aromate sunt lăstarii tineri, de la sfârșitul primăverii și din vară.',
    src: ['rhs_thyme', 'rhs_pollinators']
  },
  {
    id: 'cimbrisor', name: 'Cimbrișor (cimbru târâtor)', latin: 'Thymus serpyllum', life: 'Perenă târâtoare', sun: 'Soare plin',
    plant: [4, 5, 6], bloom: [6, 7], harvest: [], bee: 2,
    about: 'Cimbru care se întinde pe sol. Are nevoie de sol ușor și bine drenat.',
    how: 'Plantează de la mijlocul primăverii până la începutul verii, la 20–30 cm.',
    water: 'Rareori trebuie udat după ce s-a prins. Nu-i place solul ud.',
    care: 'Soiurile târâtoare au nevoie doar de o tundere foarte ușoară după înflorire, ca să scoți florile trecute.',
    src: ['rhs_thyme', 'rhs_pollinators']
  },
  {
    id: 'salvie', name: 'Salvie', latin: 'Salvia officinalis', life: 'Perenă (subarbust)', sun: 'Soare plin',
    plant: [4], bloom: [6, 7], harvest: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], bee: 2,
    about: 'Plantă veșnic verde, care cere sol drenat, niciodată îmbibat cu apă.',
    how: 'Plantează primăvara, când solul începe să se încălzească, la cel puțin 30 cm de alte plante. Pe sol care băltește, folosește strat înălțat sau ghiveci de cel puțin 30 cm.',
    water: 'Udă plantele noi pe secetă în primul an. Odată prinse, rezistă la secetă și de obicei nu mai au nevoie de apă.',
    care: 'Taie ușor, o dată pe an, la mijlocul sau sfârșitul primăverii. Nu tăia adânc în lemnul bătrân, pentru că s-ar putea să nu mai lăstărească. După 6–7 ani tufa se lemnifică: înlocuiește-o din butași.',
    pick: 'Frunzele se culeg tot anul. Creșterea nouă din primăvară și vară are aroma cea mai bună.',
    src: ['rhs_sage', 'rhs_pollinators']
  },
  {
    id: 'rozmarin', name: 'Rozmarin', latin: 'Salvia rosmarinus', life: 'Perenă (arbust)', sun: 'Soare plin',
    plant: [4], bloom: [], harvest: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], bee: 2,
    about: 'Plantele bine prinse suportă până la -8 °C. Iernile din România pot fi mai reci, așa că are nevoie de protecție sau de ghiveci pe care îl muți la adăpost.',
    how: 'Plantează primăvara, când solul începe să se încălzească, la aceeași adâncime cu balotul de rădăcini. Alege un loc însorit, cu sol ușor și drenat; pe sol greu folosește strat înălțat sau ghiveci de cel puțin 30 cm.',
    water: 'Udă plantele noi pe secetă în primul an. Odată prinse, în pământ nu mai au nevoie de apă. Nu suportă rădăcinile ude, mai ales iarna.',
    care: 'Pe frig mare acoperă-l cu agrotextil sau o pânză. Ghivecele le muți într-un loc ferit; pe iernile ude, sub acoperiș. Tunde-l ușor în fiecare an după înflorire, fără să tai în lemnul bătrân.',
    pick: 'Se culege tot anul. Lăstarii tineri de la sfârșitul primăverii și din vară au aroma cea mai bună.',
    src: ['rhs_rosemary', 'rhs_pollinators']
  },
  {
    id: 'isop', name: 'Isop', latin: 'Hyssopus officinalis', life: 'Perenă (subarbust)', sun: 'Soare plin',
    plant: [5, 6], bloom: [7, 8, 9], harvest: [], bee: 2,
    about: 'Florile atrag mult albinele și fluturii. Apicultorii îl prețuiesc pentru că dă o miere bună.',
    how: 'Seamănă direct în mai–iunie, pe rânduri, apoi rărește. Distanța între plante este de cam 45 cm.',
    water: 'Udă regulat plantele noi până se prind. Apoi suportă o oarecare secetă.',
    care: 'Taie-l la mijlocul primăverii, când pornește creșterea nouă, ca să se îndesească. Poți scoate florile trecute după înflorire.',
    src: ['gw_hyssop', 'rhs_pollinators']
  },
  {
    id: 'oregano', name: 'Oregano (Sovârf)', latin: 'Origanum vulgare', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5], bloom: [7, 8, 9], harvest: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Florile roz, mov sau albe, din vară și începutul toamnei, atrag albinele și fluturii.',
    how: 'Se poate planta oricând, dar se prinde cel mai repede la sfârșitul primăverii. Plantele crescute din semințe se pun afară după ultimul îngheț. Distanța este de 20–30 cm, în sol bine drenat.',
    water: 'Udă plantele noi pe secetă. Cele prinse în pământ de obicei nu mai au nevoie de apă.',
    care: 'La sfârșitul primăverii tunde plantele ca să rămână compacte. Taie tijele florale după ce se trec. Tufele se pot împărți primăvara sau la sfârșitul verii.',
    pick: 'Culege frunze de la sfârșitul primăverii până toamna. Aroma e cea mai bună înainte să se deschidă florile.',
    src: ['rhs_oregano', 'rhs_pollinators']
  },
  {
    id: 'maghiran', name: 'Maghiran', latin: 'Origanum majorana', life: 'Anuală (la noi)', sun: 'Soare plin',
    plant: [5, 6], bloom: [7, 8], harvest: [6, 7, 8, 9], bee: 2,
    about: 'Nu rezistă sigur la ger, așa că se cultivă de obicei ca plantă anuală.',
    how: 'Seamănă în casă primăvara; semințele se pun pe suprafață, fără să le acoperi. Mută plantele afară la sfârșitul primăverii sau vara, după ce le-ai obișnuit cu afară, la cel puțin 20 cm.',
    water: 'Udă plantele noi pe secetă. Cele prinse în pământ de obicei nu mai au nevoie de apă.',
    care: 'Formează o tufă care se întinde.',
    pick: 'Culege lăstarii după nevoie. Aroma e cea mai bună înainte să se deschidă florile.',
    src: ['rhs_marjoram', 'rhs_pollinators']
  },
  {
    id: 'busuioc', name: 'Busuioc', latin: 'Ocimum basilicum', life: 'Anuală', sun: 'Soare plin, loc ferit',
    plant: [5, 6], bloom: [7, 8, 9], harvest: [6, 7, 8, 9], bee: 2,
    about: 'Nu rezistă la frig. Florile sale, în spice cu multe flori, sunt vizitate de polenizatori.',
    how: 'Seamănă sau plantează afară abia când nopțile rămân constant peste 10 °C (în zonele joase, de obicei din mai; mai târziu în zonele reci). Rărește la 10–20 cm; plantele mutate la cel puțin 10 cm.',
    water: 'Udă bine până se prinde, apoi pe secetă, ca pământul să fie uniform umed. Udă dimineața: busuiocului nu-i plac rădăcinile ude peste noapte. Nu stropi frunzele.',
    care: 'Culege des vârfurile lăstarilor ca planta să se ramifice. Scoate tijele florale cum apar ca să ai frunze mai mult timp; lasă câteva plante să înflorească dacă vrei flori pentru albine.',
    pick: 'Culege frunzele toată vara.',
    src: ['rhs_basil', 'ufl_herbs']
  },
  {
    id: 'menta', name: 'Mentă', latin: 'Mentha spp.', life: 'Perenă', sun: 'Soare sau semiumbră',
    plant: [3, 4, 5, 9, 10], bloom: [7, 8], harvest: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Foarte viguroasă: problema principală este să o oprești să se întindă.',
    how: 'Plantează primăvara sau toamna. Pune-o în ghiveci, sau îngroapă un vas fără fund ori cu găuri mari, cu marginea puțin deasupra solului, ca lăstarii să nu treacă peste el.',
    water: 'Ține pământul uniform umed în sezon. Mentă din ghiveci se usucă mai repede: verifică-o des și mut-o la semiumbră pe căldură.',
    care: 'După înflorire taie toată planta la cam 5 cm de sol, ca să facă frunze noi. Împarte tufele primăvara sau toamna, o dată la câțiva ani.',
    pick: 'Culege de la sfârșitul primăverii până toamna. Vârfurile tinere au aroma cea mai puternică.',
    src: ['rhs_mint', 'rhs_pollinators']
  },
  {
    id: 'roinita', name: 'Roiniță (Melisă)', latin: 'Melissa officinalis', life: 'Perenă', sun: 'Soare sau semiumbră',
    plant: [4, 5, 6], bloom: [6, 7, 8], harvest: [4, 5, 6, 7, 8], bee: 2,
    about: 'Florile mici, albe, din vară, sunt bogate în nectar și atrag albinele. Numele Melissa vine din grecescul pentru albină.',
    how: 'Seamănă afară de la sfârșitul primăverii la începutul verii. Plantele cumpărate se pot pune oricând, ideal primăvara. Suportă majoritatea solurilor, dar nu pe cele care băltesc.',
    water: 'În pământ, plantele prinse nu au nevoie de udare. În ghiveci ține pământul uniform umed.',
    care: 'Imediat după înflorire, înainte să facă semințe, taie toată planta aproape de bază: face frunze noi și nu se mai autoînsămânțează. Împarte tufele o dată la câțiva ani, primăvara sau toamna.',
    pick: 'Culege frunzele tinere primăvara și vara, când au cea mai multă aromă.',
    src: ['rhs_lemonbalm']
  },
  {
    id: 'agastache', name: 'Agastache (Izmă anasonată)', latin: 'Agastache foeniculum', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5, 9, 10], bloom: [7, 8, 9], harvest: [], bee: 2,
    about: 'Spicele de flori sunt foarte iubite de albine. Rezistența la ger diferă de la un soi la altul.',
    how: 'Plantează la aceeași adâncime ca în ghiveci, în sol umed dar bine drenat, la soare plin. Pe sol greu adaugă pietriș în groapă. (Lunile sunt cele pentru perenele în general: primăvara sau toamna.)',
    water: 'Rezistă la secetă; după plantare nu mai are nevoie de udare.',
    care: 'Nu o tăia toamna. Primăvara curăță tulpinile uscate. La nevoie protejeaz-o iarna cu agrotextil.',
    src: ['gw_agastache', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'limba-mielului', name: 'Limba mielului (Borago)', latin: 'Borago officinalis', life: 'Anuală', sun: 'Soare plin',
    plant: [4, 5], bloom: [6, 7, 8], harvest: [6, 7, 8], bee: 2,
    about: 'Florile, de obicei albastre, sunt comestibile și atrag insectele polenizatoare.',
    how: 'Seamănă direct în grădină în aprilie–mai. Distanța între plante este de cam 50 cm; în ghiveci, o plantă la un vas de 30 cm.',
    water: 'În pământ de obicei nu trebuie udată, dar preferă solul umed: udarea pe secetă face plante mai mari. În ghiveci ține pământul umed.',
    care: 'Se autoînsămânțează ușor. Dacă nu vrei asta, smulge plantele după înflorire. Plantele semănate primăvara slăbesc de obicei până în august.',
    pick: 'Florile se pun în băuturi și salate.',
    src: ['rhs_borage', 'rhs_pollinators']
  },
  {
    id: 'iarba-matei', name: 'Iarba mâței (Nepeta)', latin: 'Nepeta', life: 'Perenă', sun: 'Soare plin',
    plant: [3, 4, 5, 9, 10], bloom: [6, 7, 8], harvest: [], bee: 2,
    about: 'Ușor de crescut. Dă nectar și polen pentru polenizatori pe o perioadă lungă de vară.',
    how: 'Crește cel mai bine în sol ușor, bine drenat, la soare plin. (Lunile sunt cele pentru perenele în general: martie–începutul lui mai sau sfârșitul lui septembrie–octombrie.)',
    water: 'După plantare udă bine, chiar dacă pământul e umed. Preferă solul sărac și uscat după ce s-a prins.',
    care: 'După înflorire o poți tăia până la sol, ca să înflorească din nou.',
    src: ['chatto_nepeta', 'rhs_perennials', 'rhs_pollinators']
  },
  {
    id: 'monarda', name: 'Monarda', latin: 'Monarda', life: 'Perenă', sun: 'Soare sau semiumbră',
    plant: [4, 5], bloom: [7, 8], harvest: [], bee: 2,
    about: 'Florile atrag polenizatorii. Planta face ușor făinare.',
    how: 'Plantează afară după ce a trecut riscul de îngheț, în sol umed dar bine drenat, la cam 45 cm, ca aerul să circule între plante.',
    water: 'Udă bine după plantare și ține solul umed până se prinde. Apoi rezistă destul de bine la secetă.',
    care: 'Contra făinării: nu uda pe frunze, lasă aer între plante și nu o lăsa să sufere de secetă. Împarte tufele primăvara, o dată la câțiva ani.',
    src: ['gw_monarda', 'rhs_pollinators']
  },
  {
    id: 'coriandru', name: 'Coriandru', latin: 'Coriandrum sativum', life: 'Anuală', sun: 'Soare sau semiumbră',
    plant: [3, 4, 5, 6, 7, 8, 9], bloom: [], harvest: [5, 6, 7, 8, 9, 10], bee: 0,
    about: 'Pe vreme caldă și uscată înflorește repede și nu mai face frunze.',
    how: 'Seamănă direct de primăvara până toamna, într-un loc însorit sau cu puțină umbră, la cam 5 cm între semințe. Pentru semințe, rărește la 20 cm. Vara, pentru frunze, seamănă într-un loc mai răcoros, ferit de soarele de prânz.',
    water: 'În pământ rareori trebuie udat, doar pe secete lungi. În ghiveci verifică zilnic. Udă dimineața devreme sau seara.',
    care: 'Seamănă câte puțin în fiecare lună, ca să ai mereu frunze. Scoate tijele florale devreme ca să culegi frunze mai mult timp.',
    pick: 'Frunzele, când plantele au 10–15 cm: câteva frunze de pe fiecare plantă, apoi lasă-le să se refacă 2 săptămâni. Semințele: taie tulpinile întregi, pune-le într-o pungă de hârtie și usucă-le o săptămână.',
    src: ['rhs_coriander']
  },
  {
    id: 'marar', name: 'Mărar', latin: 'Anethum graveolens', life: 'Anuală', sun: 'Soare plin',
    plant: [3, 4, 5, 6, 7], bloom: [], harvest: [5, 6, 7, 8, 9], bee: 0,
    about: 'Pe vreme caldă și uscată înflorește devreme și face mai puține frunze.',
    how: 'Seamănă direct, în loturi mici, din martie până la mijlocul verii, în sol fertil și drenat. Rândurile sunt la 1 cm adâncime și 30 cm unul de altul; rărește plantele la 20 cm.',
    water: 'Udă pe secetă. În ghiveci pământul se usucă foarte repede pe căldură.',
    care: 'Seamănă din nou la câteva săptămâni ca să ai frunze tinere până toamna.',
    pick: 'Frunzele, de la cam 6 săptămâni după semănat: lasă cel puțin o treime din plantă. Semințele, la sfârșitul verii sau toamna, când umbelele sunt uscate și maro.',
    src: ['rhs_dill', 'agrointel_cal']
  },
  {
    id: 'fenicul', name: 'Fenicul (aromatic)', latin: 'Foeniculum vulgare', life: 'Perenă', sun: 'Soare plin',
    plant: [4, 5, 6], bloom: [7, 8, 9], harvest: [6, 7, 8, 9, 10], bee: 2,
    about: 'Formează o tufă care se usucă toamna și pornește din nou de la bază în fiecare primăvară. Florile atrag polenizatorii.',
    how: 'Seamănă direct din aprilie, la 1 cm adâncime, sau plantează plante cumpărate la sfârșitul primăverii–începutul verii. Distanța este de cel puțin 30 cm.',
    water: 'Udă regulat plantele tinere pe secetă în primul sezon. După ce s-a prins rezistă la secetă. Udă dimineața devreme sau seara.',
    care: 'Taie tulpinile uscate la nivelul solului primăvara, înainte de lăstarii noi. Pentru frunze, scoate tijele florale sau tunde planta la 30 cm de câteva ori pe sezon. Tulpinile uscate lăsate peste iarnă adăpostesc insecte.',
    pick: 'Frunzele tinere, de la începutul verii până toamna. Semințele se coc de la sfârșitul verii.',
    src: ['rhs_fennel', 'rhs_pollinators']
  },
  {
    id: 'arpagic', name: 'Ceapă de tuns (Schnittlauch)', latin: 'Allium schoenoprasum', life: 'Perenă', sun: 'Soare sau semiumbră',
    plant: [3, 4, 5], bloom: [5, 6, 7], harvest: [5, 6, 7, 8, 9, 10], bee: 2,
    about: 'Florile rotunde, de la sfârșitul primăverii și din vară, sunt comestibile și atrag polenizatorii.',
    how: 'Seamănă primăvara direct în pământ sau în ghiveci. Plantele cumpărate se pot pune oricând, ideal primăvara, la cel puțin 15 cm.',
    water: 'Udă plantele noi pe secetă în prima vară. Cele prinse rareori au nevoie de apă.',
    care: 'Împarte tufele o dată la 3–4 ani. După înflorire poți tăia toată tufa la cam 5 cm ca să facă frunze noi.',
    pick: 'Taie frunzele chiar deasupra bazei, de la sfârșitul primăverii până toamna. Folosește-le crude: gătitul le strică aroma.',
    src: ['rhs_chives', 'rhs_pollinators']
  },
  {
    id: 'leustean', name: 'Leuștean', latin: 'Levisticum officinale', life: 'Perenă', sun: 'Semiumbră sau soare',
    plant: [4, 5, 6], bloom: [7, 8], harvest: [4, 5, 6, 7], bee: 2,
    about: 'Plantă mare, viguroasă. Florile galben-verzui de la mijlocul verii sunt bune pentru polenizatori.',
    how: 'Seamănă primăvara sau plantează la sfârșitul primăverii–începutul verii, la 30–45 cm. Preferă solul bogat, umed, care nu se usucă și nu băltește; ideal semiumbră.',
    water: 'Udă regulat în primul sezon. Plantele prinse au nevoie de apă doar pe secete lungi.',
    care: 'De obicei nu are nevoie de îngrășăminte. Pentru mai multe frunze scoate tijele florale cum apar. Toamna taie tulpinile uscate.',
    pick: 'Frunzele tinere, din primăvară până vara. Oprește-te când înflorește: frunzele devin amare.',
    src: ['rhs_lovage', 'agrointel_cal']
  }
]);

// Basil is frost-tender (RHS: basil does best when nights stay above 10 °C).
window.PLANTS.forEach(function (p) {
  if (p.id === 'busuioc') { p.frost = 'tender'; p.nightMin = 10; p.src = p.src.concat(['rhs_tender']); }
});
