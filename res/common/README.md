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
- `subpage-hero` — campaign hero layout
- `character-card` — character card and character-tab styling
- `audio-player` — optional ambient audio control and session continuation
- `vengrath-button` — home navigation
- `youtube-button` — external playlist link
- `chronicle` — session/recording presentation

## Integration notes

- The navbar script expects tab links to use `data-tab-target="#panel-id"` and corresponding panels to use `data-v-tab-panel`.
- Navbar activation should only change panels referenced by that navbar, not unrelated tab groups on the same document.
- Audio playback can be blocked by browser autoplay policy. The explicit control must remain usable, and storage failures must not break initialization.
- Asset paths should be checked against the deployed site structure before being rewritten; root-relative and campaign-relative paths may both be intentional.

Legends of Barovia was the visual source of truth for the initial extraction. Reference themes and component documentation distinguish shared behavior from campaign-specific content.

## Validation

Run `python scripts/audit_campaign_pages.py` from the repository root to inspect eligible campaign pages. The checker intentionally excludes `p/Ksiazeta-Heartwell/` and verifies the shared navbar/hero integration, component asset references, duplicate IDs, in-page links, tab targets, malformed closing-tag patterns, local asset references, image alternative text, and safe `target="_blank"` links.

The `Campaign page integrity` GitHub Actions workflow runs this checker, validates Python and shared-component JavaScript syntax, and runs `scripts/browser_smoke.mjs` in Chromium at desktop and mobile widths. The browser smoke test opens every eligible campaign page, exercises every navigation tab, checks runtime errors and failed local requests, checks for horizontal overflow, and exercises any configured manual audio control. Missing local asset references and accessibility/link hygiene findings are reported as warnings so legacy issues remain visible; structural and migration omissions fail the workflow.

Static checks do not replace browser-based visual regression, keyboard navigation, screen-reader review, or playback tests under real browser autoplay policies.
