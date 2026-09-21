/**
 * MFA ADVANCED FLEET PARSER & MANIFEST
 * Version: 5.35 (Final: Reactive Dashboard, Images & Component Parsing)
 */

// ==========================================
// 1. FLEET DATABASE (JSON DATA)
// ==========================================
const fleetRawData = [
    // --- 1. MISC PROSPECTOR ---
    {
        "data": {
            "uuid": "f68ee841-88d1-46f3-a1e2-5dc71d9d5d97", 
            "name": "Prospector", 
            "image_url": "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/prospector.jpg",
            "class_name": "MISC_Prospector", 
            "size_class": 2,
            "mass": 122096, "cargo_capacity": 32, "health": 33470, "shield_hp": 6300,
            "speed": { "scm": 156, "max": 994 },
            "fuel": { "capacity": 21, "intake_rate": 13 },
            "quantum": { "quantum_speed": 215000000, "quantum_fuel_capacity": 1.8, "quantum_range": 310344827 },
            "emission": { "ir": 9033, "em_idle": 18351 },
            "manufacturer": { "code": "MISC", "name": "Musashi Industrial and Starflight Concern" },
            "type": { "en_EN": "industrial" },
            "insurance": { "claim_time": 9 },
            "hardpoints": [
                { "name": "hardpoint_mining_arm", "type": "ToolArm", "children": [ { "item": { "name": "Arbor MH1 Mining Laser", "size": 1 } } ] },
                { "name": "hardpoint_shield_generator", "type": "Shield", "item": { "name": "Bulwark", "size": 1 } },
                { "name": "hardpoint_power_plant", "type": "PowerPlant", "item": { "name": "Trommel", "size": 2 } },
                { "name": "hardpoint_cooler", "type": "Cooler", "item": { "name": "Snowfall", "size": 2 } },
                { "name": "hardpoint_quantum_drive", "type": "QuantumDrive", "item": { "name": "Goliath", "size": 1 } }
            ]
        }
    },
    // --- 2. ARGO MOLE ---
    {
        "data": {
            "uuid": "ecdfd0df-6c5f-4183-a24b-9e1546e00a4e", 
            "name": "MOLE", 
            "image_url": "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/mole.jpg",
            "class_name": "ARGO_MOLE", 
            "size_class": 3,
            "mass": 852686, "cargo_capacity": 96, "health": 80375, "shield_hp": 48800,
            "speed": { "scm": 140, "max": 960 },
            "fuel": { "capacity": 200, "intake_rate": 0 },
            "quantum": { "quantum_speed": 314000000, "quantum_fuel_capacity": 2.6, "quantum_range": 425950196 },
            "emission": { "ir": 14399, "em_idle": 41410 },
            "manufacturer": { "code": "ARGO", "name": "Argo Astronautics" },
            "type": { "en_EN": "industrial" },
            "insurance": { "claim_time": 13.5 },
            "hardpoints": [
                { "name": "hardpoint_mining_cab_front", "type": "MiningController", "children": [ { "item": { "name": "Arbor MH2 Mining Laser", "size": 2 } } ] },
                { "name": "hardpoint_mining_cab_left", "type": "MiningController", "children": [ { "item": { "name": "Arbor MH2 Mining Laser", "size": 2 } } ] },
                { "name": "hardpoint_mining_cab_right", "type": "MiningController", "children": [ { "item": { "name": "Arbor MH2 Mining Laser", "size": 2 } } ] },
                { "name": "hardpoint_shield_generator_left", "type": "Shield", "item": { "name": "5CA 'Akura'", "size": 3 } },
                { "name": "hardpoint_power_plant", "type": "PowerPlant", "item": { "name": "Ginzel", "size": 3 } },
                { "name": "hardpoint_cooler", "type": "Cooler", "item": { "name": "ThermalCore", "size": 3 } },
                { "name": "hardpoint_quantum_drive", "type": "QuantumDrive", "item": { "name": "Huracan", "size": 2 } }
            ]
        }
    },
    // --- 3. DRAKE GOLEM ---
    {
        "data": {
            "uuid": "b616b3ad-123c-40f2-80bd-b8f4109633aa", 
            "name": "Golem", 
            "image_url": "https://raw.githubusercontent.com/esramos-design/mfa.github.io/main/golem.jpg",
            "class_name": "DRAK_Golem", 
            "size_class": 2,
            "mass": 69217, "cargo_capacity": 32, "health": 17300, "shield_hp": 2100,
            "speed": { "scm": 203, "max": 1010 },
            "fuel": { "capacity": 24, "intake_rate": 15 },
            "quantum": { "quantum_speed": 215000000, "quantum_fuel_capacity": 0.95, "quantum_range": 163793103 },
            "emission": { "ir": 8211, "em_idle": 1433 },
            "manufacturer": { "code": "DRAK", "name": "Drake Interplanetary" },
            "type": { "en_EN": "industrial" },
            "insurance": { "claim_time": 3 },
            "hardpoints": [
                { "name": "hardpoint_mining_arm", "type": "ToolArm", "children": [ { "item": { "name": "Pitman Mining Laser", "size": 1 } } ] },
                { "name": "hardpoint_missile_left", "type": "MissileLauncher", "item": { "name": "MSD-111", "size": 1 } },
                { "name": "hardpoint_shield_generator", "type": "Shield", "item": { "name": "Bulwark", "size": 1 } },
                { "name": "hardpoint_powerplant", "type": "PowerPlant", "item": { "name": "Fortitude", "size": 1 } },
                { "name": "hardpoint_cooler", "type": "Cooler", "item": { "name": "Thermax", "size": 1 } },
                { "name": "hardpoint_quantum_drive", "type": "QuantumDrive", "item": { "name": "Goliath", "size": 1 } }
            ]
        }
    }
];

// ==========================================
// 2. UTILITIES & PARSERS
// ==========================================

function formatNumber(num) {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getComponent(hardpoints, typeSearch) {
    let results = [];
    if (!hardpoints || !Array.isArray(hardpoints)) return results;

    function recurse(points) {
        points.forEach(hp => {
            if (hp.item && (hp.type === typeSearch || (hp.item.type === typeSearch))) {
                results.push(hp.item);
            }
            if (hp.children && hp.children.length > 0) {
                hp.children.forEach(child => {
                    if (child.item) {
                       if (typeSearch === "WeaponMining" && (child.item.name.includes("Mining Laser") || child.type === "WeaponMining")) {
                           results.push(child.item);
                       } else if (child.item.type === typeSearch) {
                           results.push(child.item);
                       }
                    }
                });
                recurse(hp.children);
            }
        });
    }
    recurse(hardpoints);
    return results;
}

// ==========================================
// 3. DASHBOARD LOGIC (AGGREGATE STATS)
// ==========================================

// UPDATED: Now accepts a specific dataset to calculate from
function updateDashboard(activeData = fleetRawData) {
    let totalCargo = 0;
    let totalLasers = 0;
    let totalMass = 0;
    let totalRange = 0;
    let shipCount = 0;

    activeData.forEach(entry => {
        const s = entry.data;
        totalCargo += s.cargo_capacity || 0;
        totalMass += s.mass || 0;
        shipCount++;
        totalRange += (s.quantum.quantum_range || 0);

        // Count active mining heads
        const heads = getComponent(s.hardpoints, "WeaponMining");
        totalLasers += heads.length;
    });

    // Update DOM Elements
    const elCargo = document.getElementById('total-cargo');
    const elLasers = document.getElementById('total-lasers');
    const elMass = document.getElementById('total-mass');
    const elRange = document.getElementById('avg-range');

    // Add animation effect to updates
    const animateValue = (el, val, unit) => {
        if (!el) return;
        el.style.opacity = 0.5;
        setTimeout(() => {
            el.innerHTML = `${val} <span class="text-sm text-gray-500">${unit}</span>`;
            el.style.opacity = 1;
        }, 150);
    };

    if(elCargo) animateValue(elCargo, totalCargo, "SCU");
    if(elLasers) animateValue(elLasers, totalLasers, "UNITS");
    if(elMass) animateValue(elMass, (totalMass / 1000).toFixed(1), "kT");
    
    if(elRange) {
        const avgR = shipCount > 0 ? (totalRange / shipCount / 1_000_000).toFixed(0) : 0;
        animateValue(elRange, avgR, "M km");
    }
}

// ==========================================
// 4. SEARCH & FILTER LOGIC
// ==========================================

// UPDATED: Now collects visible ships and updates dashboard
window.filterFleet = function(criteria) {
    const cards = document.querySelectorAll('.ship-card-wrapper');
    const searchInput = document.getElementById('fleet-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    
    let visibleShips = [];

    cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const manu = card.dataset.manu;
        const uuid = card.dataset.uuid;

        let visible = true;

        // 1. Text Search Match
        if (searchVal && !name.includes(searchVal) && !uuid.includes(searchVal) && !manu.toLowerCase().includes(searchVal)) {
            visible = false;
        }

        // 2. Button Category Match
        if (criteria && criteria !== 'all' && criteria !== manu) {
            visible = false;
        }

        // Toggle visibility
        card.style.display = visible ? 'flex' : 'none';

        // Collect data for Dashboard update
        if (visible) {
            const shipData = fleetRawData.find(s => s.data.uuid === uuid);
            if (shipData) visibleShips.push(shipData);
        }
    });

    // Recalculate dashboard based on what is visible
    updateDashboard(visibleShips);
}

// ==========================================
// 5. RENDER LOGIC (MAIN)
// ==========================================

function renderFleet() {
    const container = document.getElementById('fleet-container');
    if (!container) return;

    container.innerHTML = '';
    
    // Initial Dashboard Calculation (Full Fleet)
    updateDashboard(fleetRawData);

    fleetRawData.forEach(entry => {
        const ship = entry.data;
        
        // --- Data Extraction ---
        const scm = ship.speed.scm;
        const maxSpeed = ship.speed.max;
        const hullHp = formatNumber(ship.health);
        const shieldHp = formatNumber(ship.shield_hp);
        const cargo = ship.cargo_capacity;
        const mass = formatNumber(Math.round(ship.mass));
        const hydrogen = ship.fuel.capacity;
        const quantumFuel = ship.quantum.quantum_fuel_capacity;
        const qRange = (ship.quantum.quantum_range / 1_000_000).toFixed(1);
        
        const miningHeads = getComponent(ship.hardpoints, "WeaponMining");
        const shields = getComponent(ship.hardpoints, "Shield");
        const powerPlants = getComponent(ship.hardpoints, "PowerPlant");
        const coolers = getComponent(ship.hardpoints, "Cooler");
        const qDrive = getComponent(ship.hardpoints, "QuantumDrive");
        
        let miningHtml = "";
        if (miningHeads.length > 0) {
            miningHtml = `<div class="col-span-2 bg-black/40 p-2 rounded border border-white/10 backdrop-blur-sm">
                <p class="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-bold">Mining Configuration</p>
                <div class="flex flex-wrap gap-2">`;
            miningHeads.forEach(head => {
                miningHtml += `<span class="text-[10px] font-bold text-green-300 bg-green-900/40 px-2 py-1 rounded border border-green-500/30 font-mono tracking-wide">${head.name} (S${head.size})</span>`;
            });
            miningHtml += `</div></div>`;
        } else {
             miningHtml = `<div class="col-span-2 bg-black/40 p-2 rounded border border-white/10 backdrop-blur-sm"><p class="text-[10px] text-[var(--text-muted)] uppercase">Mining Configuration</p><span class="text-xs text-gray-500">Standard Loadout</span></div>`;
        }

        // Manufacturer Styling
        let manuColor = "bg-gray-500"; 
        let cardBorder = "border-[var(--border-main)]";
        if (ship.manufacturer.code === 'ARGO') { manuColor = 'bg-orange-600'; cardBorder = 'hover:border-orange-500/50'; }
        if (ship.manufacturer.code === 'DRAK') { manuColor = 'bg-yellow-500'; cardBorder = 'hover:border-yellow-500/50'; }
        if (ship.manufacturer.code === 'MISC') { manuColor = 'bg-slate-400'; cardBorder = 'hover:border-slate-400/50'; }

        const emIdle = formatNumber(ship.emission.em_idle);
        const ir = formatNumber(ship.emission.ir);

        // --- HTML TEMPLATE ---
        const cardHTML = `
        <div class="ship-card-wrapper glass-panel p-0 rounded-2xl overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-2xl border ${cardBorder}" 
             data-name="${ship.name}" 
             data-manu="${ship.manufacturer.code}" 
             data-uuid="${ship.uuid}">
            
            <div class="relative w-full aspect-video overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-panel)] via-transparent to-transparent z-10"></div>
                <img src="${ship.image_url}" class="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700 ease-in-out" onerror="this.src='https://placehold.co/600x400/1e293b/cbd5e1?text=NO+IMAGE&font=oswald'">
                <div class="absolute top-4 right-4 z-20">
                    <span class="text-[10px] font-black uppercase tracking-widest text-white bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/10">${ship.manufacturer.code}</span>
                </div>
                <div class="absolute bottom-4 left-6 z-20">
                    <h2 class="text-3xl font-black font-tech uppercase text-white tracking-wider drop-shadow-lg">${ship.name}</h2>
                    <p class="text-[10px] font-mono text-gray-300 uppercase tracking-widest bg-black/30 inline-block px-1 rounded">${ship.type.en_EN} // Class ${ship.size_class}</p>
                </div>
            </div>

            <div class="h-1 w-full ${manuColor} shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 relative"></div>
            
            <div class="p-6 pt-4 relative z-10 space-y-5">
                
                <div class="flex justify-between items-center text-xs font-mono border-b border-[var(--border-main)] pb-3">
                    <div class="text-center"><span class="block text-[9px] text-[var(--text-muted)] uppercase">SCM Speed</span><span class="font-bold text-[var(--text-main)]">${scm} m/s</span></div>
                    <div class="text-center"><span class="block text-[9px] text-[var(--text-muted)] uppercase">Max Cargo</span><span class="font-bold text-yellow-500">${cargo} SCU</span></div>
                    <div class="text-center"><span class="block text-[9px] text-[var(--text-muted)] uppercase">Total Mass</span><span class="font-bold text-[var(--text-main)]">${mass} kg</span></div>
                    <div class="text-center"><span class="block text-[9px] text-[var(--text-muted)] uppercase">Shields</span><span class="font-bold text-blue-400">${shieldHp} HP</span></div>
                </div>

                <div class="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-main)] relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 text-[var(--text-muted)] opacity-5 text-6xl"><i class="fa-solid fa-microchip"></i></div>
                    <h4 class="text-[10px] font-bold text-orange-400 uppercase mb-3 flex items-center gap-2 relative z-10"><i class="fa-solid fa-server"></i> Systems Architecture</h4>
                    <div class="grid grid-cols-2 gap-2 relative z-10">
                        ${miningHtml}
                        <div class="bg-black/20 p-2 rounded border border-white/5 backdrop-blur-sm">
                            <p class="text-[9px] text-[var(--text-muted)] uppercase">Quantum Drive</p>
                            <p class="text-[11px] text-[var(--text-main)] font-mono">${qDrive[0]?.name || 'Stock'} <span class="text-gray-500">|</span> <span class="text-green-400">${qRange}m km</span></p>
                        </div>
                        <div class="bg-black/20 p-2 rounded border border-white/5 backdrop-blur-sm">
                            <p class="text-[9px] text-[var(--text-muted)] uppercase">Power Plant</p>
                            <p class="text-[11px] text-[var(--text-main)] font-mono">${powerPlants[0]?.name || 'Stock'}</p>
                        </div>
                        <div class="bg-black/20 p-2 rounded border border-white/5 backdrop-blur-sm">
                            <p class="text-[9px] text-[var(--text-muted)] uppercase">Cooling Systems</p>
                            <p class="text-[11px] text-[var(--text-main)] font-mono">${coolers[0]?.name || 'Stock'} <span class="text-gray-500">x${coolers.length}</span></p>
                        </div>
                        <div class="bg-black/20 p-2 rounded border border-white/5 backdrop-blur-sm">
                            <p class="text-[9px] text-[var(--text-muted)] uppercase">Sig (EM / IR)</p>
                            <p class="text-[11px] text-[var(--text-main)] font-mono">${emIdle} / ${ir}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center opacity-60">
                    <span class="text-[9px] font-mono text-[var(--text-muted)] uppercase bg-[var(--bg-input)] px-2 py-1 rounded">UUID: ${ship.uuid.substring(0, 8)}</span>
                    <span class="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1"><span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Flight Ready</span>
                </div>
            </div>
        </div>`;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Init on load
document.addEventListener('DOMContentLoaded', renderFleet);