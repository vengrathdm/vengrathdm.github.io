# Vengrath site

This is a static GitHub Pages site served from the repository root. All current public site routes use the permanent `/v/` prefix. Root `index.html` redirects to `/v/home/`.

## Source organization

- `home/` contains the landing page and its behavior.
- `core/data/` contains canonical data, including the page registry, characters, and achievements.
- `core/graphics/` and `core/portraits/` contain shared media.
- `core/templates/` contains reusable UI and behavior. Campaigns may use these pieces without adopting a shared visual design.
- `page/` contains public page directories. Each directory keeps its own assets, styles, and implementation so bespoke experiences remain self-contained.

## Page types and URLs

`core/data/site-pages.json` is the source of truth for landing-page cards and page classification. Its `type` field groups pages as campaigns, archive, wiki, or tools; `layout` marks deliberately bespoke pages. The registry's `url` values are public routes and must stay valid on GitHub Pages. Preserve these routes when reorganizing source files, and use root-relative `/v/...` paths for site assets.

GitHub Pages is configured as a plain static site. `.nojekyll` keeps GitHub's default Jekyll processing from omitting static files or directories. No build step or server-side routing is required.
