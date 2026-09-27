import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("recommendation vessel pool is shown inside Recommended Solutions", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  const solutionIndex = html.indexOf("<h2>Recommended Solutions</h2>");
  const poolIndex = html.indexOf("Recommendation Fleet Pool");
  const configsIndex = html.indexOf('id="configs"');

  assert.ok(solutionIndex >= 0);
  assert.ok(poolIndex > solutionIndex);
  assert.ok(configsIndex > poolIndex);

  assert.match(html, /id="recommendMole"[^>]*onchange="MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendProspector"[^>]*onchange="MFAOps\.savePreferences\(\);calculate\(\)"/);
  assert.match(html, /id="recommendGolem"[^>]*onchange="MFAOps\.savePreferences\(\);calculate\(\)"/);

  assert.equal((html.match(/id="recommendMole"/g) || []).length, 1);
  assert.equal((html.match(/id="recommendProspector"/g) || []).length, 1);
  assert.equal((html.match(/id="recommendGolem"/g) || []).length, 1);
});

test("copy distinguishes solver eligibility from post-recommendation assist confirmation", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /Changing these immediately recalculates the Recommended Ideal Loadout/);
  assert.match(html, /Available to assist/);
  assert.match(html, /only confirms whether a vessel already recommended by MFA can actually deploy/);
});
