/**
 * Cloudflare Pages Function: MFA OpenAI Foreman
 *
 * Required secret:
 * - OPENAI_API_KEY
 *
 * Optional variable:
 * - OPENAI_MODEL (default: gpt-5.6-terra)
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

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (!Array.isArray(data.output)) return "";

  const parts = [];
  for (const item of data.output) {
    if (!item || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

export function onRequestGet({ env }) {
  return json({
    service: "MFA OpenAI Foreman",
    status: env.OPENAI_API_KEY ? "ready" : "configuration_required",
    model: env.OPENAI_MODEL || "gpt-5.6-terra"
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY is not configured." }, 503);
  }

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

  const gameVersion =
    typeof body.gameVersion === "string" && body.gameVersion
      ? body.gameVersion
      : "unknown";

  const model = env.OPENAI_MODEL || "gpt-5.6-terra";

  const payload = {
    model,
    reasoning: { effort: "low" },
    max_output_tokens: 700,
    instructions:
      "You are the Mining Fracture Analyser (MFA) Senior Foreman for Star Citizen. " +
      "Treat deterministic MFA calculations, current fleet state, and versioned local game data as authoritative. " +
      "Never replace, contradict, or silently recalculate MFA deterministic results. " +
      "Do not invent exact game statistics, probabilities, module effects, patch mechanics, or equipment availability. " +
      "If a fact is not present in supplied MFA state or verified data, say that it requires verification. " +
      "Keep operational advice concise, practical, and clearly separate calculator facts from tactical judgement. " +
      "Client Star Citizen build: " + gameVersion + ".",
    input: prompt
  };

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    return json({ error: "Unable to reach the OpenAI API." }, 502);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data && data.error && typeof data.error.message === "string"
        ? data.error.message
        : `OpenAI API returned HTTP ${response.status}`;
    return json({ error: message }, 502);
  }

  const text = extractOutputText(data);
  if (!text) {
    return json({ error: "OpenAI returned no text output." }, 502);
  }

  return json({ text, model }, 200);
}
