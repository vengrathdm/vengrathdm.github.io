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
  rows.sort((a, b) => {
    if ($("#sort").value === "player") return String(a.player || "").localeCompare(String(b.player || ""), "pl") || String(a.character || "").localeCompare(String(b.character || ""), "pl");
    if ($("#sort").value === "status") return String(a.status || "").localeCompare(String(b.status || ""), "pl") || String(a.character || "").localeCompare(String(b.character || ""), "pl");
    return String(a.character || "").localeCompare(String(b.character || ""), "pl");
  });
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
  rows.forEach((character) => fragment.append(createCharacterCard(character, achievements)));
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