import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(
      "Nie udało się wczytać pliku konfiguracji: " +
        path +
        " (" +
        response.status +
        ")",
    );
  return response.json();
}

async function initializeCampaignPage() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([token, value]) => {
    const cssToken = token.replace(
      /[A-Z]/g,
      (letter) => "-" + letter.toLowerCase(),
    );
    root.style.setProperty("--theme-" + cssToken, value);
  });
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);

  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";
  hero.classList.add("barber-hero");
  const kicker = document.createElement("p");
  kicker.className = "barber-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.textContent = "Barber of";
  const titleAccent = document.createElement("em");
  titleAccent.className = "barber-hero-title-accent";
  titleAccent.textContent = "Silverymoon";
  heading.append(document.createElement("br"), titleAccent);
  heading.before(kicker);
  const lead = document.createElement("p");
  lead.className = "barber-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.after(lead);
  const seal = document.createElement("div");
  seal.className = "barber-hero-seal";
  seal.setAttribute("aria-hidden", "true");
  seal.innerHTML =
    "<span>VENGRATH CHRONICLE</span><strong>SILVERY</strong><small>MOON CASE FILE</small>";
  hero.querySelector(".subpage-hero__copy").append(seal);
  document.querySelector("#campaign-hero").replaceWith(hero);

  const navbarMount = document.createElement("div");
  navbarMount.className = "barber-navbar-mount";
  document.body.prepend(navbarMount);
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

  document.querySelector("#campaign-intro-title").textContent =
    content.campaign.introTitle;
  document.querySelector("#campaign-intro-copy").replaceChildren(
    ...content.campaign.introParagraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...content.campaign.dossier.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "barber-dossier-row";
      const key = document.createElement("span");
      key.textContent = label;
      const detail = document.createElement("strong");
      detail.textContent = value;
      if (label === "STATUS") detail.className = "barber-archived";
      row.append(key, detail);
      return row;
    }),
  );
  document.querySelector("#characters-kicker").textContent =
    content.characters.kicker;
  document.querySelector("#characters-title").textContent =
    content.characters.title;
  document.querySelector("#characters-description").textContent =
    content.characters.description;
  const gallery = new CharacterGallery(
    document.querySelector("#barber-character-gallery"),
    { characterIds: content.characters.characterIds },
  );
  await gallery.render();
  document.querySelector("#chronicle-playlist").href =
    content.chronicle.playlistUrl;
}

initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić strony Barber of Silverymoon.", error);
  const message = document.createElement("p");
  message.className = "barber-load-error";
  message.setAttribute("role", "alert");
  message.textContent =
    "Nie udało się wczytać kampanii. Odśwież stronę lub spróbuj ponownie później.";
  document.body.prepend(message);
});
