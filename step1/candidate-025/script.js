const symbols = ["404", "BOT", "GPU", "COPE", "LAG", "LOL"];
const spinCost = 3;
const startingTokens = 25;

const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const tokenCount = document.getElementById("token-count");
const jackpotCount = document.getElementById("jackpot-count");
const message = document.getElementById("message");
const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];

let tokens = startingTokens;
let jackpots = 0;
let isSpinning = false;

const statusMessages = {
  jackpot: [
    "Jackpot. The machine briefly called you a visionary before asking for more training data.",
    "Triple match. Somewhere an AI startup just rebranded this outcome as emergent intelligence.",
    "You won big. Please enjoy these tokens before a chatbot tries to invoice you for confidence."
  ],
  pair: [
    "Two symbols matched. Even the machine admits mediocre autocomplete can still pay rent.",
    "Pair landed. That's basically a seed round for a company with no revenue.",
    "Partial match. The slot machine says this counts as a prototype and wants applause."
  ],
  pity: [
    "A lonely 404 appeared, so the machine issued one pity token and a vague roadmap.",
    "You found a 404. That's worth one token and three paragraphs about disruption.",
    "Pity token awarded. Apparently failure is just iterative hallucination with branding."
  ],
  loss: [
    "No match. The machine says your token burn improved its benchmark narrative.",
    "Bust. Somewhere a bot is calling this outcome a learning opportunity.",
    "Nothing this round. The furnace consumed your tokens to generate actionable nonsense."
  ],
  broke: [
    "You're out of tokens. The AI suggests pivoting to exposure and vibes.",
    "Wallet empty. A synthetic consultant recommends manifesting better prompt energy.",
    "No tokens left. The machine has entered thought-leadership mode instead of paying out."
  ]
};

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function pickMessage(type) {
  const entries = statusMessages[type];
  return entries[Math.floor(Math.random() * entries.length)];
}

function updateStats() {
  tokenCount.textContent = String(tokens);
  jackpotCount.textContent = String(jackpots);
  spinButton.disabled = isSpinning || tokens < spinCost;
}

function evaluateSpin(result) {
  const counts = result.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const matches = Object.values(counts).sort((a, b) => b - a);

  if (matches[0] === 3) {
    jackpots += 1;
    tokens += 12;
    message.textContent = pickMessage("jackpot");
    reels.forEach((reel) => reel.classList.add("win-flash"));
    return;
  }

  if (matches[0] === 2) {
    tokens += 5;
    message.textContent = pickMessage("pair");
    reels.forEach((reel) => reel.classList.add("win-flash"));
    return;
  }

  if (result.includes("404")) {
    tokens += 1;
    message.textContent = pickMessage("pity");
    reels.forEach((reel) => reel.classList.remove("win-flash"));
    return;
  }

  message.textContent = pickMessage("loss");
  reels.forEach((reel) => reel.classList.remove("win-flash"));
}

function spin() {
  if (isSpinning || tokens < spinCost) {
    if (tokens < spinCost) {
      message.textContent = pickMessage("broke");
    }
    return;
  }

  isSpinning = true;
  tokens -= spinCost;
  updateStats();
  message.textContent = "Spinning the reels. Please wait while the machine consults twelve layers of synthetic certainty...";
  reels.forEach((reel) => {
    reel.classList.remove("win-flash");
    reel.classList.add("spinning");
  });

  reels.forEach((reel, index) => {
    const interval = setInterval(() => {
      reel.textContent = randomSymbol();
    }, 95);

    setTimeout(() => {
      clearInterval(interval);
      reel.classList.remove("spinning");
      reel.textContent = randomSymbol();

      if (index === reels.length - 1) {
        const result = reels.map((item) => item.textContent);
        evaluateSpin(result);
        isSpinning = false;
        updateStats();

        if (tokens < spinCost) {
          message.textContent += ` ${pickMessage("broke")}`;
        }
      }
    }, 700 + index * 250);
  });
}

function resetGame() {
  tokens = startingTokens;
  jackpots = 0;
  isSpinning = false;
  reels.forEach((reel, index) => {
    reel.classList.remove("spinning", "win-flash");
    reel.textContent = symbols[index];
  });
  message.textContent = "Wallet restored. The machine is ready to convert fresh optimism into statistical comedy.";
  updateStats();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateStats();