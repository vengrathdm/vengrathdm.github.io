# V — Clean rebuild

This directory is a new implementation of the Vengrath site. It is intentionally isolated from the existing site: no existing files are edited, moved, or deleted, and the current root site remains the production implementation.

## Principles

- One class per JavaScript module; one clear responsibility per class.
- Explicit dependencies: classes receive collaborators through constructors.
- Data is separate from rendering and behavior.
- No global mutable application state.
- Semantic HTML, accessible controls, responsive CSS, and progressive enhancement.
- No framework or build step in the first iteration; browser-native ES modules keep the architecture inspectable.
- Existing content is copied into `src/data/legacy/` as source data, not used as a reason to preserve old implementation patterns.

## Structure

```
v/
├── index.html
├── README.md
├── assets/
│   └── css/
│       ├── tokens.css
│       ├── base.css
│       ├── layout.css
│       └── components.css
└── src/
    ├── app/
    │   └── SiteApplication.js
    ├── components/
    │   ├── CampaignCard.js
    │   ├── CharacterCard.js
    │   ├── ContentSection.js
    │   └── SiteHeader.js
    ├── data/
    │   ├── legacy/
    │   ├── CampaignRepository.js
    │   └── CharacterRepository.js
    └── services/
        └── SearchService.js
```

## Current scope

The first slice establishes the design system, homepage shell, searchable character collection, featured destination links, and copied legacy data. The rest of the existing site will be migrated domain by domain into new components and data contracts. Legacy HTML, CSS, and JavaScript are references for behavior/content only and are not copied into this implementation.

## Local preview

Open `v/index.html` through a static HTTP server (ES modules and JSON fetches do not work reliably from `file://`). For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000/v/`.
