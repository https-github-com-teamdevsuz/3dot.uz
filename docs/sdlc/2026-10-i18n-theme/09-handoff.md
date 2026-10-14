# 09 · Handoff — 2026-10-i18n-theme

> Owner: tech-writer (haiku) · 2026-10-14 · Version 0.2.0 · Status: ready, **not deployed**

## What shipped

- Three locales: `uz` at `/` (default), `ru` at `/ru`, `en` at `/en`. Project pages in each locale. 21 prerendered HTML pages.
- `hreflang` (uz, ru, en, x-default), canonical, `og:locale`, translated title and description per page.
- Language switcher in the header and in the mobile menu.
- Light and dark themes. Toggle in the header. Default follows the OS, dark if no signal. No flash on load.
- Light palette for the liquid-chrome blob. No shader change.
- CI workflow and GitHub Pages deploy workflow (deploy only after CI passes).
- Two pre-existing typecheck errors fixed.
- Details: `CHANGELOG.md` (0.2.0), `README.md` sections "Tillar" and "Mavzu".

## How it works

1. The locale comes from the URL prefix (`localeFromPath`, `app/composables/useLocale.ts`).
2. `uz` copy is bundled. `ru` and `en` are lazy chunks. `app/middleware/locale.global.ts` loads them before render and hydration.
3. `app/data/site.uz.ts` is the source. `SiteCopy` is derived from it. `site.ru.ts` and `site.en.ts` use `satisfies SiteCopy`, so typecheck catches missing keys.
4. `pages:extend` in `nuxt.config.ts` clones every page under `/ru` and `/en`. `nitro.prerender.routes` lists the locale routes.
5. `useLocaleHead()` in `app.vue` sets `lang`, canonical, hreflang and `og:locale`.
6. An inline script in the `<head>` (`nuxt.config.ts`) sets `data-theme` before paint. It also redirects a stored `ru` or `en` from an unprefixed URL, once.
7. Vue never renders `data-theme`. `useTheme()` syncs its state after `app:mounted`.
8. Colours are CSS tokens: `:root` (dark) and `:root[data-theme='light']` in `app/assets/css/main.css`.
9. The WebGL scene reads the theme at construction. `LiquidScene.setTheme()` blends two pre-parsed palettes (`SCENE_PALETTES`). No new GPU resources.
10. Storage keys: `3dot:theme` (`light` | `dark`) and `3dot:locale` (`uz` | `ru` | `en`).

## Gate verdicts

| Phase | Artifact | Verdict |
|---|---|---|
| 01 Requirements | 01-requirements.md | Approved by user |
| 02 Design | 02-architecture.md, 03-design-spec.md | Approved by user |
| 03 Implementation | 04-implementation.md | Typecheck exit 0. `generate` produces 21 locale pages |
| 04 Review | 05-review.md | APPROVED on loop 2 (loop 1: CHANGES_REQUESTED, 8 items fixed) |
| 05 Testing | 06-test-report.md | QA PASS: 85 passed, 2 skipped (mobile-only), 0 failed |
| 05 Performance | 07-performance.md | PERF PASS: initial JS 141 KB gz (budget 180), LCP 384–540 ms, CLS ≤ 0.021 |
| 06 Release | 08-release.md | READY, NOT DEPLOYED. Waiting for human approval |

## How to edit

- Copy: edit `app/data/site.uz.ts`, then mirror the key in `site.ru.ts` and `site.en.ts`. Shared data (brand, contacts, projects) is in `app/data/site.ts`.
- Colours: `app/assets/css/main.css` tokens. Blob colours: `SCENE_PALETTES` in `app/webgl/scenePresets.ts`.
- New project: add it to `projectBase` in `site.ts`, then add its translation to each locale file. Routes are generated from the slug list.
- New page: `/ru` and `/en` clones are automatic. If `crawlLinks` does not reach it, add its path to `nitro.prerender.routes`.

## Known limitations

- `ru` and `en` copy is a draft. Not reviewed by a native speaker.
- `theme-color` follows the OS, not the toggle (ADR-8).
- The blob's light-mode contrast (US-10, ≥ 3:1) was checked only on a headless render. Look at the light hero by eye.
- The theme change is a palette blend. There is no environment-map swap (ADR-6).
- US-6 as written (`scrollWidth <= innerWidth`) fails on all locales, including uz. A horizontal track is clipped by `overflow-x: hidden`. QA checked visible overflow instead.
- `data-split` text is not re-split on resize or after `fonts.ready`.
- Fonts come from Google Fonts. The inline script needs `'unsafe-inline'` or a hash if a CSP is added.
- No sitemap or `robots.txt` yet (waiting on `SITE_URL`).
- The contact form is still a demo.

## Follow-ups

**Before the release is announced**
1. Native-speaker review of `app/data/site.ru.ts` and `site.en.ts`. Owner: user.
2. Confirm `SITE_URL = https://3dot.uz`. `app/data/site.ts` still has a TODO.
3. Trailing slash: Pages 301s `/ru` to `/ru/`, but canonicals have no slash. Each canonical URL redirects, which hurts SEO. Pick one policy. Owner: frontend-developer.
4. Repo settings (one time, see `08-release.md`): Pages source = GitHub Actions, custom domain, DNS, `github-pages` environment with required reviewers, branch restriction to `main`.
5. Human approval, then the post-deploy smoke test in `08-release.md`.

**After the release**
6. Preload the `ru`/`en` chunk (`modulepreload` in `useLocaleHead`). Saves about 100–300 ms LCP on slow networks.
7. Self-host the three fonts and preload the Cyrillic subset. Also reduces `en` CLS (0.021 vs 0.005 for uz).
8. Investigate the `vue-router/volar/sfc-route-blocks` `ERR_PACKAGE_PATH_NOT_EXPORTED` warning. Likely a version mismatch.
9. Add a sitemap and `robots.txt` once `SITE_URL` is confirmed.
10. Re-split `data-split` on resize and after `fonts.ready`.
11. The workflows were checked as YAML only. The first GitHub run may need fixes (`playwright install --with-deps`, Pages steps).
12. CI and Deploy both run e2e on push to `main`. Switch to `workflow_run` if run time matters.
13. Repo hygiene: empty tracked files `3dot-update.tgz` and `example_3d.tgz`. Delete `/tc.log` at the filesystem root if it exists.

## Stale lines in CLAUDE.md (not edited, for the orchestrator)

- "Dark, typography-led ... portfolio": the site now has a light theme too.
- "`app/data/site.ts` — **all copy** (Uzbek Latin)": stale. Copy is in `site.uz.ts`, `site.ru.ts` and `site.en.ts`. `site.ts` holds shared data and types.
- "`scenePresets.ts` — blob state per section": incomplete. It now also holds `SCENE_PALETTES`.
- "Browser APIs only in `onMounted`, `*.client.vue` or client plugins": the inline head script in `nuxt.config.ts` is a new, deliberate exception.
- Missing: no mention of locale routes (`pages:extend`, `nitro.prerender.routes`), `data-theme`, or the `3dot:theme` and `3dot:locale` keys.
