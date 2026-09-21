/**
 * MFA UNIFIED FLEET PLANNER
 *
 * The operation fleet is the single source of truth for:
 * - vessel quantity
 * - actual fitted loadout
 * - operational role: Active / Available / Standby
 *
 * The planner intentionally reuses v5.35 ship-arm controls so the protected
 * deterministic calculation engine continues to read the same DOM contract.
 */
(() => {
    const TYPES = [
        { id: "mole", label: "ARGO MOLE", enabledId: "fleetEnabledMole", qtyId: "fleetAvailableMole" },
        { id: "prospector", label: "MISC Prospector", enabledId: "fleetEnabledProspector", qtyId: "fleetAvailableProspector" },
        { id: "golem", label: "DRAKE GOLEM", enabledId: "fleetEnabledGolem", qtyId: "fleetAvailableGolem" }
    ];

    const STORAGE_KEY = "mfa.actualFleet.v1";
    let restoring = false;

    function byId(id) { return document.getElementById(id); }

    function getShip(shipId) {
        return typeof ships !== "undefined" ? ships.find(ship => ship.id === shipId) : null;
    }

    function sanitizeQty(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(20, Math.floor(n)));
    }

    function captureState() {
        const state = {};

        document.querySelectorAll(".fleet-vessel-card").forEach(card => {
            const key = card.dataset.vesselKey;
            const role = card.querySelector(".vessel-role-select")?.value || "available";
            const arms = [];

            card.querySelectorAll(".ship-arm-card").forEach(arm => {
                const laser = byId(arm.id + "-laser");
                const enabled = byId(arm.id + "-enable");
                const modules = [];

                for (let i = 1; i <= 3; i++) {
                    const select = byId(arm.id + "-mod" + i);
                    const active = byId(arm.id + "-mod" + i + "-active-toggle");
                    modules.push({
                        value: select?.value || "None",
                        active: !!active?.checked
                    });
                }

                arms.push({
                    laserIndex: laser?.selectedIndex ?? 0,
                    enabled: !!enabled?.checked,
                    modules
                });
            });

            state[key] = { role, arms };
        });

        return state;
    }

    function loadStoredState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        } catch (_) {
            return {};
        }
    }

    function persistState() {
        if (restoring) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(captureState()));
        } catch (_) {}
    }

    function roleBadge(role) {
        const labels = {
            active: "ACTIVE · CONTRIBUTING NOW",
            available: "AVAILABLE · MAY ASSIST",
            standby: "STANDBY · EXCLUDED"
        };
        return labels[role] || labels.available;
    }

    function vesselHtml(ship, index, role) {
        const key = ship.id + "-" + index;
        let armsHtml = "";

        for (let arm = 1; arm <= ship.arms; arm++) {
            armsHtml += window.createArmConfigHtml(arm, ship);
        }

        return `
            <article class="fleet-vessel-card role-${role}" data-vessel-key="${key}" data-ship="${ship.id}">
                <header class="vessel-card-head">
                    <div>
                        <span class="vessel-number">VESSEL ${String(index).padStart(2, "0")}</span>
                        <h3>${ship.name}</h3>
                        <small>Actual fitted equipment</small>
                    </div>
                    <div class="vessel-role-control">
                        <label>Status</label>
                        <select class="vessel-role-select" onchange="MFAFleetPlanner.setVesselRole('${key}', this.value)">
                            <option value="active" ${role === "active" ? "selected" : ""}>Active — lasing now</option>
                            <option value="available" ${role === "available" ? "selected" : ""}>Available — can assist</option>
                            <option value="standby" ${role === "standby" ? "selected" : ""}>Standby — excluded</option>
                        </select>
                        <span class="vessel-role-badge">${roleBadge(role)}</span>
                    </div>
                </header>
                <div class="vessel-arms-grid">${armsHtml}</div>
            </article>
        `;
    }

    function restoreVesselState(card, saved) {
        if (!saved) return;

        const roleSelect = card.querySelector(".vessel-role-select");
        if (roleSelect && ["active", "available", "standby"].includes(saved.role)) {
            roleSelect.value = saved.role;
        }

        const arms = [...card.querySelectorAll(".ship-arm-card")];
        arms.forEach((arm, index) => {
            const savedArm = saved.arms?.[index];
            if (!savedArm) return;

            const laser = byId(arm.id + "-laser");
            if (laser && savedArm.laserIndex >= 0 && savedArm.laserIndex < laser.options.length) {
                laser.selectedIndex = savedArm.laserIndex;
                window.updateModuleSlots?.(arm.id);
            }

            (savedArm.modules || []).forEach((savedModule, moduleIndex) => {
                const i = moduleIndex + 1;
                const select = byId(arm.id + "-mod" + i);
                const active = byId(arm.id + "-mod" + i + "-active-toggle");

                if (select && [...select.options].some(option => option.value === savedModule.value)) {
                    select.value = savedModule.value;
                    window.togCheck?.(arm.id, i);
                }
                if (active) active.checked = !!savedModule.active;
            });
        });
    }

    function applyRole(card, role) {
        card.classList.remove("role-active", "role-available", "role-standby");
        card.classList.add("role-" + role);

        const badge = card.querySelector(".vessel-role-badge");
        if (badge) badge.textContent = roleBadge(role);

        card.querySelectorAll(".ship-arm-card").forEach(arm => {
            const enable = byId(arm.id + "-enable");
            if (enable) enable.checked = role === "active";
        });
    }

    function ensureOneActive(container, savedState) {
        const cards = [...container.querySelectorAll(".fleet-vessel-card")];
        if (!cards.length) return;

        const savedHasActive = cards.some(card => savedState[card.dataset.vesselKey]?.role === "active");
        if (savedHasActive) return;

        const first = cards[0];
        const select = first.querySelector(".vessel-role-select");
        if (select) select.value = "active";
    }

    function render() {
        const container = byId("multiShipContainer");
        if (!container || typeof window.createArmConfigHtml !== "function") return;

        const liveState = captureState();
        const storedState = loadStoredState();
        const state = { ...storedState, ...liveState };

        let html = "";
        let vesselCount = 0;

        for (const type of TYPES) {
            const enabled = byId(type.enabledId);
            const qty = byId(type.qtyId);
            if (!enabled || !qty) continue;

            const count = enabled.checked ? sanitizeQty(qty.value) : 0;
            qty.value = String(count);
            qty.disabled = !enabled.checked;

            const row = enabled.closest(".fleet-presence-row");
            if (row) row.classList.toggle("disabled", !enabled.checked);

            const ship = getShip(type.id);
            if (!ship) continue;

            for (let i = 1; i <= count; i++) {
                const key = type.id + "-" + i;
                const role = state[key]?.role || "available";
                html += vesselHtml(ship, i, role);
                vesselCount++;
            }
        }

        if (!vesselCount) {
            container.innerHTML = '<p id="empty-state-msg" class="empty-state">SELECT AT LEAST ONE VESSEL ABOVE…</p>';
            if (typeof calculate === "function") calculate();
            persistState();
            return;
        }

        restoring = true;
        container.innerHTML = html;
        ensureOneActive(container, state);

        container.querySelectorAll(".fleet-vessel-card").forEach(card => {
            restoreVesselState(card, state[card.dataset.vesselKey]);
            const role = card.querySelector(".vessel-role-select")?.value || "available";
            applyRole(card, role);

            card.querySelectorAll(".ship-arm-card").forEach(arm => {
                window.updateModuleSlots?.(arm.id);
            });
        });

        restoring = false;
        persistState();

        window.MFAOps?.savePreferences?.();
        if (typeof calculate === "function") calculate();
    }

    function syncFromControls() {
        TYPES.forEach(type => {
            const enabled = byId(type.enabledId);
            const qty = byId(type.qtyId);
            if (!enabled || !qty) return;

            if (!enabled.checked) {
                if (sanitizeQty(qty.value) > 0) qty.dataset.previousValue = qty.value;
                qty.value = "0";
            } else if (sanitizeQty(qty.value) < 1) {
                qty.value = qty.dataset.previousValue || "1";
            }
        });

        render();
    }

    function setVesselRole(key, role) {
        const card = document.querySelector('.fleet-vessel-card[data-vessel-key="' + key + '"]');
        if (!card) return;

        applyRole(card, role);
        persistState();

        if (typeof calculate === "function") calculate();
    }

    function getRoleCounts() {
        const counts = {
            active: { mole: 0, prospector: 0, golem: 0 },
            available: { mole: 0, prospector: 0, golem: 0 },
            standby: { mole: 0, prospector: 0, golem: 0 }
        };

        document.querySelectorAll(".fleet-vessel-card").forEach(card => {
            const role = card.querySelector(".vessel-role-select")?.value || "available";
            const shipId = card.dataset.ship;
            if (counts[role] && Object.prototype.hasOwnProperty.call(counts[role], shipId)) {
                counts[role][shipId]++;
            }
        });

        return counts;
    }

    function getActualFleet() {
        const state = captureState();
        return document.querySelectorAll(".fleet-vessel-card").length
            ? [...document.querySelectorAll(".fleet-vessel-card")].map(card => ({
                key: card.dataset.vesselKey,
                shipId: card.dataset.ship,
                role: card.querySelector(".vessel-role-select")?.value || "available",
                state: state[card.dataset.vesselKey]
            }))
            : [];
    }

    function resetLoadouts() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        render();
    }

    function init() {
        const container = byId("multiShipContainer");
        if (!container) return;

        container.addEventListener("change", event => {
            if (event.target.classList.contains("vessel-role-select")) return;
            persistState();
            setTimeout(() => {
                if (typeof calculate === "function") calculate();
            }, 0);
        });

        setTimeout(render, 0);
    }

    window.MFAFleetPlanner = {
        syncFromControls,
        setVesselRole,
        getRoleCounts,
        getActualFleet,
        resetLoadouts,
        render
    };

    document.addEventListener("DOMContentLoaded", init);
})();
