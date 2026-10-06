# Wardclaw v21

Open `wardclaw_v21.html` in a browser. Existing saves migrate automatically to version 9. Export a save before moving between browsers or opening the game under a different URL.

## New systems

| System | Unlock | Decisions and progression |
| --- | --- | --- |
| Companions | Highest reached Boss 5 | Befriend Emberfox, Moonfang at Boss 15, and Mossback at Boss 30. Select one in camp. Boss victories and dungeon rooms earn bond XP; feed up to three times per day. Choose traits at bond levels 3, 6, and 9. |
| Aster, the rival | Highest reached Boss 8 | Choose a free spar, shared boss/harvest objective, or wagered contest. Counter visible stances in three untimed rounds. Respect, evolving chapters, relationship bonuses, and history persist through Prestige. Maximum three meetings daily; repeat meetings require ten boss victories. |
| Hollow Depths | First Prestige | Pay an entry fee, fight untimed rooms with Strike/Guard/Focus, and select safe passages or guarded caches. Rest every fifth room. Return whenever you want to bank cleared-room loot; defeat loses only unbanked loot. Earn tokens for dungeon mastery and one-time banked-depth milestones. |

Emberfox heals periodically, Moonfang makes follow-up attacks, and Mossback adds Defense/Block and dungeon protection. Dungeon enemies follow the highest boss reached; your actual stats and equipment affect your chances. The build is captured at entry, preventing equipment swaps during a run from changing its difficulty.

Dungeon runs and rival duels pause campaign combat. Gardening and Academy travel continue. Camp remains active afterward; use **Resume Combat** when ready. Finish or leave a run/duel before Prestige. Rival cooperation objectives, companion development, and dungeon records/mastery survive Prestige.

## Flow and balance corrections

- First-clear equipment at Boss 3 and each fifth boss gives dependable build progress. Cache rarity is at least Rare at Boss 10+ and Epic at Boss 40+; Legendary remains rare. Cache claims reset with a new Prestige run and cannot be repeatedly claimed in the same run.
- Prestige grants permanent Resolve: +30% Attack and +20% HP per Prestige, alongside its existing costs and boss-health increase.
- Boss growth becomes polynomial after Boss 30. Survival strikes and regeneration checks have been retuned. Garden gold and Academy gold follow the same underlying economy.
- HP upgrades immediately add their newly purchased capacity. Gear changes preserve health percentage, cannot create free healing, and cannot reduce a living character to zero HP through rounding.
- Crafting rarity unlocks and crafted/Exchange equipment power retain the highest reached boss across Prestige.
- Academy destinations award Common, Rare, Epic, or Legendary fragments respectively. Completed trips retain Favor chances and occasional Academy equipment drops. Overflow handling applies to these drops too.
- Emberfox healing has a three-second cooldown to prevent rapid auto-attacks from producing excessive healing. Mossback retains a useful block bonus as equipment develops.
- Attack cooldown timestamps reset on reopening/importing a save; older zero-HP saves recover at their checkpoint. Older boss fights are rescaled to the new curve while preserving their remaining-health percentage.
- Repeat purchases of an owned auto-attacker cannot spend gold again. Long descriptions wrap on mobile. New systems have save validation and older-save defaults.

## Verification

Seven browser suites cover saves/import/export/backups, combat controls/accessibility, contracts/gear protection/crafting, Academy/Harvest, the three new systems, progression, and Academy endgame.

The progression suite runs three seeded fresh-save playthroughs through Prestige 8 and Boss 97 using actual combat ticks, purchases, drops, harvesting, crafting, binding, companions, Exchange offers, and Academy travel. It injects no resources or stat levels. Rendering and autosaving are disabled only inside the simulator; game mechanics remain active.

A 14-day virtual-clock continuation of an earned save verifies all Academy destinations, three-person teams, level-20 recruits, level-5 recruit equipment, every blueprint rarity, and caretaker affordability. Separate browser tests exercise rival outcomes, dungeon loss/banking/mastery/rests, companion abilities, reload during encounters, invalid-save rejection, repeated-click guards, and 390px mobile layouts.

These simulations verify mechanical progression and economy reachability. Their automated purchasing and attack policy does not estimate a human player's session length.

Run from this folder with Playwright and Chromium installed:

```sh
node tests/save-management-v21.cjs
node tests/combat-accessibility-v21.cjs
node tests/protection-contracts-v21.cjs
node tests/academy-garden-v21.cjs
node tests/journey-systems-v21.cjs
node tests/full-playthrough-v21.cjs
node tests/academy-endgame-v21.cjs
```

The endgame suite reads the save produced by the full-playthrough suite, so run those last two in order.
