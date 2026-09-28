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

// Bundle the actual browser entry: importing the npm module through esm.sh
// previously pulled a Node shim and failed on process.binding in the browser.
const { build } = await import("esbuild");
await build({
  entryPoints: ["src/ocr-browser-entry.js"],
  bundle: true,
  platform: "browser",
  format: "esm",
  target: ["es2020"],
  outfile: path.join(out, "ocr-browser.bundle.js"),
  logLevel: "warning",
  packages: "bundle",
  // Browser runtime is resolved from the package's browser export, not a Node CDN shim.
  mainFields: ["browser", "module", "main"],
  conditions: ["browser", "import", "default"],
  // opencv-js embeds Node-only conditional code that never runs in browsers.
  external: ["fs", "path"]
});
const bundledOcr = await readFile(path.join(out, "ocr-browser.bundle.js"), "utf8");
if (/process\.binding\s*\(/.test(bundledOcr)) {
  throw new Error("OCR bundle contains unsupported process.binding Node runtime");
}

// Deploy the WASM binary that matches the installed ONNX runtime JS.
// Missing WASM assets cause "no available backend found" during Ocr.create().
const onnxDist = path.resolve("node_modules/onnxruntime-web/dist");
const wasmOut = path.join(out, "assets", "ort");
await mkdir(wasmOut, { recursive: true });
const wasmFiles = [
  "ort-wasm.wasm",
  "ort-wasm-simd.wasm",
  "ort-wasm-threaded.wasm",
  "ort-wasm-simd-threaded.wasm"
];
let copiedWasm = 0;
for (const file of wasmFiles) {
  const source = path.join(onnxDist, file);
  if (existsSync(source)) {
    await cp(source, path.join(wasmOut, file));
    copiedWasm++;
  }
}
if (!copiedWasm) {
  throw new Error("ONNX Runtime WebAssembly artifacts are missing from the installed package");
}
console.log("Bundled ONNX Runtime WebAssembly files:", copiedWasm);

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
