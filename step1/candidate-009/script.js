const STORAGE_KEY = "candidate-009-token-laundromat";
const STARTING_TOKENS = 120;
const STARTING_CREDIBILITY = 100;
const SPIN_COST = 15;
const MAX_LOG_ITEMS = 8;

const symbols = [
  { name: "Prompt", payout: 18 },
  { name: "GPU", payout: 26 },
  { name: "Slop", payout: 32 },
  { name: "Agent", payout: 20 },
  { name: "Pivot", payout: 16 },
  { name: "Token", payout: 22 },
  { name: "Vibes", payout: 14 },
  { name: "Scale", payout: 24 }
];

const storeItems = [
  {
    name: "Premium Hallucination Tier",
    cost: 35,
    credibilityHit: 8,
    copy: "Wrong answers arrive faster, louder, and with executive polish."
  },
  {
    name: "GPU Scented Candle",
    cost: 20,
    credibilityHit: 4,
    copy: "Smells like burnt capital and a missed shipping deadline."
  },
  {
    name: "Enterprise Buzzword Pack",
    cost: 28,
    credibilityHit: 6,
    copy: "Adds synergy, orchestration, and absolutely no evidence."
  },
  {
    name: "Autonomous Intern Swarm",
    cost: 45,
    credibilityHit: 10,
    copy: "Several junior agents now confidently automate your confusion."
  },
  {
    name: "Thought Leader Portrait",
    cost: 18,
    credibilityHit: 3,
    copy: "A framed rendering of you explaining disruption to a ring light."
  }
];

const flavor = {
  intro:
    "Seed funding received. The machine is ready to convert optimism into usage-based billing.",
  miss:
    "No match. Your tokens were immediately reinvested into a deck with the word multi-agent on every slide.",
  pair:
    "Two of a kind. Finance calls this traction because admitting luck would hurt the valuation.",
  jackpot:
    "Jackpot. Three matching symbols, a flood of tokens, and exactly zero durable moat.",
  broke:
    "Treasury empty. You have achieved the authentic startup cash-flow simulation."
};

const state = loadState();

let spinning = false;
let autoWaste = false;

const reelNodes = [0, 1, 2].map((index) => document.getElementById(`reel${index}`));
const balanceNode = document.getElementById("balance");
const spinCostNode = document.getElementById("spinCost");
const credibilityNode = document.getElementById("credibility");
const bestBalanceNode = document.getElementById("bestBalance");
const tickerNode = document.getElementById("ticker");
const statusNode = document.getElementById("status");
const logNode = document.getElementById("log");
const storeNode = document.getElementById("store");
const spinButton = document.getElementById("spinButton");
const cashOutButton = document.getElementById("cashOutButton");
const resetButton = document.getElementById("resetButton");
const storeTemplate = document.getElementById("store-item-template");

spinCostNode.textContent = SPIN_COST;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Bad state");
    }

    return {
      tokens: Number.isFinite(parsed.tokens) ? parsed.tokens : STARTING_TOKENS,
      credibility: Number.isFinite(parsed.credibility) ? parsed.credibility : STARTING_CREDIBILITY,
      bestBalance: Number.isFinite(parsed.bestBalance) ? parsed.bestBalance : STARTING_TOKENS
    };
  } catch {
    return {
      tokens: STARTING_TOKENS,
      credibility: STARTING_CREDIBILITY,
      bestBalance: STARTING_TOKENS
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setTicker(text, tone) {
  tickerNode.textContent = text;
  tickerNode.dataset.tone = tone;
}

function setStatus(text) {
  statusNode.textContent = text;
}

function addLog(text) {
  const item = document.createElement("li");
  item.textContent = text;
  logNode.prepend(item);

  while (logNode.children.length > MAX_LOG_ITEMS) {
    logNode.removeChild(logNode.lastElementChild);
  }
}

function renderStats() {
  balanceNode.textContent = state.tokens;
  credibilityNode.textContent = Math.max(0, state.credibility);
  bestBalanceNode.textContent = state.bestBalance;
  spinButton.disabled = spinning || state.tokens < SPIN_COST;
}

function purchaseItem(item) {
  if (spinning || state.tokens < item.cost) {
    setStatus("Purchase blocked. Even fake AI money has limits.");
    return;
  }

  state.tokens -= item.cost;
  state.credibility = Math.max(0, state.credibility - item.credibilityHit);
  setTicker("TOKENS BURNED", "loss");
  setStatus(`Purchased ${item.name}. Credibility down ${item.credibilityHit} points. The keynote just got worse.`);
  addLog(`Spent ${item.cost} tokens on ${item.name}. Credibility fell by ${item.credibilityHit}.`);
  render();
}

function renderStore() {
  storeNode.innerHTML = "";

  storeItems.forEach((item) => {
    const fragment = storeTemplate.content.cloneNode(true);
    const title = fragment.querySelector(".store-title");
    const copy = fragment.querySelector(".store-copy");
    const price = fragment.querySelector(".store-price");
    const button = fragment.querySelector(".buy-button");

    title.textContent = item.name;
    copy.textContent = item.copy;
    price.textContent = `${item.cost} tokens`;
    button.disabled = spinning || state.tokens < item.cost;
    button.addEventListener("click", () => purchaseItem(item));

    storeNode.appendChild(fragment);
  });
}

function render() {
  renderStats();
  renderStore();
  saveState();
}

function evaluate(resultSymbols) {
  const names = resultSymbols.map((item) => item.name);
  if (names[0] === names[1] && names[1] === names[2]) {
    const symbol = resultSymbols[0];
    return {
      type: "jackpot",
      symbol: symbol.name,
      payout: symbol.name === "Slop" ? symbol.payout * 4 : symbol.payout * 3
    };
  }

  const counts = new Map();
  resultSymbols.forEach((item) => {
    counts.set(item.name, (counts.get(item.name) || 0) + 1);
  });

  const pair = Array.from(counts.entries()).find(([, count]) => count === 2);
  if (pair) {
    const symbol = symbols.find((item) => item.name === pair[0]);
    return {
      type: "pair",
      symbol: symbol.name,
      payout: symbol.payout
    };
  }

  return { type: "miss", payout: 0 };
}

function animateReels(finalSymbols) {
  const durations = [850, 1150, 1450];
  reelNodes.forEach((node) => {
    node.classList.remove("win");
    node.classList.add("spinning");
  });

  return Promise.all(
    reelNodes.map((node, index) => new Promise((resolve) => {
      const stopTime = performance.now() + durations[index];

      function frame(now) {
        if (now >= stopTime) {
          node.textContent = finalSymbols[index].name;
          node.classList.remove("spinning");
          resolve();
          return;
        }

        node.textContent = randomSymbol().name;
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }))
  );
}

function maybeAutoWaste() {
  if (!autoWaste) {
    return;
  }

  const affordable = storeItems.filter((item) => item.cost <= state.tokens);
  if (!affordable.length) {
    return;
  }

  const selection = affordable[Math.floor(Math.random() * affordable.length)];
  purchaseItem(selection);
}

async function spin() {
  if (spinning) {
    return;
  }

  if (state.tokens < SPIN_COST) {
    setTicker("NO RUNWAY", "broke");
    setStatus(flavor.broke);
    render();
    return;
  }

  spinning = true;
  state.tokens -= SPIN_COST;
  setTicker("MODEL SPINNING", "");
  setStatus("Running inference. Please wait while the machine monetizes your attention span.");
  render();

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await animateReels(finalSymbols);

  const outcome = evaluate(finalSymbols);
  state.tokens += outcome.payout;
  state.bestBalance = Math.max(state.bestBalance, state.tokens);

  if (outcome.type === "jackpot") {
    reelNodes.forEach((node) => node.classList.add("win"));
    setTicker("TOKENS PRINTED", "win");
    setStatus(`${flavor.jackpot} ${outcome.symbol} paid ${outcome.payout} tokens.`);
  } else if (outcome.type === "pair") {
    reelNodes.forEach((node) => node.classList.add("win"));
    setTicker("MILD HYPE", "win");
    setStatus(`${flavor.pair} ${outcome.symbol} returned ${outcome.payout} tokens.`);
  } else {
    setTicker("VALUE EVAPORATED", "loss");
    setStatus(flavor.miss);
  }

  addLog(
    outcome.payout
      ? `Paid ${SPIN_COST} tokens to spin and got ${outcome.payout} back from ${finalSymbols.map((item) => item.name).join(" / ")}.`
      : `Paid ${SPIN_COST} tokens to spin and received ${finalSymbols.map((item) => item.name).join(" / ")} plus a lecture about efficiency.`
  );

  spinning = false;
  render();
  maybeAutoWaste();
}

function resetGame() {
  spinning = false;
  autoWaste = false;
  state.tokens = STARTING_TOKENS;
  state.credibility = STARTING_CREDIBILITY;
  state.bestBalance = STARTING_TOKENS;
  reelNodes.forEach((node, index) => {
    node.classList.remove("spinning", "win");
    node.textContent = symbols[index].name;
  });
  cashOutButton.textContent = "Waste Tokens Automatically";
  logNode.innerHTML = "<li>Initial treasury loaded with 120 tokens and zero self-respect.</li>";
  setTicker("MARKET OPEN", "");
  setStatus("Treasury reset. The grift is fresh again.");
  render();
}

spinButton.addEventListener("click", spin);
cashOutButton.addEventListener("click", () => {
  autoWaste = !autoWaste;
  cashOutButton.textContent = autoWaste ? "Auto-Waste Enabled" : "Waste Tokens Automatically";
  setStatus(
    autoWaste
      ? "Auto-waste enabled. Future winnings will be thrown at AI vanity purchases."
      : "Auto-waste disabled. Human restraint has briefly returned."
  );
});
resetButton.addEventListener("click", resetGame);

render();
setStatus(flavor.intro);
