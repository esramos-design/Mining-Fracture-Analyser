/**
 * MFA deterministic fracture calculation engine.
 *
 * 4.10.1 audit correction:
 * - Resistance must reduce delivered fracture power, never increase capacity.
 * - Each enabled mining head contributes independently:
 *     effectivePower_i = activePower_i * (1 - effectiveResistance_i)
 * - Combined fracture capacity is the sum of all head contributions.
 * - Equivalent required raw power is derived from the power-weighted transfer factor.
 *
 * The exported function name remains calculateV535 for compatibility with the
 * existing runtime/UI contract.
 */

export function calculateV535({
  rockMass,
  resistance,
  instability,
  arms = [],
  gadget = null
}) {
  const baseRes = Number(resistance) || 0;
  const baseInst = Number(instability) || 0;
  const mass = Number(rockMass) || 0;

  const gadgetResEffect = gadget
    ? (Number(gadget.reduction ?? gadget.resistance) || 0)
    : 0;
  const gadgetResMult = 1 + (gadgetResEffect / 100);
  const gadgetInstMult = gadget
    ? 1 + ((Number(gadget.instabilityEffect) || 0) / 100)
    : 1;

  let totalPwr = 0;
  let effectivePwr = 0;
  let totalInstMult = 1.0;
  let activeArms = 0;

  for (const arm of arms) {
    if (!arm || arm.enabled === false) continue;

    activeArms += 1;

    const pwr = Number(arm.power) || 0;
    const rEff = Number(arm.resistanceEffect) || 0;
    const iEff = Number(arm.instabilityEffect) || 0;

    let armResMult = 1 + (rEff / 100);
    let armInstMult = 1 + (iEff / 100);
    let armPwrMult = 1.0;

    for (const mod of arm.modules || []) {
      if (!mod || mod.disabled || mod.name === "None") continue;

      const isActiveModule = mod.activation === "Active";
      const active = !isActiveModule || mod.active === true;
      if (!active) continue;

      armPwrMult *= Number(mod.multiplier) || 1.0;
      armResMult *= 1 + ((Number(mod.resistanceEffect) || 0) / 100);
      armInstMult *= 1 + ((Number(mod.instabilityEffect) || 0) / 100);
    }

    const armPower = pwr * armPwrMult;
    const armResistancePct = Math.max(0, baseRes * armResMult * gadgetResMult);
    const transferFactor = Math.max(0, 1 - (armResistancePct / 100));

    totalPwr += armPower;
    effectivePwr += armPower * transferFactor;
    totalInstMult *= armInstMult;
  }

  if (activeArms > 0) {
    totalInstMult = Math.pow(totalInstMult, 1 / activeArms);
  }

  const finalInst = Math.max(0, baseInst * totalInstMult * gadgetInstMult);

  // Equivalent combined resistance is power-weighted so that:
  // 5 * totalPower * (1 - finalResistance) === sum(per-head capacity).
  let finalRes;
  if (totalPwr > 0) {
    const combinedTransferFactor = effectivePwr / totalPwr;
    finalRes = Math.max(0, 100 * (1 - combinedTransferFactor));
  } else {
    finalRes = Math.max(0, baseRes * gadgetResMult);
  }

  const transferFactor = Math.max(0, 1 - (finalRes / 100));
  const reqPwr = transferFactor > 0
    ? mass / (5.0 * transferFactor)
    : 999999;

  const maxBreakableMass = 5.0 * effectivePwr;
  const success = totalPwr > 0 && mass > 0 && maxBreakableMass >= mass;

  return {
    rockMass: mass,
    baseResistance: baseRes,
    baseInstability: baseInst,
    totalPower: totalPwr,
    effectivePower: effectivePwr,
    maxBreakableMass,
    finalResistance: finalRes,
    finalInstability: finalInst,
    requiredPower: reqPwr,
    success,
    activeArms
  };
}
