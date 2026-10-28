import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
export async function renderCharactersSection(characters) {
  document.querySelector("#characters-kicker").textContent = characters.kicker;
  document.querySelector("#characters-title").textContent = characters.title;
  document.querySelector("#characters-description").textContent =
    characters.description;
  document.querySelector("#living-title").textContent = characters.livingTitle;
  document.querySelector("#living-description").textContent =
    characters.livingDescription;
  document.querySelector("#dead-title").textContent = characters.deadTitle;
  document.querySelector("#dead-description").textContent =
    characters.deadDescription;
  const livingGallery = new CharacterGallery(
    document.querySelector("#living-character-gallery"),
    { characterIds: characters.livingCharacterIds },
  );
  const deadGallery = new CharacterGallery(
    document.querySelector("#dead-character-gallery"),
    { characterIds: characters.deadCharacterIds },
  );
  await Promise.all([livingGallery.render(), deadGallery.render()]);
}
