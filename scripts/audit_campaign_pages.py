#!/usr/bin/env python3
"""Static integrity checks for campaign pages; intentionally excludes Ksiazeta-Heartwell."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CAMPAIGNS = ROOT / "p"
EXCLUDED = "ksiazeta-heartwell"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
ERRORS = []
WARNINGS = []

SHARED_LAYOUT_SELECTORS = (
    ".ddc-content", ".ddc-tab-panel[hidden]", ".ddc-intro-grid",
    ".ddc-party-portrait", ".ddc-party-copy", ".ddc-party-image",
    ".ddc-party-image img", ".ddc-section", ".ddc-character-grid",
    ".ddc-section-head", ".ddc-section-head>div",
    ".ddc-chronicle-panel .ddc-section",
    ".ddc-chronicle-panel .ddc-section+.ddc-section",
)

class PageParser(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = {}
        self.tabs = []
        self.panels = set()
        self.assets = []
        self.hrefs = []
        self.images_missing_alt = []
        self.external_targets_missing_rel = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        ident = a.get("id")
        if ident:
            if ident in self.ids:
                ERRORS.append(f"{self.path}: duplicate id={ident!r}")
            self.ids[ident] = True
        if "data-tab-target" in a:
            self.tabs.append((tag, a["data-tab-target"]))
        if "data-v-tab-panel" in a and ident:
            self.panels.add(ident)
        for key in ("src", "href", "poster"):
            value = a.get(key, "")
            if value:
                self.assets.append((tag, key, value))
        if tag == "a" and a.get("href", "").startswith("#"):
            self.hrefs.append(a["href"][1:])
        if tag == "img" and "alt" not in a:
            self.images_missing_alt.append(a.get("src", "(unknown source)"))
        if tag == "a" and a.get("target", "").lower() == "_blank":
            rel = {token.lower() for token in a.get("rel", "").split()}
            if "noopener" not in rel and "noreferrer" not in rel:
                self.external_targets_missing_rel.append(a.get("href", "(missing href)"))
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
def resolve_local(page, raw):
    parts = urlsplit(raw.strip())
    if parts.scheme or parts.netloc or not parts.path:
        return None
    decoded = unquote(parts.path)
    if decoded.startswith("/"):
        return ROOT / decoded.lstrip("/")
    return (page.parent / decoded).resolve()

def check_page(page):
    try:
        text = page.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        ERRORS.append(f"{page.relative_to(ROOT)}: cannot read HTML ({exc})")
        return
    rel = page.relative_to(ROOT)
    has_navbar = 'class="v-subpage-navbar' in text and "data-tab-target" in text
    if not has_navbar:
        ERRORS.append(f"{rel}: eligible campaign page is missing the shared tab navbar")
    if 'class="v-subpage-hero' not in text:
        ERRORS.append(f"{rel}: eligible campaign page is missing the shared hero component")
    if has_navbar:
        required_shared_assets = (
            "subpage-navbar.css",
            "subpage-navbar.js",
            "subpage-hero.css",
            "character-card.css",
            "chronicle.css",
        )
        for asset_name in required_shared_assets:
            if asset_name not in text:
                ERRORS.append(f"{rel}: migrated campaign is missing shared asset {asset_name}")
    if "data-v-audio-player" in text and "audio-player.css" not in text:
        ERRORS.append(f"{rel}: audio player markup is missing audio-player.css")
    if "data-v-audio-player" in text and "audio-player.js" not in text:
        ERRORS.append(f"{rel}: audio player markup is missing audio-player.js")
    if "data-v-youtube-button" in text and "youtube-button.js" not in text:
        ERRORS.append(f"{rel}: YouTube button markup is missing youtube-button.js")
    if "data-vengrath-button" in text and "vengrath-button.js" not in text:
        ERRORS.append(f"{rel}: Vengrath button markup is missing vengrath-button.js")
    if re.search(r"</(?:section|main|div)>\s*n>", text, re.I):
        ERRORS.append(f"{rel}: suspicious literal 'n>' after a closing tag")
    parser = PageParser(str(rel))
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:
        ERRORS.append(f"{rel}: HTML parser error ({exc})")
        return
    for src in parser.images_missing_alt:
        WARNINGS.append(f"{rel}: image missing alt text: {src}")
    for href in parser.external_targets_missing_rel:
        WARNINGS.append(f"{rel}: target=_blank link missing rel=noopener/noreferrer: {href}")
    for target in parser.hrefs:
        if target and target not in parser.ids:
            ERRORS.append(f"{rel}: fragment link #{target} has no matching id")
    for tag, target in parser.tabs:
        panel = target.lstrip("#")
        if panel and panel not in parser.ids:
            ERRORS.append(f"{rel}: tab target {target!r} has no matching element")
        elif panel and panel not in parser.panels:
            ERRORS.append(f"{rel}: tab target {target!r} exists but is not marked data-v-tab-panel")
    for tag, attr, raw in parser.assets:
        if raw.startswith("#") or raw.startswith("data:"):
            continue
        asset = resolve_local(page, raw)
        if asset is not None and not asset.exists():
            WARNINGS.append(f"{rel}: missing local {attr} asset {raw!r} (resolved to {asset.relative_to(ROOT) if asset.is_relative_to(ROOT) else asset})")

def audit_shared_layout_css():
    """Report layout primitives that are still duplicated in campaign-owned stylesheets."""
    checked = 0
    for stylesheet in sorted(CAMPAIGNS.glob("*/*.css")):
        if EXCLUDED in str(stylesheet).lower():
            continue
        try:
            text = stylesheet.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            WARNINGS.append(f"{stylesheet.relative_to(ROOT)}: cannot inspect CSS ({exc})")
            continue
        rel = stylesheet.relative_to(ROOT)
        if "campaign-layout.css" in text:
            continue
        matches = [selector for selector in SHARED_LAYOUT_SELECTORS
                   if re.search(re.escape(selector) + r"\\s*\\{", text)]
        if matches:
            checked += len(matches)
            WARNINGS.append(
                f"{rel}: shared layout selectors still defined locally: {', '.join(matches)}"
            )
    return checked

def main():
    pages = sorted(p for p in CAMPAIGNS.glob("*/index.html") if EXCLUDED not in str(p).lower())
    if not pages:
        print("No eligible campaign pages found.")
        return 2
    for page in pages:
        check_page(page)
    duplicated_layout_rules = audit_shared_layout_css()
    print(f"Checked {len(pages)} campaign pages (excluding {EXCLUDED}).")
    print(f"Shared layout selector definitions still found in campaign CSS: {duplicated_layout_rules}.")
    if WARNINGS:
        for warning in WARNINGS:
            print(f"WARNING: {warning}")
        print(f"Found {len(WARNINGS)} missing local asset reference(s); these remain visible as warnings for remediation.")
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        print(f"Found {len(ERRORS)} structural issue(s).")
        return 1
    print("No duplicate IDs, broken tab targets, or suspicious malformed closing tags found.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
