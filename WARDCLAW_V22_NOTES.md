# Wardclaw v22

Download `wardclaw_v22.html` and open it in a browser, or serve this folder with `python3 -m http.server 8000`. The root entry page now opens v22. Saves migrate to schema 10 automatically. Export a save before moving to a different browser or page origin. Previous features are documented in WARDCLAW_V21_NOTES.md.

## Inventory

Inventory and overflow each have a rarity filter and one-click dismantle buttons for every rarity. Buttons show counts and rewards; Common gear retains its existing 15% chance of one material per item. Bulk scrap acts across all pages in that panel, independently of its filter. Locked, Legacy, and equipped gear are protected. Bounty counts and lifetime materials update once for the whole batch.

## Academy summon

The summon panel stays hidden until Prestige 7, Academy unlock, and Renown 100. Forge the permanent pact in camp with an available level-15 recruit who has completed their personal quest and has Tool 3 and Armor 3. Cost: the greater of 1,000,000 gold or 100 progression reward units, 150 Academy sigils, 25 harvested herbs, and 50 harvested supplies. All milestone ability choices must be resolved before the recruit is available.

Assign one qualified recruit in camp. The recruit is reserved from training, gear upgrades, and both expedition systems until dismissed. Boss attacks trigger a summon strike at most once every eight seconds; camp and dungeon battles do not trigger it. Damage equals player Attack × class factor × (1 + recruit level / 30): Scout 1.4, Guardian 0.8, Scholar 1.2, Quartermaster 0.9. Guardian also heals 4% max HP; Quartermaster heals 2%. Summons cannot crit or recursively trigger combat effects. Pact, assignment, and cooldown survive saves and Prestige; the wandering creature companion remains separate.

## Escape Sigils

After the first Prestige, craft sigils in camp or at the unlocked Exchange, outside dungeon runs and rival duels. Each costs the greater of 50,000 gold or 25 progression reward units, 80 materials, 12 herbs, and 20 harvested supplies. Up to 99 may be held; they survive Prestige.

Normal dungeon banking now requires being between rooms (choice/rest). During a live fight, consume one sigil to retreat with 75% of each unbanked loot type rounded down. Escaping grants no banked-depth milestone rewards. You must use it before defeat; there is no automatic insurance. Normal banking between rooms retains 100% and remains free.

## Verification

The dedicated `tests/inventory-summon-escape-v22.cjs` suite checks bulk exclusions and hidden overflow pages, rewards, filters, summon visibility/costs/exclusivity/combat/cooldown/reload, sigil affordability/use/rounding/repeat guards, safe banking, older-save migration, invalid saves, Prestige persistence, and 390px layouts. The five adapted v22 browser regression suites cover save management, combat/accessibility, protection/contracts, Academy/garden, and journey systems.

Run browser suites from this folder with Playwright installed and Chromium at `/usr/bin/chromium`:

```sh
node tests/inventory-summon-escape-v22.cjs
node tests/save-management-v22.cjs
node tests/combat-accessibility-v22.cjs
node tests/protection-contracts-v22.cjs
node tests/academy-garden-v22.cjs
node tests/journey-systems-v22.cjs
```
