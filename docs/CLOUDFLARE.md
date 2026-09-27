# Cloudflare Pages

MFA uses Cloudflare Pages for the public web application.

## Architecture

```text
Browser
  |
  +-- Cloudflare Pages: MFA web application
```

The public application does not require an OpenAI API, Workers AI, AI credits, or a user-supplied AI key.

## Branch roles

- `main` — LIVE / production source branch.
- `alpha` — development / preview source branch.
- feature/fix branches — short-lived work branches merged into `alpha`.

## Build behavior

Run:

```bash
npm run build:pages
```

The command creates `dist/` with the complete current MFA runtime.

## Cloudflare project

Pages project:

`mining-fracture-analyser`

Current testing branch:

- production branch: `alpha`

Release target:

- production branch: `main`
- preview/development branch: `alpha`

Do not switch production to `main` until the protected alpha-to-main release PR is completed.

## AI usage

The Senior Foreman AI feature has been removed from the public MFA application.

MFA fracture verdicts and Recommended Solutions remain fully deterministic and local to the application runtime. No OpenAI or Cloudflare AI inference is required for normal operation.

Any legacy `OPENAI_API_KEY` secret or `OPENAI_MODEL` variable left in the Cloudflare project is no longer read by MFA and can be removed from Cloudflare settings.

## Public-production controls

Before final production promotion:

- keep HTTPS enabled;
- apply Cloudflare managed protections where appropriate;
- ensure the deterministic solver remains covered by regression tests;
- validate alpha before promoting to main.
