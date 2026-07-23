# Neon Metro — Production Plan

## Product goal

Build an original, polished three-lane endless runner for HAL Arcade. The game
should deliver the speed, readability, progression, and tactile satisfaction
players expect from the genre while using original names, visuals, characters,
and code.

## Experience pillars

1. **Immediate control** — keyboard, touch, and swipe input must feel responsive.
2. **Readable speed** — obstacles are challenging but telegraphed through shape,
   color, motion, and lane placement.
3. **Constant rewards** — coins, combos, near misses, missions, power-ups, and
   escalating score multipliers create a reason to keep running.
4. **Arcade spectacle** — pseudo-3D rails, trains, city lights, particles,
   character animation, screen shake, and sound make the game feel alive.
5. **One-click play** — no account, download, framework, or external asset fetch.

## Feature scope

### Movement

- Three-lane left/right switching
- Jump with airborne obstacle clearance
- Roll/duck with reduced collision height
- Keyboard: arrows or WASD
- Touch: swipe left/right/up/down
- Responsive lane interpolation and character squash/stretch

### Run systems

- Procedurally generated track segments
- Static barriers, overhead signs, moving and parked trains
- Ramps and elevated coin arcs
- Increasing speed and spawn complexity
- Coin collection and distance scoring
- Combo multiplier with decay
- Near-miss rewards
- Local high score and lifetime coin persistence

### Power-ups

- Coin magnet
- Hoverboard collision shield
- Jetpack flight with aerial coin trail
- Score booster

### Objectives and feedback

- Three rotating run missions
- Mission completion rewards
- Start countdown
- Pause/resume
- Game-over summary and instant restart
- HUD for score, coins, multiplier, distance, power-up, and mission progress
- Particles, floating callouts, screen shake, and speed lines
- Generated Web Audio effects with mute control

### Presentation

- Original “Neon Metro” identity
- Nighttime neon-city skyline
- Perspective rails, sleepers, tunnels, signage, trains, and lane lighting
- Animated runner with distinct run, jump, roll, and jetpack poses
- Responsive desktop/mobile layout
- Arcade launcher card

## Acceptance criteria

- Game loads from `neon-metro.html` without console errors.
- All keyboard and swipe controls work.
- Every obstacle can be avoided with the supported movement set.
- All four power-ups activate and expire correctly.
- Collision, shield consumption, scoring, coins, multiplier, missions, pause,
  restart, and local persistence operate correctly.
- Canvas remains legible and playable at desktop and mobile viewport sizes.
- Main arcade lists the game as Game 009 and links to it.
- JavaScript syntax checks pass.
- Automated browser smoke tests cover load, start, movement, pause, and restart.
- Production GitHub Pages URL returns HTTP 200 and displays the deployed game.

