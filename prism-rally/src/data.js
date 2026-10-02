/** Original cast, circuits and tuning for Prism Rally. No external assets. */
export const RACERS = [
  { id: 'pip', name: 'Pip Volt', color: '#ffcf45', accent: '#ff7259', animal: 'fox', stats: { speed: 4, accel: 5, handling: 4 }, bio: 'A sun-chasing courier with a talent for impossible overtakes.' },
  { id: 'nova', name: 'Nova Drift', color: '#aa8aff', accent: '#f5c4ff', animal: 'cat', stats: { speed: 5, accel: 3, handling: 5 }, bio: 'Quiet confidence. Loud engines. Every corner is a signature.' },
  { id: 'moss', name: 'Moss Mochi', color: '#89dd92', accent: '#ffe1a1', animal: 'bear', stats: { speed: 5, accel: 4, handling: 3 }, bio: 'The forest mechanic whose homemade kart runs on optimism.' },
  { id: 'rio', name: 'Rio Rocket', color: '#ff816e', accent: '#ffeeac', animal: 'bird', stats: { speed: 5, accel: 5, handling: 2 }, bio: 'A fearless little aviator who prefers the scenic shortcut.' },
  { id: 'pearl', name: 'Pearl Tide', color: '#6de6dc', accent: '#d4fbff', animal: 'otter', stats: { speed: 4, accel: 4, handling: 5 }, bio: 'A coastal explorer with a smooth line through any storm.' },
  { id: 'bean', name: 'Bean Dash', color: '#ffc5e7', accent: '#a997ff', animal: 'rabbit', stats: { speed: 3, accel: 5, handling: 5 }, bio: 'Small paws, big ambition, and an exceptionally quick getaway.' },
  { id: 'axel', name: 'Axel Ember', color: '#ffad57', accent: '#ff655d', animal: 'tiger', stats: { speed: 5, accel: 4, handling: 3 }, bio: 'A mountain racer who treats every straight like a launchpad.' },
  { id: 'orbit', name: 'Orbit Byte', color: '#78baff', accent: '#e6f0ff', animal: 'robot', stats: { speed: 4, accel: 4, handling: 4 }, bio: 'A friendly navigation bot discovering the joy of getting sideways.' },
];

export const CUPS = [
  { id: 'sunbeam', name: 'Sunbeam Cup', description: 'Bright skies. Open roads. Your story starts here.', color: '#ffd36b' },
  { id: 'wildside', name: 'Wildside Cup', description: 'Follow the wild road beyond the horizon.', color: '#82e2bd' },
  { id: 'starlight', name: 'Starlight Cup', description: 'Chase the glow. Leave a little stardust.', color: '#bb9aff' },
];

export const DIFFICULTIES = [
  { id: 'cruise', name: 'Cruise', speed: 0.85, ai: 0.82, description: 'Easygoing rivals and time to find your line.' },
  { id: 'sport', name: 'Sport', speed: 1, ai: 0.96, description: 'A lively race with room for a little mischief.' },
  { id: 'turbo', name: 'Turbo', speed: 1.16, ai: 1.08, description: 'Fast company. Every corner counts.' },
];

// Angular ordering guarantees simple, non-crossing loops. Distinct radial
// profiles supply sweepers, pinches and technical sections to the renderer.
function loop(rx, ry, radii, rotation = 0) {
  return radii.map((r, i) => {
    const a = i / radii.length * Math.PI * 2 + rotation;
    return [Math.round(1000 + Math.cos(a) * rx * r), Math.round(1000 + Math.sin(a) * ry * r)];
  });
}
const track = (id, name, cup, theme, colors, rx, ry, radii, extra = {}) => ({
  id, name, cup, theme, road: colors[0], ground: colors[1], sky: colors[2], horizon: colors[3],
  points: loop(rx, ry, radii, extra.rotation || 0), width: 116,
  obstacles: [], surfaces: [], jumpZones: [], boostZones: [], ...extra,
});

export const TRACKS = [
  track('sunny-shores', 'Sunny Shores', 'sunbeam', 'coast', ['#716f80', '#e5c78d', '#a8e4f8', '#66c9d2'], 770, 570,
    [1,1,.97,.94,.91,.91,.96,1,1.02,1,.94,.92,.96,1,1.02,1], {
      description: 'A breezy seaside circuit with broad corners and salty air.', width: 136,
      boostZones: [{ from: .18, to: .22 }, { from: .69, to: .73 }],
      obstacles: [{ t: .39, offset: .32, type: 'cone' }, { t: .83, offset: -.36, type: 'cone' }],
    }),
  track('clover-cruise', 'Clover Cruise', 'sunbeam', 'meadow', ['#858792', '#89ba79', '#bce6ef', '#6b9c74'], 710, 650,
    [1,.95,.8,.8,.98,1.04,1,.9,.82,.91,1.06,1,.82,.8,.95,1.05], {
      description: 'Rolling green hills and a garden of graceful bends.',
      surfaces: [{ from: .37, to: .42, type: 'mud' }],
      boostZones: [{ from: .08, to: .12 }, { from: .76, to: .8 }],
      obstacles: [{ t: .55, offset: -.3, type: 'hay' }],
    }),
  track('citrus-circuit', 'Citrus Circuit', 'sunbeam', 'desert', ['#ab847d', '#dfac74', '#fce0b4', '#c99178'], 790, 610,
    [1,.99,.84,.72,.9,1,.93,.76,.91,1,.95,.78,.8,.97,1.04,1], {
      description: 'Warm sandstone, orange groves and a springboard finish.', width: 122,
      jumpZones: [{ from: .82, to: .85 }],
      surfaces: [{ from: .24, to: .29, type: 'sand' }],
      boostZones: [{ from: .56, to: .6 }],
      obstacles: [{ t: .65, offset: .28, type: 'rock' }, { t: .14, offset: -.38, type: 'cone' }],
    }),
  track('harbor-hop', 'Harbor Hop', 'sunbeam', 'harbor', ['#647c92', '#639eaf', '#c3e8ee', '#72b5c5'], 740, 670,
    [1,.92,.72,.83,1,.98,.76,.7,.95,1.04,.96,.78,.72,.93,1,.96], {
      description: 'Skip across the docks of a colorful little harbor.', width: 113,
      jumpZones: [{ from: .16, to: .2 }, { from: .65, to: .69 }],
      boostZones: [{ from: .62, to: .65 }],
      obstacles: [{ t: .34, offset: -.27, type: 'crate' }, { t: .79, offset: .3, type: 'crate' }],
    }),
  track('fernway', 'Fernway Run', 'wildside', 'forest', ['#74877f', '#3f806d', '#b1ded1', '#376c61'], 690, 740,
    [1,.87,.68,.76,1,.96,.82,.65,.83,1,.99,.77,.7,.85,1.08,1], {
      description: 'A winding trail beneath an endless emerald canopy.', width: 108,
      surfaces: [{ from: .24, to: .31, type: 'mud' }, { from: .7, to: .76, type: 'mud' }],
      boostZones: [{ from: .43, to: .47 }],
      obstacles: [{ t: .56, offset: .35, type: 'log' }, { t: .86, offset: -.25, type: 'log' }],
    }),
  track('frostpeak', 'Frostpeak Pass', 'wildside', 'snow', ['#9eacc1', '#dce9ec', '#cedcf2', '#8ba7c5'], 740, 710,
    [1,.9,.72,.78,.98,1.06,.91,.68,.7,.95,1.04,.95,.77,.7,.88,1], {
      description: 'Carve a clean line through soft snow and slippery switchbacks.', width: 118,
      surfaces: [{ from: .16, to: .27, type: 'ice' }, { from: .6, to: .72, type: 'ice' }],
      jumpZones: [{ from: .42, to: .46 }],
      boostZones: [{ from: .87, to: .9 }],
      obstacles: [{ t: .34, offset: -.4, type: 'rock' }],
    }),
  track('ember-ridge', 'Ember Ridge', 'wildside', 'volcano', ['#74657d', '#855458', '#f9ba9a', '#a16774'], 770, 660,
    [1,.98,.76,.64,.84,1.05,.96,.72,.83,1.03,.87,.65,.79,1.04,1.06,.94], {
      description: 'Warm volcanic stone and daring leaps above glowing fissures.', width: 104,
      jumpZones: [{ from: .3, to: .34 }, { from: .78, to: .82 }],
      boostZones: [{ from: .27, to: .3 }, { from: .75, to: .78 }],
      obstacles: [{ t: .13, offset: .3, type: 'rock' }, { t: .54, offset: -.28, type: 'rock' }],
    }),
  track('canyon-clouds', 'Canyon Clouds', 'wildside', 'canyon', ['#ab8a95', '#c89986', '#e7d3ec', '#ae859e'], 780, 700,
    [1,.81,.69,.93,1,.76,.68,.92,1.05,.93,.66,.73,1,.97,.76,.85], {
      description: 'A ribbon of road threaded through rose-colored cliffs.', width: 100,
      surfaces: [{ from: .51, to: .57, type: 'sand' }],
      jumpZones: [{ from: .88, to: .92 }],
      boostZones: [{ from: .21, to: .25 }],
      obstacles: [{ t: .4, offset: -.28, type: 'rock' }, { t: .73, offset: .34, type: 'rock' }],
    }),
  track('neon-gardens', 'Neon Gardens', 'starlight', 'neon', ['#575477', '#31345c', '#27284c', '#545280'], 750, 710,
    [1,.93,.69,.71,.95,1.02,.74,.67,.94,1.04,.84,.66,.83,1.03,.96,.77], {
      description: 'Electric avenues bloom beneath the violet evening sky.', width: 111,
      boostZones: [{ from: .11, to: .16 }, { from: .46, to: .51 }, { from: .8, to: .84 }],
      obstacles: [{ t: .3, offset: .31, type: 'moving' }, { t: .67, offset: -.32, type: 'barrier' }],
    }),
  track('moon-mirage', 'Moon Mirage', 'starlight', 'moon', ['#8c89b0', '#777398', '#252848', '#555577'], 760, 690,
    [1,.87,.69,.87,1.04,.91,.65,.74,1.01,1.02,.77,.63,.86,1.04,.88,.76], {
      description: 'Float over silver dunes on the far side of the dream.', width: 115,
      jumpZones: [{ from: .18, to: .23 }, { from: .56, to: .61 }, { from: .84, to: .88 }],
      surfaces: [{ from: .34, to: .39, type: 'sand' }],
      boostZones: [{ from: .53, to: .56 }],
      obstacles: [{ t: .71, offset: .28, type: 'rock' }],
    }),
  track('aurora-arc', 'Aurora Arc', 'starlight', 'aurora', ['#7285a5', '#719aaa', '#233d65', '#588b9c'], 740, 730,
    [1,.8,.67,.83,1.04,.88,.68,.88,1.03,.83,.64,.76,1,.94,.7,.84], {
      description: 'Ribbons of northern light lead the way through crystalline curves.', width: 102,
      surfaces: [{ from: .12, to: .23, type: 'ice' }, { from: .47, to: .57, type: 'ice' }, { from: .77, to: .83, type: 'ice' }],
      boostZones: [{ from: .33, to: .37 }, { from: .89, to: .93 }],
      obstacles: [{ t: .65, offset: -.35, type: 'timed' }],
    }),
  track('prism-parade', 'Prism Parade', 'starlight', 'rainbow', ['#847baf', '#787fae', '#cdc5ef', '#a5a1cc'], 790, 720,
    [1,.82,.67,.91,1.02,.78,.64,.84,1.06,.88,.66,.81,1.01,.91,.68,.86], {
      description: 'One last celebration above the clouds. Make every color count.', width: 98,
      boostZones: [{ from: .07, to: .11 }, { from: .39, to: .43 }, { from: .74, to: .78 }],
      jumpZones: [{ from: .43, to: .47 }, { from: .78, to: .82 }],
      surfaces: [{ from: .58, to: .65, type: 'ice' }],
      obstacles: [{ t: .24, offset: .31, type: 'crystal' }, { t: .91, offset: -.31, type: 'crystal' }],
    }),
];

// Optional alternate route schema: from/to are normalized progress through the
// original control-point loop (segment index / points.length); points include
// both endpoints. Draw this polyline as a second drivable road and project cars
// onto it, mapping branch progress linearly to [from,to] for fair race ranking.
// The inward route is shorter but deliberately narrow: branches[].width.
for (const [id, start, end] of [['clover-cruise', 2, 5], ['fernway', 9, 12], ['neon-gardens', 5, 8]]) {
  const circuit = TRACKS.find(t => t.id === id);
  const a = circuit.points[start], b = circuit.points[end];
  circuit.branches = [{ from: start / 16, to: end / 16, width: 65,
    points: [a, [Math.round(a[0] * .67 + b[0] * .33), Math.round(a[1] * .67 + b[1] * .33)],
      [Math.round(a[0] * .33 + b[0] * .67), Math.round(a[1] * .33 + b[1] * .67)], b],
  }];
}
