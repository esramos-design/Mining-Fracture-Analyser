import { readFile } from "node:fs/promises";

const source = await readFile("cooperative-solver.js", "utf8");
const uiSource = await readFile("script.js", "utf8");

function fail(message) {
  console.error("Target-driven solver validation failed:", message);
  process.exit(1);
}

const renderStart = source.indexOf("function render(ctx)");
const renderEnd = source.indexOf("window.MFACoopSolver", renderStart);
if (renderStart < 0 || renderEnd < 0) fail("render(ctx) block not found");

const renderBlock = source.slice(renderStart, renderEnd);

for (const forbidden of [
  "currentArms()",
  "deployedCounts()",
  "availableCounts(",
  "fleetAvailableMole",
  "fleetAvailableProspector",
  "fleetAvailableGolem"
]) {
  if (renderBlock.includes(forbidden)) {
    fail(`Recommended Solutions render still depends on Fleet Planner state: ${forbidden}`);
  }
}

if (!renderBlock.includes("solveIdeal(state,p,strat)")) {
  fail("render(ctx) does not call solveIdeal");
}

if (!renderBlock.includes('var objective=p.optimizerObjective||"balanced-operations"')) {
  fail("Recommended Solutions does not select an explicit v2 objective");
}

if (!renderBlock.includes("var best=solved.portfolio[objective]||solved.options[0]")) {
  fail("Recommended Solutions does not select the top-ranked result for the selected objective");
}

if (!renderBlock.includes("portfolioHtml(solved,objective)")) {
  fail("Recommended Solutions does not expose deterministic objective alternatives");
}

const solveStart = source.indexOf("function solveIdeal");
const solveEnd = source.indexOf("function normalizedSlots", solveStart);
if (solveStart < 0 || solveEnd < 0) fail("solveIdeal block not found");

const solveBlock = source.slice(solveStart, solveEnd);
if (solveBlock.includes("baseArms")) fail("solveIdeal still uses current fitted arms");
if (solveBlock.includes("support.")) fail("solveIdeal still uses available support counts");
if (!solveBlock.includes("m+pr+g")) fail("solveIdeal is not searching independent fleet compositions");
if (!solveBlock.includes("buildVesselPlans(counts,vars)")) fail("solveIdeal is not searching vessel-specific loadouts");
if (!solveBlock.includes("minimumMarginPct")) fail("solveIdeal is not applying the v2 recommendation safety margin");
if (!solveBlock.includes("recommendationCaps")) fail("solveIdeal is not applying recommendation resource caps");

const evaluateStart = source.indexOf("function evaluate(");
const evaluateEnd = source.indexOf("function strategy", evaluateStart);
if (evaluateStart < 0 || evaluateEnd < 0) fail("Recommended evaluator block not found");
const evaluateBlock = source.slice(evaluateStart, evaluateEnd);
if (!evaluateBlock.includes("window.MFAV535.calculateV535")) {
  fail("Recommended Solutions is not using the shared v5.35 runtime engine");
}

const calculateStart = uiSource.indexOf("window.calculate = function()");
const calculateEnd = uiSource.indexOf("// --- UPDATE CHART FUNCTIONS", calculateStart);
if (calculateStart < 0 || calculateEnd < 0) fail("Active Fracture Verdict calculation block not found");
const calculateBlock = uiSource.slice(calculateStart, calculateEnd);
if (!calculateBlock.includes("window.MFAV535.calculateV535")) {
  fail("Active Fracture Verdict is not using the shared v5.35 runtime engine");
}

console.log("Target-driven solver validation passed.");
