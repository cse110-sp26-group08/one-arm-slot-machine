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
};

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
    message: "Session ready. Each spin costs 3 tokens.",
  };
}

function analyzeResult(result) {
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
      gained: GAME_CONFIG.payouts.jackpot,
      patternLabel: `Three ${topGroup.symbol.icon} in a row`,
      winningIndices: topGroup.indices,
      message: `Jackpot. Three matching symbols returned ${GAME_CONFIG.payouts.jackpot} tokens.`,
    };
  }

  if (topGroup.count === 2) {
    return {
      gained: GAME_CONFIG.payouts.pair,
      patternLabel: `Pair of ${topGroup.symbol.icon}`,
      winningIndices: topGroup.indices,
      message: `Pair found. The machine paid back ${GAME_CONFIG.payouts.pair} tokens.`,
    };
  }

  return {
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
    spent: GAME_CONFIG.spinCost,
    gained: outcome.gained,
    net: outcome.gained - GAME_CONFIG.spinCost,
    patternLabel: outcome.patternLabel,
    result: result.map((symbol) => symbol.icon),
    winningIndices: outcome.winningIndices,
    message: outcome.message,
  };

  storeRound(round);
  applyRound(round);

  if (state.balance < GAME_CONFIG.spinCost) {
    setMessage(ui, `${outcome.message} You do not have enough tokens for another spin.`);
  }

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

    const stopDelay = GAME_CONFIG.baseSpinDurationMs + index * GAME_CONFIG.reelStopDelayMs;
    window.setTimeout(() => {
      window.clearInterval(interval);
      reel.textContent = result[index].icon;
      soundPlayer.playReelStop(index);
    }, stopDelay);
  });

  const totalDelay = prefersReducedMotion
    ? 80
    : GAME_CONFIG.baseSpinDurationMs + (ui.reels.length - 1) * GAME_CONFIG.reelStopDelayMs + 120;

  window.setTimeout(() => finishSpin(result), totalDelay);
}

function spin() {
  if (state.isSpinning || state.balance < GAME_CONFIG.spinCost) {
    return;
  }

  state.isSpinning = true;
  state.balance -= GAME_CONFIG.spinCost;
  clearWinState(ui);
  updateStatus(ui, state);
  setMessage(ui, "Spinning the reels...");
  renderPattern(ui, { patternLabel: "Checking for patterns..." });
  renderRoundSummary(ui, { spent: GAME_CONFIG.spinCost, gained: 0, net: -GAME_CONFIG.spinCost });

  const result = ui.reels.map(() => randomSymbol());
  animateSpin(result);
}

function resetGame() {
  state.balance = GAME_CONFIG.startingTokens;
  state.roundsPlayed = 0;
  state.isSpinning = false;
  state.history = [];

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
ui.resetButton.addEventListener("click", resetGame);
