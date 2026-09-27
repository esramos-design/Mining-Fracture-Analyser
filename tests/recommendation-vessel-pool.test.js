import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Recommended Solutions exposes independent recommendation vessel pool", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const ops = await readFile(new URL("../operations-console.js", import.meta.url), "utf8");

  assert.match(html, /id="recommendMole"[^>]*checked/);
  assert.match(html, /id="recommendProspector"[^>]*checked/);
  assert.match(html, /id="recommendGolem"[^>]*checked/);
  assert.match(html, /MFA can combine any selected types in the ideal solution/);
  assert.match(html, /id="recommendMoleMax"[^>]*value="1"/);
  assert.match(html, /id="recommendProspectorMax"[^>]*value="2"/);
  assert.match(html, /id="recommendGolemMax"[^>]*value="1"/);

  assert.match(ops, /recommendMole:/);
  assert.match(ops, /recommendMoleMax:/);
  assert.match(ops, /recommendProspector:/);
  assert.match(ops, /recommendProspectorMax:/);
  assert.match(ops, /recommendGolem:/);
  assert.match(ops, /recommendGolemMax:/);
  assert.match(ops, /saved\.recommendMole/);
  assert.match(ops, /saved\.recommendProspector/);
  assert.match(ops, /saved\.recommendGolem/);
});

test("ideal solver restricts each vessel dimension independently and retains mixed combinations", async () => {
  const solver = await readFile(new URL("../cooperative-solver.js", import.meta.url), "utf8");

  assert.match(solver, /cap\(p\.recommendMole,p\.recommendMoleMax,1\)/);
  assert.match(solver, /cap\(p\.recommendProspector,p\.recommendProspectorMax,2\)/);
  assert.match(solver, /cap\(p\.recommendGolem,p\.recommendGolemMax,1\)/);

  assert.match(solver, /for\(var m=0;m<=caps\.mole;m\+\+\)/);
  assert.match(solver, /for\(var pr=0;pr<=caps\.prospector;pr\+\+\)/);
  assert.match(solver, /for\(var g=0;g<=caps\.golem;g\+\+\)/);
  assert.match(solver, /var total=m\+pr\+g/);
  assert.match(solver, /Recommendation vessels/);
});
