# Wardclaw v23

Download `wardclaw_v23.html` and open it in a browser, or serve this folder with `python3 -m http.server 8000`. The entry page opens v23. Save schema 11 migrates older saves automatically. Export a save before changing browsers or page origins. Earlier systems are documented in WARDCLAW_V21_NOTES.md and WARDCLAW_V22_NOTES.md.

## Durability and the Forge

All inventory equipment, equipped items, Legacy items, overflow gear, crafted gear, and loot have durability. Older items migrate fully repaired. Equipment remains owned when broken, with bonuses and equipment-set contribution disabled until repair. Binding, Favor, fusion, and item locks do not reset durability. Durability on surviving Legacy items carries through Prestige.

| Rarity | Maximum durability | Full repair in materials | Minimum base full gold repair |
| --- | ---: | ---: | ---: |
| Common | 1,200 | 4 | 100 |
| Rare | 2,400 | 10 | 250 |
| Epic | 4,800 | 24 | 600 |
| Legendary | 9,600 | 60 | 1,500 |

Weapon, ring, and necklace lose one point per actual manual, auto, or double attack. Defensive pieces accumulate wear equal to 12 × damage taken / current max HP. Fractional wear accumulates rather than charging a whole point for every tiny hit. Dodged hits cause no armor wear; blocks cost the shield one point. Summon/companion abilities and reflection do not count as player weapon swings.

An item crossing 25% triggers a named warning once. A persistent status lists low-durability owned gear, and every item card shows current/max durability. Repair resets the warning. Items → Forge lists damaged items from every owned storage location, including locked gear. Repair restores full durability with either materials or gold. Partial repairs charge the missing fraction, rounded up with minimum one. Gold full price is the greater of the rarity base × Prestige cost multiplier and 2% of a progression gold reward × rarity rank (1–4). Exact current prices appear before spending. Selected dungeon gear cannot be repaired mid-run.

## Dungeon preparation and consequences

Choose a separate loadout from inventory, overflow, Legacy, or equipped gear, with at most one item per slot and a functioning weapon required to enter. Campaign gear remains in place; selected items are reserved against dismantling, bulk scrap, fusion, repairs, and equipment moves until return. Hero stats/perks/Prestige are captured on entry. Selected equipment remains live: broken gear reduces subsequent damage, defense, and health capacity. Health percentage is preserved when maximum health changes.

| Destination | Enemy HP | Enemy damage | Gold / extra loot odds | Extra wear on defeat |
| --- | ---: | ---: | ---: | ---: |
| Forgotten Crypt | ×1 | ×1 | ×1 | 15% max durability |
| Crystal Grotto | ×1.45 | ×1.35 | ×1.7 | 22% max durability |
| Sable Vault | ×2.1 | ×1.85 | ×2.6 | 30% max durability |

Ordinary attacks and incoming damage wear selected gear during a run. Defeat loses unbanked loot and applies the destination penalty only to selected gear. Gear is never deleted. Normal returns between rooms bank everything with no extra penalty. Escape Sigils keep 75% of each numeric loot type, rounded down, and the first floor(75% × count) pieces of equipment and seeds. Escaping keeps ordinary wear but avoids the defeat penalty and grants no banked-depth milestone.

## Risk estimates

Each destination shows its first-room risk for the chosen loadout. Active rooms and both next-route choices show a current room estimate using 64 reproducible simulations, Strike normally and Guard heavy blows, with actual ±15% incoming-damage variance and captured companion effects. The estimate accounts for current HP, gear bonuses, enemy HP/damage/intent, focus, and mastery. Simulations not clearing within 300 turns count as unsafe. This estimates room failure, not the chance of surviving an unlimited descent; gear breaking later in a simulated fight is excluded and the UI explicitly warns that near-broken gear raises actual risk. Risk evaluation never consumes the reward RNG or mutates combat state.

## Expanded loot

The table below gives Crypt / first-room / safe-route odds. All extra rolls are independent, so several rewards can drop together. Site reward multipliers above multiply extra odds. Guarded caches also multiply them by 1.2. Depth adds a 1% multiplier per room, capped at +50%. Each extra chance is capped at 80%. The in-game loot table displays exact odds for the currently previewed or active room.

| Additional reward | Base chance per cleared room | Amount on success |
| --- | ---: | --- |
| Materials | 45% | 3–8 |
| Healing herbs | 18% | 1–3 |
| Expedition supplies | 22% | 2–4 |
| Seeds | 15% | 1–2, random crop types |
| Rare fragments | 12% | 1–2 |
| Epic fragments | 4.5% | 1 |
| Legendary fragments | 1.2% | 1 |
| Whole blueprint | 3.5% | 1 |
| Equipment | 20% | 1 |
| Favor | 4% | 1 |
| Essence | 2.5% | 1–2 |
| Academy sigils | 8% | 1–3 |
| Escape Sigil | 0.4% | 1 |

Gold remains guaranteed, with the exact current-room amount displayed. Every second room also guarantees two materials and one token; every third room guarantees one Common fragment. Conditional gear/blueprint rarity odds are Common/Rare/Epic/Legendary: Crypt 65/28/6.5/0.5%, Grotto 40/40/18/2%, Vault 20/42/33/5%. These dungeon rarity rolls are independent of campaign unlocks. Gear power follows the highest reached boss. Dungeon equipment is retained in inventory/overflow, including duplicates. All extra loot is unbanked until return; no reward is granted on defeat. Extra Escape Sigils respect the existing 99-item carry cap.

## Validation and limits

Eight v23 browser suites cover durability/Forge/new dungeon mechanics, saves, combat/accessibility, contracts/protected gear, Academy/garden, rival/companion/dungeon flows, summons/Escape Sigils, and fresh-save progression. The dedicated durability suite checks warning thresholds, repair costs and both currencies, broken bonuses, reserved loadouts, stat snapshots, wear/defeat/escape/expanded loot, older-save migration, reload, risk limits, Forge navigation, and 390px layouts.

Three seeded progression simulations reach Prestige 8 and Boss 97 using earned resources and actual combat, purchases, drops, harvesting, crafting, and repairs. The policy repairs low-durability equipped gear using available materials or gold and replaces broken gear with functioning alternatives. No resources or stat levels are injected. Automated timing and purchase decisions do not estimate human play time, and these checks establish mechanical reachability rather than an exhaustive guarantee of perfect balance.

Run from this folder with Playwright installed and Chromium at `/usr/bin/chromium`:

```sh
node tests/durability-dungeon-v23.cjs
node tests/save-management-v23.cjs
node tests/combat-accessibility-v23.cjs
node tests/protection-contracts-v23.cjs
node tests/academy-garden-v23.cjs
node tests/journey-systems-v23.cjs
node tests/inventory-summon-escape-v23.cjs
node tests/full-playthrough-v23.cjs
```
