# Cloudflare deployment for MFA

MFA is prepared to use **Cloudflare Pages + Pages Functions**.

## Architecture

```text
User
  |
  v
Cloudflare
  |
  +-- Pages: MFA web application
  |
  +-- /api/foreman
        |
        +-- Pages Function
              |
              +-- OpenAI Responses API
```

This gives MFA one origin for both the application and AI Foreman. The OpenAI key is never exposed to browser JavaScript.

## One-time Cloudflare setup

1. In Cloudflare, create a Pages project named:
   `mining-fracture-analyser`

2. Connect or deploy from the GitHub repository:
   `esramos-design/Mining-Fracture-Analyser`

3. Production branch:
   `main`

4. Preview/development branch:
   `develop/v5.35-revision`

5. Add the following Pages environment variables/secrets:

   - `OPENAI_API_KEY` — **encrypted secret**
   - `OPENAI_MODEL` — optional; defaults to `gpt-5.6-terra`

6. For GitHub Actions deployment, add repository/environment secrets:

   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`

The Cloudflare token should be scoped only to the account/project permissions needed for Pages deployment.

## Build

```bash
npm run build:pages
```

The deployable static output is written to `dist/`.

## OpenAI Foreman

The browser calls:

```text
POST /api/foreman
```

The Pages Function in `functions/api/foreman.js` calls the OpenAI Responses API using the server-side `OPENAI_API_KEY`.

## Security baseline

- Never store `OPENAI_API_KEY` in GitHub source.
- Never put it in `index.html`, JavaScript, localStorage, or screenshots.
- Protect `main` and require PR review/checks before production deployment.
- Use Cloudflare deployment credentials with minimum required permissions.
- Add rate limiting/WAF rules to `/api/foreman` before public production use.

## Recommended Cloudflare protections

After the first deployment:

- enable HTTPS-only access;
- enable standard managed WAF rules where available;
- add rate limiting for `/api/foreman`;
- block obvious automated abuse;
- configure cache rules so `/api/*` is never cached;
- keep static assets cacheable;
- use a custom MFA domain later if desired.

No production DNS/domain change is required until the Cloudflare preview has been tested and approved.
