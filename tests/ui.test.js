import {test} from 'node:test';import assert from 'node:assert/strict';
class Element {
 constructor(){this.children=[];this.listeners={};this.className='';this.textContent='';this.dataset={};this.value='medium';this.disabled=false;this.hidden=false;this.attributes={};this.classList={add:name=>{this.className+=' '+name}};}
 append(x){this.children.push(x)}replaceChildren(){this.children=[]}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){this.listeners[k]=fn}click(){if(!this.disabled)this.listeners.click?.()}change(){this.listeners.change?.()}
}
async function setup(suffix,storage){const els={};globalThis.document={getElementById:id=>els[id]??=new Element(),createElement:()=>new Element()};globalThis.localStorage=storage||{getItem:()=>null,setItem:()=>{}};const workers=[];globalThis.Worker=class{constructor(){workers.push(this)}postMessage(message){this.message=message}terminate(){}};await import('../public/app.js?'+suffix);return {els,workers};}
const disks=els=>els.board.children.flatMap(b=>b.children.flatMap(s=>s.children));
test('actual UI handles local win, blocked game over, reset and stale computer response',async()=>{
 const {els,workers}=await setup('main');assert.equal(els.board.children.length,7);
 els.mode.value='local';els.mode.change();for(const c of [0,6,1,6,2,5,3])els.board.children[c].click();
 assert.equal(disks(els).filter(d=>d.className.includes('winner')).length,4);assert.match(els.status.textContent,/ניצח/);assert.ok(els.board.children.every(b=>b.disabled));
 els['new-game'].click();assert.equal(disks(els).length,0);
 els.mode.value='computer';els.mode.change();els.difficulty.value='hard';els.difficulty.change();els.board.children[3].click();els.board.children[2].click();assert.equal(disks(els).length,1);assert.ok(els.board.children.every(b=>b.disabled));
 const message=workers[0].message;els['new-game'].click();workers[0].onmessage({data:{requestId:message.requestId,column:2}});assert.equal(disks(els).length,0);
 els.board.children[0].click();workers[0].onmessage({data:{requestId:workers[0].message.requestId,column:3}});assert.equal(disks(els).length,2);assert.match(els.status.textContent,/התור שלך/);els['new-game'].click();
});
test('corrupt and unavailable storage keep the UI playable',async()=>{for(const [i,storage] of [{getItem:()=>'{bad',setItem:()=>{}},{getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}}].entries()){const {els}=await setup('storage'+i,storage);assert.equal(els.mode.value,'computer');els.mode.value='local';els.mode.change();els.board.children[0].click();assert.equal(disks(els).length,1);els['new-game'].click();}});
