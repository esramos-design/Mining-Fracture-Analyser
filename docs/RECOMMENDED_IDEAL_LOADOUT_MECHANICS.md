# Recommended Ideal Loadout v2 — Public Mechanics Guide

**Applies to:** MFA v5.36.x Alpha / Star Citizen 4.10.1 LIVE  
**Scope:** How MFA constructs, evaluates and ranks the Recommended Ideal Loadout v2.

> MFA is a deterministic community tool. Its fracture equations and equipment data are community-calibrated and are not official CIG-published equations.

## 1. What “ideal” means

The Recommended Ideal Loadout is the highest-ranked deterministic fracture plan found within the **Team Availability**, selected safety margin and optimization objective.

It remains separate from the actual Fleet Planner:

- **Fleet Planner** — vessels physically present now, their fitted loadouts and Active / Available / Standby state.
- **Team Availability** — vessel types and quantities your team can actually provide for this operation. It is a live solver constraint.

The actual Fleet Planner does not bias the ideal recommendation.

## 2. Inputs

The solver reads:

- Rock Mass
- Base Resistance
- Base Instability
- Objective
- Minimum fracture margin
- Max fleet
- Allow Active modules
- Allow gadgets
- Team Availability:
  - ARGO MOLE — eligible + maximum quantity
  - MISC Prospector — eligible + maximum quantity
  - Drake Golem — eligible + maximum quantity

An unchecked vessel has a recommendation maximum of zero.

## 3. Team Availability

Example:

```text
ARGO MOLE          Available 1
MISC Prospector    Available 2
Drake Golem        Available 1
```

The solver can combine those types but may never exceed either the available quantity or the global Max Fleet value.

Changing a checkbox or quantity immediately reruns the recommendation. For example, if the first result is 1 × MOLE but no MOLE is available, uncheck MOLE and set the available Prospectors/Golems. MFA then searches only those vessels and returns the best feasible replacement plan. These availability values do not create vessels in the Actual Fleet Planner.

## 4. Equipment strategies

MFA still derives deterministic seed strategies from the target:

1. Hazard / Instability — instability > 70
2. Resistance Breaker — resistance > 60
3. Stabilization — instability > 45
4. Heavy Cluster — mass > 14,000 kg
5. Standard — otherwise

For each supported vessel type MFA generates Primary, Backup A and Backup B deterministic equipment variants using compatible mining heads and modules.

These variants are recommendation-layer search candidates. Every final candidate is still evaluated through the protected 4.10.1 fracture runtime.

## 5. Duplicate-vessel specialization

v2 no longer requires multiple vessels of the same type to use the same variant.

For example, a two-Prospector candidate may be:

```text
Prospector #1 — Primary / Breaker
Prospector #2 — Backup A / Stabilizer
```

With three available variants and two identical vessels, MFA searches the six unique unordered assignments:

```text
Primary + Primary
Primary + Backup A
Primary + Backup B
Backup A + Backup A
Backup A + Backup B
Backup B + Backup B
```

Equivalent permutations are not evaluated twice.

## 6. Candidate resource metrics

Every candidate exposes several operational costs.

### Hulls

Number of vessel hulls in the recommendation.

### Operators

Current Alpha planning metric:

- Prospector = 1 operator
- Golem = 1 operator
- MOLE = 1 pilot + number of active recommended mining stations

A MOLE using all three mining stations therefore has a planning operator count of 4.

This is an MFA planning metric, not a claim about game-enforced minimum crew.

### Mining heads

Total active recommended mining heads/systems.

### Consumables

Active-module uses plus one when a gadget is required.

### Margin

Calculated fracture-power margin.

### Final instability

Calculated final instability after the recommended loadout is applied.

## 7. Protected fracture evaluation

The recommendation layer does not implement a separate fracture equation.

Every candidate calls the same protected MFA runtime:

```text
MFAV535.calculateV535()
```

For each enabled head:

```text
Raw head power = base head power × effective module power multipliers

Resistance transfer factor = max(0, 1 - effective resistance / 100)

Effective head power = raw head power × resistance transfer factor
```

Cooperative power:

```text
Total effective power = Σ effective head power
```

Maximum breakable mass:

```text
Max breakable mass = 5 × total effective power
```

A candidate is fracture-viable when:

```text
Max breakable mass ≥ rock mass
```

Displayed required raw power remains:

```text
Required power = rock mass / (5 × final transfer factor)
```

## 8. Minimum fracture margin

v2 adds a recommendation safety constraint.

Default Alpha value:

```text
10%
```

Candidates are classified:

- **SAFE MARGIN** — fracture succeeds and margin meets/exceeds the selected floor.
- **THIN MARGIN** — fracture succeeds but margin is below the selected floor.
- **NOT VIABLE** — fracture does not succeed.

Ranking always prefers SAFE over THIN, and THIN over NOT VIABLE.

This does not change fracture mechanics; it changes recommendation ranking only.

## 9. Objectives

### Balanced operations — default

Priority:

1. SAFE / THIN / NOT VIABLE class
2. fewer operators
3. fewer hulls
4. lower instability
5. fewer consumables
6. larger fracture margin

### Minimum hulls

Priority:

1. safety class
2. fewer hulls
3. fewer operators
4. larger margin
5. lower instability

### Minimum crew

Priority:

1. safety class
2. fewer operators
3. fewer hulls
4. larger margin
5. lower instability

### Maximum fracture margin

Priority:

1. safety class
2. larger margin
3. fewer hulls
4. fewer operators
5. lower instability

### Minimum instability

Priority:

1. safety class
2. lower Final Instability
3. fewer hulls
4. fewer operators
5. larger margin

Unlike v1, hull count does not outrank instability under this objective.

### Minimum consumables

Priority:

1. safety class
2. fewer consumables
3. fewer hulls
4. fewer operators
5. larger margin

Unlike v1, hull count does not outrank consumables under this objective.

## 10. Why a MOLE no longer automatically means “cheapest”

Under Minimum Hulls, one MOLE still has a hull-count advantage over two Prospectors.

Under Balanced Operations or Minimum Crew, MFA also considers the operator planning count.

Example:

```text
1 × MOLE using 3 stations
Hulls: 1
Operators: 4
Heads: 3

2 × Prospector
Hulls: 2
Operators: 2
Heads: 2
```

Which plan ranks higher depends on objective, safety class, instability, consumables and margin.

## 11. Objective alternatives

MFA keeps one highlighted recommendation for the selected objective but also derives best plans for:

- Balanced
- Fewest Hulls
- Fewest Operators
- Highest Margin
- Lowest Instability
- Lowest Consumables

Duplicate plans are collapsed.

This exposes meaningful operational alternatives without turning the display into an unranked list.

## 12. Why this plan

The highlighted recommendation contains a deterministic explanation showing:

- selected objective
- safety-margin result
- operator count
- hull count
- active mining-head count
- Final Instability
- consumable count

No AI-generated explanation is used.

## Gadget evaluation and comparison

When **Allow gadgets** is enabled, the recommendation solver evaluates each
candidate vessel/head/module configuration with **one** of the supported
gadgets, including **None**. It calls the protected fracture engine separately
for each option and ranks the resulting candidate under the selected objective
and safety-margin constraint.

The gadget selected in **Actual Fleet Planner** applies to the real deployed
fleet's Fracture Verdict. The recommendation may select a different gadget:
it is an independent target-driven plan, not a copy of the actual fleet.

The **Gadget comparison** panel under the highlighted ideal loadout holds the
recommended vessels and head/module loadouts constant. It shows each allowed
gadget's calculated:

- fracture viability / safety class;
- power margin;
- final resistance;
- final instability.

The selected option is marked in the table. Charge-rate and charge-window
attributes are shown alongside these metrics as **informational equipment
reference data**, not as simulated outcomes.

**Calculation boundary:** MFA's audited 4.10.1 fracture-power engine currently
models gadget resistance and instability modifiers. It does not fully simulate
charge-window size, charge speed, cluster effects or operator skill. The
recommendation cannot currently claim to optimize those in-game behaviours;
they may make a different gadget operationally preferable despite a lower
modelled margin.

Only **one gadget per evaluated candidate** is currently modelled; effects
from several simultaneously attached gadgets are not stacked. No additional
fracture equations are introduced by the comparison table.

---

## 13. Replanning when the ideal vessel is unavailable

The initial recommendation is not a dead end.

Use **Team Availability** in the Recommended Plan column to state what support is actually available now. Each vessel type has:

- a checkbox — whether MFA may use that type;
- an Available quantity — the maximum number MFA may use.

Any change immediately recalculates the recommendation.

Example:

```text
Initial result: 1 × MOLE

Team actually available:
MOLE             unchecked / 0
Prospector       checked / 2
Golem            checked / 1
```

MFA then evaluates Prospector-only, Golem-only and mixed Prospector + Golem combinations, subject to Max Fleet, objective and minimum safety margin. It must never return a MOLE while MOLE is unchecked.

This remains separate from **Actual Fleet Planner**, which represents ships already present and their fitted equipment.

## 14. Reproducing the recommendation

To reproduce the recommendation in Fleet Planner:

1. create the exact recommended vessel quantities;
2. set those vessels Active;
3. copy each vessel-specific mining head;
4. copy every recommended module;
5. switch recommended Active modules ON;
6. select the recommended gadget;
7. leave additional vessels non-Active.

The Fracture Verdict then evaluates the real configured fleet through the same protected runtime.

## 15. Current Alpha limitations

v2 currently expands independent specialization across the existing Primary / Backup A / Backup B candidate set.

It does not yet exhaustively generate every mathematically possible mining-head/module permutation.

It also does not optimize:

- ownership;
- travel time;
- fuel/logistics;
- player skill;
- coordination latency;
- financial value of a hull;
- risk of vessel loss.

These are outside the protected fracture model.

## 16. Determinism

No random search is used.

Equivalent duplicate-vessel permutations are removed, and final ties use a stable canonical composition/loadout key. Identical inputs therefore produce identical results.

## 17. Protected boundaries

Ideal Loadout v2 does not modify:

- `v535-runtime.js` fracture equations
- `src/core/v535-engine.js`
- mining head/module/gadget data
- actual Fleet Planner semantics
- OCR → Target Acquisition separation

v2 changes only recommendation candidate generation, constraints, ranking, explanation and presentation.
