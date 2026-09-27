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

  assert.match(adapter, /@gutenye\/ocr-browser@1\.4\.8/);
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
