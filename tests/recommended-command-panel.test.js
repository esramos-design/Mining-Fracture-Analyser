import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Recommended Plan uses decision-first command hierarchy", async () => {
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
  const solver=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");
  assert.match(html,/<h2>Recommended Plan<\/h2>/);
  assert.match(html,/Team Availability/);
  assert.match(html,/recommendation-resource-panel/);
  assert.match(solver,/function decisionHeroHtml/);
  assert.match(solver,/function planSummaryHtml/);
  assert.match(solver,/01 · FIT THIS/);
  assert.match(solver,/02 · UNDERSTAND/);
  assert.match(solver,/03 · COMPARE/);
  assert.match(solver,/04 · EXPLORE/);
  assert.match(solver,/05 · AUDIT/);
});

test("loadout and live team availability remain separate from Actual Fleet Planner", async () => {
  const solver=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");
  assert.match(solver,/vesselPlansHtml\(o,false\)/);
  assert.doesNotMatch(solver,/function readinessControlsHtml/);
  assert.match(solver,/teamAvailabilityPanel/);
  assert.match(solver,/solveIdeal\(state,p,strat\)/);
  assert.match(solver,/optionHtml\(best,objective,solved\.minimumMarginPct,state,p\)/);
  assert.match(solver,/portfolioHtml\(solved,objective\)/);
  assert.match(solver,/targetBasisHtml\(ctx,p\)/);
});

test("Recommended Plan presentation does not modify protected fracture runtime", async () => {
  const solver=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");
  assert.match(solver,/MFAV535\.calculateV535/);
  assert.doesNotMatch(solver,/function calculateV535\s*\(/);
});
