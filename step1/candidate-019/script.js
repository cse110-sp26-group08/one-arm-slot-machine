const STORAGE_KEY = "candidate-019-token-doom-casino";

const symbols = ["BOT", "TOKEN", "HYPE", "GPU", "PIVOT", "VC", "404", "SLIDE", "MOAT", "AGENT"];

const moods = [
  "Smug",
  "Pitchy",
  "Overfit",
  "Seeded",
  "Unreasonably bullish",
  "Benchmarking itself",
];

const lines = {
  intro:
    "Welcome to the casino. Every spin converts your optimism into product messaging.",
  jackpot: [
    "Three of a kind. The machine is calling this artificial general revenue.",
    "Jackpot. You won tokens, which will now be immediately spent on a deck full of impossible claims.",
    "Triple match. Somewhere a chatbot just described this as a paradigm shift.",
  ],
  botJackpot: [
    "Triple BOT. The machine now believes it deserves a keynote and a defense contract.",
    "BOT BOT BOT. Incredible. You unlocked premium synthetic confidence.",
  ],
  pair: [
    "A pair. The machine insists this validates the roadmap.",
    "Two matched. Barely a win, but the dashboard already says breakout traction.",
    "Pair detected. Enough tokens to fund one more doomed AI feature.",
  ],
  loss: [
    "No payout. Your tokens have been reinvested into a vague claims generator.",
    "Miss. The machine recommends adding the word agentic to everything.",
    "Nothing landed. Good news: marketing can still call it a pilot.",
  ],
  broke: [
    "Wallet empty. Please acquire fresh tokens from a board member who loves the word disruption.",
    "Out of tokens. The machine recommends a strategic pivot into premium vibes.",
  ],
  reset: [
    "Fresh tokens secured. The machine has resumed pretending certainty is a feature.",
  ],
  error404: [
    "A 404 appeared. The answer is gone, but the invoice remains very real.",
  ],
};

const state = loadState();

const balanceEl = document.querySelector("#balance");
const betDisplayEl = document.querySelector("#bet-display");
const machineMoodEl = document.querySelector("#machine-mood");
const messageEl = document.querySelector("#message");
const historyEl = document.querySelector("#history");
const historyTemplate = document.querySelector("#history-item-template");
const betSlider = document.querySelector("#bet-slider");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const voiceToggle = document.querySelector("#voice-toggle");
const machineEl = document.querySelector(".machine");
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
voiceToggle.addEventListener("click", toggleVoice);

async function spin() {
  if (state.spinning) {
    return;
  }

  if (state.balance < state.bet) {
    state.message = pick(lines.broke);
    state.mood = "Bootstrapped";
    pulseMachine(false);
    vibrate([80, 40, 80]);
    speak(state.message);
    render();
    return;
  }

  state.spinning = true;
  state.balance -= state.bet;
  state.mood = pick(moods);
  render();

  const result = [];

  for (const [index, reel] of reels.entries()) {
    const symbol = await animateReel(reel, 750 + index * 180);
    result.push(symbol);
  }

  const outcome = settle(result, state.bet);
  state.balance += outcome.payout;
  state.lastResult = result;
  state.message = outcome.message;
  state.mood = outcome.mood;
  state.history.unshift({
    result: result.join(" / "),
    summary: outcome.summary,
  });
  state.history = state.history.slice(0, 8);
  state.spinning = false;

  pulseMachine(outcome.payout > state.bet);
  vibrate(outcome.payout > 0 ? [70, 30, 120] : [140]);
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
  const botJackpot = result.every((symbol) => symbol === "BOT");
  const has404 = result.includes("404");

  if (botJackpot) {
    const payout = bet * 7;
    return {
      payout,
      message: pick(lines.botJackpot),
      mood: "Insufferable",
      summary: `Triple BOT paid ${payout} tokens and summoned synthetic arrogance.`,
    };
  }

  if (triple) {
    const payout = bet * 5;
    return {
      payout,
      message: pick(lines.jackpot),
      mood: "Victorious",
      summary: `Three matching symbols paid ${payout} tokens.`,
    };
  }

  if (pair) {
    const payout = bet * 2;
    return {
      payout,
      message: pick(lines.pair),
      mood: "Validated",
      summary: `A pair paid ${payout} tokens.`,
    };
  }

  if (has404) {
    return {
      payout: 0,
      message: lines.error404[0],
      mood: "Confidently incorrect",
      summary: "404 detected. No payout, maximum audacity.",
    };
  }

  return {
    payout: 0,
    message: pick(lines.loss),
    mood: "Fundraising",
    summary: "No payout. The machine thanked you for donating tokens to hype.",
  };
}

function resetGame() {
  state.balance = 180;
  state.bet = 15;
  state.mood = "Smug";
  state.message = lines.reset[0];
  state.history = [];
  state.lastResult = ["BOT", "TOKEN", "HYPE"];
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
  betDisplayEl.textContent = String(state.bet);
  machineMoodEl.textContent = state.mood;
  messageEl.textContent = state.message;
  spinButton.disabled = state.spinning;
  spinButton.textContent = state.spinning ? "Generating..." : "Spin The Model";
  voiceToggle.textContent = state.voiceEnabled ? "Announcer On" : "Announcer Off";
  voiceToggle.setAttribute("aria-pressed", String(state.voiceEnabled));

  const display = state.spinning ? reels.map((reel) => reel.textContent) : state.lastResult;
  reels.forEach((reel, index) => {
    reel.textContent = display[index];
  });

  historyEl.innerHTML = "";

  if (state.history.length === 0) {
    const item = document.createElement("li");
    item.className = "history-item";
    item.innerHTML =
      "<strong>No spin propaganda yet.</strong><span>The machine is waiting for tokens and an excuse.</span>";
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
    balance: 180,
    bet: 15,
    mood: "Smug",
    message: lines.intro,
    history: [],
    lastResult: ["BOT", "TOKEN", "HYPE"],
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
      mood: state.mood,
      message: state.message,
      history: state.history,
      lastResult: state.lastResult,
      voiceEnabled: state.voiceEnabled,
    })
  );
}

function animateReel(reel, duration) {
  return new Promise((resolve) => {
    const start = performance.now();
    let current = pick(symbols);

    function tick(now) {
      if (now - start >= duration) {
        reel.textContent = current;
        resolve(current);
        return;
      }

      current = pick(symbols);
      reel.textContent = current;
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function pulseMachine(win) {
  machineEl.classList.remove("is-winning", "is-losing");
  machineEl.classList.add(win ? "is-winning" : "is-losing");
  window.setTimeout(() => {
    machineEl.classList.remove("is-winning", "is-losing");
  }, 900);
}

function speak(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.72;
  utterance.volume = 0.85;
  window.speechSynthesis.speak(utterance);
}

function vibrate(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}
