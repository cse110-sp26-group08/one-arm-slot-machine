const SYMBOLS = [
  { icon: "BOT", label: "autocomplete swagger" },
  { icon: "GPU", label: "compute bill thunder" },
  { icon: "SLOP", label: "mass-produced content fog" },
  { icon: "COPE", label: "prompt engineer resilience" },
  { icon: "VC", label: "pre-revenue applause" },
  { icon: "404", label: "citation unavailable" },
  { icon: "AGI?", label: "deck-driven prophecy" }
];

const EXPENSES = [
  "enterprise vibe-check dashboard",
  "hallucination containment retrofit",
  "premium GPU sauna credits",
  "thought leadership repackager",
  "board-approved prompt garnish",
  "sentient branding refresh",
  "ethics-adjacent pilot program"
];

const EGOS = ["Unchecked", "Buzzing", "Evangelizing", "Unimpressed by facts", "Funded by slides"];
const STORAGE_KEY = "token-velocity-machine-state";
const STARTING_WALLET = 240;
const SPIN_COST = 30;

const state = {
  wallet: STARTING_WALLET,
  spins: 0,
  burned: 0,
  spinning: false,
  lastPrize: "No token shower yet"
};

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const walletCount = document.getElementById("wallet-count");
const egoMeter = document.getElementById("ego-meter");
const status = document.getElementById("status");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const burnRateLabel = document.getElementById("burn-rate-label");
const truthLabel = document.getElementById("truth-label");
const burnRateFill = document.getElementById("burn-rate-fill");
const truthFill = document.getElementById("truth-fill");
const lastPrize = document.getElementById("last-prize");
const burnedTotal = document.getElementById("burned-total");
const feedList = document.getElementById("feed-list");

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    wallet: state.wallet,
    spins: state.spins,
    burned: state.burned,
    lastPrize: state.lastPrize
  }));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (typeof parsed.wallet === "number") {
      state.wallet = parsed.wallet;
    }
    if (typeof parsed.spins === "number") {
      state.spins = parsed.spins;
    }
    if (typeof parsed.burned === "number") {
      state.burned = parsed.burned;
    }
    if (typeof parsed.lastPrize === "string") {
      state.lastPrize = parsed.lastPrize;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function addFeedEntry(kind, message) {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${kind}:</strong> ${message}`;
  feedList.prepend(item);

  while (feedList.children.length > 8) {
    feedList.removeChild(feedList.lastChild);
  }
}

function updateDashboard() {
  walletCount.textContent = String(state.wallet);
  lastPrize.textContent = state.lastPrize;
  burnedTotal.textContent = `${state.burned} tokens`;

  const burnRate = Math.min(99, 42 + state.spins * 5 + Math.floor(state.burned / 40));
  const truthAlignment = Math.max(7, 68 - state.spins * 4 + Math.floor(state.wallet / 60));

  burnRateLabel.textContent = `${burnRate}%`;
  truthLabel.textContent = `${truthAlignment}%`;
  burnRateFill.style.width = `${burnRate}%`;
  truthFill.style.width = `${truthAlignment}%`;
  egoMeter.textContent = EGOS[Math.min(EGOS.length - 1, Math.floor(state.spins / 2))];

  spinButton.disabled = state.spinning || state.wallet < SPIN_COST;
}

function animateReels(results) {
  return Promise.all(
    reelElements.map((reel, index) => new Promise((resolve) => {
      reel.classList.add("spinning");

      const intervalId = window.setInterval(() => {
        reel.textContent = randomItem(SYMBOLS).icon;
      }, 80);

      window.setTimeout(() => {
        window.clearInterval(intervalId);
        reel.textContent = results[index].icon;
        reel.classList.remove("spinning");
        resolve();
      }, 540 + index * 230);
    }))
  );
}

function getOutcome(results) {
  const icons = results.map((result) => result.icon);
  const [first, second, third] = icons;

  if (first === second && second === third) {
    if (first === "GPU") {
      return {
        reward: 120,
        summary: "Triple GPU. The cluster called it innovation and mailed you bonus tokens."
      };
    }

    return {
      reward: 95,
      summary: `Triple ${first}. A keynote audience mistook repetition for a breakthrough.`
    };
  }

  if (first === second || second === third || first === third) {
    return {
      reward: 50,
      summary: "Two reels aligned. That is more than enough evidence for a seed round."
    };
  }

  if (icons.includes("VC") && icons.includes("AGI?")) {
    return {
      reward: 25,
      summary: "VC plus AGI? The deck was unreadable, which made it irresistible."
    };
  }

  return {
    reward: 0,
    summary: "No match. The model spent everything drafting a LinkedIn manifesto."
  };
}

function spendWinnings(reward) {
  if (reward <= 0) {
    state.lastPrize = "No prize, only invoices";
    return {
      spent: 0,
      expense: "nothing was won, yet somehow morale still dropped"
    };
  }

  const spent = Math.max(10, Math.floor(reward * (0.45 + Math.random() * 0.35)));
  const expense = randomItem(EXPENSES);

  state.wallet -= spent;
  state.burned += spent;
  state.lastPrize = `${reward} won, ${spent} instantly spent on ${expense}`;

  return { spent, expense };
}

async function handleSpin() {
  if (state.spinning || state.wallet < SPIN_COST) {
    return;
  }

  state.spinning = true;
  state.wallet -= SPIN_COST;
  state.spins += 1;
  updateDashboard();

  status.textContent = "Routing your budget through an optimism engine...";

  const results = Array.from({ length: 3 }, () => randomItem(SYMBOLS));
  await animateReels(results);

  const outcome = getOutcome(results);
  state.wallet += outcome.reward;

  const spending = spendWinnings(outcome.reward);
  state.spinning = false;
  updateDashboard();
  saveState();

  if (outcome.reward > 0) {
    status.textContent = `${outcome.summary} You won ${outcome.reward} tokens, then burned ${spending.spent} on ${spending.expense}.`;
    addFeedEntry(
      "Jackpot Ops",
      `${outcome.summary} Prize ${outcome.reward}. Expense ${spending.spent} for ${spending.expense}.`
    );
  } else {
    status.textContent = outcome.summary;
    addFeedEntry("Loss Report", `${outcome.summary} Spin cost ${SPIN_COST} tokens.`);
  }

  if (state.wallet < SPIN_COST) {
    status.textContent = "Wallet depleted. The AI initiative now requires either new tokens or a less skeptical finance team.";
    addFeedEntry("Budget Alert", "Further spins blocked pending another heroic round of imaginary AI funding.");
  }
}

function handleReset() {
  state.wallet = STARTING_WALLET;
  state.spins = 0;
  state.burned = 0;
  state.spinning = false;
  state.lastPrize = "No token shower yet";

  reelElements.forEach((reel) => {
    reel.textContent = "BOT";
    reel.classList.remove("spinning");
  });

  localStorage.removeItem(STORAGE_KEY);
  updateDashboard();
  status.textContent = "Budget reset. The machine is once again prepared to convert hope into token exhaust.";
  addFeedEntry("System", "Fresh tokens allocated for another completely responsible AI experiment.");
}

spinButton.addEventListener("click", handleSpin);
resetButton.addEventListener("click", handleReset);

loadState();
updateDashboard();
addFeedEntry("System", `Machine online. Wallet restored with ${state.wallet} tokens.`);
