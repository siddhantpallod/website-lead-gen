import * as fs from "fs/promises";
import * as path from "path";
// no dynamic require for this; easier to just install once:
// npm install openai node-fetch
import OpenAI from "openai";
import fetch from "node-fetch";
export async function generateAndDeploySite(opts) {
    const { prompt, siteFolderName } = opts;
    const openaiApiKey = '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';
    const vercelToken = 'Replace With Your Vercel Token';
    const vercelProjectId = 'prj_wORquIIFJ5byz60EvpfYsqEABm4I';
    if (!openaiApiKey)
        throw new Error("Missing OPENAI_API_KEY");
    if (!vercelToken)
        throw new Error("Missing VERCEL_TOKEN");
    if (!vercelProjectId)
        throw new Error("Missing VERCEL_PROJECT_ID");
    const openai = new OpenAI({ apiKey: openaiApiKey });
    // 1. Generate structured code
    const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `
You are a web developer. Generate a simple static website consisting of 3 files:
1. index.html
2. style.css
3. script.js

Return them ONLY as a JSON object like this:

{
  "index.html": "<!DOCTYPE html> ...",
  "style.css": "body { ... }",
  "script.js": "console.log('...');"
}

Ensure the HTML links to style.css and script.js properly.
Do NOT include markdown or explanations.`,
            },
            { role: "user", content: prompt },
        ],
    });
    const content = response.choices[0].message?.content;
    if (!content)
        throw new Error("No content returned from OpenAI");
    let siteFiles;
    try {
        siteFiles = JSON.parse(content);
    }
    catch (err) {
        throw new Error("OpenAI output was not valid JSON:\n" + content);
    }
    // 2. Write files
    const siteDir = path.resolve(process.cwd(), "generated-sites", siteFolderName);
    await fs.mkdir(siteDir, { recursive: true });
    const requiredFiles = ["index.html", "style.css", "script.js"];
    for (const file of requiredFiles) {
        if (!siteFiles[file])
            throw new Error(`Missing ${file} in model output`);
        await fs.writeFile(path.join(siteDir, file), siteFiles[file]);
    }
    // 3. Add a Vercel config for static deployment (API-friendly)
    const vercelConfig = {
        version: 2,
        public: true,
        builds: [
            { src: "index.html", use: "@vercel/static" },
            { src: "style.css", use: "@vercel/static" },
            { src: "script.js", use: "@vercel/static" }
        ],
        routes: [
            // Serve CSS and JS files normally
            { src: "/(style\\.css|script\\.js)", dest: "/$1" },
            // All other routes fallback to index.html
            { src: "/(.*)", dest: "/index.html" }
        ]
    };
    await fs.writeFile(path.join(siteDir, "vercel.json"), JSON.stringify(vercelConfig, null, 2));
    // 4. Prepare files for upload to Vercel API
    const files = [];
    for (const file of [...requiredFiles, "vercel.json"]) {
        const fileContent = await fs.readFile(path.join(siteDir, file), "utf-8");
        files.push({
            file,
            data: fileContent, // <-- just the UTF-8 string, no Base64
        });
    }
    const body = {
        name: siteFolderName,
        project: vercelProjectId,
        target: "production",
        files,
    };
    const res = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const json = (await res.json());
    if (!res.ok || !json.url) {
        console.error("Vercel error:", json);
        throw new Error(`Vercel deploy failed: ${json.error || "Unknown error"}`);
    }
    return { url: json.url };
}
