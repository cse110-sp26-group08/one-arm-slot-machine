import { SlotAudio } from "./audio.js";
import { INITIAL_TOKENS, SPIN_COST, SYMBOLS } from "./data.js";
import {
  canAffordRound,
  createInitialState,
  getRunCount,
  getStatusText,
  randomSymbol,
  resolveRound,
} from "./game.js";
import {
  addLogEntry,
  getElements,
  pulseWin,
  renderState,
  resetSurface,
  setControlsDisabled,
  setLeverPulling,
  setStatus,
} from "./ui.js";

const elements = getElements();
const audio = new SlotAudio();
let state = createInitialState();

/**
 * Small timing helper for pacing multi-round play.
 */
function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Runs the reel animation until each column reaches its final symbol.
 */
function runReels(finalSymbols) {
  const durations = [900, 1250, 1600];
  elements.reels.forEach((reel) => reel.classList.add("spinning"));

  return Promise.all(
    elements.reels.map(
      (reel, index) =>
        new Promise((resolve) => {
          const stopTime = performance.now() + durations[index];

          function tick(now) {
            if (now >= stopTime) {
              reel.textContent = finalSymbols[index];
              reel.classList.remove("spinning");
              audio.playReelStop(index).catch(() => {});
              resolve();
              return;
            }

            reel.textContent = randomSymbol();
            requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        })
    )
  );
}

/**
 * Fully resolves one round, then writes the results back to the interface.
 */
async function playSingleRound(roundNumber, totalRounds) {
  if (!canAffordRound(state.tokens)) {
    setStatus(elements, "Not enough tokens to start another round.");
    return false;
  }

  setLeverPulling(elements, true);
  setStatus(
    elements,
    totalRounds > 1
      ? `Playing round ${roundNumber} of ${totalRounds}.`
      : "Playing round 1 of 1."
  );
  await audio.playPull().catch(() => {});

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await runReels(finalSymbols);

  state = {
    ...state,
    ...resolveRound(state, finalSymbols),
  };

  renderState(elements, state);
  pulseWin(elements, state.lastRound.outcomeType);
  addLogEntry(elements, state.lastRound);
  setStatus(
    elements,
    getStatusText(state.lastRound, state.tokens, canAffordRound(state.tokens))
  );
  await audio.playOutcome(state.lastRound.outcomeType).catch(() => {});
  setLeverPulling(elements, false);

  return true;
}

/**
 * Plays the selected number of rounds or stops early when the player runs out of tokens.
 */
async function handlePlay() {
  if (state.spinning) {
    return;
  }

  if (!canAffordRound(state.tokens)) {
    setStatus(elements, "Not enough tokens to spin. Reset the machine to start over.");
    setControlsDisabled(elements, true);
    return;
  }

  state = { ...state, spinning: true };
  setControlsDisabled(elements, true);

  const totalRounds = getRunCount(elements.playCount.value);

  for (let index = 0; index < totalRounds; index += 1) {
    const didPlay = await playSingleRound(index + 1, totalRounds);

    if (!didPlay) {
      break;
    }

    if (index < totalRounds - 1) {
      await delay(300);
    }
  }

  state = { ...state, spinning: false };
  setLeverPulling(elements, false);
  setControlsDisabled(elements, !canAffordRound(state.tokens));
}

/**
 * Restores the original session values and UI text.
 */
function resetGame() {
  state = createInitialState();
  resetSurface(elements, SYMBOLS.slice(0, 3));
  renderState(elements, state);
  setStatus(
    elements,
    `Starting bankroll restored to ${INITIAL_TOKENS} tokens. Each spin costs ${SPIN_COST}.`
  );
  setLeverPulling(elements, false);
  setControlsDisabled(elements, false);
}

elements.leverButton.addEventListener("click", handlePlay);
elements.resetButton.addEventListener("click", resetGame);

renderState(elements, state);
resetSurface(elements, SYMBOLS.slice(0, 3));
