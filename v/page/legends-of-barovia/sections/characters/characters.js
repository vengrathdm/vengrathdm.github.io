import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";

export async function renderCharactersSection(characters) {
  document.querySelector("#characters-kicker").textContent = characters.kicker;
  document.querySelector("#characters-title").textContent = characters.title;
  document.querySelector("#characters-description").textContent =
    characters.description;
  document.querySelector("#characters-quote").textContent =
    `„${characters.quote}”`;
  document.querySelector("#characters-attribution").textContent =
    characters.quoteAttribution;

  const gallery = new CharacterGallery(
    document.querySelector("#character-gallery"),
    { characterIds: characters.characterIds },
  );

  await gallery.render();
}
