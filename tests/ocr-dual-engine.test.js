import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Paddle OCR adapter is loaded before legacy scanner", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const paddle = html.indexOf('<script src="regolith-ocr.js"></script>');
  const scanner = html.indexOf('<script src="scanner.js"></script>');

  assert.ok(paddle >= 0);
  assert.ok(scanner > paddle);
  assert.match(html, /OCR Paddle \+ Fallback/);
});

test("dual OCR scanner uses Paddle as primary and Tesseract as fallback", async () => {
  const scanner = await readFile(new URL("../scanner.js", import.meta.url), "utf8");

  assert.match(scanner, /MFARegolithOCR\.scan/);
  assert.match(scanner, /runLegacyOCR/);
  assert.match(scanner, /if \(paddle && paddle\.valid\)/);
  assert.match(scanner, /else if \(legacy && legacy\.valid\)/);
  assert.match(scanner, /Paddle remains primary in ALPHA/);
});

test("Regolith-compatible adapter is target-input only and pins runtime assets", async () => {
  const adapter = await readFile(new URL("../regolith-ocr.js", import.meta.url), "utf8");

  assert.match(adapter, /ocr-browser\.bundle\.js/);
  assert.match(adapter, /@gutenye\/ocr-models@1\.4\.2/);
  assert.match(adapter, /ch_PP-OCRv4_det_infer\.onnx/);
  assert.match(adapter, /ch_PP-OCRv4_rec_infer\.onnx/);
  assert.match(adapter, /ppocr_keys_v1\.txt/);
  assert.doesNotMatch(adapter, /calculateV535/);
  assert.doesNotMatch(adapter, /MFACoopSolver/);
  assert.doesNotMatch(adapter, /MFAFleetPlanner/);
});

test("OCR source attribution is propagated to Target Acquisition UI", async () => {
  const scanner = await readFile(new URL("../scanner.js", import.meta.url), "utf8");
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");

  assert.match(scanner, /engine: sourceLabel/);
  assert.match(ops, /event\.detail\?\.engine \|\| "OCR"/);
  assert.match(ops, /markSource\(field, source\)/);
});

test("third-party attribution is retained", async () => {
  const notice = await readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");

  assert.match(notice, /RegolithCo\/RegolithCo-OCR/);
  assert.match(notice, /ISC License/);
  assert.match(notice, /Guten OCR/);
  assert.match(notice, /Apache-2\.0/);
});

test("OCR browser runtime is built locally and not fetched from esm.sh", async () => {
  const adapter = await readFile(new URL("../regolith-ocr.js", import.meta.url), "utf8");
  const build = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.doesNotMatch(adapter, /esm\.sh/);
  assert.match(build, /platform: "browser"/);
  assert.match(build, /ocr-browser\.bundle\.js/);
  assert.equal(pkg.dependencies["@gutenye/ocr-browser"], "1.4.8");
});
test("legacy fallback respects named fields and operator confirmation precedes writes", async () => {
  const source = await readFile(new URL("../scanner.js", import.meta.url), "utf8");
  const vm = await import("node:vm");
  const ctx = {window:{},Tesseract:{},document:{createElement(){},getElementById(){return null}},console};
  vm.runInNewContext(source,ctx);
  const parse = ctx.window.MFAOCR.parseLegacyText;
  const result = parse("SCAN RESULTS\nMASS: 47167\nRESISTANCE: 30%\nINSTABILITY: 574.77");
  assert.equal(result.valid,true);
  assert.equal(result.mass,47167);
  assert.equal(result.resistance,30);
  assert.equal(result.instability,574.77);
  assert.equal(parse("COMPOSITION\nQUANTANIUM 78.04%\nSHIP 47167").valid,false);
  const section=source.slice(source.indexOf("function applyResult("),source.indexOf("async function runOCR("));
  assert.ok(section.indexOf("window.confirm(")<section.indexOf('document.getElementById("rockMass").value'));
});

test("Paddle rock parser preserves the exact HUD instability value", async () => {
  const source = await readFile(new URL("../regolith-ocr.js", import.meta.url), "utf8");
  const {runInNewContext} = await import("node:vm");
  const context={window:{}};
  runInNewContext(source,context);
  const parsed=context.window.MFARegolithOCR.parseRockText(
    "SCAN RESULTS\\nQUANTANIUM (RAW)\\nMASS: 47167\\nRESISTANCE: 30%\\nINSTABILITY: 574.77\\nCOMPOSITION: 18.55 SCU"
  );
  assert.equal(parsed.valid,true);
  assert.equal(parsed.mass,47167);
  assert.equal(parsed.resistance,30);
  assert.equal(parsed.instability,574.77);
});
