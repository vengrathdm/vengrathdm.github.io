# Subpages

This directory contains the existing presentation layer for campaigns, worlds and legacy pages.

## Campaign pages

Campaign presentation files remain here during the migration so existing URLs keep working. Each migrated campaign also has a canonical compatibility route under:

`/campaigns/<slug>/`

The mapping between canonical and legacy paths is stored in `/data/migration-map.json`.

Do not move or rename campaign directories without updating that map and running the repository validation workflow.

## Shared runtime

Campaign pages may use the shared runtime under `/core/`, including:

- `core/data.js` — central JSON data loading and caching;
- `core/resolver.js` — stable-ID record resolution;
- `core/character-assets.js` — transitional portrait resolution for legacy markup;
- `core/campaign-renderer.js` — data-driven campaign presentation for compatible layouts.

Unique campaign layouts should remain unique. Do not force a custom campaign or world/wiki into the generic campaign renderer merely to reduce file count.

## Worlds and tools

World-specific applications such as Heartwell and standalone tools such as Charactermancer retain their own internal presentation and logic. Their registrations live in `/data/worlds.json` and `/data/modules.json`.

## Assets

Existing asset directories are preserved until references have been mapped. Central asset ownership is recorded in `/data/assets.json`.

Before relocating assets:

1. update the central asset record;
2. update all references;
3. preserve compatibility paths where practical;
4. run `.github/workflows/validate-data.yml`.

This directory is therefore a presentation/compatibility layer, not the source of truth for campaign identity or character relationships.
