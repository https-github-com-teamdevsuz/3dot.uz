# 07 Performance: 2026-10-i18n-theme

> Owner: performance-auditor (sonnet) · 2026-10-14

Method:
- I reused the existing `.output/public` build. No source file was newer than it, so I did not regenerate.
- I served it with `npx serve` and measured with Playwright using Edge (`channel: 'msedge'`).
- Lighthouse was not run. LCP, CLS and long tasks come from PerformanceObservers, 5 s per page.
- There is no earlier `07-performance.md`, and I did not stash. The size baseline is therefore only the architecture estimates.
- FPS runs on the local GPU/Edge, not a throttled device.

| Metric | Budget | Measured | Status |
|---|---|---|---|
| Initial JS gzip, `/` (uz) | 180 KB | 141.1 KB (VJvKi51z, C5Lan1Xp, tC3qjMt3, ChuPqu26, CTCZsA0W, 8k2DPcO8, BINkel-R, CTaJPFo_) | PASS |
| Initial JS gzip, `/ru` and `/en` | 180 KB | 141.1 KB, the same preload set as uz | PASS |
| three.js chunk (XRCGpbXX) gzip | 200 KB | 131.1 KB, only `<link rel=prefetch>`; the LiquidScene chunk adds 4.4 KB | PASS |
| ru copy chunk (DQJhf1jk) | lazy, not in uz initial | 4.3 KB gz; in no HTML preload; not requested on `/` | PASS |
| en copy chunk (zDsVHMGJ) | lazy, not in uz initial | 3.4 KB gz; in no HTML preload; not requested on `/` | PASS |
| Inline head script | ~450 B | 581 B raw | PASS (+130 B over estimate, negligible) |
| CSS | no budget | `entry` 2.2 KB gz, `default` 2.9 KB gz, `pages` 3.3 KB gz; `main.css` source 5.5 KB to 7.6 KB (+2.0 KB raw for the theme tokens and ru typography) | PASS |
| HTML, home page (raw / gz) | no budget | uz 67.8 KB / 13.9 KB; ru 70.4 KB / 15.6 KB; en 67.3 KB / 13.7 KB | PASS |
| LCP, 12 runs (3 locales, dark and light, desktop and mobile) | 2500 ms | 384 to 540 ms | PASS |
| CLS, uz and ru | 0.1 | 0.0045 to 0.0073 | PASS |
| CLS, en | 0.1 | 0.0206 to 0.0218 | PASS (about 4x uz, see finding 2) |
| Theme toggle, synchronous cost | no budget | 0.3 to 0.8 ms click handler; 4 consecutive toggles had 0 long tasks | PASS |
| Theme toggle, FPS during and after | 55 FPS | 60 to 61 FPS, max frame 17 ms (one 34 ms frame in 4 runs) | PASS |
| WebGL FPS, idle, 5 s sample | 55 FPS | 60.2 FPS, max frame 17.7 ms | PASS |
| WebGL shader recompile on toggle | none | None by code reading. Colours, exposure and envMapIntensity are uniforms, `customProgramCacheKey` is unchanged, there are no new GPU resources, and draw calls (4) and triangles (about 61k) are unchanged. FPS is flat across the toggle, which is consistent. | PASS |
| Heavy work before the preloader | none | three is prefetch-only and loaded lazily by `LiquidCanvas.client.vue`. The theme/locale script is synchronous and tiny. | PASS |
| Fonts | `display=swap`, preconnect | The Google Fonts stylesheet link has `display=swap` (Unbounded, Manrope and JetBrains Mono, 3 families). I did not separately confirm the preconnect hints. | PASS |

Other observations:
- Locale and theme were correct on first paint in every run: `html[lang]` and `data-theme` matched the URL and the colour scheme.
- Long tasks of 50 to 196 ms appeared only on desktop during load, not on mobile or around toggles. The worst, 196 ms, was the first `/` run in dark.

## Findings

1. **No preload for the ru/en chunk** (frontend-developer, sonnet). `/ru` and `/en` load their copy chunk dynamically after the entry. That adds one serial request, about 4 KB, which did not show in LCP on localhost. On a slow network it adds one round trip. The fix is a `<link rel="modulepreload">` for the locale chunk in `useLocaleHead`, or inlining the chunk into those pages. Expected gain: about 100 to 300 ms of LCP on 3G, with no cost on uz.
2. **en CLS is about 4x uz** (frontend-developer, sonnet). It is 0.021 against 0.005, probably font-swap reflow of longer English lines. It is well within budget, so this is low priority. Adding `size-adjust` or `font-display: optional` on the display font, or reserving heading heights, would remove it.
3. **Fonts load from Google's CDN** (frontend-developer, sonnet). The page waits on a third-party stylesheet that blocks rendering. Self-hosting the 3 families with `@font-face` and `display=swap` would save a DNS+TLS round trip, about 100 to 200 ms of FCP, and would let us preload the Cyrillic subset for ru.
4. **Inline script +130 B over the estimate** (solution-architect, opus). This is not actionable, but the architecture doc should be updated to about 580 B.
5. **Copy chunks are small** (webgl-engineer, opus). Keep ru/en lazy as they are. If more languages are added, the same approach holds, with about 4 KB each.

Files: `D:\Projects\3dot.uz\.output\public\_nuxt`. Measurement scripts are in the session scratchpad.

PERF: PASS
