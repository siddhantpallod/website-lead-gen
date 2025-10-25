"""scorer.py

Maps measured indicators to normalized scores and computes weighted total.
"""
from __future__ import annotations
from typing import Dict, Any

WEIGHTS = {
    'technical': 0.25,
    'ux_design': 0.20,
    'seo': 0.20,
    'credibility': 0.20,
    'content': 0.15
}


def normalize_0_100(x: float) -> int:
    if x is None:
        return 0
    v = max(0.0, min(1.0, float(x)))
    return int(round(v * 100))


def score_from_lighthouse(lh_scores: Dict[str,float]) -> float:
    # use performance & accessibility as main
    perf = lh_scores.get('performance', 0.0)
    access = lh_scores.get('accessibility', 0.0)
    seo = lh_scores.get('seo', 0.0)
    bp = lh_scores.get('best-practices', 0.0)
    # weighted
    return (0.5 * perf + 0.25 * access + 0.15 * seo + 0.10 * bp)


def compute_scores(measures: Dict[str,Any]) -> Dict[str,Any]:
    # measures is expected to contain keys from analyzer and scraper
    # We'll calculate sub-scores (0..1) for key facets and combine them into category scores,
    # then map category scores to 0..100 using weights defined in WEIGHTS.

    # --- Technical submetrics ---
    lh = measures.get('lighthouse') or {}
    if lh:
        technical_sub = score_from_lighthouse(lh)  # already 0..1 like
    else:
        # Fallback technical metrics
        ssl_ok = 1.0 if measures.get('has_ssl') else 0.0
        mobile = 1.0 if measures.get('mobile_friendly') else 0.0
        resp_time = measures.get('response_time_s', 0.0)
        # ideal <= 1s, degrade toward 10s
        resp_score = max(0.0, min(1.0, (10.0 - resp_time) / 9.0)) if resp_time > 0 else 0.0
        security_hdrs = measures.get('security_headers', {})
        security_score = sum(1 for k,v in security_hdrs.items() if v)/max(1, len(security_hdrs))
        broken = measures.get('broken_links', 0)
        broken_score = max(0.0, 1.0 - 0.15 * broken)
        technical_sub = 0.35*ssl_ok + 0.25*mobile + 0.2*resp_score + 0.1*security_score + 0.1*broken_score

    # --- UX & Design submetrics ---
    text_ratio = measures.get('text_html_ratio', 0)
    headings_total = measures.get('heading_stats', {}).get('total', 0)
    h1_count = measures.get('h1_stats', {}).get('h1_count', 0)
    para_stats = measures.get('paragraph_stats', {})
    avg_para = para_stats.get('avg_words', 0)
    # heuristics: prefer moderate paragraphs (20-80 words), many headings, good text ratio
    text_ratio_score = min(1.0, text_ratio * 2)
    headings_score = min(1.0, headings_total / 12)
    h1_score = 1.0 if h1_count == 1 else (0.5 if h1_count > 1 else 0.2)
    para_score = 1.0 if 20 <= avg_para <= 80 else max(0.0, 1.0 - abs(avg_para-40)/100)
    ux_sub = 0.4*text_ratio_score + 0.3*headings_score + 0.15*h1_score + 0.15*para_score

    # --- SEO submetrics ---
    title_present = 1.0 if measures.get('meta',{}).get('title') else 0.0
    title_len = len(measures.get('meta',{}).get('title',''))
    title_len_score = 1.0 if 30 <= title_len <= 70 else max(0.0, 1.0 - abs(title_len-50)/100)
    desc = 1.0 if measures.get('meta',{}).get('meta',{}).get('description') else 0.0
    images_with_alt = measures.get('images_with_alt_ratio', 0.0)
    canonical = 1.0 if measures.get('canonical') else 0.0
    robots = measures.get('robots_sitemap',{}).get('robots', False)
    sitemap = measures.get('robots_sitemap',{}).get('sitemap', False)
    seo_sub = 0.25*title_present + 0.2*title_len_score + 0.2*desc + 0.15*images_with_alt + 0.1*canonical + 0.1*(1.0 if sitemap else 0.0)

    # --- Credibility submetrics ---
    contact = 1.0 if measures.get('contact_info_found') else 0.0
    ssl = 1.0 if measures.get('has_ssl') else 0.0
    schema = 1.0 if measures.get('has_schema') else 0.0
    copyright_fresh = 1.0 if measures.get('copyright_fresh', False) else 0.0
    social = min(1.0, len(measures.get('parsed',{}).get('social_links', []))/3)
    cred_sub = 0.3*contact + 0.25*ssl + 0.15*schema + 0.1*copyright_fresh + 0.2*social

    # --- Content submetrics ---
    keyword_relevance = measures.get('keyword_relevance', 0.0)
    external_ratio = measures.get('external_resource_ratio', 0.0)
    # penalize high external resource ratio (slow third-party resources)
    external_penalty = max(0.0, 1.0 - external_ratio)
    content_sub = 0.6*keyword_relevance + 0.4*external_penalty

    # Convert submetrics (0..1) to 0..100 per category
    scores = {
        'technical': normalize_0_100(technical_sub),
        'ux_design': normalize_0_100(ux_sub),
        'seo': normalize_0_100(seo_sub),
        'credibility': normalize_0_100(cred_sub),
        'content': normalize_0_100(content_sub)
    }

    # Weighted total 0..100
    total = int(round(
        scores['technical'] * WEIGHTS['technical'] +
        scores['ux_design'] * WEIGHTS['ux_design'] +
        scores['seo'] * WEIGHTS['seo'] +
        scores['credibility'] * WEIGHTS['credibility'] +
        scores['content'] * WEIGHTS['content']
    ))
    scores['total'] = total

    # Human readable summary based on buckets
    parts = []
    if scores['technical'] >= 80:
        parts.append('strong technical')
    elif scores['technical'] < 40:
        parts.append('poor technical')
    if scores['seo'] >= 70:
        parts.append('good SEO')
    if scores['credibility'] >= 70:
        parts.append('credible')
    if scores['content'] < 50:
        parts.append('content needs improvement')
    scores['summary'] = '; '.join(parts) if parts else 'Mixed signals.'
    return scores
