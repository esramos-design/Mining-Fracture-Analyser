import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const requiredIds = [
  "rockMass","resistance","instability","gadget-list-container","gadgetSelect",
  "results","configs","shipSelectToAdd","selectedShipImage","multiShipContainer",
  "powerChart","modChart","resistanceChart","ai-section","ai-content","ai-loading",
  "ai-custom-input","verdict-status","required-power","available-power"
];

const missing = requiredIds.filter(id => !html.includes(`id="${id}"`));
if (missing.length) {
  console.error("Operations console is missing required runtime IDs:", missing.join(", "));
  process.exit(1);
}

const scripts = ["script.js","ai-foreman.js","scanner.js","operations-console.js"];
for (const script of scripts) {
  if (!html.includes(`src="${script}"`)) {
    console.error("index.html is missing script:", script);
    process.exit(1);
  }
}

console.log("Operations console DOM contract: PASS");
