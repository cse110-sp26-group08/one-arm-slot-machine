import { GAME_CONFIG } from "./config.js";

/**
 * Cache all mutable UI references in one place.
 */
export function createUI() {
  return {
    machine: document.querySelector(".machine"),
    reelElements: Array.from(document.querySelectorAll("[data-reel]")),
    tokenBalance: document.getElementById("token-balance"),
    startingBalance: document.getElementById("starting-balance"),
    totalSpent: document.getElementById("total-spent"),
    totalGained: document.getElementById("total-gained"),
    totalNet: document.getElementById("total-net"),
    message: document.getElementById("message"),
    patternName: document.getElementById("pattern-name"),
    patternDetail: document.getElementById("pattern-detail"),
    spinCount: document.getElementById("spin-count"),
    spinButton: document.getElementById("spin-button"),
    resetButton: document.getElementById("reset-button"),
    roundHistory: document.getElementById("round-history")
  };
}

export function setMessage(ui, message) {
  ui.message.textContent = message;
}

export function setPattern(ui, pattern) {
  ui.patternName.textContent = pattern.label;
  ui.patternDetail.textContent = pattern.detail;
  ui.machine.dataset.pattern = pattern.key;
}

export function renderReels(ui, results) {
  results.forEach((result, index) => {
    const reel = ui.reelElements[index];
    reel.textContent = result.icon;
    reel.setAttribute("aria-label", result.name);
  });
}

export function setSpinning(ui, spinning) {
  ui.reelElements.forEach((reel) => {
    reel.classList.toggle("spinning", spinning);
  });

  ui.spinButton.disabled = spinning;
  ui.spinCount.disabled = spinning;
}

export function updateDashboard(ui, state) {
  ui.tokenBalance.textContent = String(state.balance);
  ui.startingBalance.textContent = String(GAME_CONFIG.startingTokens);
  ui.totalSpent.textContent = String(state.totalSpent);
  ui.totalGained.textContent = String(state.totalGained);
  ui.totalNet.textContent = `${state.totalNet >= 0 ? "+" : ""}${state.totalNet}`;

  if (!state.isSpinning) {
    const requestedSpins = Number(ui.spinCount.value);
    const canAfford = requestedSpins * GAME_CONFIG.spinCost <= state.balance;
    ui.spinButton.disabled = state.balance < GAME_CONFIG.spinCost || !canAfford;
  }
}

export function renderHistory(ui, history) {
  ui.roundHistory.innerHTML = "";

  if (history.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "history-empty";
    emptyState.textContent = "No spins yet. Round results will appear here.";
    ui.roundHistory.append(emptyState);
    return;
  }

  history
    .slice()
    .reverse()
    .forEach((round) => {
      const item = document.createElement("li");
      item.className = "history-item";

      const roundLabel = document.createElement("span");
      roundLabel.className = "history-round";
      roundLabel.textContent = `Round ${round.roundNumber}`;

      const reels = document.createElement("span");
      reels.className = "history-reels";
      reels.textContent = round.results.map((result) => result.icon).join(" ");

      const summary = document.createElement("span");
      summary.className = "history-summary";
      summary.textContent = `${round.pattern.label} | +${round.gained} gained | -${round.spent} spent | ${round.net >= 0 ? "+" : ""}${round.net} net`;

      item.append(roundLabel, reels, summary);
      ui.roundHistory.append(item);
    });
}

export function pulseMachine(ui, tone) {
  ui.machine.classList.remove("flash-win", "flash-loss");
  ui.machine.classList.add(tone);

  window.setTimeout(() => {
    ui.machine.classList.remove(tone);
  }, 600);
}
