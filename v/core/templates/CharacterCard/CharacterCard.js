import { renderAchievements } from "./Achievements/Achievements.js";
export function createCharacterCard(character, achievementDefinitions) {
  const card = document.createElement("article");
  card.className = "character-card";
  card.dataset.status = character.status || "";
  const earned = (
    Array.isArray(character.achievementIds) ? character.achievementIds : []
  )
    .map((id) => achievementDefinitions.get(id))
    .filter(Boolean);
  const badges = document.createElement("div");
  badges.className = "character-card__achievements";
  badges.append(renderAchievements(earned));
  const portrait = document.createElement("div");
  portrait.className = "character-card__portrait";
  const image = document.createElement("img");
  image.src = character.portrait;
  image.alt = character.character || "Portret postaci";
  image.loading = "lazy";
  portrait.append(image);
  const status = document.createElement("span");
  status.className = "character-card__status";
  status.textContent = character.status || "";
  portrait.append(status);
  const body = document.createElement("div");
  body.className = "character-card__body";
  const name = document.createElement("h3");
  name.textContent = character.character || "Nieznana postać";
  const player = document.createElement("p");
  player.className = "character-card__player";
  player.textContent = character.player || "Nie podano";
  body.append(name, player);
  for (const entry of [
    ["Kampanie", character.campaigns],
    ["Klasy", character.classes],
    ["Rasa", character.race],
  ]) {
    const row = document.createElement("div");
    row.className = "character-card__row";
    const label = document.createElement("span");
    label.className = "character-card__label";
    label.textContent = entry[0];
    const value = document.createElement("span");
    value.className = "character-card__value";
    value.textContent = Array.isArray(entry[1])
      ? entry[1].join(", ")
      : entry[1] || "Nie podano";
    row.append(label, value);
    body.append(row);
  }
  const count = document.createElement("p");
  count.className = "character-card__achievement-count";
  count.textContent = earned.length
    ? earned.length + " osiągnięć"
    : "Brak zdobytych osiągnięć";
  card.append(badges, portrait, body, count);
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    "Otwórz rekord postaci " + (character.character || ""),
  );
  card.addEventListener("click", () =>
    card.dispatchEvent(
      new CustomEvent("characterselect", {
        bubbles: true,
        detail: { character },
      }),
    ),
  );
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });
  return card;
}
