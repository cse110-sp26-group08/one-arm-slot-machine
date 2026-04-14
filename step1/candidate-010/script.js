const STORAGE_KEY = "candidate-010-token-drain-casino";
const STARTING_TOKENS = 90;
const SPIN_COST = 12;
const MAX_LOG_ITEMS = 8;

const symbols = [
  { name: "Prompt", payout: 16 },
  { name: "Token", payout: 20 },
  { name: "Hype", payout: 14 },
  { name: "GPU", payout: 24 },
  { name: "Slop", payout: 30 },
  { name: "Agent", payout: 18 },
  { name: "Pivot", payout: 15 },
  { name: "Deck", payout: 13 }
];

const products = [
  {
    name: "Hallucination Shield Plus",
    cost: 18,
    leak: 4,
    copy: "Turns wrong answers into premium wrong answers with a cleaner font."
  },
  {
    name: "Investor Demo Generator",
    cost: 26,
    leak: 6,
    copy: "Auto-builds a slide deck where every chart trends toward delusion."
  },
  {
    name: "GPU Campfire Subscription",
    cost: 34,
    leak: 8,
    copy: "Keeps your burn rate warm through the winter and the next funding round."
  },
  {
    name: "Autonomous Buzzword Pack",
    cost: 22,
    leak: 5,
    copy: "Adds orchestration, agents, and strategic fog to every sentence."
  },
  {
    name: "Compliance Wallpaper",
    cost: 14,
    leak: 3,
    copy: "Looks like governance from far away, which is where most governance lives."
  }
];

const copy = {
  intro: "Treasury loaded. The machine is standing by to convert hype into usage billing.",
  miss: "No payout. Your tokens were reinvested in a product roadmap built entirely from vibes.",
  pair: "Two matched. Finance calls this traction because luck sounds less fundable.",
  jackpot: "Three matched. The machine printed tokens and immediately scheduled a keynote.",
  broke: "Wallet empty. You have reproduced the authentic AI business model."
};

const state = loadState();

let spinning = false;
let autoBurn = false;

const reelNodes = [0, 1, 2].map((index) => document.getElementById(`reel${index}`));
const tokensNode = document.getElementById("tokens");
const costNode = document.getElementById("cost");
const wasteRateNode = document.getElementById("wasteRate");
const bestNode = document.getElementById("best");
const signalNode = document.getElementById("signal");
const statusNode = document.getElementById("status");
const logNode = document.getElementById("log");
const shopNode = document.getElementById("shop");
const spinButton = document.getElementById("spinButton");
const burnButton = document.getElementById("burnButton");
const resetButton = document.getElementById("resetButton");
const template = document.getElementById("shop-item-template");

costNode.textContent = SPIN_COST;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid state");
    }

    return {
      tokens: Number.isFinite(parsed.tokens) ? parsed.tokens : STARTING_TOKENS,
      best: Number.isFinite(parsed.best) ? parsed.best : STARTING_TOKENS,
      wasteRate: Number.isFinite(parsed.wasteRate) ? parsed.wasteRate : 0
    };
  } catch {
    return {
      tokens: STARTING_TOKENS,
      best: STARTING_TOKENS,
      wasteRate: 0
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setSignal(text, tone = "") {
  signalNode.textContent = text;
  signalNode.dataset.tone = tone;
}

function setStatus(text) {
  statusNode.textContent = text;
}

function addLog(text) {
  const entry = document.createElement("li");
  entry.textContent = text;
  logNode.prepend(entry);

  while (logNode.children.length > MAX_LOG_ITEMS) {
    logNode.removeChild(logNode.lastElementChild);
  }
}

function renderStats() {
  tokensNode.textContent = state.tokens;
  wasteRateNode.textContent = `${state.wasteRate}%`;
  bestNode.textContent = state.best;
  spinButton.disabled = spinning || state.tokens < SPIN_COST;
}

function renderShop() {
  shopNode.innerHTML = "";

  products.forEach((product) => {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector(".shop-name").textContent = product.name;
    fragment.querySelector(".shop-copy").textContent = product.copy;
    fragment.querySelector(".shop-price").textContent = `${product.cost} tokens`;

    const button = fragment.querySelector(".buy-button");
    button.disabled = spinning || state.tokens < product.cost;
    button.addEventListener("click", () => buyProduct(product));

    shopNode.appendChild(fragment);
  });
}

function render() {
  renderStats();
  renderShop();
  saveState();
}

function buyProduct(product) {
  if (spinning || state.tokens < product.cost) {
    setStatus("Purchase blocked. Even parody tokens still obey arithmetic.");
    return;
  }

  state.tokens -= product.cost;
  state.wasteRate = Math.min(75, state.wasteRate + product.leak);

  setSignal("BURN RATE UP", "loss");
  setStatus(`Bought ${product.name}. Token leak increased by ${product.leak}%. Wonderful discipline.`);
  addLog(`Spent ${product.cost} tokens on ${product.name}. Waste rate climbed to ${state.wasteRate}%.`);
  render();
}

function evaluate(result) {
  const names = result.map((item) => item.name);

  if (names[0] === names[1] && names[1] === names[2]) {
    const symbol = result[0];
    return {
      type: "jackpot",
      symbol: symbol.name,
      payout: symbol.name === "Slop" ? symbol.payout * 4 : symbol.payout * 3
    };
  }

  const counts = new Map();
  result.forEach((item) => {
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

function animate(finalSymbols) {
  const durations = [850, 1125, 1400];

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

function applyWasteLeak() {
  if (state.wasteRate <= 0 || state.tokens <= 0) {
    return 0;
  }

  const leakAmount = Math.min(state.tokens, Math.floor(state.tokens * (state.wasteRate / 100)));
  state.tokens -= leakAmount;
  return leakAmount;
}

function maybeAutoBurn() {
  if (!autoBurn) {
    return;
  }

  const affordable = products.filter((product) => product.cost <= state.tokens);
  if (!affordable.length) {
    return;
  }

  const selection = affordable[Math.floor(Math.random() * affordable.length)];
  buyProduct(selection);
}

async function spin() {
  if (spinning) {
    return;
  }

  if (state.tokens < SPIN_COST) {
    setSignal("NO RUNWAY", "broke");
    setStatus(copy.broke);
    render();
    return;
  }

  spinning = true;
  state.tokens -= SPIN_COST;
  setSignal("INFERENCE RUNNING");
  setStatus("Spinning reels. Please wait while your wallet experiments with monetized optimism.");
  render();

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await animate(finalSymbols);

  const outcome = evaluate(finalSymbols);
  state.tokens += outcome.payout;

  const leaked = applyWasteLeak();
  state.best = Math.max(state.best, state.tokens);

  if (outcome.type === "jackpot") {
    reelNodes.forEach((node) => node.classList.add("win"));
    setSignal("TOKENS PRINTED", "win");
    setStatus(`${copy.jackpot} ${outcome.symbol} paid ${outcome.payout} tokens.${leaked ? ` Then ${leaked} leaked into overhead.` : ""}`);
  } else if (outcome.type === "pair") {
    reelNodes.forEach((node) => node.classList.add("win"));
    setSignal("MILD HYPE", "win");
    setStatus(`${copy.pair} ${outcome.symbol} returned ${outcome.payout} tokens.${leaked ? ` Then ${leaked} evaporated into operating costs.` : ""}`);
  } else {
    setSignal("VALUE EVAPORATED", "loss");
    setStatus(`${copy.miss}${leaked ? ` Also, ${leaked} more tokens vanished into subscription creep.` : ""}`);
  }

  const reelSummary = finalSymbols.map((item) => item.name).join(" / ");
  addLog(
    outcome.payout
      ? `Paid ${SPIN_COST} tokens, rolled ${reelSummary}, won ${outcome.payout}, leaked ${leaked}.`
      : `Paid ${SPIN_COST} tokens, rolled ${reelSummary}, won nothing, leaked ${leaked}.`
  );

  spinning = false;
  render();
  maybeAutoBurn();
}

function resetGame() {
  spinning = false;
  autoBurn = false;
  state.tokens = STARTING_TOKENS;
  state.best = STARTING_TOKENS;
  state.wasteRate = 0;

  reelNodes.forEach((node, index) => {
    node.classList.remove("spinning", "win");
    node.textContent = ["Prompt", "Token", "Hype"][index];
  });

  burnButton.textContent = "Auto-Burn Winnings";
  logNode.innerHTML = "<li>Loaded 90 tokens and a dangerous amount of confidence.</li>";
  setSignal("MODEL ONLINE");
  setStatus("Treasury reset. The nonsense economy is healthy again.");
  render();
}

spinButton.addEventListener("click", spin);

burnButton.addEventListener("click", () => {
  autoBurn = !autoBurn;
  burnButton.textContent = autoBurn ? "Auto-Burn Active" : "Auto-Burn Winnings";
  setStatus(
    autoBurn
      ? "Auto-burn enabled. Future winnings will be routed directly into AI vanity spending."
      : "Auto-burn disabled. Temporary fiscal responsibility detected."
  );
});

resetButton.addEventListener("click", resetGame);

render();
setStatus(copy.intro);
