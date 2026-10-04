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
  return context.window.MFACoopSolver;
}

test("team availability can replace an unavailable MOLE with Prospector/Golem search space", async () => {
  const solver = await loadSolver();
  const caps = {...solver.recommendationCaps({
    recommendMole:false,
    recommendMoleMax:0,
    recommendProspector:true,
    recommendProspectorMax:2,
    recommendGolem:true,
    recommendGolemMax:1
  }, 6)};

  assert.deepEqual(caps, {mole:0,prospector:2,golem:1});
});

test("Team Availability controls recalculate immediately", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="teamAvailabilityPanel"[^>]*open/);
  assert.match(html, /id="recommendMole"[^>]*onchange="MFAOps\.syncRecommendationPool\('mole'\);MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendProspectorMax"[^>]*onchange="MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendGolemMax"[^>]*onchange="MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /immediately recalculates the best loadout/);
});

test("old confirmation-only recommendation readiness UI is no longer emitted", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");
  assert.doesNotMatch(solver, /function readinessControlsHtml/);
  assert.doesNotMatch(solver, /Recommendation remains unchanged/);
  assert.match(solver, /CAN'T PROVIDE THIS\? CHANGE TEAM AVAILABILITY/);
});
