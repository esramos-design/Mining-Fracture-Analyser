import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Team Availability is shown inside Recommended Plan", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  const solutionIndex = html.indexOf("<h2>Recommended Plan</h2>");
  const poolIndex = html.indexOf("Team Availability");
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

test("copy explains live Team Availability replanning separately from Actual Fleet Planner", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /Select what your team can actually provide right now/);
  assert.match(html, /immediately recalculates the best loadout/);
  assert.match(html, /Actual Fleet Planner quantities and status remain independent/);
});
