import { GAME_CONFIG, SYMBOLS } from "./js/config.js";
import {
  clearWinState,
  createUi,
  highlightWinningReels,
  renderHistory,
  renderPattern,
  renderRoundSummary,
  setMessage,
  updateStaticLabels,
  updateStatus,
} from "./js/ui.js";
import { createSoundPlayer } from "./js/sound.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ui = createUi();
const soundPlayer = createSoundPlayer(prefersReducedMotion);

/**
 * Session state kept in one place so behavior is easier to follow.
 */
const state = {
  balance: GAME_CONFIG.startingTokens,
  roundsPlayed: 0,
  isSpinning: false,
  history: [],
  queuedSpins: 0,
  stopRequested: false,
  activeTimers: [],
  activeIntervals: [],
  currentSpinCost: GAME_CONFIG.spinCost,
};

function formatTokenCount(value) {
  return `${value} token${value === 1 ? "" : "s"}`;
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function createInitialRoundSummary() {
  return {
    spent: 0,
    gained: 0,
    net: 0,
    patternLabel: "No winning pattern yet.",
    result: ui.reels.map((reel) => reel.textContent),
    winningIndices: [],
    message: `Session ready. Each spin costs ${formatTokenCount(GAME_CONFIG.spinCost)}.`,
  };
}

function getRequestedSpinCount() {
  const parsedValue = Number.parseInt(ui.spinCountInput.value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function getRequestedSpinCost() {
  const parsedValue = Number.parseInt(ui.spinWagerInput.value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < GAME_CONFIG.spinCost) {
    return GAME_CONFIG.spinCost;
  }

  return Math.max(
    GAME_CONFIG.spinCost,
    Math.floor(parsedValue / GAME_CONFIG.spinCost) * GAME_CONFIG.spinCost,
  );
}

function scheduleTimer(callback, delay) {
  const timerId = window.setTimeout(() => {
    state.activeTimers = state.activeTimers.filter((id) => id !== timerId);
    callback();
  }, delay);

  state.activeTimers.push(timerId);
  return timerId;
}

function clearTimers() {
  state.activeTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.activeTimers = [];
  state.activeIntervals.forEach((intervalId) => window.clearInterval(intervalId));
  state.activeIntervals = [];
}

function formatQueuedSpinMessage() {
  if (state.queuedSpins <= 0) {
    return "";
  }

  return ` ${state.queuedSpins} more spin${state.queuedSpins === 1 ? "" : "s"} queued.`;
}

function analyzeResult(result) {
  const payoutMultiplier = state.currentSpinCost / GAME_CONFIG.spinCost;
  const counts = result.reduce((map, symbol, index) => {
    const key = symbol.icon;
    if (!map[key]) {
      map[key] = { count: 0, indices: [], symbol };
    }

    map[key].count += 1;
    map[key].indices.push(index);
    return map;
  }, {});

  const groups = Object.values(counts).sort((left, right) => right.count - left.count);
  const topGroup = groups[0];

  if (topGroup.count === 3) {
    return {
      categoryLabel: "Jackpot",
      gained: GAME_CONFIG.payouts.jackpot * payoutMultiplier,
      patternLabel: `Three ${topGroup.symbol.icon} in a row`,
      winningIndices: topGroup.indices,
      message: `Jackpot. Three matching symbols returned ${formatTokenCount(
        GAME_CONFIG.payouts.jackpot * payoutMultiplier,
      )}.`,
    };
  }

  if (topGroup.count === 2) {
    return {
      categoryLabel: "Pair Win",
      gained: GAME_CONFIG.payouts.pair * payoutMultiplier,
      patternLabel: `Pair of ${topGroup.symbol.icon}`,
      winningIndices: topGroup.indices,
      message: `Pair found. The machine paid back ${formatTokenCount(
        GAME_CONFIG.payouts.pair * payoutMultiplier,
      )}.`,
    };
  }

  return {
    categoryLabel: "Loss",
    gained: 0,
    patternLabel: "No match",
    winningIndices: [],
    message: "No pattern this round. Better luck on the next spin.",
  };
}

function storeRound(round) {
  state.history.unshift(round);
  state.history = state.history.slice(0, GAME_CONFIG.maxHistoryItems);
}

function applyRound(round) {
  renderRoundSummary(ui, round);
  renderPattern(ui, round);
  renderHistory(ui, state.history);
  setMessage(ui, round.message);

  if (round.winningIndices.length > 0) {
    highlightWinningReels(ui, round.winningIndices);
    soundPlayer.playWin();
  } else {
    clearWinState(ui);
  }
}

function finishSpin(result) {
  ui.reels.forEach((reel, index) => {
    reel.textContent = result[index].icon;
    reel.classList.remove("spinning");
  });

  const outcome = analyzeResult(result);
  state.balance += outcome.gained;
  state.roundsPlayed += 1;
  state.isSpinning = false;

  const round = {
    spent: state.currentSpinCost,
    gained: outcome.gained,
    net: outcome.gained - state.currentSpinCost,
    categoryLabel: outcome.categoryLabel,
    patternLabel: outcome.patternLabel,
    result: result.map((symbol) => symbol.icon),
    winningIndices: outcome.winningIndices,
    message: outcome.message,
  };

  storeRound(round);
  applyRound(round);

  if (state.balance < state.currentSpinCost) {
    setMessage(ui, `${outcome.message} You do not have enough tokens for another spin.`);
  }

  updateStatus(ui, state);

  if (state.queuedSpins > 0 && !state.stopRequested && state.balance >= state.currentSpinCost) {
    scheduleTimer(() => spin({ fromQueue: true }), 250);
    return;
  }

  state.queuedSpins = 0;
  state.stopRequested = false;
  updateStatus(ui, state);
}

function animateSpin(result) {
  soundPlayer.playSpinStart();

  ui.reels.forEach((reel, index) => {
    reel.classList.add("spinning");

    if (prefersReducedMotion) {
      reel.textContent = result[index].icon;
      return;
    }

    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol().icon;
    }, GAME_CONFIG.symbolCycleIntervalMs);
    state.activeIntervals.push(interval);

    const stopDelay = GAME_CONFIG.baseSpinDurationMs + index * GAME_CONFIG.reelStopDelayMs;
    scheduleTimer(() => {
      window.clearInterval(interval);
      state.activeIntervals = state.activeIntervals.filter((id) => id !== interval);
      reel.textContent = result[index].icon;
      soundPlayer.playReelStop(index);
    }, stopDelay);
  });

  const totalDelay = prefersReducedMotion
    ? 80
    : GAME_CONFIG.baseSpinDurationMs + (ui.reels.length - 1) * GAME_CONFIG.reelStopDelayMs + 120;

  scheduleTimer(() => finishSpin(result), totalDelay);
}

function spin({ fromQueue = false } = {}) {
  if (state.isSpinning) {
    return;
  }

  if (!fromQueue) {
    state.queuedSpins = Math.max(0, getRequestedSpinCount() - 1);
    state.stopRequested = false;
    state.currentSpinCost = getRequestedSpinCost();
  } else if (state.queuedSpins > 0) {
    state.queuedSpins -= 1;
  }

  if (state.balance < state.currentSpinCost) {
    updateStatus(ui, state);
    setMessage(ui, `You need ${formatTokenCount(state.currentSpinCost)} to play this wager.`);
    return;
  }

  state.isSpinning = true;
  state.balance -= state.currentSpinCost;
  clearWinState(ui);
  updateStatus(ui, state);
  setMessage(ui, `Spinning the reels for ${formatTokenCount(state.currentSpinCost)}...${formatQueuedSpinMessage()}`);
  renderPattern(ui, { patternLabel: "Checking for patterns..." });
  renderRoundSummary(ui, { spent: state.currentSpinCost, gained: 0, net: -state.currentSpinCost });

  const result = ui.reels.map(() => randomSymbol());
  animateSpin(result);
}

function stopQueuedSpins() {
  if (!state.isSpinning || state.queuedSpins <= 0) {
    return;
  }

  state.stopRequested = true;
  setMessage(ui, "Current spin will finish, then queued spins will stop.");
  updateStatus(ui, state);
}

function resetGame() {
  clearTimers();
  state.balance = GAME_CONFIG.startingTokens;
  state.roundsPlayed = 0;
  state.isSpinning = false;
  state.history = [];
  state.queuedSpins = 0;
  state.stopRequested = false;
  state.currentSpinCost = GAME_CONFIG.spinCost;

  clearWinState(ui);
  ui.reels.forEach((reel, index) => {
    reel.classList.remove("spinning");
    reel.textContent = SYMBOLS[index % SYMBOLS.length].icon;
  });

  soundPlayer.playReset();
  applyRound(createInitialRoundSummary());
  updateStatus(ui, state);
}

updateStaticLabels(ui);
applyRound(createInitialRoundSummary());
updateStatus(ui, state);

ui.spinButton.addEventListener("click", spin);
ui.stopButton.addEventListener("click", stopQueuedSpins);
ui.resetButton.addEventListener("click", resetGame);
ui.spinCountInput.addEventListener("change", () => {
  ui.spinCountInput.value = String(getRequestedSpinCount());
});
ui.spinWagerInput.addEventListener("change", () => {
  const nextSpinCost = getRequestedSpinCost();
  ui.spinWagerInput.value = String(nextSpinCost);
  state.currentSpinCost = nextSpinCost;
  updateStatus(ui, state);
});
