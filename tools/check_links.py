#!/usr/bin/env python3
"""Fail if any local href/src in the site's HTML points at a missing file or a missing #anchor.

Run from the repository root: python3 tools/check_links.py
External links (http/https) are listed but not fetched, so the check works offline.
"""
import pathlib
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = pathlib.Path(__file__).resolve().parent.parent


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        for key in ("href", "src", "poster"):
            if a.get(key):
                self.links.append(a[key])


def parse(path):
    c = Collector()
    c.feed(path.read_text(encoding="utf-8"))
    return c


def main():
    pages = [p for p in ROOT.rglob("*.html") if ".git" not in p.parts and "node_modules" not in p.parts]
    css = [p for p in ROOT.rglob("*.css") if ".git" not in p.parts]
    problems, external = [], set()
    cache = {}
    for page in pages:
        c = cache.setdefault(page, parse(page))
        for link in c.links:
            parts = urlsplit(link)
            if parts.scheme in ("http", "https"):
                external.add(link)
                continue
            if parts.scheme in ("mailto", "data", "javascript"):
                continue
            if parts.path.startswith("/"):
                target = ROOT / unquote(parts.path.lstrip("/"))
            else:
                target = (page.parent / unquote(parts.path)) if parts.path else page
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                problems.append(f"{page.relative_to(ROOT)}: missing file {link}")
                continue
            if parts.fragment and target.suffix == ".html":
                ids = cache.setdefault(target, parse(target)).ids
                if parts.fragment not in ids:
                    problems.append(f"{page.relative_to(ROOT)}: missing anchor {link}")
    for sheet in css:
        for ref in re.findall(r"url\(\"?([^\")]+)\"?\)", sheet.read_text(encoding="utf-8")):
            if ref.startswith("data:"):
                continue
            if not (sheet.parent / ref).resolve().exists():
                problems.append(f"{sheet.relative_to(ROOT)}: missing file {ref}")
    print(f"checked {len(pages)} pages, {len(css)} stylesheets; {len(external)} external links not fetched")
    for p in problems:
        print("FAIL", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
