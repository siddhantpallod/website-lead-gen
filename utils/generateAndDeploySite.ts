import fs from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";
import fetch from "node-fetch";  // or `undici` or whatever you prefer

// You might want to install: `npm install node-fetch @types/node-fetch`
// and also `npm install openai @types/openai` if using official client

import OpenAI from "openai";

interface GenerateAndDeployOptions {
  prompt: string;
  siteFolderName: string;  // e.g., "site-1234"
}

export async function generateAndDeploySite(
  opts: GenerateAndDeployOptions
): Promise<{ url: string }> {
  const { prompt, siteFolderName } = opts;

  const openai = new OpenAI({
    apiKey: "Enter Your OpenAI API Key Here",
  });

  // 1. Generate website code via OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",  // or whichever model you have access to
    messages: [
      {
        role: "system",
        content:
          "You are a web developer. Generate a complete static website (HTML, CSS, JS) given the user's prompt. Return the code in a zip-friendly form or multiple files.",
      },
      { role: "user", content: prompt },
    ],
  });

  const code = response.choices[0].message?.content;
  if (!code) {
    throw new Error("OpenAI did not return any code");
  }

  // 2. Write code to a folder
  const siteDir = path.resolve(process.cwd(), "generated-sites", siteFolderName);
  await fs.mkdir(siteDir, { recursive: true });

  // **Important**: You will need some convention for how the code is returned:
  // For example, the model might return something like:
  // ```html
  // <!-- file: index.html -->
  // <html> … </html>
  // <!-- file: style.css -->
  // body { … }
  // ```
  //
  // For simplicity, assume the output is one file "index.html".
  await fs.writeFile(path.join(siteDir, "index.html"), code);

  // (Optionally) copy a minimal package.json if using build tools or not.
  // For static HTML, this might not be necessary.

  // 3. Deploy to Vercel via REST API (upload files)
  const VERCEL_API = "https://api.vercel.com/v13/deployments";

  // Read file(s) and convert to upload structure
  const fileBuffer = await fs.readFile(path.join(siteDir, "index.html"));
  const fileData = fileBuffer.toString("base64");

  const body = {
    name: siteFolderName,
    project: process.env.VERCEL_PROJECT_ID!,
    teamId: process.env.VERCEL_TEAM_ID,
    target: "production",
    files: [
      {
        file: "index.html",
        data: fileData,
      },
    ],
  };

  const res = await fetch(VERCEL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    console.error("Vercel deployment error:", json);
    throw new Error(`Vercel deploy failed: ${json.error || JSON.stringify(json)}`);
  }

  if (!json.url) {
    throw new Error("Vercel did not return a deployment URL");
  }

  return { url: json.url as string };
}
