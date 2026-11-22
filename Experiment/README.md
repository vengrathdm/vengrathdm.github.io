# The Heartwell Gazette Archive

A standalone Three.js archive experiment for the Vengrath GitHub Pages site.

Public route: https://vengrathdm.github.io/Experiment/

## Experience

The archive has 30 card-catalogue drawers and 50 individual gazette volumes. Each miniature book is seated inside its assigned drawer, behind a lowered front lip that leaves the contents visible when the drawer is pulled out. A volume can be opened from its catalogue entry or physically grabbed and pulled out of the 3D drawer.

The reading room supports a full 360-degree horizontal orbit, broad vertical orbit, zoom and pan. In the reader, every gazette is divided into eight fixed pages. The opening page is right-only, the middle spreads show two pages, and the final page is left-only. Press and hold the narrow outer edge of a page and drag it across the spine to turn; releasing before the threshold returns it to its original side. The toolbar arrows and keyboard arrow/PageUp/PageDown keys are alternate controls.

Each volume has its own pair of live HTML page viewports and its own two-sided flip sheet. The source gazette file is parsed into page-sized HTML documents when the issue is first opened; each rendered page is non-scrollable. The document text is divided into the issue's eight-page layout rather than flattened into a screenshot.

## Files

- index.html and styles.css — scene chrome, page viewports and reading controls.
- app.js — Three.js cabinet, physical volumes, CSS3D pages and input handling.
- gazettes.json — drawer definitions and metadata for the 50 gazettes.
- gazette/<slug>.html — independent source document for each issue.

## Adding a gazette

Create an independent HTML file under Experiment/gazette/ and add an entry to the gazettes array in Experiment/gazettes.json. Assign it to an existing drawer ID or add another drawer definition. The pagination parser uses the document's h1, standfirst/deck and article headings, paragraphs and blockquotes.

GitHub Pages is static hosting, so the browser cannot enumerate the folder automatically; gazettes.json is the explicit catalogue index.

Marks and search state persist locally in the visitor's browser. The mock article copy is intentionally lightweight and can be replaced without changing the 3D reader.
