const symbols = ["GPU", "BOT", "404", "LOL", "PROMPT", "LAG", "TOKEN"];
const spinCost = 15;
const startingBalance = 120;

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];

const balanceEl = document.getElementById("token-balance");
const spinCostEl = document.getElementById("spin-cost");
const streakEl = document.getElementById("streak-count");
const messageEl = document.getElementById("message-text");
const heatBarEl = document.getElementById("heat-bar");
const heatReadoutEl = document.getElementById("heat-readout");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const machineEl = document.querySelector(".machine");

let balance = startingBalance;
let streak = 0;
let heat = 18;
let spinning = false;

spinCostEl.textContent = String(spinCost);

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(text) {
  messageEl.textContent = text;
}

function updateHud() {
  balanceEl.textContent = String(balance);
  streakEl.textContent = String(streak);
  heatBarEl.style.width = `${heat}%`;

  if (heat < 35) {
    heatReadoutEl.textContent = "Low";
  } else if (heat < 70) {
    heatReadoutEl.textContent = "Toasty";
  } else {
    heatReadoutEl.textContent = "Hallucinating";
  }
}

function applyWinFlash(payout) {
  if (payout <= 0) {
    return;
  }

  machineEl.classList.remove("flash-win");
  void machineEl.offsetWidth;
  machineEl.classList.add("flash-win");
}

function evaluateSpin(result) {
  const counts = result.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts).sort((a, b) => b - a);
  const topMatch = values[0];
  const allSame = topMatch === 3;
  const has404 = counts["404"] > 0;

  if (allSame && result[0] === "GPU") {
    return {
      payout: 90,
      message: "Triple GPU. The model burned a venture round and accidentally paid you back.",
    };
  }

  if (allSame && result[0] === "PROMPT") {
    return {
      payout: 75,
      message: "Prompt jackpot. Three PROMPTs in a row and suddenly everyone on LinkedIn is a thought leader.",
    };
  }

  if (allSame) {
    return {
      payout: 60,
      message: `Three ${result[0]} symbols. Even the AI is surprised this nonsense had structure.`,
    };
  }

  if (topMatch === 2) {
    const pair = Object.keys(counts).find((symbol) => counts[symbol] === 2);
    return {
      payout: 25,
      message: `Two ${pair} symbols matched. The algorithm calls that "close enough for a demo."`,
    };
  }

  if (has404) {
    return {
      payout: 0,
      message: "A 404 showed up. The machine regrets nothing and blames retrieval quality.",
    };
  }

  return {
    payout: 0,
    message: "No payout. Your tokens have been successfully converted into premium synthetic confidence.",
  };
}

function finishSpin(result) {
  const { payout, message } = evaluateSpin(result);
  balance += payout;
  streak = payout > 0 ? streak + 1 : 0;
  heat = Math.min(100, Math.max(10, heat + (payout > 0 ? -8 : 14)));

  setMessage(`${message} ${payout > 0 ? `You recovered ${payout} tokens.` : "Please enjoy the satire."}`);
  applyWinFlash(payout);
  updateHud();

  spinning = false;
  spinButton.disabled = balance < spinCost;

  if (balance < spinCost) {
    setMessage("Wallet empty. The AI has consumed your budget. Hit refill to receive another suspiciously generous grant.");
  }
}

function spin() {
  if (spinning || balance < spinCost) {
    return;
  }

  spinning = true;
  spinButton.disabled = true;
  balance -= spinCost;
  heat = Math.min(100, heat + 6);
  updateHud();
  setMessage("Spinning reels. Please wait while the model samples from a distribution of bad financial decisions.");

  const result = reels.map(() => randomSymbol());

  reels.forEach((reel, reelIndex) => {
    let ticks = 0;
    const maxTicks = 8 + reelIndex * 4;
    reel.classList.add("spinning");

    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
      ticks += 1;

      if (ticks >= maxTicks) {
        window.clearInterval(interval);
        reel.textContent = result[reelIndex];
        reel.classList.remove("spinning");

        if (reelIndex === reels.length - 1) {
          window.setTimeout(() => finishSpin(result), 120);
        }
      }
    }, 90 + reelIndex * 25);
  });
}

function resetGame() {
  balance = startingBalance;
  streak = 0;
  heat = 18;
  spinning = false;
  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });
  spinButton.disabled = false;
  setMessage("Wallet refilled. The AI ethics board has approved one more round of irresponsible experimentation.");
  updateHud();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateHud();
