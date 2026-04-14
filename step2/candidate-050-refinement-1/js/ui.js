import { SYMBOLS } from "./config.js";

/**
 * DOM lookup and rendering helpers are grouped here to keep app.js focused on flow.
 */
export function createUI() {
  return {
    startingTokens: document.getElementById("startingTokensValue"),
    tokens: document.getElementById("tokensValue"),
    cost: document.getElementById("costValue"),
    pressure: document.getElementById("pressureValue"),
    cache: document.getElementById("cacheValue"),
    combo: document.getElementById("comboValue"),
    peak: document.getElementById("peakValue"),
    spent: document.getElementById("spentValue"),
    gained: document.getElementById("gainedValue"),
    net: document.getElementById("netValue"),
    pattern: document.getElementById("patternValue"),
    status: document.getElementById("statusLine"),
    spinButton: document.getElementById("spinButton"),
    refineButton: document.getElementById("refineButton"),
    stashButton: document.getElementById("stashButton"),
    resetButton: document.getElementById("resetButton"),
    soundButton: document.getElementById("soundButton"),
    playsInput: document.getElementById("playsInput"),
    drums: [0, 1, 2].map((index) => document.getElementById(`drum${index}`)),
    drumFrames: Array.from(document.querySelectorAll(".drum")),
    log: document.getElementById("logList"),
    machine: document.querySelector(".machine-panel"),
    patternList: document.getElementById("patternList")
  };
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function renderState(ui, state, refineCost) {
  ui.startingTokens.textContent = formatNumber(state.startingTokens);
  ui.tokens.textContent = formatNumber(state.tokens);
  ui.cost.textContent = formatNumber(state.cost);
  ui.pressure.textContent = `${state.pressure.toFixed(1)}x`;
  ui.cache.textContent = formatNumber(state.cache);
  ui.combo.textContent = formatNumber(state.combo);
  ui.peak.textContent = formatNumber(state.peak);
  ui.spent.textContent = formatSigned(-state.roundSpent);
  ui.gained.textContent = formatSigned(state.roundGained);
  ui.net.textContent = formatSigned(state.roundNet);
  ui.pattern.textContent = state.lastPattern;
  ui.net.classList.toggle("positive", state.roundNet > 0);
  ui.net.classList.toggle("negative", state.roundNet < 0);

  const playCount = getPlayCount(ui);
  ui.spinButton.disabled = state.spinning || state.tokens < state.cost;
  ui.refineButton.disabled = state.spinning || state.tokens < refineCost;
  ui.stashButton.disabled = state.spinning || state.cache === 0;
  ui.playsInput.disabled = state.spinning;
  ui.spinButton.textContent = playCount > 1 ? `Play x${playCount}` : "Play";
  ui.soundButton.textContent = state.soundEnabled ? "Sound: On" : "Sound: Off";
  ui.soundButton.setAttribute("aria-pressed", String(state.soundEnabled));
}

function formatSigned(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

export function addLog(ui, message) {
  const item = document.createElement("li");
  item.textContent = message;
  ui.log.prepend(item);

  while (ui.log.children.length > 8) {
    ui.log.removeChild(ui.log.lastChild);
  }
}

export function setStatus(ui, message) {
  ui.status.textContent = message;
}

export function renderPatterns(ui, patterns) {
  ui.patternList.innerHTML = "";

  const tripleSymbolNames = SYMBOLS
    .filter((symbol) => symbol.jackpot > 0)
    .map((symbol) => `${symbol.name} x3`);

  patterns.forEach((pattern) => {
    const item = document.createElement("article");
    item.className = "pattern-item";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "pattern-name";
    title.textContent = pattern.id === "triple-match" ? "Triple Match" : pattern.label;

    const meta = document.createElement("div");
    meta.className = "pattern-meta";
    meta.textContent = pattern.id === "triple-match"
      ? tripleSymbolNames.join(", ")
      : pattern.description;

    const payout = document.createElement("strong");
    payout.textContent = pattern.id === "triple-match" ? "symbol jackpot" : formatSigned(pattern.payout([], { pressure: 1 }));

    left.append(title, meta);
    item.append(left, payout);
    ui.patternList.append(item);
  });
}

export function seedLog(ui) {
  [
    "Starting session restored.",
    "Use the plays control to run several spins in sequence.",
    "Round cards show spend, gain, and net for the latest play."
  ].reverse().forEach((message) => addLog(ui, message));
}

export function getPlayCount(ui) {
  const raw = Number(ui.playsInput.value);
  if (!Number.isFinite(raw)) {
    return 1;
  }

  const clamped = Math.min(10, Math.max(1, Math.floor(raw)));
  ui.playsInput.value = String(clamped);
  return clamped;
}
