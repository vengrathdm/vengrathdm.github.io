/* Forge of Fury — campaign-local runtime. No shared JavaScript imports. */
async function loadJson(path){const response=await fetch(path);if(!response.ok)throw new Error("Nie udało się wczytać pliku: "+path);return response.json();}
function createHomeButton(){const link=document.createElement("a");link.className="vengrath-home-button";link.href="/home/";link.setAttribute("aria-label","Vengrath — strona główna");const image=document.createElement("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";const label=document.createElement("span");label.textContent="VENGRATH";link.append(image,label);return link;}
function mountNavbar(container,accent){
 container.classList.add("subpage-navbar");const left=document.createElement("div");left.className="subpage-navbar__left";left.append(createHomeButton());
 const right=document.createElement("nav");right.className="subpage-navbar__sections";right.setAttribute("aria-label","Sekcje kampanii");
 const buttons=[["Kampania","campaign"],["Postacie","characters"]].map(([label,id],index)=>{const button=document.createElement("button");button.type="button";button.className="subpage-navbar-button";button.textContent=label;button.dataset.section=id;button.style.setProperty("--section-color",accent);button.setAttribute("aria-pressed",String(index===0));button.addEventListener("click",()=>select(id));right.append(button);return button;});
 container.replaceChildren(left,right);
 function select(id){document.querySelectorAll("[data-page-section]").forEach(section=>{section.hidden=section.dataset.pageSection!==id;});buttons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.section===id)));container.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}
 const updateScroll=()=>container.classList.toggle("is-scrolled",window.scrollY>12);updateScroll();window.addEventListener("scroll",updateScroll,{passive:true});select("campaign");
}
function initializeHero(content,accentColor){
 const hero=document.querySelector("#campaign-hero");
 const copy=hero.querySelector(".subpage-hero__copy"),kicker=copy.querySelector(".fof-hero-kicker"),lead=copy.querySelector(".fof-hero-lead"),heading=copy.querySelector("h1");
 kicker.textContent=content.campaign.kicker;lead.textContent=content.campaign.lead;
 const accent=document.createElement("span");accent.className="fof-hero-title-accent";accent.textContent="Fury";heading.replaceChildren(document.createTextNode("Forge of"),document.createElement("br"),accent);
 const mount=document.createElement("div");mount.className="fof-navbar-mount";hero.prepend(mount);const mist=document.createElement("div");mist.className="fof-hero-mist-line";mist.setAttribute("aria-hidden","true");hero.append(mist);mountNavbar(mount,accentColor);
}
function renderCampaign(campaign){
 document.querySelector("#campaign-intro-title").textContent=campaign.introTitle;
 document.querySelector("#campaign-intro-copy").replaceChildren(...campaign.introParagraphs.map(text=>{const p=document.createElement("p");p.textContent=text;return p;}));
 document.querySelector("#campaign-dossier").replaceChildren(...campaign.dossier.map(([label,value])=>{const row=document.createElement("div");row.className="ddc-case-row";const key=document.createElement("span");key.textContent=label;const detail=document.createElement("strong");detail.textContent=value;if(label==="STATUS")detail.className="ddc-active";row.append(key,detail);return row;}));
}
function renderAchievements(items){const fragment=document.createDocumentFragment();for(const item of items){const badge=document.createElement("span");badge.className="achievement-badge";badge.textContent=item.icon||"✦";badge.title=item.name||item.id;badge.setAttribute("aria-label",item.name||item.id);fragment.append(badge);}return fragment;}
function createCharacterCard(character,definitions){
 const card=document.createElement("article");card.className="character-card";card.dataset.status=character.status||"";
 const earned=(Array.isArray(character.achievementIds)?character.achievementIds:[]).map(id=>definitions.get(id)).filter(Boolean);
 const badges=document.createElement("div");badges.className="character-card__achievements";badges.append(renderAchievements(earned));
 const portrait=document.createElement("div");portrait.className="character-card__portrait";const image=document.createElement("img");image.src=character.portrait;image.alt=character.character||"Portret postaci";image.loading="lazy";portrait.append(image);
 const status=document.createElement("span");status.className="character-card__status";status.textContent=character.status||"";portrait.append(status);
 const body=document.createElement("div");body.className="character-card__body";const name=document.createElement("h3");name.textContent=character.character||"Nieznana postać";const player=document.createElement("p");player.className="character-card__player";player.textContent=character.player||"Nie podano";body.append(name,player);
 for(const [labelText,valueText] of [["Kampanie",character.campaigns],["Klasy",character.classes],["Rasa",character.race]]){const row=document.createElement("div");row.className="character-card__row";const label=document.createElement("span");label.className="character-card__label";label.textContent=labelText;const value=document.createElement("span");value.className="character-card__value";value.textContent=Array.isArray(valueText)?valueText.join(", "):valueText||"Nie podano";row.append(label,value);body.append(row);}
 const count=document.createElement("p");count.className="character-card__achievement-count";count.textContent=earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć";card.append(badges,portrait,body,count);return card;
}
async function renderCharacters(characters){
 document.querySelector("#characters-kicker").textContent=characters.kicker;document.querySelector("#characters-title").textContent=characters.title;document.querySelector("#characters-description").textContent=characters.description;
 const [characterResponse,achievementResponse]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!characterResponse.ok||!achievementResponse.ok)throw new Error("Nie udało się wczytać danych postaci.");
 const [catalog,achievements]=await Promise.all([characterResponse.json(),achievementResponse.json()]);const byId=new Map(catalog.map(character=>[character.id,character]));const selected=[...new Set(characters.characterIds)].map(id=>byId.get(id)).filter(Boolean);
 const container=document.querySelector("#character-gallery");container.replaceChildren();if(!selected.length){const empty=document.createElement("p");empty.className="character-gallery__empty";empty.textContent="Brak postaci spełniających kryteria.";container.append(empty);return;}
 const grid=document.createElement("div");grid.className="character-gallery";const definitions=new Map(achievements.map(item=>[item.id,item]));selected.forEach(character=>grid.append(createCharacterCard(character,definitions)));container.append(grid);
}
async function initializeCampaignPage() {
  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--theme-accent-2")
      .trim() || "#d7b56d";
  const [manifest, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./content.json"),
  ]);
  initializeHero(content, accent);
  renderCampaign(content.campaign);

  let charactersPromise;
  document.addEventListener("vengrath:sectionchange", (event) => {
    if (event.detail?.section !== "characters" || charactersPromise) return;
    charactersPromise = renderCharacters(content.characters).catch((error) => {
      console.error("Nie udało się wczytać postaci Forge of Fury.", error);
      charactersPromise = null;
      document.querySelector("#character-gallery").replaceChildren(
        Object.assign(document.createElement("p"), {
          className: "character-gallery__empty",
          textContent: "Nie udało się wczytać postaci. Spróbuj ponownie.",
        }),
      );
    });
  });

  const selectedSection = document.querySelector(
    '.subpage-navbar-button[aria-pressed="true"]',
  )?.dataset.section;
  if (selectedSection) {
    document.dispatchEvent(
      new CustomEvent("vengrath:sectionchange", {
        detail: { section: selectedSection },
      }),
    );
  }

  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("campaign-startup-loading");
}
initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić strony Forge of Fury.", error);
  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("campaign-startup-loading");
  const message = document.createElement("p");
  message.className = "fof-load-error";
  message.setAttribute("role", "alert");
  message.textContent = "Nie udało się wczytać kampanii.";
  document.body.prepend(message);
});
