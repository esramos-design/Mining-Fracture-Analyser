# MFA 4.10.1 Mining Mechanics Audit — 2026-09-27

## Scope

This audit checks MFA against the current Star Citizen LIVE mining environment and the application's primary requirement:

> Determine whether the target rock can be fractured solo with the best loadout; if not, determine the minimum additional mining ships required and the best loadout for each assisting ship.

## Current game version

- Star Citizen LIVE patch: **4.10.1**
- Live build used by current mining/community datasets: **4.10.1-LIVE.12660092**
- Audit date: **2026-09-27**

RSI remains the authority for the current LIVE patch and general mining semantics.
UEX is used as community-maintained component reference data.

## Component-table audit

MFA table counts after reconciliation:

| Table | MFA | Current functional UEX set | Result |
|---|---:|---:|---|
| Mining laser heads | 17 | 17 | Match |
| Mining modules | 26 | 26 | Match |
| Mining gadgets | 6 | 6 | Match |

No component-stat changes were required in this audit.

A UEX search surface may expose a blank `ROC Module` placeholder, but its current functional module comparison set contains 26 modules and the placeholder has no verified mining modifiers. It is therefore not promoted into the calculator table.

Unknown fields remain `null`.

## Critical calculation finding

The previous MFA required-power expression was:

```
requiredPower = mass * (1 - effectiveResistance) / 5
```

This has the wrong resistance direction. Increasing rock resistance reduced the calculated required power and therefore increased apparent breakability.

That contradicts:

1. RSI's mining description: resistance measures how effectively the rock shrugs off mining-laser energy.
2. Current community-calibrated fracture models, where resistance reduces the fraction of laser power transferred to the rock.

The old expression could therefore mark high-resistance rocks as easier to fracture than low-resistance rocks.

## Corrected fracture model

For each active mining head:

```
activePower_i = headMaxPower * modulePowerMultipliers

resistanceMultiplier_i =
    headResistanceMultiplier
  * moduleResistanceMultipliers
  * gadgetResistanceMultiplier

effectiveResistance_i = baseRockResistance * resistanceMultiplier_i

transferFactor_i = max(0, 1 - effectiveResistance_i)

effectivePower_i = activePower_i * transferFactor_i

maxBreakableMass_i = 5 * effectivePower_i
```

For cooperative mining:

```
combinedEffectivePower = sum(effectivePower_i)

maxBreakableMass = 5 * combinedEffectivePower

fractureViable = maxBreakableMass >= rockMass
```

This implements the current per-head community-calibrated model while allowing heads with different resistance modifiers to contribute independently.

For UI compatibility, MFA also derives an equivalent power-weighted resistance and raw required power:

```
combinedTransferFactor = combinedEffectivePower / totalRawPower

equivalentResistance = 1 - combinedTransferFactor

requiredRawPower = rockMass / (5 * combinedTransferFactor)
```

This preserves a meaningful available-power vs required-power comparison.

## Instability

Instability remains a handling/control metric and is not used as a direct breakability threshold.

MFA continues to aggregate displayed instability using the existing geometric-mean convention because this audit did not find authoritative current evidence for a replacement multi-head instability formula.

This remains an explicitly modelled/uncertain mechanic.

## Solver impact

Recommended Solutions uses the same shared deterministic runtime as the active Fleet Planner, so this correction changes both paths together.

Expected effect:

- high-resistance rocks now correctly require more capability;
- resistance-reducing heads/modules/gadgets become materially valuable;
- multi-head and multi-ship configurations are evaluated by summed per-head fracture contribution;
- solver recommendations should no longer be biased by the inverted resistance formula.

## Evidence quality

### High confidence

- Current LIVE patch is 4.10.1.
- Component tables and the supported build metadata are current.
- Resistance must make a rock harder to fracture, not easier.
- Mining-laser power modifiers and resistance modifiers use the verified component values stored in MFA.

### Community-calibrated, not CIG-published formula

CIG does not publish the complete mathematical fracture formula.

The linear breakability model used here is based on current community empirical work and current mining calculators that document the model and in-game validation.

MFA must therefore describe the result as a deterministic **community-calibrated estimate**, not an official CIG formula.

## Regression requirements

The mechanics-change PR must verify:

- resistance monotonicity: higher resistance => higher required raw power;
- 1890 power at 0% resistance => approximately 9450 kg maximum mass;
- multi-head capacity equals the sum of independent head contributions;
- active module ON/OFF semantics remain correct;
- gadget resistance modifiers affect every active head;
- browser runtime and core engine remain identical;
- Recommended Solutions and copied Fleet Planner loadouts remain calculation-identical.

## Follow-up validation

The next strongest validation step is controlled in-game capture of:

- rock mass;
- base resistance;
- exact head/module/gadget loadout;
- number of active heads;
- observed breakable/not-breakable result.

Those observations can be stored as patch-scoped fixtures to detect future CIG mining rebalance changes.
