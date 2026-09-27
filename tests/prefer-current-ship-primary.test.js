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

test("recommendation pool caps are authoritative and quantity-limited", async () => {
  const { solver } = await loadSolver();
  const max = 6;
  const caps = prefs => ({...solver.recommendationCaps(prefs, max)});

  assert.deepEqual(caps({recommendMole:true,recommendMoleMax:1,recommendProspector:false,recommendGolem:false}), {mole:1,prospector:0,golem:0});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:true,recommendProspectorMax:2,recommendGolem:false}), {mole:0,prospector:2,golem:0});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:false,recommendGolem:true,recommendGolemMax:1}), {mole:0,prospector:0,golem:1});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:true,recommendProspectorMax:2,recommendGolem:true,recommendGolemMax:1}), {mole:0,prospector:2,golem:1});
  assert.deepEqual(caps({recommendMole:true,recommendMoleMax:20,recommendProspector:true,recommendProspectorMax:20,recommendGolem:true,recommendGolemMax:20}), {mole:6,prospector:6,golem:6});
  assert.deepEqual(caps({recommendMole:false,recommendProspector:false,recommendGolem:false}), {mole:0,prospector:0,golem:0});
});
