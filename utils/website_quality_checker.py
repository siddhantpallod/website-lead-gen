"""website_quality_checker.py

CLI entrypoint. Usage:
python website_quality_checker.py <url> [--output out.json]

"""
from __future__ import annotations
import argparse
import json
from urllib.parse import urlparse
import sys
import os

from scraper import fetch_url, parse_html, extract_css_from_urls, fetch_css_fonts, check_robots_and_sitemap, sample_internal_links
from analyzer import (
    text_to_html_ratio,
    heading_stats,
    check_broken_links,
    ssl_certificate_valid,
    find_contact_info,
    has_structured_data,
    parse_lighthouse_json,
    count_security_headers,
    paragraph_stats,
    external_resource_ratio,
    h1_stats
)
from scorer import compute_scores
from utils import simple_keyword_relevance

import subprocess


def try_run_lighthouse(url: str, timeout: int = 30) -> dict | None:
    """Try to run lighthouse CLI using npx or lighthouse if available. Returns parsed JSON dict or None."""
    out_path = 'lighthouse_out.json'
    cmds = [
        ['lighthouse', url, '--quiet', '--output=json', f'--output-path={out_path}'],
        ['npx','lighthouse', url, '--quiet', '--output=json', f'--output-path={out_path}']
    ]
    for cmd in cmds:
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            if proc.returncode == 0 and os.path.exists(out_path):
                with open(out_path,'r',encoding='utf-8') as f:
                    data = json.load(f)
                try:
                    os.remove(out_path)
                except Exception:
                    pass
                return data
        except FileNotFoundError:
            continue
        except subprocess.SubprocessError:
            continue
    return None


def analyze(url: str) -> dict:
    status, html, headers, elapsed_s, content_len = fetch_url(url)
    # record fetch-level errors (SSL verification, DNS, connection, etc.) so the analyzer
    # can continue and present a useful result rather than crashing.
    fetch_error = None
    insecure_fallback = False
    if headers and isinstance(headers, dict):
        fetch_error = headers.get('fetch_error')
        insecure_fallback = headers.get('insecure_fallback') == 'true'
    if fetch_error:
        print(f"Warning: fetch error for {url}: {fetch_error}")
    parsed = parse_html(url, html or '')

    # CSS fonts
    css_text = ''
    if parsed.get('css_links'):
        css_text = extract_css_from_urls(parsed['css_links'])
    font_families = fetch_css_fonts(css_text)

    # measures
    measures = {}
    measures['meta'] = parsed.get('meta',{})
    measures['canonical'] = parsed.get('canonical')
    measures['viewport'] = parsed.get('viewport')
    measures['css_font_families'] = font_families
    measures['raw_html_len'] = len(parsed.get('raw_html',''))
    measures['body_text_len'] = len(parsed.get('body_text',''))
    measures['text_html_ratio'] = text_to_html_ratio(parsed.get('raw_html',''), parsed.get('body_text',''))
    measures['response_time_s'] = elapsed_s
    measures['content_length_bytes'] = content_len

    hs = heading_stats(parsed.get('headings',[]))
    measures['heading_stats'] = hs
    measures['h1_stats'] = h1_stats(parsed.get('headings', []))

    # sample internal links
    netloc = urlparse(url).netloc
    internal_sample = sample_internal_links(parsed.get('links',[]), netloc, limit=10)
    broken = check_broken_links(internal_sample)
    measures['broken_links'] = broken

    # ssl
    ssl_info = ssl_certificate_valid(url)
    measures['ssl_info'] = ssl_info
    # If fetch had an SSL verification error, mark `has_ssl` False but record the raw error.
    if fetch_error and 'SSL' in (fetch_error or ''):
        measures['has_ssl'] = False
        measures['fetch_error'] = fetch_error
        measures['insecure_fallback'] = insecure_fallback
    else:
        measures['has_ssl'] = True if urlparse(url).scheme == 'https' and ssl_info.get('valid') else False

    # contact info
    contact = find_contact_info(parsed.get('raw_html','') + ' ' + parsed.get('body_text',''))
    measures['contact_info'] = contact
    measures['contact_info_found'] = bool(contact.get('emails') or contact.get('phones') or contact.get('addresses'))

    # structured data
    measures['has_schema'] = has_structured_data(parsed.get('raw_html',''))

    # images alt
    imgs = parsed.get('images',[])
    if imgs:
        with_alt = sum(1 for i in imgs if i.get('alt'))
        measures['images_with_alt_ratio'] = round(with_alt/len(imgs),3)
    else:
        measures['images_with_alt_ratio'] = 1.0

    # robots/sitemap
    measures['robots_sitemap'] = check_robots_and_sitemap(url)

    # security headers
    measures['security_headers'] = count_security_headers(headers)

    # paragraph stats
    measures['paragraph_stats'] = paragraph_stats(parsed.get('paragraph_lengths', []))

    # external resource ratio
    measures['external_resource_ratio'] = external_resource_ratio(parsed, urlparse(url).netloc)

    # h1 stats
    measures['h1_stats'] = h1_stats(parsed.get('headings', []))

    # keyword relevance
    measures['keyword_relevance'] = simple_keyword_relevance(measures.get('meta',{}).get('title',''), parsed.get('body_text',''))

    # copyright fresh: look for year in footer or copyright
    fresh = False
    import re
    m = re.search(r'©?\s*(?:copyright)?\s*(\d{4})', parsed.get('raw_html',''), flags=re.I)
    if m:
        year = int(m.group(1))
        from datetime import datetime
        fresh = year >= datetime.utcnow().year - 1
    measures['copyright_fresh'] = fresh

    # lighthouse
    lh = try_run_lighthouse(url)
    if lh:
        lh_scores = parse_lighthouse_json(lh)
        measures['lighthouse'] = lh_scores
        measures['lighthouse_raw'] = lh
    else:
        measures['lighthouse'] = None

    # add some flags
    measures['mobile_friendly'] = bool(measures.get('viewport'))
    measures['meta_description'] = bool(measures.get('meta',{}).get('meta',{}).get('description'))

    # attach raw parsed
    measures['parsed'] = parsed
    return measures


def build_report(url: str, measures: dict) -> dict:
    scores = compute_scores(measures)
    indicators = {
        'has_ssl': measures.get('has_ssl'),
        'mobile_friendly': measures.get('mobile_friendly'),
        'meta_description_present': measures.get('meta_description'),
        'contact_info_found': measures.get('contact_info_found'),
        'lighthouse_performance': measures.get('lighthouse',{}).get('performance') if measures.get('lighthouse') else None,
        'broken_links': measures.get('broken_links')
    }
    report = {
        'url': url,
        'scores': scores,
        'indicators': indicators,
        'summary': scores.get('summary'),
        'measures': measures
    }
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('url')
    ap.add_argument('--output','-o', help='Output JSON file')
    args = ap.parse_args()
    url = args.url
    report = analyze(url)
    out = build_report(url, report)
    if args.output:
        with open(args.output,'w',encoding='utf-8') as f:
            json.dump(out, f, indent=2, default=str)
        print(f'Wrote {args.output}')
    else:
        print(json.dumps(out, indent=2, default=str))

if __name__ == '__main__':
    main()
