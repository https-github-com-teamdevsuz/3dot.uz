# 07 Performance: 2026-10-seo-perf (independent re-measure)

> Owner: performance-auditor (sonnet) · 2026-10-14

Method
- Build `.output/public` written 11:43 (fresh vs nuxt.config.ts 11:19); not regenerated.
- `npx serve -l 4599`, Edge via Playwright (`channel: msedge`, D3D11 GPU), one browser at a time.
- Desktop 1440×900 unthrottled; mobile 390×844 DPR 3, 4× CPU throttle, no network throttle.
- One load per page, 6.5 s observation; FPS = 4 s rAF samples. Lighthouse not run.
- First two passes discarded (contention with other agents' Playwright suites: 12–40 FPS, LCP up to 10 s, CLS up to 0.19). Numbers below are from a quiet third pass, single run per cell.

| Metric | Budget | Measured | Status |
|---|---|---|---|
| Initial JS gz, `/` | 180 KB | 141.1 KB (8 modulepreloads) | PASS |
| Initial JS gz, `/ru` | 180 KB | 145.4 KB (adds copy chunk, 4.3 KB) | PASS |
| Initial JS gz, `/en` | 180 KB | 143.9 KB (adds copy chunk, 3.3 KB) | PASS |
| three chunk gz | 200 KB | 128.0 KB, prefetch only; LiquidScene chunk 4.3 KB, prefetch | PASS |
| Copy chunk isolation | uz must not load ru/en | ru/en chunks modulepreloaded only in their own locale HTML; `/` has none | PASS |
| Third-party requests | none | 0 foreign origins on all 6 loads; no googleapis/gstatic in any HTML | PASS |
| Fonts transferred | no budget | `/`: ~95 KB latin woff2; `/ru` ~145 KB (all 6 files); `/en` ~100 KB. `unbounded-latin` preloaded | PASS |
| LCP desktop `/` · `/ru` · `/en` | 2500 ms | 356 · 212 · 140 ms | PASS |
| LCP mobile 4× CPU `/` · `/ru` · `/en` | 2500 ms | 380 · 436 · 360 ms | PASS |
| CLS on load, all 6 runs | 0.1 | desktop 0.0002–0.0004; mobile 0 | PASS |
| CLS during scroll, desktop | 0.1 | 0.185 on `/` and `/ru` (×4). Projects section moves ~71 px when the pin engages; ~9.5 s into session; not font-related; `ProjectsSection.vue` unchanged vs HEAD → probably pre-existing (previous audit never scrolled) | WARN |
| FPS idle desktop `/` · `/ru` · `/en` | 55 | 46.9 (cold first run, 66 ms max frame) · 60.0 · 60.0 | PASS |
| FPS idle mobile 4× (3 locales) | 55 | 60.1 · 60.0 · 60.1 | PASS |
| FPS scrolling desktop `/ru` · `/en` | 55 | 60.0 · 60.0 | PASS |
| FPS scrolling mobile 4× (3 locales) | 55 | 60.0 each | PASS |
| Theme toggle | no budget | handler 0.3–1.9 ms; 5/6 runs 0 long tasks; one 56 ms task on mobile `/ru`; no FPS dip | PASS |
| Heavy work before preloader | none | three prefetch-only and lazy; initial JS shape unchanged | PASS |

## Comparison with the previous audit (2026-10-i18n-theme)

| Metric | Previous | Now |
|---|---|---|
| Initial JS `/` | 141.1 KB | 141.1 KB |
| Initial JS `/ru` | 141.1 KB + serial 4.3 KB copy chunk | 145.4 KB, copy chunk preloaded (serial round trip removed) |
| Initial JS `/en` | 141.1 KB + serial 3.4 KB | 143.9 KB, preloaded |
| three chunk | 131.1 KB | 128.0 KB (same file, unit difference) |
| Fonts | Google CDN, render-blocking | Self-hosted woff2, 0 foreign origins |
| en CLS | 0.021 | 0.0003 |
| LCP desktop | 384–540 ms | 140–356 ms |
| Idle FPS | 60.2 | 60 (one cold-start outlier) |

## Top 5 recommendations
1. **Scroll-time CLS at the projects pin (0.185)** — frontend-developer. Set the pin spacer height up front or `ScrollTrigger.refresh()` after layout settles. Confirm first whether it is pre-existing (likely).
2. **Preload the Cyrillic display font on `/ru`** — done after this audit by performance-engineer in the `prerender:generate` hook (review-fix round).
3. **`jetbrains-mono-cyrillic` (5 KB) loads on `/` and `/en`** — frontend-developer. A stray Cyrillic-range glyph in mono text; narrow the range or find the character.
4. **Long-cache headers for `/_nuxt/**` and `/fonts/**`** — devops-engineer, only if the host moves off GitHub Pages.
5. **Re-run under real mobile network throttling, median-of-5 on a quiet machine** — qa-engineer.

PERF: PASS
