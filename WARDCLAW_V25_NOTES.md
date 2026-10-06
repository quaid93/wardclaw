# Wardclaw v25

A departure checklist now sits beside the dungeon Enter button. It updates with destination and loadout changes and shows:

- Selected equipment, rarity, durability percentage and current/max durability, empty slots, loadout HP, and base dungeon strike.
- Named warnings for selected gear at 25% durability or below, including broken equipment and where to repair it.
- Escape Sigil count and the consequence of entering without one; sigils remain optional.
- The selected dungeon's first-room risk estimate and defeat durability penalty. Risk methodology is folded under a disclosure to keep the summary short.
- Guaranteed first-room gold and exact independent chances for equipment, blueprints, seeds, materials, herbs, supplies, blueprint fragment rarities, Favor, Essence, Academy sigils, and Escape Sigils. The full loot table below retains quantities and conditional rarity odds.
- Entry cost and explicit missing-weapon, insufficient-gold, or active-rival-duel requirements.

The checklist uses a two-column desktop layout and stacks on mobile. The Enter button remains the single existing entry action; dungeon mechanics, eligibility, saves, and reward formulas are unchanged. The entry page now opens `wardclaw_v25.html`; save schema remains 11. See WARDCLAW_V23_NOTES.md for dungeon rules and WARDCLAW_V24_NOTES.md for the collapsible Items layout.

Validation: `tests/departure-checklist-v25.cjs` exercises live gear/durability warnings, readiness guards, optional Escape Sigils, destination-specific odds, first-room risk, 1200/768/390/360px layouts, single entry action, actual dungeon entry/payout and reload. `tests/durability-dungeon-v25.cjs` checks durability, repairs, reserved loadouts, risk, loot, defeat, banking, escape, saves, Forge controls, and mobile layout. Both pass without browser errors.
