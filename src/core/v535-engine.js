/**
 * MFA v5.35 deterministic calculation engine.
 *
 * This module intentionally mirrors the current v5.35 calculation semantics
 * without touching the browser UI. It exists to provide regression protection
 * before any Star Citizen 4.10.1 mechanics migration.
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

  let totalPwr = 0;
  let totalResMult = 1.0;
  let totalInstMult = 1.0;
  let activeArms = 0;

  for (const arm of arms) {
    if (!arm || arm.enabled === false) continue;

    activeArms += 1;
    const pwr = Number(arm.power) || 0;
    const rEff = Number(arm.resistanceEffect) || 0;
    const iEff = Number(arm.instabilityEffect) || 0;

    let armRes = 1 + (rEff / 100);
    let armInst = 1 + (iEff / 100);
    let armPwr = 1.0;

    for (const mod of arm.modules || []) {
      if (!mod || mod.disabled || mod.name === "None") continue;

      const isActiveModule = mod.activation === "Active";
      const active = !isActiveModule || mod.active === true;
      if (!active) continue;

      armPwr *= Number(mod.multiplier) || 1.0;
      armRes *= 1 + ((Number(mod.resistanceEffect) || 0) / 100);
      armInst *= 1 + ((Number(mod.instabilityEffect) || 0) / 100);
    }

    totalPwr += pwr * armPwr;
    totalResMult *= armRes;
    totalInstMult *= armInst;
  }

  if (activeArms > 0) {
    totalResMult = Math.pow(totalResMult, 1 / activeArms);
    totalInstMult = Math.pow(totalInstMult, 1 / activeArms);
  }

  if (gadget) {
    const gR = Number(gadget.reduction ?? gadget.resistance) || 0;
    totalResMult *= 1 + (gR / 100);
    totalInstMult *= 1 + ((Number(gadget.instabilityEffect) || 0) / 100);
  }

  const finalRes = Math.max(0, baseRes * totalResMult);
  const finalInst = Math.max(0, baseInst * totalInstMult);

  const reqPwr = (finalRes / 100) < 1.0
    ? (mass * (1.0 - finalRes / 100)) / 5.0
    : 999999;

  const success = totalPwr >= reqPwr && reqPwr > 0;

  return {
    rockMass: mass,
    baseResistance: baseRes,
    baseInstability: baseInst,
    totalPower: totalPwr,
    finalResistance: finalRes,
    finalInstability: finalInst,
    requiredPower: reqPwr,
    success,
    activeArms
  };
}
