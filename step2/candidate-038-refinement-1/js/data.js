/**
 * Shared configuration for the slot machine.
 * Keeping the narrative text and payout tables in one place makes the UI and game logic easier to maintain.
 */
export const STARTING_TOKENS = 120;
export const COST_PER_PLAY = 15;
export const MAX_LOG_ENTRIES = 8;

export const SYMBOLS = [
  {
    icon: "🤖",
    name: "Hallucination Engine",
    description: "High confidence, mixed accuracy.",
    winLabel: "Hallucination jackpot"
  },
  {
    icon: "🪙",
    name: "Investor Token",
    description: "Pure optimism and suspicious valuations.",
    winLabel: "Investor frenzy"
  },
  {
    icon: "🔥",
    name: "GPU Bonfire",
    description: "Compute budget goes in, smoke comes out.",
    winLabel: "GPU bonfire"
  },
  {
    icon: "🧠",
    name: "Synthetic Genius",
    description: "A brief and probably accidental moment of brilliance.",
    winLabel: "Synthetic genius"
  },
  {
    icon: "📉",
    name: "Ethics Slide Deck",
    description: "A polished presentation with no savings attached.",
    winLabel: "Ethics keynote"
  },
  {
    icon: "🥴",
    name: "Prompt Goblin",
    description: "Unclear method, oddly usable result.",
    winLabel: "Prompt goblin"
  }
];

export const TAUNTS = [
  "The machine is ready to convert confidence into operating costs.",
  "Every spin is another chance for the AI to bill you for vibes.",
  "The reels are calibrated for spectacle, not fiscal responsibility.",
  "A product demo is forming somewhere, and it already needs more tokens."
];

/**
 * Exact three-of-a-kind outcomes with custom payouts.
 */
export const SPECIAL_OUTCOMES = {
  "🪙🪙🪙": {
    label: "Investor frenzy",
    delta: 80,
    message: "Triple investor tokens. The hype cycle briefly pays for itself."
  },
  "🤖🤖🤖": {
    label: "Hallucination jackpot",
    delta: 55,
    message: "Three bots align. Confidence alone somehow turns a profit."
  },
  "🔥🔥🔥": {
    label: "GPU bonfire",
    delta: -45,
    message: "The training budget combusts in real time."
  },
  "🧠🧠🧠": {
    label: "Synthetic genius",
    delta: 45,
    message: "For one round, the machine almost looks competent."
  },
  "📉📉📉": {
    label: "Ethics keynote",
    delta: -30,
    message: "A slide deck appears and the balance shrinks anyway."
  },
  "🥴🥴🥴": {
    label: "Prompt goblin",
    delta: 25,
    message: "An absurd prompt works just well enough to be dangerous."
  }
};
