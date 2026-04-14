const symbols = ["🤖", "🪙", "🔥", "🧠", "📉", "🥴"];

const taunts = [
  "The model promises it can definitely do your taxes.",
  "A venture capitalist just called this 'disruptive roulette for the cloud era.'",
  "Every token you spend buys the AI another chance to confuse confidence with accuracy.",
  "Three matching symbols means the chatbot accidentally answered one question correctly.",
  "Somewhere, a server farm is sweating because you wanted a funny slot machine."
];

const outcomes = [
  {
    match: ["🪙", "🪙", "🪙"],
    label: "Investor frenzy",
    delta: 80,
    message: "Triple tokens. The AI has discovered monetization and immediately made it your problem."
  },
  {
    match: ["🤖", "🤖", "🤖"],
    label: "Hallucination jackpot",
    delta: 55,
    message: "Three robots align. The machine awards tokens for sounding certain while being wildly wrong."
  },
  {
    match: ["🔥", "🔥", "🔥"],
    label: "GPU bonfire",
    delta: -45,
    message: "Everything catches fire. Your balance funds one more dramatic training run."
  },
  {
    match: ["🧠", "🧠", "🧠"],
    label: "Synthetic genius",
    delta: 45,
    message: "For one glorious second, the AI almost resembles intelligence."
  },
  {
    match: ["📉", "📉", "📉"],
    label: "Ethics keynote",
    delta: -30,
    message: "A keynote deck appears. Somehow it costs tokens and solves nothing."
  },
  {
    match: ["🥴", "🥴", "🥴"],
    label: "Prompt goblin",
    delta: 25,
    message: "A cursed prompt works anyway. Nobody understands why, including the machine."
  }
];

const tokenCount = document.getElementById("tokenCount");
const spinCost = document.getElementById("spinCost");
const resultLabel = document.getElementById("resultLabel");
const tauntLine = document.getElementById("tauntLine");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const logList = document.getElementById("logList");
const reels = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

let tokens = 120;
const costPerSpin = 15;
let isSpinning = false;

spinCost.textContent = costPerSpin;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateTokens() {
  tokenCount.textContent = tokens;
}

function addLogEntry(message, emphasis) {
  const item = document.createElement("li");
  item.innerHTML = `<strong>${emphasis}</strong> ${message}`;
  logList.prepend(item);

  while (logList.children.length > 6) {
    logList.removeChild(logList.lastChild);
  }
}

function evaluateSpin(results) {
  const directMatch = outcomes.find((outcome) =>
    outcome.match.every((symbol, index) => symbol === results[index])
  );

  if (directMatch) {
    return directMatch;
  }

  const uniqueCount = new Set(results).size;

  if (uniqueCount === 1) {
    return {
      label: "Generic miracle",
      delta: 35,
      message: "All three symbols match, which means the AI may now demand a keynote slot."
    };
  }

  if (uniqueCount === 2) {
    return {
      label: "Almost useful",
      delta: 10,
      message: "Two symbols line up. The chatbot was nearly correct before improvising nonsense."
    };
  }

  return {
    label: "Token drain",
    delta: -10,
    message: "No alignment. The model consumed your credits to generate polished mediocrity."
  };
}

function syncTaunt() {
  tauntLine.textContent = taunts[Math.floor(Math.random() * taunts.length)];
}

function setWinState(results) {
  const isMatch = new Set(results).size === 1;
  reels.forEach((reel) => {
    reel.classList.toggle("win", isMatch);
  });
}

async function spin() {
  if (isSpinning || tokens < costPerSpin) {
    if (tokens < costPerSpin) {
      tauntLine.textContent = "You are out of tokens. The AI suggests buying a premium plan.";
      resultLabel.textContent = "Broke but scalable";
    }
    return;
  }

  isSpinning = true;
  spinButton.disabled = true;
  tokens -= costPerSpin;
  updateTokens();
  resultLabel.textContent = "Spinning...";
  syncTaunt();
  reels.forEach((reel) => {
    reel.classList.remove("win");
    reel.classList.add("spinning");
  });

  const finalResults = reels.map(() => randomSymbol());

  for (let tick = 0; tick < 12; tick += 1) {
    reels.forEach((reel, index) => {
      if (tick < 8 || index <= tick - 8) {
        reel.textContent = randomSymbol();
      }
    });
    await new Promise((resolve) => window.setTimeout(resolve, 90 + tick * 12));
  }

  reels.forEach((reel, index) => {
    reel.classList.remove("spinning");
    reel.textContent = finalResults[index];
  });

  const outcome = evaluateSpin(finalResults);
  tokens = Math.max(0, tokens + outcome.delta);
  updateTokens();
  resultLabel.textContent = outcome.label;
  tauntLine.textContent = outcome.message;
  setWinState(finalResults);
  addLogEntry(
    `${finalResults.join(" ")} changed your balance by ${outcome.delta} tokens. Balance: ${tokens}.`,
    outcome.label
  );

  isSpinning = false;
  spinButton.disabled = false;
}

function resetGame() {
  tokens = 120;
  updateTokens();
  resultLabel.textContent = "Fresh delusion";
  tauntLine.textContent = "Budget restored. The AI immediately scheduled another wasteful demo.";
  reels.forEach((reel, index) => {
    reel.classList.remove("win", "spinning");
    reel.textContent = symbols[index];
  });
  logList.innerHTML = "";
  addLogEntry("Your treasury has been refilled so the machines can keep pretending this is innovation.", "Reset");
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateTokens();
resetGame();
