import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(
      `Nie udało się wczytać pliku konfiguracji: ${path} (${response.status})`,
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
  hero.classList.add("rot-hero");

  const kicker = document.createElement("p");
  kicker.className = "rot-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.textContent = "Rise of";
  const titleAccent = document.createElement("em");
  titleAccent.className = "rot-hero-title-accent";
  titleAccent.textContent = "Tiamat";
  heading.append(document.createElement("br"), titleAccent);
  heading.before(kicker);

  const lead = document.createElement("p");
  lead.className = "rot-hero-lead";
  lead.textContent = content.campaign.lead;
  heading.after(lead);

  const seal = document.createElement("div");
  seal.className = "rot-hero-seal";
  seal.setAttribute("aria-hidden", "true");
  seal.innerHTML =
    "<span>VENGRATH CHRONICLE</span><strong>TYRANNY</strong><small>OF DRAGONS</small>";
  hero.querySelector(".subpage-hero__copy").append(seal);
  document.querySelector("#campaign-hero").replaceWith(hero);

  const navbarMount = document.createElement("div");
  navbarMount.className = "rot-navbar-mount";
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
  const introCopy = document.querySelector("#campaign-intro-copy");
  introCopy.replaceChildren(
    ...content.campaign.introParagraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );

  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren(
    ...content.campaign.dossier.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "rot-dossier-row";
      const key = document.createElement("span");
      key.textContent = label;
      const detail = document.createElement("strong");
      detail.textContent = value;
      if (label === "STATUS") detail.className = "rot-active";
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
  const characterGallery = new CharacterGallery(
    document.querySelector("#tiamat-character-gallery"),
    { characterIds: content.characters.characterIds },
  );
  await characterGallery.render();
  document.querySelector("#chronicle-playlist").href =
    content.chronicle.playlistUrl;
}

initializeCampaignPage()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error("Nie udało się uruchomić strony Rise of Tiamat.", error);
    const message = document.createElement("p");
    message.className = "rot-load-error";
    message.setAttribute("role", "alert");
    message.textContent =
      "Nie udało się wczytać kampanii. Odśwież stronę lub spróbuj ponownie później.";
    document.body.prepend(message);
  });