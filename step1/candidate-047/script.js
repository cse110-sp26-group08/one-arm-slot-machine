const SYMBOLS = [
  { icon: "BOT", meaning: "autocomplete ego" },
  { icon: "GPU", meaning: "server room fever dream" },
  { icon: "SLP", meaning: "industrial slop pipeline" },
  { icon: "404", meaning: "citation evaporated" },
  { icon: "PPT", meaning: "deck-driven intelligence" },
  { icon: "VC", meaning: "funding without brakes" },
  { icon: "AGI?", meaning: "questionable prophecy" }
];

const EXPENSES = [
  "a boardroom-ready hallucination deck",
  "premium GPU incense",
  "an enterprise prompt laundering suite",
  "a founder podcast rebrand",
  "compliance-flavored vaporware",
  "an emergency chatbot personality transplant",
  "executive optimism calibration"
];

const VIBES = [
  "Smug",
  "Pitching",
  "Overfit",
  "Astronomically confident",
  "Actively replacing common sense"
];

const STORAGE_KEY = "prompt-poverty-palace-state";
const STARTING_WALLET = 210;
const SPIN_COST = 35;

const state = {
  wallet: STARTING_WALLET,
  spins: 0,
  burned: 0,
  spinning: false,
  latestPrize: "No winnings yet",
  feed: []
};

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const walletElement = document.getElementById("wallet");
const vibeElement = document.getElementById("vibe");
const statusElement = document.getElementById("status");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const buzzwordLabel = document.getElementById("buzzword-label");
const buzzwordFill = document.getElementById("buzzword-fill");
const realityLabel = document.getElementById("reality-label");
const realityFill = document.getElementById("reality-fill");
const latestPrizeElement = document.getElementById("latest-prize");
const burnedTotalElement = document.getElementById("burned-total");
const feedElement = document.getElementById("feed");

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    wallet: state.wallet,
    spins: state.spins,
    burned: state.burned,
    latestPrize: state.latestPrize,
    feed: state.feed
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed.wallet === "number") {
      state.wallet = parsed.wallet;
    }
    if (typeof parsed.spins === "number") {
      state.spins = parsed.spins;
    }
    if (typeof parsed.burned === "number") {
      state.burned = parsed.burned;
    }
    if (typeof parsed.latestPrize === "string") {
      state.latestPrize = parsed.latestPrize;
    }
    if (Array.isArray(parsed.feed)) {
      state.feed = parsed.feed.slice(0, 8);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function renderFeed() {
  feedElement.innerHTML = "";

  state.feed.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${entry.title}:</strong> ${entry.message}`;
    feedElement.appendChild(item);
  });
}

function addFeedEntry(title, message) {
  state.feed.unshift({ title, message });
  state.feed = state.feed.slice(0, 8);
  renderFeed();
}

function updateDashboard() {
  walletElement.textContent = String(state.wallet);
  latestPrizeElement.textContent = state.latestPrize;
  burnedTotalElement.textContent = `${state.burned} tokens`;

  const buzzwordLevel = Math.min(98, 58 + state.spins * 4 + Math.floor(state.burned / 45));
  const realityLevel = Math.max(9, 72 - state.spins * 5 + Math.floor(state.wallet / 55));

  buzzwordLabel.textContent = `${buzzwordLevel}%`;
  realityLabel.textContent = `${realityLevel}%`;
  buzzwordFill.style.width = `${buzzwordLevel}%`;
  realityFill.style.width = `${realityLevel}%`;
  vibeElement.textContent = VIBES[Math.min(VIBES.length - 1, Math.floor(state.spins / 2))];

  spinButton.disabled = state.spinning || state.wallet < SPIN_COST;
}

function animateReels(finalSymbols) {
  return Promise.all(
    reelElements.map((reel, index) => new Promise((resolve) => {
      reel.classList.add("spinning");

      const intervalId = window.setInterval(() => {
        reel.textContent = randomItem(SYMBOLS).icon;
      }, 85);

      window.setTimeout(() => {
        window.clearInterval(intervalId);
        reel.textContent = finalSymbols[index].icon;
        reel.classList.remove("spinning");
        resolve();
      }, 600 + index * 220);
    }))
  );
}

function getOutcome(results) {
  const icons = results.map((result) => result.icon);
  const uniqueCount = new Set(icons).size;

  if (uniqueCount === 1) {
    if (icons[0] === "404") {
      return {
        reward: 120,
        summary: "Triple 404. The machine could not verify anything, so it declared the output premium."
      };
    }

    return {
      reward: 95,
      summary: `Triple ${icons[0]}. Repetition achieved the exact tone of thought leadership.`
    };
  }

  if (uniqueCount === 2) {
    return {
      reward: 55,
      summary: "Two reels matched. That is plenty of evidence for a product launch."
    };
  }

  if (icons.includes("VC") && icons.includes("AGI?")) {
    return {
      reward: 25,
      summary: "VC met AGI?. Nobody understood it, which made the valuation soar."
    };
  }

  return {
    reward: 0,
    summary: "No alignment. The model spent your budget rewording a mission statement."
  };
}

function spendReward(reward) {
  if (reward <= 0) {
    state.latestPrize = "No prize, just expensive confidence";
    return { spent: 0, expense: "nothing useful, somehow still billable" };
  }

  const spent = Math.max(12, Math.floor(reward * (0.5 + Math.random() * 0.25)));
  const expense = randomItem(EXPENSES);

  state.wallet -= spent;
  state.burned += spent;
  state.latestPrize = `${reward} won, ${spent} spent on ${expense}`;

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
  statusElement.textContent = "Feeding tokens into the strategic nonsense engine...";

  const results = Array.from({ length: 3 }, () => randomItem(SYMBOLS));
  await animateReels(results);

  const outcome = getOutcome(results);
  state.wallet += outcome.reward;

  const spending = spendReward(outcome.reward);
  state.spinning = false;
  updateDashboard();

  if (outcome.reward > 0) {
    statusElement.textContent =
      `${outcome.summary} You won ${outcome.reward} tokens and immediately burned ${spending.spent} on ${spending.expense}.`;
    addFeedEntry(
      "Prize Audit",
      `${outcome.summary} Reward ${outcome.reward}, auto-spend ${spending.spent} for ${spending.expense}.`
    );
  } else {
    statusElement.textContent = outcome.summary;
    addFeedEntry("Loss Report", `${outcome.summary} Spin cost ${SPIN_COST} tokens.`);
  }

  if (state.wallet < SPIN_COST) {
    statusElement.textContent =
      "Wallet drained. Further innovation requires more tokens or one adult in the room.";
    addFeedEntry("Budget Alert", "The machine has paused until fresh AI spending fantasies arrive.");
  }

  saveState();
}

function handleReset() {
  state.wallet = STARTING_WALLET;
  state.spins = 0;
  state.burned = 0;
  state.spinning = false;
  state.latestPrize = "No winnings yet";
  state.feed = [];

  reelElements.forEach((reel) => {
    reel.textContent = "BOT";
    reel.classList.remove("spinning");
  });

  localStorage.removeItem(STORAGE_KEY);
  statusElement.textContent =
    "Budget reset. The machine is ready to waste a fresh batch of AI tokens.";
  addFeedEntry("System", `Wallet restored to ${STARTING_WALLET} tokens for renewed algorithmic mischief.`);
  updateDashboard();
  saveState();
}

spinButton.addEventListener("click", handleSpin);
resetButton.addEventListener("click", handleReset);

loadState();
renderFeed();
updateDashboard();

if (state.feed.length === 0) {
  addFeedEntry("System", `Arcade online. Wallet loaded with ${state.wallet} tokens.`);
  saveState();
}
