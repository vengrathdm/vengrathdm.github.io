/* Curse of Strahd — campaign-local runtime. */
async function json(p){const r=await fetch(p);if(!r.ok)throw Error("Nie udało się wczytać pliku: "+p);return r.json();}
function el(t,c,x){const n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n;}
function applyTheme(colors){const map={base1:"base-1",base2:"base-2",base3:"base-3",base4:"base-4",base5:"base-5",accent1:"accent-1",accent2:"accent-2",text1:"text-1",text2:"text-2",text3:"text-3",textMuted:"text-muted",titleAccent:"title-accent",line1:"line-1",line2:"line-2",navBackground:"nav-background",navText:"nav-text",navActiveBackground:"nav-active-background"};Object.entries(map).forEach(([k,v])=>{if(colors[k])document.documentElement.style.setProperty("--theme-"+v,colors[k]);});document.documentElement.style.setProperty("--campaign-accent",colors.accent2||"#bca06a");}
function home(){const a=el("a","vengrath-home-button");a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const i=el("img");i.src="/core/graphics/favicon/favicon.ico";i.alt="";a.append(i,el("span","","VENGRATH"));return a;}
function navbar(mount,color,playlist){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left");left.append(home());if(playlist){const a=el("a","youtube-playlist-button","YouTube Playlista");a.href=playlist;a.target="_blank";a.rel="noopener noreferrer";left.append(a);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=[["Kampania","campaign"],["Postaci","characters"],["Kronika","chronicle"]].map(([label,id],i)=>{const b=el("button","subpage-navbar-button",label);b.type="button";b.dataset.section=id;b.style.setProperty("--section-color",color);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));nav.append(b);return b;});mount.replaceChildren(left,nav);function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));mount.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}const sc=()=>mount.classList.toggle("is-scrolled",scrollY>12);sc();addEventListener("scroll",sc,{passive:true});select("campaign");}
function campaign(c){document.querySelector("#campaign-intro-title").textContent=c.introTitle;document.querySelector("#campaign-intro-copy").replaceChildren(...c.introParagraphs.map(t=>el("p","",t)));document.querySelector("#campaign-dossier").replaceChildren(...c.dossier.map(([k,v])=>{const row=el("div","ddc-case-row");row.append(el("span","",k),el("strong",k==="STATUS"?"ddc-active":"",v));return row;}));document.querySelector("#party-title").textContent=c.partyTitle;document.querySelector("#party-description").textContent=c.partyDescription;document.querySelector("#party-image").src=c.partyImage;}
async function gallery(root,ids){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać danych postaci.");const [all,ach]=await Promise.all([cr.json(),ar.json()]),byId=new Map(all.map(x=>[x.id,x])),defs=new Map(ach.map(x=>[x.id,x])),chosen=[...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);root.replaceChildren();const grid=el("div","character-gallery");chosen.forEach(c=>{const card=el("article","character-card"),badges=el("div","character-card__achievements"),earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [l,v] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",l),el("span","character-card__value",Array.isArray(v)?v.join(", "):v||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});root.append(grid);}
function chronicle(c,accent){document.querySelector("#chronicle-kicker").textContent=c.kicker;document.querySelector("#chronicle-title").textContent=c.title;document.querySelector("#chronicle-description").textContent=c.description;const pl=document.querySelector("#chronicle-playlist");pl.href=c.playlistUrl;const root=document.querySelector("#chronicle-records");root.classList.add("chronicle");root.replaceChildren(...(c.sessions||[]).map(s=>{const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const head=el("div","chronicle-record__header");head.tabIndex=0;head.setAttribute("role","button");head.setAttribute("aria-expanded","false");const raw=String(s.sessionNumber??s.number??"—"),m=raw.match(/^S?0*(\d+)([A-Z]?)$/i),num=m?String(Number(m[1])).padStart(2,"0")+m[2].toUpperCase():raw;head.append(el("span","chronicle-record__number",num),el("span","chronicle-record__title",s.title||"Bez tytułu"));const date=el("time","chronicle-record__date",s.date||"");date.hidden=!s.date;if(s.date)date.dateTime=s.date;const links=el("div","chronicle-record__recordings"),recs=Array.isArray(s.recordings)?s.recordings:[];links.hidden=!recs.length;recs.forEach((r,i)=>{const a=el("a","play-recording-button",recs.length>1?"Odtwórz część "+(r.partNumber||i+1):"Odtwórz");a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";links.append(a);});head.append(date,links);links.addEventListener("click",e=>e.stopPropagation());const desc=el("div","chronicle-record__description");desc.hidden=true;desc.append(el("p","",s.description||s.notes||""));const toggle=()=>{const open=desc.hidden;desc.hidden=!open;head.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};head.addEventListener("click",toggle);head.addEventListener("keydown",e=>{if(e.target===head&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(head,desc);return article;}));}
class LocalAudio{constructor(src,key){this.audio=new Audio(src);this.audio.loop=true;this.audio.preload="none";this.key=key;this.listeners=new Set();try{const s=JSON.parse(localStorage.getItem(key)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(t=>this.audio.addEventListener(t,()=>{if(t==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));addEventListener("pagehide",()=>this.persist());}persist(){try{localStorage.setItem(this.key,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async toggle(){if(this.audio.paused){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error(e);}}else this.audio.pause();this.emit();}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}}
function audioButton(player,color){const b=el("button","audio-player-button");b.type="button";b.style.setProperty("--player-color",color);const ring=el("span","audio-player-ring"),symbol=el("span","audio-player-symbol");b.append(ring,symbol);let drag=false;const point=e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;return {radius:Math.hypot(x,y),volume:a/(Math.PI*2)};};const vol=e=>player.setVolume(point(e).volume);b.addEventListener("click",e=>{if(drag){e.preventDefault();return;}if(point(e).radius>18)vol(e);else player.toggle();});b.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();drag=true;b.setPointerCapture(e.pointerId);vol(e);});b.addEventListener("pointermove",e=>{if(drag)vol(e);});b.addEventListener("pointerup",()=>drag=false);b.addEventListener("pointercancel",()=>drag=false);player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";b.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(b);}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    json("./manifest.json"),
    json("./theme.json"),
    json("./content.json"),
  ]);
  applyTheme(theme.colors);
  const hero = document.querySelector("#campaign-hero");
  hero.style.setProperty("--hero-background", "url('" + theme.heroImage + "')");
  const heading = hero.querySelector("h1");
  const copy = hero.querySelector(".subpage-hero__copy");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(el("span", "curse-hero-title-accent", content.campaign.heroSecondLine)),
  );
  copy.querySelector(".curse-hero-kicker").textContent = content.campaign.kicker;
  copy.querySelector(".curse-hero-lead").textContent = content.campaign.lead;
  const mount = el("div", "curse-navbar-mount");
  hero.prepend(mount);
  navbar(mount, theme.colors.accent2, manifest.playlistUrl);
  campaign(content.campaign);
  document.querySelector("#characters-title").textContent = "Postaci";
  document.querySelector("#characters-description").textContent = "Bohaterowie tej rozgrywki.";

  let galleryPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !galleryPromise) {
      galleryPromise = gallery(document.querySelector("#character-gallery"), [
        "char-0038", "char-0039", "char-0284", "char-0040", "char-0041",
      ]).catch((error) => {
        console.error("Nie udało się wczytać postaci.", error);
        galleryPromise = null;
        document.querySelector("#character-gallery").replaceChildren(
          el("p", "character-gallery__empty", "Nie udało się wczytać postaci."),
        );
      });
    }
    if (section === "chronicle" && !chronicleRendered) {
      chronicle(content.chronicle, theme.colors.accent2);
      chronicleRendered = true;
    }
  });

  document.body.classList.remove("campaign-startup-loading");
  audioButton(
    new LocalAudio("/page/curse-of-strahd/res/audio/curse-of-strahd.mp3", "vengrath-audio-curse-of-strahd"),
    theme.colors.accent2,
  );
}
initialize().catch((error) => {
  console.error("Nie udało się uruchomić strony Curse of Strahd.", error);
  document.body.classList.remove("campaign-startup-loading");
  const message = el("p", "curse-load-error", "Nie udało się wczytać archiwum kampanii.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
