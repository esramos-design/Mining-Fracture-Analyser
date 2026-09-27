import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("module contrast layer preserves native select authority", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /module-contrast-select/);
  assert.match(source, /module-contrast-native/);
  assert.match(source, /select\.value = button\.dataset\.value/);
  assert.match(source, /select\.dispatchEvent\(new Event\('change'/);
});

test("module name and attribute metadata render as distinct spans", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /module-contrast-name/);
  assert.match(source, /module-contrast-meta/);
  assert.match(source, /Active Modules/);
  assert.match(source, /Passive Modules/);
});
