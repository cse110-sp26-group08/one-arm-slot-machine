const STARTING_TOKENS = 25;
const SPIN_COST = 3;
const STORAGE_KEY = "token-sink-3000-state";
const SYMBOLS = ["WIN", "GPT", "LOL", "404", "BOT", "LAG", "OOPS"];

const tokenCount = document.querySelector("#token-count");
const machineMood = document.querySelector("#machine-mood");
const resultMessage = document.querySelector("#result-message");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const reels = [
  document.querySelector("#reel-1"),
  document.querySelector("#reel-2"),
  document.querySelector("#reel-3"),
];

const moods = [
  "Smug",
  "Tokenized",
  "Overfit",
  "Mildly sentient",
  "Pitch deck ready",
];

function loadState() {
  const fallback = { tokens: STARTING_TOKENS };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved.tokens !== "number") {
      return fallback;
    }

    return { tokens: Math.max(0, saved.tokens) };
  } catch {
    return fallback;
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function setMood(tokens) {
  if (tokens <= 0) {
    machineMood.textContent = "Predatory";
    return;
  }

  if (tokens < 10) {
    machineMood.textContent = "Hungry";
    return;
  }

  machineMood.textContent = moods[Math.floor(Math.random() * moods.length)];
}

function render() {
  tokenCount.textContent = String(state.tokens);
  spinButton.disabled = state.tokens < SPIN_COST;
  setMood(state.tokens);
}

function getPayout(symbolSet) {
  const counts = symbolSet.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const uniqueSymbols = Object.keys(counts);
  const first = uniqueSymbols[0];

  if (uniqueSymbols.length === 1) {
    if (first === "WIN") return 15;
    if (first === "GPT") return 12;
    if (first === "LOL") return 10;
    return 8;
  }

  if (uniqueSymbols.length === 2) {
    return 4;
  }

  return 0;
}

function getMessage(symbolSet, payout) {
  const joined = symbolSet.join(" / ");

  if (payout >= 12) {
    return `${joined}. Massive win. The AI has granted you tokens it will probably ask back during the next funding round.`;
  }

  if (payout > 0) {
    return `${joined}. Small payout. Congratulations, the machine generated a return almost as convincing as an AI startup revenue chart.`;
  }

  if (state.tokens <= 0) {
    return `${joined}. Bankrupt. The model apologizes and suggests buying more tokens to unlock premium disappointment.`;
  }

  return `${joined}. No payout. The reels have identified you as “high intent” and redirected your money into model training.`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function spin() {
  if (state.tokens < SPIN_COST) {
    resultMessage.textContent =
      "You’re out of tokens. Very exciting news for the machine, less so for you.";
    render();
    return;
  }

  state.tokens -= SPIN_COST;
  render();

  spinButton.disabled = true;
  resetButton.disabled = true;

  const finalSymbols = reels.map(() => randomSymbol());

  for (const [index, reel] of reels.entries()) {
    reel.classList.add("is-spinning");

    for (let tick = 0; tick < 10 + index * 4; tick += 1) {
      reel.textContent = randomSymbol();
      await sleep(80);
    }

    reel.classList.remove("is-spinning");
    reel.textContent = finalSymbols[index];
  }

  const payout = getPayout(finalSymbols);
  state.tokens += payout;
  saveState();

  resultMessage.textContent = getMessage(finalSymbols, payout);
  render();
  resetButton.disabled = false;
}

function resetGame() {
  state = { tokens: STARTING_TOKENS };
  saveState();
  resultMessage.textContent =
    "Wallet reset. Fresh tokens, fresh hope, same deeply unserious machine.";
  reels[0].textContent = "404";
  reels[1].textContent = "BOT";
  reels[2].textContent = "LOL";
  render();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);
helpButton.addEventListener("click", () => helpDialog.showModal());

render();
