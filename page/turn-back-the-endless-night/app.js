import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

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
      className: "tben-hero-title-accent",
      textContent: content.campaign.heroSecondLine,
    }),
  );
  const kicker = document.createElement("p");
  kicker.className = "tben-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "tben-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.before(kicker);
  heading.after(lead);

  const nav = document.createElement("div");
  nav.className = "tben-navbar-mount";
  hero.prepend(nav);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(nav, {
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
      row.className = "tben-dossier-row";
      const label = document.createElement("span");
      label.textContent = item.label;
      const value = document.createElement("strong");
      value.textContent = item.value;
      if (item.label === "STATUS") value.className = "tben-status";
      row.append(label, value);
      return row;
    }),
  );
  document.querySelector("#party-title").textContent =
    content.campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    content.campaign.partyDescription;
  document.querySelector("#party-image").src = content.campaign.partyImage;
  document.querySelector("#party-image").alt = content.campaign.title;
  document.querySelector("#manifesto-title").textContent =
    content.campaign.manifestoTitle;
  document.querySelector("#manifesto-quote").textContent =
    "„" + content.campaign.manifesto + "”";
  document.querySelector("#manifesto-tags").textContent =
    content.campaign.manifestoTags;

  document.querySelector("#campaign-archive").replaceChildren(
    ...content.campaign.archiveSections.map((section) => {
      const article = document.createElement("article");
      article.className = "tben-archive-card";
      const kicker = document.createElement("div");
      kicker.className = "tben-section-mark";
      kicker.textContent = "AKTA / " + section.number;
      const title = document.createElement("h3");
      title.textContent = section.title;
      const description = document.createElement("p");
      description.textContent = section.description;
      article.append(kicker, title, description);
      return article;
    }),
  );

  document.querySelector("#characters-kicker").textContent =
    content.characters.kicker;
  document.querySelector("#characters-title").textContent =
    content.characters.title;
  document.querySelector("#characters-description").textContent =
    content.characters.description;
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: content.characters.characterIds,
  }).render();

  document.querySelector("#chronicle-kicker").textContent =
    content.chronicle.kicker;
  document.querySelector("#chronicle-title").textContent =
    content.chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    content.chronicle.description;
  const playlist = document.querySelector("#chronicle-playlist");
  if (content.chronicle.playlistUrl) {
    playlist.href = content.chronicle.playlistUrl;
    playlist.hidden = false;
  }
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...content.chronicle.sessions.map((session) =>
        createChronicleRecord(session, { accent: theme.colors.accent2 }),
      ),
    );

  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + content.campaign.title.toUpperCase();
  if (manifest.audio && manifest.audio.src) {
    const audioPlayer = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
    });
    mountAudioPlayerButton(
      audioPlayer,
      theme.audioColor || theme.colors.accent1,
    );
  }
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error(
      "Nie udało się uruchomić strony Turn Back the Endless Night.",
      error,
    );
  });