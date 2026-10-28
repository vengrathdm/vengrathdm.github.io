import {
  applyCampaignTheme,
  loadCampaignBundle,
} from "/core/templates/CampaignPage/CampaignPage.js";
import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";

const sections = [
  { text: "Akta", sectionLink: "campaign" },
  { text: "Mapa", sectionLink: "world" },
  { text: "Kronika", sectionLink: "chronicle" },
  { text: "Gildie", sectionLink: "guilds" },
];

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
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

function renderOverview(campaign) {
  const target = document.querySelector("#campaign-overview");
  const header = createElement("header", "section-heading");
  const title = createElement("h2", "", campaign.title);
  title.id = "campaign-heading";
  header.append(
    createElement("p", "eyebrow", campaign.eyebrow),
    title,
    createElement("p", "section-lead", campaign.intro),
  );

  const layout = createElement("div", "overview-layout");
  const story = createElement("article", "parchment-card story-card");
  campaign.paragraphs.forEach((paragraph) => {
    story.append(createElement("p", "", paragraph));
  });

  const dossier = createElement("aside", "dossier-card");
  dossier.setAttribute("aria-label", "Dossier kampanii");
  dossier.append(
    createElement("p", "eyebrow", "DANE WYJŚCIOWE"),
    createElement("h3", "", "Sytuacja na wyspie"),
  );
  const facts = createElement("dl", "dossier-list");
  campaign.dossier.forEach(([label, value]) => {
    facts.append(
      createElement("dt", "", label),
      createElement("dd", "", value),
    );
  });
  dossier.append(facts);
  layout.append(story, dossier);

  const warning = createElement("p", "spoiler-note", campaign.warning);
  warning.setAttribute("role", "note");
  target.replaceChildren(header, layout, warning);
}

function renderWorld(locations) {
  const target = document.querySelector("#world-content");
  const header = createElement("header", "section-heading");
  const title = createElement("h2", "", "Od portu do Czarnej Cytadeli");
  title.id = "world-heading";
  header.append(
    createElement("p", "eyebrow", "ATLAS WYPRAWY · 04 PUNKTY NA MAPIE"),
    title,
    createElement(
      "p",
      "section-lead",
      "Wybierz miejsce, by otworzyć notatkę z tego frontu kampanii.",
    ),
  );

  const layout = createElement("div", "atlas-layout");
  const route = createElement("div", "atlas-route");
  route.setAttribute("role", "group");
  route.setAttribute("aria-label", "Lokacje kampanii Gothic II");
  const detail = createElement("article", "location-detail parchment-card");
  detail.id = "location-detail";
  detail.setAttribute("aria-live", "polite");
  layout.append(route, detail);

  function selectLocation(location, button) {
    route.querySelectorAll(".location-stop").forEach((stop) => {
      stop.setAttribute("aria-pressed", String(stop === button));
    });
    detail.replaceChildren(
      createElement("p", "eyebrow", `${location.edition} · ${location.kind}`),
      createElement("h3", "", location.name),
      createElement("p", "location-summary", location.summary),
      createElement("p", "location-thread", location.thread),
    );
  }

  locations.forEach((location, index) => {
    const button = createElement("button", "location-stop");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-controls", detail.id);
    button.append(
      createElement("span", "location-number", location.number),
      createElement("span", "location-stop-copy", location.name),
      createElement("span", "location-kind", location.kind),
    );
    button.addEventListener("click", () => selectLocation(location, button));
    route.append(button);
    if (index === 0) selectLocation(location, button);
  });

  target.replaceChildren(header, layout);
}

function renderChronicle(chapters) {
  const target = document.querySelector("#chronicle-content");
  const header = createElement("header", "section-heading");
  const title = createElement("h2", "", "Raporty z wyprawy");
  title.id = "chronicle-heading";
  header.append(
    createElement("p", "eyebrow", "DZIENNIK · SPOILERY FABULARNE"),
    title,
    createElement(
      "p",
      "section-lead",
      "Najważniejsze wątki gry podstawowej i Nocy Kruka, opisane własnymi słowami.",
    ),
  );

  const list = createElement("div", "chronicle-list");
  chapters.forEach((chapter, index) => {
    const entry = createElement("details", "chronicle-entry");
    const summary = createElement("summary", "chronicle-summary");
    summary.append(
      createElement("span", "chapter-number", String(index + 1).padStart(2, "0")),
      createElement("span", "chapter-kind", chapter.kind),
      createElement("span", "chapter-title", chapter.title),
    );
    entry.append(summary, createElement("p", "chapter-copy", chapter.summary));
    list.append(entry);
  });

  target.replaceChildren(header, list);
}

function renderGuilds(factions, cast) {
  const target = document.querySelector("#guild-content");
  const header = createElement("header", "section-heading");
  const title = createElement("h2", "", "Komu powierzysz swój los?");
  title.id = "guilds-heading";
  header.append(
    createElement("p", "eyebrow", "WYBÓR GILDII · WĄTEK GRACZA"),
    title,
    createElement(
      "p",
      "section-lead",
      "Trzy drogi prowadzą przez tę samą wyspę, ale każda zaczyna się od innego przysięgi.",
    ),
  );

  const guilds = createElement("fieldset", "guild-picker");
  guilds.append(createElement("legend", "", "Wybierz swoją przynależność"));
  const cards = createElement("div", "guild-cards");
  const result = createElement("article", "guild-result parchment-card");
  result.id = "guild-result";
  result.setAttribute("aria-live", "polite");

  function selectFaction(faction) {
    result.replaceChildren(
      createElement("p", "eyebrow", faction.path),
      createElement("h3", "", faction.name),
      createElement("p", "", faction.description),
      createElement("p", "guild-first-step", faction.firstStep),
    );
  }

  factions.forEach((faction, index) => {
    const label = createElement("label", "guild-card");
    const input = createElement("input", "guild-input");
    input.type = "radio";
    input.name = "gothic2-guild";
    input.value = faction.id;
    input.checked = index === 0;
    input.setAttribute("aria-controls", result.id);
    const copy = createElement("span", "guild-card-copy");
    copy.append(
      createElement("span", "guild-mark", faction.mark),
      createElement("span", "guild-name", faction.name),
      createElement("span", "guild-path", faction.path),
    );
    label.append(input, copy);
    input.addEventListener("change", () => {
      if (input.checked) selectFaction(faction);
    });
    cards.append(label);
    if (index === 0) selectFaction(faction);
  });
  guilds.append(cards, result);

  const castSection = createElement("section", "cast-section");
  const castHeading = createElement("div", "cast-heading");
  castHeading.append(
    createElement("p", "eyebrow", "DZIENNIK POSTACI"),
    createElement("h3", "", "Twarze wyspy"),
  );
  const castList = createElement("div", "cast-grid");
  cast.forEach((person) => {
    const card = createElement("article", "cast-card");
    card.append(
      createElement("p", "cast-role", person.role),
      createElement("h4", "", person.name),
      createElement("p", "", person.summary),
    );
    castList.append(card);
  });
  castSection.append(castHeading, castList);
  target.replaceChildren(header, guilds, castSection);
}

async function initializeCampaignPage() {
  const { manifest, theme, content } = await loadCampaignBundle();
  applyCampaignTheme(theme);
  renderHero(content.hero, theme);
  renderOverview(content.campaign);
  renderWorld(content.locations);
  renderChronicle(content.chapters);
  renderGuilds(content.factions, content.cast);

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
