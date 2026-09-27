import assert from "node:assert/strict";
import test from "node:test";

import { nativeBrief, extractWorkersAIText } from "../functions/api/foreman.js";

test("native Foreman produces viable deterministic guidance", () => {
  const text = nativeBrief("strategy", {
    mass: 23922,
    resistance: 16,
    instability: 20,
    power: 5000,
    activeArms: 2,
    success: true
  });

  assert.match(text, /FRACTURE VIABLE/);
  assert.match(text, /23922 kg/);
  assert.match(text, /5000 MW/);
});

test("native risk briefing does not invent explosion probability", () => {
  const text = nativeBrief("risk", {
    mass: 12000,
    resistance: 40,
    instability: 75,
    power: 2000,
    activeArms: 1,
    success: false
  });

  assert.match(text, /FRACTURE NOT VIABLE/);
  assert.match(text, /does not infer an explosion probability/i);
});

test("Workers AI response extraction accepts chat completion shape", () => {
  const text = extractWorkersAIText({
    choices: [{ message: { content: "Proceed with the verified MFA plan." } }]
  });
  assert.equal(text, "Proceed with the verified MFA plan.");
});

test("Workers AI response extraction accepts response shape", () => {
  assert.equal(
    extractWorkersAIText({ response: "Native Workers AI response" }),
    "Native Workers AI response"
  );
});
