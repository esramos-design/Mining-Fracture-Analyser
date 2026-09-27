import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("module and laser selects keep native authority and rich option spans", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /class="module-color-select/);
  assert.match(source, /class="laser-color-select/);
  assert.match(source, /select-option-label/);
  assert.match(source, /select-option-meta/);
  assert.match(source, /selected-color-overlay/);
  assert.doesNotMatch(source, /<selectedcontent>/);
  assert.doesNotMatch(source, /module-contrast-shell|module-select-host|laser-select-host/);
});

test("existing onchange calculation paths remain preserved with color sync", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /togCheck\('\$\{armId\}', \$\{i\}\);syncSelectedColor\(this\);calculate\(\)/);
  assert.match(source, /updateModuleSlots\('\$\{armId\}'\);syncSelectedColor\(this\);calculate\(\)/);
});

test("color treatment remains progressive enhancement over native selects", async () => {
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(css, /appearance:\s*base-select/);
  assert.match(css, /selected-color-overlay/);
  assert.match(css, /pointer-events:none/);
  assert.match(css, /html\[data-theme="day"\]/);
  assert.match(css, /html\[data-theme="dusk"\]/);
  assert.match(css, /html\[data-theme="night"\]/);
});
