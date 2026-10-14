# 12 Optimization: 2026-10-seo-perf

> Owner: performance-engineer (opus) · 2026-10-14

## Method
- Build: `npm run generate`, served with `npx serve .output/public`.
- Browser: Playwright with Edge (`channel: 'msedge'`) and GPU flags. Headless SwiftShader showed 10 FPS and 3 s TBT because WebGL ran in software, so those numbers were discarded.
- Each value is the median of 5 cold runs (7 for the A/B tests).
- Desktop: 1440×900, no throttling.
- Mobile: 390×844 at DPR 3, CPU slowed 4× (CDP `setCPUThrottlingRate`), Fast-3G-like network (150 ms RTT, 1.6 Mbps down).
- LCP equals FCP in every run, because the LCP element is the preloader.
- "Hand-off" is the time until the `.preloader` node is removed. "three" is the `responseEnd` of the three.js chunk.
- Other agents (seo-specialist, linguist) were editing source during these measurements. Chunk hashes changed between runs, but the initial JS stayed the same.
- The measurement scripts are in the session scratchpad: `sizes.mjs`, `vitals.mjs`, `timeline*.mjs` and `idle.mjs`.

## Before / after

| Metric | Device | Before | After |
|---|---|---|---|
| FCP = LCP `/` · `/ru` · `/en` | desktop | 832 · 536 · 416 ms | **152 · 172 · 144 ms** |
| FCP = LCP `/` · `/ru` · `/en` | mobile 4× + 3G | 888 · 820 · 796 ms | 932 · 952 · 924 ms (see the font preload trade-off below) |
| CLS `/` · `/ru` · `/en` | desktop | 0.003 · 0.004 · 0.006 | 0.005 · 0.006 · 0.007 (the remainder is the preloader counter, see P2) |
| CLS `/` · `/ru` · `/en` | mobile | 0.002 · 0.005 · 0.003 | 0.002 · 0.005 · 0.002 |
| TBT (load + 7 s) | desktop | 101–735 ms | 74–118 ms |
| TBT | mobile | 422–501 ms | 357–370 ms |
| Third-party origins on first load | all | 2 (fonts.googleapis.com, fonts.gstatic.com), plus one render-blocking stylesheet | **0** |
| Preloader hand-off `/ru`, `/en` | mobile | 5352 · 5333 ms | **5202 · 5105 ms** |
| three.js chunk ready `/ru`, `/en` | mobile | 2943 · 2895 ms | **2779 · 2650 ms** |
| Initial JS gzip `/` · `/ru` · `/en` | — | 141.3 KB each (the ru/en copy loaded serially afterwards) | 141.3 · 145.6 · 144.6 KB (the copy chunk is now preloaded; budget 180 KB) |
| three chunk gzip | — | 128 KB | 128 KB (budget 200 KB) |
| Idle FPS | both | 60 | 60 |
| Scroll FPS (wheel) | desktop · mobile | — | 58.1 · 59.5, with 2 frames over 20 ms per run |

## Changes and their measured effect

1. **Self-hosted fonts. Kept.**
   - Files: `public/fonts/*.woff2` (6 files, the variable fonts in latin and cyrillic subsets, 148 KB total), the OFL licences for each family next to them, and `app/assets/css/fonts.css`, which is registered first in `nuxt.config.ts → css`.
   - The Google Fonts stylesheet and both preconnects are removed.
   - Desktop FCP/LCP went from 416–832 ms to **136–172 ms** (about −60 to −80 %). The render-blocking third-party CSS round trip is gone.
   - Subsets: latin-ext, vietnamese and greek are dropped. A scan of `app/data/*` shows no glyphs outside latin and cyrillic. `←`/`→` were never in the font and still come from the fallback.
2. **Metric-matched fallbacks. Kept.**
   - Faces: `Unbounded Fallback` (Arial: size-adjust 135 %, ascent 74 %, descent 18.5 %), `Manrope Fallback` (Arial: 102 % / 105 % / 29.4 %) and `JetBrains Mono Fallback` (Courier New: 99.3 % / 102.7 % / 30.2 %).
   - The values were measured in the browser with canvas `measureText` against the real woff2 files. Latin and cyrillic differ by less than 1.5 %, so each family has one face.
   - These faces are wired into `--font-*` in `main.css`.
   - The old en CLS of 0.021, caused by the font swap, is now 0.002 on mobile. The remaining desktop CLS comes from the preloader counter, not from fonts.
3. **Preload of the display font. Kept.** This is `<link rel=preload as=font>` for `unbounded-latin.woff2` only, since it is used by the preloader and the hero. A/B on `/`:

   | Device | Fonts done | CLS | FCP |
   |---|---|---|---|
   | desktop | 271 → 114 ms | 0.0131 → 0.0056 | unchanged |
   | mobile | 2470 → 1786 ms | unchanged | +88 ms (the font shares bandwidth with the critical CSS) |

   I kept it: mobile FCP stays far under budget, and without it the preloader and hero show fallback type for about 1.5 s on 3G.
4. **Modulepreload for the ru/en copy chunk. Kept.**
   - How it works: in `nuxt.config.ts`, the `build:manifest` hook records the file names of `site.ru.ts` and `site.en.ts`. The Nitro `prerender:generate` hook then adds `<link rel="modulepreload">` to every `/ru*` and `/en*` HTML page.
   - No composable change was needed. The prerender route list, the `pages:extend` hook and the inline script are untouched.
   - A/B on mobile: hand-off is 150–230 ms earlier and three is ready 160–245 ms earlier. uz pages are unaffected.
5. **`features.inlineStyles: true` (inline the global CSS). Reverted.** Only `entry.css` was inlined. `default.css` stayed render-blocking, so the CSS round trip remained and mobile FCP did not change (940 vs 916 ms).
6. **Dropping the three.js `<link rel=prefetch>` from the HTML. Reverted.** Fonts on mobile finished 75 ms earlier, but the blob arrived about 400 ms later (2747 → 3162 ms on `/`). That is a net loss.
7. **`content-visibility` on sections below the fold. Rejected without a change.** With all sections except the hero hidden, mobile FCP did not move (460 vs 456 ms without JS at 4× CPU). That roughly 460 ms is a fixed renderer cost of the emulation. It is also risky with ScrollTrigger measurements.
8. **Lenis / GSAP idle cost. No change needed.**
   - The motion chunk costs 12 ms per 5 s idle on desktop and 48 ms per 5.4 s on mobile at 4×, which is about 0.15 ms per frame.
   - The three.js render loop costs 168 ms in the same mobile window. GSAP/Lenis is not a target.
   - During scrolling the motion chunk costs about 2 ms per frame on mobile at 4×, with 59.5 FPS.
9. **`Cache-Control` route rules. Not added.** The site deploys to GitHub Pages (`deploy.yml`), which ignores Nitro route rules. The `static` preset emits no `_headers`. Add `routeRules: { '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } } }` if the host changes to Cloudflare or Netlify.
10. **`_payload.json`. No change.** It is 369 B and preloaded in parallel.

## Chunk composition (gzip)

| Chunk | Size | Where it loads |
|---|---|---|
| Vue, router and Nuxt runtime | 54 KB | initial |
| motion (gsap, ScrollTrigger, lenis) | 50 KB | initial, needed by the preloader timeline |
| entry | 30 KB | initial |
| layout | 8 KB | initial |
| page | 5 KB | initial |
| three | 128 KB | lazy (prefetch) |
| LiquidScene | 5 KB | lazy (prefetch) |
| ru / en copy | 4–5 KB | lazy (now preloaded on its own locale) |

Nothing obvious can be removed without code changes. Making ScrollTrigger lazy would cost roughly 15 KB of initial JS, and it would need changes to `useReveal` and the plugin.

## Patch requests

- **P1 · frontend-developer · `app/plugins/theme.client.ts` (US-9 e2e failure, desktop and reduced-motion).**
  - The plugin listens for `change` but never re-syncs on init. If the OS scheme changes between the inline head script and plugin setup, the change is lost.
  - Self-hosted fonts make the `load` event fire much earlier, so the test's `emulateMedia` now lands in that gap.
  - Likely fix, after `addEventListener`:
    ```ts
    let stored = null; try { stored = localStorage.getItem('3dot:theme') } catch {}
    if (!stored) { const t = mq.matches ? 'light' : 'dark'; if (document.documentElement.dataset.theme !== t) { document.documentElement.dataset.theme = t; theme.value = t } }
    ```
  - This is not verified, because the file is not mine. The failure is a real race that the faster load exposed. My CSS and head changes do not touch the theme logic.
- **P2 · frontend-developer · `app/components/ui/SitePreloader.vue`.** Add `font-variant-numeric: tabular-nums` to `.preloader__count`, or give it `min-width: 3ch; text-align: right`. Proportional digits shift layout on every tick, and this is all of the remaining desktop CLS (about 0.005).
- **P3 · webgl-engineer (optional, unmeasured).** Consider DPR ≤ 1.5 and `antialias: false` on `(pointer: coarse)`. The render loop is the largest idle cost on mobile.
- **P4 · frontend-developer (optional).** Make the preloader start its exit as soon as hydration finishes on slow devices. Hand-off is about 5.1 s on mobile 3G, and only about 2.4 s of that is load.

## E2E / typecheck
- `npm run typecheck`: exit 0. The vue-router volar warning was already there.
- First `npm run test:e2e` run: 86 passed, 5 skipped, 5 failed.
  - Re-running the failing tests alone passed the LiquidCanvas and cursor tests. Those failures were flaky under load, because my measurement browsers were running on the same GPU at the time.
  - **US-9 (desktop and reduced-motion) still fails.** See P1.

## What remains
- Mobile FCP of about 900 ms is a floor: HTML, then a render-blocking `default.css` round trip, then about 460 ms of renderer cost from the emulation.
- Inlining all CSS could save one RTT. Nuxt only inlines the entry CSS today.
- Preloader hand-off time (P4).

## Review fixes

- `app/assets/css/fonts.css`: metric fallback faces now also match `local('Liberation Sans'), local('Arimo')` (Unbounded/Manrope) and `local('Liberation Mono'), local('Cousine')` (JetBrains Mono), so the CLS-killing overrides apply on Linux/Android, not only Windows/macOS.
- `nuxt.config.ts` `prerender:generate`: a `/ru*` or `/en*` HTML route with no recorded copy chunk now logs `console.warn("[prerender] no <l> copy chunk in manifest ...")` instead of silently skipping. The href comes from `app.cdnURL || app.baseURL` + `app.buildAssetsDir` (captured in the `ready` hook), not a hardcoded `/_nuxt/`.
- Same hook also injects `<link rel="preload" as="font" type="font/woff2" crossorigin href="<baseURL>fonts/unbounded-cyrillic.woff2">` on `/ru*` and `/en*` HTML only (`/` is unchanged). Checked in the generated `ru.html` / `en.html` / `ru/projects/*.html`: the modulepreload points at the correct ru/en copy chunk, the font preload is present, and neither appears in `index.html`.
- I did not re-measure LCP for the cyrillic preload; performance-auditor's next pass should confirm it.
