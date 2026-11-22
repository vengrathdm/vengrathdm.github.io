# The Heartwell Gazette Archive

A standalone Three.js card-catalogue archive for the Vengrath GitHub Pages site.

Public route: https://vengrathdm.github.io/Experiment/

## How it is organised

- \`index.html\`, \`styles.css\` and \`app.js\` implement the room, searchable cabinet, drawer interactions and reader.
- \`gazettes.json\` is the catalogue manifest. It defines the physical drawers and lists every gazette with its metadata and HTML file path.
- \`gazette/<slug>.html\` contains one complete, independent document per gazette. The reader loads the selected file into a full-screen iframe; article copy is not embedded in the cabinet script.

## Cabinet features

The cabinet currently has thirty narrow card-catalogue drawers. Each physical drawer is a separately selectable object that slides forward when opened, with its contents shown as individually accessible files in the drawer panel. Selecting a gazette brings a red-bound volume forward and unfolds it before the standalone document opens. Drawers and papers can both be marked for quick retrieval.

Search checks drawer labels, descriptions, gazette titles, issue identifiers, dates, excerpts and tags. The **Marked** filter shows drawers and papers that have been marked. Marks persist in the current browser using localStorage.

## Add another gazette

1. Create a standalone HTML document in \`Experiment/gazette/\`, for example \`Experiment/gazette/the-new-report.html\`.
2. Add a gazette object to the \`gazettes\` array in \`Experiment/gazettes.json\`. Give it a unique \`slug\`, \`title\`, \`issue\`, \`date\`, \`drawer\`, \`excerpt\`, \`tags\` array and \`file\` path such as \`./gazette/the-new-report.html\`.
3. To add a new drawer, add an object to the \`drawers\` array with a unique \`id\`, \`code\`, \`label\` and \`description\`. Drawer meshes are generated from the manifest.

GitHub Pages is a static host, so the browser cannot enumerate the folder automatically. The manifest is the explicit index that makes each gazette discoverable without a server or GitHub API call. Additional gazettes can be filed into existing drawers; empty drawers are already available as categories.

## Technical notes

- Three.js 0.180.0 and OrbitControls are loaded as ES modules from jsDelivr.
- The cabinet carcass, drawer geometry, labels and filing cards are generated in the browser.
- Each gazette is a standalone HTML page. Its content and styling live in that HTML file; the cabinet app only reads metadata from the manifest and loads the document into an iframe.
- Drawer and paper marks are stored locally per browser; they are not synced between visitors or devices.
- The experiment is isolated in this directory and does not modify the homepage or shared campaign components.
