# Mining Fracture Analyser v5.36.0 — User Guide

## Purpose

MFA is designed to answer one operational problem:

> Given this rock, can I fracture it with my current mining ship and loadout; if not, what is the best loadout, how many additional mining ships are required, and what should each assisting ship fit?

The application separates **actual fleet state** from **ideal recommendation**.

- **Fleet Planner** = what you actually have present and fitted.
- **Recommended Solutions** = the ideal target-driven solution for the rock.

Do not use the Fleet Planner to try to teach the recommendation engine what to choose. The recommendation should be driven by the target and mission constraints.

---

## 1. Open MFA

Use the maintained web version:

**https://mining-fracture-analyser.pages.dev/**

MFA v5.36.0 targets **Star Citizen 4.10.1 LIVE**.

The current web application does not require an AI account, API key, subscription, or standalone Windows installation.

---

## 2. Choose a theme

Use the theme selector in the top-right:

- **Planner Day**
- **Planner Dusk**
- **Planner Night**

Themes change presentation only. They do not change calculations or saved operational state.

---

## 3. Acquire the rock values

### Recommended method for v5.36.0: Manual

Enter the rock's values from the in-game mining scan:

- **Rock Mass**
- **Resistance**
- **Instability**
- **Material** — optional operational reference

For the most reliable solver result, use the **base/original rock values** before applying laser/module/gadget effects.

### Screenshot OCR

The screenshot scanner is currently **experimental**.

It can help populate fields, but v5.36.0 does not consider it authoritative because Star Citizen mining HUD layouts and colours differ across ships, resolutions and cockpit presentations.

Always visually verify OCR-derived values before using the recommendation.

A dedicated 4.10.1 Target Acquisition/OCR rebuild is planned after team testing with Prospector, MOLE and Golem screenshots.

---

## 4. Select an active gadget

If a mining gadget is already attached to the rock, select it in **Active Gadget**.

If no gadget is fitted, leave the selection at **None**.

The gadget affects the deterministic calculation only according to its stored verified modifiers.

---

## 5. Set mission constraints

The Mission Constraints section controls what the ideal solver is allowed to recommend.

### Objective

Typical objectives include:

- **Minimum ships** — prefer the smallest viable fleet.
- **Maximum fracture margin** — prefer more available fracture capacity.
- **Minimum instability** — prefer configurations that reduce instability where the model supports comparison.
- **Minimum consumables** — prefer fewer consumable module activations.

### Max fleet

Sets the maximum number of vessels the solver may use in an ideal plan.

### Allow active modules

When enabled, Recommended Solutions may use Active mining modules.

When an Active module is recommended as part of the best plan, its required ON state must be reproduced exactly.

### Allow gadgets

When enabled, the solver may recommend a mining gadget.

---

## 6. Configure the actual Fleet Planner

The Fleet Planner describes the real operation.

Set the quantity for each vessel type and configure each vessel card.

### Vessel status

- **Active** — currently lasing and included in the current fracture verdict.
- **Available** — present and able to assist, but not currently contributing to the current fracture calculation.
- **Standby** — excluded from the current fracture calculation.

### Mining head

Choose the mining head actually fitted to that mining arm.

### Modules

Choose the modules actually installed in each available slot.

For Active modules, ensure the activation state reflects what is actually ON.

### MOLE

Each active MOLE mining arm is calculated independently.

### Prospector

The Prospector contributes its configured mining head and modules when Active.

### Golem

The Golem is represented according to the current MFA equipment model and supported data.

---

## 7. Read the Fracture Verdict

The Fracture Verdict evaluates the **actual active fleet**, not the ideal recommendation.

Important outputs include:

- **Required power**
- **Available power**
- **Final resistance**
- **Final instability**
- **Power margin**
- fracture viable / not viable status

### If fracture is viable

Your currently Active fleet has enough calculated effective fracture capacity for the target under the current MFA model.

### If fracture is not viable

Your current fleet/loadout is insufficient. Use Recommended Solutions to determine the ideal change.

---

## 8. Read Recommended Solutions

Recommended Solutions is the core planning output.

MFA returns **one best ideal plan** rather than a long ranked list.

The solution can specify:

- exact number of vessels;
- vessel type;
- exact mining head per active mining arm;
- exact module loadout;
- Active module ON/OFF requirement;
- gadget requirement;
- expected effective fracture capacity;
- required power;
- resistance/instability result;
- fracture margin.

### Additional ships

If the rock cannot be fractured solo, the recommendation may require additional ships.

Example logic:

```text
Solo Prospector best loadout
        ↓
still insufficient
        ↓
2-vessel solution
        ↓
still insufficient
        ↓
3-vessel solution
        ↓
first/best viable plan within constraints
```

The plan should tell you what each assisting vessel needs to fit.

---

## 9. Confirm assisting ships

Recommended vessel cards include **Available to assist** confirmation.

This is deliberately separate from the ideal solver.

The ideal solution should not change simply because a particular crew member is unavailable.

Instead:

1. MFA calculates the best ideal solution.
2. You confirm which required vessels are actually available.
3. If the full recommended fleet is not available, revise the operational plan or mission constraints and recalculate.

---

## 10. Reproduce the recommended loadout

For a parity check, configure the actual Fleet Planner to match the recommendation exactly.

Match:

- exact vessel count;
- exact Active/Standby state;
- exact mining head;
- every module slot;
- Active module ON state;
- gadget;
- no extra Active vessels.

The Fleet Planner and Recommended Solutions use the same deterministic runtime. A correctly reproduced recommendation should therefore produce the same fracture result.

If it does not, report it as a calculation/parity bug.

---

## 11. Fleet Roster

Open the Fleet Roster from the top navigation to review supported mining vessels and related reference information.

The Fleet Roster is separate from the operation's actual Fleet Planner state.

---

## 12. Mining Database

Open **Mining Database** to inspect the staged equipment attributes used by MFA.

For 4.10.1, the audited reference set contains:

- 17 mining laser heads;
- 26 functional mining modules;
- 6 mining gadgets.

Unknown attributes remain explicitly unknown rather than being invented.

---

## 13. Understanding the calculation model

MFA v5.36.0 uses the audited 4.10.1 community-calibrated fracture model.

At a high level:

```text
Mining head power
  × module power modifiers
        ↓
raw active power

Rock resistance
  × head/module/gadget resistance modifiers
        ↓
effective resistance

raw active power
  × resistance transfer factor
        ↓
effective fracture power
```

For cooperative mining, each active head contributes independently and those effective contributions are summed.

The model is deterministic, but it is not an official CIG-published equation.

See [AUDIT_4.10.1_2026-09-27.md](AUDIT_4.10.1_2026-09-27.md).

---

## 14. Current Target Acquisition limitation

Do not assume Screenshot OCR is correct simply because it populated fields.

Known legacy scanner limitations include:

- fixed screen crop assumptions;
- HUD layout differences by ship;
- different HUD colours;
- different screen resolutions;
- complex asteroid backgrounds;
- Mass/Resistance/Instability line-position assumptions;
- no robust full composition extraction;
- risk of reading modified/current resistance rather than base resistance.

### Planned team validation

When the team is available, collect:

- Prospector scan screenshots;
- MOLE scan screenshots;
- Golem screenshots where available;
- different resolutions;
- different HUD/background conditions;
- known ground-truth values.

Those screenshots will become 4.10.1 regression fixtures for the Target Acquisition rebuild.

---

## 15. Reporting a calculation issue

A useful calculation report should include:

- MFA version;
- Star Citizen patch/build;
- Rock Mass;
- base Resistance;
- base Instability;
- gadget;
- exact vessel count;
- exact mining head per arm;
- exact modules;
- which Active modules were ON;
- MFA result;
- observed in-game result if available.

For OCR issues, also attach the original screenshot if it contains no sensitive information.

---

## 16. Important operational note

MFA is decision support for a live game whose mining mechanics can change between patches.

Use the calculator as a structured planning tool and verify critical target values against the current in-game HUD when practical.
