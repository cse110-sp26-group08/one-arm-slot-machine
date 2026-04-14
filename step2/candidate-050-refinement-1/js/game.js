import { DEFAULT_STATE, PATTERNS, SYMBOLS } from "./config.js";

/**
 * Shared game logic and state transitions.
 */
export function createGameEngine(initialState) {
  const state = { ...DEFAULT_STATE, ...initialState };
  state.spinning = false;

  function weightedPick() {
    const total = SYMBOLS.reduce((sum, symbol) => sum + symbol.weight, 0);
    let cursor = Math.random() * total;

    for (const symbol of SYMBOLS) {
      cursor -= symbol.weight;
      if (cursor <= 0) {
        return symbol;
      }
    }

    return SYMBOLS[SYMBOLS.length - 1];
  }

  function getPattern(result) {
    return PATTERNS.find((pattern) => pattern.matches(result)) ?? null;
  }

  function applySpinResult(result) {
    const pattern = getPattern(result);
    const gained = pattern ? pattern.payout(result, state) : 0;

    state.roundGained = gained;
    state.roundNet = gained - state.roundSpent;
    state.lastPattern = pattern ? pattern.label : "None";
    state.peak = Math.max(state.peak, gained);
    state.tokens += gained;

    if (gained > 0) {
      state.combo += 1;
      state.cache += Math.round(gained * 0.3);

      if (state.combo % 4 === 0) {
        state.pressure = Number((state.pressure + 0.25).toFixed(1));
      }
    } else {
      state.combo = 0;
      state.pressure = 1;
    }

    return {
      result,
      pattern,
      gained,
      net: state.roundNet
    };
  }

  return {
    state,
    canAffordSpins(playCount) {
      return state.tokens >= state.cost * playCount;
    },
    startSpin() {
      state.tokens -= state.cost;
      state.roundSpent = state.cost;
      state.roundGained = 0;
      state.roundNet = -state.cost;
      state.lastPattern = "Pending...";
    },
    finishSpin(result) {
      return applySpinResult(result);
    },
    finishSession() {
      state.spinning = false;
    },
    refineCost() {
      return Math.round(state.cost * 3);
    },
    refine() {
      const cost = this.refineCost();
      if (state.spinning || state.tokens < cost) {
        return null;
      }

      state.tokens -= cost;
      state.cost += 12;
      state.pressure = Number((state.pressure + 0.15).toFixed(1));
      state.roundSpent = cost;
      state.roundGained = 0;
      state.roundNet = -cost;
      state.lastPattern = "Refine";
      return { cost };
    },
    stash() {
      if (state.spinning || state.cache === 0) {
        return null;
      }

      const payout = Math.max(50, Math.round(state.cache * 0.65));
      state.tokens += payout;
      state.cache = 0;
      state.roundSpent = 0;
      state.roundGained = payout;
      state.roundNet = payout;
      state.lastPattern = "Cache Collected";
      return { payout };
    },
    reset() {
      Object.assign(state, { ...DEFAULT_STATE });
      state.spinning = false;
    },
    weightedPick,
    patterns: PATTERNS
  };
}
