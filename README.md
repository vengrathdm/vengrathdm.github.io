# Vengrath

GitHub Pages site for Vengrath: tabletop RPG campaigns, graphic projects and web tools.

## Architecture

The repository is being migrated from page-owned data toward a layered architecture:

- `data/` — central registries and campaign records.
- `core/` — shared runtime helpers, data loaders, stable-ID resolvers and transitional bridges.
- `subpages/` — campaign/project presentation layers and intentionally unique mini-sites.
- `Home/` — homepage presentation and legacy card sources.
- `.github/workflows/` — generated manifests and data validation.

The target dependency direction is:

`DATA → IDENTIFIERS → RESOLVERS → COMPONENTS → CAMPAIGN LAYOUT → THEME / ART DIRECTION`

A campaign is not required to use a single renderer. Unique campaign layouts remain valid; the central data layer exists to prevent identity, portrait, player and asset data from being duplicated inside presentation code.

## Central data

Current registries:

- `data/campaigns.json` — campaign identity registry.
- `data/characters.json` — stable character IDs, players, campaigns, fate and portraits.
- `data/players.json` — stable player IDs.
- `data/assets.json` — stable asset IDs and canonical asset paths.
- `data/campaigns/*.json` — detailed campaign records used by data-driven or transitional campaign layouts.
- `data/worlds.json` — world/wiki registry, currently including Książęta Heartwell.
- `data/modules.json` — standalone application/tool registry, currently including Charactermancer.
- `data/home-cards.json` — centralized homepage card records.

Stable IDs are preferred over display names. Names and `alt` text are presentation metadata, not primary identity.

## Campaign pages

Campaign pages deliberately retain their visual individuality.

There are two supported patterns:

1. Data-driven pages using shared renderers such as `core/campaign-renderer.js`.
2. Custom campaign pages whose existing HTML/CSS/JS/audio remain intact while identity and reusable data are moved into `data/`.

The custom pattern is used for visually distinctive mini-sites such as Legends of Barovia, Shards of the Past, Książęta Heartwell and other legacy campaigns.

`core/data.js` and `core/resolver.js` provide shared registry access and stable-ID lookup. `core/character-assets.js` is a transitional portrait bridge; explicit `data-character-id` attributes are authoritative. Explicit `data-character-id` attributes are authoritative. Name/alt matching remains only as a compatibility fallback while legacy pages are migrated.

## Homepage

`Home/Code/app.js` renders the homepage's interactive shard/Voronoi board.

The homepage now loads `data/home-cards.json` first. `Home/Cards/index.json` remains a generated compatibility manifest, and `Home/Cards/*.txt` remains the editable legacy source while the migration is completed.

The `.txt` card format is:

1. Title
2. Tag/category
3. Graphic path or URL
4. Destination link

The fallback chain is intentionally retained so the homepage remains usable during migration.

## Heartwell

Książęta Heartwell is treated as a world/wiki application rather than a generic campaign page.

- Presentation remains in `subpages/Ksiazeta-Heartwell/`.
- The wiki dynamically indexes its article files.
- `data/worlds.json` registers the world and its entrypoints.
- Existing wiki/article structure is preserved instead of being flattened into campaign templates.

## Charactermancer

Charactermancer is treated as a standalone tool.

Its application code remains modular:

- `data.js` / `racial-choices.js` — tool data.
- `rules.js` — rules logic.
- `state.js` — application state.
- `events.js` — interaction wiring.
- `render.js` — presentation.
- `app.js` — application orchestration.

`data/modules.json` registers the tool without forcing its internal rules model into the campaign data model.

## Assets and URLs

Physical asset relocation is intentionally deferred until references are mapped. Existing filenames and directories therefore remain valid during the migration.

Before any mass move/rename:

1. create an old → new URL/asset map;
2. migrate references;
3. validate local assets and internal links;
4. preserve compatibility paths where practical.

Do not rename large groups of images or campaign directories without completing those steps.

## Validation

`.github/workflows/validate-data.yml` validates:

- duplicate campaign, character, player, asset, world, module and homepage-card IDs;
- character → player, campaign and portrait relations;
- local asset paths;
- character references in detailed campaign records;
- campaign audio files;
- explicit `data-character-id` references in HTML.

`.github/workflows/generate-card-manifest.yml` continues to generate the legacy homepage and gallery manifests.

## Migration status

The migration is incremental. Existing visual layouts are preserved while data ownership moves toward the central registries.

Current major completed layers include:

- Sala Chwały central data migration;
- data-driven migration of Rime of the Frostmaiden, The Sunless Citadel, Heroes of Baldur's Gate and Samotnie Przeciw Jedności;
- central data extraction for multiple legacy campaigns;
- stable character/portrait resolution for migrated legacy pages;
- central homepage card registry;
- world/tool registries for Heartwell and Charactermancer;
- repository-level data validation.

The campaign registry currently covers 43 campaign entries: 35 with detailed records, 6 historical/no-page entries, 1 archived legacy entry and 1 world entry. Canonical `/campaigns/<slug>/` compatibility routes now point at the existing presentation paths. Remaining work is asset consolidation, explicit ID cleanup where source pages contain incomplete rosters, URL/asset QA, and final end-to-end validation.


## Portrait assets

All character portraits are stored in `/res/portraits/` and named by stable character ID.
