/*
 * Soil and neighbours.
 *  - PH: preferred soil pH range per plant (min, max) and its source.
 *  - DRAIN: 'dry' = needs very well-drained soil (raised bed or mound on heavy/clay soil),
 *           'moist' = likes soil that stays moist; with sources.
 *  - Neighbour rules (good / bad), each with a reason and sources.
 * Only information found in the listed sources is included.
 */
(function () {
  var U = 'uconn_ph';
  var PH = {
    mar: [5, 6.5, U], par: [6, 7.5, U], gutui: [6, 7.5, U], cires: [6, 7.5, U], visin: [6, 7.5, U],
    prun: [6, 7.5, U], corcodus: [6, 7.5, U], piersic: [6, 7.5, U], cais: [6, 7, U], smochin: [5, 6, U],
    afin: [4.5, 5.5, 'rhs_blueberry'], mur: [5, 6, U], zmeur: [5, 6.5, U], capsuni: [5, 7.5, U],
    aronia: [5, 8.5, 'osu_aronia'], corn: [6, 7.5, 'blockhill_cornus'],
    'vita-masa': [6.5, 6.8, 'rhs_grapes'], 'vita-vin': [6.5, 6.8, 'rhs_grapes'],
    revent: [5.5, 7, U], sparanghel: [6, 8, U], 'fasole-pastai': [6, 7.5, U], mazare: [6, 7.5, U],
    sfecla: [6, 7.5, U], broccoli: [6, 7, U], varza: [6, 7.5, U], morcov: [5.5, 7, U], conopida: [5.5, 7.5, U],
    telina: [6, 7, U], porumb: [5.5, 7.5, U], castraveti: [5.5, 7.5, U], usturoi: [5.5, 7.5, U], kale: [6, 7.5, U],
    gulie: [6, 7.5, U], praz: [6, 8, U], salata: [6, 7, U], 'pepene-galben': [5.5, 6.5, U], 'pepene-verde': [5.5, 6.5, U],
    ceapa: [6, 7, U], patrunjel: [5, 7, U], pastarnac: [5.5, 7.5, U], ardei: [5.5, 7, U], cartofi: [4.5, 6, U],
    dovleac: [5.5, 7.5, U], ridichi: [6, 7, U], spanac: [6, 7.5, U], rosii: [5.5, 7.5, U],
    busuioc: [5.5, 6.5, U], arpagic: [6, 7, U], fenicul: [5, 6, U], levantica: [6.5, 7.5, U], maghiran: [6, 8, U],
    menta: [7, 8, U], rozmarin: [5, 6, U], salvie: [5.5, 6.5, U], cimbru: [5.5, 7, U], cimbrisor: [5.5, 7, U],
    brandusa: [6, 7.5, U], elebor: [6, 7.5, U], 'floarea-soarelui': [5, 7, U], cosmos: [5, 8, U], zinnia: [5.5, 7.5, U],
    galbenele: [5.5, 7, U], 'gura-leului': [5.5, 7, U], mac: [6, 7.5, U], sedum: [6, 7.5, U], 'aster-toamna': [5.5, 7.5, U],
    'salvia-nemorosa': [6, 7.5, U], gaillardia: [6, 7.5, U], buddleja: [6, 7, U],
    'trandafir-dulceata': [5.5, 7, U], 'trandafir-cataratator': [6, 7, U], caprifoi: [6, 7.5, U], iedera: [6, 7.5, U],
    clematis: [5.5, 7, U]
  };
  // Numeric ranges from other tables.
  PH.echinacea = [5, 7.5, 'almanac_ph']; PH.rudbeckia = [5.5, 7, 'almanac_ph'];
  PH.albastrele = [6, 7.5, 'almanac_ph']; PH.monarda = [6, 7.5, 'almanac_ph'];
  PH.vinete = [5.5, 7.5, 'umn_eggplant'];

  // Plants where the source gives pH classes instead of numbers:
  // A = acid (sub 6), N = neutral, L = alkaline (alcalin). NC State: N = 6.0–8.0, L = peste 8.0.
  var PH_CAT = {
    isop: ['NL', 'ncsu_isop'], oregano: ['ANL', 'ncsu_oregano'], roinita: ['AN', 'ncsu_roinita'],
    'limba-mielului': ['ANL', 'ncsu_borago'], marar: ['AN', 'ncsu_marar'], leustean: ['ANL', 'ncsu_leustean'],
    agastache: ['ANL', 'rhsdb_agastache'], 'iarba-matei': ['ANL', 'rhsdb_nepeta'], coriandru: ['ANL', 'rhsdb_coriandru'],
    ghiocel: ['ANL', 'rhsdb_ghiocel'], lalele: ['NL', 'rhs_tulip'], narcise: ['ANL', 'rhsdb_narcise'], zambile: ['ANL', 'rhsdb_zambile'], muscari: ['ANL', 'rhsdb_muscari'], allium: ['ANL', 'ncsu_allium'],
    facelia: ['ANL', 'rhsdb_facelia'], verbena: ['ANL', 'ncsu_verbena'], echinops: ['ANL', 'rhsdb_echinops'],
    caryopteris: ['ANL', 'rhsdb_caryopteris'], mosmon: ['ANL', 'rhsdb_mosmon'], nuc: ['ANL', 'rhsdb_nuc'],
    'coacaz-negru': ['ANL', 'rhsdb_coacaz_negru'], 'coacaz-rosu': ['ANL', 'rhsdb_coacaz_rosu'], agris: ['ANL', 'rhsdb_agris'],
    goji: ['ANL', 'rhsdb_goji'], alun: ['NL', 'rhsdb_alun'], soc: ['ANL', 'rhsdb_soc'], mahonia: ['ANL', 'rhsdb_mahonia'],
    campsis: ['ANL', 'rhsdb_campsis'], dovlecei: ['N', 'ncsu_dovlecei'], rucola: ['N', 'ncsu_rucola'],
    'trifoi-alb': ['ANL', 'rhsdb_trifoi_alb'], 'trifoi-rosu': ['AN', 'rhsdb_trifoi_rosu']
  };

  // Plants whose source gives only a description, not numbers.
  var PH_TEXT = {
    'kiwi-mic': ['slight', 'Sursa recomandă sol fertil, bine drenat, ușor acid.', 'rhs_kiwi']
  };

  var DRAIN = {
    dry: {
      levantica: 'rhs_lavender', cimbru: 'rhs_thyme', cimbrisor: 'rhs_thyme', salvie: 'rhs_sage', rozmarin: 'rhs_rosemary',
      oregano: 'rhs_oregano', agastache: 'gw_agastache', 'iarba-matei': 'chatto_nepeta', echinops: 'gw_echinops',
      gaillardia: 'gw_gaillardia', allium: 'rhs_allium', echinacea: 'rhs_echinacea', verbena: 'rhs_verbena',
      'salvia-nemorosa': 'rhs_salvia', caryopteris: 'rhs_caryopteris', buddleja: 'rhs_buddleja',
      'vita-masa': 'rhs_grapes', 'vita-vin': 'rhs_grapes'
    },
    moist: {
      leustean: 'rhs_lovage', monarda: 'gw_monarda', menta: 'rhs_mint', rudbeckia: 'rhs_rudbeckia',
      'aster-toamna': 'rhs_aster', elebor: 'rhs_hellebore'
    }
  };

  // Neighbour rules. `ids` = plants the rule is shown on; `other` = the neighbour text.
  var RULES = [];
  function bad(ids, other, why, src) { RULES.push({ kind: 'bad', ids: ids, other: other, why: why, src: src }); }
  function good(ids, other, why, src) { RULES.push({ kind: 'good', ids: ids, other: other, why: why, src: src }); }

  // Walnut (juglone). The common walnut makes relatively little; black walnut and butternut make much more.
  var WALNUT_SENSITIVE = ['mar', 'par', 'mur', 'afin', 'vita-masa', 'vita-vin', 'capsuni', 'rosii', 'cartofi', 'ardei', 'vinete', 'sparanghel', 'revent'];
  var WALNUT_OK = ['cires', 'visin', 'porumb', 'sfecla', 'morcov', 'fasole-pastai', 'pepene-galben', 'pepene-verde', 'ceapa', 'dovleac', 'dovlecei'];
  bad(WALNUT_SENSITIVE, 'Nuc (mai ales nucul negru)', 'Lista de plante sensibile la juglonă e stabilită pentru nucul negru, care eliberează multă juglonă din rădăcini (cel mai mult sub coroană). Nucul comun (Juglans regia, nucul din curțile noastre) produce relativ puțină, așa că la el efectul e mai slab și mai puțin studiat – nu e sigur că apare. Dacă poți, ține totuși distanță.', ['wisc_walnut']);
  good(WALNUT_OK, 'Nuc', 'Sursa o trece printre plantele care suportă juglona (testat la nucul negru, care produce mult mai multă decât nucul comun).', ['wisc_walnut']);
  bad(['nuc'], 'Măr, păr, mur, afin, viță de vie, căpșuni, roșii, cartofi, ardei, vinete, sparanghel, revent', 'Sunt sensibile la juglona nucului negru. Nucul comun (Juglans regia) produce relativ puțină juglonă, deci efectul la el e mai slab și mai puțin documentat – ia-o ca precauție, nu ca regulă.', ['wisc_walnut']);
  good(['nuc'], 'Cireș, porumb, sfeclă, morcov, fasole, pepeni, ceapă, dovleac', 'Suportă juglona din rădăcinile de nuc.', ['wisc_walnut']);

  // Pear rust needs junipers.
  bad(['par'], 'Ienupăr', 'Rugina părului trăiește pe rând pe păr și pe ienupăr; fără ienupăr în apropiere riscul scade (sporii pot veni totuși cu vântul).', ['rhs_pearrust']);

  // Late blight: potatoes and tomatoes.
  bad(['rosii'], 'Cartofi', 'Mana roșiilor este aceeași boală cu mana cartofului; cartofii sunt sursa principală, iar sporii ajung cu vântul la roșii. Nu pune roșiile unde au fost cartofi în ultimii 4 ani.', ['rhs_tomatoblight']);
  bad(['cartofi'], 'Roșii', 'Mana cartofului trece cu vântul la roșii (este aceeași boală).', ['rhs_tomatoblight']);

  // Replant disease: same kind of plant in the same spot.
  bad(['mar', 'par', 'cires', 'visin', 'piersic', 'prun', 'gutui', 'trandafir-dulceata', 'trandafir-cataratator'],
      'Locul unde a stat înainte același fel de plantă',
      'Boala replantării: planta nouă se prinde greu în solul unde a crescut aceeași specie. Alege alt loc sau schimbă pământul pe o groapă de cam 60 cm lățime și 30 cm adâncime.',
      ['rhs_replant']);
  bad(['capsuni'], 'Locul unde au stat înainte căpșuni',
      'Căpșunii sunt uneori afectați de boala replantării; reînnoiește plantația pe alt loc.', ['rhs_replant', 'rhs_strawberry']);

  // Tulip bulb rot.
  bad(['lalele'], 'Locul unde lalelele au avut putregai (sclerotinia)', 'Nu mai pune lalele pe acel loc 5 ani.', ['rhs_tulip']);

  // Mint spreads into its neighbours.
  bad(['menta'], 'Plante mici, puse direct lângă ea', 'Menta e foarte viguroasă și se întinde; pune-o în ghiveci sau într-un vas fără fund îngropat.', ['rhs_mint']);

  // Pollination partners.
  good(['mar'], 'Alt soi de măr (sau un măr ornamental) care înflorește în același timp', 'Majoritatea soiurilor de măr au nevoie de alt soi ca să lege rod. Pomii trebuie să fie la cel mult 18 m unul de altul.', ['rhs_fruitpoll']);
  good(['par'], 'Alt soi de păr care înflorește în același timp', 'Majoritatea soiurilor de păr au nevoie de alt soi ca să lege rod. Pomii trebuie să fie la cel mult 18 m unul de altul.', ['rhs_fruitpoll']);
  good(['prun'], 'Alt soi de prun', 'Chiar și soiurile autofertile rodesc mai bine când au alt soi aproape (până la 18 m).', ['rhs_fruitpoll']);
  good(['alun'], 'Un alt soi de alun', 'E polenizat de vânt: cu cel puțin două soiuri diferite faci mai multe alune.', ['rhs_cobnut']);
  good(['afin'], 'Alte 2–3 soiuri de afin', 'Pentru recolte mai mari.', ['rhs_blueberry']);
  good(['kiwi-mic'], 'O plantă mascul de kiwi (sau un soi autofertil)', 'Plantele femele au nevoie de un mascul aproape ca să facă fructe.', ['rhs_kiwi']);
  good(['aronia'], 'Alte soiuri de aronia', 'E autofertilă, dar mai multe soiuri pot crește recolta.', ['osu_aronia']);

  // Vegetable rotation groups (RHS).
  var ROT = {
    brassica: { name: 'Crucifere (varză)', ids: ['varza', 'kale', 'conopida', 'broccoli', 'gulie', 'ridichi'], why: 'Rotația ajută contra herniei rădăcinilor.' },
    legume: { name: 'Leguminoase', ids: ['mazare', 'fasole-pastai'], why: '' },
    onion: { name: 'Ceapă și usturoi', ids: ['ceapa', 'usturoi', 'praz'], why: 'Rotația ajută contra putregaiului alb al cepei.' },
    potato: { name: 'Cartofi și roșii', ids: ['cartofi', 'rosii'], why: '' },
    roots: { name: 'Rădăcinoase', ids: ['sfecla', 'morcov', 'pastarnac', 'telina'], why: '' },
    cucurbit: { name: 'Cucurbitacee (dovleci, castraveți, pepeni)', ids: ['castraveti', 'dovlecei', 'dovleac', 'pepene-verde', 'pepene-galben'], why: 'RHS le lasă să stea oriunde în rotație, dar nu pe același loc prea des.' },
    any: { name: 'Salate, porumb, ardei, vinete – oriunde', ids: ['salata', 'spanac', 'rucola', 'porumb', 'ardei', 'vinete', 'patrunjel'], why: 'Pot sta oriunde, dar nu pe același loc prea des. Ardeii și vinetele sunt din aceeași familie botanică cu cartofii și roșiile (solanacee); RHS le lasă oriunde în rotație.' },
    perennial: { name: 'Perene – fără rotație', ids: ['sparanghel', 'revent'], why: 'Stau mulți ani pe același loc.' }
  };

  window.SOIL = { PH: PH, PH_CAT: PH_CAT, PH_TEXT: PH_TEXT, DRAIN: DRAIN, RULES: RULES, ROT: ROT, rotSrc: ['rhs_rotation'] };
})();
