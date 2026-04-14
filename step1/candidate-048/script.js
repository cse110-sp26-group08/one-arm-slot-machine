const SYMBOLS = [
  { name: "GPU", weight: 3, payout: 500 },
  { name: "Unicorn", weight: 4, payout: 360 },
  { name: "VC", weight: 5, payout: 280 },
  { name: "Prompt", weight: 6, payout: 220 },
  { name: "Token", weight: 7, payout: 180 },
  { name: "404", weight: 4, payout: 0 },
  { name: "Buzz", weight: 8, payout: 140 }
];

const STORAGE_KEY = "candidate-048-token-furnace";

const state = {
  balance: 1200,
  spinCost: 40,
  streak: 0,
  heat: 1,
  jackpots: 0,
  bestPayout: 0,
  lastPayout: 0,
  isSpinning: false
};

const ui = {
  balance: document.getElementById("tokenBalance"),
  spinCost: document.getElementById("spinCost"),
  heat: document.getElementById("heatMeter"),
  jackpots: document.getElementById("jackpotCount"),
  lastPayout: document.getElementById("lastPayout"),
  streak: document.getElementById("streakValue"),
  bestPayout: document.getElementById("bestPayout"),
  marquee: document.getElementById("marqueeText"),
  eventFeed: document.getElementById("eventFeed"),
  spinButton: document.getElementById("spinButton"),
  upgradeButton: document.getElementById("upgradeButton"),
  resetButton: document.getElementById("resetButton"),
  reels: [0, 1, 2].map((index) => document.getElementById(`reel${index}`)),
  reelFrames: Array.from(document.querySelectorAll(".reel")),
  machineCore: document.querySelector(".machine-core")
};

let audioContext;

loadState();
render();
seedFeed();

ui.spinButton.addEventListener("click", spin);
ui.upgradeButton.addEventListener("click", buyUpgrade);
ui.resetButton.addEventListener("click", resetGame);

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  } catch (error) {
    console.warn("Could not restore game state.", error);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  ui.balance.textContent = formatNumber(state.balance);
  ui.spinCost.textContent = formatNumber(state.spinCost);
  ui.heat.textContent = `${state.heat.toFixed(1)}x`;
  ui.jackpots.textContent = formatNumber(state.jackpots);
  ui.lastPayout.textContent = formatNumber(state.lastPayout);
  ui.streak.textContent = formatNumber(state.streak);
  ui.bestPayout.textContent = formatNumber(state.bestPayout);

  const canSpin = !state.isSpinning && state.balance >= state.spinCost;
  ui.spinButton.disabled = !canSpin;
  ui.upgradeButton.disabled = state.isSpinning || state.balance < upgradeCost();
}

function seedFeed() {
  const lines = [
    "Welcome back. The board has approved one more irresponsible demo.",
    "Reminder: every token spent here would have been a useful bug fix.",
    "Current strategy: rotate jargon until value appears."
  ];
  lines.reverse().forEach((line) => appendFeed(line));
}

function appendFeed(message) {
  const item = document.createElement("li");
  item.textContent = message;
  ui.eventFeed.prepend(item);

  while (ui.eventFeed.children.length > 6) {
    ui.eventFeed.removeChild(ui.eventFeed.lastChild);
  }
}

function weightedPick() {
  const totalWeight = SYMBOLS.reduce((sum, symbol) => sum + symbol.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const symbol of SYMBOLS) {
    cursor -= symbol.weight;
    if (cursor <= 0) {
      return symbol;
    }
  }

  return SYMBOLS[SYMBOLS.length - 1];
}

async function spin() {
  if (state.isSpinning || state.balance < state.spinCost) {
    return;
  }

  ensureAudio();
  state.isSpinning = true;
  state.balance -= state.spinCost;
  state.lastPayout = 0;
  setMarquee("Burning tokens for statistically unconvincing glory...");
  render();
  saveState();

  ui.reelFrames.forEach((frame) => frame.classList.add("spinning"));
  const results = await Promise.all(ui.reels.map((_, index) => animateReel(index)));
  ui.reelFrames.forEach((frame) => frame.classList.remove("spinning"));

  const payout = evaluate(results);
  state.lastPayout = payout;
  state.balance += payout;
  state.bestPayout = Math.max(state.bestPayout, payout);
  state.isSpinning = false;

  if (payout > 0) {
    state.streak += 1;
    if (results.every((symbol) => symbol.name === results[0].name)) {
      state.jackpots += 1;
    }
    if (state.streak % 5 === 0) {
      state.heat = Number((state.heat + 0.3).toFixed(1));
      appendFeed(`Heat increased to ${state.heat.toFixed(1)}x. Nobody asked for more confidence, yet here we are.`);
    }
    celebrateWin(results, payout);
  } else {
    state.streak = 0;
    state.heat = 1;
    celebrateLoss(results);
  }

  if (state.balance < state.spinCost && payout === 0) {
    appendFeed("Wallet critical. Please pivot to enterprise before the runway ends.");
    setMarquee("Out of tokens. The future of AI was apparently underfunded.");
  }

  render();
  saveState();
}

function animateReel(index) {
  return new Promise((resolve) => {
    const reel = ui.reels[index];
    const duration = 900 + index * 350;
    const startedAt = performance.now();
    let lastSwap = 0;

    const tick = (now) => {
      const elapsed = now - startedAt;
      if (elapsed - lastSwap > 80) {
        reel.textContent = weightedPick().name;
        lastSwap = elapsed;
        beep(250 + index * 70, 0.02, "square");
      }

      if (elapsed < duration) {
        requestAnimationFrame(tick);
        return;
      }

      const finalSymbol = weightedPick();
      reel.textContent = finalSymbol.name;
      beep(340 + index * 90, 0.06, "triangle");
      resolve(finalSymbol);
    };

    requestAnimationFrame(tick);
  });
}

function evaluate(results) {
  const [a, b, c] = results;
  const allSame = a.name === b.name && b.name === c.name;
  const twoSame = a.name === b.name || b.name === c.name || a.name === c.name;
  const gpuPair = [a, b, c].filter((symbol) => symbol.name === "GPU").length >= 2;

  if (allSame) {
    const base = results[0].payout;
    return Math.round(base * state.heat);
  }

  if (gpuPair) {
    return Math.round(140 * state.heat);
  }

  if (twoSame) {
    return Math.round(90 * state.heat);
  }

  return 0;
}

function celebrateWin(results, payout) {
  const names = results.map((symbol) => symbol.name).join(" | ");
  const allSame = results.every((symbol) => symbol.name === results[0].name);

  ui.machineCore.classList.remove("flash-loss");
  void ui.machineCore.offsetWidth;
  ui.machineCore.classList.add("flash-win");

  if (allSame) {
    setMarquee(`Jackpot: ${names}. The model is now legally a thought leader.`);
    appendFeed(`Jackpot paid ${formatNumber(payout)} tokens for ${names}. Slide deck energy is peaking.`);
    beep(620, 0.18, "sawtooth");
  } else {
    setMarquee(`Partial alignment detected. Finance calls it a ${formatNumber(payout)} token success.`);
    appendFeed(`Won ${formatNumber(payout)} tokens with ${names}. A consultant somewhere nodded solemnly.`);
  }
}

function celebrateLoss(results) {
  const names = results.map((symbol) => symbol.name).join(" | ");
  ui.machineCore.classList.remove("flash-win");
  void ui.machineCore.offsetWidth;
  ui.machineCore.classList.add("flash-loss");
  setMarquee(`Result: ${names}. Great news for humility, terrible news for your token budget.`);
  appendFeed(`Loss on ${names}. Please describe this as a learning phase.`);
  beep(160, 0.08, "sine");
}

function buyUpgrade() {
  const cost = upgradeCost();
  if (state.isSpinning || state.balance < cost) {
    return;
  }

  ensureAudio();
  state.balance -= cost;
  state.spinCost += 15;
  state.heat = Number((state.heat + 0.2).toFixed(1));
  setMarquee(`Context window expanded. Costs are up, confidence is also up, somehow.`);
  appendFeed(`Spent ${formatNumber(cost)} tokens on a context window upgrade. It mostly improved swagger.`);
  beep(520, 0.1, "triangle");
  render();
  saveState();
}

function upgradeCost() {
  return Math.round(state.spinCost * 3.5);
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    balance: 1200,
    spinCost: 40,
    streak: 0,
    heat: 1,
    jackpots: 0,
    bestPayout: 0,
    lastPayout: 0,
    isSpinning: false
  });
  ui.reels.forEach((reel) => {
    reel.textContent = "GPU";
  });
  setMarquee("Startup rebooted. Mission reset to monetizing autocomplete.");
  appendFeed("Company reboot complete. Old claims were moved to a legacy deck.");
  render();
}

function setMarquee(message) {
  ui.marquee.textContent = message;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function ensureAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

function beep(frequency, duration, type) {
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
