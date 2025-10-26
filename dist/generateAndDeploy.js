"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndDeploySite = generateAndDeploySite;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
// no dynamic require for this; easier to just install once:
// npm install openai node-fetch
const openai_1 = __importDefault(require("openai"));
const node_fetch_1 = __importDefault(require("node-fetch"));
async function generateAndDeploySite(opts) {
    const { prompt, siteFolderName } = opts;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    if (!openaiApiKey)
        throw new Error("Missing OPENAI_API_KEY");
    if (!vercelToken)
        throw new Error("Missing VERCEL_TOKEN");
    if (!vercelProjectId)
        throw new Error("Missing VERCEL_PROJECT_ID");
    const openai = new openai_1.default({ apiKey: openaiApiKey });
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
            {
                src: "index.html",
                use: "@vercel/static"
            }
        ],
        routes: [
            { src: "/(.*)", dest: "/index.html" } // ensures all routes work
        ]
    };
    await fs.writeFile(path.join(siteDir, "vercel.json"), JSON.stringify(vercelConfig, null, 2));
    // 4. Prepare files for upload to Vercel API
    const files = [];
    for (const file of [...requiredFiles, "vercel.json"]) {
        const fileBuffer = await fs.readFile(path.join(siteDir, file));
        files.push({
            file,
            data: fileBuffer.toString("base64"),
        });
    }
    const body = {
        name: siteFolderName,
        project: vercelProjectId,
        target: "production",
        files,
    };
    const res = await (0, node_fetch_1.default)("https://api.vercel.com/v13/deployments", {
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
