# 06 · Test report — 2026-10-cro-analysis

Run: `npx playwright test --workers=2` against `.output/public` (built 14:24). Projects: desktop 1440x900, mobile (iPhone 13), reduced-motion.
Full run: 183 passed, 5 skipped, 13 failed; after test updates to the changed modal (focus via `inert`, retry on submit button, throttle `role=status`) the CRO + flaky specs re-run: 70 passed, 2 failed. US-15 analytics: out of scope (Q3 nothing).

## Traceability (tests/e2e/cro.spec.ts unless noted)
| Criterion | Test | Result |
|---|---|---|
| US-1 one POST, payload, success | lead flow: 204 | PASS |
| US-1 no double send / disabled while sending | covered by aria-disabled + single-call assertion only | PASS (partial) |
| US-2 5xx / network error, alert, Telegram link, form kept, retry | lead flow: 500, network failure | PASS |
| US-2 10 s timeout | not run (would need >1.5 s wait); abort used instead | gap |
| US-3 honeypot hidden, no request | modal honeypot, lead flow honeypot | PASS |
| US-3 bundle grep, relay unit | not in e2e scope | n/a |
| US-4 chips none pressed, consent unchecked+required on reopen, 3 inline errors with aria-invalid, no request | modal tests | PASS |
| US-5 H1 Excel, CTA, Telegram link, no legacy strings | hero test; home.spec H1 | PASS |
| US-6 data-cta (hero, header, section x3, contact, submit, telegram) | data-cta test | PASS |
| US-7 section CTAs in projects/process/faq; project page CTA x3 locales | two tests | PASS |
| US-8 no marquee, NDA badge per card, placeholder outline off | US-8 test | PASS |
| US-9 4 service cards with bullets, title | US-9 test | PASS |
| US-10 7 sections | home.spec | PASS |
| US-12 nav order, #pricing | US-12 test (desktop+mobile burger) | PASS |
| US-13 no uz leakage in ru/en | i18n-theme UZ_ONLY | PASS |
| US-14 titles per locale | i18n-theme TITLE | PASS |
| Modal focus trap (inert on #__nuxt), Escape returns focus | modal test | PASS |
| Throttle within 30 s | lead flow throttled (role=status, no Telegram link) | PASS |
| No horizontal overflow 390/1440 on /, /ru, /en | overflow tests | FAIL 2 of 18 (see BUG-1) |
| reduced-motion project | whole suite | PASS apart from BUG-1 |
| Console errors, WebGL canvas, 404 | home.spec (existing) | PASS |

## Failures
BUG-1 (owner: frontend-developer, `app/components/sections/ProjectsSection.vue`, `.projects__head`): at 390 px width with a non-touch desktop UA (reduced-motion project) `span.mono.dim` "6 ta loyiha" / "6 cases" sticks out to x=422 (> 390), visible overflow on `/` and `/en`. Repro: `npx playwright test cro.spec.ts --project=reduced-motion -g "390"`; screenshot `test-results/cro-no-visible-horizontal-overflow-at-390-on--reduced-motion/test-failed-1.png`. Mobile (iPhone 13) project passes. `/ru` passes.

Earlier in the session the focus-trap test failed (tab left the dialog); the app then added `inert` on `#__nuxt`, test updated to assert it and no focus in `#__nuxt`; passes.

Test-only fixes in Q1: home.spec (H1 'Excel', 7 sections, #pricing, hero CTA), i18n-theme (UZ_ONLY, TITLE, ru/en CTA match), seo-perf (ru chunk MARK changed to a current heroLead phrase).

## Flaky
- `i18n-theme.spec.ts:66` switcher (desktop): failed once under load in the full run, passed on re-run. Not 3x-verified.
- First full run: server died mid-run (ECONNREFUSED on mobile) — environmental (`serve`), not app.

QA: FAIL

---

## Final run (orchestrator, after BUG-1 fix)

- BUG-1 (`.projects__head` overflow at 390 px) fixed by frontend-developer: `flex-wrap: wrap; gap: 8px 32px`. `cro.spec.ts -g "390"` 9/9 across desktop, mobile, reduced-motion.
- `npm run typecheck`: 0 errors. `npm run generate`: OK.
- Full suite `npx playwright test --workers=2`: 195 passed, 5 skipped, 1 failed — `i18n-theme.spec.ts:199 US-2/8 mobile pills` — re-run in isolation: 1 passed (11 s). Classified as flaky under load (same test flaked in earlier rounds); not an app bug.
- Worker self-check: 16/16.

QA: PASS
