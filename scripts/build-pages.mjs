import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const out = path.resolve("dist");
const production =
  process.env.MFA_BUILD_TARGET === "production" ||
  process.env.CF_PAGES_BRANCH === "main";

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = [
  "index.html",
  "mechanics-guide.html",
  "v535-runtime.js",
  "fleet.html",
  "data-reference.html",
  "style.css",
  "script.js",
  "regolith-ocr.js",
  "scanner.js",
  "fleet.js",
  "operations-console.js",
  "cooperative-solver.js",
  "unified-fleet-planner.js",
  "THIRD_PARTY_NOTICES.md"
];

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing required web asset: ${file}`);
  await cp(file, path.join(out, file));
}

for (const dir of ["data", "docs"]) {
  if (existsSync(dir)) {
    await cp(dir, path.join(out, dir), { recursive: true });
  }
}

if (production) {
  const module = await import("javascript-obfuscator");
  const JavaScriptObfuscator = module.default || module;

  const jsFiles = [
    "v535-runtime.js",
    "script.js",
    "regolith-ocr.js",
    "scanner.js",
    "fleet.js",
    "operations-console.js",
    "cooperative-solver.js",
    "unified-fleet-planner.js"
  ];

  const options = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 8,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ["base64"],
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  };

  for (const file of jsFiles) {
    const filePath = path.join(out, file);
    const source = await readFile(filePath, "utf8");
    const protectedSource = JavaScriptObfuscator
      .obfuscate(source, options)
      .getObfuscatedCode();

    if (!protectedSource || protectedSource.length < 100) {
      throw new Error(`Production obfuscation failed for ${file}`);
    }

    await writeFile(
      filePath,
      `/* MFA production build · obfuscated from readable repository source */\n${protectedSource}\n`,
      "utf8"
    );
  }

  console.log("MFA production JavaScript obfuscation complete.");
} else {
  console.log("MFA readable validation build (non-production).");
}

console.log("Cloudflare Pages build complete:", out);
