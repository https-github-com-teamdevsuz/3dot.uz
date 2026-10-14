# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] - 2026-10-14

### Added
- SEO per locale. `app/data/seo.uz.ts`, `seo.ru.ts` and `seo.en.ts` hold titles, descriptions and keywords. Each file satisfies the shared `SeoCopy` type.
- `app/composables/useSeo.ts` builds every head tag from one place: title, description, keywords, canonical, hreflang (with `x-default`), Open Graph, Twitter card and JSON-LD (`Organization`, `WebSite`, `Service` offers, `CreativeWork` and `BreadcrumbList` on project pages).
- `public/robots.txt` with a `Sitemap:` line.
- `sitemap.xml` is written by a `postgenerate` script (`scripts/sitemap.mjs`) after `npm run generate`. It lists 21 URLs with hreflang alternates.
- Google and Yandex verification placeholders in `SITE_VERIFICATION` (`app/composables/useSeo.ts`). Tags render only when a value is filled.
- Self-hosted fonts in `public/fonts/` (woff2, latin and cyrillic subsets, OFL licences next to them). Wired in `app/assets/css/fonts.css`.
- Metric-matched fallback faces for each font family. They reduce layout shift while the web fonts load.
- Modulepreload of the ru and en copy chunk on `/ru*` and `/en*` pages. The Cyrillic display font is preloaded on `/ru*` only.
- SDLC agents: `linguist` (uz/ru/en copy review), `seo-specialist` and `performance-engineer`. All three pin `opus` in `sdlc/pipeline.json`.

### Changed
- Google Fonts stylesheet and preconnects removed. First load makes no third-party requests.
- Desktop first contentful paint went from about 400–800 ms to about 140–350 ms.
- English CLS on load went from 0.021 to about 0.0003.
- Uzbek copy proofread in `app/data/site.uz.ts`. Calques and grammar fixed. Matching ru and en keys aligned. Details in `docs/sdlc/2026-10-i18n-theme/10-localization.md`.
- Head tags moved from `useLocaleHead()` and page `useSeoMeta` calls into `useSeo()`.
- Preloader counter uses tabular numbers, so digits do not shift the layout on each tick.

### Fixed
- Theme plugin re-syncs with the OS colour scheme after mount. A change made before the listener was attached is no longer lost.
- `clip()` in `useSeo` no longer keeps almost the whole string when the text has no space.

### Notes
- Projects, contact email and phone are still placeholders. Replace them before you submit the sitemap to search engines.
- `og:image` is not set yet. Add a 1200×630 `public/og.png` to enable it.

## [0.2.0] - 2026-10-14

### Added
- Three locales: Uzbek (`uz`, default, unprefixed `/`), Russian (`/ru`) and English (`/en`). Each page and project page is prerendered per locale (21 HTML routes).
- `hreflang` alternates (`uz`, `ru`, `en`, `x-default`), self-referencing canonical and `og:locale` on every page.
- Language switcher in the header and in the mobile menu. The choice is stored in `localStorage` (`3dot:locale`). A stored `ru` or `en` redirects unprefixed URLs once.
- Light and dark themes with a toggle. The default follows `prefers-color-scheme`, and dark is the fallback. The choice is stored in `localStorage` (`3dot:theme`).
- Inline `<head>` script that sets the theme before first paint.
- Light palette for the liquid-chrome WebGL scene (`SCENE_PALETTES`). Switching theme does not recreate the WebGL context or recompile shaders.
- Reduced motion is respected for theme and language transitions.
- CI workflow (agents check, typecheck, generate, Playwright e2e) and a GitHub Pages deploy workflow that runs only after CI passes.

### Changed
- All copy moved to `app/data/site.uz.ts`, `site.ru.ts` and `site.en.ts`. Each file satisfies the shared `SiteCopy` type, so key parity is checked by typecheck. Shared data (brand, contacts, clients, projects) stays in `app/data/site.ts`.
- Page `lang`, `<title>` and description are set per locale. Static head values were removed from `nuxt.config.ts`.
- Two media-scoped `theme-color` meta tags.
- Colours use CSS tokens for both themes in `app/assets/css/main.css`.
- Typography and header layout adjusted for longer Russian text.

### Fixed
- Typecheck errors in `app/composables/useSceneSections.ts` and `app/plugins/motion.client.ts`.

### Notes
- The `ru` and `en` copy is a draft. It needs native-speaker review before the release is announced.
