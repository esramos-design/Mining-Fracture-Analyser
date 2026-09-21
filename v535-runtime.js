/**
 * MFA v5.35 shared browser runtime calculation engine.
 *
 * This is the single runtime authority used by:
 * - Active Fleet / Fracture Verdict
 * - Recommended Solutions
 *
 * It mirrors src/core/v535-engine.js and is parity-tested in CI.
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

        var totalPwr = 0;
        var totalResMult = 1.0;
        var totalInstMult = 1.0;
        var activeArms = 0;

        arms.forEach(function (arm) {
            if (!arm || arm.enabled === false) return;

            activeArms += 1;
            var pwr = Number(arm.power) || 0;
            var rEff = Number(arm.resistanceEffect) || 0;
            var iEff = Number(arm.instabilityEffect) || 0;

            var armRes = 1 + (rEff / 100);
            var armInst = 1 + (iEff / 100);
            var armPwr = 1.0;

            (arm.modules || []).forEach(function (mod) {
                if (!mod || mod.disabled || mod.name === "None") return;

                var isActiveModule = mod.activation === "Active";
                var active = !isActiveModule || mod.active === true;
                if (!active) return;

                armPwr *= Number(mod.multiplier) || 1.0;
                armRes *= 1 + ((Number(mod.resistanceEffect) || 0) / 100);
                armInst *= 1 + ((Number(mod.instabilityEffect) || 0) / 100);
            });

            totalPwr += pwr * armPwr;
            totalResMult *= armRes;
            totalInstMult *= armInst;
        });

        if (activeArms > 0) {
            totalResMult = Math.pow(totalResMult, 1 / activeArms);
            totalInstMult = Math.pow(totalInstMult, 1 / activeArms);
        }

        if (gadget) {
            var gR = Number(gadget.reduction != null ? gadget.reduction : gadget.resistance) || 0;
            totalResMult *= 1 + (gR / 100);
            totalInstMult *= 1 + ((Number(gadget.instabilityEffect) || 0) / 100);
        }

        var finalRes = Math.max(0, baseRes * totalResMult);
        var finalInst = Math.max(0, baseInst * totalInstMult);

        var reqPwr = (finalRes / 100) < 1.0
            ? (mass * (1.0 - finalRes / 100)) / 5.0
            : 999999;

        var success = totalPwr >= reqPwr && reqPwr > 0;

        return {
            rockMass: mass,
            baseResistance: baseRes,
            baseInstability: baseInst,
            totalPower: totalPwr,
            finalResistance: finalRes,
            finalInstability: finalInst,
            requiredPower: reqPwr,
            success: success,
            activeArms: activeArms
        };
    }

    root.MFAV535 = Object.freeze({
        calculateV535: calculateV535
    });
})(typeof window !== "undefined" ? window : globalThis);
