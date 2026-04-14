/**
 * Central game configuration so the UI and logic stay in sync.
 */
export const GAME_CONFIG = {
  startingTokens: 30,
  spinCost: 3,
  payouts: {
    pair: 5,
    jackpot: 15,
  },
  visibleHistoryItems: 6,
  reelStopDelayMs: 220,
  baseSpinDurationMs: 700,
  symbolCycleIntervalMs: 90,
};

/**
 * Shared symbol catalog used by the reels and descriptive UI.
 */
export const SYMBOLS = [
  { icon: "\u{1F916}", name: "Bot" },
  { icon: "\u{1F9EA}", name: "Lab vial" },
  { icon: "\u{1F9E0}", name: "Brain" },
  { icon: "\u{1F525}", name: "Fire" },
  { icon: "\u{1F4C9}", name: "Chart" },
  { icon: "\u{1F4BE}", name: "Disk" },
];
