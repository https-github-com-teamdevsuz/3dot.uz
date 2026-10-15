# 06 Test report: 2026-10-telegram-lead-format

Scope: workers/lead-relay/** and .env.example only. No UI change, no new e2e tests.

## Worker unit tests
`node workers/lead-relay/test.mjs` -> 25/25 passed, exit 0.

## Traceability (AC literals follow the superseding note: HTML bold, U+2018 apostrophe)
| AC | Test (test.mjs) | Result |
|---|---|---|
| AC-1 line order | full uz lead -> exact text | PASS |
| AC-2 empty fields omitted | minimal ru lead -> exact text, no budget/message/page | PASS |
| AC-3 language line | language line per locale | PASS |
| AC-4 phone normalisation | contact normalisation | PASS |
| AC-5 Telegram button | @username -> one button; @test/email/phone -> no reply_markup | PASS |
| AC-6 Tashkent timestamp | full uz lead (fixed clock); timestamp is last line | PASS |
| AC-7 escaping, no emoji/"!" | user input escaped, not interpreted | PASS |
| AC-8 no honeypot/IP/UA, chat_id as given | valid lead -> one sendMessage (partial: chat_id, preview flag) | PASS; see note |
| AC-9 old cases still pass | all 16 pre-existing cases | PASS |
| AC-10 README checklist | no automated test; manual grep of README (getUpdates, -100, upgrade trap, secret put) | PASS (manual) |
| AC-11 env docs | no automated test; README table and checklist present | PASS (manual) |
| AC-12 scope | no automated test; git diff limited to worker, README, .env.example | PASS (manual) |

Note: AC-8 "text never contains honeypot/IP/UA" has no dedicated assertion (the filled-honeypot case only proves nothing is forwarded). Low risk, the formatter only reads named fields. Suggest one assertion.

## Site regression
- `npm run generate`: OK, 44 routes, 21 sitemap urls.
- `npm run test:e2e` full run (default workers): 174 passed, 5 skipped, 22 failed in 12.7 min. Failures were in cro, i18n-theme, home, regressions specs across all three projects, different tests per project, none touching the worker.
- Cause: load/timing flakiness (machine saturated by parallel workers). Re-run with `--workers=2`: home+regressions 21 passed, 3 skipped; cro+i18n-theme 139 passed, 2 skipped; 0 failed. All 22 passed on re-run.
- Flaky list (failed once at full parallelism, passed on re-run): the 22 tests above (cro modal/lead flow/data-cta, i18n-theme toggle/OS change/keyboard/mobile pills, home modal/FAQ, regressions LiquidCanvas/cursor). Not caused by this feature (no app code changed). Recommend `workers: 2` in playwright.config for this machine.

## Secrets in static output
`grep -rE 'api\.telegram\.org|[0-9]{8,10}:[A-Za-z0-9_-]{30,}' .output/public` -> no matches.

QA: PASS
