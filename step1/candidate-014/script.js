const icons = ['🤖','🪙','💾','🧠','🔋','✨','🎯']
const tokensEl = document.getElementById('tokens')
const log = document.getElementById('log')
const betInput = document.getElementById('bet')
const reels = [document.getElementById('r0'),document.getElementById('r1'),document.getElementById('r2')]

let tokens = Number(localStorage.getItem('tokens')||100)
tokensEl.textContent = tokens

function write(msg){log.textContent = 'AI: "' + msg + '"'}

function spin(){
  let bet = Math.max(1, Math.floor(Number(betInput.value)||1))
  if(tokens < bet){ write('I overestimated your bankroll. Add tokens!'); return }
  tokens -= bet; update()
  write('Analyzing user behavior... (wrong)')
  // animated quick cycle
  const stops = [randIcon(),randIcon(),randIcon()]
  let spins = 12
  const iv = setInterval(()=>{
    for(let i=0;i<3;i++) reels[i].textContent = icons[(Math.floor(Math.random()*icons.length))]
    if(--spins<=0){
      clearInterval(iv)
      // final stop with a bit of bias to make game fun
      for(let i=0;i<3;i++) reels[i].textContent = stops[i]
      resolveSpin(stops, bet)
    }
  },80)
}

function randIcon(){ return icons[Math.floor(Math.random()*icons.length)] }

function resolveSpin(res, bet){
  const [a,b,c] = res
  if(a===b && b===c){
    const win = bet*10
    tokens += win
    write(`You outsmarted the model! Jackpot +${win} tokens.`)
  } else if(a===b || b===c || a===c){
    const win = bet*2
    tokens += win
    write(`Two-in-a-row — the AI is confused. +${win} tokens.`)
  } else {
    write(randomLoseMessage())
  }
  update()
}

function randomLoseMessage(){
  const msgs = [
    "Model predicted this outcome with 0.2% confidence.",
    "Loss recorded. We will retrain the optimism.",
    "AI suggests more data; you suggest more tokens.",
    "The neural net wept; tokens gone." ]
  return msgs[Math.floor(Math.random()*msgs.length)]
}

function update(){
  tokensEl.textContent = tokens
  localStorage.setItem('tokens', tokens)
}

document.getElementById('spin').addEventListener('click', spin)
document.getElementById('more').addEventListener('click', ()=>{ tokens += 10; write('Thanks for the donation to the model.'); update() })

// initial small flourish
write('I predict... you will have fun. Probably.')
