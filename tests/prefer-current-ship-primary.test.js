import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Keep current ship primary is consumed by the ideal solver", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");

  assert.match(solver, /function primaryShipConstraint\(p\)/);
  assert.match(solver, /if\(!p\.preferCurrentShip\) return null/);
  assert.match(solver, /if\(primaryShip && counts\[primaryShip\]<1\) continue/);
  assert.match(solver, /Current ship primary/);
  assert.match(solver, /required in every ideal plan/);
});

test("current primary ship may remain eligible even if recommendation-pool checkbox is off", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");

  assert.match(solver, /recommendMole===false && primaryShip!=="mole"/);
  assert.match(solver, /recommendProspector===false && primaryShip!=="prospector"/);
  assert.match(solver, /recommendGolem===false && primaryShip!=="golem"/);
});
