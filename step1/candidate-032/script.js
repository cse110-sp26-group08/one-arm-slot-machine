const symbols = ["PROMPT", "BOT", "404", "HYPE", "TOKEN", "VC", "GPU"];
const spinCost = 3;
const defaultTokens = 30;

const state = {
  tokens: defaultTokens,
  lastWin: 0,
  isSpinning: false,
};

const reelElements = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];

const tokenCount = document.getElementById("token-count");
const spinCostElement = document.getElementById("spin-cost");
const lastWinElement = document.getElementById("last-win");
const messageElement = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");

spinCostElement.textContent = spinCost;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(text, tone = "") {
  messageElement.textContent = text;
  messageElement.className = `message ${tone}`.trim();
}

function updateStats() {
  tokenCount.textContent = state.tokens;
  lastWinElement.textContent = state.lastWin;
  spinButton.disabled = state.isSpinning || state.tokens < spinCost;
}

function evaluateSpin(result) {
  const counts = result.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const values = Object.values(counts).sort((a, b) => b - a);
  let payout = 0;
  let message = "Three expensive noises and zero strategic value. Classic AI.";
  let tone = "lose";

  if (result.every((symbol) => symbol === "PROMPT")) {
    payout = 25;
    message =
      "Triple PROMPT. The machine has generated a visionary deck and billed you extra for synergy.";
    tone = "win";
  } else if (values[0] === 3) {
    payout = 18;
    message =
      `Jackpot. Three ${result[0]} symbols. Even the chatbot sounds surprised by your competence.`;
    tone = "win";
  } else if (values[0] === 2) {
    payout = 6;
    message =
      "Two of a kind. The machine calls this a breakthrough and would like to invoice your team.";
    tone = "win";
  } else if (result.includes("404")) {
    message =
      "A 404 appeared. Your product vision could not be found, but the confidence remained impeccable.";
  }

  state.tokens += payout;
  state.lastWin = payout;
  setMessage(message, tone);
}

function spinReels() {
  if (state.isSpinning || state.tokens < spinCost) {
    if (state.tokens < spinCost) {
      setMessage(
        "Out of tokens. Time to pivot to enterprise pricing or smash Emergency VC Funding.",
        "lose"
      );
    }
    return;
  }

  state.isSpinning = true;
  state.tokens -= spinCost;
  state.lastWin = 0;
  updateStats();
  setMessage("Tokens accepted. The AI is thinking extremely expensive thoughts.");

  const result = reelElements.map(() => randomSymbol());

  reelElements.forEach((reel, index) => {
    reel.classList.add("spinning");

    let ticks = 0;
    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
      ticks += 1;

      if (ticks >= 8 + index * 4) {
        window.clearInterval(interval);
        reel.textContent = result[index];
        reel.classList.remove("spinning");

        if (index === reelElements.length - 1) {
          state.isSpinning = false;
          evaluateSpin(result);
          updateStats();
        }
      }
    }, 90 + index * 40);
  });
}

function resetGame() {
  state.tokens = defaultTokens;
  state.lastWin = 0;
  state.isSpinning = false;

  reelElements.forEach((reel) => {
    reel.classList.remove("spinning");
    reel.textContent = randomSymbol();
  });

  setMessage(
    "Fresh funding secured. The machine is ready to convert optimism into token burn once again."
  );
  updateStats();
}

spinButton.addEventListener("click", spinReels);
resetButton.addEventListener("click", resetGame);

resetGame();
