import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { AudioPlayer } from "/v/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/v/core/templates/AudioPlayerButton/AudioPlayerButton.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
import { renderCharactersSection } from "./sections/characters/characters.js";
import { renderChronicleSection } from "./sections/chronicle/chronicle.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Nie udało się wczytać pliku konfiguracji: ${path} (${response.status})`);
  }
  return response.json();
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json")
  ]);

  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([token, value]) => {
    const cssToken = token.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
    root.style.setProperty("--theme-" + cssToken, value);
  });
  root.style.setProperty("--campaign-accent", theme.colors.accent2);
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);

  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 }
  });
  hero.id = "campaign-hero";
  hero.classList.add("sands-hero");

  const navbarMount = document.createElement("div");
  navbarMount.className = "sands-navbar-mount";
  hero.prepend(navbarMount);

  const kicker = document.createElement("p");
  kicker.className = "sands-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.before(kicker);
  heading.textContent = "SANDS";
  const titleAccent = document.createElement("em");
  titleAccent.className = "sands-hero-title-accent";
  titleAccent.textContent = "OF DOOM";
  heading.append(document.createElement("br"), titleAccent);

  const lead = document.createElement("p");
  lead.className = "sands-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.after(lead);

  const sigils = document.createElement("div");
  sigils.className = "sands-sigils";
  sigils.setAttribute("aria-hidden", "true");
  ["𓂀", "☥", "𓆣", "𓃠"].forEach((symbol) => {
    const item = document.createElement("span");
    item.textContent = symbol;
    sigils.append(item);
  });
  lead.after(sigils);

  const seal = document.createElement("div");
  seal.className = "sands-hero-seal";
  seal.setAttribute("aria-hidden", "true");
  seal.innerHTML = '<span>THE WASTELAND</span><strong>KIRAT</strong><small>DOOM</small>';
  hero.querySelector(".subpage-hero__copy").append(seal);

  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
    playlistUrl: manifest.playlistUrl,
    sections: [
      { text: "Kampania", sectionLink: "campaign", color: theme.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: theme.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: theme.colors.accent2 }
    ]
  });

  renderCampaignSection(content.campaign);
  await renderCharactersSection(content.characters);
  renderChronicleSection(content.chronicle, theme.colors.accent2);

  if (manifest.audio?.src) {
    const audioPlayer = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey
    });
    mountAudioPlayerButton(audioPlayer, theme.audioColor);
  }
}

initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić strony Sands of Doom.", error);
  const message = document.createElement("p");
  message.className = "sands-load-error";
  message.setAttribute("role", "alert");
  message.textContent = "Nie udało się załadować konfiguracji kampanii. Odśwież stronę lub spróbuj ponownie później.";
  document.body.prepend(message);
});