import { SoundBoard } from "./audio.js";
import { DEFAULT_MESSAGE, GAME_CONFIG } from "./config.js";
import { buildRoundMessage, getRandomSymbol, scoreRound } from "./game.js";
import {
  createUI,
  pulseMachine,
  renderHistory,
  renderReels,
  setMessage,
  setPattern,
  setSpinning,
  updateDashboard
} from "./ui.js";

const ui = createUI();
const sounds = new SoundBoard();

const state = {
  balance: GAME_CONFIG.startingTokens,
  totalSpent: 0,
  totalGained: 0,
  totalNet: 0,
  rounds: [],
  isSpinning: false
};

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createInitialResults() {
  return GAME_CONFIG.symbols.slice(0, GAME_CONFIG.reels);
}

function refreshUI() {
  updateDashboard(ui, state);
  renderHistory(ui, state.rounds);
}

async function animateSingleReel(index) {
  const reel = ui.reelElements[index];

  for (let tick = 0; tick < 8 + index * 3; tick += 1) {
    const symbol = getRandomSymbol();
    reel.textContent = symbol.icon;
    reel.setAttribute("aria-label", symbol.name);
    sounds.playSpinTick(index);
    await wait(70);
  }

  const finalSymbol = getRandomSymbol();
  reel.textContent = finalSymbol.icon;
  reel.setAttribute("aria-label", finalSymbol.name);
  sounds.playReelStop(index);
  await wait(120);
  return finalSymbol;
}

async function playRound() {
  const roundResults = [];

  for (let index = 0; index < GAME_CONFIG.reels; index += 1) {
    roundResults.push(await animateSingleReel(index));
  }

  const round = scoreRound(roundResults);
  const roundNumber = state.rounds.length + 1;

  state.balance += round.gained;
  state.totalGained += round.gained;
  state.totalNet += round.gained;
  state.rounds.push({ ...round, roundNumber });

  setPattern(ui, round.pattern);
  setMessage(ui, buildRoundMessage(round));
  renderHistory(ui, state.rounds);
  updateDashboard(ui, state);

  if (round.gained > 0) {
    pulseMachine(ui, "flash-win");
    sounds.playWin(round.pattern.key === "triple" ? "big" : "small");
  } else {
    pulseMachine(ui, "flash-loss");
    sounds.playLoss();
  }
}

async function spinMultipleRounds() {
  if (state.isSpinning) {
    return;
  }

  const requestedSpins = Math.max(1, Number(ui.spinCount.value) || 1);
  const maxAffordableSpins = Math.floor(state.balance / GAME_CONFIG.spinCost);
  const spinsToRun = Math.min(requestedSpins, maxAffordableSpins);

  if (spinsToRun === 0) {
    setMessage(ui, "Not enough tokens for another spin. Reset to start over.");
    return;
  }

  await sounds.resume();

  state.isSpinning = true;
  setSpinning(ui, true);
  updateDashboard(ui, state);

  for (let roundIndex = 0; roundIndex < spinsToRun; roundIndex += 1) {
    state.balance -= GAME_CONFIG.spinCost;
    state.totalSpent += GAME_CONFIG.spinCost;
    state.totalNet -= GAME_CONFIG.spinCost;

    setMessage(ui, `Running spin ${roundIndex + 1} of ${spinsToRun}...`);
    setPattern(ui, {
      key: "spinning",
      label: "Spinning",
      detail: "Matching symbols will be identified here."
    });
    updateDashboard(ui, state);

    await playRound();
    await wait(180);
  }

  state.isSpinning = false;
  setSpinning(ui, false);
  refreshUI();
}

function resetGame() {
  state.balance = GAME_CONFIG.startingTokens;
  state.totalSpent = 0;
  state.totalGained = 0;
  state.totalNet = 0;
  state.rounds = [];
  state.isSpinning = false;

  renderReels(ui, createInitialResults());
  setPattern(ui, {
    key: "ready",
    label: "Waiting for a spin",
    detail: "Three matching symbols pay the most. Any pair returns 20 tokens."
  });
  setMessage(ui, DEFAULT_MESSAGE);
  setSpinning(ui, false);
  refreshUI();
}

ui.spinButton.addEventListener("click", spinMultipleRounds);
ui.resetButton.addEventListener("click", resetGame);
ui.spinCount.addEventListener("input", () => {
  const normalized = Math.max(1, Math.min(10, Number(ui.spinCount.value) || 1));
  ui.spinCount.value = String(normalized);
  updateDashboard(ui, state);
});

resetGame();
