import assert from "node:assert/strict";
import test from "node:test";
import { calculateV535 } from "../src/core/v535-engine.js";

test("uncapped resistance continues to move above the 100 percent transfer threshold", () => {
  const high = calculateV535({
    rockMass: 10000,
    resistance: 140,
    instability: 10,
    arms: [{enabled:true,power:1000,resistanceEffect:0,instabilityEffect:0,modules:[]}]
  });
  const lower = calculateV535({
    rockMass: 10000,
    resistance: 115,
    instability: 10,
    arms: [{enabled:true,power:1000,resistanceEffect:0,instabilityEffect:0,modules:[]}]
  });

  assert.equal(high.finalResistance, 100);
  assert.equal(lower.finalResistance, 100);
  assert.equal(high.uncappedResistance, 140);
  assert.equal(lower.uncappedResistance, 115);
  assert.ok(lower.uncappedResistance < high.uncappedResistance);
  assert.equal(high.requiredPower, 999999);
  assert.equal(lower.requiredPower, 999999);
});

test("resistance-reduction equipment can move an over-100 target below the block threshold", () => {
  const r = calculateV535({
    rockMass: 10000,
    resistance: 120,
    instability: 10,
    arms: [{enabled:true,power:3150,resistanceEffect:-30,instabilityEffect:0,modules:[]}],
    gadget:{name:"Sabir",reduction:-50,instabilityEffect:15}
  });

  assert.ok(Math.abs(r.uncappedResistance - 42) < 1e-9);
  assert.ok(Math.abs(r.finalResistance - 42) < 1e-9);
  assert.ok(r.requiredPower < 999999);
});

test("UI displays uncapped resistance but retains capped resistance for verdict logic", async () => {
  const {readFile}=await import("node:fs/promises");
  const script=await readFile(new URL("../script.js",import.meta.url),"utf8");
  const ops=await readFile(new URL("../operations-console.js",import.meta.url),"utf8");
  const solver=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");

  assert.match(script,/displayResistance: displayRes/);
  assert.match(script,/Effective Resistance/);
  assert.match(ops,/currentSimState\.displayResistance/);
  assert.match(ops,/const resistanceBlocked = Number\(currentSimState\.resistance\) >= 100/);
  assert.match(solver,/displayResistance:Number\.isFinite\(calc\.uncappedResistance\)/);
});
