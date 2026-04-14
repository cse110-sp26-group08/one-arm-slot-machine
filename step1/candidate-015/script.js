// Simple slot machine logic with token economy and AI taunts
(function(){
  const SYMBOLS = ["🍒","🍋","🔔","⭐","7️⃣","🤖"];
  const REEL_COUNT = 3;
  const SPIN_COST = 1;
  const AI_COST = 3;

  const tokensEl = document.getElementById('tokens');
  const messageEl = document.getElementById('message');
  const spinBtn = document.getElementById('spin');
  const addBtn = document.getElementById('addTokens');
  const askAIbtn = document.getElementById('askAI');
  const reelsEls = Array.from({length:REEL_COUNT},(_,i)=>document.getElementById('reel'+i));

  let tokens = parseInt(localStorage.getItem('tokens')||'20',10);
  let spinning = false;
  updateUI();

  addBtn.addEventListener('click',()=>{ tokens += 5; persist(); flash('Added 5 tokens — you rascal!'); });
  spinBtn.addEventListener('click', spin);
  askAIbtn.addEventListener('click', askAI);

  function persist(){ localStorage.setItem('tokens', tokens); updateUI(); }
  function updateUI(){ tokensEl.textContent = tokens; }
  function flash(text){ messageEl.textContent = text; messageEl.classList.add('taunt'); setTimeout(()=>messageEl.classList.remove('taunt'),900); }

  function randomSymbol(){ return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]; }

  function spin(){
    if(spinning) return;
    if(tokens < SPIN_COST){ flash('Not enough tokens — bribe the AI or add tokens.'); return; }
    spinning = true;
    tokens -= SPIN_COST;
    persist();
    flash('Spinning... the AI is recalculating regret.');

    // animate by rapidly changing symbols for a time
    const DURATION = 1200;
    const start = Date.now();
    const intervals = [];
    reelsEls.forEach((el,idx)=>{
      const iv = setInterval(()=>{ el.textContent = randomSymbol(); }, 70 + idx*30);
      intervals.push(iv);
    });

    setTimeout(()=>{
      intervals.forEach(clearInterval);
      // final result
      const result = reelsEls.map(()=>randomSymbol());
      reelsEls.forEach((el,i)=>el.textContent = result[i]);
      const payout = evaluate(result);
      if(payout>0){ tokens += payout; persist(); flash(winMessage(result,payout)); }
      else{ flash(loseMessage()); }
      spinning = false;
    }, DURATION);
  }

  function evaluate(res){
    // three of a kind
    if(res[0]===res[1] && res[1]===res[2]){
      if(res[0]==='7️⃣') return 50; // jackpot
      if(res[0]==='🤖') return 5; // robots pity prize
      return 15;
    }
    // two of a kind
    if(res[0]===res[1]||res[0]===res[2]||res[1]===res[2]) return 3;
    // special: any robot gives a small nudge
    if(res.includes('🤖')) return 1;
    return 0;
  }

  function winMessage(res,payout){
    const sym = res[0]===res[1]&&res[1]===res[2] ? res[0] : 'a surprise';
    return `Nice! You won ${payout} token${payout>1?'s':''} — even the AI is confused by ${sym}.`;
  }

  function loseMessage(){
    const snark = [
      'The AI predicted this loss with 99.9% confidence.',
      'Model says: not today, human. Try again.',
      'AI is learning — you are teaching it disappointment.'
    ];
    return snark[Math.floor(Math.random()*snark.length)];
  }

  function askAI(){
    if(tokens < AI_COST){ flash('You cannot afford AI insights. It costs tokens and dignity.'); return; }
    tokens -= AI_COST; persist();
    flash('AI thinking... (for a small fee)');
    setTimeout(()=>{
      // AI gives a bogus prediction and sometimes a bonus
      const prediction = Math.random() < 0.4 ? 'Go for it!' : 'Probably not.';
      let bonus = 0;
      if(Math.random()<0.2){ bonus = 4; tokens += bonus; persist(); }
      const bonusText = bonus? ` The AI relents and spits out ${bonus} free tokens.` : '';
      flash(`AI: "${prediction}"${bonusText}`);
    }, 900);
  }

})();
