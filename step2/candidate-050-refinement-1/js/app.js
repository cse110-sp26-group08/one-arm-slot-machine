import { createAudioManager } from "./audio.js";
import { createGameEngine } from "./game.js";
import { clearState, loadState, saveState } from "./storage.js";
import { addLog, createUI, getPlayCount, renderPatterns, renderState, seedLog, setStatus } from "./ui.js";

const ui = createUI();
const game = createGameEngine(loadState());
const audio = createAudioManager();

audio.setEnabled(game.state.soundEnabled);
renderPatterns(ui, game.patterns);
renderState(ui, game.state, game.refineCost());
seedLog(ui);

ui.spinButton.addEventListener("click", runSpinSession);
ui.refineButton.addEventListener("click", handleRefine);
ui.stashButton.addEventListener("click", handleStash);
ui.resetButton.addEventListener("click", handleReset);
ui.soundButton.addEventListener("click", toggleSound);
ui.playsInput.addEventListener("input", () => renderState(ui, game.state, game.refineCost()));

/**
 * Runs one or more spins in sequence while keeping the UI synchronized between rounds.
 */
async function runSpinSession() {
  const requestedPlays = getPlayCount(ui);
  const affordablePlays = Math.min(requestedPlays, Math.floor(game.state.tokens / game.state.cost));

  if (game.state.spinning || affordablePlays === 0) {
    setStatus(ui, "Not enough tokens for another play.");
    return;
  }

  game.state.spinning = true;
  renderState(ui, game.state, game.refineCost());

  for (let round = 0; round < affordablePlays; round += 1) {
    await runSingleSpin(round + 1, affordablePlays);
    if (game.state.tokens < game.state.cost) {
      break;
    }
  }

  game.finishSession();
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

async function runSingleSpin(roundNumber, totalRounds) {
  game.startSpin();
  setStatus(ui, `Playing round ${roundNumber} of ${totalRounds}...`);
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);

  ui.drumFrames.forEach((drum) => drum.classList.add("spinning"));
  const result = await Promise.all(ui.drums.map((_, index) => animateDrum(index)));
  ui.drumFrames.forEach((drum) => drum.classList.remove("spinning"));

  const outcome = game.finishSpin(result);
  const names = result.map((symbol) => symbol.name).join(" - ");
  const patternLabel = outcome.pattern ? outcome.pattern.label : "No pattern";
  const isJackpot = outcome.pattern?.id === "triple-match";

  ui.machine.classList.remove("win", "loss");
  void ui.machine.offsetWidth;
  ui.machine.classList.add(outcome.gained > 0 ? "win" : "loss");

  if (outcome.gained > 0) {
    audio.win(isJackpot);
    setStatus(ui, `${names} | ${patternLabel} | Net ${formatSigned(outcome.net)}`);
    addLog(ui, `Round ${roundNumber}: spent ${game.state.cost}, gained ${outcome.gained}, pattern ${patternLabel}.`);

    if (game.state.combo > 0 && game.state.combo % 4 === 0) {
      addLog(ui, `Pressure increased to ${game.state.pressure.toFixed(1)}x.`);
    }
  } else {
    audio.loss();
    setStatus(ui, `${names} | No pattern | Net ${formatSigned(outcome.net)}`);
    addLog(ui, `Round ${roundNumber}: spent ${game.state.cost}, gained 0, no winning pattern.`);
  }

  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

function animateDrum(index) {
  return new Promise((resolve) => {
    const drum = ui.drums[index];
    const duration = 900 + index * 320;
    const start = performance.now();
    let lastStep = 0;

    const frame = (time) => {
      const elapsed = time - start;
      if (elapsed - lastStep > 75) {
        drum.textContent = game.weightedPick().name;
        lastStep = elapsed;
        audio.spinTick(index);
      }

      if (elapsed < duration) {
        requestAnimationFrame(frame);
        return;
      }

      const finalSymbol = game.weightedPick();
      drum.textContent = finalSymbol.name;
      audio.reelStop(index);
      resolve(finalSymbol);
    };

    requestAnimationFrame(frame);
  });
}

function handleRefine() {
  const result = game.refine();
  if (!result) {
    return;
  }

  audio.action();
  setStatus(ui, `Refined machine settings for ${result.cost} tokens.`);
  addLog(ui, `Refine spent ${result.cost} tokens. Spin cost is now ${game.state.cost}.`);
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

function handleStash() {
  const result = game.stash();
  if (!result) {
    return;
  }

  audio.action();
  setStatus(ui, `Collected ${result.payout} tokens from cache.`);
  addLog(ui, `Cache collection gained ${result.payout} tokens.`);
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

function handleReset() {
  clearState();
  game.reset();
  game.state.soundEnabled = true;
  audio.setEnabled(true);
  ["MODEL", "GPU", "TOKEN"].forEach((value, index) => {
    ui.drums[index].textContent = value;
  });
  setStatus(ui, "Session reset. Starting tokens restored.");
  addLog(ui, "Reset complete.");
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

function toggleSound() {
  game.state.soundEnabled = !game.state.soundEnabled;
  audio.setEnabled(game.state.soundEnabled);
  renderState(ui, game.state, game.refineCost());
  saveState(game.state);
}

function formatSigned(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("en-US").format(value)}`;
}
