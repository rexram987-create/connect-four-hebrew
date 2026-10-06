import {dropDisk, getOutcome, legalColumns} from './game.js';
const ORDER = [3, 2, 4, 1, 5, 0, 6];
const moves = board => ORDER.filter(c => legalColumns(board).includes(c));
function score(board, player) {
  const opponent = 3 - player;
  let value = 0;
  for (let r=0;r<6;r++) if (board[r][3]) value += board[r][3]===player ? 6 : -6;
  for(let r=0;r<6;r++) for(let c=0;c<7;c++) for(const [dr,dc] of [[0,1],[1,0],[1,1],[-1,1]]) {
    const rr=r+3*dr, cc=c+3*dc;
    if(rr<0||rr>5||cc<0||cc>6) continue;
    const cells=Array.from({length:4},(_,i)=>board[r+i*dr][c+i*dc]);
    const mine=cells.filter(p=>p===player).length, theirs=cells.filter(p=>p===opponent).length;
    if(!theirs) value += [0,1,12,80,100000][mine];
    if(!mine) value -= [0,1,14,100,100000][theirs];
  }
  return value;
}
function search(board, turn, player, depth, alpha, beta) {
  const outcome=getOutcome(board);
  if(outcome.winner) return outcome.winner===player ? 1000000+depth : -1000000-depth;
  if(outcome.draw) return 0;
  if(!depth) return score(board,player);
  const maximize=turn===player;
  let best=maximize ? -Infinity : Infinity;
  for(const c of moves(board)) {
    const value=search(dropDisk(board,c,turn).board,3-turn,player,depth-1,alpha,beta);
    best=maximize ? Math.max(best,value) : Math.min(best,value);
    if(maximize) alpha=Math.max(alpha,best);else beta=Math.min(beta,best);
    if(beta<=alpha) break;
  }
  return best;
}
export function chooseMove(board, player, difficulty, random=Math.random) {
  const terminal=getOutcome(board);
  if(terminal.winner||terminal.draw) return null;
  const options=moves(board);
  if(difficulty==='easy') return options[Math.min(options.length-1,Math.floor(random()*options.length))];
  for(const p of [player,3-player]) for(const c of options) {
    if(getOutcome(dropDisk(board,c,p).board).winner===p) return c;
  }
  let best=-Infinity, column=options[0];
  for(const c of options) {
    const next=dropDisk(board,c,player).board;
    const value=difficulty==='hard' ? search(next,3-player,player,4,-Infinity,Infinity) : score(next,player);
    if(value>best) {best=value;column=c;}
  }
  return column;
}
