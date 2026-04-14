import { GAME_CONFIG } from "./config.js";

/**
 * Cache all mutable UI references in one place.
 */
export function createUI() {
  return {
    machine: document.querySelector(".machine"),
    collapsiblePanels: Array.from(document.querySelectorAll(".collapsible-panel")),
    reelFrames: Array.from(document.querySelectorAll(".reel-frame")),
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
    betPerSpin: document.getElementById("bet-per-spin"),
    playNote: document.getElementById("play-note"),
    spinButton: document.getElementById("spin-button"),
    stopButton: document.getElementById("stop-button"),
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

export function highlightMatches(ui, matchedIndexes = []) {
  ui.reelFrames.forEach((frame, index) => {
    frame.classList.toggle("reel-frame-match", matchedIndexes.includes(index));
  });
}

export function setSpinning(ui, spinning) {
  ui.reelElements.forEach((reel) => {
    reel.classList.toggle("spinning", spinning);
  });

  ui.stopButton.hidden = !spinning;
  ui.stopButton.disabled = !spinning;
  ui.resetButton.disabled = spinning;
}

export function updateDashboard(ui, state) {
  const requestedSpins = Number(ui.spinCount.value);
  const normalizedSpins = Number.isFinite(requestedSpins) ? requestedSpins : 1;
  const betPerSpin = Number(ui.betPerSpin.value) || GAME_CONFIG.baseSpinCost;
  const totalCost = normalizedSpins * betPerSpin;
  const playLabel = normalizedSpins === 1 ? `Play 1 Spin (${betPerSpin})` : `Play ${normalizedSpins} Spins (${totalCost})`;

  ui.tokenBalance.textContent = String(state.balance);
  ui.startingBalance.textContent = String(GAME_CONFIG.startingTokens);
  ui.totalSpent.textContent = String(state.totalSpent);
  ui.totalGained.textContent = String(state.totalGained);
  ui.totalNet.textContent = `${state.totalNet >= 0 ? "+" : ""}${state.totalNet}`;
  ui.spinButton.textContent = playLabel;
  ui.playNote.textContent = `${normalizedSpins} spin${normalizedSpins === 1 ? "" : "s"} at ${betPerSpin} tokens each. Payouts scale with your bet.`;

  if (!state.isSpinning) {
    ui.spinButton.disabled = state.balance < betPerSpin;
    ui.spinCount.disabled = false;
    ui.betPerSpin.disabled = false;
  } else {
    ui.spinButton.disabled = true;
    ui.spinCount.disabled = false;
    ui.betPerSpin.disabled = true;
  }
}

export function renderHistory(ui, history) {
  ui.roundHistory.innerHTML = "";

  if (history.length === 0) {
    const emptyState = document.createElement("tr");
    emptyState.className = "history-empty-row";

    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No spins yet. Round results will appear here.";

    emptyState.append(cell);
    ui.roundHistory.append(emptyState);
    return;
  }

  history
    .slice()
    .reverse()
    .forEach((round) => {
      const row = document.createElement("tr");

      const roundCell = document.createElement("td");
      roundCell.textContent = `#${round.roundNumber}`;

      const outputCell = document.createElement("td");
      outputCell.className = "history-output";
      round.results.forEach((result, index) => {
        const token = document.createElement("span");
        token.className = "history-symbol";
        if (round.pattern.matchedIndexes.includes(index)) {
          token.classList.add("history-symbol-match");
        }

        token.textContent = result.icon;
        token.setAttribute("aria-label", result.name);
        outputCell.append(token);
      });

      const resultCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `history-badge history-badge-${round.pattern.key}`;
      badge.textContent = round.pattern.label;
      resultCell.append(badge);

      const netCell = document.createElement("td");
      netCell.className = round.net >= 0 ? "net-positive" : "net-negative";
      netCell.textContent = `${round.net >= 0 ? "+" : ""}${round.net}`;

      row.append(roundCell, outputCell, resultCell, netCell);
      ui.roundHistory.append(row);
    });
}

export function pulseMachine(ui, tone) {
  ui.machine.classList.remove("flash-win", "flash-loss");
  ui.machine.classList.add(tone);

  window.setTimeout(() => {
    ui.machine.classList.remove(tone);
  }, 600);
}

export function setupCollapsiblePanels(ui) {
  ui.collapsiblePanels.forEach((panel) => {
    const summary = panel.querySelector("summary");
    const content = panel.querySelector(".collapsible-content");

    if (!summary || !content) {
      return;
    }

    const syncState = () => {
      panel.classList.toggle("is-collapsed", !panel.open);
      content.style.maxHeight = panel.open ? `${content.scrollHeight}px` : "0px";
    };

    syncState();

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      panel.open = !panel.open;
      syncState();
    });

    window.addEventListener("resize", () => {
      if (panel.open) {
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });
}
