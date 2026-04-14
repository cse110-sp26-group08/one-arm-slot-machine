const STORAGE_KEY = "token-drain-casino-state";
const STARTING_TOKENS = 180;
const SPIN_COST = 25;
const MAX_LEDGER_ITEMS = 8;

const symbols = [
  { name: "Prompt", payout: 26 },
  { name: "GPU", payout: 34 },
  { name: "Lag", payout: 12 },
  { name: "Hallucination", payout: 42 },
  { name: "Synergy", payout: 18 },
  { name: "Pivot", payout: 20 },
  { name: "Token", payout: 28 },
  { name: "Benchmark", payout: 24 },
];

const shopItems = [
  {
    name: "Executive Vibe Audit",
    cost: 40,
    copy: "A seven-slide deck proving the chatbot feels premium while answering incorrectly.",
  },
  {
    name: "Hallucination Plus",
    cost: 65,
    copy: "Unlocks more confident wrong answers with tasteful enterprise gradients.",
  },
  {
    name: "Prompt Wrangler Pro",
    cost: 30,
    copy: "Hire an AI to supervise another AI that writes prompts for a third AI.",
  },
  {
    name: "Benchmark Theater Pack",
    cost: 55,
    copy: "Adds three cherry-picked charts and one suspiciously smooth demo video.",
  },
  {
    name: "Infinite Beta Badge",
    cost: 20,
    copy: "Stay perpetually in preview so nobody expects the feature to work.",
  },
];

const roastLines = {
  intro:
    "Starter capital loaded. The machine assumes you are emotionally prepared to fund AI features nobody asked for.",
  miss:
    "No match. Your tokens have been reallocated to a roadmap full of optimistic verbs.",
  double:
    "Two of a kind. The machine calls that traction and releases a press statement.",
  jackpot:
    "Three of a kind. Spectacular. You have achieved temporary product-market delusion.",
  broke:
    "Not enough tokens for another spin. Consider laying off a few buzzwords.",
};

const state = loadState();

let spinning = false;
let autoSpendEnabled = false;
let resizeRaf = 0;

const reelNodes = [0, 1, 2].map((index) => document.getElementById(`reel${index}`));
const tokenBalanceNode = document.getElementById("tokenBalance");
const spinCostNode = document.getElementById("spinCost");
const highScoreNode = document.getElementById("highScore");
const lastPayoutNode = document.getElementById("lastPayout");
const statusMessageNode = document.getElementById("statusMessage");
const signalLightNode = document.getElementById("signalLight");
const ledgerListNode = document.getElementById("ledgerList");
const shopListNode = document.getElementById("shopList");
const spinButton = document.getElementById("spinButton");
const autoSpendButton = document.getElementById("autoSpendButton");
const resetButton = document.getElementById("resetButton");
const canvas = document.getElementById("confettiCanvas");
const template = document.getElementById("shopItemTemplate");

spinCostNode.textContent = SPIN_COST;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid state");
    }

    return {
      tokens: Number.isFinite(parsed.tokens) ? parsed.tokens : STARTING_TOKENS,
      highScore: Number.isFinite(parsed.highScore) ? parsed.highScore : STARTING_TOKENS,
      lastPayout: Number.isFinite(parsed.lastPayout) ? parsed.lastPayout : 0,
    };
  } catch {
    return {
      tokens: STARTING_TOKENS,
      highScore: STARTING_TOKENS,
      lastPayout: 0,
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function addLedgerEntry(text) {
  const item = document.createElement("li");
  item.textContent = text;
  ledgerListNode.prepend(item);

  while (ledgerListNode.children.length > MAX_LEDGER_ITEMS) {
    ledgerListNode.removeChild(ledgerListNode.lastElementChild);
  }
}

function updateStatus(message) {
  statusMessageNode.textContent = message;
}

function updateSignal(text, tone) {
  signalLightNode.textContent = text;
  signalLightNode.dataset.tone = tone;
}

function renderStats() {
  tokenBalanceNode.textContent = state.tokens;
  highScoreNode.textContent = state.highScore;
  lastPayoutNode.textContent = state.lastPayout;
  spinButton.disabled = spinning || state.tokens < SPIN_COST;
}

function renderShop() {
  shopListNode.innerHTML = "";

  shopItems.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const article = fragment.querySelector(".shop-item");
    const title = fragment.querySelector(".shop-item-title");
    const copy = fragment.querySelector(".shop-item-copy");
    const price = fragment.querySelector(".shop-item-price");
    const button = fragment.querySelector(".buy-button");

    title.textContent = item.name;
    copy.textContent = item.copy;
    price.textContent = `${item.cost} tokens`;

    button.disabled = state.tokens < item.cost || spinning;
    button.addEventListener("click", () => purchaseItem(item));

    article.dataset.item = item.name;
    shopListNode.appendChild(fragment);
  });
}

function render() {
  renderStats();
  renderShop();
  saveState();
}

function evaluateSpin(resultSymbols) {
  const [a, b, c] = resultSymbols.map((item) => item.name);

  if (a === b && b === c) {
    const base = resultSymbols[0].payout;
    const jackpotMultiplier = a === "Hallucination" ? 5 : 4;

    return {
      type: "jackpot",
      symbol: a,
      payout: base * jackpotMultiplier,
    };
  }

  const counts = new Map();
  resultSymbols.forEach((item) => {
    counts.set(item.name, (counts.get(item.name) || 0) + 1);
  });

  const pair = Array.from(counts.entries()).find(([, count]) => count === 2);
  if (pair) {
    const match = symbols.find((item) => item.name === pair[0]);
    return {
      type: "double",
      symbol: match.name,
      payout: match.payout + 10,
    };
  }

  return {
    type: "miss",
    payout: 0,
  };
}

function animateReels(finalSymbols) {
  const durations = [900, 1200, 1500];
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

function burstConfetti() {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.25,
    size: 5 + Math.random() * 8,
    speedY: 2 + Math.random() * 5,
    speedX: -2 + Math.random() * 4,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -0.15 + Math.random() * 0.3,
    color: ["#ffbf3c", "#5eead4", "#ff4d6d", "#ffffff"][Math.floor(Math.random() * 4)],
  }));

  const start = performance.now();
  const lifetime = 1600;

  function draw(now) {
    const elapsed = now - start;
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.rotation += particle.rotationSpeed;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.68);
      context.restore();
    });

    if (elapsed < lifetime) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(draw);
}

function handleWinEffects(result) {
  if (result.type === "miss") {
    updateSignal("MODEL DRIFT", "miss");
    return;
  }

  reelNodes.forEach((node) => node.classList.add("win"));
  updateSignal(result.type === "jackpot" ? "HYPE SPIKE" : "MILD VIRALITY", result.type);

  if (result.type === "jackpot") {
    burstConfetti();
  }
}

function describeSpin(result) {
  if (result.type === "jackpot") {
    return `${roastLines.jackpot} ${result.symbol} paid ${result.payout} tokens. Please spend them irresponsibly.`;
  }

  if (result.type === "double") {
    return `${roastLines.double} Two ${result.symbol} symbols returned ${result.payout} tokens. Analysts are calling it momentum.`;
  }

  return roastLines.miss;
}

function purchaseItem(item) {
  if (spinning || state.tokens < item.cost) {
    updateStatus("Purchase denied. Your fake AI treasury cannot support this real bad idea.");
    return;
  }

  state.tokens -= item.cost;
  state.lastPayout = 0;
  addLedgerEntry(`Spent ${item.cost} tokens on "${item.name}". ${item.copy}`);
  updateStatus(`Purchase complete: ${item.name}. Finance has reclassified it as strategic experimentation.`);
  updateSignal("TOKEN DRAIN", "spend");
  render();
}

function maybeAutoSpend() {
  if (!autoSpendEnabled) {
    return;
  }

  const affordable = shopItems.filter((item) => item.cost <= state.tokens);
  if (!affordable.length) {
    return;
  }

  const choice = affordable[Math.floor(Math.random() * affordable.length)];
  purchaseItem(choice);
}

async function spin() {
  if (spinning) {
    return;
  }

  if (state.tokens < SPIN_COST) {
    updateStatus(roastLines.broke);
    updateSignal("NO FUNDING", "broke");
    render();
    return;
  }

  spinning = true;
  state.tokens -= SPIN_COST;
  state.lastPayout = 0;
  updateStatus("Reels spinning. Converting tokens into theatrical machine learning outcomes.");
  updateSignal("INFERENCE", "spin");
  render();

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await animateReels(finalSymbols);

  const result = evaluateSpin(finalSymbols);
  state.lastPayout = result.payout;
  state.tokens += result.payout;
  state.highScore = Math.max(state.highScore, state.tokens);

  handleWinEffects(result);
  updateStatus(describeSpin(result));
  addLedgerEntry(
    result.payout > 0
      ? `Paid 25 to spin, won ${result.payout} back on ${finalSymbols.map((item) => item.name).join(" / ")}.`
      : `Paid 25 to spin and received ${finalSymbols.map((item) => item.name).join(" / ")}. The board approved the loss.`
  );

  spinning = false;
  render();
  maybeAutoSpend();
}

function resizeCanvas() {
  cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function resetGame() {
  spinning = false;
  autoSpendEnabled = false;
  state.tokens = STARTING_TOKENS;
  state.highScore = STARTING_TOKENS;
  state.lastPayout = 0;
  ledgerListNode.innerHTML = "<li>Initial deposit: 180 tokens and a reckless amount of confidence.</li>";
  reelNodes.forEach((node, index) => {
    node.classList.remove("spinning", "win");
    node.textContent = symbols[index].name;
  });
  autoSpendButton.textContent = "Auto-Spend Winnings";
  updateStatus("Economy reset. Fresh tokens issued. Lessons ignored.");
  updateSignal("REBOOTED", "reset");
  render();
}

spinButton.addEventListener("click", spin);
autoSpendButton.addEventListener("click", () => {
  autoSpendEnabled = !autoSpendEnabled;
  autoSpendButton.textContent = autoSpendEnabled ? "Auto-Spend: On" : "Auto-Spend Winnings";
  updateStatus(
    autoSpendEnabled
      ? "Auto-spend enabled. Future winnings will be vaporized automatically."
      : "Auto-spend disabled. Human oversight has briefly returned."
  );
});
resetButton.addEventListener("click", resetGame);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
render();
updateStatus(roastLines.intro);
