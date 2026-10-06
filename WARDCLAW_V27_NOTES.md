# Wardclaw v27 — longer-lasting equipment

Equipment has ten times its previous maximum durability:

| Rarity | Before | Now |
| --- | ---: | ---: |
| Common | 1,200 | 12,000 |
| Rare | 2,400 | 24,000 |
| Epic | 4,800 | 48,000 |
| Legendary | 9,600 | 96,000 |

Ordinary attack, armor-damage, and block wear rates are unchanged. Full-repair prices remain 4/10/24/60 materials, with the existing gold alternative. Partial repairs still charge for the missing fraction. The 25% warning and Forge visibility rules remain intact. Dungeon defeat still applies the existing percentage penalty, so higher endurance does not remove dungeon risk.

Save schema 13 records each item's durability capacity. Older saves scale existing durability proportionally: a Rare item at 1,200/2,400 becomes 12,000/24,000. Broken items remain broken; full items remain full. Missing durability in pre-durability saves defaults to full. The shared equipment validator handles inventory, Legacy, overflow, equipped gear, Exchange stock, and pending dungeon loot. Capacity metadata prevents repeat scaling in subsequent loads, exports, imports, backups, and raw-state roundtrips.

## Validation

```sh
node tests/durability-v27.cjs
node tests/progressive-unlocks-v27.cjs
node tests/save-management-v27.cjs
node tests/departure-checklist-v27.cjs
node tests/full-playthrough-v27.cjs
node tests/academy-endgame-v27.cjs
```

All six checks passed with Playwright and Chromium. Coverage includes all rarity capacities, tenfold ordinary endurance, warning/repair behavior, proportional migration, broken-item preservation, repeat migrations, reload, save recovery, milestone visibility, dungeon readiness and payout, and mobile layouts. Three seeded simulations reached Prestige 8 using earned resources; an Academy continuation from a migrated v26 save reached all destinations and late-game development. Simulation results are committed as test fixtures; they are not estimates of human playtime.
