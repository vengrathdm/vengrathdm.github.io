# Canonical data

- `site-pages.json` is the ordered page registry used by the home page. `type` groups pages, `category` drives filters, `visibility` controls discovery, `url` is the stable GitHub Pages route, and `layout` documents whether a page uses a bespoke design.
- `characters.json` stores canonical character records. Awards are unique `achievementIds` arrays on each record.
- `achievements.json` stores achievement definitions.

Keep page URLs rooted at `/v/` because the repository is deployed as a user site at the GitHub Pages domain root. Page directories stay under `page/` to preserve their public routes and locally scoped resources.
