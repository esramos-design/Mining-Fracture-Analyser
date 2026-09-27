import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("public mechanics guide documents current ideal-solver semantics", async () => {
  const guide = await readFile(new URL("../docs/RECOMMENDED_IDEAL_LOADOUT_MECHANICS.md", import.meta.url), "utf8");
  const html = await readFile(new URL("../mechanics-guide.html", import.meta.url), "utf8");

  assert.match(guide, /Minimum ships/);
  assert.match(guide, /minimum vessel hull count/);
  assert.match(guide, /repeated vessels share a variant/i);
  assert.match(guide, /Fleet Planner influence/);
  assert.match(guide, /Available to assist/);
  assert.match(html, /Recommended Ideal Loadout — Mechanics Guide/);
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
