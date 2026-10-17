import { SiteHeader } from "../components/SiteHeader.js";
import { CharacterCard } from "../components/CharacterCard.js";
import { CharacterRepository } from "../data/CharacterRepository.js";
import { SearchService } from "../services/SearchService.js";

/** Application composition root: wires independent classes together. */
class SiteApplication {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.characterRepository = new CharacterRepository();
    this.characterCard = new CharacterCard();
    this.searchService = new SearchService();
    this.characters = [];
    this.searchInput = this.document.querySelector("#character-search");
    this.characterGrid = this.document.querySelector("#character-grid");
    this.characterCount = this.document.querySelector("#character-count");
    this.emptyState = this.document.querySelector("#character-empty");
  }

  async start() {
    new SiteHeader(this.document.querySelector("#site-header")).render();
    this.searchInput.addEventListener("input", () => this.renderCharacters());

    try {
      this.characters = await this.characterRepository.getAll();
      this.renderCharacters();
    } catch (error) {
      this.characterCount.textContent = "Nie udało się wczytać archiwum postaci.";
      console.error(error);
    }
  }

  renderCharacters() {
    const query = this.searchInput.value;
    const visibleCharacters = this.searchService.filterCharacters(this.characters, query);
    const fragment = this.document.createDocumentFragment();

    visibleCharacters.slice(0, 6).forEach((character) => {
      fragment.append(this.characterCard.create(character));
    });

    this.characterGrid.replaceChildren(fragment);
    this.characterCount.textContent = query
      ? `Wyniki: ${visibleCharacters.length} · wyświetlono maksymalnie 6`
      : `Wybrane postacie z archiwum (${this.characters.length} dostępnych)`;
    this.emptyState.hidden = visibleCharacters.length > 0;
  }
}

new SiteApplication().start();
