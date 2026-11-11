/*
 * Core data definitions shared by all plant data files.
 *
 * Plant entry schema (all user-facing text is in Romanian):
 *   id       - unique slug
 *   name     - Romanian common name
 *   latin    - botanical name
 *   life     - life form label (e.g. "Perenă", "Anuală", "Pom")
 *   sun      - light requirement
 *   plant    - months (1-12) when it can be planted / sown OUTDOORS (orientative, Romanian lowlands;
 *              the weather module adjusts for the user's location)
 *   bloom    - months when it flowers (used for the bee calendar)
 *   harvest  - months when it can be harvested (empty for purely ornamental plants)
 *   bee      - bee interest: 2 = confirmed by a source (RHS / LWG Bayern), 0 = not enough information.
 *              (Nectar/pollen are not graded: no source found that grades all plants. 1 and 3 are unused.)
 *   about    - one-line description
 *   how      - how to plant
 *   water    - watering advice
 *   care     - general care
 *   pick     - harvesting advice (optional)
 */

window.CATEGORIES = [
  { id: 'aromatic',   name: 'Plante aromatice',       short: 'Aromatice',  icon: '🌿', color: '#8cc06a' },
  { id: 'flowers',    name: 'Flori ornamentale',      short: 'Flori',      icon: '🌼', color: '#e07c4c' },
  { id: 'trees',      name: 'Pomi fructiferi',        short: 'Pomi',       icon: '🌳', color: '#6fbf4c' },
  { id: 'shrubs',     name: 'Arbuști și fructe mici', short: 'Arbuști',    icon: '🫐', color: '#a98be0' },
  { id: 'vines',      name: 'Viță de vie',            short: 'Viță de vie',icon: '🍇', color: '#d77aa8' },
  { id: 'climbers',   name: 'Plante cățărătoare',     short: 'Cățărătoare',icon: '🌱', color: '#3fb8a8' },
  { id: 'vegetables', name: 'Legume',                 short: 'Legume',     icon: '🥕', color: '#e6a03a' }
];

window.MONTHS = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

window.MONTHS_SHORT = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];

window.PLANTS = [];

/**
 * Registers a list of plants under a category.
 * @param {string} cat - category id from window.CATEGORIES
 * @param {Array<Object>} list - plant entries (see schema above)
 */
window.addPlants = function (cat, list) {
  list.forEach(function (p) {
    p.cat = cat;
    p.plant = p.plant || [];
    p.bloom = p.bloom || [];
    p.harvest = p.harvest || [];
    if (typeof p.bee !== 'number') p.bee = 0;
    window.PLANTS.push(p);
  });
};
