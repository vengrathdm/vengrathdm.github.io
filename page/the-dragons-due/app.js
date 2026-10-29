import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Nie udało się wczytać pliku: ${path}`);
  return response.json();
}
function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function renderRows(target, rows) {
  target.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = node("div", "cz-dossier-row");
      row.append(node("span", "", label), node("strong", "", value));
      return row;
    }),
  );
}
function renderCards(target, records, kind) {
  target.replaceChildren(
    ...records.map((item) => {
      const card = node("article", kind + "-card");
      const number = item.number
        ? node("span", "cz-card-number", item.number)
        : null;
      if (number) card.append(number);
      card.append(
        node("p", "cz-card-kicker", item.location || item.role || ""),
      );
      card.append(node("h3", "", item.title || item.name));
      card.append(node("p", "cz-card-copy", item.text));
      return card;
    }),
  );
}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const root = document.documentElement;
  root.style.setProperty("--cz-base", theme.colors.base1);
  root.style.setProperty("--cz-accent", theme.colors.accent1);
  root.style.setProperty("--cz-gold", theme.colors.accent2);
  const hero = createSubpageHero({
    title: content.campaign.title,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "campaign-hero";
  hero.classList.add("cz-hero");
  const kicker = node("p", "cz-hero-kicker", content.campaign.kicker);
  const lead = node("p", "cz-hero-lead", content.campaign.lead);
  const heading = hero.querySelector("h1");
  const titleParts = content.campaign.title.split(" ");
  const titleAccent = node("span", "", titleParts.pop());
  heading.replaceChildren(
    document.createTextNode(titleParts.join(" ") + " "),
    titleAccent,
  );
  heading.before(kicker);
  heading.after(lead);
  const register = node("div", "cz-hero-register");
  register.setAttribute("aria-label", "Akta sprawy");
  register.append(
    node("span", "", "AKTA KORONY"),
    node("span", "", `SPRAWA 03 / ${String(content.chapters.length).padStart(2, "0")}`),
    node("span", "", "CORMYR · SPRAWA OTWARTA"),
  );
  hero.querySelector(".subpage-hero__copy").append(register);

  const seal = node("figure", "cz-hero-seal");
  seal.setAttribute("aria-label", "Herb z materiałów źródłowych");
  const sealLabel = node("span", "cz-seal-label", "PIECZĘĆ SPRAWY");
  const sealImage = node("img");
  sealImage.src = theme.heroImage;
  sealImage.alt = "";
  sealImage.fetchPriority = "high";
  const sealCaption = node(
    "figcaption",
    "",
    "KRÓLEWSKIE SPICHLERZE · CORMYR",
  );
  seal.append(sealLabel, sealImage, sealCaption);
  hero.append(seal, node("div", "cz-hero-index", "TDD / SPRAWA 03"));

  const navbarMount = node("div", "cz-navbar-mount");
  hero.prepend(navbarMount);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
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
  document
    .querySelector("#intro-copy")
    .replaceChildren(
      ...content.campaign.introParagraphs.map((text) => node("p", "", text)),
    );
  renderRows(document.querySelector("#dossier"), content.campaign.dossier);
  document.querySelector("#manifesto").textContent =
    "„" + content.campaign.manifesto + "”";
  document.querySelector("#manifesto-tags").textContent =
    content.campaign.manifestoTags;
  document.querySelector("#image-caption").textContent =
    content.campaign.imageCaption;
  renderCards(
    document.querySelector("#chapters"),
    content.chapters,
    "cz-chapter",
  );
  renderCards(
    document.querySelector("#factions"),
    content.factions,
    "cz-faction",
  );
  renderCards(
    document.querySelector("#people"),
    content.people,
    "cz-person",
  );
  document.querySelector("#gm-notes").replaceChildren(
    ...content.gmNotes.map((note) => node("p", "", note)),
  );

  if (manifest.audio?.src) {
    const campaignAudio = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
      preload: "none",
    });
    mountAudioPlayerButton(campaignAudio, theme.audioColor);
  }
}
initialize()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error("Nie udało się uruchomić strony The Dragon's Due.", error);
    document.body.classList.remove("campaign-startup-loading");
    const message = node("p", "cz-error", "Nie udało się wczytać akt przygody.");
    document.querySelector("main")?.prepend(message);
  });
