const symbols = [
  { icon: "GPU", label: "rented compute" },
  { icon: "404", label: "missing grounding" },
  { icon: "LOL", label: "hallucinated confidence" },
  { icon: "BOT", label: "automated hustle" },
  { icon: "SPAM", label: "engagement strategy" },
  { icon: "VC", label: "seed round cosplay" }
];

const spinButton = document.getElementById("spinButton");
const cashOutButton = document.getElementById("cashOutButton");
const tokenBalanceEl = document.getElementById("tokenBalance");
const spinCostEl = document.getElementById("spinCost");
const lastPayoutEl = document.getElementById("lastPayout");
const messageEl = document.getElementById("message");
const reelEls = [
  document.getElementById("reel1"),
  document.getElementById("reel2"),
  document.getElementById("reel3")
];

let tokens = 120;
let spinCost = 15;
let lastPayout = 0;
let spinning = false;

function updateUI() {
  tokenBalanceEl.textContent = String(tokens);
  spinCostEl.textContent = String(spinCost);
  lastPayoutEl.textContent = String(lastPayout);
  spinButton.disabled = spinning || tokens < spinCost;
  cashOutButton.disabled = spinning || tokens < 30;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function pause(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function chirp(frequency, duration, type = "square", volume = 0.03) {
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef) return;

  if (!chirp.ctx) {
    chirp.ctx = new AudioContextRef();
  }

  const ctx = chirp.ctx;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
  oscillator.stop(ctx.currentTime + duration / 1000);
}

function celebrate() {
  chirp(660, 120, "triangle", 0.04);
  window.setTimeout(() => chirp(880, 140, "triangle", 0.04), 90);
  if ("vibrate" in navigator) {
    navigator.vibrate([60, 30, 90]);
  }
}

function groan() {
  chirp(180, 180, "sawtooth", 0.035);
  if ("vibrate" in navigator) {
    navigator.vibrate(120);
  }
}

function evaluateSpin(results) {
  const icons = results.map(result => result.icon);
  const counts = icons.reduce((map, icon) => {
    map[icon] = (map[icon] || 0) + 1;
    return map;
  }, {});

  const highestMatch = Math.max(...Object.values(counts));
  const allGpu = icons.every(icon => icon === "GPU");
  const all404 = icons.every(icon => icon === "404");

  if (allGpu) {
    return {
      payout: 90,
      message: "Triple GPU. Congratulations, your fake startup is now burning money at enterprise speed."
    };
  }

  if (all404) {
    return {
      payout: 60,
      message: "Triple 404. The machine could not find facts, but it did find profit."
    };
  }

  if (highestMatch === 3) {
    return {
      payout: 45,
      message: `Triple ${icons[0]}. The board calls this 'product-market fit'.`
    };
  }

  if (highestMatch === 2) {
    return {
      payout: 25,
      message: "A pair! The algorithm has rewarded your reckless optimism."
    };
  }

  return {
    payout: 0,
    message: "No match. The AI used your tokens to generate a blurry frog CEO portrait."
  };
}

async function spin() {
  if (spinning || tokens < spinCost) return;

  spinning = true;
  tokens -= spinCost;
  lastPayout = 0;
  setMessage("Consulting the machine learning oracle...");
  updateUI();

  reelEls.forEach(reel => reel.classList.add("spinning"));

  for (let i = 0; i < reelEls.length; i += 1) {
    for (let tick = 0; tick < 10 + i * 4; tick += 1) {
      reelEls[i].textContent = randomSymbol().icon;
      chirp(300 + tick * 18, 25, "square", 0.015);
      await pause(70);
    }

    const result = randomSymbol();
    reelEls[i].textContent = result.icon;
    reelEls[i].dataset.label = result.label;
  }

  reelEls.forEach(reel => reel.classList.remove("spinning"));

  const results = reelEls.map(reel => ({
    icon: reel.textContent,
    label: reel.dataset.label
  }));

  const outcome = evaluateSpin(results);
  lastPayout = outcome.payout;
  tokens += outcome.payout;

  if (outcome.payout > 0) {
    celebrate();
  } else {
    groan();
  }

  if (tokens <= 0) {
    setMessage(`${outcome.message} You are out of tokens. Time to pivot into AI consulting.`);
  } else {
    setMessage(outcome.message);
  }

  spinCost = Math.min(40, spinCost + 1);
  spinning = false;
  updateUI();
}

function cashOut() {
  if (spinning || tokens < 30) return;

  tokens -= 30;
  lastPayout = 0;
  setMessage("You spent 30 tokens on 'premium prompt engineering'. It was just adding PLEASE.");
  chirp(520, 90, "triangle", 0.03);
  updateUI();
}

spinButton.addEventListener("click", spin);
cashOutButton.addEventListener("click", cashOut);

updateUI();
