import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBoard,legalColumns,dropDisk,getOutcome} from '../public/game.js';
test('dimensions, gravity, immutable drop and invalid/full columns',()=>{let b=createBoard(); assert.equal(b.length,6);assert.equal(b[0].length,7);assert.equal(legalColumns(b).length,7);const d=dropDisk(b,0,1);assert.equal(d.row,5);assert.equal(b[5][0],0);for(let i=0;i<6;i++)b=dropDisk(b,0,i%2+1).board;assert.equal(dropDisk(b,0,1),null);for(const c of [-1,7,1.2,NaN])assert.equal(dropDisk(b,c,1),null)});
for(const [name,cells] of Object.entries({horizontal:[[5,0],[5,1],[5,2],[5,3]],vertical:[[2,0],[3,0],[4,0],[5,0]],diagonal:[[2,0],[3,1],[4,2],[5,3]],reverse:[[5,0],[4,1],[3,2],[2,3]]}))test(name,()=>{const b=createBoard();cells.forEach(([r,c])=>b[r][c]=1);const o=getOutcome(b);assert.equal(o.winner,1);assert.deepEqual(o.cells,cells);assert.equal(o.draw,false)});
test('full board draw and empty ongoing',()=>{const b=Array.from({length:6},(_,r)=>Array.from({length:7},(_,c)=>((c+Math.floor(r/2))%2)+1));assert.equal(getOutcome(b).draw,true);assert.equal(getOutcome(createBoard()).draw,false)});
