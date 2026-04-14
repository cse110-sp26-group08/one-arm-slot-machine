const symbols = [
  "hallucination",
  "synergy",
  "slop",
  "compute",
  "tokens",
  "benchmark",
  "vibes",
  "wrapper",
  "prompt",
  "pivot",
];

const payouts = {
  hallucination: 50,
  synergy: 35,
  slop: 22,
  compute: 28,
  tokens: 40,
  benchmark: 32,
  vibes: 18,
  wrapper: 26,
  prompt: 30,
  pivot: 24,
};

const shopCatalog = [
  { name: "Visionary PDF Summarizer", cost: 25 },
  { name: "Autonomous Toaster Copilot", cost: 40 },
  { name: "Enterprise Prompt Lotion", cost: 55 },
  { name: "Blockchain Mood Board", cost: 70 },
  { name: "GPU-Scented Candle", cost: 90 },
  { name: "Series A Apology Deck", cost: 110 },
];

const reels = [...document.querySelectorAll(".reel")];
const tokenCount = document.getElementById("tokenCount");
const lastWin = document.getElementById("lastWin");
const message = document.getElementById("message");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const shopItems = document.getElementById("shopItems");
const shopItemTemplate = document.getElementById("shopItemTemplate");

let tokens = 120;
let spinning = false;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateHud(payout = 0) {
  tokenCount.textContent = tokens;
  lastWin.textContent = payout;
  spinButton.disabled = spinning || tokens < 15;
}

function setMessage(text) {
  message.textContent = text;
}

function renderShop() {
  shopItems.innerHTML = "";

  for (const item of shopCatalog) {
    const node = shopItemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".shop-name").textContent = item.name;
    node.querySelector(".shop-cost").textContent = `${item.cost} tokens`;
    node.disabled = tokens < item.cost;
    node.addEventListener("click", () => buyItem(item));
    shopItems.appendChild(node);
  }
}

function buyItem(item) {
  if (tokens < item.cost) {
    setMessage(`You need ${item.cost - tokens} more tokens to fund ${item.name}. Investors remain unconvinced.`);
    return;
  }

  tokens -= item.cost;
  updateHud();
  renderShop();
  setMessage(`Purchase complete: ${item.name}. Your tokens have been safely converted into product-market confusion.`);
}

function calculatePayout(results) {
  const unique = new Set(results);

  if (unique.size === 1) {
    return payouts[results[0]] + 45;
  }

  if (unique.size === 2) {
    const repeated = results.find((symbol, index) => results.indexOf(symbol) !== index);
    return payouts[repeated];
  }

  if (results.includes("tokens") && results.includes("prompt")) {
    return 20;
  }

  return 0;
}

async function animateSpin() {
  const timers = reels.map((reel, index) => {
    reel.classList.remove("win");
    reel.classList.add("spinning");

    return window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90 + index * 40);
  });

  await new Promise((resolve) => window.setTimeout(resolve, 1100));

  const results = reels.map((reel, index) => {
    window.clearInterval(timers[index]);
    reel.classList.remove("spinning");
    const symbol = randomSymbol();
    reel.textContent = symbol;
    return symbol;
  });

  return results;
}

async function spin() {
  if (spinning || tokens < 15) {
    if (tokens < 15) {
      setMessage("You are out of tokens. Even the AI can't invent fresh budget. Try the bailout button.");
    }
    return;
  }

  spinning = true;
  tokens -= 15;
  updateHud();
  renderShop();
  setMessage("Spinning up three artisanal large language reels...");

  const results = await animateSpin();
  const payout = calculatePayout(results);

  tokens += payout;
  lastWin.textContent = payout;

  const jackpot = new Set(results).size === 1;
  const partial = new Set(results).size === 2;

  reels.forEach((reel) => {
    if (jackpot || partial) {
      reel.classList.add("win");
    }
  });

  if (jackpot) {
    setMessage(`Jackpot. Triple ${results[0]}. The machine calls this "artificial general revenue."`);
  } else if (partial) {
    setMessage(`Two ${results.find((symbol, index) => results.indexOf(symbol) !== index)}s matched. The deck now says "strong early traction."`);
  } else if (payout > 0) {
    setMessage("You hit the niche combo bonus. Tokens restored. Delusion preserved.");
  } else {
    setMessage(`No payout. The reels produced ${results.join(", ")} and a vague promise of disruption.`);
  }

  spinning = false;
  updateHud(payout);
  renderShop();
}

function resetGame() {
  tokens = 120;
  spinning = false;
  reels.forEach((reel) => {
    reel.classList.remove("spinning", "win");
    reel.textContent = randomSymbol();
  });
  updateHud();
  renderShop();
  setMessage("Fresh funding secured. The token economy is ready to disappoint again.");
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateHud();
renderShop();
