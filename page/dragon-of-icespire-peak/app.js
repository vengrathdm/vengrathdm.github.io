/* Dragon of Icespire Peak — campaign-local runtime. No shared JavaScript imports. */
const themeVariables = {
  base1:"--theme-base-1",base2:"--theme-base-2",base3:"--theme-base-3",base4:"--theme-base-4",base5:"--theme-base-5",
  accent1:"--theme-accent-1",accent2:"--theme-accent-2",text1:"--theme-text-1",text2:"--theme-text-2",text3:"--theme-text-3",
  textMuted:"--theme-text-muted",titleAccent:"--theme-title-accent",line1:"--theme-line-1",line2:"--theme-line-2",
  navBackground:"--theme-nav-background",navText:"--theme-nav-text",navActiveBackground:"--theme-nav-active-background"
};
async function loadJson(path){const response=await fetch(path);if(!response.ok)throw new Error("Nie udało się wczytać pliku: "+path);return response.json();}
function applyTheme(theme){
  Object.entries(themeVariables).forEach(([key,property])=>{if(theme.colors[key])document.documentElement.style.setProperty(property,theme.colors[key]);});
  document.documentElement.style.setProperty("--campaign-accent",theme.colors.accent2);
}
function createHomeButton(){
  const link=document.createElement("a");link.className="vengrath-home-button";link.href="/home/";link.setAttribute("aria-label","Vengrath — strona główna");
  const image=document.createElement("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";
  const label=document.createElement("span");label.textContent="VENGRATH";link.append(image,label);return link;
}
function mountNavbar(container,accent){
  container.classList.add("subpage-navbar");
  const left=document.createElement("div");left.className="subpage-navbar__left";left.append(createHomeButton());
  const right=document.createElement("nav");right.className="subpage-navbar__sections";right.setAttribute("aria-label","Sekcje kampanii");
  const sections=[["Kampania","campaign"],["Postaci","characters"]];
  const buttons=sections.map(([label,id],index)=>{
    const button=document.createElement("button");button.type="button";button.className="subpage-navbar-button";button.textContent=label;
    button.dataset.section=id;button.style.setProperty("--section-color",accent);button.setAttribute("aria-pressed",String(index===0));
    button.addEventListener("click",()=>select(id));right.append(button);return button;
  });
  container.replaceChildren(left,right);
  function select(id){
    document.querySelectorAll("[data-page-section]").forEach(section=>{section.hidden=section.dataset.pageSection!==id;});
    buttons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.section===id)));
    container.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));
  }
  const updateScroll=()=>container.classList.toggle("is-scrolled",window.scrollY>12);
  updateScroll();window.addEventListener("scroll",updateScroll,{passive:true});select("campaign");
}
function initializeHero(content,theme){
  const hero=document.querySelector("#campaign-hero");
  hero.style.setProperty("--hero-background","url('"+theme.heroImage+"')");
  const copy=hero.querySelector(".subpage-hero__copy");
  const kicker=copy.querySelector(".campaign-startup-kicker");kicker.className="doip-hero-kicker";kicker.textContent=content.campaign.kicker;
  const lead=copy.querySelector(".campaign-startup-lead");lead.className="doip-hero-lead";lead.textContent=content.campaign.lead;
  const heading=copy.querySelector("h1");heading.replaceChildren(document.createTextNode("Dragon of"),document.createElement("br"),Object.assign(document.createElement("span"),{className:"doip-hero-title-accent",textContent:"Icespire Peak"}));
  const mount=document.createElement("div");mount.className="doip-navbar-mount";hero.prepend(mount);
  const mist=document.createElement("div");mist.className="doip-hero-mist-line";mist.setAttribute("aria-hidden","true");hero.append(mist);
  mountNavbar(mount,theme.colors.accent2);
}
function renderCampaign(campaign){
  document.querySelector("#campaign-intro-title").textContent=campaign.introTitle;
  document.querySelector("#campaign-intro-copy").replaceChildren(...campaign.introParagraphs.map(text=>{const p=document.createElement("p");p.textContent=text;return p;}));
  document.querySelector("#campaign-dossier").replaceChildren(...campaign.dossier.map(([label,value])=>{
    const row=document.createElement("div");row.className="ddc-case-row";const key=document.createElement("span");key.textContent=label;
    const detail=document.createElement("strong");detail.textContent=value;if(label==="STATUS")detail.className="ddc-active";row.append(key,detail);return row;
  }));
  document.querySelector("#party-title").textContent=campaign.partyTitle;
  document.querySelector("#party-description").textContent=campaign.partyDescription;
  document.querySelector("#party-image").src=campaign.partyImage;
}
function renderAchievements(items){
  const fragment=document.createDocumentFragment();
  for(const item of items){const badge=document.createElement("span");badge.className="achievement-badge";badge.textContent=item.icon||"✦";badge.title=item.name||item.id;badge.setAttribute("aria-label",item.name||item.id);fragment.append(badge);}
  return fragment;
}
function createCharacterCard(character,definitions){
  const card=document.createElement("article");card.className="character-card";card.dataset.status=character.status||"";
  const earned=(Array.isArray(character.achievementIds)?character.achievementIds:[]).map(id=>definitions.get(id)).filter(Boolean);
  const badges=document.createElement("div");badges.className="character-card__achievements";badges.append(renderAchievements(earned));
  const portrait=document.createElement("div");portrait.className="character-card__portrait";const image=document.createElement("img");image.src=character.portrait;image.alt=character.character||"Portret postaci";image.loading="lazy";portrait.append(image);
  const status=document.createElement("span");status.className="character-card__status";status.textContent=character.status||"";portrait.append(status);
  const body=document.createElement("div");body.className="character-card__body";const name=document.createElement("h3");name.textContent=character.character||"Nieznana postać";
  const player=document.createElement("p");player.className="character-card__player";player.textContent=character.player||"Nie podano";body.append(name,player);
  for(const [labelText,valueText] of [["Kampanie",character.campaigns],["Klasy",character.classes],["Rasa",character.race]]){
    const row=document.createElement("div");row.className="character-card__row";const label=document.createElement("span");label.className="character-card__label";label.textContent=labelText;
    const value=document.createElement("span");value.className="character-card__value";value.textContent=Array.isArray(valueText)?valueText.join(", "):valueText||"Nie podano";row.append(label,value);body.append(row);
  }
  const count=document.createElement("p");count.className="character-card__achievement-count";count.textContent=earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć";
  card.append(badges,portrait,body,count);return card;
}
async function renderCharacters(characters){
  document.querySelector("#characters-kicker").textContent=characters.kicker;
  document.querySelector("#characters-title").textContent=characters.title;
  document.querySelector("#characters-description").textContent=characters.description;
  const [characterResponse,achievementResponse]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);
  if(!characterResponse.ok||!achievementResponse.ok)throw new Error("Nie udało się wczytać danych postaci.");
  const [catalog,achievements]=await Promise.all([characterResponse.json(),achievementResponse.json()]);
  const byId=new Map(catalog.map(character=>[character.id,character]));
  const selected=[...new Set(characters.characterIds)].map(id=>byId.get(id)).filter(Boolean);
  const container=document.querySelector("#character-gallery");container.replaceChildren();
  if(!selected.length){const empty=document.createElement("p");empty.className="character-gallery__empty";empty.textContent="Brak postaci spełniających kryteria.";container.append(empty);return;}
  const grid=document.createElement("div");grid.className="character-gallery";const definitions=new Map(achievements.map(item=>[item.id,item]));
  selected.forEach(character=>grid.append(createCharacterCard(character,definitions)));container.append(grid);
}
async function initializeCampaignPage(){
  const [manifest,theme,content]=await Promise.all([loadJson("./manifest.json"),loadJson("./theme.json"),loadJson("./content.json")]);
  applyTheme(theme);initializeHero(content,theme);renderCampaign(content.campaign);await renderCharacters(content.characters);
}
initializeCampaignPage().then(()=>document.body.classList.remove("campaign-startup-loading")).catch(error=>console.error("Nie udało się uruchomić strony Dragon of Icespire Peak.",error));
