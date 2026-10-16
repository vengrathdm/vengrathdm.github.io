(function(){ "use strict";
  const NAV_SELECTOR=".v-subpage-navbar";
  const LINK_SELECTOR=".v-subpage-navbar__link[data-tab-target]";
  const PANEL_SELECTOR="[data-v-tab-panel]";

  function getLinks(nav){
    return [...nav.querySelectorAll(LINK_SELECTOR)];
  }

  function getPanels(nav){
    const ids=new Set(getLinks(nav).map(link=>link.dataset.tabTarget.replace(/^#/,"")));
    return [...document.querySelectorAll(PANEL_SELECTOR)].filter(panel=>ids.has(panel.id));
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
    getPanels(nav).forEach(item=>{
      item.hidden=item.id!==chosenId;
    });

    if(updateHash && location.hash!==chosen.dataset.tabTarget){
      history.replaceState(null,"",chosen.dataset.tabTarget);
    }
    return true;
  }

  const CAMPAIGN_ALIASES = {
    "mences-of-irensberg": "Menaces of Irensberg",
    "maski-nyarlotepa": "Maski Nyarlotepa - Peru",
    "hand-of-glory": "Hand of Glory",
    "heroes-of-baldurs-gate": "Heroes of Baldur's Gate",
    "neverwinter-intrygi-polnocnego-wybrzeza-mieczy": "Neverwinter: Intrygi Północnego Wybrzeża Mieczy",
    "echtra-zima-irgaeli": "Echtra - Zima Irgaeli"
  };

  function campaignName(){
    const explicit=document.querySelector("[data-campaign-name]");
    if(explicit && explicit.dataset.campaignName.trim()) return explicit.dataset.campaignName.trim();
    const pathParts=location.pathname.split("/").filter(Boolean);
    const slug=pathParts[0]==="p"?pathParts[1]:"";
    if(slug && CAMPAIGN_ALIASES[slug]) return CAMPAIGN_ALIASES[slug];
    return document.title
      .replace(/\\s*[—-]\\s*Vengrath.*$/i,"")
      .replace(/\\s*\\|\\s*Vengrath.*$/i,"")
      .trim();
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

  function addCharactersTab(nav,chronicleLink){
    let link=nav.querySelector(LINK_SELECTOR+'[data-tab-target="#characters"]');
    if(link){
      link.textContent="POSTACI";
      return link;
    }

    link=document.createElement("a");
    link.className="v-subpage-navbar__link";
    link.dataset.tabTarget="#characters";
    link.href="#characters";
    link.textContent="POSTACI";

    if(chronicleLink){
      chronicleLink.parentNode.insertBefore(link,chronicleLink);
    }else{
      const mainLink=nav.querySelector(LINK_SELECTOR+'[data-tab-target="#main"]');
      const links=nav.querySelector(".v-subpage-navbar__links");
      if(mainLink) mainLink.insertAdjacentElement("afterend",link);
      else if(links) links.appendChild(link);
      else return null;
    }
    return link;
  }

  function ensureCharacterPanel(nav){
    let panel=document.getElementById("characters");
    if(panel){
      panel.dataset.vTabPanel="";
      return panel;
    }

    panel=document.createElement("section");
    panel.className="v-character-tab-panel";
    panel.id="characters";
    panel.dataset.vTabPanel="";
    panel.hidden=true;

    const chronicle=document.getElementById("chronicle");
    if(chronicle && chronicle.parentNode){
      chronicle.parentNode.insertBefore(panel,chronicle);
    }else{
      const main=document.querySelector("main");
      if(!main) return null;
      main.appendChild(panel);
    }
    return panel;
  }

  function ensureCharacterIntro(panel){
    let intro=panel.querySelector(".v-character-intro, .ddc-character-intro, .lob-character-intro");
    if(intro) return intro;

    intro=document.createElement("section");
    intro.className="v-character-intro";
    intro.appendChild(textElement("div","v-character-intro__mark","AKTA / POSTACI"));
    intro.appendChild(textElement("h2","","Postaci"));
    intro.appendChild(textElement("p","","Postacie przypisane do tej kampanii z rejestru Vengrath."));
    panel.insertBefore(intro,panel.firstChild);
    return intro;
  }

  function ensureCharacterGrid(panel){
    const candidates=[...panel.querySelectorAll(
      ".v-character-grid, .ddc-character-grid, [class*='character-grid']"
    )];
    let grid=candidates[0]||null;

    candidates.slice(1).forEach(item=>item.remove());

    if(!grid){
      grid=document.createElement("div");
      panel.appendChild(grid);
    }

    const modifiers=[...grid.classList].filter(name=>
      name!=="v-character-grid" &&
      name!=="ddc-character-grid" &&
      name!=="character-grid" &&
      name!=="lob-character-grid"
    );
    grid.className=["v-character-grid",...modifiers].join(" ");

    panel.querySelectorAll(".v-character-card, .ddc-dead-character").forEach(item=>{
      if(!grid.contains(item)) item.remove();
    });
    grid.replaceChildren();
    return grid;
  }

  async function populateCharacters(){
    const nav=document.querySelector(NAV_SELECTOR);
    if(!nav || !location.pathname.startsWith("/p/")) return;

    const chronicleLink=nav.querySelector(LINK_SELECTOR+'[data-tab-target="#chronicle"]');
    const link=addCharactersTab(nav,chronicleLink);
    if(!link) return;

    const panel=ensureCharacterPanel(nav);
    if(!panel) return;

    const currentTarget=getLinks(nav).some(item=>item.dataset.tabTarget===location.hash)
      ?location.hash
      :getLinks(nav)[0]?.dataset.tabTarget;
    if(currentTarget) activate(nav,currentTarget,false);
    if(location.hash==="#characters") activate(nav,"#characters",false);

    ensureCharacterStyles();
    ensureCharacterIntro(panel);
    const grid=ensureCharacterGrid(panel);

    let empty=panel.querySelector(".v-character-empty");
    if(empty) empty.remove();

    try{
      const response=await fetch("/res/characters.json",{cache:"no-store"});
      if(!response.ok) throw new Error("characters.json: "+response.status);
      const all=await response.json();
      if(!Array.isArray(all)) throw new Error("characters.json must contain an array");

      const name=campaignName();
      const campaign=all.filter(item=>
        item &&
        Array.isArray(item.campaigns) &&
        item.campaigns.includes(name)
      );

      if(campaign.length){
        grid.replaceChildren(...campaign.map(item=>card(item)));
      }else{
        grid.remove();
        empty=textElement("p","v-character-empty","Brak postaci przypisanych do tej kampanii w rejestrze.");
        panel.appendChild(empty);
      }
    }catch(error){
      grid.remove();
      empty=textElement("p","v-character-empty","Nie udało się wczytać danych postaci z rejestru.");
      panel.appendChild(empty);
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
