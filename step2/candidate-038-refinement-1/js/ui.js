import { MAX_LOG_ENTRIES, SYMBOLS } from "./data.js";

/**
 * Centralizes DOM reads and rendering so gameplay logic stays free of element lookups.
 */
export function createUi() {
  const elements = {
    startingTokens: document.getElementById("startingTokens"),
    tokenCount: document.getElementById("tokenCount"),
    spinCost: document.getElementById("spinCost"),
    resultLabel: document.getElementById("resultLabel"),
    tauntLine: document.getElementById("tauntLine"),
    patternLabel: document.getElementById("patternLabel"),
    patternDescription: document.getElementById("patternDescription"),
    roundDelta: document.getElementById("roundDelta"),
    roundNet: document.getElementById("roundNet"),
    playCount: document.getElementById("playCount"),
    spinButton: document.getElementById("spinButton"),
    resetButton: document.getElementById("resetButton"),
    logList: document.getElementById("logList"),
    legend: document.getElementById("legend"),
    reels: ["reel1", "reel2", "reel3"].map((id) => document.getElementById(id))
  };

  function renderLegend() {
    elements.legend.innerHTML = "";

    SYMBOLS.forEach((symbol) => {
      const item = document.createElement("article");
      item.className = "legend-item";
      item.innerHTML = `
        <span class="legend-symbol" aria-hidden="true">${symbol.icon}</span>
        <div>
          <div class="legend-name">${symbol.name}</div>
          <div class="legend-copy">${symbol.description}</div>
        </div>
      `;
      elements.legend.append(item);
    });
  }

  function setScoreboard({ startingTokens, currentTokens, costPerPlay, resultLabel }) {
    elements.startingTokens.textContent = String(startingTokens);
    elements.tokenCount.textContent = String(currentTokens);
    elements.spinCost.textContent = String(costPerPlay);
    elements.resultLabel.textContent = resultLabel;
  }

  function setRoundDetails(summary) {
    elements.patternLabel.textContent = summary.pattern;
    elements.patternDescription.textContent = `${summary.resultLabel}: ${summary.message}`;
    elements.roundDelta.textContent = `Spent ${summary.spent} | Gained ${summary.gained}`;
    elements.roundNet.textContent = `Net ${summary.net >= 0 ? "+" : ""}${summary.net} tokens.`;
  }

  function setStatusMessage(message) {
    elements.tauntLine.textContent = message;
  }

  function setControlsDisabled(disabled) {
    elements.spinButton.disabled = disabled;
    elements.playCount.disabled = disabled;
  }

  function readPlayCount() {
    return Number(elements.playCount.value);
  }

  function setReels(symbols, highlight = false) {
    elements.reels.forEach((reel, index) => {
      reel.textContent = symbols[index].icon;
      reel.classList.toggle("win", highlight);
      reel.classList.remove("spinning");
    });
  }

  function setReelsSpinning() {
    elements.reels.forEach((reel) => {
      reel.classList.remove("win");
      reel.classList.add("spinning");
    });
  }

  function animateReels(randomSymbol) {
    let tick = 0;

    return new Promise((resolve) => {
      const interval = window.setInterval(() => {
        elements.reels.forEach((reel, index) => {
          if (tick < 8 || index <= tick - 8) {
            reel.textContent = randomSymbol().icon;
          }
        });

        tick += 1;

        if (tick >= 12) {
          window.clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  function prependLog(summary, balanceAfter, roundNumber) {
    const item = document.createElement("li");
    const deltaClass = summary.net < 0 ? "loss" : "";
    item.innerHTML = `
      <div class="log-title">
        <span class="log-pattern">Round ${roundNumber}: ${summary.pattern}</span>
        <span class="log-delta ${deltaClass}">Net ${summary.net >= 0 ? "+" : ""}${summary.net}</span>
      </div>
      <p class="log-meta">${summary.icons.join(" ")} | Spent ${summary.spent}, gained ${summary.gained}, balance ${balanceAfter}.</p>
    `;

    elements.logList.prepend(item);

    while (elements.logList.children.length > MAX_LOG_ENTRIES) {
      elements.logList.removeChild(elements.logList.lastChild);
    }
  }

  function clearLog() {
    elements.logList.innerHTML = "";
  }

  return {
    elements,
    animateReels,
    clearLog,
    prependLog,
    readPlayCount,
    renderLegend,
    setControlsDisabled,
    setReels,
    setReelsSpinning,
    setRoundDetails,
    setScoreboard,
    setStatusMessage
  };
}
