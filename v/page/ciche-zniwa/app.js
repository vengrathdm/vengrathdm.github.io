import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";

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
  target.replaceChildren(...rows.map(([label, value]) => {
    const row = node("div", "cz-dossier-row");
    row.append(node("span", "", label), node("strong", "", value));
    return row;
  }));
}
function renderCards(target, records, kind) {
  target.replaceChildren(...records.map((item) => {
    const card = node("article", kind + "-card");
    const number = item.number ? node("span", "cz-card-number", item.number) : null;
    if (number) card.append(number);
    card.append(node("p", "cz-card-kicker", item.location || item.role || ""));
    card.append(node("h3", "", item.title || item.name));
    card.append(node("p", "cz-card-copy", item.text));
    return card;
  }));
}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"), loadJson("./theme.json"), loadJson("./content.json")
  ]);
  const root = document.documentElement;
  root.style.setProperty("--cz-base", theme.colors.base1);
  root.style.setProperty("--cz-accent", theme.colors.accent1);
  root.style.setProperty("--cz-gold", theme.colors.accent2);
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 }
  });
  hero.id = "campaign-hero";
  const kicker = node("p", "cz-hero-kicker", content.campaign.kicker);
  const lead = node("p", "cz-hero-lead", content.campaign.lead);
  const heading = hero.querySelector("h1");
  heading.before(kicker);
  heading.after(lead);
  const navbarMount = node("div", "cz-navbar-mount");
  hero.prepend(navbarMount);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
    sections: [
      { text: "Kampania", sectionLink: "overview", color: theme.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: theme.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: theme.colors.accent2 }
    ]
  });
  document.querySelector("#intro-title").textContent = content.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(...content.campaign.introParagraphs.map(text => node("p", "", text)));
  renderRows(document.querySelector("#dossier"), content.campaign.dossier);
  document.querySelector("#manifesto").textContent = "„" + content.campaign.manifesto + "”";
  document.querySelector("#manifesto-tags").textContent = content.campaign.manifestoTags;
  document.querySelector("#image-caption").textContent = content.campaign.imageCaption;
}
initialize().catch(error => {
  console.error("Nie udało się uruchomić strony Ciche Żniwa.", error);
  const message = node("p", "cz-error", "Nie udało się wczytać akt przygody.");
  document.querySelector("main")?.prepend(message);
});
