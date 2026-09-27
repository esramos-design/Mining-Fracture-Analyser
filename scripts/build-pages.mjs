import { cp, mkdir, rm } from "node:fs/promises";
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

console.log("Cloudflare Pages build complete:", out);
