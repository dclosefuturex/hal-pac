# Echoes of Astryn — Characters, Animation, Levels, and 3D Production Design

## Visual language

Low-poly cinematic science fantasy: readable silhouettes, emissive memory-light, dark stone and brass, painterly gradients, and no borrowed franchise assets. Every model is constructed procedurally from reusable Three.js primitives and custom geometry, keeping the shipped game compact and coherent.

## Character model and animation manifest

All humanoids share a lightweight hierarchical rig: root, hips, torso, head, upper/lower arms, weapon pivot, upper/lower legs. Animation is code-driven with pose curves rather than baked clips.

| Character | Model silhouette and materials | Required animations |
|---|---|---|
| Kael | Navy courier coat, red scarf, asymmetrical shoulder guard, black hair, cyan-red Vesper blade | idle breathing, run, turn lean, sword slash 1/2, charged arc, hit, cast item, victory, dialogue nod |
| Mira | White/teal engineer mantle, luminous prism staff, copper braid, floating lens rings | idle calibration, run, staff bolt, barrier cast, heal, analyze, hit, victory |
| Rook | Broad brass armor, worn crimson cape, gunlance with glowing chamber | guarded idle, heavy run, thrust, cannon recoil, block/counter, hit, kneel, victory |
| Pip | Small angular fox body, long antenna ears, projector tail, cyan face pixels | hover idle, scamper, scan beam, memory projection, surprise spin, damage flicker |
| Lyra/Cantor | White suspended dress fragmented into light ribbons, red pendant, halo rig | suspended idle, reach, sing pulse, glitch, collapse, reunion embrace |
| Seraph | Tall ivory regent armor, mirror glaive, gold half-mask | formal idle, glide, glaive chain, mirror split, stagger, unmasked defeat |
| Morrow | Constellation head assembled from particles and orbiting rings | assemble, speak ripple, fracture, phase transition, dissolve |

### Enemy families

- **Veil Wisps:** tetrahedral cores with ribbon trails; hover, dart, burst.
- **Hollowed:** pale citizens with silver face planes; shuffle, lunge, memory scream.
- **Glass Stags:** faceted quadrupeds with branching luminous antlers; charge, skid, shatter.
- **Noon Guard:** brass soldiers with rectangular shields; patrol, strike, brace.
- **Drowned Rays:** floating wing meshes; orbit, dive, gravity pulse.
- **Memory Doubles:** translucent recolors of heroes using mirrored player animations.

### Boss models

- **Ossia:** six-legged black crystal beast, masks orbiting its rib cage.
- **Gilded Judge:** 4-meter brass automaton with rotating law tablets and hammer arms.
- **Nhal:** segmented sky leviathan circling the arena, with emissive eye fins.
- **Seraph Ascendant:** Seraph plus three mirrored afterimage rigs.
- **Quiet God:** procedural star field, nested rings, facial line segments, and arena-scale hands.

## Combat animation grammar

- Anticipation frames are exaggerated for readability.
- Each strike has wind-up, active, recovery, and cancel windows.
- Hit stop: 55–90 ms, camera impulse, emissive flash, and particles.
- Player actions: quick attack, skill, dodge, character switch, healing pulse.
- Party AI occupies an orbit around the target and uses cooldown abilities.
- Boss telegraphs use ground glyphs, color, and an audio cue; no unavoidable damage.

## Level and scene sheets

### 1. Liora — Memory in the Rain

**Art:** midnight stone terraces, violet rain, canals reflecting cyan lanterns, central spiral spire.

**Topology:** festival plaza → market bridge → flooded stair → spire courtyard. Compact tutorial loop with sightline back to the spire.

**Scenes:** lantern procession; Nia at the ritual rail; spire overload; first Lyra apparition; Mira's skiff crash.

**Gameplay:** movement, interaction, first attacks, two wisp groups, Hollowed mini-boss. Three lanterns contain optional citizen memories.

**3D kit:** wet tile planes, arched bridges, stacked homes, awnings, lantern instancing, canal water shader, 45-meter helical spire, rain particles.

### 2. Viridia — Roots That Remember

**Art:** giant turquoise glass trees, gold spores, roots suspended over luminous fog.

**Topology:** three branching memory paths reconnect at Root Cathedral. Each branch presents a party-memory shrine and combat clearing.

**Scenes:** Pip awakening; Kael's false drowning memory; Rook confrontation; Lyra's first seal recording.

**Gameplay:** activate memory obelisks to grow bridges; fight wisps and stags; Ossia boss in circular root arena.

**3D kit:** tapered trunk cylinders, crystalline leaf clusters, spline-like root bridges, shrine arches, fog plane, cathedral ribs, fear-mask orbiters.

### 3. Vanta — City Without Shadows

**Art:** vertical brass blocks under a white artificial sun; hard black accents but literally no cast shadows in story spaces.

**Topology:** lower gate → lift spine → rooftop parade → Hall of Noon → foundry. Multiple ramps allow stealthy bypasses.

**Scenes:** masked parade; Seraph's tea-table ultimatum; seven-second Veil drop; Rook's name wall.

**Gameplay:** patrol vision cones, shield guards, foundry switches, Gilded Judge law phases.

**3D kit:** modular brass towers, suspended trams, banners, mask crowd instances, rotating foundry gears, law tablets, sun disc.

### 4. Drowned Sky — Observatory of Ends

**Art:** islands suspended over a black sun, an ocean on the ceiling, blue-white ruins pointing downward.

**Topology:** airship dock → rotating gravity causeway → three observatory lenses → central orrery.

**Scenes:** Pip identity conversation; true history planetarium; Morrow's survival calculation; third seal reveals Lyra.

**Gameplay:** rotating bridge alignment, low-gravity jumps represented by launch pads, Drowned Rays, Nhal orbit boss.

**3D kit:** inverted ocean dome, broken marble islands, star particles, ring orrery, telescope arrays, animated leviathan segments.

### 5. Occupied Liora — Home Is What Hurts

**Art:** the tutorial city drained nearly monochrome; lanterns reignite as memories are restored.

**Topology:** same recognizable plaza transformed, plus Kael home interior and campfire overlook.

**Scenes:** Nia reunion; four private temptations; Lyra's letter; campfire bond conversation.

**Gameplay:** no mandatory combat. Restore three memory anchors, talk to citizens, choose party bond, gather supplies.

**3D kit:** altered Liora kit, silver vines, abandoned stalls, small home diorama, overlook, reactive lantern colors.

### 6. Crown Spire — The Crown of Quiet

**Art:** impossible white tower within the aurora; floors are floating memory fragments separated by star-filled void.

**Topology:** three ascending combat memories → Seraph arena → Cantor cathedral → Morrow arena.

**Scenes:** each hero confronts a private mercy; Seraph regains himself; Kael/Lyra reunion; final argument; ending choice and epilogue.

**Gameplay:** mixed enemy gauntlet, resonance lifts, Seraph duel, four-stage Morrow encounter, protect-Mira finale.

**3D kit:** floating stair segments, memory diorama platforms, mirror planes, cathedral ribs, Lyra suspension rig, constellation Morrow, aurora sky dome.

## Technical scene model

Each level is a data object containing palette, fog, player spawn, navigation bounds, props, lights, enemies, Echo locations, interactions, encounter triggers, and exit condition. Geometry factories construct the 3D scene from this data. This makes every described location a real model in the shipped build rather than concept art disconnected from play.

## Audio plan

Web Audio synthesis avoids external copyrighted audio:

- Liora: rain noise, glass bells, minor pentatonic pad.
- Viridia: filtered wind, wooden pulses, distant reversed chimes.
- Vanta: metallic ostinato and authoritarian snare.
- Drowned Sky: low choir-like oscillators and sonar notes.
- Crown: motifs from all regions layered into the final pulse.
- Combat uses responsive percussion, impact noise, and rising combo arpeggios.

## Accessibility and controls

- Keyboard: WASD/arrows move, mouse or Q/E camera, Space attack, 1–3 skills/switch, F interact, Shift dodge, Esc pause.
- Mobile: virtual movement pad, attack, skill, interact; swipe camera.
- Reduced-motion toggle, high-contrast telegraphs, dialogue text-speed control, mute.
- Autosave at every scene transition and after Echo collection.

## Definition of done

- Complete playable narrative spine from Liora through one of two endings.
- Six modeled environments, hero party, principal NPCs, enemy families, and bosses represented in 3D.
- Exploration, dialogue, combat, leveling, party abilities, collectibles, save/load, pause, audio, and mobile controls.
- Launcher card, production deployment, and live smoke test.
