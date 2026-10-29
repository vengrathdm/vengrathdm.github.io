import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

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

  document.querySelector("#campaign-description").textContent =
    content.campaign.description;
  renderDossier(
    document.querySelector("#dossier"),
    content.campaign.dossier,
  );

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
