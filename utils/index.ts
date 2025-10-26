import { generateAndDeploySite } from "./generateAndDeploySite";

(async () => {
  const { url } = await generateAndDeploySite({
    prompt: "Create a simple landing page for a coffee shop called BrewHeaven",
    siteFolderName: `site-${Date.now()}`,
  });

  console.log("✅ Website deployed at:", url);
})();
