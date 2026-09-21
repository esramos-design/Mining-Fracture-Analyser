import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const out = path.resolve("dist");

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = [
  "index.html",
  "fleet.html",
  "style.css",
  "script.js",
  "scanner.js",
  "ai-foreman.js",
  "fleet.js"
];

for (const file of files) {
  if (!existsSync(file)) {
    throw new Error(`Missing required web asset: ${file}`);
  }
  await cp(file, path.join(out, file));
}

if (existsSync("data")) {
  await cp("data", path.join(out, "data"), { recursive: true });
}

console.log("Cloudflare Pages build complete:", out);
