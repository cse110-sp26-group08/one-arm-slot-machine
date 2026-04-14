const reelNodes = [
  document.getElementById("reel-0"),
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
];

const tokenNode = document.getElementById("tokens");
const payoutNode = document.getElementById("last-payout");
const messageNode = document.getElementById("message");
const ledgerNode = document.getElementById("ledger-list");
const spinButton = document.getElementById("spin-button");
const autoButton = document.getElementById("auto-button");
const resetButton = document.getElementById("reset-button");

const symbols = ["GPU", "BOT", "COPE", "HYPE", "PROMPT", "TOKEN", "AGENT"];
const spinCost = 15;
const startingTokens = 120;
const maxLedgerEntries = 6;

const spendingReasons = [
  "Context window overconfidence tax",
  "Emergency GPU incense subscription",
  "Enterprise hallucination insurance",
  "Founder's deck glow-up bundle",
  "Premium vibe-alignment surcharge",
  "Unnecessary autonomous agent add-on",
  "Synergy accelerator, somehow",
  "Tokenized thought leadership fee",
];

const state = {
  tokens: startingTokens,
  spinning: false,
  lastPayout: 0,
  ledger: [
    { label: "Seed round optimism", amount: 20 },
    { label: "Prototype that only demos well", amount: 35 },
  ],
};

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(text) {
  messageNode.textContent = text;
}

function renderLedger() {
  ledgerNode.innerHTML = "";

  state.ledger.slice(0, maxLedgerEntries).forEach((entry) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const cost = document.createElement("span");
    name.textContent = entry.label;
    cost.textContent = `-${entry.amount} tokens`;
    item.append(name, cost);
    ledgerNode.appendChild(item);
  });
}

function renderStatus() {
  tokenNode.textContent = String(state.tokens);
  payoutNode.textContent = String(state.lastPayout);
  const disabled = state.spinning || state.tokens < spinCost;
  spinButton.disabled = disabled;
  autoButton.disabled = disabled;
}

function addExpense(amount) {
  const label = spendingReasons[Math.floor(Math.random() * spendingReasons.length)];
  state.ledger.unshift({ label, amount });
  state.ledger = state.ledger.slice(0, maxLedgerEntries);
  renderLedger();
}

function determinePayout(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});
  const matches = Object.values(counts).sort((a, b) => b - a)[0];

  if (matches === 3) {
    return 90;
  }

  if (matches === 2) {
    return 30;
  }

  if (results.includes("TOKEN") && results.includes("AGENT")) {
    return 20;
  }

  return 0;
}

function narrate(results, payout) {
  const [first, second, third] = results;

  if (payout === 90) {
    setMessage(
      `Jackpot: ${first}, ${second}, ${third}. Investors believe your chatbot is conscious again.`
    );
    return;
  }

  if (payout === 30) {
    setMessage(
      `Two matching symbols. The market calls this "product-market fit" and hands you 30 tokens.`
    );
    return;
  }

  if (payout === 20) {
    setMessage(
      'TOKEN plus AGENT triggered a modest grant for "agentic transformation." Spend it irresponsibly.'
    );
    return;
  }

  if (state.tokens < spinCost) {
    setMessage(
      "Wallet empty. The machine recommends pivoting to an AI wrapper startup with a wellness angle."
    );
    return;
  }

  setMessage(
    `No payout for ${first}, ${second}, ${third}. The machine consumed your optimism and called it inference.`
  );
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function animateReels(results) {
  for (const node of reelNodes) {
    node.classList.add("spinning");
  }

  for (let step = 0; step < 10; step += 1) {
    reelNodes.forEach((node) => {
      node.textContent = randomSymbol();
    });
    await wait(90 + step * 12);
  }

  results.forEach((result, index) => {
    reelNodes[index].textContent = result;
  });

  for (const node of reelNodes) {
    node.classList.remove("spinning");
  }
}

async function spinOnce() {
  if (state.spinning || state.tokens < spinCost) {
    if (state.tokens < spinCost) {
      setMessage(
        "You need 15 tokens to spin. Try reset if you'd like to refill the satire budget."
      );
    }
    return;
  }

  state.spinning = true;
  state.tokens -= spinCost;
  state.lastPayout = 0;
  renderStatus();
  setMessage("Spinning the reels and querying the cloud for fresh nonsense...");

  const results = [randomSymbol(), randomSymbol(), randomSymbol()];
  await animateReels(results);

  const payout = determinePayout(results);
  state.tokens += payout;
  state.lastPayout = payout;

  if (payout > 0) {
    const spendAmount = Math.max(10, Math.floor(payout * 0.6));
    state.tokens = Math.max(0, state.tokens - spendAmount);
    addExpense(spendAmount);
  }

  state.spinning = false;
  renderStatus();
  narrate(results, payout);
}

async function autoBurn() {
  if (state.spinning) {
    return;
  }

  for (let count = 0; count < 5; count += 1) {
    if (state.tokens < spinCost) {
      break;
    }
    await spinOnce();
    await wait(250);
  }
}

function resetGame() {
  state.tokens = startingTokens;
  state.lastPayout = 0;
  state.spinning = false;
  state.ledger = [
    { label: "Seed round optimism", amount: 20 },
    { label: "Prototype that only demos well", amount: 35 },
  ];
  reelNodes.forEach((node, index) => {
    node.textContent = ["GPU", "BOT", "COPE"][index];
    node.classList.remove("spinning");
  });
  renderLedger();
  renderStatus();
  setMessage(
    "Wallet reset. Fresh tokens acquired from a new deck, a new domain name, and old mistakes."
  );
}

spinButton.addEventListener("click", spinOnce);
autoButton.addEventListener("click", autoBurn);
resetButton.addEventListener("click", resetGame);

renderLedger();
renderStatus();
