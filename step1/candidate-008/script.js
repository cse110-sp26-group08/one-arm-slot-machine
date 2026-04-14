const symbols = [
  "PROMPT",
  "TOKEN",
  "GPU",
  "AGENT",
  "VAPOR",
  "HYPE",
  "PIVOT",
  "SLIDE",
  "CACHE",
  "CHAOS",
];

const spinCost = 25;
const initialTokens = 240;

const prizeValues = {
  PROMPT: 26,
  TOKEN: 34,
  GPU: 30,
  AGENT: 22,
  VAPOR: 8,
  HYPE: 14,
  PIVOT: 17,
  SLIDE: 11,
  CACHE: 19,
  CHAOS: 6,
};

const purchases = [
  {
    item: "Hallucination Firewall Plus",
    copy: "Cost: 42 tokens. Detects misinformation right after it ships to production.",
  },
  {
    item: "Executive Demo Smoke Machine",
    copy: "Cost: 33 tokens. Adds cinematic fog whenever the model stalls for six seconds.",
  },
  {
    item: "Prompt Engineer Cape",
    copy: "Cost: 18 tokens. Raises authority by 12 percent and accuracy by absolutely none.",
  },
  {
    item: "Autonomous Meeting Summarizer",
    copy: "Cost: 28 tokens. Converts one vague meeting into a cleaner vague meeting.",
  },
  {
    item: "GPU Meditation Retreat",
    copy: "Cost: 55 tokens. Helps your servers process the trauma of another benchmark blog post.",
  },
  {
    item: "Investor-Friendly Accuracy Chart",
    copy: "Cost: 24 tokens. Removes the y-axis so the trend looks spiritually upward.",
  },
  {
    item: "Token-Burning API Starter Pack",
    copy: "Cost: 31 tokens. Includes three endpoints and a fourth one marked enterprise only.",
  },
];

const introLog = "You have not yet funded any irresponsible AI initiatives.";

let tokens = initialTokens;
let lastSpend = 0;
let spinning = false;

const reels = Array.from(document.querySelectorAll(".reel"));
const tokenBalanceNode = document.getElementById("tokenBalance");
const spinCostNode = document.getElementById("spinCost");
const lastSpendNode = document.getElementById("lastSpend");
const statusMessageNode = document.getElementById("statusMessage");
const shopItemNode = document.getElementById("shopItem");
const shopCopyNode = document.getElementById("shopCopy");
const activityLogNode = document.getElementById("activityLog");
const leverButton = document.getElementById("leverButton");
const resetButton = document.getElementById("resetButton");
const machineNode = document.querySelector(".machine");

spinCostNode.textContent = spinCost;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomSymbol() {
  return pickRandom(symbols);
}

function setStats() {
  tokenBalanceNode.textContent = tokens;
  lastSpendNode.textContent = lastSpend;
}

function setShop(purchase, spent) {
  shopItemNode.textContent = purchase.item;
  shopCopyNode.textContent = `Cost: ${spent} tokens. ${purchase.copy.replace(/^Cost: \d+ tokens\. /, "")}`;
}

function addLogEntry(text) {
  const item = document.createElement("li");
  item.textContent = text;
  activityLogNode.prepend(item);

  while (activityLogNode.children.length > 6) {
    activityLogNode.removeChild(activityLogNode.lastElementChild);
  }
}

function evaluateSpin(result) {
  const counts = new Map();

  result.forEach((symbol) => {
    counts.set(symbol, (counts.get(symbol) || 0) + 1);
  });

  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const [topSymbol, topCount] = entries[0];

  if (topCount === 3) {
    return {
      type: "jackpot",
      symbol: topSymbol,
      payout: prizeValues[topSymbol] * 4,
    };
  }

  if (topCount === 2) {
    return {
      type: "double",
      symbol: topSymbol,
      payout: prizeValues[topSymbol] + 12,
    };
  }

  return {
    type: "miss",
    payout: 0,
  };
}

function getStatusText(outcome, symbolsShown, spent, purchase) {
  if (outcome.type === "jackpot") {
    return `Jackpot: ${symbolsShown.join(" / ")}. You won ${outcome.payout} tokens, then instantly burned ${spent} on ${purchase.item}. AI efficiency remains mostly theoretical.`;
  }

  if (outcome.type === "double") {
    return `Partial success: two ${outcome.symbol} reels paid ${outcome.payout} tokens. You still spent ${spent} on ${purchase.item}, because discipline is anti-innovation.`;
  }

  if (tokens < spinCost) {
    return "Wallet depleted. The machine suggests raising another round and calling it infrastructure.";
  }

  return `No match. You lost the spin fee and still spent ${spent} tokens on ${purchase.item}, which is exactly how AI budgets behave in nature.`;
}

function pulseWin(outcome) {
  if (outcome.type === "miss") {
    return;
  }

  machineNode.classList.remove("celebrate");
  void machineNode.offsetWidth;
  machineNode.classList.add("celebrate");
}

function runReels(finalSymbols) {
  const durations = [900, 1250, 1600];
  reels.forEach((reel) => reel.classList.add("spinning"));

  return Promise.all(
    reels.map((reel, index) => new Promise((resolve) => {
      const stopTime = performance.now() + durations[index];

      function tick(now) {
        if (now >= stopTime) {
          reel.textContent = finalSymbols[index];
          reel.classList.remove("spinning");
          resolve();
          return;
        }

        reel.textContent = randomSymbol();
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }))
  );
}

function resetGame() {
  tokens = initialTokens;
  lastSpend = 0;
  spinning = false;
  setStats();
  statusMessageNode.textContent =
    "Fresh tokens printed. Fiscal responsibility has been successfully rolled back.";
  shopItemNode.textContent = "Enterprise Prompt Polisher";
  shopCopyNode.textContent =
    "Cost: 0 tokens. Improves nothing, but the dashboard gets a new accent color.";
  activityLogNode.innerHTML = `<li>${introLog}</li>`;
  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });
  leverButton.disabled = false;
  leverButton.classList.remove("pulling");
}

async function spin() {
  if (spinning) {
    return;
  }

  if (tokens < spinCost) {
    statusMessageNode.textContent =
      "Not enough tokens to spin. Even satire has operating costs.";
    leverButton.disabled = true;
    return;
  }

  spinning = true;
  leverButton.disabled = true;
  leverButton.classList.add("pulling");
  tokens -= spinCost;
  setStats();
  statusMessageNode.textContent =
    "Lever pulled. Converting tokens into synthetic ambition.";

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await runReels(finalSymbols);

  const outcome = evaluateSpin(finalSymbols);
  tokens += outcome.payout;

  const purchase = pickRandom(purchases);
  const maxSpend = Math.min(tokens, Math.max(8, Math.floor(outcome.payout * 0.65) || 12));
  const spent = Math.min(
    tokens,
    Math.max(8, Math.min(maxSpend, Math.floor(Math.random() * 26) + 12))
  );

  tokens -= spent;
  lastSpend = spent;
  setStats();
  setShop(purchase, spent);
  pulseWin(outcome);

  statusMessageNode.textContent = getStatusText(outcome, finalSymbols, spent, purchase);
  addLogEntry(
    `${finalSymbols.join(" / ")} -> won ${outcome.payout} tokens, spent ${spent} on ${purchase.item}.`
  );

  leverButton.classList.remove("pulling");
  leverButton.disabled = tokens < spinCost;
  spinning = false;
}

leverButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

setStats();
