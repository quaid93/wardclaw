# Wardclaw v26 — gradual introductions

New players start with Combat, Stats, and basic Items. Systems become visible as follows:

| Milestone | Visible systems |
| --- | --- |
| Boss 5 and an owned seed | Harvest |
| Owned gear at 25% durability or less | Forge |
| Boss 20 | Prestige explanation and first Prestige |
| Prestige 1 | Crafting and blueprints |
| Prestige 2 | Exchange, contracts, equipment sets |
| Prestige 3 | Academy |
| Prestige 4 | Companions and rival |
| Prestige 5 | Dungeons and Escape Sigils |
| Prestige 7 | Caretaker; summon information once Academy Renown reaches 100 |

Purchase requirements still apply. The summon requires its expensive pact and a qualified recruit; the caretaker still requires its expensive purchase. Forge remains accessible after repairs. Academy initially shows Woods and one-person teams; Renown reveals additional destinations and team capacity.

Each newly visible system gets one short introduction with an action button. Introductions appear one at a time, can be dismissed, and do not interrupt combat. A small Next unlock panel shows the next progression milestone. Currency counters, early reward notifications, unavailable actions, and instructional sections follow visibility. Earned hidden rewards remain in the save.

Settings & Saves is a collapsible section in Stats, available from the start. It includes reduced motion, export/import, backup/recovery, and reset controls. Prestige-specific preferences appear when relevant. Prestige reset explanations list accessible systems while confirming that hidden rewards are also preserved.

Save schema 12 stores unlocked systems and acknowledged introductions permanently. Prestige keeps both. Older saves retain access inferred from previous activity, owned rewards, and progression; migrated systems do not repeat their introductions. The autosave key and backup slot remain compatible.

## Validation

Run from the repository with Playwright and Chromium installed:

```sh
node tests/progressive-unlocks-v26.cjs
node tests/save-management-v26.cjs
node tests/departure-checklist-v26.cjs
node tests/full-playthrough-v26.cjs
node tests/academy-endgame-v26.cjs
```

Checks cover staged UI visibility, meaningful Forge access, introductions and navigation, old-save migration, retained hidden rewards, mobile layout, export/import and backup recovery, Prestige carry-over, and dungeon readiness/entry/reload.

Three seeded simulations used actual game actions, earned resources, repairs, and visibility-aware strategies to reach Prestige 8. A 14-day simulated Academy continuation from an earned save reached every destination, three-person teams, level-20 recruits, advanced recruit equipment, legendary blueprints, and the caretaker. Results are saved in the test JSON files. Simulated timing and automated strategies do not predict human playtime or guarantee every possible build is balanced. This version changes presentation and unlock visibility rather than reward formulas.

## Code reuse pass

Gear generation now shares one item factory, preserving random calls, item fields, durability, and legendary awakening. Stat views share purchase calculations; inventory panels and the equipment modal share filtering and rarity sorting; duplicate detection and fusion share item identity rules. Repeated stat listeners and identical CSS blocks are consolidated. No save schema, gameplay rules, rewards, unlock schedule, or UI wording changed.

The readable standalone file shrank from 4,292 to 4,282 lines and from 327,958 to 325,325 bytes. Line count remains substantial because the HTML contains the entire game's UI, styles, data, and logic.

`node tests/refactor-equivalence-v26.cjs` compares against the original v26 commit (`329828b`): 384 seeded generated items, fresh/endgame DOM markup, computed mobile styles, state, stat costs/values, and duplicate/fusion selection must match. All five regression suites above also passed after the refactor.
