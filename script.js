/**
 * MINING FRACTURE ANALYSER
 * Version: 5.35 (4.7 Reality Check Update)
 * Status: ALL SYSTEMS ONLINE
 */

// ==========================================
// === GLOBAL VARIABLES & CONFIG          ===
// ==========================================

let memoryApiKey = "";
let currentSimState = { mass: 0, resistance: 0, instability: 0, power: 0, success: false, activeArms: 0 };

// Chart Instances
let powerChartInstance = null;
let modChartInstance = null;
let resistanceChartInstance = null;

// Counter for unique arm IDs
let armIdCounter = 0;

// =========================================================
// === USER VERIFIED DATA (REGOLITH / UEXCORP) ===
// =========================================================

const ships = [
    { id: "mole", name: "Argo MOLE", arms: 3, maxLaserSize: 2, defaultLaser: 4080, moduleSlots: 3, isFixedLaser: false }, 
    { id: "prospector", name: "MISC Prospector", arms: 1, maxLaserSize: 1, defaultLaser: 3150, moduleSlots: 2, isFixedLaser: false }, 
    { id: "golem", name: "Drake Golem", arms: 1, maxLaserSize: 1, defaultLaser: 2700, moduleSlots: 2, isFixedLaser: true, fixedLaserName: "Pitman (~3150 MW)" } 
];

const allLaserHeads = [
    // --- SIZE 0 ---
    { name: "Arbor MHV", size: 0, power: 1890, moduleSlots: 1, resistanceEffect: 15, instabilityEffect: 0, optimalWindow: 1.0, shatterDamage: 50, extractionRate: 1.0, inertFiltering: 0.0, optimalChargeRate: 1.0, overchargeRate: 1.0, optimalRange: 15, miningLaserPower: "189-1890", optimalChargeWindowSize: 0, optimalChargeWindowRate: 0, extractionLaserPower: 0, laserInstability: 0 }, 
    { name: "S0 Helix", size: 0, power: 1000, moduleSlots: 0, resistanceEffect: 0, instabilityEffect: 0, optimalWindow: 0.6, shatterDamage: 80, extractionRate: 1.2, inertFiltering: -0.1, optimalChargeRate: 1.2, overchargeRate: 1.2, optimalRange: 30, miningLaserPower: "0.15-1", optimalChargeWindowSize: -40, optimalChargeWindowRate: 20, extractionLaserPower: 5, laserInstability: 0 }, 
    { name: "S00 Hofstede", size: 0, power: 500, moduleSlots: 0, resistanceEffect: 35, instabilityEffect: 30, optimalWindow: 1.4, shatterDamage: 40, extractionRate: 1.0, inertFiltering: 0.0, optimalChargeRate: 2.0, overchargeRate: 1.0, optimalRange: 30, miningLaserPower: "", optimalChargeWindowSize: 40, optimalChargeWindowRate: 20, extractionLaserPower: 4, laserInstability: 30 }, 
    { name: "Lawson", size: 0, power: 1890, moduleSlots: 0, resistanceEffect: 35, instabilityEffect: 30, optimalWindow: 1.4, shatterDamage: 50, extractionRate: 1.0, inertFiltering: 0.0, optimalChargeRate: 1.0, overchargeRate: 1.0, optimalRange: 25, miningLaserPower: "", optimalChargeWindowSize: 40, optimalChargeWindowRate: 0, extractionLaserPower: 4, laserInstability: 30 },
    
    // --- SIZE 1 ---
    { name: "Arbor MH1", size: 1, power: 1890, moduleSlots: 1, resistanceEffect: 25, instabilityEffect: -35, optimalWindow: 1.4, shatterDamage: 0, extractionRate: 1.0, inertFiltering: -30.0, optimalChargeRate: 1.0, overchargeRate: 1.0, optimalRange: 60, miningLaserPower: "189-1890", optimalChargeWindowSize: 40, optimalChargeWindowRate: 0, extractionLaserPower: 1850, laserInstability: -35 },
    { name: "Hofstede-S1", size: 1, power: 2100, moduleSlots: 1, resistanceEffect: -30, instabilityEffect: 10, optimalWindow: 1.0, shatterDamage: 0, extractionRate: 0.7, inertFiltering: -30.0, optimalChargeRate: 2.0, overchargeRate: 1.0, optimalRange: 45, miningLaserPower: "105-2100", optimalChargeWindowSize: 0, optimalChargeWindowRate: 20, extractionLaserPower: 1295, laserInstability: 10 },
    { name: "Klein-S1", size: 1, power: 2220, moduleSlots: 1, resistanceEffect: -45, instabilityEffect: 35, optimalWindow: 1.2, shatterDamage: 0, extractionRate: 1.2, inertFiltering: -30.0, optimalChargeRate: 1.5, overchargeRate: 1.2, optimalRange: 45, miningLaserPower: "378-2220", optimalChargeWindowSize: 20, optimalChargeWindowRate: 0, extractionLaserPower: 2220, laserInstability: 35 },
    { name: "Lancet MH1", size: 1, power: 2520, moduleSlots: 1, resistanceEffect: 0, instabilityEffect: -10, optimalWindow: 0.4, shatterDamage: 0, extractionRate: 1.0, inertFiltering: -30.0, optimalChargeRate: 0.5, overchargeRate: 0.5, optimalRange: 30, miningLaserPower: "504-2520", optimalChargeWindowSize: -60, optimalChargeWindowRate: 40, extractionLaserPower: 1850, laserInstability: -10 },
    { name: "Helix I", size: 1, power: 3150, moduleSlots: 2, resistanceEffect: -30, instabilityEffect: 0.0, optimalWindow: 0.6, shatterDamage: -10, extractionRate: 1.0, inertFiltering: -30.0, optimalChargeRate: 1.2, overchargeRate: 1.5, optimalRange: 15, miningLaserPower: "630-3150", optimalChargeWindowSize: -40, optimalChargeWindowRate: 0, extractionLaserPower: 1850, laserInstability: 0 },
    { name: "Impact I", size: 1, power: 2100, moduleSlots: 2, resistanceEffect: 10, instabilityEffect: -10, optimalWindow: 1.2, shatterDamage: 0, extractionRate: 1.5, inertFiltering: -30.0, optimalChargeRate: 1.3, overchargeRate: 1.1, optimalRange: 45, miningLaserPower: "420-2100", optimalChargeWindowSize: 20, optimalChargeWindowRate: -40, extractionLaserPower: 2775, laserInstability: -10 },
    { name: "Pitman", size: 1, power: 3150, moduleSlots: 2, resistanceEffect: 25, instabilityEffect: 35, optimalWindow: 1.4, shatterDamage: 0, extractionRate: 0.7, inertFiltering: -40.0, optimalChargeRate: 1.1, overchargeRate: 1.3, optimalRange: 40, miningLaserPower: "630-3150", optimalChargeWindowSize: 40, optimalChargeWindowRate: -40, extractionLaserPower: 1295, laserInstability: 35 }, 

    // --- SIZE 2 ---
    { name: "Arbor MH2", size: 2, power: 2400, moduleSlots: 2, resistanceEffect: 25, instabilityEffect: -35, optimalWindow: 1.4, shatterDamage: 0, extractionRate: 1.4, inertFiltering: -40.0, optimalChargeRate: 1.0, overchargeRate: 1.0, optimalRange: 90, miningLaserPower: "480-2400", optimalChargeWindowSize: 40, optimalChargeWindowRate: 0, extractionLaserPower: 2590, laserInstability: -35 },
    { name: "Hofstede-S2", size: 2, power: 3360, moduleSlots: 2, resistanceEffect: -30, instabilityEffect: 10, optimalWindow: 1.6, shatterDamage: 0, extractionRate: 0.7, inertFiltering: -40.0, optimalChargeRate: 2.0, overchargeRate: 1.0, optimalRange: 60, miningLaserPower: "336-3360", optimalChargeWindowSize: 60, optimalChargeWindowRate: 20, extractionLaserPower: 1295, laserInstability: 10 },
    { name: "Klein-S2", size: 2, power: 3600, moduleSlots: 2, resistanceEffect: -45, instabilityEffect: 35, optimalWindow: 1.2, shatterDamage: 0, extractionRate: 1.5, inertFiltering: -40.0, optimalChargeRate: 1.5, overchargeRate: 1.2, optimalRange: 60, miningLaserPower: "720-3600", optimalChargeWindowSize: 20, optimalChargeWindowRate: 0, extractionLaserPower: 2775, laserInstability: 35 },
    { name: "Lancet MH2", size: 2, power: 3600, moduleSlots: 2, resistanceEffect: 0, instabilityEffect: -10, optimalWindow: 0.4, shatterDamage: 0, extractionRate: 1.4, inertFiltering: -40.0, optimalChargeRate: 0.5, overchargeRate: 0.5, optimalRange: 45, miningLaserPower: "900-3600", optimalChargeWindowSize: -60, optimalChargeWindowRate: 40, extractionLaserPower: 2590, laserInstability: -10 },
    { name: "Helix II", size: 2, power: 4080, moduleSlots: 3, resistanceEffect: -30, instabilityEffect: 0.0, optimalWindow: 0.6, shatterDamage: -10, extractionRate: 1.4, inertFiltering: -40.0, optimalChargeRate: 1.2, overchargeRate: 1.5, optimalRange: 30, miningLaserPower: "1020-4080", optimalChargeWindowSize: -40, optimalChargeWindowRate: 0, extractionLaserPower: 2590, laserInstability: 0 },
    { name: "Impact II", size: 2, power: 3360, moduleSlots: 3, resistanceEffect: 10, instabilityEffect: -10, optimalWindow: 1.2, shatterDamage: 0, extractionRate: 1.7, inertFiltering: -40.0, optimalChargeRate: 1.3, overchargeRate: 1.1, optimalRange: 60, miningLaserPower: "840-3360", optimalChargeWindowSize: 20, optimalChargeWindowRate: -40, extractionLaserPower: 3145, laserInstability: -10 },
].sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size;
    return a.name.localeCompare(b.name);
});

const powerModules = [
    // --- ACTIVE Modules ---
    { name: "Surge", multiplier: 1.50, resistanceEffect: -15, instabilityEffect: 10, activation: 'Active', windowEffect: 0, miningLaserPower: 150 },
    { name: "Brandt", multiplier: 1.35, resistanceEffect: 15, instabilityEffect: 0.0, activation: 'Active', windowEffect: 0, miningLaserPower: 135 },
    { name: "Stampede", multiplier: 1.35, resistanceEffect: 0.0, instabilityEffect: -10, activation: 'Active', windowEffect: 0, miningLaserPower: 135 },
    { name: "Forel", multiplier: 1.00, resistanceEffect: 15, instabilityEffect: 0, activation: 'Active', windowEffect: 15, miningLaserPower: 0 },
    { name: "Lifeline", multiplier: 1.00, resistanceEffect: -15, instabilityEffect: -20.0, activation: 'Active', windowEffect: 0, miningLaserPower: 0 },
    { name: "Torpid", multiplier: 0.60, resistanceEffect: 40.0, instabilityEffect: 0.0, activation: 'Active', windowEffect: 0, miningLaserPower: 60 }, 
    { name: "Rime", multiplier: 0.85, resistanceEffect: -25, instabilityEffect: 0.0, activation: 'Active', windowEffect: 0, miningLaserPower: 85 },
    { name: "Optimum", multiplier: 0.85, resistanceEffect: 0.0, instabilityEffect: -10.0, activation: 'Active', windowEffect: 0, miningLaserPower: 85 },
    // --- PASSIVE Modules ---
    { name: "Rieger-C3", multiplier: 1.25, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -1, miningLaserPower: 125 },
    { name: "Rieger-C2", multiplier: 1.20, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -3, miningLaserPower: 120 },
    { name: "Rieger", multiplier: 1.15, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -10, miningLaserPower: 115 },
    { name: "Focus III", multiplier: 0.95, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 40, miningLaserPower: 95 },
    { name: "Focus II", multiplier: 0.90, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 37, miningLaserPower: 90 },
    { name: "Focus", multiplier: 0.85, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 30, miningLaserPower: 85 },
    { name: "Torrent III", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -1, miningLaserPower: 0 }, 
    { name: "Torrent II", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -3, miningLaserPower: 0 }, 
    { name: "Torrent", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0, activation: 'Passive', windowEffect: -10, miningLaserPower: 0 }, 
    { name: "XTR-XL", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 25, miningLaserPower: 0 },
    { name: "XTR-L", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 22, miningLaserPower: 0 }, 
    { name: "XTR", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 15, miningLaserPower: 0 },
    { name: "Vaux-C3", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    { name: "Vaux-C2", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    { name: "Vaux", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    { name: "FLTR-XL", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    { name: "FLTR-L", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    { name: "FLTR", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Passive', windowEffect: 0, miningLaserPower: 0 },
    // --- DEFAULT Modules ---
    { name: "None", multiplier: 1.00, resistanceEffect: 0.0, instabilityEffect: 0.0, activation: 'Default', windowEffect: 0, miningLaserPower: 0 },
];

function sortModules(modules) {
    return modules.sort((a, b) => {
        if (a.name === 'None') return -1; if (b.name === 'None') return 1;
        if (a.activation === 'Active' && b.activation === 'Passive') return -1;
        if (a.activation === 'Passive' && b.activation === 'Active') return 1;
        if (a.multiplier !== b.multiplier) return b.multiplier - a.multiplier;
        return a.name.localeCompare(b.name);
    });
}
const sortedModules = sortModules([...powerModules]); 

const gadgets = [
    { name: "Sabir", reduction: -50.0, instabilityEffect: 15, type: 'Multiplicative', desc: "Reduces Resistance massively but increases Instability." }, 
    { name: "OptiMax", reduction: -30.0, instabilityEffect: 0.0, type: 'Multiplicative', desc: "Reduces Resistance but shrinks the Green Zone." },
    { name: "BoreMax", reduction: 10.0, instabilityEffect: -70, type: 'Additive', desc: "Massively reduces Instability but increases Resistance slightly." }, 
    { name: "Waveshift", reduction: 0.0, instabilityEffect: -35, type: 'Utility', desc: "Doubles the Green Zone size but slows charge rate." }, 
    { name: "Stalwart", reduction: 0.0, instabilityEffect: -35, type: 'Utility', desc: "Stabilizes laser and increases charge rate, shrinks window." }, 
    { name: "Okunis", reduction: 0.0, instabilityEffect: 0.0, type: 'Utility', desc: "Maximizes charge speed and window size." },
    { name: "None", reduction: 0.0, instabilityEffect: 0.0, type: 'None', desc: "No Gadget Attached" }, 
].sort((a, b) => {
    if (a.name === "None") return -1;
    if (b.name === "None") return 1;
    return a.name.localeCompare(b.name);
});

// =========================================================
// === CORE FUNCTIONS                                    ===
// =========================================================

function getFormattedStats(item, type) {
    let stats = [];
    if (type === 'laser') {
        if (item.power) stats.push(`${item.power}W`);
        if (item.resistanceEffect !== 0) stats.push(`${item.resistanceEffect > 0 ? '+' : ''}${item.resistanceEffect}%Res`);
        if (item.instabilityEffect !== 0) stats.push(`${item.instabilityEffect > 0 ? '+' : ''}${item.instabilityEffect}%Inst`);
        if (item.moduleSlots) stats.push(`Slots:${item.moduleSlots}`);
    } else if (type === 'module') {
        if (item.multiplier !== 1.0) stats.push(`Pwr${Math.round((item.multiplier - 1.0) * 100)}%`);
        if (item.resistanceEffect !== 0) stats.push(`Res${item.resistanceEffect}%`);
        if (item.instabilityEffect !== 0) stats.push(`Inst${item.instabilityEffect}%`);
        if (item.windowEffect !== 0) stats.push(`Win${item.windowEffect}%`);
    } else if (type === 'gadget') {
        let r = item.reduction || item.resistance || 0;
        if (r !== 0) stats.push(`Res${r}%`);
        if (item.instabilityEffect !== 0) stats.push(`Inst${item.instabilityEffect}%`);
    }
    if (stats.length === 0) return "";
    return ` (${stats.join(' ')})`; 
}

function assessDifficulty(instability, resistance) {
    // 4.7 UPDATE: Reduced resistance multiplier and raised all thresholds.
    // Rocks are more forgiving now, making "EASY" the standard baseline.
    let score = (resistance * 1.2) + instability; 
    
    if (score >= 130) return { text: "EXTREME: High instability/resistance.", color: "text-red-500" };
    if (score >= 85) return { text: "HARD: Specialized modules required.", color: "text-orange-400" };
    if (score >= 45) return { text: "MODERATE: Pay attention to charge window.", color: "text-yellow-500" };
    return { text: "EASY: Standard loadout sufficient.", color: "text-green-500" };
}

// --- DYNAMIC MODULE SLOT LOCKING (NEW FEATURE) ---
window.updateModuleSlots = function(armId) {
    const laserSelect = document.getElementById(`${armId}-laser`);
    if (!laserSelect) return;

    const selectedOption = laserSelect.options[laserSelect.selectedIndex];
    const slots = parseInt(selectedOption.dataset.slots) || 1; 

    for (let i = 1; i <= 3; i++) {
        const modSelect = document.getElementById(`${armId}-mod${i}`);
        if (!modSelect) continue;

        if (i > slots) {
            modSelect.disabled = true;
            modSelect.value = "None"; 
            modSelect.style.opacity = "0.3";
            modSelect.style.cursor = "not-allowed";
        } else {
            modSelect.disabled = false;
            modSelect.style.opacity = "1";
            modSelect.style.cursor = "pointer";
        }
        window.togCheck(armId, i);
    }
};

// --- COL 4 LOGIC: TACTICAL (STRICT SLOT COUNTS) ---
function generateAdvancedTelemetry(mass, res, inst, reqPwr, currentPwr) {
    if (window.MFACoopSolver && typeof window.MFACoopSolver.render === 'function') {
        window.MFACoopSolver.render({ mass, baseResistance: res, baseInstability: inst, legacyRequiredPower: reqPwr, currentPower: currentPwr });
        return;
    }
    const configs = document.getElementById('configs');
    if(!configs) return;
    
    configs.style.opacity = '0.5';
    setTimeout(() => configs.style.opacity = '1', 150);

    const deficit = Math.max(0, reqPwr - currentPwr);
    const molePwr = 12000; const golemPwr = 5900; const soloPwr = 4700;
    
    let crewHtml = '';
    if (deficit > 0) {
        const pNeeded = Math.ceil(deficit / soloPwr);
        const mNeeded = Math.ceil(deficit / molePwr);
        const gNeeded = Math.ceil(deficit / golemPwr);
        crewHtml = `
            <div class="p-4 mb-6 rounded-lg bg-blue-900/20 border border-blue-500/30 shadow-lg text-center">
                <h4 class="text-sm font-bold text-blue-400 uppercase mb-2 tracking-wider">Minimum Crew Requirement</h4>
                <p class="text-xs text-gray-300 mb-3 font-mono">To cover the <span class="text-red-400 font-bold">${deficit.toFixed(0)} MW</span> shortfall:</p>
                <div class="flex justify-center gap-4">
                    <div class="flex flex-col items-center bg-black/40 p-3 rounded border border-blue-500/20 min-w-[80px]"><span class="text-2xl font-black text-white">${mNeeded}</span><span class="text-[9px] uppercase text-blue-300/70 tracking-widest mt-1">MOLEs</span></div>
                    <div class="flex flex-col items-center bg-black/40 p-3 rounded border border-green-500/20 min-w-[80px]"><span class="text-2xl font-black text-white">${pNeeded}</span><span class="text-[9px] uppercase text-green-300/70 tracking-widest mt-1">Prospectors</span></div>
                    <div class="flex flex-col items-center bg-black/40 p-3 rounded border border-orange-500/20 min-w-[80px]"><span class="text-2xl font-black text-white">${gNeeded}</span><span class="text-[9px] uppercase text-orange-300/70 tracking-widest mt-1">Golems</span></div>
                </div>
            </div>`;
    } else {
         crewHtml = `<div class="p-4 mb-6 rounded-lg bg-green-900/20 border border-green-500/30 text-center"><h4 class="text-sm font-bold text-green-400 uppercase tracking-wider">Status: Operational</h4><p class="text-xs text-green-200/80 mt-1">Fleet power sufficient.</p></div>`;
    }

    // --- 4.7 GADGET STRATEGY UPDATES ---
    let gName = "None"; let gDesc = "Standard 4.7 Node";
    if (inst > 70) { gName="BoreMax"; gDesc="Critical Instability (>70%)"; } 
    else if (res > 75) { gName="Sabir"; gDesc="Critical Resistance (>75%)"; } 
    else if (inst > 50) { gName="Stalwart"; gDesc="High Instability (>50%)"; } 
    else if (res > 50) { gName="OptiMax"; gDesc="High Resistance (>50%)"; } 
    else if (mass > 12000) { gName="Waveshift"; gDesc="High Mass Node (>12k)"; } // Lowered for 4.7
    else if (mass < 4000) { gName="Okunis"; gDesc="Quick Extraction (<4k)"; }
    
    const gadgHtml = `<div class="p-4 mb-6 rounded-lg bg-purple-900/20 border border-purple-500/30 shadow-lg"><h4 class="text-sm font-bold text-purple-400 uppercase mb-2 tracking-wider border-b border-purple-500/20 pb-2">Gadget Strategy</h4><div class="flex justify-between items-center"><div><p class="text-lg font-black text-white">${gName}</p><p class="text-[10px] text-purple-200/70 font-mono">${gDesc}</p></div><div class="text-2xl">🧩</div></div></div>`;

    // --- 4.7 FLEET STRATEGY UPDATES ---
    let strategyName = "Standard Extraction Protocol";
    let strategyColor = "text-green-400";
    let moleL = ""; let prosL = ""; let golemL = "";

    if (inst > 70) { // Was 60
        strategyName = "Hazard Protocol (Inst > 70%)";
        strategyColor = "text-red-500";
        moleL = `<div class="mb-1"><span class="text-red-400 font-bold">Hd1 (Break):</span> Lancet MH2 + Focus III x2</div><div class="mb-1"><span class="text-blue-400 font-bold">Hd2 (Stab):</span> Lancet MH2 + Focus III x2</div><div><span class="text-green-400 font-bold">Hd3 (Extr):</span> Impact II + Torrent III x2 + FLTR-XL</div>`;
        prosL = `<span class="text-gray-300">Lancet MH1 + Focus III</span>`;
        golemL = `<span class="text-gray-300">Pitman + Focus III x2</span>`;
    } else if (res > 60 || deficit > 0) { // Was 40
        strategyName = "Resistance Breaker (Res > 60%)";
        strategyColor = "text-red-400";
        moleL = `<div class="mb-1"><span class="text-red-400 font-bold">Hd1 (Break):</span> Helix II + Surge + Rieger-C3 x2</div><div class="mb-1"><span class="text-blue-400 font-bold">Hd2 (Stab):</span> Lancet MH2 + Brandt + Focus III</div><div><span class="text-green-400 font-bold">Hd3 (Extr):</span> Impact II + Torrent III x2 + FLTR-XL</div>`;
        prosL = `<span class="text-gray-300">Helix I + Surge + Rieger-C3</span>`;
        golemL = `<span class="text-gray-300">Pitman + Surge + Rieger-C3</span>`;
    } else if (inst > 45) { // Was 30
        strategyName = "Stabilization Focus";
        strategyColor = "text-yellow-400";
        moleL = `<div class="mb-1"><span class="text-red-400 font-bold">Hd1 (Break):</span> Helix II + Focus III x3</div><div class="mb-1"><span class="text-blue-400 font-bold">Hd2 (Stab):</span> Lancet MH2 + Focus III x2</div><div><span class="text-green-400 font-bold">Hd3 (Extr):</span> Impact II + Torrent III + FLTR-XL</div>`;
        prosL = `<span class="text-gray-300">Hofstede-S1 + Focus III</span>`;
        golemL = `<span class="text-gray-300">Pitman + Focus III + Rieger-C3</span>`;
    } else if (mass > 14000) { // Was 25000 (Very rare in 4.7)
        strategyName = "Heavy Cluster Protocol";
        strategyColor = "text-blue-400";
        moleL = `<div class="mb-1"><span class="text-red-400 font-bold">Hd1 (Break):</span> Impact II + Surge + Torrent III x2</div><div class="mb-1"><span class="text-blue-400 font-bold">Hd2 (Stab):</span> Lancet MH2 + Focus III x2</div><div><span class="text-green-400 font-bold">Hd3 (Extr):</span> Impact II + Torrent III x2 + FLTR-XL</div>`;
        prosL = `<span class="text-gray-300">Impact I + Torrent III + FLTR-XL</span>`;
        golemL = `<span class="text-gray-300">Pitman + Torrent III x2</span>`;
    } else {
        strategyName = "Standard 4.7 Eco";
        strategyColor = "text-gray-400";
        moleL = `<div class="mb-1"><span class="text-red-400 font-bold">Hd1 (Break):</span> Helix II + Rieger-C3 x2</div><div class="mb-1"><span class="text-blue-400 font-bold">Hd2 (Stab):</span> Arbor MH2 + Focus III x2</div><div><span class="text-green-400 font-bold">Hd3 (Extr):</span> Arbor MH2 + Torrent III + FLTR-XL</div>`;
        prosL = `<span class="text-gray-300">Arbor MH1 + FLTR-XL</span>`;
        golemL = `<span class="text-gray-300">Pitman + FLTR-XL</span>`;
    }

    const shipLoadouts = `
        <div class="space-y-4 mt-4">
            <div class="flex justify-between items-center border-b border-gray-700 pb-2 mb-3">
                <h4 class="text-sm font-bold text-white uppercase tracking-wider">Optimized Fleet Loadouts</h4>
                <span class="text-[10px] font-bold uppercase ${strategyColor} tracking-widest border border-white/10 px-2 py-1 rounded bg-black/40">${strategyName}</span>
            </div>
            <div class="p-4 bg-black/40 rounded border border-indigo-500/30">
                <div class="flex justify-between items-center mb-3"><span class="text-sm font-black text-indigo-400 uppercase">ARGO MOLE (S2)</span><span class="text-[9px] bg-indigo-900/40 text-indigo-200 px-2 py-0.5 rounded">3 Heads</span></div>
                <div class="space-y-2">
                    <div class="text-xs font-mono leading-relaxed">${moleL}</div>
                </div>
            </div>
            <div class="p-4 bg-black/40 rounded border border-green-500/30">
                <div class="flex justify-between items-center mb-2"><span class="text-sm font-black text-green-400 uppercase">MISC PROSPECTOR (S1)</span><span class="text-[9px] bg-green-900/40 text-green-200 px-2 py-0.5 rounded">Solo</span></div>
                <div class="text-xs text-gray-300 font-mono">${prosL}</div>
            </div>
            <div class="p-4 bg-black/40 rounded border border-orange-500/30">
                <div class="flex justify-between items-center mb-2"><span class="text-sm font-black text-orange-400 uppercase">DRAKE GOLEM (Fixed)</span><span class="text-[9px] bg-orange-900/40 text-orange-200 px-2 py-0.5 rounded">Ground</span></div>
                <div class="text-xs text-gray-300 font-mono">${golemL}</div>
            </div>
        </div>`;

    configs.innerHTML = crewHtml + gadgHtml + shipLoadouts;
}

// --- CALCULATION (GLOBAL) ---
window.calculate = function() {
    const resEl = document.getElementById('resistance');
    const instEl = document.getElementById('instability');
    const massEl = document.getElementById('rockMass');
    if (!resEl || !instEl || !massEl) return;

    const baseRes = parseFloat(resEl.value) || 0;
    const baseInst = parseFloat(instEl.value) || 0;
    const rockMass = parseFloat(massEl.value) || 0;

    let totalPwr = 0; 
    let totalResMult = 1.0; 
    let totalInstMult = 1.0; 
    let activeArms = 0;

    document.querySelectorAll('.ship-arm-card').forEach(arm => {
        if(!document.getElementById(arm.id+'-enable').checked) return;
        activeArms++;
        const sel = document.getElementById(arm.id+'-laser');
        const pwr = parseFloat(sel.value)||0;
        const opt = sel.options[sel.selectedIndex];
        const rEff = parseFloat(opt.dataset.resistance)||0;
        const iEff = parseFloat(opt.dataset.instability)||0;

        let armRes = 1 + (rEff/100);
        let armInst = 1 + (iEff/100);
        let armPwr = 1.0;

        for (let i = 1; i <= 3; i++) {
            const mSel = document.getElementById(arm.id+`-mod${i}`);
            // CHECK IF DISABLED (NEW LOGIC)
            if (mSel && !mSel.disabled && mSel.value !== 'None') {
                const m = powerModules.find(x => x.name === mSel.value);
                const tog = document.getElementById(arm.id+`-mod${i}-active-toggle`);
                const active = m.activation !== 'Active' || (tog && tog.checked);
                if(active) {
                    armPwr *= m.multiplier;
                    armRes *= (1 + (m.resistanceEffect||0)/100);
                    armInst *= (1 + (m.instabilityEffect||0)/100);
                }
            }
        }
        totalPwr += pwr * armPwr;
        totalResMult *= armRes;
        totalInstMult *= armInst;
    });

    if(activeArms > 0) {
        totalResMult = Math.pow(totalResMult, 1/activeArms);
        totalInstMult = Math.pow(totalInstMult, 1/activeArms);
    }

    const gEl = document.getElementById('gadgetSelect');
    const gadg = gadgets.find(g => g.name === gEl.value);
    if(gadg) {
        let gR = gadg.reduction || gadg.resistance || 0;
        totalResMult *= (1 + gR/100);
        totalInstMult *= (1 + (gadg.instabilityEffect||0)/100);
    }

    let finalRes = Math.max(0, baseRes * totalResMult);
    let finalInst = Math.max(0, baseInst * totalInstMult);
    
    let reqPwr = 0;
    if((finalRes/100) < 1.0) {
        reqPwr = (rockMass * (1.0 - finalRes/100)) / 5.0;
    } else {
        reqPwr = 999999; // Impossible
    }

    const success = totalPwr >= reqPwr && reqPwr > 0;
    const formattedPwr = totalPwr.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const diff = assessDifficulty(finalInst, finalRes);

    currentSimState = { mass: rockMass, resistance: finalRes, instability: finalInst, power: totalPwr, success: success, activeArms: activeArms };

    generateAdvancedTelemetry(rockMass, baseRes, baseInst, reqPwr, totalPwr);

    let banner = '';
    if(success) {
        const over = (totalPwr*5/(1-finalRes/100) - rockMass).toLocaleString(undefined,{maximumFractionDigits:2});
        banner = `<div class="p-4 rounded-lg bg-green-700 animate-status shadow-lg border border-green-500/50"><div class="flex items-center justify-center gap-2 mb-1"><span class="text-2xl">✅</span><h3 class="text-xl font-black text-white tracking-wider">FRACTURE SUCCESSFUL!</h3></div><p class="text-sm text-green-100 font-bold">${over} kg over the target mass.</p><p class="text-xs text-green-200/70 font-mono mt-1">Target Rock Mass: ${rockMass.toLocaleString()} kg</p></div>`;
    } else {
        const short = (rockMass - totalPwr*5/(1-finalRes/100)).toLocaleString(undefined,{maximumFractionDigits:2});
        banner = `<div class="p-4 rounded-lg bg-red-800 animate-status shadow-lg border border-red-500/50"><div class="flex items-center justify-center gap-2 mb-1"><span class="text-2xl">❌</span><h3 class="text-xl font-black text-white tracking-wider">FRACTURE FAILED.</h3></div><h4 class="text-lg font-bold text-white mb-1">Power short.</h4><p class="text-sm text-red-100 font-bold italic">${short} kg short of the target mass.</p><p class="text-xs text-red-200/70 font-mono mt-1">Target Rock Mass: ${rockMass.toLocaleString()} kg</p></div>`;
    }

    document.getElementById('results').innerHTML = `<div class="space-y-6 text-[var(--text-main)] text-center result-pop"><div class="grid grid-cols-2 gap-4"><div class="p-3 bg-[var(--bg-card)] rounded border border-[var(--border-main)] shadow-inner"><p class="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Final Resistance</p><p class="text-3xl font-bold text-red-400 font-tech">${finalRes.toFixed(1)}%</p></div><div class="p-3 bg-[var(--bg-card)] rounded border border-[var(--border-main)] shadow-inner"><p class="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Modified Instability</p><p class="text-3xl font-bold text-purple-400 font-tech">${finalInst.toFixed(1)}%</p></div></div><div class="p-4 bg-[var(--bg-card)] rounded border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]"><p class="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Total Combined Effective Laser Power</p><p class="text-4xl font-black text-yellow-500 font-tech text-glow">${formattedPwr} MW</p></div>${banner}<div class="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-main)]"><p class="${diff.color} text-xs font-bold font-mono">${diff.text}</p></div></div>`;

    try {
        updateCharts(totalPwr, reqPwr, finalRes, finalInst, rockMass);
    } catch(e) { console.warn("Chart Error:", e); }
};

// --- UPDATE CHART FUNCTIONS (FIXED) ---
function updateCharts(pwr, req, res, inst, mass) {
    if (typeof Chart === 'undefined') return;

    const ctxP = document.getElementById('powerChart')?.getContext('2d');
    const ctxM = document.getElementById('modChart')?.getContext('2d');
    const ctxR = document.getElementById('resistanceChart')?.getContext('2d');
    if (!ctxP || !ctxM || !ctxR) return;

    if (powerChartInstance) { powerChartInstance.destroy(); }
    if (modChartInstance) { modChartInstance.destroy(); }
    if (resistanceChartInstance) { resistanceChartInstance.destroy(); }

    const success = pwr >= req;
    const totalMax = Math.max(pwr, req) * 1.1;
    const gridColor = getComputedStyle(document.body).getPropertyValue('--chart-grid').trim();
    const textColor = getComputedStyle(document.body).getPropertyValue('--chart-text').trim();

    powerChartInstance = new Chart(ctxP, {
        type: 'bar',
        data: {
            labels: ['Team', 'Required'],
            datasets: [{
                data: [pwr/1000, req/1000],
                backgroundColor: [success ? '#10b981' : '#ef4444', '#3b82f6'],
                borderRadius: 4, barThickness: 25
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { max: totalMax/1000, grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });

    let safe = Math.max(0, 100 - (res + inst));
    modChartInstance = new Chart(ctxM, {
        type: 'doughnut',
        data: {
            labels: [`Res ${res.toFixed(0)}%`, `Inst ${inst.toFixed(0)}%`, `Safe ${safe.toFixed(0)}%`],
            datasets: [{
                data: [res, inst, safe],
                backgroundColor: ['#ef4444', '#eab308', '#374151'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 } } } }
        }
    });

    const curveLabels = [0, 20, 40, 60, 80, 100];
    const curveData = curveLabels.map(r => {
        let dec = r / 100.0;
        return (mass * (1.0 - dec)) / 5000;
    });
    const teamLine = Array(6).fill(pwr/1000);

    resistanceChartInstance = new Chart(ctxR, {
        type: 'line',
        data: {
            labels: curveLabels.map(x => x+'%'),
            datasets: [
                { label: 'Team', data: teamLine, borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0 },
                { label: 'Req', data: curveData, borderColor: '#fbbf24', borderDash: [5,5], borderWidth: 2, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        }
    });
}

// --- TOGGLE CHECK (GLOBAL) ---
window.togCheck = function(id, i) {
    const v = document.getElementById(`${id}-mod${i}`).value;
    const box = document.getElementById(`${id}-mod${i}-box`);
    const m = powerModules.find(x => x.name === v);
    if(m && m.activation === 'Active') box.classList.remove('hidden');
    else box.classList.add('hidden');
};

// --- ADD SHIP LOADOUT (GLOBAL) ---
window.addShipLoadout = function() {
    const sId = document.getElementById('shipSelectToAdd').value;
    const s = ships.find(x => x.id === sId);
    if(!s) return;
    
    const emptyMsg = document.getElementById('empty-state-msg');
    if(emptyMsg) emptyMsg.remove();

    updateShipImage();
    for(let i=1; i<=s.arms; i++) {
        document.getElementById('multiShipContainer').insertAdjacentHTML('beforeend', createArmConfigHtml(i, s));
        // UPDATE: Immediately enforce locks on the default laser
        updateModuleSlots(`arm-${s.id}-${armIdCounter}`);
    }
    calculate();
};

// --- UPDATE SHIP IMAGE (GLOBAL) ---
window.updateShipImage = function() {
    const shipSelect = document.getElementById('shipSelectToAdd');
    const img = document.getElementById('selectedShipImage');
    if (!shipSelect || !img) return;
    const shipId = shipSelect.value;
    if(img) {
        if(shipId === 'mole') img.src = "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/mole.jpg";
        else if(shipId === 'prospector') img.src = "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/prospector.jpg";
        else if(shipId === 'golem') img.src = "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/golem.jpg";
        
        img.onerror = function() {
            this.src = 'https://placehold.co/400x250/0f172a/38bdf8?text=IMAGE+NOT+FOUND&font=oswald';
        };
        
        img.classList.remove('hidden');
    }
};

function populateGadgetList() {
    const c = document.getElementById('gadget-list-container');
    if(!c) return;
    c.innerHTML = gadgets.map((g,i) => `
        <div class="flex justify-between p-3 mb-2 bg-[var(--bg-input)] rounded border border-[var(--border-main)] hover:border-blue-500/50 transition-all cursor-pointer group" onclick="document.getElementById('gr-${i}').click()">
            <div class="flex-grow">
                <div class="flex items-center gap-2 mb-1">
                     <span class="text-sm font-black tracking-wider uppercase ${g.name==='None'?'text-[var(--text-muted)]': (g.type==='Additive'?'text-blue-400':(g.type==='Utility'?'text-green-400':'text-purple-400'))}">${g.name}</span>
                     ${g.name !== 'None' ? `<span class="px-1.5 py-0.5 text-[9px] uppercase border rounded border-gray-500/30 text-gray-400">${g.type}</span>` : ''}
                </div>
                <div class="text-[10px] text-[var(--text-muted)] font-mono leading-tight opacity-90 pr-8">${g.desc || ''}</div>
                <div class="mt-1 pt-1 border-t border-white/5 text-[10px] font-mono text-blue-300/90 font-bold">${getFormattedStats(g,'gadget')}</div>
            </div>
            <div class="ml-2">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="radio" name="gadg" id="gr-${i}" value="${g.name}" ${g.name==='None'?'checked':''} class="sr-only peer" onchange="document.getElementById('gadgetSelect').value=this.value;calculate()">
                    <div class="w-9 h-5 bg-slate-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>`).join('');
}

// --- UI GENERATION ---
function createArmConfigHtml(armIndex, ship) {
    armIdCounter++; 
    const armId = `arm-${ship.id}-${armIdCounter}`;
    
    // Filter Lasers by Size (Strict)
    const heads = allLaserHeads.filter(h => {
        if (ship.id === 'golem') return h.name.includes('Pitman');
        if (ship.id === 'prospector') return h.size === 1 && !h.name.includes('Pitman');
        if (ship.id === 'mole') return h.size === 2;
        return false;
    });

    const laserOpts = heads.map(h => {
        let sel = (ship.id==='mole'&&h.name.includes('Helix II')) || (ship.id==='prospector'&&h.name.includes('Helix I')) || (ship.id==='golem'&&h.name.includes('Pitman'));
        // NOTE: added updateModuleSlots onchange
        return `<option value="${h.power}" data-slots="${h.moduleSlots}" data-resistance="${h.resistanceEffect}" data-instability="${h.instabilityEffect}" ${sel?'selected':''}>${h.name}${getFormattedStats(h,'laser')}</option>`;
    }).join('');

    let modHtml = '';
    const modOpts = getModOptions();

    // Render all 3 slots (they will be disabled by updateModuleSlots if needed)
    for(let i=1; i<=3; i++) {
        modHtml += `<div class="flex gap-1 mb-1"><select id="${armId}-mod${i}" class="w-full p-1 bg-[var(--bg-input)] border border-[var(--border-main)] rounded text-[10px]" onchange="togCheck('${armId}', ${i});calculate()">${modOpts}</select>
        <div id="${armId}-mod${i}-box" class="hidden"><input type="checkbox" id="${armId}-mod${i}-active-toggle" checked onchange="calculate()"></div></div>`;
    }

    // NOTE: Added onchange to the laser select to trigger slot locking
    return `<div id="${armId}" class="ship-arm-card p-3 mb-2 rounded bg-[var(--bg-card)] border border-[var(--border-main)]" data-ship="${ship.id}">
        <div class="flex justify-between mb-1"><span class="text-xs font-bold text-white">${ship.name} #${armIndex}</span><input type="checkbox" id="${armId}-enable" checked onchange="calculate()"></div>
        <select id="${armId}-laser" class="w-full p-2 mb-2 bg-[var(--bg-input)] border border-[var(--border-main)] rounded text-xs" onchange="updateModuleSlots('${armId}'); calculate()">${laserOpts}</select>
        ${modHtml}
        <button onclick="this.parentElement.remove();calculate()" class="text-[9px] text-red-400 w-full text-right mt-1">REMOVE</button>
    </div>`;
}

function getModOptions() {
    const act = sortedModules.filter(m => m.activation === 'Active').map(m => `<option value="${m.name}">${m.name}${getFormattedStats(m,'module')}</option>`).join('');
    const pas = sortedModules.filter(m => m.activation === 'Passive').map(m => `<option value="${m.name}">${m.name}${getFormattedStats(m,'module')}</option>`).join('');
    return `<option value="None">None</option><optgroup label="Active Modules">${act}</optgroup><optgroup label="Passive Modules">${pas}</optgroup>`;
}

// --- THEME MANAGEMENT ---
function initTheme() {
    const t = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    updateThemeIcon(t);
}
function toggleTheme() {
    const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    updateThemeIcon(t);
    if (currentSimState.power > 0) calculate();
}
function updateThemeIcon(t) {
    const i = document.getElementById('theme-icon');
    if(i) i.textContent = t === 'light' ? '🌙' : '☀️';
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const sel = document.getElementById('shipSelectToAdd');
    if(sel) sel.innerHTML = ships.map(x => `<option value="${x.id}">${x.name}</option>`).join('');
    populateGadgetList();
    if (document.getElementById('shipSelectToAdd')) updateShipImage();
    calculate();
    
    window.calculate = calculate;
    window.togCheck = togCheck;
    window.openApiModal = openApiModal;
    window.closeApiModal = closeApiModal;
    window.saveApiKey = saveApiKey;
    window.askAI = askAI;
    window.toggleTheme = toggleTheme; 
    window.updateModuleSlots = updateModuleSlots; // Expose to global scope for HTML inline calls
    window.createArmConfigHtml = createArmConfigHtml; // Unified Fleet Planner reuses protected v5.35 arm controls
});
