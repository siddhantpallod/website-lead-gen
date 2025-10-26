"""scraper.py

Responsible for fetching HTML (requests), parsing with BeautifulSoup, and extracting page elements.
"""
from __future__ import annotations
import re
import json
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from cachetools import TTLCache, cached
from requests.exceptions import SSLError, RequestException

cache = TTLCache(maxsize=256, ttl=3600)

@cached(cache)
def fetch_url(url: str, timeout: int = 10) -> Tuple[Optional[int], str, Dict[str,str], float, int]:
    """Fetch URL and return (status_code, text, headers, elapsed_seconds, content_length).

    This function catches SSL and request exceptions and will attempt a best-effort
    insecure fallback (verify=False) if the SSL chain cannot be validated. Any
    fetch error is recorded in the returned headers under the `fetch_error` key so
    callers can decide how to proceed.
    """
    try:
        resp = requests.get(url, timeout=timeout, allow_redirects=True)
        elapsed = getattr(resp, 'elapsed', None)
        elapsed_s = elapsed.total_seconds() if elapsed else 0.0
        content_len = len(resp.content) if resp.content is not None else 0
        return resp.status_code, resp.text, dict(resp.headers), elapsed_s, content_len
    except SSLError as e:
        # SSL verification failed; try a best-effort insecure fetch to collect content
        try:
            import warnings
            warnings.filterwarnings('ignore', message='Unverified HTTPS request')
            resp = requests.get(url, timeout=timeout, allow_redirects=True, verify=False)
            elapsed = getattr(resp, 'elapsed', None)
            elapsed_s = elapsed.total_seconds() if elapsed else 0.0
            content_len = len(resp.content) if resp.content is not None else 0
            headers = dict(resp.headers)
            headers['fetch_error'] = f'SSLError: {e}'
            headers['insecure_fallback'] = 'true'
            return resp.status_code, resp.text, headers, elapsed_s, content_len
        except RequestException as e2:
            return None, '', {'fetch_error': f'SSL fallback failed: {e2}'}, 0.0, 0
    except RequestException as e:
        return None, '', {'fetch_error': str(e)}, 0.0, 0


def parse_html(base_url: str, html: str) -> Dict:
    # Prefer lxml if available for speed/robustness, otherwise fall back to the built-in parser.
    try:
        soup = BeautifulSoup(html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "html.parser")

    meta = {}
    title_tag = soup.find("title")
    meta['title'] = title_tag.get_text(strip=True) if title_tag else ""

    meta_tags = {}
    for m in soup.find_all("meta"):
        if m.get('name'):
            meta_tags[m.get('name').lower()] = m.get('content', '')
        elif m.get('property'):
            meta_tags[m.get('property').lower()] = m.get('content', '')
    meta['meta'] = meta_tags

    headings = []
    for level in range(1,7):
        for h in soup.find_all(f'h{level}'):
            headings.append({'tag': f'h{level}', 'text': h.get_text(strip=True)})

    # body text
    body = soup.body.get_text(separator=' ', strip=True) if soup.body else ''

    # links
    links = []
    for a in soup.find_all('a', href=True):
        href = a['href'].strip()
        full = urljoin(base_url, href)
        links.append({'href': href, 'url': full, 'text': a.get_text(strip=True)})

    # images
    images = []
    for img in soup.find_all('img'):
        src = img.get('src') or ''
        images.append({
            'src': urljoin(base_url, src),
            'alt': img.get('alt',''),
            'title': img.get('title','')
        })

    # css refs and inline styles
    css_links = []
    for l in soup.find_all('link', href=True):
        rel = l.get('rel')
        if not rel:
            continue
        rels = rel if isinstance(rel, (list, tuple)) else [rel]
        if any('stylesheet' in str(r).lower() for r in rels):
            css_links.append(urljoin(base_url, l['href']))
    inline_styles = [tag.get('style','') for tag in soup.find_all(True) if tag.get('style')]

    # scripts
    scripts = []
    for s in soup.find_all('script'):
        src = s.get('src') or ''
        scripts.append({'src': urljoin(base_url, src) if src else '', 'inline': not bool(src), 'text_len': len(s.get_text() or '')})

    # favicon
    favicon_tag = soup.find('link', rel=lambda r: r and 'icon' in str(r).lower())
    favicon = urljoin(base_url, favicon_tag['href']) if favicon_tag and favicon_tag.get('href') else None

    # paragraphs and paragraphs lengths
    paragraphs = [p.get_text(strip=True) for p in soup.find_all('p')]
    paragraph_lengths = [len(p.split()) for p in paragraphs]

    # social links (simple)
    social_domains = ('facebook.com','twitter.com','linkedin.com','instagram.com','youtube.com')
    social_links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if any(d in href for d in social_domains):
            social_links.append(href)

    # viewport
    viewport = any(k for k in meta_tags.keys() if 'viewport' in k) or bool(soup.find('meta', attrs={'name':'viewport'}))

    # canonical
    canonical_tag = soup.find('link', rel='canonical')
    canonical = canonical_tag['href'] if canonical_tag and canonical_tag.get('href') else None

    return {
        'meta': meta,
        'headings': headings,
        'body_text': body,
        'links': links,
        'images': images,
        'css_links': css_links,
        'inline_styles': inline_styles,
        'scripts': scripts,
        'favicon': favicon,
        'paragraphs': paragraphs,
        'paragraph_lengths': paragraph_lengths,
        'social_links': social_links,
        'viewport': viewport,
        'canonical': canonical,
        'raw_html': html
    }


def fetch_css_fonts(css_text: str) -> List[str]:
    # crude font-family extractor
    families = set()
    for match in re.finditer(r'font-family\s*:\s*([^;}{]+);', css_text, flags=re.I):
        fams = match.group(1)
        for f in fams.split(','):
            f = f.strip().strip('"\'')
            if f:
                families.add(f)
    return list(families)


def extract_css_from_urls(css_urls: List[str], timeout: int = 8) -> str:
    out = []
    for url in css_urls[:10]:
        try:
            r = requests.get(url, timeout=timeout)
            if r.status_code == 200:
                out.append(r.text)
        except Exception:
            continue
    return "\n".join(out)


def check_robots_and_sitemap(base_url: str) -> Dict[str, bool]:
    parsed = urlparse(base_url)
    root = f"{parsed.scheme}://{parsed.netloc}"
    results = {'robots': False, 'sitemap': False}
    try:
        r = requests.get(urljoin(root, '/robots.txt'), timeout=6)
        results['robots'] = r.status_code == 200 and 'user-agent' in r.text.lower()
    except Exception:
        results['robots'] = False
    try:
        r2 = requests.get(urljoin(root, '/sitemap.xml'), timeout=6)
        results['sitemap'] = r2.status_code == 200 and ('<urlset' in r2.text or '<sitemapindex' in r2.text)
    except Exception:
        results['sitemap'] = False
    return results


def sample_internal_links(links: List[Dict], base_netloc: str, limit: int = 10) -> List[str]:
    seen = []
    for l in links:
        try:
            p = urlparse(l['url'])
            if p.netloc == base_netloc:
                if l['url'] not in seen:
                    seen.append(l['url'])
            if len(seen) >= limit:
                break
        except Exception:
            continue
    return seen
