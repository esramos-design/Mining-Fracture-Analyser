import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("selected laser and module values use non-interactive color overlay", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  assert.match(source, /select-color-shell/);
  assert.match(source, /selected-color-overlay/);
  assert.match(source, /function syncSelectedColor/);
  assert.match(source, /pointer-events:none/);
  assert.doesNotMatch(source, /<selectedcontent>/);
});

test("native select onchange paths remain intact", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  assert.match(source, /onchange="updateModuleSlots\('\$\{armId\}'\);syncSelectedColor\(this\);calculate\(\)"/);
  assert.match(source, /syncSelectedColor\(this\);calculate\(\)"/);
});

test("Planner Dusk palette is explicitly high-contrast", async () => {
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");
  assert.match(css, /PLANNER DUSK — vivid contrast pass/);
  assert.match(css, /--theme-page:#1F1C1A/);
  assert.match(css, /--theme-primary:#E39A32/);
  assert.match(css, /selected-color-meta/);
});
