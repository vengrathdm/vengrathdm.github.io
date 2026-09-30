/* ============================================================
   TOMB OF ANNIHILATION — CAMPAIGN AUDIO
   ============================================================ */
(function(){
  const audio=document.getElementById('tombTheme');
  const toggle=document.getElementById('tombAudioToggle');
  if(!audio||!toggle) return;

  const TIME_KEY='tombThemeTime';
  const MUTED_KEY='tombThemeMuted';
  const PLAYING_KEY='tombThemePlaying';

  let userMuted=sessionStorage.getItem(MUTED_KEY)==='true';
  let restored=false;
  audio.volume=0.55;

  function savedTime(){
    const value=parseFloat(sessionStorage.getItem(TIME_KEY));
    return Number.isFinite(value)&&value>=0 ? value : 0;
  }

  function saveState(){
    if(!restored) return;
    try{
      sessionStorage.setItem(TIME_KEY,String(audio.currentTime||0));
      sessionStorage.setItem(MUTED_KEY,String(audio.muted||userMuted));
      sessionStorage.setItem(PLAYING_KEY,String(!audio.paused&&!audio.muted));
    }catch(_){}
  }

  function syncButton(){
    const playing=!audio.muted&&!audio.paused;
    toggle.classList.toggle('is-playing',playing);
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.setAttribute('aria-label',playing?'Wycisz muzykę':'Włącz dźwięk');
    toggle.title=playing?'Wycisz muzykę':'Włącz dźwięk';
  }

  function restorePosition(){
    if(restored) return;
    const saved=savedTime();
    if(audio.duration&&saved>=audio.duration) audio.currentTime=saved%audio.duration;
    else audio.currentTime=saved;
    restored=true;
  }

  async function startAudio(){
    if(!restored) restorePosition();
    try{
      audio.muted=userMuted;
      await audio.play();
      syncButton();
      saveState();
      return true;
    }catch(_){
      audio.muted=true;
      try{await audio.play();}catch(__){}
      syncButton();
      saveState();
      return false;
    }
  }

  audio.addEventListener('loadedmetadata',()=>{
    restorePosition();
    const shouldPlay=sessionStorage.getItem(PLAYING_KEY)!=='false'&&!userMuted;
    if(shouldPlay) startAudio();
    else syncButton();
  });

  toggle.addEventListener('click',async()=>{
    if(audio.paused||audio.muted){
      userMuted=false;
      try{sessionStorage.setItem(MUTED_KEY,'false');}catch(_){}
      await startAudio();
    }else{
      userMuted=true;
      audio.muted=true;
      saveState();
      syncButton();
    }
  });

  audio.addEventListener('play',syncButton);
  audio.addEventListener('pause',saveState);
  audio.addEventListener('volumechange',()=>{
    syncButton();
    saveState();
  });

  window.addEventListener('pagehide',saveState);
  window.addEventListener('beforeunload',saveState);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden') saveState();
  });

  document.addEventListener('pointerdown',async()=>{
    if(userMuted||(!audio.muted&&!audio.paused)) return;
    await startAudio();
  },{once:false,passive:true});

  if(audio.readyState>=1){
    restorePosition();
    const shouldPlay=sessionStorage.getItem(PLAYING_KEY)!=='false'&&!userMuted;
    if(shouldPlay) startAudio();
    else syncButton();
  }
})();