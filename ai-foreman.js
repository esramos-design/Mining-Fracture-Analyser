/**
 * MODULE: AI FOREMAN (OPENAI)
 * Revision foundation for MFA after v5.35.
 *
 * Security model:
 * - No API keys are accepted or stored in the browser.
 * - Browser calls a maintainer-controlled backend endpoint.
 * - Backend owns OPENAI_API_KEY and calls the OpenAI Responses API.
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

function openApiModal() {
    // Compatibility shim for existing v5.35 inline handler.
    // API credentials are no longer entered in the browser.
    setAIMessage(
        '<span class="text-blue-300 font-bold">// OPENAI FOREMAN</span><br>' +
        '<span class="text-purple-100/80">Credentials are managed securely by the MFA backend. No browser API key is required.</span>'
    );
}

function closeApiModal() {
    const m = document.getElementById("api-modal");
    if (m) m.style.display = "none";
}

function saveApiKey() {
    // Compatibility shim. Deliberately does not persist secrets.
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

    if (!MFA_AI_ENDPOINT) {
        setAIMessage(
            '<span class="text-yellow-400 font-bold">// OPENAI BACKEND NOT CONFIGURED</span><br>' +
            '<span class="text-purple-100/80">Set <code>window.MFA_CONFIG.aiEndpoint</code> to the deployed MFA Foreman endpoint.</span>'
        );
        return;
    }

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

        // Render as plain text. Do not inject model-generated HTML into the DOM.
        const el = getAIContent();
        if (el) el.textContent = text;
    } catch (error) {
        setAIMessage(
            `<span class="text-red-400 font-bold">// OPENAI FOREMAN FAILURE</span><br><span class="text-red-300">${error.message}</span>`
        );
    } finally {
        if (loading) loading.classList.add("hidden");
        if (mode === "custom" && customInput) customInput.value = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setAIMessage(
        MFA_AI_ENDPOINT
            ? '<span class="text-purple-400/70 italic">// OPENAI FOREMAN READY.</span>'
            : '<span class="text-purple-500/50 italic">// OPENAI FOREMAN AWAITING BACKEND CONFIGURATION.</span>'
    );
});
