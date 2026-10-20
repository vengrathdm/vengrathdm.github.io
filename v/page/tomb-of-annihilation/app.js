import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { AudioPlayer } from "/v/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/v/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Nie udało się wczytać konfiguracji: ${path} (${response.status})`);
  return response.json();
}

function node(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}

function renderCampaign(campaign) {
  const card = node("section", "toa-card");
  const cardTitle = node("div", "toa-card-title");
  cardTitle.append(node("span", "", "01"), node("strong", "", "AKTA KAMPANII"));
  const body = node("div", "toa-card-body");
  const grid = node("div", "toa-intro-grid");
  const paper = node("article", "toa-paper");
  paper.append(node("div", "toa-section-mark", "O KAMPANII"), node("h2", "", campaign.introTitle));
  campaign.introParagraphs.forEach(text => paper.append(node("p", "", text)));
  const dossier = node("aside", "toa-case");
  dossier.append(node("div", "toa-case-label", "DOSSIER"));
  campaign.dossier.forEach(([label, value]) => {
    const row = node("div", "toa-case-row");
    row.append(node("span", "", label), node("strong", label === "STATUS" ? "toa-active" : "", value));
    dossier.append(row);
  });
  grid.append(paper, dossier);
  body.append(grid);
  card.append(cardTitle, body);
  document.querySelector("#campaign-intro").replaceChildren(card);
}

async function renderCharacters(characters) {
  document.querySelector("#characters-kicker").textContent = characters.kicker;
  document.querySelector("#characters-title").textContent = characters.title;
  document.querySelector("#characters-description").textContent = characters.description;
  const gallery = new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: characters.characterIds
  });
  await gallery.render();
}

function renderChronicle(chronicle, accent) {
  const container = document.querySelector("#campaign-chronicle");
  const intro = node("header", "toa-section toa-chronicle-intro");
  intro.append(
    node("div", "toa-section-mark", chronicle.kicker || "AKTA / KRONIKA"),
    node("h2", "", chronicle.title || "Kronika wyprawy"),
    node("p", "", chronicle.description || "")
  );
  const list = node("div", "chronicle toa-chronicle-list");
  list.replaceChildren(...chronicle.sessions.map(session => createChronicleRecord(session, { accent })));
  container.replaceChildren(intro, list);
}

async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"), loadJson("./theme.json"), loadJson("./content.json")
  ]);
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([token, value]) => {
    const cssToken = token.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
    root.style.setProperty("--theme-" + cssToken, value);
  });
  root.style.setProperty("--campaign-accent", theme.colors.accent2);
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);

  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 }
  });
  hero.id = "campaign-hero";
  hero.classList.add("toa-hero");
  const copy = hero.querySelector(".subpage-hero__copy");
  const kicker = node("p", "toa-hero-kicker", content.campaign.kicker);
  const heading = hero.querySelector("h1");
  heading.before(kicker);
  heading.textContent = content.campaign.title;
  heading.after(node("p", "toa-hero-lead", content.campaign.lead));
  const seal = node("div", "toa-hero-seal");
  seal.setAttribute("aria-hidden", "true");
  seal.append(node("span", "", "TROPICAL EXPEDITION"), node("strong", "", "CHULT"), node("small", "", "ARCHIVE"));
  copy.append(seal);
  document.querySelector("#campaign-hero").replaceWith(hero);

  // Keep the shared fixed navbar outside the hero's overflow-clipping context.
  const navbarMount = node("div", "toa-navbar-mount");
  document.body.prepend(navbarMount);
  mountSubpageNavbar(navbarMount, {
    playlistUrl: manifest.playlistUrl,
    sections: [
      { text: "Kampania", sectionLink: "campaign", color: theme.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: theme.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: theme.colors.accent2 }
    ]
  });

  const campaignAudio = new AudioPlayer({
    src: "/v/page/tomb-of-annihilation/res/audio/tomb-of-annihilation.mp3",
    storageKey: "vengrath-audio-tomb-of-annihilation"
  });
  mountAudioPlayerButton(campaignAudio, theme.colors.accent2);

  renderCampaign(content.campaign);
  await renderCharacters(content.characters);
  renderChronicle(content.chronicle, theme.colors.accent2);
}

initialize().catch(error => {
  console.error("Nie udało się uruchomić strony Tomb of Annihilation.", error);
  const message = node("p", "toa-load-error", "Nie udało się załadować archiwum kampanii. Odśwież stronę lub spróbuj ponownie później.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});