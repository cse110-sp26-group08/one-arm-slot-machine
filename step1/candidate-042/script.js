const REEL_SYMBOLS = ["404", "GPU", "BOT", "LAG", "LOL", "CACHE"];
const SPIN_COST = 15;
const STARTING_TOKENS = 120;
const STORAGE_KEY = "token-grinder-3000";

const moodMap = {
  low: "Predatory",
  mid: "Smug",
  high: "Overfitted",
};

const quips = {
  jackpot: [
    "Triple 404. Incredible. Catastrophic failure has finally become passive income.",
    "The machine salutes your chaos. Jackpot tokens have been redeployed to your wallet.",
  ],
  win: [
    "The model accidentally helped. Finance is calling this a miracle.",
    "Solid hit. Somewhere, an overpriced API just felt threatened.",
  ],
  pair: [
    "Two matched. The machine tossed you a pity rebate and a little disrespect.",
    "Partial alignment achieved. Please enjoy this modest token refund.",
  ],
  lose: [
    "No match. Your tokens have been converted into executive optimism.",
    "The machine thanks you for funding the next breakthrough in autocomplete nonsense.",
    "Miss. Somewhere an AI demo just added another sparkle transition instead of accuracy.",
  ],
  broke: [
    "Wallet empty. Even the machine thinks your runway deck needs work.",
    "You are out of tokens. Time to pivot to 'community edition' confidence.",
  ],
};

const state = loadState();

const balanceEl = document.getElementById("token-balance");
const moodEl = document.getElementById("machine-mood");
const bestWinEl = document.getElementById("best-win");
const streakEl = document.getElementById("spin-streak");
const jackpotsEl = document.getElementById("jackpots");
const statusEl = document.getElementById("status-message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const reels = [...document.querySelectorAll(".reel")];
const machine = document.querySelector(".machine");

render();

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      tokens: saved?.tokens ?? STARTING_TOKENS,
      bestWin: saved?.bestWin ?? 0,
      streak: saved?.streak ?? 0,
      jackpots: saved?.jackpots ?? 0,
      spinning: false,
    };
  } catch {
    return {
      tokens: STARTING_TOKENS,
      bestWin: 0,
      streak: 0,
      jackpots: 0,
      spinning: false,
    };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tokens: state.tokens,
      bestWin: state.bestWin,
      streak: state.streak,
      jackpots: state.jackpots,
    }),
  );
}

function render() {
  balanceEl.textContent = state.tokens;
  bestWinEl.textContent = state.bestWin;
  streakEl.textContent = state.streak;
  jackpotsEl.textContent = state.jackpots;
  moodEl.textContent = getMood(state.tokens);
  spinButton.disabled = state.spinning || state.tokens < SPIN_COST;
}

function getMood(tokens) {
  if (tokens < 30) return moodMap.low;
  if (tokens > 150) return moodMap.high;
  return moodMap.mid;
}

function spin() {
  if (state.spinning || state.tokens < SPIN_COST) {
    setStatus(randomItem(quips.broke));
    return;
  }

  state.spinning = true;
  state.tokens -= SPIN_COST;
  state.streak += 1;
  render();
  animateMachine("remove");
  setStatus("Spinning... the model is inventing confidence in real time.");

  reels.forEach((reel, index) => {
    reel.classList.add("spinning");
    spinReel(reel, 450 + index * 180);
  });

  window.setTimeout(() => {
    const result = reels.map((reel) => {
      const symbol = randomItem(REEL_SYMBOLS);
      reel.textContent = symbol;
      reel.classList.remove("spinning");
      return symbol;
    });

    const payout = evaluateSpin(result);
    state.tokens += payout.amount;
    state.bestWin = Math.max(state.bestWin, payout.amount);
    if (payout.jackpot) state.jackpots += 1;
    state.spinning = false;
    saveState();
    render();
    animateMachine(payout.amount > 0 ? "win" : "lose");
    setStatus(payout.message);
  }, 1200);
}

function spinReel(reel, duration) {
  const interval = window.setInterval(() => {
    reel.textContent = randomItem(REEL_SYMBOLS);
  }, 85);

  window.setTimeout(() => {
    window.clearInterval(interval);
  }, duration);
}

function evaluateSpin(result) {
  const counts = result.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});
  const values = Object.values(counts).sort((a, b) => b - a);
  const triple = values[0] === 3;
  const pair = values[0] === 2;
  const is404Jackpot = result.every((symbol) => symbol === "404");

  if (is404Jackpot) {
    return { amount: 150, jackpot: true, message: randomItem(quips.jackpot) };
  }
  if (triple) {
    return { amount: 70, jackpot: false, message: randomItem(quips.win) };
  }
  if (pair) {
    return { amount: 25, jackpot: false, message: randomItem(quips.pair) };
  }
  return { amount: 0, jackpot: false, message: randomItem(quips.lose) };
}

function resetGame() {
  state.tokens = STARTING_TOKENS;
  state.bestWin = 0;
  state.streak = 0;
  state.jackpots = 0;
  state.spinning = false;
  reels.forEach((reel, index) => {
    reel.textContent = REEL_SYMBOLS[index];
    reel.classList.remove("spinning");
  });
  saveState();
  render();
  animateMachine("remove");
  setStatus("Wallet reset. Fresh tokens, same bad decisions.");
}

function setStatus(message) {
  statusEl.textContent = message;
}

function animateMachine(mode) {
  machine.classList.remove("flash-win", "flash-lose");
  if (mode === "win") machine.classList.add("flash-win");
  if (mode === "lose") machine.classList.add("flash-lose");
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
