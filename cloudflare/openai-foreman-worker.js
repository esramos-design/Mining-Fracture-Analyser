/**
 * MFA OpenAI Foreman backend for Cloudflare Workers.
 *
 * Required secret:
 *   OPENAI_API_KEY
 *
 * Optional environment variables:
 *   OPENAI_MODEL       default: gpt-5.6-terra
 *   ALLOWED_ORIGIN     default: *
 */

function corsHeaders(env, request) {
  const configured = env.ALLOWED_ORIGIN || "*";
  const requestOrigin = request.headers.get("Origin") || "";
  const allowOrigin =
    configured === "*" || configured === requestOrigin ? configured : configured;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

function json(body, status, env, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env, request)
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    if (url.pathname !== "/api/foreman" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, env, request);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "OPENAI_API_KEY is not configured on the server." }, 503, env, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400, env, request);
    }

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 12000) {
      return json({ error: "Prompt is empty or too large." }, 400, env, request);
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
        "You are the Mining Fracture Analyser (MFA) Foreman for Star Citizen. " +
        "Treat deterministic MFA telemetry and versioned local game data as authoritative inputs. " +
        "Do not invent exact game statistics, probabilities, module effects, or patch mechanics. " +
        "If a requested fact is not supplied by MFA data, state that it requires verification. " +
        "Keep operational advice concise and distinguish facts from recommendations. " +
        "The client reports Star Citizen build: " + gameVersion + ".",
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
      return json({ error: "Unable to reach the OpenAI API." }, 502, env, request);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        data && data.error && typeof data.error.message === "string"
          ? data.error.message
          : `OpenAI API returned HTTP ${response.status}`;
      return json({ error: message }, 502, env, request);
    }

    const text = extractOutputText(data);
    if (!text) {
      return json({ error: "OpenAI returned no text output." }, 502, env, request);
    }

    return json({ text, model }, 200, env, request);
  }
};
