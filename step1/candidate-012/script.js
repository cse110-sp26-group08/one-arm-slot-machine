// Simple slot machine logic — vanilla JS
const symbols = ["🍒","🍋","🍀","🔔","💎","🤖"];
const costs = {spin:5};
const tokensEl = document.getElementById('tokens');
const spinBtn = document.getElementById('spinBtn');
const leverBtn = document.getElementById('leverBtn');
const resetBtn = document.getElementById('resetBtn');
const msg = document.getElementById('message');
const aiPred = document.getElementById('aiPrediction');
const reels = [document.getElementById('reel1'),document.getElementById('reel2'),document.getElementById('reel3')];

let tokens = Number(localStorage.getItem('tokens')) || 50;
tokensEl.textContent = tokens;

function updateAIMessage(){
  const predictions = [
    'AI: 99.7% chance you lose. Sorry. — not sorry.',
    'AI: Calculating regret… done.',
    'AI: Confidence low. Buy more tokens.',
    'AI: Your emotional support token has expired.'
  ];
  aiPred.textContent = predictions[Math.floor(Math.random()*predictions.length)];
}

function spinAnimation(duration=1200){
  reels.forEach(r=>r.classList.add('spinning'));
  return new Promise(res=>setTimeout(()=>{reels.forEach(r=>r.classList.remove('spinning'));res();},duration));
}

function pickResult(){
  const res = [];
  for(let i=0;i<3;i++) res.push(symbols[Math.floor(Math.random()*symbols.length)]);
  return res;
}

function evaluate(result){
  // simple payouts: triple same = +40, two same = +10, special robot triple = +100
  if(result[0]===result[1] && result[1]===result[2]){
    if(result[0]==='🤖') return 100;
    return 40;
  }
  if(result[0]===result[1]||result[0]===result[2]||result[1]===result[2]) return 10;
  return 0;
}

async function doSpin(){
  if(tokens < costs.spin){ msg.textContent = 'You need more tokens. The AI offers no loans.'; return; }
  // charge
  tokens -= costs.spin; tokensEl.textContent = tokens; localStorage.setItem('tokens',tokens);
  spinBtn.disabled = true; leverBtn.disabled = true; msg.textContent = 'Spinning… the AI watches.'; updateAIMessage();

  // animate random cycling
  let cycles = 9;
  while(cycles--){
    reels.forEach((r)=> r.textContent = symbols[Math.floor(Math.random()*symbols.length)] );
    await new Promise(r=>setTimeout(r,70 + Math.random()*80));
  }

  // final slow spin + reveal
  await spinAnimation(900);
  const result = pickResult();
  reels.forEach((r,i)=> r.textContent = result[i]);
  const payout = evaluate(result);
  if(payout>0){ tokens += payout; msg.textContent = `You won ${payout} tokens! Even the AI is surprised.`; }
  else { msg.textContent = 'No match. AI: I predicted this outcome precisely.'; }
  tokensEl.textContent = tokens; localStorage.setItem('tokens',tokens);

  // cheeky AI comments
  if(payout>=100){ aiPred.textContent = 'AI: Error — model outperformed by human. Submitting apology.' }
  else if(payout>0) aiPred.textContent = 'AI: Unexpected positive feedback loop detected.'
  else updateAIMessage();

  spinBtn.disabled = false; leverBtn.disabled = false;
}

spinBtn.addEventListener('click',doSpin);
leverBtn.addEventListener('click',()=>{ // lever triggers same as spin
  spinBtn.classList.add('pushed'); setTimeout(()=>spinBtn.classList.remove('pushed'),120);
  doSpin();
});

resetBtn.addEventListener('click',()=>{ tokens = 50; localStorage.setItem('tokens',tokens); tokensEl.textContent = tokens; msg.textContent = 'Tokens reset to 50. AI: Restarting confidence metrics.'; updateAIMessage(); });

// playful initial setup
updateAIMessage();
msg.textContent = 'Welcome! Try to beat the AI. Spins cost 5 tokens.';
