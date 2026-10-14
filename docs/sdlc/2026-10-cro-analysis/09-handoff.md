# 09 · Handoff — 2026-10-cro-analysis (CRO: from showcase to lead machine)

Version 0.4.0 · 2026-10-14 · Owner: tech-writer · Status: ready for owner steps. Nothing is deployed or pushed.

## What shipped

- **Hero:** outcome headline "Excel o‘rniga — yagona tizim.", one CTA "Bepul audit olish", Telegram link beside it.
- **One offer:** every CTA reads `ui.cta.label` and opens the same modal. Section CTAs sit after Projects, Process, FAQ and on case pages.
- **Lead form:** sends for real through a Cloudflare Worker relay to Telegram.
- **Services:** 12 cards reduced to 4, each with an outcome line and bullets.
- **Sections:** 9 reduced to 7. Stats, Expertise, clients marquee and intro marquee removed. Scene presets `stats` and `expertise` removed.
- **Trust:** one numbers set (20+ tizim, 5 yil), marked placeholder. NDA badge on all six demo cases.
- **Price anchor:** "$1 500 dan boshlab" (placeholder) and "Audit — bepul, 1–2 kun". Block is `#pricing`.
- **Nav:** Xizmatlar · Loyihalar · Narxlar · Aloqa.
- **Copy and SEO:** ru/en by linguist. Titles and descriptions updated in `seo.{uz,ru,en}.ts`.
- **Agent:** `business-analyst` (opus) runs first in phase 01.
- **CI:** relay self-check, token leak check on `.output/public`, warning when `LEAD_ENDPOINT` is unset.

## How the lead flow works

1. The visitor fills name and contact (required). Budget and message are optional. Consent is required.
2. A filled honeypot shows the success view. No request is sent.
3. A second success within 30 s shows a "throttled" hint. No request is sent.
4. `useLead` sends one POST (`text/plain` JSON) to `NUXT_PUBLIC_LEAD_ENDPOINT`, with a 10 s timeout. Double submit is ignored.
5. The Worker rejects non-POST (405), bad Origin (403), body over 2 KB (413), bad fields (400) and more than 5 requests per IP per 10 min (429).
6. The Worker sends plain text to Telegram `sendMessage`, using secrets `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
7. Telegram accepts the message. The Worker returns 204 and the form shows success.
8. Any failure (non-2xx, network, timeout, unset endpoint) shows an alert, keeps the form filled and shows a Telegram link. There is no fake success.

## Gate verdicts

| Gate | Verdict |
|---|---|
| 00 strategy, 01 requirements | Approved by owner |
| 02 architecture, design | Approved by owner |
| 03 implementation | Typecheck pass (exit 0) |
| 04 review (`05-review.md`) | CHANGES_REQUESTED in loop 1 (4 MAJOR, 9 MINOR, 5 NIT). APPROVE in loop 2, all fixed |
| 05 testing (`06-test-report.md`) | QA PASS. 195 passed, 5 skipped, 1 flaky (passes alone) |
| 05 performance (`07-performance.md`) | PERF: PASS (07-performance.md: LCP desktop 124–280 ms, mobile 4× ≤ 408 ms, CLS 0 on load and scroll, initial JS ≤ 149 KB gz) |
| 06 release (`08-release.md`) | Ready for owner steps. CI not run yet |

## Owner to-do before go-live

1. Create the bot in BotFather (`/newbot`). Keep the token.
2. Get the chat id from `https://api.telegram.org/bot<TOKEN>/getUpdates` after you message the bot.
3. Deploy the relay:
   ```sh
   cd workers/lead-relay
   npx wrangler login
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   npx wrangler deploy
   ```
   Smoke test with the curl examples in `workers/lead-relay/README.md`.
4. Set the repo variable `LEAD_ENDPOINT` to the Worker URL. Re-run Deploy.
5. Replace the placeholder phone, e-mail and Telegram handle in `app/data/site.ts`.
6. Confirm the numbers 20+ and 5 yil (`statsBase`), or replace them.
7. Confirm the price `$1 500` (`priceFrom`) and the 1–2 day audit promise.
8. Get legal approval for the consent text (`ui.modal.consent`) and confirm the reply promise "1 ish kuni ichida".
9. Decide which cases can be shown. All six have `nda: true`. Remove the flag only for work you may show. Client names are never shown.
10. Live check: submit a test lead on https://3dot.uz and confirm the Telegram message. Delete the test message.

## Known limitations and follow-ups

- **Flaky test:** `i18n-theme.spec.ts:199` (mobile pills) fails under full-suite load and passes alone. `i18n-theme.spec.ts:66` failed once under load. Isolate or extend these tests.
- **Timeout not in e2e:** the 10 s timeout path is not covered by Playwright. Abort was used instead. Covered only by the manual review.
- **CLS at the Projects pin:** scroll CLS is not measured yet. The performance audit (07) covers it.
- **Missing Origin:** the relay accepts a POST with no `Origin` header. This is a decision, not a bug. Revisit if header-less abuse appears.
- **Rate limit is per isolate:** it is an in-memory map. Upgrade with the Workers Rate Limiting binding or Turnstile.
- **Spam:** the only controls are the honeypot, the rate limit and the size limit.
- **Unverified in CI:** `ci.yml` and `deploy.yml` were checked by eye only. The first push confirms they parse, and the new bare-token leak regex does not false-positive.
- **Env names:** the code uses `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. ADR-1 says `BOT_TOKEN` and `CHAT_ID`. The ADR is not updated.
- **Consent:** the checkbox stays (ADR-5). This differs from the US-4 wording, which asked to remove it.
- **Analytics events (US-15):** out of scope.
- **Worker `compatibility_date`:** `2025-09-01`. Bump it on the next Worker change.
- **Stale items in `08-release.md`:** items 2, 4 and 5 are already done. `package.json` is at 0.4.0. `.dev.vars` is in `.gitignore`. `sdlc/pipeline.json` already lists `workers/**` and `.env.example`.

## How to edit

- **Copy:** `app/data/site.{uz,ru,en}.ts`. Shared data (numbers, price, NDA flags, contacts) is in `app/data/site.ts`.
- **CTA label:** `ui.cta.label`. Change it in all three locale files.
- **Section CTA:** `app/components/ui/SectionCta.vue`. Place it where the section ends.
- **Lead endpoint:** `NUXT_PUBLIC_LEAD_ENDPOINT` (local `.env`) or repo variable `LEAD_ENDPOINT` (deploy). Changing it needs a re-generate.
- **Placeholder view:** `NUXT_PUBLIC_SHOW_PLACEHOLDERS=1 npm run dev` outlines placeholder values.
- Full guide: `README.md` (Uzbek).
