import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("recommendation resource pool is shown inside Recommended Plan", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  const solutionIndex = html.indexOf("<h2>Recommended Plan</h2>");
  const poolIndex = html.indexOf("Planning Resources");
  const configsIndex = html.indexOf('id="configs"');

  assert.ok(solutionIndex >= 0);
  assert.ok(poolIndex > solutionIndex);
  assert.ok(configsIndex > poolIndex);

  assert.match(html, /id="recommendMole"[^>]*onchange="MFAOps\.syncRecommendationPool\('mole'\);MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendProspector"[^>]*onchange="MFAOps\.syncRecommendationPool\('prospector'\);MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendGolem"[^>]*onchange="MFAOps\.syncRecommendationPool\('golem'\);MFAOps\.savePreferences\(\);calculate\(\)"/);

  assert.equal((html.match(/id="recommendMole"/g) || []).length, 1);
  assert.equal((html.match(/id="recommendProspector"/g) || []).length, 1);
  assert.equal((html.match(/id="recommendGolem"/g) || []).length, 1);
});

test("copy distinguishes recommendation planning limits from actual fleet status", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /What MFA is allowed to recommend/);
  assert.match(html, /planning limits only/);
  assert.match(html, /Actual Fleet Planner quantities and status remain independent/);
});
