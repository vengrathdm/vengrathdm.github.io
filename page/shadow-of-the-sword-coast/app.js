/* Shadow of the Sword Coast — campaign-local runtime. */
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Nie udało się wczytać pliku: "+path);return r.json();}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function home(){const a=el("a","vengrath-home-button");a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const i=el("img");i.src="/core/graphics/favicon/favicon.ico";i.alt="";a.append(i,el("span","","VENGRATH"));return a;}
function navbar(mount,color,playlist){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left");left.append(home());if(playlist){const a=el("a","youtube-playlist-button","YouTube Playlista");a.href=playlist;a.target="_blank";a.rel="noopener noreferrer";left.append(a);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=[["Kampania","campaign"],["Postaci","characters"],["Kronika","chronicle"]].map(([label,id],i)=>{const b=el("button","subpage-navbar-button",label);b.type="button";b.dataset.section=id;b.style.setProperty("--section-color",color);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));nav.append(b);return b;});mount.replaceChildren(left,nav);function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));nav.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}const sc=()=>mount.classList.toggle("is-scrolled",scrollY>12);sc();addEventListener("scroll",sc,{passive:true});select("campaign");}
function campaign(c){document.querySelector("#campaign-intro-title").textContent=c.introTitle;document.querySelector("#campaign-intro-copy").replaceChildren(...(c.introParagraphs||[]).map(t=>el("p","",t)));document.querySelector("#campaign-dossier").replaceChildren(...(c.dossier||[]).map(([k,v])=>{const row=el("div","ddc-case-row");row.append(el("span","",k),el("strong",k==="STATUS"?"ddc-active":"",v));return row;}));}
async function gallery(data){document.querySelector("#characters-kicker").textContent=data.kicker;document.querySelector("#characters-title").textContent=data.title;document.querySelector("#characters-description").textContent=data.description;const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać danych postaci.");const [all,ach]=await Promise.all([cr.json(),ar.json()]),byId=new Map(all.map(x=>[x.id,x])),defs=new Map(ach.map(x=>[x.id,x]));const chosen=[...new Set(data.characterIds||[])].map(id=>byId.get(id)).filter(Boolean),root=document.querySelector("#character-gallery");root.replaceChildren();if(!chosen.length){root.append(el("p","character-gallery__empty",data.emptyMessage||"Brak postaci spełniających kryteria."));return;}const grid=el("div","character-gallery");chosen.forEach(c=>{const card=el("article","character-card");card.dataset.status=c.status||"";const badges=el("div","character-card__achievements"),earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;b.setAttribute("aria-label",a.name||a.id);badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [label,value] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",label),el("span","character-card__value",Array.isArray(value)?value.join(", "):value||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});root.append(grid);}
function chronicle(data){document.querySelector("#chronicle-kicker").textContent=data.kicker;document.querySelector("#chronicle-title").textContent=data.title;document.querySelector("#chronicle-description").textContent=data.description;const root=document.querySelector("#campaign-chronicle");root.classList.add("chronicle");root.replaceChildren(...(data.sessions||[]).map(s=>{const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent","#bca06a");const head=el("div","chronicle-record__header");head.tabIndex=0;head.setAttribute("role","button");head.setAttribute("aria-expanded","false");const raw=String(s.sessionNumber??s.number??"—"),match=raw.match(/^S?0*(\d+)([A-Z]?)$/i),num=match?String(Number(match[1])).padStart(2,"0")+match[2].toUpperCase():raw;head.append(el("span","chronicle-record__number",num),el("span","chronicle-record__title",s.title||"Bez tytułu"));const date=el("time","chronicle-record__date",s.date||"");date.hidden=!s.date;if(s.date)date.dateTime=s.date;const recordings=el("div","chronicle-record__recordings");const recs=Array.isArray(s.recordings)?s.recordings:[];recordings.hidden=!recs.length;recs.forEach((r,i)=>{const a=el("a","play-recording-button",recs.length>1?"Odtwórz część "+(r.partNumber||i+1):"Odtwórz");a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";recordings.append(a);});head.append(date,recordings);recordings.addEventListener("click",e=>e.stopPropagation());const desc=el("div","chronicle-record__description");desc.hidden=true;desc.append(el("p","",s.description||s.notes||""));const toggle=()=>{const open=desc.hidden;desc.hidden=!open;head.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};head.addEventListener("click",toggle);head.addEventListener("keydown",e=>{if(e.target===head&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(head,desc);return article;}));}
async function initialize() {
  // Theme tokens and hero artwork are shipped in the initial CSS and HTML.
  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--theme-accent-2")
      .trim() || "#bca06a";
  const [manifest, content] = await Promise.all([
    json("./manifest.json"),
    json("./content.json"),
  ]);
  const heroElement = document.querySelector("#campaign-hero");
  const copy = heroElement.querySelector(".subpage-hero__copy");
  copy.querySelector(".sosc-hero-kicker").textContent = content.campaign.kicker;
  copy.querySelector(".sosc-hero-lead").textContent = content.campaign.lead;
  const mount = el("div", "sosc-navbar-mount");
  heroElement.prepend(mount);
  const mist = el("div", "sosc-hero-mist-line");
  mist.setAttribute("aria-hidden", "true");
  heroElement.append(mist);
  navbar(mount, accent, manifest.playlistUrl);
  campaign(content.campaign);

  let galleryPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !galleryPromise) {
      galleryPromise = gallery(content.characters).catch((error) => {
        console.error("Nie udało się wczytać galerii postaci.", error);
        galleryPromise = null;
        document.querySelector("#character-gallery").replaceChildren(
          el("p", "character-gallery__empty", "Nie udało się wczytać galerii postaci."),
        );
      });
    }
    if (section === "chronicle" && !chronicleRendered) {
      chronicle(content.chronicle);
      chronicleRendered = true;
    }
  });

  // Replay a tab selection made before the campaign data finished loading.
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
initialize().catch((error) => {
  console.error("Nie udało się uruchomić Shadow of the Sword Coast.", error);
  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("campaign-startup-loading");
  const message = el("p", "sosc-load-error", "Nie udało się wczytać archiwum kampanii.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
