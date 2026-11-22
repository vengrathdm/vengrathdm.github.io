# The Gazette Cabinet

A standalone Three.js experiment for the Vengrath GitHub Pages site.

Public route: /Experiment/

## What it does

- Builds a small, atmospheric 3D room and wooden cabinet from procedural geometry and canvas textures.
- Places six individually selectable gazettes on the cabinet shelves.
- A selection lifts the chosen issue out of the cabinet, brings it toward the viewer, and unfolds it into a two-page spread.
- The spread is printed with issue-specific headlines and article text; the reader panel provides the issue's date and a short extract.
- The cabinet can be revisited with the return button or Escape.

## Implementation

- Three.js 0.180.0 and its OrbitControls add-on are loaded as ES modules from jsDelivr.
- No model, image or audio files are required. The room, furniture, covers, page layouts and textures are generated in the browser.
- The experiment is isolated in this directory and does not modify the Vengrath homepage or shared campaign components.

Open index.html through GitHub Pages at https://vengrathdm.github.io/Experiment/.
