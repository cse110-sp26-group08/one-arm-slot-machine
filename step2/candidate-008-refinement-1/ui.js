import { DEFAULT_PURCHASE, INITIAL_TOKENS, INTRO_LOG, SPIN_COST } from "./data.js";

/**
 * Centralized DOM lookups for the page.
 */
export function getElements() {
  return {
    reels: Array.from(document.querySelectorAll(".reel")),
    machine: document.querySelector(".machine"),
    tokenBalance: document.getElementById("tokenBalance"),
    startingTokens: document.getElementById("startingTokens"),
    spinCost: document.getElementById("spinCost"),
    roundCount: document.getElementById("roundCount"),
    roundStart: document.getElementById("roundStart"),
    roundWon: document.getElementById("roundWon"),
    roundSpent: document.getElementById("roundSpent"),
    roundNet: document.getElementById("roundNet"),
    patternTitle: document.getElementById("patternTitle"),
    patternCopy: document.getElementById("patternCopy"),
    statusMessage: document.getElementById("statusMessage"),
    shopItem: document.getElementById("shopItem"),
    shopCopy: document.getElementById("shopCopy"),
    activityLog: document.getElementById("activityLog"),
    leverButton: document.getElementById("leverButton"),
    resetButton: document.getElementById("resetButton"),
    playCount: document.getElementById("playCount"),
  };
}

/**
 * Writes all stateful values to the page.
 */
export function renderState(elements, state) {
  const { lastRound } = state;

  elements.startingTokens.textContent = INITIAL_TOKENS;
  elements.tokenBalance.textContent = state.tokens;
  elements.spinCost.textContent = SPIN_COST;
  elements.roundCount.textContent = state.roundsPlayed;
  elements.roundStart.textContent = lastRound.start;
  elements.roundWon.textContent = lastRound.won;
  elements.roundSpent.textContent = lastRound.spent;
  elements.roundNet.textContent = `${lastRound.net >= 0 ? "+" : ""}${lastRound.net}`;
  elements.patternTitle.textContent = lastRound.outcomeLabel;
  elements.patternCopy.textContent = lastRound.patternCopy;
  elements.shopItem.textContent = lastRound.purchase.item;
  elements.shopCopy.textContent = lastRound.purchase.copy;
}

/**
 * Replaces the round status text announced to the user.
 */
export function setStatus(elements, text) {
  elements.statusMessage.textContent = text;
}

/**
 * Adds a new round entry to the activity log and trims older entries.
 */
export function addLogEntry(elements, round) {
  if (elements.activityLog.children.length === 1 && elements.activityLog.firstElementChild.textContent === INTRO_LOG) {
    elements.activityLog.innerHTML = "";
  }

  const item = document.createElement("li");
  item.textContent = `${round.symbols.join(" / ")} -> won ${round.won}, spent ${round.spent}, net ${round.net >= 0 ? "+" : ""}${round.net}.`;
  elements.activityLog.prepend(item);

  while (elements.activityLog.children.length > 6) {
    elements.activityLog.removeChild(elements.activityLog.lastElementChild);
  }
}

/**
 * Resets the activity log and purchase card visuals.
 */
export function resetSurface(elements, initialSymbols) {
  elements.activityLog.innerHTML = `<li>${INTRO_LOG}</li>`;
  elements.shopItem.textContent = DEFAULT_PURCHASE.item;
  elements.shopCopy.textContent = DEFAULT_PURCHASE.copy;
  elements.reels.forEach((reel, index) => {
    reel.textContent = initialSymbols[index];
    reel.classList.remove("spinning");
  });
}

export function setControlsDisabled(elements, disabled) {
  elements.leverButton.disabled = disabled;
  elements.playCount.disabled = disabled;
}

export function setLeverPulling(elements, pulling) {
  elements.leverButton.classList.toggle("pulling", pulling);
}

export function pulseWin(elements, outcomeType) {
  if (outcomeType === "miss" || outcomeType === "idle") {
    return;
  }

  elements.machine.classList.remove("celebrate");
  void elements.machine.offsetWidth;
  elements.machine.classList.add("celebrate");
}
