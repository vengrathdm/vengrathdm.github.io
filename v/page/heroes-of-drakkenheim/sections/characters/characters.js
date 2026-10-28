import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";

export async function renderCharactersSection(characters) {
  document.querySelector("#characters-kicker").textContent = characters.kicker;
  document.querySelector("#characters-title").textContent = characters.title;
  document.querySelector("#characters-description").textContent =
    characters.description;
  document.querySelector("#character-group-title").textContent =
    characters.groupTitle;
  document.querySelector("#character-group-description").textContent =
    characters.groupDescription;
  const gallery = new CharacterGallery(
    document.querySelector("#campaign-character-gallery"),
    { characterIds: characters.characterIds },
  );
  await gallery.render();
}
