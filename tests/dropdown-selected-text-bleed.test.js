import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Fleet Planner selected-value overlay fully masks native selected text", async () => {
  const css=await readFile(new URL("../style.css",import.meta.url),"utf8");
  assert.match(css,/select\.module-color-select selectedcontent/);
  assert.match(css,/select\.laser-color-select selectedcontent/);
  assert.match(css,/visibility:hidden/);
  assert.match(css,/color:transparent !important/);
  assert.match(css,/option,[\s\S]*optgroup/);
  assert.match(css,/color:var\(--theme-select-menu-text\) !important/);
});
