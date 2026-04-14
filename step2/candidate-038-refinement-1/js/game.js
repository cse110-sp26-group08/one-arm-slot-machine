import { SPECIAL_OUTCOMES, SYMBOLS } from "./data.js";

/**
 * Returns a random symbol record.
 */
export function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

/**
 * Evaluates the visible symbols and returns a documented round outcome.
 */
export function evaluatePattern(icons) {
  const key = icons.join("");
  const directMatch = SPECIAL_OUTCOMES[key];

  if (directMatch) {
    return {
      pattern: "Three of a kind",
      label: directMatch.label,
      delta: directMatch.delta,
      message: directMatch.message,
      highlight: true
    };
  }

  const uniqueIcons = new Set(icons).size;

  if (uniqueIcons === 2) {
    return {
      pattern: "Pair",
      label: "Almost useful",
      delta: 10,
      message: "Two reels line up. The AI nearly delivers something practical.",
      highlight: false
    };
  }

  return {
    pattern: "No pattern",
    label: "Token drain",
    delta: -10,
    message: "Nothing matches. The machine charges extra for polished mediocrity.",
    highlight: false
  };
}

/**
 * Produces a normalized record for one completed play.
 */
export function createPlaySummary(results, costPerPlay) {
  const icons = results.map((symbol) => symbol.icon);
  const outcome = evaluatePattern(icons);
  const gained = Math.max(outcome.delta, 0);
  const bonusLoss = Math.max(-outcome.delta, 0);

  return {
    results,
    icons,
    pattern: outcome.pattern,
    resultLabel: outcome.label,
    message: outcome.message,
    spent: costPerPlay + bonusLoss,
    baseCost: costPerPlay,
    gained,
    net: outcome.delta - costPerPlay,
    highlight: outcome.highlight
  };
}
