const STORAGE_KEY = "candidate-020-token-laundromat-9000";

const symbols = ["BOT", "GPU", "SEED", "PIVOT", "AGENT", "404", "DECK", "TOKEN", "MOAT", "VIBE"];

const hypeLevels = [
  "Caffeinated",
  "Series A delirious",
  "Benchmark laundering",
  "Deck-maxxing",
  "Unreasonably agentic",
  "Pre-revenue majestic",
];

const copy = {
  intro:
    "Welcome back. Every pull converts ambition into a chart with suspicious axes.",
  jackpots: [
    "Three of a kind. Finance has renamed this sustainable tokenomics.",
    "Jackpot. The machine is already spending your winnings on a keynote with no demo.",
    "Triple match. Product calls this alignment. Accounting calls it smoke.",
  ],
  botJackpots: [
    "BOT BOT BOT. Tremendous. The machine just promoted itself to Chief Vision Officer.",
    "Triple BOT. Your reward is eight times the tokens and one impossible roadmap.",
  ],
  pairs: [
    "A pair. Just enough success to justify one more AI feature nobody requested.",
    "Two matched. The machine calls that traction and has emailed twelve investors.",
    "Pair detected. A small win for you, a giant overreaction for marketing.",
  ],
  losses: [
    "No payout. Your tokens were repurposed into a moody launch video.",
    "Miss. The machine recommends replacing the word bug with emergent behavior.",
    "Nothing lined up. Good news: the deck still says category-defining.",
  ],
  broke: [
    "Wallet empty. Please secure more tokens from someone who says moat with a straight face.",
    "You are out of tokens. Time to pivot into consultancy and vibes.",
  ],
  reset: "Fresh funding secured. The machine has resumed confusing confidence with capability.",
  error404: "A 404 appeared. The answer vanished, but the invoice remains fully enterprise-grade.",
  shareSuccess: "Spin result copied into the public record. Your shame now scales across devices.",
  shareUnavailable: "Sharing is unavailable here, so the machine quietly copied your embarrassment instead.",
};

const state = loadState();

const balanceEl = document.querySelector("#balance");
const betDisplayEl = document.querySelector("#bet-display");
const hypeMeterEl = document.querySelector("#hype-meter");
const wonTotalEl = document.querySelector("#won-total");
const burnedTotalEl = document.querySelector("#burned-total");
const bestWinEl = document.querySelector("#best-win");
const badIdeasEl = document.querySelector("#bad-ideas");
const messageEl = document.querySelector("#message");
const burnMessageEl = document.querySelector("#burn-message");
const historyEl = document.querySelector("#history");
const historyTemplate = document.querySelector("#history-item-template");
const betSlider = document.querySelector("#bet-slider");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const voiceToggle = document.querySelector("#voice-toggle");
const shareButton = document.querySelector("#share-button");
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
shareButton.addEventListener("click", shareResult);

async function spin() {
  if (state.spinning) {
    return;
  }

  if (state.balance < state.bet) {
    state.message = pick(copy.broke);
    state.hype = "Bootstrapping aggressively";
    pulseMachine("loss");
    vibrate([80, 50, 80]);
    speak(state.message);
    render();
    return;
  }

  state.spinning = true;
  state.balance -= state.bet;
  state.totalBurned += state.bet;
  state.hype = pick(hypeLevels);
  render();

  const result = [];

  for (const [index, reel] of reels.entries()) {
    const symbol = await animateReel(reel, 850 + index * 200);
    result.push(symbol);
  }

  const outcome = settle(result, state.bet);
  const burnedFromWin = Math.floor(outcome.payout * outcome.burnRate);
  const retained = outcome.payout - burnedFromWin;

  state.balance += retained;
  state.totalWon += outcome.payout;
  state.totalBurned += burnedFromWin;
  state.badIdeas += outcome.badIdeas;
  state.bestWin = Math.max(state.bestWin, outcome.payout);
  state.lastResult = result;
  state.message = outcome.message;
  state.burnMessage = describeBurn(outcome, burnedFromWin, retained);
  state.hype = outcome.hype;
  state.history.unshift({
    result: result.join(" / "),
    summary: `${outcome.summary} Burned ${burnedFromWin}. Kept ${retained}.`,
  });
  state.history = state.history.slice(0, 8);
  state.spinning = false;

  pulseMachine(outcome.tier);
  vibrate(outcome.payout > 0 ? [60, 30, 110] : [140]);
  speak(`${outcome.message} ${state.burnMessage}`);
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
    const payout = bet * 8;
    return {
      payout,
      burnRate: 0.65,
      badIdeas: 3,
      tier: "jackpot",
      message: pick(copy.botJackpots),
      hype: "Absurdly overfit",
      summary: `Triple BOT paid ${payout} tokens.`,
    };
  }

  if (triple) {
    const payout = bet * 5;
    return {
      payout,
      burnRate: 0.5,
      badIdeas: 2,
      tier: "jackpot",
      message: pick(copy.jackpots),
      hype: "Keynote ready",
      summary: `Three matching symbols paid ${payout} tokens.`,
    };
  }

  if (pair) {
    const payout = bet * 2;
    return {
      payout,
      burnRate: 0.35,
      badIdeas: 1,
      tier: "win",
      message: pick(copy.pairs),
      hype: "Mildly validated",
      summary: `A pair paid ${payout} tokens.`,
    };
  }

  if (has404) {
    return {
      payout: 0,
      burnRate: 0,
      badIdeas: 1,
      tier: "loss",
      message: copy.error404,
      hype: "Confidently incorrect",
      summary: "404 detected. No payout, maximum spin.",
const symbols = ["🤖", "🪙", "💸", "🧠", "📉", "💬", "🖥️"];
const spinCost = 15;
const defaultTokens = 120;

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];

const balanceEl = document.getElementById("token-balance");
const resultEl = document.getElementById("result-message");
const pillEl = document.getElementById("temperature-pill");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

let tokenBalance = defaultTokens;
let spinning = false;

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function updateBalance() {
  balanceEl.textContent = `${tokenBalance} tokens`;
  spinButton.disabled = spinning || tokenBalance < spinCost;
}

function setStatus(message) {
  resultEl.textContent = message;
}

function updatePill() {
  if (tokenBalance >= 100) {
    pillEl.textContent = "Hallucination risk: moderate";
  } else if (tokenBalance >= 45) {
    pillEl.textContent = "Hallucination risk: elevated";
  } else if (tokenBalance > 0) {
    pillEl.textContent = "Hallucination risk: investor call";
  } else {
    pillEl.textContent = "Hallucination risk: monetized";
  }
}

function scoreSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts).sort((a, b) => b - a);
  const tripleLaptop = results.every((symbol) => symbol === "🖥️");

  if (tripleLaptop) {
    return {
      payout: 90,
      message: "Enterprise jackpot. Three laptops means the board approved another AI pivot.",
    };
  }

  if (values[0] === 3) {
    return {
      payout: 60,
      message: `Triple match. The machine generated a premium paragraph nobody will read.`,
    };
  }

  if (values[0] === 2) {
    return {
      payout: 25,
      message: "Two of a kind. The chatbot says this counts as meaningful productivity.",
    };
  }

  return {
    payout: 0,
    burnRate: 0,
    badIdeas: 0,
    tier: "loss",
    message: pick(copy.losses),
    hype: "Still fundraising",
    summary: "No payout. Tokens donated to machine mythology.",
  };
}

function describeBurn(outcome, burned, retained) {
  if (outcome.payout === 0) {
    return "No bonus tokens were generated, so the machine burned only your dignity.";
  }

  const projects = [
    "a cinematic launch teaser for a feature that barely exists",
    "premium GPU incense",
    "an intern-powered benchmark PDF",
    "three consultants and a neon dashboard",
    "a rebrand from chatbot to cognitive platform",
  ];

  return `${burned} tokens were immediately spent on ${pick(projects)}. You kept ${retained}.`;
}

function resetGame() {
  state.balance = 240;
  state.bet = 20;
  state.hype = "Caffeinated";
  state.message = copy.reset;
  state.burnMessage = "Fresh runway acquired. The machine can once again waste money at scale.";
  state.totalWon = 0;
  state.totalBurned = 0;
  state.bestWin = 0;
  state.badIdeas = 0;
  state.history = [];
  state.lastResult = ["SEED", "BOT", "GPU"];
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

async function shareResult() {
  const text = `Token Laundromat 9000: ${state.lastResult.join(" / ")}. Wallet ${state.balance}. Total burned ${state.totalBurned}.`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Token Laundromat 9000",
        text,
      });
      state.message = copy.shareSuccess;
    } catch {
      return;
    }
  } else if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    state.message = copy.shareUnavailable;
  } else {
    state.message = "This browser refused to share or copy, which is honestly its smartest behavior today.";
  }

  saveState();
  render();
}

function render() {
  balanceEl.textContent = String(state.balance);
  betDisplayEl.textContent = String(state.bet);
  hypeMeterEl.textContent = state.hype;
  wonTotalEl.textContent = String(state.totalWon);
  burnedTotalEl.textContent = String(state.totalBurned);
  bestWinEl.textContent = String(state.bestWin);
  badIdeasEl.textContent = String(state.badIdeas);
  messageEl.textContent = state.message;
  burnMessageEl.textContent = state.burnMessage;
  spinButton.disabled = state.spinning;
  spinButton.textContent = state.spinning ? "Generating Hype..." : "Pull The Lever";
  voiceToggle.textContent = state.voiceEnabled ? "Snark Voice On" : "Snark Voice Off";
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
      "<strong>No spin myths yet.</strong><span>The machine is waiting for one more reckless token allocation.</span>";
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
    hype: "Caffeinated",
    message: copy.intro,
    burnMessage:
      "No winnings yet. The finance team is pretending this counts as runway.",
    totalWon: 0,
    totalBurned: 0,
    bestWin: 0,
    badIdeas: 0,
    history: [],
    lastResult: ["SEED", "BOT", "GPU"],
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
      hype: state.hype,
      message: state.message,
      burnMessage: state.burnMessage,
      totalWon: state.totalWon,
      totalBurned: state.totalBurned,
      bestWin: state.bestWin,
      badIdeas: state.badIdeas,
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

function pulseMachine(tier) {
  machineEl.classList.remove("is-winning", "is-losing", "is-jackpot");

  if (tier === "jackpot") {
    machineEl.classList.add("is-jackpot");
  } else if (tier === "win") {
    machineEl.classList.add("is-winning");
  } else {
    machineEl.classList.add("is-losing");
  }

  window.setTimeout(() => {
    machineEl.classList.remove("is-winning", "is-losing", "is-jackpot");
  }, 950);
}

function speak(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 0.74;
  utterance.volume = 0.9;
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
    message: "No luck. Your prompt budget was converted directly into executive optimism.",
  };
}

async function animateReel(reel, duration) {
  reel.classList.add("spinning");
  const start = performance.now();

  while (performance.now() - start < duration) {
    reel.textContent = choice(symbols);
    await delay(90);
  }

  reel.classList.remove("spinning");
}

async function spin() {
  if (spinning || tokenBalance < spinCost) {
    if (tokenBalance < spinCost) {
      setStatus("You are out of tokens. The machine recommends a paid subscription and personal reflection.");
    }
    return;
  }

  spinning = true;
  tokenBalance -= spinCost;
  updateBalance();
  updatePill();
  setStatus("Processing prompt... extracting value... definitely not burning cash.");

  const finalSymbols = reels.map(() => choice(symbols));

  await Promise.all(
    reels.map(async (reel, index) => {
      await animateReel(reel, 700 + index * 220);
      reel.textContent = finalSymbols[index];
    })
  );

  const outcome = scoreSpin(finalSymbols);
  tokenBalance += outcome.payout;
  setStatus(`${outcome.message} Result: ${finalSymbols.join(" ")}`);
  updatePill();

  spinning = false;
  updateBalance();

  if (tokenBalance < spinCost) {
    setStatus("Balance too low for another spin. Even satire has usage limits.");
  }
}

function resetGame() {
  if (spinning) {
    return;
  }

  tokenBalance = defaultTokens;
  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
  });
  setStatus("Bankroll restored. The machine is ready to convert tokens into vibes again.");
  updatePill();
  updateBalance();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateBalance();
updatePill();
