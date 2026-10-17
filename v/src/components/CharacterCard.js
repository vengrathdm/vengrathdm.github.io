/** Builds one character card from a normalized character record. */
export class CharacterCard {
  create(character) {
    const article = document.createElement("article");
    article.className = "character-card";

    const portrait = document.createElement("div");
    portrait.className = "character-card__portrait";

    if (character.portrait) {
      const image = document.createElement("img");
      image.src = this.resolvePortrait(character.portrait);
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      portrait.append(image);
    }

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = character.character;
    const metadata = document.createElement("p");
    metadata.textContent = [character.player, character.race, ...(character.classes ?? [])]
      .filter(Boolean)
      .join(" · ");

    details.append(title, metadata);
    article.append(portrait, details);
    return article;
  }

  resolvePortrait(path) {
    if (path.startsWith("/")) return `../${path.slice(1)}`;
    return `../${path}`;
  }
}
