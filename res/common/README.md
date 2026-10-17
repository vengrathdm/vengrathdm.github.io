# Vengrath Common Elements

Reusable UI components shared by campaign pages. Adoption is incremental: a page may import shared CSS, shared JavaScript, both, or neither. A stylesheet import alone does not initialize a component's behavior.

## Architecture

- Common elements own reusable layout, geometry, interaction, responsive behavior, and fixed visual rules.
- Campaign pages supply content and campaign-specific structure.
- Campaign theme files supply semantic visual tokens.
- Global buttons are composed into the navbar but keep their own implementations.
- Existing pages may retain legacy campaign-specific markup and styles while shared components are hardened.

## Components

- `subpage-navbar` — campaign tabs and navigation
- `subpage-hero` — campaign hero layout (the only supported hero implementation; `subpage-hero2` has been retired)
- `character-card` — character card and character-tab styling
- `audio-player` — optional ambient audio control and session continuation
- `vengrath-button` — home navigation
- `youtube-button` — external playlist link
- `chronicle` — session/recording presentation

## Integration notes

- The navbar script synchronizes each eligible campaign's `#characters` panel with `/res/characters.json`, matching the exact campaign label (including explicit path aliases where the page title differs). It preserves campaign intro/callout copy, removes legacy card grids to prevent duplicates, and renders one canonical shared card grid. Campaigns with no matching registry entries show an explicit empty state. `p/Ksiazeta-Heartwell/` remains a separate application with its own `Drużyna` page.
- The navbar script expects tab links to use `data-tab-target="#panel-id"` and corresponding panels to use `data-v-tab-panel`.
- Navbar activation should only change panels referenced by that navbar, not unrelated tab groups on the same document.
- Audio playback can be blocked by browser autoplay policy. The explicit control must remain usable, and storage failures must not break initialization.
- Asset paths should be checked against the deployed site structure before being rewritten; root-relative and campaign-relative paths may both be intentional.

Legends of Barovia was the visual source of truth for the initial extraction. Reference themes and component documentation distinguish shared behavior from campaign-specific content.

## Validation

Run `python scripts/audit_campaign_pages.py` from the repository root to inspect eligible campaign pages. Run `python scripts/audit_campaign_css.py` to inventory repeated selectors and identical declaration blocks across campaign stylesheets; review its output before extracting CSS because identical declarations may still be context-specific. The checker intentionally excludes `p/Ksiazeta-Heartwell/` and verifies the shared navbar/hero integration, rejects references to retired `subpage-hero2`, checks component asset references, duplicate IDs, in-page links, tab targets, malformed closing-tag patterns, local asset references, image alternative text, and safe `target="_blank"` links.

The `Campaign page integrity` GitHub Actions workflow runs this checker, validates Python and shared-component JavaScript syntax, and runs `scripts/browser_smoke.mjs` in Chromium at desktop and mobile widths. The browser smoke test opens every eligible campaign page, exercises every navigation tab, checks runtime errors and failed local requests, checks for horizontal overflow, and exercises any configured manual audio control. Missing local asset references and accessibility/link hygiene findings are reported as warnings so legacy issues remain visible; structural and migration omissions fail the workflow.

Static checks do not replace browser-based visual regression, keyboard navigation, screen-reader review, or playback tests under real browser autoplay policies.


## Retired components

- `subpage-hero2/` was confirmed unused and is removed from the shared component library. New pages must use `subpage-hero/`.

## Campaign layout extraction

- `campaign-layout/campaign-layout.css` owns shared `.ddc-*` page geometry and responsive layout primitives. Theme files should not redefine those layout rules; they may style borders, surfaces, color, type, and campaign-specific decorations.
- The `PerfectMigrationTemplate` imports the shared layout stylesheet as the reference integration. Other campaign migrations should be done in small batches and verified in Chromium before deleting their legacy rules.
- Do not move selectors merely because their names look similar. Keep component-specific decoration in the owning component or campaign theme, and preserve the `Ksiazeta-Heartwell` exclusion.


## Campaign theme contract

Theme stylesheets own appearance, not shared geometry. Define the semantic tokens needed by the components used on that page; do not hard-code campaign colors into shared layout rules.

- Surfaces: `--theme-base-1` through `--theme-base-5`
- Accents and text: `--theme-accent-1`, `--theme-accent-2`, `--theme-text-1`, `--theme-text-2`, `--theme-text-3`, `--theme-text-muted`, `--theme-title-accent`
- Lines and navigation: `--theme-line-1`, `--theme-line-2`, `--theme-nav-background`, `--theme-nav-text`, `--theme-nav-active-background`
- Hero seal: `--theme-seal-border`, `--theme-seal-inner-border`, `--theme-seal-background`, `--theme-seal-small-text`, `--theme-seal-main-text`
- Typography and imagery: `--theme-font-1`, `--theme-font-2`, `--theme-font-3`, `--theme-hero-image`

Tokens are required when a component references them; specialized pages may define only the subset they use. Responsive layout rules belong in `campaign-layout.css`, not in campaign theme files.
