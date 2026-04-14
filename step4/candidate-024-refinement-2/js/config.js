/**
 * Central game configuration so UI, game logic, and documentation all point to one source of truth.
 */
export const GAME_CONFIG = {
  spinCost: 15,
  startingTokens: 120,
  reels: 3,
  symbols: [
    { icon: "🤖", name: "Bot" },
    { icon: "🪙", name: "Coin" },
    { icon: "🔥", name: "Fire" },
    { icon: "🧠", name: "Brain" },
    { icon: "📉", name: "Dip" },
    { icon: "🧾", name: "Receipt" }
  ],
  triplePayouts: {
    "🪙": 90,
    "🤖": 65,
    "🔥": 50,
    "🧠": 45,
    "📉": 30,
    "🧾": 25
  }
};

export const DEFAULT_MESSAGE = "Choose how many spins to run, then pull the lever and watch the ledger.";
