import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";

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

async function readJson(path) {
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
    "--theme-font-1",
    theme.typography.heading,
  );
  document.documentElement.style.setProperty(
    "--theme-font-2",
    theme.typography.body,
  );
  document.documentElement.style.setProperty(
    "--theme-font-3",
    theme.typography.serif,
  );
  document.documentElement.style.setProperty(
    "--campaign-accent",
    theme.colors.accent2,
  );
  document.documentElement.style.setProperty(
    "--chronicle-heading-font",
    "var(--theme-font-1)",
  );
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    readJson("./manifest.json"),
    readJson("./theme.json"),
    readJson("./content.json"),
  ]);

  applyTheme(theme);
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";

  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode(content.campaign.heroFirstLine),
    document.createElement("br"),
    Object.assign(document.createElement("em"), {
      className: "hobg-hero-title-accent",
      textContent: content.campaign.heroSecondLine,
    }),
  );
  const kicker = document.createElement("p");
  kicker.className = "hobg-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "hobg-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.before(kicker);
  heading.after(lead);

  const navbar = document.createElement("div");
  navbar.className = "hobg-navbar-mount";
  hero.prepend(navbar);
  document.querySelector("#campaign-hero").replaceWith(hero);

  mountSubpageNavbar(navbar, {
    playlistUrl: manifest.playlistUrl || undefined,
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

  document.querySelector("#intro-title").textContent =
    content.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(
    ...content.campaign.introParagraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...content.campaign.dossier.map((item) => {
      const row = document.createElement("div");
      row.className = "hobg-dossier-row";
      const label = document.createElement("span");
      label.textContent = item.label;
      const value = document.createElement("strong");
      value.textContent = item.value;
      if (item.label === "STATUS") value.className = "hobg-status";
      row.append(label, value);
      return row;
    }),
  );
  document.querySelector("#party-title").textContent =
    content.campaign.partyTitle;
  const partyDescription = document.querySelector("#party-description");
  if (content.campaign.partyDescription) {
    partyDescription.textContent = content.campaign.partyDescription;
    partyDescription.hidden = false;
  }
  document.querySelector("#party-image").src = content.campaign.partyImage;

  document.querySelector("#campaign-archive").replaceChildren(
    ...content.campaign.archiveSections.map((section) => {
      const article = document.createElement("article");
      article.className = "hobg-archive-card";
      const kicker = document.createElement("div");
      kicker.className = "hobg-section-mark";
      kicker.textContent = "AKTA / " + section.number;
      const title = document.createElement("h3");
      title.textContent = section.title;
      article.append(kicker, title);
      if (section.description) {
        const description = document.createElement("p");
        description.textContent = section.description;
        article.append(description);
      }
      return article;
    }),
  );

  document.querySelector("#characters-kicker").textContent =
    content.characters.kicker;
  document.querySelector("#characters-title").textContent =
    content.characters.title;
  const charactersDescription = document.querySelector(
    "#characters-description",
  );
  if (content.characters.description) {
    charactersDescription.textContent = content.characters.description;
    charactersDescription.hidden = false;
  }
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: content.characters.characterIds,
  }).render();

  document.querySelector("#chronicle-kicker").textContent =
    content.chronicle.kicker;
  document.querySelector("#chronicle-title").textContent =
    content.chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    content.chronicle.description;
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...content.chronicle.sessions.map((session) =>
        createChronicleRecord(session, { accent: theme.colors.accent2 }),
      ),
    );
  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + content.campaign.title.toUpperCase();
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error(
      "Nie udało się uruchomić strony Bohaterowie Wrót Baldura.",
      error,
    );
  });