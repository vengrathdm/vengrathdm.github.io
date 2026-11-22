# The Heartwell Gazette Archive

A standalone Three.js archive experiment for the Vengrath GitHub Pages site.

Public route: https://vengrathdm.github.io/Experiment/

## Experience

The room and card-catalogue cabinet are rendered in Three.js. Thirty narrow drawers are generated from the manifest. Each drawer slides forward when selected; its filed papers can be searched, opened and marked.

The archive contains 50 independent gazette HTML documents in the gazette folder. Every entry owns a distinct miniature 3D volume, a CSS3D object and a dedicated iframe. The iframe stays on about:blank until that exact issue is selected; then its standalone HTML document is loaded into the viewport on the volume's pages. This keeps the catalogue lightweight without reusing one shared reader iframe.

Selecting a paper extracts its own miniature volume from the open drawer, brings it forward, enlarges it and opens its cover. The live HTML viewport appears on the paper surface only after the cover has opened. Text remains selectable, links remain interactive, and the page can scroll inside the physical book while the rest of the room remains visible. It is not a flattened screenshot or a full-screen modal reader.

Closing a gazette reverses the animation, closes the cover and returns that same volume to its originating drawer.

## Files

- index.html and styles.css — scene chrome and responsive UI.
- app.js — Three.js cabinet, fifty physical book objects, CSS3D viewports and interactions.
- gazettes.json — 30 drawer definitions and metadata for the 50 gazettes.
- gazette/<slug>.html — independent, lightweight HTML page for each issue.

## Add another gazette

1. Create a standalone HTML document under Experiment/gazette/.
2. Add an object to the gazettes array in Experiment/gazettes.json, including a unique slug, title, issue, date, drawer, excerpt, tags, and file path such as ./gazette/my-new-issue.html.
3. Use one of the existing drawer IDs, or add a new entry to the drawers array. Drawer geometry and the mini book are generated from the manifest.

GitHub Pages is a static host, so the browser cannot enumerate the folder automatically. The manifest is the explicit index that makes each HTML file discoverable without a server or GitHub API call.

## Marks and search

Search examines drawer labels and descriptions, titles, dates, excerpts and tags. Drawer marks and individual gazette marks persist in the current browser using localStorage. They are local to that browser and do not sync across devices or visitors.

## Technical notes

- Three.js 0.180.0, OrbitControls and CSS3DRenderer are loaded from jsDelivr.
- The filing cabinet and miniature book volumes are WebGL geometry.
- Each gazette has its own iframe and CSS3DObject; only the selected issue's iframe loads its document.
- The mock issues are intentionally lightweight and use placeholder copy. Replace any file with a fuller designed gazette without changing the reader.
