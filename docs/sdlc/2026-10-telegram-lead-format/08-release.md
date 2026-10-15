# 08 · Release: 2026-10-telegram-lead-format

**Status: NOT DEPLOYED. Awaiting owner approval. Nothing committed.**

## Version
- `package.json` stays `0.4.0`. Proposed `0.5.0` (feat → minor), not applied: this release changes the worker only, so the bump is the owner's call at tag time.

## Changelog (draft)
- feat(lead-relay): Telegram messages use HTML. Labels are bold, user input is escaped.
- feat(lead-relay): fixed line order, empty budget/message/page lines omitted, `Til` line per locale.
- feat(lead-relay): phone normalised to `+998…`, `Telegramda yozish` button for `@username` contacts.
- feat(lead-relay): timestamp in Tashkent time (UTC+5).
- docs: worker README checklist (BotFather, group id, `-100` upgrade trap), root `.env.example` note.

## What changed
- Worker only: `workers/lead-relay/{worker.js,test.mjs,README.md,.dev.vars.example}`, root `.env.example`.
- No site bundle change: no `app/**`, `nuxt.config.ts` or `public/**` file touched. Site output is identical to 0.4.0.

## CI gates (already cover it, no ci.yml edit)
- `agents:check` → `node workers/lead-relay/test.mjs` → `typecheck` → `generate` → static-output secret grep → e2e.
- The secret grep (ci.yml and deploy.yml) covers `bot<digits>:`, `<digits>:<token>` and `api.telegram.org` in `.output/public`.
- Local run (06): test.mjs 25/25, typecheck exit 0, generate OK (44 routes), secret grep clean. E2E 22 timing flakes on full parallelism; all passed on re-run with `--workers=2`.
- No GitHub Actions run exists yet for this change (no push).

## Deploy target
- Worker: `https://lead-relay.<subdomain>.workers.dev/lead` (not yet created).
- Site: GitHub Pages via `deploy.yml`, behind the `github-pages` environment approval.
- Env: `TELEGRAM_BOT_TOKEN` (secret), `TELEGRAM_CHAT_ID` (secret, `-100…` for supergroups), `ALLOWED_ORIGIN` (`wrangler.toml` `[vars]`, `https://3dot.uz`), repo variable `LEAD_ENDPOINT` (worker URL). No secret is committed.

## Go-live runbook (owner, in order)
1. Telegram: BotFather `/newbot`, keep token. Add bot to group, allow posting, `/setprivacy` Disable. Post `test` in the group. Open `https://api.telegram.org/bot<TOKEN>/getUpdates`, copy `message.chat.id` (negative).
2. `cd workers/lead-relay`
   - `npx wrangler login`
   - `npx wrangler secret put TELEGRAM_BOT_TOKEN`
   - `npx wrangler secret put TELEGRAM_CHAT_ID`
   - `npx wrangler deploy --dry-run` (checks the named `formatLead` export; skipped in 04, must pass first)
   - `npx wrangler deploy` (prints the worker URL)
3. GitHub repo, Settings → Secrets and variables → Actions → Variables: `LEAD_ENDPOINT` = `https://lead-relay.<subdomain>.workers.dev/lead`. Or `gh variable set LEAD_ENDPOINT --body "https://…/lead"`.
4. Actions → Deploy → Run workflow (the endpoint is baked in at generate time). Approve the `github-pages` gate.
5. Smoke test (use a handle you control; `@threedot_test` is a placeholder):
   `curl -i -X POST "https://lead-relay.<subdomain>.workers.dev/lead" -H "Origin: https://3dot.uz" -H "Content-Type: text/plain" -d '{"name":"Test","contact":"@yourhandle","locale":"uz","page":"/"}'`
   Expect `HTTP/2 204`. The group shows, in bold labels:
   `Yangi so‘rov: …` / `Ism: Test` / `Aloqa: @yourhandle` / `Til: O‘zbek — shu tilda javob bering` / `Sahifa: /` / `Vaqt: DD.MM.YYYY, HH:mm (Toshkent)` with a `Telegramda yozish` button. Delete the test message.
   On 502: `npx wrangler tail`, look for `telegram: HTTP <code>` (400 = wrong or upgraded chat id, 401 = wrong token, 403 = bot not in group).
6. Rollback (worker): `cd workers/lead-relay`, `npx wrangler deployments list`, `npx wrangler rollback <version-id>`.
   Rollback (site endpoint): clear repo variable `LEAD_ENDPOINT` and re-run Deploy; the form then shows its error state.

## Open items
- Test gap (non-blocking, 05 MINOR): no assertion that `text` omits honeypot/IP/UA. Add before or after deploy.
