import {
  applyCampaignTheme,
  loadCampaignBundle,
} from "/core/templates/CampaignPage/CampaignPage.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";

const sections = [
  { text: "Kampania", sectionLink: "campaign" },
  { text: "Postaci", sectionLink: "characters" },
  { text: "Kronika", sectionLink: "chronicle" },
];

function createElement(tagName, properties = {}, ...children) {
  const element = document.createElement(tagName);

  Object.entries(properties).forEach(([key, value]) => {
    if (key === "class") {
      element.className = value;
    } else if (key === "text") {
      element.textContent = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (value !== null && value !== undefined) {
      element.setAttribute(key, String(value));
    }
  });

  children.flat().forEach((child) => {
    if (child !== null && child !== undefined) element.append(child);
  });

  return element;
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}

function createDieControl() {
  const button = createElement("button", {
    class: "die",
    type: "button",
    "aria-label": "Rzuć kością k20",
  });
  const svg = createSvgElement("svg", {
    viewBox: "0 0 200 200",
    "aria-hidden": "true",
    focusable: "false",
  });
  svg.append(
    createSvgElement("polygon", {
      class: "face",
      points: "100,8 180,54 180,146 100,192 20,146 20,54",
    }),
    createSvgElement("polygon", { points: "100,38 156,134 44,134" }),
  );

  [
    [100, 8, 100, 38],
    [180, 54, 156, 134],
    [20, 54, 44, 134],
    [180, 146, 156, 134],
    [20, 146, 44, 134],
    [100, 192, 100, 134],
  ].forEach(([x1, y1, x2, y2]) => {
    svg.append(createSvgElement("line", { x1, y1, x2, y2 }));
  });

  const value = createSvgElement("text", { id: "die-number", x: 100, y: 118 });
  value.textContent = "20";
  svg.append(value);
  button.append(svg);
  return button;
}

function renderEntries(records) {
  const grid = createElement("div", { class: "grid" });
  records.forEach(([name, tag, description]) => {
    grid.append(
      createElement(
        "article",
        { class: "entry" },
        createElement(
          "h3",
          { class: "entry-heading" },
          createElement("span", { text: name }),
          createElement("span", { class: "tag", text: tag }),
        ),
        createElement("p", { text: description }),
      ),
    );
  });
  return grid;
}

function renderHero(heroContent, theme) {
  const hero = createSubpageHero({
    title: heroContent.title,
    theme: { accent: theme.colors.accent2 },
  });
  hero.classList.add("fiery-hero");
  hero.id = "campaign-hero";

  const emberCanvas = createElement("canvas", {
    class: "embers",
    "aria-hidden": "true",
  });
  const navbarMount = createElement("div", { class: "fiery-navbar-mount" });
  hero.prepend(emberCanvas, navbarMount);

  const copy = hero.querySelector(".subpage-hero__copy");
  const heading = copy.querySelector("h1");
  heading.id = "hero-title";
  heading.before(createElement("p", { class: "eyebrow", text: heroContent.eyebrow }));
  heading.after(
    createElement("p", { class: "tagline", text: heroContent.tagline }),
  );

  const die = createDieControl();
  const rollMessage = createElement("p", {
    class: "roll-message",
    id: "roll-message",
    "aria-live": "polite",
    text: heroContent.rollPrompt,
  });
  copy.append(die, rollMessage);

  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navbarMount, {
    sections: sections.map((section) => ({
      ...section,
      color: theme.colors.accent2,
    })),
  });

  mountDie(die);
  mountEmbers(emberCanvas);
}

function renderCampaign(root, campaign) {
  const statusLabels = {
    done: "ukończony",
    now: "w toku",
    locked: "zamknięty",
  };
  const acts = createElement("div", { class: "acts" });
  campaign.acts.forEach(([act, title, status]) => {
    acts.append(
      createElement(
        "article",
        { class: `act ${status}` },
        createElement("span", {
          class: "act-status",
          text: `${act} · ${statusLabels[status] || status}`,
        }),
        createElement("strong", { text: title }),
      ),
    );
  });

  const dossier = createElement("ul", { class: "dossier" });
  campaign.dossier.forEach(([label, value]) => {
    dossier.append(
      createElement(
        "li",
        {},
        createElement("span", { text: label }),
        createElement("strong", { text: value }),
      ),
    );
  });

  const boss = createElement(
    "aside",
    { class: "boss" },
    createElement("h3", { text: campaign.boss.name }),
    createElement("p", { class: "boss-stats", text: campaign.boss.line }),
    createElement("p", { text: campaign.boss.text }),
  );

  root.replaceChildren(
    createElement("h2", { id: "campaign-title", text: "Kampania" }),
    createElement(
      "div",
      { class: "panel lead" },
      campaign.lead.map((paragraph) => createElement("p", { text: paragraph })),
    ),
    dossier,
    createElement("h3", { class: "sub", text: "Akty kampanii" }),
    acts,
    createElement("h3", { class: "sub", text: "Miejsca" }),
    renderEntries(campaign.places),
    createElement("h3", { class: "sub", text: "Frakcje" }),
    renderEntries(campaign.factions),
    createElement("h3", { class: "sub", text: "Postaci niezależne" }),
    renderEntries(campaign.npcs),
    createElement("h3", { class: "sub", text: "Wielki zły" }),
    boss,
  );
}

async function renderCharacters(root, characters) {
  const gallery = createElement("div", { id: "character-gallery" });
  root.replaceChildren(
    createElement("h2", { id: "characters-title", text: "Postaci" }),
    createElement("p", { class: "characters-kicker", text: characters.kicker }),
    createElement("h3", { class: "characters-heading", text: characters.title }),
    createElement("p", { class: "characters-description", text: characters.description }),
    gallery,
  );

  await new CharacterGallery(gallery, {
    characterIds: characters.characterIds,
    emptyMessage: "Brak kart postaci do wyświetlenia.",
  }).render();
}

function sessionDescription(session) {
  return [
    session.summary,
    `Poziom drużyny: ${session.level}. Łup: ${session.loot}.`,
    "Notatki z sesji:",
    ...session.notes.map((note) => `• ${note}`),
    `Najważniejszy moment: ${session.moment}`,
  ].join("\n\n");
}

function renderChronicle(root, sessions, theme) {
  const timeline = createElement("div", { class: "timeline" });
  sessions.forEach((session, index) => {
    const record = createChronicleRecord(
      {
        sessionNumber: index + 1,
        title: session.title,
        description: sessionDescription(session),
        recordings: session.recordings,
      },
      { accent: theme.colors.accent2 },
    );

    const title = record.querySelector(".chronicle-record__title");
    title.append(
      createElement("span", {
        class: "session-date",
        text: `${session.date} · poziom ${session.level}`,
      }),
    );
    const recordingControls = record.querySelector(
      ".chronicle-record__recordings",
    );
    if (!session.recordings.length) {
      recordingControls.append(
        createElement("span", {
          class: "recording-status",
          text: session.recordingStatus,
        }),
      );
    }
    timeline.append(record);
  });

  root.replaceChildren(
    createElement("h2", { id: "chronicle-title", text: "Kronika" }),
    createElement(
      "p",
      {
        class: "chronicle-intro",
        text: "Rozwiń kartę sesji, aby zobaczyć notatki. Gdy pojawi się nagranie, " +
          "przycisk odtwarzania będzie dostępny w nagłówku karty.",
      },
    ),
    timeline,
  );
}

function mountDie(button) {
  const value = button.querySelector("#die-number");
  const message = document.querySelector("#roll-message");
  let busy = false;

  button.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    button.className = "die rolling";
    let ticks = 0;

    const timer = window.setInterval(() => {
      value.textContent = String(1 + Math.floor(Math.random() * 20));
      ticks += 1;
      if (ticks < 12) return;

      window.clearInterval(timer);
      const result = 1 + Math.floor(Math.random() * 20);
      value.textContent = String(result);
      button.className = result === 20 ? "die crit" : result === 1 ? "die fail" : "die";
      message.textContent =
        result === 20
          ? "KRYTYK! Bogowie kości są dziś z wami."
          : result === 1
            ? "Naturalna jedynka… smok już o was wie."
            : `Wyrzucono ${result}. ${result >= 15 ? "Prowadzicie." : "Smok czeka."}`;
      busy = false;
    }, 60);
  });
}

function mountEmbers(canvas) {
  const context = canvas.getContext("2d");
  if (!context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const sparks = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.6 + Math.random() * 2,
    velocity: 0.0006 + Math.random() * 0.0016,
    drift: Math.random() * Math.PI * 2,
  }));

  const fitCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  fitCanvas();
  window.addEventListener("resize", fitCanvas);

  function drawFrame(time) {
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    sparks.forEach((spark) => {
      spark.y -= spark.velocity * 16;
      if (spark.y < -0.02) {
        spark.y = 1.02;
        spark.x = Math.random();
      }

      const x =
        (spark.x + Math.sin(time / 900 + spark.drift) * 0.012) * canvas.clientWidth;
      context.beginPath();
      context.arc(x, spark.y * canvas.clientHeight, spark.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, ${120 + Math.floor(spark.radius * 40)}, 40, ${0.35 + spark.y * 0.55})`;
      context.fill();
    });
    window.requestAnimationFrame(drawFrame);
  }

  window.requestAnimationFrame(drawFrame);
}

async function initializeCampaignPage() {
  const { manifest, theme, content } = await loadCampaignBundle();
  applyCampaignTheme(theme);
  renderHero(content.hero, theme);
  renderCampaign(document.querySelector("#campaign-content"), content.campaign);
  await renderCharacters(document.querySelector("#characters-content"), content.characters);
  renderChronicle(document.querySelector("#chronicle-content"), content.chronicle, theme);
  document.title = `${manifest.title} — Vengrath`;
}

initializeCampaignPage().catch((error) => {
  console.error("Nie udało się uruchomić kampanii Tron z Popiołu.", error);
  const message = createElement("p", {
    class: "page-error",
    text: "Nie udało się wczytać kampanii. Odśwież stronę za chwilę.",
  });
  document.querySelector("main")?.prepend(message);
});
