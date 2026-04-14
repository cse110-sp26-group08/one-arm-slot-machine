const symbols = ["🤖", "🪙", "🔥", "🧠", "📉", "🧾"];
const triplePayouts = {
  "🪙": 90,
  "🤖": 65,
  "🔥": 50,
  "🧠": 45,
  "📉": 30,
  "🧾": 25
};

const spinCost = 15;
const startingTokens = 120;

let tokenBalance = startingTokens;
let spinning = false;

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenBalanceElement = document.getElementById("token-balance");
const messageElement = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const machineElement = document.querySelector(".machine");

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function setMessage(text) {
  messageElement.textContent = text;
}

function updateBalance() {
  tokenBalanceElement.textContent = String(tokenBalance);
  spinButton.disabled = spinning || tokenBalance < spinCost;

  if (tokenBalance < spinCost && !spinning) {
    setMessage("You are out of tokens. The AI suggests buying a premium subscription to hope harder.");
  }
}

function scoreSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] ?? 0) + 1;
    return map;
  }, {});

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [topSymbol, topCount] = entries[0];

  if (topCount === 3) {
    return triplePayouts[topSymbol] ?? 40;
  }

  if (topCount === 2) {
    return 20;
  }

  return 0;
}

function getReaction(results, winnings) {
  const joined = results.join(" ");

  if (winnings >= 60) {
    return `${joined} Jackpot. The machine claims this outcome proves artificial confidence. You win ${winnings} tokens.`;
  }

  if (winnings > 0) {
    return `${joined} Mild success. The algorithm is thrilled to return a fraction of what it took. You win ${winnings} tokens.`;
  }

  return `${joined} No payout. Your tokens have been converted into a visionary slide deck about "disruption."`;
}

function pulseMachine(className) {
  machineElement.classList.remove("flash-win", "flash-loss");
  machineElement.classList.add(className);
  window.setTimeout(() => {
    machineElement.classList.remove(className);
  }, 550);
}

async function spin() {
  if (spinning || tokenBalance < spinCost) {
    return;
  }

  spinning = true;
  tokenBalance -= spinCost;
  updateBalance();
  setMessage("Processing prompt. Please wait while the machine invents confidence.");

  reelElements.forEach((reel) => reel.classList.add("spinning"));

  const results = [];

  for (let index = 0; index < reelElements.length; index += 1) {
    const reel = reelElements[index];

    for (let tick = 0; tick < 10 + index * 4; tick += 1) {
      reel.textContent = randomSymbol();
      await wait(70);
    }

    const finalSymbol = randomSymbol();
    reel.textContent = finalSymbol;
    results.push(finalSymbol);
    reel.classList.remove("spinning");
    await wait(120);
  }

  const winnings = scoreSpin(results);
  tokenBalance += winnings;
  setMessage(getReaction(results, winnings));
  pulseMachine(winnings > 0 ? "flash-win" : "flash-loss");
  spinning = false;
  updateBalance();
}

function resetGame() {
  tokenBalance = startingTokens;
  spinning = false;
  reelElements.forEach((reel, index) => {
    reel.classList.remove("spinning");
    reel.textContent = symbols[index];
  });
  machineElement.classList.remove("flash-win", "flash-loss");
  setMessage("Fresh funding secured. The machine is once again ready to monetize your optimism.");
  updateBalance();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateBalance();
