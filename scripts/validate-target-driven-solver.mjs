import { readFile } from "node:fs/promises";

const source = await readFile("cooperative-solver.js", "utf8");

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

const solveStart = source.indexOf("function solveIdeal");
const solveEnd = source.indexOf("function normalizedSlots", solveStart);
if (solveStart < 0 || solveEnd < 0) fail("solveIdeal block not found");

const solveBlock = source.slice(solveStart, solveEnd);
if (solveBlock.includes("baseArms")) fail("solveIdeal still uses current fitted arms");
if (solveBlock.includes("support.")) fail("solveIdeal still uses available support counts");
if (!solveBlock.includes("m+pr+g")) fail("solveIdeal is not searching independent fleet compositions");

console.log("Target-driven solver validation passed.");
