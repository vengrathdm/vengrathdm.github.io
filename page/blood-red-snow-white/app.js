function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function createSubpageHero({title,backgroundImage,theme}){const hero=document.createElement("header");hero.className="subpage-hero";hero.style.setProperty("--hero-background","url('"+backgroundImage+"')");hero.style.setProperty("--campaign-accent",theme.accent);const copy=document.createElement("div");copy.className="subpage-hero__copy";copy.append(el("h1","",title));hero.append(copy);return hero;}
function mountSubpageNavbar(mount,{sections=[],playlistUrl}){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left"),home=el("a","vengrath-home-button");home.href="/home/";home.setAttribute("aria-label","Vengrath — strona główna");const image=el("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";home.append(image,el("span","","VENGRATH"));left.append(home);if(playlistUrl){const link=el("a","youtube-playlist-button","YouTube Playlista");link.href=playlistUrl;link.target="_blank";link.rel="noopener noreferrer";left.append(link);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=sections.map((section,i)=>{const b=el("button","subpage-navbar-button",section.text);b.type="button";b.dataset.section=section.sectionLink;b.style.setProperty("--section-color",section.color||"#bca06a");b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==section.sectionLink);buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));});nav.append(b);return b;});mount.replaceChildren(left,nav);const update=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);update();window.addEventListener("scroll",update,{passive:true});if(sections[0])document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==sections[0].sectionLink);}
class CharacterGallery{constructor(root,options){this.root=root;this.ids=options.characterIds||[];}async render(){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać katalogu postaci.");const [all,ach]=await Promise.all([cr.json(),ar.json()]),byId=new Map(all.map(x=>[x.id,x])),defs=new Map(ach.map(x=>[x.id,x])),selected=[...new Set(this.ids)].map(id=>byId.get(id)).filter(Boolean);this.root.replaceChildren();if(!selected.length){this.root.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return;}const grid=el("div","character-gallery");selected.forEach(c=>{const card=el("article","character-card");card.dataset.status=c.status||"";const badges=el("div","character-card__achievements"),earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [l,v] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",l),el("span","character-card__value",Array.isArray(v)?v.join(", "):v||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});this.root.append(grid);}}
function createChronicleRecord(s,{accent}){const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const head=el("div","chronicle-record__header");head.tabIndex=0;head.setAttribute("role","button");head.setAttribute("aria-expanded","false");const raw=String(s.sessionNumber??s.number??"—"),m=raw.match(/^S?0*(\d+)([A-Z]?)$/i),num=m?String(Number(m[1])).padStart(2,"0")+m[2].toUpperCase():raw;head.append(el("span","chronicle-record__number",num),el("span","chronicle-record__title",s.title||"Bez tytułu"));const date=el("time","chronicle-record__date",s.date||"");date.hidden=!s.date;if(s.date)date.dateTime=s.date;const links=el("div","chronicle-record__recordings"),players=el("div","chronicle-record__players"),recs=Array.isArray(s.recordings)?s.recordings:[];links.hidden=!recs.length;recs.forEach((r,i)=>{const a=el("a","play-recording-button",recs.length>1?"Odtwórz część "+(r.partNumber||i+1):"Odtwórz");a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";links.append(a);});head.append(date,links);links.addEventListener("click",e=>e.stopPropagation());const desc=el("div","chronicle-record__description");desc.hidden=true;desc.append(el("p","",s.description||s.notes||""));const toggle=()=>{const open=desc.hidden;desc.hidden=!open;head.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};head.addEventListener("click",toggle);head.addEventListener("keydown",e=>{if(e.target===head&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(head,players,desc);return article;}
class AudioPlayer{constructor({src,storageKey="vengrath-audio-state",preload="none"}){this.audio=new Audio();this.audio.loop=true;this.audio.preload=preload;this.audio.src=src;this.storageKey=storageKey;this.listeners=new Set();this.audio.volume=.5;try{const s=JSON.parse(localStorage.getItem(storageKey)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(t=>this.audio.addEventListener(t,()=>{if(t==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));window.addEventListener("pagehide",()=>this.persist());}persist(){try{localStorage.setItem(this.storageKey,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume,time:this.audio.currentTime||0};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return ()=>this.listeners.delete(fn);}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async play(){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error(e);}this.emit();}async toggle(){if(this.audio.paused)await this.play();else{this.audio.pause();this.emit();}}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}}
function mountAudioPlayerButton(player,color){const b=el("button","audio-player-button");b.type="button";b.style.setProperty("--player-color",color);const ring=el("span","audio-player-ring"),symbol=el("span","audio-player-symbol");b.append(ring,symbol);let dragging=false;const point=e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;return {radius:Math.hypot(x,y),volume:a/(Math.PI*2)};};const volume=e=>player.setVolume(point(e).volume);b.addEventListener("click",e=>{if(dragging){e.preventDefault();return;}if(point(e).radius>18)volume(e);else player.toggle();});b.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();dragging=true;b.setPointerCapture(e.pointerId);volume(e);});b.addEventListener("pointermove",e=>{if(dragging)volume(e);});b.addEventListener("pointerup",()=>dragging=false);b.addEventListener("pointercancel",()=>dragging=false);player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";b.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(b);return {element:b,destroy(){b.remove();}};}






const themeVariables = {
  base1: "--theme-base-1",
  base2: "--theme-base-2",
  base3: "--theme-base-3",
  base4: "--theme-base-4",
  base5: "--theme-base-5",
  accent1: "--theme-accent-1",
  accent2: "--theme-accent-2",
  text1: "--theme-text-1",
  text2: "--theme-text-2",
  text3: "--theme-text-3",
  textMuted: "--theme-text-muted",
  titleAccent: "--theme-title-accent",
  line1: "--theme-line-1",
  line2: "--theme-line-2",
  navBackground: "--theme-nav-background",
  navText: "--theme-nav-text",
  navActiveBackground: "--theme-nav-active-background",
};

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return response.json();
}

function applyTheme(theme) {
  Object.entries(themeVariables).forEach(([key, property]) => {
    if (theme.colors[key])
      document.documentElement.style.setProperty(property, theme.colors[key]);
  });
  document.documentElement.style.setProperty(
    "--theme-font-1",
    theme.typography.heading,
  );
  document.documentElement.style.setProperty(
    "--theme-font-2",
    theme.typography.body,
  );
  document.documentElement.style.setProperty(
    "--theme-font-3",
    theme.typography.serif,
  );
  document.documentElement.style.setProperty(
    "--campaign-accent",
    theme.colors.accent2,
  );
  document.documentElement.style.setProperty(
    "--chronicle-heading-font",
    "var(--theme-font-1)",
  );
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    readJson("./manifest.json"),
    readJson("./theme.json"),
    readJson("./content.json"),
  ]);

  applyTheme(theme);
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";
  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(document.createElement("em"), {
      className: "brsw-hero-title-accent",
      textContent: content.campaign.heroSecondLine,
    }),
  );
  const kicker = document.createElement("p");
  kicker.className = "brsw-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "brsw-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.before(kicker);
  heading.after(lead);

  const nav = document.createElement("div");
  nav.className = "brsw-navbar-mount";
  hero.prepend(nav);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(nav, {
    playlistUrl: manifest.playlistUrl || undefined,
    sections: [
      {
        text: "Kampania",
        sectionLink: "campaign",
        color: theme.colors.accent2,
      },
      {
        text: "Postaci",
        sectionLink: "characters",
        color: theme.colors.accent2,
      },
      {
        text: "Kronika",
        sectionLink: "chronicle",
        color: theme.colors.accent2,
      },
    ],
  });

  document.querySelector("#intro-title").textContent =
    content.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(
    ...content.campaign.introParagraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...content.campaign.dossier.map((item) => {
      const row = document.createElement("div");
      row.className = "brsw-dossier-row";
      const label = document.createElement("span");
      label.textContent = item.label;
      const value = document.createElement("strong");
      value.textContent = item.value;
      if (item.label === "STATUS") value.className = "brsw-status";
      row.append(label, value);
      return row;
    }),
  );
  document.querySelector("#party-title").textContent =
    content.campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    content.campaign.partyDescription;
  document.querySelector("#party-image").src = content.campaign.partyImage;
  document.querySelector("#manifesto-title").textContent =
    content.campaign.manifestoTitle;
  document.querySelector("#manifesto-quote").textContent =
    "„" + content.campaign.manifesto + "”";
  document.querySelector("#manifesto-tags").textContent =
    content.campaign.manifestoTags;

  document.querySelector("#campaign-archive").replaceChildren(
    ...content.campaign.archiveSections.map((section) => {
      const article = document.createElement("article");
      article.className = "brsw-archive-card";
      const kicker = document.createElement("div");
      kicker.className = "brsw-section-mark";
      kicker.textContent = "AKTA / " + section.number;
      const title = document.createElement("h3");
      title.textContent = section.title;
      const description = document.createElement("p");
      description.textContent = section.description;
      article.append(kicker, title, description);
      return article;
    }),
  );

  document.querySelector("#characters-kicker").textContent =
    content.characters.kicker;
  document.querySelector("#characters-title").textContent =
    content.characters.title;
  document.querySelector("#characters-description").textContent =
    content.characters.description;
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: content.characters.characterIds,
  }).render();

  document.querySelector("#chronicle-kicker").textContent =
    content.chronicle.kicker;
  document.querySelector("#chronicle-title").textContent =
    content.chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    content.chronicle.description;
  const playlist = document.querySelector("#chronicle-playlist");
  if (content.chronicle.playlistUrl) {
    playlist.href = content.chronicle.playlistUrl;
    playlist.hidden = false;
  }
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...content.chronicle.sessions.map((session) =>
        createChronicleRecord(session, { accent: theme.colors.accent2 }),
      ),
    );

  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + content.campaign.title.toUpperCase();
  if (manifest.audio && manifest.audio.src) {
    const audioPlayer = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
    });
    mountAudioPlayerButton(
      audioPlayer,
      theme.audioColor || theme.colors.accent1,
    );
  }
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error("Nie udało się uruchomić strony Blood Red Snow White.", error);
  });