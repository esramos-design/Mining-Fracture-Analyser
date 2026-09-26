/**
 * Cloudflare Pages Function: MFA Senior Foreman
 *
 * Primary provider:
 * - Cloudflare Workers AI binding: env.AI
 * - Free-plan model by default: @cf/zai-org/glm-4.7-flash
 *
 * Fallback:
 * - Deterministic MFA-native briefing generated from submitted telemetry.
 *
 * No OpenAI API key is required.
 */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nativeBrief(mode, telemetry = {}) {
  const mass = finite(telemetry.mass);
  const resistance = finite(telemetry.resistance);
  const instability = finite(telemetry.instability);
  const power = finite(telemetry.power);
  const activeArms = Math.max(0, Math.round(finite(telemetry.activeArms)));
  const success = Boolean(telemetry.success);

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

function extractWorkersAIText(data) {
  if (!data) return "";

  if (typeof data.response === "string" && data.response.trim()) {
    return data.response.trim();
  }

  if (typeof data.text === "string" && data.text.trim()) {
    return data.text.trim();
  }

  if (Array.isArray(data.choices)) {
    for (const choice of data.choices) {
      const content = choice?.message?.content;
      if (typeof content === "string" && content.trim()) return content.trim();
    }
  }

  return "";
}

export function onRequestGet({ env }) {
  const workersAIReady = Boolean(env.AI);
  return json({
    service: "MFA Senior Foreman",
    status: "ready",
    provider: workersAIReady ? "cloudflare-workers-ai" : "native-fallback",
    model: workersAIReady
      ? (env.FOREMAN_MODEL || "@cf/zai-org/glm-4.7-flash")
      : "mfa-native",
    fallback: "mfa-native",
    paid_api_required: false
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 12000) {
    return json({ error: "Prompt is empty or too large." }, 400);
  }

  const mode = typeof body.mode === "string" ? body.mode : "strategy";
  const telemetry =
    body.telemetry && typeof body.telemetry === "object" ? body.telemetry : {};
  const gameVersion =
    typeof body.gameVersion === "string" && body.gameVersion
      ? body.gameVersion
      : "unknown";

  const fallbackText = nativeBrief(mode, telemetry);

  if (!env.AI) {
    return json({
      text: fallbackText,
      provider: "mfa-native",
      model: "mfa-native",
      degraded: true,
      reason: "Workers AI binding unavailable."
    });
  }

  const model = env.FOREMAN_MODEL || "@cf/zai-org/glm-4.7-flash";
  const messages = [
    {
      role: "system",
      content:
        "You are the Mining Fracture Analyser (MFA) Senior Foreman for Star Citizen. " +
        "Treat deterministic MFA calculations, current fleet state, and versioned local game data as authoritative. " +
        "Never replace, contradict, or silently recalculate MFA deterministic results. " +
        "Do not invent exact game statistics, probabilities, module effects, patch mechanics, or equipment availability. " +
        "If a fact is not present in supplied MFA state or verified data, say that it requires verification. " +
        "Keep operational advice concise and practical. Clearly separate calculator facts from tactical judgement. " +
        "Client Star Citizen build: " + gameVersion + "."
    },
    { role: "user", content: prompt }
  ];

  try {
    const result = await env.AI.run(
      model,
      {
        messages,
        max_completion_tokens: 420,
        temperature: 0.2
      },
      { rejectIfBusy: true }
    );

    const text = extractWorkersAIText(result);
    if (!text) throw new Error("Workers AI returned no text output.");

    return json({
      text,
      provider: "cloudflare-workers-ai",
      model,
      degraded: false,
      fallback: "mfa-native"
    });
  } catch (error) {
    return json({
      text: fallbackText,
      provider: "mfa-native",
      model: "mfa-native",
      degraded: true,
      reason:
        error && typeof error.message === "string"
          ? error.message
          : "Workers AI unavailable."
    });
  }
}

export { nativeBrief, extractWorkersAIText };
