(function(){ "use strict";
  function init(root){
    if(root.dataset.initialized==="true") return;
    root.dataset.initialized="true";
    const asset=new URL("./vengrath-button-background.png",document.currentScript.src).href;
    root.innerHTML='<a class="v-vengrath-button" href="https://vengrathdm.github.io/" aria-label="Powrót do Vengrath"><img src="'+asset+'" alt="MG"><span>VENGRATH</span></a>';
  }
  document.querySelectorAll("[data-vengrath-button]").forEach(init);
  window.VengrathButton={init:init};
})();