import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Nie udało się wczytać pliku: ${path}`);
  }
  return response.json();
}

function renderDossier(target, entries) {
  target.replaceChildren(
    ...entries.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "fact-row";

      const heading = document.createElement("span");
      heading.textContent = label;

      const detail = document.createElement("span");
      detail.textContent = value;

      row.append(heading, detail);
      return row;
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

  const validSections = new Set(sections.map((section) => section.dataset.pageSection));
  const sectionFromHash = () => {
    const requested = window.location.hash.replace(/^#/, "");
    return validSections.has(requested) ? requested : "campaign";
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.section;
      selectSection(sectionId);
      if (window.location.hash !== `#${sectionId}`) {
        window.history.replaceState(null, "", `#${sectionId}`);
      }
    });
  });

  window.addEventListener("hashchange", () => {
    selectSection(sectionFromHash());
  });

  selectSection(sectionFromHash());
}

async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);

  document.querySelector("#campaign-description").textContent =
    content.campaign.description;
  renderDossier(
    document.querySelector("#dossier"),
    content.campaign.dossier,
  );

  const characterRecords = await loadJson("/core/data/characters.json");
  const activeCharacterIds = characterRecords
    .filter(
      (character) =>
        character.status === "Aktywna" &&
        Array.isArray(character.modules) &&
        character.modules.includes("The Dragon's Due"),
    )
    .map((character) => character.id);
  const characterGallery = new CharacterGallery(
    document.querySelector("#character-gallery"),
    {
      characterIds: activeCharacterIds,
      emptyMessage: "W katalogu nie ma obecnie aktywnych postaci tej kampanii.",
    },
  );
  await characterGallery.render();

  if (manifest.audio?.src) {
    const campaignAudio = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
      preload: "none",
    });
    mountAudioPlayerButton(campaignAudio, theme.audioColor);
  }

  mountSectionNavigation();
}

initialize()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error("Nie udało się uruchomić strony The Dragon's Due.", error);
    document.body.classList.remove("campaign-startup-loading");
  });
