import { loadCharacterCatalog } from "/core/templates/CharacterGallery/CharacterRepository.js";
import { createCharacterCard } from "/core/templates/CharacterCard/CharacterCard.js";

const $ = (selector) => document.querySelector(selector);
const fields = {
  player: $("#player-filter"), campaign: $("#campaign-filter"), module: $("#module-filter"),
  className: $("#class-filter"), race: $("#race-filter"), achievement: $("#achievement-filter"),
  status: $("#status-filter")
};
let characters = [], achievements = new Map();

const asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase("pl-PL")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "");


let portraitFrameSequence = 0;

function appendSvgFrame(portrait, statusKey) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "status-frame-svg");
  svg.setAttribute("viewBox", "0 0 220 310");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const uid = "hof-frame-" + (++portraitFrameSequence);
  const markup = {
    zwycieska: `
      <defs>
        <linearGradient id="${uid}-gold" x1="0" y1="0" x2="220" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#f7dc81"/><stop offset="45%" stop-color="#b88928"/><stop offset="75%" stop-color="#6e4f12"/><stop offset="100%" stop-color="#e3be5b"/>
        </linearGradient>
        <linearGradient id="${uid}-inner" x1="220" y1="0" x2="0" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#5c400d"/><stop offset="50%" stop-color="#d4a843"/><stop offset="100%" stop-color="#473008"/>
        </linearGradient>
      </defs>
      <polygon points="24,6 196,6 214,24 214,286 196,304 24,304 6,286 6,24" stroke="url(#${uid}-gold)" stroke-width="2.5"/>
      <polygon points="27,12 193,12 208,27 208,283 193,298 27,298 12,283 12,27" stroke="url(#${uid}-inner)" stroke-width="1.2"/>
      <g class="sanctuary-filigree" stroke="#d4a843" stroke-width="1.4">
        <path d="M6,38 L22,38 L38,22 L38,6"/><polygon points="15,15 23,15 23,23 15,23" fill="#16130c"/>
        <path d="M214,38 L198,38 L182,22 L182,6"/><polygon points="197,15 205,15 205,23 197,23" fill="#16130c"/>
        <path d="M6,272 L22,272 L38,288 L38,304"/><polygon points="15,287 23,287 23,295 15,295" fill="#16130c"/>
        <path d="M214,272 L198,272 L182,288 L182,304"/><polygon points="197,287 205,287 205,295 197,295" fill="#16130c"/>
        <polygon points="110,2 117,9 110,16 103,9" fill="#1c160b"/><polygon points="110,294 117,301 110,308 103,301" fill="#1c160b"/>
      </g>`,
    aktywna: `
      <defs>
        <linearGradient id="${uid}-iron" x1="0" y1="0" x2="0" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#5c4d42"/><stop offset="50%" stop-color="#362c25"/><stop offset="100%" stop-color="#8c4a1c"/>
        </linearGradient>
        <linearGradient id="${uid}-ember" x1="110" y1="310" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ff9d3b"/><stop offset="60%" stop-color="#b84d0e"/><stop offset="100%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="200" height="290" stroke="url(#${uid}-iron)" stroke-width="2.5"/>
      <rect x="14" y="14" width="192" height="282" stroke="url(#${uid}-ember)" stroke-width="1.2"/>
      <path class="torch-flame-tip" d="M84,300 L92,291 L128,291 L136,300 Z" fill="#21140b" stroke="#ff9d3b" stroke-width="1.3"/>
      <polygon points="110,283 115,291 110,297 105,291" fill="#ff9d3b"/>`,
    martywa: `
      <defs><linearGradient id="${uid}-fault" x1="0" y1="0" x2="220" y2="310" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#4a3b3e"/><stop offset="50%" stop-color="#261d1f"/><stop offset="100%" stop-color="#5c1922"/>
      </linearGradient></defs>
      <path d="M105,10 L10,10 L10,300 L103,300" stroke="url(#${uid}-fault)" stroke-width="2.5"/>
      <path d="M115,10 L210,10 L210,300 L117,300" stroke="url(#${uid}-fault)" stroke-width="2.5"/>
      <g class="fault-crack-glow" stroke="#d92638" stroke-width="1.6" stroke-linecap="round">
        <polyline points="105,6 110,16 107,26 113,35"/><polyline points="115,6 110,16"/>
        <polyline points="103,304 110,292 106,281 112,272"/><polyline points="117,304 110,292"/>
        <polyline points="10,118 22,123 30,120"/><polyline points="210,186 197,181 190,185"/>
      </g>
      <path d="M6,26 L6,6 L26,6 M194,6 L214,6 L214,26 M6,284 L6,304 L26,304 M194,304 L214,304 L214,284" stroke="#8f111e" stroke-width="2"/>`,
    wycofana: `
      <defs><linearGradient id="${uid}-silver" x1="0" y1="0" x2="220" y2="310" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#9aa7b5"/><stop offset="50%" stop-color="#4b5663"/><stop offset="100%" stop-color="#7f8c99"/>
      </linearGradient></defs>
      <rect x="8" y="8" width="204" height="294" rx="2" stroke="#363e47" stroke-width="1.5"/>
      <path class="curator-trim" d="M12,298 L12,110 A98,98 0 0,1 208,110 L208,298 Z" stroke="url(#${uid}-silver)" stroke-width="2.2"/>
      <circle cx="110" cy="12" r="4" fill="#181c21" stroke="#a8b5c2" stroke-width="1.3"/>
      <line x1="65" y1="298" x2="155" y2="298" stroke="#a8b5c2" stroke-width="3"/>
      <rect x="92" y="294" width="36" height="8" fill="#181c21" stroke="#6c7987" stroke-width="1.2"/>`,
    porzucona: `
      <g class="unwritten-sketch-lines" stroke="#786f64" stroke-linecap="square">
        <path d="M12,155 L12,12 L208,12 L208,130" stroke-width="1.8"/>
        <line x1="6" y1="12" x2="20" y2="12" stroke-width="1"/><line x1="12" y1="6" x2="12" y2="20" stroke-width="1"/>
        <line x1="200" y1="12" x2="214" y2="12" stroke-width="1"/><line x1="208" y1="6" x2="208" y2="20" stroke-width="1"/>
        <path d="M12,165 L12,298 L208,298 L208,142" stroke-width="1.3" stroke-dasharray="6 6 2 6" stroke="#575048"/>
        <line x1="18" y1="18" x2="18" y2="210" stroke-width=".75" stroke-dasharray="3 5" stroke="#4d4740"/>
        <line x1="202" y1="18" x2="202" y2="185" stroke-width=".75" stroke-dasharray="3 5" stroke="#4d4740"/>
      </g>`
  };
  svg.innerHTML = markup[statusKey];
  portrait.append(svg);
}

function spawnStatusParticles(container, count, className, options) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = className;
    const left = Math.random() * 92 + 4;
    const size = Math.random() * (options.maxSize - options.minSize) + options.minSize;
    const duration = Math.random() * (options.maxDur - options.minDur) + options.minDur;
    const delay = -Math.random() * options.maxDur;
    const drift = (Math.random() - 0.5) * options.driftRange;
    particle.style.left = left + "%";
    particle.style.width = size.toFixed(1) + "px";
    particle.style.height = size.toFixed(1) + "px";
    particle.style.setProperty("--dur", duration.toFixed(2) + "s");
    particle.style.setProperty("--delay", delay.toFixed(2) + "s");
    particle.style.setProperty("--drift", drift.toFixed(1) + "px");
    container.append(particle);
  }
}

function applyStatusPortraitDesign(card, character) {
  const statusKey = ({
    "zwycieska": "zwycieska",
    "aktywna": "aktywna",
    "martwa": "martywa",
    "wycofana": "wycofana",
    "porzucona": "porzucona"
  })[normalize(character.status)];
  if (!statusKey) return;
  card.classList.add("status-" + statusKey);
  const portrait = card.querySelector(".character-card__portrait");
  if (!portrait) return;

  if (statusKey === "zwycieska") {
    const glow = document.createElement("div"); glow.className = "sanctuary-glow"; portrait.append(glow);
    const particles = document.createElement("div"); particles.className = "particle-layer gold-particles"; portrait.append(particles);
    spawnStatusParticles(particles, 22, "gold-dust", {minSize:2,maxSize:4.5,minDur:2.8,maxDur:4.8,driftRange:28});
  } else if (statusKey === "aktywna") {
    const aura = document.createElement("div"); aura.className = "torch-aura"; portrait.append(aura);
    const particles = document.createElement("div"); particles.className = "particle-layer ember-particles"; portrait.append(particles);
    spawnStatusParticles(particles, 16, "ember-spark", {minSize:2,maxSize:3.5,minDur:2.2,maxDur:3.8,driftRange:30});
  } else if (statusKey === "martywa") {
    const particles = document.createElement("div"); particles.className = "particle-layer crimson-particles"; portrait.append(particles);
    spawnStatusParticles(particles, 18, "crimson-ash", {minSize:2,maxSize:3.8,minDur:3.2,maxDur:5.0,driftRange:20});
  } else if (statusKey === "wycofana") {
    const veil = document.createElement("div"); veil.className = "curator-veil"; portrait.append(veil);
  }
  appendSvgFrame(portrait, statusKey);
}

function fillSelect(select, values, placeholder) {
  const current = select.value;
  select.replaceChildren(new Option(placeholder, ""));
  [...new Set(values.filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b, "pl"))
    .forEach((value) => select.add(new Option(value, value)));
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function selectedRows() {
  const query = normalize($("#search").value);
  const rows = characters.filter((character) => {
    const earned = asArray(character.achievementIds).map((id) => achievements.get(id)).filter(Boolean);
    const searchable = [
      character.character, character.player, character.status, character.race,
      ...asArray(character.campaigns), ...asArray(character.classes), ...asArray(character.modules),
      ...earned.flatMap((item) => [item.name, item.description])
    ].join(" ");
    return (!query || normalize(searchable).includes(query))
      && (!fields.player.value || character.player === fields.player.value)
      && (!fields.campaign.value || asArray(character.campaigns).includes(fields.campaign.value))
      && (!fields.module.value || asArray(character.modules).includes(fields.module.value))
      && (!fields.className.value || asArray(character.classes).includes(fields.className.value))
      && (!fields.race.value || character.race === fields.race.value)
      && (!fields.achievement.value || asArray(character.achievementIds).includes(fields.achievement.value))
      && (!fields.status.value || character.status === fields.status.value);
  });
  const sortBy = $("#sort").value;
  const sortValue = (character) => {
    if (sortBy === "player") return String(character.player || "");
    if (sortBy === "module") return asArray(character.modules).join(", ");
    if (sortBy === "campaign") return asArray(character.campaigns).join(", ");
    if (sortBy === "race") return String(character.race || "");
    if (sortBy === "class") return asArray(character.classes).join(", ");
    if (sortBy === "status") return String(character.status || "");
    return String(character.character || "");
  };
  rows.sort((a, b) => sortValue(a).localeCompare(sortValue(b), "pl", { sensitivity: "base" })
    || String(a.character || "").localeCompare(String(b.character || ""), "pl", { sensitivity: "base" }));
  return rows;
}

function updateStats(rows) {
  $("#stat-heroes").textContent = rows.length;
  $("#stat-players").textContent = new Set(rows.map((item) => item.player).filter(Boolean)).size;
  $("#stat-campaigns").textContent = new Set(rows.flatMap((item) => asArray(item.campaigns))).size;
  $("#stat-active").textContent = rows.filter((item) => item.status === "Aktywna").length;
  $("#stat-victorious").textContent = rows.filter((item) => item.status === "Zwycięska").length;
}

function openCharacter(character) {
  const layout = document.createElement("div"); layout.className = "dialog-layout";
  const portrait = document.createElement("div"); portrait.className = "dialog-portrait";
  const image = document.createElement("img"); image.src = character.portrait; image.alt = character.character || "Portret postaci";
  portrait.append(image);
  const copy = document.createElement("div"); copy.className = "dialog-copy";
  const kicker = document.createElement("p"); kicker.className = "dialog-kicker"; kicker.textContent = "KARTA BOHATERA · " + (character.id || "").toUpperCase();
  const title = document.createElement("h2"); title.textContent = character.character || "Nieznana postać";
  const player = document.createElement("p"); player.className = "dialog-player"; player.textContent = "Gracz: " + (character.player || "Nie podano");
  const status = document.createElement("span"); status.className = "dialog-status"; status.textContent = character.status || "Nieznany status";
  const details = document.createElement("dl");
  const addRow = (label, value) => { const dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = label; dd.textContent = Array.isArray(value) ? value.join(", ") || "Nie podano" : value || "Nie podano"; details.append(dt, dd); };
  addRow("Kampanie", character.campaigns); addRow("Moduły", character.modules); addRow("Klasy", character.classes); addRow("Rasa", character.race); addRow("Status", character.status);
  copy.append(kicker, title, player, status, details);
  const earned = asArray(character.achievementIds).map((id) => achievements.get(id)).filter(Boolean);
  const awards = document.createElement("section"); awards.className = "dialog-section";
  const heading = document.createElement("h3"); heading.textContent = "ODZNACZENIA I DOKONANIA";
  const list = document.createElement("div"); list.className = "award-list";
  if (earned.length) earned.forEach((item) => { const article = document.createElement("article"); article.className = "award"; const icon = document.createElement("span"); icon.className = "award-icon"; icon.textContent = item.icon || "✦"; const body = document.createElement("div"); const name = document.createElement("strong"); name.textContent = item.name || "Odznaczenie"; const desc = document.createElement("p"); desc.textContent = item.description || ""; body.append(name, desc); article.append(icon, body); list.append(article); });
  else list.textContent = "Ta postać nie ma jeszcze zapisanych odznaczeń.";
  awards.append(heading, list); copy.append(awards);
  const history = document.createElement("section"); history.className = "dialog-section";
  const historyHeading = document.createElement("h3"); historyHeading.textContent = "KRONIKA";
  const historyText = document.createElement("p"); historyText.className = "dialog-history";
  historyText.textContent = character.history && character.history !== "Brak zapisków." ? character.history : "Nie zachowały się jeszcze zapiski z historii tej postaci.";
  history.append(historyHeading, historyText); copy.append(history);
  layout.append(portrait, copy); $("#dialog-content").replaceChildren(layout); $("#character-dialog").showModal();
}

function render() {
  const rows = selectedRows();
  $("#result-count").textContent = "WYŚWIETLANE: " + rows.length + " Z " + characters.length + " POSTACI";
  $("#empty-state").hidden = rows.length !== 0;
  const grid = $("#grid"); grid.replaceChildren();
  const fragment = document.createDocumentFragment();
  rows.forEach((character) => { const card = createCharacterCard(character, achievements); applyStatusPortraitDesign(card, character); fragment.append(card); });
  grid.append(fragment);
  updateStats(rows);
}

function resetFilters() {
  $("#search").value = "";
  Object.values(fields).forEach((select) => { select.value = ""; });
  $("#sort").value = "name";
  render();
}

$("#search").addEventListener("input", render);
Object.values(fields).forEach((select) => select.addEventListener("change", render));
$("#sort").addEventListener("change", render);
$("#reset").addEventListener("click", resetFilters);
$("#grid").addEventListener("characterselect", (event) => openCharacter(event.detail.character));
$("#dialog-close").addEventListener("click", () => $("#character-dialog").close());
$("#character-dialog").addEventListener("click", (event) => { if (event.target === $("#character-dialog")) $("#character-dialog").close(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && $("#character-dialog").open) $("#character-dialog").close(); });

try {
  const catalog = await loadCharacterCatalog();
  characters = catalog.characters;
  achievements = catalog.achievements;
  fillSelect(fields.player, characters.map((item) => item.player), "Wszyscy gracze");
  fillSelect(fields.campaign, characters.flatMap((item) => asArray(item.campaigns)), "Wszystkie kampanie");
  fillSelect(fields.module, characters.flatMap((item) => asArray(item.modules)), "Wszystkie moduły");
  fillSelect(fields.className, characters.flatMap((item) => asArray(item.classes)), "Wszystkie klasy");
  fillSelect(fields.race, characters.map((item) => item.race), "Wszystkie rasy");
  fillSelect(fields.achievement, characters.flatMap((item) => asArray(item.achievementIds)), "Wszystkie odznaczenia");
  fillSelect(fields.status, characters.map((item) => item.status), "Wszystkie statusy");
  // Uczyń nazwy odznaczeń czytelnymi, zachowując ich identyfikatory jako wartości filtra.
  [...fields.achievement.options].slice(1).forEach((option) => { const item = achievements.get(option.value); if (item?.name) option.textContent = item.name; });
  render();
} catch (error) {
  console.error("Nie udało się wczytać archiwum Hall of Fame:", error);
  $("#load-error").hidden = false;
  $("#result-count").textContent = "BŁĄD WCZYTYWANIA DANYCH";
}