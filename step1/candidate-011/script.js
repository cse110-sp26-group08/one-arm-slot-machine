const symbols = [
  {
    icon: "🪙",
    label: "Tokens",
    boost: "Triple tokens. The spreadsheet calls this product-market fit."
  },
  {
    icon: "🤖",
    label: "Bot",
    boost: "The model praised itself. Investors nodded solemnly."
  },
  {
    icon: "📉",
    label: "Burn Rate",
    boost: "Line went down, valuation somehow went up."
  },
  {
    icon: "🔥",
    label: "GPU Fire",
    boost: "You spent real money to make a hotter autocomplete."
  },
  {
    icon: "🧠",
    label: "Prompt Engineer",
    boost: "Someone added 'please' and billed a consulting fee."
  },
  {
    icon: "🫠",
    label: "Hallucination",
    boost: "The output was wrong, but so confident."
  }
];

const startingTokens = 120;
const spinCost = 15;
const storageKey = "token-tugger-save";

const state = {
  tokens: startingTokens,
  spinning: false
};

const reelNodes = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

const walletNode = document.getElementById("walletTokens");
const spinCostNode = document.getElementById("spinCost");
const promptNode = document.getElementById("promptRating");
const statusNode = document.getElementById("statusMessage");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");

spinCostNode.textContent = spinCost;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updatePromptRating() {
  if (state.tokens >= 140) {
    promptNode.textContent = "Visionary";
    return;
  }

  if (state.tokens >= 80) {
    promptNode.textContent = "Chaotic";
    return;
  }

  if (state.tokens >= spinCost) {
    promptNode.textContent = "Rate Limited";
    return;
  }

  promptNode.textContent = "Out of Context";
}

function updateWallet() {
  walletNode.textContent = state.tokens;
  spinButton.disabled = state.spinning || state.tokens < spinCost;
  updatePromptRating();
  window.localStorage.setItem(storageKey, String(state.tokens));
}

function setStatus(message) {
  statusNode.textContent = message;
}

function evaluateSpin(results) {
  const icons = results.map((result) => result.icon);
  const counts = icons.reduce((map, icon) => {
    map[icon] = (map[icon] || 0) + 1;
    return map;
  }, {});

  const matchingEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const [bestIcon, bestCount] = matchingEntry;
  const bestSymbol = symbols.find((symbol) => symbol.icon === bestIcon);

  if (bestCount === 3 && bestIcon === "🪙") {
    return { payout: 90, message: bestSymbol.boost };
  }

  if (bestCount === 3 && bestIcon === "🤖") {
    return { payout: 60, message: bestSymbol.boost };
  }

  if (bestCount === 3 && bestIcon === "📉") {
    return { payout: 45, message: bestSymbol.boost };
  }

  if (bestCount === 3) {
    return {
      payout: 35,
      message: `${bestSymbol.label} jackpot. It makes no sense, which means it shipped.`
    };
  }

  if (bestCount === 2) {
    return {
      payout: 20,
      message: `Two ${bestSymbol.label} symbols. Congratulations on your aggressively average benchmark.`
    };
  }

  return {
    payout: 0,
    message: "No match. Those tokens were consumed in the name of inference."
  };
}

function spinReels() {
  if (state.spinning || state.tokens < spinCost) {
    if (state.tokens < spinCost) {
      setStatus("Insufficient tokens. The machine suggests raising a seed round.");
    }
    return;
  }

  state.spinning = true;
  state.tokens -= spinCost;
  updateWallet();
  setStatus("Inference in progress. Please admire the cost structure.");
  reelNodes.forEach((node) => node.classList.add("spinning"));

  const results = reelNodes.map(() => randomSymbol());

  results.forEach((result, index) => {
    const reelNode = reelNodes[index];
    let ticks = 0;
    const interval = window.setInterval(() => {
      reelNode.textContent = randomSymbol().icon;
      ticks += 1;

      if (ticks > 12 + index * 4) {
        window.clearInterval(interval);
        reelNode.textContent = result.icon;
        reelNode.classList.remove("spinning");

        if (index === results.length - 1) {
          const outcome = evaluateSpin(results);
          state.tokens += outcome.payout;
          updateWallet();
          setStatus(`${outcome.message} Net swing: ${outcome.payout - spinCost >= 0 ? "+" : ""}${outcome.payout - spinCost} tokens.`);
          state.spinning = false;
          updateWallet();
        }
      }
    }, 90 + index * 40);
  });
}

function resetGame() {
  state.tokens = startingTokens;
  state.spinning = false;
  reelNodes.forEach((node, index) => {
    node.classList.remove("spinning");
    node.textContent = symbols[index].icon;
  });
  updateWallet();
  setStatus("Hype cycle refreshed. Fresh tokens, same questionable economics.");
}

function hydrateGame() {
  const savedTokens = Number.parseInt(window.localStorage.getItem(storageKey) || "", 10);
  if (!Number.isNaN(savedTokens)) {
    state.tokens = Math.max(0, savedTokens);
    setStatus("Wallet restored from localStorage. The machine remembers your habits.");
  }
  updateWallet();
}

spinButton.addEventListener("click", spinReels);
resetButton.addEventListener("click", resetGame);

hydrateGame();
