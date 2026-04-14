const STORAGE_KEY = "candidate-018-token-extraction-engine";

const symbols = [
  "GPU",
  "PROMPT",
  "TOKEN",
  "COPE",
  "AGENT",
  "404",
  "DEMO",
  "PITCH",
  "DEBT",
  "HYPE",
];

const pressureReadings = [
  "Seed-stage smug",
  "Compute-hungry",
  "Demo-day unstable",
  "Prompt-positive",
  "Pivot-adjacent",
];

const machineLines = {
  jackpot: [
    "Triple match. The machine calls this recurring revenue and immediately starts a keynote.",
    "Jackpot. You won tokens and lost all remaining immunity to buzzwords.",
    "Three of a kind. Somewhere an AI executive just whispered, 'this changes everything.'",
  ],
  gpuJackpot: [
    "Triple GPU. The machine is now unbearably convinced it has achieved consciousness and margin expansion.",
    "GPU jackpot. Congratulations on winning enough tokens to fund six more terrible demos.",
  ],
  pair: [
    "A pair. Not impressive, but the dashboard insists momentum is building.",
    "Two matched. The machine describes this as strong tokenomics, which feels legally vague.",
    "Small win. Enough tokens to keep the delusion hydrated.",
  ],
  loss: [
    "No payout. Your tokens have been safely converted into executive confidence.",
    "Miss. The machine suggests buying better prompts and worse financial advice.",
    "Nothing landed. This is being reclassified as a learning investment.",
    "Loss detected. Good news: the machine can still spin a narrative.",
  ],
  broke: [
    "Wallet empty. Please secure fresh funding from someone who says 'distribution moat' a lot.",
    "Out of tokens. The machine recommends an emergency pivot into enterprise vibes.",
  ],
  reset: [
    "Fresh capital injected. The machine has resumed its normal levels of arrogance.",
  ],
};

const state = loadState();

const balanceEl = document.querySelector("#balance");
const wagerEl = document.querySelector("#wager");
const pressureEl = document.querySelector("#pressure");
const messageEl = document.querySelector("#message");
const historyEl = document.querySelector("#history");
const betSlider = document.querySelector("#bet-slider");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const voiceButton = document.querySelector("#voice-button");
const cabinet = document.querySelector(".cabinet");
const historyTemplate = document.querySelector("#history-item-template");
const reels = [...document.querySelectorAll(".reel")];

betSlider.value = String(state.bet);
render();

betSlider.addEventListener("input", () => {
  state.bet = Number(betSlider.value);
  saveState();
  render();
});

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);
voiceButton.addEventListener("click", toggleVoice);

async function spin() {
  if (state.spinning) {
    return;
  }

  if (state.balance < state.bet) {
    state.message = pick(machineLines.broke);
    state.pressure = "Bootstrapped panic";
    flashCabinet(false);
    vibrate([80, 30, 80]);
    speak(state.message);
    render();
    return;
  }

  state.spinning = true;
  state.balance -= state.bet;
  state.pressure = pick(pressureReadings);
  render();

  const result = [];

  for (const [index, reel] of reels.entries()) {
    const symbol = await animateReel(reel, 700 + index * 180);
    result.push(symbol);
  }

  const outcome = settle(result, state.bet);
  state.balance += outcome.payout;
  state.lastResult = result;
  state.message = outcome.message;
  state.pressure = outcome.pressure;
  state.history.unshift({
    result: result.join(" / "),
    summary: outcome.summary,
  });
  state.history = state.history.slice(0, 7);
  state.spinning = false;

  flashCabinet(outcome.payout > state.bet);
  vibrate(outcome.payout > 0 ? [60, 40, 120] : [120]);
  speak(outcome.message);
  saveState();
  render();
}

function settle(result, bet) {
  const counts = result.reduce((accumulator, symbol) => {
    accumulator[symbol] = (accumulator[symbol] || 0) + 1;
    return accumulator;
  }, {});

  const values = Object.values(counts);
  const triple = values.includes(3);
  const pair = values.includes(2);
  const gpuJackpot = result.every((symbol) => symbol === "GPU");
  const has404 = result.includes("404");

  if (gpuJackpot) {
    const payout = bet * 8;
    return {
      payout,
      message: pick(machineLines.gpuJackpot),
      pressure: "Silicon euphoria",
      summary: `Triple GPU paid ${payout} tokens.`,
    };
  }

  if (triple) {
    const payout = bet * 6;
    return {
      payout,
      message: pick(machineLines.jackpot),
      pressure: "Series A delusion",
      summary: `Three of a kind paid ${payout} tokens.`,
    };
  }

  if (pair) {
    const payout = bet * 2;
    return {
      payout,
      message: pick(machineLines.pair),
      pressure: "Cautiously overfunded",
      summary: `Pair paid ${payout} tokens.`,
    };
  }

  if (has404) {
    return {
      payout: 0,
      message: "A 404 appeared. The machine lost the answer but kept the invoice.",
      pressure: "Error-positive",
      summary: "404 detected. Confidence remained high, payout remained zero.",
    };
  }

  return {
    payout: 0,
    message: pick(machineLines.loss),
    pressure: "Monetizing your optimism",
    summary: "No payout. The machine thanked you for the burn.",
  };
}

function resetGame() {
  state.balance = 240;
  state.bet = 20;
  state.pressure = "Seed-stage smug";
  state.message = machineLines.reset[0];
  state.history = [];
  state.lastResult = ["PROMPT", "TOKEN", "COPE"];
  state.spinning = false;
  betSlider.value = String(state.bet);
  saveState();
  render();
}

function toggleVoice() {
  state.voiceEnabled = !state.voiceEnabled;

  if (!state.voiceEnabled && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  saveState();
  render();
}

function render() {
  balanceEl.textContent = String(state.balance);
  wagerEl.textContent = String(state.bet);
  pressureEl.textContent = state.pressure;
  messageEl.textContent = state.message;
  spinButton.disabled = state.spinning;
  spinButton.textContent = state.spinning ? "Burning..." : "Burn Tokens";
  voiceButton.setAttribute("aria-pressed", String(state.voiceEnabled));
  voiceButton.textContent = state.voiceEnabled ? "Announcer On" : "Announcer Off";

  const display = state.spinning ? reels.map((reel) => reel.textContent) : state.lastResult;
  reels.forEach((reel, index) => {
    reel.textContent = display[index];
  });

  historyEl.innerHTML = "";

  if (state.history.length === 0) {
    const item = document.createElement("li");
    item.className = "history-item";
    item.innerHTML =
      "<strong>No catastrophic spins yet.</strong><span>The machine is conserving smugness for later.</span>";
    historyEl.append(item);
    return;
  }

  state.history.forEach((entry) => {
    const item = historyTemplate.content.firstElementChild.cloneNode(true);
    item.innerHTML = `<strong>${entry.result}</strong><span>${entry.summary}</span>`;
    historyEl.append(item);
  });
}

function loadState() {
  const fallback = {
    balance: 240,
    bet: 20,
    pressure: "Seed-stage smug",
    message:
      "Welcome, founder. The machine is ready to convert certainty into ash and call it a platform strategy.",
    history: [],
    lastResult: ["PROMPT", "TOKEN", "COPE"],
    spinning: false,
    voiceEnabled: false,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...fallback, ...saved, spinning: false };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      balance: state.balance,
      bet: state.bet,
      pressure: state.pressure,
      message: state.message,
      history: state.history,
      lastResult: state.lastResult,
      voiceEnabled: state.voiceEnabled,
    })
  );
}

async function animateReel(reel, duration) {
  const start = performance.now();
  let current = pick(symbols);

  while (performance.now() - start < duration) {
    current = pick(symbols);
    reel.textContent = current;
    reel.animate(
      [
        { transform: "translateY(-10px) scale(0.98)", opacity: 0.45 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      { duration: 120, easing: "ease-out" }
    );
    await delay(90);
  }

  reel.textContent = current;
  return current;
}

function speak(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.03;
  utterance.pitch = 0.82;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}

function flashCabinet(isWin) {
  cabinet.classList.remove("flash-win", "flash-loss");
  void cabinet.offsetWidth;
  cabinet.classList.add(isWin ? "flash-win" : "flash-loss");
}

function vibrate(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
