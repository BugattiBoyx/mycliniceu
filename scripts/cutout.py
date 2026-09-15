"""Knock the flat studio backdrop out of a product photo so it can sit on any surface.

Flood-fills from the borders (the backdrop is always one connected region) and
feathers the remaining halo, which pure thresholding leaves behind on the
anti-aliased pen edges.
"""

import sys
from collections import deque

from PIL import Image


def luminance(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def cutout(src, dst, mode="dark", tol=48):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg(p):
        lum = luminance(p)
        return lum <= tol if mode == "dark" else lum >= 255 - tol

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if not seen[y * w + x] and is_bg(px[x, y]):
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y * w + x] and is_bg(px[x, y]):
                seen[y * w + x] = 1
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and is_bg(px[nx, ny]):
                seen[ny * w + nx] = 1
                q.append((nx, ny))

    # Feather the anti-aliased rim left against the removed backdrop.
    edge = []
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if p[3] == 0:
                continue
            touches = any(
                0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
            )
            if not touches:
                continue
            lum = luminance(p)
            if mode == "dark" and lum < 110:
                edge.append((x, y, int(255 * (lum / 110))))
            elif mode == "light" and lum > 200:
                edge.append((x, y, int(255 * ((255 - lum) / 55))))
    for x, y, a in edge:
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, max(0, min(255, a)))

    im.save(dst)
    print(f"{dst} {im.size}")


if __name__ == "__main__":
    cutout(
        sys.argv[1],
        sys.argv[2],
        sys.argv[3] if len(sys.argv) > 3 else "dark",
        int(sys.argv[4]) if len(sys.argv) > 4 else 48,
    )
