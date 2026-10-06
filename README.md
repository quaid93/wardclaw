# Wardclaw

The current game is **Wardclaw v27**, a standalone HTML browser game.

## Download and play

Open `wardclaw_v27.html` on GitHub, then use **Download raw file**. Open the downloaded HTML in your browser.

For local web serving, run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`. The root `index.html` opens the current game.

Saves belong to the browser and page origin. Export your save inside the game before changing browsers or moving between a local file and a hosted URL.

See [the v27 notes](WARDCLAW_V27_NOTES.md) for features, balance changes, and browser test commands. The test suites require Playwright and Chromium; the game itself needs no installation.
