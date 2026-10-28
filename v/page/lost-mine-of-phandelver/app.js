import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
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

function initializeHero(content, theme, manifest) {
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";

  const kicker = document.createElement("p");
  kicker.className = "lmop-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "lmop-hero-lead";
  lead.textContent = content.campaign.lead;

  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode("Lost Mine"),
    document.createElement("br"),
    Object.assign(document.createElement("span"), {
      className: "lmop-hero-title-accent",
      textContent: "of Phandelver",
    }),
  );
  heading.before(kicker);
  heading.after(lead);

  const navbarMount = document.createElement("div");
  navbarMount.className = "lmop-navbar-mount";
  hero.prepend(navbarMount);

  const mistLine = document.createElement("div");
  mistLine.className = "lmop-hero-mist-line";
  mistLine.setAttribute("aria-hidden", "true");
  hero.append(mistLine);

  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
    playlistUrl: manifest.playlistUrl,
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
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  applyTheme(theme);
  initializeHero(content, theme, manifest);
  renderCampaignSection(content.campaign);
  await renderCharactersSection(content.characters);
  renderChronicleSection(content.chronicle, manifest.playlistUrl);
}

initializeCampaignPage().catch((error) => {
  console.error(
    "Nie udało się uruchomić strony Lost Mine of Phandelver.",
    error,
  );
});
