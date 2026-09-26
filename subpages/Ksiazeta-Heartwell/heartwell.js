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

  let userMuted=false;
  audio.volume=0.55;

  function syncButton(){
    const playing=!audio.muted&&!audio.paused;
    toggle.classList.toggle('is-playing',playing);
    toggle.setAttribute('aria-pressed',String(playing));
    toggle.setAttribute('aria-label',playing?'Wycisz muzykę':'Włącz dźwięk');
    toggle.title=playing?'Wycisz muzykę':'Włącz dźwięk';
  }

  async function startAudio(){
    try{
      audio.muted=false;
      await audio.play();
      syncButton();
      return true;
    }catch(error){
      audio.muted=true;
      try{ await audio.play(); }catch(_){}
      syncButton();
      return false;
    }
  }

  toggle.addEventListener('click',async()=>{
    if(audio.paused||audio.muted){
      userMuted=false;
      await startAudio();
    }else{
      userMuted=true;
      audio.muted=true;
      syncButton();
    }
  });

  audio.addEventListener('play',syncButton);
  audio.addEventListener('pause',syncButton);
  audio.addEventListener('volumechange',syncButton);

  document.addEventListener('pointerdown',async()=>{
    if(userMuted||(!audio.muted&&!audio.paused)) return;
    await startAudio();
  },{once:false,passive:true});

  startAudio();
})();