# Core

- `data/` holds canonical cross-page records and the site page registry.
- `graphics/` and `portraits/` hold shared media.
- `templates/` holds reusable visual and behavior components. Pages opt into the components they need; shared components do not dictate campaign layouts.
- `templates/CampaignPage/CampaignPage.js` loads the conventional campaign data bundle and applies shared theme variables. Each campaign still owns its page composition and styles.

Feature-specific logic and assets stay beside the page that owns them.
