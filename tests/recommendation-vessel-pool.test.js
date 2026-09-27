import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("mission constraints expose independent recommendation vessel pool", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");

  assert.match(html, /id="recommendMole"[^>]*checked/);
  assert.match(html, /id="recommendProspector"[^>]*checked/);
  assert.match(html, /id="recommendGolem"[^>]*checked/);
  assert.match(html, /MFA may combine selected types/);

  assert.match(ops, /recommendMole:/);
  assert.match(ops, /recommendProspector:/);
  assert.match(ops, /recommendGolem:/);
  assert.match(ops, /saved\.recommendMole/);
  assert.match(ops, /saved\.recommendProspector/);
  assert.match(ops, /saved\.recommendGolem/);
});

test("ideal solver restricts each vessel dimension independently and retains mixed combinations", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");

  assert.match(solver, /moleMax=p\.recommendMole===false\?0:maxFleet/);
  assert.match(solver, /prospectorMax=p\.recommendProspector===false\?0:maxFleet/);
  assert.match(solver, /golemMax=p\.recommendGolem===false\?0:maxFleet/);

  assert.match(solver, /for\(var m=0;m<=moleMax;m\+\+\)/);
  assert.match(solver, /for\(var pr=0;pr<=prospectorMax;pr\+\+\)/);
  assert.match(solver, /for\(var g=0;g<=golemMax;g\+\+\)/);
  assert.match(solver, /var total=m\+pr\+g/);
  assert.match(solver, /Recommendation vessels/);
});
