# MFA Data Integrity Contract

## Status: mandatory engineering rule

MFA calculations must never depend on shortened, partial, hidden, or silently rewritten mining-component data.

This contract applies to every Star Citizen mining data revision and to every contributor, tool, AI assistant, import script, refactor, and pull request.

## 1. Complete calculation tables

The authoritative MFA mining dataset is divided into complete tables for:

- mining laser heads;
- mining modules;
- mining gadgets.

Every known item for the supported game version must be represented. An item may not be removed merely because MFA does not currently use one of its attributes.

## 2. Preserve every known attribute

Each table must preserve all known attributes from the verified source material.

An unused attribute must remain in the dataset with its real value or `null` when the source does not provide a value. It must not be dropped to make code smaller.

Adding a new source attribute is an additive schema change. Existing source attributes may not be removed without an explicit migration, evidence, tests, and review.

## 3. No hidden calculation constants

A game mechanic that originates from component/game data must not be duplicated as an unexplained hard-coded constant inside the calculation engine.

The calculation engine must reference the versioned dataset by stable item identity.

Pure mathematical constants/formulas must be documented separately from source data.

## 4. Provenance and game version

Every data revision must record:

- target Star Citizen patch;
- launcher/client build when known;
- source provider;
- source game version or last-verified version when available;
- import/reconciliation status.

Community-maintained values are not automatically equivalent to CIG-authoritative values. Their provenance must remain visible.

## 5. No destructive AI/code updates

Automated tools and AI assistants must not:

- replace a complete table with a shortened sample;
- omit unchanged rows from a full-file rewrite;
- delete attributes because they appear unused;
- silently normalize values;
- change units without an explicit migration;
- change a calculation formula while performing a data-only update;
- regenerate a file from memory when the repository version can be read first.

For edits to an existing data file, the current repository file must be read first and modifications applied against that source.

## 6. Integrity gates

Before a data PR can be accepted:

1. all expected item identities must still exist;
2. every required attribute column must still exist;
3. duplicate item names/IDs must fail validation;
4. schema/version metadata must exist;
5. the data-integrity test must pass;
6. calculation regression tests must pass before activation;
7. changed values must be reviewable as a diff.

## 7. Comprehensive user-visible reference

MFA must provide a user-visible data reference that displays the complete tables used by the calculator.

The reference must render the union of every attribute present in each table so a newly added attribute cannot be silently hidden by a hard-coded UI column list.

Users must be able to distinguish:

- active calculation fields;
- stored reference fields;
- unavailable/null values;
- source/version metadata.

## 8. Calculation activation

A staged dataset is not automatically calculator-authoritative.

A patch dataset becomes active only after:

- value reconciliation;
- mechanic/stacking-rule validation;
- deterministic regression coverage;
- controlled in-game verification where possible;
- PR review.

## 9. Fail closed

When a required value is missing or unverified, MFA must not invent a replacement.

The correct states are:

- verified;
- staged;
- unverified;
- unavailable.

Unknown is preferable to fabricated precision.
