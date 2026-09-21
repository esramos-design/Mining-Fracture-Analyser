import test from "node:test";
import assert from "node:assert/strict";
import "../v535-runtime.js";
import { calculateV535 as calculateCore } from "../src/core/v535-engine.js";

const calculateRuntime = globalThis.MFAV535.calculateV535;

function approx(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} ≈ ${expected}`);
}

function assertSameResult(actual, expected) {
  approx(actual.totalPower, expected.totalPower);
  approx(actual.finalResistance, expected.finalResistance);
  approx(actual.finalInstability, expected.finalInstability);
  approx(actual.requiredPower, expected.requiredPower);
  assert.equal(actual.success, expected.success);
  assert.equal(actual.activeArms, expected.activeArms);
}

test("browser runtime remains identical to protected v5.35 core", () => {
  const input = {
    rockMass: 23922,
    resistance: 16,
    instability: 20,
    arms: [
      {
        enabled: true,
        power: 4080,
        resistanceEffect: -30,
        instabilityEffect: 0,
        modules: [
          { name: "Surge", activation: "Active", active: true, multiplier: 1.5, resistanceEffect: -15, instabilityEffect: 10 },
          { name: "Rieger-C3", activation: "Passive", active: true, multiplier: 1.25, resistanceEffect: 0, instabilityEffect: 0 },
          { name: "Torrent III", activation: "Passive", active: true, multiplier: 1.0, resistanceEffect: 0, instabilityEffect: 0 }
        ]
      },
      {
        enabled: true,
        power: 3600,
        resistanceEffect: 0,
        instabilityEffect: -10,
        modules: [
          { name: "Focus III", activation: "Passive", active: true, multiplier: 0.95, resistanceEffect: 0, instabilityEffect: 0 },
          { name: "Focus III", activation: "Passive", active: true, multiplier: 0.95, resistanceEffect: 0, instabilityEffect: 0 }
        ]
      },
      {
        enabled: true,
        power: 3360,
        resistanceEffect: 10,
        instabilityEffect: -10,
        modules: [
          { name: "Torrent III", activation: "Passive", active: true, multiplier: 1.0, resistanceEffect: 0, instabilityEffect: 0 },
          { name: "FLTR-XL", activation: "Passive", active: true, multiplier: 1.0, resistanceEffect: 0, instabilityEffect: 0 }
        ]
      }
    ],
    gadget: { name: "BoreMax", reduction: 10, instabilityEffect: -70 }
  };

  assertSameResult(calculateRuntime(input), calculateCore(input));
});

test("recommended configuration and copied active configuration calculate identically", () => {
  const target = { rockMass: 23922, resistance: 16, instability: 20 };
  const moduleCatalog = {
    "Surge": { name: "Surge", activation: "Active", multiplier: 1.5, resistanceEffect: -15, instabilityEffect: 10 },
    "Rieger-C3": { name: "Rieger-C3", activation: "Passive", multiplier: 1.25, resistanceEffect: 0, instabilityEffect: 0 },
    "Torrent III": { name: "Torrent III", activation: "Passive", multiplier: 1.0, resistanceEffect: 0, instabilityEffect: 0 }
  };

  const recommendedArm = {
    enabled: true,
    power: 4080,
    resistanceEffect: -30,
    instabilityEffect: 0,
    modules: ["Surge", "Rieger-C3", "Torrent III"].map(name => ({ ...moduleCatalog[name], active: true }))
  };

  // This is what Fleet Planner must produce after copying the complete recommendation.
  const copiedActiveArm = {
    enabled: true,
    power: 4080,
    resistanceEffect: -30,
    instabilityEffect: 0,
    modules: [
      { ...moduleCatalog["Surge"], active: true },
      { ...moduleCatalog["Rieger-C3"], active: true },
      { ...moduleCatalog["Torrent III"], active: true }
    ]
  };

  const gadget = { name: "BoreMax", reduction: 10, instabilityEffect: -70 };

  const recommended = calculateRuntime({ ...target, arms: [recommendedArm], gadget });
  const copied = calculateRuntime({ ...target, arms: [copiedActiveArm], gadget });

  assertSameResult(copied, recommended);
});

test("leaving recommended Active module off must change the result", () => {
  const base = {
    rockMass: 23922,
    resistance: 16,
    instability: 20,
    gadget: { name: "None", reduction: 0, instabilityEffect: 0 }
  };

  const on = calculateRuntime({
    ...base,
    arms: [{
      enabled: true,
      power: 4080,
      resistanceEffect: -30,
      instabilityEffect: 0,
      modules: [{ name: "Surge", activation: "Active", active: true, multiplier: 1.5, resistanceEffect: -15, instabilityEffect: 10 }]
    }]
  });

  const off = calculateRuntime({
    ...base,
    arms: [{
      enabled: true,
      power: 4080,
      resistanceEffect: -30,
      instabilityEffect: 0,
      modules: [{ name: "Surge", activation: "Active", active: false, multiplier: 1.5, resistanceEffect: -15, instabilityEffect: 10 }]
    }]
  });

  assert.notEqual(on.totalPower, off.totalPower);
  assert.notEqual(on.finalResistance, off.finalResistance);
});
