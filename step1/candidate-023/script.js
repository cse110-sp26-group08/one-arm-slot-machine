const symbols = ["GPU", "LOL", "404", "PROMPT", "BOT", "HYPE"];
const spinCost = 3;
const startingTokens = 25;
const storageKey = "token-furnace-balance";

const expenses = [
  { label: "Context window polishing", cost: 0 },
  { label: "Hallucination premium", cost: 2 },
  { label: "Executive summary upcharge", cost: 1 },
  { label: "Synergy inference fee", cost: 4 },
  { label: "Vision model peeking surcharge", cost: 3 },
  { label: "Prompt laundering tax", cost: 2 },
];

const reels = Array.from({ length: 3 }, (_, index) =>
  document.getElementById(`reel-${index}`)
);

const tokenCount = document.getElementById("token-count");
const resultMessage = document.getElementById("result-message");
const expenseLabel = document.getElementById("expense-label");
const expenseCost = document.getElementById("expense-cost");
const spinButton = document.getElementById("spin-button");
const machinePanel = document.querySelector(".machine-panel");
const sparkTemplate = document.getElementById("spark-template");

let tokens = loadTokens();
let spinning = false;

renderTokens();
updateSpinState();

spinButton.addEventListener("click", async () => {
  if (spinning || tokens < spinCost) {
    return;
  }

  spinning = true;
  updateSpinState();
  tokens -= spinCost;
  saveTokens();
  renderTokens();

  const outcome = rollOutcome();
  resultMessage.className = "";
  resultMessage.textContent = "Consulting the model weights...";

  await animateReels(outcome.symbols);

  const aiExpense = randomItem(expenses);
  const totalDelta = outcome.payout - aiExpense.cost;
  tokens = Math.max(0, tokens + outcome.payout - aiExpense.cost);
  saveTokens();
  renderTokens();
  renderExpense(aiExpense);
  renderResult(outcome, totalDelta);

  if (totalDelta > 0) {
    celebrateWin();
  } else {
    shakePanel();
  }

  spinning = false;
  updateSpinState();
});

function loadTokens() {
  const rawValue = window.localStorage.getItem(storageKey);
  const parsed = Number.parseInt(rawValue ?? `${startingTokens}`, 10);
  return Number.isFinite(parsed) ? parsed : startingTokens;
}

function saveTokens() {
  window.localStorage.setItem(storageKey, `${tokens}`);
}

function renderTokens() {
  tokenCount.textContent = `${tokens}`;
}

function renderExpense(expense) {
  expenseLabel.textContent = expense.label;
  expenseCost.textContent = `Cost: ${expense.cost} tokens`;
}

function updateSpinState() {
  spinButton.disabled = spinning || tokens < spinCost;
  spinButton.textContent = tokens < spinCost ? "Out of Tokens" : "Spin for Glory";
}

function rollOutcome() {
  const symbolsRolled = Array.from({ length: 3 }, () => randomItem(symbols));
  const counts = countSymbols(symbolsRolled);
  const values = Object.values(counts).sort((a, b) => b - a);

  let payout = 0;
  let message = "The machine produced premium nonsense. Classic.";

  if (symbolsRolled.every((symbol) => symbol === "GPU")) {
    payout = 18;
    message = "Triple GPU. Investors are crying. You gain 18 tokens.";
  } else if (symbolsRolled.every((symbol) => symbol === "PROMPT")) {
    payout = 14;
    message = "Triple PROMPT. A keynote speaker just stole your phrasing. +14 tokens.";
  } else if (values[0] === 3) {
    payout = 10;
    message = `Triple ${symbolsRolled[0]}. The demo looped successfully. +10 tokens.`;
  } else if (values[0] === 2) {
    payout = 5;
    message = "Two symbols matched. Ship the prototype and call it aligned. +5 tokens.";
  }

  return { symbols: symbolsRolled, payout, message };
}

function countSymbols(items) {
  return items.reduce((accumulator, item) => {
    accumulator[item] = (accumulator[item] ?? 0) + 1;
    return accumulator;
  }, {});
}

async function animateReels(finalSymbols) {
  const durations = [650, 900, 1150];

  await Promise.all(
    reels.map((reel, index) => spinSingleReel(reel, finalSymbols[index], durations[index]))
  );
}

function spinSingleReel(reel, finalSymbol, duration) {
  return new Promise((resolve) => {
    const interval = window.setInterval(() => {
      reel.textContent = randomItem(symbols);
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      reel.textContent = finalSymbol;
      reel.animate(
        [
          { transform: "translateY(-12px) scale(0.96)" },
          { transform: "translateY(0) scale(1.08)" },
          { transform: "translateY(0) scale(1)" },
        ],
        { duration: 320, easing: "cubic-bezier(.2,.9,.2,1)" }
      );
      resolve();
    }, duration);
  });
}

function renderResult(outcome, totalDelta) {
  const sign = totalDelta >= 0 ? "+" : "";
  const afterFees = `${outcome.message} After AI fees: ${sign}${totalDelta} tokens.`;
  resultMessage.textContent = afterFees;
  resultMessage.className = totalDelta > 0 ? "win" : "loss";

  if (tokens < spinCost) {
    resultMessage.textContent += " Wallet depleted. The model suggests buying more credits.";
  }
}

function celebrateWin() {
  const sparks = Array.from({ length: 16 }, () => {
    const node = sparkTemplate.content.firstElementChild.cloneNode(true);
    const x = Math.random() * machinePanel.clientWidth;
    const y = Math.random() * machinePanel.clientHeight * 0.55;

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    machinePanel.appendChild(node);

    node.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${Math.random() * 120 - 60}px, ${120 + Math.random() * 80}px) scale(0.3)`,
          opacity: 0,
        },
      ],
      { duration: 850 + Math.random() * 450, easing: "ease-out" }
    );

    return node;
  });

  window.setTimeout(() => {
    sparks.forEach((spark) => spark.remove());
  }, 1500);
}

function shakePanel() {
  machinePanel.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-7px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 320, easing: "ease-out" }
  );
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
