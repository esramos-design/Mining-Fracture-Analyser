import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const requiredIds = [
  "rockMass","resistance","instability","gadget-list-container","gadgetSelect",
  "results","configs","multiShipContainer",
  "powerChart","modChart","resistanceChart","verdict-status","required-power","available-power","theme-label","gadgetAttributeCard","gadgetAttributeGrid","fleetEnabledMole","fleetEnabledProspector","fleetEnabledGolem","fleetAvailableMole","fleetAvailableProspector","fleetAvailableGolem"
];

const missing = requiredIds.filter(id => !html.includes(`id="${id}"`));
if (missing.length) {
  console.error("Operations console is missing required runtime IDs:", missing.join(", "));
  process.exit(1);
}

const scripts = ["script.js","scanner.js","operations-console.js","cooperative-solver.js","unified-fleet-planner.js"];
for (const script of scripts) {
  if (!html.includes(`src="${script}"`)) {
    console.error("index.html is missing script:", script);
    process.exit(1);
  }
}

console.log("Operations console DOM contract: PASS");
