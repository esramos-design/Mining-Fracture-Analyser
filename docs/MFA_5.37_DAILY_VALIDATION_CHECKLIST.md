# MFA 5.37.0 — Daily Validation Checklist

**Project:** Mining Fracture Analyser (MFA)  
**Target:** Star Citizen 4.10.1 LIVE  
**Development branch:** `alpha`  
**Production branch:** `main`  
**Purpose:** Daily, repeatable validation of OCR, Live Bridge, fracture calculations, gadgets and Recommended Ideal Loadout v2.

> This checklist is the working test procedure for MFA 5.37.0 development.  
> Do not promote a mechanics change to LIVE unless the affected test blocks pass and the protected GitHub checks are green.

---

# 1. Daily session header

- [ ] Date recorded
- [ ] Tester recorded
- [ ] Star Citizen version confirmed
- [ ] MFA Alpha build/commit recorded
- [ ] MFA LIVE build/commit recorded
- [ ] Test ship(s) recorded
- [ ] Game resolution / display mode recorded
- [ ] Test location / mining environment recorded
- [ ] No unrelated changes introduced before baseline testing

### Session record

```text
Date:
Tester:
SC version:
MFA Alpha commit:
MFA LIVE commit:
Ship(s):
Resolution:
Location:
Notes:
```

---

# 2. Baseline integrity check

Run before new development or mechanics changes.

- [ ] Alpha loads without JavaScript errors
- [ ] LIVE loads without JavaScript errors
- [ ] Target Acquisition fields accept manual input
- [ ] Fleet Planner renders correctly
- [ ] Fracture Verdict renders correctly
- [ ] Recommended Ideal Loadout renders correctly
- [ ] Gadget chooser renders correctly
- [ ] OCR scanner opens
- [ ] OCR debug console opens
- [ ] Public mechanics guide opens
- [ ] Alpha and LIVE differences are understood before testing

### Protected boundaries

Confirm no unintended changes to:

- [ ] `v535-runtime.js`
- [ ] `src/core/v535-engine.js`
- [ ] mining-head values
- [ ] module values
- [ ] gadget values
- [ ] Fleet Planner actual-fleet semantics
- [ ] OCR → Target Acquisition separation

**STOP CONDITION:** If any protected calculation file changed unexpectedly, stop the session and audit the diff before continuing.

---

# 3. Benchmark rock register

Use controlled reference rocks where possible.

## Q-001 — Quantanium reference

- Mass: **47,167 kg**
- Resistance: **30%**
- Instability: **574.77**
- Source: in-game HUD screenshot
- OCR reference status: PaddleOCR exact match achieved

- [ ] Q-001 available for today's tests

## Q-002 — Low resistance / low instability

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

## Q-003 — High resistance / moderate instability

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

## Q-004 — Moderate resistance / very high instability

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

## Q-005 — Very high mass

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

## Q-006 — Borderline fracture case

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

## Q-007 — Cooperative mining required

- [ ] Captured
- Mass:
- Resistance:
- Instability:
- Material:

---

# 4. OCR validation block

Run at least **3 OCR cases per active development day** when OCR is being changed.

## OCR-001 — Known reference image

- [ ] Upload Q-001 reference screenshot
- [ ] PaddleOCR initializes
- [ ] Mass = 47,167 kg
- [ ] Resistance = 30%
- [ ] Instability = 574.77
- [ ] Values auto-populate Target Acquisition
- [ ] MFA recalculates automatically
- [ ] No blocking popup
- [ ] Tesseract shadow result logged
- [ ] Tesseract does not overwrite Paddle result
- [ ] Existing fields remain unchanged if Paddle fails

Expected result: **PASS**

## OCR-002 — Different rock

- [ ] Different mass
- [ ] Different resistance
- [ ] Different instability
- [ ] Paddle values compared with HUD
- [ ] All three critical fields exact
- [ ] Auto-apply correct

Result:
- [ ] PASS
- [ ] PASS WITH NOTE
- [ ] FAIL — OCR

## OCR-003 — Different ship HUD

Select one:

- [ ] Prospector
- [ ] MOLE
- [ ] Golem

Check:

- [ ] Scan Results region detected
- [ ] Mass exact
- [ ] Resistance exact
- [ ] Instability exact
- [ ] No unrelated HUD values misread
- [ ] OCR runtime recorded

### OCR evidence record

```text
Test ID:
Ship:
Rock ID:
Screenshot filename:
HUD mass:
OCR mass:
HUD resistance:
OCR resistance:
HUD instability:
OCR instability:
Paddle runtime:
Tesseract result:
Auto-apply:
Result:
Notes:
```

### OCR stop conditions

Stop automatic promotion if:

- [ ] Paddle misreads any critical field
- [ ] OCR silently applies a partial result
- [ ] Tesseract overwrites a valid Paddle result
- [ ] OCR replaces valid fields with zero/blank
- [ ] different HUD layout causes systematic crop failure

---

# 5. Live Bridge validation block

The Live Bridge must be tested independently of OCR.

## BRG-001 — Start and connection

- [ ] Bridge process starts
- [ ] MFA detects bridge
- [ ] Status changes OFFLINE → CONNECTING → ONLINE
- [ ] No browser console error
- [ ] Connection latency recorded

Result:
- [ ] PASS
- [ ] PASS WITH NOTE
- [ ] FAIL — BRIDGE

## BRG-002 — Browser refresh

- [ ] Bridge stays running
- [ ] Refresh Alpha
- [ ] MFA reconnects automatically
- [ ] Status returns ONLINE
- [ ] No stale duplicate connection

## BRG-003 — Bridge restart

- [ ] Stop bridge
- [ ] MFA reports OFFLINE or STALE
- [ ] Existing valid target values remain intact
- [ ] Restart bridge
- [ ] MFA reconnects
- [ ] No manual page restart required if avoidable

## BRG-004 — Data feasibility

Record whether each item is directly available:

| Data | Available | Source | Notes |
|---|---|---|---|
| Ship identity | [ ] |  |  |
| Player/ship position | [ ] |  |  |
| Mining mode | [ ] |  |  |
| Laser active state | [ ] |  |  |
| Rock target identity | [ ] |  |  |
| Rock mass | [ ] |  |  |
| Resistance | [ ] |  |  |
| Instability | [ ] |  |  |
| Composition | [ ] |  |  |

## BRG-005 — Automatic capture path

If direct rock telemetry is unavailable:

- [ ] Bridge can trigger/receive HUD screenshot
- [ ] Screenshot reaches MFA locally
- [ ] PaddleOCR starts automatically
- [ ] Target values update
- [ ] Recalculation occurs without pilot interaction
- [ ] stale screenshot is not reused for a new target

### Bridge stop conditions

- [ ] Bridge disconnect zeros target values
- [ ] stale telemetry appears as current
- [ ] reconnect creates duplicate updates
- [ ] bridge data silently overrides newer OCR/manual values
- [ ] unsupported telemetry is presented as authoritative

---

# 6. Fracture calculation validation block

Use the same target while changing **one equipment variable at a time**.

## FRAC-001 — Manual baseline

Record:

```text
Rock ID:
Mass:
Resistance:
Instability:
Ship:
Mining head:
Modules:
Active modules ON/OFF:
Gadget:
MFA available power:
MFA required power:
MFA final resistance:
MFA final instability:
MFA margin:
MFA verdict:
In-game verdict:
Actual result:
```

Check:

- [ ] Target inputs match HUD
- [ ] Fleet configuration matches game
- [ ] Active-module state matches game
- [ ] Selected gadget matches game
- [ ] MFA verdict recorded before fracture attempt
- [ ] actual in-game outcome recorded

Result:
- [ ] PASS
- [ ] PASS WITH NOTE
- [ ] FAIL — MODEL

## FRAC-002 — Single equipment change

Change exactly one:

- [ ] mining head
- [ ] one module
- [ ] one Active-module state
- [ ] gadget
- [ ] additional cooperating vessel

Confirm:

- [ ] only intended input changed
- [ ] calculation changes logically
- [ ] output recorded
- [ ] in-game result recorded

## FRAC-003 — Borderline power case

- [ ] Margin between approximately -5% and +5%
- [ ] MFA verdict recorded
- [ ] in-game result recorded
- [ ] charge controllability noted separately from power viability

---

# 7. Gadget validation matrix

Use the **same rock, vessel(s), heads and modules**.

Run all available gadget options:

| Test ID | Gadget | MFA Margin | Final Resistance | Final Instability | Charge behaviour | In-game result |
|---|---|---:|---:|---:|---|---|
| GAD-001 | None |  |  |  |  |  |
| GAD-002 | BoreMax |  |  |  |  |  |
| GAD-003 | Okunis |  |  |  |  |  |
| GAD-004 | OptiMax |  |  |  |  |  |
| GAD-005 | Sabir |  |  |  |  |  |
| GAD-006 | Stalwart |  |  |  |  |  |
| GAD-007 | Waveshift |  |  |  |  |  |

For each:

- [ ] Same fleet retained
- [ ] Same head/module configuration retained
- [ ] Only gadget changed
- [ ] MFA resistance recorded
- [ ] MFA instability recorded
- [ ] MFA margin recorded
- [ ] charge rate noted
- [ ] charge-window size noted
- [ ] stability/oscillation noted
- [ ] actual fracture result noted

### Gadget interpretation

Current protected engine models:

- [ ] resistance modifier
- [ ] instability modifier

Current engine does **not yet fully simulate**:

- [ ] optimal charge-window size
- [ ] charge-window rate
- [ ] cluster modifier
- [ ] operator skill
- [ ] charge oscillation/control difficulty

Do not change these formulas until gameplay evidence supports the mechanics.

---

# 8. Recommended Ideal Loadout v2 block

Use one target and run all objectives.

## IDEAL-001 — Balanced Operations

- [ ] Correct recommendation resource caps
- [ ] Correct minimum fracture margin
- [ ] Recommended vessel count recorded
- [ ] Operators recorded
- [ ] Mining heads recorded
- [ ] Gadget recorded
- [ ] Margin recorded
- [ ] Instability recorded
- [ ] “Why this plan” explanation sensible

## IDEAL-002 — Minimum Hulls

- [ ] Fewer hulls ranked before crew
- [ ] Result reproduced in Fleet Planner

## IDEAL-003 — Minimum Crew

- [ ] Operator count ranked before hulls
- [ ] MOLE crew model checked
- [ ] Result reproduced in Fleet Planner

## IDEAL-004 — Maximum Margin

- [ ] Largest modelled margin selected
- [ ] Safety class correct

## IDEAL-005 — Minimum Instability

- [ ] Lowest instability outranks hull count
- [ ] Gadget selection sensible within current model

## IDEAL-006 — Minimum Consumables

- [ ] Consumables outrank hull count
- [ ] Gadget cost counted correctly
- [ ] Active modules counted correctly

## IDEAL-007 — Duplicate-vessel specialization

Use at least 2 vessels of one type.

- [ ] Vessel #1 may have different variant from Vessel #2
- [ ] Equivalent permutations not duplicated
- [ ] Both loadouts are displayed separately
- [ ] Plan can be reproduced in Fleet Planner

## IDEAL-008 — Resource cap enforcement

Examples:

- [ ] MOLE max 0 never returns MOLE
- [ ] Prospector max 2 never returns 3 Prospectors
- [ ] Golem max 1 never returns 2 Golems
- [ ] global Max Fleet enforced

## IDEAL-009 — Gadget comparison

- [ ] same recommended fleet compared across gadgets
- [ ] selected gadget highlighted
- [ ] margin shown
- [ ] resistance shown
- [ ] instability shown
- [ ] charge/window attributes clearly labelled informational
- [ ] actual Fleet Planner gadget remains independent

---

# 9. Performance and usability block

## UX-001 — OCR workflow

- [ ] no blocking confirmation popup
- [ ] debug window does not obstruct normal use excessively
- [ ] status visible without opening debug window
- [ ] OCR runtime acceptable

## UX-002 — Fleet Planner

- [ ] head names readable
- [ ] module names readable
- [ ] no clipping in Day theme
- [ ] no clipping in Dusk theme
- [ ] no clipping in Night theme
- [ ] controls usable at normal desktop width

## UX-003 — Recommended Solutions

- [ ] no overlapping cards
- [ ] gadget table readable
- [ ] vessel-specific loadouts readable
- [ ] objective alternatives usable
- [ ] narrow-screen layout acceptable

---

# 10. Regression rerun after every code change

After any Alpha code change:

- [ ] Q-001 OCR reference rerun
- [ ] one different OCR screenshot rerun
- [ ] one actual Fleet Planner fracture case rerun
- [ ] one gadget comparison rerun if gadget code affected
- [ ] one Ideal Loadout case rerun if solver code affected
- [ ] bridge reconnect rerun if bridge code affected

GitHub gates:

- [ ] Operation Console
- [ ] Regression Tests
- [ ] Production-obfuscated Pages build
- [ ] Data Integrity

**Do not merge to Alpha if any required gate fails.**

---

# 11. Daily result classification

Use only these statuses:

### PASS

Observed behaviour matches the defined expected result.

### PASS WITH NOTE

Core behaviour is correct but there is a performance, presentation or usability issue.

### FAIL — OCR

Target Acquisition input from OCR is incorrect.

### FAIL — BRIDGE

Live Bridge connection, freshness or acquisition behaviour is incorrect.

### FAIL — MODEL

MFA calculation/recommendation does not match validated expected behaviour.

### BLOCKED

Test cannot be completed because required in-game state, ship, rock, bridge or evidence is unavailable.

---

# 12. Issue handling rule

For every failure:

1. [ ] Assign test ID
2. [ ] Preserve screenshot/log
3. [ ] Record expected value
4. [ ] Record actual value
5. [ ] Identify layer:
   - OCR
   - Bridge
   - Fleet Planner
   - Shared fracture engine
   - Gadget model
   - Ideal solver
   - UI
6. [ ] Change only the affected layer
7. [ ] Add regression test where practical
8. [ ] rerun affected benchmark
9. [ ] rerun Q-001 baseline
10. [ ] pass protected GitHub gates

---

# 13. End-of-day report

Complete before ending each test session.

```text
MFA 5.37.0 DAILY VALIDATION REPORT

Date:
Alpha commit:
LIVE commit:

Tests run:
PASS:
PASS WITH NOTE:
FAIL — OCR:
FAIL — BRIDGE:
FAIL — MODEL:
BLOCKED:

Issues discovered:

Changes made:

PRs/commits:

Protected checks:
Operation Console:
Regression Tests:
Production build:
Data Integrity:

Alpha status:
LIVE status:

Evidence retained:

Next session priorities:
1.
2.
3.
```

---

# 14. Alpha → LIVE promotion gate

Do not promote merely because GitHub tests are green.

Required before promotion:

- [ ] affected OCR benchmark cases pass
- [ ] affected bridge cases pass or bridge is explicitly out of scope
- [ ] affected fracture cases pass
- [ ] affected gadget cases pass
- [ ] affected Ideal Loadout cases pass
- [ ] Q-001 regression remains correct
- [ ] protected GitHub checks all pass
- [ ] production-obfuscated build passes
- [ ] no unintended protected-mechanics diff
- [ ] user has completed required in-game validation
- [ ] Alpha deployment visually checked

Then:

- [ ] open protected Alpha → Main PR
- [ ] rerun all required checks on promotion PR
- [ ] merge to Main
- [ ] verify LIVE deployment
- [ ] record LIVE commit in test log

---

# 15. Recommended Day 1 run

Do this before further mechanics work.

## OCR

- [ ] OCR-001 — Q-001 known Quantanium reference
- [ ] OCR-002 — different rock
- [ ] OCR-003 — different ship HUD if available

## Bridge

- [ ] BRG-001 — startup/connection
- [ ] BRG-002 — browser refresh/reconnect
- [ ] BRG-004 — record which telemetry fields are actually available

## Fracture

Using Q-001:

- [ ] FRAC-001 — current known fleet configuration
- [ ] FRAC-002 — one equipment change
- [ ] FRAC-003 — borderline configuration if possible

## Gadgets

Q-001, same fleet:

- [ ] GAD-001 — None
- [ ] GAD-005 — Sabir
- [ ] GAD-006 — Stalwart

## Ideal Loadout

Q-001:

- [ ] IDEAL-001 — Balanced Operations
- [ ] IDEAL-002 — Minimum Hulls
- [ ] IDEAL-003 — Minimum Crew
- [ ] IDEAL-009 — Gadget comparison

## End of Day 1

- [ ] Complete daily report
- [ ] classify discrepancies
- [ ] decide next code change from evidence only
- [ ] no LIVE promotion unless explicitly justified
