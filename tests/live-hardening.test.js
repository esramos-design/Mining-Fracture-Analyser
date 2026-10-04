import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("public mechanics guide documents current ideal-solver semantics", async () => {
  const guide = await readFile(new URL("../docs/RECOMMENDED_IDEAL_LOADOUT_MECHANICS.md", import.meta.url), "utf8");
  const html = await readFile(new URL("../mechanics-guide.html", import.meta.url), "utf8");

  assert.match(guide, /Balanced operations/);
  assert.match(guide, /Team Availability/);
  assert.match(guide, /Duplicate-vessel specialization/);
  assert.match(guide, /Replanning when the ideal vessel is unavailable/);
  assert.match(guide, /MFAV535\.calculateV535/);
  assert.match(html, /Recommended Ideal Loadout Mechanics/);
});

test("Cloudflare build publishes OCR adapter, docs and public mechanics guide", async () => {
  const build = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");

  assert.match(build, /"regolith-ocr\.js"/);
  assert.match(build, /"mechanics-guide\.html"/);
  assert.match(build, /"docs"/);
  assert.match(build, /"THIRD_PARTY_NOTICES\.md"/);
});

test("LIVE JavaScript obfuscation is production-only", async () => {
  const build = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.match(build, /CF_PAGES_BRANCH === "main"/);
  assert.match(build, /MFA_BUILD_TARGET === "production"/);
  assert.match(build, /if \(production\)/);
  assert.match(build, /javascript-obfuscator/);
  assert.match(build, /renameGlobals: false/);
  assert.equal(pkg.dependencies["javascript-obfuscator"], "5.8.0");
});

test("development alpha remains readable source", async () => {
  const build = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");

  assert.match(build, /MFA readable validation build \(non-production\)/);
  assert.doesNotMatch(build, /CF_PAGES_BRANCH === "alpha".*production/s);
});

test("web app exposes public mechanics guide", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /href="mechanics-guide\.html">Ideal Loadout Mechanics<\/a>/);
  assert.doesNotMatch(html, /<\/script>\\n<script/);
});
