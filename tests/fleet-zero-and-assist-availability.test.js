import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Operation Fleet starts each ship type at zero and keeps zero valid while enabled", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");
  const fleet = await readFile(new URL("../unified-fleet-planner.js", import.meta.url), "utf8");

  assert.match(html, /id="fleetAvailableMole"[^>]*value="0"/);
  assert.match(html, /id="fleetAvailableProspector"[^>]*value="0"/);
  assert.match(html, /id="fleetAvailableGolem"[^>]*value="0"/);

  assert.doesNotMatch(ops, /if \(count < 1\)[\s\S]{0,120}previousValue \|\| "1"/);
  assert.doesNotMatch(ops, /if \(next === 0\) refs\.enabled\.checked = false/);
  assert.match(fleet, /Zero is a valid starting quantity/);
  assert.doesNotMatch(fleet, /sanitizeQty\(qty\.value\) < 1[\s\S]{0,100}previousValue \|\| "1"/);
});

test("Recommended vessel availability exposes confirmed and missing operational states", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

  assert.match(solver, /solver-assist-state">NOT CONFIRMED/);
  assert.match(solver, /CONFIRMED AVAILABLE/);
  assert.match(solver, /NOT READY/);
  assert.match(solver, /assist-confirmed/);
  assert.match(solver, /assist-missing/);

  assert.match(css, /\.solver-required-vessel\.assist-confirmed/);
  assert.match(css, /\.solver-required-vessel\.assist-missing/);
  assert.match(css, /\.solver-availability-summary\.missing/);
});
