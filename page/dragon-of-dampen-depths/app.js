function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function createSubpageHero({title,backgroundImage,theme}){const hero=document.createElement("header");hero.className="subpage-hero";hero.style.setProperty("--hero-background","url('"+backgroundImage+"')");hero.style.setProperty("--campaign-accent",theme.accent);const copy=document.createElement("div");copy.className="subpage-hero__copy";copy.append(el("h1","",title));hero.append(copy);return hero;}
function mountSubpageNavbar(mount,{sections=[],playlistUrl}){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left"),home=el("a","vengrath-home-button");home.href="/home/";home.setAttribute("aria-label","Vengrath — strona główna");const image=el("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";home.append(image,el("span","","VENGRATH"));left.append(home);if(playlistUrl){const link=el("a","youtube-playlist-button","YouTube Playlista");link.href=playlistUrl;link.target="_blank";link.rel="noopener noreferrer";left.append(link);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=sections.map((section,i)=>{const b=el("button","subpage-navbar-button",section.text);b.type="button";b.dataset.section=section.sectionLink;b.style.setProperty("--section-color",section.color||"#bca06a");b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==section.sectionLink);buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));mount.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:section.sectionLink}}));});nav.append(b);return b;});mount.replaceChildren(left,nav);const update=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);update();window.addEventListener("scroll",update,{passive:true});if(sections[0])document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==sections[0].sectionLink);}
class CharacterGallery{constructor(root,options){this.root=root;this.ids=options.characterIds||[];}async render(){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać katalogu postaci.");const [all,ach]=await Promise.all([cr.json(),ar.json()]),byId=new Map(all.map(x=>[x.id,x])),defs=new Map(ach.map(x=>[x.id,x])),selected=[...new Set(this.ids)].map(id=>byId.get(id)).filter(Boolean);this.root.replaceChildren();if(!selected.length){this.root.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return;}const grid=el("div","character-gallery");selected.forEach(c=>{const card=el("article","character-card");card.dataset.status=c.status||"";const badges=el("div","character-card__achievements"),earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [l,v] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",l),el("span","character-card__value",Array.isArray(v)?v.join(", "):v||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});this.root.append(grid);}}
function ytTarget(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,"").toLowerCase();if(host==="youtu.be")return{videoId:u.pathname.split("/").filter(Boolean)[0]};if(host.endsWith("youtube.com")||host.endsWith("youtube-nocookie.com")){const videoId=u.searchParams.get("v")||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1],playlistId=u.searchParams.get("list");if(videoId)return{videoId,playlistId};if(playlistId)return{playlistId};}}catch{}return null;}
let activeChronicleClose=null;
function createChronicleRecord(session,{accent}){const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const header=el("div","chronicle-record__header");header.tabIndex=0;header.setAttribute("role","button");header.setAttribute("aria-expanded","false");const raw=String(session.sessionNumber??session.number??"—"),m=raw.match(/^S?0*(\d+)([A-Z]?)$/i),number=m?String(Number(m[1])).padStart(2,"0")+m[2].toUpperCase():raw,title=String(session.title||"Bez tytułu");header.append(el("span","chronicle-record__number",number),el("span","chronicle-record__title",title));const date=el("time","chronicle-record__date",session.date||"");date.hidden=!session.date;if(session.date)date.dateTime=session.date;const links=el("div","chronicle-record__recordings"),players=el("div","chronicle-record__players"),recs=Array.isArray(session.recordings)?session.recordings:[];links.hidden=!recs.length;recs.forEach((rec,i)=>{const target=ytTarget(rec.url),part=rec.partNumber||(recs.length>1?i+1:null),label=recs.length>1?"Odtwórz Część "+(part||i+1):"Odtwórz";if(!target){const a=el("a","play-recording-button",label+" ▶");a.href=rec.url;a.target="_blank";a.rel="noopener noreferrer";links.append(a);return;}const btn=el("button","chronicle-inline-player__toggle",label);btn.type="button";btn.setAttribute("aria-expanded","false");const panel=el("section","chronicle-inline-player");panel.hidden=true;const phead=el("header","chronicle-inline-player__header");phead.append(el("strong","chronicle-inline-player__title",title),el("span","chronicle-inline-player__tag","NAGRANIE · YOUTUBE"));const video=el("div","chronicle-inline-player__video"),foot=el("footer","chronicle-inline-player__footer");const ext=el("a","","OTWÓRZ W YOUTUBE ↗");ext.href=rec.url;ext.target="_blank";ext.rel="noopener noreferrer";foot.append(el("span","","SESJA "+number+(part?" · CZĘŚĆ "+part:"")),ext);panel.append(phead,video,foot);const close=()=>{video.replaceChildren();panel.hidden=true;btn.setAttribute("aria-expanded","false");btn.textContent=label;if(activeChronicleClose===close)activeChronicleClose=null;};btn.addEventListener("click",e=>{e.stopPropagation();if(!panel.hidden){close();return;}if(activeChronicleClose)activeChronicleClose();const frame=el("iframe");frame.src=target.videoId?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(target.videoId)+(target.playlistId?"?list="+encodeURIComponent(target.playlistId)+"&rel=0":"?rel=0"):"https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(target.playlistId);frame.title=title;frame.loading="lazy";frame.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";frame.referrerPolicy="strict-origin-when-cross-origin";frame.allowFullscreen=true;video.replaceChildren(frame);panel.hidden=false;btn.setAttribute("aria-expanded","true");btn.textContent="ZAMKNIJ";activeChronicleClose=close;});links.append(btn);players.append(panel);});header.append(date,links);links.addEventListener("click",e=>e.stopPropagation());const description=el("div","chronicle-record__description");description.hidden=true;description.append(el("p","",session.description||session.notes||""));const toggle=()=>{const open=description.hidden;description.hidden=!open;header.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};header.addEventListener("click",toggle);header.addEventListener("keydown",e=>{if(e.target===header&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(header,players,description);return article;}
class AudioPlayer{constructor({src,storageKey="vengrath-audio-state",preload="none"}){this.audio=new Audio();this.audio.loop=true;this.audio.preload=preload;this.audio.src=src;this.storageKey=storageKey;this.listeners=new Set();this.audio.volume=.5;try{const s=JSON.parse(localStorage.getItem(storageKey)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(t=>this.audio.addEventListener(t,()=>{if(t==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));window.addEventListener("pagehide",()=>this.persist());}persist(){try{localStorage.setItem(this.storageKey,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume,time:this.audio.currentTime||0};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return ()=>this.listeners.delete(fn);}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async play(){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error(e);}this.emit();}async toggle(){if(this.audio.paused)await this.play();else{this.audio.pause();this.emit();}}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}destroy(){this.persist();this.audio.pause();this.audio.removeAttribute("src");this.audio.load();this.listeners.clear();}}
function mountAudioPlayerButton(player,color,{autoplay=true}={}){const b=el("button","audio-player-button");b.type="button";b.style.setProperty("--player-color",color);const ring=el("span","audio-player-ring"),symbol=el("span","audio-player-symbol");b.append(ring,symbol);let dragging=false;const point=e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;return {radius:Math.hypot(x,y),volume:a/(Math.PI*2)};};const vol=e=>player.setVolume(point(e).volume);b.addEventListener("click",e=>{if(dragging){e.preventDefault();return;}if(point(e).radius>18)vol(e);else player.toggle();});b.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();dragging=true;b.setPointerCapture(e.pointerId);vol(e);});b.addEventListener("pointermove",e=>{if(dragging)vol(e);});b.addEventListener("pointerup",()=>dragging=false);b.addEventListener("pointercancel",()=>dragging=false);const off=player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";b.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(b);if(autoplay)player.play();return {element:b,destroy(){off();b.remove();}};}






async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return response.json();
}

async function initializeCampaignPage() {
  const root = document.documentElement;
  const accent =
    getComputedStyle(root).getPropertyValue("--theme-accent-2").trim() || "#bca06a";
  const [manifest, content] = await Promise.all([
    readJson("./manifest.json"),
    readJson("./content.json"),
  ]);
  const hero = document.querySelector("#campaign-hero");
  const copy = hero.querySelector(".subpage-hero__copy");
  const heading = copy.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(document.createElement("em"), {
      className: "dodd-hero-title-accent",
      textContent: content.campaign.heroSecondLine,
    }),
  );
  copy.querySelector(".dodd-hero-kicker").textContent = content.campaign.kicker;
  copy.querySelector(".dodd-hero-lead").textContent = content.campaign.lead;
  const nav = document.createElement("div");
  nav.className = "dodd-navbar-mount";
  hero.prepend(nav);
  mountSubpageNavbar(nav, {
    playlistUrl: manifest.playlistUrl || undefined,
    sections: [
      {text: "Kampania", sectionLink: "campaign", color: accent},
      {text: "Postaci", sectionLink: "characters", color: accent},
      {text: "Kronika", sectionLink: "chronicle", color: accent},
    ],
  });

  document.querySelector("#intro-title").textContent = content.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(...content.campaign.introParagraphs.map((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));
  document.querySelector("#campaign-dossier").replaceChildren(...content.campaign.dossier.map((item) => {
    const row = document.createElement("div");
    row.className = "dodd-dossier-row";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    if (item.label === "STATUS") value.className = "dodd-status";
    row.append(label, value);
    return row;
  }));
  document.querySelector("#party-title").textContent = content.campaign.partyTitle;
  document.querySelector("#party-description").textContent = content.campaign.partyDescription;
  const partyImage = document.querySelector("#party-image");
  partyImage.src = content.campaign.partyImage;
  partyImage.alt = content.campaign.title;
  partyImage.loading = "lazy";
  partyImage.decoding = "async";
  document.querySelector("#manifesto-title").textContent = content.campaign.manifestoTitle;
  document.querySelector("#manifesto-quote").textContent = "„" + content.campaign.manifesto + "”";
  document.querySelector("#manifesto-tags").textContent = content.campaign.manifestoTags;
  document.querySelector("#campaign-archive").replaceChildren(...content.campaign.archiveSections.map((section) => {
    const article = document.createElement("article");
    article.className = "dodd-archive-card";
    article.append(
      el("div", "dodd-section-mark", "AKTA / " + section.number),
      el("h3", "", section.title),
      el("p", "", section.description),
    );
    return article;
  }));

  document.querySelector("#characters-kicker").textContent = content.characters.kicker;
  document.querySelector("#characters-title").textContent = content.characters.title;
  document.querySelector("#characters-description").textContent = content.characters.description;
  document.querySelector("#chronicle-kicker").textContent = content.chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = content.chronicle.title;
  document.querySelector("#chronicle-description").textContent = content.chronicle.description;
  const playlist = document.querySelector("#chronicle-playlist");
  if (content.chronicle.playlistUrl) {
    playlist.href = content.chronicle.playlistUrl;
    playlist.hidden = false;
  }
  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + content.campaign.title.toUpperCase();

  let characterPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !characterPromise) {
      characterPromise = new CharacterGallery(document.querySelector("#character-gallery"), {
        characterIds: content.characters.characterIds,
      }).render().catch((error) => {
        console.error("Nie udało się wczytać postaci.", error);
        characterPromise = null;
        document.querySelector("#character-gallery").replaceChildren(
          el("p", "character-gallery__empty", "Nie udało się wczytać postaci."),
        );
      });
    }
    if (section === "chronicle" && !chronicleRendered) {
      document.querySelector("#chronicle-records").replaceChildren(
        ...content.chronicle.sessions.map((session) =>
          createChronicleRecord(session, {accent}),
        ),
      );
      chronicleRendered = true;
    }
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
  if (manifest.audio?.src) {
    const audioPlayer = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
      preload: "none",
    });
    const audioColor =
      getComputedStyle(root).getPropertyValue("--theme-audio-color").trim() || accent;
    mountAudioPlayerButton(audioPlayer, audioColor);
  }
}
initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić strony Dragon of Dampen Depths.", error);
  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("campaign-startup-loading");
  const message = el("p", "dodd-load-error", "Nie udało się wczytać archiwum kampanii.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
