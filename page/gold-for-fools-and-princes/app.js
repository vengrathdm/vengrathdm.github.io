/* Gold for Fools and Princes — campaign-local runtime. */
const themeVariables={base1:"--theme-base-1",base2:"--theme-base-2",base3:"--theme-base-3",base4:"--theme-base-4",base5:"--theme-base-5",accent1:"--theme-accent-1",accent2:"--theme-accent-2",text1:"--theme-text-1",text2:"--theme-text-2",text3:"--theme-text-3",textMuted:"--theme-text-muted",titleAccent:"--theme-title-accent",line1:"--theme-line-1",line2:"--theme-line-2",navBackground:"--theme-nav-background",navText:"--theme-nav-text",navActiveBackground:"--theme-nav-active-background"};
async function loadJson(path){const r=await fetch(path);if(!r.ok)throw new Error("Nie udało się wczytać pliku: "+path);return r.json();}
function applyTheme(theme){Object.entries(themeVariables).forEach(([k,p])=>{if(theme.colors[k])document.documentElement.style.setProperty(p,theme.colors[k]);});document.documentElement.style.setProperty("--campaign-accent",theme.colors.accent2);}
function createHomeButton(){const a=document.createElement("a");a.className="vengrath-home-button";a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const img=document.createElement("img");img.src="/core/graphics/favicon/favicon.ico";img.alt="";const label=document.createElement("span");label.textContent="VENGRATH";a.append(img,label);return a;}
function mountNavbar(mount,accent){mount.classList.add("subpage-navbar");const left=document.createElement("div");left.className="subpage-navbar__left";left.append(createHomeButton());const nav=document.createElement("nav");nav.className="subpage-navbar__sections";nav.setAttribute("aria-label","Sekcje kampanii");const buttons=[["Kampania","campaign"],["Postacie","characters"]].map(([label,id],i)=>{const b=document.createElement("button");b.type="button";b.className="subpage-navbar-button";b.textContent=label;b.dataset.section=id;b.style.setProperty("--section-color",accent);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));nav.append(b);return b;});mount.replaceChildren(left,nav);function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));mount.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}const scroll=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);scroll();window.addEventListener("scroll",scroll,{passive:true});select("campaign");}
function initializeHero(content,theme){const hero=document.querySelector("#campaign-hero");hero.style.setProperty("--hero-background","url('"+theme.heroImage+"')");const copy=hero.querySelector(".subpage-hero__copy"),kicker=copy.querySelector(".campaign-startup-kicker"),lead=copy.querySelector(".campaign-startup-lead"),heading=copy.querySelector("h1");kicker.className="gffp-hero-kicker";kicker.textContent=content.campaign.kicker;lead.className="gffp-hero-lead";lead.textContent=content.campaign.lead;heading.replaceChildren(document.createTextNode("Gold for Fools"),document.createElement("br"),Object.assign(document.createElement("span"),{className:"gffp-hero-title-accent",textContent:"and Princes"}));const navbar=document.createElement("div");navbar.className="gffp-navbar-mount";hero.prepend(navbar);const line=document.createElement("div");line.className="gffp-hero-mist-line";line.setAttribute("aria-hidden","true");hero.append(line);mountNavbar(navbar,theme.colors.accent2);}
function renderCampaign(c){document.querySelector("#campaign-intro-title").textContent=c.introTitle;document.querySelector("#campaign-intro-copy").replaceChildren(...c.introParagraphs.map(t=>{const p=document.createElement("p");p.textContent=t;return p;}));document.querySelector("#campaign-dossier").replaceChildren(...c.dossier.map(([l,v])=>{const row=document.createElement("div");row.className="ddc-case-row";const key=document.createElement("span");key.textContent=l;const value=document.createElement("strong");value.textContent=v;if(l==="STATUS")value.className="ddc-active";row.append(key,value);return row;}));document.querySelector("#party-title").textContent=c.partyTitle;document.querySelector("#party-description").textContent=c.partyDescription;document.querySelector("#party-image").src=c.partyImage;}
function renderAchievements(items){const f=document.createDocumentFragment();for(const item of items){const b=document.createElement("span");b.className="achievement-badge";b.textContent=item.icon||"✦";b.title=item.name||item.id;b.setAttribute("aria-label",item.name||item.id);f.append(b);}return f;}
function createCharacterCard(c,defs){const card=document.createElement("article");card.className="character-card";card.dataset.status=c.status||"";const earned=(Array.isArray(c.achievementIds)?c.achievementIds:[]).map(id=>defs.get(id)).filter(Boolean);const badges=document.createElement("div");badges.className="character-card__achievements";badges.append(renderAchievements(earned));const portrait=document.createElement("div");portrait.className="character-card__portrait";const img=document.createElement("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img);const status=document.createElement("span");status.className="character-card__status";status.textContent=c.status||"";portrait.append(status);const body=document.createElement("div");body.className="character-card__body";const name=document.createElement("h3");name.textContent=c.character||"Nieznana postać";const player=document.createElement("p");player.className="character-card__player";player.textContent=c.player||"Nie podano";body.append(name,player);for(const [labelText,valueText] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=document.createElement("div");row.className="character-card__row";const label=document.createElement("span");label.className="character-card__label";label.textContent=labelText;const value=document.createElement("span");value.className="character-card__value";value.textContent=Array.isArray(valueText)?valueText.join(", "):valueText||"Nie podano";row.append(label,value);body.append(row);}const count=document.createElement("p");count.className="character-card__achievement-count";count.textContent=earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć";card.append(badges,portrait,body,count);return card;}
async function renderCharacters(c){document.querySelector("#characters-kicker").textContent=c.kicker;document.querySelector("#characters-title").textContent=c.title;document.querySelector("#characters-description").textContent=c.description;const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw new Error("Nie udało się wczytać danych postaci.");const [catalog,achievements]=await Promise.all([cr.json(),ar.json()]);const byId=new Map(catalog.map(x=>[x.id,x]));const selected=[...new Set(c.characterIds)].map(id=>byId.get(id)).filter(Boolean);const container=document.querySelector("#character-gallery");container.replaceChildren();if(!selected.length){const empty=document.createElement("p");empty.className="character-gallery__empty";empty.textContent="Brak postaci spełniających kryteria.";container.append(empty);return;}const grid=document.createElement("div");grid.className="character-gallery";const defs=new Map(achievements.map(x=>[x.id,x]));selected.forEach(c=>grid.append(createCharacterCard(c,defs)));container.append(grid);}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  applyTheme(theme);
  initializeHero(content, theme);
  renderCampaign(content.campaign);

  let charactersPromise;
  document.addEventListener("vengrath:sectionchange", (event) => {
    if (event.detail?.section !== "characters" || charactersPromise) return;
    charactersPromise = renderCharacters(content.characters).catch((error) => {
      console.error("Nie udało się wczytać postaci.", error);
      charactersPromise = null;
      document.querySelector("#character-gallery").replaceChildren(
        Object.assign(document.createElement("p"), {
          className: "character-gallery__empty",
          textContent: "Nie udało się wczytać postaci. Spróbuj ponownie.",
        }),
      );
    });
  });

  document.body.classList.remove("campaign-startup-loading");
}
initialize().catch((error) => {
  console.error("Nie udało się uruchomić strony Gold for Fools and Princes.", error);
  document.body.classList.remove("campaign-startup-loading");
  const message = document.createElement("p");
  message.className = "gffp-load-error";
  message.setAttribute("role", "alert");
  message.textContent = "Nie udało się wczytać kampanii.";
  document.body.prepend(message);
});
