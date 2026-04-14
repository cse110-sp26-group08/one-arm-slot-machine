const symbols = [
  "GPU",
  "Prompt",
  "Hallucination",
  "Token",
  "Pivot",
  "Synergy",
  "Context",
  "Venture",
  "Latency"
];

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const balanceElement = document.getElementById("token-balance");
const spinCostElement = document.getElementById("spin-cost");
const lastPayoutElement = document.getElementById("last-payout");
const messageElement = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const autofillButton = document.getElementById("autofill-button");

const state = {
  balance: 120,
  spinCost: 15,
  lastPayout: 0,
  spinning: false
};

const spinMessages = {
  jackpot: [
    "Triple match. Congratulations, your AI startup now bills per sigh.",
    "Three of a kind. Investors are calling this 'disruptive token extraction.'",
    "Clean sweep. Somewhere, a pitch deck just added twelve rocket emojis."
  ],
  partial: [
    "Two matched. The board approves a smaller but still morally confusing payout.",
    "Partial hit. You won enough tokens to justify another meaningless dashboard.",
    "Two symbols lined up. Finance calls this 'pre-revenue excellence.'"
  ],
  bust: [
    "No match. The market has decided your prompt was not enterprise-grade.",
    "Miss. Those tokens have been reinvested into a keynote nobody asked for.",
    "Bust. The model suggests spending even more for better vibes."
  ],
  hallucination: [
    "Hallucination detected. A consultant invoices you for synthetic wisdom.",
    "The reel said Hallucination, so legal needs another compliance offsite.",
    "Oops, hallucination tax. Please deposit tokens and pretend this is innovation."
  ]
};

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function randomMessage(bucket) {
  const options = spinMessages[bucket];
  return options[Math.floor(Math.random() * options.length)];
}

function updateUI() {
  balanceElement.textContent = String(state.balance);
  spinCostElement.textContent = String(state.spinCost);
  lastPayoutElement.textContent = String(state.lastPayout);
}

function setMessage(text, tone) {
  messageElement.textContent = text;
  messageElement.classList.remove("win", "loss");

  if (tone) {
    messageElement.classList.add(tone);
  }
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts);
  const hasHallucination = results.includes("Hallucination");

  if (values.includes(3)) {
    return {
      payout: 90,
      message: `${randomMessage("jackpot")} +90 tokens.`,
      tone: "win"
    };
  }

  if (values.includes(2)) {
    const hallucinationPenalty = hasHallucination ? 10 : 0;
    const payout = 35 - hallucinationPenalty;

    return {
      payout,
      message: `${randomMessage("partial")} ${hallucinationPenalty ? "Hallucination tax applies." : ""} +${payout} tokens.`,
      tone: "win"
    };
  }

  if (hasHallucination) {
    return {
      payout: -12,
      message: `${randomMessage("hallucination")} -12 tokens.`,
      tone: "loss"
    };
  }

  return {
    payout: 0,
    message: `${randomMessage("bust")} +0 tokens.`,
    tone: "loss"
  };
}

function finishSpin(results) {
  const outcome = evaluateSpin(results);

  state.lastPayout = outcome.payout;
  state.balance = Math.max(0, state.balance + outcome.payout);
  state.spinning = false;

  updateUI();
  setMessage(outcome.message, outcome.tone);

  reelElements.forEach((element) => element.classList.remove("spinning"));
  spinButton.disabled = state.balance < state.spinCost;
}

function spin() {
  if (state.spinning || state.balance < state.spinCost) {
    return;
  }

  state.spinning = true;
  state.balance -= state.spinCost;
  state.lastPayout = 0;
  updateUI();

  spinButton.disabled = true;
  setMessage("Deploying premium stochastic inference. Please clap.", "");

  const results = reelElements.map(() => randomSymbol());

  reelElements.forEach((element, index) => {
    element.classList.add("spinning");

    const intervalId = window.setInterval(() => {
      element.textContent = randomSymbol();
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      element.textContent = results[index];

      if (index === reelElements.length - 1) {
        finishSpin(results);
      }
    }, 700 + index * 250);
  });
}

function claimFunding() {
  const bailout = 60 + Math.floor(Math.random() * 61);
  state.balance += bailout;
  updateUI();
  spinButton.disabled = false;
  setMessage(`A venture fund confused hype for traction. +${bailout} tokens.`, "win");
}

spinButton.addEventListener("click", spin);
autofillButton.addEventListener("click", claimFunding);

updateUI();
