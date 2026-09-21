import test from "node:test";
import assert from "node:assert/strict";
import { calculateV535 } from "../src/core/v535-engine.js";

function approx(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} ≈ ${expected}`);
}

test("no fleet: preserves target modifiers and cannot fracture", () => {
  const r = calculateV535({
    rockMass: 23922,
    resistance: 16,
    instability: 20,
    arms: []
  });

  assert.equal(r.totalPower, 0);
  approx(r.finalResistance, 16);
  approx(r.finalInstability, 20);
  approx(r.requiredPower, 23922 * 0.84 / 5);
  assert.equal(r.success, false);
  assert.equal(r.activeArms, 0);
});

test("single Helix I baseline", () => {
  const r = calculateV535({
    rockMass: 10000,
    resistance: 20,
    instability: 10,
    arms: [{
      enabled: true,
      power: 3150,
      resistanceEffect: -30,
      instabilityEffect: 0,
      modules: []
    }]
  });

  approx(r.finalResistance, 14);
  approx(r.finalInstability, 10);
  approx(r.requiredPower, 1720);
  assert.equal(r.totalPower, 3150);
  assert.equal(r.success, true);
});

test("active module only applies when toggled active", () => {
  const inactive = calculateV535({
    rockMass: 10000,
    resistance: 20,
    instability: 10,
    arms: [{
      enabled: true,
      power: 3150,
      resistanceEffect: -30,
      instabilityEffect: 0,
      modules: [{
        name: "Surge",
        activation: "Active",
        active: false,
        multiplier: 1.5,
        resistanceEffect: -15,
        instabilityEffect: 10
      }]
    }]
  });

  const active = calculateV535({
    rockMass: 10000,
    resistance: 20,
    instability: 10,
    arms: [{
      enabled: true,
      power: 3150,
      resistanceEffect: -30,
      instabilityEffect: 0,
      modules: [{
        name: "Surge",
        activation: "Active",
        active: true,
        multiplier: 1.5,
        resistanceEffect: -15,
        instabilityEffect: 10
      }]
    }]
  });

  assert.equal(inactive.totalPower, 3150);
  assert.equal(active.totalPower, 4725);
  approx(inactive.finalResistance, 14);
  approx(active.finalResistance, 11.9);
  approx(active.finalInstability, 11);
});

test("passive module always applies", () => {
  const r = calculateV535({
    rockMass: 12000,
    resistance: 25,
    instability: 30,
    arms: [{
      enabled: true,
      power: 2100,
      resistanceEffect: 10,
      instabilityEffect: -10,
      modules: [{
        name: "Rieger",
        activation: "Passive",
        multiplier: 1.15,
        resistanceEffect: 0,
        instabilityEffect: 0
      }]
    }]
  });

  approx(r.totalPower, 2415);
  approx(r.finalResistance, 27.5);
  approx(r.finalInstability, 27);
});

test("multiple arms use geometric mean for resistance and instability modifiers", () => {
  const r = calculateV535({
    rockMass: 15000,
    resistance: 20,
    instability: 40,
    arms: [
      { enabled: true, power: 3150, resistanceEffect: -30, instabilityEffect: 0, modules: [] },
      { enabled: true, power: 2100, resistanceEffect: 10, instabilityEffect: -10, modules: [] }
    ]
  });

  const expectedResMult = Math.sqrt(0.7 * 1.1);
  const expectedInstMult = Math.sqrt(1.0 * 0.9);
  approx(r.finalResistance, 20 * expectedResMult);
  approx(r.finalInstability, 40 * expectedInstMult);
  assert.equal(r.totalPower, 5250);
});

test("gadget applies after arm aggregation", () => {
  const r = calculateV535({
    rockMass: 15000,
    resistance: 20,
    instability: 40,
    arms: [
      { enabled: true, power: 3150, resistanceEffect: -30, instabilityEffect: 0, modules: [] }
    ],
    gadget: {
      name: "Sabir",
      reduction: -50,
      instabilityEffect: 15
    }
  });

  approx(r.finalResistance, 7);
  approx(r.finalInstability, 46);
});

test("100 percent or greater final resistance uses impossible sentinel", () => {
  const r = calculateV535({
    rockMass: 10000,
    resistance: 100,
    instability: 10,
    arms: [{
      enabled: true,
      power: 1000,
      resistanceEffect: 0,
      instabilityEffect: 0,
      modules: []
    }]
  });

  assert.equal(r.requiredPower, 999999);
  assert.equal(r.success, false);
});

test("negative final modifiers are clamped to zero", () => {
  const r = calculateV535({
    rockMass: 10000,
    resistance: 20,
    instability: 10,
    arms: [{
      enabled: true,
      power: 1000,
      resistanceEffect: -200,
      instabilityEffect: -200,
      modules: []
    }]
  });

  assert.equal(r.finalResistance, 0);
  assert.equal(r.finalInstability, 0);
});
