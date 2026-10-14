# 09 Handoff: 2026-10-seo-perf

**Version:** 0.3.0 (see `CHANGELOG.md`). `package.json` already reads 0.3.0. Tech-writer did not change it.
**Date:** 2026-10-14 · **Owner:** tech-writer (haiku)

## What shipped

- **SEO.** Per-locale copy in `app/data/seo.{uz,ru,en}.ts`. One head builder, `app/composables/useSeo.ts`, emits title, description, keywords, canonical, hreflang (with `x-default`), Open Graph, Twitter and JSON-LD on all 21 pages. `robots.txt` is in `public/`. `sitemap.xml` is written by `postgenerate` (21 URLs with alternates). Verification tags are placeholders.
- **Performance.** Google Fonts removed. Six self-hosted woff2 files in `public/fonts/` with metric-matched fallbacks. The display font is preloaded. The ru/en copy chunk is modulepreloaded on its own locale only. The Cyrillic font is preloaded on `/ru*` only. Desktop FCP went from about 400–800 ms to about 140–350 ms. English CLS went from 0.021 to about 0.0003. The first load makes no third-party requests.
- **Copy.** Uzbek proofread in `site.uz.ts`, with matching ru/en keys aligned. Details in `docs/sdlc/2026-10-i18n-theme/10-localization.md`.
- **Agents.** `linguist`, `seo-specialist` and `performance-engineer` added to phase 03. All pin `opus`.
- **Fixes.** Theme plugin re-syncs with the OS scheme after mount. Preloader counter uses tabular numbers.

## Gate verdicts

| Gate | Verdict | Notes |
|---|---|---|
| 04 Review | APPROVE (loop 2) | Loop 1: CHANGES_REQUESTED with one BLOCKER (vacuous modulepreload test) and minors. All fixed. |
| 05 QA | PASS | 127 passed, 5 skipped, 0 failed, `--workers=2`. |
| 05 Performance | PASS | All budgets met. One WARN: scroll CLS 0.185 at the projects pin. |

## How to use and edit

- Copy, titles, keywords: `app/data/seo.*.ts`. Verification codes: `SITE_VERIFICATION` in `useSeo.ts`.
- Fonts: `public/fonts/` and `app/assets/css/fonts.css`. Do not re-add Google Fonts.
- Build and check: `npm run generate` (writes sitemap), then `npx playwright test --workers=2`.
- Details: `README.md` sections “SEO” and “Shriftlar va performance”.

## Known limitations

- No `og:image` and no Twitter image. `public/og.png` does not exist.
- Projects, email and phone are placeholders.
- Home `<h1>` is a visual slogan with no keyword.
- `404.html` and `200.html` have no `noindex` and no `lang`. They are not in the sitemap.
- No `FAQPage` JSON-LD.
- `jetbrains-mono-cyrillic` (about 5 KB) loads on `/` and `/en`.
- Mobile numbers come from a 4× CPU and Fast-3G emulation. Not measured on a real device or network.
- Playwright is flaky above 2 workers on this machine (timeouts and trace-file errors).
- ru and en copy still need native review, as noted in 0.2.0.
- `.claude/agents/linguist.md` still says it owns only ru and en. The Uzbek proofread was done, but the agent scope and the `pipeline.json` ownership list need the same change.

## Follow-ups

1. Fill `SITE_VERIFICATION.google` and `.yandex`, then redeploy. Owner: site owner.
2. Add a 1200×630 `public/og.png`. Then seo-specialist wires `og:image` and `summary_large_image`. Owner: seo-specialist.
3. Replace placeholder projects, email and phone before submitting the sitemap. Owner: site owner, with linguist for copy.
4. Home `<h1>`: add a hidden keyword phrase. `home.spec` expects “digital.”, so qa-engineer must agree the change. Owner: seo-specialist with qa-engineer.
5. Scroll CLS 0.185 at the projects pin. Likely pre-existing. Confirm first, then fix the pin spacer or refresh ScrollTrigger after layout. Owner: frontend-developer.
6. Stray `jetbrains-mono-cyrillic` request. Narrow the range or find the character. Owner: frontend-developer.
7. Re-audit mobile under real network throttling, median of 5 on a quiet machine. Owner: performance-auditor with qa-engineer.
8. Optional P3: cap DPR at 1.5 and set `antialias: false` on `(pointer: coarse)`. Measure first. Owner: webgl-engineer.
9. Optional P4: start the preloader exit when hydration finishes on slow devices. Owner: frontend-developer.
10. If the host leaves GitHub Pages, add `Cache-Control` route rules for `/_nuxt/**` and `/fonts/**`. Owner: devops-engineer.
11. Update the linguist agent scope to include `site.uz.ts`. Owner: whoever maintains `.claude/agents`.
