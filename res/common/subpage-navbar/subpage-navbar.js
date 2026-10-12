(function(){ "use strict";
  const NAV_SELECTOR=".v-subpage-navbar";
  const LINK_SELECTOR=".v-subpage-navbar__link[data-tab-target]";
  const PANEL_SELECTOR="[data-v-tab-panel]";

  function getLinks(nav){
    return [...nav.querySelectorAll(LINK_SELECTOR)];
  }

  function activate(nav,target,updateHash){
    const links=getLinks(nav);
    const targetId=String(target||"").replace(/^#/,"");
    const chosen=links.find(link=>link.dataset.tabTarget.replace(/^#/,"")===targetId)
      || links.find(link=>document.getElementById(link.dataset.tabTarget.replace(/^#/,"")))
      || links[0];
    if(!chosen) return false;

    const chosenId=chosen.dataset.tabTarget.replace(/^#/,"");
    const panel=document.getElementById(chosenId);
    if(!panel) return false;

    links.forEach(link=>{
      const active=link===chosen;
      link.classList.toggle("is-active",active);
      if(active) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    document.querySelectorAll(PANEL_SELECTOR).forEach(item=>{
      item.hidden=item.id!==chosenId;
    });

    if(updateHash && location.hash!==chosen.dataset.tabTarget){
      history.replaceState(null,"",chosen.dataset.tabTarget);
    }
    return true;
  }

  function campaignName(){
    const explicit=document.querySelector("[data-campaign-name]");
    if(explicit && explicit.dataset.campaignName.trim()) return explicit.dataset.campaignName.trim();
    return document.title.replace(/\s+[—-]\s*Vengrath.*$/i,"").trim();
  }

  function ensureCharacterStyles(){
    if(document.querySelector('link[data-v-character-card-style]')) return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="/res/common/character-card/character-card.css";
    link.dataset.vCharacterCardStyle="true";
    document.head.appendChild(link);
  }

  function textElement(tag,className,value){
    const element=document.createElement(tag);
    if(className) element.className=className;
    element.textContent=value==null?"":String(value);
    return element;
  }

  function card(character){
    const article=document.createElement("article");
    article.className="v-character-card";

    const portrait=textElement("div","v-character-card__portrait","");
    const image=document.createElement("img");
    const portraitPath=typeof character.portrait==="string"?character.portrait:"";
    if(/^\/res\/portraits\/[a-zA-Z0-9._-]+$/.test(portraitPath) && !portraitPath.split("/").includes("..")) image.src=portraitPath;
    image.alt=String(character.character||"Postać");
    image.loading="lazy";
    image.decoding="async";
    portrait.appendChild(image);

    const info=textElement("div","v-character-card__info","");
    info.appendChild(textElement("div","v-character-card__label","POSTAĆ · "+String(character.status||"").toUpperCase()));
    info.appendChild(textElement("span","v-character-card__character",character.character||"Bez imienia"));
    info.appendChild(textElement("span","v-character-card__player",character.player||"Nieznany gracz"));

    const meta=textElement("div","v-character-card__meta","");
    const classes=Array.isArray(character.classes)?character.classes.join(" / "):String(character.classes||"");
    meta.appendChild(textElement("span","",classes));
    meta.appendChild(textElement("span","",character.race||"Rasa nieznana"));
    info.appendChild(meta);
    info.appendChild(textElement("p","v-character-card__description",character.history||character.Historia||"Brak zapisków."));

    article.append(portrait,info);
    return article;
  }

  function setMessage(container,className,message){
    container.replaceChildren(textElement("p",className,message));
  }

  function keepChronicleCardsInCharacters(nav,panel){
    const chronicle=document.getElementById("chronicle");
    if(!chronicle || chronicle.dataset.characterCardsRedirected==="true") return;
    chronicle.dataset.characterCardsRedirected="true";

    const groups=()=>{
      let grid=panel.querySelector("[data-v-moved-character-grid]");
      if(!grid){
        const host=panel.querySelector("[data-v-character-groups]")||panel;
        grid=document.createElement("div");
        grid.className="v-character-grid";
        grid.dataset.vMovedCharacterGrid="";
        host.appendChild(grid);
      }
      return grid;
    };

    const moveCards=(root)=>{
      const cards=[];
      if(root instanceof Element && root.matches(".v-character-card, .ddc-dead-character")) cards.push(root);
      if(root instanceof Element) cards.push(...root.querySelectorAll(".v-character-card, .ddc-dead-character"));
      if(!cards.length) return;

      const destination=groups();
      cards.forEach(card=>{
        if(!panel.contains(card)) destination.appendChild(card);
      });
      chronicle.querySelectorAll(".v-character-grid, .ddc-character-grid").forEach(grid=>{
        if(!grid.querySelector(".v-character-card, .ddc-dead-character")) grid.remove();
      });
    };

    moveCards(chronicle);
    const observer=new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(moveCards));
    });
    observer.observe(chronicle,{childList:true,subtree:true});
  }

  async function populateCharacters(){
    const nav=document.querySelector(NAV_SELECTOR);
    if(!nav || !location.pathname.startsWith("/p/")) return;

    let link=nav.querySelector(LINK_SELECTOR+'[data-tab-target="#characters"]');
    const chronicleLink=nav.querySelector(LINK_SELECTOR+'[data-tab-target="#chronicle"]');
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
      else {
        const main=document.querySelector("main");
        if(!main) return;
        main.appendChild(panel);
      }
    }else{
      panel.dataset.vTabPanel="";
    }

    // The character tab may not have existed during initial tab setup.
    if(location.hash==="#characters") activate(nav,"#characters",false);

    ensureCharacterStyles();
    panel.replaceChildren();
    const intro=textElement("div","v-character-intro__mark","AKTA / POSTACI");
    const introSection=textElement("section","v-character-intro","");
    introSection.appendChild(intro);
    const groups=textElement("div","v-character-groups","");
    groups.dataset.vCharacterGroups="";
    setMessage(groups,"v-character-loading","Ładowanie postaci…");
    panel.append(introSection,groups);
    keepChronicleCardsInCharacters(nav,panel);

    try{
      const response=await fetch("/res/characters.json",{cache:"no-store"});
      if(!response.ok) throw new Error("characters.json: "+response.status);
      const all=await response.json();
      if(!Array.isArray(all)) throw new Error("characters.json must contain an array");
      const name=campaignName();
      const campaign=all.filter(item=>item && Array.isArray(item.campaigns) && item.campaigns.includes(name));
      if(campaign.length){
        const grid=document.createElement("div");
        grid.className="v-character-grid";
        campaign.forEach(item=>grid.appendChild(card(item)));
        groups.replaceChildren(grid);
      }else{
        setMessage(groups,"v-character-empty","Brak postaci przypisanych do tej kampanii.");
      }
    }catch(error){
      setMessage(groups,"v-character-empty","Nie udało się wczytać danych postaci.");
      console.error("Unable to load campaign characters:",error);
    }
  }

  function init(nav){
    if(nav.dataset.tabsInitialized==="true") return;
    const links=getLinks(nav);
    if(!links.length) return;
    nav.dataset.tabsInitialized="true";

    nav.addEventListener("click",function(event){
      const link=event.target.closest(LINK_SELECTOR);
      if(!link || !nav.contains(link)) return;
      const panelId=link.dataset.tabTarget.replace(/^#/,"");
      if(!document.getElementById(panelId)) return;
      event.preventDefault();
      activate(nav,link.dataset.tabTarget,true);
    });

    window.addEventListener("hashchange",function(){
      const hash=location.hash;
      if(hash && getLinks(nav).some(link=>link.dataset.tabTarget===hash)){
        activate(nav,hash,false);
      }
    });

    const initial=links.some(link=>link.dataset.tabTarget===location.hash)
      ?location.hash
      :links[0].dataset.tabTarget;
    activate(nav,initial,false);
  }

  function updateScrollState(){
    const scrolled=window.scrollY>80;
    document.querySelectorAll(NAV_SELECTOR).forEach(nav=>nav.classList.toggle("is-scrolled",scrolled));
  }

  document.querySelectorAll(NAV_SELECTOR).forEach(init);
  populateCharacters();
  updateScrollState();
  window.addEventListener("scroll",updateScrollState,{passive:true});
  window.VengrathSubpageTabs={init:init};
})();
