# 06 · Test report — 2026-10-i18n-theme

> Owner: qa-engineer (sonnet)

Run: `npm run generate` then `npx playwright test` (Chromium installed via `npx playwright install chromium`; no msedge fallback needed).
Result: 85 passed, 2 skipped (mobile-only test on desktop/reduced-motion projects), 0 failed, 0 flaky. New spec: `tests/e2e/i18n-theme.spec.ts`; `home.spec.ts` still green.

| Criterion | Test (i18n-theme.spec.ts) | Desktop | Mobile | Reduced motion |
|---|---|---|---|---|
| US-1 routes 200, lang, translated | `US-1/4/13 <loc>` x3, project page x3, trailing-slash | pass | pass | pass |
| US-2 switcher link, hreflang/lang, aria-current, mobile menu | `US-2/3/13 switcher...`, `US-2/8 mobile pills` | pass | pass | pass |
| US-3 persistence / redirect rules | stored ru/en redirect, stored uz stays, no choice never redirects | pass | pass | pass |
| US-4 canonical, hreflang+x-default, og:locale/title/description | `US-1/4/13`, `US-1/4 project` | pass | pass | pass |
| US-5 no uz-only phrases on ru/en | `US-5 ru/en` (key parity is a unit concern, not covered here) | pass | pass | pass |
| US-6 no visible overflow ru/en, header not wrapped | `US-6 ru/en` (unclipped-element check, not raw scrollWidth) | pass | pass | pass |
| US-7 system scheme sets data-theme before hydration | `US-7 system light/dark` (attribute read at `commit`) | pass | pass | pass |
| US-8 toggle flips, stores `3dot:theme`, label flips, role=status | `US-7/8/9 toggle...` | pass | pass | pass |
| US-9 reload keeps stored theme, OS change ignored/live, no hydration warnings | `US-7/8/9 toggle...`, `US-9 OS change live` | pass | pass | pass |
| US-10 blob visible on light bg, >=3:1 (informational) | `US-10 (informational)` | pass | pass | pass |
| US-11 reduced motion no anim; keyboard focus on switcher and toggle | `US-11 reduced motion`, `US-11 keyboard` | pass | pass | pass |
| US-12 theme-color metas, color-scheme | `US-12` (presence only; ADR-8 media-scoped) | pass | pass | pass |
| US-13 html lang after client switch | `US-2/3/13 switcher...` | pass | pass | pass |
| Light theme: html transform none, header fixed | `US-7/8/9 toggle...` (header auto-hides on scroll-down by design; asserted top===0 after scrolling up) | pass | pass | pass |
| Mobile: toggle clickable with menu open, pills >=44px | `US-2/8 mobile` | skip | pass | skip |

## Notes
- US-10 weak evidence: WebGL renders headless. Sampled darkest-pixel contrast vs `#f4f3ee` was ~17:1 (desktop 17.4, mobile 17.4, reduced 17.6), but the sample includes dark page text, so it does not isolate the blob. Screenshot: `test-results/*/light-hero.png` (per run). Treat US-10 as PASS-informational; a human glance at the light hero is still advised. Exposure fallback (0.85) not needed on this evidence.
- US-12 only checks metas exist; theme-color follows OS, not the toggle (documented ADR-8).
- Not covered: WCAG contrast of all light-theme sections (US-7 AA), CLS <= 0.1 (performance-auditor), translation key parity (needs a unit test).

## Failures
None remaining. Two failures in my first run were test bugs (header auto-hide; menu label after navigation), fixed in the spec; no app bugs found.

## Flaky
None (single full run all green after fix; no retries needed).

QA: PASS

## Follow-up tests
New `tests/e2e/regressions.spec.ts` (desktop + reduced-motion; mobile skipped, no fine pointer):
- LiquidCanvas mounts: canvas width > 300 and >= 90% of viewport; a `_nuxt/*.js` response containing `WebGLRenderer` was loaded (prod chunks are hash-named, so `/LiquidScene/` URL matching is impossible). Scene is mounted under reduced motion too, so not skipped there. Pass.
- Custom cursor (`.cursor__dot`, `.cursor__ring`) visible after mouse move, with non-transparent background/border colour differing from page background, in `data-theme` dark and light. Pass.
- `i18n-theme.spec.ts`: trailing-slash test now requests `/ru` and `/en` (slash-less, `ru.html`). Pass.

Runs: full suite green except the first draft of the canvas test (fixed, test-side bug); regressions + i18n-theme re-run 74 passed, then regressions 6 passed / 3 mobile skips. No flakiness observed. Caveat: cursor "differs from background" compares computed colours only, not rendered contrast ratio.

QA: PASS
