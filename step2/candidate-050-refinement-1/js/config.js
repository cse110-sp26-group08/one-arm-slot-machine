/**
 * Static game configuration used across the UI, engine, and storage layers.
 */
export const SYMBOLS = [
  { name: "GPU", weight: 4, jackpot: 540 },
  { name: "MODEL", weight: 5, jackpot: 420 },
  { name: "TOKEN", weight: 7, jackpot: 260 },
  { name: "AI", weight: 7, jackpot: 210 },
  { name: "VC", weight: 5, jackpot: 300 },
  { name: "BUG", weight: 4, jackpot: 0 },
  { name: "PROMPT", weight: 6, jackpot: 230 }
];

export const STORAGE_KEY = "candidate-050-token-forge";

export const DEFAULT_STATE = {
  startingTokens: 1000,
  tokens: 1000,
  cost: 45,
  pressure: 1,
  cache: 0,
  combo: 0,
  peak: 0,
  roundSpent: 0,
  roundGained: 0,
  roundNet: 0,
  lastPattern: "None",
  spinning: false,
  soundEnabled: true
};

/**
 * Ordered so the most meaningful outcomes appear first when matching results.
 */
export const PATTERNS = [
  {
    id: "triple-match",
    label: "Triple Match",
    description: "All three wheels land on the same symbol.",
    payout: (result, state) => Math.round(result[0].jackpot * state.pressure),
    matches: ([a, b, c]) => a.name === b.name && b.name === c.name
  },
  {
    id: "ai-vc-token",
    label: "AI + VC + TOKEN",
    description: "The strategic trio lands in any order.",
    payout: (_result, state) => Math.round(170 * state.pressure),
    matches: (result) => ["AI", "VC", "TOKEN"].every((name) => result.some((symbol) => symbol.name === name))
  },
  {
    id: "gpu-pair",
    label: "GPU Pair",
    description: "At least two GPU symbols land.",
    payout: (_result, state) => Math.round(135 * state.pressure),
    matches: (result) => result.filter((symbol) => symbol.name === "GPU").length >= 2
  },
  {
    id: "any-pair",
    label: "Any Pair",
    description: "Any two wheels match.",
    payout: (_result, state) => Math.round(85 * state.pressure),
    matches: ([a, b, c]) => a.name === b.name || b.name === c.name || a.name === c.name
  }
];
