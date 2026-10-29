import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Nie udało się wczytać pliku: ${path}`);
  }
  return response.json();
}

function createNode(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderDossier(target, records) {
  target.replaceChildren(
    ...records.map(([label, value]) => {
      const row = createNode("div", "fact-row");
      row.append(
        createNode("span", "", label),
        createNode("span", "", value),
      );
      return row;
    }),
  );
}

function renderChapters(target, chapters) {
  target.replaceChildren(
    ...chapters.map((chapter) => {
      const card = createNode("article", "district-card");
      card.append(
        createNode("span", "tag", chapter.location),
        createNode("h4", "", chapter.title),
        createNode("p", "", chapter.text),
      );
      return card;
    }),
  );
}

function renderFactions(target, factions) {
  target.replaceChildren(
    ...factions.map((faction) => {
      const card = createNode("article", "district-card");
      card.append(
        createNode("span", "tag", faction.role),
        createNode("h4", "", faction.name),
        createNode("p", "", faction.text),
      );
      return card;
    }),
  );
}

function renderPeople(target, people) {
  target.replaceChildren(
    ...people.map((person, index) => {
      const card = createNode("article", "prince-card");
      const portrait = createNode("div", "prince-mug", person.name.slice(0, 1));
      portrait.append(
        createNode("span", "plate", String(index + 1).padStart(2, "0")),
      );

      const body = createNode("div", "prince-body");
      body.append(
        createNode("span", "role", person.role),
        createNode("h3", "", person.name),
        createNode("p", "", person.text),
      );
      card.append(portrait, body);
      return card;
    }),
  );
}

function mountSectionNavigation() {
  const buttons = [...document.querySelectorAll("[data-section]")];
  const sections = [...document.querySelectorAll("[data-page-section]")];

  function selectSection(sectionId) {
    sections.forEach((section) => {
      const active = section.dataset.pageSection === sectionId;
      section.hidden = !active;
      section.classList.toggle("active", active);
    });

    buttons.forEach((button) => {
      const active = button.dataset.section === sectionId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectSection(button.dataset.section);
    });
  });

  selectSection("campaign");
}

async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);

  document.querySelector("#campaign-lead").textContent =
    content.campaign.lead;
  document.querySelector("#campaign-manifesto").textContent =
    `„${content.campaign.manifesto}”`;
  document.querySelector("#campaign-manifesto-credit").textContent =
    "— Akta Korony · Cormyr";
  document.querySelector("#intro-title").textContent =
    content.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(
    ...content.campaign.introParagraphs.map((paragraph) =>
      createNode("p", "", paragraph),
    ),
  );

  renderDossier(document.querySelector("#dossier"), content.campaign.dossier);
  renderChapters(document.querySelector("#chapters"), content.chapters);
  renderFactions(document.querySelector("#factions"), content.factions);
  renderPeople(document.querySelector("#people"), content.people);

  const notes = document.querySelector("#gm-notes");
  notes.className = "thread-board";
  notes.replaceChildren(
    ...content.gmNotes.map((note) => {
      const card = createNode("p", "thread-card", note);
      return card;
    }),
  );

  mountSectionNavigation();

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
    const message = createNode(
      "p",
      "cz-error",
      "Nie udało się wczytać akt kampanii.",
    );
    document.querySelector("main")?.prepend(message);
  });
