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
  function slug(value){
    return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }
  function campaignName(){
    const title=document.title.replace(/\s+[—-]\s*Vengrath.*$/i,"").trim();
    return title;
  }
  function ensureCharacterStyles(){
    if(document.querySelector('link[data-v-character-card-style]')) return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="/res/common/character-card/character-card.css";
    link.dataset.vCharacterCardStyle="true";
    document.head.appendChild(link);
  }
  function card(character){
    const classes=Array.isArray(character.classes)?character.classes.join(" / "):(character.classes||"");
    const status=character.status||"";
    const history=character.Historia||"Brak zapisków.";
    return '<article class="v-character-card">'+
      '<div class="v-character-card__portrait"><img src="'+String(character.portrait||"").replace(/"/g,"&quot;")+'" alt="'+String(character.character||"Postać").replace(/"/g,"&quot;")+'" loading="lazy"></div>'+
      '<div class="v-character-card__info">'+
        '<div class="v-character-card__label">POSTAĆ · '+String(status).toUpperCase()+'</div>'+
        '<span class="v-character-card__character">'+String(character.character||"Bez imienia")+'</span>'+
        '<span class="v-character-card__player">'+String(character.player||"Nieznany gracz")+'</span>'+
        '<div class="v-character-card__meta"><span>'+classes+'</span><span>'+String(character.race||"Rasa nieznana")+'</span></div>'+
        '<p class="v-character-card__description">'+String(history)+'</p>'+
      '</div>'+
    '</article>';
  }
  async function populateCharacters(){
    const nav=document.querySelector(".v-subpage-navbar");
    if(!nav || !location.pathname.startsWith("/p/")) return;
    ensureCharacterStyles();
    let link=nav.querySelector('.v-subpage-navbar__link[data-tab-target="#characters"]');
    const chronicleLink=nav.querySelector('.v-subpage-navbar__link[data-tab-target="#chronicle"]');
    if(!link && chronicleLink){
      link=document.createElement("a");
      link.className="v-subpage-navbar__link";
      link.dataset.tabTarget="#characters";
      link.href="#characters";
      link.textContent="POSTACI";
      chronicleLink.parentNode.insertBefore(link,chronicleLink);
    }else if(link){
      link.textContent="POSTACI";
    }
    if(!link) return;
    let panel=document.getElementById("characters");
    const chronicle=document.getElementById("chronicle");
    if(!panel){
      panel=document.createElement("section");
      panel.className="v-character-tab-panel";
      panel.id="characters";
      panel.dataset.vTabPanel="";
      if(chronicle && chronicle.parentNode) chronicle.parentNode.insertBefore(panel,chronicle);
      else document.querySelector("main")?.appendChild(panel);
    }
    const name=campaignName();
    panel.innerHTML='<section class="v-character-intro"><div class="v-character-intro__mark">AKTA / POSTACI</div><h2>Postaci</h2><p>Postaci przypisane do tej kampanii są pobierane bezpośrednio z <code>/res/characters.json</code>.</p></section><div class="v-character-groups" data-v-character-groups><p class="v-character-loading">Ładowanie postaci…</p></div>';
    try{
      const response=await fetch("/res/characters.json",{cache:"no-store"});
      if(!response.ok) throw new Error("characters.json: "+response.status);
      const all=await response.json();
      let campaign=all.filter(c=>(c.campaigns||[]).includes(name));
      if(!campaign.length){
        const wanted=slug(name);
        campaign=all.filter(c=>(c.campaigns||[]).some(campaignName=>slug(campaignName)===wanted));
      }
      panel.querySelector("[data-v-character-groups]").innerHTML=campaign.length
        ? '<div class="v-character-grid">'+campaign.map(card).join("")+'</div>'
        : '<p class="v-character-empty">Brak postaci przypisanych do tej kampanii w <code>/res/characters.json</code>.</p>';
    }catch(error){
      panel.querySelector("[data-v-character-groups]").innerHTML='<p class="v-character-empty">Nie udało się wczytać danych postaci.</p>';
      console.error(error);
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
  function updateScrollState(){
    const scrolled=window.scrollY>80;
    document.querySelectorAll(".v-subpage-navbar").forEach(nav=>nav.classList.toggle("is-scrolled",scrolled));
  }
  document.querySelectorAll(".v-subpage-navbar").forEach(init);
  populateCharacters();
  updateScrollState();
  window.addEventListener("scroll",updateScrollState,{passive:true});
  window.VengrathSubpageTabs={init:init};
})();