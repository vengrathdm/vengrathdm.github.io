/* AZALIN — CAMPAIGN AUDIO */
(function(){
  const audio=document.getElementById('azalinTheme');
  const toggle=document.getElementById('azalinAudioToggle');
  if(!audio||!toggle) return;

  const TIME_KEY='azalinThemeTime';
  const MUTED_KEY='azalinThemeMuted';
  const PLAYING_KEY='azalinThemePlaying';

  let userMuted=sessionStorage.getItem(MUTED_KEY)==='true';
  let restored=false;
  audio.volume=0.55;

  function getSavedTime(){
    const saved=parseFloat(sessionStorage.getItem(TIME_KEY));
    return Number.isFinite(saved)&&saved>=0?saved:0;
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
    const saved=getSavedTime();
    if(audio.duration&&saved>=audio.duration) audio.currentTime=saved%audio.duration;
    else if(audio.readyState>=1) audio.currentTime=saved;
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
    }catch(error){
      console.warn('azalin: audio playback was blocked or unavailable.',error);
      syncButton();
      return false;
    }
  }

  audio.addEventListener('loadedmetadata',()=>{
    restorePosition();
    const shouldPlay=sessionStorage.getItem(PLAYING_KEY)!=='false'&&!userMuted;
    if(shouldPlay) startAudio();
    else syncButton();
  });

  audio.addEventListener('error',()=>{
    console.warn('azalin: audio file could not be loaded.',audio.currentSrc);
    toggle.classList.remove('is-playing');
    toggle.setAttribute('aria-pressed','false');
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