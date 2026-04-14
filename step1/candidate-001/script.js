const symbols = [
  "Prompt",
  "Token",
  "Lag",
  "Hallucination",
  "Synergy",
  "GPU",
  "Compliance",
  "Vaporware",
  "Benchmark",
  "Agent",
];

const spinCost = 15;
const startingTokens = 120;

const payoutTable = {
  Prompt: 18,
  Token: 24,
  Lag: 6,
  Hallucination: 5,
  Synergy: 11,
  GPU: 20,
  Compliance: 14,
  Vaporware: 4,
  Benchmark: 16,
  Agent: 13,
};

const spendingIdeas = [
  "Bought a deluxe autocomplete subscription for a task you already finished.",
  "Spent 18 tokens on a dashboard that only shows confidence intervals and vibes.",
  "Allocated 22 tokens to a meeting about replacing meetings with agents.",
  "Burned 9 tokens generating twelve logos that all look like anxious hexagons.",
  "Reserved 30 tokens for a premium benchmark proving your demo was prerecorded.",
  "Used 14 tokens to summarize a sentence into a slightly longer sentence.",
  "Invested 27 tokens in a second copilot to supervise the first copilot.",
  "Directed 11 tokens toward an innovation workshop about renaming chat to orchestration.",
];

const roastByOutcome = {
  jackpot:
    "Triple match. The machine respects your hustle and immediately suggests wasting the payout on enterprise prompt alignment.",
  double:
    "Two of a kind. Not quite intelligence, but definitely investor-friendly coincidence.",
  miss:
    "No match. The reels have produced a diversified portfolio of buzzwords and disappointment.",
  broke:
    "Out of tokens. The machine recommends pivoting to a cheaper hype cycle.",
};

let tokens = startingTokens;
let lastPayout = 0;
let spinning = false;

const reelNodes = Array.from(document.querySelectorAll(".reel-symbol"));
const tokenBalanceNode = document.getElementById("tokenBalance");
const spinCostNode = document.getElementById("spinCost");
const lastPayoutNode = document.getElementById("lastPayout");
const statusMessageNode = document.getElementById("statusMessage");
const ledgerListNode = document.getElementById("ledgerList");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const machineNode = document.querySelector(".machine");

spinCostNode.textContent = spinCost;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function renderStats() {
  tokenBalanceNode.textContent = tokens;
  lastPayoutNode.textContent = lastPayout;
}

function addLedgerEntry(text) {
  const item = document.createElement("li");
  item.textContent = text;
  ledgerListNode.prepend(item);

  while (ledgerListNode.children.length > 6) {
    ledgerListNode.removeChild(ledgerListNode.lastElementChild);
  }
}

function describeOutcome(result, payout) {
  if (result.type === "jackpot") {
    return `${roastByOutcome.jackpot} You won ${payout} tokens with ${result.symbol}, ${result.symbol}, ${result.symbol}.`;
  }

  if (result.type === "double") {
    return `${roastByOutcome.double} ${result.symbol} showed up twice, so the machine refunds your bad instincts with ${payout} tokens.`;
  }

  if (tokens < spinCost) {
    return roastByOutcome.broke;
  }

  return roastByOutcome.miss;
}

function evaluateSpin(results) {
  const [a, b, c] = results;

  if (a === b && b === c) {
    return {
      type: "jackpot",
      symbol: a,
      payout: payoutTable[a] * 4,
    };
  }

  const counts = new Map();
  results.forEach((symbol) => {
    counts.set(symbol, (counts.get(symbol) || 0) + 1);
  });

  const doubleEntry = Array.from(counts.entries()).find(([, count]) => count === 2);

  if (doubleEntry) {
    const [symbol] = doubleEntry;
    return {
      type: "double",
      symbol,
      payout: payoutTable[symbol] + 8,
    };
  }

  return {
    type: "miss",
    payout: 0,
  };
}

function celebrateIfNeeded(result) {
  if (result.type === "miss") {
    return;
  }

  machineNode.classList.remove("celebrate");
  void machineNode.offsetWidth;
  machineNode.classList.add("celebrate");
}

function resetGame() {
  tokens = startingTokens;
  lastPayout = 0;
  spinning = false;
  renderStats();
  statusMessageNode.textContent =
    "Economy reset. Fresh tokens have been printed and assigned zero accountability.";
  spinButton.disabled = false;
  reelNodes.forEach((node, index) => {
    node.textContent = symbols[index];
    node.classList.remove("spinning");
  });
  ledgerListNode.innerHTML = `
    <li>Reserve 40 tokens for an emotionally supportive loading spinner.</li>
    <li>Budget 25 tokens for a paragraph that says nothing with confidence.</li>
    <li>Save 12 tokens for an "agentic" button that still needs supervision.</li>
  `;
}

function runSpinAnimation(finalSymbols) {
  const durations = [900, 1250, 1600];

  reelNodes.forEach((node) => node.classList.add("spinning"));

  return Promise.all(
    reelNodes.map((node, index) => new Promise((resolve) => {
      const stopAt = performance.now() + durations[index];

      function tick(now) {
        if (now >= stopAt) {
          node.textContent = finalSymbols[index];
          node.classList.remove("spinning");
          resolve();
          return;
        }

        node.textContent = randomSymbol();
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }))
  );
}

async function spin() {
  if (spinning || tokens < spinCost) {
    statusMessageNode.textContent = roastByOutcome.broke;
    spinButton.disabled = tokens < spinCost;
    return;
  }

  spinning = true;
  spinButton.disabled = true;
  tokens -= spinCost;
  lastPayout = 0;
  renderStats();
  statusMessageNode.textContent =
    "Spinning. Tokens are being converted into probabilistic thought leadership.";

  const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
  await runSpinAnimation(finalSymbols);

  const result = evaluateSpin(finalSymbols);
  lastPayout = result.payout;
  tokens += result.payout;
  renderStats();
  celebrateIfNeeded(result);

  const status = describeOutcome(result, result.payout);
  statusMessageNode.textContent = status;

  const spendIdea = spendingIdeas[Math.floor(Math.random() * spendingIdeas.length)];
  addLedgerEntry(
    result.payout > 0
      ? `Won ${result.payout} tokens. ${spendIdea}`
      : `Lost ${spinCost} tokens. ${spendIdea}`
  );

  spinButton.disabled = tokens < spinCost;
  spinning = false;
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

renderStats();
