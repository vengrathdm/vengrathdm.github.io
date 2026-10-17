(function(){
  "use strict";
  function init(root){
    if(root.dataset.initialized==="true") return;
    const url=(root.dataset.url||"").trim();
    if(!url){ root.hidden=true; return; }
    root.hidden=false;
    root.dataset.initialized="true";
    const a=document.createElement("a");
    a.className="v-youtube-button";
    a.href=url;
    a.target="_blank";
    a.rel="noopener noreferrer";
    a.textContent="PLAYLISTA";
    root.replaceChildren(a);
  }
  document.querySelectorAll("[data-v-youtube-button]").forEach(init);
  window.YouTubeButton={init:init};
})();
