# Cloudflare Pages + Senior Foreman

MFA uses Cloudflare Pages for the public web application and can use Cloudflare Workers AI for the Senior Foreman.

The Senior Foreman has a deterministic MFA-native fallback, so the application remains usable when Workers AI is unavailable, busy, or the Free-plan daily allocation has been exhausted.

## Architecture

```text
Browser
  |
  +-- Cloudflare Pages: MFA web application
  |
  +-- /api/foreman
        |
        +-- Cloudflare Pages Function
              |
              +-- Cloudflare Workers AI (when available)
              |
              +-- MFA-native deterministic fallback
```

No OpenAI API key is required.

## Cost boundary

The configured Workers AI model is:

`@cf/zai-org/glm-4.7-flash`

It is selected because it is available to the Cloudflare Workers Free plan.

MFA does not require a paid AI subscription or user-supplied API key. If Cloudflare Workers AI cannot serve the request, MFA falls back to deterministic guidance instead of blocking the feature.

The maintainer should keep the Cloudflare project on the intended Free plan unless explicitly deciding otherwise.

## Branch roles

- `main` — LIVE / production source branch.
- `alpha` — development / preview source branch.
- feature/fix branches — short-lived work branches merged into `alpha`.

The existing GitHub Pages LIVE deployment is not changed by this integration. Cloudflare is a parallel preview/deployment path until explicitly promoted.

## Build behavior

Run:

```bash
npm run build:pages
```

The command creates `dist/` with the complete current MFA runtime.

The repository source `index.html` deliberately keeps:

```js
aiEndpoint: ""
```

The Cloudflare build rewrites only the generated `dist/index.html` to:

```js
aiEndpoint: "/api/foreman"
```

This prevents GitHub Pages from attempting to call a backend route it cannot host. GitHub Pages still retains the MFA-native fallback.

## Cloudflare project

Pages project:

`mining-fracture-analyser`

Current testing branch:

- production branch: `alpha`

Release target:

- production branch: `main`
- preview/development branch: `alpha`

Do not switch production to `main` until the protected alpha-to-main release PR is completed.

## Workers AI binding

`wrangler.toml` declares:

```toml
[ai]
binding = "AI"
```

The Pages Function accesses the binding through `env.AI`.

The model is configured with:

```toml
[vars]
FOREMAN_MODEL = "@cf/zai-org/glm-4.7-flash"
```

No third-party AI credential is required.

## Foreman health status

The MFA **Foreman status** button performs a GET request to `/api/foreman`.

The response reports:

- `provider: "cloudflare-workers-ai"` when the Workers AI binding is available;
- `provider: "native-fallback"` when only deterministic MFA guidance is available;
- `fallback: "mfa-native"`;
- `paid_api_required: false`.

## Runtime fallback

For a POST request, the backend first attempts Workers AI.

If Workers AI is:

- unavailable;
- over the Free-plan allocation;
- out of capacity;
- missing its binding;
- or returns no usable text;

the Function returns an MFA-native deterministic briefing based on submitted telemetry.

The browser also has its own native fallback if the entire backend route cannot be reached.

This creates two fallback layers:

```text
Cloudflare Workers AI
        |
        v
Pages Function native fallback
        |
        v
Browser native fallback
```

## Foreman authority boundary

The Foreman is downstream of deterministic MFA calculations.

It may:

- explain a deterministic result;
- summarize risk and trade-offs;
- produce a crew briefing;
- discuss supplied verified MFA data.

It must not:

- replace or override MFA's deterministic fracture result;
- invent exact mining statistics or unsupported patch mechanics;
- silently infer equipment availability;
- alter Recommended Solutions;
- expose secrets.

## Public-production controls

Before final production promotion:

- keep HTTPS enabled;
- apply Cloudflare managed protections where appropriate;
- rate-limit abusive traffic if required;
- ensure `/api/*` responses remain uncached;
- monitor Workers AI Free-plan usage;
- preserve the deterministic fallback;
- test failure behavior from the alpha deployment.

## Legacy OpenAI configuration

Previous MFA revisions used `OPENAI_API_KEY` and `OPENAI_MODEL`.

They are no longer read by the application. Any old `OPENAI_API_KEY` secret in the Cloudflare project can be deleted after this revision is deployed and verified.
