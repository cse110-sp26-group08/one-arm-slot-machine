const symbols = ["🤖", "🪙", "🔥", "🧠", "💸", "📝", "🛰️"];
const wastes = {
  "🤖": "You bought a chatbot that summarizes the emails you wrote yourself.",
  "🪙": "You reinvested in a token called PromptCoin. The whitepaper is just vibes.",
  "🔥": "You funded a GPU bonfire so the demo could feel more premium.",
  "🧠": "You licensed synthetic thought leadership for a keynote nobody requested.",
  "💸": "You paid enterprise pricing for autocomplete and called it transformation.",
  "📝": "You generated 4,000 words of blog sludge about synergy.",
  "🛰️": "You launched an AI satellite to beam buzzwords directly into boardrooms."
};

const tokenEl = document.querySelector("#tokenCount");
const wasteEl = document.querySelector("#wasteLabel");
const messageEl = document.querySelector("#message");
const spinButton = document.querySelector("#spinButton");
const resetButton = document.querySelector("#resetButton");
const reels = [
  document.querySelector("#reel1"),
  document.querySelector("#reel2"),
  document.querySelector("#reel3")
];

const SPIN_COST = 15;
const STARTING_TOKENS = 120;
const STORAGE_KEY = "token-burner-3000-state";
let tokens = STARTING_TOKENS;
let spinning = false;

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens }));
}

function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.tokens === "number" && parsed.tokens >= 0) {
      tokens = parsed.tokens;
    }
  } catch {
    tokens = STARTING_TOKENS;
  }
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateStatus() {
  tokenEl.textContent = String(tokens);
  spinButton.disabled = spinning || tokens < SPIN_COST;

  if (!spinning && tokens < SPIN_COST) {
    messageEl.textContent = "You are out of prompt tokens. The machine recommends laying off reality and trying again.";
  }

  saveState();
}

function setMessage(text) {
  messageEl.textContent = text;
}

function clearWinState() {
  reels.forEach((reel) => reel.classList.remove("win"));
}

function evaluateSpin(results) {
  const counts = results.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topSymbol, topCount] = entries[0];
  wasteEl.textContent = wastes[topSymbol];

  if (topCount === 3) {
    tokens += 95;
    reels.forEach((reel) => reel.classList.add("win"));
    setMessage(`Jackpot. Three ${topSymbol} symbols! You won 95 tokens and immediately wasted them anyway. ${wastes[topSymbol]}`);
    return;
  }

  if (topCount === 2) {
    tokens += 30;
    results.forEach((symbol, index) => {
      if (symbol === topSymbol) {
        reels[index].classList.add("win");
      }
    });
    setMessage(`Two ${topSymbol} symbols. You clawed back 30 tokens before a startup spent them on "AI-native alignment consulting."`);
    return;
  }

  setMessage(`No match. The house keeps your tokens and ships a beta product named Neural Hype Engine. ${wastes[topSymbol]}`);
}

function animateReel(reel, delay) {
  return new Promise((resolve) => {
    reel.classList.add("spinning");

    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      const finalSymbol = randomSymbol();
      reel.textContent = finalSymbol;
      reel.classList.remove("spinning");
      resolve(finalSymbol);
    }, delay);
  });
}

async function spin() {
  if (spinning || tokens < SPIN_COST) {
    updateStatus();
    return;
  }

  spinning = true;
  clearWinState();
  tokens -= SPIN_COST;
  wasteEl.textContent = "Calculating irresponsible token allocation...";
  setMessage("Spinning up a fresh batch of synthetic ambition...");
  updateStatus();

  const results = [];
  for (let index = 0; index < reels.length; index += 1) {
    const symbol = await animateReel(reels[index], 700 + (index * 250));
    results.push(symbol);
  }

  evaluateSpin(results);
  spinning = false;
  updateStatus();
}

function resetGame() {
  tokens = STARTING_TOKENS;
  spinning = false;
  clearWinState();
  reels.forEach((reel) => {
    reel.classList.remove("spinning");
    reel.textContent = randomSymbol();
  });
  wasteEl.textContent = "Waiting for bad decisions";
  setMessage("Fresh funding secured. The machine is once again ready to convert capital into AI jokes.");
  updateStatus();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

loadState();
reels.forEach((reel) => {
  reel.textContent = randomSymbol();
});
updateStatus();
