const symbols = ["404", "GPU", "LOL", "PROMPT", "TOKEN", "LAG", "HYPE"];
const spinCost = 150;
const matchTwoPayout = 300;
const jackpotPayout = 900;
const startingTokens = 1200;

const losingSnark = [
  "The model appreciated your donation and returned three fresh synonyms for 'synergy.'",
  "No win. Please try adding the phrase 'enterprise-grade' and resubmit your hope.",
  "You received a premium hallucination with notes of vaporware and investor deck.",
  "Tough spin. The AI recommends paying for the bigger context window anyway.",
  "Nothing matched, but a chatbot somewhere feels extremely confident about made-up facts."
];

const mediumWinSnark = [
  "Two matched. That is basically product-market fit in AI terms.",
  "A modest win. Enough tokens to generate one more suspiciously cheerful roadmap.",
  "Nice. The machine produced value once, so leadership will extrapolate wildly."
];

const jackpotSnark = [
  "Jackpot. The board has mistaken luck for a defensible moat.",
  "Triple match. Congratulations on disrupting arithmetic with pure optimism.",
  "You hit the jackpot and immediately got invited to speak on an AI panel."
];

const reels = [
  document.getElementById("reel-0"),
  document.getElementById("reel-1"),
  document.getElementById("reel-2")
];
const tokenCount = document.getElementById("token-count");
const resultLine = document.getElementById("result-line");
const snarkLine = document.getElementById("snark-line");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const machine = document.querySelector(".machine");

let tokens = startingTokens;
let spinning = false;

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function formatTokens(value) {
  return value.toLocaleString("en-US");
}

function updateTokenDisplay() {
  tokenCount.textContent = formatTokens(tokens);
}

function setMachineMood(mood) {
  machine.classList.remove("flash-win", "flash-lose");
  if (mood) {
    machine.classList.add(mood);
  }
}

function pickLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const highestCount = Math.max(...Object.values(counts));

  if (highestCount === 3) {
    tokens += jackpotPayout;
    resultLine.textContent = `Jackpot: +${formatTokens(jackpotPayout)} tokens`;
    snarkLine.textContent = pickLine(jackpotSnark);
    setMachineMood("flash-win");
    return;
  }

  if (highestCount === 2) {
    tokens += matchTwoPayout;
    resultLine.textContent = `Partial match: +${formatTokens(matchTwoPayout)} tokens`;
    snarkLine.textContent = pickLine(mediumWinSnark);
    setMachineMood("flash-win");
    return;
  }

  resultLine.textContent = "No match: the machine has monetized your curiosity";
  snarkLine.textContent = pickLine(losingSnark);
  setMachineMood("flash-lose");
}

function lockControls(state) {
  spinning = state;
  spinButton.disabled = state;
  resetButton.disabled = state;
}

function stopGameIfBroke() {
  if (tokens < spinCost) {
    resultLine.textContent = "Out of tokens. The AI has achieved sustainable extraction.";
    snarkLine.textContent = "Use the bailout button so the startup can pivot to 'agentic' and raise again.";
    spinButton.disabled = true;
  } else if (!spinning) {
    spinButton.disabled = false;
  }
}

function animateSpin(finalResults) {
  reels.forEach((reel) => reel.classList.add("spinning"));

  finalResults.forEach((result, index) => {
    const revealDelay = 450 + index * 320;

    window.setTimeout(() => {
      reels[index].textContent = result;
      reels[index].classList.remove("spinning");
    }, revealDelay);
  });

  window.setTimeout(() => {
    evaluateSpin(finalResults);
    updateTokenDisplay();
    lockControls(false);
    stopGameIfBroke();
  }, 1450);
}

function spin() {
  if (spinning || tokens < spinCost) {
    stopGameIfBroke();
    return;
  }

  tokens -= spinCost;
  updateTokenDisplay();
  resultLine.textContent = "Spinning up inference cluster...";
  snarkLine.textContent = "Please wait while several GPUs convert electricity into branding.";
  setMachineMood(null);
  lockControls(true);

  reels.forEach((reel) => {
    reel.textContent = randomSymbol();
    reel.classList.add("spinning");
  });

  const finalResults = [randomSymbol(), randomSymbol(), randomSymbol()];
  animateSpin(finalResults);
}

function resetGame() {
  tokens = startingTokens;
  updateTokenDisplay();
  resultLine.textContent = "Fresh funding secured. Burn rate restored.";
  snarkLine.textContent = "The machine is ready to transform more tokens into strategic ambiguity.";
  reels.forEach((reel, index) => {
    reel.textContent = symbols[index];
    reel.classList.remove("spinning");
  });
  setMachineMood(null);
  lockControls(false);
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateTokenDisplay();
stopGameIfBroke();
