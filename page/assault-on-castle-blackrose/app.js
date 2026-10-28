import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
const colorVars = {
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
  sealBorder: "--theme-seal-border",
  sealInnerBorder: "--theme-seal-inner-border",
  sealBackground: "--theme-seal-background",
  sealSmallText: "--theme-seal-small-text",
  sealMainText: "--theme-seal-main-text",
};
async function readJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return r.json();
}
function applyTheme(theme) {
  Object.entries(colorVars).forEach(([key, property]) => {
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
}
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}
function renderCampaign(data) {
  const root = document.querySelector("#campaign-content"),
    card = el("section", "campaign-card"),
    bar = el("div", "campaign-card__bar"),
    number = el("span", "campaign-card__number", "01"),
    label = el("strong", "campaign-card__label", "AKTA PRZYGODY");
  bar.append(number, label);
  const grid = el("div", "campaign-grid"),
    paper = el("article", "campaign-paper"),
    mark = el("div", "campaign-kicker", data.introLabel),
    title = el("h2", "", data.introTitle);
  paper.append(mark, title);
  data.introParagraphs.forEach((t) => paper.append(el("p", "", t)));
  const dossier = el("aside", "campaign-dossier"),
    dtitle = el("div", "campaign-dossier__title", "DOSSIER");
  dossier.append(dtitle);
  data.dossier.forEach((item) => {
    const row = el("div", "campaign-dossier__row"),
      k = el("span", "", item.label),
      v = el("strong", "", item.value);
    if (item.label === "STATUS") v.className = "campaign-status";
    row.append(k, v);
    dossier.append(row);
  });
  grid.append(paper, dossier);
  card.append(bar, grid);
  root.replaceChildren(card);
  const sections = el("div", "campaign-archive");
  data.sections.forEach((item, i) => {
    const s = el("article", "campaign-archive__item"),
      k = el(
        "div",
        "campaign-kicker",
        "AKTA / " + String(i + 2).padStart(2, "0"),
      ),
      h = el("h2", "", item.title),
      p = el("p", "", item.description);
    s.append(k, h, p);
    sections.append(s);
  });
  root.append(sections);
}
function renderMaterials(data) {
  const root = document.querySelector("#materials-content"),
    panel = el("section", "materials-panel"),
    k = el("div", "campaign-kicker", "AKTA / MATERIAŁY"),
    h = el("h2", "", data.materials.title),
    p = el("p", "", data.materials.description);
  panel.append(k, h, p);
  if (data.materials.url) {
    const a = el("a", "materials-link", "OTWÓRZ DOKUMENT W HOMEBREWERY ↗");
    a.href = data.materials.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    panel.append(a);
  } else {
    panel.append(
      el(
        "p",
        "materials-note",
        "Dokument Homebrewery nie został jeszcze udostępniony.",
      ),
    );
  }
  root.replaceChildren(panel);
}
async function init() {
  const [manifest, theme, data] = await Promise.all([
    readJson("./manifest.json"),
    readJson("./theme.json"),
    readJson("./content.json"),
  ]);
  applyTheme(theme);
  document.title = manifest.title + " — Vengrath";
  document.querySelector('meta[name="theme-color"]').content =
    theme.colors.base1;
  const hero = createSubpageHero({
    title: data.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "top";
  const heading = hero.querySelector("h1"),
    kicker = el("p", "campaign-hero__kicker", data.campaign.kicker),
    lead = el("p", "campaign-hero__lead", data.campaign.lead);
  heading.before(kicker);
  heading.after(lead);
  const nav = el("div", "campaign-navbar-mount");
  hero.prepend(nav);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(nav, {
    sections: [
      {
        text: "Kampania",
        sectionLink: "campaign",
        color: theme.colors.accent2,
      },
      {
        text: "Materiały",
        sectionLink: "materials",
        color: theme.colors.accent2,
      },
    ],
  });
  renderCampaign(data.campaign);
  renderMaterials(data);
  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + manifest.title.toUpperCase();
}
init().catch((error) =>
  console.error("Nie udało się uruchomić strony kampanii.", error),
);
