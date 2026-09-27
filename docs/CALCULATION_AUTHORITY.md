# MFA Calculation Authority Contract

## Status: mandatory

The MFA deterministic fracture calculation is the authoritative calculation baseline for this revision. As of the 2026-09-27 Star Citizen 4.10.1 audit, breakability uses the community-calibrated per-head transfer model documented in `docs/AUDIT_4.10.1_2026-09-27.md`.

Telemetry, OCR, UI, Cloudflare deployment, data-table refactors, and code cleanup may provide inputs to or present outputs from the calculation engine, but they must not silently change the established mechanics.

## Rules

1. **No incidental formula edits**
   - A refactor is not permission to alter mathematical behaviour.
   - Variable renames, module extraction, UI redesign, data migration, and telemetry integration must preserve output parity.

2. **No presentation-layer substitution**
   - UI, OCR, charts, summaries, deployment layers, or future optional integrations may present deterministic MFA results.
   - They may not replace, override, estimate, or silently "correct" the deterministic calculation result.

3. **Input-source independence**
   - The same validated target/fleet/loadout values must produce the same result whether they came from:
     - manual entry;
     - OCR;
     - verified live telemetry;
     - a saved scenario.

4. **Data-table migration without mechanic drift**
   - Moving laser/module/gadget values from hard-coded JavaScript into versioned data tables must preserve current calculation semantics unless a separate mechanics-change PR is approved.

5. **Formula-change gate**
   A change to calculation mechanics requires:
   - an explicit mechanics-change PR;
   - documented reason/evidence;
   - before/after deterministic fixtures;
   - identified Star Citizen patch/build scope;
   - review of affected laser/module/gadget attributes;
   - no unrelated feature changes in the same commit where practical.

6. **Regression gate**
   Existing authoritative fixtures must continue to pass for ordinary feature/refactor PRs.

7. **Unknown mechanics**
   Missing or uncertain mechanics must remain unimplemented/unverified rather than guessed.

## Architectural boundary

```text
Input sources
  ├─ manual
  ├─ OCR
  └─ verified telemetry
        ↓
Normalized MFA state
        ↓
Authoritative deterministic calculation engine
        ↓
Result
  ├─ UI
  ├─ charts
  └─ recommendation / operational presentation
```

The direction of authority is one-way: input systems feed the calculator; presentation systems do not alter it.


## 4.10.1 audited breakability baseline

For Star Citizen 4.10.1, resistance is treated as a penalty on delivered fracture power. Each active mining head contributes independently after its own head/module/gadget resistance modifiers, and combined fracture capacity is the sum of those per-head contributions.

This is a community-calibrated model, not a CIG-published formula. Any future replacement requires the same mechanics-change gate described above and new patch-scoped evidence.
