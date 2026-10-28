import {
  applyCampaignTheme,
  loadCampaignBundle,
} from "/core/templates/CampaignPage/CampaignPage.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";

const sections = [
  { text: "Kampania", sectionLink: "campaign" },
  { text: "Postaci", sectionLink: "characters" },
  { text: "Kronika", sectionLink: "chronicle" },
];

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createSectionHeading(eyebrow, titleText, leadText, id) {
  const header = createElement("header", "section-heading");
  const title = createElement("h2", "", titleText);
  title.id = id;
  header.append(
    createElement("p", "eyebrow", eyebrow),
    title,
    createElement("p", "section-lead", leadText),
  );
  return header;
}

function renderHero(heroContent, theme) {
  const hero = createSubpageHero({
    title: heroContent.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  const copy = hero.querySelector(".subpage-hero__copy");
  const kicker = createElement("p", "gothic-hero-kicker", heroContent.kicker);
  const heading = hero.querySelector("h1");
  const lead = createElement("p", "gothic-hero-lead", heroContent.lead);
  const stamp = createElement("p", "gothic-hero-stamp", heroContent.stamp);

  kicker.id = "hero-kicker";
  heading.before(kicker);
  heading.after(lead, stamp);
  hero.id = "campaign-hero";
  document.querySelector("#campaign-hero").replaceWith(hero);

  mountSubpageNavbar(document.querySelector("#campaign-navbar"), {
    sections: sections.map((section) => ({
      ...section,
      color: theme.colors.accent2,
    })),
  });

  copy.setAttribute("aria-describedby", "hero-kicker");
}

function renderCampaign(campaign, locations, factions, cast) {
  const target = document.querySelector("#campaign-content");
  const title = createSectionHeading(
    campaign.eyebrow,
    "Kampania",
    campaign.intro,
    "campaign-heading",
  );

  const overview = createElement("div", "overview-layout");
  const story = createElement("article", "parchment-card story-card");
  story.append(createElement("h3", "story-title", campaign.title));
  story.append(...campaign.paragraphs.map((paragraph) => createElement("p", "", paragraph)));

  const dossier = createElement("aside", "dossier-card");
  dossier.setAttribute("aria-label", "Dane kampanii");
  dossier.append(
    createElement("p", "eyebrow", "DANE KAMPANII"),
    createElement("h3", "", "Sytuacja na wyspie"),
  );
  const facts = createElement("dl", "dossier-list");
  campaign.dossier.forEach(([label, value]) => {
    facts.append(createElement("dt", "", label), createElement("dd", "", value));
  });
  dossier.append(facts);
  overview.append(story, dossier);

  const warning = createElement("p", "spoiler-note", campaign.warning);
  warning.setAttribute("role", "note");

  const atlas = createElement("section", "campaign-subsection");
  atlas.append(
    createSectionHeading(
      "MIEJSCA · GOTHIC II I NOC KRUKA",
      "Droga przez wyspę",
      "Najważniejsze lokacje wyznaczają kolejne etapy kampanii.",
      "world-heading",
    ),
  );
  const locationGrid = createElement("div", "location-grid");
  locations.forEach((location) => {
    const card = createElement("article", "location-card");
    card.append(
      createElement("span", "location-number", location.number),
      createElement("p", "eyebrow", `${location.edition} · ${location.kind}`),
      createElement("h3", "", location.name),
      createElement("p", "", location.summary),
      createElement("p", "location-thread", location.thread),
    );
    locationGrid.append(card);
  });
  atlas.append(locationGrid);

  const paths = createElement("section", "campaign-subsection");
  paths.append(
    createSectionHeading(
      "WYBÓR GRACZA",
      "Drogi do gildii",
      "Przynależność Bezimiennego zależy od decyzji gracza. Te trzy ścieżki należą do opisu kampanii, nie do galerii postaci.",
      "guilds-heading",
    ),
  );
  const factionGrid = createElement("div", "faction-grid");
  factions.forEach((faction) => {
    const card = createElement("article", "faction-card");
    card.append(
      createElement("span", "location-number", faction.mark),
      createElement("p", "eyebrow", faction.path),
      createElement("h3", "", faction.name),
      createElement("p", "", faction.description),
    );
    factionGrid.append(card);
  });
  paths.append(factionGrid);

  const castSection = createElement("section", "campaign-subsection");
  castSection.append(
    createSectionHeading(
      "POSTACIE NIEZALEŻNE",
      "Ludzie Khorinis",
      "Bohaterowie niezależni, którzy wspierają lub utrudniają przebieg kampanii.",
      "cast-heading",
    ),
  );
  const castGrid = createElement("div", "cast-grid");
  cast.forEach((person) => {
    const card = createElement("article", "cast-card");
    card.append(
      createElement("p", "cast-role", person.role),
      createElement("h3", "", person.name),
      createElement("p", "", person.summary),
    );
    castGrid.append(card);
  });
  castSection.append(castGrid);

  target.replaceChildren(title, overview, warning, atlas, paths, castSection);
}

function renderPlayerCharacters(characters) {
  const target = document.querySelector("#characters-content");
  const header = createSectionHeading(
    "BOHATEROWIE GRACZY",
    "Postaci",
    "Ta sekcja pokazuje postać prowadzoną przez gracza. Postacie niezależne pozostają w opisie kampanii.",
    "characters-heading",
  );
  const gallery = createElement("div", "player-character-list");

  characters.forEach((character) => {
    const card = createElement("article", "player-character-card parchment-card");
    const portrait = createElement("div", "player-character-portrait");
    const image = createElement("img");
    image.src = character.portrait;
    image.alt = `Symboliczny portret: ${character.name}`;
    image.width = 600;
    image.height = 700;
    portrait.append(image);

    const details = createElement("div", "player-character-details");
    details.append(
      createElement("p", "eyebrow", character.role),
      createElement("h3", "", character.name),
      createElement("p", "player-character-player", character.player),
      createElement("p", "player-character-summary", character.summary),
    );

    const facts = createElement("dl", "player-character-facts");
    [
      ["POCHODZENIE", character.origin],
      ["ŚCIEŻKA", character.path],
    ].forEach(([label, value]) => {
      facts.append(createElement("dt", "", label), createElement("dd", "", value));
    });
    details.append(facts);
    card.append(portrait, details);
    gallery.append(card);
  });

  target.replaceChildren(header, gallery);
}

function renderChronicle(sessions, theme) {
  const target = document.querySelector("#chronicle-content");
  const header = createSectionHeading(
    "ZAPIS SESJI",
    "Kronika",
    "Wpisy porządkują przebieg Gothic II jako modelowej kampanii. Rozwiń kartę, by przeczytać notatkę; przy właściwym nagraniu sesji pojawi się przycisk odtwarzania.",
    "chronicle-heading",
  );
  const recordingNote = createElement(
    "p",
    "chronicle-recording-note",
    "Nie dodano nagrań — karty i notatki pokazują miejsce na materiały z kolejnych sesji.",
  );
  const list = createElement("div", "chronicle-list");
  list.style.setProperty("--chronicle-heading-font", theme.typography.heading);
  sessions.forEach((session) => {
    list.append(createChronicleRecord(session, { accent: theme.colors.accent2 }));
  });

  target.replaceChildren(header, recordingNote, list);
}

async function initializeCampaignPage() {
  const { manifest, theme, content } = await loadCampaignBundle();
  applyCampaignTheme(theme);
  renderHero(content.hero, theme);
  renderCampaign(
    content.campaign,
    content.locations,
    content.factions,
    content.cast,
  );
  renderPlayerCharacters(content.playerCharacters);
  renderChronicle(content.sessions, theme);

  document.querySelector("#fan-notice").textContent = content.sources.notice;
  const sourceLink = document.querySelector("#official-source");
  sourceLink.href = content.sources.url;
  sourceLink.textContent = content.sources.label;
  document.title = `${manifest.title} — Vengrath`;
}

initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić kroniki Gothic2.", error);
  const notice = createElement(
    "p",
    "load-error",
    "Nie udało się otworzyć kroniki. Odśwież stronę za chwilę.",
  );
  document.querySelector("main").replaceChildren(notice);
});
