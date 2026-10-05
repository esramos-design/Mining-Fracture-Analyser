import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const expected = {
  "Arbor MHV":0,
  "S0 Helix":0,
  "S00 Hofstede":0,
  "Lawson":0,
  "Arbor MH1":1,
  "Hofstede-S1":1,
  "Klein-S1":0,
  "Lancet MH1":1,
  "Helix I":2,
  "Impact I":2,
  "Pitman":2,
  "Arbor MH2":2,
  "Hofstede-S2":2,
  "Klein-S2":1,
  "Lancet MH2":2,
  "Helix II":3,
  "Impact II":3
};

test("mining laser module-slot capacities match audited catalogue", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  for (const [name,slots] of Object.entries(expected)) {
    const marker = 'name: "' + name + '"';
    const line = source.split("\n").find(x => x.includes(marker));
    assert.ok(line, name + " catalogue entry");
    assert.match(line, new RegExp("moduleSlots: " + slots + "(?:,| )"), name + " slot count");
  }
});

test("recommendation variants never assign more modules than the selected head supports", async () => {
  const solver=await readFile(new URL("../cooperative-solver.js", import.meta.url),"utf8");
  assert.match(solver,/mods=mods\.slice\(0,Math\.max\(0,n\(laser\.moduleSlots\)\)\)/);
  assert.match(solver,/moduleSlots:Math\.max\(0,Math\.floor\(n\(laser\.moduleSlots\)\)\)/);
});
