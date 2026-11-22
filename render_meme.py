#!/usr/bin/env python3
"""Screenshot meme.html into a 1024x1024 PNG for the v4 resume meme.

Run from this directory:

    python3 render_meme.py [output.png]

The default output is meme.png. meme.html and assets/mark-1024.png must sit
next to this script. The render is deterministic: the page has no randomness,
no network fetches and no animations, so two runs give identical bytes.
"""

from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
SIZE = 1024
SETTLE_MS = 600


def shoot(html: Path, out: Path) -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": SIZE, "height": SIZE})
        page.goto(html.as_uri())
        page.wait_for_timeout(SETTLE_MS)
        page.screenshot(path=str(out))
        browser.close()
    print(f"wrote {out} ({out.stat().st_size} bytes)")


def main(argv: list[str]) -> int:
    html = HERE / "meme.html"
    if not html.is_file():
        print(f"missing {html}", file=sys.stderr)
        return 1
    name = argv[1] if len(argv) > 1 else "meme.png"
    out = Path(name)
    if not out.is_absolute():
        out = HERE / out
    shoot(html, out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
