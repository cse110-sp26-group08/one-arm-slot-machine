import { GAME_CONFIG } from "./config.js";

/**
 * Cache the DOM references used throughout the app.
 */
export function createUi() {
  return {
    reels: [...document.querySelectorAll("[data-reel]")],
    tokenBalance: document.getElementById("tokenBalance"),
    startingBalance: document.getElementById("startingBalance"),
    roundCount: document.getElementById("roundCount"),
    spinCost: document.getElementById("spinCost"),
    message: document.getElementById("message"),
    patternSummary: document.getElementById("patternSummary"),
    roundSpent: document.getElementById("roundSpent"),
    roundGained: document.getElementById("roundGained"),
    roundNet: document.getElementById("roundNet"),
    historyList: document.getElementById("historyList"),
    spinButton: document.getElementById("spinButton"),
    resetButton: document.getElementById("resetButton"),
  };
}

export function formatSignedTokens(value) {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function updateStaticLabels(ui) {
  ui.startingBalance.textContent = String(GAME_CONFIG.startingTokens);
  ui.spinCost.textContent = String(GAME_CONFIG.spinCost);
}

export function updateStatus(ui, state) {
  ui.tokenBalance.textContent = String(state.balance);
  ui.roundCount.textContent = String(state.roundsPlayed);
  ui.spinButton.disabled = state.isSpinning || state.balance < GAME_CONFIG.spinCost;
}

export function setMessage(ui, text) {
  ui.message.textContent = text;
}

export function renderRoundSummary(ui, round) {
  ui.roundSpent.textContent = String(round.spent);
  ui.roundGained.textContent = String(round.gained);
  ui.roundNet.textContent = formatSignedTokens(round.net);
  ui.roundNet.className = round.net >= 0 ? "positive" : "negative";
}

export function renderPattern(ui, round) {
  ui.patternSummary.textContent = round.patternLabel;
}

export function clearWinState(ui) {
  ui.reels.forEach((reel) => reel.classList.remove("win"));
}

export function highlightWinningReels(ui, indices) {
  clearWinState(ui);
  indices.forEach((index) => ui.reels[index].classList.add("win"));
}

export function renderHistory(ui, history) {
  if (history.length === 0) {
    ui.historyList.innerHTML = "<li>No rounds yet.</li>";
    return;
  }

  ui.historyList.innerHTML = history
    .map((round) => {
      const reels = round.result.join(" ");
      const netClass = round.net >= 0 ? "positive" : "negative";

      return `
        <li>
          <span class="history-reels">${reels}</span>
          <span>${round.patternLabel}</span>
          <strong class="${netClass}">${formatSignedTokens(round.net)}</strong>
        </li>
      `;
    })
    .join("");
}
