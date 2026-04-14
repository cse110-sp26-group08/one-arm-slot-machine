const symbols = ["TOKEN", "GPU", "BOT", "404", "PROMPT", "LAG", "HYPE"];
const spinCost = 20;
const startingBalance = 150;

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];

const balanceEl = document.getElementById("token-balance");
const spinCostEl = document.getElementById("spin-cost");
const aiMoodEl = document.getElementById("ai-mood");
const hallucinationBarEl = document.getElementById("hallucination-bar");
const hallucinationLabelEl = document.getElementById("hallucination-label");
const messageEl = document.getElementById("message-text");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const machineEl = document.querySelector(".machine");

let balance = startingBalance;
let hallucinationLevel = 20;
let spinning = false;

spinCostEl.textContent = String(spinCost);

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(message) {
  messageEl.textContent = message;
}

function updateMood() {
  if (hallucinationLevel < 35) {
    aiMoodEl.textContent = "Smug";
    hallucinationLabelEl.textContent = "Manageable";
    return;
  }

  if (hallucinationLevel < 70) {
    aiMoodEl.textContent = "Freelancing Facts";
    hallucinationLabelEl.textContent = "Wobbly";
    return;
  }

  aiMoodEl.textContent = "Fully Confident";
  hallucinationLabelEl.textContent = "Critical";
}

function updateHud() {
  balanceEl.textContent = String(balance);
  hallucinationBarEl.style.width = `${hallucinationLevel}%`;
  updateMood();
}

function triggerWinFlash(payout) {
  if (payout <= 0) {
    return;
  }

  machineEl.classList.remove("flash-win");
  void machineEl.offsetWidth;
  machineEl.classList.add("flash-win");
}

function evaluateSpin(result) {
  const counts = result.reduce((accumulator, symbol) => {
    accumulator[symbol] = (accumulator[symbol] || 0) + 1;
    return accumulator;
  }, {});

  const highestMatch = Math.max(...Object.values(counts));
  const matchedSymbol = Object.keys(counts).find((symbol) => counts[symbol] === highestMatch);

  if (highestMatch === 3 && matchedSymbol === "TOKEN") {
    return {
      payout: 120,
      message: "Triple TOKEN. The model accidentally billed someone else for your experiment.",
    };
  }

  if (highestMatch === 3 && matchedSymbol === "GPU") {
    return {
      payout: 95,
      message: "Triple GPU. Somewhere, a startup deck just added another slide about scaling intelligence.",
    };
  }

  if (highestMatch === 3) {
    return {
      payout: 70,
      message: `Three ${matchedSymbol} symbols. Even the AI has to admit that was almost coherent.`,
    };
  }

  if (highestMatch === 2) {
    return {
      payout: 30,
      message: `Two ${matchedSymbol} symbols matched. The machine calls that a "beta-ready insight."`,
    };
  }

  if (counts["404"]) {
    return {
      payout: 0,
      message: "A 404 slipped in. The machine blames your prompt, the docs, and the moon phase.",
    };
  }

  return {
    payout: 0,
    message: "No payout. Your tokens have been transformed into a polite paragraph with suspicious confidence.",
  };
}

function finishSpin(result) {
  const { payout, message } = evaluateSpin(result);

  balance += payout;
  hallucinationLevel = Math.max(10, Math.min(100, hallucinationLevel + (payout > 0 ? -10 : 16)));
  triggerWinFlash(payout);

  if (payout > 0) {
    setMessage(`${message} You clawed back ${payout} tokens from the compute abyss.`);
  } else {
    setMessage(`${message} Thank you for funding the next unnecessary AI keynote.`);
  }

  updateHud();
  spinning = false;
  spinButton.disabled = balance < spinCost;

  if (balance < spinCost) {
    setMessage("You are out of tokens. The AI has monetized your curiosity. Reload grant money to continue.");
  }
}

function spin() {
  if (spinning || balance < spinCost) {
    return;
  }

  spinning = true;
  spinButton.disabled = true;
  balance -= spinCost;
  hallucinationLevel = Math.min(100, hallucinationLevel + 7);
  updateHud();
  setMessage("Spinning. The machine is searching a latent space made entirely of marketing copy and hot air.");

  const result = reels.map(() => randomSymbol());

  reels.forEach((reel, index) => {
    let ticks = 0;
    const maxTicks = 9 + index * 4;
    reel.classList.add("spinning");

    const intervalId = window.setInterval(() => {
      reel.textContent = randomSymbol();
      ticks += 1;

      if (ticks >= maxTicks) {
        window.clearInterval(intervalId);
        reel.textContent = result[index];
        reel.classList.remove("spinning");

        if (index === reels.length - 1) {
          window.setTimeout(() => finishSpin(result), 120);
        }
      }
    }, 85 + index * 30);
  });
}

function resetGame() {
  balance = startingBalance;
  hallucinationLevel = 20;
  spinning = false;

  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });

  spinButton.disabled = false;
  setMessage("Fresh tokens loaded. The machine is ready to turn your budget into another AI lesson in humility.");
  updateHud();
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateHud();
