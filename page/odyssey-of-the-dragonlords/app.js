import { createSubpageHero } from "/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/core/templates/SubpageNavbar/SubpageNavbar.js";
import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
import { AudioPlayer } from "/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/core/templates/AudioPlayerButton/AudioPlayerButton.js";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(`Nie udało się wczytać ${path} (${response.status})`);
  return response.json();
}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(
      "--theme-" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
      value,
    );
  });
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);
  const hero = createSubpageHero({
    title: content.campaign.title,
    backgroundImage: theme.heroImage,
    theme: { accent: theme.colors.accent2 },
  });
  hero.id = "top";
  hero.classList.add("odyssey-hero");
  const navMount = document.createElement("div");
  navMount.className = "odyssey-navbar-mount";
  hero.prepend(navMount);
  const kicker = document.createElement("p");
  kicker.className = "odyssey-hero-kicker";
  kicker.textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.textContent = "Odyssey of";
  const titleAccent = document.createElement("em");
  titleAccent.className = "odyssey-hero-title-accent";
  titleAccent.textContent = "the Dragonlords";
  heading.append(document.createElement("br"), titleAccent);
  heading.before(kicker);
  const lead = document.createElement("p");
  lead.className = "odyssey-hero-lead";
  lead.textContent = content.campaign.lead;
  hero.querySelector("h1").after(lead);
  document.querySelector("#campaign-hero").replaceWith(hero);
  mountSubpageNavbar(navMount, {
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
  const campaign = content.campaign;
  document.querySelector("#intro-kicker").textContent = campaign.introKicker;
  document.querySelector("#intro-title").textContent = campaign.introTitle;
  const intro = document.querySelector("#intro-copy");
  campaign.introParagraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    intro.append(p);
  });
  const dossier = document.querySelector("#campaign-dossier");
  campaign.dossier.forEach((item) => {
    const row = document.createElement("div");
    row.className = "odyssey-case-row";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    row.append(label, value);
    dossier.append(row);
  });
  document.querySelector("#party-kicker").textContent = campaign.partyKicker;
  document.querySelector("#party-title").textContent = campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    campaign.partyDescription;
  document.querySelector("#party-image").src = campaign.partyImage;
  document.querySelector("#characters-kicker").textContent =
    content.characters.kicker;
  document.querySelector("#characters-title").textContent =
    content.characters.title;
  document.querySelector("#characters-description").textContent =
    content.characters.description;
  const characterGallery = new CharacterGallery(
    document.querySelector("#odyssey-character-gallery"),
    { characterIds: content.characters.characterIds },
  );
  await characterGallery.render();
  const playlist = document.querySelector("#chronicle-playlist");
  playlist.href = content.chronicle.playlistUrl;
  const chronicle = document.querySelector("#campaign-chronicle");
  chronicle.replaceChildren(
    ...content.chronicle.sessions.map((session) =>
      createChronicleRecord(session, { accent: theme.colors.accent2 }),
    ),
  );
  if (manifest.audio?.src) {
    const player = new AudioPlayer({
      src: manifest.audio.src,
      storageKey: manifest.audio.continuationKey,
    });
    mountAudioPlayerButton(player, theme.audioColor);
  }
}
initialize()
  .then(() => {
    document.body.classList.remove("campaign-startup-loading");
  })
  .catch((error) => {
    console.error(
      "Nie udało się uruchomić strony Odyssey of the Dragonlords.",
      error,
    );
    const message = document.createElement("p");
    message.className = "odyssey-load-error";
    message.textContent =
      "Nie udało się wczytać kampanii. Odśwież stronę lub spróbuj później.";
    message.setAttribute("role", "alert");
    document.body.prepend(message);
  });