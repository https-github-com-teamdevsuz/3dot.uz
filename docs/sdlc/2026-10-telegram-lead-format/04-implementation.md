# 04 · Implementation: Telegram lead message format and env docs

Feature: 2026-10-telegram-lead-format. Owner: devops-engineer. Scope: `workers/lead-relay/**` and root `.env.example` only. No `app/**` change.

## Files changed
- `workers/lead-relay/worker.js`: `escapeHtml`, `formatPhone`, exported `formatLead(f, now)` → `{text, reply_markup?}`. `sendMessage` body uses `chat_id` as the raw env string, `parse_mode: 'HTML'`, `disable_web_page_preview: true`. `Date.now()` called once in `fetch`, passed to `rateLimited` and `formatLead`. No imports, no new files.
- `workers/lead-relay/test.mjs`: valid-lead case updated (HTML, chat id `-1001234567890`, escaped `Hi &lt;b&gt;`); 9 new `formatLead` cases with a fixed `now`. Existing CORS, 405, 413, 429, 502, honeypot and no-Origin cases unchanged.
- `workers/lead-relay/README.md`: "Telegram guruhga ulash" checklist, env table (local vs `wrangler secret put`), HTML format note, rendered example, smoke test with `@threedot_test`, updated contract.
- `workers/lead-relay/.dev.vars.example`: one comment line per variable, values empty.
- `.env.example` (root): comment block saying the Telegram token and group id are not set here, pointing to the worker README. `NUXT_PUBLIC_LEAD_ENDPOINT` line unchanged.

## How each AC is met
- AC-1: exact full-text assertion (`full uz lead -> exact text`) against Example 1 of the design spec.
- AC-2: empty budget, message and page drop their lines; minimal ru case asserts `doesNotMatch` on `Byudjet|Xabar|Sahifa`. Blank line only appears before `Xabar`.
- AC-3: wording per gate/design spec, `O‘zbek` / `Русский` / `English` + ` — shu tilda javob bering`. Test asserts all three. (Spec AC-3 variant `O‘zbekcha — javob shu tilda` overridden as instructed.)
- Apostrophe fix: Uzbek strings use U+2018 (‘) like app/data/site.uz.ts (O‘zbek, so‘rov, Do‘konlar, tarmog‘i); test fixtures and README example updated; 25/25 re-run.
- AC-4: `formatPhone` covered via the `Aloqa:` line for 3 phone forms plus 3 passthrough values.
- AC-5: `@ali_dev` → `reply_markup` deep-equal to one button `Telegramda yozish` → `https://t.me/ali_dev`. `@test`, email, phone → key absent.
- AC-6: `now = Date.UTC(2026,9,15,9,32)` gives `15.10.2026, 14:32 (Toshkent)` as last line. Fixed UTC+5 via offset arithmetic (ADR-2), no `Intl`.
- AC-7: `<b>x</b> & *y*` → `&lt;b&gt;x&lt;/b&gt; &amp; *y*`; no `\p{Extended_Pictographic}`, no `!`.
- AC-8: `chat_id` equals `'-1001234567890'` string; `disable_web_page_preview` true; text built only from the 6 validated fields.
- AC-9: all 16 original cases kept, valid-lead assertions updated to new labels. Total 25 cases.
- AC-10: README checklist covers BotFather, add bot, send permission, privacy mode or admin, `getUpdates` → `chat.id`, negative and `-100` ids, supergroup upgrade re-put, smoke test.
- AC-11: `.dev.vars.example` comments per variable; README local = `.dev.vars` (git-ignored), prod = `npx wrangler secret put` ×2; root `.env.example` comment block.
- AC-12: names unchanged; `useLead.ts`, `nuxt.config.ts`, validation and status codes untouched. `git diff --name-only` shows only the 5 owned files.

## Test output summary
- `node workers/lead-relay/test.mjs`: `25/25 passed`, exit 0. (Stderr lines `telegram: HTTP 400` / `network error` are the intended 502 log lines.)
- `npm run typecheck`: exit 0.
- `git check-ignore workers/lead-relay/.dev.vars`: prints `workers/lead-relay/.dev.vars` (ignored).
- `git diff --name-only`: `.env.example`, `workers/lead-relay/.dev.vars.example`, `workers/lead-relay/README.md`, `workers/lead-relay/test.mjs`, `workers/lead-relay/worker.js`.

## Skipped / not done
- `npx wrangler deploy --dry-run`: skipped. Wrangler is not installed in `workers/lead-relay` and `npx` asked to fetch `wrangler@4.151.0`, which was not approved. ADR-1 named-export check is therefore not verified by wrangler; the module loads under plain Node (`default` and `formatLead` exported).
- No deploy, no `wrangler login`, no real Telegram call.
- `ci.yml` not touched (already runs `test.mjs`; outside owned files).
- Linguist review of the fixed Uzbek strings: not run (optional in architecture; no file edits).

## Open items for the owner
- Real `@threedot_test` handle or a test account must exist for the smoke test to be meaningful. The button only links; the message sends regardless.
- Telegram group id must be set via `wrangler secret put` before first deploy.
