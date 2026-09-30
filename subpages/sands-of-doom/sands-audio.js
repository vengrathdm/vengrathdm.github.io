(function(){
  const audio=document.getElementById('sandsTheme'),toggle=document.getElementById('sandsAudioToggle');
  if(!audio||!toggle)return;
  const T='sandsThemeTime',M='sandsThemeMuted',P='sandsThemePlaying';
  let userMuted=sessionStorage.getItem(M)==='true',restored=false;
  audio.volume=.55;
  function saved(){const n=parseFloat(sessionStorage.getItem(T));return Number.isFinite(n)&&n>=0?n:0}
  function save(){if(!restored)return;try{
    sessionStorage.setItem(T,String(audio.currentTime||0));
    sessionStorage.setItem(M,String(audio.muted||userMuted));
    sessionStorage.setItem(P,String(!audio.paused&&!audio.muted));
  }catch(_){}}
  function sync(){
    const p=!audio.muted&&!audio.paused;
    toggle.classList.toggle('is-playing',p);
    toggle.setAttribute('aria-pressed',String(p));
    toggle.setAttribute('aria-label',p?'Wycisz muzykę':'Włącz muzykę');
    toggle.title=p?'Wycisz muzykę':'Włącz muzykę';
  }
  function restore(){
    if(restored)return;
    const s=saved();
    audio.currentTime=audio.duration&&s>=audio.duration?s%audio.duration:s;
    restored=true;
  }
  async function start(){
    if(!restored)restore();
    try{
      audio.muted=userMuted;
      await audio.play();
      sync();save();return true;
    }catch(e){
      audio.muted=true;
      try{await audio.play()}catch(_){}
      sync();save();return false;
    }
  }
  audio.addEventListener('loadedmetadata',()=>{
    restore();
    if(sessionStorage.getItem(P)!=='false'&&!userMuted)start();else sync();
  });
  toggle.addEventListener('click',async()=>{
    if(audio.paused||audio.muted){
      userMuted=false;
      try{sessionStorage.setItem(M,'false')}catch(_){}
      await start();
    }else{
      userMuted=true;audio.muted=true;save();sync();
    }
  });
  audio.addEventListener('play',sync);
  audio.addEventListener('pause',save);
  audio.addEventListener('volumechange',()=>{sync();save()});
  addEventListener('pagehide',save);
  addEventListener('beforeunload',save);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
  document.addEventListener('pointerdown',async()=>{
    if(userMuted||(!audio.muted&&!audio.paused))return;
    await start();
  },{passive:true});
  if(audio.readyState>=1){
    restore();
    if(sessionStorage.getItem(P)!=='false'&&!userMuted)start();else sync();
  }
})();