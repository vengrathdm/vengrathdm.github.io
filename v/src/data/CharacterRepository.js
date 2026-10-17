/** Owns character data loading and validates the minimum rendering contract. */
export class CharacterRepository {
  constructor(sourceUrl = "./src/data/legacy/characters.json") {
    this.sourceUrl = sourceUrl;
  }

  async getAll() {
    const response = await fetch(this.sourceUrl);
    if (!response.ok) {
      throw new Error(`Could not load character data (${response.status}).`);
    }

    const records = await response.json();
    if (!Array.isArray(records)) {
      throw new TypeError("Character data must be a JSON array.");
    }

    return records.filter((record) =>
      record && typeof record.id === "string" &&
      typeof record.character === "string"
    );
  }
}
