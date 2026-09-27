/**
 * MODULE: SENIOR FOREMAN
 *
 * Primary path:
 * - Cloudflare Pages Function
 * - Cloudflare Workers AI (Free-plan model)
 *
 * Fallback path:
 * - Deterministic MFA-native briefing generated in-browser.
 *
 * No browser API key and no paid OpenAI dependency.
 */

const MFA_AI_ENDPOINT =
    (window.MFA_CONFIG && window.MFA_CONFIG.aiEndpoint) ||
    window.MFA_AI_ENDPOINT ||
    "";

function getAIContent() {
    return document.getElementById("ai-content");
}

function getAILoading() {
    return document.getElementById("ai-loading");
}

function setAIMessage(html) {
    const el = getAIContent();
    if (el) el.innerHTML = html;
}

function finite(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function buildNativeForeman(mode) {
    if (typeof currentSimState === "undefined") {
        return "MFA simulation state is unavailable.";
    }

    const mass = finite(currentSimState.mass);
    const resistance = finite(currentSimState.resistance);
    const instability = finite(currentSimState.instability);
    const power = finite(currentSimState.power);
    const activeArms = Math.max(0, Math.round(finite(currentSimState.activeArms)));
    const success = Boolean(currentSimState.success);

    const status = success ? "FRACTURE VIABLE" : "FRACTURE NOT VIABLE";
    const base =
        `${status}. MFA reports rock mass ${mass.toFixed(0)} kg, resistance ${resistance.toFixed(1)}%, ` +
        `instability ${instability.toFixed(1)}%, and ${power.toFixed(0)} MW from ${activeArms} active mining head${activeArms === 1 ? "" : "s"}.`;

    if (mode === "briefing") {
        return (
            `${base} Crew order: use only the configured active vessels and heads included in the MFA calculation. ` +
            (success
                ? "Coordinate laser application, maintain stable output, and follow the exact recommended loadout before fracture."
                : "Do not begin fracture. Increase effective capability or apply the recommended MFA configuration, then recalculate.")
        );
    }

    if (mode === "risk") {
        const instabilityNote =
            instability >= 70
                ? "Instability is high; power changes should be deliberate and coordinated."
                : instability >= 40
                    ? "Instability is moderate; avoid unnecessary power oscillation."
                    : "Instability is comparatively controlled in the submitted MFA state.";

        return `${base} ${instabilityNote} MFA does not infer an explosion probability from these values.`;
    }

    if (mode === "optimize") {
        return (
            `${base} Use MFA Recommended Solutions as the authoritative loadout source. ` +
            "Match the exact recommended vessel count, mining heads, module activation state, and gadget before comparing the reproduced fracture verdict."
        );
    }

    return (
        `${base} ` +
        (success
            ? "The submitted MFA state has sufficient calculated capability to proceed, subject to the exact configuration shown by the calculator."
            : "The submitted MFA state does not have sufficient calculated capability. Follow Recommended Solutions and recalculate before proceeding.")
    );
}

async function openApiModal() {
    if (!MFA_AI_ENDPOINT) {
        setAIMessage(
            '<span class="text-green-400 font-bold">// MFA NATIVE FOREMAN READY</span><br>' +
            '<span class="text-purple-100/80">This build is using the deterministic zero-cost fallback.</span>'
        );
        return;
    }

    setAIMessage('<span class="text-blue-300 font-bold">// CHECKING SENIOR FOREMAN…</span>');

    try {
        const response = await fetch(MFA_AI_ENDPOINT, {
            method: "GET",
            headers: { "Accept": "application/json" },
            cache: "no-store"
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || `Backend health check returned HTTP ${response.status}`);
        }

        const provider = typeof data.provider === "string" ? data.provider : "unknown";
        const model = typeof data.model === "string" ? data.model : "unknown";
        const fallback = typeof data.fallback === "string" ? data.fallback : "mfa-native";

        setAIMessage(
            `<span class="text-green-400 font-bold">// SENIOR FOREMAN READY</span><br>` +
            `<span class="text-purple-100/80">Provider: ${provider} · Model: ${model} · Fallback: ${fallback} · Paid API required: no</span>`
        );
    } catch (error) {
        setAIMessage(
            '<span class="text-yellow-400 font-bold">// CLOUDFLARE FOREMAN UNAVAILABLE — NATIVE FALLBACK READY</span><br>' +
            `<span class="text-purple-100/80">${error.message}</span>`
        );
    }
}

function closeApiModal() {
    const m = document.getElementById("api-modal");
    if (m) m.style.display = "none";
}

function saveApiKey() {
    openApiModal();
}

function buildPrompt(mode) {
    const customInput = document.getElementById("ai-custom-input");

    if (typeof currentSimState === "undefined") {
        throw new Error("Simulation state is unavailable.");
    }

    if (currentSimState.power === 0 && mode !== "custom") {
        throw new Error("No telemetry data. Run the simulation first.");
    }

    const rockDetails =
        `Rock Mass: ${currentSimState.mass} kg, Resistance: ${currentSimState.resistance.toFixed(1)}%, Instability: ${currentSimState.instability.toFixed(1)}%.`;
    const crewDetails =
        `Crew Power: ${currentSimState.power.toFixed(0)} MW from ${currentSimState.activeArms} active laser heads.`;
    const status = currentSimState.success
        ? "FRACTURE POSSIBLE"
        : "FRACTURE IMPOSSIBLE (insufficient calculated power)";

    if (mode === "strategy") {
        return `Act as an expert Star Citizen mining foreman. Analyze this MFA telemetry: ${rockDetails} ${crewDetails} Status: ${status}. Give concise operational guidance and clearly distinguish calculator facts from tactical judgement.`;
    }
    if (mode === "briefing") {
        return `Generate a short crew tactical order for a Star Citizen mining operation. ${rockDetails} ${crewDetails} Status: ${status}.`;
    }
    if (mode === "risk") {
        return `Act as a mining safety officer. Assess operational risk from this MFA telemetry: ${rockDetails} ${crewDetails}. Do not invent an exact explosion probability unless supplied by the calculator.`;
    }
    if (mode === "optimize") {
        return `Act as a Star Citizen mining loadout engineer. Review this MFA telemetry: ${rockDetails} ${crewDetails}. Suggest loadout considerations while treating MFA's deterministic calculations as authoritative input.`;
    }
    if (mode === "custom") {
        const query = customInput ? customInput.value.trim() : "";
        if (!query) throw new Error("Enter a question for the Foreman.");
        return `MFA mining context: ${rockDetails} ${crewDetails} Status: ${status}. User question: ${query}`;
    }

    throw new Error("Unknown Foreman mode.");
}

async function askAI(mode) {
    const loading = getAILoading();
    const customInput = document.getElementById("ai-custom-input");

    let prompt;
    try {
        prompt = buildPrompt(mode);
    } catch (error) {
        setAIMessage(`<span class="text-yellow-400">// ${error.message}</span>`);
        return;
    }

    if (loading) loading.classList.remove("hidden");
    setAIMessage("");

    try {
        if (!MFA_AI_ENDPOINT) {
            const el = getAIContent();
            if (el) el.textContent = buildNativeForeman(mode);
            return;
        }

        const response = await fetch(MFA_AI_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                mode,
                telemetry: currentSimState,
                gameVersion:
                    (window.MFA_CONFIG && window.MFA_CONFIG.gameVersion) ||
                    "4.10.1-live.12660092"
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || `Foreman backend returned HTTP ${response.status}`);
        }

        const text = typeof data.text === "string" ? data.text : "";
        if (!text) throw new Error("Foreman returned no content.");

        const el = getAIContent();
        if (el) {
            const suffix = data.degraded
                ? "\n\n[MFA native fallback used — no paid API required.]"
                : "";
            el.textContent = text + suffix;
        }
    } catch (error) {
        const el = getAIContent();
        if (el) {
            el.textContent =
                buildNativeForeman(mode) +
                "\n\n[MFA native fallback used because Cloudflare AI was unavailable.]";
        }
    } finally {
        if (loading) loading.classList.add("hidden");
        if (mode === "custom" && customInput) customInput.value = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setAIMessage(
        MFA_AI_ENDPOINT
            ? '<span class="text-purple-400/70 italic">// SENIOR FOREMAN READY · CLOUDFLARE AI WITH MFA NATIVE FALLBACK.</span>'
            : '<span class="text-purple-400/70 italic">// MFA NATIVE FOREMAN READY · ZERO-COST FALLBACK ACTIVE.</span>'
    );
});
