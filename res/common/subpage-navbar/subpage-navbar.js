(function(){ "use strict";
  function findPanel(target){
    if(!target) return null;
    try{return document.querySelector(target)}catch(_){return document.getElementById(target.replace(/^#/,""))}
  }
  function activate(nav, target, updateHash){
    const links=[...nav.querySelectorAll(".v-subpage-navbar__link[data-tab-target]")];
    const panels=[...document.querySelectorAll("[data-v-tab-panel]")];
    let chosen=links.find(link=>link.dataset.tabTarget===target) || links[0];
    if(!chosen) return;
    target=chosen.dataset.tabTarget;
    links.forEach(link=>{
      const active=link===chosen;
      link.classList.toggle("is-active",active);
      if(active) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current");
    });
    panels.forEach(panel=>{
      panel.hidden=panel.id!==target.replace(/^#/,"");
    });
    if(updateHash && history.replaceState){
      history.replaceState(null,"",target);
    }
  }
  function init(nav){
    if(nav.dataset.tabsInitialized==="true") return;
    nav.dataset.tabsInitialized="true";
    const links=[...nav.querySelectorAll(".v-subpage-navbar__link[data-tab-target]")];
    if(!links.length) return;
    const initial=links.some(link=>link.dataset.tabTarget===location.hash)?location.hash:links[0].dataset.tabTarget;
    links.forEach(link=>link.addEventListener("click",function(event){
      event.preventDefault();
      activate(nav,link.dataset.tabTarget,true);
    }));
    window.addEventListener("hashchange",function(){
      if(location.hash && links.some(link=>link.dataset.tabTarget===location.hash)) activate(nav,location.hash,false);
    });
    activate(nav,initial,false);
  }
  document.querySelectorAll(".v-subpage-navbar").forEach(init);
  window.VengrathSubpageTabs={init:init};
})();