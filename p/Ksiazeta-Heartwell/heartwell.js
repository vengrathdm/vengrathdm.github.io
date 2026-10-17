/* ============================================================
   KSIĄŻĘTA HEARTWELL — CAMPAIGN INTERACTIONS
   ============================================================ */

/* CASE LOG ACCORDION */
document.querySelectorAll('.report-head').forEach(button => {
  button.addEventListener('click', () => {
    const entry = button.closest('.report-entry');
    if (!entry) return;
    entry.classList.toggle('open');
    button.setAttribute('aria-expanded', String(entry.classList.contains('open')));
  });
});

/* HEARTWELL THEME AUDIO */
(function(){
  const audio=document.getElementById('heartwellTheme');
  const toggle=document.getElementById('heartwellAudioToggle');
  if(!audio||!toggle) return;

  const TIME_KEY='heartwellThemeTime';
  const MUTED_KEY='heartwellThemeMuted';
  const PLAYING_KEY='heartwellThemePlaying';

  let userMuted=sessionStorage.getItem(MUTED_KEY)==='true';
  let restored=false;
  let restoring=true;
  audio.volume=0.55;

  function getSavedTime(){
    const saved=parseFloat(sessionStorage.getItem(TIME_KEY));
    return Number.isFinite(saved) && saved >= 0 ? saved : 0;
  }

  function saveState(){
    if(!restored) return;
    try{
      sessionStorage.setItem(TIME_KEY,String(audio.currentTime || 0));
      sessionStorage.setItem(MUTED_KEY,String(audio.muted || userMuted));
      sessionStorage.setItem(PLAYING_KEY,String(!audio.paused && !audio.muted));
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
    const saved=getSavedTime();

    if(audio.duration && saved >= audio.duration){
      audio.currentTime=saved % audio.duration;
    }else{
      audio.currentTime=saved;
    }

    restored=true;
    restoring=false;
  }

  async function startAudio(){
    if(!restored) restorePosition();

    try{
      audio.muted=userMuted;
      await audio.play();
      syncButton();
      saveState();
      return true;
    }catch(error){
      /* Browser autoplay policy: keep the saved position while muted. */
      audio.muted=true;
      try{ await audio.play(); }catch(_){}
      syncButton();
      if(restored) saveState();
      return false;
    }
  }

  /*
   * Save before normal navigation so the next HTML document gets
   * the exact position at which the user changed tabs.
   */
  document.querySelectorAll('.tab-btn').forEach(link=>{
    link.addEventListener('click',()=>{
      saveState();
    });
  });

  audio.addEventListener('loadedmetadata',()=>{
    restorePosition();

    const shouldPlay=sessionStorage.getItem(PLAYING_KEY)!=='false' && !userMuted;
    if(shouldPlay) startAudio();
    else syncButton();
  });

  toggle.addEventListener('click',async()=>{
    if(audio.paused||audio.muted){
      userMuted=false;
      try{ sessionStorage.setItem(MUTED_KEY,'false'); }catch(_){}
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

  /* Metadata may already be available from cache. */
  if(audio.readyState>=1){
    restorePosition();
    const shouldPlay=sessionStorage.getItem(PLAYING_KEY)!=='false' && !userMuted;
    if(shouldPlay) startAudio();
    else syncButton();
  }
})();