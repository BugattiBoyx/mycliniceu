#!/usr/bin/env python3
"""Static 1:1 mirror of moun-journey.com: downloads HTML + all assets and rewrites URLs to local paths."""
import os
import re
import time
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

BASE = "https://moun-journey.com"
HOST = "moun-journey.com"
OUT = os.path.join(os.path.dirname(__file__), "..", "clone")
OUT = os.path.abspath(OUT)
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
}

PAGES = [
    "/",
    "/winkel/",
    "/product/mounjaro-injectiepen-kopen/",
    "/product/ozempic-injectiepen-kopen/",
    "/product-category/mounjaro/",
    "/cart/",
    "/checkout/",
    "/contact/",
    "/verzendinformatie/",
    "/retourbeleid/",
    "/betalingsbeleid/",
    "/privacybeleid/",
    "/algemene-voorwaarden/",
]

downloaded = set()
asset_queue = []


def fetch(url, binary=False):
    for attempt in range(3):
        try:
            req = Request(url, headers=UA)
            with urlopen(req, timeout=45) as r:
                data = r.read()
                ctype = r.headers.get("Content-Type", "")
                if binary:
                    return (data, ctype)
                return (data.decode("utf-8", "ignore"), ctype)
        except HTTPError as e:
            if e.code in (404, 403, 410):
                return None
            time.sleep(1)
        except (URLError, TimeoutError):
            time.sleep(1)
    return None


def local_path_for(url):
    """Map an absolute URL to a local path under OUT."""
    p = urlparse(url)
    path = unquote(p.path)
    if path.endswith("/") or path == "":
        path = path + "index.html"
    # keep query as part of filename to avoid collisions (fonts/css versioning)
    if p.query:
        safe_q = re.sub(r"[^a-zA-Z0-9._-]", "_", p.query)
        root, ext = os.path.splitext(path)
        path = f"{root}__{safe_q}{ext}"
    return path.lstrip("/")


def save(rel_path, data, mode="wb"):
    full = os.path.join(OUT, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, mode) as f:
        if mode == "wb" and isinstance(data, str):
            data = data.encode("utf-8")
        f.write(data)


def rel_from(from_rel, to_rel):
    """Relative link from one local file to another."""
    from_dir = os.path.dirname(from_rel)
    rel = os.path.relpath(to_rel, from_dir or ".")
    return rel.replace(os.sep, "/")


def norm(url, base):
    url = url.strip().strip('"').strip("'")
    if not url or url.startswith(("data:", "mailto:", "tel:", "#", "javascript:")):
        return None
    absu = urljoin(base, url)
    p = urlparse(absu)
    if p.scheme not in ("http", "https"):
        return None
    return absu


def is_same_host(url):
    return urlparse(url).netloc.endswith(HOST)


ASSET_EXT = re.compile(r"\.(css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|otf|mp4|webm|json|xml|avif)(\?|$)", re.I)


def queue_asset(url):
    if url and is_same_host(url) and url not in downloaded:
        asset_queue.append(url)


def process_css(css_text, css_url, css_rel):
    """Rewrite url(...) and @import in CSS, queue the referenced assets."""
    def repl(m):
        raw = m.group(1)
        au = norm(raw, css_url)
        if not au or not is_same_host(au):
            return m.group(0)
        target_rel = local_path_for(au)
        queue_asset(au)
        return f"url({rel_from(css_rel, target_rel)})"

    css_text = re.sub(r"url\(([^)]+)\)", repl, css_text)

    def repl_import(m):
        raw = m.group(2)
        au = norm(raw, css_url)
        if not au or not is_same_host(au):
            return m.group(0)
        target_rel = local_path_for(au)
        queue_asset(au)
        return f'@import {m.group(1)}"{rel_from(css_rel, target_rel)}"'

    css_text = re.sub(r'@import\s+(url\()?["\']([^"\')]+)["\']', repl_import, css_text)
    return css_text


def rewrite_html(html, page_url, page_rel):
    # collect asset URLs from common attributes
    attr_patterns = [
        r'(href)="([^"]+)"',
        r'(src)="([^"]+)"',
        r'(data-src)="([^"]+)"',
        r'(data-bg)="([^"]+)"',
        r'(content)="(https://moun-journey\.com/wp-content/[^"]+)"',
        r'(poster)="([^"]+)"',
    ]

    def rewrite_attr(m):
        attr, val = m.group(1), m.group(2)
        au = norm(val, page_url)
        if not au:
            return m.group(0)
        if is_same_host(au):
            # page link vs asset
            if attr == "href" and not ASSET_EXT.search(au) and urlparse(au).path.rstrip("/") in [p.rstrip("/") for p in [pg for pg in [x for x in PAGE_URLS]]]:
                target_rel = local_path_for(au)
                return f'{attr}="{rel_from(page_rel, target_rel)}"'
            if ASSET_EXT.search(au):
                target_rel = local_path_for(au)
                queue_asset(au)
                return f'{attr}="{rel_from(page_rel, target_rel)}"'
            # internal page (no ext) -> map to its index.html if in our page set
            target_rel = local_path_for(au)
            return f'{attr}="{rel_from(page_rel, target_rel)}"'
        return m.group(0)

    for pat in attr_patterns:
        html = re.sub(pat, rewrite_attr, html)

    # srcset
    def rewrite_srcset(m):
        parts = []
        for chunk in m.group(2).split(","):
            chunk = chunk.strip()
            if not chunk:
                continue
            bits = chunk.split()
            u = norm(bits[0], page_url)
            if u and is_same_host(u):
                target_rel = local_path_for(u)
                queue_asset(u)
                bits[0] = rel_from(page_rel, target_rel)
            parts.append(" ".join(bits))
        return f'{m.group(1)}="{", ".join(parts)}"'

    html = re.sub(r'(srcset|data-srcset)="([^"]+)"', rewrite_srcset, html)

    # inline style url(...)
    def rewrite_inline_style(m):
        style = m.group(1)
        def r2(mm):
            u = norm(mm.group(1), page_url)
            if u and is_same_host(u):
                target_rel = local_path_for(u)
                queue_asset(u)
                return f"url({rel_from(page_rel, target_rel)})"
            return mm.group(0)
        return 'style="' + re.sub(r"url\(([^)]+)\)", r2, style) + '"'

    html = re.sub(r'style="([^"]*url\([^"]*)"', rewrite_inline_style, html)

    # inline <style> blocks with url()
    def rewrite_style_block(m):
        return "<style" + m.group(1) + ">" + process_css(m.group(2), page_url, page_rel) + "</style>"

    html = re.sub(r"<style([^>]*)>(.*?)</style>", rewrite_style_block, html, flags=re.S)
    return html


PAGE_URLS = [urljoin(BASE, p) for p in PAGES]


def main():
    # Pass 1: pages
    for page in PAGES:
        url = urljoin(BASE, page)
        res = fetch(url)
        if not res:
            print("SKIP page", url)
            continue
        html, _ = res
        page_rel = local_path_for(url)
        html = rewrite_html(html, url, page_rel)
        save(page_rel, html)
        downloaded.add(url)
        print("PAGE", page_rel)

    # Pass 2: assets (CSS may enqueue more)
    seen = set()
    while asset_queue:
        url = asset_queue.pop(0)
        if url in seen or url in downloaded:
            continue
        seen.add(url)
        rel = local_path_for(url)
        is_css = url.split("?")[0].lower().endswith(".css")
        if is_css:
            res = fetch(url)
            if not res:
                print("SKIP css", url)
                continue
            text, _ = res
            text = process_css(text, url, rel)
            save(rel, text)
        else:
            res = fetch(url, binary=True)
            if res is None:
                print("SKIP asset", url)
                continue
            data, _ = res
            save(rel, data)
        downloaded.add(url)

    print(f"\nDONE. {len(downloaded)} files -> {OUT}")


if __name__ == "__main__":
    main()
