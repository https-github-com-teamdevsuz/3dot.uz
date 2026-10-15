# 02 · Architecture — Telegram lead message format and env docs

> Owner: solution-architect (opus). Inputs: 01-requirements.md + gate decision (HTML, bold labels, escape `& < >`).

## Overview
Worker-only change. `worker.js` gets three small pure functions and one changed `sendMessage` body. No new files, no deps, no `app/**` change. SSR/client boundaries, WebGL and site perf budgets: not affected.

## Files and owners
| File | Change | Owner |
|---|---|---|
| `workers/lead-relay/worker.js` | add `escapeHtml`, `formatPhone`, `formatLead`; new payload | devops-engineer |
| `workers/lead-relay/test.mjs` | new/updated cases (below) | devops-engineer |
| `workers/lead-relay/README.md` | group checklist, env section, "HTML parse_mode" note | devops-engineer |
| `workers/lead-relay/.dev.vars.example` | comment per variable, empty values | devops-engineer |
| `.env.example` (root) | comment block pointing to the worker README | devops-engineer |
`wrangler.toml`, `ci.yml` (already runs `node workers/lead-relay/test.mjs`), `.gitignore` (already has `.dev.vars`): unchanged.

## worker.js functions (module scope, above `export default`)
- `escapeHtml(s)` — `s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`. `&` first. Quotes not needed (no attributes in our markup).
- `formatPhone(c)` — `const d = c.replace(/[\s()-]/g, '')`; if `/^\+?998\d{9}$/.test(d)` return `'+998' + d.slice(-9)`, else return `c` unchanged (AC-4).
- `formatLead(f, now)` → `{ text, reply_markup? }`. `f` is the already-cleaned/validated object; `now` is epoch ms.
  - Lines, `<b>label</b>` + escaped value, empty optional fields dropped with the existing `.filter(Boolean)`:
    `<b>Yangi so'rov: bepul audit</b>`, `<b>Ism:</b> …`, `<b>Aloqa:</b> escapeHtml(formatPhone(contact))`, `<b>Byudjet:</b> …`, `<b>Til:</b> ${LANG[f.locale]} — javob shu tilda`, `''` (only if message), `<b>Xabar:</b> …`, `—`, `<b>Sahifa:</b> …`, `<b>Vaqt:</b> ${time} (Toshkent)`.
  - Every user field (name, contact, budget, message, page) goes through `escapeHtml`; fixed strings do not.
  - `LANG = { uz: "O'zbekcha", ru: 'Русский', en: 'English' }` — replaces nothing, `LOCALES` stays for validation.
  - `time`: `const t = new Date(now + 5 * 3600e3).toISOString()` → `${t.slice(8,10)}.${t.slice(5,7)}.${t.slice(0,4)}, ${t.slice(11,16)}` (see ADR-2).
  - `reply_markup` only if `/^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(f.contact)`: `{ inline_keyboard: [[{ text: 'Telegramda yozish', url: 'https://t.me/' + f.contact.slice(1) }]] }`. Otherwise the key is absent (not `null`).
- Export: `export { formatLead }` as a named export next to `export default` so `test.mjs` imports it directly.

## Time injection (ADR-1)
In `fetch`, take `const now = Date.now()` once, pass it to `rateLimited(ip, now)` (already takes `now`) and `formatLead(f, now)`. Tests pin time by calling `formatLead(f, Date.UTC(2026, 9, 15, 9, 32))` — no global `Date` mock, no hook in `fetch`.

## sendMessage payload
```js
body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, ...formatLead(f, now), parse_mode: 'HTML', disable_web_page_preview: true })
```
`chat_id` passed as the raw string (keeps `-100…`). Logging stays status-only. Validation, status codes, CORS untouched.

## Env contract
- `TELEGRAM_BOT_TOKEN` — BotFather token, secret. `TELEGRAM_CHAT_ID` — group id, negative; supergroup ids start with `-100`. Names unchanged.
- Local: `workers/lead-relay/.dev.vars` (copied from `.dev.vars.example`, git-ignored). Prod: `npx wrangler secret put TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` in `workers/lead-relay`. Never in `wrangler.toml`.
- Root `.env.example`: comment block "Telegram bot token and group id are NOT set here — they never go into the Nuxt `.env` or the static output. See `workers/lead-relay/README.md`." `NUXT_PUBLIC_LEAD_ENDPOINT` line untouched.

## test.mjs changes
- `import worker, { formatLead } from './worker.js'`; `env.TELEGRAM_CHAT_ID` → `'-1001234567890'`.
- Replace "valid lead … plain text": assert `parse_mode === 'HTML'`, `disable_web_page_preview === true`, `chat_id === '-1001234567890'`, text contains `<b>Ism:</b> Ali`, input `Hi <b>` arrives as `Hi &lt;b&gt;`.
- New (pure `formatLead`, fixed `now`): exact full-text match (AC-1, AC-6 `15.10.2026, 14:32`); empty budget/message/page → no such label and no blank line (AC-2); `Til:` per locale (AC-3); phone table incl. passthrough cases (AC-4); `@ali_dev` → button, `ali@mail.uz` / phone → no `reply_markup` key (AC-5); `<b>x</b> & *y*` → `&lt;b&gt;x&lt;/b&gt; &amp; *y*`, no emoji, no `!` (AC-7).
- All CORS/413/429/502/honeypot/no-Origin cases unchanged (AC-9).

## ADRs
### ADR-1: inject `now` as a parameter
- Context: AC-6 suggested mocking `Date`. Global mocks leak across cases and also skew the rate limiter.
- Decision: `formatLead(f, now)` is pure; `fetch` passes one `Date.now()`; tests call `formatLead` directly.
- Consequences: one named export on the worker module. Verify `npx wrangler deploy --dry-run` accepts it; if not, move it to `export default { fetch, formatLead }`.
### ADR-2: fixed UTC+5 instead of `Intl.DateTimeFormat('Asia/Tashkent')`
- Context: Uzbekistan has no DST; `Intl` output separators vary by ICU build/locale.
- Decision: offset arithmetic + `toISOString()` slicing. Same output as AC-6, deterministic everywhere.
- Consequences: `// ponytail: fixed UTC+5, switch to Intl timeZone 'Asia/Tashkent' if Uzbekistan ever adopts DST.`
### ADR-3: HTML parse_mode (gate decision), escaping at the formatter
- Decision: escape every user field once inside `formatLead`; labels are the only markup. No new dependency (bundle impact 0).
- Consequences: Telegram counts length after entity parsing, so escaping does not push the 2 KB-bounded lead past 4096 chars.

## Risks
Unescaped field added later → Telegram 400 → 502, lead lost (mitigated by the AC-7 test). Odd usernames get no button (text still sent). Group upgrade changes the id → README checklist.

## Task breakdown
devops-engineer (sole owner, sequential): 1) worker.js functions + payload; 2) test.mjs, `node workers/lead-relay/test.mjs` exits 0; 3) README checklist/env/contract line; 4) `.dev.vars.example` comments; 5) root `.env.example` block; 6) `git diff --name-only` shows only `workers/lead-relay/**` and `.env.example`. linguist: optional review of fixed Uzbek strings, no file edits.
