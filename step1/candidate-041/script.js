const symbols = [
  {
    name: "Token",
    roast: "The model found loose change in a benchmark spreadsheet.",
  },
  {
    name: "Prompt",
    roast: "Congratulations, you won another 400-word setup paragraph.",
  },
  {
    name: "Hallucination",
    roast: "The AI is confidently citing a paper it invented at brunch.",
  },
  {
    name: "Lag",
    roast: "Nothing says innovation like waiting for a typing animation.",
  },
  {
    name: "GPU",
    roast: "A data center somewhere just inhaled dramatically.",
  },
  {
    name: "Pivot",
    roast: "Your startup has rebranded as an agentic lifestyle company.",
  },
];

const spinCost = 3;
const startingTokens = 25;

const reelElements = [
  document.querySelector("#reel-1"),
  document.querySelector("#reel-2"),
  document.querySelector("#reel-3"),
];

const balanceElement = document.querySelector("#token-balance");
const payoutElement = document.querySelector("#last-payout");
const statusElement = document.querySelector("#machine-status");
const messageElement = document.querySelector("#result-message");
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");

let balance = startingTokens;
let isSpinning = false;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateUI(lastPayout = 0) {
  balanceElement.textContent = String(balance);
  payoutElement.textContent = String(lastPayout);
  spinButton.disabled = isSpinning || balance < spinCost;

  if (balance < spinCost && !isSpinning) {
    statusElement.textContent =
      "Insufficient tokens. The AI paywall has entered its final form.";
  }
}

function evaluateSpin(results) {
  const names = results.map((result) => result.name);
  const counts = names.reduce((accumulator, name) => {
    accumulator[name] = (accumulator[name] || 0) + 1;
    return accumulator;
  }, {});

  const uniqueCount = Object.keys(counts).length;
  const [topMatch, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  if (topCount === 3 && topMatch === "Token") {
    return {
      payout: 18,
      status: "Jackpot. The machine emitted premium token fumes.",
      message: "Three Tokens. The AI finally did something cheaper than expected.",
    };
  }

  if (topCount === 3 && topMatch === "Prompt") {
    return {
      payout: 12,
      status: "Prompt storm detected. Everyone nod politely.",
      message: "Three Prompts. You have unlocked enterprise-grade overexplaining.",
    };
  }

  if (topCount === 3 && topMatch === "Hallucination") {
    return {
      payout: 2,
      status: "Three Hallucinations. Accuracy has left the chat.",
      message: "You technically won, but only in the way a made-up citation wins.",
    };
  }

  if (topCount === 2) {
    return {
      payout: 5,
      status: `Two ${topMatch}s. The machine respects mediocre alignment.`,
      message: results.find((result) => result.name === topMatch).roast,
    };
  }

  if (uniqueCount === 3) {
    return {
      payout: 0,
      status: "Three different buzzwords. Investors are intrigued; your wallet isn't.",
      message: results.map((result) => result.roast).join(" "),
    };
  }

  return {
    payout: 0,
    status: "No useful pattern. The AI has pivoted to vibes-only mode.",
    message: results.map((result) => result.roast).join(" "),
  };
}

function setReelSymbol(index, symbol) {
  reelElements[index].textContent = symbol.name;
}

function animateReel(index, delay) {
  return new Promise((resolve) => {
    const reel = reelElements[index];
    reel.classList.add("spinning");

    const intervalId = window.setInterval(() => {
      setReelSymbol(index, randomSymbol());
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(intervalId);
      const finalSymbol = randomSymbol();
      setReelSymbol(index, finalSymbol);
      reel.classList.remove("spinning");
      resolve(finalSymbol);
    }, delay);
  });
}

async function spin() {
  if (isSpinning || balance < spinCost) {
    return;
  }

  isSpinning = true;
  balance -= spinCost;
  statusElement.textContent = "Spinning. The AI is monetizing suspense.";
  messageElement.textContent = "Tokens spent. Waiting for synthetic destiny.";
  updateUI(0);

  const results = await Promise.all([
    animateReel(0, 700),
    animateReel(1, 1050),
    animateReel(2, 1400),
  ]);

  const outcome = evaluateSpin(results);
  balance += outcome.payout;
  payoutElement.textContent = String(outcome.payout);
  statusElement.textContent = outcome.status;
  messageElement.textContent = outcome.message;
  isSpinning = false;
  updateUI(outcome.payout);
}

function resetGame() {
  balance = startingTokens;
  isSpinning = false;
  reelElements.forEach((reel, index) => {
    setReelSymbol(index, symbols[index]);
    reel.classList.remove("spinning");
  });

  statusElement.textContent = "Idle. The robots are pretending to think.";
  messageElement.textContent =
    "Fresh tokens loaded. Time to finance another round of artificial confidence.";
  updateUI(0);
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateUI(0);
