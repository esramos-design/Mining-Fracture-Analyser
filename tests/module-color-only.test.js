import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("module and laser selects keep native authority and use rich option spans", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /class="module-color-select/);
  assert.match(source, /class="laser-color-select/);
  assert.match(source, /<selectedcontent><\/selectedcontent>/);
  assert.match(source, /select-option-label/);
  assert.match(source, /select-option-meta/);
  assert.doesNotMatch(source, /module-contrast-shell|module-select-host|laser-select-host/);
});

test("existing onchange calculation paths are preserved", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /onchange="togCheck\('\$\{armId\}', \$\{i\}\);calculate\(\)"/);
  assert.match(source, /onchange="updateModuleSlots\('\$\{armId\}'\); calculate\(\)"/);
});

test("color completion is CSS-only presentation over native selects", async () => {
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(css, /appearance:\s*base-select/);
  assert.match(css, /selectedcontent/);
  assert.match(css, /html\[data-theme="day"\]/);
  assert.match(css, /html\[data-theme="dusk"\]/);
  assert.match(css, /html\[data-theme="night"\]/);
});
