const symbols = ["WIN", "404", "LAG", "GPT", "BEEP", "LOOP", "NULL"];
const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];
const tokenCount = document.getElementById("token-count");
const spinCost = document.getElementById("spin-cost");
const message = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

const STARTING_TOKENS = 120;
const SPIN_COST = 15;

let tokens = STARTING_TOKENS;
let spinning = false;

const snark = {
  jackpot: [
    "TRIPLE WIN. The machine declares you a visionary and refunds your entire personality budget.",
    "Three WINs. Somewhere, a startup just raised funding on this exact business model.",
  ],
  triple: [
    "Three of a kind. Statistically impressive, spiritually concerning.",
    "Triple match. The algorithm smiles upon its little token donor.",
  ],
  pair: [
    "Two match. Not bad. The machine has decided to breadcrumb you.",
    "A pair. Barely enough to keep the addiction dashboard green.",
  ],
  miss: [
    "No match. Your tokens have been reinvested into executive optimism.",
    "Miss. The AI says this was a learning experience, which means you paid for it.",
    "Nothing. Please enjoy this complimentary buzzword: synergy.",
  ],
  broke: [
    "Wallet empty. Even the machine thinks you should go outside.",
    "Out of tokens. Please locate more venture capital or touch grass.",
  ],
  reset: [
    "Wallet reset. Fresh tokens, fresh delusion.",
    "Back to 120 tokens. Responsible gaming is not part of the lore.",
  ],
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateUI() {
  tokenCount.textContent = String(tokens);
  spinCost.textContent = String(SPIN_COST);
  spinButton.textContent = `Burn ${SPIN_COST} Tokens`;
  spinButton.disabled = spinning || tokens < SPIN_COST;
}

function setMessage(text) {
  message.textContent = text;
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts).sort((a, b) => b - a);

  if (results.every((symbol) => symbol === "WIN")) {
    tokens += 200;
    return randomItem(snark.jackpot);
  }

  if (values[0] === 3) {
    tokens += 90;
    return randomItem(snark.triple);
  }

  if (values[0] === 2) {
    tokens += 35;
    return randomItem(snark.pair);
  }

  return randomItem(snark.miss);
}

function spinReels() {
  if (spinning || tokens < SPIN_COST) {
    if (tokens < SPIN_COST) {
      setMessage(randomItem(snark.broke));
    }
    return;
  }

  spinning = true;
  tokens -= SPIN_COST;
  updateUI();
  setMessage("Spinning... generating premium synthetic luck.");

  reels.forEach((reel) => {
    reel.classList.add("spinning");
  });

  const finalResults = [];

  reels.forEach((reel, index) => {
    const stopDelay = 500 + index * 400;
    const intervalId = window.setInterval(() => {
      reel.textContent = randomItem(symbols);
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      const result = randomItem(symbols);
      finalResults[index] = result;
      reel.textContent = result;
      reel.classList.remove("spinning");

      if (index === reels.length - 1) {
        setMessage(evaluateSpin(finalResults));
        spinning = false;
        updateUI();

        if (tokens < SPIN_COST) {
          setMessage(`${message.textContent} ${randomItem(snark.broke)}`);
        }
      }
    }, stopDelay);
  });
}

function resetGame() {
  tokens = STARTING_TOKENS;
  spinning = false;
  reels[0].textContent = "404";
  reels[1].textContent = "LOL";
  reels[2].textContent = "BZZT";
  reels.forEach((reel) => reel.classList.remove("spinning"));
  setMessage(randomItem(snark.reset));
  updateUI();
}

spinButton.addEventListener("click", spinReels);
resetButton.addEventListener("click", resetGame);

updateUI();
