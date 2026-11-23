import {
  loadCampaignBundle,
  applyCampaignTheme,
} from "/core/templates/CampaignPage/CampaignPage.js";
import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function init() {
  const { manifest: m, theme: t, content: d } = await loadCampaignBundle();
  applyCampaignTheme(t);
  const h = createSubpageHero({
    title: d.campaign.title,
    backgroundImage: t.heroImage,
    theme: { accent: t.colors.accent2 },
  });
  h.id = "campaign-hero";
  const title = h.querySelector("h1");
  title.textContent = d.campaign.heroFirstLine;
  const em = document.createElement("em");
  em.textContent = d.campaign.heroSecondLine;
  title.append(document.createElement("br"), em);
  const kicker = document.createElement("p");
  kicker.textContent = d.campaign.kicker;
  title.before(kicker);
  const lead = document.createElement("p");
  lead.textContent = d.campaign.lead;
  title.after(lead);
  document.querySelector("#campaign-hero").replaceWith(h);
  const nav = document.createElement("div");
  document.body.prepend(nav);
  mountSubpageNavbar(nav, {
    sections: [
      { text: "Kampania", sectionLink: "campaign", color: t.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: t.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: t.colors.accent2 },
    ],
  });
  document.querySelector("#intro-title").textContent = d.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(
    ...d.campaign.introParagraphs.map((s) => {
      const p = document.createElement("p");
      p.textContent = s;
      return p;
    }),
  );
  document.querySelector("#dossier").replaceChildren(
    ...d.campaign.dossier.map((x) => {
      const row = document.createElement("p");
      row.className = "menaces-of-irensberg-dossier-row";
      row.textContent = x.label + " · " + x.value;
      return row;
    }),
  );
  document.querySelector("#party-title").textContent = d.campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    d.campaign.partyDescription;
  for (const key of ["characters", "chronicle"]) {
    for (const field of ["kicker", "title", "description"])
      document.querySelector("#" + key + "-" + field).textContent =
        d[key][field];
  }
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: d.characters.characterIds,
  }).render();
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...d.chronicle.sessions.map((s) =>
        createChronicleRecord(s, { accent: t.colors.accent2 }),
      ),
    );
  mountAudioPlayerButton(
    new AudioPlayer({ src: m.audio.src, storageKey: m.audio.storageKey }),
    t.colors.accent1,
  );
}
init()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((e) => {
    console.error(e);
    document.body.prepend(
      document.createTextNode("Nie udało się wczytać kampanii."),
    );
  })
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

async function initialize(){
const [manifest,theme,content]=await Promise.all([loadJson("./manifest.json"),loadJson("./theme.json"),loadJson("./content.json")]);
const root=document.documentElement;Object.entries(theme.colors||{}).forEach(([k,v])=>root.style.setProperty("--theme-"+k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase()),v));root.style.setProperty("--theme-font-1",theme.typography.heading);root.style.setProperty("--theme-font-2",theme.typography.body);root.style.setProperty("--theme-font-3",theme.typography.serif);root.style.setProperty("--campaign-accent",theme.colors.accent2);
const hero=document.querySelector("#campaign-hero");hero.style.setProperty("--hero-background","url('"+theme.heroImage+"')");const copy=hero.querySelector(".subpage-hero__copy");const kicker=el("p","campaign-startup-kicker",content.campaign.kicker);const heading=hero.querySelector("h1");heading.textContent=content.campaign.heroFirstLine;const accent=el("em","",content.campaign.heroSecondLine);heading.append(document.createElement("br"),accent);heading.before(kicker);const lead=el("p","campaign-startup-lead",content.campaign.lead);heading.after(lead);
mountNavbar({playlistUrl:null},theme);
document.querySelector("#intro-title").textContent=content.campaign.introTitle;document.querySelector("#intro-copy").replaceChildren(...content.campaign.introParagraphs.map(t=>el("p","",t)));
document.querySelector("#dossier").replaceChildren(...content.campaign.dossier.map(item=>{const row=el("p","menaces-of-irensberg-dossier-row");row.textContent=item.label+" · "+item.value;return row}));
document.querySelector("#party-title").textContent=content.campaign.partyTitle;document.querySelector("#party-description").textContent=content.campaign.partyDescription;
for(const key of ["characters","chronicle"])for(const field of ["kicker","title","description"])document.querySelector("#"+key+"-"+field).textContent=content[key][field];
await renderGallery(document.querySelector("#character-gallery"),content.characters.characterIds);
document.querySelector("#chronicle-records").replaceChildren(...content.chronicle.sessions.map(s=>makeChronicle(s,theme.colors.accent2)));
if(manifest.audio?.src){const player=new AudioPlayer({src:manifest.audio.src,storageKey:manifest.audio.storageKey});mountAudioPlayerButton(player,theme.colors.accent1)}
}
initialize().then(()=>document.body.classList.remove("campaign-startup-loading")).catch(error=>{console.error("Nie udało się uruchomić Menaces of Irensberg.",error);const message=el("p","barber-load-error","Nie udało się wczytać kampanii.");message.setAttribute("role","alert");document.body.prepend(message)});
