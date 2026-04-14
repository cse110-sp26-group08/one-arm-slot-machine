# AI Token Extractor

A small browser slot machine that tracks token spending across multiple rounds.

## File guide
- `index.html`: semantic layout and UI sections for session stats, reels, round details, and history.
- `styles.css`: shared theme, responsive layout rules, and visual states for the reels and panels.
- `script.js`: main controller that wires together state, animations, and DOM events.
- `js/config.js`: central game constants and symbol definitions.
- `js/ui.js`: DOM lookup and rendering helpers.
- `js/sound.js`: procedural sound effects created with the Web Audio API.

## Game rules
- Every spin costs 3 tokens.
- Two matching symbols pay back 5 tokens.
- Three matching symbols pay back 15 tokens.
- The session starts with 30 tokens and can be reset at any time.

## Maintenance notes
- Update values in `js/config.js` if payouts or starting balance change.
- Keep UI-only text updates in `js/ui.js` so rendering stays separate from game logic.
- Reduced-motion users get the same gameplay without heavy animation or sound dependency.
