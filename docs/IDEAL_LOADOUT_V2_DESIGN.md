# Recommended Ideal Loadout v2 — Solver Design Contract

**Status:** Alpha design contract  
**Scope:** Recommendation-layer redesign only  
**Protected:** Existing audited 4.10.1 fracture mechanics, mining data, Fleet Planner architecture

---

## 1. Problem statement

The current Recommended Ideal Loadout is deterministic and target-driven, but the word **ideal** currently overstates what the solver optimizes.

The present solver:

- searches vessel counts across eligible vessel types;
- evaluates candidates through the protected fracture engine;
- uses a small set of deterministic equipment variants;
- ranks candidates by one selected objective.

That produces valid deterministic plans, but it has six important operational gaps:

1. objective semantics do not fully match their labels;
2. recommendation-side resource quantity is not modeled;
3. hull count is treated as the main resource cost;
4. repeated vessels of the same type cannot specialize independently;
5. strategy selection is a single first-match category rather than a multi-factor target profile;
6. viability has no configurable safety-margin floor.

The v2 solver must correct those recommendation-layer issues without changing the underlying fracture calculation.

---

## 2. Architectural separation

Three concepts must remain independent.

### Actual Fleet Planner

Represents the operation now:

- vessels physically present;
- fitted mining heads/modules;
- Active / Available / Standby;
- current fracture verdict.

### Recommendation Resource Pool

Represents what may realistically be planned for an ideal recommendation.

For each vessel type:

- eligible: yes/no;
- maximum quantity available for recommendation.

Example:

```text
ARGO MOLE          eligible: no     max: 0
MISC Prospector    eligible: yes    max: 2
Drake Golem        eligible: yes    max: 1
```

This is not the actual Fleet Planner.

### Available to assist

Post-recommendation confirmation only.

It must not participate in initial ideal ranking.

---

## 3. Recommendation resource limits

Replace boolean-only recommendation caps with explicit per-type limits.

Proposed preferences:

```text
recommendMole
recommendMoleMax

recommendProspector
recommendProspectorMax

recommendGolem
recommendGolemMax
```

Rules:

- unchecked => max = 0;
- checked => max is user-selected;
- global Max Fleet remains an overall upper bound;
- actual Fleet Planner quantities are never substituted for these values.

The search domain becomes:

```text
0 <= mole <= min(recommendMoleMax, maxFleet)
0 <= prospector <= min(recommendProspectorMax, maxFleet)
0 <= golem <= min(recommendGolemMax, maxFleet)

mole + prospector + golem <= maxFleet
```

---

## 4. Operational resource metrics

Every candidate must expose multiple costs instead of only vessel hull count.

At minimum:

### Hull count

```text
hulls = mole + prospector + golem
```

### Mining-head count

Derived from active recommended heads.

Examples:

- MOLE: up to 3 mining heads;
- Prospector: 1;
- Golem: 1 fixed mining system.

### Operator count

Use an explicit recommendation-layer planning model.

Initial Alpha model:

- Prospector = 1 operator;
- Golem = 1 operator;
- MOLE = 1 pilot + number of active mining stations recommended.

Therefore a fully utilized three-head MOLE has a planning operator count of 4.

This is not a claim about game-enforced minimum crew. It is an MFA operational planning metric.

### Consumable count

- active modules used;
- gadget used = +1.

### Power margin

Existing deterministic calculation.

### Final instability

Existing deterministic calculation.

---

## 5. Replace misleading objective semantics

Current objective labels should be replaced or redefined so their ranking order matches their name.

### A. Minimum hulls

Current “Minimum ships” behavior, renamed for accuracy.

Priority:

1. viable;
2. smallest hull count;
3. smallest operator count;
4. larger margin;
5. lower instability.

### B. Minimum crew

Priority:

1. viable;
2. smallest operator count;
3. smallest hull count;
4. larger margin;
5. lower instability.

### C. Maximum margin

Priority:

1. viable;
2. larger margin;
3. smaller hull count;
4. smaller operator count;
5. lower instability.

### D. Minimum instability

Priority:

1. viable;
2. lower final instability;
3. smallest hull count;
4. smallest operator count;
5. larger margin.

This fixes the current semantic problem where hull count outranks instability under “Minimum instability”.

### E. Minimum consumables

Priority:

1. viable;
2. smallest consumable count;
3. smallest hull count;
4. smallest operator count;
5. larger margin.

This fixes the current semantic problem where hull count outranks consumables under “Minimum consumables”.

### F. Balanced operations

New recommended default.

Use a lexicographic safety-first ranking rather than a hidden weighted score.

Priority:

1. viable;
2. meets configured minimum margin;
3. lower operator count;
4. lower hull count;
5. lower instability;
6. lower consumable count;
7. larger margin.

This gives users an operationally useful result without burying the logic inside an arbitrary weighted formula.

---

## 6. Minimum safety margin constraint

Add:

```text
Minimum fracture margin: [ 10 ] %
```

Default Alpha proposal: **10%**.

This is a recommendation constraint, not a fracture-mechanics change.

Candidate classification:

- **viable-safe**: fracture succeeds and margin >= minimum;
- **viable-thin**: fracture succeeds but margin < minimum;
- **not viable**: fracture does not succeed.

Ranking must prefer:

```text
viable-safe
then viable-thin
then not viable
```

The UI must clearly distinguish these states.

---

## 7. Multi-factor target profile

Replace first-match-only strategy selection with a target profile that can express multiple simultaneous needs.

Proposed profile flags:

```text
highMass
highResistance
highInstability
extremeResistance
extremeInstability
```

Example:

A rock may simultaneously be:

```text
Heavy + High Resistance + High Instability
```

instead of being forced into only one label.

The equipment generator should score heads/modules against the complete profile.

The existing deterministic strategy templates may remain as seed configurations, but they should no longer be the entire search universe.

---

## 8. Equipment candidate search

Current v1 behavior generates only:

- Primary;
- Backup A;
- Backup B.

v2 should expand this while keeping runtime bounded.

For each vessel/role:

1. filter compatible mining heads;
2. rank heads by target-profile suitability;
3. retain top N heads;
4. generate permitted module combinations for available slots;
5. retain top M loadouts after deterministic pre-scoring;
6. send retained candidates into the protected fracture engine.

Alpha limits should be explicit and tested.

Example:

```text
topHeadsPerRole = 4
topLoadoutsPerRole = 8
```

This converts “ideal” from three hand-picked variants into a broader deterministic optimization problem while preventing combinatorial explosion.

---

## 9. Independent specialization of repeated vessels

This is mandatory for v2.

Current behavior:

```text
2 × Prospector
=> both use the same selected Prospector variant
```

Required behavior:

```text
Prospector #1
  Breaker loadout

Prospector #2
  Stabilizer loadout
```

The candidate representation must therefore move from:

```text
selection.prospector = one variant repeated N times
```

to:

```text
vessels = [
  { type: "prospector", loadout: variantA },
  { type: "prospector", loadout: variantB }
]
```

The same rule applies to multiple MOLEs and multiple Golems.

---

## 10. MOLE modeling

A MOLE must not be treated as merely “one ship” for all objectives.

The candidate must expose:

- hull count = 1;
- active mining-head count = number of recommended active stations;
- operator planning count = 1 pilot + active mining stations;
- per-head role/loadout.

The optimizer may recommend fewer than three active MOLE mining stations when that is operationally superior.

Example:

```text
1 × MOLE
  Head 1: Breaker
  Head 2: Stabilizer
  Head 3: unused
```

This allows a true comparison against:

```text
2 × Prospector
```

using hulls, operators, heads, margin and instability rather than hull count alone.

---

## 11. Candidate portfolio

Do not show only one opaque “winner”.

The solver should retain the best candidate per meaningful operational objective.

Recommended public portfolio:

- **Recommended — Balanced**
- **Fewest Hulls**
- **Fewest Operators**
- **Highest Margin**
- **Lowest Instability**
- **Lowest Consumables**

If multiple objectives resolve to the same candidate, collapse duplicates.

The user still gets one highlighted recommendation, but can see why another plan may suit a different operational priority.

---

## 12. Explanation contract

Every displayed recommendation must explain why it ranked.

Example:

```text
WHY THIS PLAN

Balanced Operations selected.

✓ Meets 10% minimum margin
✓ 3 operators
✓ 3 hulls
✓ Final instability 11.7%
✓ No active modules required
✓ MOLE excluded by recommendation pool

Alternative:
1 × MOLE would use fewer hulls but is not eligible.
```

The explanation must be generated from objective facts, not free-form AI text.

---

## 13. Deterministic tie-breaking

After all objective fields are equal, use a neutral stable key.

Do not implicitly prefer one ship type by comparing MOLE/Prospector/Golem counts in an order that can look like a vessel preference.

Proposed final tie key:

1. canonical serialized vessel composition;
2. canonical serialized loadout names;
3. gadget name.

Its purpose is reproducibility only.

---

## 14. Complexity controls

Independent specialization increases the search space.

The solver must use deterministic pruning.

Recommended pipeline:

1. generate top per-role loadouts;
2. prune dominated single-vessel loadouts;
3. build vessels;
4. prune partial fleet states that cannot beat retained Pareto bounds;
5. evaluate full candidates;
6. retain Pareto frontier across:
   - operators;
   - hulls;
   - margin;
   - instability;
   - consumables.

No approximate random search.

The same input must always return the same output.

---

## 15. Pareto dominance

Candidate A dominates candidate B when A is no worse on every retained operational metric and strictly better on at least one.

For viable candidates, consider:

- hulls;
- operators;
- consumables;
- final instability;
- negative margin (larger margin is better).

Dominated candidates may be removed before final objective ranking.

This prevents the portfolio from filling with objectively inferior plans.

---

## 16. UI changes

### Mission Constraints

Replace current Objective list with:

- Balanced operations
- Minimum hulls
- Minimum crew
- Maximum fracture margin
- Minimum instability
- Minimum consumables

Add:

- Minimum fracture margin %
- Max fleet

### Recommendation Fleet Pool

For each vessel:

```text
[✓] ARGO MOLE          Max [ 1 ]
[✓] MISC Prospector    Max [ 2 ]
[✓] Drake Golem        Max [ 1 ]
```

### Recommended Solutions

Show:

- highlighted recommendation;
- objective explanation;
- resource summary:
  - hulls;
  - operators;
  - mining heads;
  - active modules;
  - gadget;
  - margin;
  - final instability;
- collapsed objective alternatives.

---

## 17. Migration behavior

Existing saved preferences must continue to load.

Mapping:

```text
minimum-ships        -> minimum-hulls
maximum-margin       -> maximum-margin
minimum-instability  -> minimum-instability
minimum-consumables  -> minimum-consumables
```

New users default to:

```text
objective = balanced-operations
minimumMarginPct = 10
```

Existing users retain their mapped objective until they change it.

Recommendation quantity defaults:

```text
MOLE max = 1
Prospector max = 2
Golem max = 1
```

These are recommendation planning defaults only and do not populate Fleet Planner.

---

## 18. Protected boundaries

v2 must not modify:

- `v535-runtime.js` fracture equations;
- `src/core/v535-engine.js` audited mechanics;
- mining head/module/gadget data values;
- actual Fleet Planner loadout semantics;
- OCR-to-Target Acquisition separation.

The v2 project may only change:

- recommendation candidate generation;
- recommendation constraints;
- recommendation ranking;
- recommendation explanation/UI.

---

## 19. Acceptance tests

At minimum:

### Resource pool

- MOLE max 0 can never return MOLE.
- Prospector max 2 can never return 3 Prospectors.
- Golem max 1 can never return 2 Golems.
- mixed fleets respect every per-type cap.

### Objective semantics

- Minimum instability ranks lower instability before hull count.
- Minimum consumables ranks fewer consumables before hull count.
- Minimum crew ranks operator count before hull count.
- Minimum hulls ranks hull count before operator count.
- Maximum margin ranks margin before hull count.

### Safety margin

- safe candidate outranks thin viable candidate under Balanced Operations.
- if no candidate reaches minimum margin, best viable-thin candidate is shown with warning.

### Specialization

- two same-type vessels can carry different deterministic loadouts.
- repeated-vessel specialization is represented explicitly in output.

### Independence

Changing actual Fleet Planner quantity/loadout must not change the ideal recommendation for identical Target Acquisition + recommendation constraints.

### Protected mechanics

Existing 4.10.1 regression vectors must remain byte-for-byte equivalent in calculation results.

---

## 20. Release sequence

1. implement on feature branch from `alpha`;
2. add solver-v2 unit tests;
3. run existing regression/data-integrity/production-build gates;
4. validate representative rocks manually;
5. merge to protected `alpha`;
6. compare v1 and v2 recommendation outputs;
7. only promote to `main` after operator validation.

---

## 21. Definition of “ideal” after v2

After this redesign, MFA may accurately describe the result as:

> The highest-ranked deterministic operational fracture plan found within the selected vessel-resource limits, safety constraint and optimization objective, evaluated using MFA's protected 4.10.1 fracture model.

That is the intended semantic contract for Recommended Ideal Loadout v2.
