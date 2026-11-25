# Fantasy Attempt — campaign starter

Published path: https://vengrathdm.github.io/page/fantasy-attempt/

## Structure
- `index.html` — GitHub Pages entry point; loads React and Babel from CDNs and compiles the TypeScript/TSX source in-browser.
- `src/App.tsx` — React + TypeScript campaign UI and sample data.
- `src/styles.css` — responsive visual system.
- `res/` — reserved for campaign artwork supplied later.

The six hash routes are exclusive screens: `#intro`, `#postaci`, `#kronika`, `#mapa`, `#notatki`, and `#status`. Chronicle summaries can be edited in-session; journal notes can be added and pinned. Chronicle edits persist in localStorage in the current browser.

## Optional artwork to add later
Place the following WebP assets in `res/` (the site currently works without them):
- `hero-world.webp` — 16:9 or 3:2 wide atmospheric campaign key art; a strange planet/world suspended over a dark sea, no lettering.
- `character-mara.webp`, `character-brindle.webp`, `character-orryx.webp`, `character-calyx.webp` — 3:4 portrait illustrations, one per sample character, no text.
- `map-parchment.webp` — 16:9 aged fantasy map texture / parchment background, no labels; optional replacement for the coded sample map.
- `section-intro.webp`, `section-postaci.webp`, `section-kronika.webp`, `section-mapa.webp`, `section-notatki.webp`, `section-status.webp` — optional 3:1 decorative title plates if you want illustrated section headers.

These are placeholders/sample campaign content, ready to replace with the actual campaign's lore, characters, sessions and locations.
