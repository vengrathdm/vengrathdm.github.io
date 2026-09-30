# Vengrath

GitHub Pages site for Vengrath: tabletop RPG campaigns, graphic projects and web tools.

## Architecture

- `index.html` — homepage shell, metadata, filters and search controls.
- `Home/Code/app.js` — homepage application logic.
- `Home/Code/styles.css` — homepage layout and visual styling.
- `Home/Graphics/` — images used by cards and pages.
- `Home/Cards/*.txt` — card source files.
- `Home/Cards/index.json` — generated card manifest consumed by the homepage.
- `subpages/` — campaign and project pages.
- `subpages/campaign-common.css` — shared campaign-page layout, navigation, typography, themes and reusable buttons.
- `subpages/moje-prace-graficzne/` — `Moje Rysunki 2026` gallery and its `Pictures/` image collection.
- `.github/workflows/generate-card-manifest.yml` — generates the card and gallery manifests.

## Homepage

The homepage is a client-side JavaScript application. Cards are loaded primarily from `Home/Cards/index.json`; if the manifest is missing or incomplete, `app.js` falls back to the GitHub Contents API.

Cards are filtered by category and search text. The visible cards are placed into a Voronoi-style layout. Polygon vertices are processed to create the irregular shard appearance, and point placement uses `Math.random()` so the arrangement changes when the board is rebuilt. The board supports horizontal dragging with momentum, responsive rebuilding, hover/focus states and direct navigation through each card's link.

Each card source file uses exactly four data lines:

1. Title
2. Tag/category
3. Graphic path or URL
4. Destination link

Example:

```text
Campaign Name
Aktywna Kampania
../Graphics/campaign.jpg
../../subpages/campaign-name/
```

## Campaign pages

Campaign pages keep content in their individual `index.html` files and share presentation through `subpages/campaign-common.css`.

The shared stylesheet provides:

- hero section and campaign artwork
- typography and responsive layout
- campaign navigation
- VENGRATH home button
- YouTube playlist button
- PDF button
- panels, player cards, statistics and footer
- per-campaign visual themes through `data-campaign-theme`

Reusable action buttons are styled centrally. Individual campaign pages only provide their destination URL. A missing YouTube or PDF link is represented by omitting that button from the page.

## Graphic gallery

`subpages/moje-prace-graficzne/index.html` is the `Moje Rysunki 2026` gallery. Images are stored in:

`subpages/moje-prace-graficzne/Pictures/`

`Pictures/index.json` contains the image filenames. The gallery loads the manifest, creates a Voronoi-style SVG layout, clips each image to its polygon and opens the selected image in a full-screen viewer.

## Automation

`.github/workflows/generate-card-manifest.yml` runs on changes to:

- `Home/Cards/**`
- `subpages/moje-prace-graficzne/Pictures/**`
- the workflow itself

It validates card TXT files, regenerates `Home/Cards/index.json`, regenerates `Pictures/index.json`, and commits changed manifests back to `main`.

## Conventions

- Keep campaign content in the individual campaign HTML file.
- Put shared campaign styling in `campaign-common.css`.
- Add homepage cards through a four-line TXT file; do not manually maintain the generated manifest unless the GitHub Action is unavailable.
- Keep image and destination paths relative to the file that uses them unless an external URL is intentional.
- Preserve existing HTML/JS behavior when making visual or readability-only changes.
