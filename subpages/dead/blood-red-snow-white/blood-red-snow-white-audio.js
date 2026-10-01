/* BLOOD RED SNOW WHITE — CAMPAIGN AUDIO */
(function(){
  const audio=document.getElementById("brswTheme"),toggle=document.getElementById("brswAudioToggle");
  if(!audio||!toggle)return;
  const T="brswThemeTime",M="brswThemeMuted",P="brswThemePlaying";
  let userMuted=sessionStorage.getItem(M)==="true",restored=false;
  audio.volume=.55;
  const saved=()=>{const v=parseFloat(sessionStorage.getItem(T));return Number.isFinite(v)&&v>=0?v:0};
  const save=()=>{if(!restored)return;try{sessionStorage.setItem(T,String(audio.currentTime||0));sessionStorage.setItem(M,String(audio.muted||userMuted));sessionStorage.setItem(P,String(!audio.paused&&!audio.muted))}catch(_){}};
  const sync=()=>{const playing=!audio.muted&&!audio.paused;toggle.classList.toggle("is-playing",playing);toggle.setAttribute("aria-pressed",String(playing));toggle.setAttribute("aria-label",playing?"Wycisz muzykę":"Włącz dźwięk");toggle.title=playing?"Wycisz muzykę":"Włącz dźwięk"};
  const restore=()=>{if(restored)return;const v=saved();if(audio.duration&&v>=audio.duration)audio.currentTime=v%audio.duration;else if(audio.readyState>=1)audio.currentTime=v;restored=true};
  async function start(){restore();try{audio.muted=userMuted;await audio.play();sync();save()}catch(_){sync()}}
  audio.addEventListener("loadedmetadata",()=>{restore();if(sessionStorage.getItem(P)!=="false"&&!userMuted)start();else sync()});
  toggle.addEventListener("click",async()=>{if(audio.paused||audio.muted){userMuted=false;try{sessionStorage.setItem(M,"false")}catch(_){}await start()}else{userMuted=true;audio.muted=true;save();sync()}});
  audio.addEventListener("play",sync);audio.addEventListener("pause",save);audio.addEventListener("volumechange",()=>{sync();save()});
  window.addEventListener("pagehide",save);window.addEventListener("beforeunload",save);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")save()});
  document.addEventListener("pointerdown",async()=>{if(!userMuted&& (audio.muted||audio.paused))await start()},{passive:true});
  if(audio.readyState>=1){restore();if(sessionStorage.getItem(P)!=="false"&&!userMuted)start();else sync()}
})();