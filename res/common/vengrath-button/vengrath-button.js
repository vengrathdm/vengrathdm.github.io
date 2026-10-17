(function(){ "use strict";
  const scriptUrl=document.currentScript&&document.currentScript.src;
  const assetUrl=scriptUrl||new URL("/res/common/vengrath-button/vengrath-button.js",window.location.origin).href;
  function init(root){
    if(root.dataset.initialized==="true") return;
    root.dataset.initialized="true";
    const asset=new URL("./vengrath-button-background.png",assetUrl).href;
    root.innerHTML='<a class="v-vengrath-button" href="https://vengrathdm.github.io/" aria-label="Powrót do Vengrath"><img src="'+asset+'" alt="MG"><span>VENGRATH</span></a>';
  }
  document.querySelectorAll("[data-vengrath-button]").forEach(init);
  window.VengrathButton={init:init};
})();