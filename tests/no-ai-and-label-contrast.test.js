import assert from "node:assert/strict";
import test from "node:test";
import { readFile, access } from "node:fs/promises";

test("public MFA has no Foreman AI runtime or endpoint wiring", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const build = await readFile(new URL("../scripts/build-pages.mjs", import.meta.url), "utf8");
  const wrangler = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");

  assert.doesNotMatch(html, /Senior Foreman|OpenAI status|ai-foreman\.js|aiEndpoint/i);
  assert.doesNotMatch(build, /ai-foreman|api\/foreman/i);
  assert.doesNotMatch(wrangler, /OPENAI_|Workers AI|\[ai\]/i);

  await assert.rejects(access(new URL("../ai-foreman.js", import.meta.url)));
  await assert.rejects(access(new URL("../functions/api/foreman.js", import.meta.url)));
});

test("fleet arm titles use explicit theme-aware contrast class", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(source, /ship-arm-title/);
  assert.match(css, /html\[data-theme="day"\] \.ship-arm-title/);
  assert.match(css, /html\[data-theme="dusk"\] \.ship-arm-title/);
  assert.match(css, /html\[data-theme="night"\] \.ship-arm-title/);
});
