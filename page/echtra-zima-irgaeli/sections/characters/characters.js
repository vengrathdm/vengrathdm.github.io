import { CharacterGallery } from "/core/templates/CharacterGallery/CharacterGallery.js";
export async function renderCharactersSection(c) {
  document.querySelector("#characters-kicker").textContent = c.kicker;
  document.querySelector("#characters-title").textContent = c.title;
  document.querySelector("#characters-description").textContent = c.description;
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: c.characterIds,
  }).render();
}
