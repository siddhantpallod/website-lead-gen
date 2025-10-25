# Website Quality Detection Tool

A Python CLI tool that scrapes a website and produces an objective, measurable evaluation of website quality across Technical, UX, SEO, Trust, and Content categories.

Features
- Scrapes landing page (requests + BeautifulSoup)
- Optional Lighthouse CLI integration if installed
- Computes heuristics: text/HTML ratio, heading structure, fonts, color heuristics, viewport meta, broken links, robots/sitemap checks
- SSL certificate validity checks
- Produces a structured JSON report with per-category scores and total (0-100)

Quickstart
1. Create a virtual environment and install dependencies:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run against a URL:

```powershell
python website_quality_checker.py https://example.com --output sample_output.json
```

Notes
- If `lighthouse` CLI is installed (npm package), the tool will try to run it to collect technical performance metrics; otherwise those metrics are skipped gracefully.
- Designed for Python 3.10+

Scoring
Category weights (default):
- Technical Performance: 25%
- UX & Design: 20%
- SEO: 20%
- Trust & Credibility: 20%
- Content Quality: 15%

See `website_quality_checker.py` and `scorer.py` for implementation details.

License: MIT
