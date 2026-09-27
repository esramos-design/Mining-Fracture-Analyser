import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("README no longer advertises obsolete standalone Windows build", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  assert.doesNotMatch(readme, /Standalone Windows Build/i);
  assert.doesNotMatch(readme, /Download MFA v5\.35/i);
  assert.doesNotMatch(readme, /supported standalone build/i);
});
