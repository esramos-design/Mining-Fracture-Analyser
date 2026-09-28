import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("the ideal solver evaluates each permitted gadget with the protected fracture runtime", async () => {
  const source=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");
  assert.match(source,/function gadgetChoices\(p\)/);
  assert.match(source,/if\(!p\.allowGadgets\)return\["None"\]/);
  assert.match(source,/return gadgets\.map\(function\(g\)\{return g\.name;\}\)/);
  assert.match(source,/gadgetChoices\(p\)\.forEach\(function\(gadget\)/);
  assert.match(source,/evaluation=evaluate\(s\.baseResistance,s\.baseInstability,s\.mass,arms,gadget\)/);
});

test("the explanation compares gadgets on identical recommended head and module configurations", async () => {
  const source=await readFile(new URL("../cooperative-solver.js",import.meta.url),"utf8");
  const begin=source.indexOf("function gadgetComparisonHtml(");
  const end=source.indexOf("function optionHtml(",begin);
  assert.ok(begin>=0 && end>begin);
  const comparison=source.slice(begin,end);
  assert.match(comparison,/var arms=proposedArms\(o\.vesselPlans\)/);
  assert.match(comparison,/gadgetChoices\(p\)\.map/);
  assert.match(comparison,/evaluate\(state\.baseResistance,state\.baseInstability,state\.mass,arms,name\)/);
  assert.match(comparison,/options\.sort\(compareFor\(objective,minMargin\)\)/);
  assert.match(comparison,/candidate\.gadget===o\.gadget/);
  assert.match(comparison,/finalResistance/);
  assert.match(comparison,/finalInstability/);
  assert.match(comparison,/marginPct/);
  assert.match(comparison,/optimalChargeWindowRatePct/);
  assert.match(comparison,/optimalChargeWindowSizePct/);
  assert.match(comparison,/not yet part of the audited fracture-power/);
  assert.match(source,/gadgetComparisonHtml\(o,state,p,objective,minMargin\)/);
});

test("public mechanics guide keeps modelled and unmodelled gadget effects separate", async () => {
  const guide=await readFile(new URL("../docs/RECOMMENDED_IDEAL_LOADOUT_MECHANICS.md",import.meta.url),"utf8");
  const web=await readFile(new URL("../mechanics-guide.html",import.meta.url),"utf8");
  assert.match(guide,/resistance and instability modifiers/);
  assert.match(guide,/does not fully simulate/);
  assert.match(guide,/Only \*\*one gadget per evaluated candidate\*\*/);
  assert.match(web,/Gadget selection and comparison/);
});
