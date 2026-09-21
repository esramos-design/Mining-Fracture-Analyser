# MFA Calculation Authority Contract

## Status: mandatory

The current MFA deterministic fracture calculation is the authoritative calculation baseline for this revision.

Telemetry, OCR, UI, Cloudflare, desktop packaging, AI Foreman, data-table refactors, and code cleanup may provide inputs to or present outputs from the calculation engine, but they must not silently change the established mechanics.

## Rules

1. **No incidental formula edits**
   - A refactor is not permission to alter mathematical behaviour.
   - Variable renames, module extraction, UI redesign, data migration, and telemetry integration must preserve output parity.

2. **No AI substitution**
   - AI Foreman may interpret deterministic MFA results.
   - AI Foreman may not replace, override, estimate, or "correct" the deterministic calculation result.

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
  └─ Foreman interpretation
```

The direction of authority is one-way: input systems feed the calculator; presentation/AI systems do not alter it.
