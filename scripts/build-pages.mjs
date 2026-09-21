import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const out = path.resolve("dist");

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = [
  "index.html",
  "v535-runtime.js",
  "fleet.html",
  "data-reference.html",
  "style.css",
  "script.js",
  "scanner.js",
  "ai-foreman.js",
  "fleet.js",
  "operations-console.js",
  "cooperative-solver.js",
  "unified-fleet-planner.js"
];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing required web asset: ${file}`);
  await cp(file, path.join(out, file));
}

if (existsSync("data")) {
  await cp("data", path.join(out, "data"), { recursive: true });
}

// Cloudflare Pages has the same-origin /api/foreman Function.
// Keep source index.html backend-neutral so GitHub Pages LIVE is not broken.
const indexPath = path.join(out, "index.html");
let indexHtml = await readFile(indexPath, "utf8");
const sourceConfig = 'aiEndpoint: ""';
if (!indexHtml.includes(sourceConfig)) {
  throw new Error("Expected backend-neutral MFA_CONFIG.aiEndpoint in index.html");
}
indexHtml = indexHtml.replace(sourceConfig, 'aiEndpoint: "/api/foreman"');
await writeFile(indexPath, indexHtml, "utf8");

console.log("Cloudflare Pages build complete:", out);
