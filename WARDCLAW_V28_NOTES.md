# Wardclaw v28 — Mender’s Core and higher durability

| Rarity | Durability |
| --- | ---: |
| Common | 50,000 |
| Rare | 75,000 |
| Epic | 100,000 |
| Legendary | 200,000 |

Existing gear scales proportionally from both prior durability tables, including v27. Broken gear remains broken. Save schema 14 stores the current capacity, so reloads and imports do not scale items repeatedly. Repair costs and ordinary wear rates remain unchanged; dungeon defeat still removes its destination's percentage of maximum durability.

## Mender’s Core

A permanent dungeon relic unlocks auto-repair in Items → Forge. At Prestige 5 or later, rooms 5+ can drop it: the base chance is 2% per clear, multiplied by the normal destination, depth, and cache factors. Exact odds appear in the dungeon loot table. Clearing room 10 guarantees a Core in the unbanked haul; bank it to keep it. Defeat loses an unbanked Core. An Escape Sigil salvages a found Core intact. Once owned, duplicate drops stop.

The Core survives Prestige and starts switched OFF. Its checkbox in the Forge persists in saves and exports. Switching it on immediately checks for repairs; normal ticks continue checking, including in camp.

- Repairs equipped and inventory gear at 25% durability or less, including broken or locked gear.
- Restores full durability and clears the warning.
- Pays the existing material repair cost first; uses the existing gold price if materials are insufficient.
- Waits if neither currency can cover a repair; does not overdraw resources.
- Prioritizes equipped gear before inventory gear.
- Gear selected for an active dungeon waits until return, preserving dungeon wear and defeat risk.
- Legacy Storage and overflow remain manually repaired, preventing stored collections from draining currency.

Obtaining the relic also reveals the Forge, so its toggle is available even with healthy gear. The dungeon describes acquisition and shows pending Cores in the loot summary. Prestige explanations include the permanent relic and its setting.

## Dungeon equipment correction

Dungeon builds now resolve selected owned items before temporarily swapping equipment slots to calculate stats. Previously, items selected from equipped slots became unavailable during that swap, silently omitting their bonuses. Inventory items worked, but equipped items could produce severely weaker dungeon builds. The correction applies consistently to entry, risk estimates, defense, and attacks.

## Validation

```sh
node tests/full-playthrough-v28.cjs
node tests/auto-repair-v28.cjs
node tests/progressive-unlocks-v28.cjs
node tests/save-management-v28.cjs
node tests/departure-checklist-v28.cjs
node tests/academy-endgame-v28.cjs
```

All six suites passed. Full playthrough tests create earned Prestige-5 dungeon fixtures as well as completing three seeded runs to Prestige 8. The Core test continues an earned Prestige-5 save, uses normal purchases and actual dungeon fights to clear ten Crypt rooms, verifies the pending reward survives save migration, and banks it. It also verifies dungeon equipment stats match the selected equipped loadout, both previous durability migrations, threshold/toggle behavior, material and gold costs, insufficient funds, reserved/storage rules, Prestige persistence, and reload. Other suites cover mobile layouts, progression visibility, save recovery, dungeon entry and payout, and late Academy progression. These are simulations, not human playtime estimates.
