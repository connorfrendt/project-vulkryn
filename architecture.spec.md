# Project Vulkryn — Architecture Spec

## Stack

- **Phaser.js** — game engine. Chosen specifically because it's JavaScript/TypeScript, matching existing skills (Vue/Node/Express/PostgreSQL background) — no new language to learn to start building.
- **Vite** — dev server / build tool.
- **Plain JavaScript** — no framework (no React/Vue) inside the game itself. UI panels (CharacterSheet, Backpack, LootWindow) are built as Phaser containers, not DOM/web UI.
- **GitHub** — version control, CLI over SSH.

## Guiding Architectural Principles

These aren't arbitrary — they were arrived at (and in some cases fought for) over the course of building the prototype. Any future code, human or AI-generated, should follow them:

1. **Separate data from logic from world placement.** This is the single most important pattern in the codebase. Concretely, for items:
   - **Data** (`itemData.js`) — pure definitions, no behavior
   - **Logic/blueprint** (`Item.js`) — the class shape
   - **Factory** (`itemFactory.js`) — turns an ID into an instance
   - **World placement** (`itemSpawns.js` + `WorldItem.js`) — where/how it exists in the game world
   
   Apply this same split to new systems (enemies, NPCs, dungeon rooms) rather than hardcoding data inline where it's used.

2. **Decoupled communication via callback hooks.** Systems don't reach into each other directly — they expose callbacks that get wired up in `main.js`. Existing examples: `onPickup`, `onEquip`, `onLoot`, `onItemTaken`. This keeps e.g. `WorldItem` ignorant of `Backpack`'s existence — it just fires `onPickup(item)` and whatever's listening decides what to do. New systems should follow this same wiring pattern rather than importing and calling into each other directly.

3. **Loop over data, don't repeat code.** `forEach`/`map` over arrays of config objects instead of hand-writing near-identical blocks (e.g., CharacterSheet's slot rendering loops over a `slotLayout` array rather than one block of code per slot). When you catch yourself writing the third near-identical block in a row, that's the signal to refactor into a loop — this already happened once with enemy health bars/name text tracking and is flagged as due for cleanup once a second enemy type exists.

4. **Nested over flat data structures.** E.g. `item.stats.strength` rather than a flat `item.strength` alongside a dozen sibling stat keys. Slightly more verbose to write, meaningfully more readable at a glance, especially as stat categories grow (base stats vs. resistances vs. secondary stats).

5. **Explicit, unambiguous naming.** `itemId` over `key`. `attackDamage` over `dmg`. Prefer a slightly longer name that reads clearly over a short one that requires context to parse. This matters more in a solo project than it might seem — you are your own future collaborator reading this code in six months.

6. **Getters for derived values.** Player stats (strength, agility, intellect, armor, resistances) are never stored directly — they're computed on read via getters that sum contributions from equipped items. This guarantees stats can never desync from equipment state; there's no cache to invalidate.

## File Structure (current)

```
src/
  main.js                  — Phaser entry point, GameScene class, update() loop, all system wiring
  Player.js                — Player class: stats, equipment, inventory, gear points, talents, leveling
  Enemy.js                 — Enemy class: HP, combat (chase/attack), loot generation, death state
  CharacterSheet.js        — UI: equipment slot display (C key toggle)
  Backpack.js              — UI: 2x3 inventory grid (B key toggle)
  LootWindow.js             — UI: post-kill loot window (opens on corpse right-click)
  items/
    Item.js                — Item blueprint class
    itemData.js             — item definitions keyed by itemId
    itemFactory.js           — createItem(itemId) factory function
    itemSpawns.js             — array of {itemId, x, y} world spawn points
    WorldItem.js               — wraps an Item with a world sprite + onPickup hook
public/
  assets/                  — sprites, spritesheets (Kenney.nl placeholder art + character spritesheets)
```

**Note on naming consistency:** variable names for game objects should match their conceptual role exactly (e.g., an enemy instance stored as `this.orc` must be referenced as `this.orc` everywhere, not `this.enemy` in one place and `this.orc` in another — this exact bug has already occurred once with enemy health bar tracking). As enemy variety grows, this argues for moving away from hardcoded single-instance references (`this.orc`) toward a generalized collection (e.g., `this.enemies = []`) sooner rather than later.

## Key Patterns in Practice

### The pickup → equip flow
```
World (WorldItem, click) 
  → onPickup fires 
  → Player.addToInventory(item) 
  → Backpack.refresh() 
  → [right-click in Backpack] 
  → Player.removeFromInventory(item) + Player.equipment[slot] = item 
  → CharacterSheet.refresh() (via onEquip hook)
```

### The kill → loot flow
```
Enemy.takeDamage() reduces hp 
  → hp <= 0 triggers Enemy.die() 
  → sprite texture swap, corpse becomes clickable 
  → [right-click corpse] 
  → Enemy.generateLoot() rolls guaranteed + chance drops 
  → onLoot fires 
  → LootWindow.open(loot, enemy) 
  → [left-click items in window] 
  → items move to Player.inventory 
  → onItemTaken fires 
  → Backpack.refresh()
```

### The combat loop (per frame, in `main.js update()`)
```
1. Sync all visual elements (HP bars, name text) to current sprite positions
2. Handle player movement (WASD/arrow keys, direct sprite position mutation)
3. Check for JustDown on attack key → if enemy in range, deal damage
4. Call enemy.moveTowardPlayer() → chase logic (Phaser.Math.Distance.Between + atan2 for direction)
5. Call enemy.tryAttack() → cooldown-gated damage to player if in range
```

Distance/range checks throughout use `Phaser.Math.Distance.Between(x1, y1, x2, y2)` — Phaser's built-in Pythagorean helper. Movement direction uses `Math.atan2(dy, dx)` to get an angle, then `Math.cos`/`Math.sin` to split it into per-axis movement, scaled by `delta / 1000` for framerate-independent speed.

### Input handling — two systems, used deliberately
- **`addKey()` + `Phaser.Input.Keyboard.JustDown()`** in `update()` — for anything that needs to coordinate with per-frame state (the attack key, since it needs to check distance at the moment of the keypress). Polling style.
- **`.on('keydown-X', callback)`** — for isolated, one-off actions that don't need per-frame coordination (toggling UI panels like Backpack/CharacterSheet). Event style.

Rule of thumb: if the action needs to know anything about *where things currently are* (positions, distances, other per-frame state), use the polling style so it lives next to that state in `update()`. If it's a pure toggle/one-shot action, the event style is simpler and fine.

## Planned: Dungeon Generation Architecture

Not yet built, but the approach is decided (see `app.spec.md`), and it should follow the same **data/logic/placement separation** already established for items — this is a natural extension of Guiding Principle #1, not a new pattern:

```
dungeons/
  roomTemplates.js     — room definitions: layout, fixed enemy types, spawn zones, tags (e.g. "combat", "elite", "rest", "boss")
  RoomTemplate.js       — blueprint class: knows its layout + which enemy types + zone boundaries for spawn randomization
  dungeonGenerator.js    — takes a template pool + difficulty tier, outputs a room graph (start → N rooms → boss)
  DungeonRoom.js           — a placed instance of a template within a specific run: same template, randomized spawn positions/patrol patterns rolled at instantiation
```

This mirrors `itemData.js` → `Item.js` → `itemFactory.js` → `WorldItem.js` almost exactly: **template data → blueprint → generator/factory → placed instance**. Enemy spawning within a `DungeonRoom` should reuse the existing `Enemy` class — a room template just specifies *which* enemy configs to instantiate and the zone to randomize their position within, not a new enemy system.

Quest tendril content (once built) should hook into `roomTemplates.js` the same way loot tables hook into `Enemy` — as data attached to the template, not special-cased logic.

## Known Technical Debt / Cleanup Flagged for Later

- Enemy visual tracking (HP bar bg, HP bar fill, name text) is currently three manually-synced lines per enemy per frame. Fine at 1 enemy; needs a loop or a `syncVisuals()` method on `Enemy` once there are multiple enemies on screen.
- Single hardcoded `this.orc` reference throughout `main.js` — needs to generalize to an array/collection before multiple enemy types or multiple simultaneous enemies are added.
- No `Player.die()` yet — `takeDamage()` clamps at 0 but does nothing further. Needs building alongside the death/respawn feature.

## For Claude Code / Future Collaborators

If you're picking this project up fresh: read `app.spec.md` first for *why* the game is what it is and what's built vs. planned. This file tells you *how* the existing code is organized and *why* it's organized that way, so new code stays consistent with established patterns rather than introducing a competing style. When in doubt, follow the six Guiding Architectural Principles above over whatever the "default" Phaser tutorial pattern would suggest — they were chosen deliberately, several after explicit reconsideration of an initial approach.
