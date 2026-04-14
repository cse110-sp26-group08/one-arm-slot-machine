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
    stopButton: document.getElementById("stopButton"),
    resetButton: document.getElementById("resetButton"),
    spinCountInput: document.getElementById("spinCountInput"),
    spinWagerInput: document.getElementById("spinWagerInput"),
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
  const canAffordSpin = state.balance >= state.currentSpinCost;
  ui.spinCost.textContent = String(state.currentSpinCost);
  ui.spinButton.disabled = state.isSpinning || !canAffordSpin;
  ui.stopButton.hidden = !state.isSpinning || state.queuedSpins <= 0;
  ui.stopButton.disabled = !state.isSpinning || state.stopRequested || state.queuedSpins <= 0;
  ui.spinCountInput.disabled = state.isSpinning;
  ui.spinWagerInput.disabled = state.isSpinning;
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
  ui.reels.forEach((reel) => reel.classList.remove("win", "win-pair", "win-jackpot"));
}

export function highlightWinningReels(ui, indices) {
  clearWinState(ui);
  const highlightedSet = new Set(indices);
  indices.forEach((index) => {
    const reel = ui.reels[index];
    reel.classList.add("win");
    reel.classList.toggle("win-pair", highlightedSet.size === 2);
    reel.classList.toggle("win-jackpot", highlightedSet.size === 3);
  });
}

export function renderHistory(ui, history) {
  if (history.length === 0) {
    ui.historyList.innerHTML = `
      <tr>
        <td colspan="3" class="history-empty">No rounds yet.</td>
      </tr>
    `;
    return;
  }

  ui.historyList.innerHTML = history
    .map((round) => {
      const reels = round.result
        .map((symbol, index) => {
          const isMatch = round.winningIndices.includes(index);
          const toneClass = round.winningIndices.length === 3 ? "is-jackpot" : "is-pair";
          const matchClass = isMatch ? `history-symbol is-match ${toneClass}` : "history-symbol";
          return `<span class="${matchClass}">${symbol}</span>`;
        })
        .join("");
      const netClass = round.net >= 0 ? "positive" : "negative";
      const categoryClass = round.net > 0 ? "positive" : "negative";

      return `
        <tr>
          <td><div class="history-reels">${reels}</div></td>
          <td>
            <strong class="${categoryClass}">${round.categoryLabel}</strong><br>
            <span>${round.patternLabel}</span>
          </td>
          <td><strong class="${netClass}">${formatSignedTokens(round.net)}</strong></td>
        </tr>
      `;
    })
    .join("");
}
