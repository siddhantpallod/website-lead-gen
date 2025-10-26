"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateAndDeploy_1 = require("./generateAndDeploy");
(async () => {
    const { url } = await (0, generateAndDeploy_1.generateAndDeploySite)({
        prompt: "Create a simple landing page for a coffee shop called BrewHeaven",
        siteFolderName: `site-${Date.now()}`,
    });
    console.log("✅ Website deployed at:", url);
})();
