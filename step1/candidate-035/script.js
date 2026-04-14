const symbols = ["🤖", "🪙", "⚡", "💬", "🧠", "🔥"];
const spinCost = 3;
const upgradeCost = 10;
const storageKey = "token-tugboat-balance";
const messageKey = "token-tugboat-message";

let balance = Number(window.localStorage.getItem(storageKey) || 25);
let isSpinning = false;

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const balanceEl = document.getElementById("token-balance");
const messageEl = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const upgradeButton = document.getElementById("upgrade-button");

const spinMessages = [
  "Allocating premium vibes and absolutely no accountability.",
  "Training a tiny model on casino dust and optimism.",
  "Converting your tokens into disruptive shareholder value.",
  "Reinforcement learning from three cherries and one bad idea."
];

const upgradeMessages = [
  "You bought a Pro Max Plus tier. It mostly adds confidence.",
  "Upgrade complete. The machine now hallucinates its loyalty program.",
  "Premium mode enabled. Responses are 20% smoother and 80% pricier.",
  "Excellent investment. The button glows with enterprise-grade ambiguity."
];

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setMessage(text) {
  messageEl.textContent = text;
  window.localStorage.setItem(messageKey, text);
}

function updateBalance() {
  balanceEl.textContent = String(balance);
  spinButton.disabled = isSpinning || balance < spinCost;
  upgradeButton.disabled = isSpinning || balance < upgradeCost;
  window.localStorage.setItem(storageKey, String(balance));
}

function evaluateSpin(results) {
  const counts = results.reduce((map, symbol) => {
    map[symbol] = (map[symbol] || 0) + 1;
    return map;
  }, {});

  let winnings = 0;
  let note = "";

  if (counts["🪙"] === 3) {
    winnings = 15;
    note = "Jackpot. The machine has emitted pure tokenized nonsense.";
  } else if (counts["🤖"] === 3) {
    winnings = 12;
    note = "Triple robots. You have successfully automated gambling.";
  } else if (counts["⚡"] === 3) {
    winnings = 10;
    note = "Full voltage. Somewhere, an AI demo just raised seed funding.";
  } else if (Object.values(counts).some((count) => count >= 2)) {
    winnings = 5;
    note = "Nice pair. The machine calls this a strategic alignment event.";
  } else {
    note = "No payout. The model would like you to try rephrasing your spin.";
  }

  if (results.includes("🔥")) {
    winnings -= 2;
    note += " Also, a flame token appeared and burned platform fees on contact.";
  }

  balance = Math.max(balance + winnings, 0);

  if (winnings > 0) {
    setMessage(`${note} You netted ${winnings} tokens.`);
    return;
  }

  if (winnings < 0) {
    setMessage(`${note} You lost ${Math.abs(winnings)} extra tokens.`);
    return;
  }

  setMessage(`${note} You netted 0 tokens.`);
}

function animateReel(reel, duration, finalSymbol) {
  reel.classList.add("spinning");

  const interval = window.setInterval(() => {
    reel.textContent = randomSymbol();
  }, 90);

  window.setTimeout(() => {
    window.clearInterval(interval);
    reel.textContent = finalSymbol;
    reel.classList.remove("spinning");
  }, duration);
}

function spin() {
  if (isSpinning || balance < spinCost) {
    return;
  }

  isSpinning = true;
  balance -= spinCost;
  updateBalance();

  setMessage(spinMessages[Math.floor(Math.random() * spinMessages.length)]);

  const results = [randomSymbol(), randomSymbol(), randomSymbol()];

  reels.forEach((reel, index) => {
    animateReel(reel, 700 + index * 320, results[index]);
  });

  window.setTimeout(() => {
    evaluateSpin(results);
    isSpinning = false;
    updateBalance();

    if (balance < spinCost) {
      setMessage("Out of tokens. The machine suggests upgrading to the Human Wallet add-on.");
    }
  }, 1500);
}

function buyUpgrade() {
  if (isSpinning || balance < upgradeCost) {
    return;
  }

  balance -= upgradeCost;
  updateBalance();
  setMessage(upgradeMessages[Math.floor(Math.random() * upgradeMessages.length)]);
}

spinButton.addEventListener("click", spin);
upgradeButton.addEventListener("click", buyUpgrade);

const savedMessage = window.localStorage.getItem(messageKey);
if (savedMessage) {
  messageEl.textContent = savedMessage;
}

updateBalance();
