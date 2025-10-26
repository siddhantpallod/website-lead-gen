"""analyzer.py

Compute heuristics from data returned by scraper.py and environment checks (SSL, broken links, Lighthouse data).
"""
from __future__ import annotations
import re
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
import requests
import ssl
import socket
from datetime import datetime
from tqdm import tqdm
import statistics


def text_to_html_ratio(html: str, body_text: str) -> float:
    if not html:
        return 0.0
    html_len = len(html)
    text_len = len(body_text)
    return round(min(1.0, text_len / max(1, html_len)), 3)


def heading_stats(headings: List[Dict[str,str]]) -> Dict[str, Any]:
    counts = {f'h{i}':0 for i in range(1,7)}
    max_depth = 0
    for h in headings:
        tag = h.get('tag','')
        counts[tag] = counts.get(tag,0) + 1
        level = int(tag.replace('h','')) if tag.startswith('h') else 0
        if level > 0:
            max_depth = max(max_depth, level)
    total = sum(counts.values())
    return {'counts': counts, 'total': total, 'max_depth': max_depth}


def check_broken_links(urls: List[str], timeout: int = 6, max_checks: int = 10) -> int:
    bad = 0
    for u in urls[:max_checks]:
        try:
            r = requests.head(u, timeout=timeout, allow_redirects=True)
            if r.status_code >= 400:
                bad += 1
        except Exception:
            bad += 1
    return bad


def count_security_headers(headers: Dict[str,str]) -> Dict[str, bool]:
    # Check common security headers
    h = {k.lower(): v for k, v in headers.items()}
    checks = {
        'csp': 'content-security-policy' in h,
        'hsts': 'strict-transport-security' in h,
        'x_frame_options': 'x-frame-options' in h,
        'x_content_type_options': 'x-content-type-options' in h,
        'referrer_policy': 'referrer-policy' in h,
        'permissions_policy': 'permissions-policy' in h
    }
    return checks


def paragraph_stats(paragraph_lengths: List[int]) -> Dict[str, Any]:
    if not paragraph_lengths:
        return {'count': 0, 'avg_words': 0, 'median_words': 0}
    return {'count': len(paragraph_lengths), 'avg_words': statistics.mean(paragraph_lengths), 'median_words': statistics.median(paragraph_lengths)}


def external_resource_ratio(parsed: Dict[str, Any], base_netloc: str) -> float:
    # ratio of external resource URLs among images, scripts, css
    total = 0
    external = 0
    from urllib.parse import urlparse
    for img in parsed.get('images', []):
        total += 1
        try:
            if urlparse(img.get('src','')).netloc and urlparse(img.get('src','')).netloc != base_netloc:
                external += 1
        except Exception:
            continue
    for s in parsed.get('scripts', []):
        if not s.get('src'):
            continue
        total += 1
        try:
            if urlparse(s.get('src','')).netloc and urlparse(s.get('src','')).netloc != base_netloc:
                external += 1
        except Exception:
            continue
    for c in parsed.get('css_links', []):
        total += 1
        try:
            if urlparse(c).netloc and urlparse(c).netloc != base_netloc:
                external += 1
        except Exception:
            continue
    if total == 0:
        return 0.0
    return round(min(1.0, external/total), 3)


def h1_stats(headings: List[Dict[str,str]]) -> Dict[str,int]:
    h1s = [h for h in headings if h.get('tag') == 'h1']
    return {'h1_count': len(h1s)}


def ssl_certificate_valid(url: str) -> Dict[str, Any]:
    parsed = urlparse(url)
    host = parsed.netloc.split(':')[0]
    port = 443
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, port), timeout=6) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
        # parse notAfter
        notAfter = cert.get('notAfter')
        fmt = None
        # try parsing
        try:
            expires = datetime.strptime(notAfter, '%b %d %H:%M:%S %Y %Z')
        except Exception:
            try:
                expires = datetime.strptime(notAfter, '%b %d %H:%M:%S %Y GMT')
            except Exception:
                expires = None
        valid = expires is not None and expires > datetime.utcnow()
        days_left = (expires - datetime.utcnow()).days if expires else None
        return {'valid': bool(valid), 'expires': expires.isoformat() if expires else None, 'days_left': days_left}
    except Exception as e:
        return {'valid': False, 'error': str(e)}


def find_contact_info(text: str) -> Dict[str, Any]:
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,6}', text)
    phones = re.findall(r'\+?\d[\d \-()]{7,}\d', text)
    addresses = []
    # we won't try to parse addresses reliably; look for 'address' word nearby
    if 'address' in text.lower() or 'street' in text.lower():
        addresses.append('found')
    return {'emails': list(set(emails)), 'phones': list(set(phones)), 'addresses': addresses}


def has_structured_data(html: str) -> bool:
    return 'application/ld+json' in html or 'schema.org' in html


def parse_lighthouse_json(lh_json: Dict[str,Any]) -> Dict[str,float]:
    # Expect lighthouse audit categories: performance, accessibility, seo, best-practices
    res = {}
    try:
        categories = lh_json.get('categories', {})
        for k in ['performance','accessibility','seo','best-practices']:
            c = categories.get(k)
            if c and 'score' in c:
                res[k] = float(c['score'])
    except Exception:
        pass
    return res
