import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
import { AudioPlayer } from "/v/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/v/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return response.json();
}

function applyTheme(colors) {
  const tokens = {
    base1: "base-1", base2: "base-2", base3: "base-3", base4: "base-4", base5: "base-5",
    accent1: "accent-1", accent2: "accent-2",
    text1: "text-1", text2: "text-2", text3: "text-3", textMuted: "text-muted",
    titleAccent: "title-accent", line1: "line-1", line2: "line-2",
    navBackground: "nav-background", navText: "nav-text",
    navActiveBackground: "nav-active-background"
  };
  for (const [key, token] of Object.entries(tokens)) {
    if (colors[key]) document.documentElement.style.setProperty("--theme-" + token, colors[key]);
  }
  document.documentElement.style.setProperty("--campaign-accent", colors.accent2 || "#bca06a");
}

async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json")
  ]);

  applyTheme(theme.colors);

  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 }
  });
  hero.id = "campaign-hero";

  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(document.createElement("span"), {
      className: "curse-hero-title-accent",
      textContent: content.campaign.heroSecondLine
    })
  );

  const kicker = document.createElement("p");
  kicker.className = "curse-hero-kicker";
  kicker.textContent = content.campaign.kicker;

  const lead = document.createElement("p");
  lead.className = "curse-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.before(kicker);
  heading.after(lead);

  const navbar = document.createElement("div");
  navbar.className = "curse-navbar-mount";
  hero.prepend(navbar);
  document.querySelector("#campaign-hero").replaceWith(hero);

  mountSubpageNavbar(navbar, {
    playlistUrl: manifest.playlistUrl,
    sections: [
      { text: "Kampania", sectionLink: "campaign", color: theme.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: theme.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: theme.colors.accent2 }
    ]
  });

  const campaignAudio = new AudioPlayer({
    src: "/v/page/curse-of-strahd/res/audio/curse-of-strahd.mp3",
    storageKey: "vengrath-audio-curse-of-strahd"
  });
  mountAudioPlayerButton(campaignAudio, theme.colors.accent2);

  renderCampaignSection(content.campaign);
  const gallery = new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: ["char-0038", "char-0039", "char-0284", "char-0040", "char-0041"]
  });
  await gallery.render();
  document.querySelector("#chronicle-kicker").textContent = content.chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = content.chronicle.title;
  document.querySelector("#chronicle-description").textContent = content.chronicle.description;
  document.querySelector("#chronicle-playlist").href = content.chronicle.playlistUrl;
}

initialize().catch(error => console.error("Nie udało się uruchomić strony Curse of Strahd.", error));
