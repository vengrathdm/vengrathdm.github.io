(function(){
  "use strict";
  const selector="[data-v-audio-player]";

  function storageGet(key){
    if(!key) return null;
    try { return sessionStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key,value){
    if(!key) return;
    try { sessionStorage.setItem(key,value); } catch (_) {}
  }

  function init(root){
    if(root.dataset.initialized==="true") return;
    const src=root.dataset.src||"";
    if(!src) return;
    root.dataset.initialized="true";

    const color=root.dataset.color||"#8b2020";
    const key=root.dataset.continuationKey||"";
    const timeKey=key?key+"Time":"";
    const mutedKey=key?key+"Muted":"";
    const playingKey=key?key+"Playing":"";
    let muted=storageGet(mutedKey)==="true";
    let restored=false;

    root.style.setProperty("--audio-color",color);
    root.classList.add("v-audio-player");
    root.innerHTML='<audio class="v-audio-player__audio" loop preload="metadata" playsinline></audio><button class="v-audio-player__button" type="button" aria-label="Włącz muzykę" aria-pressed="false" title="Włącz muzykę"><svg class="v-audio-player__icon v-audio-player__icon--muted" viewBox="0 0 48 48" aria-hidden="true"><path d="M7 19h8l10-8v26l-10-8H7z"></path><path d="M31 18l10 12M41 18L31 30"></path></svg><svg class="v-audio-player__icon v-audio-player__icon--playing" viewBox="0 0 48 48" aria-hidden="true"><path d="M7 19h8l10-8v26l-10-8H7z"></path><path d="M32 18c3 3 3 9 0 12M37 13c6 6 6 16 0 22"></path></svg></button>';

    const audio=root.querySelector("audio");
    const button=root.querySelector("button");
    audio.src=src;
    audio.volume=.55;
    audio.muted=muted;

    function save(){
      if(!key||!restored) return;
      storageSet(timeKey,String(audio.currentTime||0));
      storageSet(mutedKey,String(audio.muted||muted));
      storageSet(playingKey,String(!audio.paused&&!audio.muted));
    }
    function sync(){
      if(root.dataset.audioError==="true"){
        root.classList.remove("is-playing");
        button.setAttribute("aria-pressed","false");
        button.setAttribute("aria-label","Muzyka niedostępna");
        button.title="Muzyka niedostępna";
        button.disabled=true;
        return;
      }
      const playing=!audio.muted&&!audio.paused;
      root.classList.toggle("is-playing",playing);
      button.setAttribute("aria-pressed",String(playing));
      button.setAttribute("aria-label",playing?"Wycisz muzykę":"Włącz muzykę");
      button.title=playing?"Wycisz muzykę":"Włącz muzykę";
    }
    function restore(){
      if(restored || audio.readyState < 1) return;
      const saved=Number.parseFloat(storageGet(timeKey));
      if(Number.isFinite(saved)&&saved>=0){
        const duration=audio.duration;
        audio.currentTime=Number.isFinite(duration)&&duration>0&&saved>=duration?saved%duration:saved;
      }
      restored=true;
    }
    async function play(){
      restore();
      audio.muted=false;
      muted=false;
      try{
        await audio.play();
        sync();
        save();
      }catch(error){
        sync();
        // Autoplay may be blocked by the browser; the explicit button remains available.
        if(error&&error.name!=="NotAllowedError") console.warn("Audio playback failed:",error);
      }
    }

    audio.addEventListener("loadedmetadata",()=>{
      restore();
      if(!muted) play();
      else sync();
    });
    audio.addEventListener("error",()=>{
      root.dataset.audioError="true";
      button.disabled=true;
      button.setAttribute("aria-label","Muzyka niedostępna");
      button.title="Muzyka niedostępna";
      sync();
    });
    button.addEventListener("click",()=>{
      if(!audio.paused&&!audio.muted){
        muted=true;
        audio.muted=true;
        storageSet(mutedKey,"true");
        save();
        sync();
      }else{
        storageSet(mutedKey,"false");
        play();
      }
    });
    audio.addEventListener("play",sync);
    audio.addEventListener("pause",()=>{save();sync();});
    audio.addEventListener("volumechange",()=>{sync();save();});
    window.addEventListener("pagehide",save);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden") save();});
    sync();
  }

  document.querySelectorAll(selector).forEach(init);
  window.VengrathAudioPlayer={init:init};
})();