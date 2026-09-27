import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Keep current ship primary is wired into ideal solver", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(solver, /function currentPrimaryShipType\(\)/);
  assert.match(solver, /var primaryType=p\.preferCurrentShip\?currentPrimaryShipType\(\):null/);
  assert.match(solver, /if\(primaryType\)/);
  assert.match(solver, /if\(primaryCount<1\) continue/);
  assert.match(solver, /Current ship primary/);
  assert.match(html, /Keep current active ship type in recommendation/);
});

test("Recommendation vessel-pool constraints remain independent", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");

  assert.match(solver, /moleMax=p\.recommendMole===false\?0:maxFleet/);
  assert.match(solver, /prospectorMax=p\.recommendProspector===false\?0:maxFleet/);
  assert.match(solver, /golemMax=p\.recommendGolem===false\?0:maxFleet/);
});
