function createSubpageHero({title,backgroundImage,theme}){const hero=document.createElement("header");hero.className="subpage-hero";hero.style.setProperty("--hero-background","url('"+backgroundImage+"')");hero.style.setProperty("--campaign-accent",theme.accent);const copy=document.createElement("div");copy.className="subpage-hero__copy";copy.append(el("h1","",title));hero.append(copy);return hero;}
function mountSubpageNavbar(mount,{sections=[],playlistUrl}){mount.classList.add("subpage-navbar");const left=el("div","subpage-navbar__left"),home=el("a","vengrath-home-button");home.href="/home/";home.setAttribute("aria-label","Vengrath — strona główna");const image=el("img");image.src="/core/graphics/favicon/favicon.ico";image.alt="";home.append(image,el("span","","VENGRATH"));left.append(home);if(playlistUrl){const link=el("a","youtube-playlist-button","YouTube Playlista");link.href=playlistUrl;link.target="_blank";link.rel="noopener noreferrer";left.append(link);}const nav=el("nav","subpage-navbar__sections");nav.setAttribute("aria-label","Sekcje kampanii");const buttons=sections.map((section,i)=>{const b=el("button","subpage-navbar-button",section.text);b.type="button";b.dataset.section=section.sectionLink;b.style.setProperty("--section-color",section.color||"#bca06a");b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==section.sectionLink);buttons.forEach(x=>x.setAttribute("aria-pressed",String(x===b)));mount.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:section.sectionLink}}));});nav.append(b);return b;});mount.replaceChildren(left,nav);const update=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);update();window.addEventListener("scroll",update,{passive:true});if(sections[0])document.querySelectorAll("[data-page-section]").forEach(panel=>panel.hidden=panel.dataset.pageSection!==sections[0].sectionLink);}


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
  document.querySelector('meta[name="theme-color"]').content = theme.colors.base1;

  const hero = document.querySelector("#campaign-hero");
  hero.id = "top";
  hero.style.setProperty("--hero-background", "url('" + theme.heroImage + "')");
  hero.style.setProperty("--campaign-accent", theme.colors.accent2);
  const copy = hero.querySelector(".subpage-hero__copy");
  copy.querySelector("h1").textContent = data.campaign.title;
  copy.querySelector(".tbm-hero-kicker").textContent = data.campaign.kicker;
  copy.querySelector(".tbm-hero-lead").textContent = data.campaign.lead;
  const nav = el("div", "campaign-navbar-mount");
  hero.prepend(nav);
  mountSubpageNavbar(nav, {
    sections: [
      {text: "Kampania", sectionLink: "campaign", color: theme.colors.accent2},
      {text: "Materiały", sectionLink: "materials", color: theme.colors.accent2},
    ],
  });
  renderCampaign(data.campaign);
  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + manifest.title.toUpperCase();

  let materialsRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    if (event.detail?.section !== "materials" || materialsRendered) return;
    renderMaterials(data);
    materialsRendered = true;
  });

  document.body.classList.remove("campaign-startup-loading");
}
init().catch((error) => {
  console.error("Nie udało się uruchomić strony kampanii.", error);
  document.body.classList.remove("campaign-startup-loading");
  const message = el("p", "tbm-load-error", "Nie udało się wczytać archiwum przygody.");
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
