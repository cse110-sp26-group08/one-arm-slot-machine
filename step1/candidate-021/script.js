const symbols = [
  "GPU",
  "HYPE",
  "TOKEN",
  "VIBE",
  "PIVOT",
  "AGENT",
  "PROMPT",
  "SLIDE"
];

const reels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3")
];

const reelFrames = Array.from(document.querySelectorAll(".reel"));
const tokenCount = document.getElementById("token-count");
const message = document.getElementById("message");
const spinButton = document.getElementById("spin-button");
const resetButton = document.getElementById("reset-button");
const logList = document.getElementById("log-list");
const hypeBar = document.getElementById("hype-bar");
const hypeValue = document.getElementById("hype-value");

const spinCost = 5;
const startingTokens = 30;
const maxLogEntries = 6;

let tokens = startingTokens;
let hype = 22;
let spinning = false;

const jokeBank = {
  jackpot: [
    "Triple match. Investors just funded your startup because the demo used the word 'agentic' nine times.",
    "Jackpot. Your token balance exploded faster than a GPU budget during a board meeting.",
    "Three of a kind. Congratulations, you've monetized autocomplete and called it destiny."
  ],
  pair: [
    "A pair. Not bad. That's enough tokens to generate one more slide deck about AI synergies.",
    "Two symbols match. The machine rewards your brave decision to rename bugs as emergent behavior.",
    "Small win. Product says this counts as traction, so who's arguing?"
  ],
  bust: [
    "Nothing lined up. Those tokens were immediately spent on a keynote featuring the phrase 'multimodal moat.'",
    "Bust. Finance has reclassified your spin as strategic experimentation.",
    "No match. The machine consumed your budget and produced a slightly longer roadmap."
  ],
  broke: [
    "You're out of tokens. Time to pivot to a subscription tier called Pro Max Ultra Intelligence.",
    "Wallet empty. Please clap while the company raises a bridge round for compute."
  ]
};

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function randomMessage(type) {
  const group = jokeBank[type];
  return group[Math.floor(Math.random() * group.length)];
}

function updateTokenUI() {
  tokenCount.textContent = String(tokens);
  spinButton.disabled = spinning || tokens < spinCost;
}

function updateHype(amount) {
  hype = Math.max(4, Math.min(100, hype + amount));
  hypeBar.style.width = `${hype}%`;
  hypeValue.textContent = `${hype}%`;
}

function addLogEntry(text, tone) {
  const item = document.createElement("li");
  const labelClass = tone === "positive" ? "positive" : "negative";
  item.innerHTML = `<strong class="${labelClass}">${tone === "positive" ? "Credit" : "Debit"}:</strong> ${text}`;
  logList.prepend(item);

  while (logList.children.length > maxLogEntries) {
    logList.removeChild(logList.lastChild);
  }
}

function setMessage(text) {
  message.textContent = text;
}

function evaluateSpin(results) {
  const unique = new Set(results).size;

  if (unique === 1) {
    tokens += 45;
    updateHype(24);
    setMessage(randomMessage("jackpot"));
    addLogEntry(`Won 45 tokens on ${results.join(" / ")}. The AI demo now has cinematic trailer music.`, "positive");
  } else if (unique === 2) {
    tokens += 12;
    updateHype(10);
    setMessage(randomMessage("pair"));
    addLogEntry(`Won 12 tokens with a near-match on ${results.join(" / ")}. Enough runway for one more pivot.`, "positive");
  } else {
    updateHype(-8);
    setMessage(randomMessage("bust"));
    addLogEntry(`Spent 5 tokens on ${results.join(" / ")}. The burn rate remains visionary.`, "negative");
  }

  updateTokenUI();

  if (tokens < spinCost) {
    setMessage(`${message.textContent} ${randomMessage("broke")}`);
  }
}

function animateReel(index, finalValue, delay) {
  return new Promise((resolve) => {
    const frame = reelFrames[index];
    const reel = reels[index];
    frame.classList.add("spinning");

    const interval = window.setInterval(() => {
      reel.textContent = randomSymbol();
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(interval);
      reel.textContent = finalValue;
      frame.classList.remove("spinning");
      resolve();
    }, delay);
  });
}

async function spin() {
  if (spinning || tokens < spinCost) {
    return;
  }

  spinning = true;
  tokens -= spinCost;
  updateTokenUI();
  setMessage("Spinning up a fresh batch of synthetic confidence...");

  const results = [randomSymbol(), randomSymbol(), randomSymbol()];

  await Promise.all(results.map((result, index) => animateReel(index, result, 700 + index * 240)));

  evaluateSpin(results);
  spinning = false;
  updateTokenUI();
}

function resetGame() {
  tokens = startingTokens;
  hype = 22;
  spinning = false;
  reels.forEach((reel) => {
    reel.textContent = "GPU";
  });
  logList.innerHTML = "";
  setMessage("Wallet refilled. The lab assures you this round of hype is definitely sustainable.");
  updateHype(0);
  updateTokenUI();
  addLogEntry("Injected 30 fresh tokens from the emergency venture reserve.", "positive");
}

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);

updateTokenUI();
addLogEntry("Loaded 30 tokens. Governance approved recreational experimentation.", "positive");
