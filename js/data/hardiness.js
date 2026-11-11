/*
 * Frost hardiness (RHS hardiness ratings) and germination data for plants other than vegetables.
 *
 * RHS rating -> lowest winter temperature it is rated for:
 *   H1a/H1b/H1c above 5 °C (under glass) · H2 1…5 °C (no frost) · H3 -5…1 °C (half-hardy)
 *   H4 -10…-5 °C · H5 -15…-10 °C · H6 -20…-15 °C · H7 below -20 °C
 * Each value comes from the RHS plant page of that species (URL kept as its source).
 * Roses are not rated here: hardiness differs too much between varieties.
 * Loaded after all plant files; also sets the frost class used by the weather advice
 * ('tender' for H1–H2) for plants that do not have one yet (vegetables already do).
 */
(function () {
  var H = {
    'afin': ['H6', 'https://www.rhs.org.uk/plants/18670/vaccinium-corymbosum-f/details'],
    'agastache': ['H3', 'https://www.rhs.org.uk/plants/26431/agastache-foeniculum-pursh-kuntze/details'],
    'agris': ['H6', 'https://www.rhs.org.uk/plants/15898/ribes-uva-crispa/details'],
    'albastrele': ['H6', 'https://www.rhs.org.uk/plants/46174/centaurea-cyanus/details'],
    'allium': ['H5', 'https://www.rhs.org.uk/plants/829/allium-giganteum/details', 'Allium giganteum; alte specii pot diferi'],
    'alun': ['H6', 'https://www.rhs.org.uk/plants/4511/corylus-avellana-f/details'],
    'aronia': ['H6', 'https://www.rhs.org.uk/plants/1610/aronia-melanocarpa/details/'],
    'arpagic': ['H6', 'https://www.rhs.org.uk/plants/859/allium-schoenoprasum/details'],
    'aster-toamna': ['H6', 'https://www.rhs.org.uk/plants/340057/symphyotrichum-novi-belgii/details', 'Symphyotrichum novi-belgii'],
    'brandusa': ['H6', 'https://www.rhs.org.uk/plants/25699/crocus-tommasinianus/details', 'Crocus tommasinianus'],
    'buddleja': ['H6', 'https://www.rhs.org.uk/plants/2448/buddleja-davidii/details'],
    'busuioc': ['H1c', 'https://www.rhs.org.uk/plants/11649/ocimum-basilicum/details'],
    'cais': ['H4', 'https://www.rhs.org.uk/plants/13949/prunus-armeniaca/details'],
    'campsis': ['H4', 'https://www.rhs.org.uk/plants/2993/campsis-radicans/details'],
    'caprifoi': ['H6', 'https://www.rhs.org.uk/plants/10508/lonicera-periclymenum/details'],
    'capsuni': ['H6', 'https://www.rhs.org.uk/plants/106127/fragaria-ananassa-(f)/details'],
    'caryopteris': ['H4', 'https://www.rhs.org.uk/plants/92602/caryopteris-x-clandonensis/details'],
    'cimbrisor': ['H5', 'https://www.rhs.org.uk/plants/178657/thymus-serpyllum-l/details'],
    'cimbru': ['H5', 'https://www.rhs.org.uk/plants/18213/thymus-vulgaris/details'],
    'cires': ['H6', 'https://www.rhs.org.uk/plants/13950/prunus-avium/details'],
    'clematis': ['H6', 'https://www.rhs.org.uk/plants/29466/clematis-viticella/details', 'Clematis viticella'],
    'coacaz-negru': ['H6', 'https://www.rhs.org.uk/plants/106234/ribes-nigrum-b/details'],
    'coacaz-rosu': ['H6', 'https://www.rhs.org.uk/plants/15884/ribes-rubrum/details'],
    'corcodus': ['H6', 'https://www.rhs.org.uk/plants/94416/prunus-cerasifera-f/details'],
    'coriandru': ['H5', 'https://www.rhs.org.uk/plants/4371/coriandrum-sativum/details'],
    'corn': ['H6', 'https://www.rhs.org.uk/plants/4399/cornus-mas/details'],
    'cosmos': ['H3', 'https://www.rhs.org.uk/plants/30717/cosmos-bipinnatus/details'],
    'echinacea': ['H5', 'https://www.rhs.org.uk/plants/41568/echinacea-purpurea/details'],
    'echinops': ['H7', 'https://www.rhs.org.uk/plants/105703/echinops-ritro-l/details'],
    'elebor': ['H7', 'https://www.rhs.org.uk/plants/124882/helleborus-x-hybridus/details', 'Helleborus × hybridus'],
    'facelia': ['H4', 'https://www.rhs.org.uk/plants/23945/phacelia-tanacetifolia/details'],
    'fenicul': ['H5', 'https://www.rhs.org.uk/plants/24472/foeniculum-vulgare/details'],
    'floarea-soarelui': ['H4', 'https://www.rhs.org.uk/plants/105515/helianthus-annuus/details'],
    'gaillardia': ['H5', 'https://www.rhs.org.uk/plants/225964/gaillardia-%C3%97-grandiflora-arizona-sun/details', 'soiul „Arizona Sun”'],
    'galbenele': ['H5', 'https://www.rhs.org.uk/plants/62350/calendula-officinalis/details'],
    'ghiocel': ['H5', 'https://www.rhs.org.uk/plants/7568/galanthus-nivalis/details'],
    'goji': ['H5', 'https://www.rhs.org.uk/plants/86879/lycium-barbarum/details'],
    'gura-leului': ['H2', 'https://www.rhs.org.uk/plants/69565/antirrhinum-majus/details'],
    'gutui': ['H5', 'https://www.rhs.org.uk/plants/5160/cydonia-oblonga-f/details'],
    'iarba-matei': ['H7', 'https://www.rhs.org.uk/plants/52221/nepeta-%C3%97-faassenii/details'],
    'iedera': ['H5', 'https://www.rhs.org.uk/plants/43091/hedera-helix/details'],
    'isop': ['H7', 'https://www.rhs.org.uk/plants/9057/hyssopus-officinalis/details'],
    'kiwi-mic': ['H6', 'https://www.rhs.org.uk/plants/232463/actinidia-arguta-1/details', 'kiwi arguta (soiuri ca „Issai”); kiwi-ul clasic, cu fructe mari, e mai sensibil'],
    'lalele': ['H6', 'https://rhs.org.uk/plants/18512/i-tulipa-gesneriana-i/details'],
    'leustean': ['H6', 'https://www.rhs.org.uk/plants/10030/i-levisticum-officinale-i/details'],
    'levantica': ['H5', 'https://www.rhs.org.uk/plants/91398/lavandula-angustifolia/details'],
    'limba-mielului': ['H5', 'https://www.rhs.org.uk/plants/57301/borago-officinalis/details'],
    'mac': ['H7', 'https://www.rhs.org.uk/plants/56687/papaver-rhoeas/details'],
    'maghiran': ['H2', 'https://www.rhs.org.uk/plants/11919/origanum-majorana/details'],
    'mahonia': ['H5', 'https://www.rhs.org.uk/plants/10730/mahonia-aquifolium/details'],
    'mar': ['H6', 'https://www.rhs.org.uk/plants/60558/malus-domestica-f/details'],
    'marar': ['H4', 'https://www.rhs.org.uk/plants/43298/anethum-graveolens/details'],
    'menta': ['H7', 'https://www.rhs.org.uk/plants/11055/mentha-spicata/details'],
    'monarda': ['H5', 'https://www.rhs.org.uk/plants/11181/monarda-didyma/details'],
    'mosmon': ['H6', 'https://www.rhs.org.uk/plants/11088/mespilus-germanica-f/details'],
    'mur': ['H6', 'https://www.rhs.org.uk/plants/16132/rubus-fruticosus-agg/details'],
    'muscari': ['H6', 'https://www.rhs.org.uk/plants/11247/muscari-armeniacum/details'],
    'narcise': ['H6', 'https://www.rhs.org.uk/plants/11388/narcissus-pseudonarcissus-13/details'],
    'nuc': ['H6', 'https://www.rhs.org.uk/plants/9504/juglans-regia-f/details'],
    'oregano': ['H6', 'https://www.rhs.org.uk/plants/11923/origanum-vulgare/details'],
    'par': ['H6', 'https://www.rhs.org.uk/plants/14227/pyrus-communis-f/details'],
    'piersic': ['H4', 'https://www.rhs.org.uk/plants/156648/prunus-persica/details'],
    'prun': ['H5', 'https://www.rhs.org.uk/plants/84405/prunus-domestica-d-c/details'],
    'roinita': ['H7', 'https://www.rhs.org.uk/plants/11040/melissa-officinalis/details'],
    'rozmarin': ['H4', 'https://www.rhs.org.uk/plants/384211/salvia-rosmarinus-ro/details'],
    'rudbeckia': ['H6', 'https://www.rhs.org.uk/plants/112261/rudbeckia-fulgida/details'],
    'salvia-nemorosa': ['H7', 'https://www.rhs.org.uk/plants/60176/salvia-nemorosa/details'],
    'salvie': ['H5', 'https://www.rhs.org.uk/plants/16356/salvia-officinalis/details'],
    'sedum': ['H7', 'https://www.rhs.org.uk/plants/159311/hylotelephium-spectabile/details', 'Hylotelephium spectabile'],
    'smochin': ['H4', 'https://www.rhs.org.uk/plants/7199/ficus-carica-f/details'],
    'soc': ['H6', 'https://www.rhs.org.uk/plants/16391/sambucus-nigra/details'],
    'trifoi-alb': ['H7', 'https://www.rhs.org.uk/plants/88720/trifolium-repens/details'],
    'trifoi-rosu': ['H7', 'https://www.rhs.org.uk/plants/48388/trifolium-pratense/details'],
    'verbena': ['H4', 'https://www.rhs.org.uk/plants/42079/verbena-bonariensis/details'],
    'visin': ['H6', 'https://www.rhs.org.uk/plants/160703/prunus-cerasus/details'],
    'vita-masa': ['H5', 'https://www.rhs.org.uk/plants/134401/vitis-vinifera/details'],
    'vita-vin': ['H5', 'https://www.rhs.org.uk/plants/134401/vitis-vinifera/details'],
    'zambile': ['H4', 'https://www.rhs.org.uk/plants/52593/hyacinthus-orientalis-delft-blue/details'],
    'zinnia': ['H2', 'https://www.rhs.org.uk/plants/159688/zinnia-elegans/details'],
    'zmeur': ['H6', 'https://www.rhs.org.uk/plants/16137/rubus-idaeus/details']
  };

  // Lowest temperature for each rating (the colder end of its range).
  var MIN = { H1a: 15, H1b: 10, H1c: 5, H2: 1, H3: -5, H4: -10, H5: -15, H6: -20, H7: -25 };
  var RANGE = { H1a: 'peste 15 °C (doar în seră)', H1b: '10…15 °C (doar în seră)', H1c: '5…10 °C (nu suportă frigul)', H2: '1…5 °C (nu suportă înghețul)',
    H3: '−5…1 °C (semi-rezistentă)', H4: '−10…−5 °C', H5: '−15…−10 °C', H6: '−20…−15 °C', H7: 'sub −20 °C (foarte rezistentă)' };

  // Optimum germination temperature for sowing indoors / seedlings (Iowa State University), °C.
  var G = {
    'gura-leului': ['21', '7–14', 'L'], albastrele: ['18–21', '7–14', 'LD'], cosmos: ['21', '5–7', 'D'],
    'floarea-soarelui': ['21', '5–7', 'D'], rudbeckia: ['21', '7–14', 'LD'], zinnia: ['21', '5–7', 'D'],
    busuioc: ['18–21', '10–14', 'D'], marar: ['18–21', '7–14', 'L']
  };

  window.PLANTS.forEach(function (p) {
    var h = H[p.id];
    if (h) {
      var src = 'rhsh_' + p.id;
      window.SOURCES[src] = { t: 'RHS Plants – ' + p.latin + ': hardiness ' + h[0] + ' (EN)', u: h[1] };
      p.hardy = { r: h[0], min: MIN[h[0]], range: RANGE[h[0]], note: h[2] || '' };
      p.src = p.src.concat([src, 'rhs_hardiness']);
      // Only frost-tender ratings change the planting advice; the rest is shown as information.
      if (!p.frost && /^H1|^H2/.test(h[0])) p.frost = 'tender';
    }
    var g = G[p.id];
    if (g) {
      p.germ = { t: g[0], days: g[1], light: g[2] };
      p.src = p.src.concat(['iastate_germ']);
    }
  });
})();
