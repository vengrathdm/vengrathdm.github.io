async function loadJson(path){const r=await fetch(path);if(!r.ok)throw new Error("Nie udało się wczytać "+path+" ("+r.status+")");return r.json()}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function makeHome(){const a=el("a","vengrath-home-button");a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const img=el("img");img.src="/core/graphics/favicon/favicon.ico";img.alt="";a.append(img,el("span","", "VENGRATH"));return a}
function makePlaylist(url){const a=el("a","youtube-playlist-button");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.append(el("span","","YouTube"),el("span","","Playlista"));return a}
function mountNavbar(manifest,theme){const nav=el("div","subpage-navbar barber-navbar-mount");const left=el("div","subpage-navbar__left");left.append(makeHome());if(manifest.playlistUrl)left.append(makePlaylist(manifest.playlistUrl));const right=el("nav","subpage-navbar__sections");right.setAttribute("aria-label","Sekcje kampanii");const sections=[["Kampania","campaign"],["Postaci","characters"],["Kronika","chronicle"]];const buttons=sections.map(([label,id],i)=>{const b=el("button","subpage-navbar-button",label);b.type="button";b.dataset.section=id;b.style.setProperty("--section-color",theme.colors.accent2);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));right.append(b);return b});function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));nav.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}))}nav.append(left,right);document.body.prepend(nav);const update=()=>nav.classList.toggle("is-scrolled",scrollY>12);update();window.addEventListener("scroll",update,{passive:true});select("campaign")}
async function loadCharacterCatalog(){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać katalogu postaci");const [characters,achievements]=await Promise.all([cr.json(),ar.json()]);return {characters,achievements}}
async function renderGallery(container,ids,catalog){const {characters,achievements}=catalog||await loadCharacterCatalog();const byId=new Map(characters.map(c=>[c.id,c]));const defs=new Map(achievements.map(a=>[a.id,a]));const selected=[...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);container.replaceChildren();if(!selected.length){container.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return}const grid=el("div","character-gallery");for(const c of selected){const card=el("article","character-card");card.dataset.status=c.status||"";card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","Otwórz rekord postaci "+(c.character||""));const badges=el("div","character-card__achievements");(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean).forEach(a=>{const badge=el("span","achievement-badge",a.icon||"✦");badge.title=a.name||a.id;badges.append(badge)});const portrait=el("div","character-card__portrait");const image=el("img");image.src=c.portrait;image.alt=c.character||"Portret postaci";image.loading="lazy";portrait.append(image,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [label,value] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",label),el("span","character-card__value",Array.isArray(value)?value.join(", "):value||"Nie podano"));body.append(row)}const earned=(c.achievementIds||[]).filter(id=>defs.has(id)).length;card.append(badges,portrait,body,el("p","character-card__achievement-count",earned?earned+" osiągnięć":"Brak zdobytych osiągnięć"));card.addEventListener("click",()=>card.dispatchEvent(new CustomEvent("characterselect",{bubbles:true,detail:{character:c}})));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click()}});grid.append(card)}container.append(grid)}
function ytTarget(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,"").toLowerCase();if(host==="youtu.be")return{videoId:u.pathname.split("/").filter(Boolean)[0]};if(host.endsWith("youtube.com")||host.endsWith("youtube-nocookie.com")){const videoId=u.searchParams.get("v")||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];const playlistId=u.searchParams.get("list");if(videoId)return{videoId,playlistId};if(playlistId)return{playlistId}}}catch{}return null}
let activeClose=null;
function makeChronicle(session,accent){const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const header=el("div","chronicle-record__header");header.tabIndex=0;header.setAttribute("role","button");header.setAttribute("aria-expanded","false");const raw=String(session.sessionNumber??session.number??"—").trim();const match=raw.match(/^S?0*(\d+)([A-Z]?)$/i);const number=match?String(Number(match[1])).padStart(2,"0")+match[2].toUpperCase():raw;const titleRaw=String(session.title||"Bez tytułu").trim();const titleValue=titleRaw.replace(/^.*?\bS\d+(?:P\d+)?\s*[-–—:]\s*/i,"").replace(/^.*?#\s*\d+\s*[-–—:]\s*/i,"").replace(/\s+S\d+(?:P\d+)?\s*\[[^\]]+\]$/i,"").trim()||titleRaw;header.append(el("span","chronicle-record__number",number),el("span","chronicle-record__title",titleValue));const date=el("time","chronicle-record__date",session.date||"");date.hidden=!session.date;if(session.date){const m=session.date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);date.dateTime=m?m[3]+"-"+m[2]+"-"+m[1]:session.date}const recordings=el("div","chronicle-record__recordings");const players=el("div","chronicle-record__players");const links=Array.isArray(session.recordings)?session.recordings:[];recordings.hidden=!links.length;links.forEach((rec,i)=>{const part=rec.partNumber||(links.length>1?i+1:null);const label=links.length>1?"Odtwórz Część "+(part||i+1):"Odtwórz";const target=ytTarget(rec.url);if(target){const btn=el("button","chronicle-inline-player__toggle",label);btn.type="button";btn.setAttribute("aria-expanded","false");const panel=el("section","chronicle-inline-player");panel.hidden=true;const phead=el("header","chronicle-inline-player__header");phead.append(el("strong","chronicle-inline-player__title",titleValue),el("span","chronicle-inline-player__tag","NAGRANIE · YOUTUBE"));const video=el("div","chronicle-inline-player__video");const foot=el("footer","chronicle-inline-player__footer");const meta=el("span","", "SESJA "+number+(part?" · CZĘŚĆ "+part:""));const ext=el("a","","OTWÓRZ W YOUTUBE ↗");ext.href=rec.url;ext.target="_blank";ext.rel="noopener noreferrer";foot.append(meta,ext);panel.append(phead,video,foot);const close=()=>{video.replaceChildren();panel.hidden=true;btn.setAttribute("aria-expanded","false");btn.textContent=label;if(activeClose===close)activeClose=null};btn.addEventListener("click",e=>{e.stopPropagation();if(!panel.hidden){close();return}if(activeClose)activeClose();const iframe=el("iframe");iframe.src=target.videoId?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(target.videoId)+(target.playlistId?"?list="+encodeURIComponent(target.playlistId)+"&rel=0":"?rel=0"):"https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(target.playlistId);iframe.title=titleValue;iframe.loading="lazy";iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.allowFullscreen=true;video.replaceChildren(iframe);panel.hidden=false;btn.setAttribute("aria-expanded","true");btn.textContent="ZAMKNIJ";activeClose=close});recordings.append(btn);players.append(panel)}else if(rec.url){const a=el("a","play-recording-button",label+" ▶");a.href=rec.url;a.target="_blank";a.rel="noopener noreferrer";a.addEventListener("click",e=>e.stopPropagation());recordings.append(a)}});recordings.addEventListener("click",e=>e.stopPropagation());header.append(date,recordings);const description=el("div","chronicle-record__description");description.hidden=true;description.append(el("p","",session.description||session.notes||""));const toggle=()=>{const open=description.hidden;description.hidden=!open;header.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open)};header.addEventListener("click",toggle);header.addEventListener("keydown",e=>{if(e.target===header&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle()}});article.append(header,players,description);return article}
export class AudioPlayer {
  constructor({
    src,
    storageKey = "vengrath-audio-state",
    preload = "none",
  }) {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = preload;
    this.audio.src = src;
    this.storageKey = storageKey;
    this.listeners = new Set();
    this.audio.volume = 0.5;
    this.restore();

    ["play", "pause", "volumechange", "timeupdate", "loadedmetadata"].forEach(
      (type) => {
        this.audio.addEventListener(type, () => {
          if (type === "loadedmetadata" && this.pendingTime > 0) {
            this.audio.currentTime = Math.min(
              this.pendingTime,
              this.audio.duration || this.pendingTime,
            );
          }

          this.persist();
          this.emit();
        });
      },
    );

    window.addEventListener("pagehide", () => this.persist());
  }

  restore() {
    try {
      const state = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
      this.audio.volume = Math.max(0, Math.min(1, Number(state.volume ?? 0.5)));
      this.pendingTime = Math.max(0, Number(state.time) || 0);
    } catch {
      this.pendingTime = 0;
    }
  }

  persist() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          volume: this.audio.volume,
          time: this.audio.currentTime || 0,
        }),
      );
    } catch {
      // Storage can be unavailable in private browsing or restricted contexts.
    }
  }

  snapshot() {
    return {
      playing: !this.audio.paused,
      volume: this.audio.volume,
      time: this.audio.currentTime || 0,
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  emit() {
    const state = this.snapshot();
    this.listeners.forEach((listener) => listener(state));
  }

  async play() {
    try {
      await this.audio.play();
    } catch (error) {
      // Browsers may block audible autoplay until the visitor interacts.
      if (error?.name !== "NotAllowedError") {
        console.error("Audio playback could not start.", error);
      }
    }

    this.emit();
  }

  async toggle() {
    if (this.audio.paused) {
      await this.play();
    } else {
      this.audio.pause();
      this.emit();
    }
  }

  setVolume(value) {
    this.audio.volume = Math.max(0, Math.min(1, value));
    this.persist();
    this.emit();
  }

  destroy() {
    this.persist();
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.listeners.clear();
  }
}

export function mountAudioPlayerButton(
  player,
  color = "#bca06a",
  { autoplay = true } = {},
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "audio-player-button";
  button.style.setProperty("--player-color", color);

  const ring = document.createElement("span");
  ring.className = "audio-player-ring";

  const symbol = document.createElement("span");
  symbol.className = "audio-player-symbol";
  button.append(ring, symbol);

  let dragging = false;

  const point = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    let angle = Math.atan2(y, x) + Math.PI / 2;

    if (angle < 0) angle += Math.PI * 2;

    return {
      radius: Math.hypot(x, y),
      volume: angle / (Math.PI * 2),
    };
  };

  const updateVolume = (event) => player.setVolume(point(event).volume);

  button.addEventListener("click", (event) => {
    if (dragging) {
      event.preventDefault();
      return;
    }

    if (point(event).radius > 18) {
      updateVolume(event);
    } else {
      player.toggle();
    }
  });

  button.addEventListener("pointerdown", (event) => {
    if (point(event).radius <= 18) return;

    event.preventDefault();
    dragging = true;
    button.setPointerCapture(event.pointerId);
    updateVolume(event);
  });

  button.addEventListener("pointermove", (event) => {
    if (dragging) updateVolume(event);
  });

  button.addEventListener("pointerup", () => {
    dragging = false;
  });

  button.addEventListener("pointercancel", () => {
    dragging = false;
  });

  const unsubscribe = player.subscribe((state) => {
    symbol.textContent = state.playing ? "Ⅱ" : "▶";
    button.setAttribute(
      "aria-label",
      state.playing ? "Wstrzymaj audio" : "Odtwórz audio",
    );
    ring.style.setProperty("--volume", state.volume * 100 + "%");
  });

  document.body.append(button);

  if (autoplay) {
    // Browsers may require a user gesture before starting playback.
    player.play();
  }

  return {
    element: button,
    destroy() {
      unsubscribe();
      button.remove();
    },
  };
}

async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const root = document.documentElement;
  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    root.style.setProperty("--theme-" + key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()), value);
  });
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);
  root.style.setProperty("--campaign-accent", theme.colors.accent2);

  const hero = document.querySelector("#campaign-hero");
  hero.style.setProperty("--hero-background", "url('" + theme.heroImage + "')");
  hero.querySelector(".sands-hero-kicker").textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode("SANDS"),
    document.createElement("br"),
    el("em", "sands-hero-title-accent", "OF DOOM"),
  );
  hero.querySelector(".sands-hero-lead").textContent = content.campaign.lead;
  mountNavbar(manifest, theme);

  const campaign = content.campaign;
  document.querySelector("#campaign-intro-title").textContent = campaign.introTitle;
  const intro = document.querySelector("#campaign-intro-copy");
  const allowedMarkup = new Set(["I", "EM", "STRONG", "B", "BR"]);
  const copyNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode("");
    if (!allowedMarkup.has(node.tagName)) return document.createTextNode(node.textContent || "");
    const safe = document.createElement(node.tagName.toLowerCase());
    node.childNodes.forEach((child) => safe.append(copyNode(child)));
    return safe;
  };
  intro.replaceChildren(
    ...(campaign.introParagraphs || []).map((markup) => {
      const paragraph = el("p");
      const template = document.createElement("template");
      template.innerHTML = markup;
      paragraph.append(...[...template.content.childNodes].map(copyNode));
      return paragraph;
    }),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...(campaign.dossier || []).map((item) => {
      const row = el("div", "sands-case-row");
      row.append(
        el("span", "", item.label),
        el("strong", item.status ? "sands-active-status" : "", item.value),
      );
      return row;
    }),
  );
  document.querySelector("#party-title").textContent = campaign.partyTitle;
  document.querySelector("#party-description").textContent = campaign.partyDescription;
  const partyImage = document.querySelector("#party-image");
  partyImage.src = campaign.partyImage;
  partyImage.decoding = "async";
  document.querySelector("#manifesto-quote").textContent = campaign.manifestoQuote;
  document.querySelector("#manifesto-tags").textContent = campaign.manifestoTags;
  document.querySelector("#characters-kicker").textContent = content.characters.kicker;
  document.querySelector("#characters-title").textContent = content.characters.title;
  document.querySelector("#characters-description").textContent = content.characters.description;

  let galleryPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !galleryPromise) {
      const activeGallery = document.querySelector("#active-character-gallery");
      const fallenGallery = document.querySelector("#fallen-character-gallery");
      galleryPromise = loadCharacterCatalog()
        .then((catalog) => Promise.all([
          renderGallery(activeGallery, content.characters.characterIds || [], catalog),
          renderGallery(fallenGallery, content.characters.fallenCharacterIds || [], catalog),
        ]))
        .then(() => fallenGallery.classList.add("sands-fallen-gallery"))
        .catch((error) => {
          console.error("Nie udało się wczytać galerii postaci.", error);
          galleryPromise = null;
          const message = el("p", "character-gallery__empty", "Nie udało się wczytać galerii postaci.");
          activeGallery.replaceChildren(message.cloneNode(true));
          fallenGallery.replaceChildren(message);
        });
    }
    if (section === "chronicle" && !chronicleRendered) {
      document.querySelector("#campaign-chronicle").replaceChildren(
        ...(content.chronicle.sessions || []).map((session) => makeChronicle(session, theme.colors.accent2)),
      );
      chronicleRendered = true;
    }
  });

  document.body.classList.remove("campaign-startup-loading");
  if (manifest.audio?.src) {
    const player = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
      preload: "none",
    });
    mountAudioPlayerButton(player, theme.audioColor, { autoplay: false });
  }
}
initialize().catch((error) => {
  console.error("Nie udało się uruchomić strony Sands of Doom.", error);
  document.body.classList.remove("campaign-startup-loading");
  const message = el(
    "p",
    "sands-load-error",
    "Nie udało się załadować konfiguracji kampanii. Odśwież stronę lub spróbuj ponownie później.",
  );
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
