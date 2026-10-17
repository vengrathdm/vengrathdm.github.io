/** Pure search logic. It does not read the DOM or mutate records. */
export class SearchService {
  normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pl")
      .trim();
  }

  filterCharacters(characters, query) {
    const needle = this.normalize(query);
    if (!needle) return [...characters];

    return characters.filter((character) => {
      const searchable = [
        character.character,
        character.player,
        character.race,
        ...(character.classes ?? []),
        ...(character.campaigns ?? []),
        ...(character.modules ?? []),
      ].join(" ");
      return this.normalize(searchable).includes(needle);
    });
  }
}
