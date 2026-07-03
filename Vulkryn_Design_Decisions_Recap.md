# Project Vulkryn — Design Decisions Recap

## Core Identity
- **Genre blend:** Diablo + Pokémon overworld + Hades roguelite progression, with WoW Mythic+ scaling dungeons
- **Combat feel:** Kill Knight/Hades-style — decoupled mouse-aim, WASD movement, dash with i-frames
- **Combat philosophy:** Dodge-primary, not damage-mitigation-primary. Getting hit = a positioning mistake, not an assumed cost. Class defensive tools (heals, shields, parries) are a "seatbelt," not the core loop.
- **Dungeon structure:** Hand-crafted room templates, procedurally arranged (Slay the Spire/Hades model) — not fixed dungeons, not pure random generation
- **Difficulty scaling:** Mythic+-style tiered scaling on the *same* dungeon, no punishing affixes (community has soured on those in real WoW) — only positive modifiers

## Controls
- Movement: WASD
- Aim: decoupled, mouse-position based (works for ranged especially; melee may lean facing-direction feel via animation)
- Abilities: clustered near WASD — Left Click / Right Click / Space / Shift / Q / E / R — **not** the WoW number row, since off-hand travel breaks twitch combat
- Number row (1-4): reserved for consumables/potions only, not core kit
- Dash: has i-frames, duration/window can vary by class (short + precise for Rogue, longer/more forgiving for tankier classes)

## Classes (v1)
- **5-6 base abilities per class**, no talent trees at launch
- Fully filled skill trees eventually (v1.5/v2) — since every player unlocks the *whole* tree eventually, balance concern is about unlock order/feel, not competing builds
- Melee vs. ranged risk/reward: melee = higher risk (must be in range) but higher/faster damage; ranged = safer, needs generous telegraphs to stay balanced
- Example kit worked out (Paladin): basic attack (upgradeable to AoE), Divine Storm (AoE clear, long CD), Basic Heal (medium CD "seatbelt"), Divine Shield (absorb shield), Ultra (temporary massive damage buff, charged via in-run currency like Kill Knight's blood shards)
- Start with **3-4 classes**, playtest for fun over balance pre-launch (fun = top priority; brokenness, not imbalance, is the real launch risk)

## Races
- **Cosmetic only** — no stat differences
- Launch with **Human only**; add Elf → Orc → Dragonoid post-launch as content-update "re-launch moments"
- Frame-by-frame animation for v1 (simpler, matches current art-learning stage); revisit Spine/skeletal animation only if race #2 redraw pain becomes unbearable

## Run Structure / Progression Loop
- **Temporary (per run):** class abilities + random positive ability *upgrades* offered between floors (not new abilities — modifies existing ones, e.g. "fireball now pierces"). This avoids needing new sprite animations per combo.
- **Permanent (carries between runs):** gold, gear, XP/levels, unlocks
- Talent trees deferred to v1.5 as a major "re-launch" content drop
- This mirrors real WoW Mythic+ affixes conceptually, but only ever *positive* modifiers — no artificial handicaps

## Onboarding / Opening Structure
- Class-specific short intro cutscene (same skeleton: quiet personal moment → mysterious letter/summons → same destination "Three Moons Inn" → drop into dungeon)
- Player drops into **first dungeon immediately** (Hades-style hook), not a slow overworld tutorial
- Ability drip-feed: 1 ability → explore → 2nd ability (pre/at first boss) → 3rd ability mid-dungeon-2, etc. Temp modifiers introduced once player has enough abilities to understand upgrades.
- After dungeon 1: player is free to explore overworld/quests OR keep re-running dungeon 1 (which will feel different each time due to procedural template arrangement) — Pokémon-style grinding freedom, player's choice

## Overworld
- Small, dense zones for v1 (not a massive open world) — one city hub + 2-3 explorable zones, enough to deliver quest tendril story
- Overworld must be immediately engaging, not a "loading screen between dungeons" — needs visible hooks from minute one
- Quest design: **quest tendrils**, not WoW fetch-quests — mundane-sounding tasks that unravel into bigger story threads via visual/environmental storytelling (e.g., purple-eyed corrupted wolves) so even players who skip text still absorb the "something's wrong" hook
- Normal-mode dungeons are unlocked/discovered via overworld exploration; scaling/Mythic+-style dungeons unlock at level cap

## Loot System
- **Dungeons:** drip-fed per run via mini-boss "pity" system, not end-of-run lump sum, not every room
  - Example structure (3 mini-bosses + final boss): 25% → 50% → 75%(ish) → 100% cumulative guaranteed drop chance, final boss always guarantees a drop regardless of earlier RNG
  - Nets to **~1 piece of gear per run on average** — matches original "don't over-gear too fast" instinct
  - Normal-mode (pre-level-cap) dungeons use the same drip system, just lower-tier gear values — this stage needs loot feedback *more*, not less, since players are still learning their kit
- **Overworld:** different loot tier — cosmetics, consumables, gold, crafting mats, story items. Never competes with dungeon gear tiers, or dungeons become optional.
- Rejected WoW's zero-guarantee personal loot model — that design serves subscription retention (keep the chase infinite), which doesn't apply to a one-time-purchase game where every session needs to feel worth it

## Monetization
- **Flat one-time purchase** (~$10-20 range), not subscription — subscriptions breed resentment in indie/one-time-purchase market expectations
- Optional: cosmetic-only supporter subscription (Patreon-style) is the *only* acceptable recurring-revenue model if ever explored
- Post-launch revenue: paid expansions/DLC (Stardew/Haunted Chocolatier model), not season passes

## Platform / Technical
- Built in **Phaser.js + Vite**, staying the course over RPG Maker (RPG Maker faster for city/NPC/quest systems, but fights against procedural dungeons — which are Vulkryn's core identity)
- Desktop distribution via **Electron or NW.js** wrapper (same pipeline Vampire Survivors used) → submit to Steam
- Art pipeline: Procreate (concept sketches) → Pixaki Pro on iPad (pixel art + animation, Aseprite-compatible) → Phaser
- Music: leveraging existing musicianship (guitar/piano/ukulele/drums) → MIDI composition → GarageBand/LMMS; Bfxr/Chiptone for SFX

## Business / Distribution Strategy
- Steam as primary platform; itch.io as secondary via Steam key distribution (avoids Steam's 30% cut on those sales — stay well under the informal "more sold on Steam than off" ratio)
- No publisher for now — revisit only when a working demo exists and full-time transition or console ports are the goal; never sign away IP
- Kickstarter: viable later as a **community/visibility play**, not primarily a funding mechanism — needs a polished demo first
- Early Access recommended as the realistic v1 launch path given current financial runway (~3 months) — ship a vertical slice (one dungeon, one class, core loop, placeholder art), iterate publicly like Hades/Slay the Spire did, not like Heartbound's stalled 8-year Early Access

## Reference Game Benchmarks (for context)
| Game | Structure Borrowed For Vulkryn |
|---|---|
| Hades | Combat feel, dash i-frames, hub structure, hand-crafted rooms + procedural arrangement, "seatbelt" defensive design |
| Kill Knight | Decoupled aim/dash feel, i-frame implementation reference |
| Slay the Spire | Node-map procedural structure (skeleton, not card/turn-based skin) |
| Vampire Survivors | Proof that web-tech (Phaser-adjacent) → Electron/NW.js → Steam is a legitimate, proven pipeline |
| WoW | Class fantasy, Mythic+ scaling concept (minus affixes), quest-tendril storytelling as reaction *against* WoW's fetch-quest model |
| Stardew Valley | Long-tail post-launch investment model; solo-dev feasibility proof |
| Heartbound / Interstellaria | Cautionary tales — scope/finishing risk, core-loop-friction risk |

## Open / Deferred Questions
- Whether to eventually build multiple distinct dungeons/biomes (yes, planned — v1.5+, each a "re-launch moment")
- Whether talent trees need full UI complexity or can stay simple given "everyone eventually maxes the tree" design (deferred to v1.5)
- Exact class defensive kit tuning per class (Rogue/Warrior/Mage still need same level of detail as the Paladin example)
