# The Heartwell Gazette Archive

A standalone Three.js archive experiment for the Vengrath GitHub Pages site.

Public route: https://vengrathdm.github.io/Experiment/

## Experience

The room and the card-catalogue cabinet are rendered in Three.js. Thirty narrow drawers are generated from the manifest. Each drawer slides forward when selected; its filed papers can be searched, opened and marked.

The archive contains **50 independent gazette HTML documents** in \`gazette/\`. Each one is loaded as a live HTML viewport and mounted onto a pseudo-physical open gazette object in the room. The viewport is transformed by Three.js' CSS3D renderer into the same camera space as the WebGL cabinet. Text remains selectable, links remain interactive, and the page can scroll inside the physical paper surface. It is not a flattened screenshot or a full-screen modal reader.

Selecting a paper lifts the physical volume out of its filing drawer, brings it forward into the reading area and opens its cover. The reader controls remain outside the paper surface so the user can mark the issue or return it to the drawer without leaving the room.

## Files

- \`index.html\`, \`styles.css\` — scene chrome and responsive UI.
- \`app.js\` — Three.js cabinet, physical gazette prop, CSS3D viewport and interactions.
- \`gazettes.json\` — 30 drawer definitions and metadata for the 50 gazettes.
- \`gazette/<slug>.html\` — independent, lightweight HTML page for each issue.

## Add another gazette

1. Create a standalone HTML document under \`Experiment/gazette/\`.
2. Add an object to the \`gazettes\` array in \`Experiment/gazettes.json\`, including a unique \`slug\`, \`title\`, \`issue\`, \`date\`, \`drawer\`, \`excerpt\`, \`tags\`, and \`file\` path such as \`./gazette/my-new-issue.html\`.
3. Use one of the existing drawer IDs, or add a new entry to the \`drawers\` array. Drawer geometry is generated from the manifest.

GitHub Pages is a static host, so the browser cannot enumerate the folder automatically. The manifest is the explicit index that makes each HTML file discoverable without a server or GitHub API call.

## Marks and search

Search examines drawer labels and descriptions, titles, dates, excerpts and tags. Drawer marks and individual gazette marks persist in the current browser using localStorage. They are local to that browser and do not sync across devices or visitors.

## Technical notes

- Three.js 0.180.0 and OrbitControls are loaded from jsDelivr.
- The 3D filing cabinet and the physical book are WebGL geometry.
- Each live document is a CSS3D object aligned with the WebGL camera and placed over the paper geometry.
- The mock issues are intentionally lightweight and use short placeholder copy. Replace any file's contents with a fuller designed gazette without changing the reader.
