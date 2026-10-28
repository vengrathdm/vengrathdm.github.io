import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
import { renderGallerySection } from "./sections/gallery/gallery.js";
import { renderCharactersSection } from "./sections/characters/characters.js";
import { renderChronicleSection } from "./sections/chronicle/chronicle.js";
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
  const r = await fetch(path);
  if (!r.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return r.json();
}
function applyTheme(theme) {
  Object.entries(themeVariables).forEach(([k, p]) => {
    if (theme.colors[k])
      document.documentElement.style.setProperty(p, theme.colors[k]);
  });
  document.documentElement.style.setProperty(
    "--campaign-accent",
    theme.colors.accent2,
  );
  document.documentElement.style.setProperty(
    "--chronicle-heading-font",
    "var(--theme-font-1)",
  );
}
function initializeHero(content, theme) {
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";
  const kicker = document.createElement("p");
  kicker.className = "zima-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "zima-hero-lead";
  lead.textContent = content.campaign.lead;
  const h = hero.querySelector("h1");
  h.replaceChildren(
    document.createTextNode("Echtra — Zima"),
    document.createElement("br"),
    Object.assign(document.createElement("span"), {
      className: "zima-hero-title-accent",
      textContent: "Irgaeli",
    }),
  );
  h.before(kicker);
  h.after(lead);
  const nav = document.createElement("div");
  nav.className = "zima-navbar-mount";
  hero.prepend(nav);
  const line = document.createElement("div");
  line.className = "zima-hero-mist-line";
  line.setAttribute("aria-hidden", "true");
  hero.append(line);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(nav, {
    sections: [
      {
        text: "Kampania",
        sectionLink: "campaign",
        color: theme.colors.accent2,
      },
      {
        text: "Materiały",
        sectionLink: "gallery",
        color: theme.colors.accent2,
      },
      {
        text: "Postacie",
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
}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  applyTheme(theme);
  initializeHero(content, theme);
  renderCampaignSection(content.campaign);
  renderGallerySection(content.gallery);
  await renderCharactersSection(content.characters);
  renderChronicleSection(content.chronicle, theme.colors.accent2);
  const player = new AudioPlayer({
    src: manifest.audio.src,
    storageKey: manifest.audio.continuationKey,
  });
  mountAudioPlayerButton(player, theme.audioColor);
}
initialize().catch((e) =>
  console.error("Nie udało się uruchomić strony Echtra — Zima Irgaeli.", e),
);
