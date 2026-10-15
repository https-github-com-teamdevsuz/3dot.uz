# 00 · Request

Date: 2026-10-15
Feature id: 2026-10-telegram-lead-format

## Raw request (uz)
"Lidlar telegram bot orqali guruhga yuborilishi kerak, shu qismni bajar, bot token hamda guruh ID larni env ga joylashtiramiz, hamda guruhga yuboruvchi xabar ko'rinishi ham tahlil qilib aniq chiroyli ko'rinishda yuborishingni talab qilaman. Undan oldin git pull olishing kerak."

## Translation
Leads must be sent to a Telegram group through a bot. Do that part. Bot token and group id go into env. Analyse the message that is sent to the group and send it in a clear, well-formatted layout. Pull from git first.

## Current state (found before phase 01)
- `git pull` done (b7db075: hq knowledge base).
- Lead relay already exists: `app/composables/useLead.ts` → `workers/lead-relay/worker.js` (Cloudflare Worker) → Telegram `sendMessage`.
- Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` via `wrangler secret put`; local `.dev.vars` (`workers/lead-relay/.dev.vars.example`).
- Message today: plain text, English labels, no parse_mode, no timestamp, contact not clickable.
- Worker not deployed yet (hq/02-holat.md: go-live blocker).
