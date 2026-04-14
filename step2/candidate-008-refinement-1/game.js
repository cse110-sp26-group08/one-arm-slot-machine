import {
  DEFAULT_PURCHASE,
  INITIAL_TOKENS,
  PRIZE_VALUES,
  PURCHASES,
  SPIN_COST,
  SYMBOLS,
} from "./data.js";

/**
 * Returns a random item from a list.
 */
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Builds a fresh game state for a new session.
 */
export function createInitialState() {
  return {
    tokens: INITIAL_TOKENS,
    roundsPlayed: 0,
    spinning: false,
    lastRound: {
      start: INITIAL_TOKENS,
      won: 0,
      spent: 0,
      net: 0,
      outcomeType: "idle",
      outcomeLabel: "No pattern yet",
      patternCopy: "Start a round to reveal whether the reels landed a pair, jackpot, or full miss.",
      symbols: SYMBOLS.slice(0, 3),
      purchase: DEFAULT_PURCHASE,
    },
  };
}

export function randomSymbol() {
  return pickRandom(SYMBOLS);
}

/**
 * Converts the three reel symbols into a gameplay result and human-readable pattern text.
 */
export function evaluateSpin(result) {
  const counts = new Map();

  result.forEach((symbol) => {
    counts.set(symbol, (counts.get(symbol) || 0) + 1);
  });

  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const [topSymbol, topCount] = entries[0];

  if (topCount === 3) {
    const payout = PRIZE_VALUES[topSymbol] * 4;
    return {
      type: "jackpot",
      symbol: topSymbol,
      payout,
      label: `Jackpot: triple ${topSymbol}`,
      patternCopy: `All three reels matched ${topSymbol}, so the machine paid ${payout} tokens.`,
    };
  }

  if (topCount === 2) {
    const payout = PRIZE_VALUES[topSymbol] + 12;
    return {
      type: "double",
      symbol: topSymbol,
      payout,
      label: `Pair: two ${topSymbol} reels`,
      patternCopy: `Two reels matched ${topSymbol}, which paid ${payout} tokens.`,
    };
  }

  return {
    type: "miss",
    payout: 0,
    label: "Miss: no matching pattern",
    patternCopy: "No reels matched, so this round only lost tokens to the spin fee and follow-up spend.",
  };
}

/**
 * Chooses how much of the current balance gets spent after a round.
 */
function determineSpend(tokens, payout) {
  const maxSpend = Math.min(tokens, Math.max(8, Math.floor(payout * 0.65) || 12));
  return Math.min(tokens, Math.max(8, Math.min(maxSpend, Math.floor(Math.random() * 26) + 12)));
}

/**
 * Applies one completed spin to the current state and returns the new round snapshot.
 */
export function resolveRound(state, symbolsShown) {
  const roundStart = state.tokens;
  const outcome = evaluateSpin(symbolsShown);
  const purchase = pickRandom(PURCHASES);

  let tokens = state.tokens - SPIN_COST;
  tokens += outcome.payout;

  const spent = determineSpend(tokens, outcome.payout);
  tokens -= spent;

  const won = outcome.payout;
  const net = tokens - roundStart;

  return {
    tokens,
    roundsPlayed: state.roundsPlayed + 1,
    lastRound: {
      start: roundStart,
      won,
      spent: spent + SPIN_COST,
      net,
      outcomeType: outcome.type,
      outcomeLabel: outcome.label,
      patternCopy: outcome.patternCopy,
      symbols: symbolsShown,
      purchase: {
        item: purchase.item,
        copy: `Cost: ${spent} tokens. ${purchase.description}`,
      },
    },
  };
}

export function canAffordRound(tokens) {
  return tokens >= SPIN_COST;
}

export function getRunCount(selectValue) {
  const parsed = Number.parseInt(selectValue, 10);
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
}

export function getStatusText(round, currentTokens, canKeepPlaying) {
  const resultText =
    round.outcomeType === "jackpot"
      ? "Big hit."
      : round.outcomeType === "double"
        ? "Solid match."
        : "No match.";

  if (!canKeepPlaying && currentTokens < SPIN_COST) {
    return `${resultText} Round change: ${round.net >= 0 ? "+" : ""}${round.net} tokens. Balance too low for another spin.`;
  }

  return `${resultText} Won ${round.won}, spent ${round.spent}, net ${round.net >= 0 ? "+" : ""}${round.net} tokens this round.`;
}
