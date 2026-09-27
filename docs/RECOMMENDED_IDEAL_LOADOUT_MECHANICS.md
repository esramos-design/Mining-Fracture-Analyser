# Recommended Ideal Loadout — Public Mechanics Guide

**Applies to:** MFA v5.36.x / Star Citizen 4.10.1 LIVE  
**Scope:** How MFA constructs, evaluates and ranks the **Recommended Ideal Loadout**.

> MFA is a deterministic community tool. The fracture equations and equipment data used here are community-calibrated and audited for MFA; they are not official CIG-published equations.

---

## 1. What “Recommended Ideal Loadout” means

The Recommended Ideal Loadout is a **target-driven planning result**.

It answers:

> Given this rock and the selected mission constraints, what vessel combination and equipment configuration ranks highest under the selected objective?

It is intentionally separate from the **Fleet Planner**.

- **Fleet Planner** = what is physically present, fitted and active now.
- **Vessels available for recommendation** = which vessel types the ideal solver is allowed to consider.
- **Available to assist** = post-recommendation confirmation that a vessel required by the selected ideal plan can actually deploy.

Changing Fleet Planner quantity does **not** add or remove a vessel type from the ideal solver. Recommendation eligibility is controlled only by the recommendation-vessel pool.

---

## 2. Inputs used by the ideal solver

The ideal solver reads:

- rock mass;
- base resistance;
- base instability;
- optimizer objective;
- maximum ideal fleet size;
- whether Active modules are allowed;
- whether gadgets are allowed;
- recommendation-vessel eligibility:
  - ARGO MOLE;
  - MISC Prospector;
  - Drake Golem.

The ideal solver does **not** use current Fleet Planner vessel quantities, current Active/Available/Standby state or fitted Fleet Planner loadouts as recommendation constraints.

---

## 3. Vessel eligibility

Each recommendation checkbox is authoritative.

If a type is unchecked, its search maximum becomes zero.

Examples:

- MOLE only → only MOLE-based candidates are generated.
- Prospector only → only Prospector-based candidates are generated.
- Golem only → only Golem-based candidates are generated.
- Prospector + Golem → Prospector-only, Golem-only and mixed Prospector/Golem candidates are generated.
- All unchecked → no ideal vessel candidate can be generated.

The current maximum fleet setting limits the total number of vessels in a candidate.

---

## 4. Strategy classification

Before candidate fleets are ranked, MFA selects a deterministic equipment strategy from the target.

Current strategy order:

1. **Hazard / Instability** — base instability > 70
2. **Resistance Breaker** — base resistance > 60
3. **Stabilization** — base instability > 45
4. **Heavy Cluster** — mass > 14,000 kg
5. **Standard** — all other targets

The first matching rule wins.

Each strategy defines a baseline role/equipment template for MOLE, Prospector and Golem. MFA also generates backup equipment variants from compatible heads/modules.

---

## 5. Candidate equipment variants

For each eligible vessel type MFA currently builds three deterministic equipment variants:

- **Primary**
- **Backup A**
- **Backup B**

Compatible mining heads are ranked using the target context and role.

Examples of role emphasis:

- **Break / high resistance:** resistance reduction is heavily weighted.
- **Stabilization / high instability:** instability reduction is heavily weighted.
- **Extraction:** extraction capability, power and instability are considered.
- **General:** power, resistance and instability are balanced by the current deterministic scoring rule.

When Active modules are disabled, an Active module in a template is replaced with the nearest permitted passive alternative according to MFA's equipment-distance rule.

---

## 6. Fleet-combination search

MFA enumerates every vessel-count combination permitted by:

- recommendation-vessel checkboxes;
- Max Fleet.

For example, with:

- MOLE unchecked;
- Prospector checked;
- Golem checked;
- Max Fleet = 3;

the composition search includes:

- 1 Prospector;
- 2 Prospectors;
- 3 Prospectors;
- 1 Golem;
- 2 Golems;
- 3 Golems;
- 1 Prospector + 1 Golem;
- 2 Prospectors + 1 Golem;
- 1 Prospector + 2 Golems.

For every composition, MFA walks the available Primary / Backup A / Backup B equipment variant choices for every vessel type present.

If gadgets are allowed, the same candidate is evaluated with every available gadget choice. If gadgets are disabled, only **None** is evaluated.

---

## 7. Important current limitation: repeated vessels share a variant

If a candidate contains multiple vessels of the same type, the current solver repeats the same selected equipment variant for that vessel type.

Example:

- 2 × Prospector using the selected Prospector Primary variant

is currently searched.

But the current solver does **not yet fully optimize**:

- Prospector #1 as a Breaker;
- Prospector #2 as a different Stabilizer;

as two independently specialized same-type loadouts within one candidate.

Mixed vessel **types** are genuinely searched; independently specialized duplicate vessels are a future optimization area.

---

## 8. Fracture evaluation

Every candidate is evaluated by the same protected MFA 4.10.1 runtime engine used for deterministic fracture calculations.

For each enabled mining head:

1. Base mining-head power is read.
2. Effective module power multipliers are applied.
3. Mining-head resistance effects are applied.
4. Module resistance effects are applied.
5. Gadget resistance effect is applied.
6. Effective delivered power is reduced by the resulting resistance.

For a head:

```text
Raw head power = base head power × effective module power multipliers

Resistance transfer factor = max(0, 1 - effective resistance / 100)

Effective head power = raw head power × resistance transfer factor
```

Cooperative effective power is the sum of all enabled heads:

```text
Total effective power = Σ effective head power
```

The current maximum breakable mass is:

```text
Max breakable mass = 5 × total effective power
```

A candidate is viable when:

```text
Max breakable mass ≥ target rock mass
```

The displayed required raw power is derived from target mass and final effective resistance:

```text
Required power = rock mass / (5 × final transfer factor)
```

If resistance fully blocks transfer, MFA keeps a numeric baseline requirement available for display rather than replacing the number with only an “Impossible” label.

---

## 9. Instability treatment

Each active head contributes its head/module instability multiplier.

MFA combines the active-head multipliers using their geometric mean and then applies the gadget instability multiplier.

This produces the displayed **Final Instability** value used by the recommendation ranking when the selected objective calls for it.

---

## 10. Fracture margin

For viable candidates:

```text
Margin % = (available raw power - required raw power)
           / required raw power × 100
```

A positive margin indicates raw power above the calculated requirement.

A larger margin does not automatically win unless the selected objective gives margin priority.

---

## 11. How the selected objective ranks candidates

All objectives first prefer a **viable** candidate over a non-viable one.

After that, the ordering changes.

### Minimum ships

Ranking priority:

1. viable before non-viable;
2. fewer vessels;
3. larger fracture margin.

This is the default objective.

**Consequence:** if 1 × MOLE is viable, it will normally rank ahead of a 2- or 3-vessel mixed fleet, even if the mixed fleet has a larger margin.

### Maximum fracture margin

Ranking priority:

1. viable before non-viable;
2. larger fracture margin;
3. fewer vessels.

This can select a larger fleet when the larger fleet produces the strongest calculated margin.

### Minimum instability

Ranking priority:

1. viable before non-viable;
2. fewer vessels;
3. lower Final Instability;
4. larger fracture margin.

This still treats fleet size as more important than instability once viability is established.

### Minimum consumables

Ranking priority:

1. viable before non-viable;
2. fewer vessels;
3. fewer Active modules plus gadget use;
4. larger fracture margin.

A gadget adds one consumable-use cost in this ranking.

---

## 12. Deterministic tie-breaking

If candidates remain equal under the selected objective, MFA uses a stable composition order so the same input produces the same output.

The current composition tie-break compares, in order:

1. MOLE count;
2. Prospector count;
3. Golem count;
4. gadget name.

This is a deterministic implementation detail, not a statement that one vessel is operationally superior.

---

## 13. Why “1 × MOLE” appears often

Under **Minimum ships**, one viable MOLE is one vessel.

Two Prospectors are two vessels.

Therefore:

```text
1 vessel < 2 vessels
```

and the MOLE candidate wins before the solver considers the larger fleet's margin.

The current cost model does **not yet normalize hull count against:**

- number of mining heads;
- number of operators;
- crew requirement;
- ownership or logistics;
- travel/arrival time;
- independent specialization of repeated vessels.

This is why “Minimum ships” must be read literally as **minimum vessel hull count**, not minimum crew, minimum heads or minimum operational burden.

---

## 14. Reading the Recommendation Basis panel

The recommendation basis shows the assumptions used for the current result:

- Target mass
- Resistance
- Instability
- Objective
- Max ideal fleet
- Active modules allowed / passive only
- Gadgets allowed / disabled
- Recommendation vessels
- Fleet Planner influence

For the target-driven ideal path, Fleet Planner influence should read:

**None · target-driven ideal**

This is an integrity check that the ideal solver has not been biased by the actual operation roster.

---

## 15. “Available to assist” does not recalculate the ideal

After the solver chooses the ideal composition, every required vessel is shown with **Available to assist**.

That checkbox is operational confirmation only.

It changes:

- NOT CONFIRMED / CONFIRMED AVAILABLE;
- READY / NOT READY summary.

It does **not** change:

- selected vessel types;
- selected vessel counts;
- mining heads;
- modules;
- gadget;
- calculated margin.

If a required vessel cannot deploy, change the recommendation-vessel pool or another mission constraint and recalculate.

---

## 16. Reproducing the ideal plan in Fleet Planner

To validate the recommendation against the actual operation:

1. create the exact recommended vessel count in Fleet Planner;
2. set the recommended vessels to **Active**;
3. fit the exact mining heads shown;
4. fit every recommended module;
5. switch every recommended Active module **ON**;
6. select the recommended gadget;
7. do not leave extra vessels Active.

The Fracture Verdict should then represent the reproduced real fleet configuration.

---

## 17. What the ideal solver does not currently optimize

The current ideal solver does not yet model:

- player ownership;
- exact number of each vessel available for future planning;
- crew count as an objective cost;
- mining-head count as a normalized fleet cost;
- travel time or arrival delay;
- fuel/logistics;
- risk of losing a particular hull;
- individual specialization of multiple identical vessel types;
- player skill;
- real-time coordination latency.

These are operational variables, not part of the current deterministic fracture model.

---

## 18. Practical interpretation

Use the result as:

> the highest-ranked deterministic fracture plan under the mission constraints you selected.

Do not interpret it as:

> the only valid fleet, the safest human decision, or an official Star Citizen recommendation.

Different objectives can legitimately choose different plans from the same target.

---

## 19. Public auditability

The readable development source remains on the protected `alpha` branch.

The LIVE deployment is produced from `main` through the production build. Production JavaScript may be minified/obfuscated for casual source hardening, but MFA remains open-source and the readable implementation remains available in the repository.

The calculation authority and data-integrity contracts remain the controlling references for protected mechanics and mining data.
