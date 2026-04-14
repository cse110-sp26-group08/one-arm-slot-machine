const SYMBOLS = [
  { icon: "BOT", label: "Reply generated from vibes" },
  { icon: "404", label: "Source missing with confidence" },
  { icon: "GPU", label: "Premium heat generator" },
  { icon: "COPE", label: "Prompt engineer self-care" },
  { icon: "VC", label: "Funding before revenue" },
  { icon: "SLOP", label: "Bulk content deployment" },
  { icon: "LOL", label: "Ethics board on vacation" }
];

const MOODS = ["Cocky", "Rate-Limited", "Buzzwordy", "Defensive", "Monetized"];
const STORAGE_KEY = "token-extraction-casino-state";
const STARTING_TOKENS = 180;
const SPIN_COST = 25;

const state = {
  tokens: STARTING_TOKENS,
  spins: 0,
  spinning: false
};

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenCount = document.getElementById("token-count");
const aiMood = document.getElementById("ai-mood");
const status = document.getElementById("status");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const hypeValue = document.getElementById("hype-value");
const realityValue = document.getElementById("reality-value");
const hypeFill = document.getElementById("hype-fill");
const realityFill = document.getElementById("reality-fill");
const eventFeed = document.getElementById("event-feed");

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tokens: state.tokens,
      spins: state.spins
    })
  );
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (typeof parsed.tokens === "number" && typeof parsed.spins === "number") {
      state.tokens = parsed.tokens;
      state.spins = parsed.spins;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function addFeedEntry(message, tone = "system") {
  const item = document.createElement("li");
  const prefix = tone === "win" ? "Jackpot" : tone === "loss" ? "Burn" : "System";
  item.innerHTML = `<strong>${prefix}:</strong> ${message}`;
  eventFeed.prepend(item);

  while (eventFeed.children.length > 7) {
    eventFeed.removeChild(eventFeed.lastChild);
  }
}

function updateDashboard() {
  tokenCount.textContent = String(state.tokens);

  const hype = Math.min(99, 76 + state.spins * 4);
  const reality = Math.max(8, 61 - state.spins * 5 + Math.floor(state.tokens / 30));

  hypeValue.textContent = `${hype}%`;
  realityValue.textContent = `${reality}%`;
  hypeFill.style.width = `${hype}%`;
  realityFill.style.width = `${reality}%`;
  aiMood.textContent = MOODS[Math.min(MOODS.length - 1, Math.floor(state.spins / 2))];

  spinButton.disabled = state.spinning || state.tokens < SPIN_COST;
}

function evaluateSpin(results) {
  const [a, b, c] = results.map((result) => result.icon);

  if (a === b && b === c) {
    if (a === "SLOP") {
      return {
        reward: 140,
        tone: "win",
        message: "Triple SLOP. The algorithm mistook quantity for quality and paid you anyway."
      };
    }

    return {
      reward: 95,
      tone: "win",
      message: `Three ${a}s. A startup just licensed your nonsense as enterprise automation.`
    };
  }

  if (a === b || b === c || a === c) {
    return {
      reward: 40,
      tone: "win",
      message: "Two symbols matched. Investors saw the demo before the bug did."
    };
  }

  if (results.some((result) => result.icon === "VC")) {
    return {
      reward: 15,
      tone: "system",
      message: "A VC token appeared, which counts as revenue if nobody asks follow-up questions."
    };
  }

  return {
    reward: 0,
    tone: "loss",
    message: "Nothing matched. Your tokens were reallocated to a chatbot with a podcast."
  };
}

function animateReels(finalResults) {
  return Promise.all(
    reelElements.map((reel, index) => new Promise((resolve) => {
      reel.classList.add("spinning");

      const interval = window.setInterval(() => {
        reel.textContent = randomItem(SYMBOLS).icon;
      }, 85);

      window.setTimeout(() => {
        window.clearInterval(interval);
        reel.textContent = finalResults[index].icon;
        reel.classList.remove("spinning");
        resolve();
      }, 520 + index * 260);
    }))
  );
}

async function handleSpin() {
  if (state.spinning || state.tokens < SPIN_COST) {
    return;
  }

  state.spinning = true;
  state.tokens -= SPIN_COST;
  state.spins += 1;
  updateDashboard();

  status.textContent = "Uploading your dignity to the cloud and pricing it per request...";

  const results = Array.from({ length: 3 }, () => randomItem(SYMBOLS));
  await animateReels(results);

  const outcome = evaluateSpin(results);
  state.tokens += outcome.reward;
  state.spinning = false;
  updateDashboard();
  saveState();

  const net = outcome.reward - SPIN_COST;
  status.textContent = outcome.message;
  addFeedEntry(`${outcome.message} Net ${net >= 0 ? "+" : ""}${net} tokens.`, outcome.tone);

  if (state.tokens < SPIN_COST) {
    status.textContent = "Wallet exhausted. Please secure more tokens or one extremely gullible board member.";
    addFeedEntry("Spin privileges paused due to a severe shortage of imaginary AI budget.", "loss");
  }
}

function handleReset() {
  state.tokens = STARTING_TOKENS;
  state.spins = 0;
  state.spinning = false;
  reelElements.forEach((reel) => {
    reel.textContent = "BOT";
    reel.classList.remove("spinning");
  });

  localStorage.removeItem(STORAGE_KEY);
  updateDashboard();
  status.textContent = "Wallet reset. The grift begins anew.";
  addFeedEntry("A fresh round of tokens has been issued to support responsible nonsense.");
}

spinButton.addEventListener("click", handleSpin);
resetButton.addEventListener("click", handleReset);

loadState();
updateDashboard();
addFeedEntry(`Casino online. Restored ${state.tokens} tokens for continued experimentation.`);
