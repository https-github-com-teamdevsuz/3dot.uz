# 01 · Requirements: Telegram lead message format and env docs

Feature: 2026-10-telegram-lead-format. Inputs: 00-request.md, 00-strategy.md (P1-1..P1-3, P2-4, P2-5).

## Problem and goal
The lead relay already forwards leads to Telegram, but the message is English, has a weak first line, no timestamp, no full reply-language name, and the contact is clickable only by luck. The group setup (bot, `-100...` id) is undocumented, so a misconfig silently returns 502. Goal: a Uzbek, fixed-order, plain-text message that a salesperson can act on from the push notification, plus clear env and group docs. Audience: the staff member who answers leads (phone, push notification) and the owner who deploys.

## Decision: plain text, no parse_mode
Chosen: plain text. Reasons: ADR-2 and the existing test (`parse_mode === undefined`) keep user input unable to break formatting; HTML would add escaping code and a failure mode (Telegram returns 400 on bad markup, so a lead is lost) for bold labels only. Structure comes from line order, a blank line before the message block, and a `—` separator. Rejected: `parse_mode: "HTML"` with escaping of `&`, `<`, `>`. Revisit only if the owner says plain text is not "beautiful" enough (open question 1).

## User stories
- US-1: As a lead handler, I want a fixed Uzbek layout with the key facts first, so that I can judge the lead from the push notification.
- US-2: As a lead handler, I want a phone or Telegram contact I can tap, so that I can call or write in one step.
- US-3: As a lead handler, I want the reply language named in full and the Tashkent send time, so that I answer in the right language and can check the "1 ish kuni" promise.
- US-4: As the owner, I want a checklist and env docs for the group, so that leads are not lost to a wrong id or a bot without rights.

## Acceptance criteria (worker.js, test.mjs)
- AC-1: Given a valid lead with all fields, when forwarded, then `text` lines are exactly in this order: `Yangi so'rov: bepul audit`, `Ism: <name>`, `Aloqa: <contact>`, `Byudjet: <budget>`, `Til: <language>`, blank line, `Xabar: <message>`, `—`, `Sahifa: <page>`, `Vaqt: <time>`. Verified by an exact-match assertion in `test.mjs`.
- AC-2: Given empty budget, message or page, then no line with that label appears (assert `doesNotMatch`). Name, contact, language and time are always present.
- AC-3: Given locale `uz`/`ru`/`en`, then the `Til:` line is `Til: O'zbekcha — javob shu tilda`, `Til: Русский — javob shu tilda`, `Til: English — javob shu tilda`. Labels stay Uzbek whatever the locale.
- AC-4: Given contact `998901234567`, `+998 90 123-45-67` or `+998(90)1234567`, then the `Aloqa:` value is `+998901234567`. Given any other contact (`90 123 45 67`, `ali@mail.uz`, `@ali_dev`, free text), then the value is the unchanged trimmed input.
- AC-5: Given contact matching `^@[A-Za-z][A-Za-z0-9_]{4,31}$`, then the sendMessage body has `reply_markup.inline_keyboard` with one button, text `Telegramda yozish`, url `https://t.me/<username without @>`. Given any other contact, then `reply_markup` is absent.
- AC-6: Given a fixed clock (test mocks `Date.now`/`Date`) of 2026-10-15T09:32:00Z, then the last line is `Vaqt: 15.10.2026, 14:32 (Toshkent)` (UTC+5, `Intl.DateTimeFormat` with `Asia/Tashkent`, 24-hour, zero-padded).
- AC-7: Given user input containing `<b>x</b> & *y* _z_`, then it appears byte-for-byte in `text`, and `parse_mode` is undefined. The text contains no emoji (regex `\p{Extended_Pictographic}` has no match) and no `!`.
- AC-8: `text` never contains the honeypot value, IP, or user-agent. `chat_id` equals `env.TELEGRAM_CHAT_ID` as given (string, `-100...` preserved) and `disable_web_page_preview` stays true.
- AC-9: All existing `test.mjs` cases (CORS, 413, 429, 502, honeypot, no-Origin) still pass; the old `Name:`/`Budget:` assertions are updated to the new labels. `node workers/lead-relay/test.mjs` exits 0.
- AC-10: README has a "Telegram group checklist" with: create bot in BotFather; add the bot to the group; allow it to send messages (admin not required unless the group restricts it); post a message and read `chat.id` from `getUpdates`; id is negative and, for a supergroup, starts with `-100`; if the group is upgraded the id changes and the secret must be re-put; run the smoke test and confirm the message and the button. Verified by grep for each item.
- AC-11: Env docs. `.dev.vars.example` has a comment above each variable: `TELEGRAM_BOT_TOKEN` (BotFather token, secret) and `TELEGRAM_CHAT_ID` (group id, negative, `-100...`), with empty values. README states: local = `workers/lead-relay/.dev.vars` (git-ignored), prod = `npx wrangler secret put TELEGRAM_BOT_TOKEN` and `... TELEGRAM_CHAT_ID`. Root `.env.example` gets a comment block saying the Telegram token and group id are NOT set here (they never go in the Nuxt `.env` or the static output) and pointing to `workers/lead-relay/README.md`. `NUXT_PUBLIC_LEAD_ENDPOINT` line is unchanged. `git check-ignore workers/lead-relay/.dev.vars` returns the path.
- AC-12: Env variable names are unchanged; no change to `useLead.ts`, `nuxt.config.ts`, request validation or status codes. `git diff --name-only` shows only `workers/lead-relay/**` and `.env.example`.

## Non-functional
- Performance: worker adds no imports and no dependency; formatting is synchronous, no extra network call. Site budgets in `sdlc/pipeline.json` are unaffected (no client change).
- Security/privacy: token never logged (keep status-only logs); minimal personal data per AC-8.
- Accessibility, SEO, `prefers-reduced-motion`: not applicable (no UI). i18n: message labels are Uzbek Latin by design; reply-language names are fixed strings in the worker.
- Tests run with `node workers/lead-relay/test.mjs`, no network, no Playwright.

## Out of scope
Client changes (`useLead.ts`, byudjet label from `site.uz.ts`), UTM/referrer `Manba:` line, lead statuses and "Oldim" button, topics (`message_thread_id`), lead numbering, `/projects/...` page prettifying (P3-7), HTML formatting, Turnstile, deploying the worker.

## Open questions for the human
1. Is plain text enough, or do you want bold labels (switches to `parse_mode: "HTML"` plus escaping)?
2. Who answers leads and during which hours (hq/08, q4)? Needed to decide whether the group needs an owner mention.
3. Where are leads tracked after the group (hq/08, q12)?
4. Confirm the `Yangi so'rov: bepul audit` wording and "Toshkent" in the timestamp.
5. Is the fallback `telegram` link still a placeholder? It must be real before go-live.

## Risks
Telegram only auto-links phones with a `+` prefix, so non-`998` numbers stay plain text. Username regex may reject odd handles (no button, text still sent). Group-to-supergroup upgrade changes the id and silently breaks delivery until the secret is updated.

---
## Gate decision (orchestrator, 2026-10-15)
Approved with one amendment: use `parse_mode: "HTML"` with **bold labels**, escaping `&`, `<`, `>` in every user-supplied field. Reason: the request explicitly asks for a clear, good-looking message; escaping makes invalid markup impossible, so the "lead lost to bad markup" risk does not apply. AC-7 becomes: user input `<b>x</b> & *y*` is shown literally. Line order, omission of empty fields, inline button, timestamp and env docs unchanged.
Note (post-review): AC-1/AC-3 literal strings are superseded by 03-design-spec.md and the linguist: `Yangi so‘rov: bepul audit`, `O‘zbek — shu tilda javob bering` (U+2018 apostrophe).
