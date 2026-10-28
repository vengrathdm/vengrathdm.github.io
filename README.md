# Vengrath

Vengrath is a static website hosted on GitHub Pages at the repository root. The root `index.html` redirects to `/home/`. Public site URLs are rooted at the domain, with campaigns under `/page/<slug>/`.

## Repository map

```text
.
├── index.html                 # Redirect to the Vengrath home page
├── .nojekyll                  # Serve the repository as static files without Jekyll processing
├── home/                      # Landing page and discovery board
├── core/
│   ├── data/                  # Page registry, character data, achievements
│   ├── graphics/              # Shared graphics, favicon, and card art
│   ├── portraits/             # Canonical character portraits
│   └── templates/             # Reusable interface and behavior components
└── page/
    └── <slug>/                # Page implementation, content, styles, and local assets
```

Page folders live under `page/<slug>/`, which maps directly to the public route `/page/<slug>/`. Keep local assets and feature-specific code with the page that owns them.

## GitHub Pages behavior

- This is a plain static site; it does not need a build command or server-side routing.
- `.nojekyll` disables GitHub Pages' default Jekyll processing.
- Use root-relative `/core/...`, `/home/`, and `/page/...` URLs for stable links. Use paths relative to the page for page-local assets where appropriate.
- The repository is a GitHub Pages user site served at the domain root, so these routes resolve from `https://vengrathdm.github.io/`.

## Page registry and home page

[`core/data/site-pages.json`](core/data/site-pages.json) is the ordered source for home-page cards and page classification. Each record includes:

- `id` and `title` for identifying and displaying the page.
- `type` to group campaigns, archives, wikis, and tools.
- `category` for home-page filters.
- `visibility` to control discovery. Hidden entries remain searchable by title.
- `url` for the stable public route.
- `image` for the card artwork.
- `layout` to identify bespoke designs or pages using the common campaign shell.
- `manifest`, when the page has a campaign manifest.

The landing page loads this registry through `core/templates/VoronoiShatter/`. The board supports filtering, search, dragging, and horizontal wraparound. Add or update a page in the registry rather than maintaining a separate card list. Keep each `url` and `image` pointed at an existing file or directory route.

## Page types and campaign conventions

Campaign pages own their visual design and implementation. They can use shared components for navigation, heroes, character galleries, chronicles, and audio without adopting a common layout. Pages marked `bespoke`—including Rise of the Drow and Książęta Heartwell—retain their individual experiences.

Many campaigns use the common data files:

- `manifest.json` for page identity, sections, external links, and optional audio.
- `theme.json` for colors, typography, and imagery.
- `content.json` for campaign-specific text, characters, and chronicle entries.

This convention is optional for tools, archives, wikis, and bespoke campaigns. `core/templates/CampaignPage/CampaignPage.js` loads the three files together and applies shared theme variables; the page continues to control its own composition and styles.

## Adding a campaign page

Use this sequence when adding a campaign to the site. Keep the established public route and shared data conventions, but make the layout fit the campaign. Do not force a bespoke campaign into the common visual design.

### 1. Choose the route and create the page folder

Choose a unique lowercase kebab-case slug, such as `my-new-campaign`, then create:

```text
page/my-new-campaign/
├── index.html
├── app.js
├── styles.css
├── manifest.json
├── theme.json
├── content.json
├── sections/                 # Optional: section-specific JS and CSS
└── res/
    ├── graphics/             # Page-specific images
    └── audio/                # Page-specific audio
```

Only add files the page needs. Keep page-owned styles, scripts, and assets in this folder. The public route is `/page/my-new-campaign/`; GitHub Pages serves `index.html` at that route. Do not use uppercase, spaces, or Polish characters in the slug or filenames.

### 2. Build a readable HTML entry page

`index.html` should include a doctype, `<html lang="pl">`, UTF-8 charset, viewport metadata, descriptive title and description, and a page-specific theme color. Link the page's styles and any shared component styles it uses. Load its behavior with a module script, for example:

```html
<script type="module" src="./app.js"></script>
```

Use semantic `header`, `nav`, `main`, `section`, and `footer` elements, one clear `h1`, and descriptive headings. Include a link back to `/home/`. Give images meaningful `alt` text unless they are decorative; label controls and provide accessible names for icon-only buttons.

If the page uses `SubpageNavbar`, each navigation `sectionLink` must match a section `id`, and each switchable section must have the matching `data-page-section` value. The navbar hides all other such sections when a button is selected. Include an initial visible section and meaningful labels. Bespoke pages can implement their own navigation behavior.

For the standard campaign structure, keep exactly these primary sections in this order: **Kampania**, **Postaci**, and **Kronika**. Put the campaign overview, setting, locations, factions, and non-player characters in Kampania. Postaci is for player characters only; do not use it as an NPC gallery. Kronika contains the session records, with optional recordings and notes that open when a record is expanded. A campaign can present these sections as a scrollable page or as switchable panels. Preserve deliberate bespoke exceptions such as Rise of the Drow and Książęta Heartwell.

### 3. Add campaign data and theme configuration

For the common campaign-data pattern, add these three JSON files:

- `manifest.json`: campaign `id`, `title`, `language`, `campaign`, optional `module`, public `entry`, relative `theme` and `content` paths, and the list of section IDs. Add `playlistUrl` only when one exists. Add optional `audio` with a page-relative `src` and a unique `continuationKey`.
- `theme.json`: campaign colors, `typography` (`heading`, `body`, and optional `serif`), optional `fontsUrl`, `heroImage`, and optional `audioColor`. Use the same color keys expected by the page's CSS and scripts.
- `content.json`: the campaign-specific copy and records consumed by the page. A common shape has `campaign`, `characters`, and `chronicle` sections, but match the data to the design and renderer you actually use.

Load the files together with [`CampaignPage.js`](core/templates/CampaignPage/CampaignPage.js): `loadCampaignBundle()` returns `{ manifest, theme, content }`, and `applyCampaignTheme(theme)` sets the shared theme variables. This helper does not render a page shell or prescribe its layout. Pages with a different data model can load their own data and keep a bespoke implementation.

For a character gallery, store canonical character IDs in the content and use [`characters.json`](core/data/characters.json) for the source of truth. For a chronicle, provide the session values the renderer consumes, such as session number, title, description or notes, and optional recording URLs. Keep campaign-specific copy in `content.json` rather than embedding large data records in `app.js` or HTML.

Campaign font styles are page-owned: load every font used by the page and its shared components. In particular, the common Vengrath home button and navbar buttons use **Voltaire**, so include that font in the page's font stylesheet.

### 4. Opt into shared components where useful

Import JavaScript modules with their root-relative `/...` paths. Add the matching CSS `<link>` elements to `index.html`; importing a component does not automatically load its stylesheet.

| Element | JavaScript address | Stylesheet address | Purpose |
| --- | --- | --- | --- |
| Home button | [`HomeButton.js`](core/templates/HomeButton/HomeButton.js) | [`HomeButton.css`](core/templates/HomeButton/HomeButton.css) | Link back to the site home |
| Hero | [`SubpageHero.js`](core/templates/SubpageHero/SubpageHero.js) | [`SubpageHero.css`](core/templates/SubpageHero/SubpageHero.css) | Reusable campaign title and image area |
| Section navigation | [`SubpageNavbar.js`](core/templates/SubpageNavbar/SubpageNavbar.js) | [`SubpageNavbar.css`](core/templates/SubpageNavbar/SubpageNavbar.css) and [`NavbarButton.css`](core/templates/SubpageNavbar/NavbarButton/NavbarButton.css) | Home/playlist controls and section switching |
| Character gallery | [`CharacterGallery.js`](core/templates/CharacterGallery/CharacterGallery.js) | [`CharacterGallery.css`](core/templates/CharacterGallery/CharacterGallery.css) | Render canonical characters by ID |
| Character cards | [`CharacterCard.js`](core/templates/CharacterCard/CharacterCard.js) | [`CharacterCard.css`](core/templates/CharacterCard/CharacterCard.css) and optional [`Achievements.css`](core/templates/CharacterCard/Achievements/Achievements.css) | Render one canonical character and awards |
| Chronicle record | [`ChronicleRecord.js`](core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js) | [`ChronicleRecord.css`](core/templates/Chronicle/ChronicleRecord/ChronicleRecord.css) and optional [`PlayRecordingButton.css`](core/templates/Chronicle/PlayRecordingButton/PlayRecordingButton.css) | Expand session details and link recordings |
| Background audio | [`AudioPlayer.js`](core/templates/AudioPlayer/AudioPlayer.js) and [`AudioPlayerButton.js`](core/templates/AudioPlayerButton/AudioPlayerButton.js) | [`AudioPlayerButton.css`](core/templates/AudioPlayerButton/AudioPlayerButton.css) | Optional looping audio with saved position and volume |
| Playlist link | [`YouTubePlaylistButton.js`](core/templates/YouTubePlaylistButton/YouTubePlaylistButton.js) | [`YouTubePlaylistButton.css`](core/templates/YouTubePlaylistButton/YouTubePlaylistButton.css) | Optional external playlist control |

Use a distinct audio `continuationKey` for every campaign. Audio playback can be blocked until a visitor interacts with the page. Components are optional: preserve the campaign's own visual identity and only share behaviors that are useful across pages.

### 5. Keep assets and links GitHub Pages-safe

- Store new page-owned images and audio in `page/<slug>/res/graphics/` and `page/<slug>/res/audio/` respectively.
- Reference shared assets with root-relative paths such as `/core/graphics/voronoi/<image>.webp` or `/core/portraits/<portrait>.webp`.
- Reference page-local assets either relative to the page (`./res/graphics/hero.webp`) or with their full root path (`/page/<slug>/res/graphics/hero.webp`).
- Match filename capitalization exactly. GitHub Pages serves on a case-sensitive filesystem.
- Use `/page/<slug>/` for links to the campaign. Do not use `/p/`, `/Home/`, `/res/`, machine-specific paths, or links that only work from a local file preview.
- Confirm every local `href`, `src`, CSS `url(...)`, JSON image path, manifest path, and registry URL points to a file or page that exists in the repository.

### 6. Register the campaign on the home page

Add one record to [`site-pages.json`](core/data/site-pages.json), in the intended display order. Follow the existing record shape:

```json
{
  "id": "my-new-campaign",
  "title": "My New Campaign",
  "type": "campaign",
  "category": "Aktywna Kampania",
  "visibility": "public",
  "url": "/page/my-new-campaign/",
  "image": "/core/graphics/voronoi/my-new-campaign.webp",
  "layout": "campaign-shell",
  "manifest": "/page/my-new-campaign/manifest.json"
}
```

Use a real existing image path. The current categories are `Aktywna Kampania`, `Zamknięta Kampania`, `Archiwum`, and `Narzędzie`; hidden entries use `visibility: "hidden"`. Set `layout` to `campaign-shell` when the page follows the common campaign presentation, `bespoke` for a deliberately distinctive experience, or `page-specific` for other page types. Keep the registry's `id`, `url`, `manifest`, and folder slug consistent.

### 7. Format and review before publishing

All new HTML, CSS, JavaScript, and JSON must be human-readable, as if passed through an HTML/CSS/JS beautifier: use consistent two-space indentation, line breaks, and clear grouping. Do not add minified or single-line page files, even when an existing file is minified. Keep functions and styles organized by purpose, use descriptive names, and avoid deeply compressed expressions.

Before publishing, confirm the page opens at `/page/<slug>/`, the home card points to it, all referenced files exist with matching capitalization, navigation sections work, media controls handle browser autoplay restrictions, and the page remains usable on narrow screens. Update this root README whenever adding the page changes shared conventions, directory structure, reusable components, registry fields, or GitHub Pages/deployment instructions. Page-specific content alone does not require a README change.

## Shared data

- `core/data/characters.json` contains canonical character records and portrait paths. Character awards are stored as unique `achievementIds` arrays on each record.
- `core/data/achievements.json` contains achievement definitions.
- `core/data/site-pages.json` contains the ordered page registry used by the home page.

Keep character and achievement facts in these canonical files so pages that share the data stay consistent.

## Shared components and media

Reusable components live in `core/templates/`. Each component owns its styling and feature-specific behavior. Introduce shared utilities for behavior that is genuinely used across features; page-specific logic belongs beside its page.

- `SubpageHero`, `SubpageNavbar`, and `HomeButton` provide optional campaign navigation and hero elements.
- `CharacterGallery`, `CharacterCard`, and `Chronicle` render shared campaign records.
- `AudioPlayer` owns a single audio element and stores playback position and volume state. Give each campaign a distinct storage key. Browser autoplay restrictions are respected. `AudioPlayerButton` and `YouTubePlaylistButton` provide optional controls.
- `CampaignPage` loads the common campaign data bundle and theme variables.
- `VoronoiShatter` renders the searchable home discovery board from the page registry.

Shared graphics live in `core/graphics/`, with favicon assets in `favicon/` and home-card artwork in `voronoi/`. Canonical portraits live in `core/portraits/`; character records refer to them using `/core/portraits/<filename>` paths.

## Hall of Fame

The Hall of Fame and achievement catalogue are under `page/hof/`. They read canonical character and achievement data from `core/data/`; awards are associated with characters through `achievementIds`.

## Maintenance notes

- Keep page titles, categories, visibility, card artwork, and public destinations in the page registry.
- Preserve `/page/<slug>/` routes and update references whenever a page-local file is renamed or moved.
- Preserve intentional page-specific layouts. Shared data and components are opt-in and do not require visual uniformity.
- Check local `href`, `src`, CSS `url(...)`, manifest, and JSON asset paths against the repository before publishing.
