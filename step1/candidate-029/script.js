const symbols = ["🤖", "🪙", "🔥", "🧠", "📉", "🧪"];
const spinCost = 15;
const startingTokens = 120;

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenCount = document.getElementById("token-count");
const resultLine = document.getElementById("result-line");
const snarkLine = document.getElementById("snark-line");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

let tokens = startingTokens;
let spinning = false;

const quips = {
  jackpot: [
    "Triple coins. Venture capital is calling this product-market fit.",
    "You won big. The AI demo has never looked this convincing."
  ],
  bots: [
    "Three bots aligned. The benchmark was peer-reviewed by vibes.",
    "Robot sweep. Somewhere, an investor just said 'agentic' out loud."
  ],
  fire: [
    "All fire. The roadmap is now just the word 'disruption' repeated.",
    "Hot streak. Safety review postponed until after the keynote."
  ],
  pair: [
    "A pair pays out. Mediocre intelligence, excellent branding.",
    "Two matched. The deck now says 'near-human' with full confidence."
  ],
  loss: [
    "No payout. The model spent your tokens inventing confidence.",
    "Bust. The AI used your budget to generate a longer tagline."
  ],
  broke: [
    "Out of tokens. Even the machine suggests a smaller context window.",
    "Wallet empty. Time to pivot from AI to artisanal spreadsheets."
  ],
  reset: [
    "Fresh funding round secured. The token burn can resume.",
    "Treasury restored. Nothing says innovation like refilling pretend money."
  ]
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function setStatus(message, snark) {
  resultLine.textContent = message;
  snarkLine.textContent = snark;
}

function updateTokens() {
  tokenCount.textContent = String(tokens);
  spinButton.disabled = spinning || tokens < spinCost;
}

function scoreSpin(values) {
  const counts = values.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  if (values.every((value) => value === "🪙")) {
    return { payout: 90, message: "Jackpot!", snark: randomItem(quips.jackpot) };
  }

  if (values.every((value) => value === "🤖")) {
    return { payout: 60, message: "Bot Sweep!", snark: randomItem(quips.bots) };
  }

  if (values.every((value) => value === "🔥")) {
    return { payout: 45, message: "Heat Check!", snark: randomItem(quips.fire) };
  }

  if (Object.values(counts).some((count) => count === 2)) {
    return { payout: 20, message: "Pair Detected!", snark: randomItem(quips.pair) };
  }

  return { payout: 0, message: "Token Sink Activated", snark: randomItem(quips.loss) };
}

function stopReel(reel, delay) {
  return new Promise((resolve) => {
    const intervalId = window.setInterval(() => {
      reel.textContent = randomItem(symbols);
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      reel.classList.remove("spinning");
      const finalSymbol = randomItem(symbols);
      reel.textContent = finalSymbol;
      resolve(finalSymbol);
    }, delay);
  });
}

async function spin() {
  if (spinning || tokens < spinCost) {
    return;
  }

  spinning = true;
  tokens -= spinCost;
  updateTokens();
  setStatus("Spinning...", "The machine is monetizing your curiosity.");

  reels.forEach((reel) => reel.classList.add("spinning"));

  const results = [];
  for (let index = 0; index < reels.length; index += 1) {
    const symbol = await stopReel(reels[index], 650 + index * 280);
    results.push(symbol);
  }

  const outcome = scoreSpin(results);
  tokens += outcome.payout;
  spinning = false;
  updateTokens();
  setStatus(`${outcome.message} ${outcome.payout ? `+${outcome.payout} tokens.` : "0 tokens."}`, outcome.snark);

  if (tokens < spinCost) {
    setStatus("Insufficient Tokens", randomItem(quips.broke));
  }
}

function resetGame() {
  tokens = startingTokens;
  spinning = false;
  reels.forEach((reel, index) => {
    reel.classList.remove("spinning");
    reel.textContent = symbols[index];
  });
  updateTokens();
  setStatus("Wallet reset.", randomItem(quips.reset));
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateTokens();
