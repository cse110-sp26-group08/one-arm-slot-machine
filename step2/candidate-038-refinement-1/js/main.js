import { SoundBoard } from "./audio.js";
import { COST_PER_PLAY, STARTING_TOKENS, SYMBOLS, TAUNTS } from "./data.js";
import { createPlaySummary, getRandomSymbol } from "./game.js";
import { createUi } from "./ui.js";

/**
 * Main coordinator for the slot machine.
 * It owns mutable state while the imported modules stay focused on one responsibility each.
 */
const ui = createUi();
const sounds = new SoundBoard();

const state = {
  tokens: STARTING_TOKENS,
  startingTokens: STARTING_TOKENS,
  roundNumber: 0,
  isSpinning: false
};

function randomTaunt() {
  return TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
}

function renderBaseState() {
  ui.setScoreboard({
    startingTokens: state.startingTokens,
    currentTokens: state.tokens,
    costPerPlay: COST_PER_PLAY,
    resultLabel: state.roundNumber === 0 ? "Ready to spin" : ui.elements.resultLabel.textContent
  });
}

function updateRoundDisplay(summary) {
  ui.setRoundDetails(summary);
  ui.setStatusMessage(summary.message);
  ui.setScoreboard({
    startingTokens: state.startingTokens,
    currentTokens: state.tokens,
    costPerPlay: COST_PER_PLAY,
    resultLabel: summary.resultLabel
  });
}

function canAfford(playCount) {
  return state.tokens >= COST_PER_PLAY * playCount;
}

async function runSinglePlay() {
  state.tokens -= COST_PER_PLAY;
  ui.setScoreboard({
    startingTokens: state.startingTokens,
    currentTokens: state.tokens,
    costPerPlay: COST_PER_PLAY,
    resultLabel: "Spinning..."
  });
  ui.setStatusMessage(randomTaunt());
  ui.setReelsSpinning();

  const animation = ui.animateReels(getRandomSymbol);
  for (let tick = 0; tick < 6; tick += 1) {
    window.setTimeout(() => sounds.playSpinTick(tick), tick * 110);
  }
  await animation;

  const results = Array.from({ length: 3 }, () => getRandomSymbol());
  const summary = createPlaySummary(results, COST_PER_PLAY);
  state.tokens = Math.max(0, state.tokens + summary.gained - Math.max(summary.spent - COST_PER_PLAY, 0));
  state.roundNumber += 1;

  ui.setReels(results, summary.highlight);
  updateRoundDisplay(summary);
  ui.prependLog(summary, state.tokens, state.roundNumber);

  if (summary.net >= 0) {
    sounds.playWin();
  } else {
    sounds.playLoss();
  }
}

async function handleSpin() {
  const playCount = ui.readPlayCount();

  if (state.isSpinning) {
    return;
  }

  if (!canAfford(playCount)) {
    ui.setStatusMessage(`You need ${COST_PER_PLAY * playCount} tokens to run ${playCount} play${playCount > 1 ? "s" : ""}.`);
    ui.setScoreboard({
      startingTokens: state.startingTokens,
      currentTokens: state.tokens,
      costPerPlay: COST_PER_PLAY,
      resultLabel: "Not enough tokens"
    });
    sounds.playLoss();
    return;
  }

  state.isSpinning = true;
  ui.setControlsDisabled(true);

  for (let playIndex = 0; playIndex < playCount; playIndex += 1) {
    await runSinglePlay();
  }

  state.isSpinning = false;
  ui.setControlsDisabled(false);
}

function resetGame() {
  state.tokens = STARTING_TOKENS;
  state.startingTokens = STARTING_TOKENS;
  state.roundNumber = 0;
  state.isSpinning = false;

  ui.clearLog();
  ui.setReels(SYMBOLS.slice(0, 3), false);
  ui.setRoundDetails({
    pattern: "No round yet",
    resultLabel: "Reset complete",
    message: "The machine is ready for a new run.",
    spent: 0,
    gained: 0,
    net: 0
  });
  ui.setStatusMessage("Budget restored. Choose a play count and spin again.");
  ui.setScoreboard({
    startingTokens: state.startingTokens,
    currentTokens: state.tokens,
    costPerPlay: COST_PER_PLAY,
    resultLabel: "Ready to spin"
  });
  sounds.playReset();
}

function initialize() {
  ui.renderLegend();
  renderBaseState();
  resetGame();
  ui.elements.spinButton.addEventListener("click", handleSpin);
  ui.elements.resetButton.addEventListener("click", resetGame);
}

initialize();
