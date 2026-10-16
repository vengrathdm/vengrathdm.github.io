#!/usr/bin/env python3
"""Inventory repeated CSS selector blocks across campaign stylesheets.

This is a report, not an auto-fixer: selector names and declarations can look alike
while carrying campaign-specific art direction or responsive behavior.
"""
from collections import defaultdict
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CAMPAIGNS = ROOT / "p"
EXCLUDED = "ksiazeta-heartwell"
RULE = re.compile(r"([^{}]+)\{([^{}]*)\}", re.S)


def normalize(value):
    return re.sub(r"\s+", " ", value).strip()


def main():
    selector_files = defaultdict(set)
    declaration_files = defaultdict(set)
    files = sorted(CAMPAIGNS.glob("*/*.css"))
    for path in files:
        if EXCLUDED in str(path).lower():
            continue
        try:
            css = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            print(f"WARNING: {path.relative_to(ROOT)}: {exc}")
            continue
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        for selector_text, body in RULE.findall(css):
            selectors = [normalize(s) for s in selector_text.split(",")]
            declarations = normalize(body)
            if not declarations:
                continue
            rel = str(path.relative_to(ROOT))
            for selector in selectors:
                if selector and not selector.startswith("@"):
                    selector_files[selector].add(rel)
            # Fingerprint declarations independent of selector; keep output useful,
            # but avoid reporting tiny one-property rules that are often incidental.
            props = [normalize(d) for d in declarations.split(";") if ":" in d]
            if len(props) >= 3:
                fingerprint = "; ".join(sorted(props))
                declaration_files[fingerprint].add((rel, ", ".join(selectors)))
    repeated_selectors = [(s, paths) for s, paths in selector_files.items() if len(paths) > 1]
    repeated_blocks = [(block, entries) for block, entries in declaration_files.items() if len({p for p, _ in entries}) > 1]
    print(f"Scanned {len(files)} campaign stylesheets (excluding {EXCLUDED}).")
    print("\nRepeated selectors across files:")
    if not repeated_selectors:
        print("  None found.")
    for selector, paths in sorted(repeated_selectors, key=lambda item: (-len(item[1]), item[0])):
        print(f"  {selector} [{len(paths)} files]")
        for path in sorted(paths):
            print(f"    - {path}")
    print("\nIdentical declaration blocks across different files (3+ declarations):")
    if not repeated_blocks:
        print("  None found.")
    for block, entries in sorted(repeated_blocks, key=lambda item: (-len({p for p, _ in item[1]}), item[0])):
        paths = sorted({p for p, _ in entries})
        print(f"  [{len(paths)} files] {block}")
        for path, selectors in sorted(entries):
            print(f"    - {path}: {selectors}")
    print(f"\nSummary: {len(repeated_selectors)} repeated selectors; {len(repeated_blocks)} repeated declaration fingerprints.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
