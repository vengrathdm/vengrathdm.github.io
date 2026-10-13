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

class PageParser(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = {}
        self.tabs = []
        self.panels = set()
        self.assets = []
        self.hrefs = []
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
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
    def handle_data(self, data):
        if re.search(r"</(?:section|main|div)>\s*n>", data, re.I):
            ERRORS.append(f"{self.path}: suspicious literal 'n>' after closing tag")

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
    if re.search(r"</(?:section|main|div)>\\s*n>", text, re.I):
        ERRORS.append(f"{rel}: suspicious literal 'n>' after a closing tag")
    parser = PageParser(str(rel))
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:
        ERRORS.append(f"{rel}: HTML parser error ({exc})")
        return
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
            ERRORS.append(f"{rel}: missing local {attr} asset {raw!r} (resolved to {asset.relative_to(ROOT) if asset.is_relative_to(ROOT) else asset})")

def main():
    pages = sorted(p for p in CAMPAIGNS.glob("*/index.html") if EXCLUDED not in str(p).lower())
    if not pages:
        print("No eligible campaign pages found.")
        return 2
    for page in pages:
        check_page(page)
    print(f"Checked {len(pages)} campaign pages (excluding {EXCLUDED}).")
    if ERRORS:
        print("\n".join(f"ERROR: {e}" for e in ERRORS))
        print(f"\nFound {len(ERRORS)} issue(s).")
        return 1
    print("No missing local HTML assets, broken tab targets, duplicate IDs, or suspicious malformed closing tags found.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
