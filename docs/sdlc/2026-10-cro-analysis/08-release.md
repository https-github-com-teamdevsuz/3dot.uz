# 08 · Release — CRO: from showcase to lead machine

> Owner: devops-engineer (haiku) · Status: ready for owner steps. Nothing is deployed or pushed.

- **Version:** 0.4.0 proposed (feat, minor). **Not bumped yet:** `package.json` is outside this task's ownership. The orchestrator or release owner bumps it when the feature merges.
- **CI run:** not run (no push). Local checks on this branch:
  - `npm run agents:check`: pass (14 agents, 7 phases).
  - `node workers/lead-relay/test.mjs`: 16/16 pass (loop 1 added 5 cases: Telegram unreachable → 502, no Origin, `Origin: null` → 403, no ACAO on 403, ACAO on 400/413/429).
  - Telegram leak regex, now `bot[0-9]{6,}:|[0-9]{8,10}:[A-Za-z0-9_-]{30,}|api\.telegram\.org` in both ci.yml and deploy.yml: a planted bare token and a planted `api.telegram.org` URL both match. Run against the current `.output/public` (76 files, index plus 6 project pages, written 14:24): no match.
  - `ci.yml` and `deploy.yml` were checked by eye only (no YAML parser installed; no ruby or PyYAML either). A push will confirm they parse.
  - Gates in order: `agents:check` → relay self-check → `typecheck` → `generate` → leak check → Playwright e2e → deploy (main only, behind the `github-pages` environment reviewer).
- **Deploy target / URL:** GitHub Pages, environment `github-pages`, custom domain `https://3dot.uz` (assumed; confirm in Pages settings). Manual alternative: `npm run generate`, then upload `.output/public` with the Pages action.
- **Relay (Worker) target:** Cloudflare Workers `lead-relay`, URL `https://lead-relay.<subdomain>.workers.dev` (filled in after the owner runs `wrangler deploy`). Deploy command: `cd workers/lead-relay && npx wrangler deploy`.
- **Env vars and secrets:**

| Name | Where | Used by | Notes |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Worker secret (`wrangler secret put`) | `worker.js` | From BotFather. Never in the repo or the static output |
| `TELEGRAM_CHAT_ID` | Worker secret | `worker.js` | Chat id, negative for groups |
| `ALLOWED_ORIGIN` | Worker var in `wrangler.toml` | `worker.js` | `https://3dot.uz`. Comma list allowed |
| `LEAD_ENDPOINT` | GitHub repo **variable** (not secret) | `deploy.yml` generate step → `NUXT_PUBLIC_LEAD_ENDPOINT` | Public relay URL. Baked in at generate time |
| `NUXT_PUBLIC_LEAD_ENDPOINT` | Root `.env` locally (from `.env.example`) | `nuxt generate` | For local builds only |

## Release checklist

**Automated (gates, on push or PR to main)**
- [ ] `agents:check` passes
- [ ] relay self-check passes (`node workers/lead-relay/test.mjs`)
- [ ] typecheck passes
- [ ] `generate` passes, and prerenders `/`, `/en` and all six `/projects/*` (check `.output/public/projects/*.html`)
- [ ] leak check passes (no `bot<digits>:`, no bare `<8-10 digits>:<30+ token chars>`, no `api.telegram.org` in `.output/public`)
- [ ] Playwright e2e passes (desktop, mobile, reduced motion)

**Owner steps (manual, once)**
- [ ] 1. In Telegram, message `@BotFather`, send `/newbot`, keep the token.
- [ ] 2. Get the chat id: message the bot (or post in a group where the bot is a member), then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `message.chat.id`.
- [ ] 3. Deploy the relay:
  ```sh
  cd workers/lead-relay
  npx wrangler login
  npx wrangler secret put TELEGRAM_BOT_TOKEN
  npx wrangler secret put TELEGRAM_CHAT_ID
  npx wrangler deploy
  ```
  Save the printed URL.
- [ ] 4. Smoke test the relay (curl in `workers/lead-relay/README.md`). Expect 204 and a message in the chat. Delete the test message.
- [ ] 5. Set the repo variable: GitHub, Settings, Secrets and variables, Actions, Variables, `LEAD_ENDPOINT` = the worker URL. Or `gh variable set LEAD_ENDPOINT --body "https://<worker-url>"`.
- [ ] 6. Pages settings: Settings, Pages, Source = GitHub Actions. Custom domain `3dot.uz`, enforce HTTPS. Environment `github-pages`: add **Required reviewers** (this is the human-approval gate).
- [ ] 7. Re-run the Deploy workflow (`workflow_dispatch`) after step 5, so the endpoint is baked into the build.
- [ ] 8. Live check: submit the form on `https://3dot.uz`. Expect the success view and the message in Telegram. Also check that `curl https://3dot.uz/_nuxt/...` does not expose the endpoint's secrets (it has none; only the public URL).
- [ ] 9. Confirm the Telegram fallback link works on a forced error (for example, an empty `LEAD_ENDPOINT` rebuild, or a blocked network).
- [ ] 9a. Deploy log: a `LEAD_ENDPOINT unset` warning means the form will show the error state. Clear it before go-live.

## Changelog draft (0.4.0)

**Added**
- Lead form: the contact modal sends leads to a Telegram chat through a Cloudflare Worker relay. The bot token stays server-side.
- Honeypot field and rate limit (5 per IP per 10 minutes) on the relay.
- One offer CTA (`ui.cta.label`) shared by the header, hero, Projects, Process, FAQ and case pages.
- Pricing anchors (free audit, project from price) in the FAQ section, with `#pricing` in the nav.
- NDA badge on case cards.

**Changed**
- Page reduced from 9 to 7 sections (Stats and Expertise removed). The hero has no numbers; the Intro section is the only numbers block.
- Budget is no longer preselected and can be cleared. Form error and throttle states, with the Telegram fallback.
- SEO title, description and OfferCatalog name updated for the CRM/ERP audit offer.

**Removed**
- Stats and Expertise sections, the clients marquee and the hero awards.

**Infrastructure**
- CI runs the relay self-check, and fails if a Telegram token or API host reaches `.output/public`. The same check runs in deploy.
- Deploy passes `NUXT_PUBLIC_LEAD_ENDPOINT` from the `LEAD_ENDPOINT` repo variable.

## Rollback

**Site (GitHub Pages)**
1. Find the last good commit on `main`.
2. Revert: `git revert <bad-sha>` and push. Or check out the last good commit and re-run the Deploy workflow (`workflow_dispatch`).
3. Pages keeps the previous artifact live until the new deploy finishes. Check the live site after.

**Relay (Cloudflare Worker)**
1. `cd workers/lead-relay && npx wrangler deployments list`.
2. `npx wrangler rollback <version-id>`.
3. Last resort: `npx wrangler delete` (the site then shows the error state and the Telegram fallback link, so leads are not lost). Then unset `LEAD_ENDPOINT`.

**Endpoint change:** set `LEAD_ENDPOINT` back and re-run Deploy. The endpoint is build-time, so the site needs a re-generate.

**Secret leak:** rotate in BotFather (`/revoke`, then a new token), `npx wrangler secret put TELEGRAM_BOT_TOKEN`, and check the chat for spam.

## Open items

1. **Go-live blocker (R5):** until `LEAD_ENDPOINT` is set and step 8 passes, every lead fails and users see the Telegram fallback. Do not announce the form before then.
2. **Version bump:** `package.json` stays at 0.3.0 until the release owner bumps it to 0.4.0.
3. **Naming deviation from ADR-1:** the ADR's `.dev.vars` and Worker names are `BOT_TOKEN` and `CHAT_ID`. This implementation uses `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, as specified in the task. Update ADR-1 or accept the deviation.
4. **`.gitignore` not changed:** ADR-1 asks for `.dev.vars` in `.gitignore`. That file is outside this task's ownership. Without it, `workers/lead-relay/.dev.vars` could be committed by mistake. **Add it before the first local secret file is created.** `.env.*` already covers the root `.env`.
5. **Pipeline ownership:** add `workers/**` and root `.env.example` to `sdlc/pipeline.json → ownership.devops-engineer` (ADR note).
6. **Prerender not re-verified on this branch:** `generate` was not run here (frontend changes are still landing). The gate verifies it in CI.
7. **Rate limit is per isolate:** a determined sender can get past it. Upgrade path: the Workers Rate Limiting binding, or Turnstile.
8. **Relay has no spam filter beyond the honeypot and rate limit.** Add Turnstile if spam appears in the chat.
9. **`compatibility_date`** is `2025-09-01`. Bump it when you next touch the Worker, after checking the Wrangler warnings.
10. **Missing `Origin` (decided):** a POST without `Origin` is accepted, not 403. `Origin` is a browser CORS signal, not auth, and curl omits it. The honeypot and rate limit are the controls. Documented in `workers/lead-relay/README.md` and covered by a test. Revisit only if abuse comes from header-less clients.
11. **Unset endpoint warning:** `deploy.yml` emits `::warning::LEAD_ENDPOINT unset` before generate. It is a warning, not a failure, so the build still ships. Set the variable before go-live (item 1).
12. **Leak regex in CI:** checked locally only. The first push confirms the new bare-token pattern does not false-positive on the real build.
