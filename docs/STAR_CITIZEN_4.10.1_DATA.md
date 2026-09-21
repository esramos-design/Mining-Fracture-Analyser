# Star Citizen 4.10.1 data reconciliation

Target launcher build observed for this revision:

- Patch: **4.10.1 LIVE**
- Launcher build: **4.10.1-live.12660092**

## Status

The structured dataset in `data/star-citizen-4.10.1.json` is **staged reference data**. It is intentionally not wired into the v5.35 calculator yet.

That separation preserves the working v5.35 calculation baseline while allowing us to compare every legacy value against current mining-component data before changing results.

## Source hierarchy

1. **Roberts Space Industries (RSI)** for current patch identity, official mining workflow and known live issues.
2. **UEX** for current mining component statistics.
3. Additional sources may be used only to cross-check gaps and must be recorded before a value becomes calculator-authoritative.

UEX is community-maintained. Its site currently targets Star Citizen 4.10.1, while individual component records expose the game version in which that item was last verified. Those per-item versions are retained in the staged JSON.

## Important v5.35 discrepancies already identified

The current source contains several fields that do not match the staged reference data, including some charge-window values, extraction-power values and size-0 laser effects. These must be handled as explicit mechanics migrations with regression tests rather than silently overwriting the existing calculator.

## Activation gate

Before switching MFA calculation logic to the 4.10.1 dataset:

1. create deterministic v5.35 test vectors;
2. define the intended meaning and units of each mining statistic;
3. reconcile all component values;
4. verify module stacking rules and gadget application rules;
5. compare expected results against in-game observations;
6. review the behaviour change in a dedicated PR.

This keeps the v5.35 release reproducible while allowing the next MFA revision to become patch-aware.
