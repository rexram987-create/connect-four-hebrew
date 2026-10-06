export const createBoard=()=>Array.from({length:6},()=>Array(7).fill(0));
export const legalColumns=b=>Array.from({length:7},(_,c)=>c).filter(c=>b[0][c]===0);
export function dropDisk(b,c,p){if(!Number.isInteger(c)||c<0||c>6||![1,2].includes(p))return null;for(let r=5;r>=0;r--)if(!b[r][c]){const board=b.map(row=>row.slice());board[r][c]=p;return {board,row:r};}return null;}
export function getOutcome(b){for(let r=0;r<6;r++)for(let c=0;c<7;c++)if(b[r][c])for(const [dr,dc] of [[0,1],[1,0],[1,1],[-1,1]]){const cells=Array.from({length:4},(_,i)=>[r+dr*i,c+dc*i]);if(cells.every(([rr,cc])=>rr>=0&&rr<6&&cc>=0&&cc<7&&b[rr][cc]===b[r][c]))return {winner:b[r][c],cells,draw:false};}return {winner:0,cells:[],draw:legalColumns(b).length===0};}
