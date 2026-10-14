# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
