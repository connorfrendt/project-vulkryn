# Project Vulkryn — App Spec

## What This Is

A 2D roguelite RPG built solo, blending:
- **Pokémon-style** top-down overworld exploration
- **Diablo-style** dungeon combat and loot
- **Hades-style** meta-progression and narrative delivery
- **WoW-inspired** systems throughout (gear points, talent trees, resistances, class trainers)

Target platforms: **Steam** and **itch.io**. Built by a solo developer (self-taught JS/TS, math degree, martial arts background, musician) with a strong preference for hands-on iterative building over heavy upfront design docs — this spec exists to give any collaborator (human or AI) full context, not to lock the design in stone.

## Why This Exists / Market Position

Existing roguelites and RPGs generally pick ONE of: exploration depth (Pokémon), combat depth (Diablo), or narrative depth (Hades/Undertale). Vulkryn's bet is combining all three, with a **standout differentiator**: an AI-generated backstory quest system.

**The core viral hook:** Traditional fetch quests ("kill 10 wolves") are explicitly rejected. Instead, quests are delivered via **"tendrils"** — environmental visual/narrative hooks (e.g., wolves with swirling purple eyes) that communicate story *through gameplay*, not text walls. This is directly inspired by Hades' approach of feeding narrative during play rather than via cutscenes or quest logs. This system is the single most important thing to protect and prioritize — it's what makes Vulkryn different from every other roguelite on Steam.

**Primary risk:** scope. The concept fills a real gap, but as a solo dev project, shipping is the hard part, not designing. Every feature below should be built with "can I actually finish this" in mind before "wouldn't this be cool."

## Design Pillars (decided, non-negotiable unless revisited deliberately)

1. **Gear defines you, not your race.** Character stats derive entirely from equipped items via getters. There are no base stats on the character itself — a naked level 50 character and a naked level 1 character are mechanically identical.
2. **Race is cosmetic only.** No stat modifiers per race. This was a deliberate reversal from the initial design (which had race give stat bonuses) — the reasoning was to avoid "optimal race" meta-gaming and let race choice be pure self-expression, similar to WoW players who race-change for looks, not stats.
3. **Story is shown, not told.** No fetch-quest text walls. Environmental storytelling via quest tendrils.
4. **Nested data structures over flat.** Item stats, loot tables, etc. use nested objects (e.g., `item.stats.strength`) rather than flat key-value pairs, prioritizing readability over minimal typing.
5. **Build in pebbles, not mountains.** Every system gets built as a small, working, testable increment — not a big-bang implementation.

## Feature Set

### ✅ Built (as of this spec)

- **Player class** — level, hp/maxHp, gold, abilities array, talent points, gear points (total + allocated: haste/crit/mastery/vers), equipment slots (head/chest/shoulders/waist/legs/feet/hands/trinket/relic/mainHand/offHand), consumables (fire/frost/shadow resistance potions), inventory (max 6). Stats (strength/agility/intellect/armor/resistances) are getters derived by summing equipped item stats. `levelUp()` increments level, talent points, gear points, and heals to full.
- **Item system** — data/factory/world-instance separation:
  - `itemData.js`: item definitions keyed by `itemId`
  - `Item.js`: blueprint class (name, slot, nested `stats` object)
  - `itemFactory.js`: `createItem(itemId)` factory function
  - `itemSpawns.js`: array of `{itemId, x, y}` spawn definitions
  - `WorldItem.js`: wraps an item with a world sprite, fires `onPickup` callback on click
- **Inventory/equip loop** — world → backpack (`addToInventory`) → equipped (`equipment[slot]`), fully reversible.
- **CharacterSheet UI** — toggled with `C`, data-driven slot loop renders all equipment slots.
- **Backpack UI** — toggled with `B`, 2x3 grid (6 slots), left-click world items to pick up, right-click backpack items to equip.
- **Enemy class** — HP bar (scaling rectangle fill), name text, death state (texture swap + corpse becomes right-click lootable), loot table with guaranteed and chance-based (`Math.random()` roll) drops.
- **LootWindow UI** — opens on right-click of a dead enemy corpse, left-click individual items to loot into backpack, X closes (partial loot keeps corpse lootable, full loot marks it looted).
- **Combat (basic)** — `1` key triggers a proximity-checked player attack (Pythagorean distance via `Phaser.Math.Distance.Between`, must be within range). Enemy chases player within a "notice" range, stops at melee range, and attacks on a 3-second cooldown timer when in range. Player has HP bar that tracks position and takes damage from enemy attacks.
- **Placeholder sprites** — player (Soldier), enemy (Orc idle + death), sourced as spritesheets (100x100 frames).
- **Version control** — public GitHub repo, GitHub CLI over SSH.

### 🔲 Planned — Near-term (next few sessions)

- **Player death/respawn** — what happens at 0 HP (respawn point, HP/gold penalty TBD, death screen).
- **Multiple enemies at once** — current logic hardcodes a single `this.orc`; needs to generalize to an array/pool of enemies with shared update logic (candidate for a `forEach` refactor once 2+ enemy types exist).
- **Sprite animations** — currently static idle frames; walk/attack/death animation states.

### 🔲 Planned — v1 Core Features

- **Procedurally generated scaling dungeons** (Mythic+-style) — the core replayable roguelite loop. Confirmed as a hard requirement; this is *why* Phaser was chosen over RPG Maker, since RPG Maker's tooling handles procedural generation poorly.

  **Generation approach (decided): hand-crafted room templates, procedurally arranged.** This is the Slay the Spire / Hades model, not pure Spelunky/Dwarf-Fortress-style random generation. Concretely:
  - Individual room templates (e.g., "Ambush Room," "Elite Room," "Trap Corridor," "Breathing Room") are hand-designed in advance — fixed layout, fixed enemy *types*, fixed narrative/environmental features. Aim for a pool of ~20-30 covering different encounter types and difficulties.
  - Each dungeon run: a fixed start room, a random selection + arrangement of templates from the pool, and a fixed boss room at the end. The layout graph (which rooms connect to which) is randomized per run.
  - **Within a room**, enemy types are fixed by template, but exact spawn positions and patrol patterns are randomized within designated zones. The player should recognize "this is an ambush room" but never be able to fully memorize/autopilot the exact configuration.
  - Quest tendrils (see narrative system above) can be embedded directly into specific room templates (e.g., a "Corrupted Wolf Den" template with purple-eyed wolves) — this makes the dungeon generator double as a narrative delivery mechanism, not just a content multiplier.
  - Rejected: pure procedural generation (fully algorithmic room shapes/placement) — harder to guarantee quality/fairness, harder to embed story, and worse fit for a solo dev than a curated template pool.
  - Rejected: fully fixed dungeons — the driving reason against this was the observed WoW Mythic+ season engagement curve (sharp dropoff after launch week as fixed content gets exhausted); procedural arrangement keeps the engagement curve flatter over the game's lifespan without requiring continuous new content development.
- **Full overworld** — Pokémon/Breath-of-the-Wild-style explorable world connecting the city hub to dungeon entrances.
- **City hub** — merchants, class trainers, guild hall, and a **casino**.
- **Multiple classes** — 4 planned, including one "wildcard" class that plays against convention (exact class list TBD, see Open Questions).
- **Race/class combinations** — any race can pair with any class (e.g., Orc Mage), purely cosmetic effect on stats per Design Pillar #2. Hidden trainers can react to unconventional combos as an easter egg/reward layer.
- **Levels, spells/abilities, talent trees** — talent points already accrue on level-up; spending them is not yet built.
- **Gear point allocation UI** — `gearPoints.allocated` (haste/crit/mastery/vers) exists on Player but has no UI to spend it yet.
- **Monster nameplates** — enemy `nameText` exists; needs generalizing/polish as enemy variety grows.
- **Cosmetic unlocks via discovery** — found through exploration, not purchased (deferred from v1 in earlier discussion, now folded back in per "full vision" scope — confirm before building).
- **AI-generated backstory quest system** — the tendril-based narrative system described above. This is the differentiator; do not let scope pressure cut this from v1.
- **Optional co-op scaling** — dungeons scale difficulty if a second player joins.

### 🔲 Deferred to v2 (explicitly, from earlier discussion)

- Professions/crafting

## Commercial Plan (context, not implementation)

- **Steam**: standard 30% cut (drops at higher revenue tiers). Primary distribution target.
- **itch.io**: early access / community-building platform, lower friction than Steam for a pre-launch audience.
- **Desktop wrapping**: Electron, NW.js, or Tauri under consideration to wrap the Phaser/Vite web build for desktop distribution. Not yet decided which.
- **Kickstarter**: discussed as a possible funding path — requires a pre-built audience and a working demo before launch, per the case-study lesson from *Interstellaria* (mixed reviews from launching with an incomplete core loop). The explicit strategic goal is to avoid repeating that mistake: build toward a demo that proves the core loop works before seeking funding or wide visibility.

## Reference Games (for tone/style calibration, not copying)

- **Hades** — hand-painted 2D illustration style (not pixel art), in-gameplay narrative delivery
- **Diablo** — dungeon combat feel, loot density
- **WoW** — gear systems, talent trees, resistances, class trainers, casino-as-hub-flavor
- **Pokémon** — overworld exploration structure
- **Vampire Survivors** — proof that a solo/small-team web-tech game can commercially succeed (PixiJS + NW.js, 3M+ copies)
- **Undertale** — comparison point for expressive character art style

## Open Questions (flag these — don't assume)

- Room template pool: exact list of the ~20-30 templates hasn't been designed yet, just the categories/pattern
- Final 4-class roster (one confirmed as an intentional "wildcard" — which classes, not yet locked)
- Exact death/respawn penalty (lose gold? drop items? just teleport back?)
- Whether cosmetic unlocks via discovery are in-scope for v1 or v2 (appears in both "v1 features" and an earlier "deferred to v2" list — needs reconciling)
- Desktop wrapper choice (Electron vs NW.js vs Tauri)
