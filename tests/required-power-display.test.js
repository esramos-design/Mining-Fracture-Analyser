import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { calculateV535 } from "../src/core/v535-engine.js";

test("blocked current loadout keeps numeric baseline required power", () => {
  const r = calculateV535({
    rockMass: 10000,
    resistance: 80,
    instability: 10,
    arms: [{
      enabled: true,
      power: 1000,
      resistanceEffect: 25,
      instabilityEffect: 0,
      modules: []
    }]
  });

  assert.equal(r.requiredPower, 999999);
  assert.equal(r.success, false);
  assert.ok(Number.isFinite(r.baselineRequiredPower));
  assert.ok(r.baselineRequiredPower > 0);
  assert.equal(Math.round(r.baselineRequiredPower), 10000);
});

test("operations console uses audited engine requirement, not old inverted formula", async () => {
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");
  const script = await readFile(new URL("../script.js", import.meta.url), "utf8");

  assert.match(ops, /currentSimState\.requiredPower/);
  assert.match(ops, /currentSimState\.baselineRequiredPower/);
  assert.doesNotMatch(ops, /mass \* \(1 - currentSimState\.resistance \/ 100\)\) \/ 5/);
  assert.doesNotMatch(ops, /required === Infinity \? "IMPOSSIBLE"/);
  assert.match(script, /baselineRequiredPower: calc\.baselineRequiredPower/);
});

test("required power shortfall is rendered numerically and in red", async () => {
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(ops, /power-shortfall/);
  assert.match(solver, /displayRequired/);
  assert.doesNotMatch(solver, /Number\.isFinite\(e\.required\).*Impossible/);
  assert.match(css, /#required-power\.power-shortfall/);
  assert.match(css, /\.solver-option-metrics \.power-shortfall/);
});
