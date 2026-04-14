const symbols = ["🤖", "🪙", "🔥", "📉", "🧠", "💸"];
const spinCost = 5;
const startingTokens = 30;

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];
const balanceElement = document.getElementById("token-balance");
const messageElement = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

let tokens = startingTokens;
let spinning = false;

function updateBalance() {
  balanceElement.textContent = String(tokens);
}

function setMessage(text) {
  messageElement.textContent = text;
}

function randomSymbol() {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
}

function calculatePayout(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const highestMatch = Math.max(...Object.values(counts));

  if (highestMatch === 3) {
    switch (results[0]) {
      case "🤖":
        return {
          amount: 25,
          message: "Three bots aligned. You monetized autocomplete and called it AGI.",
        };
      case "🪙":
        return {
          amount: 18,
          message: "Triple tokens. The machine is now selling you your own subscription back.",
        };
      case "🔥":
        return {
          amount: 15,
          message: "GPU inferno. Investors love how expensive this looks.",
        };
      default:
        return {
          amount: 12,
          message: "Three of a kind. A keynote deck is already being drafted.",
        };
    }
  }

  if (highestMatch === 2) {
    return {
      amount: 8,
      message: "A matching pair. Barely a product, absolutely a startup.",
    };
  }

  return {
    amount: 0,
    message: "No match. The model thanked you for your tokens and produced vibes.",
  };
}

function setControlsDisabled(disabled) {
  spinButton.disabled = disabled;
}

function finishSpin(results) {
  const payout = calculatePayout(results);
  tokens += payout.amount;
  updateBalance();
  setMessage(
    `${results.join(" ")} — ${payout.message} ${payout.amount > 0 ? `+${payout.amount} tokens.` : ""}`
  );

  if (tokens < spinCost) {
    setMessage(
      `${results.join(" ")} — ${payout.message} You're out of tokens. Time to pivot to "AI for pets."`
    );
  }

  spinning = false;
  setControlsDisabled(tokens < spinCost);
}

function animateReel(reel, delay, finalSymbol) {
  return new Promise((resolve) => {
    reel.classList.add("spinning");

    let ticks = 0;
    const intervalId = window.setInterval(() => {
      reel.textContent = randomSymbol();
      ticks += 1;

      if (ticks > 12 + delay / 60) {
        window.clearInterval(intervalId);
        reel.textContent = finalSymbol;
        reel.classList.remove("spinning");
        resolve();
      }
    }, 70 + delay);
  });
}

async function spin() {
  if (spinning || tokens < spinCost) {
    if (tokens < spinCost) {
      setMessage("Not enough tokens. Even the machine refuses to run on exposure.");
    }
    return;
  }

  spinning = true;
  tokens -= spinCost;
  updateBalance();
  setControlsDisabled(true);
  setMessage("Burning 5 tokens to generate premium synthetic confidence...");

  const results = reelElements.map(() => randomSymbol());

  await Promise.all(
    reelElements.map((reel, index) => animateReel(reel, index * 25, results[index]))
  );

  finishSpin(results);
}

function resetGame() {
  tokens = startingTokens;
  spinning = false;
  updateBalance();
  reelElements.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });
  setControlsDisabled(false);
  setMessage("Fresh funding secured. Insert tokens and ask for thought leadership.");
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateBalance();
