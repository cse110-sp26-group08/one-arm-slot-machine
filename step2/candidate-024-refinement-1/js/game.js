import { GAME_CONFIG } from "./config.js";

/**
 * Return a random symbol descriptor from the configured symbol set.
 */
export function getRandomSymbol() {
  const { symbols } = GAME_CONFIG;
  return symbols[Math.floor(Math.random() * symbols.length)];
}

/**
 * Detect the most meaningful pattern on the board so the UI can explain the result clearly.
 */
export function detectPattern(results) {
  const counts = results.reduce((map, result) => {
    map[result.icon] = (map[result.icon] ?? 0) + 1;
    return map;
  }, {});

  const rankedPatterns = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  const [topIcon, topCount] = rankedPatterns[0];
  const topSymbol = GAME_CONFIG.symbols.find((symbol) => symbol.icon === topIcon);

  if (topCount === 3) {
    return {
      key: "triple",
      label: `Triple ${topSymbol.name}`,
      detail: `${topIcon} ${topIcon} ${topIcon}`,
      payout: GAME_CONFIG.triplePayouts[topIcon] ?? 40
    };
  }

  if (topCount === 2) {
    return {
      key: "pair",
      label: `Pair of ${topSymbol.name}s`,
      detail: `${topIcon} ${topIcon} + wildcard`,
      payout: 20
    };
  }

  return {
    key: "miss",
    label: "No pattern",
    detail: results.map((result) => result.icon).join(" "),
    payout: 0
  };
}

/**
 * Build per-round accounting details for a single spin.
 */
export function scoreRound(results) {
  const pattern = detectPattern(results);
  const spent = GAME_CONFIG.spinCost;
  const gained = pattern.payout;

  return {
    results,
    pattern,
    spent,
    gained,
    net: gained - spent
  };
}

/**
 * Produce a short reader-friendly summary for the current round.
 */
export function buildRoundMessage(round) {
  const icons = round.results.map((result) => result.icon).join(" ");

  if (round.pattern.key === "triple") {
    return `${icons} matched ${round.pattern.label}. Gained ${round.gained} tokens after spending ${round.spent}.`;
  }

  if (round.pattern.key === "pair") {
    return `${icons} formed ${round.pattern.label}. Gained ${round.gained} tokens after spending ${round.spent}.`;
  }

  return `${icons} missed every pattern. Spent ${round.spent} tokens and gained none back.`;
}
