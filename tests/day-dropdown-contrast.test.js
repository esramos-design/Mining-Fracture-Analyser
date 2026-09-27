import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Planner Day open mining selects use dark popup with bright labels and cyan metadata", async () => {
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(css, /PLANNER DAY — OPEN LASER\/MODULE POPUP CONTRAST/);
  assert.match(css, /background:#0B1620 !important/);
  assert.match(css, /color:#F8FBFF !important/);
  assert.match(css, /color:#39C5FF !important/);
  assert.match(css, /background:#D9E2EA !important/);
});

test("Planner Day closed selected values remain light-theme colors", async () => {
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(css, /html\[data-theme="day"\] \.selected-color-overlay/);
  assert.match(css, /background:#FFFDF8 !important/);
  assert.match(css, /html\[data-theme="day"\] \.selected-color-label/);
  assert.match(css, /color:#17324D !important/);
  assert.match(css, /html\[data-theme="day"\] \.selected-color-meta/);
  assert.match(css, /color:#007AA8 !important/);
});
