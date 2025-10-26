"""ai_quick_suggester.py

Lightweight LLM-backed quick suggester with a deterministic heuristic fallback.
Returns short (2-5 word) improvement suggestions for a site given `measures`.
"""
from __future__ import annotations
import os
import json
import requests
import textwrap
import re
from typing import List, Dict, Any, Optional

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-3.5-turbo"


def _build_prompt(measures: Dict[str, Any]) -> str:
    title = measures.get('meta', {}).get('title') or ''
    excerpt = (measures.get('parsed', {}).get('body_text') or '')[:1000]
    parts = {
        "title": title,
        "mobile_friendly": measures.get('mobile_friendly'),
        "has_ssl": measures.get('has_ssl'),
        "response_time_s": measures.get('response_time_s'),
        "meta_description": measures.get('meta_description'),
        "images_with_alt_ratio": measures.get('images_with_alt_ratio'),
        "contact_info_found": measures.get('contact_info_found'),
        "has_schema": measures.get('has_schema'),
        "broken_links": measures.get('broken_links') or 0,
        "external_resource_ratio": measures.get('external_resource_ratio')
    }
    prompt = textwrap.dedent(f"""
    You are a concise website improvement suggester. Given the site indicators and a short excerpt, return a strict JSON object:
      {{ "suggestions": ["short phrase", ...] }}
    Each suggestion must be 2 to 5 words long, actionable, and no more than 6 suggestions. Only output valid JSON (no extra text).
    Indicators: {json.dumps(parts)}
    Body excerpt: {excerpt}
    """)
    return prompt


def _call_openai(prompt: str, model: str = DEFAULT_MODEL, timeout: int = 8) -> Optional[List[str]]:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        return None
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful website quality analyst."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 300
    }
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    try:
        r = requests.post(OPENAI_API_URL, json=payload, headers=headers, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        content = data["choices"][0]["message"]["content"].strip()
        # try to extract JSON object
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            blob = content[start:end+1]
        else:
            blob = content
        parsed = json.loads(blob)
        suggs = parsed.get('suggestions') or []
        # ensure short phrases (truncate/clean)
        clean = []
        for s in suggs:
            s2 = re.sub(r'\s+', ' ', str(s)).strip()
            if 2 <= len(s2.split()) <= 5:
                clean.append(s2)
        return clean[:6]
    except Exception:
        return None


def _heuristic_suggestions(measures: Dict[str, Any]) -> List[str]:
    s = []
    def add(p: str):
        if p not in s:
            s.append(p)
    if not measures.get('mobile_friendly'):
        add("add viewport meta")
    rt = measures.get('response_time_s')
    if rt is not None and rt > 3:
        add("optimize loading speed")
    if not measures.get('has_ssl'):
        add("enable HTTPS")
    if not measures.get('meta_description'):
        add("add meta description")
    if measures.get('images_with_alt_ratio', 1.0) < 0.8:
        add("add image alt")
    if not measures.get('contact_info_found'):
        add("add contact info")
    if not measures.get('has_schema'):
        add("add structured data")
    robots = measures.get('robots_sitemap') or {}
    if not robots.get('sitemap') and not robots.get('robots'):
        add("add sitemap.xml")
    if (measures.get('broken_links') or 0) > 0:
        add("fix broken links")
    if measures.get('external_resource_ratio',0) > 0.6:
        add("host resources locally")
    raw = (measures.get('parsed', {}).get('raw_html') or '').lower()
    if ('book' not in raw and 'appointment' not in raw and measures.get('contact_info_found')):
        add("add booking feature")
    if not measures.get('copyright_fresh'):
        add("update content dates")
    # ensure phrases are 2-5 words
    out = []
    for phrase in s:
        words = phrase.split()
        if len(words) < 2:
            phrase = phrase + " now"
        if len(phrase.split()) > 5:
            phrase = " ".join(phrase.split()[:5])
        out.append(phrase)
        if len(out) >= 6:
            break
    return out


def generate_suggestions(measures: Dict[str, Any], max_suggestions: int = 6) -> List[str]:
    """Return a list of short improvement suggestions (2-5 words). Tries OpenAI if key present, else heuristics."""
    prompt = _build_prompt(measures)
    suggestions = _call_openai(prompt)
    if suggestions:
        seen = set()
        out = []
        for x in suggestions:
            if x not in seen:
                seen.add(x)
                out.append(x)
            if len(out) >= max_suggestions:
                break
        return out
    return _heuristic_suggestions(measures)[:max_suggestions]
