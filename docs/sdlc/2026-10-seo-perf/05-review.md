# 05 · Code review: 2026-10-seo-perf (loop 1)

> Owner: code-reviewer (opus) · 2026-10-14 · scope: full uncommitted diff incl. tests/e2e/seo-perf.spec.ts

## Checks run
- `npm run typecheck`: exit 0 (known vue-router/volar warning only).
- `npm run generate`: exit 0, 44 routes; `postgenerate` printed `sitemap.xml: 21 urls`.
- `npm run agents:check`: 13 agents, 7 phases OK.
- Playwright: first full run 109 passed / 18 failed (45 s timeouts under machine load) / 5 skipped; re-run with `--workers=2`: 14 passed, 4 failed — 3 deterministic (`seo-perf.spec.ts:76`, all projects), 1 infra (trace-file ENOENT).

## Verified OK
- Head tags fully SSR on `/`, `/ru`, `/en`, `/projects/ijro-pro`, `/ru/projects/ijro-pro`: lang, title, canonical, hreflang (x-default → uz), og:locale alternates, one JSON-LD block per page. `og:type` deduped by unhead (article on project pages).
- JSON-LD escaping: unhead escapes `<` as `<`, so `</script>` in copy cannot break out.
- No hydration warnings.
- Modulepreload: ru/en copy chunks appended only on `/ru*` and `/en*`; uz pages untouched; 404.html/200.html untouched.
- No Google Fonts references left in source. `@font-face` syntax valid; latin unicode-range covers U+02BB/02BC and U+2018/2019.
- Uzbek apostrophes consistent (‘ for oʻ/gʻ, ’ for tutuq belgisi).
- Theme plugin: no race with toggle or inline script.
- Sitemap script runs only after successful generate, throws if output missing, excludes 200/404.

## Findings
| severity | file:line | finding | fix |
|---|---|---|---|
| BLOCKER | tests/e2e/seo-perf.spec.ts:76-83 | `not.toMatch(modulepreload)` on uz can never pass (every page has entry/vendor modulepreloads); ru/en checks pass trivially. Blocks CI/deploy. | Compare set difference of modulepreload hrefs `/ru` − `/` = exactly one chunk, fetch it and assert it contains `цифровизация`; assert no preloaded chunk on `/` does. |
| MINOR | nuxt.config.ts:66-70, 80-81 | Hook silently no-ops if manifest key stops matching; `/_nuxt/` hardcoded. | Warn when no copy chunk found for a ru/en route; build href from app baseURL/cdnURL + buildAssetsDir. |
| MINOR | app/data/site.{uz,ru,en}.ts | `meta {title, description, ogLocale}` is dead (useSeo reads seo.*.ts). | Delete `meta` from all three. |
| MINOR | app/assets/css/fonts.css:53,61,69 | Fallback faces only `local('Arial')`/`local('Courier New')`, absent on Linux/Android. | Add Liberation Sans/Arimo and Liberation Mono/Cousine. |
| MINOR | scripts/sitemap.mjs:17,23 | `lastmod` = build date for every URL on every deploy; ignored by Google. | Drop `<lastmod>`. |
| NIT | app/plugins/theme.client.ts:4,16 | Two `app:mounted` hooks. | Merge. |
| NIT | app/composables/useSeo.ts:19 | `clip()` with no space: `slice(0,-1)` keeps almost all. | Guard `i > 0`. |
| NIT | nuxt.config.ts:33 | ru/en hero is Cyrillic but only latin Unbounded preloaded. | Optional: preload cyrillic on `/ru*`,`/en*`. |

VERDICT: CHANGES_REQUESTED

---

# 05 · Code review: 2026-10-seo-perf (loop 2, delta)

> Owner: code-reviewer (opus) · 2026-10-14 · verified in source and in `.output/public`

| loop-1 item | status | evidence |
|---|---|---|
| BLOCKER test `seo-perf.spec.ts:76-85` | FIXED | Diffs modulepreload hrefs `/ru` − `/`, exactly one extra chunk containing the ru marker; the only extra on ru.html is the ru copy chunk. |
| MINOR hook silent no-op / hardcoded `/_nuxt/` | FIXED | Warns when a copy chunk is missing; href from baseURL/cdnURL + buildAssetsDir; index.html and 404.html untouched. |
| MINOR dead `meta` in `site.*.ts` | FIXED | No `meta:` key left; no reader in `app/`. |
| MINOR fallback fonts | FIXED | Liberation Sans/Arimo, Liberation Mono/Cousine present in built CSS. |
| MINOR sitemap `lastmod` | FIXED | Removed. |
| NIT two `app:mounted` hooks | FIXED | Single hook. |
| NIT `clip()` guard | FIXED | `i > 0 ? cut.slice(0, i) : cut`. |
| NIT cyrillic font preload | FIXED, then narrowed | Loop-1 note was wrong: the en hero is Latin. Preload now emitted only for `l === 'ru'` (orchestrator applied after this review). |

VERDICT: APPROVE
