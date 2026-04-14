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
