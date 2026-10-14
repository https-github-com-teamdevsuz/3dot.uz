# 07 Performance: 2026-10-cro-analysis (independent re-measure after CRO rework)

> Owner: performance-auditor (sonnet) · 2026-10-14

Method
- Existing `.output/public` (chunks stamped 14:43), not regenerated. Served with `npx serve -l 4599`, killed afterwards.
- Edge via Playwright (`channel: msedge`, D3D11), one browser at a time.
- Desktop 1440×900 unthrottled. Mobile 390×844 DPR 3, 4× CPU throttle, no network throttle.
- One load per cell, 6.5 s observation. FPS = 4 s rAF sample. Scroll test = full-page wheel sweep (Lenis), 60 ms per step. Lighthouse not run.
- Initial JS = gzip sum of the HTML `modulepreload` links (same definition as the previous audit).
- First desktop `/` run was cold and is the only run with an 831 ms long task. Single run per cell.

| Metric | Budget | Measured | Status |
|---|---|---|---|
| Initial JS gz, `/` | 180 KB | 144.4 KB (prev 141.1, +3.3) | PASS |
| Initial JS gz, `/ru` | 180 KB | 148.6 KB (prev 145.4, +3.2) | PASS |
| Initial JS gz, `/en` | 180 KB | 147.6 KB (prev 143.9, +3.7) | PASS |
| three chunk gz | 200 KB | 128.0 KB, lazy, prefetch only | PASS |
| Third-party origins | none | 0 foreign requests on 6 loads + 2 modal sessions | PASS |
| LCP desktop `/` · `/ru` · `/en` | 2500 ms | 280 · 140 · 124 ms (prev 356 · 212 · 140) | PASS |
| LCP mobile 4× `/` · `/ru` · `/en` | 2500 ms | 392 · 408 · 384 ms (prev 380 · 436 · 360) | PASS |
| CLS on load | 0.1 | desktop 0 · 0 · 0.001; mobile 0 | PASS |
| CLS during full scroll, desktop | 0.1 | 0 on all (prev 0.185 at the projects pin) | PASS |
| CLS during full scroll, mobile 4× | 0.1 | 0 on all | PASS |
| FPS idle desktop | 55 | 60 · 60 · 60 | PASS |
| FPS idle mobile 4× | 55 | 60.1 on all | PASS |
| FPS scrolling desktop | 55 | 58.8 (`/`, one 67 ms hitch) · 60 · 60.1 | PASS |
| FPS scrolling mobile 4× | 55 | 60 on all | PASS |
| Modal open/close | no long tasks | desktop click→dialog 76 ms; mobile 4× 111 ms; focus on INPUT; 0 long tasks, CLS 0 | PASS |
| Long tasks during load | ideally none > 50 ms | desktop 51–100 ms, except 831 ms cold first run on `/`; mobile 4× 70–270 ms (boot, hydration, three init). LCP/FPS unaffected | WARN (info) |
| Heavy work before preloader | none | three prefetch only; modulepreload set shape unchanged | PASS |

Notes
- Chunks (gzip): entry 29.3 KB, vue/nuxt 52.2 KB, app+sections 48.8 KB; rest 0.1–8 KB.
- Removing 2 sections did not shrink initial JS; SectionCta, useLead and the modal rework added ~3.3 KB per locale. Well inside budget.
- Scroll CLS dropped from 0.185 to 0; the projects pin shift did not reproduce after `projects__all` was reworked to hold SectionCta (cause not isolated; pre-existing, now gone).
- `leadEndpoint` is the placeholder `https://lead-relay.example.workers.dev/lead`; no request until a form submit. It becomes a third-party origin once real; not on the critical path, no preconnect needed.
- Not measured: a real lead submit, Lighthouse.

## Comparison with 2026-10-seo-perf

| Metric | Previous | Now |
|---|---|---|
| Initial JS `/` · `/ru` · `/en` | 141.1 · 145.4 · 143.9 KB | 144.4 · 148.6 · 147.6 KB |
| LCP desktop | 140–356 ms | 124–280 ms |
| LCP mobile 4× | 360–436 ms | 384–408 ms |
| CLS load | ≤ 0.0004 | ≤ 0.001 |
| CLS scroll | 0.185 | 0 |
| FPS | 60 | 60 (one 58.8 scroll sample) |

## Top 5 recommendations
1. Keep SectionCta/useLead lean; if budget tightens, lazy-load the modal form logic on first `show()` (~2–4 KB). Owner: frontend-developer.
2. Investigate the 831 ms cold-start long task and the 200–270 ms mobile tasks (three/scene init, ScrollTrigger setup); defer with `requestIdleCallback` after the preloader. Owner: webgl-engineer.
3. Replace the placeholder relay URL before release; confirm no fetch before submit. Owner: devops-engineer.
4. Re-run under real mobile network throttling, median-of-5, plus Lighthouse. Owner: qa-engineer.
5. Long-cache headers for `/_nuxt/**` and `/fonts/**` if the host moves off GitHub Pages. Owner: devops-engineer.

PERF: PASS
