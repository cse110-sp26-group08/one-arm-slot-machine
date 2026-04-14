const symbols = ["WIN", "404", "GPU", "LOL", "BOT", "LAG", "ETHICS"];
const spinCost = 5;
const startingTokens = 30;
const reelEls = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenCountEl = document.getElementById("token-count");
const lastWinEl = document.getElementById("last-win");
const messageEl = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

let tokens = startingTokens;
let isSpinning = false;

function setMessage(text) {
  messageEl.textContent = text;
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateStats(lastWin = 0) {
  tokenCountEl.textContent = String(tokens);
  lastWinEl.textContent = String(lastWin);
  spinButton.disabled = isSpinning || tokens < spinCost;
}

function clearWinState() {
  reelEls.forEach((reel) => reel.classList.remove("win"));
}

function evaluateSpin(result) {
  const counts = result.reduce((accumulator, symbol) => {
    accumulator[symbol] = (accumulator[symbol] || 0) + 1;
    return accumulator;
  }, {});
  const values = Object.values(counts);

  if (result.every((symbol) => symbol === "WIN")) {
    return {
      payout: 40,
      message: "Triple WIN. The machine briefly mistakes you for a venture-backed founder."
    };
  }

  if (values.includes(3)) {
    return {
      payout: 20,
      message: `Three ${result[0]} symbols. Even the model has to respect obvious pattern matching.`
    };
  }

  if (values.includes(2)) {
    return {
      payout: 8,
      message: "Two reels aligned. A suspiciously generous autocomplete has appeared."
    };
  }

  if (result.includes("404")) {
    return {
      payout: 1,
      message: "A 404 slipped through. The machine refunds one token for emotional damages."
    };
  }

  return {
    payout: 0,
    message: "No payout. The AI used your tokens to generate six paragraphs of confident nonsense."
  };
}

function highlightWins(result) {
  const counts = result.reduce((accumulator, symbol) => {
    accumulator[symbol] = (accumulator[symbol] || 0) + 1;
    return accumulator;
  }, {});

  reelEls.forEach((reel, index) => {
    if (counts[result[index]] > 1 || result[index] === "WIN") {
      reel.classList.add("win");
    }
  });
}

function spinReels() {
  if (isSpinning || tokens < spinCost) {
    if (tokens < spinCost) {
      setMessage("You're out of tokens. Refill the wallet and resume funding the machine.");
    }
    return;
  }

  isSpinning = true;
  clearWinState();
  tokens -= spinCost;
  updateStats(0);
  setMessage("Processing your payment and fabricating excitement...");

  const result = reelEls.map(() => randomSymbol());
  const delays = [500, 900, 1300];

  reelEls.forEach((reel, index) => {
    reel.classList.add("spinning");

    const intervalId = window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      reel.classList.remove("spinning");
      reel.textContent = result[index];

      if (index === reelEls.length - 1) {
        const outcome = evaluateSpin(result);
        tokens += outcome.payout;
        lastWinEl.textContent = String(outcome.payout);
        highlightWins(result);
        setMessage(outcome.message);
        isSpinning = false;
        updateStats(outcome.payout);
      }
    }, delays[index]);
  });
}

function resetGame() {
  tokens = startingTokens;
  isSpinning = false;
  clearWinState();
  reelEls.forEach((reel, index) => {
    reel.textContent = symbols[(index + 1) % symbols.length];
    reel.classList.remove("spinning");
  });
  setMessage("Wallet refilled. Time to feed the machine another batch of speculative tokens.");
  updateStats(0);
}

spinButton.addEventListener("click", spinReels);
resetButton.addEventListener("click", resetGame);

updateStats(0);
