import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
async function loadJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error("Nie udało się wczytać pliku: " + path);
  return r.json();
}
function renderCampaignSection(c) {
  const container = document.querySelector("#campaign-section-content"),
    card = document.createElement("section");
  card.className = "ddc-card";
  const cardTitle = document.createElement("div");
  cardTitle.className = "ddc-card-title";
  const number = document.createElement("span");
  number.textContent = "01";
  const label = document.createElement("strong");
  label.textContent = "AKTA KAMPANII";
  cardTitle.append(number, label);
  const body = document.createElement("div");
  body.className = "ddc-card-body";
  const grid = document.createElement("div");
  grid.className = "ddc-intro-grid";
  const paper = document.createElement("article");
  paper.className = "ddc-paper";
  const mark = document.createElement("div");
  mark.className = "ddc-section-mark";
  mark.textContent = c.introLabel;
  const h = document.createElement("h2");
  h.textContent = c.introTitle;
  paper.append(mark, h);
  c.introParagraphs.forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    paper.append(p);
  });
  const dossier = document.createElement("aside");
  dossier.className = "ddc-case";
  const dtitle = document.createElement("div");
  dtitle.className = "ddc-case-label";
  dtitle.textContent = c.dossierTitle;
  dossier.append(dtitle);
  c.dossier.forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "ddc-case-row";
    const key = document.createElement("span");
    key.textContent = k;
    const val = document.createElement("strong");
    val.textContent = v;
    if (k === "STATUS") val.className = "ddc-active";
    row.append(key, val);
    dossier.append(row);
  });
  grid.append(paper, dossier);
  body.append(grid);
  card.append(cardTitle, body);
  container.replaceChildren(card);
  const party = document.createElement("section");
  party.className = "ddc-party-portrait";
  const copy = document.createElement("div");
  copy.className = "ddc-party-copy";
  const pl = document.createElement("div");
  pl.className = "ddc-section-mark";
  pl.textContent = c.partyLabel;
  const ph = document.createElement("h2");
  ph.textContent = c.partyTitle;
  const pd = document.createElement("p");
  pd.textContent = c.partyDescription;
  copy.append(pl, ph, pd);
  const figure = document.createElement("figure");
  figure.className = "ddc-party-image";
  const img = document.createElement("img");
  img.src = c.partyImage;
  img.alt = c.partyImageAlt;
  img.loading = "lazy";
  figure.append(img);
  party.append(copy, figure);
  container.append(party);
  if (c.manifesto) {
    const m = document.createElement("section");
    m.className = "ddc-manifesto";
    const sym = document.createElement("div");
    sym.className = "ddc-manifesto-symbol";
    sym.textContent = "✦";
    const text = document.createElement("div");
    const ml = document.createElement("div");
    ml.className = "ddc-section-mark";
    ml.textContent = c.manifesto.label;
    const quote = document.createElement("p");
    quote.textContent = c.manifesto.text;
    const attr = document.createElement("span");
    attr.textContent = c.manifesto.attribution;
    text.append(ml, quote, attr);
    m.append(sym, text);
    container.append(m);
  }
  c.emptySections.forEach((item) => {
    const s = document.createElement("section");
    s.className = "ddc-section";
    const head = document.createElement("div");
    head.className = "ddc-section-head";
    const group = document.createElement("div");
    const kicker = document.createElement("div");
    kicker.className = "ddc-section-mark";
    kicker.textContent = item.label;
    const title = document.createElement("h2");
    title.textContent = item.title;
    group.append(kicker, title);
    head.append(group);
    if (item.description) {
      const p = document.createElement("p");
      p.textContent = item.description;
      head.append(p);
    }
    s.append(head);
    container.append(s);
  });
}
async function renderCharacters(c) {
  document.querySelector("#characters-kicker").textContent = c.kicker;
  document.querySelector("#characters-title").textContent = c.title;
  document.querySelector("#characters-description").textContent = c.description;
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: c.characterIds,
    emptyMessage: c.emptyMessage,
  }).render();
}
function renderChronicle(c, accent) {
  const container = document.querySelector("#chronicle-section-content"),
    intro = document.createElement("section");
  intro.className = "ddc-section ddc-chronicle-intro";
  const mark = document.createElement("div");
  mark.className = "ddc-section-mark";
  mark.textContent = c.kicker;
  const title = document.createElement("h2");
  title.textContent = c.title;
  const desc = document.createElement("p");
  desc.textContent = c.description;
  intro.append(mark, title, desc);
  const records = document.createElement("section");
  records.className = "ddc-section chronicle";
  records.replaceChildren(
    ...c.sessions.map((s) => createChronicleRecord(s, { accent })),
  );
  container.replaceChildren(intro, records);
}
async function init() {
  const [manifest, theme, data] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const kebab = (k) =>
    k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()).replace(/(\d+)/g, "-$1");
  Object.entries(theme.colors).forEach(([k, v]) =>
    document.documentElement.style.setProperty("--theme-" + kebab(k), v),
  );
  document.documentElement.style.setProperty(
    "--campaign-accent",
    theme.colors.accent2,
  );
  const mount = document.querySelector("#campaign-hero"),
    hero = createSubpageHero({
      title: data.campaign.heroTitle,
      backgroundImage: theme.heroImage,
      theme: { accent: theme.colors.accent2 },
    });
  hero.id = "top";
  const kicker = document.createElement("p");
  kicker.className = "mg-hero-kicker";
  kicker.textContent = data.campaign.kicker;
  const lead = document.createElement("p");
  lead.className = "mg-hero-lead";
  lead.textContent = data.campaign.lead;
  const h = hero.querySelector("h1");
  h.before(kicker);
  h.after(lead);
  const nav = document.createElement("div");
  nav.className = "mg-navbar-mount";
  hero.prepend(nav);
  mount.replaceWith(hero);
  mountSubpageNavbar(nav, {
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
  document.querySelector(".ddc-footer span").textContent =
    data.campaign.footerLabel;
  renderCampaignSection(data.campaign);
  await renderCharacters(data.characters);
  renderChronicle(data.chronicle, theme.colors.accent2);
}
init().catch((e) =>
  console.error("Nie udało się uruchomić strony Samotnie Przeciw Jedności.", e),
);
