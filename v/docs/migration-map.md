# Repository migration map

Inventory captured from the default branch before migration (recursive Git tree): **690 tracked files**. The `/v/` rebuild must account for every content-bearing area, not only the homepage. Existing files remain untouched.

## Source inventory

| Existing path | Tracked files | New architecture destination | Migration rule |
|---|---:|---|---|
| `index.html` | 1 | `v/src/pages/HomePage` / `v/index.html` | Rebuild markup; preserve destination URLs and search behavior |
| `Home/` | 46 | `v/src/pages/home/`, `v/src/components/`, `v/assets/` | Rebuild app behavior and styles; retain relevant source media |
| `Blog/` | 23 | `v/src/pages/blog/`, `v/src/data/blog/`, `v/assets/media/blog/` | Preserve article text, drawing metadata, and media references |
| `Characters/` | 2 | `v/src/pages/characters/` | Rebuild the archive around the canonical character repository |
| `HoF/` | 5 | `v/src/pages/hall-of-fame/`, `v/src/data/achievements/` | Preserve achievement definitions and award relationships |
| `Charactermancer/` | 12 | `v/src/features/character-builder/` | Rebuild as isolated feature modules; inventory external dependencies first |
| `HeartwellWiki/` | 59 | `v/src/features/heartwell-wiki/` | Preserve articles, navigation, and wiki media; migrate as its own domain |
| `p/` | 163 | `v/src/features/campaigns/` | One campaign configuration per campaign; shared layouts and components; preserve campaign-specific content and assets |
| `res/` | 373 | `v/src/data/`, `v/src/components/`, `v/assets/media/` | Classify each file as data, shared UI, media, or legacy; do not blindly port old CSS/JS |
| `scripts/` | 3 | `v/scripts/` | Rebuild validation tools against the new contracts |
| `.github/` | 1 | `v/.github/workflows/` or root CI | Add checks without breaking existing production checks |
| Root support files | 2 | Root / deployment config | Preserve favicon and GitHub Pages behavior; do not duplicate deployment ownership |

## New architecture contracts

- `src/pages/`: page-level composition only.
- `src/features/<domain>/`: domain behavior and domain-specific components.
- `src/components/`: reusable, domain-neutral UI components.
- `src/data/`: schemas, repositories, and content records; no DOM manipulation.
- `src/services/`: pure business logic and transformations.
- `src/styles/`: tokens, global styles, layout primitives, and component styles.
- `assets/media/`: images, audio, and other static media organized by domain.
- `tests/`: unit, data-integrity, route, and browser smoke tests.
- `docs/`: architecture decisions, migration status, and contributor conventions.

## Definition of done for a migrated domain

1. All meaningful text, records, media, and internal destinations from the source domain are accounted for.
2. New markup and styles are authored from scratch; old source is used only to understand content and behavior.
3. Data has a documented shape and a single source of truth.
4. UI classes have one responsibility, small public APIs, and explicit dependencies.
5. Links, assets, accessibility, responsive behavior, and error states are checked.
6. Automated checks cover data integrity and core interactions.
7. The source domain is not removed or modified as part of the isolated rebuild.

## Migration order

1. Shared design system, site shell, routing conventions, and data contracts.
2. Home, character archive, and Hall of Fame (shared data foundations).
3. Campaign template and representative campaign; then migrate campaign-by-campaign.
4. Blog and gallery media.
5. Heartwell Wiki and Charactermancer as independent feature areas.
6. Rebuild audits and CI, run full route/asset checks, and only then plan any production cutover.

## Status

- [x] New isolated directory and first homepage slice
- [x] Copy current canonical character and achievement-related JSON datasets
- [x] Record the full tracked-file inventory and migration destinations
- [ ] Enumerate every campaign and its assets/content
- [ ] Migrate all content-bearing pages and media
- [ ] Add route, asset, data, accessibility, and browser regression checks
- [ ] Compare old and new page inventories before any cutover
