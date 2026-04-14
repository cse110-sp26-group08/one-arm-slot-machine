const symbols = [
  { icon: "GPU", weight: 3 },
  { icon: "404", weight: 3 },
  { icon: "LOL", weight: 3 },
  { icon: "BOT", weight: 2 },
  { icon: "COPE", weight: 2 },
  { icon: "HYPE", weight: 2 },
  { icon: "SPAM", weight: 2 },
  { icon: "MOON", weight: 1 }
];

const moods = ["Smug", "Defensive", "Overfit", "Hallucinating", "Pivoting"];
const roastLines = {
  jackpot: [
    "Three of a kind. The machine calls this 'seed funding' and takes credit.",
    "Jackpot. Your deck is now 90% gradients and 10% buzzwords.",
    "Massive win. Somewhere, an AI keynote just added six useless slides."
  ],
  triple: [
    "Clean sweep. The model is calling you a visionary by pure autocomplete.",
    "Triple match. Congratulations on inventing a worse calculator."
  ],
  pair: [
    "Pair landed. The machine refunds enough tokens for one more overconfident demo.",
    "Small win. Finance calls this 'positive tokenomics,' which is embarrassing."
  ],
  loss: [
    "No match. The AI spent your tokens on a keynote with the word 'agentic' 42 times.",
    "Bust. Your prompt budget has been redirected to synthetic thought leadership.",
    "Rough spin. The model says to try again after a strategic rebrand."
  ],
  broke: [
    "Wallet empty. The machine suggests pivoting to crypto and calling it resilience.",
    "You are out of tokens. Time to sell a course on prompt manifestation."
  ]
};

const state = {
  tokens: 120,
  cost: 15,
  spinning: false,
  hype: 24
};

const reelElements = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

const tokenBalance = document.getElementById("tokenBalance");
const spinCost = document.getElementById("spinCost");
const aiMood = document.getElementById("aiMood");
const statusMessage = document.getElementById("statusMessage");
const hypeBar = document.getElementById("hypeBar");
const spinButton = document.getElementById("spinButton");
const autospinButton = document.getElementById("autospinButton");

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedRoll() {
  const pool = symbols.flatMap((symbol) => Array(symbol.weight).fill(symbol.icon));
  return pickRandom(pool);
}

function updateUi() {
  tokenBalance.textContent = String(state.tokens);
  spinCost.textContent = String(state.cost);
  aiMood.textContent = pickRandom(moods);
  hypeBar.style.width = `${state.hype}%`;
  spinButton.disabled = state.spinning || state.tokens < state.cost;
  autospinButton.disabled = state.spinning || state.tokens < state.cost;
}

function setStatus(text) {
  statusMessage.textContent = text;
}

function scoreSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts).sort((a, b) => b - a);

  if (values[0] === 3) {
    const allMoon = results.every((item) => item === "MOON");
    return {
      payout: allMoon ? 140 : 70,
      message: pickRandom(allMoon ? roastLines.jackpot : roastLines.triple)
    };
  }

  if (values[0] === 2) {
    return {
      payout: 30,
      message: pickRandom(roastLines.pair)
    };
  }

  return {
    payout: 0,
    message: pickRandom(roastLines.loss)
  };
}

function animateReels(finalSymbols) {
  return Promise.all(
    reelElements.map((reel, index) => new Promise((resolve) => {
      reel.classList.remove("win");
      reel.classList.add("spinning");

      let ticks = 0;
      const interval = window.setInterval(() => {
        reel.textContent = weightedRoll();
        ticks += 1;

        if (ticks > 8 + index * 3) {
          window.clearInterval(interval);
          reel.textContent = finalSymbols[index];
          reel.classList.remove("spinning");
          resolve();
        }
      }, 90 + index * 40);
    }))
  );
}

async function spinOnce() {
  if (state.spinning || state.tokens < state.cost) {
    if (state.tokens < state.cost) {
      setStatus(pickRandom(roastLines.broke));
    }
    return;
  }

  state.spinning = true;
  state.tokens -= state.cost;
  state.hype = Math.min(100, state.hype + 10);
  updateUi();
  setStatus("Spinning up a fresh batch of premium synthetic confidence...");

  const results = [weightedRoll(), weightedRoll(), weightedRoll()];
  await animateReels(results);

  const outcome = scoreSpin(results);
  state.tokens += outcome.payout;
  state.hype = Math.max(8, Math.min(100, state.hype + (outcome.payout > 0 ? 6 : -12)));
  state.cost = Math.max(15, Math.min(40, 15 + Math.floor((120 - state.tokens) / 30) * 2));
  state.spinning = false;

  if (outcome.payout > 0) {
    reelElements.forEach((reel) => reel.classList.add("win"));
  }

  setStatus(`${outcome.message} Net ${outcome.payout - 15 >= 0 ? "+" : ""}${outcome.payout - 15} tokens.`);
  updateUi();

  if (state.tokens < state.cost) {
    setStatus(`${statusMessage.textContent} ${pickRandom(roastLines.broke)}`);
  }
}

async function autoSpin() {
  for (let count = 0; count < 3; count += 1) {
    if (state.tokens < state.cost) {
      break;
    }
    await spinOnce();
    await new Promise((resolve) => window.setTimeout(resolve, 220));
  }
}

spinButton.addEventListener("click", spinOnce);
autospinButton.addEventListener("click", autoSpin);

updateUi();
