const symbols = ["GPU", "ALIGN", "PROMPT", "404", "BUG", "OOPS", "TOKEN", "LOL"];
const state = {
  tokens: 120,
  baseCost: 15,
  currentCost: 15,
  isSpinning: false,
  streak: 0
};

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenCount = document.getElementById("token-count");
const spinCost = document.getElementById("spin-cost");
const hypeMeter = document.getElementById("hype-meter");
const message = document.getElementById("message");
const historyList = document.getElementById("history-list");
const spinButton = document.getElementById("spin-button");
const maxButton = document.getElementById("max-button");
const resetButton = document.getElementById("reset-button");

function updateHud() {
  tokenCount.textContent = String(state.tokens);
  spinCost.textContent = String(state.currentCost);

  if (state.streak >= 3) {
    hypeMeter.textContent = "Unbearable";
  } else if (state.streak === 2) {
    hypeMeter.textContent = "Pitch Deck";
  } else if (state.streak === 1) {
    hypeMeter.textContent = "Buzzing";
  } else {
    hypeMeter.textContent = "Calm";
  }

  spinButton.disabled = state.isSpinning || state.tokens < state.currentCost;
  maxButton.disabled = state.isSpinning || state.tokens < state.currentCost * 2;
}

function addHistory(entry) {
  const item = document.createElement("li");
  item.textContent = entry;
  historyList.prepend(item);

  while (historyList.children.length > 6) {
    historyList.removeChild(historyList.lastChild);
  }
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(text, tone = "neutral") {
  message.textContent = text;
  message.style.borderLeftColor =
    tone === "success" ? "var(--success)" :
    tone === "danger" ? "var(--danger)" :
    "var(--accent)";
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const uniqueSymbols = Object.keys(counts);
  const hasTriple = uniqueSymbols.length === 1;
  const hasPair = uniqueSymbols.length === 2;
  const combo = results.join("-");

  if (combo === "404-BUG-OOPS") {
    return {
      payout: 10,
      text: "Legendary failure cascade. The machine calls it resilience and refunds 10 tokens.",
      tone: "success"
    };
  }

  if (hasTriple && results[0] === "GPU") {
    return {
      payout: 120,
      text: "Triple GPU. Venture capital appears from the fog and lights a bonfire with cash.",
      tone: "success"
    };
  }

  if (hasTriple && results[0] === "ALIGN") {
    return {
      payout: 90,
      text: "Triple ALIGN. The ethics board applauds while doing absolutely nothing.",
      tone: "success"
    };
  }

  if (hasTriple && results[0] === "PROMPT") {
    return {
      payout: 70,
      text: "Triple PROMPT. Congratulations, you invented asking nicely but with investor backing.",
      tone: "success"
    };
  }

  if (hasTriple) {
    return {
      payout: 55,
      text: `Triple ${results[0]}. The machine insists this outcome was emergent, not lucky.`,
      tone: "success"
    };
  }

  if (hasPair) {
    return {
      payout: 25,
      text: "A pair matched. Product marketing calls this a breakthrough demo.",
      tone: "success"
    };
  }

  return {
    payout: 0,
    text: "No match. The model burned your tokens to generate another confident paragraph of nonsense.",
    tone: "danger"
  };
}

function pulseWinningReels(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  reels.forEach((reel, index) => {
    reel.classList.remove("win");
    if (counts[results[index]] >= 2) {
      reel.classList.add("win");
    }
  });
}

function clearWinningReels() {
  reels.forEach((reel) => reel.classList.remove("win"));
}

function finishSpin(results, multiplier) {
  const outcome = evaluateSpin(results);
  const totalPayout = outcome.payout * multiplier;

  state.tokens += totalPayout;
  state.streak = totalPayout > 0 ? state.streak + 1 : 0;
  state.currentCost = Math.min(45, state.baseCost + state.streak * 3);
  state.isSpinning = false;

  pulseWinningReels(results);
  setMessage(
    multiplier > 1
      ? `${outcome.text} Overfit mode multiplies the chaos for ${totalPayout} tokens.`
      : outcome.text,
    outcome.tone
  );

  const ledger =
    totalPayout > 0
      ? `Spin paid ${totalPayout} tokens with [${results.join(" | ")}].`
      : `Spin whiffed with [${results.join(" | ")}]. Shareholders remain delusional.`;
  addHistory(ledger);

  if (state.tokens < state.currentCost) {
    setMessage("Wallet too low. Even satire has microtransactions. Reset and try again.", "danger");
  }

  updateHud();
}

function spin(multiplier = 1) {
  const cost = state.currentCost * multiplier;
  if (state.isSpinning || state.tokens < cost) {
    return;
  }

  state.isSpinning = true;
  state.tokens -= cost;
  clearWinningReels();
  setMessage("Allocating tokens to the inference furnace. Please enjoy these premium spinning rectangles.");
  updateHud();

  reels.forEach((reel) => reel.classList.add("spinning"));

  const finalResults = reels.map(() => randomSymbol());

  reels.forEach((reel, index) => {
    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90 + index * 40);

    window.setTimeout(() => {
      window.clearInterval(interval);
      reel.classList.remove("spinning");
      reel.textContent = finalResults[index];

      if (index === reels.length - 1) {
        finishSpin(finalResults, multiplier);
      }
    }, 900 + index * 350);
  });
}

function resetGame() {
  state.tokens = 120;
  state.baseCost = 15;
  state.currentCost = 15;
  state.isSpinning = false;
  state.streak = 0;

  clearWinningReels();
  reels[0].textContent = "404";
  reels[1].textContent = "GPU";
  reels[2].textContent = "LOL";
  historyList.innerHTML = "<li>System ready. Token extractor warming up.</li>";
  setMessage("Fresh wallet loaded. Time to convert optimism into platform spend.");
  updateHud();
}

spinButton.addEventListener("click", () => spin(1));
maxButton.addEventListener("click", () => spin(2));
resetButton.addEventListener("click", resetGame);

updateHud();
