import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("module options split label and metadata without replacing native select", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  assert.match(source, /class="module-color-select/);
  assert.match(source, /module-option-label/);
  assert.match(source, /module-option-meta/);
  assert.doesNotMatch(source, /module-contrast-shell|module-select-host/);
});

test("module select onchange calculation path is preserved", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  assert.match(source, /onchange="togCheck\('\$\{armId\}', \$\{i\}\);calculate\(\)"/);
});
