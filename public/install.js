export function setupInstall(){
 const install=document.getElementById('install'),help=document.getElementById('install-help');
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 let promptEvent;
 if(standalone())help.hidden=true;
 if(/iPad|iPhone|iPod/.test(navigator.userAgent))document.getElementById('install-instructions').textContent='ב־Safari לחצו על כפתור השיתוף ובחרו ״הוספה למסך הבית״.';
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();if(standalone())return;promptEvent=event;install.hidden=false;help.hidden=true;
 });
 install.addEventListener('click',async()=>{
  if(!promptEvent)return;const current=promptEvent;promptEvent=undefined;install.disabled=true;
  try{await current.prompt();await current.userChoice;}catch{}
  install.disabled=false;install.hidden=true;help.hidden=standalone();
 });
 window.addEventListener('appinstalled',()=>{promptEvent=undefined;install.hidden=true;help.hidden=true;});
 if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(()=>navigator.serviceWorker.ready).then(()=>{
   document.getElementById('offline-note').textContent='המשחק נשמר במכשיר — אפשר לשחק גם בלי אינטרנט';
  }).catch(()=>{document.getElementById('offline-note').textContent='כרגע נדרש חיבור לאינטרנט. טענו שוב כדי להפעיל משחק אופליין.';});
 }
}
