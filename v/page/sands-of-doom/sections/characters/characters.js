import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";

export async function renderCharactersSection(characters) {
  document.querySelector("#characters-kicker").textContent = characters.kicker;
  document.querySelector("#characters-title").textContent = characters.title;
  document.querySelector("#characters-description").textContent = characters.description;

  const activeGallery = new CharacterGallery(
    document.querySelector("#active-character-gallery"),
    { characterIds: characters.characterIds }
  );
  await activeGallery.render();

  const fallenGallery = new CharacterGallery(
    document.querySelector("#fallen-character-gallery"),
    { characterIds: characters.fallenCharacterIds }
  );
  await fallenGallery.render();
  document.querySelector("#fallen-character-gallery").classList.add("sands-fallen-gallery");
}