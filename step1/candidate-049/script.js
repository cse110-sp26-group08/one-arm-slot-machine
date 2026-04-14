const SYMBOLS = [
  { name: "API", weight: 6, triple: 230 },
  { name: "GPU", weight: 4, triple: 420 },
  { name: "SEED", weight: 5, triple: 320 },
  { name: "PROMPT", weight: 7, triple: 210 },
  { name: "TOKEN", weight: 7, triple: 190 },
  { name: "BUZZ", weight: 8, triple: 150 },
  { name: "404", weight: 4, triple: 0 }
];

const STORAGE_KEY = "candidate-049-inference-casino";

const state = {
  credits: 900,
  bet: 35,
  multiplier: 1,
  streak: 0,
  hype: 0,
  bank: 0,
  lastWin: 0,
  bestWin: 0,
  spinning: false
};

const ui = {
  credits: document.getElementById("creditsValue"),
  bet: document.getElementById("betValue"),
  multiplier: document.getElementById("multiplierValue"),
  hype: document.getElementById("hypeValue"),
  bank: document.getElementById("bankValue"),
  lastWin: document.getElementById("lastWinValue"),
  bestWin: document.getElementById("bestWinValue"),
  streak: document.getElementById("streakValue"),
  ticker: document.getElementById("tickerText"),
  feed: document.getElementById("feedList"),
  spinButton: document.getElementById("spinButton"),
  boostButton: document.getElementById("boostButton"),
  cashoutButton: document.getElementById("cashoutButton"),
  resetButton: document.getElementById("resetButton"),
  reels: ["A", "B", "C"].map((suffix) => document.getElementById(`reel${suffix}`)),
  reelShells: Array.from(document.querySelectorAll(".reel-shell")),
  machine: document.querySelector(".machine")
};

let audioContext;
let roastIntervalId;

restore();
render();
primeFeed();
startTickerRoasts();

ui.spinButton.addEventListener("click", spin);
ui.boostButton.addEventListener("click", buyCompute);
ui.cashoutButton.addEventListener("click", cashOutHype);
ui.resetButton.addEventListener("click", resetGame);

function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    Object.assign(state, JSON.parse(raw));
  } catch (error) {
    console.warn("Unable to restore saved run.", error);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  ui.credits.textContent = format(state.credits);
  ui.bet.textContent = format(state.bet);
  ui.multiplier.textContent = `${state.multiplier.toFixed(1)}x`;
  ui.hype.textContent = format(state.hype);
  ui.bank.textContent = format(state.bank);
  ui.lastWin.textContent = format(state.lastWin);
  ui.bestWin.textContent = format(state.bestWin);
  ui.streak.textContent = format(state.streak);

  const canSpin = !state.spinning && state.credits >= state.bet;
  ui.spinButton.disabled = !canSpin;
  ui.boostButton.disabled = state.spinning || state.credits < computeCost();
  ui.cashoutButton.disabled = state.spinning || state.hype === 0;
}

function primeFeed() {
  [
    "Board memo: we are not gambling, we are stress testing monetization.",
    "Reminder: the GPU budget is a mood, not a plan.",
    "Every token lost here becomes a conference talk somewhere."
  ].reverse().forEach(pushFeed);
}

function startTickerRoasts() {
  const lines = [
    "Analysts agree the machine is mostly confidence with decorative latency.",
    "Current moat: expensive demos and a very persuasive keynote voice.",
    "Please enjoy this premium experience of burning tokens into the atmosphere.",
    "The roadmap remains unchanged: more compute, fewer questions."
  ];

  let index = 0;
  roastIntervalId = window.setInterval(() => {
    if (state.spinning) {
      return;
    }
    setTicker(lines[index % lines.length]);
    index += 1;
  }, 4200);
}

function pushFeed(message) {
  const item = document.createElement("li");
  item.textContent = message;
  ui.feed.prepend(item);

  while (ui.feed.children.length > 7) {
    ui.feed.removeChild(ui.feed.lastChild);
  }
}

function setTicker(message) {
  ui.ticker.textContent = message;
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
  if (state.spinning || state.credits < state.bet) {
    return;
  }

  ensureAudio();
  state.spinning = true;
  state.credits -= state.bet;
  state.lastWin = 0;
  setTicker("Inference running. Please keep all limbs inside the hype cycle.");
  render();
  persist();

  ui.reelShells.forEach((shell) => shell.classList.add("spinning"));
  const result = await Promise.all(ui.reels.map((_, index) => animateReel(index)));
  ui.reelShells.forEach((shell) => shell.classList.remove("spinning"));

  const payout = score(result);
  state.lastWin = payout;
  state.bestWin = Math.max(state.bestWin, payout);
  state.credits += payout;
  state.spinning = false;

  if (payout > 0) {
    state.streak += 1;
    state.hype += Math.ceil(payout * 0.35);
    if (state.streak % 3 === 0) {
      state.multiplier = Number((state.multiplier + 0.2).toFixed(1));
      pushFeed(`Trust level climbed to ${state.multiplier.toFixed(1)}x. Confidence remains unregulated.`);
    }
    handleWin(result, payout);
  } else {
    state.streak = 0;
    state.multiplier = 1;
    handleLoss(result);
  }

  if (state.credits < state.bet && payout === 0) {
    setTicker("Wallet insufficient. Please dilute somebody.");
    pushFeed("No more spin budget. Time to call this a strategic pause.");
  }

  render();
  persist();
}

function animateReel(index) {
  return new Promise((resolve) => {
    const reel = ui.reels[index];
    const duration = 850 + index * 280;
    const start = performance.now();
    let lastUpdate = 0;

    const frame = (time) => {
      const elapsed = time - start;
      if (elapsed - lastUpdate > 70) {
        reel.textContent = weightedPick().name;
        lastUpdate = elapsed;
        chirp(240 + index * 80, 0.018, "square");
      }

      if (elapsed < duration) {
        requestAnimationFrame(frame);
        return;
      }

      const finalSymbol = weightedPick();
      reel.textContent = finalSymbol.name;
      chirp(380 + index * 110, 0.055, "triangle");
      resolve(finalSymbol);
    };

    requestAnimationFrame(frame);
  });
}

function score(result) {
  const names = result.map((symbol) => symbol.name);
  const [a, b, c] = names;
  const allSame = a === b && b === c;
  const twoSame = a === b || b === c || a === c;
  const gpuPair = names.filter((name) => name === "GPU").length >= 2;
  const apiPromptToken = ["API", "PROMPT", "TOKEN"].every((name) => names.includes(name));
  const buzzBuzz404 = names.filter((name) => name === "BUZZ").length === 2 && names.includes("404");

  if (allSame) {
    const symbol = result[0];
    return Math.round(symbol.triple * state.multiplier);
  }

  if (apiPromptToken) {
    return Math.round(160 * state.multiplier);
  }

  if (gpuPair) {
    return Math.round(120 * state.multiplier);
  }

  if (buzzBuzz404) {
    return Math.round(110 * state.multiplier);
  }

  if (twoSame) {
    return Math.round(75 * state.multiplier);
  }

  return 0;
}

function handleWin(result, payout) {
  const names = result.map((symbol) => symbol.name).join(" / ");
  ui.machine.classList.remove("loss-glow");
  void ui.machine.offsetWidth;
  ui.machine.classList.add("win-glow");

  if (result.every((symbol) => symbol.name === result[0].name)) {
    setTicker(`Jackpot on ${names}. This now counts as a product strategy.`);
    pushFeed(`Won ${format(payout)} tokens on ${names}. Investor sentiment temporarily positive.`);
    chirp(620, 0.18, "sawtooth");
  } else {
    setTicker(`Partial success on ${names}. Accounting has labeled this traction.`);
    pushFeed(`Pulled ${names} for ${format(payout)} tokens. Please clap for the synergy.`);
  }
}

function handleLoss(result) {
  const names = result.map((symbol) => symbol.name).join(" / ");
  ui.machine.classList.remove("win-glow");
  void ui.machine.offsetWidth;
  ui.machine.classList.add("loss-glow");
  setTicker(`Miss on ${names}. Good news: the postmortem will sound very smart.`);
  pushFeed(`No payout on ${names}. Add one more slide about responsible scaling.`);
  chirp(170, 0.08, "sine");
}

function buyCompute() {
  const cost = computeCost();
  if (state.spinning || state.credits < cost) {
    return;
  }

  ensureAudio();
  state.credits -= cost;
  state.bet += 10;
  state.multiplier = Number((state.multiplier + 0.15).toFixed(1));
  state.hype += 25;
  setTicker("Compute package acquired. Burn rate up, ambition somehow higher.");
  pushFeed(`Spent ${format(cost)} tokens on premium compute. The demo will now fail faster and brighter.`);
  chirp(510, 0.09, "triangle");
  render();
  persist();
}

function cashOutHype() {
  if (state.spinning || state.hype === 0) {
    return;
  }

  ensureAudio();
  const converted = Math.max(40, Math.round(state.hype * 0.6));
  state.credits += converted;
  state.bank += converted;
  state.hype = 0;
  setTicker(`Cashed out ${format(converted)} hype tokens. Narrative successfully laundered.`);
  pushFeed(`Hype converted into ${format(converted)} fresh tokens. Finance calls this circular excellence.`);
  chirp(470, 0.1, "triangle");
  render();
  persist();
}

function computeCost() {
  return Math.round(state.bet * 3.2);
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    credits: 900,
    bet: 35,
    multiplier: 1,
    streak: 0,
    hype: 0,
    bank: 0,
    lastWin: 0,
    bestWin: 0,
    spinning: false
  });
  ["API", "GPU", "SEED"].forEach((value, index) => {
    ui.reels[index].textContent = value;
  });
  setTicker("Factory reset complete. All previous claims have been rebranded as experiments.");
  pushFeed("Reset complete. The machine is once again innocent and overfunded.");
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

function chirp(frequency, duration, type) {
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

window.addEventListener("beforeunload", () => {
  if (roastIntervalId) {
    clearInterval(roastIntervalId);
  }
});
