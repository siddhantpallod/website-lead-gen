"""utils.py
Helper utilities for keyword relevance and caching helpers.
"""
from __future__ import annotations
from typing import List, Dict
from collections import Counter
import math


def simple_keyword_relevance(title: str, body: str) -> float:
    """Return a 0-1 relevance score based on overlap between title and body (TF-like).
    Crude: fraction of title words appearing in body weighted by IDF-like term frequency attenuation.
    """
    if not title or not body:
        return 0.0
    twords = [w.lower() for w in title.split() if len(w)>1]
    bwords = [w.lower() for w in body.split() if len(w)>1]
    if not twords or not bwords:
        return 0.0
    bcount = Counter(bwords)
    matches = 0.0
    for w in set(twords):
        matches += min(1, bcount.get(w,0))
    score = matches / len(set(twords))
    return min(1.0, score)


def sample_or_first(lst: List, n: int = 3):
    return lst[:n]
