const symbols = ["🤖", "🪙", "🔥", "📉", "🧠", "💸"];
const tokenBalance = document.getElementById("tokenBalance");
const statusMessage = document.getElementById("statusMessage");
const spendMessage = document.getElementById("spendMessage");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const reelElements = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3"),
];

const spinCost = 15;
const startingTokens = 120;
let tokens = startingTokens;
let spinning = false;
let activeIntervals = [];
let activeTimeouts = [];

const winMessages = {
  jackpot: [
    "Triple match. Investors just confused confidence for product-market fit.",
    "Jackpot. Your chatbot now has a valuation and no revenue.",
    "Three of a kind. The board approved another completely normal token grant.",
  ],
  pair: [
    "A pair. Enough tokens to fund one dramatic keynote and half a benchmark.",
    "Two matched. The AI now describes itself as enterprise-ready.",
    "Partial win. Finance calls this a strategic hallucination.",
  ],
  miss: [
    "No match. Your tokens were absorbed by premium autocomplete.",
    "Swing and miss. Legal renamed the loss 'compute optimization.'",
    "Nothing landed. The model requested a larger GPU and your dignity.",
  ],
};

const spendMessages = [
  "Winnings automatically reinvested into vibes, cloud invoices, and a launch video.",
  "A healthy portion of your balance has been allocated to token-shaped optimism.",
  "Some tokens may be exchanged for consultants who say 'agentic' with conviction.",
  "Operations reports your budget now includes a line item called synthetic ambition.",
];

function getRandomSymbol() {
  const index = Math.floor(Math.random() * symbols.length);
  return symbols[index];
}

function updateBalance() {
  tokenBalance.textContent = `${tokens} tokens`;
  spinButton.disabled = spinning || tokens < spinCost;

  if (!spinning && tokens < spinCost) {
    statusMessage.textContent = "Out of tokens. Even the AI demo booth packed up.";
    spendMessage.textContent = "Use Reboot Funding Round to refill the wallet.";
  }
}

function pickMessage(type) {
  const options = winMessages[type];
  return options[Math.floor(Math.random() * options.length)];
}

function pickSpendMessage() {
  return spendMessages[Math.floor(Math.random() * spendMessages.length)];
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  const matches = Object.values(counts).sort((a, b) => b - a);

  if (matches[0] === 3) {
    tokens += 90;
    statusMessage.textContent = pickMessage("jackpot");
    spendMessage.textContent = `You won 90 tokens. ${pickSpendMessage()}`;
    return;
  }

  if (matches[0] === 2) {
    tokens += 30;
    statusMessage.textContent = pickMessage("pair");
    spendMessage.textContent = `You won 30 tokens. ${pickSpendMessage()}`;
    return;
  }

  statusMessage.textContent = pickMessage("miss");
  spendMessage.textContent = "You won 0 tokens. The roadmap still says 'monetize later.'";
}

function animateSpin() {
  spinning = true;
  updateBalance();
  statusMessage.textContent = "Spinning the reels and drafting a breathtaking AI press release.";
  spendMessage.textContent = "15 tokens spent on compute, jargon, and mild delusion.";

  reelElements.forEach((reel) => reel.classList.add("spinning"));

  const results = [];

  reelElements.forEach((reel, index) => {
    const stopDelay = 700 + index * 250;
    const intervalId = setInterval(() => {
      reel.textContent = getRandomSymbol();
    }, 90);
    activeIntervals.push(intervalId);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      const finalSymbol = getRandomSymbol();
      reel.textContent = finalSymbol;
      reel.classList.remove("spinning");
      results[index] = finalSymbol;

      if (results.length === reelElements.length && !results.includes(undefined)) {
        spinning = false;
        activeIntervals = [];
        activeTimeouts = [];
        evaluateSpin(results);
        updateBalance();
      }
    }, stopDelay);
    activeTimeouts.push(timeoutId);
  });
}

spinButton.addEventListener("click", () => {
  if (spinning || tokens < spinCost) {
    return;
  }

  tokens -= spinCost;
  animateSpin();
});

resetButton.addEventListener("click", () => {
  activeIntervals.forEach((intervalId) => clearInterval(intervalId));
  activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  activeIntervals = [];
  activeTimeouts = [];
  tokens = startingTokens;
  spinning = false;
  reelElements.forEach((reel, index) => {
    reel.classList.remove("spinning");
    reel.textContent = symbols[index];
  });
  statusMessage.textContent = "Fresh funding secured. Accountability postponed.";
  spendMessage.textContent = "Wallet restored to 120 tokens. Burn carefully.";
  updateBalance();
});

updateBalance();
