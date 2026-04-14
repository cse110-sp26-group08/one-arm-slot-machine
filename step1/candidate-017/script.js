const STORAGE_KEY = "token-burn-casino-save";

const symbols = [
  "404",
  "GPU",
  "VC",
  "PIVOT",
  "DECK",
  "PROMPT",
  "TOKEN",
  "COPE",
  "AGENT",
  "SLIDE",
];

const moods = [
  "Investor-ready",
  "Aggressively synergetic",
  "Prompt-maxxing",
  "Financially inferential",
  "Compute-positive",
];

const snark = {
  jackpot: [
    "Triple match. The machine calls this product-market fit and bills you extra for celebration.",
    "The reels aligned. Somewhere, an AI founder just said this validates the roadmap.",
    "Jackpot. Your wallet grows, your dignity remains in beta.",
  ],
  pair: [
    "Two reels matched. The machine describes this as a strategic token rebound.",
    "A pair. Barely a win, but the dashboard still says exceptional momentum.",
    "Partial success. Expect a keynote about this modest recovery.",
  ],
  special: [
    "VC, PIVOT, DECK. Congratulations, you accidentally summoned a seed round.",
    "The sacred trio appeared. A slide deck forms in the distance.",
  ],
  loss: [
    "No payout. The machine insists the real prize was the inference costs.",
    "The reels whiffed. Excellent news if you are monetizing disappointment.",
    "Loss recorded. The casino thanks you for donating to the future of slop.",
    "Nothing hit. Please try a more premium prompt and a less premium mortgage.",
  ],
  broke: [
    "You are out of tokens. The machine recommends raising a tiny ethics-free round.",
    "Bankrupt. Fortunately, the dashboard still glows with confidence.",
  ],
};

const state = loadState();

const balanceEl = document.querySelector("#token-balance");
const betEl = document.querySelector("#bet-amount");
const moodEl = document.querySelector("#machine-mood");
const resultEl = document.querySelector("#result-message");
const historyEl = document.querySelector("#history-list");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const betSlider = document.querySelector("#bet-slider");
const historyTemplate = document.querySelector("#history-item-template");
const reels = [...document.querySelectorAll(".reel")];
const machinePanel = document.querySelector(".machine");

betSlider.value = String(state.bet);

render();

betSlider.addEventListener("input", () => {
  state.bet = Number(betSlider.value);
  saveState();
  render();
});

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

async function spin() {
  if (state.spinning) {
    return;
  }

  if (state.balance < state.bet) {
    state.message = pick(snark.broke);
    flashMachine(false);
    vibrate([80, 40, 80]);
    render();
    return;
  }

  state.spinning = true;
  state.balance -= state.bet;
  state.mood = pick(moods);
  render();

  const results = [];

  for (const [index, reel] of reels.entries()) {
    const chosen = await animateReel(reel, 600 + index * 220);
    results.push(chosen);
  }

  const payout = calculatePayout(results, state.bet);
  state.balance += payout.amount;
  state.lastResult = results;
  state.message = payout.message;
  state.mood = payout.mood;
  state.history.unshift({
    result: results.join(" / "),
    summary: payout.history,
  });
  state.history = state.history.slice(0, 6);
  state.spinning = false;

  flashMachine(payout.amount > state.bet);
  vibrate(payout.amount > 0 ? [60, 40, 120] : [120]);
  saveState();
  render();
}

function resetGame() {
  state.balance = 180;
  state.bet = 15;
  state.lastResult = ["PROMPT", "TOKEN", "SPIN"];
  state.message =
    "Fresh funding secured. The machine is ready to convert new capital into old jokes.";
  state.mood = "Recapitalized";
  state.history = [];
  state.spinning = false;
  betSlider.value = String(state.bet);
  saveState();
  render();
}

function calculatePayout(results, bet) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts);
  const isTriple = values.includes(3);
  const isPair = values.includes(2);
  const isSpecial = results.join("|") === "VC|PIVOT|DECK";

  if (isTriple) {
    const winnings = bet * 5;
    return {
      amount: winnings,
      message: pick(snark.jackpot),
      mood: "Intolerably smug",
      history: `Triple match paid ${winnings} tokens.`,
    };
  }

  if (isSpecial) {
    const winnings = bet * 4;
    return {
      amount: winnings,
      message: pick(snark.special),
      mood: "Pitch-deck certified",
      history: `Seed-round combo paid ${winnings} tokens.`,
    };
  }

  if (isPair) {
    const winnings = bet * 2;
    return {
      amount: winnings,
      message: pick(snark.pair),
      mood: "Mildly bullish",
      history: `Pair paid ${winnings} tokens.`,
    };
  }

  return {
    amount: 0,
    message: pick(snark.loss),
    mood: "Profiting from your optimism",
    history: "No payout. Tokens safely absorbed by the machine.",
  };
}

function render() {
  balanceEl.textContent = String(state.balance);
  betEl.textContent = String(state.bet);
  moodEl.textContent = state.mood;
  resultEl.textContent = state.message;
  spinButton.disabled = state.spinning;
  spinButton.textContent = state.spinning ? "Spinning..." : "Pull The Lever";

  const displaySymbols = state.spinning ? reels.map((reel) => reel.textContent) : state.lastResult;
  reels.forEach((reel, index) => {
    reel.textContent = displaySymbols[index];
  });

  historyEl.innerHTML = "";

  if (state.history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-item";
    emptyItem.textContent = "No spins yet. The machine remains rested and unbearable.";
    historyEl.append(emptyItem);
    return;
  }

  state.history.forEach((entry) => {
    const item = historyTemplate.content.firstElementChild.cloneNode(true);
    item.innerHTML = `<strong>${entry.result}</strong><span>${entry.summary}</span>`;
    historyEl.append(item);
  });
}

function loadState() {
  const fallback = {
    balance: 180,
    bet: 15,
    mood: "Investor-ready",
    message:
      "The machine is idle and preparing a very confident answer to a question nobody asked.",
    history: [],
    lastResult: ["PROMPT", "TOKEN", "SPIN"],
    spinning: false,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...fallback, ...saved, spinning: false };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      balance: state.balance,
      bet: state.bet,
      mood: state.mood,
      message: state.message,
      history: state.history,
      lastResult: state.lastResult,
    })
  );
}

async function animateReel(reel, duration) {
  const start = performance.now();
  let current = pick(symbols);

  while (performance.now() - start < duration) {
    current = pick(symbols);
    reel.textContent = current;
    reel.animate(
      [
        { transform: "translateY(-8px)", opacity: 0.55 },
        { transform: "translateY(0)", opacity: 1 },
      ],
      { duration: 120, easing: "ease-out" }
    );
    await delay(85);
  }

  reel.textContent = current;
  return current;
}

function flashMachine(isWin) {
  machinePanel.classList.remove("flash-win", "flash-lose");
  void machinePanel.offsetWidth;
  machinePanel.classList.add(isWin ? "flash-win" : "flash-lose");
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function vibrate(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
