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
