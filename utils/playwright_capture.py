"""playwright_capture.py

Capture computed styles and optional screenshot using Playwright.
This module is optional — it fails gracefully if Playwright is not installed.
"""
from __future__ import annotations
import base64
import json
from typing import Dict, Any, Optional


def capture_dom_styles(url: str, timeout: int = 20, device: str = 'desktop', take_screenshot: bool = False) -> Dict[str, Any]:
    """Attempt to render the page with Playwright and capture computed styles.

    Returns a dict with keys:
      - dom_styles: a list of element summaries (selector, index, computed styles, bounding rect)
      - screenshot_base64: optional base64 PNG (if take_screenshot True)
      - error: present if any failure
    """
    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        return {'error': f'playwright_unavailable: {e}'}

    result: Dict[str, Any] = {'dom_styles': []}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 800} if device == 'desktop' else {'width': 375, 'height': 812})
            page = context.new_page()
            page.set_default_navigation_timeout(timeout * 1000)
            page.goto(url, wait_until='networkidle')

            # JS expression to collect computed styles for some selectors
            js = r'''
            (function(){
                const selectors = ['body','header','nav','main','footer','h1','h2','h3','p','a','img','.hero','section'];
                const out = [];
                function styleFor(el){
                    const cs = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return {
                        fontFamily: cs.fontFamily || null,
                        fontSize: cs.fontSize || null,
                        fontWeight: cs.fontWeight || null,
                        color: cs.color || null,
                        backgroundColor: cs.backgroundColor || null,
                        display: cs.display || null,
                        width: rect.width || null,
                        height: rect.height || null,
                        margin: cs.margin || null,
                        padding: cs.padding || null,
                        textTransform: cs.textTransform || null
                    };
                }
                selectors.forEach(sel => {
                    const nodes = Array.from(document.querySelectorAll(sel)).slice(0,5);
                    nodes.forEach((n, idx) => {
                        out.push({selector: sel, index: idx, text: n.innerText ? n.innerText.trim().slice(0,200) : '', computed: styleFor(n)});
                    });
                });
                // add top-level metrics
                const fonts = Array.from(new Set(Array.from(document.querySelectorAll('*')).map(n=>window.getComputedStyle(n).fontFamily).filter(Boolean))).slice(0,20);
                return {elements: out, fonts: fonts, title: document.title || ''};
            })()
            '''

            dom = page.evaluate(js)
            result['dom_styles'] = dom

            if take_screenshot:
                img = page.screenshot(full_page=True)
                result['screenshot_base64'] = base64.b64encode(img).decode('ascii')

            try:
                context.close()
            except Exception:
                pass
            try:
                browser.close()
            except Exception:
                pass
    except Exception as e:
        return {'error': f'playwright_error: {e}'}

    return result
