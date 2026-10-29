import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
import { renderWorldSection } from "./sections/world/world.js";

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

async function loadJson(path) {
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
    "--campaign-accent",
    theme.colors.accent2,
  );
}

function initializeHero(content, theme) {
  const hero = document.querySelector("#campaign-hero");
  hero.style.setProperty(
    "--hero-background",
    "url(" + theme.heroImage + ")",
  );
  hero.style.setProperty("--campaign-accent", theme.colors.accent2);
  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(document.createElement("span"), {
      className: "shards-hero-title-accent",
      textContent: content.campaign.heroSecondLine,
    }),
  );
  const kicker = hero.querySelector(".shards-hero-kicker");
  kicker.textContent = content.campaign.kicker;
  const lead = hero.querySelector(".shards-hero-lead");
  lead.textContent = content.campaign.lead;
}

mountSubpageNavbar(document.querySelector("#campaign-navbar"), {
  sections: [
    { text: "Kampania", sectionLink: "campaign", color: "#5ba9ff" },
    { text: "Świat", sectionLink: "world", color: "#5ba9ff" },
  ],
});

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  applyTheme(theme);
  initializeHero(content, theme);
  renderCampaignSection(content.campaign);
  renderWorldSection(content.world);
  document.body.classList.remove("is-loading");

  const audio = new AudioPlayer({
    src: manifest.audio.src,
    storageKey: manifest.audio.continuationKey,
    preload: "none",
  });
  mountAudioPlayerButton(audio, theme.audioColor, { autoplay: false });
}

initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić strony Shards of the Past.", error);
  document.querySelectorAll(".ddc-tab-panel").forEach((panel) => {
    panel.hidden = true;
  });
  document.querySelector("#load-error").hidden = false;
  document.body.classList.remove("is-loading");
});
