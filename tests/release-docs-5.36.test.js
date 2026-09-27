import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("5.36.0 release metadata and README are current", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.equal(pkg.version, "5.36.0");
  assert.match(readme, /MFA\) v5\.36\.0/);
  assert.match(readme, /mining-fracture-analyser\.pages\.dev/);
  assert.doesNotMatch(readme, /esramos-design\.github\.io\/mfa\.github\.io/);
  assert.doesNotMatch(readme, /optional AI-assisted guidance|Google Gemini API key|OpenAI API key required/i);
  assert.match(readme, /no AI runtime dependency/i);
  assert.match(html, /MFA<\/strong>&nbsp;5\.36\.0/);
});

test("5.36.0 operator and release documentation exists", async () => {
  const guide = await readFile(new URL("../docs/USER_GUIDE.md", import.meta.url), "utf8");
  const release = await readFile(new URL("../docs/RELEASE_5.36.0.md", import.meta.url), "utf8");

  assert.match(guide, /Recommended Solutions/);
  assert.match(guide, /experimental/i);
  assert.match(guide, /additional mining ships/i);
  assert.match(release, /resistance-direction error/i);
  assert.match(release, /Senior Foreman AI feature has been removed/i);
});
