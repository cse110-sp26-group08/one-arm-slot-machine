const symbols = ['🍒','🍋','🍊','🔔','⭐','💎','🤖'];
const tokensEl = document.getElementById('tokens');
const messageEl = document.getElementById('message');
const logEl = document.getElementById('log');
let tokens = 100;

function updateTokens(){ tokensEl.textContent = tokens }
function pushLog(text){ const li = document.createElement('li'); li.textContent = text; logEl.prepend(li); }

function randSymbol(){ return symbols[Math.floor(Math.random()*symbols.length)]; }

function spinOnce(){
  if(tokens <= 0){ messageEl.textContent = "AI predicted this—you're out of tokens. Try buying a prompt."; return }
  tokens -= 1;
  updateTokens();
  messageEl.textContent = "The AI says: low chance. You say: spin!";

  const r1 = document.getElementById('r1');
  const r2 = document.getElementById('r2');
  const r3 = document.getElementById('r3');

  [r1,r2,r3].forEach(r=>{ r.classList.remove('win'); r.classList.add('spin'); });

  // Fake reel delay then set results
  setTimeout(()=>{ r1.textContent = randSymbol(); r1.classList.remove('spin'); }, 160);
  setTimeout(()=>{ r2.textContent = randSymbol(); r2.classList.remove('spin'); }, 320);
  setTimeout(()=>{
    r3.textContent = randSymbol(); r3.classList.remove('spin');
    evaluate(r1.textContent, r2.textContent, r3.textContent);
  }, 560);
}

function evaluate(a,b,c){
  let win = 0;
  if(a===b && b===c){
    if(a==='💎') win = 200; else if(a==='🤖') win = 150; else win = 50;
  } else if(a===b || b===c || a===c){ win = 8 }

  if(win>0){ tokens += win; updateTokens(); messageEl.textContent = tauntWin(win); highlightWin(); pushLog(`You won ${win} tokens! AI confused.`); }
  else { messageEl.textContent = tauntLose(); pushLog('No win — the AI is smug.'); }
}

function tauntWin(win){
  const lines = [
    `AI said 'unlikely' — you just scored ${win} tokens. Oops.`,
    `The model mispredicted. Tokens +${win}. You're smarter than its training set.`,
    `AI: 'low confidence'. You: +${win} tokens.`
  ];
  return lines[Math.floor(Math.random()*lines.length)];
}

function tauntLose(){
  const lines = [
    `The AI claims victory. You have better taste than its loss function.`,
    `Model confidence high, payout low. Keep calm and pull again.`,
    `The AI wrote a blog post predicting your defeat. It was wrong.`
  ];
  return lines[Math.floor(Math.random()*lines.length)];
}

function highlightWin(){
  const reels = [document.getElementById('r1'),document.getElementById('r2'),document.getElementById('r3')];
  reels.forEach(r=>r.classList.add('win'));
  setTimeout(()=>reels.forEach(r=>r.classList.remove('win')),900);
}

document.getElementById('spinBtn').addEventListener('click', spinOnce);
document.getElementById('buyBtn').addEventListener('click', ()=>{
  if(tokens < 10){ messageEl.textContent = 'Not enough tokens to buy a prompt.'; return }
  tokens -= 10; updateTokens(); pushLog('Bought a prompt — AI feels threatened.'); messageEl.textContent = 'Bought a prompt. The AI wonders why.';
});
document.getElementById('trainBtn').addEventListener('click', ()=>{
  if(tokens < 20){ messageEl.textContent = 'Not enough tokens to train the AI.'; return }
  tokens -= 20; updateTokens(); pushLog('Trained the AI — it now predicts better... or worse.'); messageEl.textContent = 'You trained the AI. It thanks you with buggy predictions.';
});

updateTokens();
