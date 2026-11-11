// Grapevines. Every text comes from the sources in `src`.
// Vitis is not on the RHS pollinator list, so the bee value is 0 (not confirmed).
var VINE_HOW = 'Plantează din octombrie până în martie, cât solul nu e îmbibat de apă sau înghețat (martie e preferabil în zonele reci). Alege un loc ferit, însorit, cu expunere sud sau sud-vest, departe de locurile joase unde se strânge frigul. Solul trebuie să fie bine drenat, cu pH 6,5–6,8; pe sol greu adaugă materie organică și pietriș.';
var VINE_WATER = 'Vița rezistă destul de bine la secetă, dar udă bine primăvara și vara când e secetă.';

addPlants('vines', [
  {
    id: 'vita-masa', name: 'Viță de vie – struguri de masă', latin: 'Vitis vinifera', life: 'Cățărătoare lemnoasă', sun: 'Soare plin',
    plant: [3, 10, 11], bloom: [], harvest: [9, 10], bee: 0,
    about: 'Distanța între butuci depinde de sistemul de conducere ales (Guyot, cordon cu cepi etc.).',
    how: VINE_HOW,
    water: VINE_WATER,
    care: 'În februarie pune la bază compost matur sau gunoi de grajd bine descompus, ca mulci. Strugurii de masă se pot hrăni la două săptămâni, de la o lună după pornirea în vegetație până la coacere, cu un îngrășământ lichid bogat în potasiu, de preferat organic (de ex. macerat de tătăneasă diluat 1:20). Principala boală este făinarea, mai ales pe vreme caldă și uscată și în locuri înghesuite, fără aer; mai apar mana și putregaiul cenușiu. Vița „plânge” dacă e tăiată târziu: taie-o iarna, cât e în repaus.',
    pick: 'Rodește de la începutul toamnei.',
    src: ['rhs_grapes', 'rhs_organicmatter', 'rhs_homefeed', 'rhs_bleeding']
  },
  {
    id: 'vita-vin', name: 'Viță de vie – soiuri de vin', latin: 'Vitis vinifera', life: 'Cățărătoare lemnoasă', sun: 'Soare plin',
    plant: [3, 10, 11], bloom: [], harvest: [9, 10], bee: 0,
    about: 'Cramele Recaș, cel mai mare producător din zonă, promovează soiurile Fetească Regală, Tămâioasă Românească și Negru de Drăgășani.',
    how: VINE_HOW,
    water: VINE_WATER,
    care: 'În februarie pune la bază compost matur sau gunoi de grajd bine descompus, ca mulci. Principala boală este făinarea; mai apar mana și putregaiul cenușiu. Taie vița iarna, cât e în repaus: tăiată târziu, „plânge”.',
    pick: 'Rodește de la începutul toamnei.',
    src: ['rhs_grapes', 'rhs_organicmatter', 'rhs_homefeed', 'vinorandum_recas', 'rhs_bleeding']
  }
]);
