function el(tag,cls,text){return createElement(tag,{class:cls,text});}
const CAMPAIGN_FILES={manifest:"./manifest.json",theme:"./theme.json",content:"./content.json"};
async function loadCampaignBundle(files={}){const p={...CAMPAIGN_FILES,...files};const [manifest,theme,content]=await Promise.all(Object.values(p).map(async path=>{const r=await fetch(path);if(!r.ok)throw Error("Nie udało się wczytać pliku: "+path);return r.json();}));return {manifest,theme,content};}
function applyCampaignTheme(theme){const root=document.documentElement;Object.entries(theme.colors||{}).forEach(([k,v])=>root.style.setProperty("--theme-"+k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase()),v));const f=theme.typography||{};if(f.heading)root.style.setProperty("--theme-font-1",f.heading);if(f.body)root.style.setProperty("--theme-font-2",f.body);if(f.serif)root.style.setProperty("--theme-font-3",f.serif);}
function createSubpageHero({title,backgroundImage,theme}){const hero=document.createElement("header");hero.className="subpage-hero";hero.style.setProperty("--hero-background","url('"+backgroundImage+"')");hero.style.setProperty("--campaign-accent",theme.accent);const copy=document.createElement("div");copy.className="subpage-hero__copy";copy.append(el("h1","",title));hero.append(copy);return hero;}
function mountSubpageNavbar(mount,{sections=[],playlistUrl}){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left"),home=el("a","vengrath-home-button");home.href="/home/";home.setAttribute("aria-label","Vengrath — strona główna");const image=el("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";home.append(image,el("span","","VENGRATH"));left.append(home);if(playlistUrl){const link=el("a","youtube-playlist-button","YouTube Playlista");link.href=playlistUrl;link.target="_blank";link.rel="noopener noreferrer";left.append(link);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=sections.map((section,i)=>{const b=el("button","subpage-navbar-button",section.text);b.type="button";b.dataset.section=section.sectionLink;b.style.setProperty("--section-color",section.color||"#bca06a");b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==section.sectionLink);buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));});nav.append(b);return b;});mount.replaceChildren(left,nav);const update=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);update();window.addEventListener("scroll",update,{passive:true});if(sections[0])document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==sections[0].sectionLink);}
class CharacterGallery{constructor(root,options){this.root=root;this.ids=options.characterIds||[];}async render(){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać katalogu postaci.");const [all,ach]=await Promise.all([cr.json(),ar.json()]),byId=new Map(all.map(x=>[x.id,x])),defs=new Map(ach.map(x=>[x.id,x])),selected=[...new Set(this.ids)].map(id=>byId.get(id)).filter(Boolean);this.root.replaceChildren();if(!selected.length){this.root.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return;}const grid=el("div","character-gallery");selected.forEach(c=>{const card=el("article","character-card");card.dataset.status=c.status||"";const badges=el("div","character-card__achievements"),earned=(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean);earned.forEach(a=>{const b=el("span","achievement-badge",a.icon||"✦");b.title=a.name||a.id;badges.append(b);});const portrait=el("div","character-card__portrait"),img=el("img");img.src=c.portrait;img.alt=c.character||"Portret postaci";img.loading="lazy";portrait.append(img,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [l,v] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",l),el("span","character-card__value",Array.isArray(v)?v.join(", "):v||"Nie podano"));body.append(row);}card.append(badges,portrait,body,el("p","character-card__achievement-count",earned.length?earned.length+" osiągnięć":"Brak zdobytych osiągnięć"));grid.append(card);});this.root.append(grid);}}
function createChronicleRecord(s,{accent}){const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const head=el("div","chronicle-record__header");head.tabIndex=0;head.setAttribute("role","button");head.setAttribute("aria-expanded","false");const raw=String(s.sessionNumber??s.number??"—"),m=raw.match(/^S?0*(\d+)([A-Z]?)$/i),num=m?String(Number(m[1])).padStart(2,"0")+m[2].toUpperCase():raw;head.append(el("span","chronicle-record__number",num),el("span","chronicle-record__title",s.title||"Bez tytułu"));const date=el("time","chronicle-record__date",s.date||"");date.hidden=!s.date;if(s.date)date.dateTime=s.date;const links=el("div","chronicle-record__recordings"),players=el("div","chronicle-record__players"),recs=Array.isArray(s.recordings)?s.recordings:[];links.hidden=!recs.length;recs.forEach((r,i)=>{const a=el("a","play-recording-button",recs.length>1?"Odtwórz część "+(r.partNumber||i+1):"Odtwórz");a.href=r.url;a.target="_blank";a.rel="noopener noreferrer";links.append(a);});head.append(date,links);links.addEventListener("click",e=>e.stopPropagation());const desc=el("div","chronicle-record__description");desc.hidden=true;desc.append(el("p","",s.description||s.notes||""));const toggle=()=>{const open=desc.hidden;desc.hidden=!open;head.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open);};head.addEventListener("click",toggle);head.addEventListener("keydown",e=>{if(e.target===head&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle();}});article.append(head,players,desc);return article;}
class AudioPlayer{constructor({src,storageKey="vengrath-audio-state",preload="none"}){this.audio=new Audio();this.audio.loop=true;this.audio.preload=preload;this.audio.src=src;this.storageKey=storageKey;this.listeners=new Set();this.audio.volume=.5;try{const s=JSON.parse(localStorage.getItem(storageKey)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(t=>this.audio.addEventListener(t,()=>{if(t==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));window.addEventListener("pagehide",()=>this.persist());}persist(){try{localStorage.setItem(this.storageKey,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume,time:this.audio.currentTime||0};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return ()=>this.listeners.delete(fn);}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async play(){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error(e);}this.emit();}async toggle(){if(this.audio.paused)await this.play();else{this.audio.pause();this.emit();}}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}}
function mountAudioPlayerButton(player,color){const b=el("button","audio-player-button");b.type="button";b.style.setProperty("--player-color",color);const ring=el("span","audio-player-ring"),symbol=el("span","audio-player-symbol");b.append(ring,symbol);let dragging=false;const point=e=>{const r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let a=Math.atan2(y,x)+Math.PI/2;if(a<0)a+=Math.PI*2;return {radius:Math.hypot(x,y),volume:a/(Math.PI*2)};};const volume=e=>player.setVolume(point(e).volume);b.addEventListener("click",e=>{if(dragging){e.preventDefault();return;}if(point(e).radius>18)volume(e);else player.toggle();});b.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();dragging=true;b.setPointerCapture(e.pointerId);volume(e);});b.addEventListener("pointermove",e=>{if(dragging)volume(e);});b.addEventListener("pointerup",()=>dragging=false);b.addEventListener("pointercancel",()=>dragging=false);player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";b.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(b);return {element:b,destroy(){b.remove();}};}






const sections = [
  { text: "Kampania", sectionLink: "campaign" },
  { text: "Postaci", sectionLink: "characters" },
  { text: "Kronika", sectionLink: "chronicle" },
];

function createElement(tagName, properties = {}, ...children) {
  const element = document.createElement(tagName);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === "class") {
      element.className = value;
    } else if (key === "text") {
      element.textContent = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (value !== null && value !== undefined) {
      element.setAttribute(key, String(value));
    }
  });

  children.flat().forEach((child) => {
    if (child !== null && child !== undefined) element.append(child);
  });

  return element;
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}

function createDieControl() {
  const button = createElement("button", {
    class: "die",
    type: "button",
    "aria-label": "Rzuć kością k20",
  });
  const svg = createSvgElement("svg", {
    viewBox: "0 0 200 200",
    "aria-hidden": "true",
    focusable: "false",
  });
  svg.append(
    createSvgElement("polygon", {
      class: "face",
      points: "100,8 180,54 180,146 100,192 20,146 20,54",
    }),
    createSvgElement("polygon", { points: "100,38 156,134 44,134" }),
  );

  [
    [100, 8, 100, 38],
    [180, 54, 156, 134],
    [20, 54, 44, 134],
    [180, 146, 156, 134],
    [20, 146, 44, 134],
    [100, 192, 100, 134],
  ].forEach(([x1, y1, x2, y2]) => {
    svg.append(createSvgElement("line", { x1, y1, x2, y2 }));
  });

  const value = createSvgElement("text", { id: "die-number", x: 100, y: 118 });
  value.textContent = "20";
  svg.append(value);
  button.append(svg);
  return button;
}

function renderEntries(records) {
  const grid = createElement("div", { class: "grid" });
  records.forEach(([name, tag, description]) => {
    grid.append(
      createElement(
        "article",
        { class: "entry" },
        createElement(
          "h3",
          { class: "entry-heading" },
          createElement("span", { text: name }),
          createElement("span", { class: "tag", text: tag }),
        ),
        createElement("p", { text: description }),
      ),
    );
  });
  return grid;
}

function renderHero(heroContent, theme) {
  const hero = createSubpageHero({
    title: heroContent.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.classList.add("fiery-hero");
  hero.id = "campaign-hero";

  const emberCanvas = createElement("canvas", {
    class: "embers",
    "aria-hidden": "true",
  });
  const navbarMount = createElement("div", { class: "fiery-navbar-mount" });
  hero.prepend(emberCanvas, navbarMount);

  const copy = hero.querySelector(".subpage-hero__copy");
  const heading = copy.querySelector("h1");
  heading.id = "hero-title";
  heading.before(createElement("p", { class: "eyebrow", text: heroContent.eyebrow }));
  heading.after(
    createElement("p", { class: "tagline", text: heroContent.tagline }),
  );

  const die = createDieControl();
  const rollMessage = createElement("p", {
    class: "roll-message",
    id: "roll-message",
    "aria-live": "polite",
    text: heroContent.rollPrompt,
  });
  copy.append(die, rollMessage);

  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
    sections: sections.map((section) => ({
      ...section,
      color: theme.colors.accent2,
    })),
  });

  mountDie(die);
  mountEmbers(emberCanvas);
}

function renderCampaign(root, campaign) {
  const statusLabels = {
    done: "ukończony",
    now: "w toku",
    locked: "zamknięty",
  };
  const acts = createElement("div", { class: "acts" });
  campaign.acts.forEach(([act, title, status]) => {
    acts.append(
      createElement(
        "article",
        { class: `act ${status}` },
        createElement("span", {
          class: "act-status",
          text: `${act} · ${statusLabels[status] || status}`,
        }),
        createElement("strong", { text: title }),
      ),
    );
  });

  const dossier = createElement("ul", { class: "dossier" });
  campaign.dossier.forEach(([label, value]) => {
    dossier.append(
      createElement(
        "li",
        {},
        createElement("span", { text: label }),
        createElement("strong", { text: value }),
      ),
    );
  });

  const boss = createElement(
    "aside",
    { class: "boss" },
    createElement("h3", { text: campaign.boss.name }),
    createElement("p", { class: "boss-stats", text: campaign.boss.line }),
    createElement("p", { text: campaign.boss.text }),
  );

  root.replaceChildren(
    createElement("h2", { id: "campaign-title", text: "Kampania" }),
    createElement(
      "div",
      { class: "panel lead" },
      campaign.lead.map((paragraph) => createElement("p", { text: paragraph })),
    ),
    dossier,
    createElement("h3", { class: "sub", text: "Akty kampanii" }),
    acts,
    createElement("h3", { class: "sub", text: "Miejsca" }),
    renderEntries(campaign.places),
    createElement("h3", { class: "sub", text: "Frakcje" }),
    renderEntries(campaign.factions),
    createElement("h3", { class: "sub", text: "Postaci niezależne" }),
    renderEntries(campaign.npcs),
    createElement("h3", { class: "sub", text: "Wielki zły" }),
    boss,
  );
}

async function renderCharacters(root, characters) {
  const gallery = createElement("div", { id: "character-gallery" });
  root.replaceChildren(
    createElement("h2", { id: "characters-title", text: "Postaci" }),
    createElement("p", { class: "characters-kicker", text: characters.kicker }),
    createElement("h3", { class: "characters-heading", text: characters.title }),
    createElement("p", { class: "characters-description", text: characters.description }),
    gallery,
  );

  await new CharacterGallery(gallery, {
    characterIds: characters.characterIds,
    emptyMessage: "Brak kart postaci do wyświetlenia.",
  }).render();
}

function sessionDescription(session) {
  return [
    session.summary,
    `Poziom drużyny: ${session.level}. Łup: ${session.loot}.`,
    "Notatki z sesji:",
    ...session.notes.map((note) => `• ${note}`),
    `Najważniejszy moment: ${session.moment}`,
  ].join("\n\n");
}

function renderChronicle(root, sessions, theme) {
  const timeline = createElement("div", { class: "timeline" });
  sessions.forEach((session, index) => {
    const record = createChronicleRecord(
      {
        sessionNumber: index + 1,
        title: session.title,
        description: sessionDescription(session),
        recordings: session.recordings,
      },
      { accent: theme.colors.accent2 },
    );

    const title = record.querySelector(".chronicle-record__title");
    title.append(
      createElement("span", {
        class: "session-date",
        text: `${session.date} · poziom ${session.level}`,
      }),
    );
    const recordingControls = record.querySelector(
      ".chronicle-record__recordings",
    );
    if (!session.recordings.length) {
      recordingControls.append(
        createElement("span", {
          class: "recording-status",
          text: session.recordingStatus,
        }),
      );
    }
    timeline.append(record);
  });

  root.replaceChildren(
    createElement("h2", { id: "chronicle-title", text: "Kronika" }),
    createElement(
      "p",
      {
        class: "chronicle-intro",
        text: "Rozwiń kartę sesji, aby zobaczyć notatki. Gdy pojawi się nagranie, " +
          "przycisk odtwarzania będzie dostępny w nagłówku karty.",
      },
    ),
    timeline,
  );
}

function mountDie(button) {
  const value = button.querySelector("#die-number");
  const message = document.querySelector("#roll-message");
  let busy = false;

  button.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    button.className = "die rolling";
    let ticks = 0;

    const timer = window.setInterval(() => {
      value.textContent = String(1 + Math.floor(Math.random() * 20));
      ticks += 1;
      if (ticks < 12) return;

      window.clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * 20);
      value.textContent = String(result);
      button.className = result === 20 ? "die crit" : result === 1 ? "die fail" : "die";
      message.textContent =
        result === 20
          ? "KRYTYK! Bogowie kości są dziś z wami."
          : result === 1
            ? "Naturalna jedynka… Zariel zwróciła na was uwagę."
            : `Wyrzucono ${result}. ${result >= 15 ? "Prowadzicie." : "Avernus czeka."}`;
      busy = false;
    }, 60);
  });
}

function mountEmbers(canvas) {
  const context = canvas.getContext("2d");
  if (!context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const sparks = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.6 + Math.random() * 2,
    velocity: 0.0006 + Math.random() * 0.0016,
    drift: Math.random() * Math.PI * 2,
  }));

  const fitCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  fitCanvas();
  window.addEventListener("resize", fitCanvas);

  function drawFrame(time) {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    sparks.forEach((spark) => {
      spark.y -= spark.velocity * 16;
      if (spark.y < -0.02) {
        spark.y = 1.02;
        spark.x = Math.random();
      }

      const x =
        (spark.x + Math.sin(time / 900 + spark.drift) * 0.012) * canvas.clientWidth;
      context.beginPath();
      context.arc(x, spark.y * canvas.clientHeight, spark.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, ${120 + Math.floor(spark.radius * 40)}, 40, ${0.35 + spark.y * 0.55})`;
      context.fill();
    });
    window.requestAnimationFrame(drawFrame);
  }

  window.requestAnimationFrame(drawFrame);
}

async function initializeCampaignPage() {
  const { manifest, theme, content } = await loadCampaignBundle();
  applyCampaignTheme(theme);
  renderHero(content.hero, theme);
  renderCampaign(document.querySelector("#campaign-content"), content.campaign);
  await renderCharacters(document.querySelector("#characters-content"), content.characters);
  renderChronicle(document.querySelector("#chronicle-content"), content.chronicle, theme);
  document.title = `${manifest.title} — Vengrath`;
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error("Nie udało się uruchomić kampanii Descent into Avernus.", error);
    document.body.classList.remove("campaign-startup-loading");
    const message = createElement("p", {
      class: "page-error",
      text: "Nie udało się wczytać kampanii. Odśwież stronę za chwilę.",
    });
    document.querySelector("main")?.prepend(message);
  });
