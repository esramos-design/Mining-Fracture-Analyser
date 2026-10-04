/**
 * MFA shared browser runtime calculation engine.
 *
 * 4.10.1 audit correction:
 * - Resistance reduces delivered fracture power.
 * - Each enabled mining head contributes independently to break capacity.
 * - Combined capacity is the sum of per-head effective power contributions.
 *
 * Classic-script format is intentional so MFA continues to work from file://.
 */
(function (root) {
    function calculateV535(input) {
        input = input || {};

        var baseRes = Number(input.resistance) || 0;
        var baseInst = Number(input.instability) || 0;
        var mass = Number(input.rockMass) || 0;
        var arms = Array.isArray(input.arms) ? input.arms : [];
        var gadget = input.gadget || null;

        var gadgetResEffect = gadget
            ? (Number(gadget.reduction != null ? gadget.reduction : gadget.resistance) || 0)
            : 0;
        var gadgetResMult = 1 + (gadgetResEffect / 100);
        var gadgetInstMult = gadget
            ? 1 + ((Number(gadget.instabilityEffect) || 0) / 100)
            : 1;

        var totalPwr = 0;
        var effectivePwr = 0;
        var weightedRawResistance = 0;
        var totalInstMult = 1.0;
        var activeArms = 0;

        arms.forEach(function (arm) {
            if (!arm || arm.enabled === false) return;

            activeArms += 1;

            var pwr = Number(arm.power) || 0;
            var rEff = Number(arm.resistanceEffect) || 0;
            var iEff = Number(arm.instabilityEffect) || 0;

            var armResMult = 1 + (rEff / 100);
            var armInstMult = 1 + (iEff / 100);
            var armPwrMult = 1.0;

            (arm.modules || []).forEach(function (mod) {
                if (!mod || mod.disabled || mod.name === "None") return;

                var isActiveModule = mod.activation === "Active";
                var active = !isActiveModule || mod.active === true;
                if (!active) return;

                armPwrMult *= Number(mod.multiplier) || 1.0;
                armResMult *= 1 + ((Number(mod.resistanceEffect) || 0) / 100);
                armInstMult *= 1 + ((Number(mod.instabilityEffect) || 0) / 100);
            });

            var armPower = pwr * armPwrMult;
            var armResistancePct = Math.max(0, baseRes * armResMult * gadgetResMult);
            var transferFactor = Math.max(0, 1 - (armResistancePct / 100));

            totalPwr += armPower;
            effectivePwr += armPower * transferFactor;
            weightedRawResistance += armPower * armResistancePct;
            totalInstMult *= armInstMult;
        });

        if (activeArms > 0) {
            totalInstMult = Math.pow(totalInstMult, 1 / activeArms);
        }

        var finalInst = Math.max(0, baseInst * totalInstMult * gadgetInstMult);

        var rawEquivalentResistance = totalPwr > 0
            ? Math.max(0, weightedRawResistance / totalPwr)
            : Math.max(0, baseRes * gadgetResMult);

        var finalRes;
        if (totalPwr > 0) {
            var combinedTransferFactor = effectivePwr / totalPwr;
            finalRes = Math.max(0, 100 * (1 - combinedTransferFactor));
        } else {
            finalRes = rawEquivalentResistance;
        }

        var transferFactor = Math.max(0, 1 - (finalRes / 100));
        var reqPwr = transferFactor > 0
            ? mass / (5.0 * transferFactor)
            : 999999;

        // Target-only baseline requirement before head/module/gadget resistance effects.
        // This stays useful when the current fitted loadout is resistance-blocked.
        var baseTransferFactor = Math.max(0, 1 - (baseRes / 100));
        var baselineRequiredPower = baseTransferFactor > 0
            ? mass / (5.0 * baseTransferFactor)
            : mass / 5.0;

        var maxBreakableMass = 5.0 * effectivePwr;
        var success = totalPwr > 0 && mass > 0 && maxBreakableMass >= mass;

        return {
            rockMass: mass,
            baseResistance: baseRes,
            baseInstability: baseInst,
            totalPower: totalPwr,
            effectivePower: effectivePwr,
            maxBreakableMass: maxBreakableMass,
            finalResistance: finalRes,
            uncappedResistance: rawEquivalentResistance,
            finalInstability: finalInst,
            requiredPower: reqPwr,
            baselineRequiredPower: baselineRequiredPower,
            success: success,
            activeArms: activeArms
        };
    }

    root.MFAV535 = Object.freeze({
        calculateV535: calculateV535
    });
})(typeof window !== "undefined" ? window : globalThis);
