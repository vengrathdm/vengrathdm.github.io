# Pages

Each directory is a GitHub Pages route under `/v/page/<slug>/`. The page registry in `../core/data/site-pages.json` classifies each page without imposing a shared layout. Campaigns may use the shared hero, navigation, character, chronicle, and media components in `../core/templates/`; they may also keep a fully bespoke experience. Keep each page's local assets and styling beside the page.

The common campaign data convention is `manifest.json`, `theme.json`, and `content.json`. It is a reusable convention rather than a requirement for tools, archives, wikis, or deliberately bespoke campaigns.
