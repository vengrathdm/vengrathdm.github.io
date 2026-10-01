# Vengrath Common Elements

Reusable UI components. Existing pages are intentionally NOT connected to this directory yet.

Architecture:
- Common Elements own layout, geometry, interaction, responsive behavior, and fixed visual rules.
- Campaign pages supply content and a campaign theme.
- Campaign theme files supply semantic visual tokens only.
- Global buttons are composed into the navbar but keep their own implementations.

Components:
- subpage-navbar
- subpage-hero
- character-card
- audio-player
- vengrath-button
- youtube-button
- chronicle

Legends of Barovia is the visual source of truth for this first extraction. The reference theme and component documentation record what is fixed and what must be supplied by a future campaign.

No existing page imports these files.