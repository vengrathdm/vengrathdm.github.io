/** Renders the global header. The class owns only header markup. */
export class SiteHeader {
  constructor(root) {
    this.root = root;
  }

  render() {
    this.root.innerHTML = `
      <div class="site-header">
        <a class="site-header__brand" href="./" aria-label="Vengrath — strona główna">VENGRATH<span>.</span></a>
        <nav class="site-header__nav" aria-label="Nawigacja główna">
          <a href="#campaigns">Kampanie</a>
          <a href="#characters">Postacie</a>
          <a href="#projects">Projekty</a>
        </nav>
      </div>`;
  }
}
