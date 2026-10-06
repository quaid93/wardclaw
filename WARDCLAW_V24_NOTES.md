# Wardclaw v24

The equipment tree is centered independently of its support panels. Gear bonuses and set information sit below it. The tree remains centered with empty or populated gear at desktop and mobile widths, using three columns without horizontal overflow.

Items now opens with Equipment expanded and Inventory, This Boss's Drops, and Craft folded to their titles. Click any section title to open or close it; native keyboard disclosure controls also work. Rendering updates preserve folded sections and crafting choices.

The Equipment, Exchange, and Forge subtab buttons open their respective views. Click an active button again to close its contents and leave just the subtab titles. Arrow indicators and `aria-expanded` communicate whether each view is open. Equipment instructions and materials help text are shorter.

The entry page opens `wardclaw_v24.html`. Gameplay and save schema remain the same as v23 (schema 11); existing saves remain compatible. See WARDCLAW_V23_NOTES.md for durability, repairs, dungeon risk, and loot rules.

Validation: `tests/items-layout-v24.cjs` checks exact equipment centering at 1600, 1200, 768, 390, and 360 pixels with empty and populated equipment; native folding and keyboard controls; state retention through rendering; subtab closing and accessibility attributes; inventory equipping; and absence of browser errors. Save-management and durability/dungeon browser regressions also pass.
