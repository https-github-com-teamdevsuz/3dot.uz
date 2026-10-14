# 06 Test report: 2026-10-seo-perf (qa-engineer)

Run: `npm run generate` then `npx playwright test --workers=2`: **127 passed, 5 skipped, 0 failed** (desktop, mobile, reduced-motion).
New file: `tests/e2e/seo-perf.spec.ts` (33 test executions across 3 projects).

| Criterion | Test | Result |
|---|---|---|
| One h1, title <=60, description 140-160, canonical slash-less, hreflang uz/ru/en/x-default, og:title/description/locale, valid JSON-LD (Organization on home): uz/ru/en home + project | `SEO head: <locale> home/project` | PASS |
| robots.txt 200 + Sitemap line | `robots.txt references sitemap` | PASS |
| sitemap.xml 200, well-formed (DOMParser), 21 `<loc>`, each with 4 hreflang alternates | `sitemap.xml: 21 well-formed urls...` | PASS |
| No fonts.googleapis/gstatic requests on `/`; Unbounded loaded | `no Google Fonts requests; Unbounded loads` | PASS |
| `/ru` preloads exactly one extra chunk vs `/`, which contains the ru copy; no chunk preloaded on `/` contains it | `ru HTML modulepreloads exactly the ru copy chunk...` | PASS |
| CLS < 0.05 on `/` and `/en` | `CLS < 0.05 on <path>` | PASS |

Reviewer blocker (vacuous modulepreload assertion) fixed: the test now diffs preload hrefs and checks chunk contents.

## Flakiness
- Run 1 (default 14 workers): 16 failures, all timeouts/load-related (existing specs plus `SEO head: ru home`); machine overloaded. Not reproducible at fewer workers.
- Run 2 (`--workers=4`): 1 failure, `SEO head: uz project` [desktop], Playwright trace-file ENOENT in context close (infra, not an assertion); passed in run 3.
- Run 3 (`--workers=2`): clean. Recommend `--workers=2` on this machine.

## Notes
- P1 (theme race) did not reproduce in the final run.
- Config unchanged.

QA: PASS
