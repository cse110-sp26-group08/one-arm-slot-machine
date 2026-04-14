const SYMBOLS = [
  { icon: "404", label: "Context not found" },
  { icon: "GPT", label: "Confident autocomplete" },
  { icon: "LAG", label: "Server thinking deeply" },
  { icon: "SEO", label: "Content farm dividend" },
  { icon: "BOT", label: "Synthetic enthusiasm" },
  { icon: "???", label: "Hallucination jackpot" },
  { icon: "VC", label: "Funding round flashback" }
];

const SPIN_COST = 15;
const STORAGE_KEY = "token-burner-9000-state";

const state = {
  tokens: 120,
  spinning: false,
  spinCount: 0
};

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const tokenBalance = document.getElementById("token-balance");
const promptQuality = document.getElementById("prompt-quality");
const gpuMood = document.getElementById("gpu-mood");
const statusBanner = document.getElementById("status-banner");
const spinButton = document.getElementById("spin-button");
const eventLog = document.getElementById("event-log");
const hallucinationValue = document.getElementById("hallucination-value");
const optimismValue = document.getElementById("optimism-value");
const hallucinationFill = document.getElementById("hallucination-fill");
const optimismFill = document.getElementById("optimism-fill");

const promptQualityStates = ["Adequate", "Overfit", "Chaotic", "Venture-backed", "Unreadable"];
const gpuMoods = ["Smug", "Overclocked", "Judgmental", "Mildly expensive", "Rate limited"];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tokens: state.tokens,
      spinCount: state.spinCount
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
    if (typeof parsed.tokens === "number" && typeof parsed.spinCount === "number") {
      state.tokens = parsed.tokens;
      state.spinCount = parsed.spinCount;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateDashboard() {
  tokenBalance.textContent = String(state.tokens);

  const hallucination = Math.min(96, 18 + state.spinCount * 7 + Math.max(0, 90 - state.tokens) / 3);
  const optimism = Math.max(11, 92 - state.spinCount * 6 + Math.max(0, state.tokens - 120) / 4);

  hallucinationValue.textContent = `${Math.round(hallucination)}%`;
  optimismValue.textContent = `${Math.round(optimism)}%`;
  hallucinationFill.style.width = `${hallucination}%`;
  optimismFill.style.width = `${optimism}%`;

  promptQuality.textContent = promptQualityStates[Math.min(promptQualityStates.length - 1, Math.floor(state.spinCount / 2))];
  gpuMood.textContent = gpuMoods[Math.min(gpuMoods.length - 1, Math.floor(state.spinCount / 3))];

  spinButton.disabled = state.spinning || state.tokens < SPIN_COST;
}

function addLog(message, tone = "neutral") {
  const item = document.createElement("li");
  const prefix = tone === "win" ? "Payout" : tone === "loss" ? "Loss" : "System";
  item.innerHTML = `<strong>${prefix}:</strong> ${message}`;
  eventLog.prepend(item);

  while (eventLog.children.length > 6) {
    eventLog.removeChild(eventLog.lastChild);
  }
}

function setStatus(message) {
  statusBanner.textContent = message;
}

function determinePayout(results) {
  const [a, b, c] = results.map((result) => result.icon);

  if (a === b && b === c) {
    if (a === "???") {
      return {
        reward: 120,
        tone: "win",
        message: "Triple hallucination. The machine invented a feature and investors loved it."
      };
    }

    return {
      reward: 70,
      tone: "win",
      message: `Three ${a}s. Congratulations on monetizing recycled internet vapor.`
    };
  }

  if (a === b || b === c || a === c) {
    return {
      reward: 30,
      tone: "win",
      message: "Two symbols matched. The demo worked long enough for a keynote."
    };
  }

  if (results.some((result) => result.icon === "VC")) {
    return {
      reward: 10,
      tone: "neutral",
      message: "A venture capitalist wandered by and called it disruptive."
    };
  }

  return {
    reward: 0,
    tone: "loss",
    message: "No match. Your tokens were converted directly into heat and branding."
  };
}

function animateReels(finalResults) {
  return Promise.all(
    reelElements.map((reel, index) => new Promise((resolve) => {
      reel.classList.add("spinning");

      const interval = setInterval(() => {
        reel.textContent = randomItem(SYMBOLS).icon;
      }, 90);

      const stopDelay = 450 + index * 320;
      window.setTimeout(() => {
        clearInterval(interval);
        reel.textContent = finalResults[index].icon;
        reel.classList.remove("spinning");
        resolve();
      }, stopDelay);
    }))
  );
}

async function handleSpin() {
  if (state.spinning || state.tokens < SPIN_COST) {
    return;
  }

  state.spinning = true;
  state.tokens -= SPIN_COST;
  state.spinCount += 1;
  updateDashboard();
  setStatus("Processing prompt... measuring confidence... ignoring edge cases...");

  const results = Array.from({ length: 3 }, () => randomItem(SYMBOLS));
  await animateReels(results);

  const outcome = determinePayout(results);
  state.tokens += outcome.reward;
  updateDashboard();
  saveState();

  setStatus(outcome.message);
  addLog(`${outcome.message} Net change: ${outcome.reward - SPIN_COST >= 0 ? "+" : ""}${outcome.reward - SPIN_COST} tokens.`, outcome.tone);

  if (state.tokens < SPIN_COST) {
    setStatus("You are out of tokens. Please acquire fresh funding or lower your inference costs.");
    addLog("Spin access revoked due to a tragic shortage of pretend compute credits.", "loss");
  }

  state.spinning = false;
  updateDashboard();
}

spinButton.addEventListener("click", handleSpin);

loadState();
addLog("Machine booted. Safety team unavailable. Please spin responsibly.");
addLog(`State restored with ${state.tokens} tokens and a suspicious amount of confidence.`);
updateDashboard();
