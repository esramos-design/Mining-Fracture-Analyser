import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

async function loadSolver() {
  const source = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");
  const context = {
    window: {},
    document: {
      getElementById() { return null; },
      querySelectorAll() { return []; }
    },
    console
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { source, solver: context.window.MFACoopSolver };
}

test("ideal recommendation is not coupled to actual Fleet Planner primary vessel", async () => {
  const { source } = await loadSolver();

  assert.doesNotMatch(source, /primaryShipConstraint/);
  assert.doesNotMatch(source, /preferCurrentShip/);
  assert.match(source, /Fleet Planner influence/);
  assert.match(source, /None · target-driven ideal/);
});

test("recommendation pool caps are authoritative for all checkbox combinations", async () => {
  const { solver } = await loadSolver();
  const max = 6;
  const caps = prefs => solver.recommendationCaps(prefs, max);

  assert.deepEqual(caps({recommendMole:true,recommendProspector:false,recommendGolem:false}), {mole:6,prospector:0,golem:0});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:true,recommendGolem:false}), {mole:0,prospector:6,golem:0});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:false,recommendGolem:true}), {mole:0,prospector:0,golem:6});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:true,recommendGolem:true}), {mole:0,prospector:6,golem:6});
  assert.deepEqual(caps({recommendMole:true,recommendProspector:true,recommendGolem:false}), {mole:6,prospector:6,golem:0});
  assert.deepEqual(caps({recommendMole:true,recommendProspector:true,recommendGolem:true}), {mole:6,prospector:6,golem:6});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:false,recommendGolem:false}), {mole:0,prospector:0,golem:0});
});
