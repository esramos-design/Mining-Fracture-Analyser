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

    activeData.forEach(entry => {
        const ship = entry.data;
        totalCargo += ship.cargo_capacity || 0;
        totalMass += ship.mass || 0;
        totalRange += ship.quantum?.quantum_range || 0;
        totalLasers += getComponent(ship.hardpoints, "WeaponMining").length;
    });

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('total-vessels', activeData.length);
    setText('total-cargo', totalCargo);
    setText('total-lasers', totalLasers);
    setText('total-mass', (totalMass / 1000).toFixed(1));
    setText('avg-range', activeData.length
        ? (totalRange / activeData.length / 1_000_000).toFixed(0)
        : '0');
}

// ==========================================
// 4. SEARCH, FILTER & SORT
// ==========================================

let activeManufacturerFilter = 'all';

function visibleFleetData() {
    return [...document.querySelectorAll('.ship-card-wrapper')]
        .filter(card => card.style.display !== 'none')
        .map(card => fleetRawData.find(entry => entry.data.uuid === card.dataset.uuid))
        .filter(Boolean);
}

function updateResultCount() {
    const count = visibleFleetData().length;
    const out = document.getElementById('fleet-result-count');
    if (out) out.textContent = `${count} vessel${count === 1 ? '' : 's'} shown`;
}

window.filterFleet = function(criteria, button) {
    if (criteria) activeManufacturerFilter = criteria;

    if (button) {
        document.querySelectorAll('.fleet-filter').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }

    const search = (document.getElementById('fleet-search')?.value || '').trim().toLowerCase();

    document.querySelectorAll('.ship-card-wrapper').forEach(card => {
        const matchesText = !search ||
            card.dataset.name.toLowerCase().includes(search) ||
            card.dataset.manu.toLowerCase().includes(search) ||
            card.dataset.uuid.toLowerCase().includes(search);

        const matchesManufacturer =
            activeManufacturerFilter === 'all' ||
            card.dataset.manu === activeManufacturerFilter;

        card.style.display = matchesText && matchesManufacturer ? '' : 'none';
    });

    const visible = visibleFleetData();
    updateDashboard(visible);
    updateResultCount();
};

window.sortFleet = function(mode) {
    const container = document.getElementById('fleet-container');
    if (!container) return;

    const cards = [...container.querySelectorAll('.ship-card-wrapper')];

    const number = (card, key) => Number(card.dataset[key]) || 0;
    cards.sort((a,b) => {
        if (mode === 'name') return a.dataset.name.localeCompare(b.dataset.name);
        if (mode === 'cargo') return number(b,'cargo') - number(a,'cargo');
        if (mode === 'mass') return number(b,'mass') - number(a,'mass');
        if (mode === 'heads') return number(b,'heads') - number(a,'heads');
        return a.dataset.manu.localeCompare(b.dataset.manu) || a.dataset.name.localeCompare(b.dataset.name);
    });

    cards.forEach(card => container.appendChild(card));
};

window.toggleFleetCard = function(button) {
    const card = button.closest('.ship-card-wrapper');
    if (!card) return;
    const expanded = card.classList.toggle('expanded');
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    const label = button.querySelector('span');
    if (label) label.textContent = expanded ? 'Hide details' : 'Details';
};

window.collapseAllFleetCards = function() {
    document.querySelectorAll('.ship-card-wrapper.expanded').forEach(card => {
        card.classList.remove('expanded');
        const button = card.querySelector('.fleet-details-toggle');
        if (button) {
            button.setAttribute('aria-expanded','false');
            const label = button.querySelector('span');
            if (label) label.textContent = 'Details';
        }
    });
};

// ==========================================
// 5. RENDER LOGIC (MAIN)
// ==========================================

function renderFleet() {
    const container = document.getElementById('fleet-container');
    if (!container) return;

    container.innerHTML = '';

    fleetRawData.forEach(entry => {
        const ship = entry.data;
        const miningHeads = getComponent(ship.hardpoints, "WeaponMining");
        const shields = getComponent(ship.hardpoints, "Shield");
        const powerPlants = getComponent(ship.hardpoints, "PowerPlant");
        const coolers = getComponent(ship.hardpoints, "Cooler");
        const qDrive = getComponent(ship.hardpoints, "QuantumDrive");

        const qRange = (ship.quantum.quantum_range / 1_000_000).toFixed(1);
        const manufacturer = ship.manufacturer.code;
        const manufacturerClass =
            manufacturer === 'ARGO' ? 'argo' :
            manufacturer === 'MISC' ? 'misc' : 'drake';

        const miningSummary = miningHeads.length
            ? miningHeads.map(head =>
                `<li><span>${head.name}</span><em>S${head.size}</em></li>`
              ).join('')
            : '<li><span>Standard mining system</span><em>—</em></li>';

        const cardHTML = `
        <article class="ship-card-wrapper fleet-roster-card ${manufacturerClass}"
                 data-name="${ship.name}"
                 data-manu="${manufacturer}"
                 data-uuid="${ship.uuid}"
                 data-cargo="${ship.cargo_capacity || 0}"
                 data-mass="${ship.mass || 0}"
                 data-heads="${miningHeads.length}">

            <div class="fleet-card-accent"></div>

            <div class="fleet-card-main">
                <div class="fleet-thumb-wrap">
                    <img src="${ship.image_url}"
                         alt="${ship.manufacturer.name} ${ship.name}"
                         class="fleet-thumb"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/360x220/17212b/cbd5e1?text=NO+IMAGE&font=oswald'">
                </div>

                <div class="fleet-card-identity">
                    <div class="fleet-card-topline">
                        <span class="fleet-manufacturer">${manufacturer}</span>
                        <span class="fleet-ready"><i></i> Flight ready</span>
                    </div>
                    <h2>${ship.name}</h2>
                    <p>${ship.type.en_EN} · Class ${ship.size_class}</p>

                    <div class="fleet-quick-stats">
                        <div><span>Cargo</span><strong>${ship.cargo_capacity} SCU</strong></div>
                        <div><span>Mining</span><strong>${miningHeads.length} head${miningHeads.length === 1 ? '' : 's'}</strong></div>
                        <div><span>SCM</span><strong>${ship.speed.scm} m/s</strong></div>
                        <div><span>Range</span><strong>${qRange}M km</strong></div>
                    </div>
                </div>
            </div>

            <div class="fleet-card-loadout">
                <div class="fleet-loadout-heading">
                    <span>Mining configuration</span>
                    <strong>${miningHeads.length ? miningHeads.length + ' installed' : 'Standard'}</strong>
                </div>
                <ul class="fleet-mining-list">${miningSummary}</ul>
            </div>

            <button type="button"
                    class="fleet-details-toggle"
                    aria-expanded="false"
                    onclick="toggleFleetCard(this)">
                <span>Details</span>
                <i class="fa-solid fa-chevron-down"></i>
            </button>

            <div class="fleet-card-details">
                <div class="fleet-detail-grid">
                    <div><span>Mass</span><strong>${formatNumber(Math.round(ship.mass))} kg</strong></div>
                    <div><span>Max speed</span><strong>${ship.speed.max} m/s</strong></div>
                    <div><span>Hull</span><strong>${formatNumber(ship.health)} HP</strong></div>
                    <div><span>Shields</span><strong>${formatNumber(ship.shield_hp)} HP</strong></div>
                    <div><span>Hydrogen</span><strong>${ship.fuel.capacity}</strong></div>
                    <div><span>Quantum fuel</span><strong>${ship.quantum.quantum_fuel_capacity}</strong></div>
                    <div><span>EM idle</span><strong>${formatNumber(ship.emission.em_idle)}</strong></div>
                    <div><span>IR</span><strong>${formatNumber(ship.emission.ir)}</strong></div>
                </div>

                <div class="fleet-system-grid">
                    <div>
                        <span>Quantum drive</span>
                        <strong>${qDrive[0]?.name || 'Stock'}</strong>
                    </div>
                    <div>
                        <span>Power plant</span>
                        <strong>${powerPlants[0]?.name || 'Stock'}</strong>
                    </div>
                    <div>
                        <span>Cooling</span>
                        <strong>${coolers[0]?.name || 'Stock'}${coolers.length > 1 ? ' ×' + coolers.length : ''}</strong>
                    </div>
                    <div>
                        <span>Shield</span>
                        <strong>${shields[0]?.name || 'Stock'}</strong>
                    </div>
                </div>

                <div class="fleet-card-meta">
                    <span>UUID ${ship.uuid}</span>
                    <span>${ship.manufacturer.name}</span>
                </div>
            </div>
        </article>`;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    updateDashboard(fleetRawData);
    sortFleet(document.getElementById('fleet-sort')?.value || 'manufacturer');
    updateResultCount();
}

// Init on load
document.addEventListener('DOMContentLoaded', renderFleet);