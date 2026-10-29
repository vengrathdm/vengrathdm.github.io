import { loadCharacterCatalog } from "/core/templates/CharacterGallery/CharacterRepository.js";
import { createCharacterCard } from "/core/templates/CharacterCard/CharacterCard.js";
const $ = (id) => document.getElementById(id),
  arr = (v) => (Array.isArray(v) ? v : v ? [v] : []),
  norm = (v) =>
    String(v ?? "")
      .trim()
      .toLocaleLowerCase("pl-PL")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let characters = [],
  achievements = new Map();
const filters = {
  player: $("playerFilter"),
  campaign: $("campaignFilter"),
  module: $("moduleFilter"),
  class: $("classFilter"),
  race: $("raceFilter"),
  status: $("statusFilter"),
  achievement: $("achievementFilter"),
};
const earned = (c) =>
    [...new Set(arr(c.achievementIds))].filter((id) => achievements.has(id)),
  unique = (a) =>
    [...new Set(a.filter(Boolean))].sort((x, y) =>
      String(x).localeCompare(String(y), "pl"),
    );
function populate(el, values, label, format = (v) => v) {
  el.replaceChildren(new Option(label, ""));
  unique(values).forEach((v) => el.add(new Option(format(v), v)));
}
function setup() {
  populate(
    filters.player,
    characters.map((c) => c.player),
    "Wszyscy gracze",
  );
  populate(
    filters.campaign,
    characters.flatMap((c) => arr(c.campaigns)),
    "Wszystkie kampanie",
  );
  populate(
    filters.module,
    characters.flatMap((c) => arr(c.modules)),
    "Wszystkie moduły",
  );
  populate(
    filters.class,
    characters.flatMap((c) => arr(c.classes)),
    "Wszystkie klasy",
  );
  populate(
    filters.race,
    characters.map((c) => c.race),
    "Wszystkie rasy",
  );
  populate(
    filters.status,
    characters.map((c) => c.status),
    "Wszystkie statusy",
  );
  populate(
    filters.achievement,
    characters.flatMap(earned),
    "Wszystkie tytuły",
    (id) => achievements.get(id)?.name || id,
  );
}
function matches(c) {
  const q = norm($("search").value),
    text = [
      c.character,
      c.player,
      ...arr(c.campaigns),
      ...arr(c.modules),
      ...arr(c.classes),
      c.race,
      c.status,
      c.history,
      ...earned(c).map((id) => achievements.get(id)?.name),
    ].join(" ");
  if (q && !norm(text).includes(q)) return false;
  return (
    (!filters.player.value || c.player === filters.player.value) &&
    (!filters.campaign.value ||
      arr(c.campaigns).includes(filters.campaign.value)) &&
    (!filters.module.value || arr(c.modules).includes(filters.module.value)) &&
    (!filters.class.value || arr(c.classes).includes(filters.class.value)) &&
    (!filters.race.value || c.race === filters.race.value) &&
    (!filters.status.value || c.status === filters.status.value) &&
    (!filters.achievement.value ||
      earned(c).includes(filters.achievement.value))
  );
}
function render() {
  const rows = characters.filter(matches);
  $("resultCount").textContent = rows.length + " / " + characters.length;
  $("empty").hidden = rows.length > 0;
  $("grid").replaceChildren(
    ...rows.map((c) => createCharacterCard(c, achievements)),
  );
  $("statCharacters").textContent = rows.length;
  $("statPlayers").textContent = new Set(
    rows.map((c) => c.player).filter(Boolean),
  ).size;
  $("statCampaigns").textContent = new Set(
    rows.flatMap((c) => arr(c.campaigns)),
  ).size;
  $("statActive").textContent = rows.filter(
    (c) => c.status === "Aktywna",
  ).length;
  $("statWinning").textContent = rows.filter(
    (c) => c.status === "Zwycięska",
  ).length;
}
function openCharacter(c) {
  const earnedItems = earned(c).map((id) => achievements.get(id));
  $("modalContent").innerHTML =
    '<div class="dialog-layout"><div class="dialog-portrait" data-status="' +
    esc(c.status) +
    '"><img src="' +
    esc(c.portrait) +
    '" alt="' +
    esc(c.character) +
    '"><span>' +
    esc(c.status) +
    '</span></div><div class="dialog-copy"><p class="dialog-kicker">PEŁNY REKORD POSTACI</p><h2>' +
    esc(c.character) +
    '</h2><p class="dialog-player">' +
    esc(c.player) +
    "</p><dl><dt>Kampanie</dt><dd>" +
    arr(c.campaigns).map(esc).join(", ") +
    "</dd><dt>Moduły</dt><dd>" +
    arr(c.modules).map(esc).join(", ") +
    "</dd><dt>Klasy</dt><dd>" +
    arr(c.classes).map(esc).join(", ") +
    "</dd><dt>Rasa</dt><dd>" +
    esc(c.race) +
    "</dd><dt>Status</dt><dd>" +
    esc(c.status) +
    "</dd><dt>Osiągnięcia</dt><dd>" +
    (earnedItems.length
      ? '<div class="dialog-achievements">' +
        earnedItems
          .map(
            (a) =>
              "<article><span>" +
              esc(a.icon) +
              "</span><div><strong>" +
              esc(a.name) +
              "</strong><p>" +
              esc(a.description) +
              "</p><small>" +
              esc(a.category) +
              "</small></div></article>",
          )
          .join("") +
        "</div>"
      : "Brak zdobytych osiągnięć") +
    '</dd></dl><section class="dialog-history"><span>HISTORIA</span><p>' +
    esc(c.history || "Brak zapisków.") +
    "</p></section></div></div>";
  $("characterDialog").showModal();
}
$("grid").addEventListener("characterselect", (e) =>
  openCharacter(e.detail.character),
);
$("modalClose").addEventListener("click", () => $("characterDialog").close());
$("characterDialog").addEventListener("click", (e) => {
  if (e.target === $("characterDialog")) $("characterDialog").close();
});
$("search").addEventListener("input", render);
Object.values(filters).forEach((el) => el.addEventListener("change", render));
$("clearFilters").addEventListener("click", () => {
  $("search").value = "";
  Object.values(filters).forEach((el) => (el.value = ""));
  render();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement !== $("search") &&
    !$("characterDialog").open
  ) {
    e.preventDefault();
    $("search").focus();
  }
});
try {
  const data = await loadCharacterCatalog();
  characters = data.characters;
  achievements = data.achievements;
  setup();
  render();
} catch (error) {
  console.error(error);
  $("resultCount").textContent = "BŁĄD";
  $("loadError").hidden = false;
}
