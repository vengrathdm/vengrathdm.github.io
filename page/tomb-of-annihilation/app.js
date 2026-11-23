function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function mountSubpageNavbar(container, {playlistUrl = null, sections = []} = {}) {
  container.classList.add("subpage-navbar");
  const left = node("div", "subpage-navbar__left");
  const home = node("a", "vengrath-home-button");
  home.href = "/home/";
  home.setAttribute("aria-label", "Vengrath — strona główna");
  const logo = node("img");
  logo.src = "/core/graphics/favicon/favicon.ico";
  logo.alt = "";
  home.append(logo, node("span", "", "VENGRATH"));
  left.append(home);
  if (playlistUrl) {
    const playlist = node("a", "youtube-playlist-button");
    playlist.href = playlistUrl;
    playlist.target = "_blank";
    playlist.rel = "noopener noreferrer";
    playlist.append(node("span", "", "YouTube"), node("span", "", "Playlista"));
    left.append(playlist);
  }

  const right = node("nav", "subpage-navbar__sections");
  right.setAttribute("aria-label", "Sekcje kampanii");
  const buttons = sections.map((section, index) => {
    const button = node("button", "subpage-navbar-button", section.text);
    button.type = "button";
    button.dataset.section = section.sectionLink;
    button.style.setProperty("--section-color", section.color || "#d4aa62");
    button.setAttribute("aria-pressed", String(index === 0));
    button.addEventListener("click", () => select(button.dataset.section));
    right.append(button);
    return button;
  });
  container.replaceChildren(left, right);
  const updateScroll = () => container.classList.toggle("is-scrolled", window.scrollY > 12);
  updateScroll();
  window.addEventListener("scroll", updateScroll, {passive: true});

  function select(sectionId) {
    document.querySelectorAll("[data-page-section]").forEach((section) => {
      section.hidden = section.dataset.pageSection !== sectionId;
    });
    container.dispatchEvent(new CustomEvent("vengrath:sectionchange", {
      bubbles: true,
      detail: {section: sectionId},
    }));
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.section === sectionId));
    });
  }

  if (buttons[0]) select(buttons[0].dataset.section);
  return {
    select,
    destroy() {
      window.removeEventListener("scroll", updateScroll);
      container.replaceChildren();
      container.classList.remove("is-scrolled");
    },
  };
}

class AudioPlayer {
  constructor({src, storageKey, preload = "none"}) {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = preload;
    this.audio.src = src;
    this.storageKey = storageKey;
    this.listeners = new Set();
    this.audio.volume = 0.5;
    this.restore();
    ["play", "pause", "volumechange", "timeupdate", "loadedmetadata"].forEach((type) => {
      this.audio.addEventListener(type, () => {
        if (type === "loadedmetadata" && this.pendingTime > 0) {
          this.audio.currentTime = Math.min(this.pendingTime, this.audio.duration || this.pendingTime);
        }
        this.persist();
        this.emit();
      });
    });
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
      localStorage.setItem(this.storageKey, JSON.stringify({
        volume: this.audio.volume,
        time: this.audio.currentTime || 0,
      }));
    } catch {
      // Storage can be unavailable in restricted browsing contexts.
    }
  }

  snapshot() {
    return {playing: !this.audio.paused, volume: this.audio.volume};
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

  async toggle() {
    if (this.audio.paused) {
      try {
        await this.audio.play();
      } catch (error) {
        if (error?.name !== "NotAllowedError") console.error("Audio playback could not start.", error);
      }
    } else {
      this.audio.pause();
    }
    this.emit();
  }

  setVolume(value) {
    this.audio.volume = Math.max(0, Math.min(1, value));
    this.persist();
    this.emit();
  }
}

function mountAudioPlayerButton(player, color = "#d4aa62") {
  const button = node("button", "audio-player-button");
  button.type = "button";
  button.style.setProperty("--player-color", color);
  const ring = node("span", "audio-player-ring");
  const symbol = node("span", "audio-player-symbol");
  button.append(ring, symbol);
  let dragging = false;
  const point = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    return {radius: Math.hypot(x, y), volume: angle / (Math.PI * 2)};
  };
  const updateVolume = (event) => player.setVolume(point(event).volume);
  button.addEventListener("click", (event) => {
    if (dragging) {
      event.preventDefault();
      return;
    }
    if (point(event).radius > 18) updateVolume(event);
    else player.toggle();
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
  button.addEventListener("pointerup", () => {dragging = false;});
  button.addEventListener("pointercancel", () => {dragging = false;});
  player.subscribe((state) => {
    symbol.textContent = state.playing ? "Ⅱ" : "▶";
    button.setAttribute("aria-label", state.playing ? "Wstrzymaj audio" : "Odtwórz audio");
    ring.style.setProperty("--volume", state.volume * 100 + "%");
  });
  document.body.append(button);
  return button;
}

(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!finePointer.matches || document.querySelector(".vengrath-cursor")) return;
  const cursor = node("span", "vengrath-cursor");
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);
  let frame = 0;
  let x = -100;
  let y = -100;
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      cursor.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
      cursor.classList.add("is-visible");
      frame = 0;
    });
  }, {passive: true});
  document.addEventListener("pointerover", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    cursor.classList.toggle("is-hovering", Boolean(target?.closest("a, button, [role='button'], input, textarea, select, summary, label, .cell, .map-pin")));
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") cursor.classList.add("is-pressed");
  });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointercancel", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
})();

const campaignAudio = new AudioPlayer({
  src: "/page/tomb-of-annihilation/res/audio/tomb-of-annihilation.mp3",
  storageKey: "vengrath-audio-tomb-of-annihilation-alternate",
  preload: "none",
});
mountAudioPlayerButton(campaignAudio, "#d4aa62");

const pages = [...document.querySelectorAll(".page")];
let navbar;
let characterLoadPromise;
let chronicleRendered = false;

function initializeNavbar(content) {
  if (navbar) return;
  const navbarMount = document.getElementById("campaign-navbar");
  navbarMount.addEventListener("vengrath:sectionchange", (event) => {
    const selected = event.detail.section;
    pages.forEach((page) => {
      const active = page.dataset.pageSection === selected;
      page.classList.toggle("active", active);
      page.hidden = !active;
    });
    if (selected === "characters" && !characterLoadPromise) {
      characterLoadPromise = loadCharacters(content).catch((error) => {
        console.error("Nie udało się wczytać kart postaci.", error);
        characterLoadPromise = null;
        document.getElementById("characters-grid").replaceChildren(
          node("p", "error", "Nie udało się pobrać kart postaci. Spróbuj ponownie."),
        );
      });
    }
    if (selected === "log" && !chronicleRendered) {
      renderChronicle(content);
      chronicleRendered = true;
    }
  });

  const videoIds = [...new Set(content.chronicle.sessions.flatMap((session) =>
    (session.recordings || []).map((recording) => {
      try {
        const url = new URL(recording.url);
        return url.searchParams.get("v") || (url.hostname.includes("youtu.be") ? url.pathname.slice(1) : null);
      } catch {
        return null;
      }
    }).filter(Boolean),
  ))];
  const playlistUrl = videoIds.length
    ? "https://www.youtube.com/watch_videos?video_ids=" + videoIds.join(",")
    : null;
  navbar = mountSubpageNavbar(navbarMount, {
    playlistUrl,
    sections: [
      {text: "Zlecenie", sectionLink: "overview", color: "#d4aa62"},
      {text: "Port Nyanzaru", sectionLink: "nyanzaru", color: "#d4aa62"},
      {text: "Dżungla", sectionLink: "jungle", color: "#d4aa62"},
      {text: "Omu", sectionLink: "omu", color: "#d4aa62"},
      {text: "Grobowiec", sectionLink: "tomb", color: "#d4aa62"},
      {text: "Postacie", sectionLink: "characters", color: "#d4aa62"},
      {text: "Kronika", sectionLink: "log", color: "#d4aa62"},
    ],
  });
  const initial = location.hash.slice(1);
  if (pages.some((page) => page.dataset.pageSection === initial)) navbar.select(initial);
}

function navigate(name) {
  if (!navbar) return;
  navbar.select(name);
  history.replaceState(null, "", "#" + name);
  window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

document.querySelectorAll(".map-pin").forEach((pin) => {
  pin.addEventListener("click", () => navigate(pin.dataset.goto));
  pin.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(pin.dataset.goto);
    }
  });
});

async function loadCharacters(content) {
  const response = await fetch("/core/data/characters.json");
  if (!response.ok) throw new Error("Brak katalogu postaci.");
  const characters = await response.json();
  const byId = new Map(characters.map((character) => [character.id, character]));
  const grid = document.getElementById("characters-grid");
  grid.replaceChildren();
  content.characters.characterIds.forEach((id, index) => {
    const character = byId.get(id);
    if (!character) return;
    const card = node("article", "specimen");
    const image = node("img");
    image.src = character.portrait;
    image.alt = "Portret postaci " + character.character;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 240;
    image.height = 300;
    card.append(
      image,
      node("div", "spec-label", "KARTA " + String(index + 1).padStart(2, "0")),
      node("h3", "", character.character),
      node("p", "", "GRACZ: " + character.player),
      node("p", "", [character.race, ...(character.classes || [])].filter(Boolean).join(" · ")),
      node("span", "status" + (character.status === "Martwa" ? " dead" : ""), character.status),
    );
    grid.append(card);
  });
}

function renderChronicle(content) {
  const list = document.getElementById("log-list");
  list.replaceChildren();
  let activePlayer = null;
  [...content.chronicle.sessions].reverse().forEach((session) => {
    const entry = node("article", "log");
    const number = String(session.sessionNumber).padStart(2, "0");
    const title = session.title
      .replace(/^Tomb of Annihilation S\d+\s*-\s*/i, "")
      .replace(/\s*\[D&D5e\]$/i, "");
    const recording = (session.recordings || []).find((item) => item.url);
    entry.append(node("div", "log-meta", "SESJA " + number), node("h3", "", title));
    if (!recording) {
      entry.append(node("span", "log-meta", "BRAK LINKU"));
      list.append(entry);
      return;
    }
    let videoId = null;
    try {
      const url = new URL(recording.url);
      videoId = url.hostname.includes("youtu.be")
        ? url.pathname.slice(1)
        : url.searchParams.get("v") || url.pathname.match(/\/embed\/([^/]+)/)?.[1];
    } catch {
      videoId = null;
    }
    if (!videoId) {
      entry.append(node("span", "log-meta", "BRAK LINKU"));
      list.append(entry);
      return;
    }
    const toggle = node("button", "log-player-toggle", "ODTWÓRZ");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    const player = node("section", "log-player");
    player.hidden = true;
    const playerHeader = node("div", "log-player-header");
    playerHeader.append(node("strong", "", title), node("span", "log-player-tag", "CHULT · WYPRAWA"));
    const video = node("div", "log-video");
    const footer = node("div", "log-player-footer");
    footer.append(node("span", "", "SESJA " + number));
    const external = node("a", "", "OTWÓRZ W YOUTUBE ↗");
    external.href = recording.url;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    footer.append(external);
    player.append(playerHeader, video, footer);
    const closePlayer = () => {
      video.replaceChildren();
      player.hidden = true;
      toggle.textContent = "ODTWÓRZ";
      toggle.setAttribute("aria-expanded", "false");
      if (activePlayer === player) activePlayer = null;
    };
    toggle.addEventListener("click", () => {
      if (!player.hidden) {
        closePlayer();
        return;
      }
      if (activePlayer && activePlayer !== player) {
        const previous = activePlayer;
        const previousToggle = previous.previousElementSibling;
        previous.querySelector(".log-video")?.replaceChildren();
        previous.hidden = true;
        if (previousToggle) {
          previousToggle.textContent = "ODTWÓRZ";
          previousToggle.setAttribute("aria-expanded", "false");
        }
      }
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?rel=0";
      iframe.title = "Tomb of Annihilation — sesja " + number + ": " + title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      video.replaceChildren(iframe);
      player.hidden = false;
      activePlayer = player;
      toggle.textContent = "ZAMKNIJ ODTWARZACZ";
      toggle.setAttribute("aria-expanded", "true");
    });
    entry.append(toggle, player);
    list.append(entry);
  });
}

async function load() {
  const response = await fetch("./content.json");
  if (!response.ok) throw new Error("Brak danych archiwum.");
  initializeNavbar(await response.json());
}

load().catch((error) => {
  console.error("Nie udało się uruchomić archiwum Tomb of Annihilation.", error);
  for (const id of ["characters-grid", "log-list"]) {
    const target = document.getElementById(id);
    if (target) target.replaceChildren(node("p", "error", "Nie udało się pobrać danych archiwum. Spróbuj odświeżyć stronę."));
  }
});
