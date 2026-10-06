import {createBoard,dropDisk,getOutcome} from './game.js';
import {chooseMove} from './ai.js';
const $=id=>document.getElementById(id);
let preferences;
try{preferences=JSON.parse(localStorage.getItem('connect-four-settings'));}catch{}
let mode=['computer','local'].includes(preferences?.mode)?preferences.mode:'computer';
let difficulty=['easy','medium','hard'].includes(preferences?.difficulty)?preferences.difficulty:'medium';
let board=createBoard(),player=1,outcome=getOutcome(board),thinking=false,requestId=0,worker,timer;
$('mode').value=mode;$('difficulty').value=difficulty;
const columns=[];
for(let c=0;c<7;c++){
 const button=document.createElement('button');button.type='button';button.className='column';button.dataset.column=c;
 for(let r=0;r<6;r++){const slot=document.createElement('span');slot.className='slot';slot.setAttribute('aria-hidden','true');button.append(slot);}
 button.addEventListener('click',()=>play(c));columns.push(button);$('board').append(button);
}
function render(last){
 for(let c=0;c<7;c++){
  const button=columns[c];button.disabled=thinking||!!outcome.winner||outcome.draw||!!board[0][c];
  const red=board.filter(row=>row[c]===1).length,yellow=board.filter(row=>row[c]===2).length;
  button.setAttribute('aria-label',`עמודה ${c+1} משמאל, ${red} אדומות, ${yellow} צהובות${board[0][c]?', מלאה':''}`);
  for(let r=0;r<6;r++){
   const slot=button.children[r];slot.replaceChildren();
   if(board[r][c]){const disk=document.createElement('span');disk.className=`disk ${board[r][c]===1?'red':'yellow'}`;
    if(outcome.cells.some(([rr,cc])=>rr===r&&cc===c))disk.classList.add('winner');
    if(last?.row===r&&last?.column===c)disk.classList.add('new');slot.append(disk);
   }
  }
 }
 let status;
 if(outcome.winner)status=mode==='computer'?(outcome.winner===1?'ניצחת! כל הכבוד 🎉':'המחשב ניצח — ננסה שוב?'):`שחקן ${outcome.winner} ניצח! 🎉`;
 else if(outcome.draw)status='תיקו! משחק צמוד במיוחד';
 else if(thinking)status='המחשב חושב…';
 else status=mode==='computer'?'התור שלך — אדום':`התור של שחקן ${player} — ${player===1?'אדום':'צהוב'}`;
 $('status').textContent=status;
 $('turn-dot').className=`turn-dot ${outcome.draw?'draw':(outcome.winner||player)===1?'red':'yellow'}`;
 $('thinking').hidden=!thinking;
 $('tap-hint').textContent=outcome.winner||outcome.draw?'משחק חדש, הזדמנות חדשה':thinking?'עוד רגע מגיע המהלך הבא':'נוגעים בעמודה כדי להכניס דיסקית';
 $('red-name').textContent=mode==='computer'?'אתה · אדום':'שחקן 1 · אדום';
 $('yellow-name').textContent=mode==='computer'?'המחשב · צהוב':'שחקן 2 · צהוב';
 $('difficulty-field').hidden=mode==='local';
}
function apply(column){
 const move=dropDisk(board,column,player);if(!move)return false;
 board=move.board;outcome=getOutcome(board);if(!outcome.winner&&!outcome.draw)player=3-player;
 render({row:move.row,column});return true;
}
function receive(data){
 if(data.requestId!==requestId||!thinking||mode!=='computer'||player!==2)return;
 clearTimeout(timer);thinking=false;
 let column=data.column;
 if(!Number.isInteger(column)||board[0][column]!==0)column=chooseMove(board,2,'medium');
 apply(column);render();
}
function fallback(id){
 if(id!==requestId||!thinking)return;
 // Keep the interface usable when workers are unavailable. Hard retains its search.
 const column=chooseMove(board,2,difficulty);receive({requestId:id,column});
}
function startComputer(){
 thinking=true;render();const id=++requestId;
 if(difficulty==='hard'){
  try{
   if(!worker){worker=new Worker(new URL('./ai-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>receive(data);worker.onerror=()=>{worker?.terminate();worker=undefined;fallback(requestId)};}
   worker.postMessage({requestId:id,board,player:2,difficulty});timer=setTimeout(()=>fallback(id),5000);
  }catch{timer=setTimeout(()=>fallback(id),300);}
 }else timer=setTimeout(()=>fallback(id),350);
}
function play(column){
 if(thinking||outcome.winner||outcome.draw||(mode==='computer'&&player!==1))return;
 if(apply(column)&&mode==='computer'&&!outcome.winner&&!outcome.draw)startComputer();
}
function reset(){requestId++;clearTimeout(timer);board=createBoard();player=1;thinking=false;outcome=getOutcome(board);render();}
function updatePreferences(){mode=$('mode').value;difficulty=$('difficulty').value;try{localStorage.setItem('connect-four-settings',JSON.stringify({mode,difficulty}));}catch{}reset();}
$('mode').addEventListener('change',updatePreferences);$('difficulty').addEventListener('change',updatePreferences);$('new-game').addEventListener('click',reset);
render();
if(typeof window!=='undefined')import('./install.js').then(({setupInstall})=>setupInstall());
