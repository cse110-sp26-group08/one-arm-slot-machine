const symbols = [
  {
    name: "Prompt Leak",
    payout: 2,
    blurb: "A confidential prompt escaped into a keynote deck.",
  },
  {
    name: "GPU Smoke",
    payout: 3,
    blurb: "The cluster is warm, expensive, and spiritually exhausted.",
  },
  {
    name: "VC Buzzword",
    payout: 4,
    blurb: "Synergy found the deck before the product did.",
  },
  {
    name: "Hallucination",
    payout: 5,
    blurb: "Delivered with tone, confidence, and absolutely no basis.",
  },
  {
    name: "Terms Update",
    payout: 6,
    blurb: "The platform changed pricing in the middle of your sentence.",
  },
  {
    name: "Alignment Patch",
    payout: 8,
    blurb: "A reassuring label was added, so everything is fine now.",
  },
];

const premiumSinks = [
  {
    title: "Premium Thought Leadership Subscription",
    description: "Your winnings purchased a thread explaining that prompts are the new oil.",
    ratio: 0.45,
  },
  {
    title: "Enterprise Vibe Audit",
    description: "Consultants measured whether your chatbot feels expensive enough.",
    ratio: 0.55,
  },
  {
    title: "Founder's Emergency GPU Candle",
    description: "A ceremonial candle was lit to reduce latency through morale.",
    ratio: 0.35,
  },
  {
    title: "Synthetic Hype Retainer",
    description: "A branding agency promised to replace your roadmap with aura.",
    ratio: 0.5,
  },
  {
    title: "Autonomous Keynote Generator",
    description: "It made 84 slides and one useful point. The point was billable.",
    ratio: 0.4,
  },
];

const moodLines = [
  "Confidently hallucinating",
  "Pivoting to enterprise",
  "Rate-limited but optimistic",
  "Training on your attention span",
  "Seeking fresh token liquidity",
];

const state = {
  tokens: 120,
  bet: 15,
  spinning: false,
  streak: 0,
};

const reelElements = [
  document.getElementById("reel-0"),
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
];

const tokenCount = document.getElementById("token-count");
const betAmount = document.getElementById("bet-amount");
const machineMood = document.getElementById("machine-mood");
const roundMessage = document.getElementById("round-message");
const spendMessage = document.getElementById("spend-message");
const sinkTitle = document.getElementById("sink-title");
const sinkDescription = document.getElementById("sink-description");
const paytable = document.getElementById("paytable");
const spinButton = document.getElementById("spin-button");
const increaseBetButton = document.getElementById("increase-bet");
const decreaseBetButton = document.getElementById("decrease-bet");

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clampBet(nextBet) {
  return Math.max(5, Math.min(nextBet, 50));
}

function updateHud() {
  tokenCount.textContent = state.tokens;
  betAmount.textContent = state.bet;
  machineMood.textContent = randomItem(moodLines);
  spinButton.disabled = state.spinning || state.tokens < state.bet;
  increaseBetButton.disabled = state.spinning || state.bet >= 50;
  decreaseBetButton.disabled = state.spinning || state.bet <= 5;
}

function renderPaytable() {
  paytable.innerHTML = "";

  symbols.forEach((symbol) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${symbol.name} x3 pays ${symbol.payout}x bet</strong>
      <span>${symbol.blurb}</span>
    `;
    paytable.appendChild(item);
  });
}

function setReelValue(index, value) {
  reelElements[index].textContent = value.name;
}

function clearCelebration() {
  reelElements.forEach((element) => element.classList.remove("celebration"));
}

function evaluateSpin(result) {
  const [a, b, c] = result;

  if (a.name === b.name && b.name === c.name) {
    return {
      type: "jackpot",
      payout: state.bet * a.payout,
      message: `Jackpot. Three ${a.name}s. The machine has mistaken luck for product-market fit.`,
    };
  }

  if (a.name === b.name || b.name === c.name || a.name === c.name) {
    return {
      type: "pair",
      payout: Math.floor(state.bet * 1.5),
      message: "A matching pair. Investors are calling this traction.",
    };
  }

  return {
    type: "loss",
    payout: 0,
    message: "Nothing aligned. The roadmap now includes a pivot and a manifesto.",
  };
}

function spendWinnings(payout) {
  if (payout <= 0) {
    sinkTitle.textContent = "No premium spend this round";
    sinkDescription.textContent = "Your loss has been converted directly into character development.";
    spendMessage.textContent = "No mandatory token spend. Even the grift needs a win condition.";
    return;
  }

  const sink = randomItem(premiumSinks);
  const spend = Math.max(1, Math.floor(payout * sink.ratio));
  state.tokens = Math.max(0, state.tokens - spend);

  sinkTitle.textContent = sink.title;
  sinkDescription.textContent = sink.description;
  spendMessage.textContent = `You won ${payout} tokens, then spent ${spend} on ${sink.title.toLowerCase()}. Net gain: ${payout - spend}.`;
}

function finishSpin(result) {
  const outcome = evaluateSpin(result);
  clearCelebration();

  if (outcome.type !== "loss") {
    state.tokens += outcome.payout;
    state.streak += 1;
    reelElements.forEach((element) => element.classList.add("celebration"));
  } else {
    state.streak = 0;
  }

  roundMessage.textContent = outcome.message;
  spendWinnings(outcome.payout);

  if (state.tokens < 5) {
    state.tokens += 40;
    roundMessage.textContent += " Emergency bailout: 40 pity tokens from the innovation fund.";
  }

  state.spinning = false;
  updateHud();
}

function spin() {
  if (state.spinning || state.tokens < state.bet) {
    return;
  }

  state.spinning = true;
  state.tokens -= state.bet;
  roundMessage.textContent = "Deploying capital into the probability engine...";
  spendMessage.textContent = "The machine is preparing several regrettable invoices.";
  updateHud();
  clearCelebration();

  const result = reelElements.map(() => randomItem(symbols));

  reelElements.forEach((element, index) => {
    element.classList.add("spinning");

    const interval = window.setInterval(() => {
      setReelValue(index, randomItem(symbols));
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      element.classList.remove("spinning");
      setReelValue(index, result[index]);

      if (index === reelElements.length - 1) {
        finishSpin(result);
      }
    }, 700 + index * 250);
  });
}

increaseBetButton.addEventListener("click", () => {
  state.bet = clampBet(state.bet + 5);
  updateHud();
});

decreaseBetButton.addEventListener("click", () => {
  state.bet = clampBet(state.bet - 5);
  updateHud();
});

spinButton.addEventListener("click", spin);

renderPaytable();
updateHud();
