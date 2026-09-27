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

function candidate({ success=true, margin=20, hulls=2, operators=2, consumables=1, instability=15 }={}) {
  return {
    evaluation: {
      success,
      marginPct: margin,
      finalInstability: instability,
      activeModules: consumables
    },
    resources: { hulls, operators, consumables, heads: hulls }
  };
}

test("v2 objective semantics rank the named metric before hull count where required", async () => {
  const solver = await loadSolver();
  const minMargin = 10;

  const lowInstMoreHulls = candidate({ hulls:3, operators:3, instability:5, margin:20 });
  const highInstFewerHulls = candidate({ hulls:1, operators:1, instability:30, margin:20 });
  assert.ok(
    solver.objectiveTuple(lowInstMoreHulls, "minimum-instability", minMargin)[1] <
    solver.objectiveTuple(highInstFewerHulls, "minimum-instability", minMargin)[1]
  );

  const lowConsumablesMoreHulls = candidate({ hulls:3, operators:3, consumables:0 });
  const highConsumablesFewerHulls = candidate({ hulls:1, operators:1, consumables:4 });
  assert.ok(
    solver.objectiveTuple(lowConsumablesMoreHulls, "minimum-consumables", minMargin)[1] <
    solver.objectiveTuple(highConsumablesFewerHulls, "minimum-consumables", minMargin)[1]
  );

  const lowCrewMoreHulls = candidate({ hulls:3, operators:2 });
  const highCrewFewerHulls = candidate({ hulls:1, operators:4 });
  assert.ok(
    solver.objectiveTuple(lowCrewMoreHulls, "minimum-crew", minMargin)[1] <
    solver.objectiveTuple(highCrewFewerHulls, "minimum-crew", minMargin)[1]
  );
});

test("v2 safety floor distinguishes safe, thin and failed candidates", async () => {
  const solver = await loadSolver();
  const safe = solver.objectiveTuple(candidate({success:true,margin:15}), "balanced-operations", 10);
  const thin = solver.objectiveTuple(candidate({success:true,margin:5}), "balanced-operations", 10);
  const failed = solver.objectiveTuple(candidate({success:false,margin:-5}), "balanced-operations", 10);

  assert.equal(safe[0], 0);
  assert.equal(thin[0], 1);
  assert.equal(failed[0], 2);
});

test("duplicate vessels can receive different deterministic variants without permutation duplicates", async () => {
  const solver = await loadSolver();
  const variants = [{key:"primary"},{key:"backup-a"},{key:"backup-b"}];
  const assignments = solver.variantAssignments(variants, 2).map(x => x.map(v => v.key));

  assert.deepEqual(assignments, [
    ["primary","primary"],
    ["primary","backup-a"],
    ["primary","backup-b"],
    ["backup-a","backup-a"],
    ["backup-a","backup-b"],
    ["backup-b","backup-b"]
  ]);
});

test("v2 UI exposes balanced objective, safety margin and per-vessel recommendation caps", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /value="balanced-operations">Balanced operations/);
  assert.match(html, /value="minimum-hulls">Minimum hulls/);
  assert.match(html, /value="minimum-crew">Minimum crew/);
  assert.match(html, /id="minimumMarginPct"[^>]*value="10"/);
  assert.match(html, /id="recommendMoleMax"/);
  assert.match(html, /id="recommendProspectorMax"/);
  assert.match(html, /id="recommendGolemMax"/);
});

test("legacy minimum-ships preference migrates to minimum-hulls", async () => {
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");
  assert.match(ops, /"minimum-ships": "minimum-hulls"/);
  assert.match(ops, /"balanced-operations"/);
});
