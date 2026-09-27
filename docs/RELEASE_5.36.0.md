# MFA v5.36.0 — Web Release Notes

Release date: 27 September 2026

Target game version: **Star Citizen 4.10.1 LIVE**

## Release direction

v5.36.0 establishes the maintained MFA product as a **web-first deterministic mining fracture planner**.

The obsolete standalone Windows executable is discontinued, the legacy GitHub Pages repository has been retired, and the maintained application is deployed through Cloudflare Pages.

## Core product requirement

MFA is now documented and tested around its primary operational purpose:

> Determine whether a target rock can be fractured solo with the best loadout; if not, determine the minimum additional mining ships required and the best loadout for each assisting ship.

## Calculation audit

A formal 4.10.1 mechanics audit identified and corrected an important resistance-direction error.

Previously, the required-power formula could make a higher-resistance rock appear easier to fracture.

v5.36.0 now:

- treats resistance as a penalty on delivered fracture power;
- calculates effective contribution per mining head;
- sums independent head contributions for cooperative mining;
- derives equivalent required raw power for the UI;
- keeps core/runtime and recommendation/fleet parity under regression tests.

See `docs/AUDIT_4.10.1_2026-09-27.md`.

## Mining data

The 4.10.1 reference table was re-audited on 27 September 2026.

Current staged counts:

- 17 mining laser heads;
- 26 functional mining modules;
- 6 mining gadgets.

No component-stat value changes were required during that audit.

## Recommended Solutions

The recommendation architecture is target-driven.

Recommended Solutions:

- does not use actual Fleet Planner availability/loadout as the recommendation source;
- starts from the target and mission constraints;
- produces one best ideal solution;
- specifies exact vessel count;
- specifies exact mining heads and modules;
- specifies Active module state;
- specifies gadget requirement;
- allows per-vessel availability confirmation after the ideal solution is calculated.

## Fleet Planner

The unified Fleet Planner represents actual operation state:

- Active;
- Available;
- Standby;
- actual fitted mining heads;
- actual modules;
- module activation state.

The actual fracture verdict and ideal recommendation use the same shared deterministic runtime.

## User interface

The Planner theme family is now:

- Planner Day;
- Planner Dusk;
- Planner Night.

Contrast work includes theme-specific mining-head/module dropdown styling and selected-value readability.

## AI removal

The public Senior Foreman AI feature has been removed.

The web application does not require:

- OpenAI API credits;
- Workers AI;
- Gemini;
- a user AI key.

## Deployment

Maintained web deployment:

`https://mining-fracture-analyser.pages.dev/`

Repository:

`esramos-design/Mining-Fracture-Analyser`

Development/release flow:

`feature/fix -> alpha -> protected release PR -> main`

## Standalone Windows build

The v5.35 executable is obsolete and no longer supported.

Documentation no longer advertises the standalone build.

## Target Acquisition / OCR

The existing screenshot OCR scanner remains experimental.

The current scanner predates the full 4.10.1 Target Acquisition review and is not considered sufficiently reliable across all ship HUD layouts, HUD colours and screen resolutions.

Planned follow-up:

- full-frame semantic OCR;
- multi-colour preprocessing;
- coordinate-based anchor/value pairing;
- confidence scoring;
- base-value protection;
- composition extraction;
- Prospector/MOLE/Golem screenshot fixtures.

Until that rebuild is validated, manual target entry remains the recommended method.

## Documentation

v5.36.0 refreshes:

- README;
- user/operator guide;
- Calculation Authority wording;
- Cloudflare deployment documentation;
- release notes.

## Known limitations

- OCR is not yet authoritative.
- Full CIG mining fracture mathematics are not publicly documented; MFA uses a documented community-calibrated deterministic model.
- Unknown game-data attributes remain unimplemented rather than guessed.
