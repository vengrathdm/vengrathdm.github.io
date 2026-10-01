# Subpage Navbar

The navbar is a composition:
- VENGRATH Button
- optional campaign tab links
- optional YouTube Button

VENGRATH and YouTube are independent components.

Campaign tab links are visual navigation controls, not ordinary scrolling anchors when they use `data-tab-target`.

## Tab mode

A tab link provides:
- label
- tab target
- active state is controlled by the component

A target panel uses:
`data-v-tab-panel`
and an id matching the tab target.

The component hides all tab panels except the active one. It updates active styling without scrolling the document.

## Fixed

- navbar position
- inner width
- global-button placement
- campaign-link height and typography
- responsive behavior

## Theme
- `--theme-font-1`
- `--theme-nav-background`
- `--theme-nav-text`
- `--theme-line-2`
- `--theme-accent-2`
- `--theme-nav-active-background`

The campaign links are deliberately shorter than the VENGRATH and YouTube buttons.
