const SYMBOLS = [
  { name: "GPU", weight: 4, jackpot: 540 },
  { name: "MODEL", weight: 5, jackpot: 420 },
  { name: "TOKEN", weight: 7, jackpot: 260 },
  { name: "AI", weight: 7, jackpot: 210 },
  { name: "VC", weight: 5, jackpot: 300 },
  { name: "BUG", weight: 4, jackpot: 0 },
  { name: "PROMPT", weight: 6, jackpot: 230 }
];

const STORAGE_KEY = "candidate-050-prompt-mine";

const state = {
  tokens: 1000,
  cost: 45,
  pressure: 1,
  cache: 0,
  combo: 0,
  last: 0,
  peak: 0,
  spinning: false
};

const ui = {
  tokens: document.getElementById("tokensValue"),
  cost: document.getElementById("costValue"),
  pressure: document.getElementById("pressureValue"),
  cache: document.getElementById("cacheValue"),
  combo: document.getElementById("comboValue"),
  last: document.getElementById("lastValue"),
  peak: document.getElementById("peakValue"),
  status: document.getElementById("statusLine"),
  spinButton: document.getElementById("spinButton"),
  refineButton: document.getElementById("refineButton"),
  stashButton: document.getElementById("stashButton"),
  resetButton: document.getElementById("resetButton"),
  drums: [0, 1, 2].map((index) => document.getElementById(`drum${index}`)),
  drumFrames: Array.from(document.querySelectorAll(".drum")),
  log: document.getElementById("logList"),
  machine: document.querySelector(".machine-panel")
};

let audioContext;

restoreState();
render();
seedLog();

ui.spinButton.addEventListener("click", spin);
ui.refineButton.addEventListener("click", refinePrompts);
ui.stashButton.addEventListener("click", stashHype);
ui.resetButton.addEventListener("click", resetMachine);

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    Object.assign(state, JSON.parse(raw));
  } catch (error) {
    console.warn("Could not restore Prompt Mine state.", error);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  ui.tokens.textContent = format(state.tokens);
  ui.cost.textContent = format(state.cost);
  ui.pressure.textContent = `${state.pressure.toFixed(1)}x`;
  ui.cache.textContent = format(state.cache);
  ui.combo.textContent = format(state.combo);
  ui.last.textContent = format(state.last);
  ui.peak.textContent = format(state.peak);

  ui.spinButton.disabled = state.spinning || state.tokens < state.cost;
  ui.refineButton.disabled = state.spinning || state.tokens < refineCost();
  ui.stashButton.disabled = state.spinning || state.cache === 0;
}

function seedLog() {
  [
    "Mine report: all value remains theoretical, but morale is suspiciously high.",
    "Reminder: each token burned here could have fixed a real user problem.",
    "Operations nominal. Ethics still buffering."
  ].reverse().forEach(addLog);
}

function addLog(message) {
  const item = document.createElement("li");
  item.textContent = message;
  ui.log.prepend(item);

  while (ui.log.children.length > 7) {
    ui.log.removeChild(ui.log.lastChild);
  }
}

function setStatus(message) {
  ui.status.textContent = message;
}

function weightedPick() {
  const total = SYMBOLS.reduce((sum, symbol) => sum + symbol.weight, 0);
  let cursor = Math.random() * total;

  for (const symbol of SYMBOLS) {
    cursor -= symbol.weight;
    if (cursor <= 0) {
      return symbol;
    }
  }

  return SYMBOLS[SYMBOLS.length - 1];
}

async function spin() {
  if (state.spinning || state.tokens < state.cost) {
    return;
  }

  ensureAudio();
  state.spinning = true;
  state.tokens -= state.cost;
  state.last = 0;
  setStatus("Drilling for insight. Please enjoy the sound of money becoming vapor.");
  render();
  saveState();

  ui.drumFrames.forEach((drum) => drum.classList.add("spinning"));
  const result = await Promise.all(ui.drums.map((_, index) => animateDrum(index)));
  ui.drumFrames.forEach((drum) => drum.classList.remove("spinning"));

  const payout = evaluate(result);
  state.last = payout;
  state.peak = Math.max(state.peak, payout);
  state.tokens += payout;
  state.spinning = false;

  if (payout > 0) {
    state.combo += 1;
    state.cache += Math.round(payout * 0.3);
    if (state.combo % 4 === 0) {
      state.pressure = Number((state.pressure + 0.25).toFixed(1));
      addLog(`Hype pressure increased to ${state.pressure.toFixed(1)}x. Nobody checked the valves.`);
    }
    celebrateWin(result, payout);
  } else {
    state.combo = 0;
    state.pressure = 1;
    celebrateLoss(result);
  }

  if (state.tokens < state.cost && payout === 0) {
    setStatus("Tank low. Consider saying the word platform several times.");
    addLog("Funding event required. The mine has entered visionary austerity.");
  }

  render();
  saveState();
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
        drum.textContent = weightedPick().name;
        lastStep = elapsed;
        blip(230 + index * 90, 0.02, "square");
      }

      if (elapsed < duration) {
        requestAnimationFrame(frame);
        return;
      }

      const finalSymbol = weightedPick();
      drum.textContent = finalSymbol.name;
      blip(360 + index * 110, 0.06, "triangle");
      resolve(finalSymbol);
    };

    requestAnimationFrame(frame);
  });
}

function evaluate(result) {
  const names = result.map((symbol) => symbol.name);
  const [a, b, c] = names;
  const allSame = a === b && b === c;
  const anyPair = a === b || b === c || a === c;
  const gpuPair = names.filter((name) => name === "GPU").length >= 2;
  const aiVcToken = ["AI", "VC", "TOKEN"].every((name) => names.includes(name));

  if (allSame) {
    return Math.round(result[0].jackpot * state.pressure);
  }

  if (aiVcToken) {
    return Math.round(170 * state.pressure);
  }

  if (gpuPair) {
    return Math.round(135 * state.pressure);
  }

  if (anyPair) {
    return Math.round(85 * state.pressure);
  }

  return 0;
}

function celebrateWin(result, payout) {
  const names = result.map((symbol) => symbol.name).join(" + ");
  ui.machine.classList.remove("loss");
  void ui.machine.offsetWidth;
  ui.machine.classList.add("win");

  if (result.every((symbol) => symbol.name === result[0].name)) {
    setStatus(`Jackpot on ${names}. Please mislabel this as emergent intelligence.`);
    addLog(`Extraction success: ${format(payout)} tokens from ${names}. Slide deck quality rising.`);
    blip(620, 0.18, "sawtooth");
  } else {
    setStatus(`Useful rubble found: ${names}. Finance has classified it as traction.`);
    addLog(`Recovered ${format(payout)} tokens from ${names}. The mine continues to disrespect causality.`);
  }
}

function celebrateLoss(result) {
  const names = result.map((symbol) => symbol.name).join(" + ");
  ui.machine.classList.remove("win");
  void ui.machine.offsetWidth;
  ui.machine.classList.add("loss");
  setStatus(`Dry hole on ${names}. Tell the team the failure was data-driven.`);
  addLog(`No payout on ${names}. Please arrange a retrospective with dramatic lighting.`);
  blip(170, 0.08, "sine");
}

function refinePrompts() {
  const cost = refineCost();
  if (state.spinning || state.tokens < cost) {
    return;
  }

  ensureAudio();
  state.tokens -= cost;
  state.cost += 12;
  state.pressure = Number((state.pressure + 0.15).toFixed(1));
  setStatus("Prompt refinement complete. Results remain spiritually identical.");
  addLog(`Spent ${format(cost)} tokens polishing prompts. The machine now fails with better diction.`);
  blip(500, 0.1, "triangle");
  render();
  saveState();
}

function stashHype() {
  if (state.spinning || state.cache === 0) {
    return;
  }

  ensureAudio();
  const payout = Math.max(50, Math.round(state.cache * 0.65));
  state.tokens += payout;
  state.cache = 0;
  setStatus(`Stashed hype converted into ${format(payout)} fresh tokens. Circular economics restored.`);
  addLog(`Cache liquidation produced ${format(payout)} tokens. The auditors are blinking a lot.`);
  blip(460, 0.1, "triangle");
  render();
  saveState();
}

function refineCost() {
  return Math.round(state.cost * 3);
}

function resetMachine() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    tokens: 1000,
    cost: 45,
    pressure: 1,
    cache: 0,
    combo: 0,
    last: 0,
    peak: 0,
    spinning: false
  });
  ["MODEL", "GPU", "TOKEN"].forEach((value, index) => {
    ui.drums[index].textContent = value;
  });
  setStatus("Startup collapsed successfully. New deck already claims lessons learned.");
  addLog("Reset complete. History deleted, confidence restored.");
  render();
}

function format(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function ensureAudio() {
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      return;
    }
    audioContext = new Context();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

function blip(frequency, duration, type) {
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
