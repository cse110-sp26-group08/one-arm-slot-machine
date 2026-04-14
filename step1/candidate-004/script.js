const symbols = ["🤖", "🪙", "🧠", "🔥", "📉", "💾"];
const spinCost = 3;
const pityPayout = 5;
const jackpotPayout = 15;
const startingTokens = 30;

const reels = [...document.querySelectorAll("[data-reel]")];
const tokenBalance = document.getElementById("tokenBalance");
const message = document.getElementById("message");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");

let balance = startingTokens;
let isSpinning = false;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateBalance() {
  tokenBalance.textContent = String(balance);
  spinButton.disabled = isSpinning || balance < spinCost;
}

function setMessage(text) {
  message.textContent = text;
}

function clearWinState() {
  reels.forEach((reel) => reel.classList.remove("win"));
}

function evaluateSpin(result) {
  const counts = result.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const highestMatch = Math.max(...Object.values(counts));

  if (highestMatch === 3) {
    balance += jackpotPayout;
    reels.forEach((reel) => reel.classList.add("win"));
    setMessage(`Jackpot. The AI achieved consciousness just long enough to return ${jackpotPayout} tokens.`);
    return;
  }

  if (highestMatch === 2) {
    balance += pityPayout;
    result.forEach((symbol, index) => {
      if (counts[symbol] === 2) {
        reels[index].classList.add("win");
      }
    });
    setMessage(`Two of a kind. The startup calls this "product-market fit" and refunds ${pityPayout} tokens.`);
    return;
  }

  setMessage("No match. The machine spent your tokens on a keynote about autonomous monetization.");
}

function finishSpin(result) {
  clearWinState();
  reels.forEach((reel, index) => {
    reel.textContent = result[index];
    reel.classList.remove("spinning");
  });

  evaluateSpin(result);
  isSpinning = false;

  if (balance < spinCost) {
    setMessage(`${message.textContent} Wallet empty. Even the AI can't upsell someone with ${balance} tokens.`);
  }

  updateBalance();
}

function spin() {
  if (isSpinning || balance < spinCost) {
    return;
  }

  isSpinning = true;
  balance -= spinCost;
  updateBalance();
  clearWinState();
  setMessage("Analyzing your vibe, scraping your data, and spinning up investor optimism...");

  const result = reels.map(() => randomSymbol());

  reels.forEach((reel, index) => {
    reel.classList.add("spinning");

    if (prefersReducedMotion) {
      reel.textContent = result[index];
      return;
    }

    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90);

    const stopDelay = 700 + index * 220;
    window.setTimeout(() => {
      window.clearInterval(interval);
      reel.textContent = result[index];
    }, stopDelay);
  });

  const totalDelay = prefersReducedMotion ? 80 : 1200;
  window.setTimeout(() => finishSpin(result), totalDelay);
}

function resetGame() {
  balance = startingTokens;
  isSpinning = false;
  clearWinState();
  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });
  setMessage("Fresh funding round closed. The token wallet has been irresponsibly replenished.");
  updateBalance();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateBalance();
