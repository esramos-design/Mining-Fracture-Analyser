# Cloudflare Pages + OpenAI Foreman

MFA supports a parallel Cloudflare Pages deployment for secure server-side OpenAI Foreman access.

## Architecture

```text
Browser
  |
  +-- Cloudflare Pages: current MFA web application
  |
  +-- /api/foreman
        |
        +-- Cloudflare Pages Function
              |
              +-- OpenAI Responses API
```

The browser never receives or stores the OpenAI API key.

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

The repository's source `index.html` deliberately keeps:

```js
aiEndpoint: ""
```

The Cloudflare build rewrites only the generated `dist/index.html` to:

```js
aiEndpoint: "/api/foreman"
```

This prevents GitHub Pages from attempting to call a backend route it cannot host.

## Cloudflare project

Create a Pages project named:

`mining-fracture-analyser`

Recommended branch mapping:

- production branch: `main`
- preview/development branch: `alpha`

## Cloudflare environment

Required encrypted secret:

- `OPENAI_API_KEY`

Optional variable:

- `OPENAI_MODEL` — defaults to `gpt-5.6-terra`

Do not put `OPENAI_API_KEY` in source code, HTML, localStorage, screenshots, GitHub variables, or `wrangler.toml`.

## GitHub environment / Actions secrets

Create a GitHub environment named:

`cloudflare`

Add:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Use a Cloudflare API token scoped only to the account/project permissions needed for Pages deployment.

## Deployment workflow

The `Deploy Cloudflare Pages` workflow is intentionally manual during initial integration.

From GitHub Actions:

1. Open **Deploy Cloudflare Pages**.
2. Choose **Run workflow**.
3. Select:
   - `alpha` for preview/development
   - `main` for production
4. The workflow runs regression tests, builds the current MFA site, then deploys it.

Do not enable automatic production deployment until the alpha preview has been tested.

## Foreman health status

The MFA **OpenAI status** button performs a GET request to `/api/foreman`.

Possible states:

- `ready` — Function is reachable and `OPENAI_API_KEY` is configured.
- `configuration_required` — Function is reachable but the secret is missing.
- unavailable — browser cannot reach the backend.

The health response never returns the API key.

## Foreman authority boundary

The Foreman is downstream of deterministic MFA calculations.

It may:

- explain a deterministic result;
- summarize risk/trade-offs;
- produce a crew briefing;
- discuss supplied verified MFA data.

It must not:

- replace or override MFA's deterministic fracture result;
- invent exact mining statistics or unsupported patch mechanics;
- silently infer equipment availability;
- expose secrets.

## Security before public production

Before making the Cloudflare Foreman public:

- use HTTPS only;
- apply Cloudflare managed WAF protections where available;
- rate-limit `/api/foreman`;
- ensure `/api/*` responses are not cached;
- monitor OpenAI usage/cost;
- keep Cloudflare credentials least-privileged;
- test abuse/error behavior from the alpha preview.

## Current model default

The default backend model is `gpt-5.6-terra`. It is configured server-side and can be changed with `OPENAI_MODEL` without modifying browser code.
