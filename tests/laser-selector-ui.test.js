import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("laser selectors preserve native select authority behind readable listbox", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /class="laser-native-select"/);
  assert.match(source, /class="laser-select-host"/);
  assert.match(source, /function buildLaserMenu/);
  assert.match(source, /function syncLaserSelector/);
  assert.match(source, /select\.selectedIndex = index/);
  assert.match(source, /select\.dispatchEvent\(new Event\('change'/);
});

test("laser listbox separates head name from attribute metadata", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(source, /laser-choice-name/);
  assert.match(source, /laser-choice-meta/);
  assert.match(source, /laser-trigger-copy/);
});
