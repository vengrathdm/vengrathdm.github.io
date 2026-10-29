import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { renderCampaignSection } from "./sections/campaign/campaign.js";
import { renderCharactersSection } from "./sections/characters/characters.js";
import { renderChronicleSection } from "./sections/chronicle/chronicle.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("Nie udało się wczytać pliku: " + path);
  }
  return response.json();
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);

  document.documentElement.style.setProperty(
    "--theme-base-1",
    theme.colors.base1,
  );
  document.documentElement.style.setProperty(
    "--theme-accent-1",
    theme.colors.accent1,
  );
  document.documentElement.style.setProperty(
    "--theme-accent-2",
    theme.colors.accent2,
  );
  document.documentElement.style.setProperty(
    "--campaign-accent",
    theme.colors.accent2,
  );

  const hero = createSubpageHero({
    title: content.campaign.heroTitle,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";
  hero.id = "top";

  const kicker = document.createElement("p");
  kicker.className = "mg-hero-kicker";
  kicker.textContent = content.campaign.kicker;

  const lead = document.createElement("p");
  lead.className = "mg-hero-lead";
  lead.textContent = content.campaign.lead;

  const heading = hero.querySelector("h1");
  heading.before(kicker);
  heading.after(lead);

  const navbarMount = document.createElement("div");
  navbarMount.className = "mg-navbar-mount";
  hero.prepend(navbarMount);
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

  renderCampaignSection(content.campaign);
  await renderCharactersSection(content.characters);
  renderChronicleSection(content.chronicle);
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error(
      "Nie udało się uruchomić strony " + "Menaces of Gloomforest Legacy" + ".",
      error,
    );
  });