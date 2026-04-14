const SYMBOLS = ["GPU", "404", "LOL", "BUG", "COPE", "PROMPT", "TOKEN"];
const STORAGE_KEY = "token-gobbler-9000-state";

const payoutRules = [
  {
    match: (symbols) => symbols.every((symbol) => symbol === "GPU"),
    multiplier: 5,
    message: "Triple GPU. Congratulations, the machine rendered one whole benchmark."
  },
  {
    match: (symbols) => symbols.every((symbol) => symbol === "404"),
    multiplier: 4,
    message: "Triple 404. Even the prize server could not be found."
  },
  {
    match: (symbols) => symbols.join("|") === "LOL|BUG|COPE",
    multiplier: 3,
    message: "LOL + BUG + COPE. A complete AI product lifecycle."
  },
  {
    match: (symbols) => new Set(symbols).size === 2,
    multiplier: 2,
    message: "Two of a kind. The machine briefly respected your token burn."
  }
];

const defaultState = {
  balance: 120,
  bet: 10,
  mood: "Smug",
  history: []
};

const elements = {
  balance: document.querySelector("#token-balance"),
  betAmount: document.querySelector("#bet-amount"),
  mood: document.querySelector("#machine-mood"),
  result: document.querySelector("#result-message"),
  history: document.querySelector("#history-list"),
  betSlider: document.querySelector("#bet-slider"),
  spinButton: document.querySelector("#spin-button"),
  resetButton: document.querySelector("#reset-button"),
  reels: [...document.querySelectorAll(".reel")],
  historyTemplate: document.querySelector("#history-item-template")
};

let state = loadState();
let spinning = false;

elements.betSlider.value = String(state.bet);
render();

elements.betSlider.addEventListener("input", () => {
  state.bet = Number(elements.betSlider.value);
  saveState();
  render();
});

elements.spinButton.addEventListener("click", async () => {
  if (spinning || state.balance < state.bet) {
    if (state.balance < state.bet) {
      elements.result.textContent =
        "Insufficient tokens. The machine recommends raising another funding round.";
      state.mood = "Predatory";
      render();
    }
    return;
  }

  spinning = true;
  state.balance -= state.bet;
  state.mood = "Calculating";
  render();

  const results = await spinReels();
  const outcome = getOutcome(results, state.bet);

  state.balance += outcome.winnings;
  state.mood = pickMood(outcome.net);
  state.history.unshift(buildHistoryEntry(results, outcome));
  state.history = state.history.slice(0, 6);

  elements.result.textContent = outcome.message;
  flashReels(outcome.net >= 0 ? "flash-win" : "flash-loss");
  celebrate(outcome.net);
  saveState();
  render();
  spinning = false;
});

elements.resetButton.addEventListener("click", () => {
  state = { ...defaultState, history: [] };
  elements.betSlider.value = String(state.bet);
  elements.result.textContent =
    "Fresh wallet loaded. Time to convert more tokens into comedy.";
  saveState();
  render();
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState, history: [] };
    const parsed = JSON.parse(raw);
    return {
      balance: parsed.balance ?? defaultState.balance,
      bet: parsed.bet ?? defaultState.bet,
      mood: parsed.mood ?? defaultState.mood,
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return { ...defaultState, history: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  elements.balance.textContent = String(state.balance);
  elements.betAmount.textContent = String(state.bet);
  elements.mood.textContent = state.mood;
  elements.spinButton.disabled = spinning || state.balance < state.bet;
  renderHistory();
}

function renderHistory() {
  elements.history.textContent = "";

  if (state.history.length === 0) {
    const item = document.createElement("li");
    item.className = "history-item";
    item.textContent = "No spins yet. Your restraint is suspicious.";
    elements.history.append(item);
    return;
  }

  state.history.forEach((entry) => {
    const item = elements.historyTemplate.content.firstElementChild.cloneNode(true);
    const strong = document.createElement("strong");
    strong.textContent = entry.symbols;
    const summary = document.createElement("span");
    summary.textContent = entry.summary;
    item.append(strong, summary);
    elements.history.append(item);
  });
}

async function spinReels() {
  const results = [];

  for (const [index, reel] of elements.reels.entries()) {
    reel.classList.add("spinning");
    const result = await spinSingleReel(reel, 450 + index * 180);
    results.push(result);
    reel.classList.remove("spinning");
  }

  return results;
}

function spinSingleReel(reel, duration) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      reel.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      if (performance.now() - startedAt >= duration) {
        clearInterval(interval);
        const finalSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reel.textContent = finalSymbol;
        resolve(finalSymbol);
      }
    }, 70);
  });
}

function getOutcome(symbols, bet) {
  const rule = payoutRules.find((candidate) => candidate.match(symbols));
  const winnings = rule ? bet * rule.multiplier : 0;
  const net = winnings - bet;

  if (rule) {
    return {
      winnings,
      net,
      message: `${rule.message} You ${net >= 0 ? "won" : "spent"} ${Math.abs(net)} net tokens.`
    };
  }

  return {
    winnings,
    net,
    message: `No payout for ${symbols.join(" / ")}. The machine thanks you for your compute donation.`
  };
}

function buildHistoryEntry(symbols, outcome) {
  const direction = outcome.net >= 0 ? `+${outcome.net}` : `${outcome.net}`;
  return {
    symbols: symbols.join(" - "),
    summary: `${direction} tokens`
  };
}

function pickMood(net) {
  if (state.balance <= 0) return "Vulture";
  if (net >= state.bet * 2) return "Mockingly generous";
  if (net >= 0) return "Amused";
  if (state.balance < state.bet * 2) return "Bloodthirsty";
  return "Smug";
}

function flashReels(className) {
  elements.reels.forEach((reel) => {
    reel.classList.remove("flash-win", "flash-loss");
    reel.classList.add(className);
    window.setTimeout(() => {
      reel.classList.remove(className);
    }, 900);
  });
}

function celebrate(net) {
  if (navigator.vibrate) {
    navigator.vibrate(net >= 0 ? [80, 40, 80] : [120]);
  }
}
