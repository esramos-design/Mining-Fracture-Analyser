import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("module selectors preserve native select authority behind readable listbox", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /class="module-native-select"/);
  assert.match(source, /class="module-select-host"/);
  assert.match(source, /function initModuleSelectors/);
  assert.match(source, /function syncModuleSelector/);
  assert.match(source, /select\.dispatchEvent\(new Event\('change'/);
});

test("module listbox separates module names from formatted attributes", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /module-choice-name/);
  assert.match(source, /module-choice-meta/);
  assert.match(source, /Active Modules/);
  assert.match(source, /Passive Modules/);
});
