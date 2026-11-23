/* Sons of Azalin — campaign-local runtime; shared template behavior is localized here. */
const themeVars={base1:"--theme-base-1",base2:"--theme-base-2",base3:"--theme-base-3",base4:"--theme-base-4",base5:"--theme-base-5",accent1:"--theme-accent-1",accent2:"--theme-accent-2",text1:"--theme-text-1",text2:"--theme-text-2",text3:"--theme-text-3",textMuted:"--theme-text-muted",titleAccent:"--theme-title-accent",line1:"--theme-line-1",line2:"--theme-line-2",navBackground:"--theme-nav-background",navText:"--theme-nav-text",navActiveBackground:"--theme-nav-active-background"};
async function loadJson(path){const r=await fetch(path);if(!r.ok)throw Error("Nie udało się wczytać pliku: "+path);return r.json();}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function homeButton(){const a=el("a","vengrath-home-button");a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const img=el("img");img.src="/core/graphics/favicon/favicon.ico";img.alt="";a.append(img,el("span","","VENGRATH"));return a;}
function mountNavbar(mount,color,playlist){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left");left.append(homeButton());if(playlist){const a=el("a","youtube-playlist-button","YouTube Playlista");a.href=playlist;a.target="_blank";a.rel="noopener noreferrer";left.append(a);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=[["Kampania","campaign"],["Postaci","characters"],["Kronika","chronicle"]].map(([label,id],i)=>{const b=el("button","subpage-navbar-button",label);b.type="button";b.dataset.section=id;b.style.setProperty("--section-color",color);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));nav.append(b);return b;});mount.replaceChildren(left,nav);function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));nav.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}const sc=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);sc();window.addEventListener("scroll",sc,{passive:true});select("campaign");}
function hero(content,accent,manifest){const h=document.querySelector("#campaign-hero");const copy=h.querySelector(".subpage-hero__copy"),heading=copy.querySelector("h1");heading.replaceChildren(document.createTextNode("Sons of"),document.createElement("br"),el("span","soa-hero-title-accent","Azalin"));copy.querySelector(".soa-hero-kicker").textContent=content.campaign.kicker;copy.querySelector(".soa-hero-lead").textContent=content.campaign.lead;const nav=el("div","soa-navbar-mount");h.prepend(nav);const line=el("div","soa-hero-mist-line");line.setAttribute("aria-hidden","true");h.append(line);mountNavbar(nav,accent,manifest.playlistUrl);}
function renderCampaign(c){document.querySelector("#campaign-intro-title").textContent=c.introTitle;document.querySelector("#campaign-intro-copy").replaceChildren(...c.introParagraphs.map(t=>el("p","",t)));document.querySelector("#campaign-dossier").replaceChildren(...c.dossier.map(([label,value])=>{const row=el("div","ddc-case-row");const key=el("span","",label),detail=el("strong",label==="STATUS"?"ddc-active":"",value);row.append(key,detail);return row;}));document.querySelector("#party-title").textContent=c.partyTitle;document.querySelector("#party-description").textContent=c.partyDescription;document.querySelector("#party-image").src=c.partyImage;}
function renderMaterial(m){document.querySelector("#characters-kicker").textContent=m.kicker;document.querySelector("#characters-title").textContent=m.title;document.querySelector("#characters-description").textContent=m.description;}
async function renderCharacterGallery(root,ids){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać danych postaci.");const [catalog,achievements]=await Promise.all([cr.json(),ar.json()]);const byId=new Map(catalog.map(x=>[x.id,x]));const selected=[...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);root.replaceChildren();if(!selected.length){root.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return;}const defs=new Map(achievements.map(x=>[x.id,x]));const grid=el("div","character-gallery");selected.forEach(c=>{const card=el("article","character-card");card.dataset.status=c.status||"";const badges=el("div","character-card__achievements");const earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;b.setAttribute("aria-label",a.name||a.id);badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [label,value] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",label),el("span","character-card__value",Array.isArray(value)?value.join(", "):value||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});root.append(grid);}
function youtubeTarget(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,"").toLowerCase();if(host==="youtu.be")return {videoId:u.pathname.split("/").filter(Boolean)[0]};if(host.endsWith("youtube.com")||host.endsWith("youtube-nocookie.com")){const videoId=u.searchParams.get("v")||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1],playlistId=u.searchParams.get("list");if(videoId)return {videoId,playlistId};if(playlistId)return {playlistId};}}catch{}return null;}
let activePlayerClose=null;
function inlinePlayer(rec,session,number,part,label,accent){const target=youtubeTarget(rec.url);if(!target)return null;const btn=el("button","chronicle-inline-player__toggle",label);btn.type="button";btn.setAttribute("aria-expanded","false");const panel=el("section","chronicle-inline-player");panel.hidden=true;const head=el("header","chronicle-inline-player__header");head.append(el("strong","chronicle-inline-player__title",session.title||"Nagranie sesji"),el("span","chronicle-inline-player__tag","NAGRANIE · YOUTUBE"));const video=el("div","chronicle-inline-player__video");const foot=el("footer","chronicle-inline-player__footer");const meta=el("span","","SESJA "+number+(part?" · CZĘŚĆ "+part:""));const external=el("a","","OTWÓRZ W YOUTUBE ↗");external.href=rec.url;external.target="_blank";external.rel="noopener noreferrer";foot.append(meta,external);panel.append(head,video,foot);const close=()=>{video.replaceChildren();panel.hidden=true;btn.setAttribute("aria-expanded","false");if(activePlayerClose===close)activePlayerClose=null;};btn.addEventListener("click",e=>{e.stopPropagation();if(!panel.hidden){close();return;}if(activePlayerClose)activePlayerClose();const frame=el("iframe");frame.src=target.videoId?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(target.videoId)+(target.playlistId?"?list="+encodeURIComponent(target.playlistId)+"&rel=0":"?rel=0"):"https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(target.playlistId);frame.title=session.title||"Nagranie sesji";frame.loading="lazy";frame.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";frame.referrerPolicy="strict-origin-when-cross-origin";frame.allowFullscreen=true;video.replaceChildren(frame);panel.hidden=false;btn.setAttribute("aria-expanded","true");activePlayerClose=close;});return {button:btn,panel};}
function renderChronicle(c,accent){document.querySelector("#chronicle-kicker").textContent=c.kicker;document.querySelector("#chronicle-title").textContent=c.title;document.querySelector("#chronicle-description").textContent=c.description;const root=document.querySelector("#campaign-chronicle");root.classList.add("chronicle");root.replaceChildren(...(c.sessions||[]).map(session=>{const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const header=el("div","chronicle-record__header");header.tabIndex=0;header.setAttribute("role","button");header.setAttribute("aria-expanded","false");const raw=String(session.sessionNumber??session.number??"—").trim(),match=raw.match(/^S?0*(\d+)([A-Z]?)$/i),number=match?String(Number(match[1])).padStart(2,"0")+match[2].toUpperCase():raw;const titleRaw=String(session.title||"Bez tytułu").trim();const title=titleRaw.replace(/^.*?\bS\d+(?:P\d+)?\s*[-–—:]\s*/i,"").replace(/^.*?#\s*\d+\s*[-–—:]\s*/i,"").replace(/\s+S\d+(?:P\d+)?\s*\[[^\]]+\]$/i,"").trim()||titleRaw;header.append(el("span","chronicle-record__number",number),el("span","chronicle-record__title",title));const date=el("time","chronicle-record__date",session.date||"");date.hidden=!session.date;if(session.date){const m=session.date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);date.dateTime=m?m[3]+"-"+m[2]+"-"+m[1]:session.date;}const recordings=el("div","chronicle-record__recordings"),players=el("div","chronicle-record__players");const links=Array.isArray(session.recordings)?session.recordings:[];recordings.hidden=!links.length;links.forEach((rec,i)=>{const part=rec.partNumber||(links.length>1?i+1:null),label=links.length>1?"Odtwórz Część "+(part||i+1):"Odtwórz";const player=inlinePlayer(rec,session,number,part,label,accent);if(player){recordings.append(player.button);players.append(player.panel);}else if(rec.url){const a=el("a","play-recording-button",label+" ▶");a.href=rec.url;a.target="_blank";a.rel="noopener noreferrer";recordings.append(a);}});recordings.addEventListener("click",e=>e.stopPropagation());header.append(date,recordings);const desc=el("div","chronicle-record__description");desc.hidden=true;desc.append(el("p","",session.description||session.notes||""));const toggle=()=>{const open=desc.hidden;desc.hidden=!open;header.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};header.addEventListener("click",toggle);header.addEventListener("keydown",e=>{if(e.target===header&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(header,players,desc);return article;}));}
class LocalAudioPlayer{constructor({src,storageKey="vengrath-audio-state"}){this.audio=new Audio();this.audio.loop=true;this.audio.preload="none";this.audio.src=src;this.storageKey=storageKey;this.listeners=new Set();this.audio.volume=.5;try{const s=JSON.parse(localStorage.getItem(storageKey)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(type=>this.audio.addEventListener(type,()=>{if(type==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));window.addEventListener("pagehide",()=>this.persist());}persist(){try{localStorage.setItem(this.storageKey,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return ()=>this.listeners.delete(fn);}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async toggle(){if(this.audio.paused){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error(e);}}else this.audio.pause();this.emit();}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}}
function mountAudioButton(player,color){const button=el("button","audio-player-button");button.type="button";button.style.setProperty("--player-color",color);const ring=el("span","audio-player-ring"),symbol=el("span","audio-player-symbol");button.append(ring,symbol);let dragging=false;const point=e=>{const r=button.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;return {radius:Math.hypot(x,y),volume:a/(Math.PI*2)};};const update=e=>player.setVolume(point(e).volume);button.addEventListener("click",e=>{if(dragging){e.preventDefault();return;}if(point(e).radius>18)update(e);else player.toggle();});button.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();dragging=true;button.setPointerCapture(e.pointerId);update(e);});button.addEventListener("pointermove",e=>{if(dragging)update(e);});button.addEventListener("pointerup",()=>dragging=false);button.addEventListener("pointercancel",()=>dragging=false);player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";button.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(button);}
async function initialize() {
  // Theme tokens and the hero image are shipped in the initial CSS and HTML.
  const root = document.documentElement;
  const accent =
    getComputedStyle(root).getPropertyValue("--theme-accent-2").trim() || "#c3a66d";
  const [manifest, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./content.json"),
  ]);
  hero(content, accent, manifest);
  renderCampaign(content.campaign);
  renderMaterial(content.characters);

  let galleryPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !galleryPromise) {
      galleryPromise = renderCharacterGallery(
        document.querySelector("#character-gallery"),
        content.characters.characterIds || [],
      ).catch((error) => {
        console.error("Nie udało się wczytać kart postaci.", error);
        galleryPromise = null;
        document.querySelector("#character-gallery").replaceChildren(
          el("p", "character-gallery__empty", "Nie udało się wczytać kart postaci."),
        );
      });
    }
    if (section === "chronicle" && !chronicleRendered) {
      renderChronicle(content.chronicle, accent);
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
  if (manifest.audio?.src) {
    const player = new LocalAudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
    });
    const audioColor =
      getComputedStyle(root).getPropertyValue("--theme-audio-color").trim() || accent;
    mountAudioButton(player, audioColor);
  }
}

initialize().catch((error) => {
  console.error("Nie udało się uruchomić Sons of Azalin.", error);
  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("campaign-startup-loading");
  const message = el("p", "barber-load-error", "Nie udało się wczytać kampanii.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
