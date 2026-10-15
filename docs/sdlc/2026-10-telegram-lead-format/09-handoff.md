# 09 · Handoff: 2026-10-telegram-lead-format

Date: 2026-10-15. Status: code done, **not deployed**. `package.json` stays 0.4.0.

## What shipped
- Lead relay sends HTML messages to the Telegram group: bold labels, escaped user input, fixed line order, empty fields omitted.
- `Til` line per locale, phone as `+998…`, `Telegramda yozish` button for `@username`, Tashkent time (UTC+5).
- Worker tests 25/25. Docs: worker README checklist and message format, `.env.example` and `.dev.vars.example` notes. No `app/**` change.

## Message layout
From `workers/lead-relay/README.md`:

```
Yangi so‘rov: bepul audit
Ism: Dilshod Karimov
Aloqa: dilshod@example.uz
Byudjet: $10–30k
Til: O‘zbek — shu tilda javob bering

Xabar: Do‘konlar tarmog‘i uchun CRM kerak, 1C bilan integratsiya.
—
Sahifa: Bosh sahifa
Vaqt: 15.10.2026, 14:32 (Toshkent)
```

## Env setup
- Local: `cp workers/lead-relay/.dev.vars.example workers/lead-relay/.dev.vars`, then set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
- Prod: `cd workers/lead-relay && npx wrangler secret put TELEGRAM_BOT_TOKEN` (same for `TELEGRAM_CHAT_ID`).

## Gate verdicts
- 01 / 02: approved by orchestrator (autonomous mode) with the HTML amendment. 02 has no separate verdict line.
- 05 review: APPROVED. No BLOCKER or MAJOR.
- 06 QA: PASS. E2E showed 22 timing flakes at full parallelism. All pass at `--workers=2`.
- 07 perf: PASS. Worker 5.9 KB. Site bundle unchanged.
- 08 release: deploy awaiting owner approval.

## Follow-ups
1. Owner deploys the worker per `08-release.md`. Run `npx wrangler deploy --dry-run` first (checks the named `formatLead` export).
2. Set `workers: 2` in `playwright.config` (e2e flakes at full parallelism).
3. Fallback `telegram` link (`app/data/site.ts`) is a placeholder per `00-strategy.md`. Confirm or replace before go-live.
4. Open questions in `hq/08-ochiq-savollar.md`: #2 admin account, #4 who answers leads and working hours, #12 where leads are tracked.
