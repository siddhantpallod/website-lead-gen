#!/usr/bin/env python3
"""Simple orchestrator:
Run the website quality checker, read analysis.json, and if score < 50 run node deployer and print any URL found.

Usage: python utils/main.py <url>
"""
from __future__ import annotations
import subprocess
import sys
import os
import json
import re


def run_checker(url: str, utils_cwd: str) -> tuple[int, str, str]:
    cmd = [sys.executable, "website_quality_checker.py", url]
    print(f"Running: {' '.join(cmd)} (cwd={utils_cwd})")
    proc = subprocess.run(cmd, cwd=utils_cwd, capture_output=True, text=True)
    if proc.stdout:
        print(proc.stdout)
    if proc.returncode != 0:
        print("Checker returned non-zero:", proc.returncode)
        if proc.stderr:
            print(proc.stderr)
    return proc.returncode, proc.stdout or "", proc.stderr or ""


def read_analysis(utils_cwd: str) -> dict | None:
    path = os.path.join(utils_cwd, "analysis.json")
    if not os.path.exists(path):
        print(f"Missing analysis file: {path}")
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print("Failed to read analysis.json:", e)
        return None


def run_node_index(utils_cwd: str) -> tuple[int, str]:
    cmd = ["node", "index.js"]
    print(f"Running: {' '.join(cmd)} (cwd={utils_cwd})")
    proc = subprocess.run(cmd, cwd=utils_cwd, capture_output=True, text=True)
    out = (proc.stdout or "") + "\n" + (proc.stderr or "")
    if proc.stdout:
        print(proc.stdout)
    if proc.stderr:
        print(proc.stderr)
    return proc.returncode, out


def extract_url(text: str) -> str | None:
    # find the first http(s) URL-like substring
    m = re.search(r"https?://[^\s'\"]+", text)
    return m.group(0) if m else None


def main(argv: list[str]):
    if len(argv) < 2:
        print("Usage: python utils/main.py <url>")
        return 2
    url = argv[1]
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    utils_cwd = os.path.abspath(os.path.dirname(__file__))

    # 1) Run checker in utils folder so analysis.json ends up next to index.js
    rc, out, err = run_checker(url, utils_cwd)
    if rc != 0:
        print("Warning: checker exited with non-zero code; continuing to attempt to read analysis.json if present.")

    analysis = read_analysis(utils_cwd)
    if not analysis:
        print("No analysis.json produced. Exiting.")
        return 1

    score = None
    try:
        score = analysis.get('scores', {}).get('total')
    except Exception:
        score = None

    try:
        print("Score:", score)
    except Exception:
        pass

    if score is None:
        print("Couldn't determine score from analysis.json; exiting.")
        return 1

    try:
        numeric = float(score)
    except Exception:
        print("Score is not numeric; exiting.")
        return 1

    if numeric >= 50:
        print("Score >= 50 — no redeploy action required.")
        return 0

    # Score < 50: run node utils/index.js and extract URL
    rc2, combined = run_node_index(utils_cwd)
    found = extract_url(combined or "")
    if found:
        print("Deployment URL found:", found)
        return 0
    else:
        print("No http(s) URL found in node output. Raw output below:\n")
        print(combined)
        return 1


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
