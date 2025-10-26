import asyncio
from playwright.async_api import async_playwright
from openai import OpenAI
import base64
import os
import json
from dotenv import load_dotenv

load_dotenv()
PROMPT = """You will be shown a screenshot of a website landing page.

Task:
Decide whether this website is a high-probability candidate for a redesign sale.

Evaluation Criteria:
- Visual design and overall freshness
- Layout structure and readability
- Visual hierarchy and spacing
- Mobile-friendliness cues (if visible)
- Trust and professionalism indicators

Return format (MUST follow exactly):

If the site looks outdated, unprofessional, or poorly designed:
{
  "redesign_candidate": "YES",
  "business_name": "The name of the business as shown on the site.",
  "site_description": "The purpose of this site is [briefly describe the site's purpose based on visible content].",
  "reasons": [
    "Outdated design elements",
    "Poor color contrast",
    "Cluttered layout"
  ]
}

If the site looks modern, professional, and fine:
{
  "redesign_candidate": "NO",
}

Rules:
- Always return valid JSON.
- Reasons must be concise (4–6 words each).
- Never include explanations, commentary, or extra text.
- Deterministic, consistent output only.
"""

async def take_screenshot(url, path="screenshot.png"):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto(url, wait_until="networkidle")

        # Wait briefly for animations or dynamic elements to load
        await page.wait_for_timeout(1500)

        # Capture only the visible part of the screen
        await page.screenshot(path=path, full_page=False)

        await browser.close()
    return path


def analyze_screenshot_with_gpt(image_path):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}}
        ]}
    ],
    max_tokens=100,
)

    result = json.loads(response.choices[0].message.content)
    return result

async def ai_verdict(url):
    screenshot_path = await take_screenshot(url)
    verdict = analyze_screenshot_with_gpt(screenshot_path)
    print("Ai Vision Verdict:", verdict["redesign_candidate"])
    if verdict["redesign_candidate"] == "YES":
        print("Reasons:", verdict.get("reasons", []))
    return verdict

# if __name__ == "__main__":
#     import sys
#     url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
#     asyncio.run(main(url))
