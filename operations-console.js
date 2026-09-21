/**
 * MFA OPERATIONS CONSOLE
 * UI orchestration only. Does not alter authoritative calculation mechanics.
 */
(() => {
    const sourceState = {
        mass: "MANUAL",
        resistance: "MANUAL",
        instability: "MANUAL",
        material: "OPTIONAL"
    };

    let inputMode = "manual";
    let fleetMode = "auto";

    function byId(id) { return document.getElementById(id); }

    function setText(id, value) {
        const el = byId(id);
        if (el) el.textContent = value;
    }

    function formatPower(value) {
        if (!Number.isFinite(value)) return "—";
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " MW";
    }

    function deriveRequiredPower() {
        if (typeof currentSimState === "undefined") return 0;
        if (!Number.isFinite(currentSimState.mass) || !Number.isFinite(currentSimState.resistance)) return 0;
        if (currentSimState.resistance >= 100) return Infinity;
        return (currentSimState.mass * (1 - currentSimState.resistance / 100)) / 5;
    }

    function syncVerdict() {
        if (typeof currentSimState === "undefined") return;

        const required = deriveRequiredPower();
        const available = Number(currentSimState.power) || 0;
        const hasFleet = (Number(currentSimState.activeArms) || 0) > 0;

        setText("available-power", formatPower(available));
        setText("final-resistance", Number.isFinite(currentSimState.resistance) ? currentSimState.resistance.toFixed(1) + "%" : "—");
        setText("final-instability", Number.isFinite(currentSimState.instability) ? currentSimState.instability.toFixed(1) + "%" : "—");
        setText("required-power", required === Infinity ? "IMPOSSIBLE" : formatPower(required));

        const status = byId("verdict-status");
        const title = byId("verdict-title");
        const subtitle = byId("verdict-subtitle");
        const marginValue = byId("margin-value");
        const fill = byId("power-fill");
        const scaleLabel = byId("power-scale-label");

        if (!status || !title || !subtitle || !marginValue || !fill) return;

        status.className = "verdict-badge neutral";
        fill.classList.remove("short");

        if (!hasFleet) {
            status.textContent = "AWAITING FLEET";
            title.textContent = "Deploy a mining vessel to evaluate this rock.";
            subtitle.textContent = "Target values are ready; no active mining arms are currently deployed.";
            marginValue.textContent = "—";
            fill.style.width = "0%";
            if (scaleLabel) scaleLabel.textContent = required === Infinity ? "Resistance ≥100%" : "Required " + formatPower(required);
            return;
        }

        if (required === Infinity) {
            status.className = "verdict-badge failure";
            status.textContent = "RESISTANCE BLOCK";
            title.textContent = "Current configuration cannot overcome the target resistance.";
            subtitle.textContent = "Apply verified resistance-reduction equipment or revise the fleet configuration.";
            marginValue.textContent = "N/A";
            fill.style.width = "4%";
            fill.classList.add("short");
            if (scaleLabel) scaleLabel.textContent = "Resistance ≥100%";
            return;
        }

        const delta = available - required;
        const marginPct = required > 0 ? (delta / required) * 100 : 0;
        const ratio = required > 0 ? Math.min(1, available / required) : 0;

        marginValue.textContent = (marginPct >= 0 ? "+" : "") + marginPct.toFixed(1) + "%";
        fill.style.width = Math.max(2, ratio * 100) + "%";
        if (scaleLabel) scaleLabel.textContent = "Required " + formatPower(required);

        if (currentSimState.success) {
            status.className = "verdict-badge success";
            status.textContent = "FRACTURE VIABLE";
            title.textContent = "This deployed fleet can fracture the target.";
            subtitle.textContent = "Review the recommended configuration and operational margin below.";
        } else {
            status.className = "verdict-badge failure";
            status.textContent = "SUPPORT REQUIRED";
            title.textContent = "Current deployed power is insufficient.";
            subtitle.textContent = "MFA loadout and cooperative-fleet guidance below identifies the required support.";
            fill.classList.add("short");
        }
    }

    function setInputMode(mode) {
        inputMode = mode;
        document.querySelectorAll("[data-input-mode]").forEach(btn =>
            btn.classList.toggle("active", btn.dataset.inputMode === mode)
        );
        setText("input-mode-badge", mode === "ocr" ? "SCREENSHOT" : mode === "live" ? "LIVE BRIDGE" : "MANUAL");
        savePreferences();
    }

    function markSource(field, source) {
        sourceState[field] = source;
        const id = "source-" + field;
        setText(id, source);
        updateRockSourceSummary();
    }

    function markManual(field) {
        markSource(field, field === "material" ? "MANUAL" : "MANUAL");
        if (inputMode !== "manual") setInputMode("manual");
    }

    function markOcr(fields = ["mass", "resistance", "instability"]) {
        fields.forEach(field => markSource(field, "OCR"));
        setInputMode("ocr");
    }

    function updateRockSourceSummary() {
        const unique = [...new Set([sourceState.mass, sourceState.resistance, sourceState.instability])];
        setText("telemetry-rock-source", unique.join(" / "));
    }

    function setFleetMode(mode) {
        fleetMode = mode;
        const auto = byId("fleet-mode-auto");
        const manual = byId("fleet-mode-manual");
        if (auto) auto.classList.toggle("active", mode === "auto");
        if (manual) manual.classList.toggle("active", mode === "manual");
        const note = byId("auto-fleet-note");
        if (note) {
            note.style.display = mode === "auto" ? "block" : "none";
        }
        savePreferences();
    }

    function toggleAdvanced() {
        const panel = byId("advanced-console");
        if (!panel) return;
        panel.classList.toggle("hidden");
        if (!panel.classList.contains("hidden")) {
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => {
                if (typeof currentSimState !== "undefined" && currentSimState.power > 0 && typeof calculate === "function") {
                    calculate();
                }
            }, 80);
        }
    }

    function showAdvanced(name) {
        document.querySelectorAll(".advanced-pane").forEach(pane => pane.classList.add("hidden"));
        const active = byId("advanced-" + name);
        if (active) active.classList.remove("hidden");
        document.querySelectorAll("[data-advanced-tab]").forEach(btn =>
            btn.classList.toggle("active", btn.dataset.advancedTab === name)
        );
        if (name === "charts" && typeof calculate === "function") {
            setTimeout(() => calculate(), 30);
        }
    }

    function getPreferences() {
        return {
            inputMode,
            fleetMode,
            optimizerObjective: byId("optimizerObjective")?.value || "minimum-ships",
            maxFleetSize: Number(byId("maxFleetSize")?.value || 6),
            allowActiveModules: !!byId("allowActiveModules")?.checked,
            allowGadgets: !!byId("allowGadgets")?.checked,
            preferCurrentShip: !!byId("preferCurrentShip")?.checked
        };
    }

    function savePreferences() {
        try {
            localStorage.setItem("mfa.ops.preferences", JSON.stringify(getPreferences()));
        } catch (_) {}
    }

    function loadPreferences() {
        try {
            const saved = JSON.parse(localStorage.getItem("mfa.ops.preferences") || "{}");
            if (saved.optimizerObjective && byId("optimizerObjective")) byId("optimizerObjective").value = saved.optimizerObjective;
            if (saved.maxFleetSize && byId("maxFleetSize")) byId("maxFleetSize").value = saved.maxFleetSize;
            if (typeof saved.allowActiveModules === "boolean" && byId("allowActiveModules")) byId("allowActiveModules").checked = saved.allowActiveModules;
            if (typeof saved.allowGadgets === "boolean" && byId("allowGadgets")) byId("allowGadgets").checked = saved.allowGadgets;
            if (typeof saved.preferCurrentShip === "boolean" && byId("preferCurrentShip")) byId("preferCurrentShip").checked = saved.preferCurrentShip;
            setInputMode(saved.inputMode || "manual");
            setFleetMode(saved.fleetMode || "auto");
        } catch (_) {
            setInputMode("manual");
            setFleetMode("auto");
        }
    }

    function saveScenario() {
        const scenario = {
            savedAt: new Date().toISOString(),
            target: {
                mass: Number(byId("rockMass")?.value || 0),
                resistance: Number(byId("resistance")?.value || 0),
                instability: Number(byId("instability")?.value || 0),
                material: byId("materialName")?.value || ""
            },
            sources: { ...sourceState },
            gadget: byId("gadgetSelect")?.value || "None",
            preferences: getPreferences()
        };

        try {
            localStorage.setItem("mfa.ops.lastScenario", JSON.stringify(scenario));
            flashAction("Scenario saved");
        } catch (_) {
            flashAction("Unable to save scenario");
        }
    }

    function loadScenario() {
        try {
            const scenario = JSON.parse(localStorage.getItem("mfa.ops.lastScenario") || "null");
            if (!scenario) {
                flashAction("No saved scenario");
                return;
            }

            if (byId("rockMass")) byId("rockMass").value = scenario.target?.mass ?? 0;
            if (byId("resistance")) byId("resistance").value = scenario.target?.resistance ?? 0;
            if (byId("instability")) byId("instability").value = scenario.target?.instability ?? 0;
            if (byId("materialName")) byId("materialName").value = scenario.target?.material ?? "";

            Object.assign(sourceState, scenario.sources || {});
            Object.keys(sourceState).forEach(field => setText("source-" + field, sourceState[field]));
            updateRockSourceSummary();

            if (scenario.gadget) {
                const radio = [...document.querySelectorAll('input[name="gadg"]')].find(x => x.value === scenario.gadget);
                if (radio) {
                    radio.checked = true;
                    if (byId("gadgetSelect")) byId("gadgetSelect").value = scenario.gadget;
                }
            }

            if (typeof calculate === "function") calculate();
            flashAction("Scenario loaded");
        } catch (_) {
            flashAction("Unable to load scenario");
        }
    }

    function flashAction(message) {
        const badge = byId("input-mode-badge");
        if (!badge) return;
        const original = badge.textContent;
        badge.textContent = message.toUpperCase();
        setTimeout(() => badge.textContent = original, 1400);
    }

    function installCalculationObserver() {
        const results = byId("results");
        if (results) {
            const observer = new MutationObserver(syncVerdict);
            observer.observe(results, { childList: true, subtree: true, characterData: true });
        }

        document.addEventListener("change", event => {
            if (event.target && event.target.closest && event.target.closest("#multiShipContainer")) {
                setTimeout(syncVerdict, 0);
            }
        });
    }

    function init() {
        loadPreferences();
        installCalculationObserver();
        updateRockSourceSummary();

        // Mark a successful OCR parse without coupling OCR to UI internals.
        window.addEventListener("mfa:ocr-applied", event => {
            markOcr(event.detail?.fields || ["mass", "resistance", "instability"]);
        });

        setTimeout(syncVerdict, 50);
    }

    window.MFAOps = {
        setInputMode,
        markManual,
        markOcr,
        markSource,
        setFleetMode,
        toggleAdvanced,
        showAdvanced,
        savePreferences,
        saveScenario,
        loadScenario,
        syncVerdict,
        getPreferences
    };

    document.addEventListener("DOMContentLoaded", init);
})();
